/* ==========================================================================
   TECHWIRE — Data service
   Loads mock JSON (or a future API), normalises, indexes and exposes
   query helpers. The UI only talks to TW.Data, never to fetch() directly.
   ========================================================================== */
(function () {
  'use strict';
  const TW = window.TW;
  const C = TW.CONFIG;

  const SECTIONS = {
    news:     { key: 'news', label: 'News', category: null, desk: 'Newsroom', desc: 'General technology news across the industry.' },
    cyber:    { key: 'cyber', label: 'Cyber', category: 'Cybersecurity', desk: 'Security Desk', desc: 'Vulnerabilities, threats, incidents and advisories.',
                topics: ['Vulnerabilities', 'CVEs', 'Ransomware', 'Malware', 'Data Breaches', 'Zero-Days', 'APT', 'Threat Intelligence', 'Security Advisories'] },
    networks: { key: 'networks', label: 'Networks', category: 'Networking', desk: 'Network Desk', desc: 'Routing, switching, wireless and internet infrastructure.',
                topics: ['Cisco', 'MikroTik', 'Fortinet', 'Juniper', 'Aruba', 'BGP', 'OSPF', 'SD-WAN', 'Wi-Fi', '5G', 'Datacenter Networking', 'Network Outages', 'Internet Infrastructure'] },
    infra:    { key: 'infra', label: 'Infra', category: 'Infrastructure', desk: 'Infrastructure Desk', desc: 'Servers, virtualization, storage, backup and datacenters.',
                topics: ['Windows Server', 'Linux', 'Active Directory', 'VMware', 'Proxmox', 'Hyper-V', 'Storage', 'Backup', 'Datacenters', 'Servers', 'Monitoring'] },
    cloud:    { key: 'cloud', label: 'Cloud', category: 'Cloud', desk: 'Cloud Desk', desc: 'Public cloud platforms, containers and cloud security.',
                topics: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Cloudflare', 'Kubernetes', 'Docker', 'Serverless', 'Cloud Security'] },
    ai:       { key: 'ai', label: 'AI', category: 'AI', desk: 'AI Desk', desc: 'AI models, infrastructure, security and regulation.',
                topics: ['AI News', 'LLMs', 'AI Security', 'AI Infrastructure', 'AI Hardware', 'Enterprise AI', 'AI Vulnerabilities', 'AI Regulations'] },
    hardware: { key: 'hardware', label: 'Hardware', category: 'Hardware', desk: 'Hardware Desk', desc: 'Servers, silicon, networking hardware and devices.',
                topics: ['Servers', 'CPUs', 'GPUs', 'Networking Hardware', 'Laptops', 'Datacenter Hardware', 'Storage Hardware', 'Firmware Security', 'Memory'] },
    software: { key: 'software', label: 'Software', category: 'Software', desk: 'Software Desk', desc: 'Operating systems, applications and enterprise software.' },
    dev:      { key: 'dev', label: 'Dev', category: 'Dev', desk: 'Dev Desk', desc: 'Programming, DevOps, APIs, open source and containers.' }
  };
  /** Topic label -> matching subcategories / tags */
  const TOPIC_ALIAS = {
    'Vulnerabilities': ['Vulnerability', 'CVE', 'Zero-Day'], 'CVEs': ['CVE', 'Vulnerability'], 'Data Breaches': ['Data Breach'],
    'Zero-Days': ['Zero-Day'], 'Security Advisories': ['Security Advisory', 'Advisory'], 'Fortinet': ['Fortinet', 'SD-WAN'],
    'Microsoft Azure': ['Azure'], 'AI Regulations': ['AI Regulation'], 'Servers': ['Servers', 'Server'], 'Datacenters': ['Datacenters', 'Datacenter'],
    'Network Outages': ['Network Outages', 'Outage'], 'Aruba': ['Aruba', 'Wi-Fi'], 'Juniper': ['Juniper', 'Datacenter Networking']
  };
  const COMPANIES = ['Cisco', 'MikroTik', 'Fortinet', 'Juniper', 'Aruba', 'AWS', 'Azure', 'Google Cloud', 'Cloudflare', 'VMware', 'Proxmox', 'Windows', 'Windows Server', 'Hyper-V', 'Docker', 'Kubernetes', 'OpenTelemetry'];

  const store = { articles: [], byId: new Map(), authors: new Map(), explainers: [], deepDives: [], research: [], live: [], status: [], timelineIds: [], netIntel: [], cyberIntel: [], map: null, meta: null, loaded: false, source: 'mock' };

  async function loadMock() {
    const files = C.mockFiles;
    try {
      if (location.protocol === 'file:') throw new Error('file:// - use bundle');
      const res = await Promise.all(files.map((f) => fetch(C.dataPath + f + '.json', { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })));
      const o = {}; files.forEach((f, i) => (o[f] = res[i]));
      store.source = 'json';
      return o;
    } catch (e) {
      // file:// or blocked fetch -> load the generated bundle (same data, one script)
      await new Promise((ok, fail) => {
        if (window.TECHWIRE_BUNDLE) return ok();
        const s = document.createElement('script');
        s.src = C.dataPath + 'bundle.js'; s.onload = ok; s.onerror = fail;
        document.head.appendChild(s);
      });
      store.source = 'bundle';
      return window.TECHWIRE_BUNDLE;
    }
  }

  async function loadApi() {
    const b = C.api.baseUrl, e = C.api.endpoints;
    const get = (p) => fetch(b + p).then((r) => r.json());
    const [articles, authors, features, live] = await Promise.all([get(e.articles), get(e.authors), get(e.features), get(e.live)]);
    store.source = 'api';
    return { news: { articles, meta: { isDemo: false } }, authors: { authors }, features, live };
  }

  function rebase(iso, delta) { return iso ? new Date(new Date(iso).getTime() + delta).toISOString() : iso; }

  function ingest(raw) {
    const meta = (raw.news && raw.news.meta) || { isDemo: true };
    store.meta = meta;
    const delta = C.rebaseDemoTimes && meta.anchor ? Date.now() - new Date(meta.anchor).getTime() : 0;
    const arts = [];
    ['news', 'cybersecurity', 'networking', 'infrastructure', 'cloud', 'ai', 'hardware'].forEach((k) => { if (raw[k]) arts.push(...raw[k].articles); });
    arts.forEach((a) => { a.date = rebase(a.date, delta); a.updated = rebase(a.updated, delta); a.url = '#/article/' + a.id + '/' + a.slug; });
    arts.sort((a, b) => new Date(b.date) - new Date(a.date));
    store.articles = arts;
    store.byId = new Map(arts.map((a) => [String(a.id), a]));
    (raw.authors.authors || []).forEach((a) => store.authors.set(a.id, a));
    const f = raw.features || {};
    store.explainers = f.explainers || [];
    store.deepDives = f.deepDives || [];
    store.research = f.research || [];
    const l = raw.live || {};
    store.live = (l.live || []).map((x) => Object.assign({}, x, { time: new Date(Date.now() - x.minutesAgo * 6e4).toISOString() }));
    store.status = l.status || [];
    store.timelineIds = l.timelineIds || [];
    store.netIntel = l.networkIntel || [];
    store.cyberIntel = l.cyberIntel || [];
    store.map = l.map || null;
    store.loaded = true;
  }

  const norm = (s) => String(s || '').toLowerCase();
  const matchesTopic = (a, topic) => {
    const keys = (TOPIC_ALIAS[topic] || [topic]).map(norm);
    return keys.includes(norm(a.subcategory)) || (a.tags || []).some((t) => keys.includes(norm(t)));
  };

  TW.Data = {
    SECTIONS, COMPANIES, store,
    async load() {
      const raw = C.dataMode === 'api' && C.api.baseUrl ? await loadApi() : await loadMock();
      ingest(raw);
      return store;
    },
    all: () => store.articles,
    get: (id) => store.byId.get(String(id)),
    author: (id) => store.authors.get(id) || { id, name: 'TECHWIRE', role: 'Staff' },
    authors: () => Array.from(store.authors.values()),
    byCategory(cat) { return cat ? store.articles.filter((a) => a.category === cat) : store.articles.slice(); },
    bySection(key) {
      const s = SECTIONS[key];
      if (!s) return [];
      return s.category ? this.byCategory(s.category) : store.articles.slice();
    },
    byTopic(topic, list) { return (list || store.articles).filter((a) => matchesTopic(a, topic)); },
    byTag(tag) { const t = norm(tag); return store.articles.filter((a) => (a.tags || []).some((x) => norm(x) === t) || norm(a.subcategory) === t); },
    byAuthor(id) { return store.articles.filter((a) => a.author === id); },
    breaking() { return store.articles.filter((a) => a.isBreaking); },
    lead() { return store.articles.find((a) => a.featured && a.isBreaking) || store.articles[0]; },
    trending(n) { return store.articles.slice().sort((a, b) => b.trendingScore - a.trendingScore).slice(0, n || 5); },
    mostRead(n) { return store.articles.slice().sort((a, b) => b.views - a.views).slice(0, n || 5); },
    related(a, n) {
      const tags = new Set((a.tags || []).map(norm));
      return store.articles.filter((x) => x.id !== a.id)
        .map((x) => ({ x, s: (x.category === a.category ? 2 : 0) + (x.subcategory === a.subcategory ? 3 : 0) + (x.tags || []).filter((t) => tags.has(norm(t))).length * 2 }))
        .filter((o) => o.s > 0).sort((p, q) => q.s - p.s || new Date(q.x.date) - new Date(p.x.date)).slice(0, n || 4).map((o) => o.x);
    },
    explainer: (slug) => store.explainers.find((e) => e.slug === slug),
    deepDive: (slug) => store.deepDives.find((e) => e.slug === slug),
    allTags() {
      const m = new Map();
      store.articles.forEach((a) => (a.tags || []).concat(a.subcategory).forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
      return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).map(([t, c]) => ({ tag: t, count: c }));
    },
    /** Grouped search across articles, authors, topics, companies, CVEs, technologies and features */
    search(q) {
      const terms = norm(q).split(/\s+/).filter(Boolean);
      const res = { articles: [], authors: [], topics: [], companies: [], cves: [], technologies: [], features: [] };
      if (!terms.length) return res;
      const hit = (s) => { const h = norm(s); return terms.every((t) => h.includes(t)); };
      const score = (a) => (hit(a.title) ? 5 : 0) + (hit((a.tags || []).join(' ')) ? 3 : 0) + (hit(a.summary) ? 1 : 0);
      res.articles = store.articles.filter((a) => hit([a.title, a.summary, a.category, a.subcategory, a.type, (a.tags || []).join(' '), a.cve || '', TW.Data.author(a.author).name].join(' ')))
        .sort((a, b) => score(b) - score(a) || new Date(b.date) - new Date(a.date));
      res.authors = TW.Data.authors().filter((a) => hit(a.name + ' ' + a.role + ' ' + (a.expertise || []).join(' ')));
      const tags = TW.Data.allTags();
      res.companies = tags.filter((t) => COMPANIES.includes(t.tag) && hit(t.tag));
      res.technologies = tags.filter((t) => !COMPANIES.includes(t.tag) && hit(t.tag)).slice(0, 12);
      res.topics = Object.values(SECTIONS).flatMap((s) => (s.topics || []).map((t) => ({ topic: t, section: s.key }))).filter((t) => hit(t.topic)).slice(0, 8);
      res.cves = store.articles.filter((a) => a.cve && hit(a.cve + ' ' + a.title)).map((a) => ({ cve: a.cve, cvss: a.cvss, article: a }));
      res.features = [].concat(
        store.explainers.filter((e) => hit(e.title + ' ' + e.dek)).map((e) => ({ kind: 'Explainer', title: e.title, url: '#/explained/' + e.slug })),
        store.deepDives.filter((e) => hit(e.title + ' ' + e.dek)).map((e) => ({ kind: 'Deep Dive', title: e.title, url: '#/deep-dive/' + e.slug })),
        store.research.filter((e) => hit(e.title + ' ' + e.summary + ' ' + e.area)).map((e) => ({ kind: 'Research', title: e.title, url: '#/article/' + e.ref }))
      );
      return res;
    }
  };
})();
