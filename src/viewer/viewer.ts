import { i18n, parseLocale, type TranslationKey } from '../shared/i18n';
import { ZOOM_MIN, ZOOM_MAX, DEFAULT_ZOOM, IFRAME_LOAD_TIMEOUT_MS, AUTO_CLOSE_MAX_SEC, truncateUrl } from '../shared/constants';
import { logDebug, logError, installUnhandledRejectionHandler } from '../shared/logger';

// ─── Code snippets for the own-site guide ────────────────────────────────────

const CODE_SNIPPETS: Record<string, string> = {
  nginx: 'add_header Content-Security-Policy "frame-ancestors *";',
  apache:
    'Header set Content-Security-Policy "frame-ancestors *"\nHeader unset X-Frame-Options',
  express: `app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.removeHeader('X-Frame-Options');
  next();
});`,
};

// ─── Message protocol ─────────────────────────────────────────────────────────

type ViewerMessageType = 'ready' | 'loaded' | 'blocked' | 'error' | 'close';

interface ViewerMessage {
  type: ViewerMessageType;
  url?: string;
  error?: string;
}

/**
 * Send a structured message to the Task Pane host via Office.js.
 * Silent no-op when running outside an Office context (standalone browser).
 */
function sendToParent(msg: ViewerMessage): void {
  try {
    Office.context.ui.messageParent(JSON.stringify(msg));
  } catch {
    // Not in an Office dialog context — ignore (standalone browser test)
  }
}

// ─── Query parameter parsing ──────────────────────────────────────────────────

interface ViewerParams {
  url: string;
  zoom: number;
  lang: string;
  autoCloseSec: number;
}

function parseParams(): ViewerParams {
  const p = new URLSearchParams(window.location.search);

  const url = p.get('url') ?? '';

  const rawZoom = parseInt(p.get('zoom') ?? String(DEFAULT_ZOOM), 10);
  const zoom = isNaN(rawZoom)
    ? DEFAULT_ZOOM
    : Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, rawZoom));

  const lang = p.get('lang') ??
    (typeof navigator !== 'undefined' ? navigator.language : 'en');

  const rawAutoClose = parseInt(p.get('autoclose') ?? '0', 10);
  const autoCloseSec = isNaN(rawAutoClose)
    ? 0
    : Math.min(AUTO_CLOSE_MAX_SEC, Math.max(0, rawAutoClose));

  return { url, zoom, lang, autoCloseSec };
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

/** Replace textContent of every [data-i18n] element with the translated string. */
function applyI18n(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as TranslationKey;
    el.textContent = i18n.t(key);
  });
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────

/**
 * Scale the iframe by `zoom`% using CSS transform while keeping it full-screen.
 * Compensated width/height ensure the viewport is always covered.
 *
 *   zoom = 150 → content is 150% size (zoomed in, shows less content)
 *   zoom = 75  → content is 75% size  (zoomed out, shows more content)
 */
function applyZoom(iframe: HTMLIFrameElement, zoom: number): void {
  if (zoom === DEFAULT_ZOOM) return; // CSS defaults already cover 100%
  const factor = zoom / 100;
  iframe.style.width = `${100 / factor}vw`;
  iframe.style.height = `${100 / factor}vh`;
  iframe.style.transform = `scale(${factor})`;
  iframe.style.transformOrigin = 'top left';
}

// ─── Iframe blocking detection ────────────────────────────────────────────────


/**
 * Detects whether the target site blocks iframe embedding.
 *
 * Strategy:
 *  1. Listen for the iframe `load` event.
 *  2. On load, try to read `contentDocument`:
 *     - SecurityError (cross-origin) → site loaded normally.
 *     - No error + empty body → browser silently redirected to about:blank
 *       due to X-Frame-Options / CSP → site is blocking.
 *  3. If `load` never fires within IFRAME_LOAD_TIMEOUT_MS → network error.
 */
function detectBlocking(iframe: HTMLIFrameElement, url: string, autoCloseSec: number): void {
  let loadFired = false;

  iframe.addEventListener('load', () => {
    loadFired = true;
    try {
      const doc = iframe.contentDocument;
      const isBlank = !doc?.body || doc.body.innerHTML.trim() === '';
      if (isBlank) {
        showBlockedUI(url);
        sendToParent({ type: 'blocked', url });
      } else {
        sendToParent({ type: 'loaded', url });
        if (autoCloseSec > 0) startCountdown(autoCloseSec);
      }
    } catch {
      // SecurityError: cross-origin content loaded successfully
      sendToParent({ type: 'loaded', url });
      if (autoCloseSec > 0) startCountdown(autoCloseSec);
    }
  });

  setTimeout(() => {
    if (!loadFired) {
      logError('Iframe load timeout after', IFRAME_LOAD_TIMEOUT_MS, 'ms for', url);
      showTimeoutUI(url);
      sendToParent({ type: 'error', url, error: 'Timeout: page did not load' });
    }
  }, IFRAME_LOAD_TIMEOUT_MS);
}

// ─── UI state ─────────────────────────────────────────────────────────────────

