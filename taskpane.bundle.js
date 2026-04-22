/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/shared/constants.ts"
/*!*********************************!*\
  !*** ./src/shared/constants.ts ***!
  \*********************************/
(__unused_webpack_module, exports) {


// ─── Setting keys ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEBUG = exports.URL_DISPLAY_MAX_LENGTH = exports.IFRAME_LOAD_TIMEOUT_MS = exports.SETTINGS_SAVE_RETRY_DELAY_MS = exports.SETTINGS_SAVE_MAX_RETRIES = exports.AUTO_CLOSE_STEPS = exports.AUTO_CLOSE_MAX_SEC = exports.DEFAULT_AUTO_CLOSE_SEC = exports.AUTO_OPEN_DELAY_STEPS = exports.DEFAULT_AUTO_OPEN_DELAY_SEC = exports.ZOOM_MAX = exports.ZOOM_MIN = exports.DEFAULT_AUTO_OPEN = exports.DEFAULT_DIALOG_HEIGHT = exports.DEFAULT_DIALOG_WIDTH = exports.DEFAULT_ZOOM = exports.SETTING_KEY_DEFAULTS = exports.SETTING_KEY_LANGUAGE = exports.SETTING_KEY_SLIDE_PREFIX = void 0;
exports.truncateUrl = truncateUrl;
/** Prefix for per-slide setting keys. Full key: `webppt_slide_{slideId}`. */
exports.SETTING_KEY_SLIDE_PREFIX = 'webppt_slide_';
/** Key for the saved UI language. */
exports.SETTING_KEY_LANGUAGE = 'webppt_language';
/** Key for global default slide config. */
exports.SETTING_KEY_DEFAULTS = 'webppt_defaults';
// ─── Viewer defaults ──────────────────────────────────────────────────────────
exports.DEFAULT_ZOOM = 100;
exports.DEFAULT_DIALOG_WIDTH = 100; // % of screen
exports.DEFAULT_DIALOG_HEIGHT = 100; // % of screen
exports.DEFAULT_AUTO_OPEN = true;
// ─── Constraint ranges ────────────────────────────────────────────────────────
exports.ZOOM_MIN = 50;
exports.ZOOM_MAX = 300;
// ─── Auto-open delay ─────────────────────────────────────────────────────────
exports.DEFAULT_AUTO_OPEN_DELAY_SEC = 0; // 0 = immediate
/**
 * Non-linear lookup table for the auto-open delay slider.
 * Index = slider position, value = seconds.
 * Range: 0–60s. Granularity: 1s up to 10s, then 5s up to 30s, then 10s up to 60s.
 */
exports.AUTO_OPEN_DELAY_STEPS = [
    // 0–10s, step 1  (11 values: indices 0–10)
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    // 10–60s, step 5  (10 values: indices 11–20)
    15, 20, 25, 30, 35, 40, 45, 50, 55, 60,
    // 1–3 min, step 15s  (8 values: indices 21–28)
    75, 90, 105, 120, 135, 150, 165, 180,
    // 3–5 min, step 30s  (4 values: indices 29–32)
    210, 240, 270, 300,
];
// ─── Auto-close ──────────────────────────────────────────────────────────────
exports.DEFAULT_AUTO_CLOSE_SEC = 0; // 0 = disabled
exports.AUTO_CLOSE_MAX_SEC = 3600;
/**
 * Non-linear lookup table for the auto-close slider.
 * Index = slider position, value = seconds.
 * Granularity decreases as values grow: 1s → 5s → 15s → 30s → 60s → 300s.
 */
exports.AUTO_CLOSE_STEPS = [
    // 0–10s, step 1  (11 values)
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    // 10–60s, step 5  (10 values)
    15, 20, 25, 30, 35, 40, 45, 50, 55, 60,
    // 1–3 min, step 15s  (8 values)
    75, 90, 105, 120, 135, 150, 165, 180,
    // 3–5 min, step 30s  (4 values)
    210, 240, 270, 300,
    // 5–10 min, step 60s  (5 values)
    360, 420, 480, 540, 600,
    // 10–60 min, step 300s  (10 values)
    900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600,
];
// ─── Error handling ──────────────────────────────────────────────────────────
exports.SETTINGS_SAVE_MAX_RETRIES = 2;
exports.SETTINGS_SAVE_RETRY_DELAY_MS = 1000;
exports.IFRAME_LOAD_TIMEOUT_MS = 10000;
exports.URL_DISPLAY_MAX_LENGTH = 60;
/** Truncate a URL for display, appending ellipsis if needed. */
function truncateUrl(url) {
    if (url.length <= exports.URL_DISPLAY_MAX_LENGTH)
        return url;
    return url.substring(0, exports.URL_DISPLAY_MAX_LENGTH - 1) + '\u2026';
}
// ─── Debug ───────────────────────────────────────────────────────────────────
/**
 * Set to `false` in production builds via webpack DefinePlugin.
 * Falls back to `true` so dev/test runs always log.
 */
exports.DEBUG = typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? "development" !== 'production'
    : true;


/***/ },

/***/ "./src/shared/dialog-launcher.ts"
/*!***************************************!*\
  !*** ./src/shared/dialog-launcher.ts ***!
  \***************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DialogLauncher = exports.DialogError = exports.VIEWER_PAGE = void 0;
exports._injectDialogApi = _injectDialogApi;
exports._injectBaseUrl = _injectBaseUrl;
const i18n_1 = __webpack_require__(/*! ./i18n */ "./src/shared/i18n.ts");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/shared/logger.ts");
// ─── Constants ───────────────────────────────────────────────────────────────
/** Filename of the viewer page built by webpack. */
exports.VIEWER_PAGE = 'viewer.html';
/** Office displayDialogAsync error codes. */
const OPEN_ERR = {
    /** A dialog is already opened from this add-in. */
    ALREADY_OPENED: 12007,
    /** User dismissed the dialog prompt / popup blocker. */
    POPUP_BLOCKED: 12009,
};
/** Typed error thrown by {@link DialogLauncher}. */
class DialogError extends Error {
    constructor(i18nKey, officeCode) {
        super(i18n_1.i18n.t(i18nKey));
        this.i18nKey = i18nKey;
        this.officeCode = officeCode;
        this.name = 'DialogError';
    }
}
exports.DialogError = DialogError;
// ─── Dependency injection ────────────────────────────────────────────────────
let _injectedApi = null;
let _injectedBaseUrl = null;
/**
 * Override the Office dialog API. Pass `null` to restore the real one.
 * @internal Used in unit tests only.
 */
function _injectDialogApi(api) {
    _injectedApi = api;
}
/**
 * Override the viewer base URL. Pass `null` to restore auto-detection.
 * @internal Used in unit tests only.
 */
function _injectBaseUrl(url) {
    _injectedBaseUrl = url;
}
function getApi() {
    if (_injectedApi)
        return _injectedApi;
    return Office.context.ui;
}
function getViewerBaseUrl() {
    if (_injectedBaseUrl)
        return _injectedBaseUrl;
    const dir = window.location.pathname.replace(/\/[^/]*$/, '');
    return `${window.location.origin}${dir}/${exports.VIEWER_PAGE}`;
}
// ─── DialogLauncher ──────────────────────────────────────────────────────────
class DialogLauncher {
    constructor() {
        this.dialog = null;
        this.messageCallback = null;
        this.closedCallback = null;
    }
    /** Build the full viewer URL with query parameters. */
    buildViewerUrl(config) {
        const params = new URLSearchParams({
            url: config.url,
            zoom: String(config.zoom),
            lang: config.lang,
        });
        if (config.autoCloseSec && config.autoCloseSec > 0) {
            params.set('autoclose', String(config.autoCloseSec));
        }
        if (config.slideshow) {
            params.set('slideshow', '1');
        }
        if (config.hideMethod && config.hideMethod !== 'none') {
            params.set('hide', config.hideMethod);
        }
        return `${getViewerBaseUrl()}?${params.toString()}`;
    }
    /**
     * Open the viewer dialog with the given configuration.
     * If a dialog is already open, closes it first and reopens.
     * Rejects with {@link DialogError} if the dialog cannot be opened.
     */
    async open(config) {
        // Auto-close any existing dialog before opening a new one
        if (this.dialog) {
            (0, logger_1.logDebug)('Closing existing dialog before opening a new one');
            this.close();
        }
        // Guard: check that displayDialogAsync is available
        const api = getApi();
        if (!api || typeof api.displayDialogAsync !== 'function') {
            throw new DialogError('dialogUnsupported');
        }
        const viewerUrl = this.buildViewerUrl(config);
        return this.tryOpen(api, viewerUrl, config, false);
    }
    /**
     * Attempt to open the dialog. If Office returns 12007 (already opened)
     * on the first try, wait briefly and retry once — the previous close()
     * may not have fully propagated yet.
     */
    tryOpen(api, viewerUrl, config, isRetry) {
        return new Promise((resolve, reject) => {
            api.displayDialogAsync(viewerUrl, {
                width: config.width,
                height: config.height,
                displayInIframe: false,
                promptBeforeOpen: false,
            }, (result) => {
                if (result.status === 'failed') {
                    // On first attempt, if Office says "already opened", retry once
                    if (result.error.code === OPEN_ERR.ALREADY_OPENED && !isRetry) {
                        (0, logger_1.logDebug)('Got 12007 (already opened) — retrying after delay');
                        setTimeout(() => {
                            this.tryOpen(api, viewerUrl, config, true).then(resolve, reject);
                        }, 300);
                        return;
                    }
                    (0, logger_1.logError)('displayDialogAsync failed:', result.error.code, result.error.message);
                    reject(this.mapOpenError(result.error.code));
                    return;
                }
                this.dialog = result.value;
                this.dialog.addEventHandler('dialogMessageReceived', (arg) => this.handleMessage(arg));
                this.dialog.addEventHandler('dialogEventReceived', (arg) => this.handleEvent(arg));
                (0, logger_1.logDebug)('Dialog opened successfully');
                resolve();
            });
        });
    }
    /** Close the dialog if it is open. Safe to call when already closed. */
    close() {
        if (!this.dialog)
            return;
        try {
            this.dialog.close();
        }
        catch (err) {
            (0, logger_1.logError)('Error closing dialog:', err);
        }
        this.dialog = null;
    }
    /**
     * Send a message from the host (taskpane/commands) to the dialog.
     * Uses DialogApi 1.2 `messageChild()`. Returns false if not supported.
     */
    sendMessage(message) {
        if (!this.dialog)
            return false;
        if (typeof this.dialog.messageChild !== 'function') {
            (0, logger_1.logDebug)('messageChild not available on this Office version');
            return false;
        }
        try {
            this.dialog.messageChild(message);
            return true;
        }
        catch (err) {
            (0, logger_1.logError)('messageChild failed:', err);
            return false;
        }
    }
    /** Whether the dialog is currently open. */
    isOpen() {
        return this.dialog !== null;
    }
    /** Subscribe to messages sent from the viewer via `Office.context.ui.messageParent`. */
    onMessage(callback) {
        this.messageCallback = callback;
    }
    /** Subscribe to the dialog being closed (by user or navigation error). */
    onClosed(callback) {
        this.closedCallback = callback;
    }
    // ─── Private handlers ────────────────────────────────────────────────────
    handleMessage(arg) {
        if (arg.message && this.messageCallback) {
            this.messageCallback(arg.message);
        }
    }
    handleEvent(arg) {
        // All DialogEventReceived codes (12002 closed, 12003 mixed content,
        // 12006 cross-domain) mean the dialog is no longer usable.
        (0, logger_1.logDebug)('Dialog event received, code:', arg.error);
        this.dialog = null;
        if (this.closedCallback) {
            this.closedCallback();
        }
    }
    mapOpenError(code) {
        switch (code) {
            case OPEN_ERR.ALREADY_OPENED:
                return new DialogError('dialogAlreadyOpen', code);
            case OPEN_ERR.POPUP_BLOCKED:
                return new DialogError('dialogBlocked', code);
            default:
                return new DialogError('errorGeneric', code);
        }
    }
}
exports.DialogLauncher = DialogLauncher;


/***/ },

/***/ "./src/shared/i18n.ts"
/*!****************************!*\
  !*** ./src/shared/i18n.ts ***!
  \****************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.i18n = void 0;
exports.parseLocale = parseLocale;
const locales_json_1 = __importDefault(__webpack_require__(/*! ../i18n/locales.json */ "./src/i18n/locales.json"));
/** Maps a BCP 47 language tag to a supported Locale. */
function parseLocale(langTag) {
    const tag = langTag.toLowerCase();
    if (tag.startsWith('zh'))
        return 'zh';
    if (tag.startsWith('es'))
        return 'es';
    if (tag.startsWith('de'))
        return 'de';
    if (tag.startsWith('fr'))
        return 'fr';
    if (tag.startsWith('it'))
        return 'it';
    if (tag.startsWith('ar'))
        return 'ar';
    if (tag.startsWith('pt'))
        return 'pt';
    if (tag.startsWith('hi'))
        return 'hi';
    if (tag.startsWith('ru'))
        return 'ru';
    return 'en';
}
class I18n {
    constructor() {
        this.listeners = new Set();
        this.locale = this.detectLocale();
    }
    detectLocale() {
        if (typeof navigator === 'undefined')
            return 'en';
        return parseLocale(navigator.language ?? 'en');
    }
    /** Translate a key in the current locale. Falls back to English, then the key itself. */
    t(key) {
        return (locales_json_1.default[this.locale][key] ??
            locales_json_1.default['en'][key] ??
            key);
    }
    getLocale() {
        return this.locale;
    }
    getAvailableLocales() {
        return ['en', 'zh', 'es', 'de', 'fr', 'it', 'ar', 'pt', 'hi', 'ru'];
    }
    /** Switch locale and notify all listeners. */
    setLocale(locale) {
        if (this.locale === locale)
            return;
        this.locale = locale;
        this.listeners.forEach((fn) => fn());
    }
    /**
     * Subscribe to locale changes.
     * @returns Unsubscribe function.
     */
    onLocaleChange(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}
/** Singleton i18n instance shared across the add-in. */
exports.i18n = new I18n();


/***/ },

/***/ "./src/shared/logger.ts"
/*!******************************!*\
  !*** ./src/shared/logger.ts ***!
  \******************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logDebug = logDebug;
exports.logWarn = logWarn;
exports.logError = logError;
exports.installUnhandledRejectionHandler = installUnhandledRejectionHandler;
const constants_1 = __webpack_require__(/*! ./constants */ "./src/shared/constants.ts");
const PREFIX = '[WebPPT]';
/* eslint-disable no-console */
/** Log debug info — no-op in production builds. */
function logDebug(...args) {
    if (constants_1.DEBUG)
        console.log(PREFIX, ...args);
}
/** Log warnings — no-op in production builds. */
function logWarn(...args) {
    if (constants_1.DEBUG)
        console.warn(PREFIX, ...args);
}
/** Log errors — no-op in production builds. */
function logError(...args) {
    if (constants_1.DEBUG)
        console.error(PREFIX, ...args);
}
/* eslint-enable no-console */
/**
 * Install a global handler for unhandled promise rejections.
 * Call once per entry point (taskpane, viewer, commands).
 */
function installUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
        logError('Unhandled promise rejection:', event.reason);
        event.preventDefault();
    });
}


/***/ },

/***/ "./src/shared/settings.ts"
/*!********************************!*\
  !*** ./src/shared/settings.ts ***!
  \********************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._injectSettingsStore = _injectSettingsStore;
exports.getSlideConfig = getSlideConfig;
exports.setSlideConfig = setSlideConfig;
exports.removeSlideConfig = removeSlideConfig;
exports.getLanguage = getLanguage;
exports.setLanguage = setLanguage;
exports.getDefaults = getDefaults;
exports.setDefaults = setDefaults;
const constants_1 = __webpack_require__(/*! ./constants */ "./src/shared/constants.ts");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/shared/logger.ts");
// ─── Dependency injection (for testing) ──────────────────────────────────────
let _injectedStore = null;
/**
 * Override the Office settings store. Pass `null` to restore the real one.
 * @internal Used in unit tests only.
 */
function _injectSettingsStore(store) {
    _injectedStore = store;
}
/** In-memory fallback when running outside PowerPoint (e.g. browser testing). */
const _memoryStore = (() => {
    const data = new Map();
    return {
        get: (name) => data.get(name) ?? null,
        set: (name, value) => { data.set(name, value); },
        remove: (name) => { data.delete(name); },
        saveAsync: (cb) => { cb({ status: 'succeeded', error: null }); },
    };
})();
function getStore() {
    if (_injectedStore)
        return _injectedStore;
    /* global Office */
    try {
        const settings = Office.context?.document?.settings;
        if (settings)
            return settings;
    }
    catch { /* outside Office host */ }
    return _memoryStore;
}
// ─── Internal helpers ─────────────────────────────────────────────────────────
function slideKey(slideId) {
    return `${constants_1.SETTING_KEY_SLIDE_PREFIX}${slideId}`;
}
function saveOnce(store) {
    return new Promise((resolve, reject) => {
        store.saveAsync((result) => {
            if (result.status === 'failed') {
                reject(new Error(result.error?.message ?? 'Settings save failed'));
            }
            else {
                resolve();
            }
        });
    });
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Save settings with automatic retry.
 * Retries up to {@link SETTINGS_SAVE_MAX_RETRIES} times with a delay between attempts.
 */
async function save(store) {
    for (let attempt = 0; attempt <= constants_1.SETTINGS_SAVE_MAX_RETRIES; attempt++) {
        try {
            await saveOnce(store);
            return;
        }
        catch (err) {
            if (attempt < constants_1.SETTINGS_SAVE_MAX_RETRIES) {
                (0, logger_1.logDebug)(`Settings save attempt ${attempt + 1} failed, retrying...`);
                await delay(constants_1.SETTINGS_SAVE_RETRY_DELAY_MS);
            }
            else {
                (0, logger_1.logError)('Settings save failed after all retries:', err);
                throw err;
            }
        }
    }
}
// ─── Slide config ─────────────────────────────────────────────────────────────
/** Returns the saved config for a slide, or `null` if not set. */
function getSlideConfig(slideId) {
    const raw = getStore().get(slideKey(slideId));
    return raw ? raw : null;
}
/** Saves config for a slide and persists to document. */
async function setSlideConfig(slideId, config) {
    const store = getStore();
    store.set(slideKey(slideId), config);
    await save(store);
}
/** Removes the saved config for a slide. */
async function removeSlideConfig(slideId) {
    const store = getStore();
    store.remove(slideKey(slideId));
    await save(store);
}
// ─── Language ─────────────────────────────────────────────────────────────────
/** Returns the saved UI language, or `null` if not set. */
function getLanguage() {
    return getStore().get(constants_1.SETTING_KEY_LANGUAGE) ?? null;
}
/** Saves the UI language and persists to document. */
async function setLanguage(locale) {
    const store = getStore();
    store.set(constants_1.SETTING_KEY_LANGUAGE, locale);
    await save(store);
}
// ─── Defaults ─────────────────────────────────────────────────────────────────
/** Returns saved global defaults, or built-in defaults if not set. */
function getDefaults() {
    const stored = getStore().get(constants_1.SETTING_KEY_DEFAULTS);
    return stored ?? {
        url: '',
        zoom: constants_1.DEFAULT_ZOOM,
        dialogWidth: constants_1.DEFAULT_DIALOG_WIDTH,
        dialogHeight: constants_1.DEFAULT_DIALOG_HEIGHT,
        autoOpen: constants_1.DEFAULT_AUTO_OPEN,
        autoOpenDelaySec: constants_1.DEFAULT_AUTO_OPEN_DELAY_SEC,
        autoCloseSec: constants_1.DEFAULT_AUTO_CLOSE_SEC,
    };
}
/** Saves global defaults and persists to document. */
async function setDefaults(config) {
    const store = getStore();
    store.set(constants_1.SETTING_KEY_DEFAULTS, config);
    await save(store);
}


/***/ },

