import { i18n, type Locale, type TranslationKey } from '../shared/i18n';
import { getSlideConfig, setSlideConfig, getLanguage, setLanguage, getDefaults, setDefaults } from '../shared/settings';
import { DialogLauncher, DialogError } from '../shared/dialog-launcher';
import { logError, installUnhandledRejectionHandler } from '../shared/logger';
import { AUTO_CLOSE_STEPS, truncateUrl } from '../shared/constants';

// ─── DOM references ──────────────────────────────────────────────────────────

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

let urlInput: HTMLInputElement;
let btnApply: HTMLButtonElement;
let btnShow: HTMLButtonElement;
let btnDefaults!: HTMLButtonElement;
let statusEl: HTMLElement;
let slideNumberEl: HTMLElement;
let langSelect: HTMLSelectElement;
let sliderWidth!: HTMLInputElement;
let sliderHeight!: HTMLInputElement;
let sliderZoom!: HTMLInputElement;
let sliderWidthValue!: HTMLElement;
let sliderHeightValue!: HTMLElement;
let sliderZoomValue!: HTMLElement;
let sizePreviewInner!: HTMLElement;
let chkAutoOpen!: HTMLInputElement;
let chkLockSize!: HTMLInputElement;
let sliderAutoClose!: HTMLInputElement;
let sliderAutoCloseValue!: HTMLElement;
let presetButtons!: NodeListOf<HTMLButtonElement>;
let viewerStatusEl!: HTMLElement;
let viewerStatusText!: HTMLElement;

// ─── State ───────────────────────────────────────────────────────────────────

let currentSlideId: string | null = null;
let currentSlideIndex: number | null = null;
const launcher = new DialogLauncher();
let viewerStatusTimer: ReturnType<typeof setTimeout> | null = null;

// ─── i18n ────────────────────────────────────────────────────────────────────

function applyI18n(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as TranslationKey;
    el.textContent = i18n.t(key);
  });

  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder as TranslationKey;
    el.placeholder = i18n.t(key);
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle as TranslationKey;
    el.title = i18n.t(key);
  });

  // Keep <html lang> in sync with the active locale
  document.documentElement.lang = i18n.getLocale();

  // Guide toggle button uses data-i18n="siteNotLoading", but when the guide
  // is currently open the label should read "hideSetupGuide" instead.
  const guideSection = document.getElementById('guide-section');
  if (guideSection && !guideSection.hidden) {
    const toggleBtn = document.getElementById('btn-guide-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = i18n.t('hideSetupGuide');
    }
  }
}

// ─── Slide detection ─────────────────────────────────────────────────────────

async function detectCurrentSlide(): Promise<void> {
  try {
    await PowerPoint.run(async (context) => {
      const slides = context.presentation.getSelectedSlides();
      slides.load('items/id');
      await context.sync();

      if (slides.items.length > 0) {
        const slide = slides.items[0];
        currentSlideId = slide.id;

        // Determine 1-based index
        const allSlides = context.presentation.slides;
        allSlides.load('items/id');
        await context.sync();

        currentSlideIndex = null;
        for (let i = 0; i < allSlides.items.length; i++) {
          if (allSlides.items[i].id === currentSlideId) {
            currentSlideIndex = i + 1;
            break;
          }
        }
      }
    });
  } catch {
    currentSlideId = null;
    currentSlideIndex = null;
  }

  updateSlideUI();
}

function updateSizePreview(): void {
  const w = Number(sliderWidth.value);
  const h = Number(sliderHeight.value);
  // Preview box is 64×48; scale proportionally
  sizePreviewInner.style.width = `${(w / 100) * 58}px`;
  sizePreviewInner.style.height = `${(h / 100) * 42}px`;
}

