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

module.exports = /*#__PURE__*/JSON.parse('{"en":{"insertWebPage":"Add WebPage.PPT","editPageProperty":"Edit Page Property","enterUrl":"Enter URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Window size","autoOpen":"Auto-open on slide change","showWebPage":"Show WebPage.PPT","ownSiteBlocked":"Is this your own site?","showSetupGuide":"Show setup guide","openDirectly":"Open directly (no frame)","apply":"Apply","cancel":"Cancel","language":"Language","iframeBlocked":"This site blocks embedding.","iframeBlockedHint":"If this is your site, you can fix it in one line.","noUrl":"Please enter a valid URL","noUrlForSlide":"No URL configured for this slide","success":"Settings saved","errorGeneric":"Something went wrong. Please try again.","dialogAlreadyOpen":"A web page viewer is already open.","dialogBlocked":"The viewer was blocked. Please allow pop-ups for this site.","openInBrowser":"Open in browser","guideTitle":"How to allow embedding","guideIntro":"Add one of these snippets to the server that hosts the linked page:","guideNote":"Restart your server and reload the slide after making changes.","copy":"Copy","copied":"Copied!","hideSetupGuide":"Hide guide","slideLabel":"Slide","dialogWidth":"Width","dialogHeight":"Height","lockSize":"Lock proportions","setAsDefaults":"Save as defaults for new slides","defaultsSaved":"Default settings saved for new slides","siteNotLoading":"Site not loading?","guideMetaNote":"Note: frame-ancestors in a meta tag may be ignored if the server already sets X-Frame-Options headers.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"What is X-Frame-Options?","guideFaqXFrameA":"An HTTP header that controls whether your site can be shown inside an iframe. Some servers set it to DENY or SAMEORIGIN by default, blocking embedding.","guideFaqUnknownServerQ":"I don\'t know which server I have","guideFaqUnknownServerA":"Check your project files: nginx.conf → Nginx, .htaccess → Apache, app.js or server.js → Node.js/Express. For shared hosting, ask your provider.","guideFaqNoAccessQ":"I don\'t have server access","guideFaqNoAccessA":"Use the \\"Open directly\\" button in the viewer — it opens the page in a full browser window without iframe restrictions.","viewerLoading":"Loading page…","viewerLoaded":"Page loaded","viewerBlocked":"Site blocked embedding","viewerError":"Page failed to load","viewerClosed":"Viewer closed","help":"Help","infoTooltip":"Info","noInternet":"No internet connection. Check your connection and try again.","loadTimeout":"The page is taking too long to load.","dialogUnsupported":"Your version of Office does not support the viewer window. Please update Office.","settingsSaveRetryFailed":"Could not save settings. Please try again later.","selectSlide":"Please select a slide first.","urlAutoFixed":"Added https:// to the URL.","unitSec":"s","unitMin":"m","unitHour":"h","autoOpenDelay":"Open after","autoOpenDelayImmediate":"0s","autoClose":"Auto-close after","autoCloseOff":"Off","countdownText":"Closes in {n}s","autoCloseHint":"The web page window captures focus from PowerPoint. While it is open, your clicker/remote will not work — you won\'t be able to close the slide or switch to the next one. You will need to use the keyboard or mouse on the computer running PowerPoint. Auto-close returns focus automatically after the set time (the link will be displayed for that duration, and the clicker won\'t work during this period). Once the window closes, clicker control is restored. Plan how long you need to present the linked content and set the timer accordingly.","autoOpenHint":"When enabled, the web page opens automatically each time you navigate to this slide during a presentation. You don\'t need to click \\"Show Web Page\\" manually — the viewer appears as soon as the slide is displayed. Especially useful when the presentation is controlled by a clicker/remote.","howToUse":"How to use","howToUseHint":"Showing the web page on the audience screen (projector):\\n\\n1. Start the Slide Show.\\n2. Press Alt+Tab, switch to the PowerPoint editing window (with the Ribbon), and minimize it (Win+↓).\\n\\nPresenter View (Use Presenter View — ON):\\nClick in the Slide Show window — the one your audience sees — to give it focus. Then use your keyboard or clicker.\\n\\nDuplicate Slide Show (Duplicate Slide Show — ON):\\nNo extra steps needed.\\n\\nSingle monitor: the web page opens on top of the presentation.","guideImageTitle":"Option 1: Link to an image","guideImageDesc":"If your site can export content as an image (.png, .jpg, .webp, .gif, .svg), paste the direct URL to the image file. No server changes needed — the image displays without an iframe, refreshes automatically each time the slide is shown, and focus returns to PowerPoint so your clicker/remote keeps working.","guideServerTitle":"Option 2: Allow iframe embedding"},"zh":{"insertWebPage":"添加 WebPage.PPT","editPageProperty":"编辑页面属性","enterUrl":"输入 URL","urlPlaceholder":"https://example.com","zoom":"缩放","dialogSize":"窗口大小","autoOpen":"切换幻灯片时自动打开","showWebPage":"显示 WebPage.PPT","ownSiteBlocked":"这是您自己的网站吗？","showSetupGuide":"显示设置指南","openDirectly":"直接打开（无框架）","apply":"应用","cancel":"取消","language":"语言","iframeBlocked":"此网站阻止嵌入。","iframeBlockedHint":"如果这是您的网站，一行代码即可修复。","noUrl":"请输入有效的 URL","noUrlForSlide":"此幻灯片未配置 URL","success":"设置已保存","errorGeneric":"出现问题，请重试。","dialogAlreadyOpen":"网页查看器已打开。","dialogBlocked":"查看器被阻止。请允许此站点的弹出窗口。","openInBrowser":"在浏览器中打开","guideTitle":"如何允许嵌入","guideIntro":"将以下代码片段之一添加到托管链接页面的服务器：","guideNote":"更改后请重启服务器并重新加载幻灯片。","copy":"复制","copied":"已复制！","hideSetupGuide":"隐藏指南","slideLabel":"幻灯片","dialogWidth":"宽度","dialogHeight":"高度","lockSize":"锁定比例","setAsDefaults":"保存为新幻灯片的默认设置","defaultsSaved":"已保存新幻灯片的默认设置","siteNotLoading":"网站无法加载？","guideMetaNote":"注意：如果服务器已设置 X-Frame-Options 头，meta 标签中的 frame-ancestors 可能被忽略。","guideFaqTitle":"常见问题","guideFaqXFrameQ":"什么是 X-Frame-Options？","guideFaqXFrameA":"一种 HTTP 头，控制您的网站是否可以在 iframe 中显示。某些服务器默认设置为 DENY 或 SAMEORIGIN，从而阻止嵌入。","guideFaqUnknownServerQ":"我不知道我的服务器类型","guideFaqUnknownServerA":"检查项目文件：nginx.conf → Nginx，.htaccess → Apache，app.js 或 server.js → Node.js/Express。共享主机请咨询提供商。","guideFaqNoAccessQ":"我没有服务器访问权限","guideFaqNoAccessA":"使用查看器中的「直接打开」按钮——它会在完整的浏览器窗口中打开页面，没有 iframe 限制。","viewerLoading":"正在加载页面…","viewerLoaded":"页面已加载","viewerBlocked":"网站阻止了嵌入","viewerError":"页面加载失败","viewerClosed":"查看器已关闭","help":"帮助","infoTooltip":"信息","noInternet":"无网络连接。请检查连接后重试。","loadTimeout":"页面加载时间过长。","dialogUnsupported":"您的 Office 版本不支持查看器窗口。请更新 Office。","settingsSaveRetryFailed":"无法保存设置。请稍后重试。","selectSlide":"请先选择一张幻灯片。","urlAutoFixed":"已为 URL 添加 https://。","unitSec":"秒","unitMin":"分","unitHour":"时","autoOpenDelay":"打开延迟","autoOpenDelayImmediate":"0秒","autoClose":"自动关闭时间","autoCloseOff":"关闭","countdownText":"{n}秒后关闭","autoCloseHint":"网页窗口会从 PowerPoint 获取焦点。窗口打开时，演示遥控器/翻页器无法工作——您无法关闭幻灯片或切换到下一张。您需要使用运行 PowerPoint 的电脑的键盘或鼠标。自动关闭会在设定时间后自动返回焦点（链接会在此期间显示，翻页器在此期间不工作）。窗口关闭后，翻页器恢复控制。请规划您需要展示链接内容的时间并相应设置计时器。","autoOpenHint":"启用后，演示过程中每次切换到此幻灯片时，网页会自动打开。无需手动点击「显示网页」——幻灯片显示时查看器会自动出现。使用遥控器/翻页器控制演示时特别有用。","howToUse":"使用说明","howToUseHint":"在观众屏幕（投影仪）上显示网页：\\n\\n1. 启动幻灯片放映（Slide Show）。\\n2. 按 Alt+Tab，切换到 PowerPoint 编辑窗口（带功能区 Ribbon），将其最小化（Win+↓）。\\n\\n演示者视图（Use Presenter View — 开启）：\\n点击观众看到的幻灯片放映窗口（Slide Show），使其获得焦点。然后用键盘或翻页笔切换幻灯片。\\n\\n复制幻灯片放映（Duplicate Slide Show — 开启）：\\n无需额外操作。\\n\\n单显示器：网页将在演示文稿上方打开。","guideImageTitle":"选项 1：链接到图片","guideImageDesc":"如果您的网站可以将内容导出为图片（.png、.jpg、.webp、.gif、.svg），请粘贴图片文件的直接 URL。无需更改服务器——图片无需 iframe 即可显示，每次显示幻灯片时自动刷新，焦点会返回 PowerPoint，您的遥控器/翻页器可继续使用。","guideServerTitle":"选项 2：允许 iframe 嵌入"},"es":{"insertWebPage":"Añadir WebPage.PPT","editPageProperty":"Propiedades de página","enterUrl":"Ingrese la URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Tamaño de ventana","autoOpen":"Abrir al cambiar de diapositiva","showWebPage":"Mostrar WebPage.PPT","ownSiteBlocked":"¿Es su propio sitio?","showSetupGuide":"Mostrar guía","openDirectly":"Abrir directamente (sin marco)","apply":"Aplicar","cancel":"Cancelar","language":"Idioma","iframeBlocked":"Este sitio bloquea la incrustación.","iframeBlockedHint":"Si es su sitio, se arregla en una línea.","noUrl":"Ingrese una URL válida","noUrlForSlide":"No hay URL configurada para esta diapositiva","success":"Configuración guardada","errorGeneric":"Algo salió mal. Inténtelo de nuevo.","dialogAlreadyOpen":"Ya hay una ventana de visor abierta.","dialogBlocked":"La ventana fue bloqueada. Permita ventanas emergentes para este sitio.","openInBrowser":"Abrir en navegador","guideTitle":"Cómo permitir la incrustación","guideIntro":"Agregue uno de estos fragmentos al servidor que aloja la página enlazada:","guideNote":"Reinicie su servidor y recargue la diapositiva después de los cambios.","copy":"Copiar","copied":"¡Copiado!","hideSetupGuide":"Ocultar guía","slideLabel":"Diapositiva","dialogWidth":"Ancho","dialogHeight":"Alto","lockSize":"Vincular proporciones","setAsDefaults":"Guardar como ajustes predeterminados para nuevas diapositivas","defaultsSaved":"Ajustes predeterminados guardados","siteNotLoading":"¿El sitio no carga?","guideMetaNote":"Nota: frame-ancestors en una etiqueta meta puede no funcionar si el servidor ya establece encabezados X-Frame-Options.","guideFaqTitle":"Preguntas frecuentes","guideFaqXFrameQ":"¿Qué es X-Frame-Options?","guideFaqXFrameA":"Un encabezado HTTP que controla si su sitio puede mostrarse dentro de un iframe. Algunos servidores lo configuran como DENY o SAMEORIGIN por defecto.","guideFaqUnknownServerQ":"No sé qué servidor tengo","guideFaqUnknownServerA":"Revise los archivos del proyecto: nginx.conf → Nginx, .htaccess → Apache, app.js o server.js → Node.js/Express. En hosting compartido, pregunte a su proveedor.","guideFaqNoAccessQ":"No tengo acceso al servidor","guideFaqNoAccessA":"Use el botón \\"Abrir directamente\\" en el visor — abre la página en una ventana completa del navegador sin restricciones de iframe.","viewerLoading":"Cargando página…","viewerLoaded":"Página cargada","viewerBlocked":"El sitio bloquea la incrustación","viewerError":"No se pudo cargar la página","viewerClosed":"Visor cerrado","help":"Ayuda","infoTooltip":"Info","noInternet":"Sin conexión a Internet. Verifique su conexión e inténtelo de nuevo.","loadTimeout":"La página tarda demasiado en cargar.","dialogUnsupported":"Su versión de Office no soporta la ventana de visor. Actualice Office.","settingsSaveRetryFailed":"No se pudieron guardar los ajustes. Inténtelo más tarde.","selectSlide":"Primero seleccione una diapositiva.","urlAutoFixed":"Se añadió https:// a la URL.","unitSec":"s","unitMin":"min","unitHour":"h","autoOpenDelay":"Abrir después de","autoOpenDelayImmediate":"0s","autoClose":"Cerrar después de","autoCloseOff":"Desact.","countdownText":"Se cierra en {n}s","autoCloseHint":"La ventana de la página web captura el foco de PowerPoint. Mientras está abierta, el control remoto/clicker no funcionará: no podrá cerrar la diapositiva ni pasar a la siguiente. Deberá usar el teclado o ratón del ordenador con PowerPoint. El cierre automático devuelve el foco automáticamente después del tiempo configurado (el enlace se mostrará durante ese período y el clicker no funcionará). Una vez cerrada la ventana, el control vuelve al clicker. Planifique cuánto tiempo necesita para presentar el contenido del enlace y ajuste el temporizador.","autoOpenHint":"Si está activado, la página web se abre automáticamente cada vez que navega a esta diapositiva durante la presentación. No necesita pulsar \\"Mostrar página web\\" manualmente — el visor aparece en cuanto se muestra la diapositiva. Especialmente útil cuando la presentación se controla con un clicker/mando.","howToUse":"Cómo usar","howToUseHint":"Mostrar la página web en la pantalla del público (proyector):\\n\\n1. Inicie la presentación (Slide Show).\\n2. Pulse Alt+Tab, cambie a la ventana de edición de PowerPoint (con la cinta, Ribbon) y minimícela (Win+↓).\\n\\nVista del presentador (Use Presenter View — activado):\\nHaga clic en la ventana Presentación (Slide Show) que ve el público para darle el foco. Luego use el teclado o el mando a distancia.\\n\\nDuplicar presentación (Duplicate Slide Show — activado):\\nNo se requieren pasos adicionales.\\n\\nUn monitor: la página web se abre sobre la presentación.","guideImageTitle":"Opción 1: Enlace a una imagen","guideImageDesc":"Si su sitio puede exportar contenido como imagen (.png, .jpg, .webp, .gif, .svg), pegue la URL directa del archivo. No requiere cambios en el servidor — la imagen se muestra sin iframe, se actualiza automáticamente cada vez que se muestra la diapositiva, y el foco vuelve a PowerPoint para que su clicker/mando siga funcionando.","guideServerTitle":"Opción 2: Permitir la incrustación en iframe"},"de":{"insertWebPage":"WebPage.PPT hinzufügen","editPageProperty":"Seiteneigenschaften bearbeiten","enterUrl":"URL eingeben","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Fenstergröße","autoOpen":"Beim Folienwechsel automatisch öffnen","showWebPage":"WebPage.PPT anzeigen","ownSiteBlocked":"Ist das Ihre eigene Website?","showSetupGuide":"Anleitung anzeigen","openDirectly":"Direkt öffnen (ohne Rahmen)","apply":"Anwenden","cancel":"Abbrechen","language":"Sprache","iframeBlocked":"Diese Website blockiert die Einbettung.","iframeBlockedHint":"Wenn es Ihre Website ist, lässt sich das mit einer Zeile beheben.","noUrl":"Bitte geben Sie eine gültige URL ein","noUrlForSlide":"Für diese Folie ist keine URL konfiguriert","success":"Einstellungen gespeichert","errorGeneric":"Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.","dialogAlreadyOpen":"Ein Webseiten-Viewer ist bereits geöffnet.","dialogBlocked":"Der Viewer wurde blockiert. Bitte erlauben Sie Pop-ups für diese Website.","openInBrowser":"Im Browser öffnen","guideTitle":"Einbettung erlauben","guideIntro":"Fügen Sie einen dieser Code-Schnipsel zum Server hinzu, der die verlinkte Seite hostet:","guideNote":"Starten Sie Ihren Server neu und laden Sie die Folie nach den Änderungen neu.","copy":"Kopieren","copied":"Kopiert!","hideSetupGuide":"Anleitung ausblenden","slideLabel":"Folie","dialogWidth":"Breite","dialogHeight":"Höhe","lockSize":"Proportionen sperren","setAsDefaults":"Als Standard für neue Folien speichern","defaultsSaved":"Standardeinstellungen für neue Folien gespeichert","siteNotLoading":"Website lädt nicht?","guideMetaNote":"Hinweis: frame-ancestors in einem Meta-Tag wird möglicherweise ignoriert, wenn der Server bereits X-Frame-Options-Header setzt.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"Was ist X-Frame-Options?","guideFaqXFrameA":"Ein HTTP-Header, der steuert, ob Ihre Website in einem iframe angezeigt werden kann. Einige Server setzen ihn standardmäßig auf DENY oder SAMEORIGIN.","guideFaqUnknownServerQ":"Ich weiß nicht, welchen Server ich habe","guideFaqUnknownServerA":"Prüfen Sie Ihre Projektdateien: nginx.conf → Nginx, .htaccess → Apache, app.js oder server.js → Node.js/Express. Bei Shared Hosting fragen Sie Ihren Anbieter.","guideFaqNoAccessQ":"Ich habe keinen Serverzugang","guideFaqNoAccessA":"Verwenden Sie die Schaltfläche \\"Direkt öffnen\\" im Viewer — sie öffnet die Seite in einem vollständigen Browserfenster ohne iframe-Einschränkungen.","viewerLoading":"Seite wird geladen…","viewerLoaded":"Seite geladen","viewerBlocked":"Website blockiert die Einbettung","viewerError":"Seite konnte nicht geladen werden","viewerClosed":"Viewer geschlossen","help":"Hilfe","infoTooltip":"Info","noInternet":"Keine Internetverbindung. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.","loadTimeout":"Die Seite braucht zu lange zum Laden.","dialogUnsupported":"Ihre Office-Version unterstützt das Viewer-Fenster nicht. Bitte aktualisieren Sie Office.","settingsSaveRetryFailed":"Einstellungen konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.","selectSlide":"Bitte wählen Sie zuerst eine Folie aus.","urlAutoFixed":"https:// wurde zur URL hinzugefügt.","unitSec":"s","unitMin":"min","unitHour":"h","autoOpenDelay":"Öffnen nach","autoOpenDelayImmediate":"0s","autoClose":"Automatisch schließen nach","autoCloseOff":"Aus","countdownText":"Schließt in {n}s","autoCloseHint":"Das Webseiten-Fenster übernimmt den Fokus von PowerPoint. Solange es geöffnet ist, funktioniert Ihr Clicker/Fernbedienung nicht — Sie können die Folie nicht schließen oder zur nächsten wechseln. Sie müssen Tastatur oder Maus am PowerPoint-Computer verwenden. Automatisches Schließen gibt den Fokus nach der eingestellten Zeit automatisch zurück (der Link wird während dieser Zeit angezeigt, der Clicker funktioniert nicht). Nach dem Schließen wird die Clicker-Steuerung wiederhergestellt. Planen Sie, wie lange Sie den verlinkten Inhalt präsentieren möchten, und stellen Sie den Timer entsprechend ein.","autoOpenHint":"Wenn aktiviert, öffnet sich die Webseite automatisch jedes Mal, wenn Sie während einer Präsentation zu dieser Folie navigieren. Sie müssen nicht manuell \\"Webseite anzeigen\\" klicken — der Viewer erscheint sofort bei Anzeige der Folie. Besonders nützlich bei Steuerung mit Clicker/Fernbedienung.","howToUse":"Anleitung","howToUseHint":"Webseite auf dem Bildschirm des Publikums (Projektor) anzeigen:\\n\\n1. Starten Sie die Bildschirmpräsentation (Slide Show).\\n2. Drücken Sie Alt+Tab, wechseln Sie zum PowerPoint-Bearbeitungsfenster (mit dem Menüband, Ribbon) und minimieren Sie es (Win+↓).\\n\\nReferentenansicht (Use Presenter View — AN):\\nKlicken Sie in das Präsentationsfenster (Slide Show) — das, was das Publikum sieht — um den Fokus darauf zu legen. Dann wechseln Sie Folien mit Tastatur oder Klicker.\\n\\nBildschirmpräsentation duplizieren (Duplicate Slide Show — AN):\\nKeine weiteren Schritte erforderlich.\\n\\nEin Monitor: Die Webseite öffnet sich über der Präsentation.","guideImageTitle":"Option 1: Link zu einem Bild","guideImageDesc":"Wenn Ihre Website Inhalte als Bild exportieren kann (.png, .jpg, .webp, .gif, .svg), fügen Sie die direkte URL zur Bilddatei ein. Keine Serveränderungen nötig — das Bild wird ohne iframe angezeigt, aktualisiert sich bei jedem Folienwechsel automatisch, und der Fokus kehrt zu PowerPoint zurück, sodass Ihr Clicker/Fernbedienung weiter funktioniert.","guideServerTitle":"Option 2: iframe-Einbettung erlauben"},"fr":{"insertWebPage":"Ajouter WebPage.PPT","editPageProperty":"Propriétés de la page","enterUrl":"Entrez l\'URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Taille de la fenêtre","autoOpen":"Ouvrir automatiquement au changement de diapositive","showWebPage":"Afficher WebPage.PPT","ownSiteBlocked":"Est-ce votre propre site ?","showSetupGuide":"Afficher le guide","openDirectly":"Ouvrir directement (sans cadre)","apply":"Appliquer","cancel":"Annuler","language":"Langue","iframeBlocked":"Ce site bloque l\'intégration.","iframeBlockedHint":"Si c\'est votre site, cela se corrige en une ligne.","noUrl":"Veuillez entrer une URL valide","noUrlForSlide":"Aucune URL configurée pour cette diapositive","success":"Paramètres enregistrés","errorGeneric":"Une erreur s\'est produite. Veuillez réessayer.","dialogAlreadyOpen":"Une fenêtre de visualisation est déjà ouverte.","dialogBlocked":"La fenêtre a été bloquée. Veuillez autoriser les pop-ups pour ce site.","openInBrowser":"Ouvrir dans le navigateur","guideTitle":"Comment autoriser l\'intégration","guideIntro":"Ajoutez l\'un de ces extraits au serveur qui héberge la page liée :","guideNote":"Redémarrez votre serveur et rechargez la diapositive après les modifications.","copy":"Copier","copied":"Copié !","hideSetupGuide":"Masquer le guide","slideLabel":"Diapositive","dialogWidth":"Largeur","dialogHeight":"Hauteur","lockSize":"Verrouiller les proportions","setAsDefaults":"Enregistrer comme paramètres par défaut pour les nouvelles diapositives","defaultsSaved":"Paramètres par défaut enregistrés pour les nouvelles diapositives","siteNotLoading":"Le site ne charge pas ?","guideMetaNote":"Remarque : frame-ancestors dans une balise meta peut être ignoré si le serveur définit déjà des en-têtes X-Frame-Options.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"Qu\'est-ce que X-Frame-Options ?","guideFaqXFrameA":"Un en-tête HTTP qui contrôle si votre site peut être affiché dans un iframe. Certains serveurs le configurent par défaut sur DENY ou SAMEORIGIN.","guideFaqUnknownServerQ":"Je ne sais pas quel serveur j\'ai","guideFaqUnknownServerA":"Vérifiez vos fichiers de projet : nginx.conf → Nginx, .htaccess → Apache, app.js ou server.js → Node.js/Express. Pour l\'hébergement mutualisé, demandez à votre fournisseur.","guideFaqNoAccessQ":"Je n\'ai pas accès au serveur","guideFaqNoAccessA":"Utilisez le bouton \\"Ouvrir directement\\" dans le visualiseur — il ouvre la page dans une fenêtre de navigateur complète sans restrictions iframe.","viewerLoading":"Chargement de la page…","viewerLoaded":"Page chargée","viewerBlocked":"Le site bloque l\'intégration","viewerError":"Échec du chargement de la page","viewerClosed":"Visualiseur fermé","help":"Aide","infoTooltip":"Info","noInternet":"Pas de connexion Internet. Vérifiez votre connexion et réessayez.","loadTimeout":"La page met trop de temps à charger.","dialogUnsupported":"Votre version d\'Office ne prend pas en charge la fenêtre de visualisation. Veuillez mettre à jour Office.","settingsSaveRetryFailed":"Impossible d\'enregistrer les paramètres. Veuillez réessayer plus tard.","selectSlide":"Veuillez d\'abord sélectionner une diapositive.","urlAutoFixed":"https:// a été ajouté à l\'URL.","unitSec":"s","unitMin":"min","unitHour":"h","autoOpenDelay":"Ouvrir après","autoOpenDelayImmediate":"0s","autoClose":"Fermeture automatique après","autoCloseOff":"Désactivé","countdownText":"Fermeture dans {n}s","autoCloseHint":"La fenêtre de page web capture le focus de PowerPoint. Tant qu\'elle est ouverte, votre clicker/télécommande ne fonctionnera pas — vous ne pourrez pas fermer la diapositive ou passer à la suivante. Vous devrez utiliser le clavier ou la souris de l\'ordinateur exécutant PowerPoint. La fermeture automatique rend le focus automatiquement après le temps défini (le lien sera affiché pendant cette durée, le clicker ne fonctionnera pas). Une fois la fenêtre fermée, le contrôle du clicker est restauré. Prévoyez combien de temps vous avez besoin pour présenter le contenu lié et réglez le minuteur en conséquence.","autoOpenHint":"Lorsqu\'activé, la page web s\'ouvre automatiquement chaque fois que vous naviguez vers cette diapositive pendant une présentation. Pas besoin de cliquer \\"Afficher la page web\\" manuellement — le visualiseur apparaît dès que la diapositive est affichée. Particulièrement utile lorsque la présentation est contrôlée par un clicker/télécommande.","howToUse":"Mode d\'emploi","howToUseHint":"Afficher la page web sur l\'écran du public (projecteur) :\\n\\n1. Lancez le diaporama (Slide Show).\\n2. Appuyez sur Alt+Tab, passez à la fenêtre d\'édition PowerPoint (avec le ruban, Ribbon) et réduisez-la (Win+↓).\\n\\nMode Présentateur (Use Presenter View — activé) :\\nCliquez dans la fenêtre du diaporama (Slide Show) — celle que voit le public — pour lui donner le focus. Utilisez ensuite le clavier ou la télécommande.\\n\\nDupliquer le diaporama (Duplicate Slide Show — activé) :\\nAucune étape supplémentaire n\'est requise.\\n\\nUn seul écran : la page web s\'ouvre par-dessus la présentation.","guideImageTitle":"Option 1 : Lien vers une image","guideImageDesc":"Si votre site peut exporter du contenu sous forme d\'image (.png, .jpg, .webp, .gif, .svg), collez l\'URL directe du fichier image. Aucune modification du serveur nécessaire — l\'image s\'affiche sans iframe, se rafraîchit automatiquement à chaque affichage de la diapositive, et le focus revient à PowerPoint pour que votre clicker/télécommande continue de fonctionner.","guideServerTitle":"Option 2 : Autoriser l\'intégration iframe"},"it":{"insertWebPage":"Aggiungi WebPage.PPT","editPageProperty":"Proprietà pagina","enterUrl":"Inserisci URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Dimensione finestra","autoOpen":"Apri automaticamente al cambio diapositiva","showWebPage":"Mostra WebPage.PPT","ownSiteBlocked":"È il tuo sito web?","showSetupGuide":"Mostra guida","openDirectly":"Apri direttamente (senza cornice)","apply":"Applica","cancel":"Annulla","language":"Lingua","iframeBlocked":"Questo sito blocca l\'incorporamento.","iframeBlockedHint":"Se è il tuo sito, si risolve con una riga.","noUrl":"Inserisci un URL valido","noUrlForSlide":"Nessun URL configurato per questa diapositiva","success":"Impostazioni salvate","errorGeneric":"Qualcosa è andato storto. Riprova.","dialogAlreadyOpen":"Una finestra di visualizzazione è già aperta.","dialogBlocked":"La finestra è stata bloccata. Consenti i pop-up per questo sito.","openInBrowser":"Apri nel browser","guideTitle":"Come consentire l\'incorporamento","guideIntro":"Aggiungi uno di questi frammenti al server che ospita la pagina collegata:","guideNote":"Riavvia il server e ricarica la diapositiva dopo le modifiche.","copy":"Copia","copied":"Copiato!","hideSetupGuide":"Nascondi guida","slideLabel":"Diapositiva","dialogWidth":"Larghezza","dialogHeight":"Altezza","lockSize":"Blocca proporzioni","setAsDefaults":"Salva come impostazioni predefinite per nuove diapositive","defaultsSaved":"Impostazioni predefinite salvate per nuove diapositive","siteNotLoading":"Il sito non si carica?","guideMetaNote":"Nota: frame-ancestors in un tag meta potrebbe essere ignorato se il server imposta già gli header X-Frame-Options.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"Cos\'è X-Frame-Options?","guideFaqXFrameA":"Un header HTTP che controlla se il tuo sito può essere mostrato in un iframe. Alcuni server lo impostano su DENY o SAMEORIGIN per impostazione predefinita.","guideFaqUnknownServerQ":"Non so quale server ho","guideFaqUnknownServerA":"Controlla i file del progetto: nginx.conf → Nginx, .htaccess → Apache, app.js o server.js → Node.js/Express. Per hosting condiviso, chiedi al tuo provider.","guideFaqNoAccessQ":"Non ho accesso al server","guideFaqNoAccessA":"Usa il pulsante \\"Apri direttamente\\" nel visualizzatore — apre la pagina in una finestra del browser completa senza restrizioni iframe.","viewerLoading":"Caricamento pagina…","viewerLoaded":"Pagina caricata","viewerBlocked":"Il sito blocca l\'incorporamento","viewerError":"Impossibile caricare la pagina","viewerClosed":"Visualizzatore chiuso","help":"Aiuto","infoTooltip":"Info","noInternet":"Nessuna connessione Internet. Verifica la connessione e riprova.","loadTimeout":"La pagina impiega troppo tempo a caricarsi.","dialogUnsupported":"La tua versione di Office non supporta la finestra di visualizzazione. Aggiorna Office.","settingsSaveRetryFailed":"Impossibile salvare le impostazioni. Riprova più tardi.","selectSlide":"Seleziona prima una diapositiva.","urlAutoFixed":"Aggiunto https:// all\'URL.","unitSec":"s","unitMin":"min","unitHour":"h","autoOpenDelay":"Apri dopo","autoOpenDelayImmediate":"0s","autoClose":"Chiusura automatica dopo","autoCloseOff":"Disattivato","countdownText":"Si chiude tra {n}s","autoCloseHint":"La finestra della pagina web cattura il focus da PowerPoint. Mentre è aperta, il clicker/telecomando non funzionerà — non potrai chiudere la diapositiva o passare alla successiva. Dovrai usare tastiera o mouse sul computer con PowerPoint. La chiusura automatica restituisce il focus dopo il tempo impostato (il link sarà visualizzato per quel periodo, il clicker non funzionerà). Una volta chiusa la finestra, il controllo del clicker viene ripristinato. Pianifica quanto tempo ti serve per presentare il contenuto del link e imposta il timer di conseguenza.","autoOpenHint":"Se attivato, la pagina web si apre automaticamente ogni volta che navighi su questa diapositiva durante la presentazione. Non devi cliccare \\"Mostra pagina web\\" manualmente — il visualizzatore appare non appena viene mostrata la diapositiva. Particolarmente utile quando la presentazione è controllata con clicker/telecomando.","howToUse":"Guida all\'uso","howToUseHint":"Mostrare la pagina web sullo schermo del pubblico (proiettore):\\n\\n1. Avvia la presentazione (Slide Show).\\n2. Premi Alt+Tab, passa alla finestra di modifica PowerPoint (con la barra multifunzione, Ribbon) e riducila a icona (Win+↓).\\n\\nVista relatore (Use Presenter View — attiva):\\nFai clic nella finestra della presentazione (Slide Show) — quella che vede il pubblico — per darle il focus. Poi usa la tastiera o il telecomando.\\n\\nDuplica presentazione (Duplicate Slide Show — attiva):\\nNessun passaggio aggiuntivo richiesto.\\n\\nUn monitor: la pagina web si apre sopra la presentazione.","guideImageTitle":"Opzione 1: Link a un\'immagine","guideImageDesc":"Se il tuo sito può esportare contenuti come immagine (.png, .jpg, .webp, .gif, .svg), incolla l\'URL diretto del file. Nessuna modifica al server necessaria — l\'immagine viene mostrata senza iframe, si aggiorna automaticamente ad ogni visualizzazione della diapositiva, e il focus torna a PowerPoint per far funzionare il clicker/telecomando.","guideServerTitle":"Opzione 2: Consentire l\'incorporamento iframe"},"ar":{"insertWebPage":"إضافة WebPage.PPT","editPageProperty":"تعديل خصائص الصفحة","enterUrl":"أدخل عنوان URL","urlPlaceholder":"https://example.com","zoom":"تكبير","dialogSize":"حجم النافذة","autoOpen":"فتح تلقائي عند تغيير الشريحة","showWebPage":"عرض WebPage.PPT","ownSiteBlocked":"هل هذا موقعك الخاص؟","showSetupGuide":"عرض دليل الإعداد","openDirectly":"فتح مباشرة (بدون إطار)","apply":"تطبيق","cancel":"إلغاء","language":"اللغة","iframeBlocked":"هذا الموقع يمنع التضمين.","iframeBlockedHint":"إذا كان هذا موقعك، يمكن إصلاحه بسطر واحد.","noUrl":"يرجى إدخال عنوان URL صالح","noUrlForSlide":"لم يتم تكوين عنوان URL لهذه الشريحة","success":"تم حفظ الإعدادات","errorGeneric":"حدث خطأ ما. يرجى المحاولة مرة أخرى.","dialogAlreadyOpen":"نافذة عرض صفحة الويب مفتوحة بالفعل.","dialogBlocked":"تم حظر العارض. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.","openInBrowser":"فتح في المتصفح","guideTitle":"كيفية السماح بالتضمين","guideIntro":"أضف أحد هذه المقاطع إلى الخادم الذي يستضيف الصفحة المرتبطة:","guideNote":"أعد تشغيل الخادم وأعد تحميل الشريحة بعد إجراء التغييرات.","copy":"نسخ","copied":"تم النسخ!","hideSetupGuide":"إخفاء الدليل","slideLabel":"شريحة","dialogWidth":"العرض","dialogHeight":"الارتفاع","lockSize":"قفل النسب","setAsDefaults":"حفظ كإعدادات افتراضية للشرائح الجديدة","defaultsSaved":"تم حفظ الإعدادات الافتراضية للشرائح الجديدة","siteNotLoading":"الموقع لا يتحمل؟","guideMetaNote":"ملاحظة: قد يتم تجاهل frame-ancestors في علامة meta إذا كان الخادم يعيّن بالفعل ترويسات X-Frame-Options.","guideFaqTitle":"الأسئلة الشائعة","guideFaqXFrameQ":"ما هو X-Frame-Options؟","guideFaqXFrameA":"ترويسة HTTP تتحكم في إمكانية عرض موقعك داخل iframe. بعض الخوادم تعيّنه افتراضيًا على DENY أو SAMEORIGIN.","guideFaqUnknownServerQ":"لا أعرف نوع الخادم لدي","guideFaqUnknownServerA":"تحقق من ملفات المشروع: nginx.conf → Nginx، .htaccess → Apache، app.js أو server.js → Node.js/Express. للاستضافة المشتركة، اسأل مزود الخدمة.","guideFaqNoAccessQ":"ليس لدي وصول إلى الخادم","guideFaqNoAccessA":"استخدم زر \\"فتح مباشرة\\" في العارض — يفتح الصفحة في نافذة متصفح كاملة بدون قيود iframe.","viewerLoading":"جاري تحميل الصفحة…","viewerLoaded":"تم تحميل الصفحة","viewerBlocked":"الموقع يمنع التضمين","viewerError":"فشل تحميل الصفحة","viewerClosed":"تم إغلاق العارض","help":"مساعدة","infoTooltip":"معلومات","noInternet":"لا يوجد اتصال بالإنترنت. تحقق من الاتصال وحاول مرة أخرى.","loadTimeout":"الصفحة تستغرق وقتًا طويلاً في التحميل.","dialogUnsupported":"إصدار Office الخاص بك لا يدعم نافذة العرض. يرجى تحديث Office.","settingsSaveRetryFailed":"تعذر حفظ الإعدادات. يرجى المحاولة لاحقًا.","selectSlide":"يرجى تحديد شريحة أولاً.","urlAutoFixed":"تمت إضافة https:// إلى عنوان URL.","unitSec":"ث","unitMin":"د","unitHour":"س","autoOpenDelay":"فتح بعد","autoOpenDelayImmediate":"0ث","autoClose":"إغلاق تلقائي بعد","autoCloseOff":"إيقاف","countdownText":"يُغلق خلال {n} ثانية","autoCloseHint":"نافذة صفحة الويب تلتقط التركيز من PowerPoint. أثناء فتحها، لن يعمل جهاز التحكم/الكليكر — لن تتمكن من إغلاق الشريحة أو الانتقال إلى التالية. ستحتاج إلى استخدام لوحة المفاتيح أو الماوس على الكمبيوتر الذي يشغّل PowerPoint. الإغلاق التلقائي يعيد التركيز تلقائيًا بعد الوقت المحدد. بعد إغلاق النافذة، يتم استعادة التحكم بالكليكر. خطط للوقت الذي تحتاجه لعرض المحتوى واضبط المؤقت وفقًا لذلك.","autoOpenHint":"عند التفعيل، تُفتح صفحة الويب تلقائيًا في كل مرة تنتقل فيها إلى هذه الشريحة أثناء العرض التقديمي. لا حاجة للنقر على \\"عرض صفحة الويب\\" يدويًا — يظهر العارض فور عرض الشريحة. مفيد بشكل خاص عند التحكم بالعرض عبر كليكر/جهاز تحكم.","howToUse":"كيفية الاستخدام","howToUseHint":"عرض صفحة الويب على شاشة الجمهور (جهاز العرض):\\n\\n1. ابدأ عرض الشرائح (Slide Show).\\n2. اضغط Alt+Tab، انتقل إلى نافذة تحرير PowerPoint (مع الشريط، Ribbon) وقم بتصغيرها (Win+↓).\\n\\nعرض المقدم (Use Presenter View — مفعّل):\\nانقر في نافذة عرض الشرائح (Slide Show) — التي يراها الجمهور — لمنحها التركيز. ثم استخدم لوحة المفاتيح أو جهاز التحكم.\\n\\nتكرار عرض الشرائح (Duplicate Slide Show — مفعّل):\\nلا خطوات إضافية مطلوبة.\\n\\nشاشة واحدة: تفتح صفحة الويب فوق العرض التقديمي.","guideImageTitle":"الخيار 1: رابط لصورة","guideImageDesc":"إذا كان موقعك يمكنه تصدير المحتوى كصورة (.png، .jpg، .webp، .gif، .svg)، الصق عنوان URL المباشر لملف الصورة. لا حاجة لتغييرات في الخادم — تُعرض الصورة بدون iframe، وتتحدث تلقائيًا عند كل عرض للشريحة، ويعود التركيز إلى PowerPoint.","guideServerTitle":"الخيار 2: السماح بتضمين iframe"},"pt":{"insertWebPage":"Adicionar WebPage.PPT","editPageProperty":"Propriedades da página","enterUrl":"Insira a URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Tamanho da janela","autoOpen":"Abrir automaticamente ao mudar de slide","showWebPage":"Mostrar WebPage.PPT","ownSiteBlocked":"Este é o seu próprio site?","showSetupGuide":"Mostrar guia","openDirectly":"Abrir diretamente (sem moldura)","apply":"Aplicar","cancel":"Cancelar","language":"Idioma","iframeBlocked":"Este site bloqueia a incorporação.","iframeBlockedHint":"Se é o seu site, pode ser corrigido com uma linha.","noUrl":"Insira uma URL válida","noUrlForSlide":"Nenhuma URL configurada para este slide","success":"Configurações salvas","errorGeneric":"Algo deu errado. Tente novamente.","dialogAlreadyOpen":"Uma janela de visualização já está aberta.","dialogBlocked":"A janela foi bloqueada. Permita pop-ups para este site.","openInBrowser":"Abrir no navegador","guideTitle":"Como permitir a incorporação","guideIntro":"Adicione um destes trechos ao servidor que hospeda a página vinculada:","guideNote":"Reinicie o servidor e recarregue o slide após as alterações.","copy":"Copiar","copied":"Copiado!","hideSetupGuide":"Ocultar guia","slideLabel":"Slide","dialogWidth":"Largura","dialogHeight":"Altura","lockSize":"Bloquear proporções","setAsDefaults":"Salvar como padrão para novos slides","defaultsSaved":"Configurações padrão salvas para novos slides","siteNotLoading":"O site não carrega?","guideMetaNote":"Nota: frame-ancestors em uma tag meta pode ser ignorado se o servidor já define cabeçalhos X-Frame-Options.","guideFaqTitle":"Perguntas frequentes","guideFaqXFrameQ":"O que é X-Frame-Options?","guideFaqXFrameA":"Um cabeçalho HTTP que controla se o seu site pode ser exibido dentro de um iframe. Alguns servidores o definem como DENY ou SAMEORIGIN por padrão.","guideFaqUnknownServerQ":"Não sei qual servidor eu tenho","guideFaqUnknownServerA":"Verifique os arquivos do projeto: nginx.conf → Nginx, .htaccess → Apache, app.js ou server.js → Node.js/Express. Para hospedagem compartilhada, pergunte ao seu provedor.","guideFaqNoAccessQ":"Não tenho acesso ao servidor","guideFaqNoAccessA":"Use o botão \\"Abrir diretamente\\" no visualizador — ele abre a página em uma janela completa do navegador sem restrições de iframe.","viewerLoading":"Carregando página…","viewerLoaded":"Página carregada","viewerBlocked":"O site bloqueia a incorporação","viewerError":"Falha ao carregar a página","viewerClosed":"Visualizador fechado","help":"Ajuda","infoTooltip":"Info","noInternet":"Sem conexão com a Internet. Verifique sua conexão e tente novamente.","loadTimeout":"A página está demorando muito para carregar.","dialogUnsupported":"Sua versão do Office não suporta a janela de visualização. Atualize o Office.","settingsSaveRetryFailed":"Não foi possível salvar as configurações. Tente novamente mais tarde.","selectSlide":"Selecione um slide primeiro.","urlAutoFixed":"https:// foi adicionado à URL.","unitSec":"s","unitMin":"min","unitHour":"h","autoOpenDelay":"Abrir após","autoOpenDelayImmediate":"0s","autoClose":"Fechar automaticamente após","autoCloseOff":"Desligado","countdownText":"Fecha em {n}s","autoCloseHint":"A janela da página web captura o foco do PowerPoint. Enquanto estiver aberta, o clicker/controle remoto não funcionará — você não poderá fechar o slide ou avançar para o próximo. Será necessário usar teclado ou mouse no computador com PowerPoint. O fechamento automático retorna o foco automaticamente após o tempo definido. Após o fechamento da janela, o controle do clicker é restaurado. Planeje quanto tempo você precisa para apresentar o conteúdo vinculado e defina o temporizador.","autoOpenHint":"Quando ativado, a página web abre automaticamente cada vez que você navega para este slide durante a apresentação. Não é necessário clicar \\"Mostrar página web\\" manualmente — o visualizador aparece assim que o slide é exibido. Especialmente útil quando a apresentação é controlada por clicker/controle remoto.","howToUse":"Como usar","howToUseHint":"Exibir a página web na tela do público (projetor):\\n\\n1. Inicie a apresentação de slides (Slide Show).\\n2. Pressione Alt+Tab, mude para a janela de edição do PowerPoint (com a faixa de opções, Ribbon) e minimize-a (Win+↓).\\n\\nModo do Apresentador (Use Presenter View — ativado):\\nClique na janela de apresentação de slides (Slide Show) — a que o público vê — para dar o foco a ela. Use o teclado ou o controle remoto para avançar.\\n\\nDuplicar apresentação (Duplicate Slide Show — ativado):\\nNenhuma etapa adicional é necessária.\\n\\nUm monitor: a página web abre sobre a apresentação.","guideImageTitle":"Opção 1: Link para uma imagem","guideImageDesc":"Se o seu site pode exportar conteúdo como imagem (.png, .jpg, .webp, .gif, .svg), cole a URL direta do arquivo. Nenhuma alteração no servidor necessária — a imagem é exibida sem iframe, atualiza automaticamente a cada exibição do slide, e o foco retorna ao PowerPoint para que o clicker/controle continue funcionando.","guideServerTitle":"Opção 2: Permitir incorporação iframe"},"hi":{"insertWebPage":"WebPage.PPT जोड़ें","editPageProperty":"पेज गुण संपादित करें","enterUrl":"URL दर्ज करें","urlPlaceholder":"https://example.com","zoom":"ज़ूम","dialogSize":"विंडो का आकार","autoOpen":"स्लाइड बदलने पर स्वतः खोलें","showWebPage":"WebPage.PPT दिखाएं","ownSiteBlocked":"क्या यह आपकी अपनी वेबसाइट है?","showSetupGuide":"सेटअप गाइड दिखाएं","openDirectly":"सीधे खोलें (बिना फ्रेम)","apply":"लागू करें","cancel":"रद्द करें","language":"भाषा","iframeBlocked":"यह साइट एम्बेडिंग को ब्लॉक करती है।","iframeBlockedHint":"अगर यह आपकी साइट है, तो एक लाइन में ठीक हो सकता है।","noUrl":"कृपया एक मान्य URL दर्ज करें","noUrlForSlide":"इस स्लाइड के लिए कोई URL कॉन्फ़िगर नहीं है","success":"सेटिंग्स सहेजी गईं","errorGeneric":"कुछ गलत हो गया। कृपया पुनः प्रयास करें।","dialogAlreadyOpen":"एक वेब पेज व्यूअर पहले से खुला है।","dialogBlocked":"व्यूअर ब्लॉक हो गया। कृपया इस साइट के लिए पॉप-अप की अनुमति दें।","openInBrowser":"ब्राउज़र में खोलें","guideTitle":"एम्बेडिंग की अनुमति कैसे दें","guideIntro":"लिंक किए गए पेज को होस्ट करने वाले सर्वर में इनमें से एक कोड जोड़ें:","guideNote":"बदलाव करने के बाद सर्वर को पुनः आरंभ करें और स्लाइड को रीलोड करें।","copy":"कॉपी","copied":"कॉपी हो गया!","hideSetupGuide":"गाइड छिपाएं","slideLabel":"स्लाइड","dialogWidth":"चौड़ाई","dialogHeight":"ऊंचाई","lockSize":"अनुपात लॉक करें","setAsDefaults":"नई स्लाइड्स के लिए डिफ़ॉल्ट के रूप में सहेजें","defaultsSaved":"नई स्लाइड्स के लिए डिफ़ॉल्ट सेटिंग्स सहेजी गईं","siteNotLoading":"साइट लोड नहीं हो रही?","guideMetaNote":"नोट: मेटा टैग में frame-ancestors को अनदेखा किया जा सकता है अगर सर्वर पहले से X-Frame-Options हेडर सेट करता है।","guideFaqTitle":"अक्सर पूछे जाने वाले प्रश्न","guideFaqXFrameQ":"X-Frame-Options क्या है?","guideFaqXFrameA":"एक HTTP हेडर जो नियंत्रित करता है कि आपकी साइट iframe में दिखाई जा सकती है या नहीं। कुछ सर्वर इसे डिफ़ॉल्ट रूप से DENY या SAMEORIGIN पर सेट करते हैं।","guideFaqUnknownServerQ":"मुझे नहीं पता मेरा कौन सा सर्वर है","guideFaqUnknownServerA":"अपनी प्रोजेक्ट फाइलें जांचें: nginx.conf → Nginx, .htaccess → Apache, app.js या server.js → Node.js/Express। शेयर्ड होस्टिंग के लिए, अपने प्रदाता से पूछें।","guideFaqNoAccessQ":"मेरे पास सर्वर एक्सेस नहीं है","guideFaqNoAccessA":"व्यूअर में \\"सीधे खोलें\\" बटन का उपयोग करें — यह पेज को iframe प्रतिबंधों के बिना पूर्ण ब्राउज़र विंडो में खोलता है।","viewerLoading":"पेज लोड हो रहा है…","viewerLoaded":"पेज लोड हो गया","viewerBlocked":"साइट ने एम्बेडिंग ब्लॉक कर दी","viewerError":"पेज लोड होने में विफल","viewerClosed":"व्यूअर बंद हो गया","help":"सहायता","infoTooltip":"जानकारी","noInternet":"इंटरनेट कनेक्शन नहीं है। अपना कनेक्शन जांचें और पुनः प्रयास करें।","loadTimeout":"पेज लोड होने में बहुत अधिक समय ले रहा है।","dialogUnsupported":"आपके Office का संस्करण व्यूअर विंडो को सपोर्ट नहीं करता। कृपया Office अपडेट करें।","settingsSaveRetryFailed":"सेटिंग्स सहेजी नहीं जा सकीं। कृपया बाद में पुनः प्रयास करें।","selectSlide":"कृपया पहले एक स्लाइड चुनें।","urlAutoFixed":"URL में https:// जोड़ा गया।","unitSec":"से","unitMin":"मि","unitHour":"घं","autoOpenDelay":"इसके बाद खोलें","autoOpenDelayImmediate":"0से","autoClose":"इसके बाद स्वतः बंद","autoCloseOff":"बंद","countdownText":"{n}s में बंद होगा","autoCloseHint":"वेब पेज विंडो PowerPoint से फोकस लेती है। जब तक यह खुली है, आपका क्लिकर/रिमोट काम नहीं करेगा। ऑटो-क्लोज़ सेट समय के बाद स्वतः फोकस वापस करता है। विंडो बंद होने के बाद क्लिकर नियंत्रण बहाल हो जाता है। लिंक किए गए कंटेंट को प्रस्तुत करने के लिए आवश्यक समय की योजना बनाएं और टाइमर सेट करें।","autoOpenHint":"सक्षम होने पर, प्रेज़ेंटेशन के दौरान इस स्लाइड पर जाने पर वेब पेज स्वतः खुलता है। \\"वेब पेज दिखाएं\\" मैन्युअली क्लिक करने की ज़रूरत नहीं — स्लाइड दिखने पर व्यूअर तुरंत प्रकट होता है।","howToUse":"उपयोग गाइड","howToUseHint":"दर्शकों की स्क्रीन (प्रोजेक्टर) पर वेब पेज दिखाना:\\n\\n1. स्लाइड शो (Slide Show) शुरू करें।\\n2. Alt+Tab दबाएं, PowerPoint संपादन विंडो (Ribbon के साथ) पर जाएं और उसे छोटा करें (Win+↓)।\\n\\nप्रस्तुतकर्ता दृश्य (Use Presenter View — चालू):\\nदर्शकों को दिखने वाली स्लाइड शो विंडो (Slide Show) में क्लिक करें ताकि उसे फ़ोकस मिले। फिर कीबोर्ड या क्लिकर से स्लाइड बदलें।\\n\\nडुप्लिकेट स्लाइड शो (Duplicate Slide Show — चालू):\\nकोई अतिरिक्त कदम आवश्यक नहीं।\\n\\nएक मॉनिटर: वेब पेज प्रस्तुति के ऊपर खुलेगा।","guideImageTitle":"विकल्प 1: एक छवि का लिंक","guideImageDesc":"अगर आपकी साइट कंटेंट को छवि (.png, .jpg, .webp, .gif, .svg) के रूप में निर्यात कर सकती है, तो छवि फ़ाइल का सीधा URL पेस्ट करें। सर्वर में कोई बदलाव नहीं चाहिए — छवि iframe के बिना दिखती है, स्लाइड दिखाने पर स्वतः रीफ्रेश होती है, और फोकस PowerPoint पर लौटता है।","guideServerTitle":"विकल्प 2: iframe एम्बेडिंग की अनुमति दें"},"ru":{"insertWebPage":"Добавить WebPage.PPT","editPageProperty":"Свойства страницы","enterUrl":"Введите URL","urlPlaceholder":"https://example.com","zoom":"Масштаб","dialogSize":"Размер окна","autoOpen":"Открывать при смене слайда","showWebPage":"Показать WebPage.PPT","ownSiteBlocked":"Это ваш сайт?","showSetupGuide":"Показать инструкцию","openDirectly":"Открыть напрямую (без рамки)","apply":"Применить","cancel":"Отмена","language":"Язык","iframeBlocked":"Сайт блокирует встраивание.","iframeBlockedHint":"Если это ваш сайт — исправляется одной строкой.","noUrl":"Введите корректный URL","noUrlForSlide":"Для этого слайда URL не задан","success":"Настройки сохранены","errorGeneric":"Что-то пошло не так. Попробуйте ещё раз.","dialogAlreadyOpen":"Окно просмотра уже открыто.","dialogBlocked":"Окно заблокировано. Разрешите всплывающие окна для этого сайта.","openInBrowser":"Открыть в браузере","guideTitle":"Как разрешить встраивание","guideIntro":"Добавьте один из фрагментов в конфигурацию сервера, на котором размещена страница:","guideNote":"Перезапустите сервер и обновите слайд после изменений.","copy":"Копировать","copied":"Скопировано!","hideSetupGuide":"Скрыть инструкцию","slideLabel":"Слайд","dialogWidth":"Ширина","dialogHeight":"Высота","lockSize":"Связать пропорции","setAsDefaults":"Сохранить настройки по умолчанию для новых слайдов","defaultsSaved":"Настройки по умолчанию сохранены","siteNotLoading":"Сайт не загружается?","guideMetaNote":"Примечание: frame-ancestors в meta-теге может не сработать, если сервер уже задаёт заголовок X-Frame-Options.","guideFaqTitle":"Частые вопросы","guideFaqXFrameQ":"Что такое X-Frame-Options?","guideFaqXFrameA":"HTTP-заголовок, определяющий, можно ли показывать сайт внутри iframe. Некоторые серверы по умолчанию блокируют встраивание.","guideFaqUnknownServerQ":"Я не знаю, какой у меня сервер","guideFaqUnknownServerA":"Посмотрите файлы проекта: nginx.conf → Nginx, .htaccess → Apache, app.js или server.js → Node.js/Express. На хостинге — спросите провайдера.","guideFaqNoAccessQ":"У меня нет доступа к серверу","guideFaqNoAccessA":"Используйте кнопку «Открыть напрямую» — она откроет страницу в полноценном окне браузера без ограничений iframe.","viewerLoading":"Загрузка страницы…","viewerLoaded":"Страница загружена","viewerBlocked":"Сайт блокирует встраивание","viewerError":"Не удалось загрузить страницу","viewerClosed":"Окно закрыто","help":"Справка","infoTooltip":"Инфо","noInternet":"Нет подключения к интернету. Проверьте соединение и попробуйте снова.","loadTimeout":"Страница загружается слишком долго.","dialogUnsupported":"Ваша версия Office не поддерживает окно просмотра. Обновите Office.","settingsSaveRetryFailed":"Не удалось сохранить настройки. Попробуйте позже.","selectSlide":"Сначала выберите слайд.","urlAutoFixed":"Добавлен протокол https:// к URL.","unitSec":"с","unitMin":"мин","unitHour":"ч","autoOpenDelay":"Открыть через","autoOpenDelayImmediate":"0с","autoClose":"Закрыть через","autoCloseOff":"Выкл","countdownText":"Закроется через {n}с","autoCloseHint":"Окно с веб-страницей перехватывает фокус PowerPoint. Пока оно открыто, кликер/пульт презентации не работает — вы не сможете закрыть слайд или переключиться на другой. Придётся использовать клавиатуру или мышь на компьютере с PowerPoint. Автозакрытие вернёт фокус автоматически через заданное время (всё это время будет транслироваться ссылка, кликер не будет работать). После закрытия окна управление вернётся на кликер. Спланируйте, сколько времени вам нужно на показ содержимого по ссылке, и выставьте это время.","autoOpenHint":"Если включено, веб-страница открывается автоматически при каждом переходе на этот слайд во время презентации. Не нужно нажимать «Показать веб-страницу» вручную — окно появится сразу при показе слайда. Удобно, когда презентация управляется кликером/пультом.","howToUse":"Как пользоваться","howToUseHint":"Показ веб-страницы на экране зрителей (проектор):\\n\\n1. Запустите показ слайдов (Slide Show).\\n2. Нажмите Alt+Tab, перейдите в окно редактирования PowerPoint (с лентой инструментов, Ribbon) и сверните его (Win+↓).\\n\\nРежим докладчика (Presenter View) включён:\\nЩёлкните мышью в окне показа слайдов (Slide Show) — том, которое видят зрители — чтобы передать ему фокус. Затем переключайте слайды клавишами или кликером.\\n\\nДублировать показ слайдов (Duplicate Slide Show) включён:\\nДополнительных действий не нужно.\\n\\nОдин монитор: веб-страница откроется поверх презентации.","guideImageTitle":"Вариант 1: Ссылка на изображение","guideImageDesc":"Если ваш сайт может экспортировать контент как изображение (.png, .jpg, .webp, .gif, .svg), вставьте прямую ссылку на файл. Настройка сервера не нужна — изображение отобразится без iframe, обновится автоматически при каждом переходе на слайд, а фокус вернётся в PowerPoint, и кликер/пульт продолжит работать.","guideServerTitle":"Вариант 2: Разрешить встраивание в iframe"}}');

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
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************************!*\
  !*** ./src/commands/commands.ts ***!
  \**********************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const settings_1 = __webpack_require__(/*! ../shared/settings */ "./src/shared/settings.ts");