/***/ "./src/i18n/locales.json"
/*!*******************************!*\
  !*** ./src/i18n/locales.json ***!
  \*******************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"en":{"insertWebPage":"Add WebPage.PPT","editPageProperty":"Edit Page Property","enterUrl":"Enter URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Window size","autoOpen":"Auto-open on slide change","showWebPage":"Show WebPage.PPT","ownSiteBlocked":"Is this your own site?","showSetupGuide":"Show setup guide","openDirectly":"Open directly (no frame)","apply":"Apply","cancel":"Cancel","language":"Language","iframeBlocked":"This site blocks embedding.","iframeBlockedHint":"If this is your site, you can fix it in one line.","noUrl":"Please enter a valid URL","noUrlForSlide":"No URL configured for this slide","success":"Settings saved","errorGeneric":"Something went wrong. Please try again.","dialogAlreadyOpen":"A web page viewer is already open.","dialogBlocked":"The viewer was blocked. Please allow pop-ups for this site.","openInBrowser":"Open in browser","guideTitle":"How to allow embedding","guideIntro":"Add one of these snippets to the server that hosts the linked page:","guideNote":"Restart your server and reload the slide after making changes.","copy":"Copy","copied":"Copied!","hideSetupGuide":"Hide guide","slideLabel":"Slide","dialogWidth":"Width","dialogHeight":"Height","lockSize":"Lock proportions","setAsDefaults":"Save as defaults for new slides","defaultsSaved":"Default settings saved for new slides","siteNotLoading":"Site not loading?","guideMetaNote":"Note: frame-ancestors in a meta tag may be ignored if the server already sets X-Frame-Options headers.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"What is X-Frame-Options?","guideFaqXFrameA":"An HTTP header that controls whether your site can be shown inside an iframe. Some servers set it to DENY or SAMEORIGIN by default, blocking embedding.","guideFaqUnknownServerQ":"I don\'t know which server I have","guideFaqUnknownServerA":"Check your project files: nginx.conf → Nginx, .htaccess → Apache, app.js or server.js → Node.js/Express. For shared hosting, ask your provider.","guideFaqNoAccessQ":"I don\'t have server access","guideFaqNoAccessA":"Use the \\"Open directly\\" button in the viewer — it opens the page in a full browser window without iframe restrictions.","viewerLoading":"Loading page…","viewerLoaded":"Page loaded","viewerBlocked":"Site blocked embedding","viewerError":"Page failed to load","viewerClosed":"Viewer closed","help":"Help","infoTooltip":"Info","noInternet":"No internet connection. Check your connection and try again.","loadTimeout":"The page is taking too long to load.","dialogUnsupported":"Your version of Office does not support the viewer window. Please update Office.","settingsSaveRetryFailed":"Could not save settings. Please try again later.","selectSlide":"Please select a slide first.","urlAutoFixed":"Added https:// to the URL.","autoOpenDelay":"Open after","autoOpenDelayImmediate":"0s","autoClose":"Auto-close after","autoCloseOff":"Off","countdownText":"Closes in {n}s","autoCloseHint":"The web page window captures focus from PowerPoint. While it is open, your clicker/remote will not work — you won\'t be able to close the slide or switch to the next one. You will need to use the keyboard or mouse on the computer running PowerPoint. Auto-close returns focus automatically after the set time (the link will be displayed for that duration, and the clicker won\'t work during this period). Once the window closes, clicker control is restored. Plan how long you need to present the linked content and set the timer accordingly.","autoOpenHint":"When enabled, the web page opens automatically each time you navigate to this slide during a presentation. You don\'t need to click \\"Show Web Page\\" manually — the viewer appears as soon as the slide is displayed. Especially useful when the presentation is controlled by a clicker/remote.","howToUse":"How to use","howToUseHint":"Showing the web page on the audience screen (projector):\\n\\n1. Start the Slide Show.\\n2. Press Alt+Tab, switch to the PowerPoint editing window (with the Ribbon), and minimize it (Win+↓).\\n\\nPresenter View (Use Presenter View — ON):\\nClick in the Slide Show window — the one your audience sees — to give it focus. Then use your keyboard or clicker.\\n\\nDuplicate Slide Show (Duplicate Slide Show — ON):\\nNo extra steps needed.\\n\\nSingle monitor: the web page opens on top of the presentation.","guideImageTitle":"Option 1: Link to an image","guideImageDesc":"If your site can export content as an image (.png, .jpg, .webp, .gif, .svg), paste the direct URL to the image file. No server changes needed — the image displays without an iframe, refreshes automatically each time the slide is shown, and focus returns to PowerPoint so your clicker/remote keeps working.","guideServerTitle":"Option 2: Allow iframe embedding"},"zh":{"insertWebPage":"添加 WebPage.PPT","editPageProperty":"编辑页面属性","enterUrl":"输入 URL","urlPlaceholder":"https://example.com","zoom":"缩放","dialogSize":"窗口大小","autoOpen":"切换幻灯片时自动打开","showWebPage":"显示 WebPage.PPT","ownSiteBlocked":"这是您自己的网站吗？","showSetupGuide":"显示设置指南","openDirectly":"直接打开（无框架）","apply":"应用","cancel":"取消","language":"语言","iframeBlocked":"此网站阻止嵌入。","iframeBlockedHint":"如果这是您的网站，一行代码即可修复。","noUrl":"请输入有效的 URL","noUrlForSlide":"此幻灯片未配置 URL","success":"设置已保存","errorGeneric":"出现问题，请重试。","dialogAlreadyOpen":"网页查看器已打开。","dialogBlocked":"查看器被阻止。请允许此站点的弹出窗口。","openInBrowser":"在浏览器中打开","guideTitle":"如何允许嵌入","guideIntro":"将以下代码片段之一添加到托管链接页面的服务器：","guideNote":"更改后请重启服务器并重新加载幻灯片。","copy":"复制","copied":"已复制！","hideSetupGuide":"隐藏指南","slideLabel":"幻灯片","dialogWidth":"宽度","dialogHeight":"高度","lockSize":"锁定比例","setAsDefaults":"保存为新幻灯片的默认设置","defaultsSaved":"已保存新幻灯片的默认设置","siteNotLoading":"网站无法加载？","guideMetaNote":"注意：如果服务器已设置 X-Frame-Options 头，meta 标签中的 frame-ancestors 可能被忽略。","guideFaqTitle":"常见问题","guideFaqXFrameQ":"什么是 X-Frame-Options？","guideFaqXFrameA":"一种 HTTP 头，控制您的网站是否可以在 iframe 中显示。某些服务器默认设置为 DENY 或 SAMEORIGIN，从而阻止嵌入。","guideFaqUnknownServerQ":"我不知道我的服务器类型","guideFaqUnknownServerA":"检查项目文件：nginx.conf → Nginx，.htaccess → Apache，app.js 或 server.js → Node.js/Express。共享主机请咨询提供商。","guideFaqNoAccessQ":"我没有服务器访问权限","guideFaqNoAccessA":"使用查看器中的「直接打开」按钮——它会在完整的浏览器窗口中打开页面，没有 iframe 限制。","viewerLoading":"正在加载页面…","viewerLoaded":"页面已加载","viewerBlocked":"网站阻止了嵌入","viewerError":"页面加载失败","viewerClosed":"查看器已关闭","help":"帮助","infoTooltip":"信息","noInternet":"无网络连接。请检查连接后重试。","loadTimeout":"页面加载时间过长。","dialogUnsupported":"您的 Office 版本不支持查看器窗口。请更新 Office。","settingsSaveRetryFailed":"无法保存设置。请稍后重试。","selectSlide":"请先选择一张幻灯片。","urlAutoFixed":"已为 URL 添加 https://。","autoOpenDelay":"打开延迟","autoOpenDelayImmediate":"0秒","autoClose":"自动关闭时间","autoCloseOff":"关闭","countdownText":"{n}秒后关闭","autoCloseHint":"网页窗口会从 PowerPoint 获取焦点。窗口打开时，演示遥控器/翻页器无法工作——您无法关闭幻灯片或切换到下一张。您需要使用运行 PowerPoint 的电脑的键盘或鼠标。自动关闭会在设定时间后自动返回焦点（链接会在此期间显示，翻页器在此期间不工作）。窗口关闭后，翻页器恢复控制。请规划您需要展示链接内容的时间并相应设置计时器。","autoOpenHint":"启用后，演示过程中每次切换到此幻灯片时，网页会自动打开。无需手动点击「显示网页」——幻灯片显示时查看器会自动出现。使用遥控器/翻页器控制演示时特别有用。","howToUse":"使用说明","howToUseHint":"在观众屏幕（投影仪）上显示网页：\\n\\n1. 启动幻灯片放映（Slide Show）。\\n2. 按 Alt+Tab，切换到 PowerPoint 编辑窗口（带功能区 Ribbon），将其最小化（Win+↓）。\\n\\n演示者视图（Use Presenter View — 开启）：\\n点击观众看到的幻灯片放映窗口（Slide Show），使其获得焦点。然后用键盘或翻页笔切换幻灯片。\\n\\n复制幻灯片放映（Duplicate Slide Show — 开启）：\\n无需额外操作。\\n\\n单显示器：网页将在演示文稿上方打开。","guideImageTitle":"选项 1：链接到图片","guideImageDesc":"如果您的网站可以将内容导出为图片（.png、.jpg、.webp、.gif、.svg），请粘贴图片文件的直接 URL。无需更改服务器——图片无需 iframe 即可显示，每次显示幻灯片时自动刷新，焦点会返回 PowerPoint，您的遥控器/翻页器可继续使用。","guideServerTitle":"选项 2：允许 iframe 嵌入"},"es":{"insertWebPage":"Añadir WebPage.PPT","editPageProperty":"Propiedades de página","enterUrl":"Ingrese la URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Tamaño de ventana","autoOpen":"Abrir al cambiar de diapositiva","showWebPage":"Mostrar WebPage.PPT","ownSiteBlocked":"¿Es su propio sitio?","showSetupGuide":"Mostrar guía","openDirectly":"Abrir directamente (sin marco)","apply":"Aplicar","cancel":"Cancelar","language":"Idioma","iframeBlocked":"Este sitio bloquea la incrustación.","iframeBlockedHint":"Si es su sitio, se arregla en una línea.","noUrl":"Ingrese una URL válida","noUrlForSlide":"No hay URL configurada para esta diapositiva","success":"Configuración guardada","errorGeneric":"Algo salió mal. Inténtelo de nuevo.","dialogAlreadyOpen":"Ya hay una ventana de visor abierta.","dialogBlocked":"La ventana fue bloqueada. Permita ventanas emergentes para este sitio.","openInBrowser":"Abrir en navegador","guideTitle":"Cómo permitir la incrustación","guideIntro":"Agregue uno de estos fragmentos al servidor que aloja la página enlazada:","guideNote":"Reinicie su servidor y recargue la diapositiva después de los cambios.","copy":"Copiar","copied":"¡Copiado!","hideSetupGuide":"Ocultar guía","slideLabel":"Diapositiva","dialogWidth":"Ancho","dialogHeight":"Alto","lockSize":"Vincular proporciones","setAsDefaults":"Guardar como ajustes predeterminados para nuevas diapositivas","defaultsSaved":"Ajustes predeterminados guardados","siteNotLoading":"¿El sitio no carga?","guideMetaNote":"Nota: frame-ancestors en una etiqueta meta puede no funcionar si el servidor ya establece encabezados X-Frame-Options.","guideFaqTitle":"Preguntas frecuentes","guideFaqXFrameQ":"¿Qué es X-Frame-Options?","guideFaqXFrameA":"Un encabezado HTTP que controla si su sitio puede mostrarse dentro de un iframe. Algunos servidores lo configuran como DENY o SAMEORIGIN por defecto.","guideFaqUnknownServerQ":"No sé qué servidor tengo","guideFaqUnknownServerA":"Revise los archivos del proyecto: nginx.conf → Nginx, .htaccess → Apache, app.js o server.js → Node.js/Express. En hosting compartido, pregunte a su proveedor.","guideFaqNoAccessQ":"No tengo acceso al servidor","guideFaqNoAccessA":"Use el botón \\"Abrir directamente\\" en el visor — abre la página en una ventana completa del navegador sin restricciones de iframe.","viewerLoading":"Cargando página…","viewerLoaded":"Página cargada","viewerBlocked":"El sitio bloquea la incrustación","viewerError":"No se pudo cargar la página","viewerClosed":"Visor cerrado","help":"Ayuda","infoTooltip":"Info","noInternet":"Sin conexión a Internet. Verifique su conexión e inténtelo de nuevo.","loadTimeout":"La página tarda demasiado en cargar.","dialogUnsupported":"Su versión de Office no soporta la ventana de visor. Actualice Office.","settingsSaveRetryFailed":"No se pudieron guardar los ajustes. Inténtelo más tarde.","selectSlide":"Primero seleccione una diapositiva.","urlAutoFixed":"Se añadió https:// a la URL.","autoOpenDelay":"Abrir después de","autoOpenDelayImmediate":"0s","autoClose":"Cerrar después de","autoCloseOff":"Desact.","countdownText":"Se cierra en {n}s","autoCloseHint":"La ventana de la página web captura el foco de PowerPoint. Mientras está abierta, el control remoto/clicker no funcionará: no podrá cerrar la diapositiva ni pasar a la siguiente. Deberá usar el teclado o ratón del ordenador con PowerPoint. El cierre automático devuelve el foco automáticamente después del tiempo configurado (el enlace se mostrará durante ese período y el clicker no funcionará). Una vez cerrada la ventana, el control vuelve al clicker. Planifique cuánto tiempo necesita para presentar el contenido del enlace y ajuste el temporizador.","autoOpenHint":"Si está activado, la página web se abre automáticamente cada vez que navega a esta diapositiva durante la presentación. No necesita pulsar \\"Mostrar página web\\" manualmente — el visor aparece en cuanto se muestra la diapositiva. Especialmente útil cuando la presentación se controla con un clicker/mando.","howToUse":"Cómo usar","howToUseHint":"Mostrar la página web en la pantalla del público (proyector):\\n\\n1. Inicie la presentación (Slide Show).\\n2. Pulse Alt+Tab, cambie a la ventana de edición de PowerPoint (con la cinta, Ribbon) y minimícela (Win+↓).\\n\\nVista del presentador (Use Presenter View — activado):\\nHaga clic en la ventana Presentación (Slide Show) que ve el público para darle el foco. Luego use el teclado o el mando a distancia.\\n\\nDuplicar presentación (Duplicate Slide Show — activado):\\nNo se requieren pasos adicionales.\\n\\nUn monitor: la página web se abre sobre la presentación.","guideImageTitle":"Opción 1: Enlace a una imagen","guideImageDesc":"Si su sitio puede exportar contenido como imagen (.png, .jpg, .webp, .gif, .svg), pegue la URL directa del archivo. No requiere cambios en el servidor — la imagen se muestra sin iframe, se actualiza automáticamente cada vez que se muestra la diapositiva, y el foco vuelve a PowerPoint para que su clicker/mando siga funcionando.","guideServerTitle":"Opción 2: Permitir la incrustación en iframe"},"de":{"insertWebPage":"WebPage.PPT hinzufügen","editPageProperty":"Seiteneigenschaften bearbeiten","enterUrl":"URL eingeben","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Fenstergröße","autoOpen":"Beim Folienwechsel automatisch öffnen","showWebPage":"WebPage.PPT anzeigen","ownSiteBlocked":"Ist das Ihre eigene Website?","showSetupGuide":"Anleitung anzeigen","openDirectly":"Direkt öffnen (ohne Rahmen)","apply":"Anwenden","cancel":"Abbrechen","language":"Sprache","iframeBlocked":"Diese Website blockiert die Einbettung.","iframeBlockedHint":"Wenn es Ihre Website ist, lässt sich das mit einer Zeile beheben.","noUrl":"Bitte geben Sie eine gültige URL ein","noUrlForSlide":"Für diese Folie ist keine URL konfiguriert","success":"Einstellungen gespeichert","errorGeneric":"Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.","dialogAlreadyOpen":"Ein Webseiten-Viewer ist bereits geöffnet.","dialogBlocked":"Der Viewer wurde blockiert. Bitte erlauben Sie Pop-ups für diese Website.","openInBrowser":"Im Browser öffnen","guideTitle":"Einbettung erlauben","guideIntro":"Fügen Sie einen dieser Code-Schnipsel zum Server hinzu, der die verlinkte Seite hostet:","guideNote":"Starten Sie Ihren Server neu und laden Sie die Folie nach den Änderungen neu.","copy":"Kopieren","copied":"Kopiert!","hideSetupGuide":"Anleitung ausblenden","slideLabel":"Folie","dialogWidth":"Breite","dialogHeight":"Höhe","lockSize":"Proportionen sperren","setAsDefaults":"Als Standard für neue Folien speichern","defaultsSaved":"Standardeinstellungen für neue Folien gespeichert","siteNotLoading":"Website lädt nicht?","guideMetaNote":"Hinweis: frame-ancestors in einem Meta-Tag wird möglicherweise ignoriert, wenn der Server bereits X-Frame-Options-Header setzt.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"Was ist X-Frame-Options?","guideFaqXFrameA":"Ein HTTP-Header, der steuert, ob Ihre Website in einem iframe angezeigt werden kann. Einige Server setzen ihn standardmäßig auf DENY oder SAMEORIGIN.","guideFaqUnknownServerQ":"Ich weiß nicht, welchen Server ich habe","guideFaqUnknownServerA":"Prüfen Sie Ihre Projektdateien: nginx.conf → Nginx, .htaccess → Apache, app.js oder server.js → Node.js/Express. Bei Shared Hosting fragen Sie Ihren Anbieter.","guideFaqNoAccessQ":"Ich habe keinen Serverzugang","guideFaqNoAccessA":"Verwenden Sie die Schaltfläche \\"Direkt öffnen\\" im Viewer — sie öffnet die Seite in einem vollständigen Browserfenster ohne iframe-Einschränkungen.","viewerLoading":"Seite wird geladen…","viewerLoaded":"Seite geladen","viewerBlocked":"Website blockiert die Einbettung","viewerError":"Seite konnte nicht geladen werden","viewerClosed":"Viewer geschlossen","help":"Hilfe","infoTooltip":"Info","noInternet":"Keine Internetverbindung. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.","loadTimeout":"Die Seite braucht zu lange zum Laden.","dialogUnsupported":"Ihre Office-Version unterstützt das Viewer-Fenster nicht. Bitte aktualisieren Sie Office.","settingsSaveRetryFailed":"Einstellungen konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.","selectSlide":"Bitte wählen Sie zuerst eine Folie aus.","urlAutoFixed":"https:// wurde zur URL hinzugefügt.","autoOpenDelay":"Öffnen nach","autoOpenDelayImmediate":"0s","autoClose":"Automatisch schließen nach","autoCloseOff":"Aus","countdownText":"Schließt in {n}s","autoCloseHint":"Das Webseiten-Fenster übernimmt den Fokus von PowerPoint. Solange es geöffnet ist, funktioniert Ihr Clicker/Fernbedienung nicht — Sie können die Folie nicht schließen oder zur nächsten wechseln. Sie müssen Tastatur oder Maus am PowerPoint-Computer verwenden. Automatisches Schließen gibt den Fokus nach der eingestellten Zeit automatisch zurück (der Link wird während dieser Zeit angezeigt, der Clicker funktioniert nicht). Nach dem Schließen wird die Clicker-Steuerung wiederhergestellt. Planen Sie, wie lange Sie den verlinkten Inhalt präsentieren möchten, und stellen Sie den Timer entsprechend ein.","autoOpenHint":"Wenn aktiviert, öffnet sich die Webseite automatisch jedes Mal, wenn Sie während einer Präsentation zu dieser Folie navigieren. Sie müssen nicht manuell \\"Webseite anzeigen\\" klicken — der Viewer erscheint sofort bei Anzeige der Folie. Besonders nützlich bei Steuerung mit Clicker/Fernbedienung.","howToUse":"Anleitung","howToUseHint":"Webseite auf dem Bildschirm des Publikums (Projektor) anzeigen:\\n\\n1. Starten Sie die Bildschirmpräsentation (Slide Show).\\n2. Drücken Sie Alt+Tab, wechseln Sie zum PowerPoint-Bearbeitungsfenster (mit dem Menüband, Ribbon) und minimieren Sie es (Win+↓).\\n\\nReferentenansicht (Use Presenter View — AN):\\nKlicken Sie in das Präsentationsfenster (Slide Show) — das, was das Publikum sieht — um den Fokus darauf zu legen. Dann wechseln Sie Folien mit Tastatur oder Klicker.\\n\\nBildschirmpräsentation duplizieren (Duplicate Slide Show — AN):\\nKeine weiteren Schritte erforderlich.\\n\\nEin Monitor: Die Webseite öffnet sich über der Präsentation.","guideImageTitle":"Option 1: Link zu einem Bild","guideImageDesc":"Wenn Ihre Website Inhalte als Bild exportieren kann (.png, .jpg, .webp, .gif, .svg), fügen Sie die direkte URL zur Bilddatei ein. Keine Serveränderungen nötig — das Bild wird ohne iframe angezeigt, aktualisiert sich bei jedem Folienwechsel automatisch, und der Fokus kehrt zu PowerPoint zurück, sodass Ihr Clicker/Fernbedienung weiter funktioniert.","guideServerTitle":"Option 2: iframe-Einbettung erlauben"},"fr":{"insertWebPage":"Ajouter WebPage.PPT","editPageProperty":"Propriétés de la page","enterUrl":"Entrez l\'URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Taille de la fenêtre","autoOpen":"Ouvrir automatiquement au changement de diapositive","showWebPage":"Afficher WebPage.PPT","ownSiteBlocked":"Est-ce votre propre site ?","showSetupGuide":"Afficher le guide","openDirectly":"Ouvrir directement (sans cadre)","apply":"Appliquer","cancel":"Annuler","language":"Langue","iframeBlocked":"Ce site bloque l\'intégration.","iframeBlockedHint":"Si c\'est votre site, cela se corrige en une ligne.","noUrl":"Veuillez entrer une URL valide","noUrlForSlide":"Aucune URL configurée pour cette diapositive","success":"Paramètres enregistrés","errorGeneric":"Une erreur s\'est produite. Veuillez réessayer.","dialogAlreadyOpen":"Une fenêtre de visualisation est déjà ouverte.","dialogBlocked":"La fenêtre a été bloquée. Veuillez autoriser les pop-ups pour ce site.","openInBrowser":"Ouvrir dans le navigateur","guideTitle":"Comment autoriser l\'intégration","guideIntro":"Ajoutez l\'un de ces extraits au serveur qui héberge la page liée :","guideNote":"Redémarrez votre serveur et rechargez la diapositive après les modifications.","copy":"Copier","copied":"Copié !","hideSetupGuide":"Masquer le guide","slideLabel":"Diapositive","dialogWidth":"Largeur","dialogHeight":"Hauteur","lockSize":"Verrouiller les proportions","setAsDefaults":"Enregistrer comme paramètres par défaut pour les nouvelles diapositives","defaultsSaved":"Paramètres par défaut enregistrés pour les nouvelles diapositives","siteNotLoading":"Le site ne charge pas ?","guideMetaNote":"Remarque : frame-ancestors dans une balise meta peut être ignoré si le serveur définit déjà des en-têtes X-Frame-Options.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"Qu\'est-ce que X-Frame-Options ?","guideFaqXFrameA":"Un en-tête HTTP qui contrôle si votre site peut être affiché dans un iframe. Certains serveurs le configurent par défaut sur DENY ou SAMEORIGIN.","guideFaqUnknownServerQ":"Je ne sais pas quel serveur j\'ai","guideFaqUnknownServerA":"Vérifiez vos fichiers de projet : nginx.conf → Nginx, .htaccess → Apache, app.js ou server.js → Node.js/Express. Pour l\'hébergement mutualisé, demandez à votre fournisseur.","guideFaqNoAccessQ":"Je n\'ai pas accès au serveur","guideFaqNoAccessA":"Utilisez le bouton \\"Ouvrir directement\\" dans le visualiseur — il ouvre la page dans une fenêtre de navigateur complète sans restrictions iframe.","viewerLoading":"Chargement de la page…","viewerLoaded":"Page chargée","viewerBlocked":"Le site bloque l\'intégration","viewerError":"Échec du chargement de la page","viewerClosed":"Visualiseur fermé","help":"Aide","infoTooltip":"Info","noInternet":"Pas de connexion Internet. Vérifiez votre connexion et réessayez.","loadTimeout":"La page met trop de temps à charger.","dialogUnsupported":"Votre version d\'Office ne prend pas en charge la fenêtre de visualisation. Veuillez mettre à jour Office.","settingsSaveRetryFailed":"Impossible d\'enregistrer les paramètres. Veuillez réessayer plus tard.","selectSlide":"Veuillez d\'abord sélectionner une diapositive.","urlAutoFixed":"https:// a été ajouté à l\'URL.","autoOpenDelay":"Ouvrir après","autoOpenDelayImmediate":"0s","autoClose":"Fermeture automatique après","autoCloseOff":"Désactivé","countdownText":"Fermeture dans {n}s","autoCloseHint":"La fenêtre de page web capture le focus de PowerPoint. Tant qu\'elle est ouverte, votre clicker/télécommande ne fonctionnera pas — vous ne pourrez pas fermer la diapositive ou passer à la suivante. Vous devrez utiliser le clavier ou la souris de l\'ordinateur exécutant PowerPoint. La fermeture automatique rend le focus automatiquement après le temps défini (le lien sera affiché pendant cette durée, le clicker ne fonctionnera pas). Une fois la fenêtre fermée, le contrôle du clicker est restauré. Prévoyez combien de temps vous avez besoin pour présenter le contenu lié et réglez le minuteur en conséquence.","autoOpenHint":"Lorsqu\'activé, la page web s\'ouvre automatiquement chaque fois que vous naviguez vers cette diapositive pendant une présentation. Pas besoin de cliquer \\"Afficher la page web\\" manuellement — le visualiseur apparaît dès que la diapositive est affichée. Particulièrement utile lorsque la présentation est contrôlée par un clicker/télécommande.","howToUse":"Mode d\'emploi","howToUseHint":"Afficher la page web sur l\'écran du public (projecteur) :\\n\\n1. Lancez le diaporama (Slide Show).\\n2. Appuyez sur Alt+Tab, passez à la fenêtre d\'édition PowerPoint (avec le ruban, Ribbon) et réduisez-la (Win+↓).\\n\\nMode Présentateur (Use Presenter View — activé) :\\nCliquez dans la fenêtre du diaporama (Slide Show) — celle que voit le public — pour lui donner le focus. Utilisez ensuite le clavier ou la télécommande.\\n\\nDupliquer le diaporama (Duplicate Slide Show — activé) :\\nAucune étape supplémentaire n\'est requise.\\n\\nUn seul écran : la page web s\'ouvre par-dessus la présentation.","guideImageTitle":"Option 1 : Lien vers une image","guideImageDesc":"Si votre site peut exporter du contenu sous forme d\'image (.png, .jpg, .webp, .gif, .svg), collez l\'URL directe du fichier image. Aucune modification du serveur nécessaire — l\'image s\'affiche sans iframe, se rafraîchit automatiquement à chaque affichage de la diapositive, et le focus revient à PowerPoint pour que votre clicker/télécommande continue de fonctionner.","guideServerTitle":"Option 2 : Autoriser l\'intégration iframe"},"it":{"insertWebPage":"Aggiungi WebPage.PPT","editPageProperty":"Proprietà pagina","enterUrl":"Inserisci URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Dimensione finestra","autoOpen":"Apri automaticamente al cambio diapositiva","showWebPage":"Mostra WebPage.PPT","ownSiteBlocked":"È il tuo sito web?","showSetupGuide":"Mostra guida","openDirectly":"Apri direttamente (senza cornice)","apply":"Applica","cancel":"Annulla","language":"Lingua","iframeBlocked":"Questo sito blocca l\'incorporamento.","iframeBlockedHint":"Se è il tuo sito, si risolve con una riga.","noUrl":"Inserisci un URL valido","noUrlForSlide":"Nessun URL configurato per questa diapositiva","success":"Impostazioni salvate","errorGeneric":"Qualcosa è andato storto. Riprova.","dialogAlreadyOpen":"Una finestra di visualizzazione è già aperta.","dialogBlocked":"La finestra è stata bloccata. Consenti i pop-up per questo sito.","openInBrowser":"Apri nel browser","guideTitle":"Come consentire l\'incorporamento","guideIntro":"Aggiungi uno di questi frammenti al server che ospita la pagina collegata:","guideNote":"Riavvia il server e ricarica la diapositiva dopo le modifiche.","copy":"Copia","copied":"Copiato!","hideSetupGuide":"Nascondi guida","slideLabel":"Diapositiva","dialogWidth":"Larghezza","dialogHeight":"Altezza","lockSize":"Blocca proporzioni","setAsDefaults":"Salva come impostazioni predefinite per nuove diapositive","defaultsSaved":"Impostazioni predefinite salvate per nuove diapositive","siteNotLoading":"Il sito non si carica?","guideMetaNote":"Nota: frame-ancestors in un tag meta potrebbe essere ignorato se il server imposta già gli header X-Frame-Options.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"Cos\'è X-Frame-Options?","guideFaqXFrameA":"Un header HTTP che controlla se il tuo sito può essere mostrato in un iframe. Alcuni server lo impostano su DENY o SAMEORIGIN per impostazione predefinita.","guideFaqUnknownServerQ":"Non so quale server ho","guideFaqUnknownServerA":"Controlla i file del progetto: nginx.conf → Nginx, .htaccess → Apache, app.js o server.js → Node.js/Express. Per hosting condiviso, chiedi al tuo provider.","guideFaqNoAccessQ":"Non ho accesso al server","guideFaqNoAccessA":"Usa il pulsante \\"Apri direttamente\\" nel visualizzatore — apre la pagina in una finestra del browser completa senza restrizioni iframe.","viewerLoading":"Caricamento pagina…","viewerLoaded":"Pagina caricata","viewerBlocked":"Il sito blocca l\'incorporamento","viewerError":"Impossibile caricare la pagina","viewerClosed":"Visualizzatore chiuso","help":"Aiuto","infoTooltip":"Info","noInternet":"Nessuna connessione Internet. Verifica la connessione e riprova.","loadTimeout":"La pagina impiega troppo tempo a caricarsi.","dialogUnsupported":"La tua versione di Office non supporta la finestra di visualizzazione. Aggiorna Office.","settingsSaveRetryFailed":"Impossibile salvare le impostazioni. Riprova più tardi.","selectSlide":"Seleziona prima una diapositiva.","urlAutoFixed":"Aggiunto https:// all\'URL.","autoOpenDelay":"Apri dopo","autoOpenDelayImmediate":"0s","autoClose":"Chiusura automatica dopo","autoCloseOff":"Disattivato","countdownText":"Si chiude tra {n}s","autoCloseHint":"La finestra della pagina web cattura il focus da PowerPoint. Mentre è aperta, il clicker/telecomando non funzionerà — non potrai chiudere la diapositiva o passare alla successiva. Dovrai usare tastiera o mouse sul computer con PowerPoint. La chiusura automatica restituisce il focus dopo il tempo impostato (il link sarà visualizzato per quel periodo, il clicker non funzionerà). Una volta chiusa la finestra, il controllo del clicker viene ripristinato. Pianifica quanto tempo ti serve per presentare il contenuto del link e imposta il timer di conseguenza.","autoOpenHint":"Se attivato, la pagina web si apre automaticamente ogni volta che navighi su questa diapositiva durante la presentazione. Non devi cliccare \\"Mostra pagina web\\" manualmente — il visualizzatore appare non appena viene mostrata la diapositiva. Particolarmente utile quando la presentazione è controllata con clicker/telecomando.","howToUse":"Guida all\'uso","howToUseHint":"Mostrare la pagina web sullo schermo del pubblico (proiettore):\\n\\n1. Avvia la presentazione (Slide Show).\\n2. Premi Alt+Tab, passa alla finestra di modifica PowerPoint (con la barra multifunzione, Ribbon) e riducila a icona (Win+↓).\\n\\nVista relatore (Use Presenter View — attiva):\\nFai clic nella finestra della presentazione (Slide Show) — quella che vede il pubblico — per darle il focus. Poi usa la tastiera o il telecomando.\\n\\nDuplica presentazione (Duplicate Slide Show — attiva):\\nNessun passaggio aggiuntivo richiesto.\\n\\nUn monitor: la pagina web si apre sopra la presentazione.","guideImageTitle":"Opzione 1: Link a un\'immagine","guideImageDesc":"Se il tuo sito può esportare contenuti come immagine (.png, .jpg, .webp, .gif, .svg), incolla l\'URL diretto del file. Nessuna modifica al server necessaria — l\'immagine viene mostrata senza iframe, si aggiorna automaticamente ad ogni visualizzazione della diapositiva, e il focus torna a PowerPoint per far funzionare il clicker/telecomando.","guideServerTitle":"Opzione 2: Consentire l\'incorporamento iframe"},"ar":{"insertWebPage":"إضافة WebPage.PPT","editPageProperty":"تعديل خصائص الصفحة","enterUrl":"أدخل عنوان URL","urlPlaceholder":"https://example.com","zoom":"تكبير","dialogSize":"حجم النافذة","autoOpen":"فتح تلقائي عند تغيير الشريحة","showWebPage":"عرض WebPage.PPT","ownSiteBlocked":"هل هذا موقعك الخاص؟","showSetupGuide":"عرض دليل الإعداد","openDirectly":"فتح مباشرة (بدون إطار)","apply":"تطبيق","cancel":"إلغاء","language":"اللغة","iframeBlocked":"هذا الموقع يمنع التضمين.","iframeBlockedHint":"إذا كان هذا موقعك، يمكن إصلاحه بسطر واحد.","noUrl":"يرجى إدخال عنوان URL صالح","noUrlForSlide":"لم يتم تكوين عنوان URL لهذه الشريحة","success":"تم حفظ الإعدادات","errorGeneric":"حدث خطأ ما. يرجى المحاولة مرة أخرى.","dialogAlreadyOpen":"نافذة عرض صفحة الويب مفتوحة بالفعل.","dialogBlocked":"تم حظر العارض. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.","openInBrowser":"فتح في المتصفح","guideTitle":"كيفية السماح بالتضمين","guideIntro":"أضف أحد هذه المقاطع إلى الخادم الذي يستضيف الصفحة المرتبطة:","guideNote":"أعد تشغيل الخادم وأعد تحميل الشريحة بعد إجراء التغييرات.","copy":"نسخ","copied":"تم النسخ!","hideSetupGuide":"إخفاء الدليل","slideLabel":"شريحة","dialogWidth":"العرض","dialogHeight":"الارتفاع","lockSize":"قفل النسب","setAsDefaults":"حفظ كإعدادات افتراضية للشرائح الجديدة","defaultsSaved":"تم حفظ الإعدادات الافتراضية للشرائح الجديدة","siteNotLoading":"الموقع لا يتحمل؟","guideMetaNote":"ملاحظة: قد يتم تجاهل frame-ancestors في علامة meta إذا كان الخادم يعيّن بالفعل ترويسات X-Frame-Options.","guideFaqTitle":"الأسئلة الشائعة","guideFaqXFrameQ":"ما هو X-Frame-Options؟","guideFaqXFrameA":"ترويسة HTTP تتحكم في إمكانية عرض موقعك داخل iframe. بعض الخوادم تعيّنه افتراضيًا على DENY أو SAMEORIGIN.","guideFaqUnknownServerQ":"لا أعرف نوع الخادم لدي","guideFaqUnknownServerA":"تحقق من ملفات المشروع: nginx.conf → Nginx، .htaccess → Apache، app.js أو server.js → Node.js/Express. للاستضافة المشتركة، اسأل مزود الخدمة.","guideFaqNoAccessQ":"ليس لدي وصول إلى الخادم","guideFaqNoAccessA":"استخدم زر \\"فتح مباشرة\\" في العارض — يفتح الصفحة في نافذة متصفح كاملة بدون قيود iframe.","viewerLoading":"جاري تحميل الصفحة…","viewerLoaded":"تم تحميل الصفحة","viewerBlocked":"الموقع يمنع التضمين","viewerError":"فشل تحميل الصفحة","viewerClosed":"تم إغلاق العارض","help":"مساعدة","infoTooltip":"معلومات","noInternet":"لا يوجد اتصال بالإنترنت. تحقق من الاتصال وحاول مرة أخرى.","loadTimeout":"الصفحة تستغرق وقتًا طويلاً في التحميل.","dialogUnsupported":"إصدار Office الخاص بك لا يدعم نافذة العرض. يرجى تحديث Office.","settingsSaveRetryFailed":"تعذر حفظ الإعدادات. يرجى المحاولة لاحقًا.","selectSlide":"يرجى تحديد شريحة أولاً.","urlAutoFixed":"تمت إضافة https:// إلى عنوان URL.","autoOpenDelay":"فتح بعد","autoOpenDelayImmediate":"0ث","autoClose":"إغلاق تلقائي بعد","autoCloseOff":"إيقاف","countdownText":"يُغلق خلال {n} ثانية","autoCloseHint":"نافذة صفحة الويب تلتقط التركيز من PowerPoint. أثناء فتحها، لن يعمل جهاز التحكم/الكليكر — لن تتمكن من إغلاق الشريحة أو الانتقال إلى التالية. ستحتاج إلى استخدام لوحة المفاتيح أو الماوس على الكمبيوتر الذي يشغّل PowerPoint. الإغلاق التلقائي يعيد التركيز تلقائيًا بعد الوقت المحدد. بعد إغلاق النافذة، يتم استعادة التحكم بالكليكر. خطط للوقت الذي تحتاجه لعرض المحتوى واضبط المؤقت وفقًا لذلك.","autoOpenHint":"عند التفعيل، تُفتح صفحة الويب تلقائيًا في كل مرة تنتقل فيها إلى هذه الشريحة أثناء العرض التقديمي. لا حاجة للنقر على \\"عرض صفحة الويب\\" يدويًا — يظهر العارض فور عرض الشريحة. مفيد بشكل خاص عند التحكم بالعرض عبر كليكر/جهاز تحكم.","howToUse":"كيفية الاستخدام","howToUseHint":"عرض صفحة الويب على شاشة الجمهور (جهاز العرض):\\n\\n1. ابدأ عرض الشرائح (Slide Show).\\n2. اضغط Alt+Tab، انتقل إلى نافذة تحرير PowerPoint (مع الشريط، Ribbon) وقم بتصغيرها (Win+↓).\\n\\nعرض المقدم (Use Presenter View — مفعّل):\\nانقر في نافذة عرض الشرائح (Slide Show) — التي يراها الجمهور — لمنحها التركيز. ثم استخدم لوحة المفاتيح أو جهاز التحكم.\\n\\nتكرار عرض الشرائح (Duplicate Slide Show — مفعّل):\\nلا خطوات إضافية مطلوبة.\\n\\nشاشة واحدة: تفتح صفحة الويب فوق العرض التقديمي.","guideImageTitle":"الخيار 1: رابط لصورة","guideImageDesc":"إذا كان موقعك يمكنه تصدير المحتوى كصورة (.png، .jpg، .webp، .gif، .svg)، الصق عنوان URL المباشر لملف الصورة. لا حاجة لتغييرات في الخادم — تُعرض الصورة بدون iframe، وتتحدث تلقائيًا عند كل عرض للشريحة، ويعود التركيز إلى PowerPoint.","guideServerTitle":"الخيار 2: السماح بتضمين iframe"},"pt":{"insertWebPage":"Adicionar WebPage.PPT","editPageProperty":"Propriedades da página","enterUrl":"Insira a URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Tamanho da janela","autoOpen":"Abrir automaticamente ao mudar de slide","showWebPage":"Mostrar WebPage.PPT","ownSiteBlocked":"Este é o seu próprio site?","showSetupGuide":"Mostrar guia","openDirectly":"Abrir diretamente (sem moldura)","apply":"Aplicar","cancel":"Cancelar","language":"Idioma","iframeBlocked":"Este site bloqueia a incorporação.","iframeBlockedHint":"Se é o seu site, pode ser corrigido com uma linha.","noUrl":"Insira uma URL válida","noUrlForSlide":"Nenhuma URL configurada para este slide","success":"Configurações salvas","errorGeneric":"Algo deu errado. Tente novamente.","dialogAlreadyOpen":"Uma janela de visualização já está aberta.","dialogBlocked":"A janela foi bloqueada. Permita pop-ups para este site.","openInBrowser":"Abrir no navegador","guideTitle":"Como permitir a incorporação","guideIntro":"Adicione um destes trechos ao servidor que hospeda a página vinculada:","guideNote":"Reinicie o servidor e recarregue o slide após as alterações.","copy":"Copiar","copied":"Copiado!","hideSetupGuide":"Ocultar guia","slideLabel":"Slide","dialogWidth":"Largura","dialogHeight":"Altura","lockSize":"Bloquear proporções","setAsDefaults":"Salvar como padrão para novos slides","defaultsSaved":"Configurações padrão salvas para novos slides","siteNotLoading":"O site não carrega?","guideMetaNote":"Nota: frame-ancestors em uma tag meta pode ser ignorado se o servidor já define cabeçalhos X-Frame-Options.","guideFaqTitle":"Perguntas frequentes","guideFaqXFrameQ":"O que é X-Frame-Options?","guideFaqXFrameA":"Um cabeçalho HTTP que controla se o seu site pode ser exibido dentro de um iframe. Alguns servidores o definem como DENY ou SAMEORIGIN por padrão.","guideFaqUnknownServerQ":"Não sei qual servidor eu tenho","guideFaqUnknownServerA":"Verifique os arquivos do projeto: nginx.conf → Nginx, .htaccess → Apache, app.js ou server.js → Node.js/Express. Para hospedagem compartilhada, pergunte ao seu provedor.","guideFaqNoAccessQ":"Não tenho acesso ao servidor","guideFaqNoAccessA":"Use o botão \\"Abrir diretamente\\" no visualizador — ele abre a página em uma janela completa do navegador sem restrições de iframe.","viewerLoading":"Carregando página…","viewerLoaded":"Página carregada","viewerBlocked":"O site bloqueia a incorporação","viewerError":"Falha ao carregar a página","viewerClosed":"Visualizador fechado","help":"Ajuda","infoTooltip":"Info","noInternet":"Sem conexão com a Internet. Verifique sua conexão e tente novamente.","loadTimeout":"A página está demorando muito para carregar.","dialogUnsupported":"Sua versão do Office não suporta a janela de visualização. Atualize o Office.","settingsSaveRetryFailed":"Não foi possível salvar as configurações. Tente novamente mais tarde.","selectSlide":"Selecione um slide primeiro.","urlAutoFixed":"https:// foi adicionado à URL.","autoOpenDelay":"Abrir após","autoOpenDelayImmediate":"0s","autoClose":"Fechar automaticamente após","autoCloseOff":"Desligado","countdownText":"Fecha em {n}s","autoCloseHint":"A janela da página web captura o foco do PowerPoint. Enquanto estiver aberta, o clicker/controle remoto não funcionará — você não poderá fechar o slide ou avançar para o próximo. Será necessário usar teclado ou mouse no computador com PowerPoint. O fechamento automático retorna o foco automaticamente após o tempo definido. Após o fechamento da janela, o controle do clicker é restaurado. Planeje quanto tempo você precisa para apresentar o conteúdo vinculado e defina o temporizador.","autoOpenHint":"Quando ativado, a página web abre automaticamente cada vez que você navega para este slide durante a apresentação. Não é necessário clicar \\"Mostrar página web\\" manualmente — o visualizador aparece assim que o slide é exibido. Especialmente útil quando a apresentação é controlada por clicker/controle remoto.","howToUse":"Como usar","howToUseHint":"Exibir a página web na tela do público (projetor):\\n\\n1. Inicie a apresentação de slides (Slide Show).\\n2. Pressione Alt+Tab, mude para a janela de edição do PowerPoint (com a faixa de opções, Ribbon) e minimize-a (Win+↓).\\n\\nModo do Apresentador (Use Presenter View — ativado):\\nClique na janela de apresentação de slides (Slide Show) — a que o público vê — para dar o foco a ela. Use o teclado ou o controle remoto para avançar.\\n\\nDuplicar apresentação (Duplicate Slide Show — ativado):\\nNenhuma etapa adicional é necessária.\\n\\nUm monitor: a página web abre sobre a apresentação.","guideImageTitle":"Opção 1: Link para uma imagem","guideImageDesc":"Se o seu site pode exportar conteúdo como imagem (.png, .jpg, .webp, .gif, .svg), cole a URL direta do arquivo. Nenhuma alteração no servidor necessária — a imagem é exibida sem iframe, atualiza automaticamente a cada exibição do slide, e o foco retorna ao PowerPoint para que o clicker/controle continue funcionando.","guideServerTitle":"Opção 2: Permitir incorporação iframe"},"hi":{"insertWebPage":"WebPage.PPT जोड़ें","editPageProperty":"पेज गुण संपादित करें","enterUrl":"URL दर्ज करें","urlPlaceholder":"https://example.com","zoom":"ज़ूम","dialogSize":"विंडो का आकार","autoOpen":"स्लाइड बदलने पर स्वतः खोलें","showWebPage":"WebPage.PPT दिखाएं","ownSiteBlocked":"क्या यह आपकी अपनी वेबसाइट है?","showSetupGuide":"सेटअप गाइड दिखाएं","openDirectly":"सीधे खोलें (बिना फ्रेम)","apply":"लागू करें","cancel":"रद्द करें","language":"भाषा","iframeBlocked":"यह साइट एम्बेडिंग को ब्लॉक करती है।","iframeBlockedHint":"अगर यह आपकी साइट है, तो एक लाइन में ठीक हो सकता है।","noUrl":"कृपया एक मान्य URL दर्ज करें","noUrlForSlide":"इस स्लाइड के लिए कोई URL कॉन्फ़िगर नहीं है","success":"सेटिंग्स सहेजी गईं","errorGeneric":"कुछ गलत हो गया। कृपया पुनः प्रयास करें।","dialogAlreadyOpen":"एक वेब पेज व्यूअर पहले से खुला है।","dialogBlocked":"व्यूअर ब्लॉक हो गया। कृपया इस साइट के लिए पॉप-अप की अनुमति दें।","openInBrowser":"ब्राउज़र में खोलें","guideTitle":"एम्बेडिंग की अनुमति कैसे दें","guideIntro":"लिंक किए गए पेज को होस्ट करने वाले सर्वर में इनमें से एक कोड जोड़ें:","guideNote":"बदलाव करने के बाद सर्वर को पुनः आरंभ करें और स्लाइड को रीलोड करें।","copy":"कॉपी","copied":"कॉपी हो गया!","hideSetupGuide":"गाइड छिपाएं","slideLabel":"स्लाइड","dialogWidth":"चौड़ाई","dialogHeight":"ऊंचाई","lockSize":"अनुपात लॉक करें","setAsDefaults":"नई स्लाइड्स के लिए डिफ़ॉल्ट के रूप में सहेजें","defaultsSaved":"नई स्लाइड्स के लिए डिफ़ॉल्ट सेटिंग्स सहेजी गईं","siteNotLoading":"साइट लोड नहीं हो रही?","guideMetaNote":"नोट: मेटा टैग में frame-ancestors को अनदेखा किया जा सकता है अगर सर्वर पहले से X-Frame-Options हेडर सेट करता है।","guideFaqTitle":"अक्सर पूछे जाने वाले प्रश्न","guideFaqXFrameQ":"X-Frame-Options क्या है?","guideFaqXFrameA":"एक HTTP हेडर जो नियंत्रित करता है कि आपकी साइट iframe में दिखाई जा सकती है या नहीं। कुछ सर्वर इसे डिफ़ॉल्ट रूप से DENY या SAMEORIGIN पर सेट करते हैं।","guideFaqUnknownServerQ":"मुझे नहीं पता मेरा कौन सा सर्वर है","guideFaqUnknownServerA":"अपनी प्रोजेक्ट फाइलें जांचें: nginx.conf → Nginx, .htaccess → Apache, app.js या server.js → Node.js/Express। शेयर्ड होस्टिंग के लिए, अपने प्रदाता से पूछें।","guideFaqNoAccessQ":"मेरे पास सर्वर एक्सेस नहीं है","guideFaqNoAccessA":"व्यूअर में \\"सीधे खोलें\\" बटन का उपयोग करें — यह पेज को iframe प्रतिबंधों के बिना पूर्ण ब्राउज़र विंडो में खोलता है।","viewerLoading":"पेज लोड हो रहा है…","viewerLoaded":"पेज लोड हो गया","viewerBlocked":"साइट ने एम्बेडिंग ब्लॉक कर दी","viewerError":"पेज लोड होने में विफल","viewerClosed":"व्यूअर बंद हो गया","help":"सहायता","infoTooltip":"जानकारी","noInternet":"इंटरनेट कनेक्शन नहीं है। अपना कनेक्शन जांचें और पुनः प्रयास करें।","loadTimeout":"पेज लोड होने में बहुत अधिक समय ले रहा है।","dialogUnsupported":"आपके Office का संस्करण व्यूअर विंडो को सपोर्ट नहीं करता। कृपया Office अपडेट करें।","settingsSaveRetryFailed":"सेटिंग्स सहेजी नहीं जा सकीं। कृपया बाद में पुनः प्रयास करें।","selectSlide":"कृपया पहले एक स्लाइड चुनें।","urlAutoFixed":"URL में https:// जोड़ा गया।","autoOpenDelay":"इसके बाद खोलें","autoOpenDelayImmediate":"0से","autoClose":"इसके बाद स्वतः बंद","autoCloseOff":"बंद","countdownText":"{n}s में बंद होगा","autoCloseHint":"वेब पेज विंडो PowerPoint से फोकस लेती है। जब तक यह खुली है, आपका क्लिकर/रिमोट काम नहीं करेगा। ऑटो-क्लोज़ सेट समय के बाद स्वतः फोकस वापस करता है। विंडो बंद होने के बाद क्लिकर नियंत्रण बहाल हो जाता है। लिंक किए गए कंटेंट को प्रस्तुत करने के लिए आवश्यक समय की योजना बनाएं और टाइमर सेट करें।","autoOpenHint":"सक्षम होने पर, प्रेज़ेंटेशन के दौरान इस स्लाइड पर जाने पर वेब पेज स्वतः खुलता है। \\"वेब पेज दिखाएं\\" मैन्युअली क्लिक करने की ज़रूरत नहीं — स्लाइड दिखने पर व्यूअर तुरंत प्रकट होता है।","howToUse":"उपयोग गाइड","howToUseHint":"दर्शकों की स्क्रीन (प्रोजेक्टर) पर वेब पेज दिखाना:\\n\\n1. स्लाइड शो (Slide Show) शुरू करें।\\n2. Alt+Tab दबाएं, PowerPoint संपादन विंडो (Ribbon के साथ) पर जाएं और उसे छोटा करें (Win+↓)।\\n\\nप्रस्तुतकर्ता दृश्य (Use Presenter View — चालू):\\nदर्शकों को दिखने वाली स्लाइड शो विंडो (Slide Show) में क्लिक करें ताकि उसे फ़ोकस मिले। फिर कीबोर्ड या क्लिकर से स्लाइड बदलें।\\n\\nडुप्लिकेट स्लाइड शो (Duplicate Slide Show — चालू):\\nकोई अतिरिक्त कदम आवश्यक नहीं।\\n\\nएक मॉनिटर: वेब पेज प्रस्तुति के ऊपर खुलेगा।","guideImageTitle":"विकल्प 1: एक छवि का लिंक","guideImageDesc":"अगर आपकी साइट कंटेंट को छवि (.png, .jpg, .webp, .gif, .svg) के रूप में निर्यात कर सकती है, तो छवि फ़ाइल का सीधा URL पेस्ट करें। सर्वर में कोई बदलाव नहीं चाहिए — छवि iframe के बिना दिखती है, स्लाइड दिखाने पर स्वतः रीफ्रेश होती है, और फोकस PowerPoint पर लौटता है।","guideServerTitle":"विकल्प 2: iframe एम्बेडिंग की अनुमति दें"},"ru":{"insertWebPage":"Добавить WebPage.PPT","editPageProperty":"Свойства страницы","enterUrl":"Введите URL","urlPlaceholder":"https://example.com","zoom":"Масштаб","dialogSize":"Размер окна","autoOpen":"Открывать при смене слайда","showWebPage":"Показать WebPage.PPT","ownSiteBlocked":"Это ваш сайт?","showSetupGuide":"Показать инструкцию","openDirectly":"Открыть напрямую (без рамки)","apply":"Применить","cancel":"Отмена","language":"Язык","iframeBlocked":"Сайт блокирует встраивание.","iframeBlockedHint":"Если это ваш сайт — исправляется одной строкой.","noUrl":"Введите корректный URL","noUrlForSlide":"Для этого слайда URL не задан","success":"Настройки сохранены","errorGeneric":"Что-то пошло не так. Попробуйте ещё раз.","dialogAlreadyOpen":"Окно просмотра уже открыто.","dialogBlocked":"Окно заблокировано. Разрешите всплывающие окна для этого сайта.","openInBrowser":"Открыть в браузере","guideTitle":"Как разрешить встраивание","guideIntro":"Добавьте один из фрагментов в конфигурацию сервера, на котором размещена страница:","guideNote":"Перезапустите сервер и обновите слайд после изменений.","copy":"Копировать","copied":"Скопировано!","hideSetupGuide":"Скрыть инструкцию","slideLabel":"Слайд","dialogWidth":"Ширина","dialogHeight":"Высота","lockSize":"Связать пропорции","setAsDefaults":"Сохранить настройки по умолчанию для новых слайдов","defaultsSaved":"Настройки по умолчанию сохранены","siteNotLoading":"Сайт не загружается?","guideMetaNote":"Примечание: frame-ancestors в meta-теге может не сработать, если сервер уже задаёт заголовок X-Frame-Options.","guideFaqTitle":"Частые вопросы","guideFaqXFrameQ":"Что такое X-Frame-Options?","guideFaqXFrameA":"HTTP-заголовок, определяющий, можно ли показывать сайт внутри iframe. Некоторые серверы по умолчанию блокируют встраивание.","guideFaqUnknownServerQ":"Я не знаю, какой у меня сервер","guideFaqUnknownServerA":"Посмотрите файлы проекта: nginx.conf → Nginx, .htaccess → Apache, app.js или server.js → Node.js/Express. На хостинге — спросите провайдера.","guideFaqNoAccessQ":"У меня нет доступа к серверу","guideFaqNoAccessA":"Используйте кнопку «Открыть напрямую» — она откроет страницу в полноценном окне браузера без ограничений iframe.","viewerLoading":"Загрузка страницы…","viewerLoaded":"Страница загружена","viewerBlocked":"Сайт блокирует встраивание","viewerError":"Не удалось загрузить страницу","viewerClosed":"Окно закрыто","help":"Справка","infoTooltip":"Инфо","noInternet":"Нет подключения к интернету. Проверьте соединение и попробуйте снова.","loadTimeout":"Страница загружается слишком долго.","dialogUnsupported":"Ваша версия Office не поддерживает окно просмотра. Обновите Office.","settingsSaveRetryFailed":"Не удалось сохранить настройки. Попробуйте позже.","selectSlide":"Сначала выберите слайд.","urlAutoFixed":"Добавлен протокол https:// к URL.","autoOpenDelay":"Открыть через","autoOpenDelayImmediate":"0с","autoClose":"Закрыть через","autoCloseOff":"Выкл","countdownText":"Закроется через {n}с","autoCloseHint":"Окно с веб-страницей перехватывает фокус PowerPoint. Пока оно открыто, кликер/пульт презентации не работает — вы не сможете закрыть слайд или переключиться на другой. Придётся использовать клавиатуру или мышь на компьютере с PowerPoint. Автозакрытие вернёт фокус автоматически через заданное время (всё это время будет транслироваться ссылка, кликер не будет работать). После закрытия окна управление вернётся на кликер. Спланируйте, сколько времени вам нужно на показ содержимого по ссылке, и выставьте это время.","autoOpenHint":"Если включено, веб-страница открывается автоматически при каждом переходе на этот слайд во время презентации. Не нужно нажимать «Показать веб-страницу» вручную — окно появится сразу при показе слайда. Удобно, когда презентация управляется кликером/пультом.","howToUse":"Как пользоваться","howToUseHint":"Показ веб-страницы на экране зрителей (проектор):\\n\\n1. Запустите показ слайдов (Slide Show).\\n2. Нажмите Alt+Tab, перейдите в окно редактирования PowerPoint (с лентой инструментов, Ribbon) и сверните его (Win+↓).\\n\\nРежим докладчика (Presenter View) включён:\\nЩёлкните мышью в окне показа слайдов (Slide Show) — том, которое видят зрители — чтобы передать ему фокус. Затем переключайте слайды клавишами или кликером.\\n\\nДублировать показ слайдов (Duplicate Slide Show) включён:\\nДополнительных действий не нужно.\\n\\nОдин монитор: веб-страница откроется поверх презентации.","guideImageTitle":"Вариант 1: Ссылка на изображение","guideImageDesc":"Если ваш сайт может экспортировать контент как изображение (.png, .jpg, .webp, .gif, .svg), вставьте прямую ссылку на файл. Настройка сервера не нужна — изображение отобразится без iframe, обновится автоматически при каждом переходе на слайд, а фокус вернётся в PowerPoint, и кликер/пульт продолжит работать.","guideServerTitle":"Вариант 2: Разрешить встраивание в iframe"}}');

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
var exports = {};
/*!**********************************!*\
  !*** ./src/taskpane/taskpane.ts ***!
  \**********************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const i18n_1 = __webpack_require__(/*! ../shared/i18n */ "./src/shared/i18n.ts");
