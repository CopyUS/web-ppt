import { i18n, type Locale, type TranslationKey } from '../shared/i18n';

// ─── Snippets for clipboard copy ────────────────────────────────────────────

const SNIPPETS: Record<string, string> = {
  nginx: 'add_header Content-Security-Policy "frame-ancestors *";',
  apache: 'Header set Content-Security-Policy "frame-ancestors *"\nHeader unset X-Frame-Options',
  express: `app.use((req, res, next) => {\n  res.setHeader('Content-Security-Policy', 'frame-ancestors *');\n  res.removeHeader('X-Frame-Options');\n  next();\n});`,
  meta: '<meta http-equiv="Content-Security-Policy"\n      content="frame-ancestors *">',
};

// ─── i18n ────────────────────────────────────────────────────────────────────

function applyI18n(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as TranslationKey;
    el.textContent = i18n.t(key);
  });
}

// ─── Tab switching ───────────────────────────────────────────────────────────

function activateTab(tabId: string): void {
  document.querySelectorAll<HTMLButtonElement>('[data-guide-tab]').forEach((t) => {
    const active = t.dataset.guideTab === tabId;
    t.classList.toggle('guide-tab--active', active);
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
    if (active) t.focus();
  });

  document.querySelectorAll<HTMLElement>('[data-guide-panel]').forEach((p) => {
    p.hidden = p.dataset.guidePanel !== tabId;
  });
}

function handleTabClick(e: Event): void {
  const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-guide-tab]');
  if (!tab) return;
  activateTab(tab.dataset.guideTab!);
}

function handleTabKeydown(e: KeyboardEvent): void {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-guide-tab]'));
  const current = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  let next = -1;

  if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = tabs.length - 1;
  else return;

  e.preventDefault();
  activateTab(tabs[next].dataset.guideTab!);
}

// ─── Copy to clipboard ──────────────────────────────────────────────────────

async function handleCopy(e: Event): Promise<void> {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-copy-snippet]');
  if (!btn) return;

  const key = btn.dataset.copySnippet!;
  const text = SNIPPETS[key];
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = i18n.t('copied');
    btn.classList.add('btn-copy--copied');
    setTimeout(() => {
      btn.textContent = i18n.t('copy');
      btn.classList.remove('btn-copy--copied');
    }, 2000);
  } catch {
    const panel = btn.closest('[data-guide-panel]');
    const code = panel?.querySelector('code');
    if (code) {
      const range = document.createRange();
      range.selectNodeContents(code);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }
}

// ─── Language switch ─────────────────────────────────────────────────────────

function handleLanguageChange(): void {
  const select = document.getElementById('lang-select') as HTMLSelectElement;
  i18n.setLocale(select.value as Locale);
  applyI18n();
}

// ─── Init ────────────────────────────────────────────────────────────────────

function init(): void {
  // Detect locale from query param or browser
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  if (langParam) {
    i18n.setLocale(langParam as Locale);
  }

  const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
  langSelect.value = i18n.getLocale();
  applyI18n();

  // Event listeners (delegated)
  document.querySelector('.guide-tabs')?.addEventListener('click', handleTabClick);
  document.querySelector('.guide-tabs')?.addEventListener('keydown', handleTabKeydown as EventListener);
  document.getElementById('app')?.addEventListener('click', handleCopy);
  langSelect.addEventListener('change', handleLanguageChange);
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

Office.onReady(() => init());