const dialog_launcher_1 = __webpack_require__(/*! ../shared/dialog-launcher */ "./src/shared/dialog-launcher.ts");
const i18n_1 = __webpack_require__(/*! ../shared/i18n */ "./src/shared/i18n.ts");
const logger_1 = __webpack_require__(/*! ../shared/logger */ "./src/shared/logger.ts");
// ─── State ───────────────────────────────────────────────────────────────────
const launcher = new dialog_launcher_1.DialogLauncher();
/** Whether PowerPoint is currently in Slideshow ("read") mode. */
let inSlideshow = false;
/** Polling interval handle for slide change detection during slideshow. */
let pollTimer = null;
/** Last known slide ID — used by polling to detect slide changes. */
let lastPollSlideId = null;
/** Guard to prevent overlapping poll ticks. */
let pollBusy = false;
/** How often to check the current slide during slideshow (ms). */
const POLL_INTERVAL_MS = 1500;
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Resolve the ID of the currently selected slide, or `null`. */
async function getCurrentSlideId() {
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
    catch {
        return null;
    }
}
/** Resolve the language to pass to the viewer dialog. */
function resolveLanguage() {
    const savedLang = (0, settings_1.getLanguage)();
    return savedLang ?? (0, i18n_1.parseLocale)(navigator.language);
}
/**
 * Open the viewer dialog for the given slide's config.
 * Closes any existing dialog first to avoid "dialog already open" errors.
 * Returns silently if the slide has no URL configured.
 */