const settings_1 = __webpack_require__(/*! ../shared/settings */ "./src/shared/settings.ts");
const dialog_launcher_1 = __webpack_require__(/*! ../shared/dialog-launcher */ "./src/shared/dialog-launcher.ts");
const logger_1 = __webpack_require__(/*! ../shared/logger */ "./src/shared/logger.ts");
const constants_1 = __webpack_require__(/*! ../shared/constants */ "./src/shared/constants.ts");
// ─── DOM references ──────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
let urlInput;
let btnApply;
let btnShow;
let btnDefaults;
let statusEl;
let slideNumberEl;
let langSelect;
let sliderWidth;
let sliderHeight;
let sliderZoom;
let sliderWidthValue;
let sliderHeightValue;
let sliderZoomValue;
let sizePreviewInner;
let chkAutoOpen;
let chkLockSize;
let sliderAutoOpenDelay;
let sliderAutoOpenDelayValue;
let sectionAutoOpenDelay;
let sliderAutoClose;
let sliderAutoCloseValue;
let presetButtons;
let viewerStatusEl;
let viewerStatusText;
// ─── State ───────────────────────────────────────────────────────────────────
let currentSlideId = null;
let currentSlideIndex = null;
const launcher = new dialog_launcher_1.DialogLauncher();
let viewerStatusTimer = null;
// ─── i18n ────────────────────────────────────────────────────────────────────
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        el.textContent = i18n_1.i18n.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.dataset.i18nPlaceholder;
        el.placeholder = i18n_1.i18n.t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const key = el.dataset.i18nTitle;
        el.title = i18n_1.i18n.t(key);
    });
    // Keep <html lang> in sync with the active locale
    document.documentElement.lang = i18n_1.i18n.getLocale();
    // Guide toggle button uses data-i18n="siteNotLoading", but when the guide
    // is currently open the label should read "hideSetupGuide" instead.
    const guideSection = document.getElementById('guide-section');
    if (guideSection && !guideSection.hidden) {
        const toggleBtn = document.getElementById('btn-guide-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = i18n_1.i18n.t('hideSetupGuide');
        }
    }
}
// ─── Slide detection ─────────────────────────────────────────────────────────
async function detectCurrentSlide() {
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
    }
    catch {
        currentSlideId = null;
        currentSlideIndex = null;
    }
    updateSlideUI();
}
function updateSizePreview() {
    const w = Number(sliderWidth.value);
    const h = Number(sliderHeight.value);
    // Preview box is 64×48; scale proportionally
    sizePreviewInner.style.width = `${(w / 100) * 58}px`;
    sizePreviewInner.style.height = `${(h / 100) * 42}px`;
}
function formatAutoCloseLabel(sec) {
    if (sec === 0)
        return i18n_1.i18n.t('autoCloseOff');
    if (sec < 60)
        return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (sec >= 3600)
        return `${Math.floor(sec / 3600)}h`;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
}
/** Convert seconds value → nearest slider index. */
function secondsToSliderIndex(sec) {
    let best = 0;
    for (let i = 0; i < constants_1.AUTO_CLOSE_STEPS.length; i++) {
        if (Math.abs(constants_1.AUTO_CLOSE_STEPS[i] - sec) < Math.abs(constants_1.AUTO_CLOSE_STEPS[best] - sec)) {
            best = i;
        }
    }
    return best;
}
/** Read actual seconds from the current slider position. */
function getAutoCloseSeconds() {
    return constants_1.AUTO_CLOSE_STEPS[Number(sliderAutoClose.value)] ?? 0;
}
// ─── Auto-open delay helpers ────────────────────────────────────────────────
function formatAutoOpenDelayLabel(sec) {
    if (sec === 0)
        return i18n_1.i18n.t('autoOpenDelayImmediate');
    return `${sec}s`;
}
function secondsToDelaySliderIndex(sec) {
    let best = 0;
    for (let i = 0; i < constants_1.AUTO_OPEN_DELAY_STEPS.length; i++) {
        if (Math.abs(constants_1.AUTO_OPEN_DELAY_STEPS[i] - sec) < Math.abs(constants_1.AUTO_OPEN_DELAY_STEPS[best] - sec)) {
            best = i;
        }
    }
    return best;
}
function getAutoOpenDelaySeconds() {
    return constants_1.AUTO_OPEN_DELAY_STEPS[Number(sliderAutoOpenDelay.value)] ?? 0;
}
function updateAutoOpenDelayVisibility() {
    sectionAutoOpenDelay.hidden = !chkAutoOpen.checked;
}
// ─── Slider UI ──────────────────────────────────────────────────────────────
function setSliderUI(width, height, zoom, autoOpen, autoOpenDelaySec, autoCloseSec) {
    sliderWidth.value = String(width);
    sliderHeight.value = String(height);
    sliderZoom.value = String(zoom);
    sliderWidthValue.textContent = `${width}%`;
    sliderHeightValue.textContent = `${height}%`;
    sliderZoomValue.textContent = `${zoom}%`;
    chkAutoOpen.checked = autoOpen;
    sliderAutoOpenDelay.value = String(secondsToDelaySliderIndex(autoOpenDelaySec));
    sliderAutoOpenDelayValue.textContent = formatAutoOpenDelayLabel(autoOpenDelaySec);
    sliderAutoClose.value = String(secondsToSliderIndex(autoCloseSec));
    sliderAutoCloseValue.textContent = formatAutoCloseLabel(autoCloseSec);
    updateAutoOpenDelayVisibility();
    updateSizePreview();
    updateActivePreset(zoom);
}
function updateActivePreset(zoom) {
    presetButtons.forEach((btn) => {
        const val = Number(btn.dataset.zoom);
        btn.classList.toggle('btn-preset--active', val === zoom);
    });
}
function updateSlideUI() {
    slideNumberEl.textContent = currentSlideIndex != null ? String(currentSlideIndex) : '—';
    const defaults = (0, settings_1.getDefaults)();
    if (currentSlideId) {
        const config = (0, settings_1.getSlideConfig)(currentSlideId);
        urlInput.value = config?.url ?? '';
        setSliderUI(config?.dialogWidth ?? defaults.dialogWidth, config?.dialogHeight ?? defaults.dialogHeight, config?.zoom ?? defaults.zoom, config?.autoOpen ?? defaults.autoOpen, config?.autoOpenDelaySec ?? defaults.autoOpenDelaySec, config?.autoCloseSec ?? defaults.autoCloseSec);
    }
    else {
        urlInput.value = '';
        setSliderUI(defaults.dialogWidth, defaults.dialogHeight, defaults.zoom, defaults.autoOpen, defaults.autoOpenDelaySec, defaults.autoCloseSec);
    }
    updateShowButtonState();
}
// ─── URL validation & normalization ──────────────────────────────────────────
/**
 * Auto-prepend `https://` if the user omitted the protocol.
 * Returns the normalized URL string.
 */
function normalizeUrl(value) {
    const trimmed = value.trim();
    if (!trimmed)
        return trimmed;
    if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
    }
    return trimmed;
}
function isValidUrl(value) {
    if (!value.trim())
        return false;
    try {
        const u = new URL(value);
        return u.protocol === 'http:' || u.protocol === 'https:';
    }
    catch {
        return false;
    }
}
// ─── Status messages ─────────────────────────────────────────────────────────
function showStatus(key, type) {
    statusEl.textContent = i18n_1.i18n.t(key);
    statusEl.className = `status status-${type}`;
    statusEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
    statusEl.hidden = false;
    setTimeout(() => {
        statusEl.hidden = true;
    }, 3000);
}
// ─── Show button state ───────────────────────────────────────────────────
/** Disable "Show Web Page" when there is no saved URL for the current slide. */
function updateShowButtonState() {
    const hasUrl = currentSlideId
        ? !!(0, settings_1.getSlideConfig)(currentSlideId)?.url
        : false;
    btnShow.disabled = !hasUrl;
    btnShow.title = hasUrl
        ? (0, constants_1.truncateUrl)((0, settings_1.getSlideConfig)(currentSlideId).url)
        : i18n_1.i18n.t('noUrlForSlide');
}
// ─── Apply handler ───────────────────────────────────────────────────────────
async function handleApply() {
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
        await (0, settings_1.setSlideConfig)(currentSlideId, {
            url,
            zoom: Number(sliderZoom.value),
            dialogWidth: Number(sliderWidth.value),
            dialogHeight: Number(sliderHeight.value),
            autoOpen: chkAutoOpen.checked,
            autoOpenDelaySec: getAutoOpenDelaySeconds(),
            autoCloseSec: getAutoCloseSeconds(),
        });
        showStatus('success', 'success');
        updateShowButtonState();
    }
    catch (err) {
        (0, logger_1.logError)('Failed to save slide config:', err);
        showStatus('settingsSaveRetryFailed', 'error');
    }
}
// ─── Set as defaults handler ────────────────────────────────────────────────
async function handleSetDefaults() {
    try {
        await (0, settings_1.setDefaults)({
            url: '',
            zoom: Number(sliderZoom.value),
            dialogWidth: Number(sliderWidth.value),
            dialogHeight: Number(sliderHeight.value),
            autoOpen: chkAutoOpen.checked,
            autoOpenDelaySec: getAutoOpenDelaySeconds(),
            autoCloseSec: getAutoCloseSeconds(),
        });
        showStatus('defaultsSaved', 'success');
    }
    catch (err) {
        (0, logger_1.logError)('Failed to save defaults:', err);
        showStatus('settingsSaveRetryFailed', 'error');
    }
}
// ─── Slider / preset handlers ───────────────────────────────────────────────
function handleWidthInput() {
    sliderWidthValue.textContent = `${sliderWidth.value}%`;
    if (chkLockSize.checked) {
        sliderHeight.value = sliderWidth.value;
        sliderHeightValue.textContent = `${sliderHeight.value}%`;
    }
    updateSizePreview();
}
function handleHeightInput() {
    sliderHeightValue.textContent = `${sliderHeight.value}%`;
    if (chkLockSize.checked) {
        sliderWidth.value = sliderHeight.value;
        sliderWidthValue.textContent = `${sliderWidth.value}%`;
    }
    updateSizePreview();
}
function handleZoomInput() {
    const val = Number(sliderZoom.value);
    sliderZoomValue.textContent = `${val}%`;
    updateActivePreset(val);
}
function handlePresetClick(e) {
    const btn = e.target.closest('.btn-preset');
    if (!btn?.dataset.zoom)
        return;
    const val = Number(btn.dataset.zoom);
    sliderZoom.value = String(val);
    sliderZoomValue.textContent = `${val}%`;
    updateActivePreset(val);
}
function handleLockSizeChange() {
    if (chkLockSize.checked) {
        // Sync height to width
        sliderHeight.value = sliderWidth.value;
        sliderHeightValue.textContent = `${sliderHeight.value}%`;
        updateSizePreview();
    }
}
function handleAutoOpenDelayInput() {
    sliderAutoOpenDelayValue.textContent = formatAutoOpenDelayLabel(getAutoOpenDelaySeconds());
}
function handleAutoOpenChange() {
    updateAutoOpenDelayVisibility();
}
function handleAutoCloseInput() {
    sliderAutoCloseValue.textContent = formatAutoCloseLabel(getAutoCloseSeconds());
}
function handleInfoToggle(hintId, btnId) {
    const hint = document.getElementById(hintId);
    const btn = document.getElementById(btnId);
    if (!hint || !btn)
        return;
    const show = hint.hidden;
    hint.hidden = !show;
    btn.setAttribute('aria-expanded', String(show));
}
function handleAutoOpenInfoToggle() {
    handleInfoToggle('autoopen-hint', 'btn-autoopen-info');
}
function handleAutoCloseInfoToggle() {
    handleInfoToggle('autoclose-hint', 'btn-autoclose-info');
}
function setViewerStatus(state) {
    const keyMap = {
        loading: 'viewerLoading',
        loaded: 'viewerLoaded',
        blocked: 'viewerBlocked',
        error: 'viewerError',
    };
    viewerStatusEl.hidden = false;
    viewerStatusEl.className = `viewer-status viewer-status--${state}`;
    viewerStatusText.textContent = i18n_1.i18n.t(keyMap[state]);
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
function hideViewerStatus() {
    if (viewerStatusTimer) {
        clearTimeout(viewerStatusTimer);
        viewerStatusTimer = null;
    }
    viewerStatusEl.hidden = true;
}
/** Parse and handle structured messages from the viewer dialog. */
function handleViewerMessage(rawMessage) {
    try {
        const msg = JSON.parse(rawMessage);
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
                // Save slide ID BEFORE close — onSlideshowExit may reset lastSlideshowSlideId
                if (lastSlideshowSlideId) {
                    lastDialogClosedSlideId = lastSlideshowSlideId;
                    dbg(`Dialog closing on slide ${lastDialogClosedSlideId} — will not re-open until slide changes`);
                }
                launcher.close();
                btnShow.disabled = false;
                hideViewerStatus();
                break;
        }
    }
    catch {
        // Non-JSON message — ignore
    }
}
function handleViewerClosed() {
    btnShow.disabled = false;
    // Remember which slide the dialog was closed on (prevent re-opening).
    // May already be set by 'close' message handler (before launcher.close).
    if (lastSlideshowSlideId && !lastDialogClosedSlideId) {
        lastDialogClosedSlideId = lastSlideshowSlideId;
        dbg(`Dialog closed (event) on slide ${lastDialogClosedSlideId}`);
    }
    // Show brief "closed" status then hide
    viewerStatusEl.hidden = false;
    viewerStatusEl.className = 'viewer-status';
    viewerStatusText.textContent = i18n_1.i18n.t('viewerClosed');
    if (viewerStatusTimer)
        clearTimeout(viewerStatusTimer);
    viewerStatusTimer = setTimeout(() => {
        viewerStatusEl.hidden = true;
    }, 2000);
}
// ─── Show Web Page handler ───────────────────────────────────────────────────
async function handleShow() {
    if (!currentSlideId) {
        showStatus('selectSlide', 'error');
        return;
    }
    const config = (0, settings_1.getSlideConfig)(currentSlideId);
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
            lang: i18n_1.i18n.getLocale(),
            autoCloseSec: config.autoCloseSec,
        });
    }
    catch (err) {
        btnShow.disabled = false;
        hideViewerStatus();
        if (err instanceof dialog_launcher_1.DialogError) {
            showStatus(err.i18nKey, 'error');
        }
        else {
            showStatus('errorGeneric', 'error');
        }
    }
}
// ─── Guide handlers ─────────────────────────────────────────────────────
const SNIPPETS = {
    nginx: 'add_header Content-Security-Policy "frame-ancestors *";',
    apache: 'Header set Content-Security-Policy "frame-ancestors *"\nHeader unset X-Frame-Options',
    express: `app.use((req, res, next) => {\n  res.setHeader('Content-Security-Policy', 'frame-ancestors *');\n  res.removeHeader('X-Frame-Options');\n  next();\n});`,
    meta: '<meta http-equiv="Content-Security-Policy"\n      content="frame-ancestors *">',
};
function handleGuideToggle() {
    const section = $('guide-section');
    const toggle = $('btn-guide-toggle');
    const isHidden = section.hidden;
    section.hidden = !isHidden;
    toggle.textContent = i18n_1.i18n.t(isHidden ? 'hideSetupGuide' : 'siteNotLoading');
    toggle.setAttribute('aria-expanded', String(isHidden));
}
function activateGuideTab(tabId) {
    document.querySelectorAll('#guide-section [data-guide-tab]').forEach((t) => {
        const active = t.dataset.guideTab === tabId;
        t.classList.toggle('guide-tab--active', active);
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
        if (active)
            t.focus();
    });
    document.querySelectorAll('#guide-section [data-guide-panel]').forEach((p) => {
        p.hidden = p.dataset.guidePanel !== tabId;
    });
}
function handleGuideTabClick(e) {
    const tab = e.target.closest('[data-guide-tab]');
    if (!tab)
        return;
    activateGuideTab(tab.dataset.guideTab);
}
function handleGuideTabKeydown(e) {
    const tabs = Array.from(document.querySelectorAll('#guide-section [data-guide-tab]'));
    const current = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    let next = -1;
    if (e.key === 'ArrowRight')
        next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft')
        next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home')
        next = 0;
    else if (e.key === 'End')
        next = tabs.length - 1;
    else
        return;
    e.preventDefault();
    activateGuideTab(tabs[next].dataset.guideTab);
}
async function handleGuideCopy(e) {
    const btn = e.target.closest('[data-copy-snippet]');
    if (!btn)
        return;
    const key = btn.dataset.copySnippet;
    const text = SNIPPETS[key];
    if (!text)
        return;
    try {
        await navigator.clipboard.writeText(text);
        btn.textContent = i18n_1.i18n.t('copied');
        btn.classList.add('btn-copy--copied');
        setTimeout(() => {
            btn.textContent = i18n_1.i18n.t('copy');
            btn.classList.remove('btn-copy--copied');
        }, 2000);
    }
    catch {
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
async function handleLanguageChange() {
    const locale = langSelect.value;
    i18n_1.i18n.setLocale(locale);
    applyI18n();
    try {
        await (0, settings_1.setLanguage)(locale);
    }
    catch {
        // non-critical — UI already updated
    }
}
// ─── Keyboard support ────────────────────────────────────────────────────────
function handleUrlKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleApply();
    }
}
function dbg(msg) {
    (0, logger_1.logDebug)('[Taskpane]', msg);
}
// ─── Slideshow auto-open ────────────────────────────────────────────────────
//
// The commands runtime (FunctionFile) may not persist during slideshow on all
// PowerPoint versions. As a reliable fallback, the taskpane itself polls for
// view mode changes and slide navigation during slideshow.
//
// Uses getActiveViewAsync() instead of ActiveViewChanged event because
// the event may not fire in the taskpane context.
/** How often to check the current view mode (ms). */
const VIEW_POLL_INTERVAL_MS = 2000;
/** How often to check the current slide during slideshow (ms). */
const SLIDE_POLL_INTERVAL_MS = 1500;
let viewPollTimer = null;
let slidePollTimer = null;
let slideshowActive = false;
let lastSlideshowSlideId = null;
let slidePollBusy = false;
/** Whether the viewer dialog has been opened for the current slideshow session. */
let slideshowDialogOpened = false;
/** Slide ID for which the dialog was last closed (to prevent re-opening on same slide). */
let lastDialogClosedSlideId = null;
/** Pending auto-open delay timer (cancelled on slide change). */
let autoOpenDelayTimer = null;
/** Get the current view mode ("edit" or "read"). */
function getActiveView() {
    return new Promise((resolve) => {
        try {
            Office.context.document.getActiveViewAsync((result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(result.value);
                }
                else {
                    dbg(`getActiveView FAILED: ${JSON.stringify(result.error)}`);
                    resolve('edit');
                }
            });
        }
        catch (err) {
            dbg(`getActiveView EXCEPTION: ${err}`);
            resolve('edit');
        }
    });
}
/**
 * Get the current slide ID. Tries two methods:
 * 1. PowerPoint JS API getSelectedSlides() — works in edit mode
 * 2. Common API getSelectedDataAsync(SlideRange) — may work in slideshow
 *
 * Method 2 returns a numeric slide ID, which we map to the JS API string ID
 * using a pre-built index→id lookup table.
 */
