/* ==========================================================================
   TECHWIRE — Application shell
   Router, header, breaking ticker, search overlay, bookmarks, theme,
   lazy artwork, forms, sharing, reading progress, live simulation.
   ========================================================================== */
(function () {
  'use strict';
  const TW = window.TW;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ------------------------------ storage ------------------------------ */
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('techwire.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('techwire.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    clear() { try { Object.keys(localStorage).filter((k) => k.startsWith('techwire.')).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* ignore */ } }
  };

  /* ------------------------------ bookmarks ------------------------------ */
  TW.Bookmarks = {
    list: () => LS.get('bookmarks', []),
    has: (id) => TW.Bookmarks.list().includes(String(id)),
    toggle(id) {
      id = String(id);
      const l = TW.Bookmarks.list();
      const on = !l.includes(id);
      LS.set('bookmarks', on ? [id].concat(l) : l.filter((x) => x !== id));
      updateBookmarkCount();
      return on;
    },
    clear() { LS.set('bookmarks', []); updateBookmarkCount(); }
  };
  function updateBookmarkCount() {
    const n = TW.Bookmarks.list().length;
    $$('[data-bm-count]').forEach((el) => { el.textContent = n || ''; el.hidden = !n; });
  }

  /* ------------------------------ toasts ------------------------------ */
  function toast(msg, kind) {
    const host = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast-' + kind : '');
    el.setAttribute('role', 'status');
    el.innerHTML = TW.UI.icon(kind === 'err' ? 'alert' : 'check') + '<span></span>';
    el.querySelector('span').textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 250); }, 2800);
  }

  /* ------------------------------ theme ------------------------------ */
  function setTheme(t, silent) {
    document.documentElement.dataset.theme = t;
    LS.set('theme', t);
    const b = $('#theme-btn');
    if (b) { b.innerHTML = TW.UI.icon(t === 'dark' ? 'sun' : 'moon'); b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); b.setAttribute('aria-pressed', t === 'dark'); }
    if (!silent) toast(t === 'dark' ? 'Dark mode on' : 'Light mode on');
  }

  /* ------------------------------ lazy artwork ------------------------------ */
  let io = null;
  function paint(el) {
    if (el.dataset.art) { const a = TW.Data.get(el.dataset.art); if (a) el.insertAdjacentHTML('afterbegin', TW.Art.cover(a)); el.removeAttribute('data-art'); }
    else if (el.dataset.diagram) { const d = TW.Art.diagram(el.dataset.diagram); el.innerHTML = d.svg; el.removeAttribute('data-diagram'); }
  }
  function hydrate(root) {
    const els = $$('[data-art], [data-diagram]', root || document);
    if (!('IntersectionObserver' in window)) { els.forEach(paint); return; }
    if (!io) io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { paint(e.target); io.unobserve(e.target); } }), { rootMargin: '300px 0px' });
    els.forEach((el) => io.observe(el));
  }

  /* ------------------------------ map ------------------------------ */
  function mountMap(root) {
    const m = TW.Data.store.map;
    $$('.map-wrap', root).forEach((wrap) => {
      const canvas = $('[data-map]', wrap), info = $('[data-map-info]', wrap);
      const state = { cloud: true, ix: true, dc: true, cable: true };
      const draw = () => { canvas.innerHTML = TW.Art.worldMap(m, state); };
      draw();
      wrap.addEventListener('change', (e) => { const t = e.target.dataset.mapType; if (t) { state[t] = e.target.checked; draw(); } });
      const show = (el) => {
        const n = m.nodes[+el.dataset.mapNode];
        $$('.m-node.sel', canvas).forEach((x) => x.classList.remove('sel'));
        el.classList.add('sel');
        info.innerHTML = `<h3 class="hl hl-sm">${TW.UI.esc(n.name)}</h3><ul class="plain">${n.types.map((t) => `<li><span class="lg-dot lg-${t}" aria-hidden="true"></span>${TW.Art.MAP_TYPES[t]}</li>`).join('')}</ul><p class="fine">Demo attributes · approximate position ${n.lat.toFixed(1)}°, ${n.lon.toFixed(1)}°</p>`;
      };
      canvas.addEventListener('click', (e) => { const g = e.target.closest('[data-map-node]'); if (g) show(g); });
      canvas.addEventListener('keydown', (e) => { const g = e.target.closest('[data-map-node]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(g); } });
    });
  }

  /* ------------------------------ router ------------------------------ */
  function parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const query = {};
    new URLSearchParams(qs || '').forEach((v, k) => (query[k] = v));
    const seg = path.split('/').filter(Boolean).map(decodeURIComponent);
    const p = { query };
    let page = 'home';
    switch (seg[0]) {
      case undefined: page = 'home'; break;
      case 'section': page = 'section'; p.key = seg[1]; break;
      case 'article': page = 'article'; p.id = seg[1]; break;
      case 'explained': if (seg[1]) { page = 'explainer'; p.slug = seg[1]; } else page = 'explained'; break;
      case 'deep-dive': if (seg[1]) { page = 'deepdive'; p.slug = seg[1]; } else page = 'deepdives'; break;
      case 'author': page = 'author'; p.id = seg[1]; break;
      case 'topic': page = 'topic'; p.tag = seg[1] || ''; break;
      case 'editorial-policy': page = 'editorial'; break;
      default: page = TW.Pages[seg[0]] ? seg[0] : 'notfound';
    }
    return { page, p };
  }

  function route() {
    if (location.hash && !location.hash.startsWith('#/')) return; // in-page anchors
    const { page, p } = parse();
    const P = TW.Pages[page] || TW.Pages.notfound;
    const main = $('#main');
    main.innerHTML = P.render(p);
    document.title = typeof P.title === 'function' ? P.title(p) : P.title;
    if (P.mount) P.mount(main, p);
    hydrate(main);
    // nav state
    const key = page === 'section' ? p.key : page === 'article' && TW.Data.get(p.id) ? TW.UI.CAT_SECTION[TW.Data.get(p.id).category] : page === 'home' ? '' : page;
    $$('.nav a[data-nav]').forEach((a) => { const on = a.dataset.nav === key; a.classList.toggle('active', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    closeMenu(); closeMore();
    document.body.classList.toggle('is-article', page === 'article' || page === 'explainer' || page === 'deepdive');
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
    $$('.bottom-nav a').forEach((a) => a.classList.toggle('active', a.dataset.tab === (page === 'home' ? 'home' : page)));
    progress();
  }

  /* ------------------------------ header / menus ------------------------------ */
  function closeMenu() { document.body.classList.remove('menu-open'); const b = $('#menu-btn'); if (b) b.setAttribute('aria-expanded', 'false'); }
  function closeMore() { const b = $('#more-btn'); if (b) { b.setAttribute('aria-expanded', 'false'); $('#more-menu').hidden = true; } }

  function buildTicker() {
    const items = TW.Data.breaking();
    const t = $('#ticker-track');
    if (!items.length) { $('#breaking').hidden = true; return; }
    const html = items.map((a) => `<a href="${a.url}">${TW.UI.esc(a.title)}</a>`).join('<span class="tk-sep" aria-hidden="true">■</span>');
    t.innerHTML = `<div class="tk-run">${html}<span class="tk-sep" aria-hidden="true">■</span></div><div class="tk-run" aria-hidden="true">${html.replace(/<a /g, '<a tabindex="-1" ')}<span class="tk-sep">■</span></div>`;
    $('#breaking-view').href = items[0].url;
  }

  function mastheadDate() {
    const d = new Date();
    $('#mh-date').textContent = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* ------------------------------ search overlay ------------------------------ */
  let sIdx = -1;
  function openSearch(q) {
    const o = $('#search');
    o.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => o.classList.add('open'));
    const i = $('#search-q');
    i.value = q || '';
    renderSuggest();
    setTimeout(() => i.focus(), 30);
  }
  function closeSearch() {
    const o = $('#search');
    if (o.hidden) return false;
    o.classList.remove('open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => (o.hidden = true), 160);
    const b = $('#search-btn'); if (b) b.focus();
    return true;
  }
  function renderSuggest() {
    const q = $('#search-q').value.trim();
    const box = $('#search-results');
    const E = TW.UI.esc;
    sIdx = -1;
    if (!q) {
      const recent = LS.get('recent', []);
      box.innerHTML = `${recent.length ? `<section><h3>Recent searches</h3><div class="sg-chips">${recent.map((r) => `<a class="tag" href="#/search?q=${encodeURIComponent(r)}" data-sitem>${E(r)}</a>`).join('')}</div></section>` : ''}
        <section><h3>Trending topics</h3><div class="sg-chips">${['BGP', 'Ransomware', 'CVE', 'Kubernetes', 'Wi-Fi', 'Zero-Day', 'AI Security', 'Datacenter'].map((t) => `<a class="tag" href="#/search?q=${encodeURIComponent(t)}" data-sitem>${t}</a>`).join('')}</div></section>
        <section><h3>Trending stories</h3><ul class="sg-list">${TW.Data.trending(4).map((a) => `<li><a href="${a.url}" data-sitem><span class="sg-k">${E(a.category)}</span>${E(a.title)}</a></li>`).join('')}</ul></section>`;
      return;
    }
    const r = TW.Data.search(q);
    const sec = (title, items) => (items ? `<section><h3>${title}</h3><ul class="sg-list">${items}</ul></section>` : '');
    const html = [
      sec('Articles', r.articles.slice(0, 6).map((a) => `<li><a href="${a.url}" data-sitem><span class="sg-k">${E(a.type === 'News' ? a.category : a.type)}</span>${hl(a.title, q)}</a></li>`).join('')),
      sec('CVEs', r.cves.slice(0, 4).map((c) => `<li><a href="${c.article.url}" data-sitem><span class="sg-k mono">${E(c.cve)}</span>${E(c.article.title)}</a></li>`).join('')),
      sec('Authors', r.authors.slice(0, 3).map((a) => `<li><a href="#/author/${a.id}" data-sitem><span class="sg-k">${E(a.role)}</span>${hl(a.name, q)}</a></li>`).join('')),
      sec('Topics & companies', r.topics.map((t) => `<li><a href="#/section/${t.section}?topic=${encodeURIComponent(t.topic)}" data-sitem><span class="sg-k">Topic</span>${hl(t.topic, q)}</a></li>`).concat(r.companies.concat(r.technologies).slice(0, 6).map((t) => `<li><a href="#/topic/${encodeURIComponent(t.tag)}" data-sitem><span class="sg-k">${TW.Data.COMPANIES.includes(t.tag) ? 'Company' : 'Technology'}</span>${hl(t.tag, q)}</a></li>`)).join('')),
      sec('Explainers & features', r.features.slice(0, 4).map((f) => `<li><a href="${f.url}" data-sitem><span class="sg-k">${E(f.kind)}</span>${hl(f.title, q)}</a></li>`).join(''))
    ].join('');
    box.innerHTML = html || `<p class="sg-empty">No matches for “${E(q)}”.</p>`;
    box.insertAdjacentHTML('beforeend', `<a class="sg-all" href="#/search?q=${encodeURIComponent(q)}" data-sitem>See all results for “${E(q)}” ${TW.UI.icon('arrow')}</a>`);
  }
  function hl(text, q) {
    const E = TW.UI.esc;
    const terms = q.split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!terms.length) return E(text);
    return E(text).replace(new RegExp('(' + terms.join('|') + ')', 'ig'), '<mark>$1</mark>');
  }
  function remember(q) { const r = LS.get('recent', []).filter((x) => x.toLowerCase() !== q.toLowerCase()); r.unshift(q); LS.set('recent', r.slice(0, 6)); }

  /* ------------------------------ reading progress / back to top ------------------------------ */
  function progress() {
    const bar = $('#progress');
    const art = $('.article');
    const y = window.scrollY;
    if (art) {
      const start = art.offsetTop, h = art.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, (y - start) / Math.max(h, 1)));
      bar.style.transform = `scaleX(${p})`;
      bar.parentElement.hidden = false;
      bar.parentElement.setAttribute('aria-valuenow', Math.round(p * 100));
    } else bar.parentElement.hidden = true;
    $('#to-top').classList.toggle('show', y > 900);
    document.body.classList.toggle('scrolled', y > 40);
  }

  /* ------------------------------ forms ------------------------------ */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function onNewsletter(form) {
    const email = form.email.value.trim();
    const msg = $('.nl-msg', form);
    const topics = $$('input[name="topics"]:checked', form).map((i) => i.value);
    form.email.setAttribute('aria-invalid', 'false');
    if (!EMAIL.test(email)) { msg.textContent = 'Please enter a valid email address.'; msg.className = 'nl-msg err'; form.email.setAttribute('aria-invalid', 'true'); form.email.focus(); return; }
    if (!topics.length) { msg.textContent = 'Choose at least one briefing.'; msg.className = 'nl-msg err'; return; }
    LS.set('newsletter', { topics, subscribedAt: new Date().toISOString(), demo: true }); // email intentionally NOT stored
    msg.textContent = `Subscribed (demo) to ${topics.join(', ')}. No email was sent.`;
    msg.className = 'nl-msg ok';
    form.email.value = '';
    toast('Subscription saved (demo only)');
  }
  function onContact(form) {
    const msg = $('.nl-msg', form);
    const bad = ['name', 'email', 'message'].find((f) => !form[f].value.trim() || (f === 'email' && !EMAIL.test(form[f].value.trim())) || (f === 'message' && form[f].value.trim().length < 10));
    $$('input, textarea', form).forEach((i) => i.setAttribute('aria-invalid', 'false'));
    if (bad) { form[bad].setAttribute('aria-invalid', 'true'); form[bad].focus(); msg.textContent = bad === 'email' ? 'Please enter a valid email address.' : bad === 'message' ? 'Message must be at least 10 characters.' : 'Please enter your name.'; msg.className = 'nl-msg err'; return; }
    form.reset(); msg.textContent = 'Message validated. This demo does not transmit messages.'; msg.className = 'nl-msg ok';
    toast('Message validated (demo)');
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    toast('Link copied to clipboard');
  }

  /* ------------------------------ live simulation (demo) ------------------------------ */
  const SIM = [
    ['Demo: storage vendor publishes firmware advisory', 'Infrastructure', 'info'],
    ['Demo: routing monitor reports resolved prefix hijack alert', 'Networking', 'warning'],
    ['Demo: cloud provider marks regional incident as resolved', 'Cloud', 'info'],
    ['Demo: CERT adds entry to exploited-vulnerability list', 'Cybersecurity', 'critical'],
    ['Demo: open-source project releases security patch', 'Dev', 'info']
  ];
  function liveSim() {
    if (!TW.CONFIG.liveSimulation) return;
    let i = 0;
    setInterval(() => {
      if (i >= SIM.length || document.hidden) return;
      const [text, category, level] = SIM[i++];
      const item = { text, category, level, time: new Date().toISOString(), articleId: null };
      TW.Data.store.live.unshift(item);
      $$('[data-live-list]').forEach((ol) => { ol.insertAdjacentHTML('afterbegin', TW.PageHelpers.liveItem(item).replace('class="lv', 'class="lv new lv')); });
    }, 45000);
  }

  /* ------------------------------ events ------------------------------ */
  function bind() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      const bm = t.closest('[data-bookmark]');
      if (bm) {
        const on = TW.Bookmarks.toggle(bm.dataset.bookmark);
        $$(`[data-bookmark="${bm.dataset.bookmark}"]`).forEach((b) => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); const s = $('span', b); if (s) s.textContent = on ? 'Saved' : 'Save'; if (b.classList.contains('bm-btn')) b.setAttribute('aria-label', (on ? 'Remove bookmark' : 'Bookmark') + b.getAttribute('aria-label').replace(/^(Remove bookmark|Bookmark)/, '')); });
        toast(on ? 'Saved to your reading list' : 'Removed from your reading list');
        return;
      }
      if (t.closest('[data-share]')) {
        const a = TW.Data.get(t.closest('[data-share]').dataset.share);
        if (navigator.share) navigator.share({ title: a.title, text: a.summary, url: location.href }).catch(() => {});
        else copy(location.href);
        return;
      }
      if (t.closest('[data-copy-link]')) { copy(location.href); return; }
      if (t.closest('[data-print]')) { window.print(); return; }
      if (t.closest('[data-feed-filter]')) {
        const b = t.closest('[data-feed-filter]'), sec = b.closest('.latest');
        $$('[data-feed-filter]', sec).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
        const f = $('[data-feed]', sec); f.dataset.filter = b.dataset.feedFilter; TW.PageHelpers.renderFeed(f);
        return;
      }
      if (t.closest('[data-load-more]')) { const f = $('[data-feed]', t.closest('.latest')); TW.PageHelpers.renderFeed(f, true); return; }
      if (t.closest('[data-clear-bookmarks]')) { TW.Bookmarks.clear(); route(); toast('Reading list cleared'); return; }
      if (t.closest('[data-clear-local]')) { LS.clear(); updateBookmarkCount(); setTheme('light', true); toast('All TECHWIRE data removed from this browser'); return; }
      const anchor = t.closest('a[data-anchor]');
      if (anchor) { e.preventDefault(); const el = document.getElementById(anchor.getAttribute('href').slice(1)); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); } return; }
      if (t.closest('#more-btn')) { const b = $('#more-btn'); const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open); $('#more-menu').hidden = !open; if (open) $('#more-menu a').focus(); return; }
      if (!t.closest('#more-menu')) closeMore();
      if (t.closest('[data-search-open]')) { e.preventDefault(); openSearch(); return; }
      if (t.id === 'search' || t.closest('[data-search-close]')) { closeSearch(); return; }
      if (t.closest('[data-sitem]')) { const q = $('#search-q').value.trim(); if (q) remember(q); closeSearch(); return; }
    });
    document.addEventListener('submit', (e) => {
      const f = e.target;
      if (f.matches('[data-newsletter]')) { e.preventDefault(); onNewsletter(f); }
      else if (f.matches('[data-contact]')) { e.preventDefault(); onContact(f); }
      else if (f.matches('[data-search-form]')) { e.preventDefault(); const q = f.q.value.trim(); if (q) { remember(q); closeSearch(); location.hash = '#/search?q=' + encodeURIComponent(q); } }
    });
    $('#search-q').addEventListener('input', renderSuggest);
    $('#search-q').addEventListener('keydown', (e) => {
      const items = $$('#search-results [data-sitem]');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        sIdx = (sIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach((x, i) => x.classList.toggle('kbd', i === sIdx));
        items[sIdx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && sIdx >= 0 && items[sIdx]) { e.preventDefault(); items[sIdx].click(); }
    });
    document.addEventListener('keydown', (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if (e.key === '/' && !typing) { e.preventDefault(); openSearch(); }
      else if (e.key === 'Escape') { if (closeSearch()) return; closeMore(); if (document.body.classList.contains('menu-open')) { closeMenu(); $('#menu-btn').focus(); } }
    });
    $('#menu-btn').addEventListener('click', () => { const open = !document.body.classList.contains('menu-open'); document.body.classList.toggle('menu-open', open); $('#menu-btn').setAttribute('aria-expanded', open); if (open) $('#drawer a').focus(); });
    $('#drawer-close').addEventListener('click', closeMenu);
    $('#scrim').addEventListener('click', closeMenu);
    $('#theme-btn').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
    $('#to-top').addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); $('#main').focus({ preventScroll: true }); });
    $('#ticker-pause').addEventListener('click', (e) => { const b = e.currentTarget; const paused = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', paused); b.setAttribute('aria-label', paused ? 'Resume ticker' : 'Pause ticker'); $('#breaking').classList.toggle('paused', paused); b.textContent = paused ? '▶' : '❚❚'; });
    let raf = 0;
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; progress(); }); }, { passive: true });
    window.addEventListener('hashchange', route);
  }

  /* ------------------------------ boot ------------------------------ */
  async function boot() {
    setTheme(LS.get('theme', 'light'), true);
    mastheadDate();
    bind();
    updateBookmarkCount();
    try {
      await TW.Data.load();
    } catch (e) {
      $('#main').innerHTML = '<div class="empty-block"><h1 class="desk-title">Content could not be loaded</h1><p>Check that the /data folder is present, or run a local web server (see README).</p></div>';
      return;
    }
    $('#data-source').textContent = TW.Data.store.source === 'api' ? 'Live API' : 'Demo data';
    buildTicker();
    route();
    liveSim();
    document.documentElement.classList.remove('loading');
  }

  TW.App = { hydrate, mountMap, toast, route };
  document.addEventListener('DOMContentLoaded', boot);
})();