function formatAutoCloseLabel(sec: number): string {
  if (sec === 0) return i18n.t('autoCloseOff');
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (sec >= 3600) return `${Math.floor(sec / 3600)}h`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

/** Convert seconds value → nearest slider index. */
function secondsToSliderIndex(sec: number): number {
  let best = 0;
  for (let i = 0; i < AUTO_CLOSE_STEPS.length; i++) {
    if (Math.abs(AUTO_CLOSE_STEPS[i] - sec) < Math.abs(AUTO_CLOSE_STEPS[best] - sec)) {
      best = i;
    }
  }
  return best;
}

/** Read actual seconds from the current slider position. */
function getAutoCloseSeconds(): number {
  return AUTO_CLOSE_STEPS[Number(sliderAutoClose.value)] ?? 0;
}

function setSliderUI(width: number, height: number, zoom: number, autoOpen: boolean, autoCloseSec: number): void {
  sliderWidth.value = String(width);
  sliderHeight.value = String(height);
  sliderZoom.value = String(zoom);
  sliderWidthValue.textContent = `${width}%`;
  sliderHeightValue.textContent = `${height}%`;
  sliderZoomValue.textContent = `${zoom}%`;
  chkAutoOpen.checked = autoOpen;
  sliderAutoClose.value = String(secondsToSliderIndex(autoCloseSec));
  sliderAutoCloseValue.textContent = formatAutoCloseLabel(autoCloseSec);
  updateSizePreview();
  updateActivePreset(zoom);
}

function updateActivePreset(zoom: number): void {
  presetButtons.forEach((btn) => {
    const val = Number(btn.dataset.zoom);
    btn.classList.toggle('btn-preset--active', val === zoom);
  });
}

function updateSlideUI(): void {
  slideNumberEl.textContent = currentSlideIndex != null ? String(currentSlideIndex) : '—';

  const defaults = getDefaults();

  if (currentSlideId) {
    const config = getSlideConfig(currentSlideId);
    urlInput.value = config?.url ?? '';
    setSliderUI(
      config?.dialogWidth ?? defaults.dialogWidth,
      config?.dialogHeight ?? defaults.dialogHeight,
      config?.zoom ?? defaults.zoom,
      config?.autoOpen ?? defaults.autoOpen,
      config?.autoCloseSec ?? defaults.autoCloseSec,
    );
  } else {
    urlInput.value = '';
    setSliderUI(defaults.dialogWidth, defaults.dialogHeight, defaults.zoom, defaults.autoOpen, defaults.autoCloseSec);
  }

  updateShowButtonState();
}

// ─── URL validation & normalization ──────────────────────────────────────────

/**
 * Auto-prepend `https://` if the user omitted the protocol.
 * Returns the normalized URL string.
 */
function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function isValidUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ─── Status messages ─────────────────────────────────────────────────────────

function showStatus(key: TranslationKey, type: 'success' | 'error'): void {
  statusEl.textContent = i18n.t(key);
  statusEl.className = `status status-${type}`;
  statusEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
  statusEl.hidden = false;

  setTimeout(() => {
    statusEl.hidden = true;
  }, 3000);
}

// ─── Show button state ───────────────────────────────────────────────────

/** Disable "Show Web Page" when there is no saved URL for the current slide. */
function updateShowButtonState(): void {
  const hasUrl = currentSlideId
    ? !!getSlideConfig(currentSlideId)?.url
    : false;
  btnShow.disabled = !hasUrl;
  btnShow.title = hasUrl
    ? truncateUrl(getSlideConfig(currentSlideId!)!.url)
    : i18n.t('noUrlForSlide');
}

// ─── Apply handler ───────────────────────────────────────────────────────────

async function handleApply(): Promise<void> {
  if (!currentSlideId) {
    showStatus('selectSlide', 'error');
    return;
  }

  // Auto-fix missing protocol
  let url = normalizeUrl(urlInput.value);
  if (url !== urlInput.value.trim() && url) {
    urlInput.value = url;
    showStatus('urlAutoFixed', 'success');
  }

  if (!isValidUrl(url)) {
    showStatus('noUrl', 'error');
    urlInput.focus();
    return;
  }

  try {
    await setSlideConfig(currentSlideId, {
      url,
      zoom: Number(sliderZoom.value),
      dialogWidth: Number(sliderWidth.value),
      dialogHeight: Number(sliderHeight.value),
      autoOpen: chkAutoOpen.checked,
      autoCloseSec: getAutoCloseSeconds(),
    });

    showStatus('success', 'success');
    updateShowButtonState();
  } catch (err) {
    logError('Failed to save slide config:', err);
    showStatus('settingsSaveRetryFailed', 'error');
  }
}

// ─── Set as defaults handler ────────────────────────────────────────────────

async function handleSetDefaults(): Promise<void> {
  try {
    await setDefaults({
      url: '',
      zoom: Number(sliderZoom.value),
      dialogWidth: Number(sliderWidth.value),
      dialogHeight: Number(sliderHeight.value),
      autoOpen: chkAutoOpen.checked,
      autoCloseSec: getAutoCloseSeconds(),
    });
    showStatus('defaultsSaved', 'success');
  } catch (err) {
    logError('Failed to save defaults:', err);
    showStatus('settingsSaveRetryFailed', 'error');
  }
}

// ─── Slider / preset handlers ───────────────────────────────────────────────

function handleWidthInput(): void {
  sliderWidthValue.textContent = `${sliderWidth.value}%`;
  if (chkLockSize.checked) {
    sliderHeight.value = sliderWidth.value;
    sliderHeightValue.textContent = `${sliderHeight.value}%`;
  }
  updateSizePreview();
}

function handleHeightInput(): void {
  sliderHeightValue.textContent = `${sliderHeight.value}%`;
  if (chkLockSize.checked) {
    sliderWidth.value = sliderHeight.value;
    sliderWidthValue.textContent = `${sliderWidth.value}%`;
  }
  updateSizePreview();
}

function handleZoomInput(): void {
  const val = Number(sliderZoom.value);
  sliderZoomValue.textContent = `${val}%`;
  updateActivePreset(val);
}

function handlePresetClick(e: Event): void {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.btn-preset');
  if (!btn?.dataset.zoom) return;
  const val = Number(btn.dataset.zoom);
  sliderZoom.value = String(val);
  sliderZoomValue.textContent = `${val}%`;
  updateActivePreset(val);
}

function handleLockSizeChange(): void {
  if (chkLockSize.checked) {
    // Sync height to width
    sliderHeight.value = sliderWidth.value;
    sliderHeightValue.textContent = `${sliderHeight.value}%`;
    updateSizePreview();
  }
}

function handleAutoCloseInput(): void {
  sliderAutoCloseValue.textContent = formatAutoCloseLabel(getAutoCloseSeconds());
}

function handleInfoToggle(hintId: string, btnId: string): void {
  const hint = document.getElementById(hintId);
  const btn = document.getElementById(btnId);
  if (!hint || !btn) return;
  const show = hint.hidden;
  hint.hidden = !show;
  btn.setAttribute('aria-expanded', String(show));
}

function handleAutoOpenInfoToggle(): void {
  handleInfoToggle('autoopen-hint', 'btn-autoopen-info');
}

function handleAutoCloseInfoToggle(): void {
  handleInfoToggle('autoclose-hint', 'btn-autoclose-info');
}

// ─── Viewer status ──────────────────────────────────────────────────────────

type ViewerState = 'loading' | 'loaded' | 'blocked' | 'error';

function setViewerStatus(state: ViewerState): void {
  const keyMap: Record<ViewerState, TranslationKey> = {
    loading: 'viewerLoading',
    loaded: 'viewerLoaded',
    blocked: 'viewerBlocked',
    error: 'viewerError',
  };

  viewerStatusEl.hidden = false;
  viewerStatusEl.className = `viewer-status viewer-status--${state}`;
  viewerStatusText.textContent = i18n.t(keyMap[state]);

  // Auto-hide success/error after a delay (keep loading/blocked visible)
  if (viewerStatusTimer) {
    clearTimeout(viewerStatusTimer);
    viewerStatusTimer = null;
  }

  if (state === 'loaded') {
    viewerStatusTimer = setTimeout(() => {
      viewerStatusEl.hidden = true;
    }, 4000);
  }
}

function hideViewerStatus(): void {
  if (viewerStatusTimer) {
    clearTimeout(viewerStatusTimer);
    viewerStatusTimer = null;
  }
  viewerStatusEl.hidden = true;
}

/** Parse and handle structured messages from the viewer dialog. */
function handleViewerMessage(rawMessage: string): void {
  try {
    const msg = JSON.parse(rawMessage) as { type: string; url?: string; error?: string };

    switch (msg.type) {
      case 'ready':
        setViewerStatus('loading');
        break;
      case 'loaded':
        setViewerStatus('loaded');
        break;
      case 'blocked':
        setViewerStatus('blocked');
        break;
      case 'error':
        setViewerStatus('error');
        break;
      case 'close':
        launcher.close();
        btnShow.disabled = false;
        hideViewerStatus();
        break;
    }
  } catch {
    // Non-JSON message — ignore
  }
}

function handleViewerClosed(): void {
  btnShow.disabled = false;
  // Show brief "closed" status then hide
  viewerStatusEl.hidden = false;
  viewerStatusEl.className = 'viewer-status';
  viewerStatusText.textContent = i18n.t('viewerClosed');

  if (viewerStatusTimer) clearTimeout(viewerStatusTimer);
  viewerStatusTimer = setTimeout(() => {
    viewerStatusEl.hidden = true;
  }, 2000);
}

// ─── Show Web Page handler ───────────────────────────────────────────────────

async function handleShow(): Promise<void> {
  if (!currentSlideId) {
    showStatus('selectSlide', 'error');
    return;
  }

  const config = getSlideConfig(currentSlideId);

  if (!config || !config.url) {
    showStatus('noUrlForSlide', 'error');
    return;
  }

  // Check network before opening
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    showStatus('noInternet', 'error');
    return;
  }

  btnShow.disabled = true;
  setViewerStatus('loading');

  try {
    await launcher.open({
      url: config.url,
      zoom: config.zoom,
      width: config.dialogWidth,
      height: config.dialogHeight,
      lang: i18n.getLocale(),
      autoCloseSec: config.autoCloseSec,
    });
  } catch (err) {
    btnShow.disabled = false;
    hideViewerStatus();
    if (err instanceof DialogError) {
      showStatus(err.i18nKey, 'error');
    } else {
      showStatus('errorGeneric', 'error');
    }
  }
}

