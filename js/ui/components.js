/* ==========================================================================
   TECHWIRE — UI components (pure render functions returning HTML strings)
   ========================================================================== */
(function () {
  'use strict';
  const TW = window.TW;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------ icons ------------------------------ */
  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h0M3 12h0M3 18h0"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h0"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h0"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'
  };
  const icon = (n, cls) => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[n] || ''}</svg>`;

  /* ------------------------------ time ------------------------------ */
  const hhmm = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const longDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const ago = (iso) => {
    const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 6e4));
    if (m < 1) return 'just now';
    if (m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago');
    const h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    const d = Math.round(h / 24);
    return d + (d === 1 ? ' day ago' : ' days ago');
  };
  const shortAgo = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 6e4); return m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : Math.round(m / 1440) + 'd'; };

  /* ------------------------------ mapping ------------------------------ */
  const CAT_SECTION = { Cybersecurity: 'cyber', Networking: 'networks', Infrastructure: 'infra', Cloud: 'cloud', AI: 'ai', Hardware: 'hardware', Software: 'software', Dev: 'dev', Technology: 'news' };
  const catUrl = (c) => '#/section/' + (CAT_SECTION[c] || 'news');
  const catLabel = (c) => (c === 'Technology' ? 'Technology' : c);
  const typeTag = (t) => `<span class="type type-${String(t).toLowerCase().replace(/\s+/g, '-')}">${esc(t)}</span>`;
  const sevTag = (a) => (a.severity ? `<span class="sev sev-${a.severity.toLowerCase()}">${esc(a.severity)}</span>` : '');

  function kicker(a, opts) {
    const o = opts || {};
    const parts = [];
    if (a.isBreaking && !o.noBreaking) parts.push('<span class="live-dot" aria-hidden="true"></span><span class="kbreak">Breaking</span>');
    parts.push(`<a class="kcat" href="${catUrl(a.category)}">${esc(catLabel(a.category))}</a>`);
    if (a.type !== 'News') parts.push(typeTag(a.type));
    else if (o.showSub && a.subcategory) parts.push(`<span class="ksub">${esc(a.subcategory)}</span>`);
    return `<div class="kicker">${parts.join('')}</div>`;
  }
  const meta = (a, opts) => {
    const o = opts || {};
    const au = TW.Data.author(a.author);
    const bits = [];
    if (!o.noAuthor) bits.push(`<a href="#/author/${esc(au.id)}">${esc(au.name)}</a>`);
    bits.push(`<time datetime="${esc(a.date)}" title="${esc(longDate(a.date))} ${hhmm(a.date)}">${ago(a.date)}</time>`);
    bits.push(`${a.readingTime} min read`);
    return `<p class="meta">${bits.join('<span class="sep" aria-hidden="true">·</span>')}</p>`;
  };
  const media = (a, cls) => `<div class="media ${cls || ''}" data-art="${esc(a.id)}"><span class="visually-hidden">${esc(a.imageAlt)}</span></div>`;
  const bmBtn = (a) => { const on = TW.Bookmarks && TW.Bookmarks.has(a.id); return `<button class="bm-btn${on ? ' on' : ''}" type="button" data-bookmark="${esc(a.id)}" aria-pressed="${on}" aria-label="${on ? 'Remove bookmark' : 'Bookmark'}: ${esc(a.title)}">${icon('bookmark')}</button>`; };

  /* ------------------------------ story cards ------------------------------ */
  function story(a, v) {
    const url = a.url;
    switch (v) {
      case 'lead':
        return `<article class="story s-lead"><a class="media-link" href="${url}" tabindex="-1" aria-hidden="true">${media(a, 'r16x9')}</a>${kicker(a, { showSub: true })}<h2 class="hl hl-xl"><a href="${url}">${esc(a.title)}</a></h2><p class="dek">${esc(a.summary)}</p>${a.cve ? cveLine(a) : ''}${meta(a)}</article>`;
      case 'second':
        return `<article class="story s-second"><a class="media-link" href="${url}" tabindex="-1" aria-hidden="true">${media(a, 'r16x9')}</a>${kicker(a)}<h3 class="hl hl-lg"><a href="${url}">${esc(a.title)}</a></h3><p class="dek sm">${esc(a.summary)}</p>${meta(a)}</article>`;
      case 'thumb':
        return `<article class="story s-thumb"><div>${kicker(a, { noBreaking: true })}<h3 class="hl hl-sm"><a href="${url}">${esc(a.title)}</a></h3>${meta(a, { noAuthor: true })}</div><a class="media-link" href="${url}" tabindex="-1" aria-hidden="true">${media(a, 'r1x1')}</a></article>`;
      case 'compact':
        return `<article class="story s-compact">${kicker(a, { noBreaking: true })}<h3 class="hl hl-sm"><a href="${url}">${esc(a.title)}</a></h3>${meta(a, { noAuthor: true })}</article>`;
      case 'card':
        return `<article class="story s-card"><a class="media-link" href="${url}" tabindex="-1" aria-hidden="true">${media(a, 'r16x9')}</a><div class="s-body">${kicker(a)}<h3 class="hl hl-md"><a href="${url}">${esc(a.title)}</a></h3><p class="dek sm">${esc(a.summary)}</p><div class="s-foot">${meta(a, { noAuthor: true })}${bmBtn(a)}</div></div></article>`;
      case 'row':
        return `<article class="story s-row"><a class="media-link" href="${url}" tabindex="-1" aria-hidden="true">${media(a, 'r16x9')}</a><div class="s-body">${kicker(a, { showSub: true })}<h3 class="hl hl-md"><a href="${url}">${esc(a.title)}</a></h3><p class="dek sm">${esc(a.summary)}</p><div class="s-foot">${meta(a)}${bmBtn(a)}</div></div></article>`;
      default:
        return `<article class="story s-text">${kicker(a)}<h3 class="hl hl-md"><a href="${url}">${esc(a.title)}</a></h3><p class="dek sm">${esc(a.summary)}</p>${meta(a)}</article>`;
    }
  }
  const cveLine = (a) => `<p class="cve-line"><span class="cve-id">${esc(a.cve)}</span>${a.cvss ? `<span class="cvss">CVSS ${a.cvss.toFixed(1)}</span>` : ''}${sevTag(a)}</p>`;

  function feedItem(a) {
    return `<article class="feed-item"><time class="fi-time" datetime="${esc(a.date)}">${hhmm(a.date)}</time><div class="fi-body">${kicker(a, { noBreaking: false })}<h3 class="hl hl-md"><a href="${a.url}">${esc(a.title)}</a></h3><p class="dek sm">${esc(a.summary)}</p><div class="s-foot"><p class="meta">${esc(TW.Data.author(a.author).name)}<span class="sep">·</span>${a.readingTime} min read</p>${bmBtn(a)}</div></div></article>`;
  }

  function cveCard(a) {
    return `<article class="cve-card sev-b-${(a.severity || 'medium').toLowerCase()}"><div class="cve-top"><span class="cc-label">Security</span>${sevTag(a)}</div><h3 class="hl hl-sm"><a href="${a.url}">${esc(a.title)}</a></h3><dl class="cve-dl">${a.cve ? `<div><dt>CVE</dt><dd class="mono">${esc(a.cve)}</dd></div>` : ''}${a.cvss ? `<div><dt>CVSS</dt><dd class="mono cvss-v">${a.cvss.toFixed(1)}</dd></div>` : ''}<div><dt>Type</dt><dd>${esc(a.subcategory)}</dd></div></dl><a class="more" href="${a.url}">Read analysis ${icon('arrow')}</a></article>`;
  }

  const secHead = (title, opts) => {
    const o = opts || {};
    return `<header class="sec-head${o.cls ? ' ' + o.cls : ''}"><h2 class="sec-title">${o.dot ? '<span class="live-dot" aria-hidden="true"></span>' : ''}${o.href ? `<a href="${o.href}">${esc(title)}</a>` : esc(title)}</h2>${o.badge ? `<span class="badge-demo">${esc(o.badge)}</span>` : ''}${o.links ? `<nav class="sec-links" aria-label="${esc(title)} topics">${o.links}</nav>` : ''}${o.more ? `<a class="sec-more" href="${o.more}">${esc(o.moreLabel || 'More')} ${icon('arrow')}</a>` : ''}</header>`;
  };

  function newsletterBox(id, variant) {
    const topics = ['Cybersecurity', 'Networking', 'Infrastructure', 'Cloud', 'AI', 'Hardware', 'Weekly Digest'];
    return `<section class="newsletter${variant ? ' nl-' + variant : ''}" aria-labelledby="${id}-t"><p class="nl-eyebrow">${icon('mail')} Newsletter</p><h2 id="${id}-t" class="nl-title">TECHWIRE Daily</h2><p class="nl-desc">Get the most important technology and cybersecurity stories in your inbox.</p>
      <form class="nl-form" data-newsletter novalidate><label class="visually-hidden" for="${id}-email">Your email</label><div class="nl-row"><input id="${id}-email" name="email" type="email" autocomplete="email" placeholder="Your email" required aria-describedby="${id}-msg"><button class="btn btn-primary" type="submit">Subscribe</button></div>
      <fieldset class="nl-topics"><legend>Choose your briefings</legend>${topics.map((t, i) => `<label class="chk"><input type="checkbox" name="topics" value="${t}" ${i < 3 || t === 'Weekly Digest' ? 'checked' : ''}><span>${t}</span></label>`).join('')}</fieldset>
      <p class="nl-msg" id="${id}-msg" role="status" aria-live="polite"></p><p class="nl-note">Demo form: validated in the browser only - no email is sent or stored on a server.</p></form></section>`;
  }

  const numbered = (list, valueFn) => `<ol class="numbered">${list.map((a, i) => `<li><span class="num" aria-hidden="true">${i + 1}</span><div><a class="hl hl-sm" href="${a.url}">${esc(a.title)}</a><p class="meta">${valueFn(a)}</p></div></li>`).join('')}</ol>`;

  function statusRow(s) {
    const lbl = { operational: 'Operational', degraded: 'Partial issues', outage: 'Major outage', maintenance: 'Maintenance' }[s.status] || s.status;
    return `<li class="st-row"><span class="st-name">${esc(s.service)}</span><span class="st st-${s.status}"><span class="st-dot" aria-hidden="true"></span>${lbl}</span></li>`;
  }

  TW.UI = { esc, icon, hhmm, longDate, ago, shortAgo, catUrl, catLabel, CAT_SECTION, typeTag, sevTag, kicker, meta, media, story, feedItem, cveCard, cveLine, secHead, newsletterBox, numbered, statusRow, bmBtn };
})();
