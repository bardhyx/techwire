/* ==========================================================================
   TECHWIRE — Pages (views). Each page: { title, render(params) -> html, mount?(root, params) }
   ========================================================================== */
(function () {
  'use strict';
  const TW = window.TW;
  const D = TW.Data, U = TW.UI;
  const { esc, icon, story, secHead } = U;
  const take = (arr, n, exclude) => { const ex = new Set((exclude || []).map(String)); return arr.filter((a) => !ex.has(String(a.id))).slice(0, n); };

  /* ------------------------------ shared blocks ------------------------------ */
  function latestFeed(id, initialFilter) {
    const filters = ['Latest', 'Cybersecurity', 'Networking', 'Infrastructure', 'Cloud', 'AI', 'Hardware', 'Software'];
    return `<section class="latest" id="${id}" aria-labelledby="${id}-t">${secHead('Latest', { links: '' })}
      <div class="filters" role="toolbar" aria-label="Filter latest news">${filters.map((f) => `<button type="button" class="chip${(initialFilter || 'Latest') === f ? ' on' : ''}" data-feed-filter="${f}" aria-pressed="${(initialFilter || 'Latest') === f}">${f}</button>`).join('')}</div>
      <div class="feed" data-feed data-filter="${initialFilter || 'Latest'}" data-shown="0" aria-live="polite"></div>
      <div class="feed-more"><button type="button" class="btn btn-outline" data-load-more>Load more stories</button></div></section>`;
  }
  function feedList(filter) {
    const all = D.all();
    if (filter === 'Latest') return all;
    if (filter === 'Software') return all.filter((a) => a.category === 'Software' || a.category === 'Dev');
    return all.filter((a) => a.category === filter);
  }
  function renderFeed(el, append) {
    const filter = el.dataset.filter;
    const list = feedList(filter);
    const shown = append ? +el.dataset.shown : 0;
    const next = list.slice(shown, shown + TW.CONFIG.pageSize);
    const html = next.map(U.feedItem).join('');
    if (append) el.insertAdjacentHTML('beforeend', html); else el.innerHTML = html || '<p class="empty">No stories in this filter yet.</p>';
    el.dataset.shown = String(shown + next.length);
    const btn = el.parentElement.querySelector('[data-load-more]');
    if (btn) { const done = shown + next.length >= list.length; btn.disabled = done; btn.textContent = done ? 'You are up to date' : `Load more stories (${list.length - shown - next.length} remaining)`; }
    TW.App.hydrate(el);
  }

  function sidebar(opts) {
    const o = opts || {};
    return `<aside class="rail" aria-label="Sidebar">
      <section class="panel" aria-labelledby="tr-t">${secHead('Trending now', { badge: 'Demo score' }).replace('<h2 class="sec-title">', '<h2 class="sec-title" id="tr-t">')}${U.numbered(D.trending(5), (a) => `${esc(a.category)} · trending score ${a.trendingScore}`)}</section>
      <section class="panel" aria-labelledby="mr-t">${secHead('Most read').replace('<h2 class="sec-title">', '<h2 class="sec-title" id="mr-t">')}${U.numbered(D.mostRead(5), (a) => `${a.views.toLocaleString('en-US')} views (demo) · ${a.readingTime} min`)}</section>
      ${o.noNewsletter ? '' : U.newsletterBox('nl-side' + (o.suffix || ''), 'side')}
      ${o.topics === false ? '' : `<section class="panel" aria-labelledby="tp-t"><h2 class="sec-title" id="tp-t">Topics</h2><div class="tagcloud">${D.allTags().slice(0, 18).map((t) => `<a class="tag" href="#/topic/${encodeURIComponent(t.tag)}">${esc(t.tag)}</a>`).join('')}</div></section>`}
    </aside>`;
  }

  function liveBlock(limit, full) {
    const items = D.store.live.slice(0, limit || 6);
    return `<section class="panel live-panel" aria-labelledby="live-t${full ? 'f' : ''}">${secHead('Live technology', { dot: true, badge: 'Demo live feed', more: full ? '' : '#/live', moreLabel: 'Open' }).replace('<h2 class="sec-title">', `<h2 class="sec-title" id="live-t${full ? 'f' : ''}">`)}
      <ol class="live-list" data-live-list>${items.map(liveItem).join('')}</ol>
      ${full ? `<p class="fine">${TW.CONFIG.liveSimulation ? 'Demo simulation: queued sample events are replayed every 45 seconds. ' : ''}Connect a real source in <code>js/config.js</code> to replace this feed.</p>` : ''}</section>`;
  }
  const liveItem = (x) => `<li class="lv lv-${x.level}"><time datetime="${esc(x.time)}">${U.hhmm(x.time)}</time><div><span class="lv-cat">${esc(x.category)}</span>${x.articleId && D.get(x.articleId) ? `<a href="${D.get(x.articleId).url}">${esc(x.text)}</a>` : esc(x.text)}</div></li>`;

  function outageBlock(full) {
    return `<section class="panel outage" aria-labelledby="out-t${full ? 'f' : ''}">${secHead('IT Outage Center', { badge: 'Demo status', more: full ? '' : '#/outages', moreLabel: 'Details' }).replace('<h2 class="sec-title">', `<h2 class="sec-title" id="out-t${full ? 'f' : ''}">`)}
      <ul class="status-list">${D.store.status.map(U.statusRow).join('')}</ul>
      <p class="fine">${icon('info')} Sample data for the prototype. These are <strong>not</strong> real service statuses - always check each provider's official status page.</p></section>`;
  }

  function timelineBlock() {
    const items = D.store.timelineIds.map((id) => D.get(id)).filter(Boolean);
    return `<section class="panel" aria-labelledby="tl-t">${secHead('Today in tech').replace('<h2 class="sec-title">', '<h2 class="sec-title" id="tl-t">')}
      <ol class="timeline">${items.map((a) => `<li><time datetime="${esc(a.date)}">${U.hhmm(a.date)}</time><span class="tl-dot" aria-hidden="true"></span><div><span class="tl-cat">${esc(a.category)}</span><a href="${a.url}">${esc(a.title)}</a></div></li>`).join('')}</ol></section>`;
  }

  function netIntelBlock() {
    return `<section class="panel intel" aria-labelledby="ni-t">${secHead('Network intelligence', { badge: 'Demo' }).replace('<h2 class="sec-title">', '<h2 class="sec-title" id="ni-t">')}
      <ul class="intel-list">${D.store.netIntel.map((x) => `<li class="in-${x.severity}"><span class="in-kind">${esc(x.kind)}</span><p>${x.articleId ? `<a href="${D.get(x.articleId).url}">${esc(x.title)}</a>` : esc(x.title)}</p><span class="in-meta">${esc(x.region)} · ${U.ago(new Date(Date.now() - x.minutesAgo * 6e4).toISOString())}</span></li>`).join('')}</ul>
      <p class="fine">Covers internet outages, BGP, DNS and ISP incidents, routing events, datacenter outages and undersea cables.</p></section>`;
  }

  function cyberIntelBlock() {
    return `<section class="panel intel" aria-labelledby="ci-t">${secHead('Cyber intelligence', { badge: 'Demo' }).replace('<h2 class="sec-title">', '<h2 class="sec-title" id="ci-t">')}
      <div class="ci-grid">${D.store.cyberIntel.map((x) => `<a class="ci" href="#/topic/${encodeURIComponent(x.kind === 'CVE' ? 'CVE' : x.kind)}"><span class="ci-k">${esc(x.kind)}</span><span class="ci-v">${x.count}</span><span class="ci-l">${esc(x.label)}</span><span class="ci-t ${x.trend.startsWith('+') && x.trend !== '+0' ? 'up' : x.trend.startsWith('-') ? 'down' : ''}">${esc(x.trend)}</span></a>`).join('')}</div></section>`;
  }

  function researchStrip(n) {
    return `<ul class="research-list">${D.store.research.slice(0, n || 8).map((r) => `<li><span class="badge-research">Research</span><span class="rs-area">${esc(r.area)}</span><a class="hl hl-sm" href="#/article/${r.ref}">${esc(r.title)}</a><p class="dek sm">${esc(r.summary)}</p></li>`).join('')}</ul>`;
  }

  function explainerCard(e) {
    return `<article class="ex-card"><a href="#/explained/${e.slug}" class="ex-fig" tabindex="-1" aria-hidden="true"><div class="diagram-wrap sm" data-diagram="${e.diagram}"></div></a><span class="type type-explainer">Explainer</span><h3 class="hl hl-md"><a href="#/explained/${e.slug}">${esc(e.title)}</a></h3><p class="dek sm">${esc(e.dek)}</p><p class="meta">${esc(e.level)}<span class="sep">·</span>${e.minutes} min read</p></article>`;
  }

  function mapBlock() {
    const types = TW.Art.MAP_TYPES;
    return `<section class="map-sec" aria-labelledby="map-t">${secHead('Global technology infrastructure', { badge: 'Demo visualization' }).replace('<h2 class="sec-title">', '<h2 class="sec-title" id="map-t">')}
      <div class="map-wrap"><div class="map-legend" role="group" aria-label="Show infrastructure types">${Object.entries(types).map(([k, l]) => `<label class="lg lg-${k}"><input type="checkbox" data-map-type="${k}" checked><span class="lg-dot" aria-hidden="true"></span>${l}</label>`).join('')}</div>
      <div class="map-canvas" data-map></div><div class="map-info" data-map-info aria-live="polite"><p class="fine">Select a location to see its demo attributes. Positions are approximate and illustrative.</p></div></div></section>`;
  }

  const deskHeader = (s) => `<header class="desk-head"><p class="eyebrow">${esc(s.desk)}</p><h1 class="desk-title">${esc(s.label === 'News' ? 'News' : s.category)}</h1><p class="desk-desc">${esc(s.desc)}</p></header>`;

  /* ==========================================================================
     HOME
     ========================================================================== */
  const PAGES = {};
  PAGES.home = {
    title: 'TECHWIRE - Technology. Security. Infrastructure.',
    render() {
      const all = D.all();
      const lead = D.lead();
      const used = [lead.id];
      const second = all.find((a) => a.id !== lead.id && a.category !== lead.category && a.type === 'News' && (a.isBreaking || a.featured)) || all[1];
      used.push(second.id);
      const secondary = take(all.filter((a) => a.type === 'News'), 3, used); used.push(...secondary.map((a) => a.id));
      const latest = take(all, 9, []);
      const top = take(all.filter((a) => a.type !== 'Opinion'), 4, used); used.push(...top.map((a) => a.id));

      const cyber = D.byCategory('Cybersecurity');
      const cyLead = cyber.find((a) => !used.includes(a.id) && a.type === 'News') || cyber[0];
      const cves = cyber.filter((a) => a.cve).concat(D.all().filter((a) => a.cve && a.category !== 'Cybersecurity')).filter((a) => a.id !== cyLead.id).slice(0, 3);
      const cyList = take(cyber, 4, [cyLead.id, ...cves.map((a) => a.id), lead.id]);

      const net = D.byCategory('Networking');
      const netLead = net.find((a) => a.id !== lead.id) || net[0];
      const netList = take(net, 5, [netLead.id, lead.id, second.id]);

      const infra = D.byCategory('Infrastructure'), cloud = D.byCategory('Cloud');
      const ai = D.byCategory('AI'), hw = D.byCategory('Hardware'), sw = D.all().filter((a) => a.category === 'Software' || a.category === 'Dev');
      const deep = D.store.deepDives;
      const S = D.SECTIONS;
      const topicLinks = (key, n) => (S[key].topics || []).slice(0, n || 6).map((t) => `<a href="#/section/${key}?topic=${encodeURIComponent(t)}">${esc(t)}</a>`).join('');

      return `
      <div class="home">
        <section class="top-grid" aria-label="Top stories">
          <div class="tg-lead">${story(lead, 'lead')}</div>
          <div class="tg-second">${story(second, 'second')}<div class="stack">${secondary.map((a) => story(a, 'compact')).join('')}</div></div>
          <aside class="tg-rail" aria-labelledby="lt-t"><header class="sec-head"><h2 class="sec-title" id="lt-t"><a href="#/latest">Latest</a></h2><a class="sec-more" href="#/latest">All ${icon('arrow')}</a></header>
            <ol class="latest-mini">${latest.map((a) => `<li><time datetime="${esc(a.date)}">${U.hhmm(a.date)}</time><div><span class="lm-cat">${esc(U.catLabel(a.category))}</span><a href="${a.url}">${esc(a.title)}</a></div></li>`).join('')}</ol></aside>
        </section>

        <section class="band top-row" aria-label="More top stories"><div class="row4">${top.map((a) => story(a, 'thumb')).join('')}</div></section>

        <section class="desk desk-security" aria-labelledby="sd-t">
          ${secHead('Security Desk', { href: '#/section/cyber', links: topicLinks('cyber', 9), more: '#/section/cyber', moreLabel: 'Cybersecurity' }).replace('<h2 class="sec-title">', '<h2 class="sec-title" id="sd-t">')}
          <div class="desk-grid">
            <div class="dg-main">${story(cyLead, 'row')}<div class="cve-grid">${cves.map(U.cveCard).join('')}</div><div class="list-2">${cyList.map((a) => story(a, 'compact')).join('')}</div></div>
            <div class="dg-side">${cyberIntelBlock()}<section class="panel" aria-labelledby="rs-t"><header class="sec-head"><h2 class="sec-title" id="rs-t"><a href="#/research">Security research</a></h2></header>${researchStrip(3)}</section></div>
          </div>
        </section>

        <section class="triple" aria-label="Live updates">${liveBlock(6)}${outageBlock()}${timelineBlock()}</section>

        <section class="desk desk-network" aria-labelledby="nd-t">
          ${secHead('Network Desk', { href: '#/section/networks', links: topicLinks('networks', 10), more: '#/section/networks', moreLabel: 'Networking' }).replace('<h2 class="sec-title">', '<h2 class="sec-title" id="nd-t">')}
          <div class="desk-grid">
            <div class="dg-main"><div class="split">${story(netLead, 'second')}<div class="stack">${netList.map((a) => story(a, 'compact')).join('')}</div></div></div>
            <div class="dg-side">${netIntelBlock()}</div>
          </div>
        </section>

        <section class="explained" aria-labelledby="ex-t">
          ${secHead('Tech Explained', { href: '#/explained', more: '#/explained', moreLabel: 'All explainers' }).replace('<h2 class="sec-title">', '<h2 class="sec-title" id="ex-t">')}
          <p class="sec-desc">Plain-language technical background with diagrams. Explainers are educational and separate from news coverage.</p>
          <div class="ex-row">${D.store.explainers.slice(0, 4).map(explainerCard).join('')}</div>
        </section>

        <section class="two-desks" aria-label="Infrastructure and cloud">
          <div class="desk">${secHead('Infrastructure Desk', { href: '#/section/infra', links: topicLinks('infra', 5), more: '#/section/infra' })}${story(infra[0], 'card')}<div class="stack">${infra.slice(1, 5).map((a) => story(a, 'compact')).join('')}</div></div>
          <div class="desk">${secHead('Cloud Desk', { href: '#/section/cloud', links: topicLinks('cloud', 5), more: '#/section/cloud' })}${story(cloud[0], 'card')}<div class="stack">${cloud.slice(1, 5).map((a) => story(a, 'compact')).join('')}</div></div>
        </section>

        ${mapBlock()}

        <section class="three-desks" aria-label="AI, hardware and software">
          <div class="desk">${secHead('AI Desk', { href: '#/section/ai', more: '#/section/ai' })}${story(ai[0], 'card')}<div class="stack">${ai.slice(1, 4).map((a) => story(a, 'compact')).join('')}</div></div>
          <div class="desk">${secHead('Hardware', { href: '#/section/hardware', more: '#/section/hardware' })}${story(hw[0], 'card')}<div class="stack">${hw.slice(1, 4).map((a) => story(a, 'compact')).join('')}</div></div>
          <div class="desk">${secHead('Software & Dev', { href: '#/section/software', more: '#/section/dev', moreLabel: 'Dev' })}${story(sw[0], 'card')}<div class="stack">${sw.slice(1, 4).map((a) => story(a, 'compact')).join('')}</div></div>
        </section>

        <section class="deep-band" aria-labelledby="dd-t"><div class="deep-in">
          <header class="sec-head inv"><h2 class="sec-title" id="dd-t"><a href="#/deep-dive">Deep Dive</a></h2><span class="badge-demo inv">Fictional scenarios</span><a class="sec-more" href="#/deep-dive">All deep dives ${icon('arrow')}</a></header>
          <div class="deep-grid">${deep.map((d, i) => `<article class="deep-card${i === 0 ? ' big' : ''}"><span class="type type-analysis">Deep Dive</span><h3 class="hl ${i === 0 ? 'hl-xl' : 'hl-md'}"><a href="#/deep-dive/${d.slug}">${esc(d.title)}</a></h3><p class="dek${i ? ' sm' : ''}">${esc(d.dek)}</p><p class="meta">${esc(D.author(d.author).name)}<span class="sep">·</span>${d.minutes} min read</p></article>`).join('')}</div>
        </div></section>

        <div class="with-rail">
          <div class="main-col">${latestFeed('home-latest')}
            <section class="panel research-panel" aria-labelledby="res-t">${secHead('Security Research', { href: '#/research', badge: 'Research', more: '#/research' }).replace('<h2 class="sec-title">', '<h2 class="sec-title" id="res-t">')}${researchStrip(4)}</section>
          </div>
          ${sidebar()}
        </div>
      </div>`;
    },
    mount(root) { root.querySelectorAll('[data-feed]').forEach((f) => renderFeed(f)); TW.App.mountMap(root); }
  };

  /* ==========================================================================
     SECTION / DESK
     ========================================================================== */
  PAGES.section = {
    title: (p) => (D.SECTIONS[p.key] ? (D.SECTIONS[p.key].category || 'News') + ' - TECHWIRE' : 'TECHWIRE'),
    render(p) {
      const s = D.SECTIONS[p.key];
      if (!s) return PAGES.notfound.render();
      let list = D.bySection(p.key);
      const topic = p.query.topic;
      if (topic) list = D.byTopic(topic, list);
      const lead = list[0];
      const chips = s.topics ? `<div class="filters" role="toolbar" aria-label="${esc(s.desk)} topics"><a class="chip${!topic ? ' on' : ''}" href="#/section/${s.key}" aria-current="${!topic}">All</a>${s.topics.map((t) => { const n = D.byTopic(t, D.bySection(p.key)).length; return `<a class="chip${topic === t ? ' on' : ''}" href="#/section/${s.key}?topic=${encodeURIComponent(t)}" aria-current="${topic === t}">${esc(t)}<span class="chip-n">${n}</span></a>`; }).join('')}</div>` : '';
      const side = p.key === 'cyber' ? cyberIntelBlock() : p.key === 'networks' ? netIntelBlock() : p.key === 'cloud' ? outageBlock() : '';
      if (!lead) return `${deskHeader(s)}${chips}<div class="empty-block"><p>No demo stories are tagged <strong>${esc(topic)}</strong> yet.</p><a class="btn btn-outline" href="#/section/${s.key}">Show all ${esc(s.category || 'news')}</a></div>`;
      const rest = list.slice(1);
      return `${deskHeader(s)}${chips}
        <div class="with-rail"><div class="main-col">
          <div class="sec-top">${story(lead, 'lead')}<div class="stack">${rest.slice(0, 3).map((a) => story(a, 'thumb')).join('')}</div></div>
          ${p.key === 'cyber' ? `<div class="cve-grid wide">${list.filter((a) => a.cve).slice(0, 4).map(U.cveCard).join('')}</div>` : ''}
          <div class="card-grid">${rest.slice(3).map((a) => story(a, 'card')).join('')}</div>
          ${p.key === 'cyber' ? `<section class="panel" aria-labelledby="sr2">${secHead('Security Research', { badge: 'Research' }).replace('<h2 class="sec-title">', '<h2 class="sec-title" id="sr2">')}${researchStrip(8)}</section>` : ''}
        </div><div class="rail-wrap">${side}${sidebar({ suffix: '-s' })}</div></div>`;
    }
  };

  /* ==========================================================================
     ARTICLE
     ========================================================================== */
  PAGES.article = {
    title: (p) => { const a = D.get(p.id); return a ? a.title + ' - TECHWIRE' : 'Story not found - TECHWIRE'; },
    render(p) {
      const a = D.get(p.id);
      if (!a) return PAGES.notfound.render();
      const au = D.author(a.author);
      const rel = D.related(a, 4);
      const research = D.store.research.find((r) => String(r.ref) === String(a.id));
      const fp = a.forProfessionals;
      const secs = a.sections.map((s) => `<section class="a-sec" id="sec-${s.id}"><h2>${esc(s.heading)}</h2>${s.paragraphs.map((x) => `<p>${esc(x)}</p>`).join('')}</section>`);
      const why = a.type !== 'Opinion' ? `<aside class="box why" aria-labelledby="why-t"><h2 id="why-t">Why it matters</h2><p>${esc(a.whyItMatters)}</p></aside>` : '';
      const pro = fp ? `<aside class="box pro" aria-labelledby="pro-t"><h2 id="pro-t">For IT professionals</h2><dl>
        <div><dt>Systems affected</dt><dd>${esc(fp.systems)}</dd></div><div><dt>Network impact</dt><dd>${esc(fp.network)}</dd></div><div><dt>Security impact</dt><dd>${esc(fp.security)}</dd></div>
        <div><dt>Recommended checks</dt><dd>${esc(fp.checks)}</dd></div><div><dt>Detection considerations</dt><dd>${esc(fp.detection)}</dd></div><div><dt>Vendor advisory</dt><dd>${esc(fp.advisory)}</dd></div></dl></aside>` : '';
      // insert WHY IT MATTERS after summary, FOR IT PROS after analysis
      const body = [secs[0], why, secs[1], pro, ...secs.slice(2)].join('');
      return `<article class="article" data-article="${a.id}">
        <div class="demo-banner" role="note">${icon('info')}<span><strong>Demo content.</strong> This story is fictional sample data for the TECHWIRE prototype and does not describe a real event.</span></div>
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="${U.catUrl(a.category)}">${esc(U.catLabel(a.category))}</a><span aria-hidden="true">/</span><span>${esc(a.subcategory)}</span></nav>
        <header class="a-head">
          <div class="a-kicker">${a.isBreaking ? '<span class="live-dot" aria-hidden="true"></span><span class="kbreak">Breaking</span>' : ''}<a class="kcat" href="${U.catUrl(a.category)}">${esc(U.catLabel(a.category))}</a>${U.typeTag(a.type)}${research ? '<span class="badge-research">Research</span>' : ''}${U.sevTag(a)}</div>
          <h1 class="a-title">${esc(a.title)}</h1>
          <p class="a-dek">${esc(a.summary)}</p>
          ${a.cve ? `<div class="cve-box"><span>${esc(a.cve)}</span>${a.cvss ? `<span>CVSS ${a.cvss.toFixed(1)}</span>` : ''}${U.sevTag(a)}<span class="fine">Demo identifier - not a real CVE record</span></div>` : ''}
          <div class="a-meta">
            <div class="byline"><span class="avatar" aria-hidden="true">${esc(au.name.split(' ').map((w) => w[0]).slice(0, 2).join(''))}</span><div><p>By <a href="#/author/${au.id}">${esc(au.name)}</a></p><p class="role">${esc(au.role)}</p></div></div>
            <dl class="a-dates"><div><dt>Published</dt><dd><time datetime="${esc(a.date)}">${U.longDate(a.date)}, ${U.hhmm(a.date)}</time></dd></div>${a.updated ? `<div><dt>Updated</dt><dd><time datetime="${esc(a.updated)}">${U.ago(a.updated)}</time></dd></div>` : ''}<div><dt>Reading time</dt><dd>${a.readingTime} min</dd></div></dl>
          </div>
          <div class="a-actions" role="toolbar" aria-label="Article actions">
            <button type="button" class="act${TW.Bookmarks.has(a.id) ? ' on' : ''}" data-bookmark="${a.id}" aria-pressed="${TW.Bookmarks.has(a.id)}">${icon('bookmark')}<span>${TW.Bookmarks.has(a.id) ? 'Saved' : 'Save'}</span></button>
            <button type="button" class="act" data-share="${a.id}">${icon('share')}<span>Share</span></button>
            <button type="button" class="act" data-copy-link>${icon('link')}<span>Copy link</span></button>
            <button type="button" class="act" data-print>${icon('print')}<span>Print</span></button>
          </div>
        </header>
        <figure class="a-hero">${U.media(a, 'r16x9')}<figcaption>Illustration: TECHWIRE graphics (demo). No photography is used in the prototype.</figcaption></figure>
        <div class="a-layout">
          <div class="a-body">
            <aside class="box brief" aria-labelledby="brief-t"><h2 id="brief-t">60-second brief</h2><dl>
              <div><dt>What happened?</dt><dd>${esc(a.brief.what)}</dd></div><div><dt>Who is affected?</dt><dd>${esc(a.brief.who)}</dd></div>
              <div><dt>Why does it matter?</dt><dd>${esc(a.brief.why)}</dd></div><div><dt>What happens next?</dt><dd>${esc(a.brief.next)}</dd></div></dl></aside>
            ${body}
            <section class="a-sec sources" aria-labelledby="src-t"><h2 id="src-t">Sources</h2><ol>${a.sources.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.label)} ${icon('ext')}</a>` : `<span>${esc(s.label)}</span><span class="src-ph">placeholder · URL pending</span>`}</li>`).join('')}</ol></section>
            <section class="a-sec a-tags" aria-label="Tags and related topics"><h2>Related topics</h2><div class="tagcloud">${[a.subcategory].concat(a.tags).filter((v, i, arr) => arr.indexOf(v) === i).map((t) => `<a class="tag" href="#/topic/${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</div>
              <dl class="a-facts"><div><dt>Category</dt><dd>${esc(a.category)}</dd></div><div><dt>Format</dt><dd>${esc(a.type)}</dd></div><div><dt>Desk</dt><dd>${esc(au.desk || a.category)}</dd></div><div><dt>Content status</dt><dd>Demo (isDemo: true)</dd></div></dl></section>
            <section class="related" aria-labelledby="rel-t"><h2 id="rel-t" class="sec-title">Related stories</h2><div class="rel-grid">${rel.map((r) => story(r, 'card')).join('')}</div></section>
          </div>
          ${sidebar({ suffix: '-a', topics: false })}
        </div>
      </article>`;
    }
  };

  /* ==========================================================================
     LATEST / LIVE / OUTAGES / MAP
     ========================================================================== */
  PAGES.latest = {
    title: 'Latest - TECHWIRE',
    render(p) { return `<header class="desk-head"><p class="eyebrow">Chronological</p><h1 class="desk-title">Latest news</h1><p class="desk-desc">Every TECHWIRE story in order of publication. Filter by desk.</p></header><div class="with-rail"><div class="main-col">${latestFeed('page-latest', p.query.filter)}</div>${sidebar({ suffix: '-l' })}</div>`; },
    mount(root) { root.querySelectorAll('[data-feed]').forEach((f) => renderFeed(f)); }
  };
  PAGES.live = {
    title: 'Live - TECHWIRE',
    render() { return `<header class="desk-head"><p class="eyebrow"><span class="live-dot" aria-hidden="true"></span> Live</p><h1 class="desk-title">Live technology updates</h1><p class="desk-desc">A running log of events across security, networking, cloud and infrastructure. <strong>Demo live feed</strong> until a real API is connected.</p></header>
      <div class="with-rail"><div class="main-col">${liveBlock(50, true)}${timelineBlock()}</div><div class="rail-wrap">${outageBlock()}${netIntelBlock()}</div></div>`; }
  };
  PAGES.outages = {
    title: 'IT Outage Center - TECHWIRE',
    render() {
      const outageStories = D.all().filter((a) => /Outage|Network Outages|Cloud Outage|Internet Infrastructure|BGP/.test(a.subcategory));
      return `<header class="desk-head"><p class="eyebrow">Service health</p><h1 class="desk-title">IT Outage Center</h1><p class="desk-desc">Service status, internet incidents and outage reporting. Status values shown here are <strong>demo data</strong>, not live provider status.</p></header>
      <div class="with-rail"><div class="main-col"><div class="status-grid">${D.store.status.map((s) => `<article class="st-card st-c-${s.status}"><h2>${esc(s.service)}</h2>${U.statusRow(s).replace('<li class="st-row">', '<div>').replace('</li>', '</div>')}<p class="fine">${esc(s.note || 'No incidents in demo data')}</p><p class="badge-demo">Demo status</p></article>`).join('')}</div>
      <section class="panel" aria-labelledby="oh-t"><h2 class="sec-title" id="oh-t">Outage and incident coverage</h2><div class="stack">${outageStories.map((a) => story(a, 'row')).join('')}</div></section>${mapBlock()}</div>
      <div class="rail-wrap">${netIntelBlock()}${liveBlock(6)}</div></div>`;
    },
    mount(root) { TW.App.mountMap(root); }
  };
  PAGES.map = { title: 'Global Infrastructure Map - TECHWIRE', render() { return `<header class="desk-head"><p class="eyebrow">Data visualization</p><h1 class="desk-title">Global technology infrastructure</h1><p class="desk-desc">Cloud regions, internet exchanges, datacenter hubs and cable landings. <strong>Demo visualization</strong> with illustrative positions.</p></header>${mapBlock()}`; }, mount(root) { TW.App.mountMap(root); } };

  /* ==========================================================================
     EXPLAINED / DEEP DIVE / RESEARCH
     ========================================================================== */
  PAGES.explained = {
    title: 'Tech Explained - TECHWIRE',
    render() { return `<header class="desk-head"><p class="eyebrow">Explainers</p><h1 class="desk-title">Tech Explained</h1><p class="desk-desc">Educational guides with diagrams covering the fundamentals behind the news.</p></header><div class="ex-grid">${D.store.explainers.map(explainerCard).join('')}</div>`; }
  };
  PAGES.explainer = {
    title: (p) => { const e = D.explainer(p.slug); return e ? e.title + ' - TECH EXPLAINED' : 'Not found'; },
    render(p) {
      const e = D.explainer(p.slug);
      if (!e) return PAGES.notfound.render();
      const d = TW.Art.diagram(e.diagram);
      const others = D.store.explainers.filter((x) => x.slug !== e.slug).slice(0, 3);
      return `<article class="article explainer"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/explained">Tech Explained</a></nav>
        <header class="a-head"><div class="a-kicker"><span class="type type-explainer">Explainer</span><span class="ksub">${esc(e.level)}</span></div><h1 class="a-title">${esc(e.title)}</h1><p class="a-dek">${esc(e.dek)}</p>
        <div class="a-meta"><div class="byline"><span class="avatar" aria-hidden="true">${esc(D.author(e.author).name.split(' ').map((w) => w[0]).join(''))}</span><div><p>By <a href="#/author/${e.author}">${esc(D.author(e.author).name)}</a></p><p class="role">${e.minutes} min read</p></div></div></div>
        <div class="a-actions" role="toolbar" aria-label="Article actions"><button type="button" class="act" data-copy-link>${icon('link')}<span>Copy link</span></button><button type="button" class="act" data-print>${icon('print')}<span>Print</span></button></div></header>
        <figure class="diagram-fig"><div class="diagram-wrap">${d.svg}</div><figcaption>${esc(d.caption)}</figcaption></figure>
        <div class="a-layout"><div class="a-body">${e.sections.map((s) => `<section class="a-sec"><h2>${esc(s.heading)}</h2>${s.paragraphs.map((x) => `<p>${esc(x)}</p>`).join('')}</section>`).join('')}
          <aside class="box why"><h2>Keep learning</h2><p>Explainers give general technical background. For current events, follow the relevant desk.</p></aside>
          <section class="related"><h2 class="sec-title">More explainers</h2><div class="ex-row three">${others.map(explainerCard).join('')}</div></section></div>${sidebar({ suffix: '-e', topics: false })}</div></article>`;
    }
  };
  PAGES.deepdives = {
    title: 'Deep Dive - TECHWIRE',
    render() { return `<header class="desk-head"><p class="eyebrow">Long reads</p><h1 class="desk-title">Deep Dive</h1><p class="desk-desc">In-depth technical analysis. In this prototype, deep dives are <strong>fictional scenarios</strong> written to demonstrate the format.</p></header><div class="deep-list">${D.store.deepDives.map((d) => `<article class="deep-item"><span class="type type-analysis">Deep Dive</span><h2 class="hl hl-lg"><a href="#/deep-dive/${d.slug}">${esc(d.title)}</a></h2><p class="dek">${esc(d.dek)}</p><p class="meta">${esc(D.author(d.author).name)}<span class="sep">·</span>${esc(d.category)}<span class="sep">·</span>${d.minutes} min read</p></article>`).join('')}</div>`; }
  };
  PAGES.deepdive = {
    title: (p) => { const d = D.deepDive(p.slug); return d ? d.title + ' - DEEP DIVE' : 'Not found'; },
    render(p) {
      const d = D.deepDive(p.slug);
      if (!d) return PAGES.notfound.render();
      const toc = d.sections.map((s, i) => `<li><a href="#dd-${i}" data-anchor>${esc(s.heading)}</a></li>`).join('');
      return `<article class="article deep"><div class="demo-banner" role="note">${icon('info')}<span><strong>Fictional scenario.</strong> This deep dive demonstrates the long-form format; the events described did not happen.</span></div>
        <header class="a-head deep-head"><div class="a-kicker"><span class="type type-analysis">Deep Dive</span><a class="kcat" href="${U.catUrl(d.category)}">${esc(d.category)}</a></div><h1 class="a-title xl">${esc(d.title)}</h1><p class="a-dek">${esc(d.dek)}</p>
        <div class="a-meta"><div class="byline"><span class="avatar" aria-hidden="true">${esc(D.author(d.author).name.split(' ').map((w) => w[0]).join(''))}</span><div><p>By <a href="#/author/${d.author}">${esc(D.author(d.author).name)}</a></p><p class="role">${d.minutes} min read</p></div></div></div>
        <div class="a-actions" role="toolbar" aria-label="Article actions"><button type="button" class="act" data-copy-link>${icon('link')}<span>Copy link</span></button><button type="button" class="act" data-print>${icon('print')}<span>Print</span></button></div></header>
        <div class="deep-layout"><nav class="toc" aria-label="Contents"><p class="eyebrow">Contents</p><ol>${toc}<li><a href="#dd-src" data-anchor>Sources</a></li></ol></nav>
        <div class="a-body deep-body">${d.sections.map((s, i) => `<section class="a-sec${i === 0 ? ' exec' : ''}" id="dd-${i}"><h2>${esc(s.heading)}</h2>${s.paragraphs.map((x) => `<p>${esc(x)}</p>`).join('')}</section>`).join('')}
        <section class="a-sec sources" id="dd-src"><h2>Sources</h2><ol>${d.sources.map((s) => `<li><span>${esc(s.label)}</span><span class="src-ph">placeholder · URL pending</span></li>`).join('')}</ol></section></div></div></article>`;
    }
  };
  PAGES.research = {
    title: 'Security Research - TECHWIRE',
    render() {
      const areas = ['Malware analysis', 'Vulnerability research', 'Threat actor analysis', 'Network security', 'Incident response', 'Digital forensics', 'Detection engineering', 'AI security'];
      return `<header class="desk-head"><p class="eyebrow"><span class="badge-research">Research</span></p><h1 class="desk-title">Security Research</h1><p class="desk-desc">Technical research notes from the TECHWIRE security team, clearly labelled and separate from news reporting.</p></header>
      <div class="filters">${areas.map((a) => `<a class="chip" href="#research-${a.replace(/\s+/g, '-').toLowerCase()}" data-anchor>${esc(a)}</a>`).join('')}</div>
      <div class="research-grid">${D.store.research.map((r) => `<article class="rs-card" id="research-${r.area.replace(/\s+/g, '-').toLowerCase()}"><div class="rs-top"><span class="badge-research">Research</span><span class="rs-area">${esc(r.area)}</span></div><h2 class="hl hl-md"><a href="#/article/${r.ref}">${esc(r.title)}</a></h2><p class="dek sm">${esc(r.summary)}</p><p class="meta">${esc(D.author(r.author).name)}</p></article>`).join('')}</div>`;
    }
  };

  /* ==========================================================================
     TEAM / AUTHOR / NEWSROOM
     ========================================================================== */
  PAGES.team = {
    title: 'TECHWIRE Team',
    render() {
      const people = D.authors().filter((a) => !a.isDesk);
      return `<header class="desk-head"><p class="eyebrow">Editorial team</p><h1 class="desk-title">TECHWIRE Team</h1><p class="desk-desc">The editors and reporters behind TECHWIRE coverage. <strong>Profiles are fictional demo data.</strong></p></header>
        <div class="team-grid">${people.map((p) => `<article class="person"><span class="avatar lg" aria-hidden="true">${esc(p.name.split(' ').map((w) => w[0]).join(''))}</span><h2 class="hl hl-md"><a href="#/author/${p.id}">${esc(p.name)}</a></h2><p class="role">${esc(p.role)}</p><p class="dek sm">${esc(p.bio)}</p><p class="meta">${D.byAuthor(p.id).length} stories<span class="sep">·</span>${esc(p.location)}</p></article>`).join('')}</div>
        <section class="panel"><h2 class="sec-title">Desk bylines</h2><ul class="plain">${D.authors().filter((a) => a.isDesk).map((d) => `<li><a href="#/author/${d.id}">${esc(d.name)}</a> - ${esc(d.bio)}</li>`).join('')}</ul></section>`;
    }
  };
  PAGES.author = {
    title: (p) => D.author(p.id).name + ' - TECHWIRE',
    render(p) {
      const au = D.store.authors.get(p.id);
      if (!au) return PAGES.notfound.render();
      const list = D.byAuthor(au.id);
      return `<header class="author-head"><span class="avatar xl" aria-hidden="true">${esc(au.name.split(' ').map((w) => w[0]).slice(0, 2).join(''))}</span><div><p class="eyebrow">${esc(au.role)}</p><h1 class="desk-title">${esc(au.name)}</h1><p class="desk-desc">${esc(au.bio)}</p><p class="meta">${esc(au.location)}<span class="sep">·</span>${list.length} stories<span class="sep">·</span>${esc(au.note)}</p><div class="tagcloud">${(au.expertise || []).map((x) => `<span class="tag static">${esc(x)}</span>`).join('')}</div></div></header>
        <div class="with-rail"><div class="main-col"><div class="stack">${list.map((a) => story(a, 'row')).join('') || '<p class="empty">No stories yet.</p>'}</div></div>${sidebar({ suffix: '-au' })}</div>`;
    }
  };
  PAGES.newsroom = {
    title: 'Newsroom - TECHWIRE',
    render() {
      const day = Date.now() - 864e5;
      const today = D.all().filter((a) => new Date(a.date).getTime() > day);
      const cats = ['Cybersecurity', 'Networking', 'Cloud', 'AI', 'Hardware', 'Infrastructure', 'Software', 'Dev', 'Technology'];
      const counts = cats.map((c) => [c, today.filter((a) => a.category === c).length]);
      const max = Math.max(...counts.map((c) => c[1]), 1);
      const types = ['News', 'Analysis', 'Opinion', 'Research'].map((t) => [t, today.filter((a) => a.type === t).length]);
      const hours = Array.from({ length: 24 }, (_, i) => { const end = Date.now() - i * 36e5; return today.filter((a) => { const t = new Date(a.date).getTime(); return t <= end && t > end - 36e5; }).length; }).reverse();
      const hmax = Math.max(...hours, 1);
      const bars = hours.map((v, i) => `<rect x="${i * 25 + 4}" y="${120 - (v / hmax) * 100}" width="17" height="${(v / hmax) * 100}" rx="2" class="nr-bar"><title>${v} stories</title></rect>`).join('');
      const byAuthor = D.authors().map((a) => [a, today.filter((x) => x.author === a.id).length]).filter((x) => x[1]).sort((a, b) => b[1] - a[1]);
      return `<header class="desk-head"><p class="eyebrow">Editorial dashboard</p><h1 class="desk-title">Newsroom</h1><p class="desk-desc">Publishing overview for the last 24 hours, computed from the loaded content. <span class="badge-demo">UI demo</span></p></header>
        <section class="nr-kpis" aria-label="Today"><div class="kpi big"><span>Articles published</span><b>${today.length}</b><small>last 24 hours</small></div>${counts.filter((c) => c[1]).map(([c, n]) => `<div class="kpi"><span>${esc(c)}</span><b>${n}</b></div>`).join('')}</section>
        <div class="nr-grid">
          <section class="panel"><h2 class="sec-title">By desk</h2><ul class="hbars">${counts.map(([c, n]) => `<li><span>${esc(c)}</span><span class="hb"><span style="width:${(n / max) * 100}%"></span></span><b>${n}</b></li>`).join('')}</ul></section>
          <section class="panel"><h2 class="sec-title">Publishing rhythm (24h)</h2><svg class="nr-chart" viewBox="0 0 604 140" role="img" aria-label="Stories published per hour over the last 24 hours">${bars}<line x1="0" y1="120.5" x2="604" y2="120.5" class="nr-axis"/><text x="4" y="136" class="nr-lbl">-24h</text><text x="600" y="136" text-anchor="end" class="nr-lbl">now</text></svg></section>
          <section class="panel"><h2 class="sec-title">By format</h2><ul class="hbars">${types.map(([t, n]) => `<li><span>${U.typeTag(t)}</span><span class="hb"><span style="width:${(n / Math.max(today.length, 1)) * 100}%"></span></span><b>${n}</b></li>`).join('')}</ul></section>
          <section class="panel"><h2 class="sec-title">By byline</h2><ul class="plain lined">${byAuthor.map(([a, n]) => `<li><a href="#/author/${a.id}">${esc(a.name)}</a><b>${n}</b></li>`).join('')}</ul></section>
        </div>
        <section class="panel"><h2 class="sec-title">Publishing queue (most recent)</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Time</th><th scope="col">Headline</th><th scope="col">Desk</th><th scope="col">Format</th><th scope="col">Byline</th><th scope="col">Status</th></tr></thead><tbody>${today.slice(0, 14).map((a) => `<tr><td class="mono">${U.hhmm(a.date)}</td><td><a href="${a.url}">${esc(a.title)}</a></td><td>${esc(a.category)}</td><td>${U.typeTag(a.type)}</td><td>${esc(D.author(a.author).name)}</td><td><span class="pub">Published</span></td></tr>`).join('')}</tbody></table></div></section>`;
    }
  };

  /* ==========================================================================
     BOOKMARKS / SEARCH / TOPIC / NEWSLETTER / STATIC
     ========================================================================== */
  PAGES.bookmarks = {
    title: 'Saved stories - TECHWIRE',
    render() {
      const list = TW.Bookmarks.list().map((id) => D.get(id)).filter(Boolean);
      return `<header class="desk-head"><p class="eyebrow">Your reading list</p><h1 class="desk-title">Saved stories</h1><p class="desk-desc">Bookmarks are stored only in this browser (LocalStorage).</p>${list.length ? '<button type="button" class="btn btn-outline" data-clear-bookmarks>Clear all</button>' : ''}</header>
        ${list.length ? `<div class="stack">${list.map((a) => story(a, 'row')).join('')}</div>` : `<div class="empty-block">${icon('bookmark', 'xl')}<p>No saved stories yet. Use the bookmark button on any story to save it for later.</p><a class="btn btn-primary" href="#/latest">Browse latest news</a></div>`}`;
    }
  };
  PAGES.search = {
    title: (p) => `Search: ${p.query.q || ''} - TECHWIRE`,
    render(p) {
      const q = p.query.q || '';
      const r = D.search(q);
      const total = r.articles.length + r.authors.length + r.features.length;
      const group = (title, html) => (html ? `<section class="sr-group"><h2 class="sec-title">${title}</h2>${html}</section>` : '');
      return `<header class="desk-head"><p class="eyebrow">Search</p><h1 class="desk-title">${q ? `Results for “${esc(q)}”` : 'Search TECHWIRE'}</h1>
        <form class="search-page-form" data-search-form role="search"><label class="visually-hidden" for="sp-q">Search TECHWIRE</label><input id="sp-q" name="q" type="search" value="${esc(q)}" placeholder="Search articles, authors, topics, companies, CVEs…"><button class="btn btn-primary" type="submit">${icon('search')} Search</button></form>
        ${q ? `<p class="desk-desc">${total} result${total === 1 ? '' : 's'}</p>` : ''}</header>
        ${q ? `<div class="with-rail"><div class="main-col">
          ${group('CVEs', r.cves.length ? `<ul class="plain lined">${r.cves.map((c) => `<li><a href="${c.article.url}"><span class="cve-id">${esc(c.cve)}</span> ${esc(c.article.title)}</a>${c.cvss ? `<b>CVSS ${c.cvss}</b>` : ''}</li>`).join('')}</ul>` : '')}
          ${group('Companies & technologies', r.companies.length + r.technologies.length ? `<div class="tagcloud">${r.companies.concat(r.technologies).map((t) => `<a class="tag" href="#/topic/${encodeURIComponent(t.tag)}">${esc(t.tag)} <span class="chip-n">${t.count}</span></a>`).join('')}</div>` : '')}
          ${group('Topics', r.topics.length ? `<div class="tagcloud">${r.topics.map((t) => `<a class="tag" href="#/section/${t.section}?topic=${encodeURIComponent(t.topic)}">${esc(t.topic)}</a>`).join('')}</div>` : '')}
          ${group('Authors', r.authors.length ? `<ul class="plain lined">${r.authors.map((a) => `<li><a href="#/author/${a.id}">${esc(a.name)}</a><span>${esc(a.role)}</span></li>`).join('')}</ul>` : '')}
          ${group('Explainers, deep dives & research', r.features.length ? `<ul class="plain lined">${r.features.map((f) => `<li><a href="${f.url}">${esc(f.title)}</a><span>${esc(f.kind)}</span></li>`).join('')}</ul>` : '')}
          ${group(`Articles (${r.articles.length})`, r.articles.length ? `<div class="stack">${r.articles.slice(0, 30).map((a) => story(a, 'row')).join('')}</div>` : '')}
          ${total ? '' : `<div class="empty-block"><p>No results for “${esc(q)}”. Try a broader term such as <a href="#/search?q=BGP">BGP</a>, <a href="#/search?q=ransomware">ransomware</a> or <a href="#/search?q=CVE">CVE</a>.</p></div>`}
        </div>${sidebar({ suffix: '-sr', noNewsletter: true })}</div>` : `<div class="tagcloud">${D.allTags().slice(0, 30).map((t) => `<a class="tag" href="#/search?q=${encodeURIComponent(t.tag)}">${esc(t.tag)}</a>`).join('')}</div>`}`;
    }
  };
  PAGES.topic = {
    title: (p) => `${p.tag} - TECHWIRE`,
    render(p) {
      const list = D.byTag(p.tag).concat(D.byTopic(p.tag)).filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);
      return `<header class="desk-head"><p class="eyebrow">Topic</p><h1 class="desk-title">${esc(p.tag)}</h1><p class="desk-desc">${list.length} stor${list.length === 1 ? 'y' : 'ies'} tagged with this topic.</p></header>
        <div class="with-rail"><div class="main-col">${list.length ? `<div class="stack">${list.map((a) => story(a, 'row')).join('')}</div>` : `<div class="empty-block"><p>No stories for this topic yet.</p><a class="btn btn-outline" href="#/latest">Latest news</a></div>`}</div>${sidebar({ suffix: '-tp' })}</div>`;
    }
  };
  PAGES.newsletter = {
    title: 'TECHWIRE Daily newsletter',
    render() { return `<div class="narrow">${U.newsletterBox('nl-page', 'page')}<section class="panel"><h2 class="sec-title">What you get</h2><ul class="plain lined"><li><b>TECHWIRE Daily</b><span>Weekdays, 07:00 - the stories that matter across the desks</span></li><li><b>Security briefing</b><span>Critical advisories and exploited vulnerabilities</span></li><li><b>Network briefing</b><span>Routing incidents, outages and platform news</span></li><li><b>Weekly Digest</b><span>Saturday - analysis, explainers and deep dives</span></li></ul></section></div>`; }
  };

  const staticPage = (title, eyebrow, html) => ({ title: title + ' - TECHWIRE', render: () => `<article class="static narrow"><p class="eyebrow">${eyebrow}</p><h1 class="desk-title">${title}</h1>${html}</article>` });
  PAGES.about = staticPage('About TECHWIRE', 'About', `<p class="a-dek">TECHWIRE is a technology newsroom focused on IT, cybersecurity, networking, infrastructure, cloud, AI and enterprise technology.</p>
    <p>We write for the people who build and run technology: network engineers, system administrators, security analysts, cloud architects and IT leaders. Our desks cover news as it happens, explain the technology behind it and analyse what it means for organisations.</p>
    <div class="box why"><h2>About this prototype</h2><p>This site is a <strong>frontend prototype</strong>. Every article, author, statistic, live update and status shown is fictional demo data (<code>isDemo: true</code>) until the platform is connected to real sources.</p></div>
    <h2>Our desks</h2><ul class="plain lined">${Object.values(D.SECTIONS).map((s) => `<li><a href="#/section/${s.key}">${esc(s.desk)}</a><span>${esc(s.desc)}</span></li>`).join('')}</ul>`);
  PAGES.editorial = staticPage('Editorial Policy', 'Standards', `<p class="a-dek">Readers must always be able to tell what kind of content they are reading and where information comes from.</p>
    <h2>Content formats</h2><dl class="formats"><div><dt>${U.typeTag('News')}</dt><dd>Factual reporting of events. Neutral headlines, named sources, date and author. No speculation presented as fact.</dd></div><div><dt>${U.typeTag('Analysis')}</dt><dd>Interpretation by a specialist editor, grounded in reporting and evidence.</dd></div><div><dt>${U.typeTag('Opinion')}</dt><dd>A clearly labelled personal argument. Never mixed with news coverage.</dd></div><div><dt>${U.typeTag('Research')}</dt><dd>Technical research by the security team, with methodology and indicators.</dd></div><div><dt>${U.typeTag('Explainer')}</dt><dd>Educational background on technologies and concepts.</dd></div></dl>
    <h2>Sourcing</h2><p>News articles cite primary sources wherever possible: vendor advisories, official company statements, CERTs, CISA, NVD, standards documentation and named security researchers.</p>
    <h2>Headlines</h2><p>We do not publish clickbait. Headlines describe what happened, not how readers should feel about it.</p>
    <h2>Security reporting</h2><p>We follow coordinated disclosure norms, avoid publishing working exploit details before fixes are available and include practical guidance for defenders.</p>
    <h2>Corrections</h2><p>Errors are corrected promptly and transparently; significant corrections are noted at the end of the article with the date of the change.</p>`);
  PAGES.contact = staticPage('Contact', 'Get in touch', `<p class="a-dek">Send tips, corrections and feedback to the newsroom.</p>
    <form class="contact-form" data-contact novalidate><div class="f-row"><label for="c-name">Name</label><input id="c-name" name="name" required autocomplete="name"></div><div class="f-row"><label for="c-email">Email</label><input id="c-email" name="email" type="email" required autocomplete="email"></div>
    <div class="f-row"><label for="c-topic">Topic</label><select id="c-topic" name="topic"><option>News tip</option><option>Correction</option><option>Security disclosure</option><option>Feedback</option></select></div>
    <div class="f-row"><label for="c-msg">Message</label><textarea id="c-msg" name="message" rows="5" required minlength="10"></textarea></div><p class="nl-msg" role="status" aria-live="polite"></p><button class="btn btn-primary" type="submit">Send message</button>
    <p class="fine">Demo form: validated in the browser only. Messages are not transmitted anywhere.</p></form>`);
  PAGES.privacy = staticPage('Privacy', 'Legal', `<p class="a-dek">This prototype does not use cookies, analytics, trackers or server-side storage.</p>
    <h2>What is stored</h2><p>Only in your browser's LocalStorage: theme preference, bookmarks, recent searches and demo newsletter preferences. You can remove them at any time by clearing site data or using the controls below.</p>
    <button type="button" class="btn btn-outline" data-clear-local>Clear all TECHWIRE data in this browser</button>
    <h2>Fonts</h2><p>Typefaces are loaded from Google Fonts. Self-host them to remove this third-party request.</p>`);
  PAGES.terms = staticPage('Terms', 'Legal', `<p class="a-dek">TECHWIRE prototype - terms of use.</p><p>All content in this prototype is fictional demo material provided for design and development purposes. It must not be relied upon, cited or republished as real news. Company and product names appear only as topic labels.</p><p>Code is provided as-is for evaluation. Replace demo data with licensed or original reporting before any public launch.</p>`);

  PAGES.notfound = { title: 'Not found - TECHWIRE', render: () => `<div class="empty-block"><p class="eyebrow">404</p><h1 class="desk-title">Page not found</h1><p>The page you requested does not exist in this edition.</p><a class="btn btn-primary" href="#/">Go to homepage</a></div>` };

  TW.Pages = PAGES;
  TW.PageHelpers = { renderFeed, liveItem };
})();