// ─── Guide handlers ─────────────────────────────────────────────────────

const SNIPPETS: Record<string, string> = {
  nginx: 'add_header Content-Security-Policy "frame-ancestors *";',
  apache: 'Header set Content-Security-Policy "frame-ancestors *"\nHeader unset X-Frame-Options',
  express: `app.use((req, res, next) => {\n  res.setHeader('Content-Security-Policy', 'frame-ancestors *');\n  res.removeHeader('X-Frame-Options');\n  next();\n});`,
  meta: '<meta http-equiv="Content-Security-Policy"\n      content="frame-ancestors *">',
};

function handleGuideToggle(): void {
  const section = $('guide-section');
  const toggle = $('btn-guide-toggle');
  const isHidden = section.hidden;
  section.hidden = !isHidden;
  toggle.textContent = i18n.t(isHidden ? 'hideSetupGuide' : 'siteNotLoading');
  toggle.setAttribute('aria-expanded', String(isHidden));
}

function activateGuideTab(tabId: string): void {
  document.querySelectorAll<HTMLButtonElement>('#guide-section [data-guide-tab]').forEach((t) => {
    const active = t.dataset.guideTab === tabId;
    t.classList.toggle('guide-tab--active', active);
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
    if (active) t.focus();
  });

  document.querySelectorAll<HTMLElement>('#guide-section [data-guide-panel]').forEach((p) => {
    p.hidden = p.dataset.guidePanel !== tabId;
  });
}