function showBlockedUI(url: string): void {
  const wrapper = document.getElementById('iframe-wrapper');
  const overlay = document.getElementById('blocked-overlay');

  if (wrapper) wrapper.hidden = true;
  if (overlay) overlay.hidden = false;

  initBlockedActions(url);
  initGuide();
}

function showNoUrlUI(): void {
  const wrapper = document.getElementById('iframe-wrapper');
  const msg = document.getElementById('no-url-message');

  if (wrapper) wrapper.hidden = true;
  if (msg) msg.hidden = false;
}

/** Show a timeout message when the iframe fails to load within the allowed time. */
function showTimeoutUI(url: string): void {
  const wrapper = document.getElementById('iframe-wrapper');
  const overlay = document.getElementById('blocked-overlay');

  if (wrapper) wrapper.hidden = true;
  if (overlay) {
    overlay.hidden = false;
    // Reuse the blocked overlay but change the heading text to timeout message
    const heading = overlay.querySelector('[data-i18n="iframeBlocked"]');
    if (heading) heading.textContent = i18n.t('loadTimeout');
    const hint = overlay.querySelector('[data-i18n="iframeBlockedHint"]');
    if (hint) hint.textContent = i18n.t('noInternet');
  }

  initBlockedActions(url);
}

/** Show an offline message. Called when navigator.onLine is false. */
function showOfflineUI(): void {
  const wrapper = document.getElementById('iframe-wrapper');
  const overlay = document.getElementById('blocked-overlay');

  if (wrapper) wrapper.hidden = true;
  if (overlay) {
    overlay.hidden = false;
    const heading = overlay.querySelector('[data-i18n="iframeBlocked"]');
    if (heading) heading.textContent = i18n.t('noInternet');
    const hint = overlay.querySelector('[data-i18n="iframeBlockedHint"]');
    if (hint) hint.textContent = '';
  }
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function initToolbar(url: string): void {
  const urlLabel = document.getElementById('toolbar-url');
  if (urlLabel) {
    urlLabel.textContent = truncateUrl(url);
    urlLabel.title = url; // full URL in tooltip
  }

  // Close — message host; fallback to window.close() for standalone
  document.getElementById('btn-close')?.addEventListener('click', () => {
    sendToParent({ type: 'close' });
    try { window.close(); } catch { /* ignore */ }
  });

  // Open current URL in a new browser tab
  document.getElementById('btn-open-browser')?.addEventListener('click', () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // "Show setup guide" button is handled by initGuide() when the blocked overlay is shown.

  // ── Hover reveal ───────────────────────────────────────────────────────────
  // Show toolbar when mouse enters top 40 px; hide after a short delay on leave.
  const toolbar = document.getElementById('toolbar') as HTMLElement;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  const show = (): void => {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    toolbar.classList.add('visible');
  };

  const scheduleHide = (): void => {
    hideTimer = setTimeout(() => toolbar.classList.remove('visible'), 400);
  };

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (e.clientY < 40) {
      show();
    } else if (!toolbar.matches(':hover')) {
      scheduleHide();
    }
  });

  toolbar.addEventListener('mouseenter', show);
  toolbar.addEventListener('mouseleave', scheduleHide);

  // Keyboard: reveal toolbar when focus enters it
  toolbar.addEventListener('focusin', show);
  toolbar.addEventListener('focusout', scheduleHide);
}

// ─── Blocked-overlay actions ──────────────────────────────────────────────────

/** Wire the two action buttons inside the blocked overlay. */
function initBlockedActions(url: string): void {
  // "Open directly" — navigate the viewer window itself to the target URL.
  // Works because displayDialogAsync opens a real browser window.
  document.getElementById('btn-navigate-direct')?.addEventListener('click', () => {
    window.location.href = url;
  });

  // "Open in browser" — open in a new system browser tab.
  document.getElementById('btn-open-external')?.addEventListener('click', () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

// ─── Own-site guide ──────────────────────────────────────────────────────────

/** Set up the collapsible guide panel: toggle, tabs, copy buttons. */
function initGuide(): void {
  const toggleBtn = document.getElementById('btn-toggle-guide');
  const panel = document.getElementById('guide-panel');
  if (!toggleBtn || !panel) return;

  // Toggle visibility
  toggleBtn.addEventListener('click', () => {
    const opening = panel.hidden;
    panel.hidden = !opening;
    toggleBtn.textContent = i18n.t(opening ? 'hideSetupGuide' : 'showSetupGuide');
    toggleBtn.setAttribute('aria-expanded', String(opening));
  });

  // Tab switching
  const tabs = Array.from(panel.querySelectorAll<HTMLElement>('.guide-tab'));
  const codePanels = panel.querySelectorAll<HTMLElement>('.guide-code');

  function activateTab(target: string): void {
    tabs.forEach((t) => {
      const isActive = t.dataset.tab === target;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', String(isActive));
      (t as HTMLElement).tabIndex = isActive ? 0 : -1;
      if (isActive) (t as HTMLElement).focus();
    });
    codePanels.forEach((p) => {
      p.hidden = p.dataset.tabPanel !== target;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab!));
  });

  // Arrow key navigation for tabs
  panel.querySelector('.guide-tabs')?.addEventListener('keydown', ((e: KeyboardEvent) => {
    const current = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    let next = -1;

    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;

    e.preventDefault();
    activateTab(tabs[next].dataset.tab!);
  }) as EventListener);

  // Copy buttons
  panel.querySelectorAll<HTMLButtonElement>('.btn-copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.copyTarget;
      if (!key || !CODE_SNIPPETS[key]) return;

      navigator.clipboard.writeText(CODE_SNIPPETS[key]).then(() => {
        const original = btn.textContent;
        btn.textContent = i18n.t('copied');
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1500);
      }).catch(() => {
        // Clipboard API not available — select text in the <pre> as fallback
        const pre = btn.parentElement?.querySelector('pre');
        if (pre) {
          const range = document.createRange();
          range.selectNodeContents(pre);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      });
    });
  });
}

