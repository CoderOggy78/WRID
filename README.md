# WRID: Winter Research Internship Desk

**Your winter research internship starts before the first email.**

A calm, rigorous workspace for undergraduates applying to winter research internships across IITs, NITs, IIITs, DRDO labs, and global fellowships.

**Live demo:** https://hacktoberfest-winter-research.vercel.app

---

## Table of contents

1. [Why WRID](#why-wrid)
2. [Features](#features)
3. [Application roadmap](#application-roadmap)
4. [6-week preparation plan](#6-week-preparation-plan)
5. [Data sources](#data-sources)
6. [Getting started](#getting-started)
7. [Configuration](#configuration)
8. [Project structure](#project-structure)
9. [Privacy and limitations](#privacy-and-limitations)
10. [Contributing](#contributing)
11. [License](#license)

---

## Why WRID

Winter research internships are competitive and scattered. Each institution has its own process, deadlines, and expectations, and students end up tracking everything across notes, tabs, and spreadsheets. WRID brings preparation, outreach, and tracking into one private, browser-based workspace.

It is built for undergraduates in Computer Science, AI/ML, Electrical and Electronics, Mechanical Engineering, Chemistry, Physics, Life Sciences, Mathematics, and Interdisciplinary Studies.

**Stack:** React 19, TypeScript, Tailwind CSS, Vite.

---

## Features

| # | Module | What it does |
|---|--------|--------------|
| 1 | Start Here | Onboarding, a personalized plan builder, and honest progress metrics |
| 2 | Faculty Directory | 1,610+ verified professors across 49 institutions, with filters, relevance reasons, and a detail drawer |
| 3 | DRDO Directory | All 50 labs, autonomous societies, and test ranges, with an application-route checklist |
| 4 | Email Studio | 5 academic templates, placeholder detection, `mailto:` launcher, optional AI tone review |
| 5 | Opportunities | Curated global fellowships with stipends, deadlines, eligibility, and portal links |
| 6 | Resume Autopilot | Parses your resume, then ranks matching faculty and fellowships |
| 7 | My Applications | 9-stage tracker with follow-up reminders and CSV/JSON backup |
| 8 | Prep Roadmap | 6 weeks of checkable milestones, discipline tracks, and a paper-notes scratchpad |
| 9 | Resources | Guides on academic CVs, reproducible READMEs, 3-pass paper reading, and interview prep |

### Feature details

- **Faculty Directory:** Search by name, campus, department, or domain keyword, with multi-select filters. Each result explains why it appears, based on keyword overlap and verified papers. The detail drawer holds contact info, a Google Scholar query link, an official web search link, editable research-fit notes, and a scratchpad for one relevant paper.
- **DRDO Directory:** Shows a source disclaimer, since the listed contacts are director or executive offices rather than student recruitment desks. A five-step checklist guides students to official circulars at `drdo.gov.in`, document requirements, formal training cells, or a structured inquiry. Switch between a desktop table and a responsive card grid.
- **Email Studio:** Five templates cover professor outreach, students with limited research experience, DRDO inquiries, a first follow-up (7 to 10 days later), and a final follow-up. The live preview highlights unresolved placeholders such as `[Name]` or `[link]` and blocks accidental sending of unpersonalized drafts. Copy the subject, body, or full email, or open it in your mail client. An 8-point pre-send checklist is included. The core works without any AI key.
- **My Applications:** Flags applications past the follow-up window. "Log Sent" increments the follow-up count and schedules the next checkpoint. CSV export escapes formula-injection characters (`=`, `+`, `-`, `@`). JSON backup and restore are included.
- **Resume Autopilot:** Paste or upload a resume (PDF, text, or Markdown). Skills and projects are extracted, then matched against faculty and fellowship data with a stated rationale for each match.

---

**
---

## 6-week preparation plan

| Week | Deliverable |
|------|-------------|
| 1 | Research statement |
| 2 | Reproducible baseline project |
| 3 | Paper notes (3-pass reading) |
| 4 | Discipline tooling track |
| 5 | Application batch sent |
| 6 | Interview preparation |

The plan contains 22 milestones across four tracks: AI/Data Science, Systems/Networking, Electronics/Robotics, and Experimental Sciences.

---

## Data sources

| Dataset | File | Records | Status |
|---------|------|---------|--------|
| IIT faculty | `src/data/iitFaculty.json` | 1,411 | Public compilation, tagged as directory-listed |
| NIT, IIIT, BITS, IISc faculty | `src/data/nitFaculty.json`, `iiitFaculty.json` | Remainder of 1,610 total | Same verification tags |
| DRDO labs | `src/data/drdoLabs.json` | 50 | Community list, all marked unverified |
| Email templates | `src/data/emailTemplates.ts` | 5 | Deterministic rendering |
| Roadmap | `src/data/roadmapData.ts` | 6 weeks, 22 milestones | Curated |
| Guides | `src/data/resourcesData.ts` | 6 | Curated |

---

## Getting started

### Prerequisites

- Node.js 18 or later (tested on Node 26)
- npm 9 or later

### Install and run

```bash
git clone https://github.com/<your-username>/wrid.git
cd wrid
npm install
npm run dev
```

Open http://localhost:5173.

### Production build

```bash
npm run build
npm run preview
```

---

## Configuration

AI polish is optional. Create a `.env` file only if you want it:

```bash
# Google AI Studio key (starts with AIza...)
VITE_GEMMA_API_KEY=your_gemma_api_key_here

# Groq key (starts with gsk_...)
VITE_GROQ_API_KEY=your_groq_api_key_here
```

**Security note:** Any variable prefixed with `VITE_` is bundled into client-side JavaScript and is visible to anyone who opens the site. Use keys with strict quotas, or route AI calls through a serverless function (for example, a Vercel Function) that holds the key on the server.

---

## Project structure**

    wrid/
    ├── src/
    │ ├── components/ UI: directories, Email Studio, tracker, roadmap
    │ ├── data/ Static JSON datasets and content modules
    │ ├── engines/ Recommendation and resume enhancer (client-side)
    │ ├── hooks/ localStorage-backed state
    │ └── App.tsx
    └── package.json


---

## Privacy and limitations

- **Independent project.** WRID is an open-source student tool. It is not affiliated with, endorsed by, or sponsored by IITs, DRDO, or the Ministry of Defence.
- **Unverified DRDO contacts.** The director emails are administrative leadership, not internship coordinators. The app directs students to official circulars or a formal inquiry instead.
- **No background notifications.** Follow-up reminders appear when the user opens the site. Nothing is sent in the background.
- **Backups matter.** Browsers can clear `localStorage`. Export a JSON backup from the header regularly.
- **Attachments are manual.** The `mailto:` launcher cannot attach files. Add your CV yourself.

---

## Contributing

Contributions are welcome, especially during Hacktoberfest.

1. Fork the repo and create a branch: `git checkout -b feat/your-idea`
2. Make your change and run `npm run build` to confirm it compiles.
3. Commit with a Conventional Commit message, for example `feat: add DRDO filter`.
4. Open a pull request that describes the problem and the fix.

**Good first issues:** adding verified faculty records, improving keyword synonyms in the recommendation engine, and writing additional guides.

Do not add personal data about real people without a public source, and cite where each record came from.

---

## License

To be confirmed by the maintainer. Add a `LICENSE` file before accepting outside contributions.
    