function handleGuideTabClick(e: Event): void {
  const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-guide-tab]');
  if (!tab) return;
  activateGuideTab(tab.dataset.guideTab!);
}

function handleGuideTabKeydown(e: KeyboardEvent): void {
  const tabs = Array.from(
    document.querySelectorAll<HTMLButtonElement>('#guide-section [data-guide-tab]'),
  );
  const current = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  let next = -1;

  if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = tabs.length - 1;
  else return;

  e.preventDefault();
  activateGuideTab(tabs[next].dataset.guideTab!);
}

async function handleGuideCopy(e: Event): Promise<void> {
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
    // Fallback: select text in the code block
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

async function handleLanguageChange(): Promise<void> {
  const locale = langSelect.value as Locale;
  i18n.setLocale(locale);
  applyI18n();

  try {
    await setLanguage(locale);
  } catch {
    // non-critical — UI already updated
  }
}

// ─── Keyboard support ────────────────────────────────────────────────────────

function handleUrlKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleApply();
  }
}

// ─── Init ────────────────────────────────────────────────────────────────────

function init(): void {
  // Cache DOM refs
  urlInput = $<HTMLInputElement>('url-input');
  btnApply = $<HTMLButtonElement>('btn-apply');
  btnShow = $<HTMLButtonElement>('btn-show');
  btnDefaults = $<HTMLButtonElement>('btn-defaults');
  statusEl = $('status');
  slideNumberEl = $('slide-number');
  langSelect = $<HTMLSelectElement>('lang-select');
  sliderWidth = $<HTMLInputElement>('slider-width');
  sliderHeight = $<HTMLInputElement>('slider-height');
  sliderZoom = $<HTMLInputElement>('slider-zoom');
  sliderWidthValue = $('slider-width-value');
  sliderHeightValue = $('slider-height-value');
  sliderZoomValue = $('slider-zoom-value');
  sizePreviewInner = $('size-preview-inner');
  chkAutoOpen = $<HTMLInputElement>('chk-auto-open');
  chkLockSize = $<HTMLInputElement>('chk-lock-size');
  sliderAutoClose = $<HTMLInputElement>('slider-autoclose');
  sliderAutoCloseValue = $('slider-autoclose-value');
  presetButtons = document.querySelectorAll<HTMLButtonElement>('.btn-preset');
  viewerStatusEl = $('viewer-status');
  viewerStatusText = $('viewer-status-text');

  // Restore saved language or detect
  const savedLang = getLanguage();
  if (savedLang) {
    i18n.setLocale(savedLang);
  }
  langSelect.value = i18n.getLocale();
  applyI18n();

  // Event listeners
  btnApply.addEventListener('click', handleApply);
  btnShow.addEventListener('click', handleShow);
  btnDefaults.addEventListener('click', handleSetDefaults);
  langSelect.addEventListener('change', handleLanguageChange);
  urlInput.addEventListener('keydown', handleUrlKeydown);
  sliderWidth.addEventListener('input', handleWidthInput);
  sliderHeight.addEventListener('input', handleHeightInput);
  sliderZoom.addEventListener('input', handleZoomInput);
  chkLockSize.addEventListener('change', handleLockSizeChange);
  sliderAutoClose.addEventListener('input', handleAutoCloseInput);
  $('btn-autoopen-info').addEventListener('click', handleAutoOpenInfoToggle);
  $('btn-autoclose-info').addEventListener('click', handleAutoCloseInfoToggle);
  document.querySelector('.zoom-presets')?.addEventListener('click', handlePresetClick);
  $('btn-guide-toggle').addEventListener('click', handleGuideToggle);
  document.querySelector('.guide-tabs')?.addEventListener('click', handleGuideTabClick);
  document.querySelector('.guide-tabs')?.addEventListener('keydown', handleGuideTabKeydown as EventListener);
  $('guide-section').addEventListener('click', handleGuideCopy);

  // Detect current slide & listen for changes (only inside PowerPoint)
  detectCurrentSlide();

  try {
    Office.context.document.addHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      () => { detectCurrentSlide(); },
    );
  } catch { /* outside Office host — slide detection unavailable */ }

  // Viewer message → update status indicator
  launcher.onMessage(handleViewerMessage);

  // Dialog closed (user closed window or navigation error) → update UI
  launcher.onClosed(handleViewerClosed);
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

installUnhandledRejectionHandler();
Office.onReady(() => init());