/** Map of slide index (1-based) → PowerPoint JS API slide ID. Built before slideshow. */
let slideIndexToId = new Map();
/** Build the index→id map from all slides in the presentation. */
async function buildSlideIndexMap() {
    try {
        await PowerPoint.run(async (context) => {
            const slides = context.presentation.slides;
            slides.load('items/id');
            await context.sync();
            slideIndexToId = new Map();
            for (let i = 0; i < slides.items.length; i++) {
                slideIndexToId.set(i + 1, slides.items[i].id);
            }
        });
        const entries = [];
        slideIndexToId.forEach((id, idx) => entries.push(`${idx}→${id}`));
        dbg(`Slide map: ${entries.join(', ')}`);
    }
    catch (err) {
        dbg(`buildSlideIndexMap ERROR: ${err}`);
    }
}
/** Method 1: PowerPoint JS API — getSelectedSlides(). */
async function getSlideIdViaJsApi() {
    try {
        let slideId = null;
        await PowerPoint.run(async (context) => {
            const slides = context.presentation.getSelectedSlides();
            slides.load('items/id');
            await context.sync();
            if (slides.items.length > 0) {
                slideId = slides.items[0].id;
            }
        });
        return slideId;
    }
    catch (err) {
        dbg(`JS API getSelectedSlides ERROR: ${err}`);
        return null;
    }
}
/** Method 2: Common API — getSelectedDataAsync(SlideRange). */
function getSlideIdViaCommonApi() {
    return new Promise((resolve) => {
        try {
            Office.context.document.getSelectedDataAsync(Office.CoercionType.SlideRange, (result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    const data = result.value;
                    if (data.slides && data.slides.length > 0) {
                        const slide = data.slides[0];
                        dbg(`CommonAPI slide: id=${slide.id} index=${slide.index}`);
                        // Map index to JS API slide ID
                        const jsId = slideIndexToId.get(slide.index);
                        if (jsId) {
                            resolve(jsId);
                        }
                        else {
                            dbg(`No JS API ID found for index ${slide.index}`);
                            resolve(null);
                        }
                    }
                    else {
                        dbg('CommonAPI: no slides in result');
                        resolve(null);
                    }
                }
                else {
                    dbg(`CommonAPI FAILED: ${JSON.stringify(result.error)}`);
                    resolve(null);
                }
            });
        }
        catch (err) {
            dbg(`CommonAPI EXCEPTION: ${err}`);
            resolve(null);
        }
    });
}
/**
 * Get the current slide ID during slideshow.
 *
 * IMPORTANT: During slideshow, ONLY use Common API.
 * JS API returns the slide selected in the EDIT window, not the slideshow slide.
 * After dialog.close(), focus shifts to edit window and JS API returns wrong slide,
 * causing false "SLIDE CHANGED" events that reset the re-open guard.
 */
async function getSlideshowSlideId() {
    if (slideshowActive) {
        // Slideshow: Common API only — it returns the actual slideshow slide
        const commonResult = await getSlideIdViaCommonApi();
        return commonResult;
    }
    // Edit mode: try JS API first (more reliable in edit)
    const jsResult = await getSlideIdViaJsApi();
    if (jsResult) {
        dbg(`slideId via JS API: ${jsResult}`);
        return jsResult;
    }
    // Fallback: Common API
    const commonResult = await getSlideIdViaCommonApi();
    dbg(`slideId via CommonAPI: ${commonResult}`);
    return commonResult;
}
/**
 * Open or update the viewer for a slide during slideshow.
 *
 * CRITICAL: Closing `displayDialogAsync` during slideshow causes PowerPoint
 * to exit slideshow mode. We must NEVER close/reopen the dialog.
 *
 * Strategy:
 * - First URL in slideshow → open dialog normally (with the URL)
 * - Subsequent URLs → write to localStorage, viewer picks it up via `storage` event
 * - Slide with no URL → write empty string, viewer shows standby (black screen)
 */
