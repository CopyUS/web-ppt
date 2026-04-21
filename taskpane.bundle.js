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
exports.DEBUG = exports.URL_DISPLAY_MAX_LENGTH = exports.IFRAME_LOAD_TIMEOUT_MS = exports.SETTINGS_SAVE_RETRY_DELAY_MS = exports.SETTINGS_SAVE_MAX_RETRIES = exports.AUTO_CLOSE_STEPS = exports.AUTO_CLOSE_MAX_SEC = exports.DEFAULT_AUTO_CLOSE_SEC = exports.ZOOM_MAX = exports.ZOOM_MIN = exports.DEFAULT_AUTO_OPEN = exports.DEFAULT_DIALOG_HEIGHT = exports.DEFAULT_DIALOG_WIDTH = exports.DEFAULT_ZOOM = exports.SETTING_KEY_DEFAULTS = exports.SETTING_KEY_LANGUAGE = exports.SETTING_KEY_SLIDE_PREFIX = void 0;
exports.truncateUrl = truncateUrl;
/** Prefix for per-slide setting keys. Full key: `webppt_slide_{slideId}`. */
exports.SETTING_KEY_SLIDE_PREFIX = 'webppt_slide_';
/** Key for the saved UI language. */
exports.SETTING_KEY_LANGUAGE = 'webppt_language';
/** Key for global default slide config. */
exports.SETTING_KEY_DEFAULTS = 'webppt_defaults';
// ─── Viewer defaults ──────────────────────────────────────────────────────────
exports.DEFAULT_ZOOM = 100;
exports.DEFAULT_DIALOG_WIDTH = 80; // % of screen
exports.DEFAULT_DIALOG_HEIGHT = 80; // % of screen
exports.DEFAULT_AUTO_OPEN = true;
// ─── Constraint ranges ────────────────────────────────────────────────────────
exports.ZOOM_MIN = 50;
exports.ZOOM_MAX = 300;
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

