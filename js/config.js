/* ==========================================================================
   TECHWIRE — Runtime configuration
   Switch `dataMode` to 'api' and enable adapters once real sources exist.
   ========================================================================== */
window.TW = window.TW || {};

TW.CONFIG = {
  version: '1.0.0',
  /** 'mock' = JSON files in /data (DEMO). 'api' = your backend/CMS (see js/services/adapters.js). */
  dataMode: 'mock',
  dataPath: 'data/',
  mockFiles: ['news', 'cybersecurity', 'networking', 'infrastructure', 'cloud', 'ai', 'hardware', 'authors', 'features', 'live'],
  /** Shift demo timestamps so the demo edition always looks "today". Real data must set this to false. */
  rebaseDemoTimes: true,
  /** Your future backend. Every endpoint must return the Article schema documented in README.md. */
  api: {
    baseUrl: '',                 // e.g. 'https://api.techwire.example/v1'
    endpoints: { articles: '/articles', authors: '/authors', features: '/features', live: '/live', status: '/status' }
  },
  /** External source adapters (js/services/adapters.js). Disabled in the demo build. */
  sources: {
    rss:            { enabled: false, feeds: [] },
    nvd:            { enabled: false, endpoint: 'https://services.nvd.nist.gov/rest/json/cves/2.0', apiKey: null },
    cisaKev:        { enabled: false, endpoint: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json' },
    githubAdvisory: { enabled: false, endpoint: 'https://api.github.com/advisories', token: null },
    statuspage:     { enabled: false, pages: [] },   // [{ service: 'GitHub', url: 'https://www.githubstatus.com/api/v2/summary.json' }]
    bgp:            { enabled: false, endpoint: '' } // e.g. a routing-monitoring API of your choice
  },
  pageSize: 10,
  liveSimulation: true,          // demo-only: replays queued demo events in the LIVE panel
  social: [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/' },
    { name: 'X', url: 'https://x.com/' },
    { name: 'GitHub', url: 'https://github.com/' },
    { name: 'YouTube', url: 'https://www.youtube.com/' }
  ]
};
