TECHWIRE

Technology. Security. Infrastructure.

A technology newsroom prototype focused on IT, cybersecurity, networking, infrastructure, cloud and AI: breaking news, desks, live updates, technical explainers and analysis, running directly in your browser.

⚠️ Demo / early version (v1.0.0) TECHWIRE is currently a demo project and still in active development. All content is fictional demo data: articles, authors, statistics, CVE identifiers (CVE-DEMO-2026-xxxx), live updates, service statuses and map data are sample content (isDemo: true) and do not describe real events. Company and product names appear only as topic labels. The project is not yet connected to real news sources.

🔗 Repository: https://github.com/bardhyx/TECHWIRE

🚀 Getting Started (no installation needed)

You don't need to install anything: no frameworks, no dependencies, no server.

Option 1: Download ZIP (easiest)
Open the repository: https://github.com/bardhyx/TECHWIRE
Click the green Code button, then Download ZIP
Extract the ZIP file (right-click → Extract All)
Open the extracted folder and double-click index.html

The site opens in your browser and is ready to use.

Option 2: Git clone
bash
git clone https://github.com/bardhyx/TECHWIRE.git
cd TECHWIRE

Then open index.html in your browser.

Optional: run with a local server

With a local server the app loads the JSON files directly (recommended for development):

bash
python -m http.server 8080

Then open http://localhost:8080 in your browser.

📰 Sections
Section	Coverage
News	General technology news
Cyber	Vulnerabilities, CVEs, ransomware, malware, data breaches, zero-days, APT, threat intelligence
Networks	Cisco, MikroTik, Fortinet, Juniper, Aruba, BGP, OSPF, SD-WAN, Wi-Fi, 5G, outages
Infra	Windows Server, Linux, Active Directory, VMware, Proxmox, Hyper-V, storage, backup
Cloud	AWS, Azure, Google Cloud, Cloudflare, Kubernetes, Docker, serverless
AI	LLMs, AI security, AI infrastructure, AI hardware, enterprise AI
Hardware	Servers, CPUs, GPUs, networking hardware, laptops, datacenter hardware
Software / Dev	Operating systems, enterprise software, DevOps, APIs, open source
✨ Features

Newsroom

Sticky header, section navigation and a breaking news ticker (pausable)
Homepage with main story, secondary stories and a chronological Latest column
Dedicated Security Desk, Network Desk, Infrastructure, Cloud, AI and Hardware desks with topic filters
Clear content labels: News · Analysis · Opinion · Research · Explainer

Live & intelligence (demo data)

🔴 Live technology feed (clearly marked Demo live feed)
IT Outage Center with service status cards (Demo status)
Today in Tech timeline
Cyber Intelligence and Network Intelligence panels
Global technology infrastructure map in SVG (Demo visualization)

Articles

Reading progress bar, category, author, published/updated date, reading time and tags
60-Second Brief, Why It Matters and For IT Professionals boxes
Sources section (placeholder labels, ready for real URLs) and related stories
Bookmark, share, copy link and print

Features & tools

Tech Explained: 12 educational explainers with diagrams (BGP, DNS, HTTPS, zero-day, ransomware, ASN, IPsec, SIEM, SOC, Wi-Fi roaming, DNS failure, datacenter networks)
Deep Dive long-form articles and Security Research notes
Search (press /) across articles, authors, topics, companies, CVEs and technologies
Bookmarks saved in LocalStorage
TECHWIRE Daily newsletter form (frontend validation only, nothing is sent)
Editorial team and author pages, plus a Newsroom dashboard (UI demo)
Dark / light mode, responsive design with a mobile bottom navigation, accessible markup
📁 Project Structure
text
index.html                  App shell: header, navigation, ticker, search, footer
css/style.css               Editorial design system (light/dark), responsive, print
js/config.js                Configuration (data mode, API, sources)
js/services/data.js         Data service: loading, indexing, search
js/services/adapters.js     API-ready adapters (RSS, NVD, CISA KEV, GitHub Advisories, status APIs), disabled
js/ui/art.js                SVG illustrations, explainer diagrams, world map
js/ui/components.js         Reusable UI components
js/pages.js                 Pages / views
js/app.js                   Router, search, bookmarks, theme, interactions
data/*.json                 Demo content (news, cybersecurity, networking, infrastructure, cloud, AI, hardware, authors…)
data/bundle.js              Same data as one script, used when opened directly from disk
tools/generate_demo_data.py Regenerates the demo data

Built with HTML, CSS, vanilla JavaScript, SVG and JSON: no frameworks, no build step.

🔒 Privacy
No cookies, analytics or trackers.
Only preferences are stored in your browser (theme, bookmarks, recent searches).
The newsletter and contact forms are demo only: nothing is sent to a server.
🗺️ Roadmap
Connect real sources: RSS feeds, NVD, CISA KEV, GitHub Security Advisories, status APIs
Backend / headless CMS for real articles
Real newsletter delivery
Server-side search
🤝 Contributing

Feedback, bug reports and suggestions are welcome. Open an Issue or send a Pull Request.

If you like this project, please give it a ⭐ on GitHub!

📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

<img width="1490" height="846" alt="Screenshot 2026-09-18 115556 - Copy" src="https://github.com/user-attachments/assets/0c0b84d5-8f6f-4825-9171-3d1585c039a8" />
<img width="1161" height="861" alt="Screenshot 2026-09-18 115622" src="https://github.com/user-attachments/assets/a5af1f66-d6a0-4c40-88ce-2387c013e3c2" />
<img width="1919" height="846" alt="Screenshot 2026-09-18 115546" src="https://github.com/user-attachments/assets/bb9a0818-9f4c-4f30-acec-197e371164d7" />

© 2026 Bardhyl
