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
    const su = i18n_1.i18n.t('unitSec');
    const mu = i18n_1.i18n.t('unitMin');
    if (sec < 60)
        return `${sec}${su}`;
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    if (sec >= 3600)
        return `${Math.floor(sec / 3600)}${i18n_1.i18n.t('unitHour')}`;
    return secs === 0 ? `${mins}${mu}` : `${mins}${mu} ${secs}${su}`;
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
    const su = i18n_1.i18n.t('unitSec');
    const mu = i18n_1.i18n.t('unitMin');
    if (sec < 60)
        return `${sec}${su}`;
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return secs === 0 ? `${mins}${mu}` : `${mins}${mu} ${secs}${su}`;
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
/** Re-render all dynamically-set slider value labels (called after language change). */
function refreshSliderLabels() {
    sliderWidthValue.textContent = `${sliderWidth.value}%`;
    sliderHeightValue.textContent = `${sliderHeight.value}%`;
    sliderZoomValue.textContent = `${sliderZoom.value}%`;
    sliderAutoCloseValue.textContent = formatAutoCloseLabel(getAutoCloseSeconds());
    sliderAutoOpenDelayValue.textContent = formatAutoOpenDelayLabel(getAutoOpenDelaySeconds());
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
    refreshSliderLabels();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUE0QztJQUM1QyxvQkFBb0IsRUFBRSxDQUFDO0lBRXZCLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRCxnRkFBZ0Y7QUFFaEYsNkNBQWdDLEdBQUUsQ0FBQztBQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Ozs7Ozs7Ozs7QUN2bEM3QiIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9kaWFsb2ctbGF1bmNoZXIudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvaTE4bi50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9sb2dnZXIudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvc2V0dGluZ3MudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy90YXNrcGFuZS90YXNrcGFuZS50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3Rhc2twYW5lL3Rhc2twYW5lLmNzcz80Yzc2Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIOKUgOKUgOKUgCBTZXR0aW5nIGtleXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUHJlZml4IGZvciBwZXItc2xpZGUgc2V0dGluZyBrZXlzLiBGdWxsIGtleTogYHdlYnBwdF9zbGlkZV97c2xpZGVJZH1gLiAqL1xyXG5leHBvcnQgY29uc3QgU0VUVElOR19LRVlfU0xJREVfUFJFRklYID0gJ3dlYnBwdF9zbGlkZV8nO1xyXG5cclxuLyoqIEtleSBmb3IgdGhlIHNhdmVkIFVJIGxhbmd1YWdlLiAqL1xyXG5leHBvcnQgY29uc3QgU0VUVElOR19LRVlfTEFOR1VBR0UgPSAnd2VicHB0X2xhbmd1YWdlJztcclxuXHJcbi8qKiBLZXkgZm9yIGdsb2JhbCBkZWZhdWx0IHNsaWRlIGNvbmZpZy4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX0RFRkFVTFRTID0gJ3dlYnBwdF9kZWZhdWx0cyc7XHJcblxyXG4vLyDilIDilIDilIAgVmlld2VyIGRlZmF1bHRzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfWk9PTSA9IDEwMDtcclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRElBTE9HX1dJRFRIID0gMTAwOyAgIC8vICUgb2Ygc2NyZWVuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0RJQUxPR19IRUlHSFQgPSAxMDA7ICAvLyAlIG9mIHNjcmVlblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRPX09QRU4gPSB0cnVlO1xyXG5cclxuLy8g4pSA4pSA4pSAIENvbnN0cmFpbnQgcmFuZ2VzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IFpPT01fTUlOID0gNTA7XHJcbmV4cG9ydCBjb25zdCBaT09NX01BWCA9IDMwMDtcclxuXHJcbi8vIOKUgOKUgOKUgCBBdXRvLW9wZW4gZGVsYXkg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRPX09QRU5fREVMQVlfU0VDID0gMDsgICAvLyAwID0gaW1tZWRpYXRlXHJcblxyXG4vKipcclxuICogTm9uLWxpbmVhciBsb29rdXAgdGFibGUgZm9yIHRoZSBhdXRvLW9wZW4gZGVsYXkgc2xpZGVyLlxyXG4gKiBJbmRleCA9IHNsaWRlciBwb3NpdGlvbiwgdmFsdWUgPSBzZWNvbmRzLlxyXG4gKiBSYW5nZTogMOKAkzYwcy4gR3JhbnVsYXJpdHk6IDFzIHVwIHRvIDEwcywgdGhlbiA1cyB1cCB0byAzMHMsIHRoZW4gMTBzIHVwIHRvIDYwcy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBBVVRPX09QRU5fREVMQVlfU1RFUFM6IHJlYWRvbmx5IG51bWJlcltdID0gW1xyXG4gIC8vIDDigJMxMHMsIHN0ZXAgMSAgKDExIHZhbHVlczogaW5kaWNlcyAw4oCTMTApXHJcbiAgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsXHJcbiAgLy8gMTDigJM2MHMsIHN0ZXAgNSAgKDEwIHZhbHVlczogaW5kaWNlcyAxMeKAkzIwKVxyXG4gIDE1LCAyMCwgMjUsIDMwLCAzNSwgNDAsIDQ1LCA1MCwgNTUsIDYwLFxyXG4gIC8vIDHigJMzIG1pbiwgc3RlcCAxNXMgICg4IHZhbHVlczogaW5kaWNlcyAyMeKAkzI4KVxyXG4gIDc1LCA5MCwgMTA1LCAxMjAsIDEzNSwgMTUwLCAxNjUsIDE4MCxcclxuICAvLyAz4oCTNSBtaW4sIHN0ZXAgMzBzICAoNCB2YWx1ZXM6IGluZGljZXMgMjnigJMzMilcclxuICAyMTAsIDI0MCwgMjcwLCAzMDAsXHJcbl07XHJcblxyXG4vLyDilIDilIDilIAgQXV0by1jbG9zZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FVVE9fQ0xPU0VfU0VDID0gMDsgICAvLyAwID0gZGlzYWJsZWRcclxuZXhwb3J0IGNvbnN0IEFVVE9fQ0xPU0VfTUFYX1NFQyA9IDM2MDA7XHJcblxyXG4vKipcclxuICogTm9uLWxpbmVhciBsb29rdXAgdGFibGUgZm9yIHRoZSBhdXRvLWNsb3NlIHNsaWRlci5cclxuICogSW5kZXggPSBzbGlkZXIgcG9zaXRpb24sIHZhbHVlID0gc2Vjb25kcy5cclxuICogR3JhbnVsYXJpdHkgZGVjcmVhc2VzIGFzIHZhbHVlcyBncm93OiAxcyDihpIgNXMg4oaSIDE1cyDihpIgMzBzIOKGkiA2MHMg4oaSIDMwMHMuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQVVUT19DTE9TRV9TVEVQUzogcmVhZG9ubHkgbnVtYmVyW10gPSBbXHJcbiAgLy8gMOKAkzEwcywgc3RlcCAxICAoMTEgdmFsdWVzKVxyXG4gIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLFxyXG4gIC8vIDEw4oCTNjBzLCBzdGVwIDUgICgxMCB2YWx1ZXMpXHJcbiAgMTUsIDIwLCAyNSwgMzAsIDM1LCA0MCwgNDUsIDUwLCA1NSwgNjAsXHJcbiAgLy8gMeKAkzMgbWluLCBzdGVwIDE1cyAgKDggdmFsdWVzKVxyXG4gIDc1LCA5MCwgMTA1LCAxMjAsIDEzNSwgMTUwLCAxNjUsIDE4MCxcclxuICAvLyAz4oCTNSBtaW4sIHN0ZXAgMzBzICAoNCB2YWx1ZXMpXHJcbiAgMjEwLCAyNDAsIDI3MCwgMzAwLFxyXG4gIC8vIDXigJMxMCBtaW4sIHN0ZXAgNjBzICAoNSB2YWx1ZXMpXHJcbiAgMzYwLCA0MjAsIDQ4MCwgNTQwLCA2MDAsXHJcbiAgLy8gMTDigJM2MCBtaW4sIHN0ZXAgMzAwcyAgKDEwIHZhbHVlcylcclxuICA5MDAsIDEyMDAsIDE1MDAsIDE4MDAsIDIxMDAsIDI0MDAsIDI3MDAsIDMwMDAsIDMzMDAsIDM2MDAsXHJcbl07XHJcblxyXG4vLyDilIDilIDilIAgRXJyb3IgaGFuZGxpbmcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFUyA9IDI7XHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HU19TQVZFX1JFVFJZX0RFTEFZX01TID0gMTAwMDtcclxuZXhwb3J0IGNvbnN0IElGUkFNRV9MT0FEX1RJTUVPVVRfTVMgPSAxMF8wMDA7XHJcbmV4cG9ydCBjb25zdCBVUkxfRElTUExBWV9NQVhfTEVOR1RIID0gNjA7XHJcblxyXG4vKiogVHJ1bmNhdGUgYSBVUkwgZm9yIGRpc3BsYXksIGFwcGVuZGluZyBlbGxpcHNpcyBpZiBuZWVkZWQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cnVuY2F0ZVVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgaWYgKHVybC5sZW5ndGggPD0gVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCkgcmV0dXJuIHVybDtcclxuICByZXR1cm4gdXJsLnN1YnN0cmluZygwLCBVUkxfRElTUExBWV9NQVhfTEVOR1RIIC0gMSkgKyAnXFx1MjAyNic7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBEZWJ1ZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKlxyXG4gKiBTZXQgdG8gYGZhbHNlYCBpbiBwcm9kdWN0aW9uIGJ1aWxkcyB2aWEgd2VicGFjayBEZWZpbmVQbHVnaW4uXHJcbiAqIEZhbGxzIGJhY2sgdG8gYHRydWVgIHNvIGRldi90ZXN0IHJ1bnMgYWx3YXlzIGxvZy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBERUJVRzogYm9vbGVhbiA9XHJcbiAgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzLmVudiAhPT0gJ3VuZGVmaW5lZCdcclxuICAgID8gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJ1xyXG4gICAgOiB0cnVlO1xyXG4iLCJpbXBvcnQgeyBpMThuLCB0eXBlIFRyYW5zbGF0aW9uS2V5IH0gZnJvbSAnLi9pMThuJztcclxuaW1wb3J0IHsgbG9nRGVidWcsIGxvZ0Vycm9yIH0gZnJvbSAnLi9sb2dnZXInO1xyXG5cclxuLy8g4pSA4pSA4pSAIENvbnN0YW50cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBGaWxlbmFtZSBvZiB0aGUgdmlld2VyIHBhZ2UgYnVpbHQgYnkgd2VicGFjay4gKi9cclxuZXhwb3J0IGNvbnN0IFZJRVdFUl9QQUdFID0gJ3ZpZXdlci5odG1sJztcclxuXHJcbi8qKiBPZmZpY2UgZGlzcGxheURpYWxvZ0FzeW5jIGVycm9yIGNvZGVzLiAqL1xyXG5jb25zdCBPUEVOX0VSUiA9IHtcclxuICAvKiogQSBkaWFsb2cgaXMgYWxyZWFkeSBvcGVuZWQgZnJvbSB0aGlzIGFkZC1pbi4gKi9cclxuICBBTFJFQURZX09QRU5FRDogMTIwMDcsXHJcbiAgLyoqIFVzZXIgZGlzbWlzc2VkIHRoZSBkaWFsb2cgcHJvbXB0IC8gcG9wdXAgYmxvY2tlci4gKi9cclxuICBQT1BVUF9CTE9DS0VEOiAxMjAwOSxcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIOKUgOKUgOKUgCBUeXBlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nQ29uZmlnIHtcclxuICB1cmw6IHN0cmluZztcclxuICB6b29tOiBudW1iZXI7XHJcbiAgd2lkdGg6IG51bWJlcjsgICAvLyAlIG9mIHNjcmVlbiAoMTDigJMxMDApXHJcbiAgaGVpZ2h0OiBudW1iZXI7ICAvLyAlIG9mIHNjcmVlbiAoMTDigJMxMDApXHJcbiAgbGFuZzogc3RyaW5nO1xyXG4gIGF1dG9DbG9zZVNlYz86IG51bWJlcjsgIC8vIDAgb3IgdW5kZWZpbmVkID0gZGlzYWJsZWRcclxuICBzbGlkZXNob3c/OiBib29sZWFuOyAgICAvLyB0cnVlID0gZGlhbG9nIGlzIGluIHNsaWRlc2hvdyBtb2RlIChkb24ndCBhY3R1YWxseSBjbG9zZSBvbiB0aW1lcilcclxuICBoaWRlTWV0aG9kPzogJ25vbmUnIHwgJ21vdmUnIHwgJ3Jlc2l6ZSc7ICAvLyBob3cgdG8gaGlkZSBkaWFsb2cgYWZ0ZXIgdGltZXIgaW4gc2xpZGVzaG93XHJcbn1cclxuXHJcbi8qKiBUeXBlZCBlcnJvciB0aHJvd24gYnkge0BsaW5rIERpYWxvZ0xhdW5jaGVyfS4gKi9cclxuZXhwb3J0IGNsYXNzIERpYWxvZ0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIHJlYWRvbmx5IGkxOG5LZXk6IFRyYW5zbGF0aW9uS2V5LFxyXG4gICAgcHVibGljIHJlYWRvbmx5IG9mZmljZUNvZGU/OiBudW1iZXIsXHJcbiAgKSB7XHJcbiAgICBzdXBlcihpMThuLnQoaTE4bktleSkpO1xyXG4gICAgdGhpcy5uYW1lID0gJ0RpYWxvZ0Vycm9yJztcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBESSBpbnRlcmZhY2VzICh0ZXN0YWJsZSB3aXRob3V0IE9mZmljZSBydW50aW1lKSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBNaW5pbWFsIHN1YnNldCBvZiBPZmZpY2UuRGlhbG9nIHVzZWQgYnkgdGhpcyBtb2R1bGUuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgT2ZmaWNlRGlhbG9nIHtcclxuICBjbG9zZSgpOiB2b2lkO1xyXG4gIGFkZEV2ZW50SGFuZGxlcihcclxuICAgIGV2ZW50VHlwZTogc3RyaW5nLFxyXG4gICAgaGFuZGxlcjogKGFyZzogeyBtZXNzYWdlPzogc3RyaW5nOyBlcnJvcj86IG51bWJlciB9KSA9PiB2b2lkLFxyXG4gICk6IHZvaWQ7XHJcbiAgLyoqIFNlbmQgYSBtZXNzYWdlIGZyb20gaG9zdCB0byBkaWFsb2cgKERpYWxvZ0FwaSAxLjIrKS4gTWF5IG5vdCBleGlzdCBvbiBvbGRlciBPZmZpY2UuICovXHJcbiAgbWVzc2FnZUNoaWxkPyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRGlhbG9nT3BlblJlc3VsdCB7XHJcbiAgc3RhdHVzOiBzdHJpbmc7XHJcbiAgdmFsdWU6IE9mZmljZURpYWxvZztcclxuICBlcnJvcjogeyBjb2RlOiBudW1iZXI7IG1lc3NhZ2U6IHN0cmluZyB9O1xyXG59XHJcblxyXG4vKiogTWluaW1hbCBzdWJzZXQgb2YgT2ZmaWNlLmNvbnRleHQudWkgbmVlZGVkIGZvciBkaWFsb2cgb3BlcmF0aW9ucy4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBEaWFsb2dBcGkge1xyXG4gIGRpc3BsYXlEaWFsb2dBc3luYyhcclxuICAgIHN0YXJ0QWRkcmVzczogc3RyaW5nLFxyXG4gICAgb3B0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBjYWxsYmFjazogKHJlc3VsdDogRGlhbG9nT3BlblJlc3VsdCkgPT4gdm9pZCxcclxuICApOiB2b2lkO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVwZW5kZW5jeSBpbmplY3Rpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5sZXQgX2luamVjdGVkQXBpOiBEaWFsb2dBcGkgfCBudWxsID0gbnVsbDtcclxubGV0IF9pbmplY3RlZEJhc2VVcmw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuLyoqXHJcbiAqIE92ZXJyaWRlIHRoZSBPZmZpY2UgZGlhbG9nIEFQSS4gUGFzcyBgbnVsbGAgdG8gcmVzdG9yZSB0aGUgcmVhbCBvbmUuXHJcbiAqIEBpbnRlcm5hbCBVc2VkIGluIHVuaXQgdGVzdHMgb25seS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfaW5qZWN0RGlhbG9nQXBpKGFwaTogRGlhbG9nQXBpIHwgbnVsbCk6IHZvaWQge1xyXG4gIF9pbmplY3RlZEFwaSA9IGFwaTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE92ZXJyaWRlIHRoZSB2aWV3ZXIgYmFzZSBVUkwuIFBhc3MgYG51bGxgIHRvIHJlc3RvcmUgYXV0by1kZXRlY3Rpb24uXHJcbiAqIEBpbnRlcm5hbCBVc2VkIGluIHVuaXQgdGVzdHMgb25seS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfaW5qZWN0QmFzZVVybCh1cmw6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcclxuICBfaW5qZWN0ZWRCYXNlVXJsID0gdXJsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBcGkoKTogRGlhbG9nQXBpIHtcclxuICBpZiAoX2luamVjdGVkQXBpKSByZXR1cm4gX2luamVjdGVkQXBpO1xyXG4gIHJldHVybiBPZmZpY2UuY29udGV4dC51aSBhcyB1bmtub3duIGFzIERpYWxvZ0FwaTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Vmlld2VyQmFzZVVybCgpOiBzdHJpbmcge1xyXG4gIGlmIChfaW5qZWN0ZWRCYXNlVXJsKSByZXR1cm4gX2luamVjdGVkQmFzZVVybDtcclxuICBjb25zdCBkaXIgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW14vXSokLywgJycpO1xyXG4gIHJldHVybiBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufSR7ZGlyfS8ke1ZJRVdFUl9QQUdFfWA7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBEaWFsb2dMYXVuY2hlciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjbGFzcyBEaWFsb2dMYXVuY2hlciB7XHJcbiAgcHJpdmF0ZSBkaWFsb2c6IE9mZmljZURpYWxvZyB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgbWVzc2FnZUNhbGxiYWNrOiAoKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIGNsb3NlZENhbGxiYWNrOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLyoqIEJ1aWxkIHRoZSBmdWxsIHZpZXdlciBVUkwgd2l0aCBxdWVyeSBwYXJhbWV0ZXJzLiAqL1xyXG4gIHByaXZhdGUgYnVpbGRWaWV3ZXJVcmwoY29uZmlnOiBEaWFsb2dDb25maWcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XHJcbiAgICAgIHVybDogY29uZmlnLnVybCxcclxuICAgICAgem9vbTogU3RyaW5nKGNvbmZpZy56b29tKSxcclxuICAgICAgbGFuZzogY29uZmlnLmxhbmcsXHJcbiAgICB9KTtcclxuICAgIGlmIChjb25maWcuYXV0b0Nsb3NlU2VjICYmIGNvbmZpZy5hdXRvQ2xvc2VTZWMgPiAwKSB7XHJcbiAgICAgIHBhcmFtcy5zZXQoJ2F1dG9jbG9zZScsIFN0cmluZyhjb25maWcuYXV0b0Nsb3NlU2VjKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY29uZmlnLnNsaWRlc2hvdykge1xyXG4gICAgICBwYXJhbXMuc2V0KCdzbGlkZXNob3cnLCAnMScpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5oaWRlTWV0aG9kICYmIGNvbmZpZy5oaWRlTWV0aG9kICE9PSAnbm9uZScpIHtcclxuICAgICAgcGFyYW1zLnNldCgnaGlkZScsIGNvbmZpZy5oaWRlTWV0aG9kKTtcclxuICAgIH1cclxuICAgIHJldHVybiBgJHtnZXRWaWV3ZXJCYXNlVXJsKCl9PyR7cGFyYW1zLnRvU3RyaW5nKCl9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9wZW4gdGhlIHZpZXdlciBkaWFsb2cgd2l0aCB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbi5cclxuICAgKiBJZiBhIGRpYWxvZyBpcyBhbHJlYWR5IG9wZW4sIGNsb3NlcyBpdCBmaXJzdCBhbmQgcmVvcGVucy5cclxuICAgKiBSZWplY3RzIHdpdGgge0BsaW5rIERpYWxvZ0Vycm9yfSBpZiB0aGUgZGlhbG9nIGNhbm5vdCBiZSBvcGVuZWQuXHJcbiAgICovXHJcbiAgYXN5bmMgb3Blbihjb25maWc6IERpYWxvZ0NvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgLy8gQXV0by1jbG9zZSBhbnkgZXhpc3RpbmcgZGlhbG9nIGJlZm9yZSBvcGVuaW5nIGEgbmV3IG9uZVxyXG4gICAgaWYgKHRoaXMuZGlhbG9nKSB7XHJcbiAgICAgIGxvZ0RlYnVnKCdDbG9zaW5nIGV4aXN0aW5nIGRpYWxvZyBiZWZvcmUgb3BlbmluZyBhIG5ldyBvbmUnKTtcclxuICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEd1YXJkOiBjaGVjayB0aGF0IGRpc3BsYXlEaWFsb2dBc3luYyBpcyBhdmFpbGFibGVcclxuICAgIGNvbnN0IGFwaSA9IGdldEFwaSgpO1xyXG4gICAgaWYgKCFhcGkgfHwgdHlwZW9mIGFwaS5kaXNwbGF5RGlhbG9nQXN5bmMgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IERpYWxvZ0Vycm9yKCdkaWFsb2dVbnN1cHBvcnRlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXdlclVybCA9IHRoaXMuYnVpbGRWaWV3ZXJVcmwoY29uZmlnKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy50cnlPcGVuKGFwaSwgdmlld2VyVXJsLCBjb25maWcsIGZhbHNlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHQgdG8gb3BlbiB0aGUgZGlhbG9nLiBJZiBPZmZpY2UgcmV0dXJucyAxMjAwNyAoYWxyZWFkeSBvcGVuZWQpXHJcbiAgICogb24gdGhlIGZpcnN0IHRyeSwgd2FpdCBicmllZmx5IGFuZCByZXRyeSBvbmNlIOKAlCB0aGUgcHJldmlvdXMgY2xvc2UoKVxyXG4gICAqIG1heSBub3QgaGF2ZSBmdWxseSBwcm9wYWdhdGVkIHlldC5cclxuICAgKi9cclxuICBwcml2YXRlIHRyeU9wZW4oXHJcbiAgICBhcGk6IERpYWxvZ0FwaSxcclxuICAgIHZpZXdlclVybDogc3RyaW5nLFxyXG4gICAgY29uZmlnOiBEaWFsb2dDb25maWcsXHJcbiAgICBpc1JldHJ5OiBib29sZWFuLFxyXG4gICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgYXBpLmRpc3BsYXlEaWFsb2dBc3luYyhcclxuICAgICAgICB2aWV3ZXJVcmwsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgd2lkdGg6IGNvbmZpZy53aWR0aCxcclxuICAgICAgICAgIGhlaWdodDogY29uZmlnLmhlaWdodCxcclxuICAgICAgICAgIGRpc3BsYXlJbklmcmFtZTogZmFsc2UsXHJcbiAgICAgICAgICBwcm9tcHRCZWZvcmVPcGVuOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIChyZXN1bHQpID0+IHtcclxuICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgICAgICAvLyBPbiBmaXJzdCBhdHRlbXB0LCBpZiBPZmZpY2Ugc2F5cyBcImFscmVhZHkgb3BlbmVkXCIsIHJldHJ5IG9uY2VcclxuICAgICAgICAgICAgaWYgKHJlc3VsdC5lcnJvci5jb2RlID09PSBPUEVOX0VSUi5BTFJFQURZX09QRU5FRCAmJiAhaXNSZXRyeSkge1xyXG4gICAgICAgICAgICAgIGxvZ0RlYnVnKCdHb3QgMTIwMDcgKGFscmVhZHkgb3BlbmVkKSDigJQgcmV0cnlpbmcgYWZ0ZXIgZGVsYXknKTtcclxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudHJ5T3BlbihhcGksIHZpZXdlclVybCwgY29uZmlnLCB0cnVlKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbG9nRXJyb3IoJ2Rpc3BsYXlEaWFsb2dBc3luYyBmYWlsZWQ6JywgcmVzdWx0LmVycm9yLmNvZGUsIHJlc3VsdC5lcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgcmVqZWN0KHRoaXMubWFwT3BlbkVycm9yKHJlc3VsdC5lcnJvci5jb2RlKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmRpYWxvZyA9IHJlc3VsdC52YWx1ZTtcclxuXHJcbiAgICAgICAgICB0aGlzLmRpYWxvZy5hZGRFdmVudEhhbmRsZXIoXHJcbiAgICAgICAgICAgICdkaWFsb2dNZXNzYWdlUmVjZWl2ZWQnLFxyXG4gICAgICAgICAgICAoYXJnKSA9PiB0aGlzLmhhbmRsZU1lc3NhZ2UoYXJnKSxcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5kaWFsb2cuYWRkRXZlbnRIYW5kbGVyKFxyXG4gICAgICAgICAgICAnZGlhbG9nRXZlbnRSZWNlaXZlZCcsXHJcbiAgICAgICAgICAgIChhcmcpID0+IHRoaXMuaGFuZGxlRXZlbnQoYXJnKSxcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgbG9nRGVidWcoJ0RpYWxvZyBvcGVuZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIENsb3NlIHRoZSBkaWFsb2cgaWYgaXQgaXMgb3Blbi4gU2FmZSB0byBjYWxsIHdoZW4gYWxyZWFkeSBjbG9zZWQuICovXHJcbiAgY2xvc2UoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuZGlhbG9nKSByZXR1cm47XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLmRpYWxvZy5jbG9zZSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdFcnJvciBjbG9zaW5nIGRpYWxvZzonLCBlcnIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kaWFsb2cgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VuZCBhIG1lc3NhZ2UgZnJvbSB0aGUgaG9zdCAodGFza3BhbmUvY29tbWFuZHMpIHRvIHRoZSBkaWFsb2cuXHJcbiAgICogVXNlcyBEaWFsb2dBcGkgMS4yIGBtZXNzYWdlQ2hpbGQoKWAuIFJldHVybnMgZmFsc2UgaWYgbm90IHN1cHBvcnRlZC5cclxuICAgKi9cclxuICBzZW5kTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICghdGhpcy5kaWFsb2cpIHJldHVybiBmYWxzZTtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kaWFsb2cubWVzc2FnZUNoaWxkICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGxvZ0RlYnVnKCdtZXNzYWdlQ2hpbGQgbm90IGF2YWlsYWJsZSBvbiB0aGlzIE9mZmljZSB2ZXJzaW9uJyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuZGlhbG9nLm1lc3NhZ2VDaGlsZChtZXNzYWdlKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbG9nRXJyb3IoJ21lc3NhZ2VDaGlsZCBmYWlsZWQ6JywgZXJyKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIGRpYWxvZyBpcyBjdXJyZW50bHkgb3Blbi4gKi9cclxuICBpc09wZW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5kaWFsb2cgIT09IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKiogU3Vic2NyaWJlIHRvIG1lc3NhZ2VzIHNlbnQgZnJvbSB0aGUgdmlld2VyIHZpYSBgT2ZmaWNlLmNvbnRleHQudWkubWVzc2FnZVBhcmVudGAuICovXHJcbiAgb25NZXNzYWdlKGNhbGxiYWNrOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLm1lc3NhZ2VDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gIH1cclxuXHJcbiAgLyoqIFN1YnNjcmliZSB0byB0aGUgZGlhbG9nIGJlaW5nIGNsb3NlZCAoYnkgdXNlciBvciBuYXZpZ2F0aW9uIGVycm9yKS4gKi9cclxuICBvbkNsb3NlZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5jbG9zZWRDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gIH1cclxuXHJcbiAgLy8g4pSA4pSA4pSAIFByaXZhdGUgaGFuZGxlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4gIHByaXZhdGUgaGFuZGxlTWVzc2FnZShhcmc6IHsgbWVzc2FnZT86IHN0cmluZyB9KTogdm9pZCB7XHJcbiAgICBpZiAoYXJnLm1lc3NhZ2UgJiYgdGhpcy5tZXNzYWdlQ2FsbGJhY2spIHtcclxuICAgICAgdGhpcy5tZXNzYWdlQ2FsbGJhY2soYXJnLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVFdmVudChhcmc6IHsgZXJyb3I/OiBudW1iZXIgfSk6IHZvaWQge1xyXG4gICAgLy8gQWxsIERpYWxvZ0V2ZW50UmVjZWl2ZWQgY29kZXMgKDEyMDAyIGNsb3NlZCwgMTIwMDMgbWl4ZWQgY29udGVudCxcclxuICAgIC8vIDEyMDA2IGNyb3NzLWRvbWFpbikgbWVhbiB0aGUgZGlhbG9nIGlzIG5vIGxvbmdlciB1c2FibGUuXHJcbiAgICBsb2dEZWJ1ZygnRGlhbG9nIGV2ZW50IHJlY2VpdmVkLCBjb2RlOicsIGFyZy5lcnJvcik7XHJcbiAgICB0aGlzLmRpYWxvZyA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5jbG9zZWRDYWxsYmFjaykge1xyXG4gICAgICB0aGlzLmNsb3NlZENhbGxiYWNrKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG1hcE9wZW5FcnJvcihjb2RlOiBudW1iZXIpOiBEaWFsb2dFcnJvciB7XHJcbiAgICBzd2l0Y2ggKGNvZGUpIHtcclxuICAgICAgY2FzZSBPUEVOX0VSUi5BTFJFQURZX09QRU5FRDpcclxuICAgICAgICByZXR1cm4gbmV3IERpYWxvZ0Vycm9yKCdkaWFsb2dBbHJlYWR5T3BlbicsIGNvZGUpO1xyXG4gICAgICBjYXNlIE9QRU5fRVJSLlBPUFVQX0JMT0NLRUQ6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2dFcnJvcignZGlhbG9nQmxvY2tlZCcsIGNvZGUpO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nRXJyb3IoJ2Vycm9yR2VuZXJpYycsIGNvZGUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgbG9jYWxlc0RhdGEgZnJvbSAnLi4vaTE4bi9sb2NhbGVzLmpzb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgTG9jYWxlID0gJ2VuJyB8ICd6aCcgfCAnZXMnIHwgJ2RlJyB8ICdmcicgfCAnaXQnIHwgJ2FyJyB8ICdwdCcgfCAnaGknIHwgJ3J1JztcclxuZXhwb3J0IHR5cGUgVHJhbnNsYXRpb25LZXkgPSBrZXlvZiB0eXBlb2YgbG9jYWxlc0RhdGFbJ2VuJ107XHJcblxyXG4vKiogTWFwcyBhIEJDUCA0NyBsYW5ndWFnZSB0YWcgdG8gYSBzdXBwb3J0ZWQgTG9jYWxlLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbGUobGFuZ1RhZzogc3RyaW5nKTogTG9jYWxlIHtcclxuICBjb25zdCB0YWcgPSBsYW5nVGFnLnRvTG93ZXJDYXNlKCk7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCd6aCcpKSByZXR1cm4gJ3poJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2VzJykpIHJldHVybiAnZXMnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnZGUnKSkgcmV0dXJuICdkZSc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdmcicpKSByZXR1cm4gJ2ZyJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2l0JykpIHJldHVybiAnaXQnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnYXInKSkgcmV0dXJuICdhcic7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdwdCcpKSByZXR1cm4gJ3B0JztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2hpJykpIHJldHVybiAnaGknO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgncnUnKSkgcmV0dXJuICdydSc7XHJcbiAgcmV0dXJuICdlbic7XHJcbn1cclxuXHJcbmNsYXNzIEkxOG4ge1xyXG4gIHByaXZhdGUgbG9jYWxlOiBMb2NhbGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsaXN0ZW5lcnMgPSBuZXcgU2V0PCgpID0+IHZvaWQ+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5sb2NhbGUgPSB0aGlzLmRldGVjdExvY2FsZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkZXRlY3RMb2NhbGUoKTogTG9jYWxlIHtcclxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJykgcmV0dXJuICdlbic7XHJcbiAgICByZXR1cm4gcGFyc2VMb2NhbGUobmF2aWdhdG9yLmxhbmd1YWdlID8/ICdlbicpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFRyYW5zbGF0ZSBhIGtleSBpbiB0aGUgY3VycmVudCBsb2NhbGUuIEZhbGxzIGJhY2sgdG8gRW5nbGlzaCwgdGhlbiB0aGUga2V5IGl0c2VsZi4gKi9cclxuICB0KGtleTogVHJhbnNsYXRpb25LZXkpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgbG9jYWxlc0RhdGFbdGhpcy5sb2NhbGVdW2tleV0gPz9cclxuICAgICAgbG9jYWxlc0RhdGFbJ2VuJ11ba2V5XSA/P1xyXG4gICAgICBrZXlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRMb2NhbGUoKTogTG9jYWxlIHtcclxuICAgIHJldHVybiB0aGlzLmxvY2FsZTtcclxuICB9XHJcblxyXG4gIGdldEF2YWlsYWJsZUxvY2FsZXMoKTogTG9jYWxlW10ge1xyXG4gICAgcmV0dXJuIFsnZW4nLCAnemgnLCAnZXMnLCAnZGUnLCAnZnInLCAnaXQnLCAnYXInLCAncHQnLCAnaGknLCAncnUnXTtcclxuICB9XHJcblxyXG4gIC8qKiBTd2l0Y2ggbG9jYWxlIGFuZCBub3RpZnkgYWxsIGxpc3RlbmVycy4gKi9cclxuICBzZXRMb2NhbGUobG9jYWxlOiBMb2NhbGUpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmxvY2FsZSA9PT0gbG9jYWxlKSByZXR1cm47XHJcbiAgICB0aGlzLmxvY2FsZSA9IGxvY2FsZTtcclxuICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGZuKSA9PiBmbigpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnNjcmliZSB0byBsb2NhbGUgY2hhbmdlcy5cclxuICAgKiBAcmV0dXJucyBVbnN1YnNjcmliZSBmdW5jdGlvbi5cclxuICAgKi9cclxuICBvbkxvY2FsZUNoYW5nZShsaXN0ZW5lcjogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xyXG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcclxuICAgIHJldHVybiAoKSA9PiB0aGlzLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIFNpbmdsZXRvbiBpMThuIGluc3RhbmNlIHNoYXJlZCBhY3Jvc3MgdGhlIGFkZC1pbi4gKi9cclxuZXhwb3J0IGNvbnN0IGkxOG4gPSBuZXcgSTE4bigpO1xyXG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbmNvbnN0IFBSRUZJWCA9ICdbV2ViUFBUXSc7XHJcblxyXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXHJcblxyXG4vKiogTG9nIGRlYnVnIGluZm8g4oCUIG5vLW9wIGluIHByb2R1Y3Rpb24gYnVpbGRzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9nRGVidWcoLi4uYXJnczogdW5rbm93bltdKTogdm9pZCB7XHJcbiAgaWYgKERFQlVHKSBjb25zb2xlLmxvZyhQUkVGSVgsIC4uLmFyZ3MpO1xyXG59XHJcblxyXG4vKiogTG9nIHdhcm5pbmdzIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ1dhcm4oLi4uYXJnczogdW5rbm93bltdKTogdm9pZCB7XHJcbiAgaWYgKERFQlVHKSBjb25zb2xlLndhcm4oUFJFRklYLCAuLi5hcmdzKTtcclxufVxyXG5cclxuLyoqIExvZyBlcnJvcnMg4oCUIG5vLW9wIGluIHByb2R1Y3Rpb24gYnVpbGRzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9nRXJyb3IoLi4uYXJnczogdW5rbm93bltdKTogdm9pZCB7XHJcbiAgaWYgKERFQlVHKSBjb25zb2xlLmVycm9yKFBSRUZJWCwgLi4uYXJncyk7XHJcbn1cclxuXHJcbi8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xyXG5cclxuLyoqXHJcbiAqIEluc3RhbGwgYSBnbG9iYWwgaGFuZGxlciBmb3IgdW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9ucy5cclxuICogQ2FsbCBvbmNlIHBlciBlbnRyeSBwb2ludCAodGFza3BhbmUsIHZpZXdlciwgY29tbWFuZHMpLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxVbmhhbmRsZWRSZWplY3Rpb25IYW5kbGVyKCk6IHZvaWQge1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCAoZXZlbnQ6IFByb21pc2VSZWplY3Rpb25FdmVudCkgPT4ge1xyXG4gICAgbG9nRXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbjonLCBldmVudC5yZWFzb24pO1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxufVxyXG4iLCJpbXBvcnQgdHlwZSB7IExvY2FsZSB9IGZyb20gJy4vaTE4bic7XHJcbmltcG9ydCB7XHJcbiAgU0VUVElOR19LRVlfU0xJREVfUFJFRklYLFxyXG4gIFNFVFRJTkdfS0VZX0xBTkdVQUdFLFxyXG4gIFNFVFRJTkdfS0VZX0RFRkFVTFRTLFxyXG4gIERFRkFVTFRfWk9PTSxcclxuICBERUZBVUxUX0RJQUxPR19XSURUSCxcclxuICBERUZBVUxUX0RJQUxPR19IRUlHSFQsXHJcbiAgREVGQVVMVF9BVVRPX09QRU4sXHJcbiAgREVGQVVMVF9BVVRPX0NMT1NFX1NFQyxcclxuICBERUZBVUxUX0FVVE9fT1BFTl9ERUxBWV9TRUMsXHJcbiAgU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFUyxcclxuICBTRVRUSU5HU19TQVZFX1JFVFJZX0RFTEFZX01TLFxyXG59IGZyb20gJy4vY29uc3RhbnRzJztcclxuaW1wb3J0IHsgbG9nRGVidWcsIGxvZ0Vycm9yIH0gZnJvbSAnLi9sb2dnZXInO1xyXG5cclxuLy8g4pSA4pSA4pSAIFR5cGVzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBXZWJQUFRTbGlkZUNvbmZpZyB7XHJcbiAgdXJsOiBzdHJpbmc7XHJcbiAgem9vbTogbnVtYmVyOyAgICAgICAgICAvLyA1MOKAkzMwMFxyXG4gIGRpYWxvZ1dpZHRoOiBudW1iZXI7ICAgLy8gMzDigJMxMDAgKCUgb2Ygc2NyZWVuKVxyXG4gIGRpYWxvZ0hlaWdodDogbnVtYmVyOyAgLy8gMzDigJMxMDAgKCUgb2Ygc2NyZWVuKVxyXG4gIGF1dG9PcGVuOiBib29sZWFuO1xyXG4gIGF1dG9PcGVuRGVsYXlTZWM6IG51bWJlcjsgIC8vIDAgPSBpbW1lZGlhdGUsIDHigJM2MCBzZWNvbmRzIGRlbGF5IGJlZm9yZSBvcGVuaW5nXHJcbiAgYXV0b0Nsb3NlU2VjOiBudW1iZXI7ICAvLyAwID0gZGlzYWJsZWQsIDHigJM2MCBzZWNvbmRzXHJcbn1cclxuXHJcbmludGVyZmFjZSBTYXZlUmVzdWx0IHtcclxuICBzdGF0dXM6IHN0cmluZztcclxuICBlcnJvcjogeyBtZXNzYWdlOiBzdHJpbmcgfSB8IG51bGw7XHJcbn1cclxuXHJcbi8qKiBNaW5pbWFsIHN1YnNldCBvZiBPZmZpY2UuU2V0dGluZ3MgdXNlZCBieSB0aGlzIG1vZHVsZS4gKi9cclxuaW50ZXJmYWNlIFNldHRpbmdzU3RvcmUge1xyXG4gIGdldChuYW1lOiBzdHJpbmcpOiB1bmtub3duO1xyXG4gIHNldChuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZDtcclxuICByZW1vdmUobmFtZTogc3RyaW5nKTogdm9pZDtcclxuICBzYXZlQXN5bmMoY2FsbGJhY2s6IChyZXN1bHQ6IFNhdmVSZXN1bHQpID0+IHZvaWQpOiB2b2lkO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVwZW5kZW5jeSBpbmplY3Rpb24gKGZvciB0ZXN0aW5nKSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmxldCBfaW5qZWN0ZWRTdG9yZTogU2V0dGluZ3NTdG9yZSB8IG51bGwgPSBudWxsO1xyXG5cclxuLyoqXHJcbiAqIE92ZXJyaWRlIHRoZSBPZmZpY2Ugc2V0dGluZ3Mgc3RvcmUuIFBhc3MgYG51bGxgIHRvIHJlc3RvcmUgdGhlIHJlYWwgb25lLlxyXG4gKiBAaW50ZXJuYWwgVXNlZCBpbiB1bml0IHRlc3RzIG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX2luamVjdFNldHRpbmdzU3RvcmUoc3RvcmU6IFNldHRpbmdzU3RvcmUgfCBudWxsKTogdm9pZCB7XHJcbiAgX2luamVjdGVkU3RvcmUgPSBzdG9yZTtcclxufVxyXG5cclxuLyoqIEluLW1lbW9yeSBmYWxsYmFjayB3aGVuIHJ1bm5pbmcgb3V0c2lkZSBQb3dlclBvaW50IChlLmcuIGJyb3dzZXIgdGVzdGluZykuICovXHJcbmNvbnN0IF9tZW1vcnlTdG9yZTogU2V0dGluZ3NTdG9yZSA9ICgoKSA9PiB7XHJcbiAgY29uc3QgZGF0YSA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpO1xyXG4gIHJldHVybiB7XHJcbiAgICBnZXQ6IChuYW1lOiBzdHJpbmcpID0+IGRhdGEuZ2V0KG5hbWUpID8/IG51bGwsXHJcbiAgICBzZXQ6IChuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSA9PiB7IGRhdGEuc2V0KG5hbWUsIHZhbHVlKTsgfSxcclxuICAgIHJlbW92ZTogKG5hbWU6IHN0cmluZykgPT4geyBkYXRhLmRlbGV0ZShuYW1lKTsgfSxcclxuICAgIHNhdmVBc3luYzogKGNiOiAocjogU2F2ZVJlc3VsdCkgPT4gdm9pZCkgPT4geyBjYih7IHN0YXR1czogJ3N1Y2NlZWRlZCcsIGVycm9yOiBudWxsIH0pOyB9LFxyXG4gIH07XHJcbn0pKCk7XHJcblxyXG5mdW5jdGlvbiBnZXRTdG9yZSgpOiBTZXR0aW5nc1N0b3JlIHtcclxuICBpZiAoX2luamVjdGVkU3RvcmUpIHJldHVybiBfaW5qZWN0ZWRTdG9yZTtcclxuICAvKiBnbG9iYWwgT2ZmaWNlICovXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNldHRpbmdzID0gT2ZmaWNlLmNvbnRleHQ/LmRvY3VtZW50Py5zZXR0aW5ncztcclxuICAgIGlmIChzZXR0aW5ncykgcmV0dXJuIHNldHRpbmdzIGFzIHVua25vd24gYXMgU2V0dGluZ3NTdG9yZTtcclxuICB9IGNhdGNoIHsgLyogb3V0c2lkZSBPZmZpY2UgaG9zdCAqLyB9XHJcbiAgcmV0dXJuIF9tZW1vcnlTdG9yZTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEludGVybmFsIGhlbHBlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBzbGlkZUtleShzbGlkZUlkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBgJHtTRVRUSU5HX0tFWV9TTElERV9QUkVGSVh9JHtzbGlkZUlkfWA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVPbmNlKHN0b3JlOiBTZXR0aW5nc1N0b3JlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIHN0b3JlLnNhdmVBc3luYygocmVzdWx0KSA9PiB7XHJcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IocmVzdWx0LmVycm9yPy5tZXNzYWdlID8/ICdTZXR0aW5ncyBzYXZlIGZhaWxlZCcpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkZWxheShtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYXZlIHNldHRpbmdzIHdpdGggYXV0b21hdGljIHJldHJ5LlxyXG4gKiBSZXRyaWVzIHVwIHRvIHtAbGluayBTRVRUSU5HU19TQVZFX01BWF9SRVRSSUVTfSB0aW1lcyB3aXRoIGEgZGVsYXkgYmV0d2VlbiBhdHRlbXB0cy5cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmUoc3RvcmU6IFNldHRpbmdzU3RvcmUpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8PSBTRVRUSU5HU19TQVZFX01BWF9SRVRSSUVTOyBhdHRlbXB0KyspIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHNhdmVPbmNlKHN0b3JlKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGlmIChhdHRlbXB0IDwgU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFUykge1xyXG4gICAgICAgIGxvZ0RlYnVnKGBTZXR0aW5ncyBzYXZlIGF0dGVtcHQgJHthdHRlbXB0ICsgMX0gZmFpbGVkLCByZXRyeWluZy4uLmApO1xyXG4gICAgICAgIGF3YWl0IGRlbGF5KFNFVFRJTkdTX1NBVkVfUkVUUllfREVMQVlfTVMpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxvZ0Vycm9yKCdTZXR0aW5ncyBzYXZlIGZhaWxlZCBhZnRlciBhbGwgcmV0cmllczonLCBlcnIpO1xyXG4gICAgICAgIHRocm93IGVycjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNsaWRlIGNvbmZpZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBSZXR1cm5zIHRoZSBzYXZlZCBjb25maWcgZm9yIGEgc2xpZGUsIG9yIGBudWxsYCBpZiBub3Qgc2V0LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2xpZGVDb25maWcoc2xpZGVJZDogc3RyaW5nKTogV2ViUFBUU2xpZGVDb25maWcgfCBudWxsIHtcclxuICBjb25zdCByYXcgPSBnZXRTdG9yZSgpLmdldChzbGlkZUtleShzbGlkZUlkKSk7XHJcbiAgcmV0dXJuIHJhdyA/IChyYXcgYXMgV2ViUFBUU2xpZGVDb25maWcpIDogbnVsbDtcclxufVxyXG5cclxuLyoqIFNhdmVzIGNvbmZpZyBmb3IgYSBzbGlkZSBhbmQgcGVyc2lzdHMgdG8gZG9jdW1lbnQuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTbGlkZUNvbmZpZyhzbGlkZUlkOiBzdHJpbmcsIGNvbmZpZzogV2ViUFBUU2xpZGVDb25maWcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBzdG9yZSA9IGdldFN0b3JlKCk7XHJcbiAgc3RvcmUuc2V0KHNsaWRlS2V5KHNsaWRlSWQpLCBjb25maWcpO1xyXG4gIGF3YWl0IHNhdmUoc3RvcmUpO1xyXG59XHJcblxyXG4vKiogUmVtb3ZlcyB0aGUgc2F2ZWQgY29uZmlnIGZvciBhIHNsaWRlLiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlU2xpZGVDb25maWcoc2xpZGVJZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnJlbW92ZShzbGlkZUtleShzbGlkZUlkKSk7XHJcbiAgYXdhaXQgc2F2ZShzdG9yZSk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBMYW5ndWFnZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBSZXR1cm5zIHRoZSBzYXZlZCBVSSBsYW5ndWFnZSwgb3IgYG51bGxgIGlmIG5vdCBzZXQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRMYW5ndWFnZSgpOiBMb2NhbGUgfCBudWxsIHtcclxuICByZXR1cm4gKGdldFN0b3JlKCkuZ2V0KFNFVFRJTkdfS0VZX0xBTkdVQUdFKSBhcyBMb2NhbGUpID8/IG51bGw7XHJcbn1cclxuXHJcbi8qKiBTYXZlcyB0aGUgVUkgbGFuZ3VhZ2UgYW5kIHBlcnNpc3RzIHRvIGRvY3VtZW50LiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0TGFuZ3VhZ2UobG9jYWxlOiBMb2NhbGUpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBzdG9yZSA9IGdldFN0b3JlKCk7XHJcbiAgc3RvcmUuc2V0KFNFVFRJTkdfS0VZX0xBTkdVQUdFLCBsb2NhbGUpO1xyXG4gIGF3YWl0IHNhdmUoc3RvcmUpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVmYXVsdHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUmV0dXJucyBzYXZlZCBnbG9iYWwgZGVmYXVsdHMsIG9yIGJ1aWx0LWluIGRlZmF1bHRzIGlmIG5vdCBzZXQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0cygpOiBXZWJQUFRTbGlkZUNvbmZpZyB7XHJcbiAgY29uc3Qgc3RvcmVkID0gZ2V0U3RvcmUoKS5nZXQoU0VUVElOR19LRVlfREVGQVVMVFMpIGFzIFdlYlBQVFNsaWRlQ29uZmlnIHwgbnVsbDtcclxuICByZXR1cm4gc3RvcmVkID8/IHtcclxuICAgIHVybDogJycsXHJcbiAgICB6b29tOiBERUZBVUxUX1pPT00sXHJcbiAgICBkaWFsb2dXaWR0aDogREVGQVVMVF9ESUFMT0dfV0lEVEgsXHJcbiAgICBkaWFsb2dIZWlnaHQ6IERFRkFVTFRfRElBTE9HX0hFSUdIVCxcclxuICAgIGF1dG9PcGVuOiBERUZBVUxUX0FVVE9fT1BFTixcclxuICAgIGF1dG9PcGVuRGVsYXlTZWM6IERFRkFVTFRfQVVUT19PUEVOX0RFTEFZX1NFQyxcclxuICAgIGF1dG9DbG9zZVNlYzogREVGQVVMVF9BVVRPX0NMT1NFX1NFQyxcclxuICB9O1xyXG59XHJcblxyXG4vKiogU2F2ZXMgZ2xvYmFsIGRlZmF1bHRzIGFuZCBwZXJzaXN0cyB0byBkb2N1bWVudC4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldERlZmF1bHRzKGNvbmZpZzogV2ViUFBUU2xpZGVDb25maWcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBzdG9yZSA9IGdldFN0b3JlKCk7XHJcbiAgc3RvcmUuc2V0KFNFVFRJTkdfS0VZX0RFRkFVTFRTLCBjb25maWcpO1xyXG4gIGF3YWl0IHNhdmUoc3RvcmUpO1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGkxOG4sIHR5cGUgTG9jYWxlLCB0eXBlIFRyYW5zbGF0aW9uS2V5IH0gZnJvbSAnLi4vc2hhcmVkL2kxOG4nO1xyXG5pbXBvcnQgeyBnZXRTbGlkZUNvbmZpZywgc2V0U2xpZGVDb25maWcsIGdldExhbmd1YWdlLCBzZXRMYW5ndWFnZSwgZ2V0RGVmYXVsdHMsIHNldERlZmF1bHRzIH0gZnJvbSAnLi4vc2hhcmVkL3NldHRpbmdzJztcclxuaW1wb3J0IHsgRGlhbG9nTGF1bmNoZXIsIERpYWxvZ0Vycm9yIH0gZnJvbSAnLi4vc2hhcmVkL2RpYWxvZy1sYXVuY2hlcic7XHJcbmltcG9ydCB7IGxvZ0RlYnVnLCBsb2dFcnJvciwgaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIgfSBmcm9tICcuLi9zaGFyZWQvbG9nZ2VyJztcclxuaW1wb3J0IHsgQVVUT19DTE9TRV9TVEVQUywgQVVUT19PUEVOX0RFTEFZX1NURVBTLCB0cnVuY2F0ZVVybCB9IGZyb20gJy4uL3NoYXJlZC9jb25zdGFudHMnO1xyXG5cclxuLy8g4pSA4pSA4pSAIERPTSByZWZlcmVuY2VzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuY29uc3QgJCA9IDxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KGlkOiBzdHJpbmcpOiBUID0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIGFzIFQ7XHJcblxyXG5sZXQgdXJsSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBidG5BcHBseTogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbmxldCBidG5TaG93OiBIVE1MQnV0dG9uRWxlbWVudDtcclxubGV0IGJ0bkRlZmF1bHRzITogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbmxldCBzdGF0dXNFbDogSFRNTEVsZW1lbnQ7XHJcbmxldCBzbGlkZU51bWJlckVsOiBIVE1MRWxlbWVudDtcclxubGV0IGxhbmdTZWxlY3Q6IEhUTUxTZWxlY3RFbGVtZW50O1xyXG5sZXQgc2xpZGVyV2lkdGghOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVySGVpZ2h0ITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlclpvb20hOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVyV2lkdGhWYWx1ZSE6IEhUTUxFbGVtZW50O1xyXG5sZXQgc2xpZGVySGVpZ2h0VmFsdWUhOiBIVE1MRWxlbWVudDtcclxubGV0IHNsaWRlclpvb21WYWx1ZSE6IEhUTUxFbGVtZW50O1xyXG5sZXQgc2l6ZVByZXZpZXdJbm5lciE6IEhUTUxFbGVtZW50O1xyXG5sZXQgY2hrQXV0b09wZW4hOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgY2hrTG9ja1NpemUhOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVyQXV0b09wZW5EZWxheSE6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJBdXRvT3BlbkRlbGF5VmFsdWUhOiBIVE1MRWxlbWVudDtcclxubGV0IHNlY3Rpb25BdXRvT3BlbkRlbGF5ITogSFRNTEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJBdXRvQ2xvc2UhOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVyQXV0b0Nsb3NlVmFsdWUhOiBIVE1MRWxlbWVudDtcclxubGV0IHByZXNldEJ1dHRvbnMhOiBOb2RlTGlzdE9mPEhUTUxCdXR0b25FbGVtZW50PjtcclxubGV0IHZpZXdlclN0YXR1c0VsITogSFRNTEVsZW1lbnQ7XHJcbmxldCB2aWV3ZXJTdGF0dXNUZXh0ITogSFRNTEVsZW1lbnQ7XHJcblxyXG4vLyDilIDilIDilIAgU3RhdGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5sZXQgY3VycmVudFNsaWRlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5sZXQgY3VycmVudFNsaWRlSW5kZXg6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5jb25zdCBsYXVuY2hlciA9IG5ldyBEaWFsb2dMYXVuY2hlcigpO1xyXG5sZXQgdmlld2VyU3RhdHVzVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XHJcblxyXG4vLyDilIDilIDilIAgaTE4biDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIGFwcGx5STE4bigpOiB2b2lkIHtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignW2RhdGEtaTE4bl0nKS5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgY29uc3Qga2V5ID0gZWwuZGF0YXNldC5pMThuIGFzIFRyYW5zbGF0aW9uS2V5O1xyXG4gICAgZWwudGV4dENvbnRlbnQgPSBpMThuLnQoa2V5KTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PignW2RhdGEtaTE4bi1wbGFjZWhvbGRlcl0nKS5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgY29uc3Qga2V5ID0gZWwuZGF0YXNldC5pMThuUGxhY2Vob2xkZXIgYXMgVHJhbnNsYXRpb25LZXk7XHJcbiAgICBlbC5wbGFjZWhvbGRlciA9IGkxOG4udChrZXkpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignW2RhdGEtaTE4bi10aXRsZV0nKS5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgY29uc3Qga2V5ID0gZWwuZGF0YXNldC5pMThuVGl0bGUgYXMgVHJhbnNsYXRpb25LZXk7XHJcbiAgICBlbC50aXRsZSA9IGkxOG4udChrZXkpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBLZWVwIDxodG1sIGxhbmc+IGluIHN5bmMgd2l0aCB0aGUgYWN0aXZlIGxvY2FsZVxyXG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5sYW5nID0gaTE4bi5nZXRMb2NhbGUoKTtcclxuXHJcbiAgLy8gR3VpZGUgdG9nZ2xlIGJ1dHRvbiB1c2VzIGRhdGEtaTE4bj1cInNpdGVOb3RMb2FkaW5nXCIsIGJ1dCB3aGVuIHRoZSBndWlkZVxyXG4gIC8vIGlzIGN1cnJlbnRseSBvcGVuIHRoZSBsYWJlbCBzaG91bGQgcmVhZCBcImhpZGVTZXR1cEd1aWRlXCIgaW5zdGVhZC5cclxuICBjb25zdCBndWlkZVNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ3VpZGUtc2VjdGlvbicpO1xyXG4gIGlmIChndWlkZVNlY3Rpb24gJiYgIWd1aWRlU2VjdGlvbi5oaWRkZW4pIHtcclxuICAgIGNvbnN0IHRvZ2dsZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tZ3VpZGUtdG9nZ2xlJyk7XHJcbiAgICBpZiAodG9nZ2xlQnRuKSB7XHJcbiAgICAgIHRvZ2dsZUJ0bi50ZXh0Q29udGVudCA9IGkxOG4udCgnaGlkZVNldHVwR3VpZGUnKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTbGlkZSBkZXRlY3Rpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5hc3luYyBmdW5jdGlvbiBkZXRlY3RDdXJyZW50U2xpZGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IFBvd2VyUG9pbnQucnVuKGFzeW5jIChjb250ZXh0KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNsaWRlcyA9IGNvbnRleHQucHJlc2VudGF0aW9uLmdldFNlbGVjdGVkU2xpZGVzKCk7XHJcbiAgICAgIHNsaWRlcy5sb2FkKCdpdGVtcy9pZCcpO1xyXG4gICAgICBhd2FpdCBjb250ZXh0LnN5bmMoKTtcclxuXHJcbiAgICAgIGlmIChzbGlkZXMuaXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHNsaWRlID0gc2xpZGVzLml0ZW1zWzBdO1xyXG4gICAgICAgIGN1cnJlbnRTbGlkZUlkID0gc2xpZGUuaWQ7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSAxLWJhc2VkIGluZGV4XHJcbiAgICAgICAgY29uc3QgYWxsU2xpZGVzID0gY29udGV4dC5wcmVzZW50YXRpb24uc2xpZGVzO1xyXG4gICAgICAgIGFsbFNsaWRlcy5sb2FkKCdpdGVtcy9pZCcpO1xyXG4gICAgICAgIGF3YWl0IGNvbnRleHQuc3luYygpO1xyXG5cclxuICAgICAgICBjdXJyZW50U2xpZGVJbmRleCA9IG51bGw7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxTbGlkZXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChhbGxTbGlkZXMuaXRlbXNbaV0uaWQgPT09IGN1cnJlbnRTbGlkZUlkKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTbGlkZUluZGV4ID0gaSArIDE7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICBjdXJyZW50U2xpZGVJZCA9IG51bGw7XHJcbiAgICBjdXJyZW50U2xpZGVJbmRleCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVTbGlkZVVJKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVNpemVQcmV2aWV3KCk6IHZvaWQge1xyXG4gIGNvbnN0IHcgPSBOdW1iZXIoc2xpZGVyV2lkdGgudmFsdWUpO1xyXG4gIGNvbnN0IGggPSBOdW1iZXIoc2xpZGVySGVpZ2h0LnZhbHVlKTtcclxuICAvLyBQcmV2aWV3IGJveCBpcyA2NMOXNDg7IHNjYWxlIHByb3BvcnRpb25hbGx5XHJcbiAgc2l6ZVByZXZpZXdJbm5lci5zdHlsZS53aWR0aCA9IGAkeyh3IC8gMTAwKSAqIDU4fXB4YDtcclxuICBzaXplUHJldmlld0lubmVyLnN0eWxlLmhlaWdodCA9IGAkeyhoIC8gMTAwKSAqIDQyfXB4YDtcclxufVxyXG5cclxuZnVuY3Rpb24gZm9ybWF0QXV0b0Nsb3NlTGFiZWwoc2VjOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gIGlmIChzZWMgPT09IDApIHJldHVybiBpMThuLnQoJ2F1dG9DbG9zZU9mZicpO1xyXG4gIGNvbnN0IHN1ID0gaTE4bi50KCd1bml0U2VjJyk7XHJcbiAgY29uc3QgbXUgPSBpMThuLnQoJ3VuaXRNaW4nKTtcclxuICBpZiAoc2VjIDwgNjApIHJldHVybiBgJHtzZWN9JHtzdX1gO1xyXG4gIGNvbnN0IG1pbnMgPSBNYXRoLmZsb29yKHNlYyAvIDYwKTtcclxuICBjb25zdCBzZWNzID0gc2VjICUgNjA7XHJcbiAgaWYgKHNlYyA+PSAzNjAwKSByZXR1cm4gYCR7TWF0aC5mbG9vcihzZWMgLyAzNjAwKX0ke2kxOG4udCgndW5pdEhvdXInKX1gO1xyXG4gIHJldHVybiBzZWNzID09PSAwID8gYCR7bWluc30ke211fWAgOiBgJHttaW5zfSR7bXV9ICR7c2Vjc30ke3N1fWA7XHJcbn1cclxuXHJcbi8qKiBDb252ZXJ0IHNlY29uZHMgdmFsdWUg4oaSIG5lYXJlc3Qgc2xpZGVyIGluZGV4LiAqL1xyXG5mdW5jdGlvbiBzZWNvbmRzVG9TbGlkZXJJbmRleChzZWM6IG51bWJlcik6IG51bWJlciB7XHJcbiAgbGV0IGJlc3QgPSAwO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgQVVUT19DTE9TRV9TVEVQUy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKE1hdGguYWJzKEFVVE9fQ0xPU0VfU1RFUFNbaV0gLSBzZWMpIDwgTWF0aC5hYnMoQVVUT19DTE9TRV9TVEVQU1tiZXN0XSAtIHNlYykpIHtcclxuICAgICAgYmVzdCA9IGk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBiZXN0O1xyXG59XHJcblxyXG4vKiogUmVhZCBhY3R1YWwgc2Vjb25kcyBmcm9tIHRoZSBjdXJyZW50IHNsaWRlciBwb3NpdGlvbi4gKi9cclxuZnVuY3Rpb24gZ2V0QXV0b0Nsb3NlU2Vjb25kcygpOiBudW1iZXIge1xyXG4gIHJldHVybiBBVVRPX0NMT1NFX1NURVBTW051bWJlcihzbGlkZXJBdXRvQ2xvc2UudmFsdWUpXSA/PyAwO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQXV0by1vcGVuIGRlbGF5IGhlbHBlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBmb3JtYXRBdXRvT3BlbkRlbGF5TGFiZWwoc2VjOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gIGlmIChzZWMgPT09IDApIHJldHVybiBpMThuLnQoJ2F1dG9PcGVuRGVsYXlJbW1lZGlhdGUnKTtcclxuICBjb25zdCBzdSA9IGkxOG4udCgndW5pdFNlYycpO1xyXG4gIGNvbnN0IG11ID0gaTE4bi50KCd1bml0TWluJyk7XHJcbiAgaWYgKHNlYyA8IDYwKSByZXR1cm4gYCR7c2VjfSR7c3V9YDtcclxuICBjb25zdCBtaW5zID0gTWF0aC5mbG9vcihzZWMgLyA2MCk7XHJcbiAgY29uc3Qgc2VjcyA9IHNlYyAlIDYwO1xyXG4gIHJldHVybiBzZWNzID09PSAwID8gYCR7bWluc30ke211fWAgOiBgJHttaW5zfSR7bXV9ICR7c2Vjc30ke3N1fWA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlY29uZHNUb0RlbGF5U2xpZGVySW5kZXgoc2VjOiBudW1iZXIpOiBudW1iZXIge1xyXG4gIGxldCBiZXN0ID0gMDtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IEFVVE9fT1BFTl9ERUxBWV9TVEVQUy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKE1hdGguYWJzKEFVVE9fT1BFTl9ERUxBWV9TVEVQU1tpXSAtIHNlYykgPCBNYXRoLmFicyhBVVRPX09QRU5fREVMQVlfU1RFUFNbYmVzdF0gLSBzZWMpKSB7XHJcbiAgICAgIGJlc3QgPSBpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYmVzdDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXV0b09wZW5EZWxheVNlY29uZHMoKTogbnVtYmVyIHtcclxuICByZXR1cm4gQVVUT19PUEVOX0RFTEFZX1NURVBTW051bWJlcihzbGlkZXJBdXRvT3BlbkRlbGF5LnZhbHVlKV0gPz8gMDtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQXV0b09wZW5EZWxheVZpc2liaWxpdHkoKTogdm9pZCB7XHJcbiAgc2VjdGlvbkF1dG9PcGVuRGVsYXkuaGlkZGVuID0gIWNoa0F1dG9PcGVuLmNoZWNrZWQ7XHJcbn1cclxuXHJcbi8qKiBSZS1yZW5kZXIgYWxsIGR5bmFtaWNhbGx5LXNldCBzbGlkZXIgdmFsdWUgbGFiZWxzIChjYWxsZWQgYWZ0ZXIgbGFuZ3VhZ2UgY2hhbmdlKS4gKi9cclxuZnVuY3Rpb24gcmVmcmVzaFNsaWRlckxhYmVscygpOiB2b2lkIHtcclxuICBzbGlkZXJXaWR0aFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVyV2lkdGgudmFsdWV9JWA7XHJcbiAgc2xpZGVySGVpZ2h0VmFsdWUudGV4dENvbnRlbnQgPSBgJHtzbGlkZXJIZWlnaHQudmFsdWV9JWA7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVyWm9vbS52YWx1ZX0lYDtcclxuICBzbGlkZXJBdXRvQ2xvc2VWYWx1ZS50ZXh0Q29udGVudCA9IGZvcm1hdEF1dG9DbG9zZUxhYmVsKGdldEF1dG9DbG9zZVNlY29uZHMoKSk7XHJcbiAgc2xpZGVyQXV0b09wZW5EZWxheVZhbHVlLnRleHRDb250ZW50ID0gZm9ybWF0QXV0b09wZW5EZWxheUxhYmVsKGdldEF1dG9PcGVuRGVsYXlTZWNvbmRzKCkpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGVyIFVJIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gc2V0U2xpZGVyVUkod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHpvb206IG51bWJlciwgYXV0b09wZW46IGJvb2xlYW4sIGF1dG9PcGVuRGVsYXlTZWM6IG51bWJlciwgYXV0b0Nsb3NlU2VjOiBudW1iZXIpOiB2b2lkIHtcclxuICBzbGlkZXJXaWR0aC52YWx1ZSA9IFN0cmluZyh3aWR0aCk7XHJcbiAgc2xpZGVySGVpZ2h0LnZhbHVlID0gU3RyaW5nKGhlaWdodCk7XHJcbiAgc2xpZGVyWm9vbS52YWx1ZSA9IFN0cmluZyh6b29tKTtcclxuICBzbGlkZXJXaWR0aFZhbHVlLnRleHRDb250ZW50ID0gYCR7d2lkdGh9JWA7XHJcbiAgc2xpZGVySGVpZ2h0VmFsdWUudGV4dENvbnRlbnQgPSBgJHtoZWlnaHR9JWA7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7em9vbX0lYDtcclxuICBjaGtBdXRvT3Blbi5jaGVja2VkID0gYXV0b09wZW47XHJcbiAgc2xpZGVyQXV0b09wZW5EZWxheS52YWx1ZSA9IFN0cmluZyhzZWNvbmRzVG9EZWxheVNsaWRlckluZGV4KGF1dG9PcGVuRGVsYXlTZWMpKTtcclxuICBzbGlkZXJBdXRvT3BlbkRlbGF5VmFsdWUudGV4dENvbnRlbnQgPSBmb3JtYXRBdXRvT3BlbkRlbGF5TGFiZWwoYXV0b09wZW5EZWxheVNlYyk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlLnZhbHVlID0gU3RyaW5nKHNlY29uZHNUb1NsaWRlckluZGV4KGF1dG9DbG9zZVNlYykpO1xyXG4gIHNsaWRlckF1dG9DbG9zZVZhbHVlLnRleHRDb250ZW50ID0gZm9ybWF0QXV0b0Nsb3NlTGFiZWwoYXV0b0Nsb3NlU2VjKTtcclxuICB1cGRhdGVBdXRvT3BlbkRlbGF5VmlzaWJpbGl0eSgpO1xyXG4gIHVwZGF0ZVNpemVQcmV2aWV3KCk7XHJcbiAgdXBkYXRlQWN0aXZlUHJlc2V0KHpvb20pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVBY3RpdmVQcmVzZXQoem9vbTogbnVtYmVyKTogdm9pZCB7XHJcbiAgcHJlc2V0QnV0dG9ucy5mb3JFYWNoKChidG4pID0+IHtcclxuICAgIGNvbnN0IHZhbCA9IE51bWJlcihidG4uZGF0YXNldC56b29tKTtcclxuICAgIGJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdidG4tcHJlc2V0LS1hY3RpdmUnLCB2YWwgPT09IHpvb20pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVTbGlkZVVJKCk6IHZvaWQge1xyXG4gIHNsaWRlTnVtYmVyRWwudGV4dENvbnRlbnQgPSBjdXJyZW50U2xpZGVJbmRleCAhPSBudWxsID8gU3RyaW5nKGN1cnJlbnRTbGlkZUluZGV4KSA6ICfigJQnO1xyXG5cclxuICBjb25zdCBkZWZhdWx0cyA9IGdldERlZmF1bHRzKCk7XHJcblxyXG4gIGlmIChjdXJyZW50U2xpZGVJZCkge1xyXG4gICAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQpO1xyXG4gICAgdXJsSW5wdXQudmFsdWUgPSBjb25maWc/LnVybCA/PyAnJztcclxuICAgIHNldFNsaWRlclVJKFxyXG4gICAgICBjb25maWc/LmRpYWxvZ1dpZHRoID8/IGRlZmF1bHRzLmRpYWxvZ1dpZHRoLFxyXG4gICAgICBjb25maWc/LmRpYWxvZ0hlaWdodCA/PyBkZWZhdWx0cy5kaWFsb2dIZWlnaHQsXHJcbiAgICAgIGNvbmZpZz8uem9vbSA/PyBkZWZhdWx0cy56b29tLFxyXG4gICAgICBjb25maWc/LmF1dG9PcGVuID8/IGRlZmF1bHRzLmF1dG9PcGVuLFxyXG4gICAgICBjb25maWc/LmF1dG9PcGVuRGVsYXlTZWMgPz8gZGVmYXVsdHMuYXV0b09wZW5EZWxheVNlYyxcclxuICAgICAgY29uZmlnPy5hdXRvQ2xvc2VTZWMgPz8gZGVmYXVsdHMuYXV0b0Nsb3NlU2VjLFxyXG4gICAgKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdXJsSW5wdXQudmFsdWUgPSAnJztcclxuICAgIHNldFNsaWRlclVJKGRlZmF1bHRzLmRpYWxvZ1dpZHRoLCBkZWZhdWx0cy5kaWFsb2dIZWlnaHQsIGRlZmF1bHRzLnpvb20sIGRlZmF1bHRzLmF1dG9PcGVuLCBkZWZhdWx0cy5hdXRvT3BlbkRlbGF5U2VjLCBkZWZhdWx0cy5hdXRvQ2xvc2VTZWMpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlU2hvd0J1dHRvblN0YXRlKCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBVUkwgdmFsaWRhdGlvbiAmIG5vcm1hbGl6YXRpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogQXV0by1wcmVwZW5kIGBodHRwczovL2AgaWYgdGhlIHVzZXIgb21pdHRlZCB0aGUgcHJvdG9jb2wuXHJcbiAqIFJldHVybnMgdGhlIG5vcm1hbGl6ZWQgVVJMIHN0cmluZy5cclxuICovXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCB0cmltbWVkID0gdmFsdWUudHJpbSgpO1xyXG4gIGlmICghdHJpbW1lZCkgcmV0dXJuIHRyaW1tZWQ7XHJcbiAgaWYgKCEvXmh0dHBzPzpcXC9cXC8vaS50ZXN0KHRyaW1tZWQpKSB7XHJcbiAgICByZXR1cm4gYGh0dHBzOi8vJHt0cmltbWVkfWA7XHJcbiAgfVxyXG4gIHJldHVybiB0cmltbWVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1ZhbGlkVXJsKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICBpZiAoIXZhbHVlLnRyaW0oKSkgcmV0dXJuIGZhbHNlO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB1ID0gbmV3IFVSTCh2YWx1ZSk7XHJcbiAgICByZXR1cm4gdS5wcm90b2NvbCA9PT0gJ2h0dHA6JyB8fCB1LnByb3RvY29sID09PSAnaHR0cHM6JztcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTdGF0dXMgbWVzc2FnZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBzaG93U3RhdHVzKGtleTogVHJhbnNsYXRpb25LZXksIHR5cGU6ICdzdWNjZXNzJyB8ICdlcnJvcicpOiB2b2lkIHtcclxuICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IGkxOG4udChrZXkpO1xyXG4gIHN0YXR1c0VsLmNsYXNzTmFtZSA9IGBzdGF0dXMgc3RhdHVzLSR7dHlwZX1gO1xyXG4gIHN0YXR1c0VsLnNldEF0dHJpYnV0ZSgncm9sZScsIHR5cGUgPT09ICdlcnJvcicgPyAnYWxlcnQnIDogJ3N0YXR1cycpO1xyXG4gIHN0YXR1c0VsLmhpZGRlbiA9IGZhbHNlO1xyXG5cclxuICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIHN0YXR1c0VsLmhpZGRlbiA9IHRydWU7XHJcbiAgfSwgMzAwMCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTaG93IGJ1dHRvbiBzdGF0ZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBEaXNhYmxlIFwiU2hvdyBXZWIgUGFnZVwiIHdoZW4gdGhlcmUgaXMgbm8gc2F2ZWQgVVJMIGZvciB0aGUgY3VycmVudCBzbGlkZS4gKi9cclxuZnVuY3Rpb24gdXBkYXRlU2hvd0J1dHRvblN0YXRlKCk6IHZvaWQge1xyXG4gIGNvbnN0IGhhc1VybCA9IGN1cnJlbnRTbGlkZUlkXHJcbiAgICA/ICEhZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQpPy51cmxcclxuICAgIDogZmFsc2U7XHJcbiAgYnRuU2hvdy5kaXNhYmxlZCA9ICFoYXNVcmw7XHJcbiAgYnRuU2hvdy50aXRsZSA9IGhhc1VybFxyXG4gICAgPyB0cnVuY2F0ZVVybChnZXRTbGlkZUNvbmZpZyhjdXJyZW50U2xpZGVJZCEpIS51cmwpXHJcbiAgICA6IGkxOG4udCgnbm9VcmxGb3JTbGlkZScpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQXBwbHkgaGFuZGxlciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFwcGx5KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGlmICghY3VycmVudFNsaWRlSWQpIHtcclxuICAgIHNob3dTdGF0dXMoJ3NlbGVjdFNsaWRlJywgJ2Vycm9yJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBBdXRvLWZpeCBtaXNzaW5nIHByb3RvY29sXHJcbiAgbGV0IHVybCA9IG5vcm1hbGl6ZVVybCh1cmxJbnB1dC52YWx1ZSk7XHJcbiAgaWYgKHVybCAhPT0gdXJsSW5wdXQudmFsdWUudHJpbSgpICYmIHVybCkge1xyXG4gICAgdXJsSW5wdXQudmFsdWUgPSB1cmw7XHJcbiAgICBzaG93U3RhdHVzKCd1cmxBdXRvRml4ZWQnLCAnc3VjY2VzcycpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFpc1ZhbGlkVXJsKHVybCkpIHtcclxuICAgIHNob3dTdGF0dXMoJ25vVXJsJywgJ2Vycm9yJyk7XHJcbiAgICB1cmxJbnB1dC5mb2N1cygpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNldFNsaWRlQ29uZmlnKGN1cnJlbnRTbGlkZUlkLCB7XHJcbiAgICAgIHVybCxcclxuICAgICAgem9vbTogTnVtYmVyKHNsaWRlclpvb20udmFsdWUpLFxyXG4gICAgICBkaWFsb2dXaWR0aDogTnVtYmVyKHNsaWRlcldpZHRoLnZhbHVlKSxcclxuICAgICAgZGlhbG9nSGVpZ2h0OiBOdW1iZXIoc2xpZGVySGVpZ2h0LnZhbHVlKSxcclxuICAgICAgYXV0b09wZW46IGNoa0F1dG9PcGVuLmNoZWNrZWQsXHJcbiAgICAgIGF1dG9PcGVuRGVsYXlTZWM6IGdldEF1dG9PcGVuRGVsYXlTZWNvbmRzKCksXHJcbiAgICAgIGF1dG9DbG9zZVNlYzogZ2V0QXV0b0Nsb3NlU2Vjb25kcygpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgc2hvd1N0YXR1cygnc3VjY2VzcycsICdzdWNjZXNzJyk7XHJcbiAgICB1cGRhdGVTaG93QnV0dG9uU3RhdGUoKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGxvZ0Vycm9yKCdGYWlsZWQgdG8gc2F2ZSBzbGlkZSBjb25maWc6JywgZXJyKTtcclxuICAgIHNob3dTdGF0dXMoJ3NldHRpbmdzU2F2ZVJldHJ5RmFpbGVkJywgJ2Vycm9yJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2V0IGFzIGRlZmF1bHRzIGhhbmRsZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZXREZWZhdWx0cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgc2V0RGVmYXVsdHMoe1xyXG4gICAgICB1cmw6ICcnLFxyXG4gICAgICB6b29tOiBOdW1iZXIoc2xpZGVyWm9vbS52YWx1ZSksXHJcbiAgICAgIGRpYWxvZ1dpZHRoOiBOdW1iZXIoc2xpZGVyV2lkdGgudmFsdWUpLFxyXG4gICAgICBkaWFsb2dIZWlnaHQ6IE51bWJlcihzbGlkZXJIZWlnaHQudmFsdWUpLFxyXG4gICAgICBhdXRvT3BlbjogY2hrQXV0b09wZW4uY2hlY2tlZCxcclxuICAgICAgYXV0b09wZW5EZWxheVNlYzogZ2V0QXV0b09wZW5EZWxheVNlY29uZHMoKSxcclxuICAgICAgYXV0b0Nsb3NlU2VjOiBnZXRBdXRvQ2xvc2VTZWNvbmRzKCksXHJcbiAgICB9KTtcclxuICAgIHNob3dTdGF0dXMoJ2RlZmF1bHRzU2F2ZWQnLCAnc3VjY2VzcycpO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgbG9nRXJyb3IoJ0ZhaWxlZCB0byBzYXZlIGRlZmF1bHRzOicsIGVycik7XHJcbiAgICBzaG93U3RhdHVzKCdzZXR0aW5nc1NhdmVSZXRyeUZhaWxlZCcsICdlcnJvcicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNsaWRlciAvIHByZXNldCBoYW5kbGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVdpZHRoSW5wdXQoKTogdm9pZCB7XHJcbiAgc2xpZGVyV2lkdGhWYWx1ZS50ZXh0Q29udGVudCA9IGAke3NsaWRlcldpZHRoLnZhbHVlfSVgO1xyXG4gIGlmIChjaGtMb2NrU2l6ZS5jaGVja2VkKSB7XHJcbiAgICBzbGlkZXJIZWlnaHQudmFsdWUgPSBzbGlkZXJXaWR0aC52YWx1ZTtcclxuICAgIHNsaWRlckhlaWdodFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVySGVpZ2h0LnZhbHVlfSVgO1xyXG4gIH1cclxuICB1cGRhdGVTaXplUHJldmlldygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVIZWlnaHRJbnB1dCgpOiB2b2lkIHtcclxuICBzbGlkZXJIZWlnaHRWYWx1ZS50ZXh0Q29udGVudCA9IGAke3NsaWRlckhlaWdodC52YWx1ZX0lYDtcclxuICBpZiAoY2hrTG9ja1NpemUuY2hlY2tlZCkge1xyXG4gICAgc2xpZGVyV2lkdGgudmFsdWUgPSBzbGlkZXJIZWlnaHQudmFsdWU7XHJcbiAgICBzbGlkZXJXaWR0aFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVyV2lkdGgudmFsdWV9JWA7XHJcbiAgfVxyXG4gIHVwZGF0ZVNpemVQcmV2aWV3KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVpvb21JbnB1dCgpOiB2b2lkIHtcclxuICBjb25zdCB2YWwgPSBOdW1iZXIoc2xpZGVyWm9vbS52YWx1ZSk7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7dmFsfSVgO1xyXG4gIHVwZGF0ZUFjdGl2ZVByZXNldCh2YWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVQcmVzZXRDbGljayhlOiBFdmVudCk6IHZvaWQge1xyXG4gIGNvbnN0IGJ0biA9IChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xvc2VzdDxIVE1MQnV0dG9uRWxlbWVudD4oJy5idG4tcHJlc2V0Jyk7XHJcbiAgaWYgKCFidG4/LmRhdGFzZXQuem9vbSkgcmV0dXJuO1xyXG4gIGNvbnN0IHZhbCA9IE51bWJlcihidG4uZGF0YXNldC56b29tKTtcclxuICBzbGlkZXJab29tLnZhbHVlID0gU3RyaW5nKHZhbCk7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7dmFsfSVgO1xyXG4gIHVwZGF0ZUFjdGl2ZVByZXNldCh2YWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVMb2NrU2l6ZUNoYW5nZSgpOiB2b2lkIHtcclxuICBpZiAoY2hrTG9ja1NpemUuY2hlY2tlZCkge1xyXG4gICAgLy8gU3luYyBoZWlnaHQgdG8gd2lkdGhcclxuICAgIHNsaWRlckhlaWdodC52YWx1ZSA9IHNsaWRlcldpZHRoLnZhbHVlO1xyXG4gICAgc2xpZGVySGVpZ2h0VmFsdWUudGV4dENvbnRlbnQgPSBgJHtzbGlkZXJIZWlnaHQudmFsdWV9JWA7XHJcbiAgICB1cGRhdGVTaXplUHJldmlldygpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQXV0b09wZW5EZWxheUlucHV0KCk6IHZvaWQge1xyXG4gIHNsaWRlckF1dG9PcGVuRGVsYXlWYWx1ZS50ZXh0Q29udGVudCA9IGZvcm1hdEF1dG9PcGVuRGVsYXlMYWJlbChnZXRBdXRvT3BlbkRlbGF5U2Vjb25kcygpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQXV0b09wZW5DaGFuZ2UoKTogdm9pZCB7XHJcbiAgdXBkYXRlQXV0b09wZW5EZWxheVZpc2liaWxpdHkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQXV0b0Nsb3NlSW5wdXQoKTogdm9pZCB7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlVmFsdWUudGV4dENvbnRlbnQgPSBmb3JtYXRBdXRvQ2xvc2VMYWJlbChnZXRBdXRvQ2xvc2VTZWNvbmRzKCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVJbmZvVG9nZ2xlKGhpbnRJZDogc3RyaW5nLCBidG5JZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgY29uc3QgaGludCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGhpbnRJZCk7XHJcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnRuSWQpO1xyXG4gIGlmICghaGludCB8fCAhYnRuKSByZXR1cm47XHJcbiAgY29uc3Qgc2hvdyA9IGhpbnQuaGlkZGVuO1xyXG4gIGhpbnQuaGlkZGVuID0gIXNob3c7XHJcbiAgYnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhzaG93KSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUF1dG9PcGVuSW5mb1RvZ2dsZSgpOiB2b2lkIHtcclxuICBoYW5kbGVJbmZvVG9nZ2xlKCdhdXRvb3Blbi1oaW50JywgJ2J0bi1hdXRvb3Blbi1pbmZvJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUF1dG9DbG9zZUluZm9Ub2dnbGUoKTogdm9pZCB7XHJcbiAgaGFuZGxlSW5mb1RvZ2dsZSgnYXV0b2Nsb3NlLWhpbnQnLCAnYnRuLWF1dG9jbG9zZS1pbmZvJyk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBWaWV3ZXIgc3RhdHVzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxudHlwZSBWaWV3ZXJTdGF0ZSA9ICdsb2FkaW5nJyB8ICdsb2FkZWQnIHwgJ2Jsb2NrZWQnIHwgJ2Vycm9yJztcclxuXHJcbmZ1bmN0aW9uIHNldFZpZXdlclN0YXR1cyhzdGF0ZTogVmlld2VyU3RhdGUpOiB2b2lkIHtcclxuICBjb25zdCBrZXlNYXA6IFJlY29yZDxWaWV3ZXJTdGF0ZSwgVHJhbnNsYXRpb25LZXk+ID0ge1xyXG4gICAgbG9hZGluZzogJ3ZpZXdlckxvYWRpbmcnLFxyXG4gICAgbG9hZGVkOiAndmlld2VyTG9hZGVkJyxcclxuICAgIGJsb2NrZWQ6ICd2aWV3ZXJCbG9ja2VkJyxcclxuICAgIGVycm9yOiAndmlld2VyRXJyb3InLFxyXG4gIH07XHJcblxyXG4gIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IGZhbHNlO1xyXG4gIHZpZXdlclN0YXR1c0VsLmNsYXNzTmFtZSA9IGB2aWV3ZXItc3RhdHVzIHZpZXdlci1zdGF0dXMtLSR7c3RhdGV9YDtcclxuICB2aWV3ZXJTdGF0dXNUZXh0LnRleHRDb250ZW50ID0gaTE4bi50KGtleU1hcFtzdGF0ZV0pO1xyXG5cclxuICAvLyBBdXRvLWhpZGUgc3VjY2Vzcy9lcnJvciBhZnRlciBhIGRlbGF5IChrZWVwIGxvYWRpbmcvYmxvY2tlZCB2aXNpYmxlKVxyXG4gIGlmICh2aWV3ZXJTdGF0dXNUaW1lcikge1xyXG4gICAgY2xlYXJUaW1lb3V0KHZpZXdlclN0YXR1c1RpbWVyKTtcclxuICAgIHZpZXdlclN0YXR1c1RpbWVyID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGlmIChzdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcclxuICAgIHZpZXdlclN0YXR1c1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IHRydWU7XHJcbiAgICB9LCA0MDAwKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhpZGVWaWV3ZXJTdGF0dXMoKTogdm9pZCB7XHJcbiAgaWYgKHZpZXdlclN0YXR1c1RpbWVyKSB7XHJcbiAgICBjbGVhclRpbWVvdXQodmlld2VyU3RhdHVzVGltZXIpO1xyXG4gICAgdmlld2VyU3RhdHVzVGltZXIgPSBudWxsO1xyXG4gIH1cclxuICB2aWV3ZXJTdGF0dXNFbC5oaWRkZW4gPSB0cnVlO1xyXG59XHJcblxyXG4vKiogUGFyc2UgYW5kIGhhbmRsZSBzdHJ1Y3R1cmVkIG1lc3NhZ2VzIGZyb20gdGhlIHZpZXdlciBkaWFsb2cuICovXHJcbmZ1bmN0aW9uIGhhbmRsZVZpZXdlck1lc3NhZ2UocmF3TWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG1zZyA9IEpTT04ucGFyc2UocmF3TWVzc2FnZSkgYXMgeyB0eXBlOiBzdHJpbmc7IHVybD86IHN0cmluZzsgZXJyb3I/OiBzdHJpbmcgfTtcclxuXHJcbiAgICBzd2l0Y2ggKG1zZy50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ3JlYWR5JzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2xvYWRpbmcnKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbG9hZGVkJzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2xvYWRlZCcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdibG9ja2VkJzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2Jsb2NrZWQnKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZXJyb3InOlxyXG4gICAgICAgIHNldFZpZXdlclN0YXR1cygnZXJyb3InKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY2xvc2UnOlxyXG4gICAgICAgIC8vIFNhdmUgc2xpZGUgSUQgQkVGT1JFIGNsb3NlIOKAlCBvblNsaWRlc2hvd0V4aXQgbWF5IHJlc2V0IGxhc3RTbGlkZXNob3dTbGlkZUlkXHJcbiAgICAgICAgaWYgKGxhc3RTbGlkZXNob3dTbGlkZUlkKSB7XHJcbiAgICAgICAgICBsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZCA9IGxhc3RTbGlkZXNob3dTbGlkZUlkO1xyXG4gICAgICAgICAgZGJnKGBEaWFsb2cgY2xvc2luZyBvbiBzbGlkZSAke2xhc3REaWFsb2dDbG9zZWRTbGlkZUlkfSDigJQgd2lsbCBub3QgcmUtb3BlbiB1bnRpbCBzbGlkZSBjaGFuZ2VzYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxhdW5jaGVyLmNsb3NlKCk7XHJcbiAgICAgICAgYnRuU2hvdy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGhpZGVWaWV3ZXJTdGF0dXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9IGNhdGNoIHtcclxuICAgIC8vIE5vbi1KU09OIG1lc3NhZ2Ug4oCUIGlnbm9yZVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlVmlld2VyQ2xvc2VkKCk6IHZvaWQge1xyXG4gIGJ0blNob3cuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAvLyBSZW1lbWJlciB3aGljaCBzbGlkZSB0aGUgZGlhbG9nIHdhcyBjbG9zZWQgb24gKHByZXZlbnQgcmUtb3BlbmluZykuXHJcbiAgLy8gTWF5IGFscmVhZHkgYmUgc2V0IGJ5ICdjbG9zZScgbWVzc2FnZSBoYW5kbGVyIChiZWZvcmUgbGF1bmNoZXIuY2xvc2UpLlxyXG4gIGlmIChsYXN0U2xpZGVzaG93U2xpZGVJZCAmJiAhbGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWQpIHtcclxuICAgIGxhc3REaWFsb2dDbG9zZWRTbGlkZUlkID0gbGFzdFNsaWRlc2hvd1NsaWRlSWQ7XHJcbiAgICBkYmcoYERpYWxvZyBjbG9zZWQgKGV2ZW50KSBvbiBzbGlkZSAke2xhc3REaWFsb2dDbG9zZWRTbGlkZUlkfWApO1xyXG4gIH1cclxuICAvLyBTaG93IGJyaWVmIFwiY2xvc2VkXCIgc3RhdHVzIHRoZW4gaGlkZVxyXG4gIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IGZhbHNlO1xyXG4gIHZpZXdlclN0YXR1c0VsLmNsYXNzTmFtZSA9ICd2aWV3ZXItc3RhdHVzJztcclxuICB2aWV3ZXJTdGF0dXNUZXh0LnRleHRDb250ZW50ID0gaTE4bi50KCd2aWV3ZXJDbG9zZWQnKTtcclxuXHJcbiAgaWYgKHZpZXdlclN0YXR1c1RpbWVyKSBjbGVhclRpbWVvdXQodmlld2VyU3RhdHVzVGltZXIpO1xyXG4gIHZpZXdlclN0YXR1c1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICB2aWV3ZXJTdGF0dXNFbC5oaWRkZW4gPSB0cnVlO1xyXG4gIH0sIDIwMDApO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2hvdyBXZWIgUGFnZSBoYW5kbGVyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2hvdygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoIWN1cnJlbnRTbGlkZUlkKSB7XHJcbiAgICBzaG93U3RhdHVzKCdzZWxlY3RTbGlkZScsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQpO1xyXG5cclxuICBpZiAoIWNvbmZpZyB8fCAhY29uZmlnLnVybCkge1xyXG4gICAgc2hvd1N0YXR1cygnbm9VcmxGb3JTbGlkZScsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgbmV0d29yayBiZWZvcmUgb3BlbmluZ1xyXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAhbmF2aWdhdG9yLm9uTGluZSkge1xyXG4gICAgc2hvd1N0YXR1cygnbm9JbnRlcm5ldCcsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgYnRuU2hvdy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgc2V0Vmlld2VyU3RhdHVzKCdsb2FkaW5nJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBsYXVuY2hlci5vcGVuKHtcclxuICAgICAgdXJsOiBjb25maWcudXJsLFxyXG4gICAgICB6b29tOiBjb25maWcuem9vbSxcclxuICAgICAgd2lkdGg6IGNvbmZpZy5kaWFsb2dXaWR0aCxcclxuICAgICAgaGVpZ2h0OiBjb25maWcuZGlhbG9nSGVpZ2h0LFxyXG4gICAgICBsYW5nOiBpMThuLmdldExvY2FsZSgpLFxyXG4gICAgICBhdXRvQ2xvc2VTZWM6IGNvbmZpZy5hdXRvQ2xvc2VTZWMsXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGJ0blNob3cuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIGhpZGVWaWV3ZXJTdGF0dXMoKTtcclxuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBEaWFsb2dFcnJvcikge1xyXG4gICAgICBzaG93U3RhdHVzKGVyci5pMThuS2V5LCAnZXJyb3InKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNob3dTdGF0dXMoJ2Vycm9yR2VuZXJpYycsICdlcnJvcicpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEd1aWRlIGhhbmRsZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuY29uc3QgU05JUFBFVFM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgbmdpbng6ICdhZGRfaGVhZGVyIENvbnRlbnQtU2VjdXJpdHktUG9saWN5IFwiZnJhbWUtYW5jZXN0b3JzICpcIjsnLFxyXG4gIGFwYWNoZTogJ0hlYWRlciBzZXQgQ29udGVudC1TZWN1cml0eS1Qb2xpY3kgXCJmcmFtZS1hbmNlc3RvcnMgKlwiXFxuSGVhZGVyIHVuc2V0IFgtRnJhbWUtT3B0aW9ucycsXHJcbiAgZXhwcmVzczogYGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XFxuICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVNlY3VyaXR5LVBvbGljeScsICdmcmFtZS1hbmNlc3RvcnMgKicpO1xcbiAgcmVzLnJlbW92ZUhlYWRlcignWC1GcmFtZS1PcHRpb25zJyk7XFxuICBuZXh0KCk7XFxufSk7YCxcclxuICBtZXRhOiAnPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCJcXG4gICAgICBjb250ZW50PVwiZnJhbWUtYW5jZXN0b3JzICpcIj4nLFxyXG59O1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlR3VpZGVUb2dnbGUoKTogdm9pZCB7XHJcbiAgY29uc3Qgc2VjdGlvbiA9ICQoJ2d1aWRlLXNlY3Rpb24nKTtcclxuICBjb25zdCB0b2dnbGUgPSAkKCdidG4tZ3VpZGUtdG9nZ2xlJyk7XHJcbiAgY29uc3QgaXNIaWRkZW4gPSBzZWN0aW9uLmhpZGRlbjtcclxuICBzZWN0aW9uLmhpZGRlbiA9ICFpc0hpZGRlbjtcclxuICB0b2dnbGUudGV4dENvbnRlbnQgPSBpMThuLnQoaXNIaWRkZW4gPyAnaGlkZVNldHVwR3VpZGUnIDogJ3NpdGVOb3RMb2FkaW5nJyk7XHJcbiAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhpc0hpZGRlbikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhY3RpdmF0ZUd1aWRlVGFiKHRhYklkOiBzdHJpbmcpOiB2b2lkIHtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PignI2d1aWRlLXNlY3Rpb24gW2RhdGEtZ3VpZGUtdGFiXScpLmZvckVhY2goKHQpID0+IHtcclxuICAgIGNvbnN0IGFjdGl2ZSA9IHQuZGF0YXNldC5ndWlkZVRhYiA9PT0gdGFiSWQ7XHJcbiAgICB0LmNsYXNzTGlzdC50b2dnbGUoJ2d1aWRlLXRhYi0tYWN0aXZlJywgYWN0aXZlKTtcclxuICAgIHQuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgU3RyaW5nKGFjdGl2ZSkpO1xyXG4gICAgdC50YWJJbmRleCA9IGFjdGl2ZSA/IDAgOiAtMTtcclxuICAgIGlmIChhY3RpdmUpIHQuZm9jdXMoKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJyNndWlkZS1zZWN0aW9uIFtkYXRhLWd1aWRlLXBhbmVsXScpLmZvckVhY2goKHApID0+IHtcclxuICAgIHAuaGlkZGVuID0gcC5kYXRhc2V0Lmd1aWRlUGFuZWwgIT09IHRhYklkO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVHdWlkZVRhYkNsaWNrKGU6IEV2ZW50KTogdm9pZCB7XHJcbiAgY29uc3QgdGFiID0gKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbG9zZXN0PEhUTUxCdXR0b25FbGVtZW50PignW2RhdGEtZ3VpZGUtdGFiXScpO1xyXG4gIGlmICghdGFiKSByZXR1cm47XHJcbiAgYWN0aXZhdGVHdWlkZVRhYih0YWIuZGF0YXNldC5ndWlkZVRhYiEpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVHdWlkZVRhYktleWRvd24oZTogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gIGNvbnN0IHRhYnMgPSBBcnJheS5mcm9tKFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MQnV0dG9uRWxlbWVudD4oJyNndWlkZS1zZWN0aW9uIFtkYXRhLWd1aWRlLXRhYl0nKSxcclxuICApO1xyXG4gIGNvbnN0IGN1cnJlbnQgPSB0YWJzLmZpbmRJbmRleCgodCkgPT4gdC5nZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKTtcclxuICBsZXQgbmV4dCA9IC0xO1xyXG5cclxuICBpZiAoZS5rZXkgPT09ICdBcnJvd1JpZ2h0JykgbmV4dCA9IChjdXJyZW50ICsgMSkgJSB0YWJzLmxlbmd0aDtcclxuICBlbHNlIGlmIChlLmtleSA9PT0gJ0Fycm93TGVmdCcpIG5leHQgPSAoY3VycmVudCAtIDEgKyB0YWJzLmxlbmd0aCkgJSB0YWJzLmxlbmd0aDtcclxuICBlbHNlIGlmIChlLmtleSA9PT0gJ0hvbWUnKSBuZXh0ID0gMDtcclxuICBlbHNlIGlmIChlLmtleSA9PT0gJ0VuZCcpIG5leHQgPSB0YWJzLmxlbmd0aCAtIDE7XHJcbiAgZWxzZSByZXR1cm47XHJcblxyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICBhY3RpdmF0ZUd1aWRlVGFiKHRhYnNbbmV4dF0uZGF0YXNldC5ndWlkZVRhYiEpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHdWlkZUNvcHkoZTogRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBidG4gPSAoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsb3Nlc3Q8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdbZGF0YS1jb3B5LXNuaXBwZXRdJyk7XHJcbiAgaWYgKCFidG4pIHJldHVybjtcclxuXHJcbiAgY29uc3Qga2V5ID0gYnRuLmRhdGFzZXQuY29weVNuaXBwZXQhO1xyXG4gIGNvbnN0IHRleHQgPSBTTklQUEVUU1trZXldO1xyXG4gIGlmICghdGV4dCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSBpMThuLnQoJ2NvcGllZCcpO1xyXG4gICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2J0bi1jb3B5LS1jb3BpZWQnKTtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSBpMThuLnQoJ2NvcHknKTtcclxuICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1jb3B5LS1jb3BpZWQnKTtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gRmFsbGJhY2s6IHNlbGVjdCB0ZXh0IGluIHRoZSBjb2RlIGJsb2NrXHJcbiAgICBjb25zdCBwYW5lbCA9IGJ0bi5jbG9zZXN0KCdbZGF0YS1ndWlkZS1wYW5lbF0nKTtcclxuICAgIGNvbnN0IGNvZGUgPSBwYW5lbD8ucXVlcnlTZWxlY3RvcignY29kZScpO1xyXG4gICAgaWYgKGNvZGUpIHtcclxuICAgICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoY29kZSk7XHJcbiAgICAgIGNvbnN0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgc2VsPy5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgc2VsPy5hZGRSYW5nZShyYW5nZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgTGFuZ3VhZ2Ugc3dpdGNoIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3QgbG9jYWxlID0gbGFuZ1NlbGVjdC52YWx1ZSBhcyBMb2NhbGU7XHJcbiAgaTE4bi5zZXRMb2NhbGUobG9jYWxlKTtcclxuICBhcHBseUkxOG4oKTtcclxuICByZWZyZXNoU2xpZGVyTGFiZWxzKCk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBzZXRMYW5ndWFnZShsb2NhbGUpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gbm9uLWNyaXRpY2FsIOKAlCBVSSBhbHJlYWR5IHVwZGF0ZWRcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBLZXlib2FyZCBzdXBwb3J0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gaGFuZGxlVXJsS2V5ZG93bihlOiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XHJcbiAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBoYW5kbGVBcHBseSgpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGJnKG1zZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgbG9nRGVidWcoJ1tUYXNrcGFuZV0nLCBtc2cpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGVzaG93IGF1dG8tb3BlbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuLy9cclxuLy8gVGhlIGNvbW1hbmRzIHJ1bnRpbWUgKEZ1bmN0aW9uRmlsZSkgbWF5IG5vdCBwZXJzaXN0IGR1cmluZyBzbGlkZXNob3cgb24gYWxsXHJcbi8vIFBvd2VyUG9pbnQgdmVyc2lvbnMuIEFzIGEgcmVsaWFibGUgZmFsbGJhY2ssIHRoZSB0YXNrcGFuZSBpdHNlbGYgcG9sbHMgZm9yXHJcbi8vIHZpZXcgbW9kZSBjaGFuZ2VzIGFuZCBzbGlkZSBuYXZpZ2F0aW9uIGR1cmluZyBzbGlkZXNob3cuXHJcbi8vXHJcbi8vIFVzZXMgZ2V0QWN0aXZlVmlld0FzeW5jKCkgaW5zdGVhZCBvZiBBY3RpdmVWaWV3Q2hhbmdlZCBldmVudCBiZWNhdXNlXHJcbi8vIHRoZSBldmVudCBtYXkgbm90IGZpcmUgaW4gdGhlIHRhc2twYW5lIGNvbnRleHQuXHJcblxyXG4vKiogSG93IG9mdGVuIHRvIGNoZWNrIHRoZSBjdXJyZW50IHZpZXcgbW9kZSAobXMpLiAqL1xyXG5jb25zdCBWSUVXX1BPTExfSU5URVJWQUxfTVMgPSAyMDAwO1xyXG5cclxuLyoqIEhvdyBvZnRlbiB0byBjaGVjayB0aGUgY3VycmVudCBzbGlkZSBkdXJpbmcgc2xpZGVzaG93IChtcykuICovXHJcbmNvbnN0IFNMSURFX1BPTExfSU5URVJWQUxfTVMgPSAxNTAwO1xyXG5cclxubGV0IHZpZXdQb2xsVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldEludGVydmFsPiB8IG51bGwgPSBudWxsO1xyXG5sZXQgc2xpZGVQb2xsVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldEludGVydmFsPiB8IG51bGwgPSBudWxsO1xyXG5sZXQgc2xpZGVzaG93QWN0aXZlID0gZmFsc2U7XHJcbmxldCBsYXN0U2xpZGVzaG93U2xpZGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbmxldCBzbGlkZVBvbGxCdXN5ID0gZmFsc2U7XHJcblxyXG4vKiogV2hldGhlciB0aGUgdmlld2VyIGRpYWxvZyBoYXMgYmVlbiBvcGVuZWQgZm9yIHRoZSBjdXJyZW50IHNsaWRlc2hvdyBzZXNzaW9uLiAqL1xyXG5sZXQgc2xpZGVzaG93RGlhbG9nT3BlbmVkID0gZmFsc2U7XHJcblxyXG4vKiogU2xpZGUgSUQgZm9yIHdoaWNoIHRoZSBkaWFsb2cgd2FzIGxhc3QgY2xvc2VkICh0byBwcmV2ZW50IHJlLW9wZW5pbmcgb24gc2FtZSBzbGlkZSkuICovXHJcbmxldCBsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcblxyXG4vKiogUGVuZGluZyBhdXRvLW9wZW4gZGVsYXkgdGltZXIgKGNhbmNlbGxlZCBvbiBzbGlkZSBjaGFuZ2UpLiAqL1xyXG5sZXQgYXV0b09wZW5EZWxheVRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xyXG5cclxuLyoqIEdldCB0aGUgY3VycmVudCB2aWV3IG1vZGUgKFwiZWRpdFwiIG9yIFwicmVhZFwiKS4gKi9cclxuZnVuY3Rpb24gZ2V0QWN0aXZlVmlldygpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgT2ZmaWNlLmNvbnRleHQuZG9jdW1lbnQuZ2V0QWN0aXZlVmlld0FzeW5jKChyZXN1bHQpID0+IHtcclxuICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gT2ZmaWNlLkFzeW5jUmVzdWx0U3RhdHVzLlN1Y2NlZWRlZCkge1xyXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQudmFsdWUgYXMgdW5rbm93biBhcyBzdHJpbmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkYmcoYGdldEFjdGl2ZVZpZXcgRkFJTEVEOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCk7XHJcbiAgICAgICAgICByZXNvbHZlKCdlZGl0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBkYmcoYGdldEFjdGl2ZVZpZXcgRVhDRVBUSU9OOiAke2Vycn1gKTtcclxuICAgICAgcmVzb2x2ZSgnZWRpdCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBjdXJyZW50IHNsaWRlIElELiBUcmllcyB0d28gbWV0aG9kczpcclxuICogMS4gUG93ZXJQb2ludCBKUyBBUEkgZ2V0U2VsZWN0ZWRTbGlkZXMoKSDigJQgd29ya3MgaW4gZWRpdCBtb2RlXHJcbiAqIDIuIENvbW1vbiBBUEkgZ2V0U2VsZWN0ZWREYXRhQXN5bmMoU2xpZGVSYW5nZSkg4oCUIG1heSB3b3JrIGluIHNsaWRlc2hvd1xyXG4gKlxyXG4gKiBNZXRob2QgMiByZXR1cm5zIGEgbnVtZXJpYyBzbGlkZSBJRCwgd2hpY2ggd2UgbWFwIHRvIHRoZSBKUyBBUEkgc3RyaW5nIElEXHJcbiAqIHVzaW5nIGEgcHJlLWJ1aWx0IGluZGV44oaSaWQgbG9va3VwIHRhYmxlLlxyXG4gKi9cclxuXHJcbi8qKiBNYXAgb2Ygc2xpZGUgaW5kZXggKDEtYmFzZWQpIOKGkiBQb3dlclBvaW50IEpTIEFQSSBzbGlkZSBJRC4gQnVpbHQgYmVmb3JlIHNsaWRlc2hvdy4gKi9cclxubGV0IHNsaWRlSW5kZXhUb0lkOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xyXG5cclxuLyoqIEJ1aWxkIHRoZSBpbmRleOKGkmlkIG1hcCBmcm9tIGFsbCBzbGlkZXMgaW4gdGhlIHByZXNlbnRhdGlvbi4gKi9cclxuYXN5bmMgZnVuY3Rpb24gYnVpbGRTbGlkZUluZGV4TWFwKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBQb3dlclBvaW50LnJ1bihhc3luYyAoY29udGV4dCkgPT4ge1xyXG4gICAgICBjb25zdCBzbGlkZXMgPSBjb250ZXh0LnByZXNlbnRhdGlvbi5zbGlkZXM7XHJcbiAgICAgIHNsaWRlcy5sb2FkKCdpdGVtcy9pZCcpO1xyXG4gICAgICBhd2FpdCBjb250ZXh0LnN5bmMoKTtcclxuICAgICAgc2xpZGVJbmRleFRvSWQgPSBuZXcgTWFwKCk7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2xpZGVzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgc2xpZGVJbmRleFRvSWQuc2V0KGkgKyAxLCBzbGlkZXMuaXRlbXNbaV0uaWQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGVudHJpZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICBzbGlkZUluZGV4VG9JZC5mb3JFYWNoKChpZCwgaWR4KSA9PiBlbnRyaWVzLnB1c2goYCR7aWR4feKGkiR7aWR9YCkpO1xyXG4gICAgZGJnKGBTbGlkZSBtYXA6ICR7ZW50cmllcy5qb2luKCcsICcpfWApO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgZGJnKGBidWlsZFNsaWRlSW5kZXhNYXAgRVJST1I6ICR7ZXJyfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIE1ldGhvZCAxOiBQb3dlclBvaW50IEpTIEFQSSDigJQgZ2V0U2VsZWN0ZWRTbGlkZXMoKS4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0U2xpZGVJZFZpYUpzQXBpKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gIHRyeSB7XHJcbiAgICBsZXQgc2xpZGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBhd2FpdCBQb3dlclBvaW50LnJ1bihhc3luYyAoY29udGV4dCkgPT4ge1xyXG4gICAgICBjb25zdCBzbGlkZXMgPSBjb250ZXh0LnByZXNlbnRhdGlvbi5nZXRTZWxlY3RlZFNsaWRlcygpO1xyXG4gICAgICBzbGlkZXMubG9hZCgnaXRlbXMvaWQnKTtcclxuICAgICAgYXdhaXQgY29udGV4dC5zeW5jKCk7XHJcbiAgICAgIGlmIChzbGlkZXMuaXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHNsaWRlSWQgPSBzbGlkZXMuaXRlbXNbMF0uaWQ7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHNsaWRlSWQ7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBkYmcoYEpTIEFQSSBnZXRTZWxlY3RlZFNsaWRlcyBFUlJPUjogJHtlcnJ9YCk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBNZXRob2QgMjogQ29tbW9uIEFQSSDigJQgZ2V0U2VsZWN0ZWREYXRhQXN5bmMoU2xpZGVSYW5nZSkuICovXHJcbmZ1bmN0aW9uIGdldFNsaWRlSWRWaWFDb21tb25BcGkoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBPZmZpY2UuY29udGV4dC5kb2N1bWVudC5nZXRTZWxlY3RlZERhdGFBc3luYyhcclxuICAgICAgICBPZmZpY2UuQ29lcmNpb25UeXBlLlNsaWRlUmFuZ2UsXHJcbiAgICAgICAgKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IE9mZmljZS5Bc3luY1Jlc3VsdFN0YXR1cy5TdWNjZWVkZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHJlc3VsdC52YWx1ZSBhcyB7IHNsaWRlcz86IEFycmF5PHsgaWQ6IG51bWJlcjsgaW5kZXg6IG51bWJlciB9PiB9O1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5zbGlkZXMgJiYgZGF0YS5zbGlkZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHNsaWRlID0gZGF0YS5zbGlkZXNbMF07XHJcbiAgICAgICAgICAgICAgZGJnKGBDb21tb25BUEkgc2xpZGU6IGlkPSR7c2xpZGUuaWR9IGluZGV4PSR7c2xpZGUuaW5kZXh9YCk7XHJcbiAgICAgICAgICAgICAgLy8gTWFwIGluZGV4IHRvIEpTIEFQSSBzbGlkZSBJRFxyXG4gICAgICAgICAgICAgIGNvbnN0IGpzSWQgPSBzbGlkZUluZGV4VG9JZC5nZXQoc2xpZGUuaW5kZXgpO1xyXG4gICAgICAgICAgICAgIGlmIChqc0lkKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGpzSWQpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYmcoYE5vIEpTIEFQSSBJRCBmb3VuZCBmb3IgaW5kZXggJHtzbGlkZS5pbmRleH1gKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGRiZygnQ29tbW9uQVBJOiBubyBzbGlkZXMgaW4gcmVzdWx0Jyk7XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGJnKGBDb21tb25BUEkgRkFJTEVEOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCk7XHJcbiAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBkYmcoYENvbW1vbkFQSSBFWENFUFRJT046ICR7ZXJyfWApO1xyXG4gICAgICByZXNvbHZlKG51bGwpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBjdXJyZW50IHNsaWRlIElEIGR1cmluZyBzbGlkZXNob3cuXHJcbiAqXHJcbiAqIElNUE9SVEFOVDogRHVyaW5nIHNsaWRlc2hvdywgT05MWSB1c2UgQ29tbW9uIEFQSS5cclxuICogSlMgQVBJIHJldHVybnMgdGhlIHNsaWRlIHNlbGVjdGVkIGluIHRoZSBFRElUIHdpbmRvdywgbm90IHRoZSBzbGlkZXNob3cgc2xpZGUuXHJcbiAqIEFmdGVyIGRpYWxvZy5jbG9zZSgpLCBmb2N1cyBzaGlmdHMgdG8gZWRpdCB3aW5kb3cgYW5kIEpTIEFQSSByZXR1cm5zIHdyb25nIHNsaWRlLFxyXG4gKiBjYXVzaW5nIGZhbHNlIFwiU0xJREUgQ0hBTkdFRFwiIGV2ZW50cyB0aGF0IHJlc2V0IHRoZSByZS1vcGVuIGd1YXJkLlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0U2xpZGVzaG93U2xpZGVJZCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICBpZiAoc2xpZGVzaG93QWN0aXZlKSB7XHJcbiAgICAvLyBTbGlkZXNob3c6IENvbW1vbiBBUEkgb25seSDigJQgaXQgcmV0dXJucyB0aGUgYWN0dWFsIHNsaWRlc2hvdyBzbGlkZVxyXG4gICAgY29uc3QgY29tbW9uUmVzdWx0ID0gYXdhaXQgZ2V0U2xpZGVJZFZpYUNvbW1vbkFwaSgpO1xyXG4gICAgcmV0dXJuIGNvbW1vblJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8vIEVkaXQgbW9kZTogdHJ5IEpTIEFQSSBmaXJzdCAobW9yZSByZWxpYWJsZSBpbiBlZGl0KVxyXG4gIGNvbnN0IGpzUmVzdWx0ID0gYXdhaXQgZ2V0U2xpZGVJZFZpYUpzQXBpKCk7XHJcbiAgaWYgKGpzUmVzdWx0KSB7XHJcbiAgICBkYmcoYHNsaWRlSWQgdmlhIEpTIEFQSTogJHtqc1Jlc3VsdH1gKTtcclxuICAgIHJldHVybiBqc1Jlc3VsdDtcclxuICB9XHJcblxyXG4gIC8vIEZhbGxiYWNrOiBDb21tb24gQVBJXHJcbiAgY29uc3QgY29tbW9uUmVzdWx0ID0gYXdhaXQgZ2V0U2xpZGVJZFZpYUNvbW1vbkFwaSgpO1xyXG4gIGRiZyhgc2xpZGVJZCB2aWEgQ29tbW9uQVBJOiAke2NvbW1vblJlc3VsdH1gKTtcclxuICByZXR1cm4gY29tbW9uUmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogT3BlbiBvciB1cGRhdGUgdGhlIHZpZXdlciBmb3IgYSBzbGlkZSBkdXJpbmcgc2xpZGVzaG93LlxyXG4gKlxyXG4gKiBDUklUSUNBTDogQ2xvc2luZyBgZGlzcGxheURpYWxvZ0FzeW5jYCBkdXJpbmcgc2xpZGVzaG93IGNhdXNlcyBQb3dlclBvaW50XHJcbiAqIHRvIGV4aXQgc2xpZGVzaG93IG1vZGUuIFdlIG11c3QgTkVWRVIgY2xvc2UvcmVvcGVuIHRoZSBkaWFsb2cuXHJcbiAqXHJcbiAqIFN0cmF0ZWd5OlxyXG4gKiAtIEZpcnN0IFVSTCBpbiBzbGlkZXNob3cg4oaSIG9wZW4gZGlhbG9nIG5vcm1hbGx5ICh3aXRoIHRoZSBVUkwpXHJcbiAqIC0gU3Vic2VxdWVudCBVUkxzIOKGkiB3cml0ZSB0byBsb2NhbFN0b3JhZ2UsIHZpZXdlciBwaWNrcyBpdCB1cCB2aWEgYHN0b3JhZ2VgIGV2ZW50XHJcbiAqIC0gU2xpZGUgd2l0aCBubyBVUkwg4oaSIHdyaXRlIGVtcHR5IHN0cmluZywgdmlld2VyIHNob3dzIHN0YW5kYnkgKGJsYWNrIHNjcmVlbilcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGF1dG9PcGVuVmlld2VyRm9yU2xpZGUoc2xpZGVJZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoc2xpZGVJZCk7XHJcbiAgZGJnKGBhdXRvT3Blbjogc2xpZGU9JHtzbGlkZUlkfSB1cmw9JHtjb25maWc/LnVybCA/PyAnbm9uZSd9IGF1dG9PcGVuPSR7Y29uZmlnPy5hdXRvT3Blbn0gbGFzdENsb3NlZD0ke2xhc3REaWFsb2dDbG9zZWRTbGlkZUlkfWApO1xyXG4gIGlmICghY29uZmlnPy51cmwgfHwgIWNvbmZpZy5hdXRvT3BlbikgcmV0dXJuO1xyXG5cclxuICAvLyBHdWFyZDogZG9uJ3QgcmUtb3BlbiBkaWFsb2cgZm9yIHRoZSBzYW1lIHNsaWRlIGl0IHdhcyBjbG9zZWQgb25cclxuICBpZiAoc2xpZGVJZCA9PT0gbGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWQpIHtcclxuICAgIGRiZyhgYXV0b09wZW46IFNLSVBQRUQg4oCUIGRpYWxvZyB3YXMgYWxyZWFkeSBjbG9zZWQgZm9yIHNsaWRlICR7c2xpZGVJZH1gKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGNvbnN0IGRlbGF5U2VjID0gY29uZmlnLmF1dG9PcGVuRGVsYXlTZWMgPz8gMDtcclxuXHJcbiAgaWYgKHNsaWRlc2hvd0RpYWxvZ09wZW5lZCAmJiBsYXVuY2hlci5pc09wZW4oKSkge1xyXG4gICAgLy8gRGlhbG9nIGFscmVhZHkgb3BlbiDigJQgc2VuZCBVUkwgdmlhIG1lc3NhZ2VDaGlsZCAobm8gY2xvc2UvcmVvcGVuISlcclxuICAgIGRiZyhgU2VuZGluZyBVUkwgdmlhIG1lc3NhZ2VDaGlsZDogJHtjb25maWcudXJsLnN1YnN0cmluZygwLCA1MCl9Li4uYCk7XHJcbiAgICBjb25zdCBzZW50ID0gbGF1bmNoZXIuc2VuZE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoeyBhY3Rpb246ICduYXZpZ2F0ZScsIHVybDogY29uZmlnLnVybCB9KSk7XHJcbiAgICBkYmcoYG1lc3NhZ2VDaGlsZCByZXN1bHQ6ICR7c2VudH1gKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIE9wZW4gZGlhbG9nICh3aXRoIG9wdGlvbmFsIGRlbGF5KVxyXG4gIGlmIChkZWxheVNlYyA+IDApIHtcclxuICAgIGRiZyhgYXV0b09wZW46IGRlbGF5aW5nICR7ZGVsYXlTZWN9cyBiZWZvcmUgb3BlbmluZyBkaWFsb2dgKTtcclxuICAgIC8vIENhbmNlbCBhbnkgcHJldmlvdXMgcGVuZGluZyBkZWxheVxyXG4gICAgaWYgKGF1dG9PcGVuRGVsYXlUaW1lcikgY2xlYXJUaW1lb3V0KGF1dG9PcGVuRGVsYXlUaW1lcik7XHJcbiAgICBhdXRvT3BlbkRlbGF5VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgYXV0b09wZW5EZWxheVRpbWVyID0gbnVsbDtcclxuICAgICAgb3BlbkRpYWxvZ0ZvclNsaWRlKGNvbmZpZywgc2xpZGVJZCk7XHJcbiAgICB9LCBkZWxheVNlYyAqIDEwMDApO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBhd2FpdCBvcGVuRGlhbG9nRm9yU2xpZGUoY29uZmlnLCBzbGlkZUlkKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBBY3R1YWxseSBvcGVuIHRoZSBkaWFsb2cuIEV4dHJhY3RlZCBzbyBpdCBjYW4gYmUgY2FsbGVkIGltbWVkaWF0ZWx5IG9yIGFmdGVyIGRlbGF5LiAqL1xyXG5hc3luYyBmdW5jdGlvbiBvcGVuRGlhbG9nRm9yU2xpZGUoY29uZmlnOiBpbXBvcnQoJy4uL3NoYXJlZC9zZXR0aW5ncycpLldlYlBQVFNsaWRlQ29uZmlnLCBzbGlkZUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBoaWRlTWV0aG9kOiAnbm9uZScgPSAnbm9uZSc7XHJcbiAgdHJ5IHtcclxuICAgIGRiZyhgT3BlbmluZyBkaWFsb2c6ICR7Y29uZmlnLnVybC5zdWJzdHJpbmcoMCwgNTApfS4uLiBoaWRlPSR7aGlkZU1ldGhvZH1gKTtcclxuICAgIGF3YWl0IGxhdW5jaGVyLm9wZW4oe1xyXG4gICAgICB1cmw6IGNvbmZpZy51cmwsXHJcbiAgICAgIHpvb206IGNvbmZpZy56b29tLFxyXG4gICAgICB3aWR0aDogY29uZmlnLmRpYWxvZ1dpZHRoLFxyXG4gICAgICBoZWlnaHQ6IGNvbmZpZy5kaWFsb2dIZWlnaHQsXHJcbiAgICAgIGxhbmc6IGkxOG4uZ2V0TG9jYWxlKCksXHJcbiAgICAgIGF1dG9DbG9zZVNlYzogY29uZmlnLmF1dG9DbG9zZVNlYyxcclxuICAgICAgc2xpZGVzaG93OiB0cnVlLFxyXG4gICAgICBoaWRlTWV0aG9kLFxyXG4gICAgfSk7XHJcbiAgICBzbGlkZXNob3dEaWFsb2dPcGVuZWQgPSB0cnVlO1xyXG4gICAgZGJnKCdEaWFsb2cgb3BlbmVkIE9LJyk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBkYmcoYERpYWxvZyBvcGVuIEZBSUxFRDogJHtlcnJ9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogUG9sbCBzbGlkZSBjaGFuZ2VzIGR1cmluZyBzbGlkZXNob3cuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHBvbGxTbGlkZUluU2xpZGVzaG93KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGlmICghc2xpZGVzaG93QWN0aXZlKSByZXR1cm47XHJcbiAgaWYgKHNsaWRlUG9sbEJ1c3kpIHtcclxuICAgIGRiZygncG9sbCBTS0lQUEVEIChidXN5KScpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgc2xpZGVQb2xsQnVzeSA9IHRydWU7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNsaWRlSWQgPSBhd2FpdCBnZXRTbGlkZXNob3dTbGlkZUlkKCk7XHJcbiAgICBkYmcoYHBvbGwgdGljazogZ290PSR7c2xpZGVJZH0gbGFzdD0ke2xhc3RTbGlkZXNob3dTbGlkZUlkfWApO1xyXG5cclxuICAgIGlmICghc2xpZGVJZCkge1xyXG4gICAgICBkYmcoJ3BvbGw6IHNsaWRlSWQgaXMgbnVsbCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoc2xpZGVJZCA9PT0gbGFzdFNsaWRlc2hvd1NsaWRlSWQpIHJldHVybjtcclxuXHJcbiAgICBkYmcoYFNMSURFIENIQU5HRUQ6ICR7bGFzdFNsaWRlc2hvd1NsaWRlSWR9IOKGkiAke3NsaWRlSWR9YCk7XHJcbiAgICBsYXN0U2xpZGVzaG93U2xpZGVJZCA9IHNsaWRlSWQ7XHJcbiAgICBsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZCA9IG51bGw7ICAvLyBSZXNldDogYWxsb3cgZGlhbG9nIGZvciB0aGUgbmV3IHNsaWRlXHJcblxyXG4gICAgLy8gQ2FuY2VsIGFueSBwZW5kaW5nIGF1dG8tb3BlbiBkZWxheSBmcm9tIHRoZSBwcmV2aW91cyBzbGlkZVxyXG4gICAgaWYgKGF1dG9PcGVuRGVsYXlUaW1lcikge1xyXG4gICAgICBjbGVhclRpbWVvdXQoYXV0b09wZW5EZWxheVRpbWVyKTtcclxuICAgICAgYXV0b09wZW5EZWxheVRpbWVyID0gbnVsbDtcclxuICAgICAgZGJnKCdDYW5jZWxsZWQgcGVuZGluZyBhdXRvLW9wZW4gZGVsYXkgKHNsaWRlIGNoYW5nZWQpJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoc2xpZGVJZCk7XHJcbiAgICBpZiAoY29uZmlnPy5hdXRvT3BlbiAmJiBjb25maWcudXJsKSB7XHJcbiAgICAgIGF3YWl0IGF1dG9PcGVuVmlld2VyRm9yU2xpZGUoc2xpZGVJZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBTbGlkZSBoYXMgbm8gVVJMIG9yIGF1dG9PcGVuIGlzIG9mZi5cclxuICAgICAgLy8gRG8gTk9UIGNsb3NlIHRoZSBkaWFsb2cgKGl0IHdvdWxkIGV4aXQgc2xpZGVzaG93KS5cclxuICAgICAgLy8gSW5zdGVhZCwgdGVsbCB0aGUgdmlld2VyIHRvIHNob3cgc3RhbmRieSAoYmxhY2sgc2NyZWVuKS5cclxuICAgICAgZGJnKGBObyBVUkwgZm9yIHNsaWRlICR7c2xpZGVJZH0g4oCUIHNlbmRpbmcgc3RhbmRieWApO1xyXG4gICAgICBpZiAoc2xpZGVzaG93RGlhbG9nT3BlbmVkICYmIGxhdW5jaGVyLmlzT3BlbigpKSB7XHJcbiAgICAgICAgbGF1bmNoZXIuc2VuZE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoeyBhY3Rpb246ICdzdGFuZGJ5JyB9KSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGRiZyhgcG9sbCBFUlJPUjogJHtlcnJ9YCk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHNsaWRlUG9sbEJ1c3kgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBDYWxsZWQgd2hlbiBzbGlkZXNob3cgbW9kZSBpcyBkZXRlY3RlZC4gKi9cclxuYXN5bmMgZnVuY3Rpb24gb25TbGlkZXNob3dFbnRlcigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBzbGlkZXNob3dBY3RpdmUgPSB0cnVlO1xyXG4gIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gbnVsbDtcclxuICBzbGlkZVBvbGxCdXN5ID0gZmFsc2U7XHJcbiAgZGJnKCdTTElERVNIT1cgREVURUNURUQnKTtcclxuXHJcbiAgLy8gQnVpbGQgc2xpZGUgaW5kZXggbWFwIEJFRk9SRSB0cnlpbmcgdG8gZ2V0IGN1cnJlbnQgc2xpZGUuXHJcbiAgLy8gVGhpcyBpcyBuZWVkZWQgZm9yIHRoZSBDb21tb24gQVBJIGZhbGxiYWNrIHdoaWNoIHJldHVybnMgaW5kZXgsIG5vdCBJRC5cclxuICBhd2FpdCBidWlsZFNsaWRlSW5kZXhNYXAoKTtcclxuXHJcbiAgLy8gSW1tZWRpYXRlbHkgdHJ5IHRvIG9wZW4gdmlld2VyIGZvciB0aGUgY3VycmVudCBzbGlkZVxyXG4gIGRiZygnR2V0dGluZyBjdXJyZW50IHNsaWRlLi4uJyk7XHJcbiAgY29uc3Qgc2xpZGVJZCA9IGF3YWl0IGdldFNsaWRlc2hvd1NsaWRlSWQoKTtcclxuICBkYmcoYEN1cnJlbnQgc2xpZGUgcmVzdWx0OiAke3NsaWRlSWR9YCk7XHJcblxyXG4gIGlmIChzbGlkZUlkKSB7XHJcbiAgICBsYXN0U2xpZGVzaG93U2xpZGVJZCA9IHNsaWRlSWQ7XHJcbiAgICBhd2FpdCBhdXRvT3BlblZpZXdlckZvclNsaWRlKHNsaWRlSWQpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkYmcoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgY3VycmVudCBzbGlkZSBpbiBzbGlkZXNob3cnKTtcclxuICB9XHJcblxyXG4gIC8vIFN0YXJ0IHBvbGxpbmcgZm9yIHNsaWRlIGNoYW5nZXNcclxuICBpZiAoc2xpZGVQb2xsVGltZXIpIGNsZWFySW50ZXJ2YWwoc2xpZGVQb2xsVGltZXIpO1xyXG4gIHNsaWRlUG9sbFRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4geyBwb2xsU2xpZGVJblNsaWRlc2hvdygpOyB9LCBTTElERV9QT0xMX0lOVEVSVkFMX01TKTtcclxuICBkYmcoJ1NsaWRlIHBvbGxpbmcgc3RhcnRlZCcpO1xyXG59XHJcblxyXG4vKiogQ2FsbGVkIHdoZW4gZWRpdCBtb2RlIGlzIHJlc3RvcmVkLiAqL1xyXG5mdW5jdGlvbiBvblNsaWRlc2hvd0V4aXQoKTogdm9pZCB7XHJcbiAgc2xpZGVzaG93QWN0aXZlID0gZmFsc2U7XHJcbiAgc2xpZGVzaG93RGlhbG9nT3BlbmVkID0gZmFsc2U7XHJcbiAgZGJnKCdTTElERVNIT1cgRU5ERUQnKTtcclxuICBpZiAoc2xpZGVQb2xsVGltZXIpIHtcclxuICAgIGNsZWFySW50ZXJ2YWwoc2xpZGVQb2xsVGltZXIpO1xyXG4gICAgc2xpZGVQb2xsVGltZXIgPSBudWxsO1xyXG4gIH1cclxuICBpZiAoYXV0b09wZW5EZWxheVRpbWVyKSB7XHJcbiAgICBjbGVhclRpbWVvdXQoYXV0b09wZW5EZWxheVRpbWVyKTtcclxuICAgIGF1dG9PcGVuRGVsYXlUaW1lciA9IG51bGw7XHJcbiAgfVxyXG4gIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gbnVsbDtcclxuXHJcbiAgLy8gU2FmZSB0byBjbG9zZSBkaWFsb2cgbm93IOKAlCBzbGlkZXNob3cgYWxyZWFkeSBleGl0ZWRcclxuICBsYXVuY2hlci5jbG9zZSgpO1xyXG59XHJcblxyXG4vKiogUGVyaW9kaWNhbGx5IGNoZWNrIHZpZXcgbW9kZSB0byBkZXRlY3Qgc2xpZGVzaG93IHN0YXJ0L2VuZC4gKi9cclxubGV0IHZpZXdQb2xsQ291bnQgPSAwO1xyXG5hc3luYyBmdW5jdGlvbiBwb2xsVmlld01vZGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdmlld1BvbGxDb3VudCsrO1xyXG4gIGNvbnN0IHZpZXcgPSBhd2FpdCBnZXRBY3RpdmVWaWV3KCk7XHJcbiAgY29uc3QgaXNTbGlkZXNob3cgPSB2aWV3ID09PSAncmVhZCc7XHJcblxyXG4gIC8vIExvZyBldmVyeSA1dGggcG9sbCB0byBzaG93IHBvbGxpbmcgaXMgYWxpdmUsIHBsdXMgZXZlcnkgbW9kZSBjaGFuZ2VcclxuICBpZiAodmlld1BvbGxDb3VudCAlIDUgPT09IDEpIHtcclxuICAgIGRiZyhgcG9sbCAjJHt2aWV3UG9sbENvdW50fTogdmlldz1cIiR7dmlld31cIiBhY3RpdmU9JHtzbGlkZXNob3dBY3RpdmV9YCk7XHJcbiAgfVxyXG5cclxuICBpZiAoaXNTbGlkZXNob3cgJiYgIXNsaWRlc2hvd0FjdGl2ZSkge1xyXG4gICAgYXdhaXQgb25TbGlkZXNob3dFbnRlcigpO1xyXG4gIH0gZWxzZSBpZiAoIWlzU2xpZGVzaG93ICYmIHNsaWRlc2hvd0FjdGl2ZSkge1xyXG4gICAgb25TbGlkZXNob3dFeGl0KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogU3RhcnQgbW9uaXRvcmluZyBmb3Igc2xpZGVzaG93IG1vZGUuICovXHJcbmZ1bmN0aW9uIHN0YXJ0Vmlld01vZGVQb2xsaW5nKCk6IHZvaWQge1xyXG4gIGlmICh2aWV3UG9sbFRpbWVyKSByZXR1cm47XHJcbiAgdmlld1BvbGxUaW1lciA9IHNldEludGVydmFsKCgpID0+IHsgcG9sbFZpZXdNb2RlKCk7IH0sIFZJRVdfUE9MTF9JTlRFUlZBTF9NUyk7XHJcbiAgZGJnKCdWaWV3IG1vZGUgcG9sbGluZyBTVEFSVEVEIChldmVyeSAycyknKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlSG93VG9Ub2dnbGUoKTogdm9pZCB7XHJcbiAgaGFuZGxlSW5mb1RvZ2dsZSgnaG93dG8tc2VjdGlvbicsICdidG4taG93dG8tdG9nZ2xlJyk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBJbml0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gaW5pdCgpOiB2b2lkIHtcclxuICAvLyBDYWNoZSBET00gcmVmc1xyXG4gIHVybElucHV0ID0gJDxIVE1MSW5wdXRFbGVtZW50PigndXJsLWlucHV0Jyk7XHJcbiAgYnRuQXBwbHkgPSAkPEhUTUxCdXR0b25FbGVtZW50PignYnRuLWFwcGx5Jyk7XHJcbiAgYnRuU2hvdyA9ICQ8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdidG4tc2hvdycpO1xyXG4gIGJ0bkRlZmF1bHRzID0gJDxIVE1MQnV0dG9uRWxlbWVudD4oJ2J0bi1kZWZhdWx0cycpO1xyXG4gIHN0YXR1c0VsID0gJCgnc3RhdHVzJyk7XHJcbiAgc2xpZGVOdW1iZXJFbCA9ICQoJ3NsaWRlLW51bWJlcicpO1xyXG4gIGxhbmdTZWxlY3QgPSAkPEhUTUxTZWxlY3RFbGVtZW50PignbGFuZy1zZWxlY3QnKTtcclxuICBzbGlkZXJXaWR0aCA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ3NsaWRlci13aWR0aCcpO1xyXG4gIHNsaWRlckhlaWdodCA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ3NsaWRlci1oZWlnaHQnKTtcclxuICBzbGlkZXJab29tID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLXpvb20nKTtcclxuICBzbGlkZXJXaWR0aFZhbHVlID0gJCgnc2xpZGVyLXdpZHRoLXZhbHVlJyk7XHJcbiAgc2xpZGVySGVpZ2h0VmFsdWUgPSAkKCdzbGlkZXItaGVpZ2h0LXZhbHVlJyk7XHJcbiAgc2xpZGVyWm9vbVZhbHVlID0gJCgnc2xpZGVyLXpvb20tdmFsdWUnKTtcclxuICBzaXplUHJldmlld0lubmVyID0gJCgnc2l6ZS1wcmV2aWV3LWlubmVyJyk7XHJcbiAgY2hrQXV0b09wZW4gPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdjaGstYXV0by1vcGVuJyk7XHJcbiAgY2hrTG9ja1NpemUgPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdjaGstbG9jay1zaXplJyk7XHJcbiAgc2xpZGVyQXV0b09wZW5EZWxheSA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ3NsaWRlci1hdXRvb3BlbmRlbGF5Jyk7XHJcbiAgc2xpZGVyQXV0b09wZW5EZWxheVZhbHVlID0gJCgnc2xpZGVyLWF1dG9vcGVuZGVsYXktdmFsdWUnKTtcclxuICBzZWN0aW9uQXV0b09wZW5EZWxheSA9ICQoJ3NlY3Rpb24tYXV0by1vcGVuLWRlbGF5Jyk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLWF1dG9jbG9zZScpO1xyXG4gIHNsaWRlckF1dG9DbG9zZVZhbHVlID0gJCgnc2xpZGVyLWF1dG9jbG9zZS12YWx1ZScpO1xyXG4gIHByZXNldEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PignLmJ0bi1wcmVzZXQnKTtcclxuICB2aWV3ZXJTdGF0dXNFbCA9ICQoJ3ZpZXdlci1zdGF0dXMnKTtcclxuICB2aWV3ZXJTdGF0dXNUZXh0ID0gJCgndmlld2VyLXN0YXR1cy10ZXh0Jyk7XHJcblxyXG4gIC8vIFJlc3RvcmUgc2F2ZWQgbGFuZ3VhZ2Ugb3IgZGV0ZWN0XHJcbiAgY29uc3Qgc2F2ZWRMYW5nID0gZ2V0TGFuZ3VhZ2UoKTtcclxuICBpZiAoc2F2ZWRMYW5nKSB7XHJcbiAgICBpMThuLnNldExvY2FsZShzYXZlZExhbmcpO1xyXG4gIH1cclxuICBsYW5nU2VsZWN0LnZhbHVlID0gaTE4bi5nZXRMb2NhbGUoKTtcclxuICBhcHBseUkxOG4oKTtcclxuXHJcbiAgLy8gRXZlbnQgbGlzdGVuZXJzXHJcbiAgYnRuQXBwbHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVBcHBseSk7XHJcbiAgYnRuU2hvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNob3cpO1xyXG4gIGJ0bkRlZmF1bHRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlU2V0RGVmYXVsdHMpO1xyXG4gIGxhbmdTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UpO1xyXG4gIHVybElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVVcmxLZXlkb3duKTtcclxuICBzbGlkZXJXaWR0aC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZVdpZHRoSW5wdXQpO1xyXG4gIHNsaWRlckhlaWdodC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZUhlaWdodElucHV0KTtcclxuICBzbGlkZXJab29tLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlWm9vbUlucHV0KTtcclxuICBjaGtMb2NrU2l6ZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVMb2NrU2l6ZUNoYW5nZSk7XHJcbiAgY2hrQXV0b09wZW4uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlQXV0b09wZW5DaGFuZ2UpO1xyXG4gIHNsaWRlckF1dG9PcGVuRGVsYXkuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBoYW5kbGVBdXRvT3BlbkRlbGF5SW5wdXQpO1xyXG4gIHNsaWRlckF1dG9DbG9zZS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZUF1dG9DbG9zZUlucHV0KTtcclxuICAkKCdidG4tYXV0b29wZW4taW5mbycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQXV0b09wZW5JbmZvVG9nZ2xlKTtcclxuICAkKCdidG4tYXV0b2Nsb3NlLWluZm8nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUF1dG9DbG9zZUluZm9Ub2dnbGUpO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy56b29tLXByZXNldHMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVQcmVzZXRDbGljayk7XHJcbiAgJCgnYnRuLWd1aWRlLXRvZ2dsZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlR3VpZGVUb2dnbGUpO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ndWlkZS10YWJzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlR3VpZGVUYWJDbGljayk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmd1aWRlLXRhYnMnKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUd1aWRlVGFiS2V5ZG93biBhcyBFdmVudExpc3RlbmVyKTtcclxuICAkKCdndWlkZS1zZWN0aW9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVHdWlkZUNvcHkpO1xyXG5cclxuICAvLyBEZXRlY3QgY3VycmVudCBzbGlkZSAmIGxpc3RlbiBmb3IgY2hhbmdlcyAob25seSBpbnNpZGUgUG93ZXJQb2ludClcclxuICBkZXRlY3RDdXJyZW50U2xpZGUoKTtcclxuICBidWlsZFNsaWRlSW5kZXhNYXAoKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIE9mZmljZS5jb250ZXh0LmRvY3VtZW50LmFkZEhhbmRsZXJBc3luYyhcclxuICAgICAgT2ZmaWNlLkV2ZW50VHlwZS5Eb2N1bWVudFNlbGVjdGlvbkNoYW5nZWQsXHJcbiAgICAgICgpID0+IHsgZGV0ZWN0Q3VycmVudFNsaWRlKCk7IH0sXHJcbiAgICApO1xyXG4gIH0gY2F0Y2ggeyAvKiBvdXRzaWRlIE9mZmljZSBob3N0IOKAlCBzbGlkZSBkZXRlY3Rpb24gdW5hdmFpbGFibGUgKi8gfVxyXG5cclxuICAvLyBWaWV3ZXIgbWVzc2FnZSDihpIgdXBkYXRlIHN0YXR1cyBpbmRpY2F0b3JcclxuICBsYXVuY2hlci5vbk1lc3NhZ2UoaGFuZGxlVmlld2VyTWVzc2FnZSk7XHJcblxyXG4gIC8vIERpYWxvZyBjbG9zZWQgKHVzZXIgY2xvc2VkIHdpbmRvdyBvciBuYXZpZ2F0aW9uIGVycm9yKSDihpIgdXBkYXRlIFVJXHJcbiAgbGF1bmNoZXIub25DbG9zZWQoaGFuZGxlVmlld2VyQ2xvc2VkKTtcclxuXHJcbiAgLy8gU3RhcnQgcG9sbGluZyBmb3Igc2xpZGVzaG93IG1vZGUuXHJcbiAgLy8gVGhlIGNvbW1hbmRzIHJ1bnRpbWUgKEZ1bmN0aW9uRmlsZSkgbWF5IG5vdCBwZXJzaXN0LCBzbyB0aGUgdGFza3BhbmVcclxuICAvLyBoYW5kbGVzIGF1dG8tb3BlbiBhcyBhIHJlbGlhYmxlIGZhbGxiYWNrLlxyXG4gIHN0YXJ0Vmlld01vZGVQb2xsaW5nKCk7XHJcblxyXG4gICQoJ2J0bi1ob3d0by10b2dnbGUnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUhvd1RvVG9nZ2xlKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEJvb3RzdHJhcCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmluc3RhbGxVbmhhbmRsZWRSZWplY3Rpb25IYW5kbGVyKCk7XHJcbk9mZmljZS5vblJlYWR5KCgpID0+IGluaXQoKSk7XHJcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==