async function openViewerForSlide(slideId) {
    const config = (0, settings_1.getSlideConfig)(slideId);
    if (!config || !config.url)
        return;
    // Close existing dialog before opening a new one
    launcher.close();
    await launcher.open({
        url: config.url,
        zoom: config.zoom,
        width: config.dialogWidth,
        height: config.dialogHeight,
        lang: resolveLanguage(),
        autoCloseSec: config.autoCloseSec,
    });
}
// ─── Ribbon command: Show Web Page ───────────────────────────────────────────
/**
 * Called from the ribbon "Show Web Page" button.
 * Reads the saved config for the current slide and opens the viewer dialog.
 * If no URL is configured, the command completes silently (no Task Pane UI
 * is available in this runtime to show an error).
 */
async function showWebPage(event) {
    try {
        const slideId = await getCurrentSlideId();
        if (slideId) {
            (0, logger_1.logDebug)('Ribbon ShowWebPage for slide:', slideId);
            await openViewerForSlide(slideId);
        }
        else {
            (0, logger_1.logDebug)('ShowWebPage: no slide selected');
        }
    }
    catch (err) {
        (0, logger_1.logError)('ShowWebPage command failed:', err);
    }
    event.completed();
}
// ─── Slideshow polling ──────────────────────────────────────────────────────
/**
 * Poll the current slide during slideshow and auto-open/close the viewer.
 *
 * `DocumentSelectionChanged` does NOT reliably fire during slideshow mode
 * on PowerPoint Desktop — it is an edit-mode event. Polling is the only
 * robust way to detect slide navigation in presentation mode.
 */
