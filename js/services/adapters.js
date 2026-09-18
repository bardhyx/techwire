/* ==========================================================================
   TECHWIRE — Source adapters (API-ready architecture, DISABLED in demo)
   Each adapter fetches an external source and normalises it into the
   TECHWIRE Article schema. Nothing here runs unless enabled in config.js.
   Most of these sources should be fetched server-side (CORS, rate limits,
   API keys); the browser versions are provided as a reference contract.
   ========================================================================== */
(function () {
  'use strict';
  const TW = window.TW;

  /** Article factory - the single schema every adapter must return. */
  const article = (o) => Object.assign({
    id: null, slug: '', title: '', category: 'News', subcategory: '', type: 'News',
    author: 'newsroom', date: new Date().toISOString(), updated: null, readingTime: 3,
    summary: '', image: null, imageAlt: '', tags: [], isBreaking: false, isDemo: false,
    cve: null, cvss: null, severity: null, sources: [], sections: []
  }, o);

  const sevFromCvss = (s) => (s >= 9 ? 'Critical' : s >= 7 ? 'High' : s >= 4 ? 'Medium' : 'Low');

  TW.Adapters = {
    article,

    /** RSS/Atom feeds (e.g. vendor blogs). Use a server-side proxy for CORS. */
    async rss(cfg) {
      const out = [];
      for (const feed of cfg.feeds) {
        const xml = new DOMParser().parseFromString(await (await fetch(feed.url)).text(), 'text/xml');
        xml.querySelectorAll('item, entry').forEach((it, i) => {
          const t = (s) => (it.querySelector(s) || {}).textContent || '';
          out.push(article({ id: `rss-${feed.name}-${i}`, title: t('title'), summary: t('description') || t('summary'),
            date: new Date(t('pubDate') || t('updated')).toISOString(), category: feed.category || 'News',
            sources: [{ label: feed.name, type: 'rss', url: t('link') || (it.querySelector('link') || {}).getAttribute?.('href') }] }));
        });
      }
      return out;
    },

    /** NVD CVE API 2.0 - https://nvd.nist.gov/developers/vulnerabilities */
    async nvd(cfg, { days = 1 } = {}) {
      const end = new Date(), start = new Date(Date.now() - days * 864e5);
      const url = `${cfg.endpoint}?pubStartDate=${start.toISOString()}&pubEndDate=${end.toISOString()}`;
      const res = await fetch(url, { headers: cfg.apiKey ? { apiKey: cfg.apiKey } : {} });
      const json = await res.json();
      return (json.vulnerabilities || []).map(({ cve }) => {
        const m = (cve.metrics && (cve.metrics.cvssMetricV31 || cve.metrics.cvssMetricV40 || [])[0]) || null;
        const score = m ? m.cvssData.baseScore : null;
        return article({ id: cve.id, title: `${cve.id}`, category: 'Cybersecurity', subcategory: 'CVE', type: 'News',
          summary: (cve.descriptions.find((d) => d.lang === 'en') || {}).value || '', date: cve.published, updated: cve.lastModified,
          cve: cve.id, cvss: score, severity: score ? sevFromCvss(score) : null,
          sources: [{ label: 'NVD', type: 'nvd', url: `https://nvd.nist.gov/vuln/detail/${cve.id}` }] });
      });
    },

    /** CISA Known Exploited Vulnerabilities catalogue */
    async cisaKev(cfg) {
      const json = await (await fetch(cfg.endpoint)).json();
      return json.vulnerabilities.slice(-50).map((v) => article({
        id: `kev-${v.cveID}`, title: `${v.vendorProject} ${v.product}: ${v.vulnerabilityName}`, category: 'Cybersecurity',
        subcategory: 'Security Advisory', summary: v.shortDescription, date: new Date(v.dateAdded).toISOString(), cve: v.cveID,
        tags: ['CISA KEV', v.vendorProject], sources: [{ label: 'CISA KEV', type: 'cisa', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' }] }));
    },

    /** GitHub Security Advisories REST API */
    async githubAdvisory(cfg) {
      const json = await (await fetch(`${cfg.endpoint}?per_page=30`, { headers: cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {} })).json();
      return json.map((a) => article({ id: a.ghsa_id, title: a.summary, category: 'Cybersecurity', subcategory: 'Security Advisory',
        summary: a.description?.slice(0, 280) || '', date: a.published_at, updated: a.updated_at, cve: a.cve_id,
        severity: a.severity, sources: [{ label: 'GitHub Security Advisory', type: 'ghsa', url: a.html_url }] }));
    },

    /** Atlassian Statuspage-compatible status APIs -> Outage Center */
    async statuspage(cfg) {
      const map = { none: 'operational', minor: 'degraded', major: 'outage', critical: 'outage', maintenance: 'maintenance' };
      return Promise.all(cfg.pages.map(async (p) => {
        const j = await (await fetch(p.url)).json();
        return { service: p.service, status: map[j.status.indicator] || 'operational', note: j.status.description, isDemo: false, source: { type: 'statuspage', url: p.url } };
      }));
    },

    /** BGP / routing events -> Network Intelligence (provider-specific; implement the mapping for your API). */
    async bgp(cfg) {
      const json = await (await fetch(cfg.endpoint)).json();
      return (json.events || []).map((e) => ({ kind: 'BGP incident', title: e.title, region: e.region, minutesAgo: Math.round((Date.now() - new Date(e.time)) / 6e4), severity: e.severity, isDemo: false }));
    }
  };
})();
