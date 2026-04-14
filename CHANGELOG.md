# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-04-13

### Added

#### Core Viewer (`displayDialogAsync`)
- Web page viewer using `Office.context.ui.displayDialogAsync` — opens a real browser window
- CSS zoom support via `transform: scale()` (50%–300%)
- Iframe blocking detection with three fallback options:
  - "Open directly" — navigates the viewer window itself to the URL
  - "Open in browser" — opens in a new system browser tab
  - Collapsible own-site server configuration guide (Nginx, Apache, Express.js)
- Toolbar with URL display, "Open in browser" button, and close button (auto-hides, reveals on hover)
- Escape key closes the viewer
- Offline detection with automatic reload when connection restores
- Load timeout handling (10 seconds)
- Message protocol between viewer and host (ready/loaded/blocked/error/close)

#### Task Pane
- URL input with `https://` auto-prefix
- Per-slide configuration stored in `Office.context.document.settings`
- Zoom slider (50%–300%) with preset buttons
- Dialog width/height sliders (30%–100%) with live size preview
- Auto-open toggle (open viewer automatically on slide change)
- Auto-close timer with non-linear slider (0–3600 seconds)
- "Set as defaults" — save current settings as defaults for new slides
- Viewer status indicator (loading/loaded/blocked/error)
- Inline own-site guide with tabbed code snippets and copy buttons
- Slide indicator showing current slide number

#### Ribbon Commands
- "Add WebPage.PPT" button on the Insert tab — opens the Task Pane
- "Show WebPage.PPT" button on the Insert tab — opens the viewer for the current slide
- Slideshow detection via `ActiveViewChanged` — auto-opens viewer when entering slideshow mode
- Slide change detection via `DocumentSelectionChanged` — auto-opens/closes viewer per slide

#### Own-Site Guide (standalone page)
- Full-page guide accessible via the Task Pane help link
- Tabbed code snippets: Nginx, Apache, Express.js, HTML meta tag
- Copy-to-clipboard with visual feedback
- FAQ section (X-Frame-Options, server identification, no server access)
- Language selector (10 languages)

#### Internationalization (i18n)
- 66 translation keys across 10 languages: English, Chinese, Spanish, German, French, Italian, Arabic, Portuguese, Hindi, Russian
- Auto-detection from `navigator.language`
- Manual language switch in Task Pane and guide page (live update, no reload)
- Language preference persisted in document settings

#### Settings System
- `Office.context.document.settings` wrapper with async save, retry logic (2 retries), and error handling
- Per-slide config: URL, zoom, dialog width/height, auto-open flag, auto-close timer
- Global defaults storage
- Language preference storage
- Test injection support (`_injectSettingsStore`) for unit testing

#### Dialog Launcher
- `displayDialogAsync` lifecycle wrapper: open, close, retry on error code 12007
- Event handling: `DialogMessageReceived`, `DialogEventReceived`
- Error mapping: 12007 → "already open", 12009 → "popup blocked", others → generic
- Auto-close existing dialog before opening a new one
- Callbacks: `onMessage()`, `onClosed()`
- Test injection support (`_injectDialogApi`, `_injectBaseUrl`)

#### Accessibility
- `focus-visible` outlines on all interactive elements
- ARIA roles: `tablist`, `tab`, `tabpanel` for guide tabs
- `aria-live` regions for status messages and blocked overlay
- `aria-expanded` on collapsible guide toggle
- `aria-label` on toolbar, language selector, close button
- Keyboard navigation: arrow keys for tab switching, Escape to close viewer

#### Error Handling
- Centralized logger (`logDebug`, `logWarn`, `logError`) with production no-op via `DEBUG` flag
- Global `unhandledrejection` handler on every entry point
- Settings save retry with configurable max retries and delay
- User-friendly error messages via i18n keys

#### Build & Tooling
- TypeScript with `strict: true`
- Webpack 5 with 4 entry points (taskpane, viewer, commands, help)
- MiniCssExtractPlugin for CSS
- HtmlWebpackPlugin for HTML injection
- CopyWebpackPlugin for icons
- ESLint with `@typescript-eslint` and `no-console` rule
- Jest + ts-jest with 88 unit tests (81.96% branch coverage)
- Dev server with HTTPS (office-addin-dev-certs)

#### Documentation
- README with usage guide, features overview, limitations, and contributing link
- CONTRIBUTING guide with dev setup, architecture overview, and PR guidelines
- Publishing guide for Microsoft AppSource submission (7 sections)
- QA report with self-assessment (24 criteria, all >= 9/10)
- Inline JSDoc and section comments throughout codebase

### Architecture

- **Strategy A**: Web Add-in + `displayDialogAsync` (primary viewer)
- No Content Add-in dependency (known PowerPoint bugs in slideshow mode)
- Unified JSON manifest (Teams/Office `devPreview` schema)
- Cross-platform: Windows, Mac, iPad, PowerPoint Online
- No external CDN dependencies in runtime (only `office.js`)
- No telemetry, no analytics, no data collection