module.exports = /*#__PURE__*/JSON.parse('{"en":{"insertWebPage":"Add WebPage.PPT","editPageProperty":"Edit Page Property","enterUrl":"Enter URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Window size","autoOpen":"Auto-open on slide change","showWebPage":"Show WebPage.PPT","ownSiteBlocked":"Is this your own site?","showSetupGuide":"Show setup guide","openDirectly":"Open directly (no frame)","apply":"Apply","cancel":"Cancel","language":"Language","iframeBlocked":"This site blocks embedding.","iframeBlockedHint":"If this is your site, you can fix it in one line.","noUrl":"Please enter a valid URL","noUrlForSlide":"No URL configured for this slide","success":"Settings saved","errorGeneric":"Something went wrong. Please try again.","dialogAlreadyOpen":"A web page viewer is already open.","dialogBlocked":"The viewer was blocked. Please allow pop-ups for this site.","openInBrowser":"Open in browser","guideTitle":"How to allow embedding","guideIntro":"Add one of these snippets to the server that hosts the linked page:","guideNote":"Restart your server and reload the slide after making changes.","copy":"Copy","copied":"Copied!","hideSetupGuide":"Hide guide","slideLabel":"Slide","dialogWidth":"Width","dialogHeight":"Height","lockSize":"Lock proportions","setAsDefaults":"Save as defaults for new slides","defaultsSaved":"Default settings saved for new slides","siteNotLoading":"Site not loading?","guideMetaNote":"Note: frame-ancestors in a meta tag may be ignored if the server already sets X-Frame-Options headers.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"What is X-Frame-Options?","guideFaqXFrameA":"An HTTP header that controls whether your site can be shown inside an iframe. Some servers set it to DENY or SAMEORIGIN by default, blocking embedding.","guideFaqUnknownServerQ":"I don\'t know which server I have","guideFaqUnknownServerA":"Check your project files: nginx.conf → Nginx, .htaccess → Apache, app.js or server.js → Node.js/Express. For shared hosting, ask your provider.","guideFaqNoAccessQ":"I don\'t have server access","guideFaqNoAccessA":"Use the \\"Open directly\\" button in the viewer — it opens the page in a full browser window without iframe restrictions.","viewerLoading":"Loading page…","viewerLoaded":"Page loaded","viewerBlocked":"Site blocked embedding","viewerError":"Page failed to load","viewerClosed":"Viewer closed","help":"Help","infoTooltip":"Info","noInternet":"No internet connection. Check your connection and try again.","loadTimeout":"The page is taking too long to load.","dialogUnsupported":"Your version of Office does not support the viewer window. Please update Office.","settingsSaveRetryFailed":"Could not save settings. Please try again later.","selectSlide":"Please select a slide first.","urlAutoFixed":"Added https:// to the URL.","autoClose":"Auto-close after","autoCloseOff":"Off","countdownText":"Closes in {n}s","autoCloseHint":"The web page window captures focus from PowerPoint. While it is open, your clicker/remote will not work — you won\'t be able to close the slide or switch to the next one. You will need to use the keyboard or mouse on the computer running PowerPoint. Auto-close returns focus automatically after the set time (the link will be displayed for that duration, and the clicker won\'t work during this period). Once the window closes, clicker control is restored. Plan how long you need to present the linked content and set the timer accordingly.","autoOpenHint":"When enabled, the web page opens automatically each time you navigate to this slide during a presentation. You don\'t need to click \\"Show Web Page\\" manually — the viewer appears as soon as the slide is displayed. Especially useful when the presentation is controlled by a clicker/remote.","guideImageTitle":"Option 1: Link to an image","guideImageDesc":"If your site can export content as an image (.png, .jpg, .webp, .gif, .svg), paste the direct URL to the image file. No server changes needed — the image displays without an iframe, refreshes automatically each time the slide is shown, and focus returns to PowerPoint so your clicker/remote keeps working.","guideServerTitle":"Option 2: Allow iframe embedding"},"zh":{"insertWebPage":"添加 WebPage.PPT","editPageProperty":"编辑页面属性","enterUrl":"输入 URL","urlPlaceholder":"https://example.com","zoom":"缩放","dialogSize":"窗口大小","autoOpen":"切换幻灯片时自动打开","showWebPage":"显示 WebPage.PPT","ownSiteBlocked":"这是您自己的网站吗？","showSetupGuide":"显示设置指南","openDirectly":"直接打开（无框架）","apply":"应用","cancel":"取消","language":"语言","iframeBlocked":"此网站阻止嵌入。","iframeBlockedHint":"如果这是您的网站，一行代码即可修复。","noUrl":"请输入有效的 URL","noUrlForSlide":"此幻灯片未配置 URL","success":"设置已保存","errorGeneric":"出现问题，请重试。","dialogAlreadyOpen":"网页查看器已打开。","dialogBlocked":"查看器被阻止。请允许此站点的弹出窗口。","openInBrowser":"在浏览器中打开","guideTitle":"如何允许嵌入","guideIntro":"将以下代码片段之一添加到托管链接页面的服务器：","guideNote":"更改后请重启服务器并重新加载幻灯片。","copy":"复制","copied":"已复制！","hideSetupGuide":"隐藏指南","slideLabel":"幻灯片","dialogWidth":"宽度","dialogHeight":"高度","lockSize":"锁定比例","setAsDefaults":"保存为新幻灯片的默认设置","defaultsSaved":"已保存新幻灯片的默认设置","siteNotLoading":"网站无法加载？","guideMetaNote":"注意：如果服务器已设置 X-Frame-Options 头，meta 标签中的 frame-ancestors 可能被忽略。","guideFaqTitle":"常见问题","guideFaqXFrameQ":"什么是 X-Frame-Options？","guideFaqXFrameA":"一种 HTTP 头，控制您的网站是否可以在 iframe 中显示。某些服务器默认设置为 DENY 或 SAMEORIGIN，从而阻止嵌入。","guideFaqUnknownServerQ":"我不知道我的服务器类型","guideFaqUnknownServerA":"检查项目文件：nginx.conf → Nginx，.htaccess → Apache，app.js 或 server.js → Node.js/Express。共享主机请咨询提供商。","guideFaqNoAccessQ":"我没有服务器访问权限","guideFaqNoAccessA":"使用查看器中的「直接打开」按钮——它会在完整的浏览器窗口中打开页面，没有 iframe 限制。","viewerLoading":"正在加载页面…","viewerLoaded":"页面已加载","viewerBlocked":"网站阻止了嵌入","viewerError":"页面加载失败","viewerClosed":"查看器已关闭","help":"帮助","infoTooltip":"信息","noInternet":"无网络连接。请检查连接后重试。","loadTimeout":"页面加载时间过长。","dialogUnsupported":"您的 Office 版本不支持查看器窗口。请更新 Office。","settingsSaveRetryFailed":"无法保存设置。请稍后重试。","selectSlide":"请先选择一张幻灯片。","urlAutoFixed":"已为 URL 添加 https://。","autoClose":"自动关闭时间","autoCloseOff":"关闭","countdownText":"{n}秒后关闭","autoCloseHint":"网页窗口会从 PowerPoint 获取焦点。窗口打开时，演示遥控器/翻页器无法工作——您无法关闭幻灯片或切换到下一张。您需要使用运行 PowerPoint 的电脑的键盘或鼠标。自动关闭会在设定时间后自动返回焦点（链接会在此期间显示，翻页器在此期间不工作）。窗口关闭后，翻页器恢复控制。请规划您需要展示链接内容的时间并相应设置计时器。","autoOpenHint":"启用后，演示过程中每次切换到此幻灯片时，网页会自动打开。无需手动点击「显示网页」——幻灯片显示时查看器会自动出现。使用遥控器/翻页器控制演示时特别有用。","guideImageTitle":"选项 1：链接到图片","guideImageDesc":"如果您的网站可以将内容导出为图片（.png、.jpg、.webp、.gif、.svg），请粘贴图片文件的直接 URL。无需更改服务器——图片无需 iframe 即可显示，每次显示幻灯片时自动刷新，焦点会返回 PowerPoint，您的遥控器/翻页器可继续使用。","guideServerTitle":"选项 2：允许 iframe 嵌入"},"es":{"insertWebPage":"Añadir WebPage.PPT","editPageProperty":"Propiedades de página","enterUrl":"Ingrese la URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Tamaño de ventana","autoOpen":"Abrir al cambiar de diapositiva","showWebPage":"Mostrar WebPage.PPT","ownSiteBlocked":"¿Es su propio sitio?","showSetupGuide":"Mostrar guía","openDirectly":"Abrir directamente (sin marco)","apply":"Aplicar","cancel":"Cancelar","language":"Idioma","iframeBlocked":"Este sitio bloquea la incrustación.","iframeBlockedHint":"Si es su sitio, se arregla en una línea.","noUrl":"Ingrese una URL válida","noUrlForSlide":"No hay URL configurada para esta diapositiva","success":"Configuración guardada","errorGeneric":"Algo salió mal. Inténtelo de nuevo.","dialogAlreadyOpen":"Ya hay una ventana de visor abierta.","dialogBlocked":"La ventana fue bloqueada. Permita ventanas emergentes para este sitio.","openInBrowser":"Abrir en navegador","guideTitle":"Cómo permitir la incrustación","guideIntro":"Agregue uno de estos fragmentos al servidor que aloja la página enlazada:","guideNote":"Reinicie su servidor y recargue la diapositiva después de los cambios.","copy":"Copiar","copied":"¡Copiado!","hideSetupGuide":"Ocultar guía","slideLabel":"Diapositiva","dialogWidth":"Ancho","dialogHeight":"Alto","lockSize":"Vincular proporciones","setAsDefaults":"Guardar como ajustes predeterminados para nuevas diapositivas","defaultsSaved":"Ajustes predeterminados guardados","siteNotLoading":"¿El sitio no carga?","guideMetaNote":"Nota: frame-ancestors en una etiqueta meta puede no funcionar si el servidor ya establece encabezados X-Frame-Options.","guideFaqTitle":"Preguntas frecuentes","guideFaqXFrameQ":"¿Qué es X-Frame-Options?","guideFaqXFrameA":"Un encabezado HTTP que controla si su sitio puede mostrarse dentro de un iframe. Algunos servidores lo configuran como DENY o SAMEORIGIN por defecto.","guideFaqUnknownServerQ":"No sé qué servidor tengo","guideFaqUnknownServerA":"Revise los archivos del proyecto: nginx.conf → Nginx, .htaccess → Apache, app.js o server.js → Node.js/Express. En hosting compartido, pregunte a su proveedor.","guideFaqNoAccessQ":"No tengo acceso al servidor","guideFaqNoAccessA":"Use el botón \\"Abrir directamente\\" en el visor — abre la página en una ventana completa del navegador sin restricciones de iframe.","viewerLoading":"Cargando página…","viewerLoaded":"Página cargada","viewerBlocked":"El sitio bloquea la incrustación","viewerError":"No se pudo cargar la página","viewerClosed":"Visor cerrado","help":"Ayuda","infoTooltip":"Info","noInternet":"Sin conexión a Internet. Verifique su conexión e inténtelo de nuevo.","loadTimeout":"La página tarda demasiado en cargar.","dialogUnsupported":"Su versión de Office no soporta la ventana de visor. Actualice Office.","settingsSaveRetryFailed":"No se pudieron guardar los ajustes. Inténtelo más tarde.","selectSlide":"Primero seleccione una diapositiva.","urlAutoFixed":"Se añadió https:// a la URL.","autoClose":"Cerrar después de","autoCloseOff":"Desact.","countdownText":"Se cierra en {n}s","autoCloseHint":"La ventana de la página web captura el foco de PowerPoint. Mientras está abierta, el control remoto/clicker no funcionará: no podrá cerrar la diapositiva ni pasar a la siguiente. Deberá usar el teclado o ratón del ordenador con PowerPoint. El cierre automático devuelve el foco automáticamente después del tiempo configurado (el enlace se mostrará durante ese período y el clicker no funcionará). Una vez cerrada la ventana, el control vuelve al clicker. Planifique cuánto tiempo necesita para presentar el contenido del enlace y ajuste el temporizador.","autoOpenHint":"Si está activado, la página web se abre automáticamente cada vez que navega a esta diapositiva durante la presentación. No necesita pulsar \\"Mostrar página web\\" manualmente — el visor aparece en cuanto se muestra la diapositiva. Especialmente útil cuando la presentación se controla con un clicker/mando.","guideImageTitle":"Opción 1: Enlace a una imagen","guideImageDesc":"Si su sitio puede exportar contenido como imagen (.png, .jpg, .webp, .gif, .svg), pegue la URL directa del archivo. No requiere cambios en el servidor — la imagen se muestra sin iframe, se actualiza automáticamente cada vez que se muestra la diapositiva, y el foco vuelve a PowerPoint para que su clicker/mando siga funcionando.","guideServerTitle":"Opción 2: Permitir la incrustación en iframe"},"de":{"insertWebPage":"WebPage.PPT hinzufügen","editPageProperty":"Seiteneigenschaften bearbeiten","enterUrl":"URL eingeben","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Fenstergröße","autoOpen":"Beim Folienwechsel automatisch öffnen","showWebPage":"WebPage.PPT anzeigen","ownSiteBlocked":"Ist das Ihre eigene Website?","showSetupGuide":"Anleitung anzeigen","openDirectly":"Direkt öffnen (ohne Rahmen)","apply":"Anwenden","cancel":"Abbrechen","language":"Sprache","iframeBlocked":"Diese Website blockiert die Einbettung.","iframeBlockedHint":"Wenn es Ihre Website ist, lässt sich das mit einer Zeile beheben.","noUrl":"Bitte geben Sie eine gültige URL ein","noUrlForSlide":"Für diese Folie ist keine URL konfiguriert","success":"Einstellungen gespeichert","errorGeneric":"Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.","dialogAlreadyOpen":"Ein Webseiten-Viewer ist bereits geöffnet.","dialogBlocked":"Der Viewer wurde blockiert. Bitte erlauben Sie Pop-ups für diese Website.","openInBrowser":"Im Browser öffnen","guideTitle":"Einbettung erlauben","guideIntro":"Fügen Sie einen dieser Code-Schnipsel zum Server hinzu, der die verlinkte Seite hostet:","guideNote":"Starten Sie Ihren Server neu und laden Sie die Folie nach den Änderungen neu.","copy":"Kopieren","copied":"Kopiert!","hideSetupGuide":"Anleitung ausblenden","slideLabel":"Folie","dialogWidth":"Breite","dialogHeight":"Höhe","lockSize":"Proportionen sperren","setAsDefaults":"Als Standard für neue Folien speichern","defaultsSaved":"Standardeinstellungen für neue Folien gespeichert","siteNotLoading":"Website lädt nicht?","guideMetaNote":"Hinweis: frame-ancestors in einem Meta-Tag wird möglicherweise ignoriert, wenn der Server bereits X-Frame-Options-Header setzt.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"Was ist X-Frame-Options?","guideFaqXFrameA":"Ein HTTP-Header, der steuert, ob Ihre Website in einem iframe angezeigt werden kann. Einige Server setzen ihn standardmäßig auf DENY oder SAMEORIGIN.","guideFaqUnknownServerQ":"Ich weiß nicht, welchen Server ich habe","guideFaqUnknownServerA":"Prüfen Sie Ihre Projektdateien: nginx.conf → Nginx, .htaccess → Apache, app.js oder server.js → Node.js/Express. Bei Shared Hosting fragen Sie Ihren Anbieter.","guideFaqNoAccessQ":"Ich habe keinen Serverzugang","guideFaqNoAccessA":"Verwenden Sie die Schaltfläche \\"Direkt öffnen\\" im Viewer — sie öffnet die Seite in einem vollständigen Browserfenster ohne iframe-Einschränkungen.","viewerLoading":"Seite wird geladen…","viewerLoaded":"Seite geladen","viewerBlocked":"Website blockiert die Einbettung","viewerError":"Seite konnte nicht geladen werden","viewerClosed":"Viewer geschlossen","help":"Hilfe","infoTooltip":"Info","noInternet":"Keine Internetverbindung. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.","loadTimeout":"Die Seite braucht zu lange zum Laden.","dialogUnsupported":"Ihre Office-Version unterstützt das Viewer-Fenster nicht. Bitte aktualisieren Sie Office.","settingsSaveRetryFailed":"Einstellungen konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.","selectSlide":"Bitte wählen Sie zuerst eine Folie aus.","urlAutoFixed":"https:// wurde zur URL hinzugefügt.","autoClose":"Automatisch schließen nach","autoCloseOff":"Aus","countdownText":"Schließt in {n}s","autoCloseHint":"Das Webseiten-Fenster übernimmt den Fokus von PowerPoint. Solange es geöffnet ist, funktioniert Ihr Clicker/Fernbedienung nicht — Sie können die Folie nicht schließen oder zur nächsten wechseln. Sie müssen Tastatur oder Maus am PowerPoint-Computer verwenden. Automatisches Schließen gibt den Fokus nach der eingestellten Zeit automatisch zurück (der Link wird während dieser Zeit angezeigt, der Clicker funktioniert nicht). Nach dem Schließen wird die Clicker-Steuerung wiederhergestellt. Planen Sie, wie lange Sie den verlinkten Inhalt präsentieren möchten, und stellen Sie den Timer entsprechend ein.","autoOpenHint":"Wenn aktiviert, öffnet sich die Webseite automatisch jedes Mal, wenn Sie während einer Präsentation zu dieser Folie navigieren. Sie müssen nicht manuell \\"Webseite anzeigen\\" klicken — der Viewer erscheint sofort bei Anzeige der Folie. Besonders nützlich bei Steuerung mit Clicker/Fernbedienung.","guideImageTitle":"Option 1: Link zu einem Bild","guideImageDesc":"Wenn Ihre Website Inhalte als Bild exportieren kann (.png, .jpg, .webp, .gif, .svg), fügen Sie die direkte URL zur Bilddatei ein. Keine Serveränderungen nötig — das Bild wird ohne iframe angezeigt, aktualisiert sich bei jedem Folienwechsel automatisch, und der Fokus kehrt zu PowerPoint zurück, sodass Ihr Clicker/Fernbedienung weiter funktioniert.","guideServerTitle":"Option 2: iframe-Einbettung erlauben"},"fr":{"insertWebPage":"Ajouter WebPage.PPT","editPageProperty":"Propriétés de la page","enterUrl":"Entrez l\'URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Taille de la fenêtre","autoOpen":"Ouvrir automatiquement au changement de diapositive","showWebPage":"Afficher WebPage.PPT","ownSiteBlocked":"Est-ce votre propre site ?","showSetupGuide":"Afficher le guide","openDirectly":"Ouvrir directement (sans cadre)","apply":"Appliquer","cancel":"Annuler","language":"Langue","iframeBlocked":"Ce site bloque l\'intégration.","iframeBlockedHint":"Si c\'est votre site, cela se corrige en une ligne.","noUrl":"Veuillez entrer une URL valide","noUrlForSlide":"Aucune URL configurée pour cette diapositive","success":"Paramètres enregistrés","errorGeneric":"Une erreur s\'est produite. Veuillez réessayer.","dialogAlreadyOpen":"Une fenêtre de visualisation est déjà ouverte.","dialogBlocked":"La fenêtre a été bloquée. Veuillez autoriser les pop-ups pour ce site.","openInBrowser":"Ouvrir dans le navigateur","guideTitle":"Comment autoriser l\'intégration","guideIntro":"Ajoutez l\'un de ces extraits au serveur qui héberge la page liée :","guideNote":"Redémarrez votre serveur et rechargez la diapositive après les modifications.","copy":"Copier","copied":"Copié !","hideSetupGuide":"Masquer le guide","slideLabel":"Diapositive","dialogWidth":"Largeur","dialogHeight":"Hauteur","lockSize":"Verrouiller les proportions","setAsDefaults":"Enregistrer comme paramètres par défaut pour les nouvelles diapositives","defaultsSaved":"Paramètres par défaut enregistrés pour les nouvelles diapositives","siteNotLoading":"Le site ne charge pas ?","guideMetaNote":"Remarque : frame-ancestors dans une balise meta peut être ignoré si le serveur définit déjà des en-têtes X-Frame-Options.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"Qu\'est-ce que X-Frame-Options ?","guideFaqXFrameA":"Un en-tête HTTP qui contrôle si votre site peut être affiché dans un iframe. Certains serveurs le configurent par défaut sur DENY ou SAMEORIGIN.","guideFaqUnknownServerQ":"Je ne sais pas quel serveur j\'ai","guideFaqUnknownServerA":"Vérifiez vos fichiers de projet : nginx.conf → Nginx, .htaccess → Apache, app.js ou server.js → Node.js/Express. Pour l\'hébergement mutualisé, demandez à votre fournisseur.","guideFaqNoAccessQ":"Je n\'ai pas accès au serveur","guideFaqNoAccessA":"Utilisez le bouton \\"Ouvrir directement\\" dans le visualiseur — il ouvre la page dans une fenêtre de navigateur complète sans restrictions iframe.","viewerLoading":"Chargement de la page…","viewerLoaded":"Page chargée","viewerBlocked":"Le site bloque l\'intégration","viewerError":"Échec du chargement de la page","viewerClosed":"Visualiseur fermé","help":"Aide","infoTooltip":"Info","noInternet":"Pas de connexion Internet. Vérifiez votre connexion et réessayez.","loadTimeout":"La page met trop de temps à charger.","dialogUnsupported":"Votre version d\'Office ne prend pas en charge la fenêtre de visualisation. Veuillez mettre à jour Office.","settingsSaveRetryFailed":"Impossible d\'enregistrer les paramètres. Veuillez réessayer plus tard.","selectSlide":"Veuillez d\'abord sélectionner une diapositive.","urlAutoFixed":"https:// a été ajouté à l\'URL.","autoClose":"Fermeture automatique après","autoCloseOff":"Désactivé","countdownText":"Fermeture dans {n}s","autoCloseHint":"La fenêtre de page web capture le focus de PowerPoint. Tant qu\'elle est ouverte, votre clicker/télécommande ne fonctionnera pas — vous ne pourrez pas fermer la diapositive ou passer à la suivante. Vous devrez utiliser le clavier ou la souris de l\'ordinateur exécutant PowerPoint. La fermeture automatique rend le focus automatiquement après le temps défini (le lien sera affiché pendant cette durée, le clicker ne fonctionnera pas). Une fois la fenêtre fermée, le contrôle du clicker est restauré. Prévoyez combien de temps vous avez besoin pour présenter le contenu lié et réglez le minuteur en conséquence.","autoOpenHint":"Lorsqu\'activé, la page web s\'ouvre automatiquement chaque fois que vous naviguez vers cette diapositive pendant une présentation. Pas besoin de cliquer \\"Afficher la page web\\" manuellement — le visualiseur apparaît dès que la diapositive est affichée. Particulièrement utile lorsque la présentation est contrôlée par un clicker/télécommande.","guideImageTitle":"Option 1 : Lien vers une image","guideImageDesc":"Si votre site peut exporter du contenu sous forme d\'image (.png, .jpg, .webp, .gif, .svg), collez l\'URL directe du fichier image. Aucune modification du serveur nécessaire — l\'image s\'affiche sans iframe, se rafraîchit automatiquement à chaque affichage de la diapositive, et le focus revient à PowerPoint pour que votre clicker/télécommande continue de fonctionner.","guideServerTitle":"Option 2 : Autoriser l\'intégration iframe"},"it":{"insertWebPage":"Aggiungi WebPage.PPT","editPageProperty":"Proprietà pagina","enterUrl":"Inserisci URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Dimensione finestra","autoOpen":"Apri automaticamente al cambio diapositiva","showWebPage":"Mostra WebPage.PPT","ownSiteBlocked":"È il tuo sito web?","showSetupGuide":"Mostra guida","openDirectly":"Apri direttamente (senza cornice)","apply":"Applica","cancel":"Annulla","language":"Lingua","iframeBlocked":"Questo sito blocca l\'incorporamento.","iframeBlockedHint":"Se è il tuo sito, si risolve con una riga.","noUrl":"Inserisci un URL valido","noUrlForSlide":"Nessun URL configurato per questa diapositiva","success":"Impostazioni salvate","errorGeneric":"Qualcosa è andato storto. Riprova.","dialogAlreadyOpen":"Una finestra di visualizzazione è già aperta.","dialogBlocked":"La finestra è stata bloccata. Consenti i pop-up per questo sito.","openInBrowser":"Apri nel browser","guideTitle":"Come consentire l\'incorporamento","guideIntro":"Aggiungi uno di questi frammenti al server che ospita la pagina collegata:","guideNote":"Riavvia il server e ricarica la diapositiva dopo le modifiche.","copy":"Copia","copied":"Copiato!","hideSetupGuide":"Nascondi guida","slideLabel":"Diapositiva","dialogWidth":"Larghezza","dialogHeight":"Altezza","lockSize":"Blocca proporzioni","setAsDefaults":"Salva come impostazioni predefinite per nuove diapositive","defaultsSaved":"Impostazioni predefinite salvate per nuove diapositive","siteNotLoading":"Il sito non si carica?","guideMetaNote":"Nota: frame-ancestors in un tag meta potrebbe essere ignorato se il server imposta già gli header X-Frame-Options.","guideFaqTitle":"FAQ","guideFaqXFrameQ":"Cos\'è X-Frame-Options?","guideFaqXFrameA":"Un header HTTP che controlla se il tuo sito può essere mostrato in un iframe. Alcuni server lo impostano su DENY o SAMEORIGIN per impostazione predefinita.","guideFaqUnknownServerQ":"Non so quale server ho","guideFaqUnknownServerA":"Controlla i file del progetto: nginx.conf → Nginx, .htaccess → Apache, app.js o server.js → Node.js/Express. Per hosting condiviso, chiedi al tuo provider.","guideFaqNoAccessQ":"Non ho accesso al server","guideFaqNoAccessA":"Usa il pulsante \\"Apri direttamente\\" nel visualizzatore — apre la pagina in una finestra del browser completa senza restrizioni iframe.","viewerLoading":"Caricamento pagina…","viewerLoaded":"Pagina caricata","viewerBlocked":"Il sito blocca l\'incorporamento","viewerError":"Impossibile caricare la pagina","viewerClosed":"Visualizzatore chiuso","help":"Aiuto","infoTooltip":"Info","noInternet":"Nessuna connessione Internet. Verifica la connessione e riprova.","loadTimeout":"La pagina impiega troppo tempo a caricarsi.","dialogUnsupported":"La tua versione di Office non supporta la finestra di visualizzazione. Aggiorna Office.","settingsSaveRetryFailed":"Impossibile salvare le impostazioni. Riprova più tardi.","selectSlide":"Seleziona prima una diapositiva.","urlAutoFixed":"Aggiunto https:// all\'URL.","autoClose":"Chiusura automatica dopo","autoCloseOff":"Disattivato","countdownText":"Si chiude tra {n}s","autoCloseHint":"La finestra della pagina web cattura il focus da PowerPoint. Mentre è aperta, il clicker/telecomando non funzionerà — non potrai chiudere la diapositiva o passare alla successiva. Dovrai usare tastiera o mouse sul computer con PowerPoint. La chiusura automatica restituisce il focus dopo il tempo impostato (il link sarà visualizzato per quel periodo, il clicker non funzionerà). Una volta chiusa la finestra, il controllo del clicker viene ripristinato. Pianifica quanto tempo ti serve per presentare il contenuto del link e imposta il timer di conseguenza.","autoOpenHint":"Se attivato, la pagina web si apre automaticamente ogni volta che navighi su questa diapositiva durante la presentazione. Non devi cliccare \\"Mostra pagina web\\" manualmente — il visualizzatore appare non appena viene mostrata la diapositiva. Particolarmente utile quando la presentazione è controllata con clicker/telecomando.","guideImageTitle":"Opzione 1: Link a un\'immagine","guideImageDesc":"Se il tuo sito può esportare contenuti come immagine (.png, .jpg, .webp, .gif, .svg), incolla l\'URL diretto del file. Nessuna modifica al server necessaria — l\'immagine viene mostrata senza iframe, si aggiorna automaticamente ad ogni visualizzazione della diapositiva, e il focus torna a PowerPoint per far funzionare il clicker/telecomando.","guideServerTitle":"Opzione 2: Consentire l\'incorporamento iframe"},"ar":{"insertWebPage":"إضافة WebPage.PPT","editPageProperty":"تعديل خصائص الصفحة","enterUrl":"أدخل عنوان URL","urlPlaceholder":"https://example.com","zoom":"تكبير","dialogSize":"حجم النافذة","autoOpen":"فتح تلقائي عند تغيير الشريحة","showWebPage":"عرض WebPage.PPT","ownSiteBlocked":"هل هذا موقعك الخاص؟","showSetupGuide":"عرض دليل الإعداد","openDirectly":"فتح مباشرة (بدون إطار)","apply":"تطبيق","cancel":"إلغاء","language":"اللغة","iframeBlocked":"هذا الموقع يمنع التضمين.","iframeBlockedHint":"إذا كان هذا موقعك، يمكن إصلاحه بسطر واحد.","noUrl":"يرجى إدخال عنوان URL صالح","noUrlForSlide":"لم يتم تكوين عنوان URL لهذه الشريحة","success":"تم حفظ الإعدادات","errorGeneric":"حدث خطأ ما. يرجى المحاولة مرة أخرى.","dialogAlreadyOpen":"نافذة عرض صفحة الويب مفتوحة بالفعل.","dialogBlocked":"تم حظر العارض. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.","openInBrowser":"فتح في المتصفح","guideTitle":"كيفية السماح بالتضمين","guideIntro":"أضف أحد هذه المقاطع إلى الخادم الذي يستضيف الصفحة المرتبطة:","guideNote":"أعد تشغيل الخادم وأعد تحميل الشريحة بعد إجراء التغييرات.","copy":"نسخ","copied":"تم النسخ!","hideSetupGuide":"إخفاء الدليل","slideLabel":"شريحة","dialogWidth":"العرض","dialogHeight":"الارتفاع","lockSize":"قفل النسب","setAsDefaults":"حفظ كإعدادات افتراضية للشرائح الجديدة","defaultsSaved":"تم حفظ الإعدادات الافتراضية للشرائح الجديدة","siteNotLoading":"الموقع لا يتحمل؟","guideMetaNote":"ملاحظة: قد يتم تجاهل frame-ancestors في علامة meta إذا كان الخادم يعيّن بالفعل ترويسات X-Frame-Options.","guideFaqTitle":"الأسئلة الشائعة","guideFaqXFrameQ":"ما هو X-Frame-Options؟","guideFaqXFrameA":"ترويسة HTTP تتحكم في إمكانية عرض موقعك داخل iframe. بعض الخوادم تعيّنه افتراضيًا على DENY أو SAMEORIGIN.","guideFaqUnknownServerQ":"لا أعرف نوع الخادم لدي","guideFaqUnknownServerA":"تحقق من ملفات المشروع: nginx.conf → Nginx، .htaccess → Apache، app.js أو server.js → Node.js/Express. للاستضافة المشتركة، اسأل مزود الخدمة.","guideFaqNoAccessQ":"ليس لدي وصول إلى الخادم","guideFaqNoAccessA":"استخدم زر \\"فتح مباشرة\\" في العارض — يفتح الصفحة في نافذة متصفح كاملة بدون قيود iframe.","viewerLoading":"جاري تحميل الصفحة…","viewerLoaded":"تم تحميل الصفحة","viewerBlocked":"الموقع يمنع التضمين","viewerError":"فشل تحميل الصفحة","viewerClosed":"تم إغلاق العارض","help":"مساعدة","infoTooltip":"معلومات","noInternet":"لا يوجد اتصال بالإنترنت. تحقق من الاتصال وحاول مرة أخرى.","loadTimeout":"الصفحة تستغرق وقتًا طويلاً في التحميل.","dialogUnsupported":"إصدار Office الخاص بك لا يدعم نافذة العرض. يرجى تحديث Office.","settingsSaveRetryFailed":"تعذر حفظ الإعدادات. يرجى المحاولة لاحقًا.","selectSlide":"يرجى تحديد شريحة أولاً.","urlAutoFixed":"تمت إضافة https:// إلى عنوان URL.","autoClose":"إغلاق تلقائي بعد","autoCloseOff":"إيقاف","countdownText":"يُغلق خلال {n} ثانية","autoCloseHint":"نافذة صفحة الويب تلتقط التركيز من PowerPoint. أثناء فتحها، لن يعمل جهاز التحكم/الكليكر — لن تتمكن من إغلاق الشريحة أو الانتقال إلى التالية. ستحتاج إلى استخدام لوحة المفاتيح أو الماوس على الكمبيوتر الذي يشغّل PowerPoint. الإغلاق التلقائي يعيد التركيز تلقائيًا بعد الوقت المحدد. بعد إغلاق النافذة، يتم استعادة التحكم بالكليكر. خطط للوقت الذي تحتاجه لعرض المحتوى واضبط المؤقت وفقًا لذلك.","autoOpenHint":"عند التفعيل، تُفتح صفحة الويب تلقائيًا في كل مرة تنتقل فيها إلى هذه الشريحة أثناء العرض التقديمي. لا حاجة للنقر على \\"عرض صفحة الويب\\" يدويًا — يظهر العارض فور عرض الشريحة. مفيد بشكل خاص عند التحكم بالعرض عبر كليكر/جهاز تحكم.","guideImageTitle":"الخيار 1: رابط لصورة","guideImageDesc":"إذا كان موقعك يمكنه تصدير المحتوى كصورة (.png، .jpg، .webp، .gif، .svg)، الصق عنوان URL المباشر لملف الصورة. لا حاجة لتغييرات في الخادم — تُعرض الصورة بدون iframe، وتتحدث تلقائيًا عند كل عرض للشريحة، ويعود التركيز إلى PowerPoint.","guideServerTitle":"الخيار 2: السماح بتضمين iframe"},"pt":{"insertWebPage":"Adicionar WebPage.PPT","editPageProperty":"Propriedades da página","enterUrl":"Insira a URL","urlPlaceholder":"https://example.com","zoom":"Zoom","dialogSize":"Tamanho da janela","autoOpen":"Abrir automaticamente ao mudar de slide","showWebPage":"Mostrar WebPage.PPT","ownSiteBlocked":"Este é o seu próprio site?","showSetupGuide":"Mostrar guia","openDirectly":"Abrir diretamente (sem moldura)","apply":"Aplicar","cancel":"Cancelar","language":"Idioma","iframeBlocked":"Este site bloqueia a incorporação.","iframeBlockedHint":"Se é o seu site, pode ser corrigido com uma linha.","noUrl":"Insira uma URL válida","noUrlForSlide":"Nenhuma URL configurada para este slide","success":"Configurações salvas","errorGeneric":"Algo deu errado. Tente novamente.","dialogAlreadyOpen":"Uma janela de visualização já está aberta.","dialogBlocked":"A janela foi bloqueada. Permita pop-ups para este site.","openInBrowser":"Abrir no navegador","guideTitle":"Como permitir a incorporação","guideIntro":"Adicione um destes trechos ao servidor que hospeda a página vinculada:","guideNote":"Reinicie o servidor e recarregue o slide após as alterações.","copy":"Copiar","copied":"Copiado!","hideSetupGuide":"Ocultar guia","slideLabel":"Slide","dialogWidth":"Largura","dialogHeight":"Altura","lockSize":"Bloquear proporções","setAsDefaults":"Salvar como padrão para novos slides","defaultsSaved":"Configurações padrão salvas para novos slides","siteNotLoading":"O site não carrega?","guideMetaNote":"Nota: frame-ancestors em uma tag meta pode ser ignorado se o servidor já define cabeçalhos X-Frame-Options.","guideFaqTitle":"Perguntas frequentes","guideFaqXFrameQ":"O que é X-Frame-Options?","guideFaqXFrameA":"Um cabeçalho HTTP que controla se o seu site pode ser exibido dentro de um iframe. Alguns servidores o definem como DENY ou SAMEORIGIN por padrão.","guideFaqUnknownServerQ":"Não sei qual servidor eu tenho","guideFaqUnknownServerA":"Verifique os arquivos do projeto: nginx.conf → Nginx, .htaccess → Apache, app.js ou server.js → Node.js/Express. Para hospedagem compartilhada, pergunte ao seu provedor.","guideFaqNoAccessQ":"Não tenho acesso ao servidor","guideFaqNoAccessA":"Use o botão \\"Abrir diretamente\\" no visualizador — ele abre a página em uma janela completa do navegador sem restrições de iframe.","viewerLoading":"Carregando página…","viewerLoaded":"Página carregada","viewerBlocked":"O site bloqueia a incorporação","viewerError":"Falha ao carregar a página","viewerClosed":"Visualizador fechado","help":"Ajuda","infoTooltip":"Info","noInternet":"Sem conexão com a Internet. Verifique sua conexão e tente novamente.","loadTimeout":"A página está demorando muito para carregar.","dialogUnsupported":"Sua versão do Office não suporta a janela de visualização. Atualize o Office.","settingsSaveRetryFailed":"Não foi possível salvar as configurações. Tente novamente mais tarde.","selectSlide":"Selecione um slide primeiro.","urlAutoFixed":"https:// foi adicionado à URL.","autoClose":"Fechar automaticamente após","autoCloseOff":"Desligado","countdownText":"Fecha em {n}s","autoCloseHint":"A janela da página web captura o foco do PowerPoint. Enquanto estiver aberta, o clicker/controle remoto não funcionará — você não poderá fechar o slide ou avançar para o próximo. Será necessário usar teclado ou mouse no computador com PowerPoint. O fechamento automático retorna o foco automaticamente após o tempo definido. Após o fechamento da janela, o controle do clicker é restaurado. Planeje quanto tempo você precisa para apresentar o conteúdo vinculado e defina o temporizador.","autoOpenHint":"Quando ativado, a página web abre automaticamente cada vez que você navega para este slide durante a apresentação. Não é necessário clicar \\"Mostrar página web\\" manualmente — o visualizador aparece assim que o slide é exibido. Especialmente útil quando a apresentação é controlada por clicker/controle remoto.","guideImageTitle":"Opção 1: Link para uma imagem","guideImageDesc":"Se o seu site pode exportar conteúdo como imagem (.png, .jpg, .webp, .gif, .svg), cole a URL direta do arquivo. Nenhuma alteração no servidor necessária — a imagem é exibida sem iframe, atualiza automaticamente a cada exibição do slide, e o foco retorna ao PowerPoint para que o clicker/controle continue funcionando.","guideServerTitle":"Opção 2: Permitir incorporação iframe"},"hi":{"insertWebPage":"WebPage.PPT जोड़ें","editPageProperty":"पेज गुण संपादित करें","enterUrl":"URL दर्ज करें","urlPlaceholder":"https://example.com","zoom":"ज़ूम","dialogSize":"विंडो का आकार","autoOpen":"स्लाइड बदलने पर स्वतः खोलें","showWebPage":"WebPage.PPT दिखाएं","ownSiteBlocked":"क्या यह आपकी अपनी वेबसाइट है?","showSetupGuide":"सेटअप गाइड दिखाएं","openDirectly":"सीधे खोलें (बिना फ्रेम)","apply":"लागू करें","cancel":"रद्द करें","language":"भाषा","iframeBlocked":"यह साइट एम्बेडिंग को ब्लॉक करती है।","iframeBlockedHint":"अगर यह आपकी साइट है, तो एक लाइन में ठीक हो सकता है।","noUrl":"कृपया एक मान्य URL दर्ज करें","noUrlForSlide":"इस स्लाइड के लिए कोई URL कॉन्फ़िगर नहीं है","success":"सेटिंग्स सहेजी गईं","errorGeneric":"कुछ गलत हो गया। कृपया पुनः प्रयास करें।","dialogAlreadyOpen":"एक वेब पेज व्यूअर पहले से खुला है।","dialogBlocked":"व्यूअर ब्लॉक हो गया। कृपया इस साइट के लिए पॉप-अप की अनुमति दें।","openInBrowser":"ब्राउज़र में खोलें","guideTitle":"एम्बेडिंग की अनुमति कैसे दें","guideIntro":"लिंक किए गए पेज को होस्ट करने वाले सर्वर में इनमें से एक कोड जोड़ें:","guideNote":"बदलाव करने के बाद सर्वर को पुनः आरंभ करें और स्लाइड को रीलोड करें।","copy":"कॉपी","copied":"कॉपी हो गया!","hideSetupGuide":"गाइड छिपाएं","slideLabel":"स्लाइड","dialogWidth":"चौड़ाई","dialogHeight":"ऊंचाई","lockSize":"अनुपात लॉक करें","setAsDefaults":"नई स्लाइड्स के लिए डिफ़ॉल्ट के रूप में सहेजें","defaultsSaved":"नई स्लाइड्स के लिए डिफ़ॉल्ट सेटिंग्स सहेजी गईं","siteNotLoading":"साइट लोड नहीं हो रही?","guideMetaNote":"नोट: मेटा टैग में frame-ancestors को अनदेखा किया जा सकता है अगर सर्वर पहले से X-Frame-Options हेडर सेट करता है।","guideFaqTitle":"अक्सर पूछे जाने वाले प्रश्न","guideFaqXFrameQ":"X-Frame-Options क्या है?","guideFaqXFrameA":"एक HTTP हेडर जो नियंत्रित करता है कि आपकी साइट iframe में दिखाई जा सकती है या नहीं। कुछ सर्वर इसे डिफ़ॉल्ट रूप से DENY या SAMEORIGIN पर सेट करते हैं।","guideFaqUnknownServerQ":"मुझे नहीं पता मेरा कौन सा सर्वर है","guideFaqUnknownServerA":"अपनी प्रोजेक्ट फाइलें जांचें: nginx.conf → Nginx, .htaccess → Apache, app.js या server.js → Node.js/Express। शेयर्ड होस्टिंग के लिए, अपने प्रदाता से पूछें।","guideFaqNoAccessQ":"मेरे पास सर्वर एक्सेस नहीं है","guideFaqNoAccessA":"व्यूअर में \\"सीधे खोलें\\" बटन का उपयोग करें — यह पेज को iframe प्रतिबंधों के बिना पूर्ण ब्राउज़र विंडो में खोलता है।","viewerLoading":"पेज लोड हो रहा है…","viewerLoaded":"पेज लोड हो गया","viewerBlocked":"साइट ने एम्बेडिंग ब्लॉक कर दी","viewerError":"पेज लोड होने में विफल","viewerClosed":"व्यूअर बंद हो गया","help":"सहायता","infoTooltip":"जानकारी","noInternet":"इंटरनेट कनेक्शन नहीं है। अपना कनेक्शन जांचें और पुनः प्रयास करें।","loadTimeout":"पेज लोड होने में बहुत अधिक समय ले रहा है।","dialogUnsupported":"आपके Office का संस्करण व्यूअर विंडो को सपोर्ट नहीं करता। कृपया Office अपडेट करें।","settingsSaveRetryFailed":"सेटिंग्स सहेजी नहीं जा सकीं। कृपया बाद में पुनः प्रयास करें।","selectSlide":"कृपया पहले एक स्लाइड चुनें।","urlAutoFixed":"URL में https:// जोड़ा गया।","autoClose":"इसके बाद स्वतः बंद","autoCloseOff":"बंद","countdownText":"{n}s में बंद होगा","autoCloseHint":"वेब पेज विंडो PowerPoint से फोकस लेती है। जब तक यह खुली है, आपका क्लिकर/रिमोट काम नहीं करेगा। ऑटो-क्लोज़ सेट समय के बाद स्वतः फोकस वापस करता है। विंडो बंद होने के बाद क्लिकर नियंत्रण बहाल हो जाता है। लिंक किए गए कंटेंट को प्रस्तुत करने के लिए आवश्यक समय की योजना बनाएं और टाइमर सेट करें।","autoOpenHint":"सक्षम होने पर, प्रेज़ेंटेशन के दौरान इस स्लाइड पर जाने पर वेब पेज स्वतः खुलता है। \\"वेब पेज दिखाएं\\" मैन्युअली क्लिक करने की ज़रूरत नहीं — स्लाइड दिखने पर व्यूअर तुरंत प्रकट होता है।","guideImageTitle":"विकल्प 1: एक छवि का लिंक","guideImageDesc":"अगर आपकी साइट कंटेंट को छवि (.png, .jpg, .webp, .gif, .svg) के रूप में निर्यात कर सकती है, तो छवि फ़ाइल का सीधा URL पेस्ट करें। सर्वर में कोई बदलाव नहीं चाहिए — छवि iframe के बिना दिखती है, स्लाइड दिखाने पर स्वतः रीफ्रेश होती है, और फोकस PowerPoint पर लौटता है।","guideServerTitle":"विकल्प 2: iframe एम्बेडिंग की अनुमति दें"},"ru":{"insertWebPage":"Добавить WebPage.PPT","editPageProperty":"Свойства страницы","enterUrl":"Введите URL","urlPlaceholder":"https://example.com","zoom":"Масштаб","dialogSize":"Размер окна","autoOpen":"Открывать при смене слайда","showWebPage":"Показать WebPage.PPT","ownSiteBlocked":"Это ваш сайт?","showSetupGuide":"Показать инструкцию","openDirectly":"Открыть напрямую (без рамки)","apply":"Применить","cancel":"Отмена","language":"Язык","iframeBlocked":"Сайт блокирует встраивание.","iframeBlockedHint":"Если это ваш сайт — исправляется одной строкой.","noUrl":"Введите корректный URL","noUrlForSlide":"Для этого слайда URL не задан","success":"Настройки сохранены","errorGeneric":"Что-то пошло не так. Попробуйте ещё раз.","dialogAlreadyOpen":"Окно просмотра уже открыто.","dialogBlocked":"Окно заблокировано. Разрешите всплывающие окна для этого сайта.","openInBrowser":"Открыть в браузере","guideTitle":"Как разрешить встраивание","guideIntro":"Добавьте один из фрагментов в конфигурацию сервера, на котором размещена страница:","guideNote":"Перезапустите сервер и обновите слайд после изменений.","copy":"Копировать","copied":"Скопировано!","hideSetupGuide":"Скрыть инструкцию","slideLabel":"Слайд","dialogWidth":"Ширина","dialogHeight":"Высота","lockSize":"Связать пропорции","setAsDefaults":"Сохранить настройки по умолчанию для новых слайдов","defaultsSaved":"Настройки по умолчанию сохранены","siteNotLoading":"Сайт не загружается?","guideMetaNote":"Примечание: frame-ancestors в meta-теге может не сработать, если сервер уже задаёт заголовок X-Frame-Options.","guideFaqTitle":"Частые вопросы","guideFaqXFrameQ":"Что такое X-Frame-Options?","guideFaqXFrameA":"HTTP-заголовок, определяющий, можно ли показывать сайт внутри iframe. Некоторые серверы по умолчанию блокируют встраивание.","guideFaqUnknownServerQ":"Я не знаю, какой у меня сервер","guideFaqUnknownServerA":"Посмотрите файлы проекта: nginx.conf → Nginx, .htaccess → Apache, app.js или server.js → Node.js/Express. На хостинге — спросите провайдера.","guideFaqNoAccessQ":"У меня нет доступа к серверу","guideFaqNoAccessA":"Используйте кнопку «Открыть напрямую» — она откроет страницу в полноценном окне браузера без ограничений iframe.","viewerLoading":"Загрузка страницы…","viewerLoaded":"Страница загружена","viewerBlocked":"Сайт блокирует встраивание","viewerError":"Не удалось загрузить страницу","viewerClosed":"Окно закрыто","help":"Справка","infoTooltip":"Инфо","noInternet":"Нет подключения к интернету. Проверьте соединение и попробуйте снова.","loadTimeout":"Страница загружается слишком долго.","dialogUnsupported":"Ваша версия Office не поддерживает окно просмотра. Обновите Office.","settingsSaveRetryFailed":"Не удалось сохранить настройки. Попробуйте позже.","selectSlide":"Сначала выберите слайд.","urlAutoFixed":"Добавлен протокол https:// к URL.","autoClose":"Закрыть через","autoCloseOff":"Выкл","countdownText":"Закроется через {n}с","autoCloseHint":"Окно с веб-страницей перехватывает фокус PowerPoint. Пока оно открыто, кликер/пульт презентации не работает — вы не сможете закрыть слайд или переключиться на другой. Придётся использовать клавиатуру или мышь на компьютере с PowerPoint. Автозакрытие вернёт фокус автоматически через заданное время (всё это время будет транслироваться ссылка, кликер не будет работать). После закрытия окна управление вернётся на кликер. Спланируйте, сколько времени вам нужно на показ содержимого по ссылке, и выставьте это время.","autoOpenHint":"Если включено, веб-страница открывается автоматически при каждом переходе на этот слайд во время презентации. Не нужно нажимать «Показать веб-страницу» вручную — окно появится сразу при показе слайда. Удобно, когда презентация управляется кликером/пультом.","guideImageTitle":"Вариант 1: Ссылка на изображение","guideImageDesc":"Если ваш сайт может экспортировать контент как изображение (.png, .jpg, .webp, .gif, .svg), вставьте прямую ссылку на файл. Настройка сервера не нужна — изображение отобразится без iframe, обновится автоматически при каждом переходе на слайд, а фокус вернётся в PowerPoint, и кликер/пульт продолжит работать.","guideServerTitle":"Вариант 2: Разрешить встраивание в iframe"}}');

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
function setSliderUI(width, height, zoom, autoOpen, autoCloseSec) {
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
        setSliderUI(config?.dialogWidth ?? defaults.dialogWidth, config?.dialogHeight ?? defaults.dialogHeight, config?.zoom ?? defaults.zoom, config?.autoOpen ?? defaults.autoOpen, config?.autoCloseSec ?? defaults.autoCloseSec);
    }
    else {
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
                // Show debug result if it looks like a moveTo/resizeTo/restore response
                if (msg.url && (msg.url.startsWith('moveTo:') || msg.url.startsWith('resizeTo:') || msg.url.startsWith('restored'))) {
                    dbg(`DEBUG result: ${msg.url}`);
                    const resultEl = document.getElementById('dbg-result');
                    if (resultEl)
                        resultEl.textContent = msg.url;
                }
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
    }
    catch {
        // Non-JSON message — ignore
    }
}
function handleViewerClosed() {
    btnShow.disabled = false;
    // Remember which slide the dialog was closed on (prevent re-opening)
    if (lastSlideshowSlideId) {
        lastDialogClosedSlideId = lastSlideshowSlideId;
        dbg(`Dialog closed on slide ${lastDialogClosedSlideId} — will not re-open until slide changes`);
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
// ─── Debug panel (temporary — remove after fixing) ──────────────────────────
let debugPanel = null;
let debugLineCount = 0;
function dbg(msg) {
    (0, logger_1.logDebug)('[Taskpane]', msg);
    if (!debugPanel) {
        debugPanel = document.getElementById('debug-panel');
    }
    if (debugPanel) {
        debugLineCount++;
        const time = new Date().toLocaleTimeString('en', { hour12: false });
        debugPanel.textContent += `\n${debugLineCount}. [${time}] ${msg}`;
        debugPanel.scrollTop = debugPanel.scrollHeight;
    }
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
/** Try both methods to get the current slide ID. */
async function getSlideshowSlideId() {
    // Try JS API first (works reliably in edit mode)
    const jsResult = await getSlideIdViaJsApi();
    if (jsResult) {
        dbg(`slideId via JS API: ${jsResult}`);
        return jsResult;
    }
    // Fallback: Common API (may work in slideshow)
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
    if (slideshowDialogOpened && launcher.isOpen()) {
        // Dialog already open — send URL via messageChild (no close/reopen!)
        dbg(`Sending URL via messageChild: ${config.url.substring(0, 50)}...`);
        const sent = launcher.sendMessage(JSON.stringify({ action: 'navigate', url: config.url }));
        dbg(`messageChild result: ${sent}`);
        return;
    }
    // First time opening dialog in this slideshow session
    const hideMethod = getSelectedHideMethod();
    try {
        dbg(`Opening dialog (first time): ${config.url.substring(0, 50)}... hide=${hideMethod}`);
        await launcher.open({
            url: config.url,
            zoom: config.zoom,
            width: config.dialogWidth,
            height: config.dialogHeight,
            lang: i18n_1.i18n.getLocale(),
            autoCloseSec: config.autoCloseSec,
            slideshow: true, // Viewer will show standby instead of closing on timer
            hideMethod,
        });
        slideshowDialogOpened = true;
        dbg('Dialog opened OK (first time)');
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
// ─── Debug: hide dialog test controls ────────────────────────────────────────
/** Read the selected hide method from debug checkboxes. */
function getSelectedHideMethod() {
    const chkMove = document.getElementById('dbg-chk-move');
    const chkResize = document.getElementById('dbg-chk-resize');
    if (chkMove?.checked)
        return 'move';
    if (chkResize?.checked)
        return 'resize';
    return 'none';
}
function sendDebugCommand(action) {
    if (!launcher.isOpen()) {
        dbg(`DEBUG ${action}: dialog not open`);
        const resultEl = document.getElementById('dbg-result');
        if (resultEl)
            resultEl.textContent = 'Dialog not open — open a web page first';
        return;
    }
    const sent = launcher.sendMessage(JSON.stringify({ action }));
    dbg(`DEBUG ${action}: sent=${sent}`);
    const resultEl = document.getElementById('dbg-result');
    if (resultEl)
        resultEl.textContent = sent ? `Sent: ${action}...` : `Failed to send ${action}`;
}
function initDebugHideControls() {
    const chkMove = document.getElementById('dbg-chk-move');
    const chkResize = document.getElementById('dbg-chk-resize');
    const btnRestore = document.getElementById('dbg-btn-restore');
    chkMove?.addEventListener('change', () => {
        if (chkMove.checked) {
            sendDebugCommand('hide-move');
        }
        else {
            sendDebugCommand('restore');
        }
    });
    chkResize?.addEventListener('change', () => {
        if (chkResize.checked) {
            sendDebugCommand('hide-resize');
        }
        else {
            sendDebugCommand('restore');
        }
    });
    btnRestore?.addEventListener('click', () => {
        sendDebugCommand('restore');
        if (chkMove)
            chkMove.checked = false;
        if (chkResize)
            chkResize.checked = false;
    });
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
    // ── DEBUG: hide dialog test controls ──────────────────────────────────────
    initDebugHideControls();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUF3QixFQUN6QyxHQUFHLEVBQUUsR0FBRyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUNoQyxDQUFDO0lBQ0osQ0FBQztJQUFDLE1BQU0sQ0FBQyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7SUFFbkUsMkNBQTJDO0lBQzNDLFFBQVEsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUV4QyxxRUFBcUU7SUFDckUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBRXRDLG9DQUFvQztJQUNwQyx1RUFBdUU7SUFDdkUsNENBQTRDO0lBQzVDLG9CQUFvQixFQUFFLENBQUM7SUFFdkIsNkVBQTZFO0lBQzdFLHFCQUFxQixFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUVELGdGQUFnRjtBQUVoRiw2Q0FBZ0MsR0FBRSxDQUFDO0FBQ25DLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzs7Ozs7Ozs7OztBQ3hpQzdCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvY29uc3RhbnRzLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL2RpYWxvZy1sYXVuY2hlci50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9pMThuLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL2xvZ2dlci50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9zZXR0aW5ncy50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3Rhc2twYW5lL3Rhc2twYW5lLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvdGFza3BhbmUvdGFza3BhbmUuY3NzPzRjNzYiXSwic291cmNlc0NvbnRlbnQiOlsiLy8g4pSA4pSA4pSAIFNldHRpbmcga2V5cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBQcmVmaXggZm9yIHBlci1zbGlkZSBzZXR0aW5nIGtleXMuIEZ1bGwga2V5OiBgd2VicHB0X3NsaWRlX3tzbGlkZUlkfWAuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9TTElERV9QUkVGSVggPSAnd2VicHB0X3NsaWRlXyc7XHJcblxyXG4vKiogS2V5IGZvciB0aGUgc2F2ZWQgVUkgbGFuZ3VhZ2UuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9MQU5HVUFHRSA9ICd3ZWJwcHRfbGFuZ3VhZ2UnO1xyXG5cclxuLyoqIEtleSBmb3IgZ2xvYmFsIGRlZmF1bHQgc2xpZGUgY29uZmlnLiAqL1xyXG5leHBvcnQgY29uc3QgU0VUVElOR19LRVlfREVGQVVMVFMgPSAnd2VicHB0X2RlZmF1bHRzJztcclxuXHJcbi8vIOKUgOKUgOKUgCBWaWV3ZXIgZGVmYXVsdHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9aT09NID0gMTAwO1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9ESUFMT0dfV0lEVEggPSA4MDsgICAvLyAlIG9mIHNjcmVlblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9ESUFMT0dfSEVJR0hUID0gODA7ICAvLyAlIG9mIHNjcmVlblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRPX09QRU4gPSB0cnVlO1xyXG5cclxuLy8g4pSA4pSA4pSAIENvbnN0cmFpbnQgcmFuZ2VzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IFpPT01fTUlOID0gNTA7XHJcbmV4cG9ydCBjb25zdCBaT09NX01BWCA9IDMwMDtcclxuXHJcbi8vIOKUgOKUgOKUgCBBdXRvLWNsb3NlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19DTE9TRV9TRUMgPSAwOyAgIC8vIDAgPSBkaXNhYmxlZFxyXG5leHBvcnQgY29uc3QgQVVUT19DTE9TRV9NQVhfU0VDID0gMzYwMDtcclxuXHJcbi8qKlxyXG4gKiBOb24tbGluZWFyIGxvb2t1cCB0YWJsZSBmb3IgdGhlIGF1dG8tY2xvc2Ugc2xpZGVyLlxyXG4gKiBJbmRleCA9IHNsaWRlciBwb3NpdGlvbiwgdmFsdWUgPSBzZWNvbmRzLlxyXG4gKiBHcmFudWxhcml0eSBkZWNyZWFzZXMgYXMgdmFsdWVzIGdyb3c6IDFzIOKGkiA1cyDihpIgMTVzIOKGkiAzMHMg4oaSIDYwcyDihpIgMzAwcy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBBVVRPX0NMT1NFX1NURVBTOiByZWFkb25seSBudW1iZXJbXSA9IFtcclxuICAvLyAw4oCTMTBzLCBzdGVwIDEgICgxMSB2YWx1ZXMpXHJcbiAgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsXHJcbiAgLy8gMTDigJM2MHMsIHN0ZXAgNSAgKDEwIHZhbHVlcylcclxuICAxNSwgMjAsIDI1LCAzMCwgMzUsIDQwLCA0NSwgNTAsIDU1LCA2MCxcclxuICAvLyAx4oCTMyBtaW4sIHN0ZXAgMTVzICAoOCB2YWx1ZXMpXHJcbiAgNzUsIDkwLCAxMDUsIDEyMCwgMTM1LCAxNTAsIDE2NSwgMTgwLFxyXG4gIC8vIDPigJM1IG1pbiwgc3RlcCAzMHMgICg0IHZhbHVlcylcclxuICAyMTAsIDI0MCwgMjcwLCAzMDAsXHJcbiAgLy8gNeKAkzEwIG1pbiwgc3RlcCA2MHMgICg1IHZhbHVlcylcclxuICAzNjAsIDQyMCwgNDgwLCA1NDAsIDYwMCxcclxuICAvLyAxMOKAkzYwIG1pbiwgc3RlcCAzMDBzICAoMTAgdmFsdWVzKVxyXG4gIDkwMCwgMTIwMCwgMTUwMCwgMTgwMCwgMjEwMCwgMjQwMCwgMjcwMCwgMzAwMCwgMzMwMCwgMzYwMCxcclxuXTtcclxuXHJcbi8vIOKUgOKUgOKUgCBFcnJvciBoYW5kbGluZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HU19TQVZFX01BWF9SRVRSSUVTID0gMjtcclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NBVkVfUkVUUllfREVMQVlfTVMgPSAxMDAwO1xyXG5leHBvcnQgY29uc3QgSUZSQU1FX0xPQURfVElNRU9VVF9NUyA9IDEwXzAwMDtcclxuZXhwb3J0IGNvbnN0IFVSTF9ESVNQTEFZX01BWF9MRU5HVEggPSA2MDtcclxuXHJcbi8qKiBUcnVuY2F0ZSBhIFVSTCBmb3IgZGlzcGxheSwgYXBwZW5kaW5nIGVsbGlwc2lzIGlmIG5lZWRlZC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRydW5jYXRlVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBpZiAodXJsLmxlbmd0aCA8PSBVUkxfRElTUExBWV9NQVhfTEVOR1RIKSByZXR1cm4gdXJsO1xyXG4gIHJldHVybiB1cmwuc3Vic3RyaW5nKDAsIFVSTF9ESVNQTEFZX01BWF9MRU5HVEggLSAxKSArICdcXHUyMDI2JztcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlYnVnIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqXHJcbiAqIFNldCB0byBgZmFsc2VgIGluIHByb2R1Y3Rpb24gYnVpbGRzIHZpYSB3ZWJwYWNrIERlZmluZVBsdWdpbi5cclxuICogRmFsbHMgYmFjayB0byBgdHJ1ZWAgc28gZGV2L3Rlc3QgcnVucyBhbHdheXMgbG9nLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFQlVHOiBib29sZWFuID1cclxuICB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MuZW52ICE9PSAndW5kZWZpbmVkJ1xyXG4gICAgPyBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXHJcbiAgICA6IHRydWU7XHJcbiIsImltcG9ydCB7IGkxOG4sIHR5cGUgVHJhbnNsYXRpb25LZXkgfSBmcm9tICcuL2kxOG4nO1xyXG5pbXBvcnQgeyBsb2dEZWJ1ZywgbG9nRXJyb3IgfSBmcm9tICcuL2xvZ2dlcic7XHJcblxyXG4vLyDilIDilIDilIAgQ29uc3RhbnRzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIEZpbGVuYW1lIG9mIHRoZSB2aWV3ZXIgcGFnZSBidWlsdCBieSB3ZWJwYWNrLiAqL1xyXG5leHBvcnQgY29uc3QgVklFV0VSX1BBR0UgPSAndmlld2VyLmh0bWwnO1xyXG5cclxuLyoqIE9mZmljZSBkaXNwbGF5RGlhbG9nQXN5bmMgZXJyb3IgY29kZXMuICovXHJcbmNvbnN0IE9QRU5fRVJSID0ge1xyXG4gIC8qKiBBIGRpYWxvZyBpcyBhbHJlYWR5IG9wZW5lZCBmcm9tIHRoaXMgYWRkLWluLiAqL1xyXG4gIEFMUkVBRFlfT1BFTkVEOiAxMjAwNyxcclxuICAvKiogVXNlciBkaXNtaXNzZWQgdGhlIGRpYWxvZyBwcm9tcHQgLyBwb3B1cCBibG9ja2VyLiAqL1xyXG4gIFBPUFVQX0JMT0NLRUQ6IDEyMDA5LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8g4pSA4pSA4pSAIFR5cGVzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEaWFsb2dDb25maWcge1xyXG4gIHVybDogc3RyaW5nO1xyXG4gIHpvb206IG51bWJlcjtcclxuICB3aWR0aDogbnVtYmVyOyAgIC8vICUgb2Ygc2NyZWVuICgxMOKAkzEwMClcclxuICBoZWlnaHQ6IG51bWJlcjsgIC8vICUgb2Ygc2NyZWVuICgxMOKAkzEwMClcclxuICBsYW5nOiBzdHJpbmc7XHJcbiAgYXV0b0Nsb3NlU2VjPzogbnVtYmVyOyAgLy8gMCBvciB1bmRlZmluZWQgPSBkaXNhYmxlZFxyXG4gIHNsaWRlc2hvdz86IGJvb2xlYW47ICAgIC8vIHRydWUgPSBkaWFsb2cgaXMgaW4gc2xpZGVzaG93IG1vZGUgKGRvbid0IGFjdHVhbGx5IGNsb3NlIG9uIHRpbWVyKVxyXG4gIGhpZGVNZXRob2Q/OiAnbm9uZScgfCAnbW92ZScgfCAncmVzaXplJzsgIC8vIGhvdyB0byBoaWRlIGRpYWxvZyBhZnRlciB0aW1lciBpbiBzbGlkZXNob3dcclxufVxyXG5cclxuLyoqIFR5cGVkIGVycm9yIHRocm93biBieSB7QGxpbmsgRGlhbG9nTGF1bmNoZXJ9LiAqL1xyXG5leHBvcnQgY2xhc3MgRGlhbG9nRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgaTE4bktleTogVHJhbnNsYXRpb25LZXksXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgb2ZmaWNlQ29kZT86IG51bWJlcixcclxuICApIHtcclxuICAgIHN1cGVyKGkxOG4udChpMThuS2V5KSk7XHJcbiAgICB0aGlzLm5hbWUgPSAnRGlhbG9nRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERJIGludGVyZmFjZXMgKHRlc3RhYmxlIHdpdGhvdXQgT2ZmaWNlIHJ1bnRpbWUpIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIE1pbmltYWwgc3Vic2V0IG9mIE9mZmljZS5EaWFsb2cgdXNlZCBieSB0aGlzIG1vZHVsZS4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBPZmZpY2VEaWFsb2cge1xyXG4gIGNsb3NlKCk6IHZvaWQ7XHJcbiAgYWRkRXZlbnRIYW5kbGVyKFxyXG4gICAgZXZlbnRUeXBlOiBzdHJpbmcsXHJcbiAgICBoYW5kbGVyOiAoYXJnOiB7IG1lc3NhZ2U/OiBzdHJpbmc7IGVycm9yPzogbnVtYmVyIH0pID0+IHZvaWQsXHJcbiAgKTogdm9pZDtcclxuICAvKiogU2VuZCBhIG1lc3NhZ2UgZnJvbSBob3N0IHRvIGRpYWxvZyAoRGlhbG9nQXBpIDEuMispLiBNYXkgbm90IGV4aXN0IG9uIG9sZGVyIE9mZmljZS4gKi9cclxuICBtZXNzYWdlQ2hpbGQ/KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBEaWFsb2dPcGVuUmVzdWx0IHtcclxuICBzdGF0dXM6IHN0cmluZztcclxuICB2YWx1ZTogT2ZmaWNlRGlhbG9nO1xyXG4gIGVycm9yOiB7IGNvZGU6IG51bWJlcjsgbWVzc2FnZTogc3RyaW5nIH07XHJcbn1cclxuXHJcbi8qKiBNaW5pbWFsIHN1YnNldCBvZiBPZmZpY2UuY29udGV4dC51aSBuZWVkZWQgZm9yIGRpYWxvZyBvcGVyYXRpb25zLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIERpYWxvZ0FwaSB7XHJcbiAgZGlzcGxheURpYWxvZ0FzeW5jKFxyXG4gICAgc3RhcnRBZGRyZXNzOiBzdHJpbmcsXHJcbiAgICBvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGNhbGxiYWNrOiAocmVzdWx0OiBEaWFsb2dPcGVuUmVzdWx0KSA9PiB2b2lkLFxyXG4gICk6IHZvaWQ7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBEZXBlbmRlbmN5IGluamVjdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmxldCBfaW5qZWN0ZWRBcGk6IERpYWxvZ0FwaSB8IG51bGwgPSBudWxsO1xyXG5sZXQgX2luamVjdGVkQmFzZVVybDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcblxyXG4vKipcclxuICogT3ZlcnJpZGUgdGhlIE9mZmljZSBkaWFsb2cgQVBJLiBQYXNzIGBudWxsYCB0byByZXN0b3JlIHRoZSByZWFsIG9uZS5cclxuICogQGludGVybmFsIFVzZWQgaW4gdW5pdCB0ZXN0cyBvbmx5LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9pbmplY3REaWFsb2dBcGkoYXBpOiBEaWFsb2dBcGkgfCBudWxsKTogdm9pZCB7XHJcbiAgX2luamVjdGVkQXBpID0gYXBpO1xyXG59XHJcblxyXG4vKipcclxuICogT3ZlcnJpZGUgdGhlIHZpZXdlciBiYXNlIFVSTC4gUGFzcyBgbnVsbGAgdG8gcmVzdG9yZSBhdXRvLWRldGVjdGlvbi5cclxuICogQGludGVybmFsIFVzZWQgaW4gdW5pdCB0ZXN0cyBvbmx5LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9pbmplY3RCYXNlVXJsKHVybDogc3RyaW5nIHwgbnVsbCk6IHZvaWQge1xyXG4gIF9pbmplY3RlZEJhc2VVcmwgPSB1cmw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFwaSgpOiBEaWFsb2dBcGkge1xyXG4gIGlmIChfaW5qZWN0ZWRBcGkpIHJldHVybiBfaW5qZWN0ZWRBcGk7XHJcbiAgcmV0dXJuIE9mZmljZS5jb250ZXh0LnVpIGFzIHVua25vd24gYXMgRGlhbG9nQXBpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRWaWV3ZXJCYXNlVXJsKCk6IHN0cmluZyB7XHJcbiAgaWYgKF9pbmplY3RlZEJhc2VVcmwpIHJldHVybiBfaW5qZWN0ZWRCYXNlVXJsO1xyXG4gIGNvbnN0IGRpciA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXi9dKiQvLCAnJyk7XHJcbiAgcmV0dXJuIGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59JHtkaXJ9LyR7VklFV0VSX1BBR0V9YDtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERpYWxvZ0xhdW5jaGVyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNsYXNzIERpYWxvZ0xhdW5jaGVyIHtcclxuICBwcml2YXRlIGRpYWxvZzogT2ZmaWNlRGlhbG9nIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBtZXNzYWdlQ2FsbGJhY2s6ICgobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgY2xvc2VkQ2FsbGJhY2s6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvKiogQnVpbGQgdGhlIGZ1bGwgdmlld2VyIFVSTCB3aXRoIHF1ZXJ5IHBhcmFtZXRlcnMuICovXHJcbiAgcHJpdmF0ZSBidWlsZFZpZXdlclVybChjb25maWc6IERpYWxvZ0NvbmZpZyk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcclxuICAgICAgdXJsOiBjb25maWcudXJsLFxyXG4gICAgICB6b29tOiBTdHJpbmcoY29uZmlnLnpvb20pLFxyXG4gICAgICBsYW5nOiBjb25maWcubGFuZyxcclxuICAgIH0pO1xyXG4gICAgaWYgKGNvbmZpZy5hdXRvQ2xvc2VTZWMgJiYgY29uZmlnLmF1dG9DbG9zZVNlYyA+IDApIHtcclxuICAgICAgcGFyYW1zLnNldCgnYXV0b2Nsb3NlJywgU3RyaW5nKGNvbmZpZy5hdXRvQ2xvc2VTZWMpKTtcclxuICAgIH1cclxuICAgIGlmIChjb25maWcuc2xpZGVzaG93KSB7XHJcbiAgICAgIHBhcmFtcy5zZXQoJ3NsaWRlc2hvdycsICcxJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoY29uZmlnLmhpZGVNZXRob2QgJiYgY29uZmlnLmhpZGVNZXRob2QgIT09ICdub25lJykge1xyXG4gICAgICBwYXJhbXMuc2V0KCdoaWRlJywgY29uZmlnLmhpZGVNZXRob2QpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGAke2dldFZpZXdlckJhc2VVcmwoKX0/JHtwYXJhbXMudG9TdHJpbmcoKX1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3BlbiB0aGUgdmlld2VyIGRpYWxvZyB3aXRoIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uLlxyXG4gICAqIElmIGEgZGlhbG9nIGlzIGFscmVhZHkgb3BlbiwgY2xvc2VzIGl0IGZpcnN0IGFuZCByZW9wZW5zLlxyXG4gICAqIFJlamVjdHMgd2l0aCB7QGxpbmsgRGlhbG9nRXJyb3J9IGlmIHRoZSBkaWFsb2cgY2Fubm90IGJlIG9wZW5lZC5cclxuICAgKi9cclxuICBhc3luYyBvcGVuKGNvbmZpZzogRGlhbG9nQ29uZmlnKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAvLyBBdXRvLWNsb3NlIGFueSBleGlzdGluZyBkaWFsb2cgYmVmb3JlIG9wZW5pbmcgYSBuZXcgb25lXHJcbiAgICBpZiAodGhpcy5kaWFsb2cpIHtcclxuICAgICAgbG9nRGVidWcoJ0Nsb3NpbmcgZXhpc3RpbmcgZGlhbG9nIGJlZm9yZSBvcGVuaW5nIGEgbmV3IG9uZScpO1xyXG4gICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR3VhcmQ6IGNoZWNrIHRoYXQgZGlzcGxheURpYWxvZ0FzeW5jIGlzIGF2YWlsYWJsZVxyXG4gICAgY29uc3QgYXBpID0gZ2V0QXBpKCk7XHJcbiAgICBpZiAoIWFwaSB8fCB0eXBlb2YgYXBpLmRpc3BsYXlEaWFsb2dBc3luYyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRGlhbG9nRXJyb3IoJ2RpYWxvZ1Vuc3VwcG9ydGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgdmlld2VyVXJsID0gdGhpcy5idWlsZFZpZXdlclVybChjb25maWcpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnRyeU9wZW4oYXBpLCB2aWV3ZXJVcmwsIGNvbmZpZywgZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXR0ZW1wdCB0byBvcGVuIHRoZSBkaWFsb2cuIElmIE9mZmljZSByZXR1cm5zIDEyMDA3IChhbHJlYWR5IG9wZW5lZClcclxuICAgKiBvbiB0aGUgZmlyc3QgdHJ5LCB3YWl0IGJyaWVmbHkgYW5kIHJldHJ5IG9uY2Ug4oCUIHRoZSBwcmV2aW91cyBjbG9zZSgpXHJcbiAgICogbWF5IG5vdCBoYXZlIGZ1bGx5IHByb3BhZ2F0ZWQgeWV0LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5T3BlbihcclxuICAgIGFwaTogRGlhbG9nQXBpLFxyXG4gICAgdmlld2VyVXJsOiBzdHJpbmcsXHJcbiAgICBjb25maWc6IERpYWxvZ0NvbmZpZyxcclxuICAgIGlzUmV0cnk6IGJvb2xlYW4sXHJcbiAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBhcGkuZGlzcGxheURpYWxvZ0FzeW5jKFxyXG4gICAgICAgIHZpZXdlclVybCxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB3aWR0aDogY29uZmlnLndpZHRoLFxyXG4gICAgICAgICAgaGVpZ2h0OiBjb25maWcuaGVpZ2h0LFxyXG4gICAgICAgICAgZGlzcGxheUluSWZyYW1lOiBmYWxzZSxcclxuICAgICAgICAgIHByb21wdEJlZm9yZU9wZW46IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XHJcbiAgICAgICAgICAgIC8vIE9uIGZpcnN0IGF0dGVtcHQsIGlmIE9mZmljZSBzYXlzIFwiYWxyZWFkeSBvcGVuZWRcIiwgcmV0cnkgb25jZVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0LmVycm9yLmNvZGUgPT09IE9QRU5fRVJSLkFMUkVBRFlfT1BFTkVEICYmICFpc1JldHJ5KSB7XHJcbiAgICAgICAgICAgICAgbG9nRGVidWcoJ0dvdCAxMjAwNyAoYWxyZWFkeSBvcGVuZWQpIOKAlCByZXRyeWluZyBhZnRlciBkZWxheScpO1xyXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cnlPcGVuKGFwaSwgdmlld2VyVXJsLCBjb25maWcsIHRydWUpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgICB9LCAzMDApO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsb2dFcnJvcignZGlzcGxheURpYWxvZ0FzeW5jIGZhaWxlZDonLCByZXN1bHQuZXJyb3IuY29kZSwgcmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICByZWplY3QodGhpcy5tYXBPcGVuRXJyb3IocmVzdWx0LmVycm9yLmNvZGUpKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuZGlhbG9nID0gcmVzdWx0LnZhbHVlO1xyXG5cclxuICAgICAgICAgIHRoaXMuZGlhbG9nLmFkZEV2ZW50SGFuZGxlcihcclxuICAgICAgICAgICAgJ2RpYWxvZ01lc3NhZ2VSZWNlaXZlZCcsXHJcbiAgICAgICAgICAgIChhcmcpID0+IHRoaXMuaGFuZGxlTWVzc2FnZShhcmcpLFxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICB0aGlzLmRpYWxvZy5hZGRFdmVudEhhbmRsZXIoXHJcbiAgICAgICAgICAgICdkaWFsb2dFdmVudFJlY2VpdmVkJyxcclxuICAgICAgICAgICAgKGFyZykgPT4gdGhpcy5oYW5kbGVFdmVudChhcmcpLFxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICBsb2dEZWJ1ZygnRGlhbG9nIG9wZW5lZCBzdWNjZXNzZnVsbHknKTtcclxuICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICApO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiogQ2xvc2UgdGhlIGRpYWxvZyBpZiBpdCBpcyBvcGVuLiBTYWZlIHRvIGNhbGwgd2hlbiBhbHJlYWR5IGNsb3NlZC4gKi9cclxuICBjbG9zZSgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5kaWFsb2cpIHJldHVybjtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuZGlhbG9nLmNsb3NlKCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbG9nRXJyb3IoJ0Vycm9yIGNsb3NpbmcgZGlhbG9nOicsIGVycik7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRpYWxvZyA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZW5kIGEgbWVzc2FnZSBmcm9tIHRoZSBob3N0ICh0YXNrcGFuZS9jb21tYW5kcykgdG8gdGhlIGRpYWxvZy5cclxuICAgKiBVc2VzIERpYWxvZ0FwaSAxLjIgYG1lc3NhZ2VDaGlsZCgpYC4gUmV0dXJucyBmYWxzZSBpZiBub3Qgc3VwcG9ydGVkLlxyXG4gICAqL1xyXG4gIHNlbmRNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLmRpYWxvZykgcmV0dXJuIGZhbHNlO1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmRpYWxvZy5tZXNzYWdlQ2hpbGQgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgbG9nRGVidWcoJ21lc3NhZ2VDaGlsZCBub3QgYXZhaWxhYmxlIG9uIHRoaXMgT2ZmaWNlIHZlcnNpb24nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5kaWFsb2cubWVzc2FnZUNoaWxkKG1lc3NhZ2UpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBsb2dFcnJvcignbWVzc2FnZUNoaWxkIGZhaWxlZDonLCBlcnIpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogV2hldGhlciB0aGUgZGlhbG9nIGlzIGN1cnJlbnRseSBvcGVuLiAqL1xyXG4gIGlzT3BlbigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmRpYWxvZyAhPT0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKiBTdWJzY3JpYmUgdG8gbWVzc2FnZXMgc2VudCBmcm9tIHRoZSB2aWV3ZXIgdmlhIGBPZmZpY2UuY29udGV4dC51aS5tZXNzYWdlUGFyZW50YC4gKi9cclxuICBvbk1lc3NhZ2UoY2FsbGJhY2s6IChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMubWVzc2FnZUNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgfVxyXG5cclxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBkaWFsb2cgYmVpbmcgY2xvc2VkIChieSB1c2VyIG9yIG5hdmlnYXRpb24gZXJyb3IpLiAqL1xyXG4gIG9uQ2xvc2VkKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsb3NlZENhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgfVxyXG5cclxuICAvLyDilIDilIDilIAgUHJpdmF0ZSBoYW5kbGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVNZXNzYWdlKGFyZzogeyBtZXNzYWdlPzogc3RyaW5nIH0pOiB2b2lkIHtcclxuICAgIGlmIChhcmcubWVzc2FnZSAmJiB0aGlzLm1lc3NhZ2VDYWxsYmFjaykge1xyXG4gICAgICB0aGlzLm1lc3NhZ2VDYWxsYmFjayhhcmcubWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUV2ZW50KGFyZzogeyBlcnJvcj86IG51bWJlciB9KTogdm9pZCB7XHJcbiAgICAvLyBBbGwgRGlhbG9nRXZlbnRSZWNlaXZlZCBjb2RlcyAoMTIwMDIgY2xvc2VkLCAxMjAwMyBtaXhlZCBjb250ZW50LFxyXG4gICAgLy8gMTIwMDYgY3Jvc3MtZG9tYWluKSBtZWFuIHRoZSBkaWFsb2cgaXMgbm8gbG9uZ2VyIHVzYWJsZS5cclxuICAgIGxvZ0RlYnVnKCdEaWFsb2cgZXZlbnQgcmVjZWl2ZWQsIGNvZGU6JywgYXJnLmVycm9yKTtcclxuICAgIHRoaXMuZGlhbG9nID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmNsb3NlZENhbGxiYWNrKSB7XHJcbiAgICAgIHRoaXMuY2xvc2VkQ2FsbGJhY2soKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgbWFwT3BlbkVycm9yKGNvZGU6IG51bWJlcik6IERpYWxvZ0Vycm9yIHtcclxuICAgIHN3aXRjaCAoY29kZSkge1xyXG4gICAgICBjYXNlIE9QRU5fRVJSLkFMUkVBRFlfT1BFTkVEOlxyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nRXJyb3IoJ2RpYWxvZ0FscmVhZHlPcGVuJywgY29kZSk7XHJcbiAgICAgIGNhc2UgT1BFTl9FUlIuUE9QVVBfQkxPQ0tFRDpcclxuICAgICAgICByZXR1cm4gbmV3IERpYWxvZ0Vycm9yKCdkaWFsb2dCbG9ja2VkJywgY29kZSk7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2dFcnJvcignZXJyb3JHZW5lcmljJywgY29kZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBsb2NhbGVzRGF0YSBmcm9tICcuLi9pMThuL2xvY2FsZXMuanNvbic7XHJcblxyXG5leHBvcnQgdHlwZSBMb2NhbGUgPSAnZW4nIHwgJ3poJyB8ICdlcycgfCAnZGUnIHwgJ2ZyJyB8ICdpdCcgfCAnYXInIHwgJ3B0JyB8ICdoaScgfCAncnUnO1xyXG5leHBvcnQgdHlwZSBUcmFuc2xhdGlvbktleSA9IGtleW9mIHR5cGVvZiBsb2NhbGVzRGF0YVsnZW4nXTtcclxuXHJcbi8qKiBNYXBzIGEgQkNQIDQ3IGxhbmd1YWdlIHRhZyB0byBhIHN1cHBvcnRlZCBMb2NhbGUuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsZShsYW5nVGFnOiBzdHJpbmcpOiBMb2NhbGUge1xyXG4gIGNvbnN0IHRhZyA9IGxhbmdUYWcudG9Mb3dlckNhc2UoKTtcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3poJykpIHJldHVybiAnemgnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnZXMnKSkgcmV0dXJuICdlcyc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdkZScpKSByZXR1cm4gJ2RlJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2ZyJykpIHJldHVybiAnZnInO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnaXQnKSkgcmV0dXJuICdpdCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdhcicpKSByZXR1cm4gJ2FyJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3B0JykpIHJldHVybiAncHQnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnaGknKSkgcmV0dXJuICdoaSc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdydScpKSByZXR1cm4gJ3J1JztcclxuICByZXR1cm4gJ2VuJztcclxufVxyXG5cclxuY2xhc3MgSTE4biB7XHJcbiAgcHJpdmF0ZSBsb2NhbGU6IExvY2FsZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGxpc3RlbmVycyA9IG5ldyBTZXQ8KCkgPT4gdm9pZD4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmxvY2FsZSA9IHRoaXMuZGV0ZWN0TG9jYWxlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRldGVjdExvY2FsZSgpOiBMb2NhbGUge1xyXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gJ2VuJztcclxuICAgIHJldHVybiBwYXJzZUxvY2FsZShuYXZpZ2F0b3IubGFuZ3VhZ2UgPz8gJ2VuJyk7XHJcbiAgfVxyXG5cclxuICAvKiogVHJhbnNsYXRlIGEga2V5IGluIHRoZSBjdXJyZW50IGxvY2FsZS4gRmFsbHMgYmFjayB0byBFbmdsaXNoLCB0aGVuIHRoZSBrZXkgaXRzZWxmLiAqL1xyXG4gIHQoa2V5OiBUcmFuc2xhdGlvbktleSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBsb2NhbGVzRGF0YVt0aGlzLmxvY2FsZV1ba2V5XSA/P1xyXG4gICAgICBsb2NhbGVzRGF0YVsnZW4nXVtrZXldID8/XHJcbiAgICAgIGtleVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGdldExvY2FsZSgpOiBMb2NhbGUge1xyXG4gICAgcmV0dXJuIHRoaXMubG9jYWxlO1xyXG4gIH1cclxuXHJcbiAgZ2V0QXZhaWxhYmxlTG9jYWxlcygpOiBMb2NhbGVbXSB7XHJcbiAgICByZXR1cm4gWydlbicsICd6aCcsICdlcycsICdkZScsICdmcicsICdpdCcsICdhcicsICdwdCcsICdoaScsICdydSddO1xyXG4gIH1cclxuXHJcbiAgLyoqIFN3aXRjaCBsb2NhbGUgYW5kIG5vdGlmeSBhbGwgbGlzdGVuZXJzLiAqL1xyXG4gIHNldExvY2FsZShsb2NhbGU6IExvY2FsZSk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMubG9jYWxlID09PSBsb2NhbGUpIHJldHVybjtcclxuICAgIHRoaXMubG9jYWxlID0gbG9jYWxlO1xyXG4gICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3Vic2NyaWJlIHRvIGxvY2FsZSBjaGFuZ2VzLlxyXG4gICAqIEByZXR1cm5zIFVuc3Vic2NyaWJlIGZ1bmN0aW9uLlxyXG4gICAqL1xyXG4gIG9uTG9jYWxlQ2hhbmdlKGxpc3RlbmVyOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XHJcbiAgICB0aGlzLmxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xyXG4gICAgcmV0dXJuICgpID0+IHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogU2luZ2xldG9uIGkxOG4gaW5zdGFuY2Ugc2hhcmVkIGFjcm9zcyB0aGUgYWRkLWluLiAqL1xyXG5leHBvcnQgY29uc3QgaTE4biA9IG5ldyBJMThuKCk7XHJcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuY29uc3QgUFJFRklYID0gJ1tXZWJQUFRdJztcclxuXHJcbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cclxuXHJcbi8qKiBMb2cgZGVidWcgaW5mbyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dEZWJ1ZyguLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcclxuICBpZiAoREVCVUcpIGNvbnNvbGUubG9nKFBSRUZJWCwgLi4uYXJncyk7XHJcbn1cclxuXHJcbi8qKiBMb2cgd2FybmluZ3Mg4oCUIG5vLW9wIGluIHByb2R1Y3Rpb24gYnVpbGRzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9nV2FybiguLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcclxuICBpZiAoREVCVUcpIGNvbnNvbGUud2FybihQUkVGSVgsIC4uLmFyZ3MpO1xyXG59XHJcblxyXG4vKiogTG9nIGVycm9ycyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dFcnJvciguLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcclxuICBpZiAoREVCVUcpIGNvbnNvbGUuZXJyb3IoUFJFRklYLCAuLi5hcmdzKTtcclxufVxyXG5cclxuLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXHJcblxyXG4vKipcclxuICogSW5zdGFsbCBhIGdsb2JhbCBoYW5kbGVyIGZvciB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb25zLlxyXG4gKiBDYWxsIG9uY2UgcGVyIGVudHJ5IHBvaW50ICh0YXNrcGFuZSwgdmlld2VyLCBjb21tYW5kcykuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIoKTogdm9pZCB7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChldmVudDogUHJvbWlzZVJlamVjdGlvbkV2ZW50KSA9PiB7XHJcbiAgICBsb2dFcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uOicsIGV2ZW50LnJlYXNvbik7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG59XHJcbiIsImltcG9ydCB0eXBlIHsgTG9jYWxlIH0gZnJvbSAnLi9pMThuJztcclxuaW1wb3J0IHtcclxuICBTRVRUSU5HX0tFWV9TTElERV9QUkVGSVgsXHJcbiAgU0VUVElOR19LRVlfTEFOR1VBR0UsXHJcbiAgU0VUVElOR19LRVlfREVGQVVMVFMsXHJcbiAgREVGQVVMVF9aT09NLFxyXG4gIERFRkFVTFRfRElBTE9HX1dJRFRILFxyXG4gIERFRkFVTFRfRElBTE9HX0hFSUdIVCxcclxuICBERUZBVUxUX0FVVE9fT1BFTixcclxuICBERUZBVUxUX0FVVE9fQ0xPU0VfU0VDLFxyXG4gIFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMsXHJcbiAgU0VUVElOR1NfU0FWRV9SRVRSWV9ERUxBWV9NUyxcclxufSBmcm9tICcuL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7IGxvZ0RlYnVnLCBsb2dFcnJvciB9IGZyb20gJy4vbG9nZ2VyJztcclxuXHJcbi8vIOKUgOKUgOKUgCBUeXBlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgV2ViUFBUU2xpZGVDb25maWcge1xyXG4gIHVybDogc3RyaW5nO1xyXG4gIHpvb206IG51bWJlcjsgICAgICAgICAgLy8gNTDigJMzMDBcclxuICBkaWFsb2dXaWR0aDogbnVtYmVyOyAgIC8vIDMw4oCTMTAwICglIG9mIHNjcmVlbilcclxuICBkaWFsb2dIZWlnaHQ6IG51bWJlcjsgIC8vIDMw4oCTMTAwICglIG9mIHNjcmVlbilcclxuICBhdXRvT3BlbjogYm9vbGVhbjtcclxuICBhdXRvQ2xvc2VTZWM6IG51bWJlcjsgIC8vIDAgPSBkaXNhYmxlZCwgMeKAkzYwIHNlY29uZHNcclxufVxyXG5cclxuaW50ZXJmYWNlIFNhdmVSZXN1bHQge1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG4gIGVycm9yOiB7IG1lc3NhZ2U6IHN0cmluZyB9IHwgbnVsbDtcclxufVxyXG5cclxuLyoqIE1pbmltYWwgc3Vic2V0IG9mIE9mZmljZS5TZXR0aW5ncyB1c2VkIGJ5IHRoaXMgbW9kdWxlLiAqL1xyXG5pbnRlcmZhY2UgU2V0dGluZ3NTdG9yZSB7XHJcbiAgZ2V0KG5hbWU6IHN0cmluZyk6IHVua25vd247XHJcbiAgc2V0KG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkO1xyXG4gIHJlbW92ZShuYW1lOiBzdHJpbmcpOiB2b2lkO1xyXG4gIHNhdmVBc3luYyhjYWxsYmFjazogKHJlc3VsdDogU2F2ZVJlc3VsdCkgPT4gdm9pZCk6IHZvaWQ7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBEZXBlbmRlbmN5IGluamVjdGlvbiAoZm9yIHRlc3RpbmcpIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxubGV0IF9pbmplY3RlZFN0b3JlOiBTZXR0aW5nc1N0b3JlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4vKipcclxuICogT3ZlcnJpZGUgdGhlIE9mZmljZSBzZXR0aW5ncyBzdG9yZS4gUGFzcyBgbnVsbGAgdG8gcmVzdG9yZSB0aGUgcmVhbCBvbmUuXHJcbiAqIEBpbnRlcm5hbCBVc2VkIGluIHVuaXQgdGVzdHMgb25seS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfaW5qZWN0U2V0dGluZ3NTdG9yZShzdG9yZTogU2V0dGluZ3NTdG9yZSB8IG51bGwpOiB2b2lkIHtcclxuICBfaW5qZWN0ZWRTdG9yZSA9IHN0b3JlO1xyXG59XHJcblxyXG4vKiogSW4tbWVtb3J5IGZhbGxiYWNrIHdoZW4gcnVubmluZyBvdXRzaWRlIFBvd2VyUG9pbnQgKGUuZy4gYnJvd3NlciB0ZXN0aW5nKS4gKi9cclxuY29uc3QgX21lbW9yeVN0b3JlOiBTZXR0aW5nc1N0b3JlID0gKCgpID0+IHtcclxuICBjb25zdCBkYXRhID0gbmV3IE1hcDxzdHJpbmcsIHVua25vd24+KCk7XHJcbiAgcmV0dXJuIHtcclxuICAgIGdldDogKG5hbWU6IHN0cmluZykgPT4gZGF0YS5nZXQobmFtZSkgPz8gbnVsbCxcclxuICAgIHNldDogKG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pID0+IHsgZGF0YS5zZXQobmFtZSwgdmFsdWUpOyB9LFxyXG4gICAgcmVtb3ZlOiAobmFtZTogc3RyaW5nKSA9PiB7IGRhdGEuZGVsZXRlKG5hbWUpOyB9LFxyXG4gICAgc2F2ZUFzeW5jOiAoY2I6IChyOiBTYXZlUmVzdWx0KSA9PiB2b2lkKSA9PiB7IGNiKHsgc3RhdHVzOiAnc3VjY2VlZGVkJywgZXJyb3I6IG51bGwgfSk7IH0sXHJcbiAgfTtcclxufSkoKTtcclxuXHJcbmZ1bmN0aW9uIGdldFN0b3JlKCk6IFNldHRpbmdzU3RvcmUge1xyXG4gIGlmIChfaW5qZWN0ZWRTdG9yZSkgcmV0dXJuIF9pbmplY3RlZFN0b3JlO1xyXG4gIC8qIGdsb2JhbCBPZmZpY2UgKi9cclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBPZmZpY2UuY29udGV4dD8uZG9jdW1lbnQ/LnNldHRpbmdzO1xyXG4gICAgaWYgKHNldHRpbmdzKSByZXR1cm4gc2V0dGluZ3MgYXMgdW5rbm93biBhcyBTZXR0aW5nc1N0b3JlO1xyXG4gIH0gY2F0Y2ggeyAvKiBvdXRzaWRlIE9mZmljZSBob3N0ICovIH1cclxuICByZXR1cm4gX21lbW9yeVN0b3JlO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgSW50ZXJuYWwgaGVscGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIHNsaWRlS2V5KHNsaWRlSWQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGAke1NFVFRJTkdfS0VZX1NMSURFX1BSRUZJWH0ke3NsaWRlSWR9YDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZU9uY2Uoc3RvcmU6IFNldHRpbmdzU3RvcmUpOiBQcm9taXNlPHZvaWQ+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgc3RvcmUuc2F2ZUFzeW5jKChyZXN1bHQpID0+IHtcclxuICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXN1bHQuZXJyb3I/Lm1lc3NhZ2UgPz8gJ1NldHRpbmdzIHNhdmUgZmFpbGVkJykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlbGF5KG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgc2V0dGluZ3Mgd2l0aCBhdXRvbWF0aWMgcmV0cnkuXHJcbiAqIFJldHJpZXMgdXAgdG8ge0BsaW5rIFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVN9IHRpbWVzIHdpdGggYSBkZWxheSBiZXR3ZWVuIGF0dGVtcHRzLlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZShzdG9yZTogU2V0dGluZ3NTdG9yZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGZvciAobGV0IGF0dGVtcHQgPSAwOyBhdHRlbXB0IDw9IFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVM7IGF0dGVtcHQrKykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgc2F2ZU9uY2Uoc3RvcmUpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgaWYgKGF0dGVtcHQgPCBTRVRUSU5HU19TQVZFX01BWF9SRVRSSUVTKSB7XHJcbiAgICAgICAgbG9nRGVidWcoYFNldHRpbmdzIHNhdmUgYXR0ZW1wdCAke2F0dGVtcHQgKyAxfSBmYWlsZWQsIHJldHJ5aW5nLi4uYCk7XHJcbiAgICAgICAgYXdhaXQgZGVsYXkoU0VUVElOR1NfU0FWRV9SRVRSWV9ERUxBWV9NUyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbG9nRXJyb3IoJ1NldHRpbmdzIHNhdmUgZmFpbGVkIGFmdGVyIGFsbCByZXRyaWVzOicsIGVycik7XHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGUgY29uZmlnIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFJldHVybnMgdGhlIHNhdmVkIGNvbmZpZyBmb3IgYSBzbGlkZSwgb3IgYG51bGxgIGlmIG5vdCBzZXQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTbGlkZUNvbmZpZyhzbGlkZUlkOiBzdHJpbmcpOiBXZWJQUFRTbGlkZUNvbmZpZyB8IG51bGwge1xyXG4gIGNvbnN0IHJhdyA9IGdldFN0b3JlKCkuZ2V0KHNsaWRlS2V5KHNsaWRlSWQpKTtcclxuICByZXR1cm4gcmF3ID8gKHJhdyBhcyBXZWJQUFRTbGlkZUNvbmZpZykgOiBudWxsO1xyXG59XHJcblxyXG4vKiogU2F2ZXMgY29uZmlnIGZvciBhIHNsaWRlIGFuZCBwZXJzaXN0cyB0byBkb2N1bWVudC4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFNsaWRlQ29uZmlnKHNsaWRlSWQ6IHN0cmluZywgY29uZmlnOiBXZWJQUFRTbGlkZUNvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKTtcclxuICBzdG9yZS5zZXQoc2xpZGVLZXkoc2xpZGVJZCksIGNvbmZpZyk7XHJcbiAgYXdhaXQgc2F2ZShzdG9yZSk7XHJcbn1cclxuXHJcbi8qKiBSZW1vdmVzIHRoZSBzYXZlZCBjb25maWcgZm9yIGEgc2xpZGUuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVTbGlkZUNvbmZpZyhzbGlkZUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBzdG9yZSA9IGdldFN0b3JlKCk7XHJcbiAgc3RvcmUucmVtb3ZlKHNsaWRlS2V5KHNsaWRlSWQpKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIExhbmd1YWdlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFJldHVybnMgdGhlIHNhdmVkIFVJIGxhbmd1YWdlLCBvciBgbnVsbGAgaWYgbm90IHNldC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldExhbmd1YWdlKCk6IExvY2FsZSB8IG51bGwge1xyXG4gIHJldHVybiAoZ2V0U3RvcmUoKS5nZXQoU0VUVElOR19LRVlfTEFOR1VBR0UpIGFzIExvY2FsZSkgPz8gbnVsbDtcclxufVxyXG5cclxuLyoqIFNhdmVzIHRoZSBVSSBsYW5ndWFnZSBhbmQgcGVyc2lzdHMgdG8gZG9jdW1lbnQuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRMYW5ndWFnZShsb2NhbGU6IExvY2FsZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKTtcclxuICBzdG9yZS5zZXQoU0VUVElOR19LRVlfTEFOR1VBR0UsIGxvY2FsZSk7XHJcbiAgYXdhaXQgc2F2ZShzdG9yZSk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBEZWZhdWx0cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBSZXR1cm5zIHNhdmVkIGdsb2JhbCBkZWZhdWx0cywgb3IgYnVpbHQtaW4gZGVmYXVsdHMgaWYgbm90IHNldC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRzKCk6IFdlYlBQVFNsaWRlQ29uZmlnIHtcclxuICBjb25zdCBzdG9yZWQgPSBnZXRTdG9yZSgpLmdldChTRVRUSU5HX0tFWV9ERUZBVUxUUykgYXMgV2ViUFBUU2xpZGVDb25maWcgfCBudWxsO1xyXG4gIHJldHVybiBzdG9yZWQgPz8ge1xyXG4gICAgdXJsOiAnJyxcclxuICAgIHpvb206IERFRkFVTFRfWk9PTSxcclxuICAgIGRpYWxvZ1dpZHRoOiBERUZBVUxUX0RJQUxPR19XSURUSCxcclxuICAgIGRpYWxvZ0hlaWdodDogREVGQVVMVF9ESUFMT0dfSEVJR0hULFxyXG4gICAgYXV0b09wZW46IERFRkFVTFRfQVVUT19PUEVOLFxyXG4gICAgYXV0b0Nsb3NlU2VjOiBERUZBVUxUX0FVVE9fQ0xPU0VfU0VDLFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKiBTYXZlcyBnbG9iYWwgZGVmYXVsdHMgYW5kIHBlcnNpc3RzIHRvIGRvY3VtZW50LiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0RGVmYXVsdHMoY29uZmlnOiBXZWJQUFRTbGlkZUNvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKTtcclxuICBzdG9yZS5zZXQoU0VUVElOR19LRVlfREVGQVVMVFMsIGNvbmZpZyk7XHJcbiAgYXdhaXQgc2F2ZShzdG9yZSk7XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaTE4biwgdHlwZSBMb2NhbGUsIHR5cGUgVHJhbnNsYXRpb25LZXkgfSBmcm9tICcuLi9zaGFyZWQvaTE4bic7XHJcbmltcG9ydCB7IGdldFNsaWRlQ29uZmlnLCBzZXRTbGlkZUNvbmZpZywgZ2V0TGFuZ3VhZ2UsIHNldExhbmd1YWdlLCBnZXREZWZhdWx0cywgc2V0RGVmYXVsdHMgfSBmcm9tICcuLi9zaGFyZWQvc2V0dGluZ3MnO1xyXG5pbXBvcnQgeyBEaWFsb2dMYXVuY2hlciwgRGlhbG9nRXJyb3IgfSBmcm9tICcuLi9zaGFyZWQvZGlhbG9nLWxhdW5jaGVyJztcclxuaW1wb3J0IHsgbG9nRGVidWcsIGxvZ0Vycm9yLCBpbnN0YWxsVW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlciB9IGZyb20gJy4uL3NoYXJlZC9sb2dnZXInO1xyXG5pbXBvcnQgeyBBVVRPX0NMT1NFX1NURVBTLCB0cnVuY2F0ZVVybCB9IGZyb20gJy4uL3NoYXJlZC9jb25zdGFudHMnO1xyXG5cclxuLy8g4pSA4pSA4pSAIERPTSByZWZlcmVuY2VzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuY29uc3QgJCA9IDxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KGlkOiBzdHJpbmcpOiBUID0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIGFzIFQ7XHJcblxyXG5sZXQgdXJsSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBidG5BcHBseTogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbmxldCBidG5TaG93OiBIVE1MQnV0dG9uRWxlbWVudDtcclxubGV0IGJ0bkRlZmF1bHRzITogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbmxldCBzdGF0dXNFbDogSFRNTEVsZW1lbnQ7XHJcbmxldCBzbGlkZU51bWJlckVsOiBIVE1MRWxlbWVudDtcclxubGV0IGxhbmdTZWxlY3Q6IEhUTUxTZWxlY3RFbGVtZW50O1xyXG5sZXQgc2xpZGVyV2lkdGghOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVySGVpZ2h0ITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlclpvb20hOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVyV2lkdGhWYWx1ZSE6IEhUTUxFbGVtZW50O1xyXG5sZXQgc2xpZGVySGVpZ2h0VmFsdWUhOiBIVE1MRWxlbWVudDtcclxubGV0IHNsaWRlclpvb21WYWx1ZSE6IEhUTUxFbGVtZW50O1xyXG5sZXQgc2l6ZVByZXZpZXdJbm5lciE6IEhUTUxFbGVtZW50O1xyXG5sZXQgY2hrQXV0b09wZW4hOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgY2hrTG9ja1NpemUhOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVyQXV0b0Nsb3NlITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlckF1dG9DbG9zZVZhbHVlITogSFRNTEVsZW1lbnQ7XHJcbmxldCBwcmVzZXRCdXR0b25zITogTm9kZUxpc3RPZjxIVE1MQnV0dG9uRWxlbWVudD47XHJcbmxldCB2aWV3ZXJTdGF0dXNFbCE6IEhUTUxFbGVtZW50O1xyXG5sZXQgdmlld2VyU3RhdHVzVGV4dCE6IEhUTUxFbGVtZW50O1xyXG5cclxuLy8g4pSA4pSA4pSAIFN0YXRlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxubGV0IGN1cnJlbnRTbGlkZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxubGV0IGN1cnJlbnRTbGlkZUluZGV4OiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuY29uc3QgbGF1bmNoZXIgPSBuZXcgRGlhbG9nTGF1bmNoZXIoKTtcclxubGV0IHZpZXdlclN0YXR1c1RpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xyXG5cclxuLy8g4pSA4pSA4pSAIGkxOG4g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBhcHBseUkxOG4oKTogdm9pZCB7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJ1tkYXRhLWkxOG5dJykuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgIGNvbnN0IGtleSA9IGVsLmRhdGFzZXQuaTE4biBhcyBUcmFuc2xhdGlvbktleTtcclxuICAgIGVsLnRleHRDb250ZW50ID0gaTE4bi50KGtleSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTElucHV0RWxlbWVudD4oJ1tkYXRhLWkxOG4tcGxhY2Vob2xkZXJdJykuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgIGNvbnN0IGtleSA9IGVsLmRhdGFzZXQuaTE4blBsYWNlaG9sZGVyIGFzIFRyYW5zbGF0aW9uS2V5O1xyXG4gICAgZWwucGxhY2Vob2xkZXIgPSBpMThuLnQoa2V5KTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJ1tkYXRhLWkxOG4tdGl0bGVdJykuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgIGNvbnN0IGtleSA9IGVsLmRhdGFzZXQuaTE4blRpdGxlIGFzIFRyYW5zbGF0aW9uS2V5O1xyXG4gICAgZWwudGl0bGUgPSBpMThuLnQoa2V5KTtcclxuICB9KTtcclxuXHJcbiAgLy8gS2VlcCA8aHRtbCBsYW5nPiBpbiBzeW5jIHdpdGggdGhlIGFjdGl2ZSBsb2NhbGVcclxuICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZyA9IGkxOG4uZ2V0TG9jYWxlKCk7XHJcblxyXG4gIC8vIEd1aWRlIHRvZ2dsZSBidXR0b24gdXNlcyBkYXRhLWkxOG49XCJzaXRlTm90TG9hZGluZ1wiLCBidXQgd2hlbiB0aGUgZ3VpZGVcclxuICAvLyBpcyBjdXJyZW50bHkgb3BlbiB0aGUgbGFiZWwgc2hvdWxkIHJlYWQgXCJoaWRlU2V0dXBHdWlkZVwiIGluc3RlYWQuXHJcbiAgY29uc3QgZ3VpZGVTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2d1aWRlLXNlY3Rpb24nKTtcclxuICBpZiAoZ3VpZGVTZWN0aW9uICYmICFndWlkZVNlY3Rpb24uaGlkZGVuKSB7XHJcbiAgICBjb25zdCB0b2dnbGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWd1aWRlLXRvZ2dsZScpO1xyXG4gICAgaWYgKHRvZ2dsZUJ0bikge1xyXG4gICAgICB0b2dnbGVCdG4udGV4dENvbnRlbnQgPSBpMThuLnQoJ2hpZGVTZXR1cEd1aWRlJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGUgZGV0ZWN0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZGV0ZWN0Q3VycmVudFNsaWRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBQb3dlclBvaW50LnJ1bihhc3luYyAoY29udGV4dCkgPT4ge1xyXG4gICAgICBjb25zdCBzbGlkZXMgPSBjb250ZXh0LnByZXNlbnRhdGlvbi5nZXRTZWxlY3RlZFNsaWRlcygpO1xyXG4gICAgICBzbGlkZXMubG9hZCgnaXRlbXMvaWQnKTtcclxuICAgICAgYXdhaXQgY29udGV4dC5zeW5jKCk7XHJcblxyXG4gICAgICBpZiAoc2xpZGVzLml0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBjb25zdCBzbGlkZSA9IHNsaWRlcy5pdGVtc1swXTtcclxuICAgICAgICBjdXJyZW50U2xpZGVJZCA9IHNsaWRlLmlkO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgMS1iYXNlZCBpbmRleFxyXG4gICAgICAgIGNvbnN0IGFsbFNsaWRlcyA9IGNvbnRleHQucHJlc2VudGF0aW9uLnNsaWRlcztcclxuICAgICAgICBhbGxTbGlkZXMubG9hZCgnaXRlbXMvaWQnKTtcclxuICAgICAgICBhd2FpdCBjb250ZXh0LnN5bmMoKTtcclxuXHJcbiAgICAgICAgY3VycmVudFNsaWRlSW5kZXggPSBudWxsO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsU2xpZGVzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoYWxsU2xpZGVzLml0ZW1zW2ldLmlkID09PSBjdXJyZW50U2xpZGVJZCkge1xyXG4gICAgICAgICAgICBjdXJyZW50U2xpZGVJbmRleCA9IGkgKyAxO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgY3VycmVudFNsaWRlSWQgPSBudWxsO1xyXG4gICAgY3VycmVudFNsaWRlSW5kZXggPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlU2xpZGVVSSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVTaXplUHJldmlldygpOiB2b2lkIHtcclxuICBjb25zdCB3ID0gTnVtYmVyKHNsaWRlcldpZHRoLnZhbHVlKTtcclxuICBjb25zdCBoID0gTnVtYmVyKHNsaWRlckhlaWdodC52YWx1ZSk7XHJcbiAgLy8gUHJldmlldyBib3ggaXMgNjTDlzQ4OyBzY2FsZSBwcm9wb3J0aW9uYWxseVxyXG4gIHNpemVQcmV2aWV3SW5uZXIuc3R5bGUud2lkdGggPSBgJHsodyAvIDEwMCkgKiA1OH1weGA7XHJcbiAgc2l6ZVByZXZpZXdJbm5lci5zdHlsZS5oZWlnaHQgPSBgJHsoaCAvIDEwMCkgKiA0Mn1weGA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvcm1hdEF1dG9DbG9zZUxhYmVsKHNlYzogbnVtYmVyKTogc3RyaW5nIHtcclxuICBpZiAoc2VjID09PSAwKSByZXR1cm4gaTE4bi50KCdhdXRvQ2xvc2VPZmYnKTtcclxuICBpZiAoc2VjIDwgNjApIHJldHVybiBgJHtzZWN9c2A7XHJcbiAgY29uc3QgbSA9IE1hdGguZmxvb3Ioc2VjIC8gNjApO1xyXG4gIGNvbnN0IHMgPSBzZWMgJSA2MDtcclxuICBpZiAoc2VjID49IDM2MDApIHJldHVybiBgJHtNYXRoLmZsb29yKHNlYyAvIDM2MDApfWhgO1xyXG4gIHJldHVybiBzID09PSAwID8gYCR7bX1tYCA6IGAke219bSAke3N9c2A7XHJcbn1cclxuXHJcbi8qKiBDb252ZXJ0IHNlY29uZHMgdmFsdWUg4oaSIG5lYXJlc3Qgc2xpZGVyIGluZGV4LiAqL1xyXG5mdW5jdGlvbiBzZWNvbmRzVG9TbGlkZXJJbmRleChzZWM6IG51bWJlcik6IG51bWJlciB7XHJcbiAgbGV0IGJlc3QgPSAwO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgQVVUT19DTE9TRV9TVEVQUy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKE1hdGguYWJzKEFVVE9fQ0xPU0VfU1RFUFNbaV0gLSBzZWMpIDwgTWF0aC5hYnMoQVVUT19DTE9TRV9TVEVQU1tiZXN0XSAtIHNlYykpIHtcclxuICAgICAgYmVzdCA9IGk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBiZXN0O1xyXG59XHJcblxyXG4vKiogUmVhZCBhY3R1YWwgc2Vjb25kcyBmcm9tIHRoZSBjdXJyZW50IHNsaWRlciBwb3NpdGlvbi4gKi9cclxuZnVuY3Rpb24gZ2V0QXV0b0Nsb3NlU2Vjb25kcygpOiBudW1iZXIge1xyXG4gIHJldHVybiBBVVRPX0NMT1NFX1NURVBTW051bWJlcihzbGlkZXJBdXRvQ2xvc2UudmFsdWUpXSA/PyAwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRTbGlkZXJVSSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgem9vbTogbnVtYmVyLCBhdXRvT3BlbjogYm9vbGVhbiwgYXV0b0Nsb3NlU2VjOiBudW1iZXIpOiB2b2lkIHtcclxuICBzbGlkZXJXaWR0aC52YWx1ZSA9IFN0cmluZyh3aWR0aCk7XHJcbiAgc2xpZGVySGVpZ2h0LnZhbHVlID0gU3RyaW5nKGhlaWdodCk7XHJcbiAgc2xpZGVyWm9vbS52YWx1ZSA9IFN0cmluZyh6b29tKTtcclxuICBzbGlkZXJXaWR0aFZhbHVlLnRleHRDb250ZW50ID0gYCR7d2lkdGh9JWA7XHJcbiAgc2xpZGVySGVpZ2h0VmFsdWUudGV4dENvbnRlbnQgPSBgJHtoZWlnaHR9JWA7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7em9vbX0lYDtcclxuICBjaGtBdXRvT3Blbi5jaGVja2VkID0gYXV0b09wZW47XHJcbiAgc2xpZGVyQXV0b0Nsb3NlLnZhbHVlID0gU3RyaW5nKHNlY29uZHNUb1NsaWRlckluZGV4KGF1dG9DbG9zZVNlYykpO1xyXG4gIHNsaWRlckF1dG9DbG9zZVZhbHVlLnRleHRDb250ZW50ID0gZm9ybWF0QXV0b0Nsb3NlTGFiZWwoYXV0b0Nsb3NlU2VjKTtcclxuICB1cGRhdGVTaXplUHJldmlldygpO1xyXG4gIHVwZGF0ZUFjdGl2ZVByZXNldCh6b29tKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQWN0aXZlUHJlc2V0KHpvb206IG51bWJlcik6IHZvaWQge1xyXG4gIHByZXNldEJ1dHRvbnMuZm9yRWFjaCgoYnRuKSA9PiB7XHJcbiAgICBjb25zdCB2YWwgPSBOdW1iZXIoYnRuLmRhdGFzZXQuem9vbSk7XHJcbiAgICBidG4uY2xhc3NMaXN0LnRvZ2dsZSgnYnRuLXByZXNldC0tYWN0aXZlJywgdmFsID09PSB6b29tKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlU2xpZGVVSSgpOiB2b2lkIHtcclxuICBzbGlkZU51bWJlckVsLnRleHRDb250ZW50ID0gY3VycmVudFNsaWRlSW5kZXggIT0gbnVsbCA/IFN0cmluZyhjdXJyZW50U2xpZGVJbmRleCkgOiAn4oCUJztcclxuXHJcbiAgY29uc3QgZGVmYXVsdHMgPSBnZXREZWZhdWx0cygpO1xyXG5cclxuICBpZiAoY3VycmVudFNsaWRlSWQpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGdldFNsaWRlQ29uZmlnKGN1cnJlbnRTbGlkZUlkKTtcclxuICAgIHVybElucHV0LnZhbHVlID0gY29uZmlnPy51cmwgPz8gJyc7XHJcbiAgICBzZXRTbGlkZXJVSShcclxuICAgICAgY29uZmlnPy5kaWFsb2dXaWR0aCA/PyBkZWZhdWx0cy5kaWFsb2dXaWR0aCxcclxuICAgICAgY29uZmlnPy5kaWFsb2dIZWlnaHQgPz8gZGVmYXVsdHMuZGlhbG9nSGVpZ2h0LFxyXG4gICAgICBjb25maWc/Lnpvb20gPz8gZGVmYXVsdHMuem9vbSxcclxuICAgICAgY29uZmlnPy5hdXRvT3BlbiA/PyBkZWZhdWx0cy5hdXRvT3BlbixcclxuICAgICAgY29uZmlnPy5hdXRvQ2xvc2VTZWMgPz8gZGVmYXVsdHMuYXV0b0Nsb3NlU2VjLFxyXG4gICAgKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdXJsSW5wdXQudmFsdWUgPSAnJztcclxuICAgIHNldFNsaWRlclVJKGRlZmF1bHRzLmRpYWxvZ1dpZHRoLCBkZWZhdWx0cy5kaWFsb2dIZWlnaHQsIGRlZmF1bHRzLnpvb20sIGRlZmF1bHRzLmF1dG9PcGVuLCBkZWZhdWx0cy5hdXRvQ2xvc2VTZWMpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlU2hvd0J1dHRvblN0YXRlKCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBVUkwgdmFsaWRhdGlvbiAmIG5vcm1hbGl6YXRpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogQXV0by1wcmVwZW5kIGBodHRwczovL2AgaWYgdGhlIHVzZXIgb21pdHRlZCB0aGUgcHJvdG9jb2wuXHJcbiAqIFJldHVybnMgdGhlIG5vcm1hbGl6ZWQgVVJMIHN0cmluZy5cclxuICovXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCB0cmltbWVkID0gdmFsdWUudHJpbSgpO1xyXG4gIGlmICghdHJpbW1lZCkgcmV0dXJuIHRyaW1tZWQ7XHJcbiAgaWYgKCEvXmh0dHBzPzpcXC9cXC8vaS50ZXN0KHRyaW1tZWQpKSB7XHJcbiAgICByZXR1cm4gYGh0dHBzOi8vJHt0cmltbWVkfWA7XHJcbiAgfVxyXG4gIHJldHVybiB0cmltbWVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1ZhbGlkVXJsKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICBpZiAoIXZhbHVlLnRyaW0oKSkgcmV0dXJuIGZhbHNlO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB1ID0gbmV3IFVSTCh2YWx1ZSk7XHJcbiAgICByZXR1cm4gdS5wcm90b2NvbCA9PT0gJ2h0dHA6JyB8fCB1LnByb3RvY29sID09PSAnaHR0cHM6JztcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTdGF0dXMgbWVzc2FnZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBzaG93U3RhdHVzKGtleTogVHJhbnNsYXRpb25LZXksIHR5cGU6ICdzdWNjZXNzJyB8ICdlcnJvcicpOiB2b2lkIHtcclxuICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IGkxOG4udChrZXkpO1xyXG4gIHN0YXR1c0VsLmNsYXNzTmFtZSA9IGBzdGF0dXMgc3RhdHVzLSR7dHlwZX1gO1xyXG4gIHN0YXR1c0VsLnNldEF0dHJpYnV0ZSgncm9sZScsIHR5cGUgPT09ICdlcnJvcicgPyAnYWxlcnQnIDogJ3N0YXR1cycpO1xyXG4gIHN0YXR1c0VsLmhpZGRlbiA9IGZhbHNlO1xyXG5cclxuICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIHN0YXR1c0VsLmhpZGRlbiA9IHRydWU7XHJcbiAgfSwgMzAwMCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTaG93IGJ1dHRvbiBzdGF0ZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBEaXNhYmxlIFwiU2hvdyBXZWIgUGFnZVwiIHdoZW4gdGhlcmUgaXMgbm8gc2F2ZWQgVVJMIGZvciB0aGUgY3VycmVudCBzbGlkZS4gKi9cclxuZnVuY3Rpb24gdXBkYXRlU2hvd0J1dHRvblN0YXRlKCk6IHZvaWQge1xyXG4gIGNvbnN0IGhhc1VybCA9IGN1cnJlbnRTbGlkZUlkXHJcbiAgICA/ICEhZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQpPy51cmxcclxuICAgIDogZmFsc2U7XHJcbiAgYnRuU2hvdy5kaXNhYmxlZCA9ICFoYXNVcmw7XHJcbiAgYnRuU2hvdy50aXRsZSA9IGhhc1VybFxyXG4gICAgPyB0cnVuY2F0ZVVybChnZXRTbGlkZUNvbmZpZyhjdXJyZW50U2xpZGVJZCEpIS51cmwpXHJcbiAgICA6IGkxOG4udCgnbm9VcmxGb3JTbGlkZScpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQXBwbHkgaGFuZGxlciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFwcGx5KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGlmICghY3VycmVudFNsaWRlSWQpIHtcclxuICAgIHNob3dTdGF0dXMoJ3NlbGVjdFNsaWRlJywgJ2Vycm9yJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBBdXRvLWZpeCBtaXNzaW5nIHByb3RvY29sXHJcbiAgbGV0IHVybCA9IG5vcm1hbGl6ZVVybCh1cmxJbnB1dC52YWx1ZSk7XHJcbiAgaWYgKHVybCAhPT0gdXJsSW5wdXQudmFsdWUudHJpbSgpICYmIHVybCkge1xyXG4gICAgdXJsSW5wdXQudmFsdWUgPSB1cmw7XHJcbiAgICBzaG93U3RhdHVzKCd1cmxBdXRvRml4ZWQnLCAnc3VjY2VzcycpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFpc1ZhbGlkVXJsKHVybCkpIHtcclxuICAgIHNob3dTdGF0dXMoJ25vVXJsJywgJ2Vycm9yJyk7XHJcbiAgICB1cmxJbnB1dC5mb2N1cygpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNldFNsaWRlQ29uZmlnKGN1cnJlbnRTbGlkZUlkLCB7XHJcbiAgICAgIHVybCxcclxuICAgICAgem9vbTogTnVtYmVyKHNsaWRlclpvb20udmFsdWUpLFxyXG4gICAgICBkaWFsb2dXaWR0aDogTnVtYmVyKHNsaWRlcldpZHRoLnZhbHVlKSxcclxuICAgICAgZGlhbG9nSGVpZ2h0OiBOdW1iZXIoc2xpZGVySGVpZ2h0LnZhbHVlKSxcclxuICAgICAgYXV0b09wZW46IGNoa0F1dG9PcGVuLmNoZWNrZWQsXHJcbiAgICAgIGF1dG9DbG9zZVNlYzogZ2V0QXV0b0Nsb3NlU2Vjb25kcygpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgc2hvd1N0YXR1cygnc3VjY2VzcycsICdzdWNjZXNzJyk7XHJcbiAgICB1cGRhdGVTaG93QnV0dG9uU3RhdGUoKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGxvZ0Vycm9yKCdGYWlsZWQgdG8gc2F2ZSBzbGlkZSBjb25maWc6JywgZXJyKTtcclxuICAgIHNob3dTdGF0dXMoJ3NldHRpbmdzU2F2ZVJldHJ5RmFpbGVkJywgJ2Vycm9yJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2V0IGFzIGRlZmF1bHRzIGhhbmRsZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZXREZWZhdWx0cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgc2V0RGVmYXVsdHMoe1xyXG4gICAgICB1cmw6ICcnLFxyXG4gICAgICB6b29tOiBOdW1iZXIoc2xpZGVyWm9vbS52YWx1ZSksXHJcbiAgICAgIGRpYWxvZ1dpZHRoOiBOdW1iZXIoc2xpZGVyV2lkdGgudmFsdWUpLFxyXG4gICAgICBkaWFsb2dIZWlnaHQ6IE51bWJlcihzbGlkZXJIZWlnaHQudmFsdWUpLFxyXG4gICAgICBhdXRvT3BlbjogY2hrQXV0b09wZW4uY2hlY2tlZCxcclxuICAgICAgYXV0b0Nsb3NlU2VjOiBnZXRBdXRvQ2xvc2VTZWNvbmRzKCksXHJcbiAgICB9KTtcclxuICAgIHNob3dTdGF0dXMoJ2RlZmF1bHRzU2F2ZWQnLCAnc3VjY2VzcycpO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgbG9nRXJyb3IoJ0ZhaWxlZCB0byBzYXZlIGRlZmF1bHRzOicsIGVycik7XHJcbiAgICBzaG93U3RhdHVzKCdzZXR0aW5nc1NhdmVSZXRyeUZhaWxlZCcsICdlcnJvcicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNsaWRlciAvIHByZXNldCBoYW5kbGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVdpZHRoSW5wdXQoKTogdm9pZCB7XHJcbiAgc2xpZGVyV2lkdGhWYWx1ZS50ZXh0Q29udGVudCA9IGAke3NsaWRlcldpZHRoLnZhbHVlfSVgO1xyXG4gIGlmIChjaGtMb2NrU2l6ZS5jaGVja2VkKSB7XHJcbiAgICBzbGlkZXJIZWlnaHQudmFsdWUgPSBzbGlkZXJXaWR0aC52YWx1ZTtcclxuICAgIHNsaWRlckhlaWdodFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVySGVpZ2h0LnZhbHVlfSVgO1xyXG4gIH1cclxuICB1cGRhdGVTaXplUHJldmlldygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVIZWlnaHRJbnB1dCgpOiB2b2lkIHtcclxuICBzbGlkZXJIZWlnaHRWYWx1ZS50ZXh0Q29udGVudCA9IGAke3NsaWRlckhlaWdodC52YWx1ZX0lYDtcclxuICBpZiAoY2hrTG9ja1NpemUuY2hlY2tlZCkge1xyXG4gICAgc2xpZGVyV2lkdGgudmFsdWUgPSBzbGlkZXJIZWlnaHQudmFsdWU7XHJcbiAgICBzbGlkZXJXaWR0aFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVyV2lkdGgudmFsdWV9JWA7XHJcbiAgfVxyXG4gIHVwZGF0ZVNpemVQcmV2aWV3KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVpvb21JbnB1dCgpOiB2b2lkIHtcclxuICBjb25zdCB2YWwgPSBOdW1iZXIoc2xpZGVyWm9vbS52YWx1ZSk7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7dmFsfSVgO1xyXG4gIHVwZGF0ZUFjdGl2ZVByZXNldCh2YWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVQcmVzZXRDbGljayhlOiBFdmVudCk6IHZvaWQge1xyXG4gIGNvbnN0IGJ0biA9IChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xvc2VzdDxIVE1MQnV0dG9uRWxlbWVudD4oJy5idG4tcHJlc2V0Jyk7XHJcbiAgaWYgKCFidG4/LmRhdGFzZXQuem9vbSkgcmV0dXJuO1xyXG4gIGNvbnN0IHZhbCA9IE51bWJlcihidG4uZGF0YXNldC56b29tKTtcclxuICBzbGlkZXJab29tLnZhbHVlID0gU3RyaW5nKHZhbCk7XHJcbiAgc2xpZGVyWm9vbVZhbHVlLnRleHRDb250ZW50ID0gYCR7dmFsfSVgO1xyXG4gIHVwZGF0ZUFjdGl2ZVByZXNldCh2YWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVMb2NrU2l6ZUNoYW5nZSgpOiB2b2lkIHtcclxuICBpZiAoY2hrTG9ja1NpemUuY2hlY2tlZCkge1xyXG4gICAgLy8gU3luYyBoZWlnaHQgdG8gd2lkdGhcclxuICAgIHNsaWRlckhlaWdodC52YWx1ZSA9IHNsaWRlcldpZHRoLnZhbHVlO1xyXG4gICAgc2xpZGVySGVpZ2h0VmFsdWUudGV4dENvbnRlbnQgPSBgJHtzbGlkZXJIZWlnaHQudmFsdWV9JWA7XHJcbiAgICB1cGRhdGVTaXplUHJldmlldygpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQXV0b0Nsb3NlSW5wdXQoKTogdm9pZCB7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlVmFsdWUudGV4dENvbnRlbnQgPSBmb3JtYXRBdXRvQ2xvc2VMYWJlbChnZXRBdXRvQ2xvc2VTZWNvbmRzKCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVJbmZvVG9nZ2xlKGhpbnRJZDogc3RyaW5nLCBidG5JZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgY29uc3QgaGludCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGhpbnRJZCk7XHJcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnRuSWQpO1xyXG4gIGlmICghaGludCB8fCAhYnRuKSByZXR1cm47XHJcbiAgY29uc3Qgc2hvdyA9IGhpbnQuaGlkZGVuO1xyXG4gIGhpbnQuaGlkZGVuID0gIXNob3c7XHJcbiAgYnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhzaG93KSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUF1dG9PcGVuSW5mb1RvZ2dsZSgpOiB2b2lkIHtcclxuICBoYW5kbGVJbmZvVG9nZ2xlKCdhdXRvb3Blbi1oaW50JywgJ2J0bi1hdXRvb3Blbi1pbmZvJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUF1dG9DbG9zZUluZm9Ub2dnbGUoKTogdm9pZCB7XHJcbiAgaGFuZGxlSW5mb1RvZ2dsZSgnYXV0b2Nsb3NlLWhpbnQnLCAnYnRuLWF1dG9jbG9zZS1pbmZvJyk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBWaWV3ZXIgc3RhdHVzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxudHlwZSBWaWV3ZXJTdGF0ZSA9ICdsb2FkaW5nJyB8ICdsb2FkZWQnIHwgJ2Jsb2NrZWQnIHwgJ2Vycm9yJztcclxuXHJcbmZ1bmN0aW9uIHNldFZpZXdlclN0YXR1cyhzdGF0ZTogVmlld2VyU3RhdGUpOiB2b2lkIHtcclxuICBjb25zdCBrZXlNYXA6IFJlY29yZDxWaWV3ZXJTdGF0ZSwgVHJhbnNsYXRpb25LZXk+ID0ge1xyXG4gICAgbG9hZGluZzogJ3ZpZXdlckxvYWRpbmcnLFxyXG4gICAgbG9hZGVkOiAndmlld2VyTG9hZGVkJyxcclxuICAgIGJsb2NrZWQ6ICd2aWV3ZXJCbG9ja2VkJyxcclxuICAgIGVycm9yOiAndmlld2VyRXJyb3InLFxyXG4gIH07XHJcblxyXG4gIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IGZhbHNlO1xyXG4gIHZpZXdlclN0YXR1c0VsLmNsYXNzTmFtZSA9IGB2aWV3ZXItc3RhdHVzIHZpZXdlci1zdGF0dXMtLSR7c3RhdGV9YDtcclxuICB2aWV3ZXJTdGF0dXNUZXh0LnRleHRDb250ZW50ID0gaTE4bi50KGtleU1hcFtzdGF0ZV0pO1xyXG5cclxuICAvLyBBdXRvLWhpZGUgc3VjY2Vzcy9lcnJvciBhZnRlciBhIGRlbGF5IChrZWVwIGxvYWRpbmcvYmxvY2tlZCB2aXNpYmxlKVxyXG4gIGlmICh2aWV3ZXJTdGF0dXNUaW1lcikge1xyXG4gICAgY2xlYXJUaW1lb3V0KHZpZXdlclN0YXR1c1RpbWVyKTtcclxuICAgIHZpZXdlclN0YXR1c1RpbWVyID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGlmIChzdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcclxuICAgIHZpZXdlclN0YXR1c1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IHRydWU7XHJcbiAgICB9LCA0MDAwKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhpZGVWaWV3ZXJTdGF0dXMoKTogdm9pZCB7XHJcbiAgaWYgKHZpZXdlclN0YXR1c1RpbWVyKSB7XHJcbiAgICBjbGVhclRpbWVvdXQodmlld2VyU3RhdHVzVGltZXIpO1xyXG4gICAgdmlld2VyU3RhdHVzVGltZXIgPSBudWxsO1xyXG4gIH1cclxuICB2aWV3ZXJTdGF0dXNFbC5oaWRkZW4gPSB0cnVlO1xyXG59XHJcblxyXG4vKiogUGFyc2UgYW5kIGhhbmRsZSBzdHJ1Y3R1cmVkIG1lc3NhZ2VzIGZyb20gdGhlIHZpZXdlciBkaWFsb2cuICovXHJcbmZ1bmN0aW9uIGhhbmRsZVZpZXdlck1lc3NhZ2UocmF3TWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG1zZyA9IEpTT04ucGFyc2UocmF3TWVzc2FnZSkgYXMgeyB0eXBlOiBzdHJpbmc7IHVybD86IHN0cmluZzsgZXJyb3I/OiBzdHJpbmcgfTtcclxuXHJcbiAgICBzd2l0Y2ggKG1zZy50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ3JlYWR5JzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2xvYWRpbmcnKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbG9hZGVkJzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2xvYWRlZCcpO1xyXG4gICAgICAgIC8vIFNob3cgZGVidWcgcmVzdWx0IGlmIGl0IGxvb2tzIGxpa2UgYSBtb3ZlVG8vcmVzaXplVG8vcmVzdG9yZSByZXNwb25zZVxyXG4gICAgICAgIGlmIChtc2cudXJsICYmIChtc2cudXJsLnN0YXJ0c1dpdGgoJ21vdmVUbzonKSB8fCBtc2cudXJsLnN0YXJ0c1dpdGgoJ3Jlc2l6ZVRvOicpIHx8IG1zZy51cmwuc3RhcnRzV2l0aCgncmVzdG9yZWQnKSkpIHtcclxuICAgICAgICAgIGRiZyhgREVCVUcgcmVzdWx0OiAke21zZy51cmx9YCk7XHJcbiAgICAgICAgICBjb25zdCByZXN1bHRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYmctcmVzdWx0Jyk7XHJcbiAgICAgICAgICBpZiAocmVzdWx0RWwpIHJlc3VsdEVsLnRleHRDb250ZW50ID0gbXNnLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Jsb2NrZWQnOlxyXG4gICAgICAgIHNldFZpZXdlclN0YXR1cygnYmxvY2tlZCcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdlcnJvcic6XHJcbiAgICAgICAgc2V0Vmlld2VyU3RhdHVzKCdlcnJvcicpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjbG9zZSc6XHJcbiAgICAgICAgbGF1bmNoZXIuY2xvc2UoKTtcclxuICAgICAgICBidG5TaG93LmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgaGlkZVZpZXdlclN0YXR1cygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gTm9uLUpTT04gbWVzc2FnZSDigJQgaWdub3JlXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVWaWV3ZXJDbG9zZWQoKTogdm9pZCB7XHJcbiAgYnRuU2hvdy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gIC8vIFJlbWVtYmVyIHdoaWNoIHNsaWRlIHRoZSBkaWFsb2cgd2FzIGNsb3NlZCBvbiAocHJldmVudCByZS1vcGVuaW5nKVxyXG4gIGlmIChsYXN0U2xpZGVzaG93U2xpZGVJZCkge1xyXG4gICAgbGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWQgPSBsYXN0U2xpZGVzaG93U2xpZGVJZDtcclxuICAgIGRiZyhgRGlhbG9nIGNsb3NlZCBvbiBzbGlkZSAke2xhc3REaWFsb2dDbG9zZWRTbGlkZUlkfSDigJQgd2lsbCBub3QgcmUtb3BlbiB1bnRpbCBzbGlkZSBjaGFuZ2VzYCk7XHJcbiAgfVxyXG4gIC8vIFNob3cgYnJpZWYgXCJjbG9zZWRcIiBzdGF0dXMgdGhlbiBoaWRlXHJcbiAgdmlld2VyU3RhdHVzRWwuaGlkZGVuID0gZmFsc2U7XHJcbiAgdmlld2VyU3RhdHVzRWwuY2xhc3NOYW1lID0gJ3ZpZXdlci1zdGF0dXMnO1xyXG4gIHZpZXdlclN0YXR1c1RleHQudGV4dENvbnRlbnQgPSBpMThuLnQoJ3ZpZXdlckNsb3NlZCcpO1xyXG5cclxuICBpZiAodmlld2VyU3RhdHVzVGltZXIpIGNsZWFyVGltZW91dCh2aWV3ZXJTdGF0dXNUaW1lcik7XHJcbiAgdmlld2VyU3RhdHVzVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IHRydWU7XHJcbiAgfSwgMjAwMCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTaG93IFdlYiBQYWdlIGhhbmRsZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTaG93KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGlmICghY3VycmVudFNsaWRlSWQpIHtcclxuICAgIHNob3dTdGF0dXMoJ3NlbGVjdFNsaWRlJywgJ2Vycm9yJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCBjb25maWcgPSBnZXRTbGlkZUNvbmZpZyhjdXJyZW50U2xpZGVJZCk7XHJcblxyXG4gIGlmICghY29uZmlnIHx8ICFjb25maWcudXJsKSB7XHJcbiAgICBzaG93U3RhdHVzKCdub1VybEZvclNsaWRlJywgJ2Vycm9yJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBuZXR3b3JrIGJlZm9yZSBvcGVuaW5nXHJcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmICFuYXZpZ2F0b3Iub25MaW5lKSB7XHJcbiAgICBzaG93U3RhdHVzKCdub0ludGVybmV0JywgJ2Vycm9yJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBidG5TaG93LmRpc2FibGVkID0gdHJ1ZTtcclxuICBzZXRWaWV3ZXJTdGF0dXMoJ2xvYWRpbmcnKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGxhdW5jaGVyLm9wZW4oe1xyXG4gICAgICB1cmw6IGNvbmZpZy51cmwsXHJcbiAgICAgIHpvb206IGNvbmZpZy56b29tLFxyXG4gICAgICB3aWR0aDogY29uZmlnLmRpYWxvZ1dpZHRoLFxyXG4gICAgICBoZWlnaHQ6IGNvbmZpZy5kaWFsb2dIZWlnaHQsXHJcbiAgICAgIGxhbmc6IGkxOG4uZ2V0TG9jYWxlKCksXHJcbiAgICAgIGF1dG9DbG9zZVNlYzogY29uZmlnLmF1dG9DbG9zZVNlYyxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgYnRuU2hvdy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgaGlkZVZpZXdlclN0YXR1cygpO1xyXG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIERpYWxvZ0Vycm9yKSB7XHJcbiAgICAgIHNob3dTdGF0dXMoZXJyLmkxOG5LZXksICdlcnJvcicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2hvd1N0YXR1cygnZXJyb3JHZW5lcmljJywgJ2Vycm9yJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgR3VpZGUgaGFuZGxlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5jb25zdCBTTklQUEVUUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICBuZ2lueDogJ2FkZF9oZWFkZXIgQ29udGVudC1TZWN1cml0eS1Qb2xpY3kgXCJmcmFtZS1hbmNlc3RvcnMgKlwiOycsXHJcbiAgYXBhY2hlOiAnSGVhZGVyIHNldCBDb250ZW50LVNlY3VyaXR5LVBvbGljeSBcImZyYW1lLWFuY2VzdG9ycyAqXCJcXG5IZWFkZXIgdW5zZXQgWC1GcmFtZS1PcHRpb25zJyxcclxuICBleHByZXNzOiBgYXBwLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcXG4gIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtU2VjdXJpdHktUG9saWN5JywgJ2ZyYW1lLWFuY2VzdG9ycyAqJyk7XFxuICByZXMucmVtb3ZlSGVhZGVyKCdYLUZyYW1lLU9wdGlvbnMnKTtcXG4gIG5leHQoKTtcXG59KTtgLFxyXG4gIG1ldGE6ICc8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIlxcbiAgICAgIGNvbnRlbnQ9XCJmcmFtZS1hbmNlc3RvcnMgKlwiPicsXHJcbn07XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVHdWlkZVRvZ2dsZSgpOiB2b2lkIHtcclxuICBjb25zdCBzZWN0aW9uID0gJCgnZ3VpZGUtc2VjdGlvbicpO1xyXG4gIGNvbnN0IHRvZ2dsZSA9ICQoJ2J0bi1ndWlkZS10b2dnbGUnKTtcclxuICBjb25zdCBpc0hpZGRlbiA9IHNlY3Rpb24uaGlkZGVuO1xyXG4gIHNlY3Rpb24uaGlkZGVuID0gIWlzSGlkZGVuO1xyXG4gIHRvZ2dsZS50ZXh0Q29udGVudCA9IGkxOG4udChpc0hpZGRlbiA/ICdoaWRlU2V0dXBHdWlkZScgOiAnc2l0ZU5vdExvYWRpbmcnKTtcclxuICB0b2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKGlzSGlkZGVuKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFjdGl2YXRlR3VpZGVUYWIodGFiSWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEJ1dHRvbkVsZW1lbnQ+KCcjZ3VpZGUtc2VjdGlvbiBbZGF0YS1ndWlkZS10YWJdJykuZm9yRWFjaCgodCkgPT4ge1xyXG4gICAgY29uc3QgYWN0aXZlID0gdC5kYXRhc2V0Lmd1aWRlVGFiID09PSB0YWJJZDtcclxuICAgIHQuY2xhc3NMaXN0LnRvZ2dsZSgnZ3VpZGUtdGFiLS1hY3RpdmUnLCBhY3RpdmUpO1xyXG4gICAgdC5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCBTdHJpbmcoYWN0aXZlKSk7XHJcbiAgICB0LnRhYkluZGV4ID0gYWN0aXZlID8gMCA6IC0xO1xyXG4gICAgaWYgKGFjdGl2ZSkgdC5mb2N1cygpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignI2d1aWRlLXNlY3Rpb24gW2RhdGEtZ3VpZGUtcGFuZWxdJykuZm9yRWFjaCgocCkgPT4ge1xyXG4gICAgcC5oaWRkZW4gPSBwLmRhdGFzZXQuZ3VpZGVQYW5lbCAhPT0gdGFiSWQ7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUd1aWRlVGFiQ2xpY2soZTogRXZlbnQpOiB2b2lkIHtcclxuICBjb25zdCB0YWIgPSAoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsb3Nlc3Q8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdbZGF0YS1ndWlkZS10YWJdJyk7XHJcbiAgaWYgKCF0YWIpIHJldHVybjtcclxuICBhY3RpdmF0ZUd1aWRlVGFiKHRhYi5kYXRhc2V0Lmd1aWRlVGFiISk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUd1aWRlVGFiS2V5ZG93bihlOiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XHJcbiAgY29uc3QgdGFicyA9IEFycmF5LmZyb20oXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PignI2d1aWRlLXNlY3Rpb24gW2RhdGEtZ3VpZGUtdGFiXScpLFxyXG4gICk7XHJcbiAgY29uc3QgY3VycmVudCA9IHRhYnMuZmluZEluZGV4KCh0KSA9PiB0LmdldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcpID09PSAndHJ1ZScpO1xyXG4gIGxldCBuZXh0ID0gLTE7XHJcblxyXG4gIGlmIChlLmtleSA9PT0gJ0Fycm93UmlnaHQnKSBuZXh0ID0gKGN1cnJlbnQgKyAxKSAlIHRhYnMubGVuZ3RoO1xyXG4gIGVsc2UgaWYgKGUua2V5ID09PSAnQXJyb3dMZWZ0JykgbmV4dCA9IChjdXJyZW50IC0gMSArIHRhYnMubGVuZ3RoKSAlIHRhYnMubGVuZ3RoO1xyXG4gIGVsc2UgaWYgKGUua2V5ID09PSAnSG9tZScpIG5leHQgPSAwO1xyXG4gIGVsc2UgaWYgKGUua2V5ID09PSAnRW5kJykgbmV4dCA9IHRhYnMubGVuZ3RoIC0gMTtcclxuICBlbHNlIHJldHVybjtcclxuXHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIGFjdGl2YXRlR3VpZGVUYWIodGFic1tuZXh0XS5kYXRhc2V0Lmd1aWRlVGFiISk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUd1aWRlQ29weShlOiBFdmVudCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IGJ0biA9IChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xvc2VzdDxIVE1MQnV0dG9uRWxlbWVudD4oJ1tkYXRhLWNvcHktc25pcHBldF0nKTtcclxuICBpZiAoIWJ0bikgcmV0dXJuO1xyXG5cclxuICBjb25zdCBrZXkgPSBidG4uZGF0YXNldC5jb3B5U25pcHBldCE7XHJcbiAgY29uc3QgdGV4dCA9IFNOSVBQRVRTW2tleV07XHJcbiAgaWYgKCF0ZXh0KSByZXR1cm47XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcclxuICAgIGJ0bi50ZXh0Q29udGVudCA9IGkxOG4udCgnY29waWVkJyk7XHJcbiAgICBidG4uY2xhc3NMaXN0LmFkZCgnYnRuLWNvcHktLWNvcGllZCcpO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9IGkxOG4udCgnY29weScpO1xyXG4gICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZSgnYnRuLWNvcHktLWNvcGllZCcpO1xyXG4gICAgfSwgMjAwMCk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvLyBGYWxsYmFjazogc2VsZWN0IHRleHQgaW4gdGhlIGNvZGUgYmxvY2tcclxuICAgIGNvbnN0IHBhbmVsID0gYnRuLmNsb3Nlc3QoJ1tkYXRhLWd1aWRlLXBhbmVsXScpO1xyXG4gICAgY29uc3QgY29kZSA9IHBhbmVsPy5xdWVyeVNlbGVjdG9yKCdjb2RlJyk7XHJcbiAgICBpZiAoY29kZSkge1xyXG4gICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhjb2RlKTtcclxuICAgICAgY29uc3Qgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICBzZWw/LnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgICBzZWw/LmFkZFJhbmdlKHJhbmdlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBMYW5ndWFnZSBzd2l0Y2gg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMYW5ndWFnZUNoYW5nZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBsb2NhbGUgPSBsYW5nU2VsZWN0LnZhbHVlIGFzIExvY2FsZTtcclxuICBpMThuLnNldExvY2FsZShsb2NhbGUpO1xyXG4gIGFwcGx5STE4bigpO1xyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgc2V0TGFuZ3VhZ2UobG9jYWxlKTtcclxuICB9IGNhdGNoIHtcclxuICAgIC8vIG5vbi1jcml0aWNhbCDigJQgVUkgYWxyZWFkeSB1cGRhdGVkXHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgS2V5Ym9hcmQgc3VwcG9ydCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVVybEtleWRvd24oZTogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaGFuZGxlQXBwbHkoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBEZWJ1ZyBwYW5lbCAodGVtcG9yYXJ5IOKAlCByZW1vdmUgYWZ0ZXIgZml4aW5nKSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmxldCBkZWJ1Z1BhbmVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG5sZXQgZGVidWdMaW5lQ291bnQgPSAwO1xyXG5cclxuZnVuY3Rpb24gZGJnKG1zZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgbG9nRGVidWcoJ1tUYXNrcGFuZV0nLCBtc2cpO1xyXG4gIGlmICghZGVidWdQYW5lbCkge1xyXG4gICAgZGVidWdQYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWJ1Zy1wYW5lbCcpO1xyXG4gIH1cclxuICBpZiAoZGVidWdQYW5lbCkge1xyXG4gICAgZGVidWdMaW5lQ291bnQrKztcclxuICAgIGNvbnN0IHRpbWUgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygnZW4nLCB7IGhvdXIxMjogZmFsc2UgfSk7XHJcbiAgICBkZWJ1Z1BhbmVsLnRleHRDb250ZW50ICs9IGBcXG4ke2RlYnVnTGluZUNvdW50fS4gWyR7dGltZX1dICR7bXNnfWA7XHJcbiAgICBkZWJ1Z1BhbmVsLnNjcm9sbFRvcCA9IGRlYnVnUGFuZWwuc2Nyb2xsSGVpZ2h0O1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNsaWRlc2hvdyBhdXRvLW9wZW4g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcbi8vXHJcbi8vIFRoZSBjb21tYW5kcyBydW50aW1lIChGdW5jdGlvbkZpbGUpIG1heSBub3QgcGVyc2lzdCBkdXJpbmcgc2xpZGVzaG93IG9uIGFsbFxyXG4vLyBQb3dlclBvaW50IHZlcnNpb25zLiBBcyBhIHJlbGlhYmxlIGZhbGxiYWNrLCB0aGUgdGFza3BhbmUgaXRzZWxmIHBvbGxzIGZvclxyXG4vLyB2aWV3IG1vZGUgY2hhbmdlcyBhbmQgc2xpZGUgbmF2aWdhdGlvbiBkdXJpbmcgc2xpZGVzaG93LlxyXG4vL1xyXG4vLyBVc2VzIGdldEFjdGl2ZVZpZXdBc3luYygpIGluc3RlYWQgb2YgQWN0aXZlVmlld0NoYW5nZWQgZXZlbnQgYmVjYXVzZVxyXG4vLyB0aGUgZXZlbnQgbWF5IG5vdCBmaXJlIGluIHRoZSB0YXNrcGFuZSBjb250ZXh0LlxyXG5cclxuLyoqIEhvdyBvZnRlbiB0byBjaGVjayB0aGUgY3VycmVudCB2aWV3IG1vZGUgKG1zKS4gKi9cclxuY29uc3QgVklFV19QT0xMX0lOVEVSVkFMX01TID0gMjAwMDtcclxuXHJcbi8qKiBIb3cgb2Z0ZW4gdG8gY2hlY2sgdGhlIGN1cnJlbnQgc2xpZGUgZHVyaW5nIHNsaWRlc2hvdyAobXMpLiAqL1xyXG5jb25zdCBTTElERV9QT0xMX0lOVEVSVkFMX01TID0gMTUwMDtcclxuXHJcbmxldCB2aWV3UG9sbFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRJbnRlcnZhbD4gfCBudWxsID0gbnVsbDtcclxubGV0IHNsaWRlUG9sbFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRJbnRlcnZhbD4gfCBudWxsID0gbnVsbDtcclxubGV0IHNsaWRlc2hvd0FjdGl2ZSA9IGZhbHNlO1xyXG5sZXQgbGFzdFNsaWRlc2hvd1NsaWRlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5sZXQgc2xpZGVQb2xsQnVzeSA9IGZhbHNlO1xyXG5cclxuLyoqIFdoZXRoZXIgdGhlIHZpZXdlciBkaWFsb2cgaGFzIGJlZW4gb3BlbmVkIGZvciB0aGUgY3VycmVudCBzbGlkZXNob3cgc2Vzc2lvbi4gKi9cclxubGV0IHNsaWRlc2hvd0RpYWxvZ09wZW5lZCA9IGZhbHNlO1xyXG5cclxuLyoqIFNsaWRlIElEIGZvciB3aGljaCB0aGUgZGlhbG9nIHdhcyBsYXN0IGNsb3NlZCAodG8gcHJldmVudCByZS1vcGVuaW5nIG9uIHNhbWUgc2xpZGUpLiAqL1xyXG5sZXQgbGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuLyoqIEdldCB0aGUgY3VycmVudCB2aWV3IG1vZGUgKFwiZWRpdFwiIG9yIFwicmVhZFwiKS4gKi9cclxuZnVuY3Rpb24gZ2V0QWN0aXZlVmlldygpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgT2ZmaWNlLmNvbnRleHQuZG9jdW1lbnQuZ2V0QWN0aXZlVmlld0FzeW5jKChyZXN1bHQpID0+IHtcclxuICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gT2ZmaWNlLkFzeW5jUmVzdWx0U3RhdHVzLlN1Y2NlZWRlZCkge1xyXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQudmFsdWUgYXMgdW5rbm93biBhcyBzdHJpbmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkYmcoYGdldEFjdGl2ZVZpZXcgRkFJTEVEOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCk7XHJcbiAgICAgICAgICByZXNvbHZlKCdlZGl0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBkYmcoYGdldEFjdGl2ZVZpZXcgRVhDRVBUSU9OOiAke2Vycn1gKTtcclxuICAgICAgcmVzb2x2ZSgnZWRpdCcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBjdXJyZW50IHNsaWRlIElELiBUcmllcyB0d28gbWV0aG9kczpcclxuICogMS4gUG93ZXJQb2ludCBKUyBBUEkgZ2V0U2VsZWN0ZWRTbGlkZXMoKSDigJQgd29ya3MgaW4gZWRpdCBtb2RlXHJcbiAqIDIuIENvbW1vbiBBUEkgZ2V0U2VsZWN0ZWREYXRhQXN5bmMoU2xpZGVSYW5nZSkg4oCUIG1heSB3b3JrIGluIHNsaWRlc2hvd1xyXG4gKlxyXG4gKiBNZXRob2QgMiByZXR1cm5zIGEgbnVtZXJpYyBzbGlkZSBJRCwgd2hpY2ggd2UgbWFwIHRvIHRoZSBKUyBBUEkgc3RyaW5nIElEXHJcbiAqIHVzaW5nIGEgcHJlLWJ1aWx0IGluZGV44oaSaWQgbG9va3VwIHRhYmxlLlxyXG4gKi9cclxuXHJcbi8qKiBNYXAgb2Ygc2xpZGUgaW5kZXggKDEtYmFzZWQpIOKGkiBQb3dlclBvaW50IEpTIEFQSSBzbGlkZSBJRC4gQnVpbHQgYmVmb3JlIHNsaWRlc2hvdy4gKi9cclxubGV0IHNsaWRlSW5kZXhUb0lkOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xyXG5cclxuLyoqIEJ1aWxkIHRoZSBpbmRleOKGkmlkIG1hcCBmcm9tIGFsbCBzbGlkZXMgaW4gdGhlIHByZXNlbnRhdGlvbi4gKi9cclxuYXN5bmMgZnVuY3Rpb24gYnVpbGRTbGlkZUluZGV4TWFwKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBQb3dlclBvaW50LnJ1bihhc3luYyAoY29udGV4dCkgPT4ge1xyXG4gICAgICBjb25zdCBzbGlkZXMgPSBjb250ZXh0LnByZXNlbnRhdGlvbi5zbGlkZXM7XHJcbiAgICAgIHNsaWRlcy5sb2FkKCdpdGVtcy9pZCcpO1xyXG4gICAgICBhd2FpdCBjb250ZXh0LnN5bmMoKTtcclxuICAgICAgc2xpZGVJbmRleFRvSWQgPSBuZXcgTWFwKCk7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2xpZGVzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgc2xpZGVJbmRleFRvSWQuc2V0KGkgKyAxLCBzbGlkZXMuaXRlbXNbaV0uaWQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGVudHJpZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICBzbGlkZUluZGV4VG9JZC5mb3JFYWNoKChpZCwgaWR4KSA9PiBlbnRyaWVzLnB1c2goYCR7aWR4feKGkiR7aWR9YCkpO1xyXG4gICAgZGJnKGBTbGlkZSBtYXA6ICR7ZW50cmllcy5qb2luKCcsICcpfWApO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgZGJnKGBidWlsZFNsaWRlSW5kZXhNYXAgRVJST1I6ICR7ZXJyfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIE1ldGhvZCAxOiBQb3dlclBvaW50IEpTIEFQSSDigJQgZ2V0U2VsZWN0ZWRTbGlkZXMoKS4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0U2xpZGVJZFZpYUpzQXBpKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gIHRyeSB7XHJcbiAgICBsZXQgc2xpZGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBhd2FpdCBQb3dlclBvaW50LnJ1bihhc3luYyAoY29udGV4dCkgPT4ge1xyXG4gICAgICBjb25zdCBzbGlkZXMgPSBjb250ZXh0LnByZXNlbnRhdGlvbi5nZXRTZWxlY3RlZFNsaWRlcygpO1xyXG4gICAgICBzbGlkZXMubG9hZCgnaXRlbXMvaWQnKTtcclxuICAgICAgYXdhaXQgY29udGV4dC5zeW5jKCk7XHJcbiAgICAgIGlmIChzbGlkZXMuaXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHNsaWRlSWQgPSBzbGlkZXMuaXRlbXNbMF0uaWQ7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHNsaWRlSWQ7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBkYmcoYEpTIEFQSSBnZXRTZWxlY3RlZFNsaWRlcyBFUlJPUjogJHtlcnJ9YCk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBNZXRob2QgMjogQ29tbW9uIEFQSSDigJQgZ2V0U2VsZWN0ZWREYXRhQXN5bmMoU2xpZGVSYW5nZSkuICovXHJcbmZ1bmN0aW9uIGdldFNsaWRlSWRWaWFDb21tb25BcGkoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBPZmZpY2UuY29udGV4dC5kb2N1bWVudC5nZXRTZWxlY3RlZERhdGFBc3luYyhcclxuICAgICAgICBPZmZpY2UuQ29lcmNpb25UeXBlLlNsaWRlUmFuZ2UsXHJcbiAgICAgICAgKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IE9mZmljZS5Bc3luY1Jlc3VsdFN0YXR1cy5TdWNjZWVkZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHJlc3VsdC52YWx1ZSBhcyB7IHNsaWRlcz86IEFycmF5PHsgaWQ6IG51bWJlcjsgaW5kZXg6IG51bWJlciB9PiB9O1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5zbGlkZXMgJiYgZGF0YS5zbGlkZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHNsaWRlID0gZGF0YS5zbGlkZXNbMF07XHJcbiAgICAgICAgICAgICAgZGJnKGBDb21tb25BUEkgc2xpZGU6IGlkPSR7c2xpZGUuaWR9IGluZGV4PSR7c2xpZGUuaW5kZXh9YCk7XHJcbiAgICAgICAgICAgICAgLy8gTWFwIGluZGV4IHRvIEpTIEFQSSBzbGlkZSBJRFxyXG4gICAgICAgICAgICAgIGNvbnN0IGpzSWQgPSBzbGlkZUluZGV4VG9JZC5nZXQoc2xpZGUuaW5kZXgpO1xyXG4gICAgICAgICAgICAgIGlmIChqc0lkKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGpzSWQpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYmcoYE5vIEpTIEFQSSBJRCBmb3VuZCBmb3IgaW5kZXggJHtzbGlkZS5pbmRleH1gKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGRiZygnQ29tbW9uQVBJOiBubyBzbGlkZXMgaW4gcmVzdWx0Jyk7XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGJnKGBDb21tb25BUEkgRkFJTEVEOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCk7XHJcbiAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBkYmcoYENvbW1vbkFQSSBFWENFUFRJT046ICR7ZXJyfWApO1xyXG4gICAgICByZXNvbHZlKG51bGwpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vKiogVHJ5IGJvdGggbWV0aG9kcyB0byBnZXQgdGhlIGN1cnJlbnQgc2xpZGUgSUQuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNsaWRlc2hvd1NsaWRlSWQoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgLy8gVHJ5IEpTIEFQSSBmaXJzdCAod29ya3MgcmVsaWFibHkgaW4gZWRpdCBtb2RlKVxyXG4gIGNvbnN0IGpzUmVzdWx0ID0gYXdhaXQgZ2V0U2xpZGVJZFZpYUpzQXBpKCk7XHJcbiAgaWYgKGpzUmVzdWx0KSB7XHJcbiAgICBkYmcoYHNsaWRlSWQgdmlhIEpTIEFQSTogJHtqc1Jlc3VsdH1gKTtcclxuICAgIHJldHVybiBqc1Jlc3VsdDtcclxuICB9XHJcblxyXG4gIC8vIEZhbGxiYWNrOiBDb21tb24gQVBJIChtYXkgd29yayBpbiBzbGlkZXNob3cpXHJcbiAgY29uc3QgY29tbW9uUmVzdWx0ID0gYXdhaXQgZ2V0U2xpZGVJZFZpYUNvbW1vbkFwaSgpO1xyXG4gIGRiZyhgc2xpZGVJZCB2aWEgQ29tbW9uQVBJOiAke2NvbW1vblJlc3VsdH1gKTtcclxuICByZXR1cm4gY29tbW9uUmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogT3BlbiBvciB1cGRhdGUgdGhlIHZpZXdlciBmb3IgYSBzbGlkZSBkdXJpbmcgc2xpZGVzaG93LlxyXG4gKlxyXG4gKiBDUklUSUNBTDogQ2xvc2luZyBgZGlzcGxheURpYWxvZ0FzeW5jYCBkdXJpbmcgc2xpZGVzaG93IGNhdXNlcyBQb3dlclBvaW50XHJcbiAqIHRvIGV4aXQgc2xpZGVzaG93IG1vZGUuIFdlIG11c3QgTkVWRVIgY2xvc2UvcmVvcGVuIHRoZSBkaWFsb2cuXHJcbiAqXHJcbiAqIFN0cmF0ZWd5OlxyXG4gKiAtIEZpcnN0IFVSTCBpbiBzbGlkZXNob3cg4oaSIG9wZW4gZGlhbG9nIG5vcm1hbGx5ICh3aXRoIHRoZSBVUkwpXHJcbiAqIC0gU3Vic2VxdWVudCBVUkxzIOKGkiB3cml0ZSB0byBsb2NhbFN0b3JhZ2UsIHZpZXdlciBwaWNrcyBpdCB1cCB2aWEgYHN0b3JhZ2VgIGV2ZW50XHJcbiAqIC0gU2xpZGUgd2l0aCBubyBVUkwg4oaSIHdyaXRlIGVtcHR5IHN0cmluZywgdmlld2VyIHNob3dzIHN0YW5kYnkgKGJsYWNrIHNjcmVlbilcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGF1dG9PcGVuVmlld2VyRm9yU2xpZGUoc2xpZGVJZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoc2xpZGVJZCk7XHJcbiAgZGJnKGBhdXRvT3Blbjogc2xpZGU9JHtzbGlkZUlkfSB1cmw9JHtjb25maWc/LnVybCA/PyAnbm9uZSd9IGF1dG9PcGVuPSR7Y29uZmlnPy5hdXRvT3Blbn0gbGFzdENsb3NlZD0ke2xhc3REaWFsb2dDbG9zZWRTbGlkZUlkfWApO1xyXG4gIGlmICghY29uZmlnPy51cmwgfHwgIWNvbmZpZy5hdXRvT3BlbikgcmV0dXJuO1xyXG5cclxuICAvLyBHdWFyZDogZG9uJ3QgcmUtb3BlbiBkaWFsb2cgZm9yIHRoZSBzYW1lIHNsaWRlIGl0IHdhcyBjbG9zZWQgb25cclxuICBpZiAoc2xpZGVJZCA9PT0gbGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWQpIHtcclxuICAgIGRiZyhgYXV0b09wZW46IFNLSVBQRUQg4oCUIGRpYWxvZyB3YXMgYWxyZWFkeSBjbG9zZWQgZm9yIHNsaWRlICR7c2xpZGVJZH1gKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChzbGlkZXNob3dEaWFsb2dPcGVuZWQgJiYgbGF1bmNoZXIuaXNPcGVuKCkpIHtcclxuICAgIC8vIERpYWxvZyBhbHJlYWR5IG9wZW4g4oCUIHNlbmQgVVJMIHZpYSBtZXNzYWdlQ2hpbGQgKG5vIGNsb3NlL3Jlb3BlbiEpXHJcbiAgICBkYmcoYFNlbmRpbmcgVVJMIHZpYSBtZXNzYWdlQ2hpbGQ6ICR7Y29uZmlnLnVybC5zdWJzdHJpbmcoMCwgNTApfS4uLmApO1xyXG4gICAgY29uc3Qgc2VudCA9IGxhdW5jaGVyLnNlbmRNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHsgYWN0aW9uOiAnbmF2aWdhdGUnLCB1cmw6IGNvbmZpZy51cmwgfSkpO1xyXG4gICAgZGJnKGBtZXNzYWdlQ2hpbGQgcmVzdWx0OiAke3NlbnR9YCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBGaXJzdCB0aW1lIG9wZW5pbmcgZGlhbG9nIGluIHRoaXMgc2xpZGVzaG93IHNlc3Npb25cclxuICBjb25zdCBoaWRlTWV0aG9kID0gZ2V0U2VsZWN0ZWRIaWRlTWV0aG9kKCk7XHJcbiAgdHJ5IHtcclxuICAgIGRiZyhgT3BlbmluZyBkaWFsb2cgKGZpcnN0IHRpbWUpOiAke2NvbmZpZy51cmwuc3Vic3RyaW5nKDAsIDUwKX0uLi4gaGlkZT0ke2hpZGVNZXRob2R9YCk7XHJcbiAgICBhd2FpdCBsYXVuY2hlci5vcGVuKHtcclxuICAgICAgdXJsOiBjb25maWcudXJsLFxyXG4gICAgICB6b29tOiBjb25maWcuem9vbSxcclxuICAgICAgd2lkdGg6IGNvbmZpZy5kaWFsb2dXaWR0aCxcclxuICAgICAgaGVpZ2h0OiBjb25maWcuZGlhbG9nSGVpZ2h0LFxyXG4gICAgICBsYW5nOiBpMThuLmdldExvY2FsZSgpLFxyXG4gICAgICBhdXRvQ2xvc2VTZWM6IGNvbmZpZy5hdXRvQ2xvc2VTZWMsXHJcbiAgICAgIHNsaWRlc2hvdzogdHJ1ZSwgIC8vIFZpZXdlciB3aWxsIHNob3cgc3RhbmRieSBpbnN0ZWFkIG9mIGNsb3Npbmcgb24gdGltZXJcclxuICAgICAgaGlkZU1ldGhvZCxcclxuICAgIH0pO1xyXG4gICAgc2xpZGVzaG93RGlhbG9nT3BlbmVkID0gdHJ1ZTtcclxuICAgIGRiZygnRGlhbG9nIG9wZW5lZCBPSyAoZmlyc3QgdGltZSknKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGRiZyhgRGlhbG9nIG9wZW4gRkFJTEVEOiAke2Vycn1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBQb2xsIHNsaWRlIGNoYW5nZXMgZHVyaW5nIHNsaWRlc2hvdy4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcG9sbFNsaWRlSW5TbGlkZXNob3coKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgaWYgKCFzbGlkZXNob3dBY3RpdmUpIHJldHVybjtcclxuICBpZiAoc2xpZGVQb2xsQnVzeSkge1xyXG4gICAgZGJnKCdwb2xsIFNLSVBQRUQgKGJ1c3kpJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBzbGlkZVBvbGxCdXN5ID0gdHJ1ZTtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2xpZGVJZCA9IGF3YWl0IGdldFNsaWRlc2hvd1NsaWRlSWQoKTtcclxuICAgIGRiZyhgcG9sbCB0aWNrOiBnb3Q9JHtzbGlkZUlkfSBsYXN0PSR7bGFzdFNsaWRlc2hvd1NsaWRlSWR9YCk7XHJcblxyXG4gICAgaWYgKCFzbGlkZUlkKSB7XHJcbiAgICAgIGRiZygncG9sbDogc2xpZGVJZCBpcyBudWxsJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChzbGlkZUlkID09PSBsYXN0U2xpZGVzaG93U2xpZGVJZCkgcmV0dXJuO1xyXG5cclxuICAgIGRiZyhgU0xJREUgQ0hBTkdFRDogJHtsYXN0U2xpZGVzaG93U2xpZGVJZH0g4oaSICR7c2xpZGVJZH1gKTtcclxuICAgIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gc2xpZGVJZDtcclxuICAgIGxhc3REaWFsb2dDbG9zZWRTbGlkZUlkID0gbnVsbDsgIC8vIFJlc2V0OiBhbGxvdyBkaWFsb2cgZm9yIHRoZSBuZXcgc2xpZGVcclxuXHJcbiAgICBjb25zdCBjb25maWcgPSBnZXRTbGlkZUNvbmZpZyhzbGlkZUlkKTtcclxuICAgIGlmIChjb25maWc/LmF1dG9PcGVuICYmIGNvbmZpZy51cmwpIHtcclxuICAgICAgYXdhaXQgYXV0b09wZW5WaWV3ZXJGb3JTbGlkZShzbGlkZUlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFNsaWRlIGhhcyBubyBVUkwgb3IgYXV0b09wZW4gaXMgb2ZmLlxyXG4gICAgICAvLyBEbyBOT1QgY2xvc2UgdGhlIGRpYWxvZyAoaXQgd291bGQgZXhpdCBzbGlkZXNob3cpLlxyXG4gICAgICAvLyBJbnN0ZWFkLCB0ZWxsIHRoZSB2aWV3ZXIgdG8gc2hvdyBzdGFuZGJ5IChibGFjayBzY3JlZW4pLlxyXG4gICAgICBkYmcoYE5vIFVSTCBmb3Igc2xpZGUgJHtzbGlkZUlkfSDigJQgc2VuZGluZyBzdGFuZGJ5YCk7XHJcbiAgICAgIGlmIChzbGlkZXNob3dEaWFsb2dPcGVuZWQgJiYgbGF1bmNoZXIuaXNPcGVuKCkpIHtcclxuICAgICAgICBsYXVuY2hlci5zZW5kTWVzc2FnZShKU09OLnN0cmluZ2lmeSh7IGFjdGlvbjogJ3N0YW5kYnknIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgZGJnKGBwb2xsIEVSUk9SOiAke2Vycn1gKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgc2xpZGVQb2xsQnVzeSA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIENhbGxlZCB3aGVuIHNsaWRlc2hvdyBtb2RlIGlzIGRldGVjdGVkLiAqL1xyXG5hc3luYyBmdW5jdGlvbiBvblNsaWRlc2hvd0VudGVyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHNsaWRlc2hvd0FjdGl2ZSA9IHRydWU7XHJcbiAgbGFzdFNsaWRlc2hvd1NsaWRlSWQgPSBudWxsO1xyXG4gIHNsaWRlUG9sbEJ1c3kgPSBmYWxzZTtcclxuICBkYmcoJ1NMSURFU0hPVyBERVRFQ1RFRCcpO1xyXG5cclxuICAvLyBCdWlsZCBzbGlkZSBpbmRleCBtYXAgQkVGT1JFIHRyeWluZyB0byBnZXQgY3VycmVudCBzbGlkZS5cclxuICAvLyBUaGlzIGlzIG5lZWRlZCBmb3IgdGhlIENvbW1vbiBBUEkgZmFsbGJhY2sgd2hpY2ggcmV0dXJucyBpbmRleCwgbm90IElELlxyXG4gIGF3YWl0IGJ1aWxkU2xpZGVJbmRleE1hcCgpO1xyXG5cclxuICAvLyBJbW1lZGlhdGVseSB0cnkgdG8gb3BlbiB2aWV3ZXIgZm9yIHRoZSBjdXJyZW50IHNsaWRlXHJcbiAgZGJnKCdHZXR0aW5nIGN1cnJlbnQgc2xpZGUuLi4nKTtcclxuICBjb25zdCBzbGlkZUlkID0gYXdhaXQgZ2V0U2xpZGVzaG93U2xpZGVJZCgpO1xyXG4gIGRiZyhgQ3VycmVudCBzbGlkZSByZXN1bHQ6ICR7c2xpZGVJZH1gKTtcclxuXHJcbiAgaWYgKHNsaWRlSWQpIHtcclxuICAgIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gc2xpZGVJZDtcclxuICAgIGF3YWl0IGF1dG9PcGVuVmlld2VyRm9yU2xpZGUoc2xpZGVJZCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRiZygnQ291bGQgbm90IGRldGVybWluZSBjdXJyZW50IHNsaWRlIGluIHNsaWRlc2hvdycpO1xyXG4gIH1cclxuXHJcbiAgLy8gU3RhcnQgcG9sbGluZyBmb3Igc2xpZGUgY2hhbmdlc1xyXG4gIGlmIChzbGlkZVBvbGxUaW1lcikgY2xlYXJJbnRlcnZhbChzbGlkZVBvbGxUaW1lcik7XHJcbiAgc2xpZGVQb2xsVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7IHBvbGxTbGlkZUluU2xpZGVzaG93KCk7IH0sIFNMSURFX1BPTExfSU5URVJWQUxfTVMpO1xyXG4gIGRiZygnU2xpZGUgcG9sbGluZyBzdGFydGVkJyk7XHJcbn1cclxuXHJcbi8qKiBDYWxsZWQgd2hlbiBlZGl0IG1vZGUgaXMgcmVzdG9yZWQuICovXHJcbmZ1bmN0aW9uIG9uU2xpZGVzaG93RXhpdCgpOiB2b2lkIHtcclxuICBzbGlkZXNob3dBY3RpdmUgPSBmYWxzZTtcclxuICBzbGlkZXNob3dEaWFsb2dPcGVuZWQgPSBmYWxzZTtcclxuICBkYmcoJ1NMSURFU0hPVyBFTkRFRCcpO1xyXG4gIGlmIChzbGlkZVBvbGxUaW1lcikge1xyXG4gICAgY2xlYXJJbnRlcnZhbChzbGlkZVBvbGxUaW1lcik7XHJcbiAgICBzbGlkZVBvbGxUaW1lciA9IG51bGw7XHJcbiAgfVxyXG4gIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gbnVsbDtcclxuXHJcbiAgLy8gU2FmZSB0byBjbG9zZSBkaWFsb2cgbm93IOKAlCBzbGlkZXNob3cgYWxyZWFkeSBleGl0ZWRcclxuICBsYXVuY2hlci5jbG9zZSgpO1xyXG59XHJcblxyXG4vKiogUGVyaW9kaWNhbGx5IGNoZWNrIHZpZXcgbW9kZSB0byBkZXRlY3Qgc2xpZGVzaG93IHN0YXJ0L2VuZC4gKi9cclxubGV0IHZpZXdQb2xsQ291bnQgPSAwO1xyXG5hc3luYyBmdW5jdGlvbiBwb2xsVmlld01vZGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdmlld1BvbGxDb3VudCsrO1xyXG4gIGNvbnN0IHZpZXcgPSBhd2FpdCBnZXRBY3RpdmVWaWV3KCk7XHJcbiAgY29uc3QgaXNTbGlkZXNob3cgPSB2aWV3ID09PSAncmVhZCc7XHJcblxyXG4gIC8vIExvZyBldmVyeSA1dGggcG9sbCB0byBzaG93IHBvbGxpbmcgaXMgYWxpdmUsIHBsdXMgZXZlcnkgbW9kZSBjaGFuZ2VcclxuICBpZiAodmlld1BvbGxDb3VudCAlIDUgPT09IDEpIHtcclxuICAgIGRiZyhgcG9sbCAjJHt2aWV3UG9sbENvdW50fTogdmlldz1cIiR7dmlld31cIiBhY3RpdmU9JHtzbGlkZXNob3dBY3RpdmV9YCk7XHJcbiAgfVxyXG5cclxuICBpZiAoaXNTbGlkZXNob3cgJiYgIXNsaWRlc2hvd0FjdGl2ZSkge1xyXG4gICAgYXdhaXQgb25TbGlkZXNob3dFbnRlcigpO1xyXG4gIH0gZWxzZSBpZiAoIWlzU2xpZGVzaG93ICYmIHNsaWRlc2hvd0FjdGl2ZSkge1xyXG4gICAgb25TbGlkZXNob3dFeGl0KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogU3RhcnQgbW9uaXRvcmluZyBmb3Igc2xpZGVzaG93IG1vZGUuICovXHJcbmZ1bmN0aW9uIHN0YXJ0Vmlld01vZGVQb2xsaW5nKCk6IHZvaWQge1xyXG4gIGlmICh2aWV3UG9sbFRpbWVyKSByZXR1cm47XHJcbiAgdmlld1BvbGxUaW1lciA9IHNldEludGVydmFsKCgpID0+IHsgcG9sbFZpZXdNb2RlKCk7IH0sIFZJRVdfUE9MTF9JTlRFUlZBTF9NUyk7XHJcbiAgZGJnKCdWaWV3IG1vZGUgcG9sbGluZyBTVEFSVEVEIChldmVyeSAycyknKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlYnVnOiBoaWRlIGRpYWxvZyB0ZXN0IGNvbnRyb2xzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFJlYWQgdGhlIHNlbGVjdGVkIGhpZGUgbWV0aG9kIGZyb20gZGVidWcgY2hlY2tib3hlcy4gKi9cclxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWRIaWRlTWV0aG9kKCk6ICdub25lJyB8ICdtb3ZlJyB8ICdyZXNpemUnIHtcclxuICBjb25zdCBjaGtNb3ZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RiZy1jaGstbW92ZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG4gIGNvbnN0IGNoa1Jlc2l6ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYmctY2hrLXJlc2l6ZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG4gIGlmIChjaGtNb3ZlPy5jaGVja2VkKSByZXR1cm4gJ21vdmUnO1xyXG4gIGlmIChjaGtSZXNpemU/LmNoZWNrZWQpIHJldHVybiAncmVzaXplJztcclxuICByZXR1cm4gJ25vbmUnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZW5kRGVidWdDb21tYW5kKGFjdGlvbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgaWYgKCFsYXVuY2hlci5pc09wZW4oKSkge1xyXG4gICAgZGJnKGBERUJVRyAke2FjdGlvbn06IGRpYWxvZyBub3Qgb3BlbmApO1xyXG4gICAgY29uc3QgcmVzdWx0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGJnLXJlc3VsdCcpO1xyXG4gICAgaWYgKHJlc3VsdEVsKSByZXN1bHRFbC50ZXh0Q29udGVudCA9ICdEaWFsb2cgbm90IG9wZW4g4oCUIG9wZW4gYSB3ZWIgcGFnZSBmaXJzdCc7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGNvbnN0IHNlbnQgPSBsYXVuY2hlci5zZW5kTWVzc2FnZShKU09OLnN0cmluZ2lmeSh7IGFjdGlvbiB9KSk7XHJcbiAgZGJnKGBERUJVRyAke2FjdGlvbn06IHNlbnQ9JHtzZW50fWApO1xyXG4gIGNvbnN0IHJlc3VsdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RiZy1yZXN1bHQnKTtcclxuICBpZiAocmVzdWx0RWwpIHJlc3VsdEVsLnRleHRDb250ZW50ID0gc2VudCA/IGBTZW50OiAke2FjdGlvbn0uLi5gIDogYEZhaWxlZCB0byBzZW5kICR7YWN0aW9ufWA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXREZWJ1Z0hpZGVDb250cm9scygpOiB2b2lkIHtcclxuICBjb25zdCBjaGtNb3ZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RiZy1jaGstbW92ZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG4gIGNvbnN0IGNoa1Jlc2l6ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYmctY2hrLXJlc2l6ZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG4gIGNvbnN0IGJ0blJlc3RvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGJnLWJ0bi1yZXN0b3JlJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsO1xyXG5cclxuICBjaGtNb3ZlPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICBpZiAoY2hrTW92ZS5jaGVja2VkKSB7XHJcbiAgICAgIHNlbmREZWJ1Z0NvbW1hbmQoJ2hpZGUtbW92ZScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VuZERlYnVnQ29tbWFuZCgncmVzdG9yZScpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBjaGtSZXNpemU/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICAgIGlmIChjaGtSZXNpemUuY2hlY2tlZCkge1xyXG4gICAgICBzZW5kRGVidWdDb21tYW5kKCdoaWRlLXJlc2l6ZScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VuZERlYnVnQ29tbWFuZCgncmVzdG9yZScpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBidG5SZXN0b3JlPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHNlbmREZWJ1Z0NvbW1hbmQoJ3Jlc3RvcmUnKTtcclxuICAgIGlmIChjaGtNb3ZlKSBjaGtNb3ZlLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgIGlmIChjaGtSZXNpemUpIGNoa1Jlc2l6ZS5jaGVja2VkID0gZmFsc2U7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBJbml0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gaW5pdCgpOiB2b2lkIHtcclxuICAvLyBDYWNoZSBET00gcmVmc1xyXG4gIHVybElucHV0ID0gJDxIVE1MSW5wdXRFbGVtZW50PigndXJsLWlucHV0Jyk7XHJcbiAgYnRuQXBwbHkgPSAkPEhUTUxCdXR0b25FbGVtZW50PignYnRuLWFwcGx5Jyk7XHJcbiAgYnRuU2hvdyA9ICQ8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdidG4tc2hvdycpO1xyXG4gIGJ0bkRlZmF1bHRzID0gJDxIVE1MQnV0dG9uRWxlbWVudD4oJ2J0bi1kZWZhdWx0cycpO1xyXG4gIHN0YXR1c0VsID0gJCgnc3RhdHVzJyk7XHJcbiAgc2xpZGVOdW1iZXJFbCA9ICQoJ3NsaWRlLW51bWJlcicpO1xyXG4gIGxhbmdTZWxlY3QgPSAkPEhUTUxTZWxlY3RFbGVtZW50PignbGFuZy1zZWxlY3QnKTtcclxuICBzbGlkZXJXaWR0aCA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ3NsaWRlci13aWR0aCcpO1xyXG4gIHNsaWRlckhlaWdodCA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ3NsaWRlci1oZWlnaHQnKTtcclxuICBzbGlkZXJab29tID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLXpvb20nKTtcclxuICBzbGlkZXJXaWR0aFZhbHVlID0gJCgnc2xpZGVyLXdpZHRoLXZhbHVlJyk7XHJcbiAgc2xpZGVySGVpZ2h0VmFsdWUgPSAkKCdzbGlkZXItaGVpZ2h0LXZhbHVlJyk7XHJcbiAgc2xpZGVyWm9vbVZhbHVlID0gJCgnc2xpZGVyLXpvb20tdmFsdWUnKTtcclxuICBzaXplUHJldmlld0lubmVyID0gJCgnc2l6ZS1wcmV2aWV3LWlubmVyJyk7XHJcbiAgY2hrQXV0b09wZW4gPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdjaGstYXV0by1vcGVuJyk7XHJcbiAgY2hrTG9ja1NpemUgPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdjaGstbG9jay1zaXplJyk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLWF1dG9jbG9zZScpO1xyXG4gIHNsaWRlckF1dG9DbG9zZVZhbHVlID0gJCgnc2xpZGVyLWF1dG9jbG9zZS12YWx1ZScpO1xyXG4gIHByZXNldEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PignLmJ0bi1wcmVzZXQnKTtcclxuICB2aWV3ZXJTdGF0dXNFbCA9ICQoJ3ZpZXdlci1zdGF0dXMnKTtcclxuICB2aWV3ZXJTdGF0dXNUZXh0ID0gJCgndmlld2VyLXN0YXR1cy10ZXh0Jyk7XHJcblxyXG4gIC8vIFJlc3RvcmUgc2F2ZWQgbGFuZ3VhZ2Ugb3IgZGV0ZWN0XHJcbiAgY29uc3Qgc2F2ZWRMYW5nID0gZ2V0TGFuZ3VhZ2UoKTtcclxuICBpZiAoc2F2ZWRMYW5nKSB7XHJcbiAgICBpMThuLnNldExvY2FsZShzYXZlZExhbmcpO1xyXG4gIH1cclxuICBsYW5nU2VsZWN0LnZhbHVlID0gaTE4bi5nZXRMb2NhbGUoKTtcclxuICBhcHBseUkxOG4oKTtcclxuXHJcbiAgLy8gRXZlbnQgbGlzdGVuZXJzXHJcbiAgYnRuQXBwbHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVBcHBseSk7XHJcbiAgYnRuU2hvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNob3cpO1xyXG4gIGJ0bkRlZmF1bHRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlU2V0RGVmYXVsdHMpO1xyXG4gIGxhbmdTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UpO1xyXG4gIHVybElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVVcmxLZXlkb3duKTtcclxuICBzbGlkZXJXaWR0aC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZVdpZHRoSW5wdXQpO1xyXG4gIHNsaWRlckhlaWdodC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZUhlaWdodElucHV0KTtcclxuICBzbGlkZXJab29tLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlWm9vbUlucHV0KTtcclxuICBjaGtMb2NrU2l6ZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVMb2NrU2l6ZUNoYW5nZSk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlQXV0b0Nsb3NlSW5wdXQpO1xyXG4gICQoJ2J0bi1hdXRvb3Blbi1pbmZvJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVBdXRvT3BlbkluZm9Ub2dnbGUpO1xyXG4gICQoJ2J0bi1hdXRvY2xvc2UtaW5mbycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQXV0b0Nsb3NlSW5mb1RvZ2dsZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnpvb20tcHJlc2V0cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVByZXNldENsaWNrKTtcclxuICAkKCdidG4tZ3VpZGUtdG9nZ2xlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVHdWlkZVRvZ2dsZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmd1aWRlLXRhYnMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVHdWlkZVRhYkNsaWNrKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3VpZGUtdGFicycpPy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlR3VpZGVUYWJLZXlkb3duIGFzIEV2ZW50TGlzdGVuZXIpO1xyXG4gICQoJ2d1aWRlLXNlY3Rpb24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUd1aWRlQ29weSk7XHJcblxyXG4gIC8vIERldGVjdCBjdXJyZW50IHNsaWRlICYgbGlzdGVuIGZvciBjaGFuZ2VzIChvbmx5IGluc2lkZSBQb3dlclBvaW50KVxyXG4gIGRldGVjdEN1cnJlbnRTbGlkZSgpO1xyXG4gIGJ1aWxkU2xpZGVJbmRleE1hcCgpO1xyXG5cclxuICB0cnkge1xyXG4gICAgT2ZmaWNlLmNvbnRleHQuZG9jdW1lbnQuYWRkSGFuZGxlckFzeW5jKFxyXG4gICAgICBPZmZpY2UuRXZlbnRUeXBlLkRvY3VtZW50U2VsZWN0aW9uQ2hhbmdlZCxcclxuICAgICAgKCkgPT4geyBkZXRlY3RDdXJyZW50U2xpZGUoKTsgfSxcclxuICAgICk7XHJcbiAgfSBjYXRjaCB7IC8qIG91dHNpZGUgT2ZmaWNlIGhvc3Qg4oCUIHNsaWRlIGRldGVjdGlvbiB1bmF2YWlsYWJsZSAqLyB9XHJcblxyXG4gIC8vIFZpZXdlciBtZXNzYWdlIOKGkiB1cGRhdGUgc3RhdHVzIGluZGljYXRvclxyXG4gIGxhdW5jaGVyLm9uTWVzc2FnZShoYW5kbGVWaWV3ZXJNZXNzYWdlKTtcclxuXHJcbiAgLy8gRGlhbG9nIGNsb3NlZCAodXNlciBjbG9zZWQgd2luZG93IG9yIG5hdmlnYXRpb24gZXJyb3IpIOKGkiB1cGRhdGUgVUlcclxuICBsYXVuY2hlci5vbkNsb3NlZChoYW5kbGVWaWV3ZXJDbG9zZWQpO1xyXG5cclxuICAvLyBTdGFydCBwb2xsaW5nIGZvciBzbGlkZXNob3cgbW9kZS5cclxuICAvLyBUaGUgY29tbWFuZHMgcnVudGltZSAoRnVuY3Rpb25GaWxlKSBtYXkgbm90IHBlcnNpc3QsIHNvIHRoZSB0YXNrcGFuZVxyXG4gIC8vIGhhbmRsZXMgYXV0by1vcGVuIGFzIGEgcmVsaWFibGUgZmFsbGJhY2suXHJcbiAgc3RhcnRWaWV3TW9kZVBvbGxpbmcoKTtcclxuXHJcbiAgLy8g4pSA4pSAIERFQlVHOiBoaWRlIGRpYWxvZyB0ZXN0IGNvbnRyb2xzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG4gIGluaXREZWJ1Z0hpZGVDb250cm9scygpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQm9vdHN0cmFwIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIoKTtcclxuT2ZmaWNlLm9uUmVhZHkoKCkgPT4gaW5pdCgpKTtcclxuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9