# Contributing to Web.PPT

Thanks for your interest in improving Web.PPT! This guide will help you set up a development environment and make your first contribution.

---

## Setting Up the Dev Environment

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **Microsoft 365** or **Office 2021+** (Desktop or Online)
- A code editor (VS Code recommended)

### First-time setup

```bash
# 1. Clone the repository
git clone https://github.com/CopyUS
cd web-ppt

# 2. Install dependencies
npm install

# 3. Install HTTPS certificates for local dev server (one-time)
npm run install-certs

# 4. Start the dev server and sideload the add-in into PowerPoint
npm start
# Or, to sideload into Desktop PowerPoint specifically:
npm run start:desktop
```

The dev server runs on `https://localhost:4008`. PowerPoint will open with the add-in sideloaded automatically.

### Useful commands

| Command | What it does |
|---------|-------------|
| `npm start` | Dev server + sideload |
| `npm run start:desktop` | Sideload into Desktop PowerPoint |
| `npm run build` | Production build → `dist/` folder |
| `npm test` | Run unit tests (Jest) |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | ESLint check |
| `npm run validate` | Validate the Office manifest |

---

## Project Structure

```
web-ppt/
├── manifest.json            # Office Add-in manifest (unified JSON format)
├── manifest-gh.json         # GitHub Pages manifest (JSON, for M365)
├── manifest-gh.xml          # GitHub Pages manifest (XML, for PowerPoint 2021)
├── manifest-lan.json        # LAN testing manifest
├── package.json
├── webpack.config.js        # Webpack config (4 entry points)
├── tsconfig.json
├── src/
│   ├── taskpane/            # Task Pane — URL input and settings UI
│   │   ├── taskpane.html
│   │   ├── taskpane.ts
│   │   └── taskpane.css
│   ├── viewer/              # Viewer — page loaded inside displayDialogAsync
│   │   ├── viewer.html
│   │   ├── viewer.ts
│   │   └── viewer.css
│   ├── commands/            # Ribbon button handlers
│   │   ├── commands.html
│   │   └── commands.ts
│   ├── help/                # "Own site" setup guide
│   │   ├── own-site-guide.html
│   │   ├── help.ts
│   │   └── help.css
│   ├── shared/              # Shared utilities
│   │   ├── settings.ts      # Office.context.document.settings wrapper
│   │   ├── dialog-launcher.ts  # displayDialogAsync wrapper
│   │   ├── i18n.ts          # Internationalization helper
│   │   ├── logger.ts        # Debug logger ([WebPPT] prefix)
│   │   └── constants.ts     # Config keys, defaults, limits
│   └── i18n/
│       └── locales.json     # Translations (10 languages)
├── assets/                  # Add-in icons (16/32/80/128 px)
├── tests/                   # Jest unit tests
├── scripts/                 # Build utilities (icon generator)
└── docs/                    # Documentation
```

### Key concepts

- **Task Pane** — The side panel where users configure a URL for the current slide. Settings are saved via `Office.context.document.settings`.
- **Viewer** — An HTML page opened via `displayDialogAsync`. It loads the target URL in an iframe (or navigates directly if iframe is blocked).
- **Commands** — Ribbon button handlers. "Show WebPage.PPT" opens the viewer for the current slide.
- **Settings** — Per-slide configs stored as `webppt_slide_{slideId}` in document settings. Global defaults stored under `webppt_defaults`.

---

## How to Add a New Language

Web.PPT uses a simple JSON-based i18n system. All translations live in one file. Currently supported: EN, ZH, ES, DE, FR, IT, AR, PT, HI, RU.

### Steps

1. Open `src/i18n/locales.json`
2. Add a new top-level key with your language code (e.g., `"ja"` for Japanese)
3. Copy all keys from the `"en"` block and translate the values
4. Open `src/shared/i18n.ts` and add your language code to the `Locale` type and `parseLocale()` function
5. Add a `<option>` for your language in the language dropdown in:
   - `src/taskpane/taskpane.html`
   - `src/help/own-site-guide.html`
6. Test: switch to your language in the Task Pane and verify all strings appear correctly

Make sure every key from `"en"` is present in your new language. Missing keys will fall back to English.

---

## How to Submit a Pull Request

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/my-change
   ```

2. **Make your changes.** Keep commits focused — one logical change per commit.

3. **Run checks** before pushing:
   ```bash
   npm run lint && npm test && npm run build
   ```

4. **Push** your branch and open a Pull Request on GitHub.

5. In the PR description, explain:
   - **What** you changed
   - **Why** (link to an issue if applicable)
   - **How to test** the change

### What makes a good PR

- Small and focused (one feature or fix)
- Passes lint, tests, and build
- Includes tests for new logic
- All user-facing strings go through i18n (no hardcoded text)
- Follows the existing code style (see below)

---

## Code Style Guidelines

### TypeScript

- Use `const` and `let`, never `var`
- Prefer `async/await` over raw Promises
- Wrap all `async` calls in `try/catch` with user-friendly error messages
- Use the `t()` function from `src/shared/i18n.ts` for all user-facing strings
- No `console.log` in production code — use `logDebug`/`logWarn`/`logError` from `src/shared/logger.ts`

### CSS

- Plain CSS (no preprocessors)
- Use CSS custom properties (variables) for colors and spacing
- Design for the Task Pane width range: 300–500 px

### HTML

- Semantic elements (`<button>`, `<label>`, `<section>`)
- All interactive elements must have ARIA labels
- Keyboard-navigable (no mouse-only interactions)

### File naming

- TypeScript/CSS/HTML: `kebab-case` (e.g., `dialog-launcher.ts`)
- Constants: `UPPER_SNAKE_CASE`
- Functions and variables: `camelCase`
- Interfaces: `PascalCase` (e.g., `WebPPTSlideConfig`)

### General rules

- No external CDN dependencies at runtime — everything is bundled
- No telemetry or analytics
- Keep the add-in lightweight — no heavy frameworks

---

## Reporting Bugs

Open an issue on GitHub with:

1. **Steps to reproduce** (be specific)
2. **Expected behavior** vs **actual behavior**
3. **Environment:** PowerPoint version, OS, browser (if Online)
4. Screenshots or screen recordings if applicable

---

## Questions?

Open a GitHub issue or start a discussion. We're happy to help newcomers get started.
