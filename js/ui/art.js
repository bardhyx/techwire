/* ==========================================================================
   TECHWIRE — Editorial SVG artwork
   - cover(article): deterministic, category-specific illustration used in
     place of photography (no image downloads, ~2 KB each, cached)
   - diagram(key): technical diagrams for TECH EXPLAINED
   - worldMap(data): GLOBAL TECHNOLOGY INFRASTRUCTURE demo visualization
   ========================================================================== */
(function () {
  'use strict';
  const TW = window.TW;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  const PAL = {
    Cybersecurity: ['#101826', '#1c2a44', '#e5484d', '#7dd3fc'],
    Networking:    ['#0d1b2a', '#14304f', '#22b8d6', '#9ad8ea'],
    Infrastructure:['#141821', '#252c3a', '#f2a93b', '#c9d3e3'],
    Cloud:         ['#0f1a2e', '#1b3358', '#5aa9ff', '#d7e8ff'],
    AI:            ['#15121f', '#2a2140', '#9b8cff', '#e2dcff'],
    Hardware:      ['#131313', '#2a2a2a', '#39c38b', '#d9f5e9'],
    Software:      ['#111a1a', '#1d2f30', '#4fd1c5', '#d4f4f1'],
    Dev:           ['#12151c', '#232a38', '#f0b429', '#f7e7b5'],
    Technology:    ['#10141b', '#20283a', '#3d7bff', '#d8e3ff'],
    Explained:     ['#0f1622', '#1a2740', '#22b8d6', '#d8f3fa']
  };

  const motifs = {
    Cybersecurity(r, p) {
      let s = '';
      for (let y = 0; y < 9; y++) for (let x = 0; x < 16; x++) {
        const cx = x * 42 + (y % 2) * 21, cy = y * 38;
        s += `<path d="M${cx} ${cy - 16}l14 8v16l-14 8l-14-8v-16z" fill="none" stroke="${p[3]}" stroke-opacity="${(0.05 + r() * 0.12).toFixed(2)}"/>`;
      }
      s += `<g transform="translate(470 170)"><path d="M0 -92 L78 -62 V6 C78 60 34 92 0 108 C-34 92 -78 60 -78 6 V-62 Z" fill="${p[1]}" stroke="${p[3]}" stroke-width="2.5"/>`;
      s += `<rect x="-26" y="-6" width="52" height="42" rx="6" fill="${p[2]}"/><path d="M-16 -6 V-24 A16 16 0 0 1 16 -24 V-6" fill="none" stroke="${p[2]}" stroke-width="7"/></g>`;
      return s;
    },
    Networking(r, p) {
      const n = [];
      for (let i = 0; i < 22; i++) n.push([40 + r() * 560, 30 + r() * 300]);
      let s = '';
      n.forEach((a, i) => n.slice(i + 1).forEach((b) => { const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d < 150) s += `<line x1="${a[0].toFixed(0)}" y1="${a[1].toFixed(0)}" x2="${b[0].toFixed(0)}" y2="${b[1].toFixed(0)}" stroke="${p[3]}" stroke-opacity="${(0.55 - d / 350).toFixed(2)}" stroke-width="1.2"/>`; }));
      n.forEach((a, i) => (s += `<circle cx="${a[0].toFixed(0)}" cy="${a[1].toFixed(0)}" r="${i % 5 === 0 ? 7 : 3.5}" fill="${i % 5 === 0 ? p[2] : p[3]}"/>`));
      return s;
    },
    Infrastructure(r, p) {
      let s = '';
      for (let k = 0; k < 4; k++) {
        const x = 110 + k * 120;
        s += `<rect x="${x}" y="40" width="96" height="280" rx="4" fill="${p[1]}" stroke="${p[3]}" stroke-opacity=".35"/>`;
        for (let u = 0; u < 12; u++) {
          const y = 52 + u * 22;
          s += `<rect x="${x + 8}" y="${y}" width="80" height="16" rx="2" fill="${p[0]}" stroke="${p[3]}" stroke-opacity=".18"/>`;
          s += `<circle cx="${x + 18}" cy="${y + 8}" r="2.2" fill="${r() > 0.3 ? '#39c38b' : p[2]}"/>`;
          s += `<rect x="${x + 30}" y="${y + 6}" width="${(20 + r() * 44).toFixed(0)}" height="3" fill="${p[3]}" fill-opacity=".35"/>`;
        }
      }
      return s;
    },
    Cloud(r, p) {
      let s = '';
      for (let i = 0; i < 7; i++) s += `<path d="M${-20 + i * 10} ${250 - i * 22} C 160 ${170 - i * 20}, 320 ${300 - i * 30}, 660 ${190 - i * 18}" fill="none" stroke="${p[3]}" stroke-opacity="${0.08 + i * 0.03}" stroke-width="1.5"/>`;
      s += `<path d="M230 230 a58 58 0 0 1 24 -110 a82 82 0 0 1 150 -18 a64 64 0 0 1 60 128 z" fill="${p[1]}" stroke="${p[2]}" stroke-width="3"/>`;
      for (let i = 0; i < 5; i++) s += `<circle cx="${270 + i * 40}" cy="200" r="5" fill="${p[2]}"/>`;
      return s;
    },
    AI(r, p) {
      const layers = [4, 7, 7, 5, 2], pts = [];
      layers.forEach((c, li) => { const x = 110 + li * 105; pts.push(Array.from({ length: c }, (_, i) => [x, 180 + (i - (c - 1) / 2) * 40])); });
      let s = '';
      for (let l = 0; l < pts.length - 1; l++) pts[l].forEach((a) => pts[l + 1].forEach((b) => (s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${p[3]}" stroke-opacity="${(0.06 + r() * 0.22).toFixed(2)}"/>`)));
      pts.flat().forEach((a, i) => (s += `<circle cx="${a[0]}" cy="${a[1]}" r="8" fill="${i % 3 ? p[1] : p[2]}" stroke="${p[3]}" stroke-opacity=".6"/>`));
      return s;
    },
    Hardware(r, p) {
      let s = `<rect x="200" y="60" width="240" height="240" rx="10" fill="${p[1]}" stroke="${p[3]}" stroke-opacity=".5"/>`;
      for (let i = 0; i < 12; i++) { const o = 72 + i * 19; s += `<rect x="${o}" y="42" width="6" height="18" fill="${p[3]}" fill-opacity=".45"/><rect x="${o}" y="300" width="6" height="18" fill="${p[3]}" fill-opacity=".45"/><rect x="182" y="${o}" width="18" height="6" fill="${p[3]}" fill-opacity=".45"/><rect x="440" y="${o}" width="18" height="6" fill="${p[3]}" fill-opacity=".45"/>`; }
      for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) s += `<rect x="${226 + x * 32}" y="${86 + y * 32}" width="26" height="26" rx="3" fill="${r() > 0.72 ? p[2] : p[0]}" fill-opacity="${r() > 0.72 ? 0.9 : 0.8}"/>`;
      return s;
    },
    Software(r, p) {
      let s = `<rect x="120" y="50" width="400" height="260" rx="10" fill="${p[1]}" stroke="${p[3]}" stroke-opacity=".3"/><rect x="120" y="50" width="400" height="28" rx="10" fill="${p[0]}"/>`;
      for (let i = 0; i < 3; i++) s += `<circle cx="${140 + i * 16}" cy="64" r="4.5" fill="${p[3]}" fill-opacity=".35"/>`;
      for (let i = 0; i < 9; i++) { const ind = [0, 20, 20, 40, 40, 20, 0, 20, 0][i]; s += `<rect x="${146 + ind}" y="${96 + i * 22}" width="${(60 + r() * 220).toFixed(0)}" height="8" rx="4" fill="${i % 4 === 1 ? p[2] : p[3]}" fill-opacity="${i % 4 === 1 ? 0.9 : 0.3}"/>`; }
      return s;
    },
    Dev(r, p) { return motifs.Software(r, p) + `<text x="455" y="290" font-family="monospace" font-size="54" fill="${p[2]}" fill-opacity=".85">{ }</text>`; },
    Technology(r, p) {
      let s = '';
      for (let i = 0; i < 14; i++) {
        let d = `M0 ${80 + i * 16}`;
        for (let x = 0; x <= 640; x += 40) d += ` L${x} ${(80 + i * 16 + Math.sin((x + i * 30) / 70) * (18 + r() * 14)).toFixed(0)}`;
        s += `<path d="${d}" fill="none" stroke="${i === 7 ? p[2] : p[3]}" stroke-opacity="${i === 7 ? 1 : 0.14}" stroke-width="${i === 7 ? 3 : 1.4}"/>`;
      }
      return s;
    }
  };
  motifs.Explained = motifs.Networking;

  const cache = new Map();
  function cover(a, opts) {
    const key = a.category + ':' + a.id;
    if (cache.has(key)) return cache.get(key);
    const p = PAL[a.category] || PAL.Technology;
    const r = rng(String(a.id).split('').reduce((h, c) => h * 31 + c.charCodeAt(0), 7));
    const label = (a.subcategory || a.category || '').toUpperCase();
    const svg = `<svg class="art" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(a.imageAlt || 'Editorial illustration')}" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g${a.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient></defs>
<rect width="640" height="360" fill="url(#g${a.id})"/>${(motifs[a.category] || motifs.Technology)(r, p)}
<rect x="0" y="0" width="640" height="360" fill="none" stroke="${p[3]}" stroke-opacity=".08"/>
<text x="20" y="340" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="2" fill="${p[3]}" fill-opacity=".75">TECHWIRE · ${esc(label)} · ILLUSTRATION</text></svg>`;
    cache.set(key, svg);
    return svg;
  }

  /* ------------------------------ Explainer diagrams ------------------------------ */
  // compact DSL: nodes [id, x, y, label, kind], edges [from, to, label, style]
  function box(n) {
    const [, x, y, label, kind] = n;
    const w = Math.max(92, label.length * 7.4 + 24), h = 40;
    const cls = 'd-' + (kind || 'node');
    return `<g class="${cls}"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${kind === 'cloud' ? 20 : 6}"/><text x="${x}" y="${y + 4.5}" text-anchor="middle">${esc(label)}</text></g>`;
  }
  function edge(nodes, e) {
    const a = nodes.find((n) => n[0] === e[0]), b = nodes.find((n) => n[0] === e[1]);
    const dx = b[1] - a[1], dy = b[2] - a[2], len = Math.hypot(dx, dy) || 1;
    const pad = (n) => (Math.abs(dy / len) > 0.6 ? 24 : Math.max(46, n[3].length * 3.7 + 12));
    const x1 = a[1] + (dx / len) * pad(a), y1 = a[2] + (dy / len) * pad(a) * (Math.abs(dy / len) > 0.6 ? 1 : 0.4);
    const x2 = b[1] - (dx / len) * pad(b), y2 = b[2] - (dy / len) * pad(b) * (Math.abs(dy / len) > 0.6 ? 1 : 0.4);
    let s = `<line class="d-edge${e[3] ? ' d-' + e[3] : ''}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" marker-end="url(#dArrow)"/>`;
    if (e[2]) s += `<text class="d-elabel" x="${((x1 + x2) / 2).toFixed(1)}" y="${((y1 + y2) / 2 - 7).toFixed(1)}" text-anchor="middle">${esc(e[2])}</text>`;
    return s;
  }
  const D = {
    bgp: { n: [['a', 110, 70, 'AS 64500 · Origin', 'accent'], ['b', 330, 70, 'AS 64510 · Transit'], ['c', 550, 70, 'AS 64520 · Transit'], ['d', 330, 220, 'AS 64530 · ISP'], ['u', 550, 220, 'Users', 'muted']],
           e: [['a', 'b', '203.0.113.0/24'], ['b', 'c', 'path: 64510 64500'], ['b', 'd', 'announce'], ['d', 'u', 'traffic'], ['c', 'd', 'alt path', 'dash']], cap: 'Each network announces reachable prefixes; neighbours prepend their AS number and pass the route on.' },
    dns: { n: [['c', 90, 160, 'Client', 'accent'], ['r', 250, 160, 'Recursive resolver'], ['root', 470, 50, 'Root server'], ['tld', 470, 160, '.com TLD server'], ['auth', 470, 270, 'Authoritative NS']],
           e: [['c', 'r', '1 query'], ['r', 'root', '2'], ['r', 'tld', '3'], ['r', 'auth', '4'], ['r', 'c', '', 'dash']], cap: 'The resolver walks the hierarchy (root → TLD → authoritative) and caches the answer for its TTL.' },
    https: { n: [['c', 110, 70, 'Browser', 'accent'], ['s', 530, 70, 'Server'], ['ca', 530, 230, 'Certificate authority', 'muted'], ['k', 110, 230, 'Session keys', 'ok']],
             e: [['c', 's', 'ClientHello'], ['s', 'c', 'ServerHello + certificate'], ['ca', 's', 'signs cert', 'dash'], ['c', 'k', 'ECDHE key exchange']], cap: 'TLS authenticates the server with a CA-signed certificate and derives symmetric session keys.' },
    zeroday: { n: [['a', 80, 150, 'Flaw introduced', 'muted'], ['b', 220, 150, 'Exploited', 'danger'], ['c', 360, 150, 'Reported'], ['d', 490, 150, 'Fix released', 'ok'], ['e', 600, 150, 'Patched']],
               e: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e']], cap: 'The zero-day window runs from exploitation to fix; real risk continues until customers patch.' },
    ransomware: { n: [['a', 80, 90, 'Initial access', 'danger'], ['b', 250, 90, 'Privilege escalation'], ['c', 430, 90, 'Lateral movement'], ['d', 430, 230, 'Data exfiltration'], ['e', 230, 230, 'Encryption', 'danger'], ['f', 70, 230, 'Extortion', 'muted']],
                  e: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f']], cap: 'Most modern ransomware is a hands-on intrusion; defenders can disrupt each stage.' },
    asn: { n: [['a', 130, 90, 'AS 64496 · Enterprise', 'accent'], ['p1', 420, 60, 'AS 64501 · ISP A'], ['p2', 420, 180, 'AS 64502 · ISP B'], ['i', 600, 120, 'Internet', 'cloud']],
           e: [['a', 'p1', 'eBGP'], ['a', 'p2', 'eBGP'], ['p1', 'i'], ['p2', 'i']], cap: 'A multi-homed network uses its own ASN and prefixes to announce routes through two providers.' },
    ipsec: { n: [['l1', 80, 170, '10.1.0.0/24', 'muted'], ['g1', 220, 170, 'Gateway A', 'accent'], ['i', 360, 170, 'Internet', 'cloud'], ['g2', 500, 170, 'Gateway B', 'accent'], ['l2', 610, 170, '10.2.0.0/24', 'muted']],
             e: [['l1', 'g1'], ['g1', 'i', 'ESP'], ['i', 'g2', 'ESP'], ['g2', 'l2']], cap: 'IKE authenticates the gateways; ESP encrypts traffic between the protected networks.', tunnel: true },
    siem: { n: [['f', 90, 60, 'Firewalls', 'muted'], ['s', 90, 140, 'Servers', 'muted'], ['id', 90, 220, 'Identity', 'muted'], ['cl', 90, 290, 'Cloud', 'muted'], ['siem', 340, 175, 'SIEM · correlate', 'accent'], ['a', 560, 120, 'Alerts', 'danger'], ['soar', 560, 230, 'SOAR / response', 'ok']],
            e: [['f', 'siem'], ['s', 'siem'], ['id', 'siem'], ['cl', 'siem'], ['siem', 'a'], ['a', 'soar']], cap: 'Logs are collected, normalised and correlated into alerts for analysts and automation.' },
    soc: { n: [['t', 110, 70, 'Tier 1 · triage'], ['i', 330, 70, 'Tier 2 · investigate'], ['r', 550, 70, 'Incident response', 'danger'], ['de', 330, 220, 'Detection engineering', 'accent'], ['tools', 110, 220, 'SIEM · EDR · NDR', 'muted']],
           e: [['tools', 't', 'alerts'], ['t', 'i', 'escalate'], ['i', 'r', 'contain'], ['r', 'de', 'lessons', 'dash'], ['de', 'tools', 'tune', 'dash']], cap: 'A SOC combines people, process and tooling in a continuous detect-respond-improve loop.' },
    roaming: { n: [['ap1', 150, 90, 'AP 1 · ch 36'], ['ap2', 490, 90, 'AP 2 · ch 149'], ['c', 320, 220, 'Client', 'accent'], ['w', 320, 60, 'WLC / RADIUS', 'muted']],
               e: [['c', 'ap1', 'weak RSSI', 'dash'], ['c', 'ap2', 'reassociate (11r)'], ['ap2', 'w', 'FT keys'], ['ap1', 'w']], cap: 'The client decides to roam; 802.11k/v/r help it choose quickly and re-authenticate fast.' },
    dnsfail: { n: [['c', 90, 160, 'Client', 'accent'], ['r', 290, 160, 'Resolver cache'], ['a1', 520, 90, 'Auth NS 1', 'danger'], ['a2', 520, 230, 'Auth NS 2 (other provider)', 'ok']],
               e: [['c', 'r', 'query'], ['r', 'a1', 'timeout', 'dash'], ['r', 'a2', 'answer']], cap: 'Independent authoritative providers and sensible TTLs keep names resolvable when one fails.' },
    leafspine: { n: [['s1', 220, 60, 'Spine 1', 'accent'], ['s2', 420, 60, 'Spine 2', 'accent'], ['l1', 110, 200, 'Leaf 1'], ['l2', 250, 200, 'Leaf 2'], ['l3', 390, 200, 'Leaf 3'], ['l4', 530, 200, 'Leaf 4'], ['sv', 320, 285, 'Servers · VXLAN/EVPN overlay', 'muted']],
                 e: [['l1', 's1'], ['l1', 's2'], ['l2', 's1'], ['l2', 's2'], ['l3', 's1'], ['l3', 's2'], ['l4', 's1'], ['l4', 's2']], cap: 'Every leaf connects to every spine: any server is at most two switch hops away.' }
  };
  function diagram(key) {
    const d = D[key];
    if (!d) return '';
    let s = `<svg class="diagram" viewBox="0 0 680 320" role="img" aria-label="${esc(d.cap)}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="dArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-arrow"/></marker></defs>`;
    if (d.tunnel) s += '<path class="d-tunnel" d="M220 140 Q360 60 500 140"/><text class="d-elabel" x="360" y="92" text-anchor="middle">Encrypted IPsec tunnel</text>';
    s += d.e.map((e) => edge(d.n, e)).join('') + d.n.map(box).join('') + '</svg>';
    return { svg: s, caption: d.cap };
  }

  /* ------------------------------ World map ------------------------------ */
  const LAND = [
    [[-168, 65], [-140, 70], [-95, 72], [-80, 63], [-62, 58], [-55, 48], [-67, 44], [-76, 35], [-81, 25], [-97, 26], [-105, 20], [-95, 16], [-83, 9], [-78, 8], [-88, 14], [-106, 23], [-116, 31], [-124, 40], [-125, 49], [-135, 58], [-152, 60], [-165, 61]],
    [[-52, 60], [-22, 70], [-18, 80], [-60, 83], [-72, 77]],
    [[-80, 9], [-60, 11], [-50, 0], [-35, -7], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-72, -50], [-75, -40], [-71, -18], [-81, -5]],
    [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [10, 58], [5, 62], [15, 69], [28, 71], [40, 67], [45, 55], [40, 45], [28, 41], [22, 36], [15, 38], [12, 44], [8, 44], [3, 43], [-5, 36]],
    [[-5, 50], [1, 51], [-2, 56], [-5, 58], [-6, 54]],
    [[-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 11], [40, -3], [40, -15], [35, -25], [20, -35], [17, -29], [12, -17], [13, -5], [8, 4], [-8, 4], [-15, 11]],
    [[28, 41], [40, 45], [45, 55], [40, 67], [60, 70], [80, 73], [110, 76], [140, 72], [180, 68], [178, 62], [160, 58], [142, 50], [135, 43], [127, 35], [122, 30], [120, 22], [108, 18], [105, 10], [100, 13], [98, 8], [93, 20], [80, 15], [77, 8], [72, 20], [66, 25], [57, 25], [56, 24], [52, 17], [43, 13], [36, 30], [35, 36]],
    [[130, 31], [135, 34], [140, 36], [142, 40], [141, 45], [139, 38], [132, 33]],
    [[95, 5], [105, -6], [115, -8], [120, -9], [125, -8], [118, -3], [110, 1], [100, 3]],
    [[114, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [132, -32], [115, -34]]
  ];
  const W = 1000, H = 460, LAT0 = 78, LAT1 = -52;
  const proj = (lon, lat) => [((lon + 180) / 360) * W, ((LAT0 - lat) / (LAT0 - LAT1)) * H];
  const TYPE = { cloud: 'Cloud region', ix: 'Internet exchange', dc: 'Datacenter hub', cable: 'Cable landing' };

  function worldMap(m, active) {
    const on = active || { cloud: true, ix: true, dc: true, cable: true };
    let s = `<svg class="worldmap" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="mapTitle mapDesc" xmlns="http://www.w3.org/2000/svg"><title id="mapTitle">Global technology infrastructure - demo visualization</title><desc id="mapDesc">Stylised map with demo positions of cloud regions, internet exchanges, datacenter hubs and cable landings.</desc>`;
    for (let lon = -180; lon <= 180; lon += 30) { const [x] = proj(lon, 0); s += `<line class="m-grid" x1="${x}" y1="0" x2="${x}" y2="${H}"/>`; }
    for (let lat = -40; lat <= 70; lat += 20) { const [, y] = proj(0, lat); s += `<line class="m-grid" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`; }
    LAND.forEach((poly) => { s += `<path class="m-land" d="M${poly.map((p) => proj(p[0], p[1]).map((v) => v.toFixed(1)).join(' ')).join(' L')} Z"/>`; });
    const byName = new Map(m.nodes.map((n) => [n.name, n]));
    m.links.forEach(([a, b]) => {
      const A = byName.get(a), B = byName.get(b);
      if (!A || !B) return;
      const [x1, y1] = proj(A.lon, A.lat), [x2, y2] = proj(B.lon, B.lat);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.min(80, Math.abs(x2 - x1) * 0.18);
      s += `<path class="m-link" d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
    });
    m.nodes.forEach((n, i) => {
      const vis = n.types.filter((t) => on[t]);
      if (!vis.length) return;
      const [x, y] = proj(n.lon, n.lat);
      const main = vis.includes('cloud') ? 'cloud' : vis[0];
      const r = 3 + vis.length * 1.6;
      s += `<g class="m-node m-${main}" tabindex="0" role="button" data-map-node="${i}" aria-label="${esc(n.name)}: ${esc(n.types.map((t) => TYPE[t]).join(', '))} (demo)"><circle class="m-halo" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r + 5}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/><title>${esc(n.name)} - ${esc(n.types.map((t) => TYPE[t]).join(', '))} (demo)</title></g>`;
    });
    s += `<text class="m-wm" x="${W - 16}" y="${H - 14}" text-anchor="end">DEMO VISUALIZATION · NOT AN INFRASTRUCTURE INVENTORY</text></svg>`;
    return s;
  }

  TW.Art = { cover, diagram, worldMap, MAP_TYPES: TYPE, esc };
})();