// ─── Image mode ──────────────────────────────────────────────────────────────

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg)$/i;

/** Check if a URL points to an image file by its pathname extension. */
function isImageUrl(url: string): boolean {
  try {
    return IMAGE_EXTENSIONS.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

/** Add a cache-busting parameter to force fresh image loads. */
function cacheBust(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
}

/** Apply zoom to the image element using CSS transform. */
function applyImageZoom(img: HTMLImageElement, zoom: number): void {
  if (zoom === DEFAULT_ZOOM) return;
  const factor = zoom / 100;
  img.style.transform = `scale(${factor})`;
  img.style.transformOrigin = 'center center';
}

/** Initialize image mode: display a static image instead of an iframe. */
function initImageMode(url: string, zoom: number, autoCloseSec: number): void {
  const iframeWrapper = document.getElementById('iframe-wrapper');
  const imageWrapper = document.getElementById('image-wrapper');
  const img = document.getElementById('image-frame') as HTMLImageElement;

  if (iframeWrapper) iframeWrapper.hidden = true;
  if (imageWrapper) imageWrapper.hidden = false;

  applyImageZoom(img, zoom);

  img.addEventListener('load', () => {
    logDebug('Image loaded:', url);
    sendToParent({ type: 'loaded', url });

    // Return focus to PowerPoint so the clicker/remote works.
    // The image stays visible in the dialog window.
    // Small delay ensures the dialog has finished rendering.
    setTimeout(() => {
      try { window.blur(); } catch { /* ignore */ }
    }, 300);

    if (autoCloseSec > 0) startCountdown(autoCloseSec);
  });

  img.addEventListener('error', () => {
    logError('Image failed to load:', url);
    sendToParent({ type: 'error', url, error: 'Image failed to load' });
  });

  img.src = cacheBust(url);
}

// ─── Auto-close countdown ────────────────────────────────────────────────────

/** Show a countdown badge and auto-close the viewer when it reaches zero. */
function startCountdown(seconds: number): void {
  const el = document.getElementById('countdown');
  if (!el) return;

  let remaining = seconds;
  el.textContent = i18n.t('countdownText').replace('{n}', String(remaining));
  el.hidden = false;

  const timer = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(timer);
      sendToParent({ type: 'close' });
      try { window.close(); } catch { /* ignore */ }
    } else {
      el.textContent = i18n.t('countdownText').replace('{n}', String(remaining));
    }
  }, 1000);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function init(): void {
  const { url, zoom, lang, autoCloseSec } = parseParams();

  i18n.setLocale(parseLocale(lang));
  applyI18n();

  if (!url) {
    showNoUrlUI();
    return;
  }

  // Check network before loading
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    logDebug('Browser is offline, showing offline UI');
    showOfflineUI();
    // Re-check when connection is restored
    window.addEventListener('online', () => {
      logDebug('Connection restored, reloading');
      window.location.reload();
    }, { once: true });
    sendToParent({ type: 'error', url, error: 'No internet connection' });
    return;
  }

  initToolbar(url);

  // Image mode: auto-detected by URL extension
  if (isImageUrl(url)) {
    logDebug('Image URL detected, using image mode');
    initImageMode(url, zoom, autoCloseSec);
  } else {
    // Iframe mode (default)
    const iframe = document.getElementById('web-frame') as HTMLIFrameElement;
    applyZoom(iframe, zoom);
    detectBlocking(iframe, url, autoCloseSec);
    iframe.src = url;
  }

  // Listen for going offline after initial load
  window.addEventListener('offline', () => {
    logDebug('Connection lost');
    showOfflineUI();
    sendToParent({ type: 'error', url, error: 'Connection lost' });
  });

  // Escape key closes the viewer
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      sendToParent({ type: 'close' });
      try { window.close(); } catch { /* ignore */ }
    }
  });

  sendToParent({ type: 'ready', url });
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

/**
 * - Office context: defer until Office.onReady() to guarantee Office.js APIs.
 * - Standalone (no Office.js CDN, dev browser): run on DOMContentLoaded.
 */
function start(): void {
  installUnhandledRejectionHandler();

  if (typeof Office !== 'undefined' && typeof Office.onReady === 'function') {
    Office.onReady(() => init());
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

start();