async function pollCurrentSlide() {
    if (!inSlideshow || pollBusy)
        return;
    pollBusy = true;
    try {
        const slideId = await getCurrentSlideId();
        if (!slideId)
            return;
        // No change — nothing to do
        if (slideId === lastPollSlideId)
            return;
        (0, logger_1.logDebug)('Slideshow slide changed:', lastPollSlideId, '→', slideId);
        lastPollSlideId = slideId;
        const config = (0, settings_1.getSlideConfig)(slideId);
        if (config?.autoOpen && config.url) {
            (0, logger_1.logDebug)('Auto-opening viewer for slide:', slideId);
            await openViewerForSlide(slideId);
        }
        else {
            // Current slide has no URL or autoOpen is off — close any open dialog
            launcher.close();
        }
    }
    catch (err) {
        (0, logger_1.logError)('Poll slide change failed:', err);
    }
    finally {
        pollBusy = false;
    }
}
/** Start polling for slide changes. Called when entering slideshow. */
function startSlideshowPolling() {
    stopSlideshowPolling();
    lastPollSlideId = null;
    pollBusy = false;
    (0, logger_1.logDebug)('Starting slideshow polling (interval:', POLL_INTERVAL_MS, 'ms)');
    pollTimer = setInterval(() => { pollCurrentSlide(); }, POLL_INTERVAL_MS);
}
/** Stop polling. Called when leaving slideshow. */
function stopSlideshowPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
    lastPollSlideId = null;
}
// ─── Slideshow detection ────────────────────────────────────────────────────
// LIMITATION: PowerPoint Online treats Slideshow as a new session,
// ActiveViewChanged won't fire. Users must use the ribbon button manually.
/**
 * Handles view changes between edit ("edit") and slideshow ("read") modes.
 * - Entering slideshow: starts polling + auto-opens viewer for the first slide.
 * - Leaving slideshow: stops polling + closes any open viewer dialog.
 */
