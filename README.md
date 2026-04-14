![Web.PPT — live web pages in PowerPoint](assets/screenwebppt.png)

# Web.PPT

Show any website during your PowerPoint presentation — no macros, no installation, fully controllable with a clicker.


> Requires **Microsoft 365** or **Office 2021+**

---

**Download:**
- [`manifest-gh.xml`](https://raw.githubusercontent.com/CopyUS/web-ppt/main/manifest-gh.xml) — PowerPoint Desktop (2021 / 2024 / 365)
- [`manifest-gh.json`](https://raw.githubusercontent.com/CopyUS/web-ppt/main/manifest-gh.json) — PowerPoint Online (Microsoft 365)

---

**Installation guide:**
[English](00-README/01-EN.md) | [中文](00-README/02-ZH.md) | [हिन्दी](00-README/03-HI.md) | [Español](00-README/04-ES.md) | [العربية](00-README/05-AR.md) | [Français](00-README/06-FR.md) | [Português](00-README/07-PT.md) | [Русский](00-README/08-RU.md) | [Deutsch](00-README/09-DE.md) | [Italiano](00-README/10-IT.md)

---

## Mission

A [CopyUS](https://github.com/CopyUS) project — free tools for education.

Open-source code doesn't depend on commercial decisions and is available to everyone, in any country, without restrictions.

Like Web.PPT? Tell your colleagues and friends about it.

---

<details>
<summary><strong>For developers</strong></summary>

### Quick setup

```bash
git clone https://github.com/CopyUS/web-ppt
cd web-ppt
npm install
npm run install-certs
npm start
```

### Available scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server and sideload the add-in |
| `npm run start:desktop` | Sideload into PowerPoint Desktop |
| `npm run build` | Production build → `dist/` |
| `npm test` | Run unit tests (Jest) |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run validate` | Validate the Office manifest |

### Tech stack

- **TypeScript** + **Webpack**
- **Office.js** (Common API + PowerPoint JS API)
- Unified JSON manifest (devPreview)
- No frameworks, no external CDN dependencies at runtime

### Documentation

| Document | Description |
|----------|-------------|
| [CONTRIBUTING](docs/CONTRIBUTING.md) | Development setup, project structure, code style |
| [CONTRIBUTING RU](docs/CONTRIBUTING_RU.md) | То же на русском |
| [Publishing Guide](docs/publishing-guide.md) | How to publish to Microsoft AppSource |
| [QA Report](docs/QA-REPORT.md) | Quality assurance results |

</details>

---

[MIT](LICENSE) — free for everyone, forever.