async function autoOpenViewerForSlide(slideId) {
    const config = (0, settings_1.getSlideConfig)(slideId);
    dbg(`autoOpen: slide=${slideId} url=${config?.url ?? 'none'} autoOpen=${config?.autoOpen} lastClosed=${lastDialogClosedSlideId}`);
    if (!config?.url || !config.autoOpen)
        return;
    // Guard: don't re-open dialog for the same slide it was closed on
    if (slideId === lastDialogClosedSlideId) {
        dbg(`autoOpen: SKIPPED — dialog was already closed for slide ${slideId}`);
        return;
    }
    const delaySec = config.autoOpenDelaySec ?? 0;
    if (slideshowDialogOpened && launcher.isOpen()) {
        // Dialog already open — send URL via messageChild (no close/reopen!)
        dbg(`Sending URL via messageChild: ${config.url.substring(0, 50)}...`);
        const sent = launcher.sendMessage(JSON.stringify({ action: 'navigate', url: config.url }));
        dbg(`messageChild result: ${sent}`);
        return;
    }
    // Open dialog (with optional delay)
    if (delaySec > 0) {
        dbg(`autoOpen: delaying ${delaySec}s before opening dialog`);
        // Cancel any previous pending delay
        if (autoOpenDelayTimer)
            clearTimeout(autoOpenDelayTimer);
        autoOpenDelayTimer = setTimeout(() => {
            autoOpenDelayTimer = null;
            openDialogForSlide(config, slideId);
        }, delaySec * 1000);
    }
    else {
        await openDialogForSlide(config, slideId);
    }
}
/** Actually open the dialog. Extracted so it can be called immediately or after delay. */
async function openDialogForSlide(config, slideId) {
    const hideMethod = 'none';
    try {
        dbg(`Opening dialog: ${config.url.substring(0, 50)}... hide=${hideMethod}`);
        await launcher.open({
            url: config.url,
            zoom: config.zoom,
            width: config.dialogWidth,
            height: config.dialogHeight,
            lang: i18n_1.i18n.getLocale(),
            autoCloseSec: config.autoCloseSec,
            slideshow: true,
            hideMethod,
        });
        slideshowDialogOpened = true;
        dbg('Dialog opened OK');
    }
    catch (err) {
        dbg(`Dialog open FAILED: ${err}`);
    }
}
/** Poll slide changes during slideshow. */
async function pollSlideInSlideshow() {
    if (!slideshowActive)
        return;
    if (slidePollBusy) {
        dbg('poll SKIPPED (busy)');
        return;
    }
    slidePollBusy = true;
    try {
        const slideId = await getSlideshowSlideId();
        dbg(`poll tick: got=${slideId} last=${lastSlideshowSlideId}`);
        if (!slideId) {
            dbg('poll: slideId is null');
            return;
        }
        if (slideId === lastSlideshowSlideId)
            return;
        dbg(`SLIDE CHANGED: ${lastSlideshowSlideId} → ${slideId}`);
        lastSlideshowSlideId = slideId;
        lastDialogClosedSlideId = null; // Reset: allow dialog for the new slide
        // Cancel any pending auto-open delay from the previous slide
        if (autoOpenDelayTimer) {
            clearTimeout(autoOpenDelayTimer);
            autoOpenDelayTimer = null;
            dbg('Cancelled pending auto-open delay (slide changed)');
        }
        const config = (0, settings_1.getSlideConfig)(slideId);
        if (config?.autoOpen && config.url) {
            await autoOpenViewerForSlide(slideId);
        }
        else {
            // Slide has no URL or autoOpen is off.
            // Do NOT close the dialog (it would exit slideshow).
            // Instead, tell the viewer to show standby (black screen).
            dbg(`No URL for slide ${slideId} — sending standby`);
            if (slideshowDialogOpened && launcher.isOpen()) {
                launcher.sendMessage(JSON.stringify({ action: 'standby' }));
            }
        }
    }
    catch (err) {
        dbg(`poll ERROR: ${err}`);
    }
    finally {
        slidePollBusy = false;
    }
}
/** Called when slideshow mode is detected. */
async function onSlideshowEnter() {
    slideshowActive = true;
    lastSlideshowSlideId = null;
    slidePollBusy = false;
    dbg('SLIDESHOW DETECTED');
    // Build slide index map BEFORE trying to get current slide.
    // This is needed for the Common API fallback which returns index, not ID.
    await buildSlideIndexMap();
    // Immediately try to open viewer for the current slide
    dbg('Getting current slide...');
    const slideId = await getSlideshowSlideId();
    dbg(`Current slide result: ${slideId}`);
    if (slideId) {
        lastSlideshowSlideId = slideId;
        await autoOpenViewerForSlide(slideId);
    }
    else {
        dbg('Could not determine current slide in slideshow');
    }
    // Start polling for slide changes
    if (slidePollTimer)
        clearInterval(slidePollTimer);
    slidePollTimer = setInterval(() => { pollSlideInSlideshow(); }, SLIDE_POLL_INTERVAL_MS);
    dbg('Slide polling started');
}
/** Called when edit mode is restored. */
function onSlideshowExit() {
    slideshowActive = false;
    slideshowDialogOpened = false;
    dbg('SLIDESHOW ENDED');
    if (slidePollTimer) {
        clearInterval(slidePollTimer);
        slidePollTimer = null;
    }
    if (autoOpenDelayTimer) {
        clearTimeout(autoOpenDelayTimer);
        autoOpenDelayTimer = null;
    }
    lastSlideshowSlideId = null;
    // Safe to close dialog now — slideshow already exited
    launcher.close();
}
/** Periodically check view mode to detect slideshow start/end. */
let viewPollCount = 0;
async function pollViewMode() {
    viewPollCount++;
    const view = await getActiveView();
    const isSlideshow = view === 'read';
    // Log every 5th poll to show polling is alive, plus every mode change
    if (viewPollCount % 5 === 1) {
        dbg(`poll #${viewPollCount}: view="${view}" active=${slideshowActive}`);
    }
    if (isSlideshow && !slideshowActive) {
        await onSlideshowEnter();
    }
    else if (!isSlideshow && slideshowActive) {
        onSlideshowExit();
    }
}
/** Start monitoring for slideshow mode. */
function startViewModePolling() {
    if (viewPollTimer)
        return;
    viewPollTimer = setInterval(() => { pollViewMode(); }, VIEW_POLL_INTERVAL_MS);
    dbg('View mode polling STARTED (every 2s)');
}
function handleHowToToggle() {
    handleInfoToggle('howto-section', 'btn-howto-toggle');
}
// ─── Init ────────────────────────────────────────────────────────────────────
function init() {
    // Cache DOM refs
    urlInput = $('url-input');
    btnApply = $('btn-apply');
    btnShow = $('btn-show');
    btnDefaults = $('btn-defaults');
    statusEl = $('status');
    slideNumberEl = $('slide-number');
    langSelect = $('lang-select');
    sliderWidth = $('slider-width');
    sliderHeight = $('slider-height');
    sliderZoom = $('slider-zoom');
    sliderWidthValue = $('slider-width-value');
    sliderHeightValue = $('slider-height-value');
    sliderZoomValue = $('slider-zoom-value');
    sizePreviewInner = $('size-preview-inner');
    chkAutoOpen = $('chk-auto-open');
    chkLockSize = $('chk-lock-size');
    sliderAutoOpenDelay = $('slider-autoopendelay');
    sliderAutoOpenDelayValue = $('slider-autoopendelay-value');
    sectionAutoOpenDelay = $('section-auto-open-delay');
    sliderAutoClose = $('slider-autoclose');
    sliderAutoCloseValue = $('slider-autoclose-value');
    presetButtons = document.querySelectorAll('.btn-preset');
    viewerStatusEl = $('viewer-status');
    viewerStatusText = $('viewer-status-text');
    // Restore saved language or detect
    const savedLang = (0, settings_1.getLanguage)();
    if (savedLang) {
        i18n_1.i18n.setLocale(savedLang);
    }
    langSelect.value = i18n_1.i18n.getLocale();
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
    chkAutoOpen.addEventListener('change', handleAutoOpenChange);
    sliderAutoOpenDelay.addEventListener('input', handleAutoOpenDelayInput);
    sliderAutoClose.addEventListener('input', handleAutoCloseInput);
    $('btn-autoopen-info').addEventListener('click', handleAutoOpenInfoToggle);
    $('btn-autoclose-info').addEventListener('click', handleAutoCloseInfoToggle);
    document.querySelector('.zoom-presets')?.addEventListener('click', handlePresetClick);
    $('btn-guide-toggle').addEventListener('click', handleGuideToggle);
    document.querySelector('.guide-tabs')?.addEventListener('click', handleGuideTabClick);
    document.querySelector('.guide-tabs')?.addEventListener('keydown', handleGuideTabKeydown);
    $('guide-section').addEventListener('click', handleGuideCopy);
    // Detect current slide & listen for changes (only inside PowerPoint)
    detectCurrentSlide();
    buildSlideIndexMap();
    try {
        Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, () => { detectCurrentSlide(); });
    }
    catch { /* outside Office host — slide detection unavailable */ }
    // Viewer message → update status indicator
    launcher.onMessage(handleViewerMessage);
    // Dialog closed (user closed window or navigation error) → update UI
    launcher.onClosed(handleViewerClosed);
    // Start polling for slideshow mode.
    // The commands runtime (FunctionFile) may not persist, so the taskpane
    // handles auto-open as a reliable fallback.
    startViewModePolling();
    $('btn-howto-toggle').addEventListener('click', handleHowToToggle);
}
// ─── Bootstrap ───────────────────────────────────────────────────────────────
(0, logger_1.installUnhandledRejectionHandler)();
Office.onReady(() => init());

})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!***********************************!*\
  !*** ./src/taskpane/taskpane.css ***!
  \***********************************/
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QixDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUNyRSxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLDZDQUFnQyxHQUFFLENBQUM7QUFDbkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FDdGtDN0IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvZGlhbG9nLWxhdW5jaGVyLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL2kxOG4udHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvbG9nZ2VyLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL3NldHRpbmdzLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvdGFza3BhbmUvdGFza3BhbmUudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy90YXNrcGFuZS90YXNrcGFuZS5jc3M/NGM3NiJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyDilIDilIDilIAgU2V0dGluZyBrZXlzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFByZWZpeCBmb3IgcGVyLXNsaWRlIHNldHRpbmcga2V5cy4gRnVsbCBrZXk6IGB3ZWJwcHRfc2xpZGVfe3NsaWRlSWR9YC4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX1NMSURFX1BSRUZJWCA9ICd3ZWJwcHRfc2xpZGVfJztcclxuXHJcbi8qKiBLZXkgZm9yIHRoZSBzYXZlZCBVSSBsYW5ndWFnZS4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX0xBTkdVQUdFID0gJ3dlYnBwdF9sYW5ndWFnZSc7XHJcblxyXG4vKiogS2V5IGZvciBnbG9iYWwgZGVmYXVsdCBzbGlkZSBjb25maWcuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9ERUZBVUxUUyA9ICd3ZWJwcHRfZGVmYXVsdHMnO1xyXG5cclxuLy8g4pSA4pSA4pSAIFZpZXdlciBkZWZhdWx0cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1pPT00gPSAxMDA7XHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0RJQUxPR19XSURUSCA9IDEwMDsgICAvLyAlIG9mIHNjcmVlblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9ESUFMT0dfSEVJR0hUID0gMTAwOyAgLy8gJSBvZiBzY3JlZW5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19PUEVOID0gdHJ1ZTtcclxuXHJcbi8vIOKUgOKUgOKUgCBDb25zdHJhaW50IHJhbmdlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBaT09NX01JTiA9IDUwO1xyXG5leHBvcnQgY29uc3QgWk9PTV9NQVggPSAzMDA7XHJcblxyXG4vLyDilIDilIDilIAgQXV0by1vcGVuIGRlbGF5IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19PUEVOX0RFTEFZX1NFQyA9IDA7ICAgLy8gMCA9IGltbWVkaWF0ZVxyXG5cclxuLyoqXHJcbiAqIE5vbi1saW5lYXIgbG9va3VwIHRhYmxlIGZvciB0aGUgYXV0by1vcGVuIGRlbGF5IHNsaWRlci5cclxuICogSW5kZXggPSBzbGlkZXIgcG9zaXRpb24sIHZhbHVlID0gc2Vjb25kcy5cclxuICogUmFuZ2U6IDDigJM2MHMuIEdyYW51bGFyaXR5OiAxcyB1cCB0byAxMHMsIHRoZW4gNXMgdXAgdG8gMzBzLCB0aGVuIDEwcyB1cCB0byA2MHMuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQVVUT19PUEVOX0RFTEFZX1NURVBTOiByZWFkb25seSBudW1iZXJbXSA9IFtcclxuICAvLyAw4oCTMTBzLCBzdGVwIDEgICgxMSB2YWx1ZXM6IGluZGljZXMgMOKAkzEwKVxyXG4gIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLFxyXG4gIC8vIDEw4oCTNjBzLCBzdGVwIDUgICgxMCB2YWx1ZXM6IGluZGljZXMgMTHigJMyMClcclxuICAxNSwgMjAsIDI1LCAzMCwgMzUsIDQwLCA0NSwgNTAsIDU1LCA2MCxcclxuICAvLyAx4oCTMyBtaW4sIHN0ZXAgMTVzICAoOCB2YWx1ZXM6IGluZGljZXMgMjHigJMyOClcclxuICA3NSwgOTAsIDEwNSwgMTIwLCAxMzUsIDE1MCwgMTY1LCAxODAsXHJcbiAgLy8gM+KAkzUgbWluLCBzdGVwIDMwcyAgKDQgdmFsdWVzOiBpbmRpY2VzIDI54oCTMzIpXHJcbiAgMjEwLCAyNDAsIDI3MCwgMzAwLFxyXG5dO1xyXG5cclxuLy8g4pSA4pSA4pSAIEF1dG8tY2xvc2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRPX0NMT1NFX1NFQyA9IDA7ICAgLy8gMCA9IGRpc2FibGVkXHJcbmV4cG9ydCBjb25zdCBBVVRPX0NMT1NFX01BWF9TRUMgPSAzNjAwO1xyXG5cclxuLyoqXHJcbiAqIE5vbi1saW5lYXIgbG9va3VwIHRhYmxlIGZvciB0aGUgYXV0by1jbG9zZSBzbGlkZXIuXHJcbiAqIEluZGV4ID0gc2xpZGVyIHBvc2l0aW9uLCB2YWx1ZSA9IHNlY29uZHMuXHJcbiAqIEdyYW51bGFyaXR5IGRlY3JlYXNlcyBhcyB2YWx1ZXMgZ3JvdzogMXMg4oaSIDVzIOKGkiAxNXMg4oaSIDMwcyDihpIgNjBzIOKGkiAzMDBzLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEFVVE9fQ0xPU0VfU1RFUFM6IHJlYWRvbmx5IG51bWJlcltdID0gW1xyXG4gIC8vIDDigJMxMHMsIHN0ZXAgMSAgKDExIHZhbHVlcylcclxuICAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCxcclxuICAvLyAxMOKAkzYwcywgc3RlcCA1ICAoMTAgdmFsdWVzKVxyXG4gIDE1LCAyMCwgMjUsIDMwLCAzNSwgNDAsIDQ1LCA1MCwgNTUsIDYwLFxyXG4gIC8vIDHigJMzIG1pbiwgc3RlcCAxNXMgICg4IHZhbHVlcylcclxuICA3NSwgOTAsIDEwNSwgMTIwLCAxMzUsIDE1MCwgMTY1LCAxODAsXHJcbiAgLy8gM+KAkzUgbWluLCBzdGVwIDMwcyAgKDQgdmFsdWVzKVxyXG4gIDIxMCwgMjQwLCAyNzAsIDMwMCxcclxuICAvLyA14oCTMTAgbWluLCBzdGVwIDYwcyAgKDUgdmFsdWVzKVxyXG4gIDM2MCwgNDIwLCA0ODAsIDU0MCwgNjAwLFxyXG4gIC8vIDEw4oCTNjAgbWluLCBzdGVwIDMwMHMgICgxMCB2YWx1ZXMpXHJcbiAgOTAwLCAxMjAwLCAxNTAwLCAxODAwLCAyMTAwLCAyNDAwLCAyNzAwLCAzMDAwLCAzMzAwLCAzNjAwLFxyXG5dO1xyXG5cclxuLy8g4pSA4pSA4pSAIEVycm9yIGhhbmRsaW5nIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMgPSAyO1xyXG5leHBvcnQgY29uc3QgU0VUVElOR1NfU0FWRV9SRVRSWV9ERUxBWV9NUyA9IDEwMDA7XHJcbmV4cG9ydCBjb25zdCBJRlJBTUVfTE9BRF9USU1FT1VUX01TID0gMTBfMDAwO1xyXG5leHBvcnQgY29uc3QgVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCA9IDYwO1xyXG5cclxuLyoqIFRydW5jYXRlIGEgVVJMIGZvciBkaXNwbGF5LCBhcHBlbmRpbmcgZWxsaXBzaXMgaWYgbmVlZGVkLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJ1bmNhdGVVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGlmICh1cmwubGVuZ3RoIDw9IFVSTF9ESVNQTEFZX01BWF9MRU5HVEgpIHJldHVybiB1cmw7XHJcbiAgcmV0dXJuIHVybC5zdWJzdHJpbmcoMCwgVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCAtIDEpICsgJ1xcdTIwMjYnO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVidWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogU2V0IHRvIGBmYWxzZWAgaW4gcHJvZHVjdGlvbiBidWlsZHMgdmlhIHdlYnBhY2sgRGVmaW5lUGx1Z2luLlxyXG4gKiBGYWxscyBiYWNrIHRvIGB0cnVlYCBzbyBkZXYvdGVzdCBydW5zIGFsd2F5cyBsb2cuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVCVUc6IGJvb2xlYW4gPVxyXG4gIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcHJvY2Vzcy5lbnYgIT09ICd1bmRlZmluZWQnXHJcbiAgICA/IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbidcclxuICAgIDogdHJ1ZTtcclxuIiwiaW1wb3J0IHsgaTE4biwgdHlwZSBUcmFuc2xhdGlvbktleSB9IGZyb20gJy4vaTE4bic7XHJcbmltcG9ydCB7IGxvZ0RlYnVnLCBsb2dFcnJvciB9IGZyb20gJy4vbG9nZ2VyJztcclxuXHJcbi8vIOKUgOKUgOKUgCBDb25zdGFudHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogRmlsZW5hbWUgb2YgdGhlIHZpZXdlciBwYWdlIGJ1aWx0IGJ5IHdlYnBhY2suICovXHJcbmV4cG9ydCBjb25zdCBWSUVXRVJfUEFHRSA9ICd2aWV3ZXIuaHRtbCc7XHJcblxyXG4vKiogT2ZmaWNlIGRpc3BsYXlEaWFsb2dBc3luYyBlcnJvciBjb2Rlcy4gKi9cclxuY29uc3QgT1BFTl9FUlIgPSB7XHJcbiAgLyoqIEEgZGlhbG9nIGlzIGFscmVhZHkgb3BlbmVkIGZyb20gdGhpcyBhZGQtaW4uICovXHJcbiAgQUxSRUFEWV9PUEVORUQ6IDEyMDA3LFxyXG4gIC8qKiBVc2VyIGRpc21pc3NlZCB0aGUgZGlhbG9nIHByb21wdCAvIHBvcHVwIGJsb2NrZXIuICovXHJcbiAgUE9QVVBfQkxPQ0tFRDogMTIwMDksXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyDilIDilIDilIAgVHlwZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpYWxvZ0NvbmZpZyB7XHJcbiAgdXJsOiBzdHJpbmc7XHJcbiAgem9vbTogbnVtYmVyO1xyXG4gIHdpZHRoOiBudW1iZXI7ICAgLy8gJSBvZiBzY3JlZW4gKDEw4oCTMTAwKVxyXG4gIGhlaWdodDogbnVtYmVyOyAgLy8gJSBvZiBzY3JlZW4gKDEw4oCTMTAwKVxyXG4gIGxhbmc6IHN0cmluZztcclxuICBhdXRvQ2xvc2VTZWM/OiBudW1iZXI7ICAvLyAwIG9yIHVuZGVmaW5lZCA9IGRpc2FibGVkXHJcbiAgc2xpZGVzaG93PzogYm9vbGVhbjsgICAgLy8gdHJ1ZSA9IGRpYWxvZyBpcyBpbiBzbGlkZXNob3cgbW9kZSAoZG9uJ3QgYWN0dWFsbHkgY2xvc2Ugb24gdGltZXIpXHJcbiAgaGlkZU1ldGhvZD86ICdub25lJyB8ICdtb3ZlJyB8ICdyZXNpemUnOyAgLy8gaG93IHRvIGhpZGUgZGlhbG9nIGFmdGVyIHRpbWVyIGluIHNsaWRlc2hvd1xyXG59XHJcblxyXG4vKiogVHlwZWQgZXJyb3IgdGhyb3duIGJ5IHtAbGluayBEaWFsb2dMYXVuY2hlcn0uICovXHJcbmV4cG9ydCBjbGFzcyBEaWFsb2dFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyByZWFkb25seSBpMThuS2V5OiBUcmFuc2xhdGlvbktleSxcclxuICAgIHB1YmxpYyByZWFkb25seSBvZmZpY2VDb2RlPzogbnVtYmVyLFxyXG4gICkge1xyXG4gICAgc3VwZXIoaTE4bi50KGkxOG5LZXkpKTtcclxuICAgIHRoaXMubmFtZSA9ICdEaWFsb2dFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgREkgaW50ZXJmYWNlcyAodGVzdGFibGUgd2l0aG91dCBPZmZpY2UgcnVudGltZSkg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogTWluaW1hbCBzdWJzZXQgb2YgT2ZmaWNlLkRpYWxvZyB1c2VkIGJ5IHRoaXMgbW9kdWxlLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE9mZmljZURpYWxvZyB7XHJcbiAgY2xvc2UoKTogdm9pZDtcclxuICBhZGRFdmVudEhhbmRsZXIoXHJcbiAgICBldmVudFR5cGU6IHN0cmluZyxcclxuICAgIGhhbmRsZXI6IChhcmc6IHsgbWVzc2FnZT86IHN0cmluZzsgZXJyb3I/OiBudW1iZXIgfSkgPT4gdm9pZCxcclxuICApOiB2b2lkO1xyXG4gIC8qKiBTZW5kIGEgbWVzc2FnZSBmcm9tIGhvc3QgdG8gZGlhbG9nIChEaWFsb2dBcGkgMS4yKykuIE1heSBub3QgZXhpc3Qgb24gb2xkZXIgT2ZmaWNlLiAqL1xyXG4gIG1lc3NhZ2VDaGlsZD8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcclxufVxyXG5cclxuaW50ZXJmYWNlIERpYWxvZ09wZW5SZXN1bHQge1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG4gIHZhbHVlOiBPZmZpY2VEaWFsb2c7XHJcbiAgZXJyb3I6IHsgY29kZTogbnVtYmVyOyBtZXNzYWdlOiBzdHJpbmcgfTtcclxufVxyXG5cclxuLyoqIE1pbmltYWwgc3Vic2V0IG9mIE9mZmljZS5jb250ZXh0LnVpIG5lZWRlZCBmb3IgZGlhbG9nIG9wZXJhdGlvbnMuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nQXBpIHtcclxuICBkaXNwbGF5RGlhbG9nQXN5bmMoXHJcbiAgICBzdGFydEFkZHJlc3M6IHN0cmluZyxcclxuICAgIG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgY2FsbGJhY2s6IChyZXN1bHQ6IERpYWxvZ09wZW5SZXN1bHQpID0+IHZvaWQsXHJcbiAgKTogdm9pZDtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlcGVuZGVuY3kgaW5qZWN0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxubGV0IF9pbmplY3RlZEFwaTogRGlhbG9nQXBpIHwgbnVsbCA9IG51bGw7XHJcbmxldCBfaW5qZWN0ZWRCYXNlVXJsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSB0aGUgT2ZmaWNlIGRpYWxvZyBBUEkuIFBhc3MgYG51bGxgIHRvIHJlc3RvcmUgdGhlIHJlYWwgb25lLlxyXG4gKiBAaW50ZXJuYWwgVXNlZCBpbiB1bml0IHRlc3RzIG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX2luamVjdERpYWxvZ0FwaShhcGk6IERpYWxvZ0FwaSB8IG51bGwpOiB2b2lkIHtcclxuICBfaW5qZWN0ZWRBcGkgPSBhcGk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSB0aGUgdmlld2VyIGJhc2UgVVJMLiBQYXNzIGBudWxsYCB0byByZXN0b3JlIGF1dG8tZGV0ZWN0aW9uLlxyXG4gKiBAaW50ZXJuYWwgVXNlZCBpbiB1bml0IHRlc3RzIG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX2luamVjdEJhc2VVcmwodXJsOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XHJcbiAgX2luamVjdGVkQmFzZVVybCA9IHVybDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXBpKCk6IERpYWxvZ0FwaSB7XHJcbiAgaWYgKF9pbmplY3RlZEFwaSkgcmV0dXJuIF9pbmplY3RlZEFwaTtcclxuICByZXR1cm4gT2ZmaWNlLmNvbnRleHQudWkgYXMgdW5rbm93biBhcyBEaWFsb2dBcGk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFZpZXdlckJhc2VVcmwoKTogc3RyaW5nIHtcclxuICBpZiAoX2luamVjdGVkQmFzZVVybCkgcmV0dXJuIF9pbmplY3RlZEJhc2VVcmw7XHJcbiAgY29uc3QgZGlyID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teL10qJC8sICcnKTtcclxuICByZXR1cm4gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke2Rpcn0vJHtWSUVXRVJfUEFHRX1gO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGlhbG9nTGF1bmNoZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY2xhc3MgRGlhbG9nTGF1bmNoZXIge1xyXG4gIHByaXZhdGUgZGlhbG9nOiBPZmZpY2VEaWFsb2cgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIG1lc3NhZ2VDYWxsYmFjazogKChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBjbG9zZWRDYWxsYmFjazogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8qKiBCdWlsZCB0aGUgZnVsbCB2aWV3ZXIgVVJMIHdpdGggcXVlcnkgcGFyYW1ldGVycy4gKi9cclxuICBwcml2YXRlIGJ1aWxkVmlld2VyVXJsKGNvbmZpZzogRGlhbG9nQ29uZmlnKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xyXG4gICAgICB1cmw6IGNvbmZpZy51cmwsXHJcbiAgICAgIHpvb206IFN0cmluZyhjb25maWcuem9vbSksXHJcbiAgICAgIGxhbmc6IGNvbmZpZy5sYW5nLFxyXG4gICAgfSk7XHJcbiAgICBpZiAoY29uZmlnLmF1dG9DbG9zZVNlYyAmJiBjb25maWcuYXV0b0Nsb3NlU2VjID4gMCkge1xyXG4gICAgICBwYXJhbXMuc2V0KCdhdXRvY2xvc2UnLCBTdHJpbmcoY29uZmlnLmF1dG9DbG9zZVNlYykpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5zbGlkZXNob3cpIHtcclxuICAgICAgcGFyYW1zLnNldCgnc2xpZGVzaG93JywgJzEnKTtcclxuICAgIH1cclxuICAgIGlmIChjb25maWcuaGlkZU1ldGhvZCAmJiBjb25maWcuaGlkZU1ldGhvZCAhPT0gJ25vbmUnKSB7XHJcbiAgICAgIHBhcmFtcy5zZXQoJ2hpZGUnLCBjb25maWcuaGlkZU1ldGhvZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYCR7Z2V0Vmlld2VyQmFzZVVybCgpfT8ke3BhcmFtcy50b1N0cmluZygpfWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPcGVuIHRoZSB2aWV3ZXIgZGlhbG9nIHdpdGggdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXHJcbiAgICogSWYgYSBkaWFsb2cgaXMgYWxyZWFkeSBvcGVuLCBjbG9zZXMgaXQgZmlyc3QgYW5kIHJlb3BlbnMuXHJcbiAgICogUmVqZWN0cyB3aXRoIHtAbGluayBEaWFsb2dFcnJvcn0gaWYgdGhlIGRpYWxvZyBjYW5ub3QgYmUgb3BlbmVkLlxyXG4gICAqL1xyXG4gIGFzeW5jIG9wZW4oY29uZmlnOiBEaWFsb2dDb25maWcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIC8vIEF1dG8tY2xvc2UgYW55IGV4aXN0aW5nIGRpYWxvZyBiZWZvcmUgb3BlbmluZyBhIG5ldyBvbmVcclxuICAgIGlmICh0aGlzLmRpYWxvZykge1xyXG4gICAgICBsb2dEZWJ1ZygnQ2xvc2luZyBleGlzdGluZyBkaWFsb2cgYmVmb3JlIG9wZW5pbmcgYSBuZXcgb25lJyk7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHdWFyZDogY2hlY2sgdGhhdCBkaXNwbGF5RGlhbG9nQXN5bmMgaXMgYXZhaWxhYmxlXHJcbiAgICBjb25zdCBhcGkgPSBnZXRBcGkoKTtcclxuICAgIGlmICghYXBpIHx8IHR5cGVvZiBhcGkuZGlzcGxheURpYWxvZ0FzeW5jICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBEaWFsb2dFcnJvcignZGlhbG9nVW5zdXBwb3J0ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3ZXJVcmwgPSB0aGlzLmJ1aWxkVmlld2VyVXJsKGNvbmZpZyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudHJ5T3BlbihhcGksIHZpZXdlclVybCwgY29uZmlnLCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRlbXB0IHRvIG9wZW4gdGhlIGRpYWxvZy4gSWYgT2ZmaWNlIHJldHVybnMgMTIwMDcgKGFscmVhZHkgb3BlbmVkKVxyXG4gICAqIG9uIHRoZSBmaXJzdCB0cnksIHdhaXQgYnJpZWZseSBhbmQgcmV0cnkgb25jZSDigJQgdGhlIHByZXZpb3VzIGNsb3NlKClcclxuICAgKiBtYXkgbm90IGhhdmUgZnVsbHkgcHJvcGFnYXRlZCB5ZXQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlPcGVuKFxyXG4gICAgYXBpOiBEaWFsb2dBcGksXHJcbiAgICB2aWV3ZXJVcmw6IHN0cmluZyxcclxuICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnLFxyXG4gICAgaXNSZXRyeTogYm9vbGVhbixcclxuICApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGFwaS5kaXNwbGF5RGlhbG9nQXN5bmMoXHJcbiAgICAgICAgdmlld2VyVXJsLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHdpZHRoOiBjb25maWcud2lkdGgsXHJcbiAgICAgICAgICBoZWlnaHQ6IGNvbmZpZy5oZWlnaHQsXHJcbiAgICAgICAgICBkaXNwbGF5SW5JZnJhbWU6IGZhbHNlLFxyXG4gICAgICAgICAgcHJvbXB0QmVmb3JlT3BlbjogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcclxuICAgICAgICAgICAgLy8gT24gZmlyc3QgYXR0ZW1wdCwgaWYgT2ZmaWNlIHNheXMgXCJhbHJlYWR5IG9wZW5lZFwiLCByZXRyeSBvbmNlXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuZXJyb3IuY29kZSA9PT0gT1BFTl9FUlIuQUxSRUFEWV9PUEVORUQgJiYgIWlzUmV0cnkpIHtcclxuICAgICAgICAgICAgICBsb2dEZWJ1ZygnR290IDEyMDA3IChhbHJlYWR5IG9wZW5lZCkg4oCUIHJldHJ5aW5nIGFmdGVyIGRlbGF5Jyk7XHJcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyeU9wZW4oYXBpLCB2aWV3ZXJVcmwsIGNvbmZpZywgdHJ1ZSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxvZ0Vycm9yKCdkaXNwbGF5RGlhbG9nQXN5bmMgZmFpbGVkOicsIHJlc3VsdC5lcnJvci5jb2RlLCByZXN1bHQuZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHJlamVjdCh0aGlzLm1hcE9wZW5FcnJvcihyZXN1bHQuZXJyb3IuY29kZSkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5kaWFsb2cgPSByZXN1bHQudmFsdWU7XHJcblxyXG4gICAgICAgICAgdGhpcy5kaWFsb2cuYWRkRXZlbnRIYW5kbGVyKFxyXG4gICAgICAgICAgICAnZGlhbG9nTWVzc2FnZVJlY2VpdmVkJyxcclxuICAgICAgICAgICAgKGFyZykgPT4gdGhpcy5oYW5kbGVNZXNzYWdlKGFyZyksXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIHRoaXMuZGlhbG9nLmFkZEV2ZW50SGFuZGxlcihcclxuICAgICAgICAgICAgJ2RpYWxvZ0V2ZW50UmVjZWl2ZWQnLFxyXG4gICAgICAgICAgICAoYXJnKSA9PiB0aGlzLmhhbmRsZUV2ZW50KGFyZyksXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIGxvZ0RlYnVnKCdEaWFsb2cgb3BlbmVkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBDbG9zZSB0aGUgZGlhbG9nIGlmIGl0IGlzIG9wZW4uIFNhZmUgdG8gY2FsbCB3aGVuIGFscmVhZHkgY2xvc2VkLiAqL1xyXG4gIGNsb3NlKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmRpYWxvZykgcmV0dXJuO1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5kaWFsb2cuY2xvc2UoKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBsb2dFcnJvcignRXJyb3IgY2xvc2luZyBkaWFsb2c6JywgZXJyKTtcclxuICAgIH1cclxuICAgIHRoaXMuZGlhbG9nID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbmQgYSBtZXNzYWdlIGZyb20gdGhlIGhvc3QgKHRhc2twYW5lL2NvbW1hbmRzKSB0byB0aGUgZGlhbG9nLlxyXG4gICAqIFVzZXMgRGlhbG9nQXBpIDEuMiBgbWVzc2FnZUNoaWxkKClgLiBSZXR1cm5zIGZhbHNlIGlmIG5vdCBzdXBwb3J0ZWQuXHJcbiAgICovXHJcbiAgc2VuZE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXRoaXMuZGlhbG9nKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGlhbG9nLm1lc3NhZ2VDaGlsZCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBsb2dEZWJ1ZygnbWVzc2FnZUNoaWxkIG5vdCBhdmFpbGFibGUgb24gdGhpcyBPZmZpY2UgdmVyc2lvbicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLmRpYWxvZy5tZXNzYWdlQ2hpbGQobWVzc2FnZSk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdtZXNzYWdlQ2hpbGQgZmFpbGVkOicsIGVycik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBkaWFsb2cgaXMgY3VycmVudGx5IG9wZW4uICovXHJcbiAgaXNPcGVuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlhbG9nICE9PSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIFN1YnNjcmliZSB0byBtZXNzYWdlcyBzZW50IGZyb20gdGhlIHZpZXdlciB2aWEgYE9mZmljZS5jb250ZXh0LnVpLm1lc3NhZ2VQYXJlbnRgLiAqL1xyXG4gIG9uTWVzc2FnZShjYWxsYmFjazogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5tZXNzYWdlQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICB9XHJcblxyXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIGRpYWxvZyBiZWluZyBjbG9zZWQgKGJ5IHVzZXIgb3IgbmF2aWdhdGlvbiBlcnJvcikuICovXHJcbiAgb25DbG9zZWQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMuY2xvc2VkQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICB9XHJcblxyXG4gIC8vIOKUgOKUgOKUgCBQcml2YXRlIGhhbmRsZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuICBwcml2YXRlIGhhbmRsZU1lc3NhZ2UoYXJnOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSk6IHZvaWQge1xyXG4gICAgaWYgKGFyZy5tZXNzYWdlICYmIHRoaXMubWVzc2FnZUNhbGxiYWNrKSB7XHJcbiAgICAgIHRoaXMubWVzc2FnZUNhbGxiYWNrKGFyZy5tZXNzYWdlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRXZlbnQoYXJnOiB7IGVycm9yPzogbnVtYmVyIH0pOiB2b2lkIHtcclxuICAgIC8vIEFsbCBEaWFsb2dFdmVudFJlY2VpdmVkIGNvZGVzICgxMjAwMiBjbG9zZWQsIDEyMDAzIG1peGVkIGNvbnRlbnQsXHJcbiAgICAvLyAxMjAwNiBjcm9zcy1kb21haW4pIG1lYW4gdGhlIGRpYWxvZyBpcyBubyBsb25nZXIgdXNhYmxlLlxyXG4gICAgbG9nRGVidWcoJ0RpYWxvZyBldmVudCByZWNlaXZlZCwgY29kZTonLCBhcmcuZXJyb3IpO1xyXG4gICAgdGhpcy5kaWFsb2cgPSBudWxsO1xyXG4gICAgaWYgKHRoaXMuY2xvc2VkQ2FsbGJhY2spIHtcclxuICAgICAgdGhpcy5jbG9zZWRDYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtYXBPcGVuRXJyb3IoY29kZTogbnVtYmVyKTogRGlhbG9nRXJyb3Ige1xyXG4gICAgc3dpdGNoIChjb2RlKSB7XHJcbiAgICAgIGNhc2UgT1BFTl9FUlIuQUxSRUFEWV9PUEVORUQ6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2dFcnJvcignZGlhbG9nQWxyZWFkeU9wZW4nLCBjb2RlKTtcclxuICAgICAgY2FzZSBPUEVOX0VSUi5QT1BVUF9CTE9DS0VEOlxyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nRXJyb3IoJ2RpYWxvZ0Jsb2NrZWQnLCBjb2RlKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gbmV3IERpYWxvZ0Vycm9yKCdlcnJvckdlbmVyaWMnLCBjb2RlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IGxvY2FsZXNEYXRhIGZyb20gJy4uL2kxOG4vbG9jYWxlcy5qc29uJztcclxuXHJcbmV4cG9ydCB0eXBlIExvY2FsZSA9ICdlbicgfCAnemgnIHwgJ2VzJyB8ICdkZScgfCAnZnInIHwgJ2l0JyB8ICdhcicgfCAncHQnIHwgJ2hpJyB8ICdydSc7XHJcbmV4cG9ydCB0eXBlIFRyYW5zbGF0aW9uS2V5ID0ga2V5b2YgdHlwZW9mIGxvY2FsZXNEYXRhWydlbiddO1xyXG5cclxuLyoqIE1hcHMgYSBCQ1AgNDcgbGFuZ3VhZ2UgdGFnIHRvIGEgc3VwcG9ydGVkIExvY2FsZS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTG9jYWxlKGxhbmdUYWc6IHN0cmluZyk6IExvY2FsZSB7XHJcbiAgY29uc3QgdGFnID0gbGFuZ1RhZy50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnemgnKSkgcmV0dXJuICd6aCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdlcycpKSByZXR1cm4gJ2VzJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2RlJykpIHJldHVybiAnZGUnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnZnInKSkgcmV0dXJuICdmcic7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdpdCcpKSByZXR1cm4gJ2l0JztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2FyJykpIHJldHVybiAnYXInO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgncHQnKSkgcmV0dXJuICdwdCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdoaScpKSByZXR1cm4gJ2hpJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3J1JykpIHJldHVybiAncnUnO1xyXG4gIHJldHVybiAnZW4nO1xyXG59XHJcblxyXG5jbGFzcyBJMThuIHtcclxuICBwcml2YXRlIGxvY2FsZTogTG9jYWxlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGlzdGVuZXJzID0gbmV3IFNldDwoKSA9PiB2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMubG9jYWxlID0gdGhpcy5kZXRlY3RMb2NhbGUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGV0ZWN0TG9jYWxlKCk6IExvY2FsZSB7XHJcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiAnZW4nO1xyXG4gICAgcmV0dXJuIHBhcnNlTG9jYWxlKG5hdmlnYXRvci5sYW5ndWFnZSA/PyAnZW4nKTtcclxuICB9XHJcblxyXG4gIC8qKiBUcmFuc2xhdGUgYSBrZXkgaW4gdGhlIGN1cnJlbnQgbG9jYWxlLiBGYWxscyBiYWNrIHRvIEVuZ2xpc2gsIHRoZW4gdGhlIGtleSBpdHNlbGYuICovXHJcbiAgdChrZXk6IFRyYW5zbGF0aW9uS2V5KTogc3RyaW5nIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIGxvY2FsZXNEYXRhW3RoaXMubG9jYWxlXVtrZXldID8/XHJcbiAgICAgIGxvY2FsZXNEYXRhWydlbiddW2tleV0gPz9cclxuICAgICAga2V5XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZ2V0TG9jYWxlKCk6IExvY2FsZSB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2NhbGU7XHJcbiAgfVxyXG5cclxuICBnZXRBdmFpbGFibGVMb2NhbGVzKCk6IExvY2FsZVtdIHtcclxuICAgIHJldHVybiBbJ2VuJywgJ3poJywgJ2VzJywgJ2RlJywgJ2ZyJywgJ2l0JywgJ2FyJywgJ3B0JywgJ2hpJywgJ3J1J107XHJcbiAgfVxyXG5cclxuICAvKiogU3dpdGNoIGxvY2FsZSBhbmQgbm90aWZ5IGFsbCBsaXN0ZW5lcnMuICovXHJcbiAgc2V0TG9jYWxlKGxvY2FsZTogTG9jYWxlKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5sb2NhbGUgPT09IGxvY2FsZSkgcmV0dXJuO1xyXG4gICAgdGhpcy5sb2NhbGUgPSBsb2NhbGU7XHJcbiAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdWJzY3JpYmUgdG8gbG9jYWxlIGNoYW5nZXMuXHJcbiAgICogQHJldHVybnMgVW5zdWJzY3JpYmUgZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgb25Mb2NhbGVDaGFuZ2UobGlzdGVuZXI6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcclxuICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XHJcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBTaW5nbGV0b24gaTE4biBpbnN0YW5jZSBzaGFyZWQgYWNyb3NzIHRoZSBhZGQtaW4uICovXHJcbmV4cG9ydCBjb25zdCBpMThuID0gbmV3IEkxOG4oKTtcclxuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tICcuL2NvbnN0YW50cyc7XHJcblxyXG5jb25zdCBQUkVGSVggPSAnW1dlYlBQVF0nO1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xyXG5cclxuLyoqIExvZyBkZWJ1ZyBpbmZvIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0RlYnVnKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS5sb2coUFJFRklYLCAuLi5hcmdzKTtcclxufVxyXG5cclxuLyoqIExvZyB3YXJuaW5ncyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dXYXJuKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS53YXJuKFBSRUZJWCwgLi4uYXJncyk7XHJcbn1cclxuXHJcbi8qKiBMb2cgZXJyb3JzIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0Vycm9yKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS5lcnJvcihQUkVGSVgsIC4uLmFyZ3MpO1xyXG59XHJcblxyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cclxuXHJcbi8qKlxyXG4gKiBJbnN0YWxsIGEgZ2xvYmFsIGhhbmRsZXIgZm9yIHVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbnMuXHJcbiAqIENhbGwgb25jZSBwZXIgZW50cnkgcG9pbnQgKHRhc2twYW5lLCB2aWV3ZXIsIGNvbW1hbmRzKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlcigpOiB2b2lkIHtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgKGV2ZW50OiBQcm9taXNlUmVqZWN0aW9uRXZlbnQpID0+IHtcclxuICAgIGxvZ0Vycm9yKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb246JywgZXZlbnQucmVhc29uKTtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcbn1cclxuIiwiaW1wb3J0IHR5cGUgeyBMb2NhbGUgfSBmcm9tICcuL2kxOG4nO1xyXG5pbXBvcnQge1xyXG4gIFNFVFRJTkdfS0VZX1NMSURFX1BSRUZJWCxcclxuICBTRVRUSU5HX0tFWV9MQU5HVUFHRSxcclxuICBTRVRUSU5HX0tFWV9ERUZBVUxUUyxcclxuICBERUZBVUxUX1pPT00sXHJcbiAgREVGQVVMVF9ESUFMT0dfV0lEVEgsXHJcbiAgREVGQVVMVF9ESUFMT0dfSEVJR0hULFxyXG4gIERFRkFVTFRfQVVUT19PUEVOLFxyXG4gIERFRkFVTFRfQVVUT19DTE9TRV9TRUMsXHJcbiAgREVGQVVMVF9BVVRPX09QRU5fREVMQVlfU0VDLFxyXG4gIFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMsXHJcbiAgU0VUVElOR1NfU0FWRV9SRVRSWV9ERUxBWV9NUyxcclxufSBmcm9tICcuL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7IGxvZ0RlYnVnLCBsb2dFcnJvciB9IGZyb20gJy4vbG9nZ2VyJztcclxuXHJcbi8vIOKUgOKUgOKUgCBUeXBlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgV2ViUFBUU2xpZGVDb25maWcge1xyXG4gIHVybDogc3RyaW5nO1xyXG4gIHpvb206IG51bWJlcjsgICAgICAgICAgLy8gNTDigJMzMDBcclxuICBkaWFsb2dXaWR0aDogbnVtYmVyOyAgIC8vIDMw4oCTMTAwICglIG9mIHNjcmVlbilcclxuICBkaWFsb2dIZWlnaHQ6IG51bWJlcjsgIC8vIDMw4oCTMTAwICglIG9mIHNjcmVlbilcclxuICBhdXRvT3BlbjogYm9vbGVhbjtcclxuICBhdXRvT3BlbkRlbGF5U2VjOiBudW1iZXI7ICAvLyAwID0gaW1tZWRpYXRlLCAx4oCTNjAgc2Vjb25kcyBkZWxheSBiZWZvcmUgb3BlbmluZ1xyXG4gIGF1dG9DbG9zZVNlYzogbnVtYmVyOyAgLy8gMCA9IGRpc2FibGVkLCAx4oCTNjAgc2Vjb25kc1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU2F2ZVJlc3VsdCB7XHJcbiAgc3RhdHVzOiBzdHJpbmc7XHJcbiAgZXJyb3I6IHsgbWVzc2FnZTogc3RyaW5nIH0gfCBudWxsO1xyXG59XHJcblxyXG4vKiogTWluaW1hbCBzdWJzZXQgb2YgT2ZmaWNlLlNldHRpbmdzIHVzZWQgYnkgdGhpcyBtb2R1bGUuICovXHJcbmludGVyZmFjZSBTZXR0aW5nc1N0b3JlIHtcclxuICBnZXQobmFtZTogc3RyaW5nKTogdW5rbm93bjtcclxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQ7XHJcbiAgcmVtb3ZlKG5hbWU6IHN0cmluZyk6IHZvaWQ7XHJcbiAgc2F2ZUFzeW5jKGNhbGxiYWNrOiAocmVzdWx0OiBTYXZlUmVzdWx0KSA9PiB2b2lkKTogdm9pZDtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlcGVuZGVuY3kgaW5qZWN0aW9uIChmb3IgdGVzdGluZykg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5sZXQgX2luamVjdGVkU3RvcmU6IFNldHRpbmdzU3RvcmUgfCBudWxsID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSB0aGUgT2ZmaWNlIHNldHRpbmdzIHN0b3JlLiBQYXNzIGBudWxsYCB0byByZXN0b3JlIHRoZSByZWFsIG9uZS5cclxuICogQGludGVybmFsIFVzZWQgaW4gdW5pdCB0ZXN0cyBvbmx5LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9pbmplY3RTZXR0aW5nc1N0b3JlKHN0b3JlOiBTZXR0aW5nc1N0b3JlIHwgbnVsbCk6IHZvaWQge1xyXG4gIF9pbmplY3RlZFN0b3JlID0gc3RvcmU7XHJcbn1cclxuXHJcbi8qKiBJbi1tZW1vcnkgZmFsbGJhY2sgd2hlbiBydW5uaW5nIG91dHNpZGUgUG93ZXJQb2ludCAoZS5nLiBicm93c2VyIHRlc3RpbmcpLiAqL1xyXG5jb25zdCBfbWVtb3J5U3RvcmU6IFNldHRpbmdzU3RvcmUgPSAoKCkgPT4ge1xyXG4gIGNvbnN0IGRhdGEgPSBuZXcgTWFwPHN0cmluZywgdW5rbm93bj4oKTtcclxuICByZXR1cm4ge1xyXG4gICAgZ2V0OiAobmFtZTogc3RyaW5nKSA9PiBkYXRhLmdldChuYW1lKSA/PyBudWxsLFxyXG4gICAgc2V0OiAobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikgPT4geyBkYXRhLnNldChuYW1lLCB2YWx1ZSk7IH0sXHJcbiAgICByZW1vdmU6IChuYW1lOiBzdHJpbmcpID0+IHsgZGF0YS5kZWxldGUobmFtZSk7IH0sXHJcbiAgICBzYXZlQXN5bmM6IChjYjogKHI6IFNhdmVSZXN1bHQpID0+IHZvaWQpID0+IHsgY2IoeyBzdGF0dXM6ICdzdWNjZWVkZWQnLCBlcnJvcjogbnVsbCB9KTsgfSxcclxuICB9O1xyXG59KSgpO1xyXG5cclxuZnVuY3Rpb24gZ2V0U3RvcmUoKTogU2V0dGluZ3NTdG9yZSB7XHJcbiAgaWYgKF9pbmplY3RlZFN0b3JlKSByZXR1cm4gX2luamVjdGVkU3RvcmU7XHJcbiAgLyogZ2xvYmFsIE9mZmljZSAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IE9mZmljZS5jb250ZXh0Py5kb2N1bWVudD8uc2V0dGluZ3M7XHJcbiAgICBpZiAoc2V0dGluZ3MpIHJldHVybiBzZXR0aW5ncyBhcyB1bmtub3duIGFzIFNldHRpbmdzU3RvcmU7XHJcbiAgfSBjYXRjaCB7IC8qIG91dHNpZGUgT2ZmaWNlIGhvc3QgKi8gfVxyXG4gIHJldHVybiBfbWVtb3J5U3RvcmU7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBJbnRlcm5hbCBoZWxwZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gc2xpZGVLZXkoc2xpZGVJZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gYCR7U0VUVElOR19LRVlfU0xJREVfUFJFRklYfSR7c2xpZGVJZH1gO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlT25jZShzdG9yZTogU2V0dGluZ3NTdG9yZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBzdG9yZS5zYXZlQXN5bmMoKHJlc3VsdCkgPT4ge1xyXG4gICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKHJlc3VsdC5lcnJvcj8ubWVzc2FnZSA/PyAnU2V0dGluZ3Mgc2F2ZSBmYWlsZWQnKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVsYXkobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG4vKipcclxuICogU2F2ZSBzZXR0aW5ncyB3aXRoIGF1dG9tYXRpYyByZXRyeS5cclxuICogUmV0cmllcyB1cCB0byB7QGxpbmsgU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFU30gdGltZXMgd2l0aCBhIGRlbGF5IGJldHdlZW4gYXR0ZW1wdHMuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBzYXZlKHN0b3JlOiBTZXR0aW5nc1N0b3JlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IGF0dGVtcHQgPD0gU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFUzsgYXR0ZW1wdCsrKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBzYXZlT25jZShzdG9yZSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBpZiAoYXR0ZW1wdCA8IFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMpIHtcclxuICAgICAgICBsb2dEZWJ1ZyhgU2V0dGluZ3Mgc2F2ZSBhdHRlbXB0ICR7YXR0ZW1wdCArIDF9IGZhaWxlZCwgcmV0cnlpbmcuLi5gKTtcclxuICAgICAgICBhd2FpdCBkZWxheShTRVRUSU5HU19TQVZFX1JFVFJZX0RFTEFZX01TKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsb2dFcnJvcignU2V0dGluZ3Mgc2F2ZSBmYWlsZWQgYWZ0ZXIgYWxsIHJldHJpZXM6JywgZXJyKTtcclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTbGlkZSBjb25maWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUmV0dXJucyB0aGUgc2F2ZWQgY29uZmlnIGZvciBhIHNsaWRlLCBvciBgbnVsbGAgaWYgbm90IHNldC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFNsaWRlQ29uZmlnKHNsaWRlSWQ6IHN0cmluZyk6IFdlYlBQVFNsaWRlQ29uZmlnIHwgbnVsbCB7XHJcbiAgY29uc3QgcmF3ID0gZ2V0U3RvcmUoKS5nZXQoc2xpZGVLZXkoc2xpZGVJZCkpO1xyXG4gIHJldHVybiByYXcgPyAocmF3IGFzIFdlYlBQVFNsaWRlQ29uZmlnKSA6IG51bGw7XHJcbn1cclxuXHJcbi8qKiBTYXZlcyBjb25maWcgZm9yIGEgc2xpZGUgYW5kIHBlcnNpc3RzIHRvIGRvY3VtZW50LiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U2xpZGVDb25maWcoc2xpZGVJZDogc3RyaW5nLCBjb25maWc6IFdlYlBQVFNsaWRlQ29uZmlnKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnNldChzbGlkZUtleShzbGlkZUlkKSwgY29uZmlnKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG5cclxuLyoqIFJlbW92ZXMgdGhlIHNhdmVkIGNvbmZpZyBmb3IgYSBzbGlkZS4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVNsaWRlQ29uZmlnKHNsaWRlSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKTtcclxuICBzdG9yZS5yZW1vdmUoc2xpZGVLZXkoc2xpZGVJZCkpO1xyXG4gIGF3YWl0IHNhdmUoc3RvcmUpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgTGFuZ3VhZ2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUmV0dXJucyB0aGUgc2F2ZWQgVUkgbGFuZ3VhZ2UsIG9yIGBudWxsYCBpZiBub3Qgc2V0LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGFuZ3VhZ2UoKTogTG9jYWxlIHwgbnVsbCB7XHJcbiAgcmV0dXJuIChnZXRTdG9yZSgpLmdldChTRVRUSU5HX0tFWV9MQU5HVUFHRSkgYXMgTG9jYWxlKSA/PyBudWxsO1xyXG59XHJcblxyXG4vKiogU2F2ZXMgdGhlIFVJIGxhbmd1YWdlIGFuZCBwZXJzaXN0cyB0byBkb2N1bWVudC4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldExhbmd1YWdlKGxvY2FsZTogTG9jYWxlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnNldChTRVRUSU5HX0tFWV9MQU5HVUFHRSwgbG9jYWxlKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlZmF1bHRzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFJldHVybnMgc2F2ZWQgZ2xvYmFsIGRlZmF1bHRzLCBvciBidWlsdC1pbiBkZWZhdWx0cyBpZiBub3Qgc2V0LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdHMoKTogV2ViUFBUU2xpZGVDb25maWcge1xyXG4gIGNvbnN0IHN0b3JlZCA9IGdldFN0b3JlKCkuZ2V0KFNFVFRJTkdfS0VZX0RFRkFVTFRTKSBhcyBXZWJQUFRTbGlkZUNvbmZpZyB8IG51bGw7XHJcbiAgcmV0dXJuIHN0b3JlZCA/PyB7XHJcbiAgICB1cmw6ICcnLFxyXG4gICAgem9vbTogREVGQVVMVF9aT09NLFxyXG4gICAgZGlhbG9nV2lkdGg6IERFRkFVTFRfRElBTE9HX1dJRFRILFxyXG4gICAgZGlhbG9nSGVpZ2h0OiBERUZBVUxUX0RJQUxPR19IRUlHSFQsXHJcbiAgICBhdXRvT3BlbjogREVGQVVMVF9BVVRPX09QRU4sXHJcbiAgICBhdXRvT3BlbkRlbGF5U2VjOiBERUZBVUxUX0FVVE9fT1BFTl9ERUxBWV9TRUMsXHJcbiAgICBhdXRvQ2xvc2VTZWM6IERFRkFVTFRfQVVUT19DTE9TRV9TRUMsXHJcbiAgfTtcclxufVxyXG5cclxuLyoqIFNhdmVzIGdsb2JhbCBkZWZhdWx0cyBhbmQgcGVyc2lzdHMgdG8gZG9jdW1lbnQuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXREZWZhdWx0cyhjb25maWc6IFdlYlBQVFNsaWRlQ29uZmlnKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnNldChTRVRUSU5HX0tFWV9ERUZBVUxUUywgY29uZmlnKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBpMThuLCB0eXBlIExvY2FsZSwgdHlwZSBUcmFuc2xhdGlvbktleSB9IGZyb20gJy4uL3NoYXJlZC9pMThuJztcclxuaW1wb3J0IHsgZ2V0U2xpZGVDb25maWcsIHNldFNsaWRlQ29uZmlnLCBnZXRMYW5ndWFnZSwgc2V0TGFuZ3VhZ2UsIGdldERlZmF1bHRzLCBzZXREZWZhdWx0cyB9IGZyb20gJy4uL3NoYXJlZC9zZXR0aW5ncyc7XHJcbmltcG9ydCB7IERpYWxvZ0xhdW5jaGVyLCBEaWFsb2dFcnJvciB9IGZyb20gJy4uL3NoYXJlZC9kaWFsb2ctbGF1bmNoZXInO1xyXG5pbXBvcnQgeyBsb2dEZWJ1ZywgbG9nRXJyb3IsIGluc3RhbGxVbmhhbmRsZWRSZWplY3Rpb25IYW5kbGVyIH0gZnJvbSAnLi4vc2hhcmVkL2xvZ2dlcic7XHJcbmltcG9ydCB7IEFVVE9fQ0xPU0VfU1RFUFMsIEFVVE9fT1BFTl9ERUxBWV9TVEVQUywgdHJ1bmNhdGVVcmwgfSBmcm9tICcuLi9zaGFyZWQvY29uc3RhbnRzJztcclxuXHJcbi8vIOKUgOKUgOKUgCBET00gcmVmZXJlbmNlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmNvbnN0ICQgPSA8VCBleHRlbmRzIEhUTUxFbGVtZW50PihpZDogc3RyaW5nKTogVCA9PlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSBhcyBUO1xyXG5cclxubGV0IHVybElucHV0OiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgYnRuQXBwbHk6IEhUTUxCdXR0b25FbGVtZW50O1xyXG5sZXQgYnRuU2hvdzogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbmxldCBidG5EZWZhdWx0cyE6IEhUTUxCdXR0b25FbGVtZW50O1xyXG5sZXQgc3RhdHVzRWw6IEhUTUxFbGVtZW50O1xyXG5sZXQgc2xpZGVOdW1iZXJFbDogSFRNTEVsZW1lbnQ7XHJcbmxldCBsYW5nU2VsZWN0OiBIVE1MU2VsZWN0RWxlbWVudDtcclxubGV0IHNsaWRlcldpZHRoITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlckhlaWdodCE6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJab29tITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlcldpZHRoVmFsdWUhOiBIVE1MRWxlbWVudDtcclxubGV0IHNsaWRlckhlaWdodFZhbHVlITogSFRNTEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJab29tVmFsdWUhOiBIVE1MRWxlbWVudDtcclxubGV0IHNpemVQcmV2aWV3SW5uZXIhOiBIVE1MRWxlbWVudDtcclxubGV0IGNoa0F1dG9PcGVuITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IGNoa0xvY2tTaXplITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlckF1dG9PcGVuRGVsYXkhOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVyQXV0b09wZW5EZWxheVZhbHVlITogSFRNTEVsZW1lbnQ7XHJcbmxldCBzZWN0aW9uQXV0b09wZW5EZWxheSE6IEhUTUxFbGVtZW50O1xyXG5sZXQgc2xpZGVyQXV0b0Nsb3NlITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlckF1dG9DbG9zZVZhbHVlITogSFRNTEVsZW1lbnQ7XHJcbmxldCBwcmVzZXRCdXR0b25zITogTm9kZUxpc3RPZjxIVE1MQnV0dG9uRWxlbWVudD47XHJcbmxldCB2aWV3ZXJTdGF0dXNFbCE6IEhUTUxFbGVtZW50O1xyXG5sZXQgdmlld2VyU3RhdHVzVGV4dCE6IEhUTUxFbGVtZW50O1xyXG5cclxuLy8g4pSA4pSA4pSAIFN0YXRlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxubGV0IGN1cnJlbnRTbGlkZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxubGV0IGN1cnJlbnRTbGlkZUluZGV4OiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuY29uc3QgbGF1bmNoZXIgPSBuZXcgRGlhbG9nTGF1bmNoZXIoKTtcclxubGV0IHZpZXdlclN0YXR1c1RpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xyXG5cclxuLy8g4pSA4pSA4pSAIGkxOG4g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBhcHBseUkxOG4oKTogdm9pZCB7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJ1tkYXRhLWkxOG5dJykuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgIGNvbnN0IGtleSA9IGVsLmRhdGFzZXQuaTE4biBhcyBUcmFuc2xhdGlvbktleTtcclxuICAgIGVsLnRleHRDb250ZW50ID0gaTE4bi50KGtleSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTElucHV0RWxlbWVudD4oJ1tkYXRhLWkxOG4tcGxhY2Vob2xkZXJdJykuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgIGNvbnN0IGtleSA9IGVsLmRhdGFzZXQuaTE4blBsYWNlaG9sZGVyIGFzIFRyYW5zbGF0aW9uS2V5O1xyXG4gICAgZWwucGxhY2Vob2xkZXIgPSBpMThuLnQoa2V5KTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJ1tkYXRhLWkxOG4tdGl0bGVdJykuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgIGNvbnN0IGtleSA9IGVsLmRhdGFzZXQuaTE4blRpdGxlIGFzIFRyYW5zbGF0aW9uS2V5O1xyXG4gICAgZWwudGl0bGUgPSBpMThuLnQoa2V5KTtcclxuICB9KTtcclxuXHJcbiAgLy8gS2VlcCA8aHRtbCBsYW5nPiBpbiBzeW5jIHdpdGggdGhlIGFjdGl2ZSBsb2NhbGVcclxuICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZyA9IGkxOG4uZ2V0TG9jYWxlKCk7XHJcblxyXG4gIC8vIEd1aWRlIHRvZ2dsZSBidXR0b24gdXNlcyBkYXRhLWkxOG49XCJzaXRlTm90TG9hZGluZ1wiLCBidXQgd2hlbiB0aGUgZ3VpZGVcclxuICAvLyBpcyBjdXJyZW50bHkgb3BlbiB0aGUgbGFiZWwgc2hvdWxkIHJlYWQgXCJoaWRlU2V0dXBHdWlkZVwiIGluc3RlYWQuXHJcbiAgY29uc3QgZ3VpZGVTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2d1aWRlLXNlY3Rpb24nKTtcclxuICBpZiAoZ3VpZGVTZWN0aW9uICYmICFndWlkZVNlY3Rpb24uaGlkZGVuKSB7XHJcbiAgICBjb25zdCB0b2dnbGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWd1aWRlLXRvZ2dsZScpO1xyXG4gICAgaWYgKHRvZ2dsZUJ0bikge1xyXG4gICAgICB0b2dnbGVCdG4udGV4dENvbnRlbnQgPSBpMThuLnQoJ2hpZGVTZXR1cEd1aWRlJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGUgZGV0ZWN0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZGV0ZWN0Q3VycmVudFNsaWRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBQb3dlclBvaW50LnJ1bihhc3luYyAoY29udGV4dCkgPT4ge1xyXG4gICAgICBjb25zdCBzbGlkZXMgPSBjb250ZXh0LnByZXNlbnRhdGlvbi5nZXRTZWxlY3RlZFNsaWRlcygpO1xyXG4gICAgICBzbGlkZXMubG9hZCgnaXRlbXMvaWQnKTtcclxuICAgICAgYXdhaXQgY29udGV4dC5zeW5jKCk7XHJcblxyXG4gICAgICBpZiAoc2xpZGVzLml0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBjb25zdCBzbGlkZSA9IHNsaWRlcy5pdGVtc1swXTtcclxuICAgICAgICBjdXJyZW50U2xpZGVJZCA9IHNsaWRlLmlkO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgMS1iYXNlZCBpbmRleFxyXG4gICAgICAgIGNvbnN0IGFsbFNsaWRlcyA9IGNvbnRleHQucHJlc2VudGF0aW9uLnNsaWRlcztcclxuICAgICAgICBhbGxTbGlkZXMubG9hZCgnaXRlbXMvaWQnKTtcclxuICAgICAgICBhd2FpdCBjb250ZXh0LnN5bmMoKTtcclxuXHJcbiAgICAgICAgY3VycmVudFNsaWRlSW5kZXggPSBudWxsO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsU2xpZGVzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoYWxsU2xpZGVzLml0ZW1zW2ldLmlkID09PSBjdXJyZW50U2xpZGVJZCkge1xyXG4gICAgICAgICAgICBjdXJyZW50U2xpZGVJbmRleCA9IGkgKyAxO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgY3VycmVudFNsaWRlSWQgPSBudWxsO1xyXG4gICAgY3VycmVudFNsaWRlSW5kZXggPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlU2xpZGVVSSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVTaXplUHJldmlldygpOiB2b2lkIHtcclxuICBjb25zdCB3ID0gTnVtYmVyKHNsaWRlcldpZHRoLnZhbHVlKTtcclxuICBjb25zdCBoID0gTnVtYmVyKHNsaWRlckhlaWdodC52YWx1ZSk7XHJcbiAgLy8gUHJldmlldyBib3ggaXMgNjTDlzQ4OyBzY2FsZSBwcm9wb3J0aW9uYWxseVxyXG4gIHNpemVQcmV2aWV3SW5uZXIuc3R5bGUud2lkdGggPSBgJHsodyAvIDEwMCkgKiA1OH1weGA7XHJcbiAgc2l6ZVByZXZpZXdJbm5lci5zdHlsZS5oZWlnaHQgPSBgJHsoaCAvIDEwMCkgKiA0Mn1weGA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvcm1hdEF1dG9DbG9zZUxhYmVsKHNlYzogbnVtYmVyKTogc3RyaW5nIHtcclxuICBpZiAoc2VjID09PSAwKSByZXR1cm4gaTE4bi50KCdhdXRvQ2xvc2VPZmYnKTtcclxuICBpZiAoc2VjIDwgNjApIHJldHVybiBgJHtzZWN9c2A7XHJcbiAgY29uc3QgbSA9IE1hdGguZmxvb3Ioc2VjIC8gNjApO1xyXG4gIGNvbnN0IHMgPSBzZWMgJSA2MDtcclxuICBpZiAoc2VjID49IDM2MDApIHJldHVybiBgJHtNYXRoLmZsb29yKHNlYyAvIDM2MDApfWhgO1xyXG4gIHJldHVybiBzID09PSAwID8gYCR7bX1tYCA6IGAke219bSAke3N9c2A7XHJcbn1cclxuXHJcbi8qKiBDb252ZXJ0IHNlY29uZHMgdmFsdWUg4oaSIG5lYXJlc3Qgc2xpZGVyIGluZGV4LiAqL1xyXG5mdW5jdGlvbiBzZWNvbmRzVG9TbGlkZXJJbmRleChzZWM6IG51bWJlcik6IG51bWJlciB7XHJcbiAgbGV0IGJlc3QgPSAwO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgQVVUT19DTE9TRV9TVEVQUy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKE1hdGguYWJzKEFVVE9fQ0xPU0VfU1RFUFNbaV0gLSBzZWMpIDwgTWF0aC5hYnMoQVVUT19DTE9TRV9TVEVQU1tiZXN0XSAtIHNlYykpIHtcclxuICAgICAgYmVzdCA9IGk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBiZXN0O1xyXG59XHJcblxyXG4vKiogUmVhZCBhY3R1YWwgc2Vjb25kcyBmcm9tIHRoZSBjdXJyZW50IHNsaWRlciBwb3NpdGlvbi4gKi9cclxuZnVuY3Rpb24gZ2V0QXV0b0Nsb3NlU2Vjb25kcygpOiBudW1iZXIge1xyXG4gIHJldHVybiBBVVRPX0NMT1NFX1NURVBTW051bWJlcihzbGlkZXJBdXRvQ2xvc2UudmFsdWUpXSA/PyAwO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQXV0by1vcGVuIGRlbGF5IGhlbHBlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBmb3JtYXRBdXRvT3BlbkRlbGF5TGFiZWwoc2VjOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gIGlmIChzZWMgPT09IDApIHJldHVybiBpMThuLnQoJ2F1dG9PcGVuRGVsYXlJbW1lZGlhdGUnKTtcclxuICByZXR1cm4gYCR7c2VjfXNgO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZWNvbmRzVG9EZWxheVNsaWRlckluZGV4KHNlYzogbnVtYmVyKTogbnVtYmVyIHtcclxuICBsZXQgYmVzdCA9IDA7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBBVVRPX09QRU5fREVMQVlfU1RFUFMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChNYXRoLmFicyhBVVRPX09QRU5fREVMQVlfU1RFUFNbaV0gLSBzZWMpIDwgTWF0aC5hYnMoQVVUT19PUEVOX0RFTEFZX1NURVBTW2Jlc3RdIC0gc2VjKSkge1xyXG4gICAgICBiZXN0ID0gaTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGJlc3Q7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEF1dG9PcGVuRGVsYXlTZWNvbmRzKCk6IG51bWJlciB7XHJcbiAgcmV0dXJuIEFVVE9fT1BFTl9ERUxBWV9TVEVQU1tOdW1iZXIoc2xpZGVyQXV0b09wZW5EZWxheS52YWx1ZSldID8/IDA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUF1dG9PcGVuRGVsYXlWaXNpYmlsaXR5KCk6IHZvaWQge1xyXG4gIHNlY3Rpb25BdXRvT3BlbkRlbGF5LmhpZGRlbiA9ICFjaGtBdXRvT3Blbi5jaGVja2VkO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGVyIFVJIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gc2V0U2xpZGVyVUkod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHpvb206IG51bWJlciwgYXV0b09wZW46IGJvb2xlYW4sIGF1dG9PcGVuRGVsYXlTZWM6IG51bWJlciwgYXV0b0Nsb3NlU2VjOiBudW1iZXIpOiB2b2lkIHtcclxuICBzbGlkZXJXaWR0aC52YWx1ZSA9IFN0cmluZyh3aWR0aCk7XHJcbiAgc2xpZGVySGVpZ2h0LnZhbHVlID0gU3RyaW5nKGhlaWdodCk7XHJcbiAgc2xpZGVyWm9vbS52YWx1ZSA9IFN0cmluZyh6b29tKTtcclxuICBzbGlkZXJXaWR0aFZhbHVlLnRleHRDb250ZW50ID0gYCR7d2lkdGh9JWA7XHJcbiAgc2xpZGVySGVpZ2h0VmFsdWUudGV4dENvbnRlbnQgPSBgJHtoZWlnaHR9JWA7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7em9vbX0lYDtcclxuICBjaGtBdXRvT3Blbi5jaGVja2VkID0gYXV0b09wZW47XHJcbiAgc2xpZGVyQXV0b09wZW5EZWxheS52YWx1ZSA9IFN0cmluZyhzZWNvbmRzVG9EZWxheVNsaWRlckluZGV4KGF1dG9PcGVuRGVsYXlTZWMpKTtcclxuICBzbGlkZXJBdXRvT3BlbkRlbGF5VmFsdWUudGV4dENvbnRlbnQgPSBmb3JtYXRBdXRvT3BlbkRlbGF5TGFiZWwoYXV0b09wZW5EZWxheVNlYyk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlLnZhbHVlID0gU3RyaW5nKHNlY29uZHNUb1NsaWRlckluZGV4KGF1dG9DbG9zZVNlYykpO1xyXG4gIHNsaWRlckF1dG9DbG9zZVZhbHVlLnRleHRDb250ZW50ID0gZm9ybWF0QXV0b0Nsb3NlTGFiZWwoYXV0b0Nsb3NlU2VjKTtcclxuICB1cGRhdGVBdXRvT3BlbkRlbGF5VmlzaWJpbGl0eSgpO1xyXG4gIHVwZGF0ZVNpemVQcmV2aWV3KCk7XHJcbiAgdXBkYXRlQWN0aXZlUHJlc2V0KHpvb20pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVBY3RpdmVQcmVzZXQoem9vbTogbnVtYmVyKTogdm9pZCB7XHJcbiAgcHJlc2V0QnV0dG9ucy5mb3JFYWNoKChidG4pID0+IHtcclxuICAgIGNvbnN0IHZhbCA9IE51bWJlcihidG4uZGF0YXNldC56b29tKTtcclxuICAgIGJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdidG4tcHJlc2V0LS1hY3RpdmUnLCB2YWwgPT09IHpvb20pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVTbGlkZVVJKCk6IHZvaWQge1xyXG4gIHNsaWRlTnVtYmVyRWwudGV4dENvbnRlbnQgPSBjdXJyZW50U2xpZGVJbmRleCAhPSBudWxsID8gU3RyaW5nKGN1cnJlbnRTbGlkZUluZGV4KSA6ICfigJQnO1xyXG5cclxuICBjb25zdCBkZWZhdWx0cyA9IGdldERlZmF1bHRzKCk7XHJcblxyXG4gIGlmIChjdXJyZW50U2xpZGVJZCkge1xyXG4gICAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQpO1xyXG4gICAgdXJsSW5wdXQudmFsdWUgPSBjb25maWc/LnVybCA/PyAnJztcclxuICAgIHNldFNsaWRlclVJKFxyXG4gICAgICBjb25maWc/LmRpYWxvZ1dpZHRoID8/IGRlZmF1bHRzLmRpYWxvZ1dpZHRoLFxyXG4gICAgICBjb25maWc/LmRpYWxvZ0hlaWdodCA/PyBkZWZhdWx0cy5kaWFsb2dIZWlnaHQsXHJcbiAgICAgIGNvbmZpZz8uem9vbSA/PyBkZWZhdWx0cy56b29tLFxyXG4gICAgICBjb25maWc/LmF1dG9PcGVuID8/IGRlZmF1bHRzLmF1dG9PcGVuLFxyXG4gICAgICBjb25maWc/LmF1dG9PcGVuRGVsYXlTZWMgPz8gZGVmYXVsdHMuYXV0b09wZW5EZWxheVNlYyxcclxuICAgICAgY29uZmlnPy5hdXRvQ2xvc2VTZWMgPz8gZGVmYXVsdHMuYXV0b0Nsb3NlU2VjLFxyXG4gICAgKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdXJsSW5wdXQudmFsdWUgPSAnJztcclxuICAgIHNldFNsaWRlclVJKGRlZmF1bHRzLmRpYWxvZ1dpZHRoLCBkZWZhdWx0cy5kaWFsb2dIZWlnaHQsIGRlZmF1bHRzLnpvb20sIGRlZmF1bHRzLmF1dG9PcGVuLCBkZWZhdWx0cy5hdXRvT3BlbkRlbGF5U2VjLCBkZWZhdWx0cy5hdXRvQ2xvc2VTZWMpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlU2hvd0J1dHRvblN0YXRlKCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBVUkwgdmFsaWRhdGlvbiAmIG5vcm1hbGl6YXRpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogQXV0by1wcmVwZW5kIGBodHRwczovL2AgaWYgdGhlIHVzZXIgb21pdHRlZCB0aGUgcHJvdG9jb2wuXHJcbiAqIFJldHVybnMgdGhlIG5vcm1hbGl6ZWQgVVJMIHN0cmluZy5cclxuICovXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCB0cmltbWVkID0gdmFsdWUudHJpbSgpO1xyXG4gIGlmICghdHJpbW1lZCkgcmV0dXJuIHRyaW1tZWQ7XHJcbiAgaWYgKCEvXmh0dHBzPzpcXC9cXC8vaS50ZXN0KHRyaW1tZWQpKSB7XHJcbiAgICByZXR1cm4gYGh0dHBzOi8vJHt0cmltbWVkfWA7XHJcbiAgfVxyXG4gIHJldHVybiB0cmltbWVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1ZhbGlkVXJsKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICBpZiAoIXZhbHVlLnRyaW0oKSkgcmV0dXJuIGZhbHNlO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB1ID0gbmV3IFVSTCh2YWx1ZSk7XHJcbiAgICByZXR1cm4gdS5wcm90b2NvbCA9PT0gJ2h0dHA6JyB8fCB1LnByb3RvY29sID09PSAnaHR0cHM6JztcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTdGF0dXMgbWVzc2FnZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBzaG93U3RhdHVzKGtleTogVHJhbnNsYXRpb25LZXksIHR5cGU6ICdzdWNjZXNzJyB8ICdlcnJvcicpOiB2b2lkIHtcclxuICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IGkxOG4udChrZXkpO1xyXG4gIHN0YXR1c0VsLmNsYXNzTmFtZSA9IGBzdGF0dXMgc3RhdHVzLSR7dHlwZX1gO1xyXG4gIHN0YXR1c0VsLnNldEF0dHJpYnV0ZSgncm9sZScsIHR5cGUgPT09ICdlcnJvcicgPyAnYWxlcnQnIDogJ3N0YXR1cycpO1xyXG4gIHN0YXR1c0VsLmhpZGRlbiA9IGZhbHNlO1xyXG5cclxuICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIHN0YXR1c0VsLmhpZGRlbiA9IHRydWU7XHJcbiAgfSwgMzAwMCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTaG93IGJ1dHRvbiBzdGF0ZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBEaXNhYmxlIFwiU2hvdyBXZWIgUGFnZVwiIHdoZW4gdGhlcmUgaXMgbm8gc2F2ZWQgVVJMIGZvciB0aGUgY3VycmVudCBzbGlkZS4gKi9cclxuZnVuY3Rpb24gdXBkYXRlU2hvd0J1dHRvblN0YXRlKCk6IHZvaWQge1xyXG4gIGNvbnN0IGhhc1VybCA9IGN1cnJlbnRTbGlkZUlkXHJcbiAgICA/ICEhZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQpPy51cmxcclxuICAgIDogZmFsc2U7XHJcbiAgYnRuU2hvdy5kaXNhYmxlZCA9ICFoYXNVcmw7XHJcbiAgYnRuU2hvdy50aXRsZSA9IGhhc1VybFxyXG4gICAgPyB0cnVuY2F0ZVVybChnZXRTbGlkZUNvbmZpZyhjdXJyZW50U2xpZGVJZCEpIS51cmwpXHJcbiAgICA6IGkxOG4udCgnbm9VcmxGb3JTbGlkZScpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQXBwbHkgaGFuZGxlciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFwcGx5KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGlmICghY3VycmVudFNsaWRlSWQpIHtcclxuICAgIHNob3dTdGF0dXMoJ3NlbGVjdFNsaWRlJywgJ2Vycm9yJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBBdXRvLWZpeCBtaXNzaW5nIHByb3RvY29sXHJcbiAgbGV0IHVybCA9IG5vcm1hbGl6ZVVybCh1cmxJbnB1dC52YWx1ZSk7XHJcbiAgaWYgKHVybCAhPT0gdXJsSW5wdXQudmFsdWUudHJpbSgpICYmIHVybCkge1xyXG4gICAgdXJsSW5wdXQudmFsdWUgPSB1cmw7XHJcbiAgICBzaG93U3RhdHVzKCd1cmxBdXRvRml4ZWQnLCAnc3VjY2VzcycpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFpc1ZhbGlkVXJsKHVybCkpIHtcclxuICAgIHNob3dTdGF0dXMoJ25vVXJsJywgJ2Vycm9yJyk7XHJcbiAgICB1cmxJbnB1dC5mb2N1cygpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNldFNsaWRlQ29uZmlnKGN1cnJlbnRTbGlkZUlkLCB7XHJcbiAgICAgIHVybCxcclxuICAgICAgem9vbTogTnVtYmVyKHNsaWRlclpvb20udmFsdWUpLFxyXG4gICAgICBkaWFsb2dXaWR0aDogTnVtYmVyKHNsaWRlcldpZHRoLnZhbHVlKSxcclxuICAgICAgZGlhbG9nSGVpZ2h0OiBOdW1iZXIoc2xpZGVySGVpZ2h0LnZhbHVlKSxcclxuICAgICAgYXV0b09wZW46IGNoa0F1dG9PcGVuLmNoZWNrZWQsXHJcbiAgICAgIGF1dG9PcGVuRGVsYXlTZWM6IGdldEF1dG9PcGVuRGVsYXlTZWNvbmRzKCksXHJcbiAgICAgIGF1dG9DbG9zZVNlYzogZ2V0QXV0b0Nsb3NlU2Vjb25kcygpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgc2hvd1N0YXR1cygnc3VjY2VzcycsICdzdWNjZXNzJyk7XHJcbiAgICB1cGRhdGVTaG93QnV0dG9uU3RhdGUoKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGxvZ0Vycm9yKCdGYWlsZWQgdG8gc2F2ZSBzbGlkZSBjb25maWc6JywgZXJyKTtcclxuICAgIHNob3dTdGF0dXMoJ3NldHRpbmdzU2F2ZVJldHJ5RmFpbGVkJywgJ2Vycm9yJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2V0IGFzIGRlZmF1bHRzIGhhbmRsZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZXREZWZhdWx0cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgc2V0RGVmYXVsdHMoe1xyXG4gICAgICB1cmw6ICcnLFxyXG4gICAgICB6b29tOiBOdW1iZXIoc2xpZGVyWm9vbS52YWx1ZSksXHJcbiAgICAgIGRpYWxvZ1dpZHRoOiBOdW1iZXIoc2xpZGVyV2lkdGgudmFsdWUpLFxyXG4gICAgICBkaWFsb2dIZWlnaHQ6IE51bWJlcihzbGlkZXJIZWlnaHQudmFsdWUpLFxyXG4gICAgICBhdXRvT3BlbjogY2hrQXV0b09wZW4uY2hlY2tlZCxcclxuICAgICAgYXV0b09wZW5EZWxheVNlYzogZ2V0QXV0b09wZW5EZWxheVNlY29uZHMoKSxcclxuICAgICAgYXV0b0Nsb3NlU2VjOiBnZXRBdXRvQ2xvc2VTZWNvbmRzKCksXHJcbiAgICB9KTtcclxuICAgIHNob3dTdGF0dXMoJ2RlZmF1bHRzU2F2ZWQnLCAnc3VjY2VzcycpO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgbG9nRXJyb3IoJ0ZhaWxlZCB0byBzYXZlIGRlZmF1bHRzOicsIGVycik7XHJcbiAgICBzaG93U3RhdHVzKCdzZXR0aW5nc1NhdmVSZXRyeUZhaWxlZCcsICdlcnJvcicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNsaWRlciAvIHByZXNldCBoYW5kbGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVdpZHRoSW5wdXQoKTogdm9pZCB7XHJcbiAgc2xpZGVyV2lkdGhWYWx1ZS50ZXh0Q29udGVudCA9IGAke3NsaWRlcldpZHRoLnZhbHVlfSVgO1xyXG4gIGlmIChjaGtMb2NrU2l6ZS5jaGVja2VkKSB7XHJcbiAgICBzbGlkZXJIZWlnaHQudmFsdWUgPSBzbGlkZXJXaWR0aC52YWx1ZTtcclxuICAgIHNsaWRlckhlaWdodFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVySGVpZ2h0LnZhbHVlfSVgO1xyXG4gIH1cclxuICB1cGRhdGVTaXplUHJldmlldygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVIZWlnaHRJbnB1dCgpOiB2b2lkIHtcclxuICBzbGlkZXJIZWlnaHRWYWx1ZS50ZXh0Q29udGVudCA9IGAke3NsaWRlckhlaWdodC52YWx1ZX0lYDtcclxuICBpZiAoY2hrTG9ja1NpemUuY2hlY2tlZCkge1xyXG4gICAgc2xpZGVyV2lkdGgudmFsdWUgPSBzbGlkZXJIZWlnaHQudmFsdWU7XHJcbiAgICBzbGlkZXJXaWR0aFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVyV2lkdGgudmFsdWV9JWA7XHJcbiAgfVxyXG4gIHVwZGF0ZVNpemVQcmV2aWV3KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVpvb21JbnB1dCgpOiB2b2lkIHtcclxuICBjb25zdCB2YWwgPSBOdW1iZXIoc2xpZGVyWm9vbS52YWx1ZSk7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7dmFsfSVgO1xyXG4gIHVwZGF0ZUFjdGl2ZVByZXNldCh2YWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVQcmVzZXRDbGljayhlOiBFdmVudCk6IHZvaWQge1xyXG4gIGNvbnN0IGJ0biA9IChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xvc2VzdDxIVE1MQnV0dG9uRWxlbWVudD4oJy5idG4tcHJlc2V0Jyk7XHJcbiAgaWYgKCFidG4/LmRhdGFzZXQuem9vbSkgcmV0dXJuO1xyXG4gIGNvbnN0IHZhbCA9IE51bWJlcihidG4uZGF0YXNldC56b29tKTtcclxuICBzbGlkZXJab29tLnZhbHVlID0gU3RyaW5nKHZhbCk7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7dmFsfSVgO1xyXG4gIHVwZGF0ZUFjdGl2ZVByZXNldCh2YWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVMb2NrU2l6ZUNoYW5nZSgpOiB2b2lkIHtcclxuICBpZiAoY2hrTG9ja1NpemUuY2hlY2tlZCkge1xyXG4gICAgLy8gU3luYyBoZWlnaHQgdG8gd2lkdGhcclxuICAgIHNsaWRlckhlaWdodC52YWx1ZSA9IHNsaWRlcldpZHRoLnZhbHVlO1xyXG4gICAgc2xpZGVySGVpZ2h0VmFsdWUudGV4dENvbnRlbnQgPSBgJHtzbGlkZXJIZWlnaHQudmFsdWV9JWA7XHJcbiAgICB1cGRhdGVTaXplUHJldmlldygpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQXV0b09wZW5EZWxheUlucHV0KCk6IHZvaWQge1xyXG4gIHNsaWRlckF1dG9PcGVuRGVsYXlWYWx1ZS50ZXh0Q29udGVudCA9IGZvcm1hdEF1dG9PcGVuRGVsYXlMYWJlbChnZXRBdXRvT3BlbkRlbGF5U2Vjb25kcygpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQXV0b09wZW5DaGFuZ2UoKTogdm9pZCB7XHJcbiAgdXBkYXRlQXV0b09wZW5EZWxheVZpc2liaWxpdHkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQXV0b0Nsb3NlSW5wdXQoKTogdm9pZCB7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlVmFsdWUudGV4dENvbnRlbnQgPSBmb3JtYXRBdXRvQ2xvc2VMYWJlbChnZXRBdXRvQ2xvc2VTZWNvbmRzKCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVJbmZvVG9nZ2xlKGhpbnRJZDogc3RyaW5nLCBidG5JZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgY29uc3QgaGludCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGhpbnRJZCk7XHJcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnRuSWQpO1xyXG4gIGlmICghaGludCB8fCAhYnRuKSByZXR1cm47XHJcbiAgY29uc3Qgc2hvdyA9IGhpbnQuaGlkZGVuO1xyXG4gIGhpbnQuaGlkZGVuID0gIXNob3c7XHJcbiAgYnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhzaG93KSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUF1dG9PcGVuSW5mb1RvZ2dsZSgpOiB2b2lkIHtcclxuICBoYW5kbGVJbmZvVG9nZ2xlKCdhdXRvb3Blbi1oaW50JywgJ2J0bi1hdXRvb3Blbi1pbmZvJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUF1dG9DbG9zZUluZm9Ub2dnbGUoKTogdm9pZCB7XHJcbiAgaGFuZGxlSW5mb1RvZ2dsZSgnYXV0b2Nsb3NlLWhpbnQnLCAnYnRuLWF1dG9jbG9zZS1pbmZvJyk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBWaWV3ZXIgc3RhdHVzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxudHlwZSBWaWV3ZXJTdGF0ZSA9ICdsb2FkaW5nJyB8ICdsb2FkZWQnIHwgJ2Jsb2NrZWQnIHwgJ2Vycm9yJztcclxuXHJcbmZ1bmN0aW9uIHNldFZpZXdlclN0YXR1cyhzdGF0ZTogVmlld2VyU3RhdGUpOiB2b2lkIHtcclxuICBjb25zdCBrZXlNYXA6IFJlY29yZDxWaWV3ZXJTdGF0ZSwgVHJhbnNsYXRpb25LZXk+ID0ge1xyXG4gICAgbG9hZGluZzogJ3ZpZXdlckxvYWRpbmcnLFxyXG4gICAgbG9hZGVkOiAndmlld2VyTG9hZGVkJyxcclxuICAgIGJsb2NrZWQ6ICd2aWV3ZXJCbG9ja2VkJyxcclxuICAgIGVycm9yOiAndmlld2VyRXJyb3InLFxyXG4gIH07XHJcblxyXG4gIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IGZhbHNlO1xyXG4gIHZpZXdlclN0YXR1c0VsLmNsYXNzTmFtZSA9IGB2aWV3ZXItc3RhdHVzIHZpZXdlci1zdGF0dXMtLSR7c3RhdGV9YDtcclxuICB2aWV3ZXJTdGF0dXNUZXh0LnRleHRDb250ZW50ID0gaTE4bi50KGtleU1hcFtzdGF0ZV0pO1xyXG5cclxuICAvLyBBdXRvLWhpZGUgc3VjY2Vzcy9lcnJvciBhZnRlciBhIGRlbGF5IChrZWVwIGxvYWRpbmcvYmxvY2tlZCB2aXNpYmxlKVxyXG4gIGlmICh2aWV3ZXJTdGF0dXNUaW1lcikge1xyXG4gICAgY2xlYXJUaW1lb3V0KHZpZXdlclN0YXR1c1RpbWVyKTtcclxuICAgIHZpZXdlclN0YXR1c1RpbWVyID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGlmIChzdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcclxuICAgIHZpZXdlclN0YXR1c1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IHRydWU7XHJcbiAgICB9LCA0MDAwKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhpZGVWaWV3ZXJTdGF0dXMoKTogdm9pZCB7XHJcbiAgaWYgKHZpZXdlclN0YXR1c1RpbWVyKSB7XHJcbiAgICBjbGVhclRpbWVvdXQodmlld2VyU3RhdHVzVGltZXIpO1xyXG4gICAgdmlld2VyU3RhdHVzVGltZXIgPSBudWxsO1xyXG4gIH1cclxuICB2aWV3ZXJTdGF0dXNFbC5oaWRkZW4gPSB0cnVlO1xyXG59XHJcblxyXG4vKiogUGFyc2UgYW5kIGhhbmRsZSBzdHJ1Y3R1cmVkIG1lc3NhZ2VzIGZyb20gdGhlIHZpZXdlciBkaWFsb2cuICovXHJcbmZ1bmN0aW9uIGhhbmRsZVZpZXdlck1lc3NhZ2UocmF3TWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG1zZyA9IEpTT04ucGFyc2UocmF3TWVzc2FnZSkgYXMgeyB0eXBlOiBzdHJpbmc7IHVybD86IHN0cmluZzsgZXJyb3I/OiBzdHJpbmcgfTtcclxuXHJcbiAgICBzd2l0Y2ggKG1zZy50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ3JlYWR5JzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2xvYWRpbmcnKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbG9hZGVkJzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2xvYWRlZCcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdibG9ja2VkJzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2Jsb2NrZWQnKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZXJyb3InOlxyXG4gICAgICAgIHNldFZpZXdlclN0YXR1cygnZXJyb3InKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY2xvc2UnOlxyXG4gICAgICAgIC8vIFNhdmUgc2xpZGUgSUQgQkVGT1JFIGNsb3NlIOKAlCBvblNsaWRlc2hvd0V4aXQgbWF5IHJlc2V0IGxhc3RTbGlkZXNob3dTbGlkZUlkXHJcbiAgICAgICAgaWYgKGxhc3RTbGlkZXNob3dTbGlkZUlkKSB7XHJcbiAgICAgICAgICBsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZCA9IGxhc3RTbGlkZXNob3dTbGlkZUlkO1xyXG4gICAgICAgICAgZGJnKGBEaWFsb2cgY2xvc2luZyBvbiBzbGlkZSAke2xhc3REaWFsb2dDbG9zZWRTbGlkZUlkfSDigJQgd2lsbCBub3QgcmUtb3BlbiB1bnRpbCBzbGlkZSBjaGFuZ2VzYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxhdW5jaGVyLmNsb3NlKCk7XHJcbiAgICAgICAgYnRuU2hvdy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGhpZGVWaWV3ZXJTdGF0dXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9IGNhdGNoIHtcclxuICAgIC8vIE5vbi1KU09OIG1lc3NhZ2Ug4oCUIGlnbm9yZVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlVmlld2VyQ2xvc2VkKCk6IHZvaWQge1xyXG4gIGJ0blNob3cuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAvLyBSZW1lbWJlciB3aGljaCBzbGlkZSB0aGUgZGlhbG9nIHdhcyBjbG9zZWQgb24gKHByZXZlbnQgcmUtb3BlbmluZykuXHJcbiAgLy8gTWF5IGFscmVhZHkgYmUgc2V0IGJ5ICdjbG9zZScgbWVzc2FnZSBoYW5kbGVyIChiZWZvcmUgbGF1bmNoZXIuY2xvc2UpLlxyXG4gIGlmIChsYXN0U2xpZGVzaG93U2xpZGVJZCAmJiAhbGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWQpIHtcclxuICAgIGxhc3REaWFsb2dDbG9zZWRTbGlkZUlkID0gbGFzdFNsaWRlc2hvd1NsaWRlSWQ7XHJcbiAgICBkYmcoYERpYWxvZyBjbG9zZWQgKGV2ZW50KSBvbiBzbGlkZSAke2xhc3REaWFsb2dDbG9zZWRTbGlkZUlkfWApO1xyXG4gIH1cclxuICAvLyBTaG93IGJyaWVmIFwiY2xvc2VkXCIgc3RhdHVzIHRoZW4gaGlkZVxyXG4gIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IGZhbHNlO1xyXG4gIHZpZXdlclN0YXR1c0VsLmNsYXNzTmFtZSA9ICd2aWV3ZXItc3RhdHVzJztcclxuICB2aWV3ZXJTdGF0dXNUZXh0LnRleHRDb250ZW50ID0gaTE4bi50KCd2aWV3ZXJDbG9zZWQnKTtcclxuXHJcbiAgaWYgKHZpZXdlclN0YXR1c1RpbWVyKSBjbGVhclRpbWVvdXQodmlld2VyU3RhdHVzVGltZXIpO1xyXG4gIHZpZXdlclN0YXR1c1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICB2aWV3ZXJTdGF0dXNFbC5oaWRkZW4gPSB0cnVlO1xyXG4gIH0sIDIwMDApO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2hvdyBXZWIgUGFnZSBoYW5kbGVyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2hvdygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoIWN1cnJlbnRTbGlkZUlkKSB7XHJcbiAgICBzaG93U3RhdHVzKCdzZWxlY3RTbGlkZScsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQpO1xyXG5cclxuICBpZiAoIWNvbmZpZyB8fCAhY29uZmlnLnVybCkge1xyXG4gICAgc2hvd1N0YXR1cygnbm9VcmxGb3JTbGlkZScsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgbmV0d29yayBiZWZvcmUgb3BlbmluZ1xyXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAhbmF2aWdhdG9yLm9uTGluZSkge1xyXG4gICAgc2hvd1N0YXR1cygnbm9JbnRlcm5ldCcsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgYnRuU2hvdy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgc2V0Vmlld2VyU3RhdHVzKCdsb2FkaW5nJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBsYXVuY2hlci5vcGVuKHtcclxuICAgICAgdXJsOiBjb25maWcudXJsLFxyXG4gICAgICB6b29tOiBjb25maWcuem9vbSxcclxuICAgICAgd2lkdGg6IGNvbmZpZy5kaWFsb2dXaWR0aCxcclxuICAgICAgaGVpZ2h0OiBjb25maWcuZGlhbG9nSGVpZ2h0LFxyXG4gICAgICBsYW5nOiBpMThuLmdldExvY2FsZSgpLFxyXG4gICAgICBhdXRvQ2xvc2VTZWM6IGNvbmZpZy5hdXRvQ2xvc2VTZWMsXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGJ0blNob3cuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIGhpZGVWaWV3ZXJTdGF0dXMoKTtcclxuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBEaWFsb2dFcnJvcikge1xyXG4gICAgICBzaG93U3RhdHVzKGVyci5pMThuS2V5LCAnZXJyb3InKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNob3dTdGF0dXMoJ2Vycm9yR2VuZXJpYycsICdlcnJvcicpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEd1aWRlIGhhbmRsZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuY29uc3QgU05JUFBFVFM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgbmdpbng6ICdhZGRfaGVhZGVyIENvbnRlbnQtU2VjdXJpdHktUG9saWN5IFwiZnJhbWUtYW5jZXN0b3JzICpcIjsnLFxyXG4gIGFwYWNoZTogJ0hlYWRlciBzZXQgQ29udGVudC1TZWN1cml0eS1Qb2xpY3kgXCJmcmFtZS1hbmNlc3RvcnMgKlwiXFxuSGVhZGVyIHVuc2V0IFgtRnJhbWUtT3B0aW9ucycsXHJcbiAgZXhwcmVzczogYGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XFxuICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVNlY3VyaXR5LVBvbGljeScsICdmcmFtZS1hbmNlc3RvcnMgKicpO1xcbiAgcmVzLnJlbW92ZUhlYWRlcignWC1GcmFtZS1PcHRpb25zJyk7XFxuICBuZXh0KCk7XFxufSk7YCxcclxuICBtZXRhOiAnPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCJcXG4gICAgICBjb250ZW50PVwiZnJhbWUtYW5jZXN0b3JzICpcIj4nLFxyXG59O1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlR3VpZGVUb2dnbGUoKTogdm9pZCB7XHJcbiAgY29uc3Qgc2VjdGlvbiA9ICQoJ2d1aWRlLXNlY3Rpb24nKTtcclxuICBjb25zdCB0b2dnbGUgPSAkKCdidG4tZ3VpZGUtdG9nZ2xlJyk7XHJcbiAgY29uc3QgaXNIaWRkZW4gPSBzZWN0aW9uLmhpZGRlbjtcclxuICBzZWN0aW9uLmhpZGRlbiA9ICFpc0hpZGRlbjtcclxuICB0b2dnbGUudGV4dENvbnRlbnQgPSBpMThuLnQoaXNIaWRkZW4gPyAnaGlkZVNldHVwR3VpZGUnIDogJ3NpdGVOb3RMb2FkaW5nJyk7XHJcbiAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhpc0hpZGRlbikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhY3RpdmF0ZUd1aWRlVGFiKHRhYklkOiBzdHJpbmcpOiB2b2lkIHtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PignI2d1aWRlLXNlY3Rpb24gW2RhdGEtZ3VpZGUtdGFiXScpLmZvckVhY2goKHQpID0+IHtcclxuICAgIGNvbnN0IGFjdGl2ZSA9IHQuZGF0YXNldC5ndWlkZVRhYiA9PT0gdGFiSWQ7XHJcbiAgICB0LmNsYXNzTGlzdC50b2dnbGUoJ2d1aWRlLXRhYi0tYWN0aXZlJywgYWN0aXZlKTtcclxuICAgIHQuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgU3RyaW5nKGFjdGl2ZSkpO1xyXG4gICAgdC50YWJJbmRleCA9IGFjdGl2ZSA/IDAgOiAtMTtcclxuICAgIGlmIChhY3RpdmUpIHQuZm9jdXMoKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJyNndWlkZS1zZWN0aW9uIFtkYXRhLWd1aWRlLXBhbmVsXScpLmZvckVhY2goKHApID0+IHtcclxuICAgIHAuaGlkZGVuID0gcC5kYXRhc2V0Lmd1aWRlUGFuZWwgIT09IHRhYklkO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVHdWlkZVRhYkNsaWNrKGU6IEV2ZW50KTogdm9pZCB7XHJcbiAgY29uc3QgdGFiID0gKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbG9zZXN0PEhUTUxCdXR0b25FbGVtZW50PignW2RhdGEtZ3VpZGUtdGFiXScpO1xyXG4gIGlmICghdGFiKSByZXR1cm47XHJcbiAgYWN0aXZhdGVHdWlkZVRhYih0YWIuZGF0YXNldC5ndWlkZVRhYiEpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVHdWlkZVRhYktleWRvd24oZTogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gIGNvbnN0IHRhYnMgPSBBcnJheS5mcm9tKFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MQnV0dG9uRWxlbWVudD4oJyNndWlkZS1zZWN0aW9uIFtkYXRhLWd1aWRlLXRhYl0nKSxcclxuICApO1xyXG4gIGNvbnN0IGN1cnJlbnQgPSB0YWJzLmZpbmRJbmRleCgodCkgPT4gdC5nZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKTtcclxuICBsZXQgbmV4dCA9IC0xO1xyXG5cclxuICBpZiAoZS5rZXkgPT09ICdBcnJvd1JpZ2h0JykgbmV4dCA9IChjdXJyZW50ICsgMSkgJSB0YWJzLmxlbmd0aDtcclxuICBlbHNlIGlmIChlLmtleSA9PT0gJ0Fycm93TGVmdCcpIG5leHQgPSAoY3VycmVudCAtIDEgKyB0YWJzLmxlbmd0aCkgJSB0YWJzLmxlbmd0aDtcclxuICBlbHNlIGlmIChlLmtleSA9PT0gJ0hvbWUnKSBuZXh0ID0gMDtcclxuICBlbHNlIGlmIChlLmtleSA9PT0gJ0VuZCcpIG5leHQgPSB0YWJzLmxlbmd0aCAtIDE7XHJcbiAgZWxzZSByZXR1cm47XHJcblxyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICBhY3RpdmF0ZUd1aWRlVGFiKHRhYnNbbmV4dF0uZGF0YXNldC5ndWlkZVRhYiEpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHdWlkZUNvcHkoZTogRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBidG4gPSAoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsb3Nlc3Q8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdbZGF0YS1jb3B5LXNuaXBwZXRdJyk7XHJcbiAgaWYgKCFidG4pIHJldHVybjtcclxuXHJcbiAgY29uc3Qga2V5ID0gYnRuLmRhdGFzZXQuY29weVNuaXBwZXQhO1xyXG4gIGNvbnN0IHRleHQgPSBTTklQUEVUU1trZXldO1xyXG4gIGlmICghdGV4dCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSBpMThuLnQoJ2NvcGllZCcpO1xyXG4gICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2J0bi1jb3B5LS1jb3BpZWQnKTtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSBpMThuLnQoJ2NvcHknKTtcclxuICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1jb3B5LS1jb3BpZWQnKTtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gRmFsbGJhY2s6IHNlbGVjdCB0ZXh0IGluIHRoZSBjb2RlIGJsb2NrXHJcbiAgICBjb25zdCBwYW5lbCA9IGJ0bi5jbG9zZXN0KCdbZGF0YS1ndWlkZS1wYW5lbF0nKTtcclxuICAgIGNvbnN0IGNvZGUgPSBwYW5lbD8ucXVlcnlTZWxlY3RvcignY29kZScpO1xyXG4gICAgaWYgKGNvZGUpIHtcclxuICAgICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoY29kZSk7XHJcbiAgICAgIGNvbnN0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgc2VsPy5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgc2VsPy5hZGRSYW5nZShyYW5nZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgTGFuZ3VhZ2Ugc3dpdGNoIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3QgbG9jYWxlID0gbGFuZ1NlbGVjdC52YWx1ZSBhcyBMb2NhbGU7XHJcbiAgaTE4bi5zZXRMb2NhbGUobG9jYWxlKTtcclxuICBhcHBseUkxOG4oKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNldExhbmd1YWdlKGxvY2FsZSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvLyBub24tY3JpdGljYWwg4oCUIFVJIGFscmVhZHkgdXBkYXRlZFxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEtleWJvYXJkIHN1cHBvcnQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBoYW5kbGVVcmxLZXlkb3duKGU6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIGhhbmRsZUFwcGx5KCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkYmcobXNnOiBzdHJpbmcpOiB2b2lkIHtcclxuICBsb2dEZWJ1ZygnW1Rhc2twYW5lXScsIG1zZyk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTbGlkZXNob3cgYXV0by1vcGVuIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG4vL1xyXG4vLyBUaGUgY29tbWFuZHMgcnVudGltZSAoRnVuY3Rpb25GaWxlKSBtYXkgbm90IHBlcnNpc3QgZHVyaW5nIHNsaWRlc2hvdyBvbiBhbGxcclxuLy8gUG93ZXJQb2ludCB2ZXJzaW9ucy4gQXMgYSByZWxpYWJsZSBmYWxsYmFjaywgdGhlIHRhc2twYW5lIGl0c2VsZiBwb2xscyBmb3JcclxuLy8gdmlldyBtb2RlIGNoYW5nZXMgYW5kIHNsaWRlIG5hdmlnYXRpb24gZHVyaW5nIHNsaWRlc2hvdy5cclxuLy9cclxuLy8gVXNlcyBnZXRBY3RpdmVWaWV3QXN5bmMoKSBpbnN0ZWFkIG9mIEFjdGl2ZVZpZXdDaGFuZ2VkIGV2ZW50IGJlY2F1c2VcclxuLy8gdGhlIGV2ZW50IG1heSBub3QgZmlyZSBpbiB0aGUgdGFza3BhbmUgY29udGV4dC5cclxuXHJcbi8qKiBIb3cgb2Z0ZW4gdG8gY2hlY2sgdGhlIGN1cnJlbnQgdmlldyBtb2RlIChtcykuICovXHJcbmNvbnN0IFZJRVdfUE9MTF9JTlRFUlZBTF9NUyA9IDIwMDA7XHJcblxyXG4vKiogSG93IG9mdGVuIHRvIGNoZWNrIHRoZSBjdXJyZW50IHNsaWRlIGR1cmluZyBzbGlkZXNob3cgKG1zKS4gKi9cclxuY29uc3QgU0xJREVfUE9MTF9JTlRFUlZBTF9NUyA9IDE1MDA7XHJcblxyXG5sZXQgdmlld1BvbGxUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0SW50ZXJ2YWw+IHwgbnVsbCA9IG51bGw7XHJcbmxldCBzbGlkZVBvbGxUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0SW50ZXJ2YWw+IHwgbnVsbCA9IG51bGw7XHJcbmxldCBzbGlkZXNob3dBY3RpdmUgPSBmYWxzZTtcclxubGV0IGxhc3RTbGlkZXNob3dTbGlkZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxubGV0IHNsaWRlUG9sbEJ1c3kgPSBmYWxzZTtcclxuXHJcbi8qKiBXaGV0aGVyIHRoZSB2aWV3ZXIgZGlhbG9nIGhhcyBiZWVuIG9wZW5lZCBmb3IgdGhlIGN1cnJlbnQgc2xpZGVzaG93IHNlc3Npb24uICovXHJcbmxldCBzbGlkZXNob3dEaWFsb2dPcGVuZWQgPSBmYWxzZTtcclxuXHJcbi8qKiBTbGlkZSBJRCBmb3Igd2hpY2ggdGhlIGRpYWxvZyB3YXMgbGFzdCBjbG9zZWQgKHRvIHByZXZlbnQgcmUtb3BlbmluZyBvbiBzYW1lIHNsaWRlKS4gKi9cclxubGV0IGxhc3REaWFsb2dDbG9zZWRTbGlkZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuXHJcbi8qKiBQZW5kaW5nIGF1dG8tb3BlbiBkZWxheSB0aW1lciAoY2FuY2VsbGVkIG9uIHNsaWRlIGNoYW5nZSkuICovXHJcbmxldCBhdXRvT3BlbkRlbGF5VGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XHJcblxyXG4vKiogR2V0IHRoZSBjdXJyZW50IHZpZXcgbW9kZSAoXCJlZGl0XCIgb3IgXCJyZWFkXCIpLiAqL1xyXG5mdW5jdGlvbiBnZXRBY3RpdmVWaWV3KCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBPZmZpY2UuY29udGV4dC5kb2N1bWVudC5nZXRBY3RpdmVWaWV3QXN5bmMoKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBPZmZpY2UuQXN5bmNSZXN1bHRTdGF0dXMuU3VjY2VlZGVkKSB7XHJcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdC52YWx1ZSBhcyB1bmtub3duIGFzIHN0cmluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRiZyhgZ2V0QWN0aXZlVmlldyBGQUlMRUQ6ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gKTtcclxuICAgICAgICAgIHJlc29sdmUoJ2VkaXQnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGRiZyhgZ2V0QWN0aXZlVmlldyBFWENFUFRJT046ICR7ZXJyfWApO1xyXG4gICAgICByZXNvbHZlKCdlZGl0Jyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGN1cnJlbnQgc2xpZGUgSUQuIFRyaWVzIHR3byBtZXRob2RzOlxyXG4gKiAxLiBQb3dlclBvaW50IEpTIEFQSSBnZXRTZWxlY3RlZFNsaWRlcygpIOKAlCB3b3JrcyBpbiBlZGl0IG1vZGVcclxuICogMi4gQ29tbW9uIEFQSSBnZXRTZWxlY3RlZERhdGFBc3luYyhTbGlkZVJhbmdlKSDigJQgbWF5IHdvcmsgaW4gc2xpZGVzaG93XHJcbiAqXHJcbiAqIE1ldGhvZCAyIHJldHVybnMgYSBudW1lcmljIHNsaWRlIElELCB3aGljaCB3ZSBtYXAgdG8gdGhlIEpTIEFQSSBzdHJpbmcgSURcclxuICogdXNpbmcgYSBwcmUtYnVpbHQgaW5kZXjihpJpZCBsb29rdXAgdGFibGUuXHJcbiAqL1xyXG5cclxuLyoqIE1hcCBvZiBzbGlkZSBpbmRleCAoMS1iYXNlZCkg4oaSIFBvd2VyUG9pbnQgSlMgQVBJIHNsaWRlIElELiBCdWlsdCBiZWZvcmUgc2xpZGVzaG93LiAqL1xyXG5sZXQgc2xpZGVJbmRleFRvSWQ6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XHJcblxyXG4vKiogQnVpbGQgdGhlIGluZGV44oaSaWQgbWFwIGZyb20gYWxsIHNsaWRlcyBpbiB0aGUgcHJlc2VudGF0aW9uLiAqL1xyXG5hc3luYyBmdW5jdGlvbiBidWlsZFNsaWRlSW5kZXhNYXAoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IFBvd2VyUG9pbnQucnVuKGFzeW5jIChjb250ZXh0KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNsaWRlcyA9IGNvbnRleHQucHJlc2VudGF0aW9uLnNsaWRlcztcclxuICAgICAgc2xpZGVzLmxvYWQoJ2l0ZW1zL2lkJyk7XHJcbiAgICAgIGF3YWl0IGNvbnRleHQuc3luYygpO1xyXG4gICAgICBzbGlkZUluZGV4VG9JZCA9IG5ldyBNYXAoKTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbGlkZXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBzbGlkZUluZGV4VG9JZC5zZXQoaSArIDEsIHNsaWRlcy5pdGVtc1tpXS5pZCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc3QgZW50cmllczogc3RyaW5nW10gPSBbXTtcclxuICAgIHNsaWRlSW5kZXhUb0lkLmZvckVhY2goKGlkLCBpZHgpID0+IGVudHJpZXMucHVzaChgJHtpZHh94oaSJHtpZH1gKSk7XHJcbiAgICBkYmcoYFNsaWRlIG1hcDogJHtlbnRyaWVzLmpvaW4oJywgJyl9YCk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBkYmcoYGJ1aWxkU2xpZGVJbmRleE1hcCBFUlJPUjogJHtlcnJ9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogTWV0aG9kIDE6IFBvd2VyUG9pbnQgSlMgQVBJIOKAlCBnZXRTZWxlY3RlZFNsaWRlcygpLiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRTbGlkZUlkVmlhSnNBcGkoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgdHJ5IHtcclxuICAgIGxldCBzbGlkZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIGF3YWl0IFBvd2VyUG9pbnQucnVuKGFzeW5jIChjb250ZXh0KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNsaWRlcyA9IGNvbnRleHQucHJlc2VudGF0aW9uLmdldFNlbGVjdGVkU2xpZGVzKCk7XHJcbiAgICAgIHNsaWRlcy5sb2FkKCdpdGVtcy9pZCcpO1xyXG4gICAgICBhd2FpdCBjb250ZXh0LnN5bmMoKTtcclxuICAgICAgaWYgKHNsaWRlcy5pdGVtcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgc2xpZGVJZCA9IHNsaWRlcy5pdGVtc1swXS5pZDtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc2xpZGVJZDtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGRiZyhgSlMgQVBJIGdldFNlbGVjdGVkU2xpZGVzIEVSUk9SOiAke2Vycn1gKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIE1ldGhvZCAyOiBDb21tb24gQVBJIOKAlCBnZXRTZWxlY3RlZERhdGFBc3luYyhTbGlkZVJhbmdlKS4gKi9cclxuZnVuY3Rpb24gZ2V0U2xpZGVJZFZpYUNvbW1vbkFwaSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIE9mZmljZS5jb250ZXh0LmRvY3VtZW50LmdldFNlbGVjdGVkRGF0YUFzeW5jKFxyXG4gICAgICAgIE9mZmljZS5Db2VyY2lvblR5cGUuU2xpZGVSYW5nZSxcclxuICAgICAgICAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gT2ZmaWNlLkFzeW5jUmVzdWx0U3RhdHVzLlN1Y2NlZWRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gcmVzdWx0LnZhbHVlIGFzIHsgc2xpZGVzPzogQXJyYXk8eyBpZDogbnVtYmVyOyBpbmRleDogbnVtYmVyIH0+IH07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnNsaWRlcyAmJiBkYXRhLnNsaWRlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgc2xpZGUgPSBkYXRhLnNsaWRlc1swXTtcclxuICAgICAgICAgICAgICBkYmcoYENvbW1vbkFQSSBzbGlkZTogaWQ9JHtzbGlkZS5pZH0gaW5kZXg9JHtzbGlkZS5pbmRleH1gKTtcclxuICAgICAgICAgICAgICAvLyBNYXAgaW5kZXggdG8gSlMgQVBJIHNsaWRlIElEXHJcbiAgICAgICAgICAgICAgY29uc3QganNJZCA9IHNsaWRlSW5kZXhUb0lkLmdldChzbGlkZS5pbmRleCk7XHJcbiAgICAgICAgICAgICAgaWYgKGpzSWQpIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoanNJZCk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRiZyhgTm8gSlMgQVBJIElEIGZvdW5kIGZvciBpbmRleCAke3NsaWRlLmluZGV4fWApO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgZGJnKCdDb21tb25BUEk6IG5vIHNsaWRlcyBpbiByZXN1bHQnKTtcclxuICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkYmcoYENvbW1vbkFQSSBGQUlMRUQ6ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gKTtcclxuICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICApO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGRiZyhgQ29tbW9uQVBJIEVYQ0VQVElPTjogJHtlcnJ9YCk7XHJcbiAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGN1cnJlbnQgc2xpZGUgSUQgZHVyaW5nIHNsaWRlc2hvdy5cclxuICpcclxuICogSU1QT1JUQU5UOiBEdXJpbmcgc2xpZGVzaG93LCBPTkxZIHVzZSBDb21tb24gQVBJLlxyXG4gKiBKUyBBUEkgcmV0dXJucyB0aGUgc2xpZGUgc2VsZWN0ZWQgaW4gdGhlIEVESVQgd2luZG93LCBub3QgdGhlIHNsaWRlc2hvdyBzbGlkZS5cclxuICogQWZ0ZXIgZGlhbG9nLmNsb3NlKCksIGZvY3VzIHNoaWZ0cyB0byBlZGl0IHdpbmRvdyBhbmQgSlMgQVBJIHJldHVybnMgd3Jvbmcgc2xpZGUsXHJcbiAqIGNhdXNpbmcgZmFsc2UgXCJTTElERSBDSEFOR0VEXCIgZXZlbnRzIHRoYXQgcmVzZXQgdGhlIHJlLW9wZW4gZ3VhcmQuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRTbGlkZXNob3dTbGlkZUlkKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gIGlmIChzbGlkZXNob3dBY3RpdmUpIHtcclxuICAgIC8vIFNsaWRlc2hvdzogQ29tbW9uIEFQSSBvbmx5IOKAlCBpdCByZXR1cm5zIHRoZSBhY3R1YWwgc2xpZGVzaG93IHNsaWRlXHJcbiAgICBjb25zdCBjb21tb25SZXN1bHQgPSBhd2FpdCBnZXRTbGlkZUlkVmlhQ29tbW9uQXBpKCk7XHJcbiAgICByZXR1cm4gY29tbW9uUmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLy8gRWRpdCBtb2RlOiB0cnkgSlMgQVBJIGZpcnN0IChtb3JlIHJlbGlhYmxlIGluIGVkaXQpXHJcbiAgY29uc3QganNSZXN1bHQgPSBhd2FpdCBnZXRTbGlkZUlkVmlhSnNBcGkoKTtcclxuICBpZiAoanNSZXN1bHQpIHtcclxuICAgIGRiZyhgc2xpZGVJZCB2aWEgSlMgQVBJOiAke2pzUmVzdWx0fWApO1xyXG4gICAgcmV0dXJuIGpzUmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLy8gRmFsbGJhY2s6IENvbW1vbiBBUElcclxuICBjb25zdCBjb21tb25SZXN1bHQgPSBhd2FpdCBnZXRTbGlkZUlkVmlhQ29tbW9uQXBpKCk7XHJcbiAgZGJnKGBzbGlkZUlkIHZpYSBDb21tb25BUEk6ICR7Y29tbW9uUmVzdWx0fWApO1xyXG4gIHJldHVybiBjb21tb25SZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPcGVuIG9yIHVwZGF0ZSB0aGUgdmlld2VyIGZvciBhIHNsaWRlIGR1cmluZyBzbGlkZXNob3cuXHJcbiAqXHJcbiAqIENSSVRJQ0FMOiBDbG9zaW5nIGBkaXNwbGF5RGlhbG9nQXN5bmNgIGR1cmluZyBzbGlkZXNob3cgY2F1c2VzIFBvd2VyUG9pbnRcclxuICogdG8gZXhpdCBzbGlkZXNob3cgbW9kZS4gV2UgbXVzdCBORVZFUiBjbG9zZS9yZW9wZW4gdGhlIGRpYWxvZy5cclxuICpcclxuICogU3RyYXRlZ3k6XHJcbiAqIC0gRmlyc3QgVVJMIGluIHNsaWRlc2hvdyDihpIgb3BlbiBkaWFsb2cgbm9ybWFsbHkgKHdpdGggdGhlIFVSTClcclxuICogLSBTdWJzZXF1ZW50IFVSTHMg4oaSIHdyaXRlIHRvIGxvY2FsU3RvcmFnZSwgdmlld2VyIHBpY2tzIGl0IHVwIHZpYSBgc3RvcmFnZWAgZXZlbnRcclxuICogLSBTbGlkZSB3aXRoIG5vIFVSTCDihpIgd3JpdGUgZW1wdHkgc3RyaW5nLCB2aWV3ZXIgc2hvd3Mgc3RhbmRieSAoYmxhY2sgc2NyZWVuKVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gYXV0b09wZW5WaWV3ZXJGb3JTbGlkZShzbGlkZUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBjb25maWcgPSBnZXRTbGlkZUNvbmZpZyhzbGlkZUlkKTtcclxuICBkYmcoYGF1dG9PcGVuOiBzbGlkZT0ke3NsaWRlSWR9IHVybD0ke2NvbmZpZz8udXJsID8/ICdub25lJ30gYXV0b09wZW49JHtjb25maWc/LmF1dG9PcGVufSBsYXN0Q2xvc2VkPSR7bGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWR9YCk7XHJcbiAgaWYgKCFjb25maWc/LnVybCB8fCAhY29uZmlnLmF1dG9PcGVuKSByZXR1cm47XHJcblxyXG4gIC8vIEd1YXJkOiBkb24ndCByZS1vcGVuIGRpYWxvZyBmb3IgdGhlIHNhbWUgc2xpZGUgaXQgd2FzIGNsb3NlZCBvblxyXG4gIGlmIChzbGlkZUlkID09PSBsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZCkge1xyXG4gICAgZGJnKGBhdXRvT3BlbjogU0tJUFBFRCDigJQgZGlhbG9nIHdhcyBhbHJlYWR5IGNsb3NlZCBmb3Igc2xpZGUgJHtzbGlkZUlkfWApO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGVsYXlTZWMgPSBjb25maWcuYXV0b09wZW5EZWxheVNlYyA/PyAwO1xyXG5cclxuICBpZiAoc2xpZGVzaG93RGlhbG9nT3BlbmVkICYmIGxhdW5jaGVyLmlzT3BlbigpKSB7XHJcbiAgICAvLyBEaWFsb2cgYWxyZWFkeSBvcGVuIOKAlCBzZW5kIFVSTCB2aWEgbWVzc2FnZUNoaWxkIChubyBjbG9zZS9yZW9wZW4hKVxyXG4gICAgZGJnKGBTZW5kaW5nIFVSTCB2aWEgbWVzc2FnZUNoaWxkOiAke2NvbmZpZy51cmwuc3Vic3RyaW5nKDAsIDUwKX0uLi5gKTtcclxuICAgIGNvbnN0IHNlbnQgPSBsYXVuY2hlci5zZW5kTWVzc2FnZShKU09OLnN0cmluZ2lmeSh7IGFjdGlvbjogJ25hdmlnYXRlJywgdXJsOiBjb25maWcudXJsIH0pKTtcclxuICAgIGRiZyhgbWVzc2FnZUNoaWxkIHJlc3VsdDogJHtzZW50fWApO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gT3BlbiBkaWFsb2cgKHdpdGggb3B0aW9uYWwgZGVsYXkpXHJcbiAgaWYgKGRlbGF5U2VjID4gMCkge1xyXG4gICAgZGJnKGBhdXRvT3BlbjogZGVsYXlpbmcgJHtkZWxheVNlY31zIGJlZm9yZSBvcGVuaW5nIGRpYWxvZ2ApO1xyXG4gICAgLy8gQ2FuY2VsIGFueSBwcmV2aW91cyBwZW5kaW5nIGRlbGF5XHJcbiAgICBpZiAoYXV0b09wZW5EZWxheVRpbWVyKSBjbGVhclRpbWVvdXQoYXV0b09wZW5EZWxheVRpbWVyKTtcclxuICAgIGF1dG9PcGVuRGVsYXlUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBhdXRvT3BlbkRlbGF5VGltZXIgPSBudWxsO1xyXG4gICAgICBvcGVuRGlhbG9nRm9yU2xpZGUoY29uZmlnLCBzbGlkZUlkKTtcclxuICAgIH0sIGRlbGF5U2VjICogMTAwMCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGF3YWl0IG9wZW5EaWFsb2dGb3JTbGlkZShjb25maWcsIHNsaWRlSWQpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEFjdHVhbGx5IG9wZW4gdGhlIGRpYWxvZy4gRXh0cmFjdGVkIHNvIGl0IGNhbiBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgb3IgYWZ0ZXIgZGVsYXkuICovXHJcbmFzeW5jIGZ1bmN0aW9uIG9wZW5EaWFsb2dGb3JTbGlkZShjb25maWc6IGltcG9ydCgnLi4vc2hhcmVkL3NldHRpbmdzJykuV2ViUFBUU2xpZGVDb25maWcsIHNsaWRlSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IGhpZGVNZXRob2Q6ICdub25lJyA9ICdub25lJztcclxuICB0cnkge1xyXG4gICAgZGJnKGBPcGVuaW5nIGRpYWxvZzogJHtjb25maWcudXJsLnN1YnN0cmluZygwLCA1MCl9Li4uIGhpZGU9JHtoaWRlTWV0aG9kfWApO1xyXG4gICAgYXdhaXQgbGF1bmNoZXIub3Blbih7XHJcbiAgICAgIHVybDogY29uZmlnLnVybCxcclxuICAgICAgem9vbTogY29uZmlnLnpvb20sXHJcbiAgICAgIHdpZHRoOiBjb25maWcuZGlhbG9nV2lkdGgsXHJcbiAgICAgIGhlaWdodDogY29uZmlnLmRpYWxvZ0hlaWdodCxcclxuICAgICAgbGFuZzogaTE4bi5nZXRMb2NhbGUoKSxcclxuICAgICAgYXV0b0Nsb3NlU2VjOiBjb25maWcuYXV0b0Nsb3NlU2VjLFxyXG4gICAgICBzbGlkZXNob3c6IHRydWUsXHJcbiAgICAgIGhpZGVNZXRob2QsXHJcbiAgICB9KTtcclxuICAgIHNsaWRlc2hvd0RpYWxvZ09wZW5lZCA9IHRydWU7XHJcbiAgICBkYmcoJ0RpYWxvZyBvcGVuZWQgT0snKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGRiZyhgRGlhbG9nIG9wZW4gRkFJTEVEOiAke2Vycn1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBQb2xsIHNsaWRlIGNoYW5nZXMgZHVyaW5nIHNsaWRlc2hvdy4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcG9sbFNsaWRlSW5TbGlkZXNob3coKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgaWYgKCFzbGlkZXNob3dBY3RpdmUpIHJldHVybjtcclxuICBpZiAoc2xpZGVQb2xsQnVzeSkge1xyXG4gICAgZGJnKCdwb2xsIFNLSVBQRUQgKGJ1c3kpJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBzbGlkZVBvbGxCdXN5ID0gdHJ1ZTtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2xpZGVJZCA9IGF3YWl0IGdldFNsaWRlc2hvd1NsaWRlSWQoKTtcclxuICAgIGRiZyhgcG9sbCB0aWNrOiBnb3Q9JHtzbGlkZUlkfSBsYXN0PSR7bGFzdFNsaWRlc2hvd1NsaWRlSWR9YCk7XHJcblxyXG4gICAgaWYgKCFzbGlkZUlkKSB7XHJcbiAgICAgIGRiZygncG9sbDogc2xpZGVJZCBpcyBudWxsJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChzbGlkZUlkID09PSBsYXN0U2xpZGVzaG93U2xpZGVJZCkgcmV0dXJuO1xyXG5cclxuICAgIGRiZyhgU0xJREUgQ0hBTkdFRDogJHtsYXN0U2xpZGVzaG93U2xpZGVJZH0g4oaSICR7c2xpZGVJZH1gKTtcclxuICAgIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gc2xpZGVJZDtcclxuICAgIGxhc3REaWFsb2dDbG9zZWRTbGlkZUlkID0gbnVsbDsgIC8vIFJlc2V0OiBhbGxvdyBkaWFsb2cgZm9yIHRoZSBuZXcgc2xpZGVcclxuXHJcbiAgICAvLyBDYW5jZWwgYW55IHBlbmRpbmcgYXV0by1vcGVuIGRlbGF5IGZyb20gdGhlIHByZXZpb3VzIHNsaWRlXHJcbiAgICBpZiAoYXV0b09wZW5EZWxheVRpbWVyKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dChhdXRvT3BlbkRlbGF5VGltZXIpO1xyXG4gICAgICBhdXRvT3BlbkRlbGF5VGltZXIgPSBudWxsO1xyXG4gICAgICBkYmcoJ0NhbmNlbGxlZCBwZW5kaW5nIGF1dG8tb3BlbiBkZWxheSAoc2xpZGUgY2hhbmdlZCknKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb25maWcgPSBnZXRTbGlkZUNvbmZpZyhzbGlkZUlkKTtcclxuICAgIGlmIChjb25maWc/LmF1dG9PcGVuICYmIGNvbmZpZy51cmwpIHtcclxuICAgICAgYXdhaXQgYXV0b09wZW5WaWV3ZXJGb3JTbGlkZShzbGlkZUlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFNsaWRlIGhhcyBubyBVUkwgb3IgYXV0b09wZW4gaXMgb2ZmLlxyXG4gICAgICAvLyBEbyBOT1QgY2xvc2UgdGhlIGRpYWxvZyAoaXQgd291bGQgZXhpdCBzbGlkZXNob3cpLlxyXG4gICAgICAvLyBJbnN0ZWFkLCB0ZWxsIHRoZSB2aWV3ZXIgdG8gc2hvdyBzdGFuZGJ5IChibGFjayBzY3JlZW4pLlxyXG4gICAgICBkYmcoYE5vIFVSTCBmb3Igc2xpZGUgJHtzbGlkZUlkfSDigJQgc2VuZGluZyBzdGFuZGJ5YCk7XHJcbiAgICAgIGlmIChzbGlkZXNob3dEaWFsb2dPcGVuZWQgJiYgbGF1bmNoZXIuaXNPcGVuKCkpIHtcclxuICAgICAgICBsYXVuY2hlci5zZW5kTWVzc2FnZShKU09OLnN0cmluZ2lmeSh7IGFjdGlvbjogJ3N0YW5kYnknIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgZGJnKGBwb2xsIEVSUk9SOiAke2Vycn1gKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgc2xpZGVQb2xsQnVzeSA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIENhbGxlZCB3aGVuIHNsaWRlc2hvdyBtb2RlIGlzIGRldGVjdGVkLiAqL1xyXG5hc3luYyBmdW5jdGlvbiBvblNsaWRlc2hvd0VudGVyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHNsaWRlc2hvd0FjdGl2ZSA9IHRydWU7XHJcbiAgbGFzdFNsaWRlc2hvd1NsaWRlSWQgPSBudWxsO1xyXG4gIHNsaWRlUG9sbEJ1c3kgPSBmYWxzZTtcclxuICBkYmcoJ1NMSURFU0hPVyBERVRFQ1RFRCcpO1xyXG5cclxuICAvLyBCdWlsZCBzbGlkZSBpbmRleCBtYXAgQkVGT1JFIHRyeWluZyB0byBnZXQgY3VycmVudCBzbGlkZS5cclxuICAvLyBUaGlzIGlzIG5lZWRlZCBmb3IgdGhlIENvbW1vbiBBUEkgZmFsbGJhY2sgd2hpY2ggcmV0dXJucyBpbmRleCwgbm90IElELlxyXG4gIGF3YWl0IGJ1aWxkU2xpZGVJbmRleE1hcCgpO1xyXG5cclxuICAvLyBJbW1lZGlhdGVseSB0cnkgdG8gb3BlbiB2aWV3ZXIgZm9yIHRoZSBjdXJyZW50IHNsaWRlXHJcbiAgZGJnKCdHZXR0aW5nIGN1cnJlbnQgc2xpZGUuLi4nKTtcclxuICBjb25zdCBzbGlkZUlkID0gYXdhaXQgZ2V0U2xpZGVzaG93U2xpZGVJZCgpO1xyXG4gIGRiZyhgQ3VycmVudCBzbGlkZSByZXN1bHQ6ICR7c2xpZGVJZH1gKTtcclxuXHJcbiAgaWYgKHNsaWRlSWQpIHtcclxuICAgIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gc2xpZGVJZDtcclxuICAgIGF3YWl0IGF1dG9PcGVuVmlld2VyRm9yU2xpZGUoc2xpZGVJZCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRiZygnQ291bGQgbm90IGRldGVybWluZSBjdXJyZW50IHNsaWRlIGluIHNsaWRlc2hvdycpO1xyXG4gIH1cclxuXHJcbiAgLy8gU3RhcnQgcG9sbGluZyBmb3Igc2xpZGUgY2hhbmdlc1xyXG4gIGlmIChzbGlkZVBvbGxUaW1lcikgY2xlYXJJbnRlcnZhbChzbGlkZVBvbGxUaW1lcik7XHJcbiAgc2xpZGVQb2xsVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7IHBvbGxTbGlkZUluU2xpZGVzaG93KCk7IH0sIFNMSURFX1BPTExfSU5URVJWQUxfTVMpO1xyXG4gIGRiZygnU2xpZGUgcG9sbGluZyBzdGFydGVkJyk7XHJcbn1cclxuXHJcbi8qKiBDYWxsZWQgd2hlbiBlZGl0IG1vZGUgaXMgcmVzdG9yZWQuICovXHJcbmZ1bmN0aW9uIG9uU2xpZGVzaG93RXhpdCgpOiB2b2lkIHtcclxuICBzbGlkZXNob3dBY3RpdmUgPSBmYWxzZTtcclxuICBzbGlkZXNob3dEaWFsb2dPcGVuZWQgPSBmYWxzZTtcclxuICBkYmcoJ1NMSURFU0hPVyBFTkRFRCcpO1xyXG4gIGlmIChzbGlkZVBvbGxUaW1lcikge1xyXG4gICAgY2xlYXJJbnRlcnZhbChzbGlkZVBvbGxUaW1lcik7XHJcbiAgICBzbGlkZVBvbGxUaW1lciA9IG51bGw7XHJcbiAgfVxyXG4gIGlmIChhdXRvT3BlbkRlbGF5VGltZXIpIHtcclxuICAgIGNsZWFyVGltZW91dChhdXRvT3BlbkRlbGF5VGltZXIpO1xyXG4gICAgYXV0b09wZW5EZWxheVRpbWVyID0gbnVsbDtcclxuICB9XHJcbiAgbGFzdFNsaWRlc2hvd1NsaWRlSWQgPSBudWxsO1xyXG5cclxuICAvLyBTYWZlIHRvIGNsb3NlIGRpYWxvZyBub3cg4oCUIHNsaWRlc2hvdyBhbHJlYWR5IGV4aXRlZFxyXG4gIGxhdW5jaGVyLmNsb3NlKCk7XHJcbn1cclxuXHJcbi8qKiBQZXJpb2RpY2FsbHkgY2hlY2sgdmlldyBtb2RlIHRvIGRldGVjdCBzbGlkZXNob3cgc3RhcnQvZW5kLiAqL1xyXG5sZXQgdmlld1BvbGxDb3VudCA9IDA7XHJcbmFzeW5jIGZ1bmN0aW9uIHBvbGxWaWV3TW9kZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICB2aWV3UG9sbENvdW50Kys7XHJcbiAgY29uc3QgdmlldyA9IGF3YWl0IGdldEFjdGl2ZVZpZXcoKTtcclxuICBjb25zdCBpc1NsaWRlc2hvdyA9IHZpZXcgPT09ICdyZWFkJztcclxuXHJcbiAgLy8gTG9nIGV2ZXJ5IDV0aCBwb2xsIHRvIHNob3cgcG9sbGluZyBpcyBhbGl2ZSwgcGx1cyBldmVyeSBtb2RlIGNoYW5nZVxyXG4gIGlmICh2aWV3UG9sbENvdW50ICUgNSA9PT0gMSkge1xyXG4gICAgZGJnKGBwb2xsICMke3ZpZXdQb2xsQ291bnR9OiB2aWV3PVwiJHt2aWV3fVwiIGFjdGl2ZT0ke3NsaWRlc2hvd0FjdGl2ZX1gKTtcclxuICB9XHJcblxyXG4gIGlmIChpc1NsaWRlc2hvdyAmJiAhc2xpZGVzaG93QWN0aXZlKSB7XHJcbiAgICBhd2FpdCBvblNsaWRlc2hvd0VudGVyKCk7XHJcbiAgfSBlbHNlIGlmICghaXNTbGlkZXNob3cgJiYgc2xpZGVzaG93QWN0aXZlKSB7XHJcbiAgICBvblNsaWRlc2hvd0V4aXQoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBTdGFydCBtb25pdG9yaW5nIGZvciBzbGlkZXNob3cgbW9kZS4gKi9cclxuZnVuY3Rpb24gc3RhcnRWaWV3TW9kZVBvbGxpbmcoKTogdm9pZCB7XHJcbiAgaWYgKHZpZXdQb2xsVGltZXIpIHJldHVybjtcclxuICB2aWV3UG9sbFRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4geyBwb2xsVmlld01vZGUoKTsgfSwgVklFV19QT0xMX0lOVEVSVkFMX01TKTtcclxuICBkYmcoJ1ZpZXcgbW9kZSBwb2xsaW5nIFNUQVJURUQgKGV2ZXJ5IDJzKScpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVIb3dUb1RvZ2dsZSgpOiB2b2lkIHtcclxuICBoYW5kbGVJbmZvVG9nZ2xlKCdob3d0by1zZWN0aW9uJywgJ2J0bi1ob3d0by10b2dnbGUnKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEluaXQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBpbml0KCk6IHZvaWQge1xyXG4gIC8vIENhY2hlIERPTSByZWZzXHJcbiAgdXJsSW5wdXQgPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCd1cmwtaW5wdXQnKTtcclxuICBidG5BcHBseSA9ICQ8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdidG4tYXBwbHknKTtcclxuICBidG5TaG93ID0gJDxIVE1MQnV0dG9uRWxlbWVudD4oJ2J0bi1zaG93Jyk7XHJcbiAgYnRuRGVmYXVsdHMgPSAkPEhUTUxCdXR0b25FbGVtZW50PignYnRuLWRlZmF1bHRzJyk7XHJcbiAgc3RhdHVzRWwgPSAkKCdzdGF0dXMnKTtcclxuICBzbGlkZU51bWJlckVsID0gJCgnc2xpZGUtbnVtYmVyJyk7XHJcbiAgbGFuZ1NlbGVjdCA9ICQ8SFRNTFNlbGVjdEVsZW1lbnQ+KCdsYW5nLXNlbGVjdCcpO1xyXG4gIHNsaWRlcldpZHRoID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLXdpZHRoJyk7XHJcbiAgc2xpZGVySGVpZ2h0ID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLWhlaWdodCcpO1xyXG4gIHNsaWRlclpvb20gPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdzbGlkZXItem9vbScpO1xyXG4gIHNsaWRlcldpZHRoVmFsdWUgPSAkKCdzbGlkZXItd2lkdGgtdmFsdWUnKTtcclxuICBzbGlkZXJIZWlnaHRWYWx1ZSA9ICQoJ3NsaWRlci1oZWlnaHQtdmFsdWUnKTtcclxuICBzbGlkZXJab29tVmFsdWUgPSAkKCdzbGlkZXItem9vbS12YWx1ZScpO1xyXG4gIHNpemVQcmV2aWV3SW5uZXIgPSAkKCdzaXplLXByZXZpZXctaW5uZXInKTtcclxuICBjaGtBdXRvT3BlbiA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ2Noay1hdXRvLW9wZW4nKTtcclxuICBjaGtMb2NrU2l6ZSA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ2Noay1sb2NrLXNpemUnKTtcclxuICBzbGlkZXJBdXRvT3BlbkRlbGF5ID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLWF1dG9vcGVuZGVsYXknKTtcclxuICBzbGlkZXJBdXRvT3BlbkRlbGF5VmFsdWUgPSAkKCdzbGlkZXItYXV0b29wZW5kZWxheS12YWx1ZScpO1xyXG4gIHNlY3Rpb25BdXRvT3BlbkRlbGF5ID0gJCgnc2VjdGlvbi1hdXRvLW9wZW4tZGVsYXknKTtcclxuICBzbGlkZXJBdXRvQ2xvc2UgPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdzbGlkZXItYXV0b2Nsb3NlJyk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlVmFsdWUgPSAkKCdzbGlkZXItYXV0b2Nsb3NlLXZhbHVlJyk7XHJcbiAgcHJlc2V0QnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEJ1dHRvbkVsZW1lbnQ+KCcuYnRuLXByZXNldCcpO1xyXG4gIHZpZXdlclN0YXR1c0VsID0gJCgndmlld2VyLXN0YXR1cycpO1xyXG4gIHZpZXdlclN0YXR1c1RleHQgPSAkKCd2aWV3ZXItc3RhdHVzLXRleHQnKTtcclxuXHJcbiAgLy8gUmVzdG9yZSBzYXZlZCBsYW5ndWFnZSBvciBkZXRlY3RcclxuICBjb25zdCBzYXZlZExhbmcgPSBnZXRMYW5ndWFnZSgpO1xyXG4gIGlmIChzYXZlZExhbmcpIHtcclxuICAgIGkxOG4uc2V0TG9jYWxlKHNhdmVkTGFuZyk7XHJcbiAgfVxyXG4gIGxhbmdTZWxlY3QudmFsdWUgPSBpMThuLmdldExvY2FsZSgpO1xyXG4gIGFwcGx5STE4bigpO1xyXG5cclxuICAvLyBFdmVudCBsaXN0ZW5lcnNcclxuICBidG5BcHBseS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUFwcGx5KTtcclxuICBidG5TaG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlU2hvdyk7XHJcbiAgYnRuRGVmYXVsdHMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZXREZWZhdWx0cyk7XHJcbiAgbGFuZ1NlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVMYW5ndWFnZUNoYW5nZSk7XHJcbiAgdXJsSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZVVybEtleWRvd24pO1xyXG4gIHNsaWRlcldpZHRoLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlV2lkdGhJbnB1dCk7XHJcbiAgc2xpZGVySGVpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlSGVpZ2h0SW5wdXQpO1xyXG4gIHNsaWRlclpvb20uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBoYW5kbGVab29tSW5wdXQpO1xyXG4gIGNoa0xvY2tTaXplLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUxvY2tTaXplQ2hhbmdlKTtcclxuICBjaGtBdXRvT3Blbi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVBdXRvT3BlbkNoYW5nZSk7XHJcbiAgc2xpZGVyQXV0b09wZW5EZWxheS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZUF1dG9PcGVuRGVsYXlJbnB1dCk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlQXV0b0Nsb3NlSW5wdXQpO1xyXG4gICQoJ2J0bi1hdXRvb3Blbi1pbmZvJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVBdXRvT3BlbkluZm9Ub2dnbGUpO1xyXG4gICQoJ2J0bi1hdXRvY2xvc2UtaW5mbycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQXV0b0Nsb3NlSW5mb1RvZ2dsZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnpvb20tcHJlc2V0cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVByZXNldENsaWNrKTtcclxuICAkKCdidG4tZ3VpZGUtdG9nZ2xlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVHdWlkZVRvZ2dsZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmd1aWRlLXRhYnMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVHdWlkZVRhYkNsaWNrKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3VpZGUtdGFicycpPy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlR3VpZGVUYWJLZXlkb3duIGFzIEV2ZW50TGlzdGVuZXIpO1xyXG4gICQoJ2d1aWRlLXNlY3Rpb24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUd1aWRlQ29weSk7XHJcblxyXG4gIC8vIERldGVjdCBjdXJyZW50IHNsaWRlICYgbGlzdGVuIGZvciBjaGFuZ2VzIChvbmx5IGluc2lkZSBQb3dlclBvaW50KVxyXG4gIGRldGVjdEN1cnJlbnRTbGlkZSgpO1xyXG4gIGJ1aWxkU2xpZGVJbmRleE1hcCgpO1xyXG5cclxuICB0cnkge1xyXG4gICAgT2ZmaWNlLmNvbnRleHQuZG9jdW1lbnQuYWRkSGFuZGxlckFzeW5jKFxyXG4gICAgICBPZmZpY2UuRXZlbnRUeXBlLkRvY3VtZW50U2VsZWN0aW9uQ2hhbmdlZCxcclxuICAgICAgKCkgPT4geyBkZXRlY3RDdXJyZW50U2xpZGUoKTsgfSxcclxuICAgICk7XHJcbiAgfSBjYXRjaCB7IC8qIG91dHNpZGUgT2ZmaWNlIGhvc3Qg4oCUIHNsaWRlIGRldGVjdGlvbiB1bmF2YWlsYWJsZSAqLyB9XHJcblxyXG4gIC8vIFZpZXdlciBtZXNzYWdlIOKGkiB1cGRhdGUgc3RhdHVzIGluZGljYXRvclxyXG4gIGxhdW5jaGVyLm9uTWVzc2FnZShoYW5kbGVWaWV3ZXJNZXNzYWdlKTtcclxuXHJcbiAgLy8gRGlhbG9nIGNsb3NlZCAodXNlciBjbG9zZWQgd2luZG93IG9yIG5hdmlnYXRpb24gZXJyb3IpIOKGkiB1cGRhdGUgVUlcclxuICBsYXVuY2hlci5vbkNsb3NlZChoYW5kbGVWaWV3ZXJDbG9zZWQpO1xyXG5cclxuICAvLyBTdGFydCBwb2xsaW5nIGZvciBzbGlkZXNob3cgbW9kZS5cclxuICAvLyBUaGUgY29tbWFuZHMgcnVudGltZSAoRnVuY3Rpb25GaWxlKSBtYXkgbm90IHBlcnNpc3QsIHNvIHRoZSB0YXNrcGFuZVxyXG4gIC8vIGhhbmRsZXMgYXV0by1vcGVuIGFzIGEgcmVsaWFibGUgZmFsbGJhY2suXHJcbiAgc3RhcnRWaWV3TW9kZVBvbGxpbmcoKTtcclxuXHJcbiAgJCgnYnRuLWhvd3RvLXRvZ2dsZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlSG93VG9Ub2dnbGUpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQm9vdHN0cmFwIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIoKTtcclxuT2ZmaWNlLm9uUmVhZHkoKCkgPT4gaW5pdCgpKTtcclxuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9