async function handleActiveViewChanged(args) {
    (0, logger_1.logDebug)('ActiveViewChanged:', args.activeView);
    if (args.activeView === 'read') {
        // Entered slideshow mode
        inSlideshow = true;
        try {
            const slideId = await getCurrentSlideId();
            (0, logger_1.logDebug)('Slideshow entered, current slide:', slideId);
            if (slideId) {
                lastPollSlideId = slideId;
                const config = (0, settings_1.getSlideConfig)(slideId);
                if (config?.autoOpen && config.url) {
                    (0, logger_1.logDebug)('Auto-opening viewer for initial slide:', slideId);
                    await openViewerForSlide(slideId);
                }
            }
        }
        catch (err) {
            (0, logger_1.logError)('Auto-open on slideshow enter failed:', err);
        }
        // Start polling for slide changes during slideshow.
        // DocumentSelectionChanged does NOT fire reliably in slideshow mode,
        // so polling is the primary mechanism for detecting slide navigation.
        startSlideshowPolling();
    }
    else {
        // Left slideshow mode (back to "edit")
        (0, logger_1.logDebug)('Slideshow exited');
        inSlideshow = false;
        stopSlideshowPolling();
        launcher.close();
    }
}
// ─── Bootstrap ───────────────────────────────────────────────────────────────
(0, logger_1.installUnhandledRejectionHandler)();
Office.onReady(() => {
    (0, logger_1.logDebug)('Commands runtime ready');
    // Expose the command function on the global scope FIRST.
    // XML manifest looks up <FunctionName>showWebPage</FunctionName> on the global scope.
    // This must happen before anything that could throw.
    globalThis.showWebPage = showWebPage;
    // For unified JSON manifest: associate action IDs with handler functions.
    // Office.actions may not exist in XML-manifest FunctionFile runtimes,
    // so this MUST be wrapped in try/catch to avoid crashing the entire bootstrap.
    try {
        if (Office.actions && typeof Office.actions.associate === 'function') {
            Office.actions.associate('ShowWebPage', showWebPage);
            (0, logger_1.logDebug)('Office.actions.associate registered');
        }
    }
    catch {
        (0, logger_1.logDebug)('Office.actions.associate not available (XML manifest mode)');
    }
    // Listen for view changes (edit ↔ slideshow).
    // LIMITATION: PowerPoint Online treats Slideshow as a new session,
    // ActiveViewChanged won't fire there. Auto-open only works on Desktop.
    try {
        Office.context.document.addHandlerAsync(Office.EventType.ActiveViewChanged, (args) => { handleActiveViewChanged(args); }, (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                (0, logger_1.logDebug)('ActiveViewChanged handler registered');
            }
            else {
                (0, logger_1.logError)('Failed to register ActiveViewChanged:', result.error);
            }
        });
    }
    catch (err) {
        (0, logger_1.logError)('ActiveViewChanged not supported:', err);
    }
    // Also listen for DocumentSelectionChanged as a secondary trigger.
    // This may fire on some Desktop versions during slideshow (undocumented),
    // providing faster detection than polling in those cases.
    try {
        Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, () => {
            if (!inSlideshow)
                return;
            // Let the next poll tick handle it immediately instead of waiting
            pollCurrentSlide();
        });
    }
    catch {
        // DocumentSelectionChanged not supported — polling is the only mechanism
    }
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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bkQsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLHFCQUFRLEVBQUMsdUNBQXVDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xFLENBQUM7UUFDSCxDQUFDLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IscUJBQVEsRUFBQyxrQ0FBa0MsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsbUVBQW1FO0lBQ25FLDBFQUEwRTtJQUMxRSwwREFBMEQ7SUFDMUQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUNyQyxNQUFNLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUN6QyxHQUFHLEVBQUU7WUFDSCxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPO1lBQ3pCLGtFQUFrRTtZQUNsRSxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JCLENBQUMsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLHlFQUF5RTtJQUMzRSxDQUFDO0FBQ0gsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvZGlhbG9nLWxhdW5jaGVyLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL2kxOG4udHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvbG9nZ2VyLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL3NldHRpbmdzLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9jb21tYW5kcy9jb21tYW5kcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyDilIDilIDilIAgU2V0dGluZyBrZXlzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFByZWZpeCBmb3IgcGVyLXNsaWRlIHNldHRpbmcga2V5cy4gRnVsbCBrZXk6IGB3ZWJwcHRfc2xpZGVfe3NsaWRlSWR9YC4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX1NMSURFX1BSRUZJWCA9ICd3ZWJwcHRfc2xpZGVfJztcclxuXHJcbi8qKiBLZXkgZm9yIHRoZSBzYXZlZCBVSSBsYW5ndWFnZS4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX0xBTkdVQUdFID0gJ3dlYnBwdF9sYW5ndWFnZSc7XHJcblxyXG4vKiogS2V5IGZvciBnbG9iYWwgZGVmYXVsdCBzbGlkZSBjb25maWcuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9ERUZBVUxUUyA9ICd3ZWJwcHRfZGVmYXVsdHMnO1xyXG5cclxuLy8g4pSA4pSA4pSAIFZpZXdlciBkZWZhdWx0cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1pPT00gPSAxMDA7XHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0RJQUxPR19XSURUSCA9IDEwMDsgICAvLyAlIG9mIHNjcmVlblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9ESUFMT0dfSEVJR0hUID0gMTAwOyAgLy8gJSBvZiBzY3JlZW5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19PUEVOID0gdHJ1ZTtcclxuXHJcbi8vIOKUgOKUgOKUgCBDb25zdHJhaW50IHJhbmdlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBaT09NX01JTiA9IDUwO1xyXG5leHBvcnQgY29uc3QgWk9PTV9NQVggPSAzMDA7XHJcblxyXG4vLyDilIDilIDilIAgQXV0by1vcGVuIGRlbGF5IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19PUEVOX0RFTEFZX1NFQyA9IDA7ICAgLy8gMCA9IGltbWVkaWF0ZVxyXG5cclxuLyoqXHJcbiAqIE5vbi1saW5lYXIgbG9va3VwIHRhYmxlIGZvciB0aGUgYXV0by1vcGVuIGRlbGF5IHNsaWRlci5cclxuICogSW5kZXggPSBzbGlkZXIgcG9zaXRpb24sIHZhbHVlID0gc2Vjb25kcy5cclxuICogUmFuZ2U6IDDigJM2MHMuIEdyYW51bGFyaXR5OiAxcyB1cCB0byAxMHMsIHRoZW4gNXMgdXAgdG8gMzBzLCB0aGVuIDEwcyB1cCB0byA2MHMuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQVVUT19PUEVOX0RFTEFZX1NURVBTOiByZWFkb25seSBudW1iZXJbXSA9IFtcclxuICAvLyAw4oCTMTBzLCBzdGVwIDEgICgxMSB2YWx1ZXM6IGluZGljZXMgMOKAkzEwKVxyXG4gIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLFxyXG4gIC8vIDEw4oCTNjBzLCBzdGVwIDUgICgxMCB2YWx1ZXM6IGluZGljZXMgMTHigJMyMClcclxuICAxNSwgMjAsIDI1LCAzMCwgMzUsIDQwLCA0NSwgNTAsIDU1LCA2MCxcclxuICAvLyAx4oCTMyBtaW4sIHN0ZXAgMTVzICAoOCB2YWx1ZXM6IGluZGljZXMgMjHigJMyOClcclxuICA3NSwgOTAsIDEwNSwgMTIwLCAxMzUsIDE1MCwgMTY1LCAxODAsXHJcbiAgLy8gM+KAkzUgbWluLCBzdGVwIDMwcyAgKDQgdmFsdWVzOiBpbmRpY2VzIDI54oCTMzIpXHJcbiAgMjEwLCAyNDAsIDI3MCwgMzAwLFxyXG5dO1xyXG5cclxuLy8g4pSA4pSA4pSAIEF1dG8tY2xvc2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRPX0NMT1NFX1NFQyA9IDA7ICAgLy8gMCA9IGRpc2FibGVkXHJcbmV4cG9ydCBjb25zdCBBVVRPX0NMT1NFX01BWF9TRUMgPSAzNjAwO1xyXG5cclxuLyoqXHJcbiAqIE5vbi1saW5lYXIgbG9va3VwIHRhYmxlIGZvciB0aGUgYXV0by1jbG9zZSBzbGlkZXIuXHJcbiAqIEluZGV4ID0gc2xpZGVyIHBvc2l0aW9uLCB2YWx1ZSA9IHNlY29uZHMuXHJcbiAqIEdyYW51bGFyaXR5IGRlY3JlYXNlcyBhcyB2YWx1ZXMgZ3JvdzogMXMg4oaSIDVzIOKGkiAxNXMg4oaSIDMwcyDihpIgNjBzIOKGkiAzMDBzLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEFVVE9fQ0xPU0VfU1RFUFM6IHJlYWRvbmx5IG51bWJlcltdID0gW1xyXG4gIC8vIDDigJMxMHMsIHN0ZXAgMSAgKDExIHZhbHVlcylcclxuICAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCxcclxuICAvLyAxMOKAkzYwcywgc3RlcCA1ICAoMTAgdmFsdWVzKVxyXG4gIDE1LCAyMCwgMjUsIDMwLCAzNSwgNDAsIDQ1LCA1MCwgNTUsIDYwLFxyXG4gIC8vIDHigJMzIG1pbiwgc3RlcCAxNXMgICg4IHZhbHVlcylcclxuICA3NSwgOTAsIDEwNSwgMTIwLCAxMzUsIDE1MCwgMTY1LCAxODAsXHJcbiAgLy8gM+KAkzUgbWluLCBzdGVwIDMwcyAgKDQgdmFsdWVzKVxyXG4gIDIxMCwgMjQwLCAyNzAsIDMwMCxcclxuICAvLyA14oCTMTAgbWluLCBzdGVwIDYwcyAgKDUgdmFsdWVzKVxyXG4gIDM2MCwgNDIwLCA0ODAsIDU0MCwgNjAwLFxyXG4gIC8vIDEw4oCTNjAgbWluLCBzdGVwIDMwMHMgICgxMCB2YWx1ZXMpXHJcbiAgOTAwLCAxMjAwLCAxNTAwLCAxODAwLCAyMTAwLCAyNDAwLCAyNzAwLCAzMDAwLCAzMzAwLCAzNjAwLFxyXG5dO1xyXG5cclxuLy8g4pSA4pSA4pSAIEVycm9yIGhhbmRsaW5nIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMgPSAyO1xyXG5leHBvcnQgY29uc3QgU0VUVElOR1NfU0FWRV9SRVRSWV9ERUxBWV9NUyA9IDEwMDA7XHJcbmV4cG9ydCBjb25zdCBJRlJBTUVfTE9BRF9USU1FT1VUX01TID0gMTBfMDAwO1xyXG5leHBvcnQgY29uc3QgVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCA9IDYwO1xyXG5cclxuLyoqIFRydW5jYXRlIGEgVVJMIGZvciBkaXNwbGF5LCBhcHBlbmRpbmcgZWxsaXBzaXMgaWYgbmVlZGVkLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJ1bmNhdGVVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGlmICh1cmwubGVuZ3RoIDw9IFVSTF9ESVNQTEFZX01BWF9MRU5HVEgpIHJldHVybiB1cmw7XHJcbiAgcmV0dXJuIHVybC5zdWJzdHJpbmcoMCwgVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCAtIDEpICsgJ1xcdTIwMjYnO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVidWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogU2V0IHRvIGBmYWxzZWAgaW4gcHJvZHVjdGlvbiBidWlsZHMgdmlhIHdlYnBhY2sgRGVmaW5lUGx1Z2luLlxyXG4gKiBGYWxscyBiYWNrIHRvIGB0cnVlYCBzbyBkZXYvdGVzdCBydW5zIGFsd2F5cyBsb2cuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVCVUc6IGJvb2xlYW4gPVxyXG4gIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcHJvY2Vzcy5lbnYgIT09ICd1bmRlZmluZWQnXHJcbiAgICA/IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbidcclxuICAgIDogdHJ1ZTtcclxuIiwiaW1wb3J0IHsgaTE4biwgdHlwZSBUcmFuc2xhdGlvbktleSB9IGZyb20gJy4vaTE4bic7XHJcbmltcG9ydCB7IGxvZ0RlYnVnLCBsb2dFcnJvciB9IGZyb20gJy4vbG9nZ2VyJztcclxuXHJcbi8vIOKUgOKUgOKUgCBDb25zdGFudHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogRmlsZW5hbWUgb2YgdGhlIHZpZXdlciBwYWdlIGJ1aWx0IGJ5IHdlYnBhY2suICovXHJcbmV4cG9ydCBjb25zdCBWSUVXRVJfUEFHRSA9ICd2aWV3ZXIuaHRtbCc7XHJcblxyXG4vKiogT2ZmaWNlIGRpc3BsYXlEaWFsb2dBc3luYyBlcnJvciBjb2Rlcy4gKi9cclxuY29uc3QgT1BFTl9FUlIgPSB7XHJcbiAgLyoqIEEgZGlhbG9nIGlzIGFscmVhZHkgb3BlbmVkIGZyb20gdGhpcyBhZGQtaW4uICovXHJcbiAgQUxSRUFEWV9PUEVORUQ6IDEyMDA3LFxyXG4gIC8qKiBVc2VyIGRpc21pc3NlZCB0aGUgZGlhbG9nIHByb21wdCAvIHBvcHVwIGJsb2NrZXIuICovXHJcbiAgUE9QVVBfQkxPQ0tFRDogMTIwMDksXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyDilIDilIDilIAgVHlwZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpYWxvZ0NvbmZpZyB7XHJcbiAgdXJsOiBzdHJpbmc7XHJcbiAgem9vbTogbnVtYmVyO1xyXG4gIHdpZHRoOiBudW1iZXI7ICAgLy8gJSBvZiBzY3JlZW4gKDEw4oCTMTAwKVxyXG4gIGhlaWdodDogbnVtYmVyOyAgLy8gJSBvZiBzY3JlZW4gKDEw4oCTMTAwKVxyXG4gIGxhbmc6IHN0cmluZztcclxuICBhdXRvQ2xvc2VTZWM/OiBudW1iZXI7ICAvLyAwIG9yIHVuZGVmaW5lZCA9IGRpc2FibGVkXHJcbiAgc2xpZGVzaG93PzogYm9vbGVhbjsgICAgLy8gdHJ1ZSA9IGRpYWxvZyBpcyBpbiBzbGlkZXNob3cgbW9kZSAoZG9uJ3QgYWN0dWFsbHkgY2xvc2Ugb24gdGltZXIpXHJcbiAgaGlkZU1ldGhvZD86ICdub25lJyB8ICdtb3ZlJyB8ICdyZXNpemUnOyAgLy8gaG93IHRvIGhpZGUgZGlhbG9nIGFmdGVyIHRpbWVyIGluIHNsaWRlc2hvd1xyXG59XHJcblxyXG4vKiogVHlwZWQgZXJyb3IgdGhyb3duIGJ5IHtAbGluayBEaWFsb2dMYXVuY2hlcn0uICovXHJcbmV4cG9ydCBjbGFzcyBEaWFsb2dFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyByZWFkb25seSBpMThuS2V5OiBUcmFuc2xhdGlvbktleSxcclxuICAgIHB1YmxpYyByZWFkb25seSBvZmZpY2VDb2RlPzogbnVtYmVyLFxyXG4gICkge1xyXG4gICAgc3VwZXIoaTE4bi50KGkxOG5LZXkpKTtcclxuICAgIHRoaXMubmFtZSA9ICdEaWFsb2dFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgREkgaW50ZXJmYWNlcyAodGVzdGFibGUgd2l0aG91dCBPZmZpY2UgcnVudGltZSkg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogTWluaW1hbCBzdWJzZXQgb2YgT2ZmaWNlLkRpYWxvZyB1c2VkIGJ5IHRoaXMgbW9kdWxlLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE9mZmljZURpYWxvZyB7XHJcbiAgY2xvc2UoKTogdm9pZDtcclxuICBhZGRFdmVudEhhbmRsZXIoXHJcbiAgICBldmVudFR5cGU6IHN0cmluZyxcclxuICAgIGhhbmRsZXI6IChhcmc6IHsgbWVzc2FnZT86IHN0cmluZzsgZXJyb3I/OiBudW1iZXIgfSkgPT4gdm9pZCxcclxuICApOiB2b2lkO1xyXG4gIC8qKiBTZW5kIGEgbWVzc2FnZSBmcm9tIGhvc3QgdG8gZGlhbG9nIChEaWFsb2dBcGkgMS4yKykuIE1heSBub3QgZXhpc3Qgb24gb2xkZXIgT2ZmaWNlLiAqL1xyXG4gIG1lc3NhZ2VDaGlsZD8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcclxufVxyXG5cclxuaW50ZXJmYWNlIERpYWxvZ09wZW5SZXN1bHQge1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG4gIHZhbHVlOiBPZmZpY2VEaWFsb2c7XHJcbiAgZXJyb3I6IHsgY29kZTogbnVtYmVyOyBtZXNzYWdlOiBzdHJpbmcgfTtcclxufVxyXG5cclxuLyoqIE1pbmltYWwgc3Vic2V0IG9mIE9mZmljZS5jb250ZXh0LnVpIG5lZWRlZCBmb3IgZGlhbG9nIG9wZXJhdGlvbnMuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nQXBpIHtcclxuICBkaXNwbGF5RGlhbG9nQXN5bmMoXHJcbiAgICBzdGFydEFkZHJlc3M6IHN0cmluZyxcclxuICAgIG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgY2FsbGJhY2s6IChyZXN1bHQ6IERpYWxvZ09wZW5SZXN1bHQpID0+IHZvaWQsXHJcbiAgKTogdm9pZDtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlcGVuZGVuY3kgaW5qZWN0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxubGV0IF9pbmplY3RlZEFwaTogRGlhbG9nQXBpIHwgbnVsbCA9IG51bGw7XHJcbmxldCBfaW5qZWN0ZWRCYXNlVXJsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSB0aGUgT2ZmaWNlIGRpYWxvZyBBUEkuIFBhc3MgYG51bGxgIHRvIHJlc3RvcmUgdGhlIHJlYWwgb25lLlxyXG4gKiBAaW50ZXJuYWwgVXNlZCBpbiB1bml0IHRlc3RzIG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX2luamVjdERpYWxvZ0FwaShhcGk6IERpYWxvZ0FwaSB8IG51bGwpOiB2b2lkIHtcclxuICBfaW5qZWN0ZWRBcGkgPSBhcGk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSB0aGUgdmlld2VyIGJhc2UgVVJMLiBQYXNzIGBudWxsYCB0byByZXN0b3JlIGF1dG8tZGV0ZWN0aW9uLlxyXG4gKiBAaW50ZXJuYWwgVXNlZCBpbiB1bml0IHRlc3RzIG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX2luamVjdEJhc2VVcmwodXJsOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XHJcbiAgX2luamVjdGVkQmFzZVVybCA9IHVybDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXBpKCk6IERpYWxvZ0FwaSB7XHJcbiAgaWYgKF9pbmplY3RlZEFwaSkgcmV0dXJuIF9pbmplY3RlZEFwaTtcclxuICByZXR1cm4gT2ZmaWNlLmNvbnRleHQudWkgYXMgdW5rbm93biBhcyBEaWFsb2dBcGk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFZpZXdlckJhc2VVcmwoKTogc3RyaW5nIHtcclxuICBpZiAoX2luamVjdGVkQmFzZVVybCkgcmV0dXJuIF9pbmplY3RlZEJhc2VVcmw7XHJcbiAgY29uc3QgZGlyID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teL10qJC8sICcnKTtcclxuICByZXR1cm4gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke2Rpcn0vJHtWSUVXRVJfUEFHRX1gO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGlhbG9nTGF1bmNoZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY2xhc3MgRGlhbG9nTGF1bmNoZXIge1xyXG4gIHByaXZhdGUgZGlhbG9nOiBPZmZpY2VEaWFsb2cgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIG1lc3NhZ2VDYWxsYmFjazogKChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBjbG9zZWRDYWxsYmFjazogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8qKiBCdWlsZCB0aGUgZnVsbCB2aWV3ZXIgVVJMIHdpdGggcXVlcnkgcGFyYW1ldGVycy4gKi9cclxuICBwcml2YXRlIGJ1aWxkVmlld2VyVXJsKGNvbmZpZzogRGlhbG9nQ29uZmlnKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xyXG4gICAgICB1cmw6IGNvbmZpZy51cmwsXHJcbiAgICAgIHpvb206IFN0cmluZyhjb25maWcuem9vbSksXHJcbiAgICAgIGxhbmc6IGNvbmZpZy5sYW5nLFxyXG4gICAgfSk7XHJcbiAgICBpZiAoY29uZmlnLmF1dG9DbG9zZVNlYyAmJiBjb25maWcuYXV0b0Nsb3NlU2VjID4gMCkge1xyXG4gICAgICBwYXJhbXMuc2V0KCdhdXRvY2xvc2UnLCBTdHJpbmcoY29uZmlnLmF1dG9DbG9zZVNlYykpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5zbGlkZXNob3cpIHtcclxuICAgICAgcGFyYW1zLnNldCgnc2xpZGVzaG93JywgJzEnKTtcclxuICAgIH1cclxuICAgIGlmIChjb25maWcuaGlkZU1ldGhvZCAmJiBjb25maWcuaGlkZU1ldGhvZCAhPT0gJ25vbmUnKSB7XHJcbiAgICAgIHBhcmFtcy5zZXQoJ2hpZGUnLCBjb25maWcuaGlkZU1ldGhvZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYCR7Z2V0Vmlld2VyQmFzZVVybCgpfT8ke3BhcmFtcy50b1N0cmluZygpfWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPcGVuIHRoZSB2aWV3ZXIgZGlhbG9nIHdpdGggdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXHJcbiAgICogSWYgYSBkaWFsb2cgaXMgYWxyZWFkeSBvcGVuLCBjbG9zZXMgaXQgZmlyc3QgYW5kIHJlb3BlbnMuXHJcbiAgICogUmVqZWN0cyB3aXRoIHtAbGluayBEaWFsb2dFcnJvcn0gaWYgdGhlIGRpYWxvZyBjYW5ub3QgYmUgb3BlbmVkLlxyXG4gICAqL1xyXG4gIGFzeW5jIG9wZW4oY29uZmlnOiBEaWFsb2dDb25maWcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIC8vIEF1dG8tY2xvc2UgYW55IGV4aXN0aW5nIGRpYWxvZyBiZWZvcmUgb3BlbmluZyBhIG5ldyBvbmVcclxuICAgIGlmICh0aGlzLmRpYWxvZykge1xyXG4gICAgICBsb2dEZWJ1ZygnQ2xvc2luZyBleGlzdGluZyBkaWFsb2cgYmVmb3JlIG9wZW5pbmcgYSBuZXcgb25lJyk7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHdWFyZDogY2hlY2sgdGhhdCBkaXNwbGF5RGlhbG9nQXN5bmMgaXMgYXZhaWxhYmxlXHJcbiAgICBjb25zdCBhcGkgPSBnZXRBcGkoKTtcclxuICAgIGlmICghYXBpIHx8IHR5cGVvZiBhcGkuZGlzcGxheURpYWxvZ0FzeW5jICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBEaWFsb2dFcnJvcignZGlhbG9nVW5zdXBwb3J0ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3ZXJVcmwgPSB0aGlzLmJ1aWxkVmlld2VyVXJsKGNvbmZpZyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudHJ5T3BlbihhcGksIHZpZXdlclVybCwgY29uZmlnLCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRlbXB0IHRvIG9wZW4gdGhlIGRpYWxvZy4gSWYgT2ZmaWNlIHJldHVybnMgMTIwMDcgKGFscmVhZHkgb3BlbmVkKVxyXG4gICAqIG9uIHRoZSBmaXJzdCB0cnksIHdhaXQgYnJpZWZseSBhbmQgcmV0cnkgb25jZSDigJQgdGhlIHByZXZpb3VzIGNsb3NlKClcclxuICAgKiBtYXkgbm90IGhhdmUgZnVsbHkgcHJvcGFnYXRlZCB5ZXQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlPcGVuKFxyXG4gICAgYXBpOiBEaWFsb2dBcGksXHJcbiAgICB2aWV3ZXJVcmw6IHN0cmluZyxcclxuICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnLFxyXG4gICAgaXNSZXRyeTogYm9vbGVhbixcclxuICApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGFwaS5kaXNwbGF5RGlhbG9nQXN5bmMoXHJcbiAgICAgICAgdmlld2VyVXJsLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHdpZHRoOiBjb25maWcud2lkdGgsXHJcbiAgICAgICAgICBoZWlnaHQ6IGNvbmZpZy5oZWlnaHQsXHJcbiAgICAgICAgICBkaXNwbGF5SW5JZnJhbWU6IGZhbHNlLFxyXG4gICAgICAgICAgcHJvbXB0QmVmb3JlT3BlbjogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcclxuICAgICAgICAgICAgLy8gT24gZmlyc3QgYXR0ZW1wdCwgaWYgT2ZmaWNlIHNheXMgXCJhbHJlYWR5IG9wZW5lZFwiLCByZXRyeSBvbmNlXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuZXJyb3IuY29kZSA9PT0gT1BFTl9FUlIuQUxSRUFEWV9PUEVORUQgJiYgIWlzUmV0cnkpIHtcclxuICAgICAgICAgICAgICBsb2dEZWJ1ZygnR290IDEyMDA3IChhbHJlYWR5IG9wZW5lZCkg4oCUIHJldHJ5aW5nIGFmdGVyIGRlbGF5Jyk7XHJcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyeU9wZW4oYXBpLCB2aWV3ZXJVcmwsIGNvbmZpZywgdHJ1ZSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxvZ0Vycm9yKCdkaXNwbGF5RGlhbG9nQXN5bmMgZmFpbGVkOicsIHJlc3VsdC5lcnJvci5jb2RlLCByZXN1bHQuZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHJlamVjdCh0aGlzLm1hcE9wZW5FcnJvcihyZXN1bHQuZXJyb3IuY29kZSkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5kaWFsb2cgPSByZXN1bHQudmFsdWU7XHJcblxyXG4gICAgICAgICAgdGhpcy5kaWFsb2cuYWRkRXZlbnRIYW5kbGVyKFxyXG4gICAgICAgICAgICAnZGlhbG9nTWVzc2FnZVJlY2VpdmVkJyxcclxuICAgICAgICAgICAgKGFyZykgPT4gdGhpcy5oYW5kbGVNZXNzYWdlKGFyZyksXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIHRoaXMuZGlhbG9nLmFkZEV2ZW50SGFuZGxlcihcclxuICAgICAgICAgICAgJ2RpYWxvZ0V2ZW50UmVjZWl2ZWQnLFxyXG4gICAgICAgICAgICAoYXJnKSA9PiB0aGlzLmhhbmRsZUV2ZW50KGFyZyksXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIGxvZ0RlYnVnKCdEaWFsb2cgb3BlbmVkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBDbG9zZSB0aGUgZGlhbG9nIGlmIGl0IGlzIG9wZW4uIFNhZmUgdG8gY2FsbCB3aGVuIGFscmVhZHkgY2xvc2VkLiAqL1xyXG4gIGNsb3NlKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmRpYWxvZykgcmV0dXJuO1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5kaWFsb2cuY2xvc2UoKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBsb2dFcnJvcignRXJyb3IgY2xvc2luZyBkaWFsb2c6JywgZXJyKTtcclxuICAgIH1cclxuICAgIHRoaXMuZGlhbG9nID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbmQgYSBtZXNzYWdlIGZyb20gdGhlIGhvc3QgKHRhc2twYW5lL2NvbW1hbmRzKSB0byB0aGUgZGlhbG9nLlxyXG4gICAqIFVzZXMgRGlhbG9nQXBpIDEuMiBgbWVzc2FnZUNoaWxkKClgLiBSZXR1cm5zIGZhbHNlIGlmIG5vdCBzdXBwb3J0ZWQuXHJcbiAgICovXHJcbiAgc2VuZE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXRoaXMuZGlhbG9nKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGlhbG9nLm1lc3NhZ2VDaGlsZCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBsb2dEZWJ1ZygnbWVzc2FnZUNoaWxkIG5vdCBhdmFpbGFibGUgb24gdGhpcyBPZmZpY2UgdmVyc2lvbicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLmRpYWxvZy5tZXNzYWdlQ2hpbGQobWVzc2FnZSk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdtZXNzYWdlQ2hpbGQgZmFpbGVkOicsIGVycik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBkaWFsb2cgaXMgY3VycmVudGx5IG9wZW4uICovXHJcbiAgaXNPcGVuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlhbG9nICE9PSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIFN1YnNjcmliZSB0byBtZXNzYWdlcyBzZW50IGZyb20gdGhlIHZpZXdlciB2aWEgYE9mZmljZS5jb250ZXh0LnVpLm1lc3NhZ2VQYXJlbnRgLiAqL1xyXG4gIG9uTWVzc2FnZShjYWxsYmFjazogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5tZXNzYWdlQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICB9XHJcblxyXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIGRpYWxvZyBiZWluZyBjbG9zZWQgKGJ5IHVzZXIgb3IgbmF2aWdhdGlvbiBlcnJvcikuICovXHJcbiAgb25DbG9zZWQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMuY2xvc2VkQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICB9XHJcblxyXG4gIC8vIOKUgOKUgOKUgCBQcml2YXRlIGhhbmRsZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuICBwcml2YXRlIGhhbmRsZU1lc3NhZ2UoYXJnOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSk6IHZvaWQge1xyXG4gICAgaWYgKGFyZy5tZXNzYWdlICYmIHRoaXMubWVzc2FnZUNhbGxiYWNrKSB7XHJcbiAgICAgIHRoaXMubWVzc2FnZUNhbGxiYWNrKGFyZy5tZXNzYWdlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRXZlbnQoYXJnOiB7IGVycm9yPzogbnVtYmVyIH0pOiB2b2lkIHtcclxuICAgIC8vIEFsbCBEaWFsb2dFdmVudFJlY2VpdmVkIGNvZGVzICgxMjAwMiBjbG9zZWQsIDEyMDAzIG1peGVkIGNvbnRlbnQsXHJcbiAgICAvLyAxMjAwNiBjcm9zcy1kb21haW4pIG1lYW4gdGhlIGRpYWxvZyBpcyBubyBsb25nZXIgdXNhYmxlLlxyXG4gICAgbG9nRGVidWcoJ0RpYWxvZyBldmVudCByZWNlaXZlZCwgY29kZTonLCBhcmcuZXJyb3IpO1xyXG4gICAgdGhpcy5kaWFsb2cgPSBudWxsO1xyXG4gICAgaWYgKHRoaXMuY2xvc2VkQ2FsbGJhY2spIHtcclxuICAgICAgdGhpcy5jbG9zZWRDYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtYXBPcGVuRXJyb3IoY29kZTogbnVtYmVyKTogRGlhbG9nRXJyb3Ige1xyXG4gICAgc3dpdGNoIChjb2RlKSB7XHJcbiAgICAgIGNhc2UgT1BFTl9FUlIuQUxSRUFEWV9PUEVORUQ6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2dFcnJvcignZGlhbG9nQWxyZWFkeU9wZW4nLCBjb2RlKTtcclxuICAgICAgY2FzZSBPUEVOX0VSUi5QT1BVUF9CTE9DS0VEOlxyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nRXJyb3IoJ2RpYWxvZ0Jsb2NrZWQnLCBjb2RlKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gbmV3IERpYWxvZ0Vycm9yKCdlcnJvckdlbmVyaWMnLCBjb2RlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IGxvY2FsZXNEYXRhIGZyb20gJy4uL2kxOG4vbG9jYWxlcy5qc29uJztcclxuXHJcbmV4cG9ydCB0eXBlIExvY2FsZSA9ICdlbicgfCAnemgnIHwgJ2VzJyB8ICdkZScgfCAnZnInIHwgJ2l0JyB8ICdhcicgfCAncHQnIHwgJ2hpJyB8ICdydSc7XHJcbmV4cG9ydCB0eXBlIFRyYW5zbGF0aW9uS2V5ID0ga2V5b2YgdHlwZW9mIGxvY2FsZXNEYXRhWydlbiddO1xyXG5cclxuLyoqIE1hcHMgYSBCQ1AgNDcgbGFuZ3VhZ2UgdGFnIHRvIGEgc3VwcG9ydGVkIExvY2FsZS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTG9jYWxlKGxhbmdUYWc6IHN0cmluZyk6IExvY2FsZSB7XHJcbiAgY29uc3QgdGFnID0gbGFuZ1RhZy50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnemgnKSkgcmV0dXJuICd6aCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdlcycpKSByZXR1cm4gJ2VzJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2RlJykpIHJldHVybiAnZGUnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnZnInKSkgcmV0dXJuICdmcic7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdpdCcpKSByZXR1cm4gJ2l0JztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2FyJykpIHJldHVybiAnYXInO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgncHQnKSkgcmV0dXJuICdwdCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdoaScpKSByZXR1cm4gJ2hpJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3J1JykpIHJldHVybiAncnUnO1xyXG4gIHJldHVybiAnZW4nO1xyXG59XHJcblxyXG5jbGFzcyBJMThuIHtcclxuICBwcml2YXRlIGxvY2FsZTogTG9jYWxlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGlzdGVuZXJzID0gbmV3IFNldDwoKSA9PiB2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMubG9jYWxlID0gdGhpcy5kZXRlY3RMb2NhbGUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGV0ZWN0TG9jYWxlKCk6IExvY2FsZSB7XHJcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiAnZW4nO1xyXG4gICAgcmV0dXJuIHBhcnNlTG9jYWxlKG5hdmlnYXRvci5sYW5ndWFnZSA/PyAnZW4nKTtcclxuICB9XHJcblxyXG4gIC8qKiBUcmFuc2xhdGUgYSBrZXkgaW4gdGhlIGN1cnJlbnQgbG9jYWxlLiBGYWxscyBiYWNrIHRvIEVuZ2xpc2gsIHRoZW4gdGhlIGtleSBpdHNlbGYuICovXHJcbiAgdChrZXk6IFRyYW5zbGF0aW9uS2V5KTogc3RyaW5nIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIGxvY2FsZXNEYXRhW3RoaXMubG9jYWxlXVtrZXldID8/XHJcbiAgICAgIGxvY2FsZXNEYXRhWydlbiddW2tleV0gPz9cclxuICAgICAga2V5XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZ2V0TG9jYWxlKCk6IExvY2FsZSB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2NhbGU7XHJcbiAgfVxyXG5cclxuICBnZXRBdmFpbGFibGVMb2NhbGVzKCk6IExvY2FsZVtdIHtcclxuICAgIHJldHVybiBbJ2VuJywgJ3poJywgJ2VzJywgJ2RlJywgJ2ZyJywgJ2l0JywgJ2FyJywgJ3B0JywgJ2hpJywgJ3J1J107XHJcbiAgfVxyXG5cclxuICAvKiogU3dpdGNoIGxvY2FsZSBhbmQgbm90aWZ5IGFsbCBsaXN0ZW5lcnMuICovXHJcbiAgc2V0TG9jYWxlKGxvY2FsZTogTG9jYWxlKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5sb2NhbGUgPT09IGxvY2FsZSkgcmV0dXJuO1xyXG4gICAgdGhpcy5sb2NhbGUgPSBsb2NhbGU7XHJcbiAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdWJzY3JpYmUgdG8gbG9jYWxlIGNoYW5nZXMuXHJcbiAgICogQHJldHVybnMgVW5zdWJzY3JpYmUgZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgb25Mb2NhbGVDaGFuZ2UobGlzdGVuZXI6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcclxuICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XHJcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBTaW5nbGV0b24gaTE4biBpbnN0YW5jZSBzaGFyZWQgYWNyb3NzIHRoZSBhZGQtaW4uICovXHJcbmV4cG9ydCBjb25zdCBpMThuID0gbmV3IEkxOG4oKTtcclxuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tICcuL2NvbnN0YW50cyc7XHJcblxyXG5jb25zdCBQUkVGSVggPSAnW1dlYlBQVF0nO1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xyXG5cclxuLyoqIExvZyBkZWJ1ZyBpbmZvIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0RlYnVnKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS5sb2coUFJFRklYLCAuLi5hcmdzKTtcclxufVxyXG5cclxuLyoqIExvZyB3YXJuaW5ncyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dXYXJuKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS53YXJuKFBSRUZJWCwgLi4uYXJncyk7XHJcbn1cclxuXHJcbi8qKiBMb2cgZXJyb3JzIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0Vycm9yKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS5lcnJvcihQUkVGSVgsIC4uLmFyZ3MpO1xyXG59XHJcblxyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cclxuXHJcbi8qKlxyXG4gKiBJbnN0YWxsIGEgZ2xvYmFsIGhhbmRsZXIgZm9yIHVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbnMuXHJcbiAqIENhbGwgb25jZSBwZXIgZW50cnkgcG9pbnQgKHRhc2twYW5lLCB2aWV3ZXIsIGNvbW1hbmRzKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlcigpOiB2b2lkIHtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgKGV2ZW50OiBQcm9taXNlUmVqZWN0aW9uRXZlbnQpID0+IHtcclxuICAgIGxvZ0Vycm9yKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb246JywgZXZlbnQucmVhc29uKTtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcbn1cclxuIiwiaW1wb3J0IHR5cGUgeyBMb2NhbGUgfSBmcm9tICcuL2kxOG4nO1xyXG5pbXBvcnQge1xyXG4gIFNFVFRJTkdfS0VZX1NMSURFX1BSRUZJWCxcclxuICBTRVRUSU5HX0tFWV9MQU5HVUFHRSxcclxuICBTRVRUSU5HX0tFWV9ERUZBVUxUUyxcclxuICBERUZBVUxUX1pPT00sXHJcbiAgREVGQVVMVF9ESUFMT0dfV0lEVEgsXHJcbiAgREVGQVVMVF9ESUFMT0dfSEVJR0hULFxyXG4gIERFRkFVTFRfQVVUT19PUEVOLFxyXG4gIERFRkFVTFRfQVVUT19DTE9TRV9TRUMsXHJcbiAgREVGQVVMVF9BVVRPX09QRU5fREVMQVlfU0VDLFxyXG4gIFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMsXHJcbiAgU0VUVElOR1NfU0FWRV9SRVRSWV9ERUxBWV9NUyxcclxufSBmcm9tICcuL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7IGxvZ0RlYnVnLCBsb2dFcnJvciB9IGZyb20gJy4vbG9nZ2VyJztcclxuXHJcbi8vIOKUgOKUgOKUgCBUeXBlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgV2ViUFBUU2xpZGVDb25maWcge1xyXG4gIHVybDogc3RyaW5nO1xyXG4gIHpvb206IG51bWJlcjsgICAgICAgICAgLy8gNTDigJMzMDBcclxuICBkaWFsb2dXaWR0aDogbnVtYmVyOyAgIC8vIDMw4oCTMTAwICglIG9mIHNjcmVlbilcclxuICBkaWFsb2dIZWlnaHQ6IG51bWJlcjsgIC8vIDMw4oCTMTAwICglIG9mIHNjcmVlbilcclxuICBhdXRvT3BlbjogYm9vbGVhbjtcclxuICBhdXRvT3BlbkRlbGF5U2VjOiBudW1iZXI7ICAvLyAwID0gaW1tZWRpYXRlLCAx4oCTNjAgc2Vjb25kcyBkZWxheSBiZWZvcmUgb3BlbmluZ1xyXG4gIGF1dG9DbG9zZVNlYzogbnVtYmVyOyAgLy8gMCA9IGRpc2FibGVkLCAx4oCTNjAgc2Vjb25kc1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU2F2ZVJlc3VsdCB7XHJcbiAgc3RhdHVzOiBzdHJpbmc7XHJcbiAgZXJyb3I6IHsgbWVzc2FnZTogc3RyaW5nIH0gfCBudWxsO1xyXG59XHJcblxyXG4vKiogTWluaW1hbCBzdWJzZXQgb2YgT2ZmaWNlLlNldHRpbmdzIHVzZWQgYnkgdGhpcyBtb2R1bGUuICovXHJcbmludGVyZmFjZSBTZXR0aW5nc1N0b3JlIHtcclxuICBnZXQobmFtZTogc3RyaW5nKTogdW5rbm93bjtcclxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQ7XHJcbiAgcmVtb3ZlKG5hbWU6IHN0cmluZyk6IHZvaWQ7XHJcbiAgc2F2ZUFzeW5jKGNhbGxiYWNrOiAocmVzdWx0OiBTYXZlUmVzdWx0KSA9PiB2b2lkKTogdm9pZDtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlcGVuZGVuY3kgaW5qZWN0aW9uIChmb3IgdGVzdGluZykg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5sZXQgX2luamVjdGVkU3RvcmU6IFNldHRpbmdzU3RvcmUgfCBudWxsID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSB0aGUgT2ZmaWNlIHNldHRpbmdzIHN0b3JlLiBQYXNzIGBudWxsYCB0byByZXN0b3JlIHRoZSByZWFsIG9uZS5cclxuICogQGludGVybmFsIFVzZWQgaW4gdW5pdCB0ZXN0cyBvbmx5LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9pbmplY3RTZXR0aW5nc1N0b3JlKHN0b3JlOiBTZXR0aW5nc1N0b3JlIHwgbnVsbCk6IHZvaWQge1xyXG4gIF9pbmplY3RlZFN0b3JlID0gc3RvcmU7XHJcbn1cclxuXHJcbi8qKiBJbi1tZW1vcnkgZmFsbGJhY2sgd2hlbiBydW5uaW5nIG91dHNpZGUgUG93ZXJQb2ludCAoZS5nLiBicm93c2VyIHRlc3RpbmcpLiAqL1xyXG5jb25zdCBfbWVtb3J5U3RvcmU6IFNldHRpbmdzU3RvcmUgPSAoKCkgPT4ge1xyXG4gIGNvbnN0IGRhdGEgPSBuZXcgTWFwPHN0cmluZywgdW5rbm93bj4oKTtcclxuICByZXR1cm4ge1xyXG4gICAgZ2V0OiAobmFtZTogc3RyaW5nKSA9PiBkYXRhLmdldChuYW1lKSA/PyBudWxsLFxyXG4gICAgc2V0OiAobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikgPT4geyBkYXRhLnNldChuYW1lLCB2YWx1ZSk7IH0sXHJcbiAgICByZW1vdmU6IChuYW1lOiBzdHJpbmcpID0+IHsgZGF0YS5kZWxldGUobmFtZSk7IH0sXHJcbiAgICBzYXZlQXN5bmM6IChjYjogKHI6IFNhdmVSZXN1bHQpID0+IHZvaWQpID0+IHsgY2IoeyBzdGF0dXM6ICdzdWNjZWVkZWQnLCBlcnJvcjogbnVsbCB9KTsgfSxcclxuICB9O1xyXG59KSgpO1xyXG5cclxuZnVuY3Rpb24gZ2V0U3RvcmUoKTogU2V0dGluZ3NTdG9yZSB7XHJcbiAgaWYgKF9pbmplY3RlZFN0b3JlKSByZXR1cm4gX2luamVjdGVkU3RvcmU7XHJcbiAgLyogZ2xvYmFsIE9mZmljZSAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IE9mZmljZS5jb250ZXh0Py5kb2N1bWVudD8uc2V0dGluZ3M7XHJcbiAgICBpZiAoc2V0dGluZ3MpIHJldHVybiBzZXR0aW5ncyBhcyB1bmtub3duIGFzIFNldHRpbmdzU3RvcmU7XHJcbiAgfSBjYXRjaCB7IC8qIG91dHNpZGUgT2ZmaWNlIGhvc3QgKi8gfVxyXG4gIHJldHVybiBfbWVtb3J5U3RvcmU7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBJbnRlcm5hbCBoZWxwZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gc2xpZGVLZXkoc2xpZGVJZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gYCR7U0VUVElOR19LRVlfU0xJREVfUFJFRklYfSR7c2xpZGVJZH1gO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlT25jZShzdG9yZTogU2V0dGluZ3NTdG9yZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBzdG9yZS5zYXZlQXN5bmMoKHJlc3VsdCkgPT4ge1xyXG4gICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKHJlc3VsdC5lcnJvcj8ubWVzc2FnZSA/PyAnU2V0dGluZ3Mgc2F2ZSBmYWlsZWQnKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVsYXkobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG4vKipcclxuICogU2F2ZSBzZXR0aW5ncyB3aXRoIGF1dG9tYXRpYyByZXRyeS5cclxuICogUmV0cmllcyB1cCB0byB7QGxpbmsgU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFU30gdGltZXMgd2l0aCBhIGRlbGF5IGJldHdlZW4gYXR0ZW1wdHMuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBzYXZlKHN0b3JlOiBTZXR0aW5nc1N0b3JlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IGF0dGVtcHQgPD0gU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFUzsgYXR0ZW1wdCsrKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBzYXZlT25jZShzdG9yZSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBpZiAoYXR0ZW1wdCA8IFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMpIHtcclxuICAgICAgICBsb2dEZWJ1ZyhgU2V0dGluZ3Mgc2F2ZSBhdHRlbXB0ICR7YXR0ZW1wdCArIDF9IGZhaWxlZCwgcmV0cnlpbmcuLi5gKTtcclxuICAgICAgICBhd2FpdCBkZWxheShTRVRUSU5HU19TQVZFX1JFVFJZX0RFTEFZX01TKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsb2dFcnJvcignU2V0dGluZ3Mgc2F2ZSBmYWlsZWQgYWZ0ZXIgYWxsIHJldHJpZXM6JywgZXJyKTtcclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTbGlkZSBjb25maWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUmV0dXJucyB0aGUgc2F2ZWQgY29uZmlnIGZvciBhIHNsaWRlLCBvciBgbnVsbGAgaWYgbm90IHNldC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFNsaWRlQ29uZmlnKHNsaWRlSWQ6IHN0cmluZyk6IFdlYlBQVFNsaWRlQ29uZmlnIHwgbnVsbCB7XHJcbiAgY29uc3QgcmF3ID0gZ2V0U3RvcmUoKS5nZXQoc2xpZGVLZXkoc2xpZGVJZCkpO1xyXG4gIHJldHVybiByYXcgPyAocmF3IGFzIFdlYlBQVFNsaWRlQ29uZmlnKSA6IG51bGw7XHJcbn1cclxuXHJcbi8qKiBTYXZlcyBjb25maWcgZm9yIGEgc2xpZGUgYW5kIHBlcnNpc3RzIHRvIGRvY3VtZW50LiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U2xpZGVDb25maWcoc2xpZGVJZDogc3RyaW5nLCBjb25maWc6IFdlYlBQVFNsaWRlQ29uZmlnKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnNldChzbGlkZUtleShzbGlkZUlkKSwgY29uZmlnKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG5cclxuLyoqIFJlbW92ZXMgdGhlIHNhdmVkIGNvbmZpZyBmb3IgYSBzbGlkZS4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVNsaWRlQ29uZmlnKHNsaWRlSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKTtcclxuICBzdG9yZS5yZW1vdmUoc2xpZGVLZXkoc2xpZGVJZCkpO1xyXG4gIGF3YWl0IHNhdmUoc3RvcmUpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgTGFuZ3VhZ2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUmV0dXJucyB0aGUgc2F2ZWQgVUkgbGFuZ3VhZ2UsIG9yIGBudWxsYCBpZiBub3Qgc2V0LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGFuZ3VhZ2UoKTogTG9jYWxlIHwgbnVsbCB7XHJcbiAgcmV0dXJuIChnZXRTdG9yZSgpLmdldChTRVRUSU5HX0tFWV9MQU5HVUFHRSkgYXMgTG9jYWxlKSA/PyBudWxsO1xyXG59XHJcblxyXG4vKiogU2F2ZXMgdGhlIFVJIGxhbmd1YWdlIGFuZCBwZXJzaXN0cyB0byBkb2N1bWVudC4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldExhbmd1YWdlKGxvY2FsZTogTG9jYWxlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnNldChTRVRUSU5HX0tFWV9MQU5HVUFHRSwgbG9jYWxlKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlZmF1bHRzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFJldHVybnMgc2F2ZWQgZ2xvYmFsIGRlZmF1bHRzLCBvciBidWlsdC1pbiBkZWZhdWx0cyBpZiBub3Qgc2V0LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdHMoKTogV2ViUFBUU2xpZGVDb25maWcge1xyXG4gIGNvbnN0IHN0b3JlZCA9IGdldFN0b3JlKCkuZ2V0KFNFVFRJTkdfS0VZX0RFRkFVTFRTKSBhcyBXZWJQUFRTbGlkZUNvbmZpZyB8IG51bGw7XHJcbiAgcmV0dXJuIHN0b3JlZCA/PyB7XHJcbiAgICB1cmw6ICcnLFxyXG4gICAgem9vbTogREVGQVVMVF9aT09NLFxyXG4gICAgZGlhbG9nV2lkdGg6IERFRkFVTFRfRElBTE9HX1dJRFRILFxyXG4gICAgZGlhbG9nSGVpZ2h0OiBERUZBVUxUX0RJQUxPR19IRUlHSFQsXHJcbiAgICBhdXRvT3BlbjogREVGQVVMVF9BVVRPX09QRU4sXHJcbiAgICBhdXRvT3BlbkRlbGF5U2VjOiBERUZBVUxUX0FVVE9fT1BFTl9ERUxBWV9TRUMsXHJcbiAgICBhdXRvQ2xvc2VTZWM6IERFRkFVTFRfQVVUT19DTE9TRV9TRUMsXHJcbiAgfTtcclxufVxyXG5cclxuLyoqIFNhdmVzIGdsb2JhbCBkZWZhdWx0cyBhbmQgcGVyc2lzdHMgdG8gZG9jdW1lbnQuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXREZWZhdWx0cyhjb25maWc6IFdlYlBQVFNsaWRlQ29uZmlnKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnNldChTRVRUSU5HX0tFWV9ERUZBVUxUUywgY29uZmlnKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBnZXRTbGlkZUNvbmZpZywgZ2V0TGFuZ3VhZ2UgfSBmcm9tICcuLi9zaGFyZWQvc2V0dGluZ3MnO1xyXG5pbXBvcnQgeyBEaWFsb2dMYXVuY2hlciB9IGZyb20gJy4uL3NoYXJlZC9kaWFsb2ctbGF1bmNoZXInO1xyXG5pbXBvcnQgeyBwYXJzZUxvY2FsZSB9IGZyb20gJy4uL3NoYXJlZC9pMThuJztcclxuaW1wb3J0IHsgbG9nRGVidWcsIGxvZ0Vycm9yLCBpbnN0YWxsVW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlciB9IGZyb20gJy4uL3NoYXJlZC9sb2dnZXInO1xyXG5cclxuLy8g4pSA4pSA4pSAIFN0YXRlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuY29uc3QgbGF1bmNoZXIgPSBuZXcgRGlhbG9nTGF1bmNoZXIoKTtcclxuXHJcbi8qKiBXaGV0aGVyIFBvd2VyUG9pbnQgaXMgY3VycmVudGx5IGluIFNsaWRlc2hvdyAoXCJyZWFkXCIpIG1vZGUuICovXHJcbmxldCBpblNsaWRlc2hvdyA9IGZhbHNlO1xyXG5cclxuLyoqIFBvbGxpbmcgaW50ZXJ2YWwgaGFuZGxlIGZvciBzbGlkZSBjaGFuZ2UgZGV0ZWN0aW9uIGR1cmluZyBzbGlkZXNob3cuICovXHJcbmxldCBwb2xsVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldEludGVydmFsPiB8IG51bGwgPSBudWxsO1xyXG5cclxuLyoqIExhc3Qga25vd24gc2xpZGUgSUQg4oCUIHVzZWQgYnkgcG9sbGluZyB0byBkZXRlY3Qgc2xpZGUgY2hhbmdlcy4gKi9cclxubGV0IGxhc3RQb2xsU2xpZGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcblxyXG4vKiogR3VhcmQgdG8gcHJldmVudCBvdmVybGFwcGluZyBwb2xsIHRpY2tzLiAqL1xyXG5sZXQgcG9sbEJ1c3kgPSBmYWxzZTtcclxuXHJcbi8qKiBIb3cgb2Z0ZW4gdG8gY2hlY2sgdGhlIGN1cnJlbnQgc2xpZGUgZHVyaW5nIHNsaWRlc2hvdyAobXMpLiAqL1xyXG5jb25zdCBQT0xMX0lOVEVSVkFMX01TID0gMTUwMDtcclxuXHJcbi8vIOKUgOKUgOKUgCBIZWxwZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFJlc29sdmUgdGhlIElEIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgc2xpZGUsIG9yIGBudWxsYC4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudFNsaWRlSWQoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgdHJ5IHtcclxuICAgIGxldCBzbGlkZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIGF3YWl0IFBvd2VyUG9pbnQucnVuKGFzeW5jIChjb250ZXh0KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNsaWRlcyA9IGNvbnRleHQucHJlc2VudGF0aW9uLmdldFNlbGVjdGVkU2xpZGVzKCk7XHJcbiAgICAgIHNsaWRlcy5sb2FkKCdpdGVtcy9pZCcpO1xyXG4gICAgICBhd2FpdCBjb250ZXh0LnN5bmMoKTtcclxuICAgICAgaWYgKHNsaWRlcy5pdGVtcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgc2xpZGVJZCA9IHNsaWRlcy5pdGVtc1swXS5pZDtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc2xpZGVJZDtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIFJlc29sdmUgdGhlIGxhbmd1YWdlIHRvIHBhc3MgdG8gdGhlIHZpZXdlciBkaWFsb2cuICovXHJcbmZ1bmN0aW9uIHJlc29sdmVMYW5ndWFnZSgpOiBzdHJpbmcge1xyXG4gIGNvbnN0IHNhdmVkTGFuZyA9IGdldExhbmd1YWdlKCk7XHJcbiAgcmV0dXJuIHNhdmVkTGFuZyA/PyBwYXJzZUxvY2FsZShuYXZpZ2F0b3IubGFuZ3VhZ2UpO1xyXG59XHJcblxyXG4vKipcclxuICogT3BlbiB0aGUgdmlld2VyIGRpYWxvZyBmb3IgdGhlIGdpdmVuIHNsaWRlJ3MgY29uZmlnLlxyXG4gKiBDbG9zZXMgYW55IGV4aXN0aW5nIGRpYWxvZyBmaXJzdCB0byBhdm9pZCBcImRpYWxvZyBhbHJlYWR5IG9wZW5cIiBlcnJvcnMuXHJcbiAqIFJldHVybnMgc2lsZW50bHkgaWYgdGhlIHNsaWRlIGhhcyBubyBVUkwgY29uZmlndXJlZC5cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIG9wZW5WaWV3ZXJGb3JTbGlkZShzbGlkZUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBjb25maWcgPSBnZXRTbGlkZUNvbmZpZyhzbGlkZUlkKTtcclxuICBpZiAoIWNvbmZpZyB8fCAhY29uZmlnLnVybCkgcmV0dXJuO1xyXG5cclxuICAvLyBDbG9zZSBleGlzdGluZyBkaWFsb2cgYmVmb3JlIG9wZW5pbmcgYSBuZXcgb25lXHJcbiAgbGF1bmNoZXIuY2xvc2UoKTtcclxuXHJcbiAgYXdhaXQgbGF1bmNoZXIub3Blbih7XHJcbiAgICB1cmw6IGNvbmZpZy51cmwsXHJcbiAgICB6b29tOiBjb25maWcuem9vbSxcclxuICAgIHdpZHRoOiBjb25maWcuZGlhbG9nV2lkdGgsXHJcbiAgICBoZWlnaHQ6IGNvbmZpZy5kaWFsb2dIZWlnaHQsXHJcbiAgICBsYW5nOiByZXNvbHZlTGFuZ3VhZ2UoKSxcclxuICAgIGF1dG9DbG9zZVNlYzogY29uZmlnLmF1dG9DbG9zZVNlYyxcclxuICB9KTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFJpYmJvbiBjb21tYW5kOiBTaG93IFdlYiBQYWdlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqXHJcbiAqIENhbGxlZCBmcm9tIHRoZSByaWJib24gXCJTaG93IFdlYiBQYWdlXCIgYnV0dG9uLlxyXG4gKiBSZWFkcyB0aGUgc2F2ZWQgY29uZmlnIGZvciB0aGUgY3VycmVudCBzbGlkZSBhbmQgb3BlbnMgdGhlIHZpZXdlciBkaWFsb2cuXHJcbiAqIElmIG5vIFVSTCBpcyBjb25maWd1cmVkLCB0aGUgY29tbWFuZCBjb21wbGV0ZXMgc2lsZW50bHkgKG5vIFRhc2sgUGFuZSBVSVxyXG4gKiBpcyBhdmFpbGFibGUgaW4gdGhpcyBydW50aW1lIHRvIHNob3cgYW4gZXJyb3IpLlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gc2hvd1dlYlBhZ2UoZXZlbnQ6IE9mZmljZS5BZGRpbkNvbW1hbmRzLkV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNsaWRlSWQgPSBhd2FpdCBnZXRDdXJyZW50U2xpZGVJZCgpO1xyXG4gICAgaWYgKHNsaWRlSWQpIHtcclxuICAgICAgbG9nRGVidWcoJ1JpYmJvbiBTaG93V2ViUGFnZSBmb3Igc2xpZGU6Jywgc2xpZGVJZCk7XHJcbiAgICAgIGF3YWl0IG9wZW5WaWV3ZXJGb3JTbGlkZShzbGlkZUlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxvZ0RlYnVnKCdTaG93V2ViUGFnZTogbm8gc2xpZGUgc2VsZWN0ZWQnKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGxvZ0Vycm9yKCdTaG93V2ViUGFnZSBjb21tYW5kIGZhaWxlZDonLCBlcnIpO1xyXG4gIH1cclxuXHJcbiAgZXZlbnQuY29tcGxldGVkKCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTbGlkZXNob3cgcG9sbGluZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKlxyXG4gKiBQb2xsIHRoZSBjdXJyZW50IHNsaWRlIGR1cmluZyBzbGlkZXNob3cgYW5kIGF1dG8tb3Blbi9jbG9zZSB0aGUgdmlld2VyLlxyXG4gKlxyXG4gKiBgRG9jdW1lbnRTZWxlY3Rpb25DaGFuZ2VkYCBkb2VzIE5PVCByZWxpYWJseSBmaXJlIGR1cmluZyBzbGlkZXNob3cgbW9kZVxyXG4gKiBvbiBQb3dlclBvaW50IERlc2t0b3Ag4oCUIGl0IGlzIGFuIGVkaXQtbW9kZSBldmVudC4gUG9sbGluZyBpcyB0aGUgb25seVxyXG4gKiByb2J1c3Qgd2F5IHRvIGRldGVjdCBzbGlkZSBuYXZpZ2F0aW9uIGluIHByZXNlbnRhdGlvbiBtb2RlLlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcG9sbEN1cnJlbnRTbGlkZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoIWluU2xpZGVzaG93IHx8IHBvbGxCdXN5KSByZXR1cm47XHJcblxyXG4gIHBvbGxCdXN5ID0gdHJ1ZTtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2xpZGVJZCA9IGF3YWl0IGdldEN1cnJlbnRTbGlkZUlkKCk7XHJcbiAgICBpZiAoIXNsaWRlSWQpIHJldHVybjtcclxuXHJcbiAgICAvLyBObyBjaGFuZ2Ug4oCUIG5vdGhpbmcgdG8gZG9cclxuICAgIGlmIChzbGlkZUlkID09PSBsYXN0UG9sbFNsaWRlSWQpIHJldHVybjtcclxuXHJcbiAgICBsb2dEZWJ1ZygnU2xpZGVzaG93IHNsaWRlIGNoYW5nZWQ6JywgbGFzdFBvbGxTbGlkZUlkLCAn4oaSJywgc2xpZGVJZCk7XHJcbiAgICBsYXN0UG9sbFNsaWRlSWQgPSBzbGlkZUlkO1xyXG5cclxuICAgIGNvbnN0IGNvbmZpZyA9IGdldFNsaWRlQ29uZmlnKHNsaWRlSWQpO1xyXG5cclxuICAgIGlmIChjb25maWc/LmF1dG9PcGVuICYmIGNvbmZpZy51cmwpIHtcclxuICAgICAgbG9nRGVidWcoJ0F1dG8tb3BlbmluZyB2aWV3ZXIgZm9yIHNsaWRlOicsIHNsaWRlSWQpO1xyXG4gICAgICBhd2FpdCBvcGVuVmlld2VyRm9yU2xpZGUoc2xpZGVJZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBDdXJyZW50IHNsaWRlIGhhcyBubyBVUkwgb3IgYXV0b09wZW4gaXMgb2ZmIOKAlCBjbG9zZSBhbnkgb3BlbiBkaWFsb2dcclxuICAgICAgbGF1bmNoZXIuY2xvc2UoKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGxvZ0Vycm9yKCdQb2xsIHNsaWRlIGNoYW5nZSBmYWlsZWQ6JywgZXJyKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgcG9sbEJ1c3kgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBTdGFydCBwb2xsaW5nIGZvciBzbGlkZSBjaGFuZ2VzLiBDYWxsZWQgd2hlbiBlbnRlcmluZyBzbGlkZXNob3cuICovXHJcbmZ1bmN0aW9uIHN0YXJ0U2xpZGVzaG93UG9sbGluZygpOiB2b2lkIHtcclxuICBzdG9wU2xpZGVzaG93UG9sbGluZygpO1xyXG4gIGxhc3RQb2xsU2xpZGVJZCA9IG51bGw7XHJcbiAgcG9sbEJ1c3kgPSBmYWxzZTtcclxuICBsb2dEZWJ1ZygnU3RhcnRpbmcgc2xpZGVzaG93IHBvbGxpbmcgKGludGVydmFsOicsIFBPTExfSU5URVJWQUxfTVMsICdtcyknKTtcclxuICBwb2xsVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7IHBvbGxDdXJyZW50U2xpZGUoKTsgfSwgUE9MTF9JTlRFUlZBTF9NUyk7XHJcbn1cclxuXHJcbi8qKiBTdG9wIHBvbGxpbmcuIENhbGxlZCB3aGVuIGxlYXZpbmcgc2xpZGVzaG93LiAqL1xyXG5mdW5jdGlvbiBzdG9wU2xpZGVzaG93UG9sbGluZygpOiB2b2lkIHtcclxuICBpZiAocG9sbFRpbWVyKSB7XHJcbiAgICBjbGVhckludGVydmFsKHBvbGxUaW1lcik7XHJcbiAgICBwb2xsVGltZXIgPSBudWxsO1xyXG4gIH1cclxuICBsYXN0UG9sbFNsaWRlSWQgPSBudWxsO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGVzaG93IGRldGVjdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8vIExJTUlUQVRJT046IFBvd2VyUG9pbnQgT25saW5lIHRyZWF0cyBTbGlkZXNob3cgYXMgYSBuZXcgc2Vzc2lvbixcclxuLy8gQWN0aXZlVmlld0NoYW5nZWQgd29uJ3QgZmlyZS4gVXNlcnMgbXVzdCB1c2UgdGhlIHJpYmJvbiBidXR0b24gbWFudWFsbHkuXHJcblxyXG4vKipcclxuICogSGFuZGxlcyB2aWV3IGNoYW5nZXMgYmV0d2VlbiBlZGl0IChcImVkaXRcIikgYW5kIHNsaWRlc2hvdyAoXCJyZWFkXCIpIG1vZGVzLlxyXG4gKiAtIEVudGVyaW5nIHNsaWRlc2hvdzogc3RhcnRzIHBvbGxpbmcgKyBhdXRvLW9wZW5zIHZpZXdlciBmb3IgdGhlIGZpcnN0IHNsaWRlLlxyXG4gKiAtIExlYXZpbmcgc2xpZGVzaG93OiBzdG9wcyBwb2xsaW5nICsgY2xvc2VzIGFueSBvcGVuIHZpZXdlciBkaWFsb2cuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBY3RpdmVWaWV3Q2hhbmdlZChhcmdzOiB7IGFjdGl2ZVZpZXc6IHN0cmluZyB9KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgbG9nRGVidWcoJ0FjdGl2ZVZpZXdDaGFuZ2VkOicsIGFyZ3MuYWN0aXZlVmlldyk7XHJcblxyXG4gIGlmIChhcmdzLmFjdGl2ZVZpZXcgPT09ICdyZWFkJykge1xyXG4gICAgLy8gRW50ZXJlZCBzbGlkZXNob3cgbW9kZVxyXG4gICAgaW5TbGlkZXNob3cgPSB0cnVlO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHNsaWRlSWQgPSBhd2FpdCBnZXRDdXJyZW50U2xpZGVJZCgpO1xyXG4gICAgICBsb2dEZWJ1ZygnU2xpZGVzaG93IGVudGVyZWQsIGN1cnJlbnQgc2xpZGU6Jywgc2xpZGVJZCk7XHJcblxyXG4gICAgICBpZiAoc2xpZGVJZCkge1xyXG4gICAgICAgIGxhc3RQb2xsU2xpZGVJZCA9IHNsaWRlSWQ7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoc2xpZGVJZCk7XHJcbiAgICAgICAgaWYgKGNvbmZpZz8uYXV0b09wZW4gJiYgY29uZmlnLnVybCkge1xyXG4gICAgICAgICAgbG9nRGVidWcoJ0F1dG8tb3BlbmluZyB2aWV3ZXIgZm9yIGluaXRpYWwgc2xpZGU6Jywgc2xpZGVJZCk7XHJcbiAgICAgICAgICBhd2FpdCBvcGVuVmlld2VyRm9yU2xpZGUoc2xpZGVJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbG9nRXJyb3IoJ0F1dG8tb3BlbiBvbiBzbGlkZXNob3cgZW50ZXIgZmFpbGVkOicsIGVycik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RhcnQgcG9sbGluZyBmb3Igc2xpZGUgY2hhbmdlcyBkdXJpbmcgc2xpZGVzaG93LlxyXG4gICAgLy8gRG9jdW1lbnRTZWxlY3Rpb25DaGFuZ2VkIGRvZXMgTk9UIGZpcmUgcmVsaWFibHkgaW4gc2xpZGVzaG93IG1vZGUsXHJcbiAgICAvLyBzbyBwb2xsaW5nIGlzIHRoZSBwcmltYXJ5IG1lY2hhbmlzbSBmb3IgZGV0ZWN0aW5nIHNsaWRlIG5hdmlnYXRpb24uXHJcbiAgICBzdGFydFNsaWRlc2hvd1BvbGxpbmcoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gTGVmdCBzbGlkZXNob3cgbW9kZSAoYmFjayB0byBcImVkaXRcIilcclxuICAgIGxvZ0RlYnVnKCdTbGlkZXNob3cgZXhpdGVkJyk7XHJcbiAgICBpblNsaWRlc2hvdyA9IGZhbHNlO1xyXG4gICAgc3RvcFNsaWRlc2hvd1BvbGxpbmcoKTtcclxuICAgIGxhdW5jaGVyLmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgQm9vdHN0cmFwIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIoKTtcclxuXHJcbk9mZmljZS5vblJlYWR5KCgpID0+IHtcclxuICBsb2dEZWJ1ZygnQ29tbWFuZHMgcnVudGltZSByZWFkeScpO1xyXG5cclxuICAvLyBFeHBvc2UgdGhlIGNvbW1hbmQgZnVuY3Rpb24gb24gdGhlIGdsb2JhbCBzY29wZSBGSVJTVC5cclxuICAvLyBYTUwgbWFuaWZlc3QgbG9va3MgdXAgPEZ1bmN0aW9uTmFtZT5zaG93V2ViUGFnZTwvRnVuY3Rpb25OYW1lPiBvbiB0aGUgZ2xvYmFsIHNjb3BlLlxyXG4gIC8vIFRoaXMgbXVzdCBoYXBwZW4gYmVmb3JlIGFueXRoaW5nIHRoYXQgY291bGQgdGhyb3cuXHJcbiAgKGdsb2JhbFRoaXMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLnNob3dXZWJQYWdlID0gc2hvd1dlYlBhZ2U7XHJcblxyXG4gIC8vIEZvciB1bmlmaWVkIEpTT04gbWFuaWZlc3Q6IGFzc29jaWF0ZSBhY3Rpb24gSURzIHdpdGggaGFuZGxlciBmdW5jdGlvbnMuXHJcbiAgLy8gT2ZmaWNlLmFjdGlvbnMgbWF5IG5vdCBleGlzdCBpbiBYTUwtbWFuaWZlc3QgRnVuY3Rpb25GaWxlIHJ1bnRpbWVzLFxyXG4gIC8vIHNvIHRoaXMgTVVTVCBiZSB3cmFwcGVkIGluIHRyeS9jYXRjaCB0byBhdm9pZCBjcmFzaGluZyB0aGUgZW50aXJlIGJvb3RzdHJhcC5cclxuICB0cnkge1xyXG4gICAgaWYgKE9mZmljZS5hY3Rpb25zICYmIHR5cGVvZiBPZmZpY2UuYWN0aW9ucy5hc3NvY2lhdGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgT2ZmaWNlLmFjdGlvbnMuYXNzb2NpYXRlKCdTaG93V2ViUGFnZScsIHNob3dXZWJQYWdlKTtcclxuICAgICAgbG9nRGVidWcoJ09mZmljZS5hY3Rpb25zLmFzc29jaWF0ZSByZWdpc3RlcmVkJyk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7XHJcbiAgICBsb2dEZWJ1ZygnT2ZmaWNlLmFjdGlvbnMuYXNzb2NpYXRlIG5vdCBhdmFpbGFibGUgKFhNTCBtYW5pZmVzdCBtb2RlKScpO1xyXG4gIH1cclxuXHJcbiAgLy8gTGlzdGVuIGZvciB2aWV3IGNoYW5nZXMgKGVkaXQg4oaUIHNsaWRlc2hvdykuXHJcbiAgLy8gTElNSVRBVElPTjogUG93ZXJQb2ludCBPbmxpbmUgdHJlYXRzIFNsaWRlc2hvdyBhcyBhIG5ldyBzZXNzaW9uLFxyXG4gIC8vIEFjdGl2ZVZpZXdDaGFuZ2VkIHdvbid0IGZpcmUgdGhlcmUuIEF1dG8tb3BlbiBvbmx5IHdvcmtzIG9uIERlc2t0b3AuXHJcbiAgdHJ5IHtcclxuICAgIE9mZmljZS5jb250ZXh0LmRvY3VtZW50LmFkZEhhbmRsZXJBc3luYyhcclxuICAgICAgT2ZmaWNlLkV2ZW50VHlwZS5BY3RpdmVWaWV3Q2hhbmdlZCxcclxuICAgICAgKGFyZ3M6IHsgYWN0aXZlVmlldzogc3RyaW5nIH0pID0+IHsgaGFuZGxlQWN0aXZlVmlld0NoYW5nZWQoYXJncyk7IH0sXHJcbiAgICAgIChyZXN1bHQpID0+IHtcclxuICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gT2ZmaWNlLkFzeW5jUmVzdWx0U3RhdHVzLlN1Y2NlZWRlZCkge1xyXG4gICAgICAgICAgbG9nRGVidWcoJ0FjdGl2ZVZpZXdDaGFuZ2VkIGhhbmRsZXIgcmVnaXN0ZXJlZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsb2dFcnJvcignRmFpbGVkIHRvIHJlZ2lzdGVyIEFjdGl2ZVZpZXdDaGFuZ2VkOicsIHJlc3VsdC5lcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGxvZ0Vycm9yKCdBY3RpdmVWaWV3Q2hhbmdlZCBub3Qgc3VwcG9ydGVkOicsIGVycik7XHJcbiAgfVxyXG5cclxuICAvLyBBbHNvIGxpc3RlbiBmb3IgRG9jdW1lbnRTZWxlY3Rpb25DaGFuZ2VkIGFzIGEgc2Vjb25kYXJ5IHRyaWdnZXIuXHJcbiAgLy8gVGhpcyBtYXkgZmlyZSBvbiBzb21lIERlc2t0b3AgdmVyc2lvbnMgZHVyaW5nIHNsaWRlc2hvdyAodW5kb2N1bWVudGVkKSxcclxuICAvLyBwcm92aWRpbmcgZmFzdGVyIGRldGVjdGlvbiB0aGFuIHBvbGxpbmcgaW4gdGhvc2UgY2FzZXMuXHJcbiAgdHJ5IHtcclxuICAgIE9mZmljZS5jb250ZXh0LmRvY3VtZW50LmFkZEhhbmRsZXJBc3luYyhcclxuICAgICAgT2ZmaWNlLkV2ZW50VHlwZS5Eb2N1bWVudFNlbGVjdGlvbkNoYW5nZWQsXHJcbiAgICAgICgpID0+IHtcclxuICAgICAgICBpZiAoIWluU2xpZGVzaG93KSByZXR1cm47XHJcbiAgICAgICAgLy8gTGV0IHRoZSBuZXh0IHBvbGwgdGljayBoYW5kbGUgaXQgaW1tZWRpYXRlbHkgaW5zdGVhZCBvZiB3YWl0aW5nXHJcbiAgICAgICAgcG9sbEN1cnJlbnRTbGlkZSgpO1xyXG4gICAgICB9LFxyXG4gICAgKTtcclxuICB9IGNhdGNoIHtcclxuICAgIC8vIERvY3VtZW50U2VsZWN0aW9uQ2hhbmdlZCBub3Qgc3VwcG9ydGVkIOKAlCBwb2xsaW5nIGlzIHRoZSBvbmx5IG1lY2hhbmlzbVxyXG4gIH1cclxufSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==