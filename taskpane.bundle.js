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
    dbg(`autoOpen: slide=${slideId} url=${config?.url ?? 'none'} autoOpen=${config?.autoOpen}`);
    if (!config?.url || !config.autoOpen)
        return;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3BhbmUuYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUZBQWlGOzs7QUF3RGpGLGtDQUdDO0FBekRELDZFQUE2RTtBQUNoRSxnQ0FBd0IsR0FBRyxlQUFlLENBQUM7QUFFeEQscUNBQXFDO0FBQ3hCLDRCQUFvQixHQUFHLGlCQUFpQixDQUFDO0FBRXRELDJDQUEyQztBQUM5Qiw0QkFBb0IsR0FBRyxpQkFBaUIsQ0FBQztBQUV0RCxpRkFBaUY7QUFFcEUsb0JBQVksR0FBRyxHQUFHLENBQUM7QUFDbkIsNEJBQW9CLEdBQUcsRUFBRSxDQUFDLENBQUcsY0FBYztBQUMzQyw2QkFBcUIsR0FBRyxFQUFFLENBQUMsQ0FBRSxjQUFjO0FBQzNDLHlCQUFpQixHQUFHLElBQUksQ0FBQztBQUV0QyxpRkFBaUY7QUFFcEUsZ0JBQVEsR0FBRyxFQUFFLENBQUM7QUFDZCxnQkFBUSxHQUFHLEdBQUcsQ0FBQztBQUU1QixnRkFBZ0Y7QUFFbkUsOEJBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUcsZUFBZTtBQUM3QywwQkFBa0IsR0FBRyxJQUFJLENBQUM7QUFFdkM7Ozs7R0FJRztBQUNVLHdCQUFnQixHQUFzQjtJQUNqRCw2QkFBNkI7SUFDN0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDaEMsOEJBQThCO0lBQzlCLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7SUFDdEMsZ0NBQWdDO0lBQ2hDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO0lBQ3BDLGdDQUFnQztJQUNoQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO0lBQ2xCLGlDQUFpQztJQUNqQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztJQUN2QixvQ0FBb0M7SUFDcEMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtDQUMxRCxDQUFDO0FBRUYsZ0ZBQWdGO0FBRW5FLGlDQUF5QixHQUFHLENBQUMsQ0FBQztBQUM5QixvQ0FBNEIsR0FBRyxJQUFJLENBQUM7QUFDcEMsOEJBQXNCLEdBQUcsS0FBTSxDQUFDO0FBQ2hDLDhCQUFzQixHQUFHLEVBQUUsQ0FBQztBQUV6QyxnRUFBZ0U7QUFDaEUsU0FBZ0IsV0FBVyxDQUFDLEdBQVc7SUFDckMsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLDhCQUFzQjtRQUFFLE9BQU8sR0FBRyxDQUFDO0lBQ3JELE9BQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsOEJBQXNCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ2pFLENBQUM7QUFFRCxnRkFBZ0Y7QUFFaEY7OztHQUdHO0FBQ1UsYUFBSyxHQUNoQixPQUFPLE9BQU8sS0FBSyxXQUFXLElBQUksT0FBTyxPQUFPLENBQUMsR0FBRyxLQUFLLFdBQVc7SUFDbEUsQ0FBQyxDQUFDLGFBQW9CLEtBQUssWUFBWTtJQUN2QyxDQUFDLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ09YLDRDQUVDO0FBTUQsd0NBRUM7QUF2RkQseUVBQW1EO0FBQ25ELCtFQUE4QztBQUU5QyxnRkFBZ0Y7QUFFaEYsb0RBQW9EO0FBQ3ZDLG1CQUFXLEdBQUcsYUFBYSxDQUFDO0FBRXpDLDZDQUE2QztBQUM3QyxNQUFNLFFBQVEsR0FBRztJQUNmLG1EQUFtRDtJQUNuRCxjQUFjLEVBQUUsS0FBSztJQUNyQix3REFBd0Q7SUFDeEQsYUFBYSxFQUFFLEtBQUs7Q0FDWixDQUFDO0FBZVgsb0RBQW9EO0FBQ3BELE1BQWEsV0FBWSxTQUFRLEtBQUs7SUFDcEMsWUFDa0IsT0FBdUIsRUFDdkIsVUFBbUI7UUFFbkMsS0FBSyxDQUFDLFdBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUhQLFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBQ3ZCLGVBQVUsR0FBVixVQUFVLENBQVM7UUFHbkMsSUFBSSxDQUFDLElBQUksR0FBRyxhQUFhLENBQUM7SUFDNUIsQ0FBQztDQUNGO0FBUkQsa0NBUUM7QUE4QkQsZ0ZBQWdGO0FBRWhGLElBQUksWUFBWSxHQUFxQixJQUFJLENBQUM7QUFDMUMsSUFBSSxnQkFBZ0IsR0FBa0IsSUFBSSxDQUFDO0FBRTNDOzs7R0FHRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEdBQXFCO0lBQ3BELFlBQVksR0FBRyxHQUFHLENBQUM7QUFDckIsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxHQUFrQjtJQUMvQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7QUFDekIsQ0FBQztBQUVELFNBQVMsTUFBTTtJQUNiLElBQUksWUFBWTtRQUFFLE9BQU8sWUFBWSxDQUFDO0lBQ3RDLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUEwQixDQUFDO0FBQ25ELENBQUM7QUFFRCxTQUFTLGdCQUFnQjtJQUN2QixJQUFJLGdCQUFnQjtRQUFFLE9BQU8sZ0JBQWdCLENBQUM7SUFDOUMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3RCxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLG1CQUFXLEVBQUUsQ0FBQztBQUMxRCxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLE1BQWEsY0FBYztJQUEzQjtRQUNVLFdBQU0sR0FBd0IsSUFBSSxDQUFDO1FBQ25DLG9CQUFlLEdBQXVDLElBQUksQ0FBQztRQUMzRCxtQkFBYyxHQUF3QixJQUFJLENBQUM7SUEyS3JELENBQUM7SUF6S0MsdURBQXVEO0lBQy9DLGNBQWMsQ0FBQyxNQUFvQjtRQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQWUsQ0FBQztZQUNqQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUc7WUFDZixJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDekIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1NBQ2xCLENBQUMsQ0FBQztRQUNILElBQUksTUFBTSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBQ0QsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUNELElBQUksTUFBTSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsVUFBVSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsT0FBTyxHQUFHLGdCQUFnQixFQUFFLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7SUFDdEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQW9CO1FBQzdCLDBEQUEwRDtRQUMxRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQixxQkFBUSxFQUFDLGtEQUFrRCxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVELG9EQUFvRDtRQUNwRCxNQUFNLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLE9BQU8sR0FBRyxDQUFDLGtCQUFrQixLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3pELE1BQU0sSUFBSSxXQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU5QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxPQUFPLENBQ2IsR0FBYyxFQUNkLFNBQWlCLEVBQ2pCLE1BQW9CLEVBQ3BCLE9BQWdCO1FBRWhCLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDM0MsR0FBRyxDQUFDLGtCQUFrQixDQUNwQixTQUFTLEVBQ1Q7Z0JBQ0UsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO2dCQUNuQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07Z0JBQ3JCLGVBQWUsRUFBRSxLQUFLO2dCQUN0QixnQkFBZ0IsRUFBRSxLQUFLO2FBQ3hCLEVBQ0QsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDVCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQy9CLGdFQUFnRTtvQkFDaEUsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsY0FBYyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQzlELHFCQUFRLEVBQUMsbURBQW1ELENBQUMsQ0FBQzt3QkFDOUQsVUFBVSxDQUFDLEdBQUcsRUFBRTs0QkFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ25FLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDUixPQUFPO29CQUNULENBQUM7b0JBQ0QscUJBQVEsRUFBQyw0QkFBNEIsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNoRixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzdDLE9BQU87Z0JBQ1QsQ0FBQztnQkFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBRTNCLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUN6Qix1QkFBdUIsRUFDdkIsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQ2pDLENBQUM7Z0JBRUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQ3pCLHFCQUFxQixFQUNyQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FDL0IsQ0FBQztnQkFFRixxQkFBUSxFQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBQ3ZDLE9BQU8sRUFBRSxDQUFDO1lBQ1osQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCx3RUFBd0U7SUFDeEUsS0FBSztRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFDekIsSUFBSSxDQUFDO1lBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLHFCQUFRLEVBQUMsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsT0FBZTtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMvQixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDbkQscUJBQVEsRUFBQyxtREFBbUQsQ0FBQyxDQUFDO1lBQzlELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELElBQUksQ0FBQztZQUNILElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDYixxQkFBUSxFQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFRCw0Q0FBNEM7SUFDNUMsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUVELHdGQUF3RjtJQUN4RixTQUFTLENBQUMsUUFBbUM7UUFDM0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7SUFDbEMsQ0FBQztJQUVELDBFQUEwRTtJQUMxRSxRQUFRLENBQUMsUUFBb0I7UUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7SUFDakMsQ0FBQztJQUVELDRFQUE0RTtJQUVwRSxhQUFhLENBQUMsR0FBeUI7UUFDN0MsSUFBSSxHQUFHLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQyxDQUFDO0lBQ0gsQ0FBQztJQUVPLFdBQVcsQ0FBQyxHQUF1QjtRQUN6QyxvRUFBb0U7UUFDcEUsMkRBQTJEO1FBQzNELHFCQUFRLEVBQUMsOEJBQThCLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztJQUVPLFlBQVksQ0FBQyxJQUFZO1FBQy9CLFFBQVEsSUFBSSxFQUFFLENBQUM7WUFDYixLQUFLLFFBQVEsQ0FBQyxjQUFjO2dCQUMxQixPQUFPLElBQUksV0FBVyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BELEtBQUssUUFBUSxDQUFDLGFBQWE7Z0JBQ3pCLE9BQU8sSUFBSSxXQUFXLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hEO2dCQUNFLE9BQU8sSUFBSSxXQUFXLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pELENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUE5S0Qsd0NBOEtDOzs7Ozs7Ozs7Ozs7Ozs7OztBQzlRRCxrQ0FZQztBQWxCRCxtSEFBK0M7QUFLL0Msd0RBQXdEO0FBQ3hELFNBQWdCLFdBQVcsQ0FBQyxPQUFlO0lBQ3pDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNsQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDdEMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3RDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUN0QyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDdEMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3RDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUN0QyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDdEMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3RDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUN0QyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxNQUFNLElBQUk7SUFJUjtRQUZpQixjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWMsQ0FBQztRQUdqRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRU8sWUFBWTtRQUNsQixJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVc7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNsRCxPQUFPLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCx5RkFBeUY7SUFDekYsQ0FBQyxDQUFDLEdBQW1CO1FBQ25CLE9BQU8sQ0FDTCxzQkFBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDN0Isc0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDdEIsR0FBRyxDQUNKLENBQUM7SUFDSixDQUFDO0lBRUQsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBRUQsbUJBQW1CO1FBQ2pCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQsOENBQThDO0lBQzlDLFNBQVMsQ0FBQyxNQUFjO1FBQ3RCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNO1lBQUUsT0FBTztRQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsY0FBYyxDQUFDLFFBQW9CO1FBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdCLE9BQU8sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQztDQUNGO0FBRUQsd0RBQXdEO0FBQzNDLFlBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7O0FDN0QvQiw0QkFFQztBQUdELDBCQUVDO0FBR0QsNEJBRUM7QUFRRCw0RUFLQztBQWhDRCx3RkFBb0M7QUFFcEMsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDO0FBRTFCLCtCQUErQjtBQUUvQixtREFBbUQ7QUFDbkQsU0FBZ0IsUUFBUSxDQUFDLEdBQUcsSUFBZTtJQUN6QyxJQUFJLGlCQUFLO1FBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBRUQsaURBQWlEO0FBQ2pELFNBQWdCLE9BQU8sQ0FBQyxHQUFHLElBQWU7SUFDeEMsSUFBSSxpQkFBSztRQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVELCtDQUErQztBQUMvQyxTQUFnQixRQUFRLENBQUMsR0FBRyxJQUFlO0lBQ3pDLElBQUksaUJBQUs7UUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFFRCw4QkFBOEI7QUFFOUI7OztHQUdHO0FBQ0gsU0FBZ0IsZ0NBQWdDO0lBQzlDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEtBQTRCLEVBQUUsRUFBRTtRQUM3RSxRQUFRLENBQUMsOEJBQThCLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7Ozs7Ozs7Ozs7Ozs7QUNlRCxvREFFQztBQXFFRCx3Q0FHQztBQUdELHdDQUlDO0FBR0QsOENBSUM7QUFLRCxrQ0FFQztBQUdELGtDQUlDO0FBS0Qsa0NBVUM7QUFHRCxrQ0FJQztBQTFLRCx3RkFXcUI7QUFDckIsK0VBQThDO0FBMEI5QyxnRkFBZ0Y7QUFFaEYsSUFBSSxjQUFjLEdBQXlCLElBQUksQ0FBQztBQUVoRDs7O0dBR0c7QUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxLQUEyQjtJQUM5RCxjQUFjLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLENBQUM7QUFFRCxpRkFBaUY7QUFDakYsTUFBTSxZQUFZLEdBQWtCLENBQUMsR0FBRyxFQUFFO0lBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO0lBQ3hDLE9BQU87UUFDTCxHQUFHLEVBQUUsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSTtRQUM3QyxHQUFHLEVBQUUsQ0FBQyxJQUFZLEVBQUUsS0FBYyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakUsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRCxTQUFTLEVBQUUsQ0FBQyxFQUEyQixFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMxRixDQUFDO0FBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUVMLFNBQVMsUUFBUTtJQUNmLElBQUksY0FBYztRQUFFLE9BQU8sY0FBYyxDQUFDO0lBQzFDLG1CQUFtQjtJQUNuQixJQUFJLENBQUM7UUFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUM7UUFDcEQsSUFBSSxRQUFRO1lBQUUsT0FBTyxRQUFvQyxDQUFDO0lBQzVELENBQUM7SUFBQyxNQUFNLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUM7QUFFRCxpRkFBaUY7QUFFakYsU0FBUyxRQUFRLENBQUMsT0FBZTtJQUMvQixPQUFPLEdBQUcsb0NBQXdCLEdBQUcsT0FBTyxFQUFFLENBQUM7QUFDakQsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFDLEtBQW9CO0lBQ3BDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3pCLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxJQUFJLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUNyRSxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxFQUFFLENBQUM7WUFDWixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFTLEtBQUssQ0FBQyxFQUFVO0lBQ3ZCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzRCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsS0FBSyxVQUFVLElBQUksQ0FBQyxLQUFvQjtJQUN0QyxLQUFLLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLElBQUkscUNBQXlCLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN0RSxJQUFJLENBQUM7WUFDSCxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QixPQUFPO1FBQ1QsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDYixJQUFJLE9BQU8sR0FBRyxxQ0FBeUIsRUFBRSxDQUFDO2dCQUN4QyxxQkFBUSxFQUFDLHlCQUF5QixPQUFPLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNyRSxNQUFNLEtBQUssQ0FBQyx3Q0FBNEIsQ0FBQyxDQUFDO1lBQzVDLENBQUM7aUJBQU0sQ0FBQztnQkFDTixxQkFBUSxFQUFDLHlDQUF5QyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLEdBQUcsQ0FBQztZQUNaLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxpRkFBaUY7QUFFakYsa0VBQWtFO0FBQ2xFLFNBQWdCLGNBQWMsQ0FBQyxPQUFlO0lBQzVDLE1BQU0sR0FBRyxHQUFHLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM5QyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUUsR0FBeUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2pELENBQUM7QUFFRCx5REFBeUQ7QUFDbEQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxPQUFlLEVBQUUsTUFBeUI7SUFDN0UsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7SUFDekIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDckMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEIsQ0FBQztBQUVELDRDQUE0QztBQUNyQyxLQUFLLFVBQVUsaUJBQWlCLENBQUMsT0FBZTtJQUNyRCxNQUFNLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztJQUN6QixLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFFRCxpRkFBaUY7QUFFakYsMkRBQTJEO0FBQzNELFNBQWdCLFdBQVc7SUFDekIsT0FBUSxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsZ0NBQW9CLENBQVksSUFBSSxJQUFJLENBQUM7QUFDbEUsQ0FBQztBQUVELHNEQUFzRDtBQUMvQyxLQUFLLFVBQVUsV0FBVyxDQUFDLE1BQWM7SUFDOUMsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7SUFDekIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQ0FBb0IsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN4QyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBRUQsaUZBQWlGO0FBRWpGLHNFQUFzRTtBQUN0RSxTQUFnQixXQUFXO0lBQ3pCLE1BQU0sTUFBTSxHQUFHLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxnQ0FBb0IsQ0FBNkIsQ0FBQztJQUNoRixPQUFPLE1BQU0sSUFBSTtRQUNmLEdBQUcsRUFBRSxFQUFFO1FBQ1AsSUFBSSxFQUFFLHdCQUFZO1FBQ2xCLFdBQVcsRUFBRSxnQ0FBb0I7UUFDakMsWUFBWSxFQUFFLGlDQUFxQjtRQUNuQyxRQUFRLEVBQUUsNkJBQWlCO1FBQzNCLFlBQVksRUFBRSxrQ0FBc0I7S0FDckMsQ0FBQztBQUNKLENBQUM7QUFFRCxzREFBc0Q7QUFDL0MsS0FBSyxVQUFVLFdBQVcsQ0FBQyxNQUF5QjtJQUN6RCxNQUFNLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztJQUN6QixLQUFLLENBQUMsR0FBRyxDQUFDLGdDQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDM0tEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDNUJBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7Ozs7Ozs7Ozs7O0FDTkEsaUZBQXdFO0FBQ3hFLDZGQUF3SDtBQUN4SCxrSEFBd0U7QUFDeEUsdUZBQXdGO0FBQ3hGLGdHQUFvRTtBQUVwRSxnRkFBZ0Y7QUFFaEYsTUFBTSxDQUFDLEdBQUcsQ0FBd0IsRUFBVSxFQUFLLEVBQUUsQ0FDakQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQU0sQ0FBQztBQUVuQyxJQUFJLFFBQTBCLENBQUM7QUFDL0IsSUFBSSxRQUEyQixDQUFDO0FBQ2hDLElBQUksT0FBMEIsQ0FBQztBQUMvQixJQUFJLFdBQStCLENBQUM7QUFDcEMsSUFBSSxRQUFxQixDQUFDO0FBQzFCLElBQUksYUFBMEIsQ0FBQztBQUMvQixJQUFJLFVBQTZCLENBQUM7QUFDbEMsSUFBSSxXQUE4QixDQUFDO0FBQ25DLElBQUksWUFBK0IsQ0FBQztBQUNwQyxJQUFJLFVBQTZCLENBQUM7QUFDbEMsSUFBSSxnQkFBOEIsQ0FBQztBQUNuQyxJQUFJLGlCQUErQixDQUFDO0FBQ3BDLElBQUksZUFBNkIsQ0FBQztBQUNsQyxJQUFJLGdCQUE4QixDQUFDO0FBQ25DLElBQUksV0FBOEIsQ0FBQztBQUNuQyxJQUFJLFdBQThCLENBQUM7QUFDbkMsSUFBSSxlQUFrQyxDQUFDO0FBQ3ZDLElBQUksb0JBQWtDLENBQUM7QUFDdkMsSUFBSSxhQUE2QyxDQUFDO0FBQ2xELElBQUksY0FBNEIsQ0FBQztBQUNqQyxJQUFJLGdCQUE4QixDQUFDO0FBRW5DLGdGQUFnRjtBQUVoRixJQUFJLGNBQWMsR0FBa0IsSUFBSSxDQUFDO0FBQ3pDLElBQUksaUJBQWlCLEdBQWtCLElBQUksQ0FBQztBQUM1QyxNQUFNLFFBQVEsR0FBRyxJQUFJLGdDQUFjLEVBQUUsQ0FBQztBQUN0QyxJQUFJLGlCQUFpQixHQUF5QyxJQUFJLENBQUM7QUFFbkUsZ0ZBQWdGO0FBRWhGLFNBQVMsU0FBUztJQUNoQixRQUFRLENBQUMsZ0JBQWdCLENBQWMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7UUFDbkUsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFzQixDQUFDO1FBQzlDLEVBQUUsQ0FBQyxXQUFXLEdBQUcsV0FBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBbUIseUJBQXlCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtRQUNwRixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWlDLENBQUM7UUFDekQsRUFBRSxDQUFDLFdBQVcsR0FBRyxXQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGdCQUFnQixDQUFjLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7UUFDekUsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUEyQixDQUFDO1FBQ25ELEVBQUUsQ0FBQyxLQUFLLEdBQUcsV0FBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQztJQUVILGtEQUFrRDtJQUNsRCxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRyxXQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFFakQsMEVBQTBFO0lBQzFFLG9FQUFvRTtJQUNwRSxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzlELElBQUksWUFBWSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM5RCxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsU0FBUyxDQUFDLFdBQVcsR0FBRyxXQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbkQsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLEtBQUssVUFBVSxrQkFBa0I7SUFDL0IsSUFBSSxDQUFDO1FBQ0gsTUFBTSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDeEQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QixNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVyQixJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM1QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixjQUFjLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFFMUIsMEJBQTBCO2dCQUMxQixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDOUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXJCLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFDekIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ2hELElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssY0FBYyxFQUFFLENBQUM7d0JBQzdDLGlCQUFpQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzFCLE1BQU07b0JBQ1IsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDdEIsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFFRCxhQUFhLEVBQUUsQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBUyxpQkFBaUI7SUFDeEIsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLDZDQUE2QztJQUM3QyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7SUFDckQsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0FBQ3hELENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUFDLEdBQVc7SUFDdkMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUFFLE9BQU8sV0FBSSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM3QyxJQUFJLEdBQUcsR0FBRyxFQUFFO1FBQUUsT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQy9CLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDbkIsSUFBSSxHQUFHLElBQUksSUFBSTtRQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3JELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDM0MsQ0FBQztBQUVELG9EQUFvRDtBQUNwRCxTQUFTLG9CQUFvQixDQUFDLEdBQVc7SUFDdkMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLDRCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2pELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyw0QkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDakYsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNYLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsNERBQTREO0FBQzVELFNBQVMsbUJBQW1CO0lBQzFCLE9BQU8sNEJBQWdCLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5RCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsS0FBYSxFQUFFLE1BQWMsRUFBRSxJQUFZLEVBQUUsUUFBaUIsRUFBRSxZQUFvQjtJQUN2RyxXQUFXLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQyxZQUFZLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxVQUFVLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxnQkFBZ0IsQ0FBQyxXQUFXLEdBQUcsR0FBRyxLQUFLLEdBQUcsQ0FBQztJQUMzQyxpQkFBaUIsQ0FBQyxXQUFXLEdBQUcsR0FBRyxNQUFNLEdBQUcsQ0FBQztJQUM3QyxlQUFlLENBQUMsV0FBVyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDekMsV0FBVyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7SUFDL0IsZUFBZSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUNuRSxvQkFBb0IsQ0FBQyxXQUFXLEdBQUcsb0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEUsaUJBQWlCLEVBQUUsQ0FBQztJQUNwQixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxJQUFZO0lBQ3RDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUM1QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDM0QsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxhQUFhO0lBQ3BCLGFBQWEsQ0FBQyxXQUFXLEdBQUcsaUJBQWlCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBRXhGLE1BQU0sUUFBUSxHQUFHLDBCQUFXLEdBQUUsQ0FBQztJQUUvQixJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ25CLE1BQU0sTUFBTSxHQUFHLDZCQUFjLEVBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUMsUUFBUSxDQUFDLEtBQUssR0FBRyxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUNuQyxXQUFXLENBQ1QsTUFBTSxFQUFFLFdBQVcsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUMzQyxNQUFNLEVBQUUsWUFBWSxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQzdDLE1BQU0sRUFBRSxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksRUFDN0IsTUFBTSxFQUFFLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUNyQyxNQUFNLEVBQUUsWUFBWSxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQzlDLENBQUM7SUFDSixDQUFDO1NBQU0sQ0FBQztRQUNOLFFBQVEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwSCxDQUFDO0lBRUQscUJBQXFCLEVBQUUsQ0FBQztBQUMxQixDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGOzs7R0FHRztBQUNILFNBQVMsWUFBWSxDQUFDLEtBQWE7SUFDakMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzdCLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTyxPQUFPLENBQUM7SUFDN0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNuQyxPQUFPLFdBQVcsT0FBTyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUNELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxLQUFhO0lBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDaEMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLENBQUMsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQztJQUMzRCxDQUFDO0lBQUMsTUFBTSxDQUFDO1FBQ1AsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0FBQ0gsQ0FBQztBQUVELGdGQUFnRjtBQUVoRixTQUFTLFVBQVUsQ0FBQyxHQUFtQixFQUFFLElBQXlCO0lBQ2hFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsV0FBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQyxRQUFRLENBQUMsU0FBUyxHQUFHLGlCQUFpQixJQUFJLEVBQUUsQ0FBQztJQUM3QyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBRXhCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWCxDQUFDO0FBRUQsNEVBQTRFO0FBRTVFLGdGQUFnRjtBQUNoRixTQUFTLHFCQUFxQjtJQUM1QixNQUFNLE1BQU0sR0FBRyxjQUFjO1FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsNkJBQWMsRUFBQyxjQUFjLENBQUMsRUFBRSxHQUFHO1FBQ3ZDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDVixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTTtRQUNwQixDQUFDLENBQUMsMkJBQVcsRUFBQyw2QkFBYyxFQUFDLGNBQWUsQ0FBRSxDQUFDLEdBQUcsQ0FBQztRQUNuRCxDQUFDLENBQUMsV0FBSSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLEtBQUssVUFBVSxXQUFXO0lBQ3hCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNwQixVQUFVLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLE9BQU87SUFDVCxDQUFDO0lBRUQsNEJBQTRCO0lBQzVCLElBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsSUFBSSxHQUFHLEtBQUssUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN6QyxRQUFRLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNyQixVQUFVLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDckIsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakIsT0FBTztJQUNULENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLDZCQUFjLEVBQUMsY0FBYyxFQUFFO1lBQ25DLEdBQUc7WUFDSCxJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDOUIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1lBQ3RDLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUN4QyxRQUFRLEVBQUUsV0FBVyxDQUFDLE9BQU87WUFDN0IsWUFBWSxFQUFFLG1CQUFtQixFQUFFO1NBQ3BDLENBQUMsQ0FBQztRQUVILFVBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakMscUJBQXFCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLHFCQUFRLEVBQUMsOEJBQThCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUMsVUFBVSxDQUFDLHlCQUF5QixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUM7QUFDSCxDQUFDO0FBRUQsK0VBQStFO0FBRS9FLEtBQUssVUFBVSxpQkFBaUI7SUFDOUIsSUFBSSxDQUFDO1FBQ0gsTUFBTSwwQkFBVyxFQUFDO1lBQ2hCLEdBQUcsRUFBRSxFQUFFO1lBQ1AsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQzlCLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUN0QyxZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDeEMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPO1lBQzdCLFlBQVksRUFBRSxtQkFBbUIsRUFBRTtTQUNwQyxDQUFDLENBQUM7UUFDSCxVQUFVLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IscUJBQVEsRUFBQywwQkFBMEIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMxQyxVQUFVLENBQUMseUJBQXlCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztBQUNILENBQUM7QUFFRCwrRUFBK0U7QUFFL0UsU0FBUyxnQkFBZ0I7SUFDdkIsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDO0lBQ3ZELElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLFlBQVksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUN2QyxpQkFBaUIsQ0FBQyxXQUFXLEdBQUcsR0FBRyxZQUFZLENBQUMsS0FBSyxHQUFHLENBQUM7SUFDM0QsQ0FBQztJQUNELGlCQUFpQixFQUFFLENBQUM7QUFDdEIsQ0FBQztBQUVELFNBQVMsaUJBQWlCO0lBQ3hCLGlCQUFpQixDQUFDLFdBQVcsR0FBRyxHQUFHLFlBQVksQ0FBQyxLQUFLLEdBQUcsQ0FBQztJQUN6RCxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QixXQUFXLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFDdkMsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDO0lBQ3pELENBQUM7SUFDRCxpQkFBaUIsRUFBRSxDQUFDO0FBQ3RCLENBQUM7QUFFRCxTQUFTLGVBQWU7SUFDdEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxlQUFlLENBQUMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDeEMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsQ0FBUTtJQUNqQyxNQUFNLEdBQUcsR0FBSSxDQUFDLENBQUMsTUFBc0IsQ0FBQyxPQUFPLENBQW9CLGFBQWEsQ0FBQyxDQUFDO0lBQ2hGLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLElBQUk7UUFBRSxPQUFPO0lBQy9CLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLGVBQWUsQ0FBQyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUN4QyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRUQsU0FBUyxvQkFBb0I7SUFDM0IsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEIsdUJBQXVCO1FBQ3ZCLFlBQVksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUN2QyxpQkFBaUIsQ0FBQyxXQUFXLEdBQUcsR0FBRyxZQUFZLENBQUMsS0FBSyxHQUFHLENBQUM7UUFDekQsaUJBQWlCLEVBQUUsQ0FBQztJQUN0QixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsb0JBQW9CO0lBQzNCLG9CQUFvQixDQUFDLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7QUFDakYsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsTUFBYyxFQUFFLEtBQWE7SUFDckQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3QyxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHO1FBQUUsT0FBTztJQUMxQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDcEIsR0FBRyxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUVELFNBQVMsd0JBQXdCO0lBQy9CLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFFRCxTQUFTLHlCQUF5QjtJQUNoQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFNRCxTQUFTLGVBQWUsQ0FBQyxLQUFrQjtJQUN6QyxNQUFNLE1BQU0sR0FBd0M7UUFDbEQsT0FBTyxFQUFFLGVBQWU7UUFDeEIsTUFBTSxFQUFFLGNBQWM7UUFDdEIsT0FBTyxFQUFFLGVBQWU7UUFDeEIsS0FBSyxFQUFFLGFBQWE7S0FDckIsQ0FBQztJQUVGLGNBQWMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQzlCLGNBQWMsQ0FBQyxTQUFTLEdBQUcsZ0NBQWdDLEtBQUssRUFBRSxDQUFDO0lBQ25FLGdCQUFnQixDQUFDLFdBQVcsR0FBRyxXQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRXJELHVFQUF1RTtJQUN2RSxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDdEIsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDaEMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUN2QixpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2xDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQy9CLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNYLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0I7SUFDdkIsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ3RCLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2hDLGlCQUFpQixHQUFHLElBQUksQ0FBQztJQUMzQixDQUFDO0lBQ0QsY0FBYyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDL0IsQ0FBQztBQUVELG1FQUFtRTtBQUNuRSxTQUFTLG1CQUFtQixDQUFDLFVBQWtCO0lBQzdDLElBQUksQ0FBQztRQUNILE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFtRCxDQUFDO1FBRXJGLFFBQVEsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pCLEtBQUssT0FBTztnQkFDVixlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzNCLE1BQU07WUFDUixLQUFLLFFBQVE7Z0JBQ1gsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMxQix3RUFBd0U7Z0JBQ3hFLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDcEgsR0FBRyxDQUFDLGlCQUFpQixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDaEMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxRQUFRO3dCQUFFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztnQkFDL0MsQ0FBQztnQkFDRCxNQUFNO1lBQ1IsS0FBSyxTQUFTO2dCQUNaLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDM0IsTUFBTTtZQUNSLEtBQUssT0FBTztnQkFDVixlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pCLE1BQU07WUFDUixLQUFLLE9BQU87Z0JBQ1YsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNqQixPQUFPLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDekIsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDbkIsTUFBTTtRQUNWLENBQUM7SUFDSCxDQUFDO0lBQUMsTUFBTSxDQUFDO1FBQ1AsNEJBQTRCO0lBQzlCLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxrQkFBa0I7SUFDekIsT0FBTyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDekIsdUNBQXVDO0lBQ3ZDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQzlCLGNBQWMsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO0lBQzNDLGdCQUFnQixDQUFDLFdBQVcsR0FBRyxXQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRXRELElBQUksaUJBQWlCO1FBQUUsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdkQsaUJBQWlCLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNsQyxjQUFjLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUMvQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWCxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLEtBQUssVUFBVSxVQUFVO0lBQ3ZCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNwQixVQUFVLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLE9BQU87SUFDVCxDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsNkJBQWMsRUFBQyxjQUFjLENBQUMsQ0FBQztJQUU5QyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzNCLFVBQVUsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckMsT0FBTztJQUNULENBQUM7SUFFRCwrQkFBK0I7SUFDL0IsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUQsVUFBVSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsQyxPQUFPO0lBQ1QsQ0FBQztJQUVELE9BQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUzQixJQUFJLENBQUM7UUFDSCxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDbEIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO1lBQ2YsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLEtBQUssRUFBRSxNQUFNLENBQUMsV0FBVztZQUN6QixNQUFNLEVBQUUsTUFBTSxDQUFDLFlBQVk7WUFDM0IsSUFBSSxFQUFFLFdBQUksQ0FBQyxTQUFTLEVBQUU7WUFDdEIsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO1NBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDekIsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQixJQUFJLEdBQUcsWUFBWSw2QkFBVyxFQUFFLENBQUM7WUFDL0IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkMsQ0FBQzthQUFNLENBQUM7WUFDTixVQUFVLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELDJFQUEyRTtBQUUzRSxNQUFNLFFBQVEsR0FBMkI7SUFDdkMsS0FBSyxFQUFFLHlEQUF5RDtJQUNoRSxNQUFNLEVBQUUsc0ZBQXNGO0lBQzlGLE9BQU8sRUFBRSx5SkFBeUo7SUFDbEssSUFBSSxFQUFFLGdGQUFnRjtDQUN2RixDQUFDO0FBRUYsU0FBUyxpQkFBaUI7SUFDeEIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDaEMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLFFBQVEsQ0FBQztJQUMzQixNQUFNLENBQUMsV0FBVyxHQUFHLFdBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM1RSxNQUFNLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFhO0lBQ3JDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBb0IsaUNBQWlDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUM1RixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUM7UUFDNUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxNQUFNO1lBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGdCQUFnQixDQUFjLG1DQUFtQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDeEYsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUM7SUFDNUMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxDQUFRO0lBQ25DLE1BQU0sR0FBRyxHQUFJLENBQUMsQ0FBQyxNQUFzQixDQUFDLE9BQU8sQ0FBb0Isa0JBQWtCLENBQUMsQ0FBQztJQUNyRixJQUFJLENBQUMsR0FBRztRQUFFLE9BQU87SUFDakIsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFTLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxDQUFnQjtJQUM3QyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUNyQixRQUFRLENBQUMsZ0JBQWdCLENBQW9CLGlDQUFpQyxDQUFDLENBQ2hGLENBQUM7SUFDRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDO0lBQ2xGLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWQsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLFlBQVk7UUFBRSxJQUFJLEdBQUcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUMxRCxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssV0FBVztRQUFFLElBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDNUUsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE1BQU07UUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1NBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxLQUFLO1FBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztRQUM1QyxPQUFPO0lBRVosQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ25CLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUyxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUVELEtBQUssVUFBVSxlQUFlLENBQUMsQ0FBUTtJQUNyQyxNQUFNLEdBQUcsR0FBSSxDQUFDLENBQUMsTUFBc0IsQ0FBQyxPQUFPLENBQW9CLHFCQUFxQixDQUFDLENBQUM7SUFDeEYsSUFBSSxDQUFDLEdBQUc7UUFBRSxPQUFPO0lBRWpCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBWSxDQUFDO0lBQ3JDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU87SUFFbEIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxHQUFHLENBQUMsV0FBVyxHQUFHLFdBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN0QyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2QsR0FBRyxDQUFDLFdBQVcsR0FBRyxXQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDM0MsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLDBDQUEwQztRQUMxQyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDaEQsTUFBTSxJQUFJLEdBQUcsS0FBSyxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3JDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbEMsR0FBRyxFQUFFLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLEdBQUcsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLEtBQUssVUFBVSxvQkFBb0I7SUFDakMsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQWUsQ0FBQztJQUMxQyxXQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZCLFNBQVMsRUFBRSxDQUFDO0lBRVosSUFBSSxDQUFDO1FBQ0gsTUFBTSwwQkFBVyxFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFBQyxNQUFNLENBQUM7UUFDUCxvQ0FBb0M7SUFDdEMsQ0FBQztBQUNILENBQUM7QUFFRCxnRkFBZ0Y7QUFFaEYsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFnQjtJQUN4QyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25CLFdBQVcsRUFBRSxDQUFDO0lBQ2hCLENBQUM7QUFDSCxDQUFDO0FBRUQsK0VBQStFO0FBRS9FLElBQUksVUFBVSxHQUF1QixJQUFJLENBQUM7QUFDMUMsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO0FBRXZCLFNBQVMsR0FBRyxDQUFDLEdBQVc7SUFDdEIscUJBQVEsRUFBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDNUIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hCLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFDRCxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQ2YsY0FBYyxFQUFFLENBQUM7UUFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNwRSxVQUFVLENBQUMsV0FBVyxJQUFJLEtBQUssY0FBYyxNQUFNLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNsRSxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7SUFDakQsQ0FBQztBQUNILENBQUM7QUFFRCwrRUFBK0U7QUFDL0UsRUFBRTtBQUNGLDhFQUE4RTtBQUM5RSw2RUFBNkU7QUFDN0UsMkRBQTJEO0FBQzNELEVBQUU7QUFDRix1RUFBdUU7QUFDdkUsa0RBQWtEO0FBRWxELHFEQUFxRDtBQUNyRCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQztBQUVuQyxrRUFBa0U7QUFDbEUsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7QUFFcEMsSUFBSSxhQUFhLEdBQTBDLElBQUksQ0FBQztBQUNoRSxJQUFJLGNBQWMsR0FBMEMsSUFBSSxDQUFDO0FBQ2pFLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztBQUM1QixJQUFJLG9CQUFvQixHQUFrQixJQUFJLENBQUM7QUFDL0MsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBRTFCLG1GQUFtRjtBQUNuRixJQUFJLHFCQUFxQixHQUFHLEtBQUssQ0FBQztBQUVsQyxvREFBb0Q7QUFDcEQsU0FBUyxhQUFhO0lBQ3BCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM3QixJQUFJLENBQUM7WUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNwRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUN6RCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQTBCLENBQUMsQ0FBQztnQkFDN0MsQ0FBQztxQkFBTSxDQUFDO29CQUNOLEdBQUcsQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUM3RCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2xCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2IsR0FBRyxDQUFDLDRCQUE0QixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUVILHlGQUF5RjtBQUN6RixJQUFJLGNBQWMsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUVwRCxrRUFBa0U7QUFDbEUsS0FBSyxVQUFVLGtCQUFrQjtJQUMvQixJQUFJLENBQUM7UUFDSCxNQUFNLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEIsTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckIsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzdDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hELENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztRQUM3QixjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEUsR0FBRyxDQUFDLGNBQWMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixHQUFHLENBQUMsNkJBQTZCLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztBQUNILENBQUM7QUFFRCx5REFBeUQ7QUFDekQsS0FBSyxVQUFVLGtCQUFrQjtJQUMvQixJQUFJLENBQUM7UUFDSCxJQUFJLE9BQU8sR0FBa0IsSUFBSSxDQUFDO1FBQ2xDLE1BQU0sVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDckMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEIsTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckIsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQy9CLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsR0FBRyxDQUFDLG1DQUFtQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUM7QUFFRCwrREFBK0Q7QUFDL0QsU0FBUyxzQkFBc0I7SUFDN0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQzdCLElBQUksQ0FBQztZQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUMxQyxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFDOUIsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDVCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUN6RCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsS0FBMEQsQ0FBQztvQkFDL0UsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUMxQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM3QixHQUFHLENBQUMsdUJBQXVCLEtBQUssQ0FBQyxFQUFFLFVBQVUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7d0JBQzVELCtCQUErQjt3QkFDL0IsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzdDLElBQUksSUFBSSxFQUFFLENBQUM7NEJBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNoQixDQUFDOzZCQUFNLENBQUM7NEJBQ04sR0FBRyxDQUFDLGdDQUFnQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzs0QkFDbkQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNoQixDQUFDO29CQUNILENBQUM7eUJBQU0sQ0FBQzt3QkFDTixHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzt3QkFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNoQixDQUFDO2dCQUNILENBQUM7cUJBQU0sQ0FBQztvQkFDTixHQUFHLENBQUMscUJBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoQixDQUFDO1lBQ0gsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLEdBQUcsQ0FBQyx3QkFBd0IsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELG9EQUFvRDtBQUNwRCxLQUFLLFVBQVUsbUJBQW1CO0lBQ2hDLGlEQUFpRDtJQUNqRCxNQUFNLFFBQVEsR0FBRyxNQUFNLGtCQUFrQixFQUFFLENBQUM7SUFDNUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNiLEdBQUcsQ0FBQyx1QkFBdUIsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsK0NBQStDO0lBQy9DLE1BQU0sWUFBWSxHQUFHLE1BQU0sc0JBQXNCLEVBQUUsQ0FBQztJQUNwRCxHQUFHLENBQUMsMEJBQTBCLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDOUMsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxLQUFLLFVBQVUsc0JBQXNCLENBQUMsT0FBZTtJQUNuRCxNQUFNLE1BQU0sR0FBRyw2QkFBYyxFQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLEdBQUcsQ0FBQyxtQkFBbUIsT0FBTyxRQUFRLE1BQU0sRUFBRSxHQUFHLElBQUksTUFBTSxhQUFhLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzVGLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7UUFBRSxPQUFPO0lBRTdDLElBQUkscUJBQXFCLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7UUFDL0MscUVBQXFFO1FBQ3JFLEdBQUcsQ0FBQyxpQ0FBaUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RSxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNGLEdBQUcsQ0FBQyx3QkFBd0IsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNwQyxPQUFPO0lBQ1QsQ0FBQztJQUVELHNEQUFzRDtJQUN0RCxNQUFNLFVBQVUsR0FBRyxxQkFBcUIsRUFBRSxDQUFDO0lBQzNDLElBQUksQ0FBQztRQUNILEdBQUcsQ0FBQyxnQ0FBZ0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxZQUFZLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDekYsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ2xCLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRztZQUNmLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVc7WUFDekIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxZQUFZO1lBQzNCLElBQUksRUFBRSxXQUFJLENBQUMsU0FBUyxFQUFFO1lBQ3RCLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtZQUNqQyxTQUFTLEVBQUUsSUFBSSxFQUFHLHVEQUF1RDtZQUN6RSxVQUFVO1NBQ1gsQ0FBQyxDQUFDO1FBQ0gscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1FBQzdCLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsR0FBRyxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7QUFDSCxDQUFDO0FBRUQsMkNBQTJDO0FBQzNDLEtBQUssVUFBVSxvQkFBb0I7SUFDakMsSUFBSSxDQUFDLGVBQWU7UUFBRSxPQUFPO0lBQzdCLElBQUksYUFBYSxFQUFFLENBQUM7UUFDbEIsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDM0IsT0FBTztJQUNULENBQUM7SUFFRCxhQUFhLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLElBQUksQ0FBQztRQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztRQUM1QyxHQUFHLENBQUMsa0JBQWtCLE9BQU8sU0FBUyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2IsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDN0IsT0FBTztRQUNULENBQUM7UUFDRCxJQUFJLE9BQU8sS0FBSyxvQkFBb0I7WUFBRSxPQUFPO1FBRTdDLEdBQUcsQ0FBQyxrQkFBa0Isb0JBQW9CLE1BQU0sT0FBTyxFQUFFLENBQUMsQ0FBQztRQUMzRCxvQkFBb0IsR0FBRyxPQUFPLENBQUM7UUFFL0IsTUFBTSxNQUFNLEdBQUcsNkJBQWMsRUFBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxJQUFJLE1BQU0sRUFBRSxRQUFRLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ25DLE1BQU0sc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsQ0FBQzthQUFNLENBQUM7WUFDTix1Q0FBdUM7WUFDdkMscURBQXFEO1lBQ3JELDJEQUEyRDtZQUMzRCxHQUFHLENBQUMsb0JBQW9CLE9BQU8sb0JBQW9CLENBQUMsQ0FBQztZQUNyRCxJQUFJLHFCQUFxQixJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixHQUFHLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7WUFBUyxDQUFDO1FBQ1QsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUN4QixDQUFDO0FBQ0gsQ0FBQztBQUVELDhDQUE4QztBQUM5QyxLQUFLLFVBQVUsZ0JBQWdCO0lBQzdCLGVBQWUsR0FBRyxJQUFJLENBQUM7SUFDdkIsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0lBQzVCLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFDdEIsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFFMUIsNERBQTREO0lBQzVELDBFQUEwRTtJQUMxRSxNQUFNLGtCQUFrQixFQUFFLENBQUM7SUFFM0IsdURBQXVEO0lBQ3ZELEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sT0FBTyxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztJQUM1QyxHQUFHLENBQUMseUJBQXlCLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFFeEMsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNaLG9CQUFvQixHQUFHLE9BQU8sQ0FBQztRQUMvQixNQUFNLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7U0FBTSxDQUFDO1FBQ04sR0FBRyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELGtDQUFrQztJQUNsQyxJQUFJLGNBQWM7UUFBRSxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDbEQsY0FBYyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDeEYsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUVELHlDQUF5QztBQUN6QyxTQUFTLGVBQWU7SUFDdEIsZUFBZSxHQUFHLEtBQUssQ0FBQztJQUN4QixxQkFBcUIsR0FBRyxLQUFLLENBQUM7SUFDOUIsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdkIsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUNuQixhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUIsY0FBYyxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDO0lBQ0Qsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0lBRTVCLHNEQUFzRDtJQUN0RCxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVELGtFQUFrRTtBQUNsRSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFDdEIsS0FBSyxVQUFVLFlBQVk7SUFDekIsYUFBYSxFQUFFLENBQUM7SUFDaEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQztJQUNuQyxNQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssTUFBTSxDQUFDO0lBRXBDLHNFQUFzRTtJQUN0RSxJQUFJLGFBQWEsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLFNBQVMsYUFBYSxXQUFXLElBQUksWUFBWSxlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCxJQUFJLFdBQVcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sZ0JBQWdCLEVBQUUsQ0FBQztJQUMzQixDQUFDO1NBQU0sSUFBSSxDQUFDLFdBQVcsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUMzQyxlQUFlLEVBQUUsQ0FBQztJQUNwQixDQUFDO0FBQ0gsQ0FBQztBQUVELDJDQUEyQztBQUMzQyxTQUFTLG9CQUFvQjtJQUMzQixJQUFJLGFBQWE7UUFBRSxPQUFPO0lBQzFCLGFBQWEsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUM5RSxHQUFHLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLDJEQUEyRDtBQUMzRCxTQUFTLHFCQUFxQjtJQUM1QixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBNEIsQ0FBQztJQUNuRixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUE0QixDQUFDO0lBQ3ZGLElBQUksT0FBTyxFQUFFLE9BQU87UUFBRSxPQUFPLE1BQU0sQ0FBQztJQUNwQyxJQUFJLFNBQVMsRUFBRSxPQUFPO1FBQUUsT0FBTyxRQUFRLENBQUM7SUFDeEMsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsTUFBYztJQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLFNBQVMsTUFBTSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkQsSUFBSSxRQUFRO1lBQUUsUUFBUSxDQUFDLFdBQVcsR0FBRyx5Q0FBeUMsQ0FBQztRQUMvRSxPQUFPO0lBQ1QsQ0FBQztJQUNELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5RCxHQUFHLENBQUMsU0FBUyxNQUFNLFVBQVUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNyQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3ZELElBQUksUUFBUTtRQUFFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsTUFBTSxFQUFFLENBQUM7QUFDaEcsQ0FBQztBQUVELFNBQVMscUJBQXFCO0lBQzVCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUE0QixDQUFDO0lBQ25GLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQTRCLENBQUM7SUFDdkYsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBNkIsQ0FBQztJQUUxRixPQUFPLEVBQUUsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtRQUN2QyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwQixnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoQyxDQUFDO2FBQU0sQ0FBQztZQUNOLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1FBQ3pDLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RCLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7YUFBTSxDQUFDO1lBQ04sZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsVUFBVSxFQUFFLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDekMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUIsSUFBSSxPQUFPO1lBQUUsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDckMsSUFBSSxTQUFTO1lBQUUsU0FBUyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLFNBQVMsSUFBSTtJQUNYLGlCQUFpQjtJQUNqQixRQUFRLEdBQUcsQ0FBQyxDQUFtQixXQUFXLENBQUMsQ0FBQztJQUM1QyxRQUFRLEdBQUcsQ0FBQyxDQUFvQixXQUFXLENBQUMsQ0FBQztJQUM3QyxPQUFPLEdBQUcsQ0FBQyxDQUFvQixVQUFVLENBQUMsQ0FBQztJQUMzQyxXQUFXLEdBQUcsQ0FBQyxDQUFvQixjQUFjLENBQUMsQ0FBQztJQUNuRCxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZCLGFBQWEsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDbEMsVUFBVSxHQUFHLENBQUMsQ0FBb0IsYUFBYSxDQUFDLENBQUM7SUFDakQsV0FBVyxHQUFHLENBQUMsQ0FBbUIsY0FBYyxDQUFDLENBQUM7SUFDbEQsWUFBWSxHQUFHLENBQUMsQ0FBbUIsZUFBZSxDQUFDLENBQUM7SUFDcEQsVUFBVSxHQUFHLENBQUMsQ0FBbUIsYUFBYSxDQUFDLENBQUM7SUFDaEQsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDM0MsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDN0MsZUFBZSxHQUFHLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3pDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzNDLFdBQVcsR0FBRyxDQUFDLENBQW1CLGVBQWUsQ0FBQyxDQUFDO0lBQ25ELFdBQVcsR0FBRyxDQUFDLENBQW1CLGVBQWUsQ0FBQyxDQUFDO0lBQ25ELGVBQWUsR0FBRyxDQUFDLENBQW1CLGtCQUFrQixDQUFDLENBQUM7SUFDMUQsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDbkQsYUFBYSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBb0IsYUFBYSxDQUFDLENBQUM7SUFDNUUsY0FBYyxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNwQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUUzQyxtQ0FBbUM7SUFDbkMsTUFBTSxTQUFTLEdBQUcsMEJBQVcsR0FBRSxDQUFDO0lBQ2hDLElBQUksU0FBUyxFQUFFLENBQUM7UUFDZCxXQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFDRCxVQUFVLENBQUMsS0FBSyxHQUFHLFdBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNwQyxTQUFTLEVBQUUsQ0FBQztJQUVaLGtCQUFrQjtJQUNsQixRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2hELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDOUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3pELFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUM1RCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDdkQsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3hELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUMxRCxVQUFVLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUM3RCxlQUFlLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDaEUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDM0UsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLHlCQUF5QixDQUFDLENBQUM7SUFDN0UsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUN0RixDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUNuRSxRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3RGLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLHFCQUFzQyxDQUFDLENBQUM7SUFDM0csQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztJQUU5RCxxRUFBcUU7SUFDckUsa0JBQWtCLEVBQUUsQ0FBQztJQUNyQixrQkFBa0IsRUFBRSxDQUFDO0lBRXJCLElBQUksQ0FBQztRQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FDckMsTUFBTSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsRUFDekMsR0FBRyxFQUFFLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDaEMsQ0FBQztJQUNKLENBQUM7SUFBQyxNQUFNLENBQUMsQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO0lBRW5FLDJDQUEyQztJQUMzQyxRQUFRLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFFeEMscUVBQXFFO0lBQ3JFLFFBQVEsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUV0QyxvQ0FBb0M7SUFDcEMsdUVBQXVFO0lBQ3ZFLDRDQUE0QztJQUM1QyxvQkFBb0IsRUFBRSxDQUFDO0lBRXZCLDZFQUE2RTtJQUM3RSxxQkFBcUIsRUFBRSxDQUFDO0FBQzFCLENBQUM7QUFFRCxnRkFBZ0Y7QUFFaEYsNkNBQWdDLEdBQUUsQ0FBQztBQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Ozs7Ozs7Ozs7QUN6aEM3QiIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9kaWFsb2ctbGF1bmNoZXIudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvaTE4bi50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9sb2dnZXIudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvc2V0dGluZ3MudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy90YXNrcGFuZS90YXNrcGFuZS50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3Rhc2twYW5lL3Rhc2twYW5lLmNzcz80Yzc2Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIOKUgOKUgOKUgCBTZXR0aW5nIGtleXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUHJlZml4IGZvciBwZXItc2xpZGUgc2V0dGluZyBrZXlzLiBGdWxsIGtleTogYHdlYnBwdF9zbGlkZV97c2xpZGVJZH1gLiAqL1xyXG5leHBvcnQgY29uc3QgU0VUVElOR19LRVlfU0xJREVfUFJFRklYID0gJ3dlYnBwdF9zbGlkZV8nO1xyXG5cclxuLyoqIEtleSBmb3IgdGhlIHNhdmVkIFVJIGxhbmd1YWdlLiAqL1xyXG5leHBvcnQgY29uc3QgU0VUVElOR19LRVlfTEFOR1VBR0UgPSAnd2VicHB0X2xhbmd1YWdlJztcclxuXHJcbi8qKiBLZXkgZm9yIGdsb2JhbCBkZWZhdWx0IHNsaWRlIGNvbmZpZy4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX0RFRkFVTFRTID0gJ3dlYnBwdF9kZWZhdWx0cyc7XHJcblxyXG4vLyDilIDilIDilIAgVmlld2VyIGRlZmF1bHRzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfWk9PTSA9IDEwMDtcclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRElBTE9HX1dJRFRIID0gODA7ICAgLy8gJSBvZiBzY3JlZW5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRElBTE9HX0hFSUdIVCA9IDgwOyAgLy8gJSBvZiBzY3JlZW5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19PUEVOID0gdHJ1ZTtcclxuXHJcbi8vIOKUgOKUgOKUgCBDb25zdHJhaW50IHJhbmdlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBaT09NX01JTiA9IDUwO1xyXG5leHBvcnQgY29uc3QgWk9PTV9NQVggPSAzMDA7XHJcblxyXG4vLyDilIDilIDilIAgQXV0by1jbG9zZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FVVE9fQ0xPU0VfU0VDID0gMDsgICAvLyAwID0gZGlzYWJsZWRcclxuZXhwb3J0IGNvbnN0IEFVVE9fQ0xPU0VfTUFYX1NFQyA9IDM2MDA7XHJcblxyXG4vKipcclxuICogTm9uLWxpbmVhciBsb29rdXAgdGFibGUgZm9yIHRoZSBhdXRvLWNsb3NlIHNsaWRlci5cclxuICogSW5kZXggPSBzbGlkZXIgcG9zaXRpb24sIHZhbHVlID0gc2Vjb25kcy5cclxuICogR3JhbnVsYXJpdHkgZGVjcmVhc2VzIGFzIHZhbHVlcyBncm93OiAxcyDihpIgNXMg4oaSIDE1cyDihpIgMzBzIOKGkiA2MHMg4oaSIDMwMHMuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQVVUT19DTE9TRV9TVEVQUzogcmVhZG9ubHkgbnVtYmVyW10gPSBbXHJcbiAgLy8gMOKAkzEwcywgc3RlcCAxICAoMTEgdmFsdWVzKVxyXG4gIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLFxyXG4gIC8vIDEw4oCTNjBzLCBzdGVwIDUgICgxMCB2YWx1ZXMpXHJcbiAgMTUsIDIwLCAyNSwgMzAsIDM1LCA0MCwgNDUsIDUwLCA1NSwgNjAsXHJcbiAgLy8gMeKAkzMgbWluLCBzdGVwIDE1cyAgKDggdmFsdWVzKVxyXG4gIDc1LCA5MCwgMTA1LCAxMjAsIDEzNSwgMTUwLCAxNjUsIDE4MCxcclxuICAvLyAz4oCTNSBtaW4sIHN0ZXAgMzBzICAoNCB2YWx1ZXMpXHJcbiAgMjEwLCAyNDAsIDI3MCwgMzAwLFxyXG4gIC8vIDXigJMxMCBtaW4sIHN0ZXAgNjBzICAoNSB2YWx1ZXMpXHJcbiAgMzYwLCA0MjAsIDQ4MCwgNTQwLCA2MDAsXHJcbiAgLy8gMTDigJM2MCBtaW4sIHN0ZXAgMzAwcyAgKDEwIHZhbHVlcylcclxuICA5MDAsIDEyMDAsIDE1MDAsIDE4MDAsIDIxMDAsIDI0MDAsIDI3MDAsIDMwMDAsIDMzMDAsIDM2MDAsXHJcbl07XHJcblxyXG4vLyDilIDilIDilIAgRXJyb3IgaGFuZGxpbmcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFUyA9IDI7XHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HU19TQVZFX1JFVFJZX0RFTEFZX01TID0gMTAwMDtcclxuZXhwb3J0IGNvbnN0IElGUkFNRV9MT0FEX1RJTUVPVVRfTVMgPSAxMF8wMDA7XHJcbmV4cG9ydCBjb25zdCBVUkxfRElTUExBWV9NQVhfTEVOR1RIID0gNjA7XHJcblxyXG4vKiogVHJ1bmNhdGUgYSBVUkwgZm9yIGRpc3BsYXksIGFwcGVuZGluZyBlbGxpcHNpcyBpZiBuZWVkZWQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cnVuY2F0ZVVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgaWYgKHVybC5sZW5ndGggPD0gVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCkgcmV0dXJuIHVybDtcclxuICByZXR1cm4gdXJsLnN1YnN0cmluZygwLCBVUkxfRElTUExBWV9NQVhfTEVOR1RIIC0gMSkgKyAnXFx1MjAyNic7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBEZWJ1ZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKlxyXG4gKiBTZXQgdG8gYGZhbHNlYCBpbiBwcm9kdWN0aW9uIGJ1aWxkcyB2aWEgd2VicGFjayBEZWZpbmVQbHVnaW4uXHJcbiAqIEZhbGxzIGJhY2sgdG8gYHRydWVgIHNvIGRldi90ZXN0IHJ1bnMgYWx3YXlzIGxvZy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBERUJVRzogYm9vbGVhbiA9XHJcbiAgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzLmVudiAhPT0gJ3VuZGVmaW5lZCdcclxuICAgID8gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJ1xyXG4gICAgOiB0cnVlO1xyXG4iLCJpbXBvcnQgeyBpMThuLCB0eXBlIFRyYW5zbGF0aW9uS2V5IH0gZnJvbSAnLi9pMThuJztcclxuaW1wb3J0IHsgbG9nRGVidWcsIGxvZ0Vycm9yIH0gZnJvbSAnLi9sb2dnZXInO1xyXG5cclxuLy8g4pSA4pSA4pSAIENvbnN0YW50cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBGaWxlbmFtZSBvZiB0aGUgdmlld2VyIHBhZ2UgYnVpbHQgYnkgd2VicGFjay4gKi9cclxuZXhwb3J0IGNvbnN0IFZJRVdFUl9QQUdFID0gJ3ZpZXdlci5odG1sJztcclxuXHJcbi8qKiBPZmZpY2UgZGlzcGxheURpYWxvZ0FzeW5jIGVycm9yIGNvZGVzLiAqL1xyXG5jb25zdCBPUEVOX0VSUiA9IHtcclxuICAvKiogQSBkaWFsb2cgaXMgYWxyZWFkeSBvcGVuZWQgZnJvbSB0aGlzIGFkZC1pbi4gKi9cclxuICBBTFJFQURZX09QRU5FRDogMTIwMDcsXHJcbiAgLyoqIFVzZXIgZGlzbWlzc2VkIHRoZSBkaWFsb2cgcHJvbXB0IC8gcG9wdXAgYmxvY2tlci4gKi9cclxuICBQT1BVUF9CTE9DS0VEOiAxMjAwOSxcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIOKUgOKUgOKUgCBUeXBlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nQ29uZmlnIHtcclxuICB1cmw6IHN0cmluZztcclxuICB6b29tOiBudW1iZXI7XHJcbiAgd2lkdGg6IG51bWJlcjsgICAvLyAlIG9mIHNjcmVlbiAoMTDigJMxMDApXHJcbiAgaGVpZ2h0OiBudW1iZXI7ICAvLyAlIG9mIHNjcmVlbiAoMTDigJMxMDApXHJcbiAgbGFuZzogc3RyaW5nO1xyXG4gIGF1dG9DbG9zZVNlYz86IG51bWJlcjsgIC8vIDAgb3IgdW5kZWZpbmVkID0gZGlzYWJsZWRcclxuICBzbGlkZXNob3c/OiBib29sZWFuOyAgICAvLyB0cnVlID0gZGlhbG9nIGlzIGluIHNsaWRlc2hvdyBtb2RlIChkb24ndCBhY3R1YWxseSBjbG9zZSBvbiB0aW1lcilcclxuICBoaWRlTWV0aG9kPzogJ25vbmUnIHwgJ21vdmUnIHwgJ3Jlc2l6ZSc7ICAvLyBob3cgdG8gaGlkZSBkaWFsb2cgYWZ0ZXIgdGltZXIgaW4gc2xpZGVzaG93XHJcbn1cclxuXHJcbi8qKiBUeXBlZCBlcnJvciB0aHJvd24gYnkge0BsaW5rIERpYWxvZ0xhdW5jaGVyfS4gKi9cclxuZXhwb3J0IGNsYXNzIERpYWxvZ0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIHJlYWRvbmx5IGkxOG5LZXk6IFRyYW5zbGF0aW9uS2V5LFxyXG4gICAgcHVibGljIHJlYWRvbmx5IG9mZmljZUNvZGU/OiBudW1iZXIsXHJcbiAgKSB7XHJcbiAgICBzdXBlcihpMThuLnQoaTE4bktleSkpO1xyXG4gICAgdGhpcy5uYW1lID0gJ0RpYWxvZ0Vycm9yJztcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBESSBpbnRlcmZhY2VzICh0ZXN0YWJsZSB3aXRob3V0IE9mZmljZSBydW50aW1lKSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBNaW5pbWFsIHN1YnNldCBvZiBPZmZpY2UuRGlhbG9nIHVzZWQgYnkgdGhpcyBtb2R1bGUuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgT2ZmaWNlRGlhbG9nIHtcclxuICBjbG9zZSgpOiB2b2lkO1xyXG4gIGFkZEV2ZW50SGFuZGxlcihcclxuICAgIGV2ZW50VHlwZTogc3RyaW5nLFxyXG4gICAgaGFuZGxlcjogKGFyZzogeyBtZXNzYWdlPzogc3RyaW5nOyBlcnJvcj86IG51bWJlciB9KSA9PiB2b2lkLFxyXG4gICk6IHZvaWQ7XHJcbiAgLyoqIFNlbmQgYSBtZXNzYWdlIGZyb20gaG9zdCB0byBkaWFsb2cgKERpYWxvZ0FwaSAxLjIrKS4gTWF5IG5vdCBleGlzdCBvbiBvbGRlciBPZmZpY2UuICovXHJcbiAgbWVzc2FnZUNoaWxkPyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRGlhbG9nT3BlblJlc3VsdCB7XHJcbiAgc3RhdHVzOiBzdHJpbmc7XHJcbiAgdmFsdWU6IE9mZmljZURpYWxvZztcclxuICBlcnJvcjogeyBjb2RlOiBudW1iZXI7IG1lc3NhZ2U6IHN0cmluZyB9O1xyXG59XHJcblxyXG4vKiogTWluaW1hbCBzdWJzZXQgb2YgT2ZmaWNlLmNvbnRleHQudWkgbmVlZGVkIGZvciBkaWFsb2cgb3BlcmF0aW9ucy4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBEaWFsb2dBcGkge1xyXG4gIGRpc3BsYXlEaWFsb2dBc3luYyhcclxuICAgIHN0YXJ0QWRkcmVzczogc3RyaW5nLFxyXG4gICAgb3B0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBjYWxsYmFjazogKHJlc3VsdDogRGlhbG9nT3BlblJlc3VsdCkgPT4gdm9pZCxcclxuICApOiB2b2lkO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVwZW5kZW5jeSBpbmplY3Rpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5sZXQgX2luamVjdGVkQXBpOiBEaWFsb2dBcGkgfCBudWxsID0gbnVsbDtcclxubGV0IF9pbmplY3RlZEJhc2VVcmw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuLyoqXHJcbiAqIE92ZXJyaWRlIHRoZSBPZmZpY2UgZGlhbG9nIEFQSS4gUGFzcyBgbnVsbGAgdG8gcmVzdG9yZSB0aGUgcmVhbCBvbmUuXHJcbiAqIEBpbnRlcm5hbCBVc2VkIGluIHVuaXQgdGVzdHMgb25seS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfaW5qZWN0RGlhbG9nQXBpKGFwaTogRGlhbG9nQXBpIHwgbnVsbCk6IHZvaWQge1xyXG4gIF9pbmplY3RlZEFwaSA9IGFwaTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE92ZXJyaWRlIHRoZSB2aWV3ZXIgYmFzZSBVUkwuIFBhc3MgYG51bGxgIHRvIHJlc3RvcmUgYXV0by1kZXRlY3Rpb24uXHJcbiAqIEBpbnRlcm5hbCBVc2VkIGluIHVuaXQgdGVzdHMgb25seS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfaW5qZWN0QmFzZVVybCh1cmw6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcclxuICBfaW5qZWN0ZWRCYXNlVXJsID0gdXJsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBcGkoKTogRGlhbG9nQXBpIHtcclxuICBpZiAoX2luamVjdGVkQXBpKSByZXR1cm4gX2luamVjdGVkQXBpO1xyXG4gIHJldHVybiBPZmZpY2UuY29udGV4dC51aSBhcyB1bmtub3duIGFzIERpYWxvZ0FwaTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Vmlld2VyQmFzZVVybCgpOiBzdHJpbmcge1xyXG4gIGlmIChfaW5qZWN0ZWRCYXNlVXJsKSByZXR1cm4gX2luamVjdGVkQmFzZVVybDtcclxuICBjb25zdCBkaXIgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW14vXSokLywgJycpO1xyXG4gIHJldHVybiBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufSR7ZGlyfS8ke1ZJRVdFUl9QQUdFfWA7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBEaWFsb2dMYXVuY2hlciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjbGFzcyBEaWFsb2dMYXVuY2hlciB7XHJcbiAgcHJpdmF0ZSBkaWFsb2c6IE9mZmljZURpYWxvZyB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgbWVzc2FnZUNhbGxiYWNrOiAoKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIGNsb3NlZENhbGxiYWNrOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLyoqIEJ1aWxkIHRoZSBmdWxsIHZpZXdlciBVUkwgd2l0aCBxdWVyeSBwYXJhbWV0ZXJzLiAqL1xyXG4gIHByaXZhdGUgYnVpbGRWaWV3ZXJVcmwoY29uZmlnOiBEaWFsb2dDb25maWcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XHJcbiAgICAgIHVybDogY29uZmlnLnVybCxcclxuICAgICAgem9vbTogU3RyaW5nKGNvbmZpZy56b29tKSxcclxuICAgICAgbGFuZzogY29uZmlnLmxhbmcsXHJcbiAgICB9KTtcclxuICAgIGlmIChjb25maWcuYXV0b0Nsb3NlU2VjICYmIGNvbmZpZy5hdXRvQ2xvc2VTZWMgPiAwKSB7XHJcbiAgICAgIHBhcmFtcy5zZXQoJ2F1dG9jbG9zZScsIFN0cmluZyhjb25maWcuYXV0b0Nsb3NlU2VjKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY29uZmlnLnNsaWRlc2hvdykge1xyXG4gICAgICBwYXJhbXMuc2V0KCdzbGlkZXNob3cnLCAnMScpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5oaWRlTWV0aG9kICYmIGNvbmZpZy5oaWRlTWV0aG9kICE9PSAnbm9uZScpIHtcclxuICAgICAgcGFyYW1zLnNldCgnaGlkZScsIGNvbmZpZy5oaWRlTWV0aG9kKTtcclxuICAgIH1cclxuICAgIHJldHVybiBgJHtnZXRWaWV3ZXJCYXNlVXJsKCl9PyR7cGFyYW1zLnRvU3RyaW5nKCl9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9wZW4gdGhlIHZpZXdlciBkaWFsb2cgd2l0aCB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbi5cclxuICAgKiBJZiBhIGRpYWxvZyBpcyBhbHJlYWR5IG9wZW4sIGNsb3NlcyBpdCBmaXJzdCBhbmQgcmVvcGVucy5cclxuICAgKiBSZWplY3RzIHdpdGgge0BsaW5rIERpYWxvZ0Vycm9yfSBpZiB0aGUgZGlhbG9nIGNhbm5vdCBiZSBvcGVuZWQuXHJcbiAgICovXHJcbiAgYXN5bmMgb3Blbihjb25maWc6IERpYWxvZ0NvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgLy8gQXV0by1jbG9zZSBhbnkgZXhpc3RpbmcgZGlhbG9nIGJlZm9yZSBvcGVuaW5nIGEgbmV3IG9uZVxyXG4gICAgaWYgKHRoaXMuZGlhbG9nKSB7XHJcbiAgICAgIGxvZ0RlYnVnKCdDbG9zaW5nIGV4aXN0aW5nIGRpYWxvZyBiZWZvcmUgb3BlbmluZyBhIG5ldyBvbmUnKTtcclxuICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEd1YXJkOiBjaGVjayB0aGF0IGRpc3BsYXlEaWFsb2dBc3luYyBpcyBhdmFpbGFibGVcclxuICAgIGNvbnN0IGFwaSA9IGdldEFwaSgpO1xyXG4gICAgaWYgKCFhcGkgfHwgdHlwZW9mIGFwaS5kaXNwbGF5RGlhbG9nQXN5bmMgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IERpYWxvZ0Vycm9yKCdkaWFsb2dVbnN1cHBvcnRlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXdlclVybCA9IHRoaXMuYnVpbGRWaWV3ZXJVcmwoY29uZmlnKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy50cnlPcGVuKGFwaSwgdmlld2VyVXJsLCBjb25maWcsIGZhbHNlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHQgdG8gb3BlbiB0aGUgZGlhbG9nLiBJZiBPZmZpY2UgcmV0dXJucyAxMjAwNyAoYWxyZWFkeSBvcGVuZWQpXHJcbiAgICogb24gdGhlIGZpcnN0IHRyeSwgd2FpdCBicmllZmx5IGFuZCByZXRyeSBvbmNlIOKAlCB0aGUgcHJldmlvdXMgY2xvc2UoKVxyXG4gICAqIG1heSBub3QgaGF2ZSBmdWxseSBwcm9wYWdhdGVkIHlldC5cclxuICAgKi9cclxuICBwcml2YXRlIHRyeU9wZW4oXHJcbiAgICBhcGk6IERpYWxvZ0FwaSxcclxuICAgIHZpZXdlclVybDogc3RyaW5nLFxyXG4gICAgY29uZmlnOiBEaWFsb2dDb25maWcsXHJcbiAgICBpc1JldHJ5OiBib29sZWFuLFxyXG4gICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgYXBpLmRpc3BsYXlEaWFsb2dBc3luYyhcclxuICAgICAgICB2aWV3ZXJVcmwsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgd2lkdGg6IGNvbmZpZy53aWR0aCxcclxuICAgICAgICAgIGhlaWdodDogY29uZmlnLmhlaWdodCxcclxuICAgICAgICAgIGRpc3BsYXlJbklmcmFtZTogZmFsc2UsXHJcbiAgICAgICAgICBwcm9tcHRCZWZvcmVPcGVuOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIChyZXN1bHQpID0+IHtcclxuICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgICAgICAvLyBPbiBmaXJzdCBhdHRlbXB0LCBpZiBPZmZpY2Ugc2F5cyBcImFscmVhZHkgb3BlbmVkXCIsIHJldHJ5IG9uY2VcclxuICAgICAgICAgICAgaWYgKHJlc3VsdC5lcnJvci5jb2RlID09PSBPUEVOX0VSUi5BTFJFQURZX09QRU5FRCAmJiAhaXNSZXRyeSkge1xyXG4gICAgICAgICAgICAgIGxvZ0RlYnVnKCdHb3QgMTIwMDcgKGFscmVhZHkgb3BlbmVkKSDigJQgcmV0cnlpbmcgYWZ0ZXIgZGVsYXknKTtcclxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudHJ5T3BlbihhcGksIHZpZXdlclVybCwgY29uZmlnLCB0cnVlKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbG9nRXJyb3IoJ2Rpc3BsYXlEaWFsb2dBc3luYyBmYWlsZWQ6JywgcmVzdWx0LmVycm9yLmNvZGUsIHJlc3VsdC5lcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgcmVqZWN0KHRoaXMubWFwT3BlbkVycm9yKHJlc3VsdC5lcnJvci5jb2RlKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmRpYWxvZyA9IHJlc3VsdC52YWx1ZTtcclxuXHJcbiAgICAgICAgICB0aGlzLmRpYWxvZy5hZGRFdmVudEhhbmRsZXIoXHJcbiAgICAgICAgICAgICdkaWFsb2dNZXNzYWdlUmVjZWl2ZWQnLFxyXG4gICAgICAgICAgICAoYXJnKSA9PiB0aGlzLmhhbmRsZU1lc3NhZ2UoYXJnKSxcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5kaWFsb2cuYWRkRXZlbnRIYW5kbGVyKFxyXG4gICAgICAgICAgICAnZGlhbG9nRXZlbnRSZWNlaXZlZCcsXHJcbiAgICAgICAgICAgIChhcmcpID0+IHRoaXMuaGFuZGxlRXZlbnQoYXJnKSxcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgbG9nRGVidWcoJ0RpYWxvZyBvcGVuZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIENsb3NlIHRoZSBkaWFsb2cgaWYgaXQgaXMgb3Blbi4gU2FmZSB0byBjYWxsIHdoZW4gYWxyZWFkeSBjbG9zZWQuICovXHJcbiAgY2xvc2UoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuZGlhbG9nKSByZXR1cm47XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLmRpYWxvZy5jbG9zZSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdFcnJvciBjbG9zaW5nIGRpYWxvZzonLCBlcnIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kaWFsb2cgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VuZCBhIG1lc3NhZ2UgZnJvbSB0aGUgaG9zdCAodGFza3BhbmUvY29tbWFuZHMpIHRvIHRoZSBkaWFsb2cuXHJcbiAgICogVXNlcyBEaWFsb2dBcGkgMS4yIGBtZXNzYWdlQ2hpbGQoKWAuIFJldHVybnMgZmFsc2UgaWYgbm90IHN1cHBvcnRlZC5cclxuICAgKi9cclxuICBzZW5kTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICghdGhpcy5kaWFsb2cpIHJldHVybiBmYWxzZTtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kaWFsb2cubWVzc2FnZUNoaWxkICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGxvZ0RlYnVnKCdtZXNzYWdlQ2hpbGQgbm90IGF2YWlsYWJsZSBvbiB0aGlzIE9mZmljZSB2ZXJzaW9uJyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuZGlhbG9nLm1lc3NhZ2VDaGlsZChtZXNzYWdlKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbG9nRXJyb3IoJ21lc3NhZ2VDaGlsZCBmYWlsZWQ6JywgZXJyKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIGRpYWxvZyBpcyBjdXJyZW50bHkgb3Blbi4gKi9cclxuICBpc09wZW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5kaWFsb2cgIT09IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKiogU3Vic2NyaWJlIHRvIG1lc3NhZ2VzIHNlbnQgZnJvbSB0aGUgdmlld2VyIHZpYSBgT2ZmaWNlLmNvbnRleHQudWkubWVzc2FnZVBhcmVudGAuICovXHJcbiAgb25NZXNzYWdlKGNhbGxiYWNrOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLm1lc3NhZ2VDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gIH1cclxuXHJcbiAgLyoqIFN1YnNjcmliZSB0byB0aGUgZGlhbG9nIGJlaW5nIGNsb3NlZCAoYnkgdXNlciBvciBuYXZpZ2F0aW9uIGVycm9yKS4gKi9cclxuICBvbkNsb3NlZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5jbG9zZWRDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gIH1cclxuXHJcbiAgLy8g4pSA4pSA4pSAIFByaXZhdGUgaGFuZGxlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4gIHByaXZhdGUgaGFuZGxlTWVzc2FnZShhcmc6IHsgbWVzc2FnZT86IHN0cmluZyB9KTogdm9pZCB7XHJcbiAgICBpZiAoYXJnLm1lc3NhZ2UgJiYgdGhpcy5tZXNzYWdlQ2FsbGJhY2spIHtcclxuICAgICAgdGhpcy5tZXNzYWdlQ2FsbGJhY2soYXJnLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVFdmVudChhcmc6IHsgZXJyb3I/OiBudW1iZXIgfSk6IHZvaWQge1xyXG4gICAgLy8gQWxsIERpYWxvZ0V2ZW50UmVjZWl2ZWQgY29kZXMgKDEyMDAyIGNsb3NlZCwgMTIwMDMgbWl4ZWQgY29udGVudCxcclxuICAgIC8vIDEyMDA2IGNyb3NzLWRvbWFpbikgbWVhbiB0aGUgZGlhbG9nIGlzIG5vIGxvbmdlciB1c2FibGUuXHJcbiAgICBsb2dEZWJ1ZygnRGlhbG9nIGV2ZW50IHJlY2VpdmVkLCBjb2RlOicsIGFyZy5lcnJvcik7XHJcbiAgICB0aGlzLmRpYWxvZyA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5jbG9zZWRDYWxsYmFjaykge1xyXG4gICAgICB0aGlzLmNsb3NlZENhbGxiYWNrKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG1hcE9wZW5FcnJvcihjb2RlOiBudW1iZXIpOiBEaWFsb2dFcnJvciB7XHJcbiAgICBzd2l0Y2ggKGNvZGUpIHtcclxuICAgICAgY2FzZSBPUEVOX0VSUi5BTFJFQURZX09QRU5FRDpcclxuICAgICAgICByZXR1cm4gbmV3IERpYWxvZ0Vycm9yKCdkaWFsb2dBbHJlYWR5T3BlbicsIGNvZGUpO1xyXG4gICAgICBjYXNlIE9QRU5fRVJSLlBPUFVQX0JMT0NLRUQ6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2dFcnJvcignZGlhbG9nQmxvY2tlZCcsIGNvZGUpO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nRXJyb3IoJ2Vycm9yR2VuZXJpYycsIGNvZGUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgbG9jYWxlc0RhdGEgZnJvbSAnLi4vaTE4bi9sb2NhbGVzLmpzb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgTG9jYWxlID0gJ2VuJyB8ICd6aCcgfCAnZXMnIHwgJ2RlJyB8ICdmcicgfCAnaXQnIHwgJ2FyJyB8ICdwdCcgfCAnaGknIHwgJ3J1JztcclxuZXhwb3J0IHR5cGUgVHJhbnNsYXRpb25LZXkgPSBrZXlvZiB0eXBlb2YgbG9jYWxlc0RhdGFbJ2VuJ107XHJcblxyXG4vKiogTWFwcyBhIEJDUCA0NyBsYW5ndWFnZSB0YWcgdG8gYSBzdXBwb3J0ZWQgTG9jYWxlLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbGUobGFuZ1RhZzogc3RyaW5nKTogTG9jYWxlIHtcclxuICBjb25zdCB0YWcgPSBsYW5nVGFnLnRvTG93ZXJDYXNlKCk7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCd6aCcpKSByZXR1cm4gJ3poJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2VzJykpIHJldHVybiAnZXMnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnZGUnKSkgcmV0dXJuICdkZSc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdmcicpKSByZXR1cm4gJ2ZyJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2l0JykpIHJldHVybiAnaXQnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnYXInKSkgcmV0dXJuICdhcic7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdwdCcpKSByZXR1cm4gJ3B0JztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2hpJykpIHJldHVybiAnaGknO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgncnUnKSkgcmV0dXJuICdydSc7XHJcbiAgcmV0dXJuICdlbic7XHJcbn1cclxuXHJcbmNsYXNzIEkxOG4ge1xyXG4gIHByaXZhdGUgbG9jYWxlOiBMb2NhbGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsaXN0ZW5lcnMgPSBuZXcgU2V0PCgpID0+IHZvaWQ+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5sb2NhbGUgPSB0aGlzLmRldGVjdExvY2FsZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkZXRlY3RMb2NhbGUoKTogTG9jYWxlIHtcclxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJykgcmV0dXJuICdlbic7XHJcbiAgICByZXR1cm4gcGFyc2VMb2NhbGUobmF2aWdhdG9yLmxhbmd1YWdlID8/ICdlbicpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFRyYW5zbGF0ZSBhIGtleSBpbiB0aGUgY3VycmVudCBsb2NhbGUuIEZhbGxzIGJhY2sgdG8gRW5nbGlzaCwgdGhlbiB0aGUga2V5IGl0c2VsZi4gKi9cclxuICB0KGtleTogVHJhbnNsYXRpb25LZXkpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgbG9jYWxlc0RhdGFbdGhpcy5sb2NhbGVdW2tleV0gPz9cclxuICAgICAgbG9jYWxlc0RhdGFbJ2VuJ11ba2V5XSA/P1xyXG4gICAgICBrZXlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRMb2NhbGUoKTogTG9jYWxlIHtcclxuICAgIHJldHVybiB0aGlzLmxvY2FsZTtcclxuICB9XHJcblxyXG4gIGdldEF2YWlsYWJsZUxvY2FsZXMoKTogTG9jYWxlW10ge1xyXG4gICAgcmV0dXJuIFsnZW4nLCAnemgnLCAnZXMnLCAnZGUnLCAnZnInLCAnaXQnLCAnYXInLCAncHQnLCAnaGknLCAncnUnXTtcclxuICB9XHJcblxyXG4gIC8qKiBTd2l0Y2ggbG9jYWxlIGFuZCBub3RpZnkgYWxsIGxpc3RlbmVycy4gKi9cclxuICBzZXRMb2NhbGUobG9jYWxlOiBMb2NhbGUpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmxvY2FsZSA9PT0gbG9jYWxlKSByZXR1cm47XHJcbiAgICB0aGlzLmxvY2FsZSA9IGxvY2FsZTtcclxuICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGZuKSA9PiBmbigpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnNjcmliZSB0byBsb2NhbGUgY2hhbmdlcy5cclxuICAgKiBAcmV0dXJucyBVbnN1YnNjcmliZSBmdW5jdGlvbi5cclxuICAgKi9cclxuICBvbkxvY2FsZUNoYW5nZShsaXN0ZW5lcjogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xyXG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcclxuICAgIHJldHVybiAoKSA9PiB0aGlzLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIFNpbmdsZXRvbiBpMThuIGluc3RhbmNlIHNoYXJlZCBhY3Jvc3MgdGhlIGFkZC1pbi4gKi9cclxuZXhwb3J0IGNvbnN0IGkxOG4gPSBuZXcgSTE4bigpO1xyXG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbmNvbnN0IFBSRUZJWCA9ICdbV2ViUFBUXSc7XHJcblxyXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXHJcblxyXG4vKiogTG9nIGRlYnVnIGluZm8g4oCUIG5vLW9wIGluIHByb2R1Y3Rpb24gYnVpbGRzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9nRGVidWcoLi4uYXJnczogdW5rbm93bltdKTogdm9pZCB7XHJcbiAgaWYgKERFQlVHKSBjb25zb2xlLmxvZyhQUkVGSVgsIC4uLmFyZ3MpO1xyXG59XHJcblxyXG4vKiogTG9nIHdhcm5pbmdzIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ1dhcm4oLi4uYXJnczogdW5rbm93bltdKTogdm9pZCB7XHJcbiAgaWYgKERFQlVHKSBjb25zb2xlLndhcm4oUFJFRklYLCAuLi5hcmdzKTtcclxufVxyXG5cclxuLyoqIExvZyBlcnJvcnMg4oCUIG5vLW9wIGluIHByb2R1Y3Rpb24gYnVpbGRzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9nRXJyb3IoLi4uYXJnczogdW5rbm93bltdKTogdm9pZCB7XHJcbiAgaWYgKERFQlVHKSBjb25zb2xlLmVycm9yKFBSRUZJWCwgLi4uYXJncyk7XHJcbn1cclxuXHJcbi8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xyXG5cclxuLyoqXHJcbiAqIEluc3RhbGwgYSBnbG9iYWwgaGFuZGxlciBmb3IgdW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9ucy5cclxuICogQ2FsbCBvbmNlIHBlciBlbnRyeSBwb2ludCAodGFza3BhbmUsIHZpZXdlciwgY29tbWFuZHMpLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxVbmhhbmRsZWRSZWplY3Rpb25IYW5kbGVyKCk6IHZvaWQge1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCAoZXZlbnQ6IFByb21pc2VSZWplY3Rpb25FdmVudCkgPT4ge1xyXG4gICAgbG9nRXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbjonLCBldmVudC5yZWFzb24pO1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxufVxyXG4iLCJpbXBvcnQgdHlwZSB7IExvY2FsZSB9IGZyb20gJy4vaTE4bic7XHJcbmltcG9ydCB7XHJcbiAgU0VUVElOR19LRVlfU0xJREVfUFJFRklYLFxyXG4gIFNFVFRJTkdfS0VZX0xBTkdVQUdFLFxyXG4gIFNFVFRJTkdfS0VZX0RFRkFVTFRTLFxyXG4gIERFRkFVTFRfWk9PTSxcclxuICBERUZBVUxUX0RJQUxPR19XSURUSCxcclxuICBERUZBVUxUX0RJQUxPR19IRUlHSFQsXHJcbiAgREVGQVVMVF9BVVRPX09QRU4sXHJcbiAgREVGQVVMVF9BVVRPX0NMT1NFX1NFQyxcclxuICBTRVRUSU5HU19TQVZFX01BWF9SRVRSSUVTLFxyXG4gIFNFVFRJTkdTX1NBVkVfUkVUUllfREVMQVlfTVMsXHJcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBsb2dEZWJ1ZywgbG9nRXJyb3IgfSBmcm9tICcuL2xvZ2dlcic7XHJcblxyXG4vLyDilIDilIDilIAgVHlwZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFdlYlBQVFNsaWRlQ29uZmlnIHtcclxuICB1cmw6IHN0cmluZztcclxuICB6b29tOiBudW1iZXI7ICAgICAgICAgIC8vIDUw4oCTMzAwXHJcbiAgZGlhbG9nV2lkdGg6IG51bWJlcjsgICAvLyAzMOKAkzEwMCAoJSBvZiBzY3JlZW4pXHJcbiAgZGlhbG9nSGVpZ2h0OiBudW1iZXI7ICAvLyAzMOKAkzEwMCAoJSBvZiBzY3JlZW4pXHJcbiAgYXV0b09wZW46IGJvb2xlYW47XHJcbiAgYXV0b0Nsb3NlU2VjOiBudW1iZXI7ICAvLyAwID0gZGlzYWJsZWQsIDHigJM2MCBzZWNvbmRzXHJcbn1cclxuXHJcbmludGVyZmFjZSBTYXZlUmVzdWx0IHtcclxuICBzdGF0dXM6IHN0cmluZztcclxuICBlcnJvcjogeyBtZXNzYWdlOiBzdHJpbmcgfSB8IG51bGw7XHJcbn1cclxuXHJcbi8qKiBNaW5pbWFsIHN1YnNldCBvZiBPZmZpY2UuU2V0dGluZ3MgdXNlZCBieSB0aGlzIG1vZHVsZS4gKi9cclxuaW50ZXJmYWNlIFNldHRpbmdzU3RvcmUge1xyXG4gIGdldChuYW1lOiBzdHJpbmcpOiB1bmtub3duO1xyXG4gIHNldChuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZDtcclxuICByZW1vdmUobmFtZTogc3RyaW5nKTogdm9pZDtcclxuICBzYXZlQXN5bmMoY2FsbGJhY2s6IChyZXN1bHQ6IFNhdmVSZXN1bHQpID0+IHZvaWQpOiB2b2lkO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVwZW5kZW5jeSBpbmplY3Rpb24gKGZvciB0ZXN0aW5nKSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmxldCBfaW5qZWN0ZWRTdG9yZTogU2V0dGluZ3NTdG9yZSB8IG51bGwgPSBudWxsO1xyXG5cclxuLyoqXHJcbiAqIE92ZXJyaWRlIHRoZSBPZmZpY2Ugc2V0dGluZ3Mgc3RvcmUuIFBhc3MgYG51bGxgIHRvIHJlc3RvcmUgdGhlIHJlYWwgb25lLlxyXG4gKiBAaW50ZXJuYWwgVXNlZCBpbiB1bml0IHRlc3RzIG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX2luamVjdFNldHRpbmdzU3RvcmUoc3RvcmU6IFNldHRpbmdzU3RvcmUgfCBudWxsKTogdm9pZCB7XHJcbiAgX2luamVjdGVkU3RvcmUgPSBzdG9yZTtcclxufVxyXG5cclxuLyoqIEluLW1lbW9yeSBmYWxsYmFjayB3aGVuIHJ1bm5pbmcgb3V0c2lkZSBQb3dlclBvaW50IChlLmcuIGJyb3dzZXIgdGVzdGluZykuICovXHJcbmNvbnN0IF9tZW1vcnlTdG9yZTogU2V0dGluZ3NTdG9yZSA9ICgoKSA9PiB7XHJcbiAgY29uc3QgZGF0YSA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpO1xyXG4gIHJldHVybiB7XHJcbiAgICBnZXQ6IChuYW1lOiBzdHJpbmcpID0+IGRhdGEuZ2V0KG5hbWUpID8/IG51bGwsXHJcbiAgICBzZXQ6IChuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSA9PiB7IGRhdGEuc2V0KG5hbWUsIHZhbHVlKTsgfSxcclxuICAgIHJlbW92ZTogKG5hbWU6IHN0cmluZykgPT4geyBkYXRhLmRlbGV0ZShuYW1lKTsgfSxcclxuICAgIHNhdmVBc3luYzogKGNiOiAocjogU2F2ZVJlc3VsdCkgPT4gdm9pZCkgPT4geyBjYih7IHN0YXR1czogJ3N1Y2NlZWRlZCcsIGVycm9yOiBudWxsIH0pOyB9LFxyXG4gIH07XHJcbn0pKCk7XHJcblxyXG5mdW5jdGlvbiBnZXRTdG9yZSgpOiBTZXR0aW5nc1N0b3JlIHtcclxuICBpZiAoX2luamVjdGVkU3RvcmUpIHJldHVybiBfaW5qZWN0ZWRTdG9yZTtcclxuICAvKiBnbG9iYWwgT2ZmaWNlICovXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNldHRpbmdzID0gT2ZmaWNlLmNvbnRleHQ/LmRvY3VtZW50Py5zZXR0aW5ncztcclxuICAgIGlmIChzZXR0aW5ncykgcmV0dXJuIHNldHRpbmdzIGFzIHVua25vd24gYXMgU2V0dGluZ3NTdG9yZTtcclxuICB9IGNhdGNoIHsgLyogb3V0c2lkZSBPZmZpY2UgaG9zdCAqLyB9XHJcbiAgcmV0dXJuIF9tZW1vcnlTdG9yZTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEludGVybmFsIGhlbHBlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBzbGlkZUtleShzbGlkZUlkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBgJHtTRVRUSU5HX0tFWV9TTElERV9QUkVGSVh9JHtzbGlkZUlkfWA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVPbmNlKHN0b3JlOiBTZXR0aW5nc1N0b3JlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIHN0b3JlLnNhdmVBc3luYygocmVzdWx0KSA9PiB7XHJcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnZmFpbGVkJykge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IocmVzdWx0LmVycm9yPy5tZXNzYWdlID8/ICdTZXR0aW5ncyBzYXZlIGZhaWxlZCcpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkZWxheShtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYXZlIHNldHRpbmdzIHdpdGggYXV0b21hdGljIHJldHJ5LlxyXG4gKiBSZXRyaWVzIHVwIHRvIHtAbGluayBTRVRUSU5HU19TQVZFX01BWF9SRVRSSUVTfSB0aW1lcyB3aXRoIGEgZGVsYXkgYmV0d2VlbiBhdHRlbXB0cy5cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmUoc3RvcmU6IFNldHRpbmdzU3RvcmUpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8PSBTRVRUSU5HU19TQVZFX01BWF9SRVRSSUVTOyBhdHRlbXB0KyspIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHNhdmVPbmNlKHN0b3JlKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGlmIChhdHRlbXB0IDwgU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFUykge1xyXG4gICAgICAgIGxvZ0RlYnVnKGBTZXR0aW5ncyBzYXZlIGF0dGVtcHQgJHthdHRlbXB0ICsgMX0gZmFpbGVkLCByZXRyeWluZy4uLmApO1xyXG4gICAgICAgIGF3YWl0IGRlbGF5KFNFVFRJTkdTX1NBVkVfUkVUUllfREVMQVlfTVMpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxvZ0Vycm9yKCdTZXR0aW5ncyBzYXZlIGZhaWxlZCBhZnRlciBhbGwgcmV0cmllczonLCBlcnIpO1xyXG4gICAgICAgIHRocm93IGVycjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNsaWRlIGNvbmZpZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBSZXR1cm5zIHRoZSBzYXZlZCBjb25maWcgZm9yIGEgc2xpZGUsIG9yIGBudWxsYCBpZiBub3Qgc2V0LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2xpZGVDb25maWcoc2xpZGVJZDogc3RyaW5nKTogV2ViUFBUU2xpZGVDb25maWcgfCBudWxsIHtcclxuICBjb25zdCByYXcgPSBnZXRTdG9yZSgpLmdldChzbGlkZUtleShzbGlkZUlkKSk7XHJcbiAgcmV0dXJuIHJhdyA/IChyYXcgYXMgV2ViUFBUU2xpZGVDb25maWcpIDogbnVsbDtcclxufVxyXG5cclxuLyoqIFNhdmVzIGNvbmZpZyBmb3IgYSBzbGlkZSBhbmQgcGVyc2lzdHMgdG8gZG9jdW1lbnQuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTbGlkZUNvbmZpZyhzbGlkZUlkOiBzdHJpbmcsIGNvbmZpZzogV2ViUFBUU2xpZGVDb25maWcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBzdG9yZSA9IGdldFN0b3JlKCk7XHJcbiAgc3RvcmUuc2V0KHNsaWRlS2V5KHNsaWRlSWQpLCBjb25maWcpO1xyXG4gIGF3YWl0IHNhdmUoc3RvcmUpO1xyXG59XHJcblxyXG4vKiogUmVtb3ZlcyB0aGUgc2F2ZWQgY29uZmlnIGZvciBhIHNsaWRlLiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlU2xpZGVDb25maWcoc2xpZGVJZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnJlbW92ZShzbGlkZUtleShzbGlkZUlkKSk7XHJcbiAgYXdhaXQgc2F2ZShzdG9yZSk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBMYW5ndWFnZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBSZXR1cm5zIHRoZSBzYXZlZCBVSSBsYW5ndWFnZSwgb3IgYG51bGxgIGlmIG5vdCBzZXQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRMYW5ndWFnZSgpOiBMb2NhbGUgfCBudWxsIHtcclxuICByZXR1cm4gKGdldFN0b3JlKCkuZ2V0KFNFVFRJTkdfS0VZX0xBTkdVQUdFKSBhcyBMb2NhbGUpID8/IG51bGw7XHJcbn1cclxuXHJcbi8qKiBTYXZlcyB0aGUgVUkgbGFuZ3VhZ2UgYW5kIHBlcnNpc3RzIHRvIGRvY3VtZW50LiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0TGFuZ3VhZ2UobG9jYWxlOiBMb2NhbGUpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBzdG9yZSA9IGdldFN0b3JlKCk7XHJcbiAgc3RvcmUuc2V0KFNFVFRJTkdfS0VZX0xBTkdVQUdFLCBsb2NhbGUpO1xyXG4gIGF3YWl0IHNhdmUoc3RvcmUpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVmYXVsdHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUmV0dXJucyBzYXZlZCBnbG9iYWwgZGVmYXVsdHMsIG9yIGJ1aWx0LWluIGRlZmF1bHRzIGlmIG5vdCBzZXQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0cygpOiBXZWJQUFRTbGlkZUNvbmZpZyB7XHJcbiAgY29uc3Qgc3RvcmVkID0gZ2V0U3RvcmUoKS5nZXQoU0VUVElOR19LRVlfREVGQVVMVFMpIGFzIFdlYlBQVFNsaWRlQ29uZmlnIHwgbnVsbDtcclxuICByZXR1cm4gc3RvcmVkID8/IHtcclxuICAgIHVybDogJycsXHJcbiAgICB6b29tOiBERUZBVUxUX1pPT00sXHJcbiAgICBkaWFsb2dXaWR0aDogREVGQVVMVF9ESUFMT0dfV0lEVEgsXHJcbiAgICBkaWFsb2dIZWlnaHQ6IERFRkFVTFRfRElBTE9HX0hFSUdIVCxcclxuICAgIGF1dG9PcGVuOiBERUZBVUxUX0FVVE9fT1BFTixcclxuICAgIGF1dG9DbG9zZVNlYzogREVGQVVMVF9BVVRPX0NMT1NFX1NFQyxcclxuICB9O1xyXG59XHJcblxyXG4vKiogU2F2ZXMgZ2xvYmFsIGRlZmF1bHRzIGFuZCBwZXJzaXN0cyB0byBkb2N1bWVudC4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldERlZmF1bHRzKGNvbmZpZzogV2ViUFBUU2xpZGVDb25maWcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBzdG9yZSA9IGdldFN0b3JlKCk7XHJcbiAgc3RvcmUuc2V0KFNFVFRJTkdfS0VZX0RFRkFVTFRTLCBjb25maWcpO1xyXG4gIGF3YWl0IHNhdmUoc3RvcmUpO1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGkxOG4sIHR5cGUgTG9jYWxlLCB0eXBlIFRyYW5zbGF0aW9uS2V5IH0gZnJvbSAnLi4vc2hhcmVkL2kxOG4nO1xyXG5pbXBvcnQgeyBnZXRTbGlkZUNvbmZpZywgc2V0U2xpZGVDb25maWcsIGdldExhbmd1YWdlLCBzZXRMYW5ndWFnZSwgZ2V0RGVmYXVsdHMsIHNldERlZmF1bHRzIH0gZnJvbSAnLi4vc2hhcmVkL3NldHRpbmdzJztcclxuaW1wb3J0IHsgRGlhbG9nTGF1bmNoZXIsIERpYWxvZ0Vycm9yIH0gZnJvbSAnLi4vc2hhcmVkL2RpYWxvZy1sYXVuY2hlcic7XHJcbmltcG9ydCB7IGxvZ0RlYnVnLCBsb2dFcnJvciwgaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIgfSBmcm9tICcuLi9zaGFyZWQvbG9nZ2VyJztcclxuaW1wb3J0IHsgQVVUT19DTE9TRV9TVEVQUywgdHJ1bmNhdGVVcmwgfSBmcm9tICcuLi9zaGFyZWQvY29uc3RhbnRzJztcclxuXHJcbi8vIOKUgOKUgOKUgCBET00gcmVmZXJlbmNlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmNvbnN0ICQgPSA8VCBleHRlbmRzIEhUTUxFbGVtZW50PihpZDogc3RyaW5nKTogVCA9PlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSBhcyBUO1xyXG5cclxubGV0IHVybElucHV0OiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgYnRuQXBwbHk6IEhUTUxCdXR0b25FbGVtZW50O1xyXG5sZXQgYnRuU2hvdzogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbmxldCBidG5EZWZhdWx0cyE6IEhUTUxCdXR0b25FbGVtZW50O1xyXG5sZXQgc3RhdHVzRWw6IEhUTUxFbGVtZW50O1xyXG5sZXQgc2xpZGVOdW1iZXJFbDogSFRNTEVsZW1lbnQ7XHJcbmxldCBsYW5nU2VsZWN0OiBIVE1MU2VsZWN0RWxlbWVudDtcclxubGV0IHNsaWRlcldpZHRoITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlckhlaWdodCE6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJab29tITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlcldpZHRoVmFsdWUhOiBIVE1MRWxlbWVudDtcclxubGV0IHNsaWRlckhlaWdodFZhbHVlITogSFRNTEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJab29tVmFsdWUhOiBIVE1MRWxlbWVudDtcclxubGV0IHNpemVQcmV2aWV3SW5uZXIhOiBIVE1MRWxlbWVudDtcclxubGV0IGNoa0F1dG9PcGVuITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IGNoa0xvY2tTaXplITogSFRNTElucHV0RWxlbWVudDtcclxubGV0IHNsaWRlckF1dG9DbG9zZSE6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJBdXRvQ2xvc2VWYWx1ZSE6IEhUTUxFbGVtZW50O1xyXG5sZXQgcHJlc2V0QnV0dG9ucyE6IE5vZGVMaXN0T2Y8SFRNTEJ1dHRvbkVsZW1lbnQ+O1xyXG5sZXQgdmlld2VyU3RhdHVzRWwhOiBIVE1MRWxlbWVudDtcclxubGV0IHZpZXdlclN0YXR1c1RleHQhOiBIVE1MRWxlbWVudDtcclxuXHJcbi8vIOKUgOKUgOKUgCBTdGF0ZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmxldCBjdXJyZW50U2xpZGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbmxldCBjdXJyZW50U2xpZGVJbmRleDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcbmNvbnN0IGxhdW5jaGVyID0gbmV3IERpYWxvZ0xhdW5jaGVyKCk7XHJcbmxldCB2aWV3ZXJTdGF0dXNUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcclxuXHJcbi8vIOKUgOKUgOKUgCBpMThuIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gYXBwbHlJMThuKCk6IHZvaWQge1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCdbZGF0YS1pMThuXScpLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICBjb25zdCBrZXkgPSBlbC5kYXRhc2V0LmkxOG4gYXMgVHJhbnNsYXRpb25LZXk7XHJcbiAgICBlbC50ZXh0Q29udGVudCA9IGkxOG4udChrZXkpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxJbnB1dEVsZW1lbnQ+KCdbZGF0YS1pMThuLXBsYWNlaG9sZGVyXScpLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICBjb25zdCBrZXkgPSBlbC5kYXRhc2V0LmkxOG5QbGFjZWhvbGRlciBhcyBUcmFuc2xhdGlvbktleTtcclxuICAgIGVsLnBsYWNlaG9sZGVyID0gaTE4bi50KGtleSk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCdbZGF0YS1pMThuLXRpdGxlXScpLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICBjb25zdCBrZXkgPSBlbC5kYXRhc2V0LmkxOG5UaXRsZSBhcyBUcmFuc2xhdGlvbktleTtcclxuICAgIGVsLnRpdGxlID0gaTE4bi50KGtleSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEtlZXAgPGh0bWwgbGFuZz4gaW4gc3luYyB3aXRoIHRoZSBhY3RpdmUgbG9jYWxlXHJcbiAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcgPSBpMThuLmdldExvY2FsZSgpO1xyXG5cclxuICAvLyBHdWlkZSB0b2dnbGUgYnV0dG9uIHVzZXMgZGF0YS1pMThuPVwic2l0ZU5vdExvYWRpbmdcIiwgYnV0IHdoZW4gdGhlIGd1aWRlXHJcbiAgLy8gaXMgY3VycmVudGx5IG9wZW4gdGhlIGxhYmVsIHNob3VsZCByZWFkIFwiaGlkZVNldHVwR3VpZGVcIiBpbnN0ZWFkLlxyXG4gIGNvbnN0IGd1aWRlU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdndWlkZS1zZWN0aW9uJyk7XHJcbiAgaWYgKGd1aWRlU2VjdGlvbiAmJiAhZ3VpZGVTZWN0aW9uLmhpZGRlbikge1xyXG4gICAgY29uc3QgdG9nZ2xlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1ndWlkZS10b2dnbGUnKTtcclxuICAgIGlmICh0b2dnbGVCdG4pIHtcclxuICAgICAgdG9nZ2xlQnRuLnRleHRDb250ZW50ID0gaTE4bi50KCdoaWRlU2V0dXBHdWlkZScpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNsaWRlIGRldGVjdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGRldGVjdEN1cnJlbnRTbGlkZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgUG93ZXJQb2ludC5ydW4oYXN5bmMgKGNvbnRleHQpID0+IHtcclxuICAgICAgY29uc3Qgc2xpZGVzID0gY29udGV4dC5wcmVzZW50YXRpb24uZ2V0U2VsZWN0ZWRTbGlkZXMoKTtcclxuICAgICAgc2xpZGVzLmxvYWQoJ2l0ZW1zL2lkJyk7XHJcbiAgICAgIGF3YWl0IGNvbnRleHQuc3luYygpO1xyXG5cclxuICAgICAgaWYgKHNsaWRlcy5pdGVtcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3Qgc2xpZGUgPSBzbGlkZXMuaXRlbXNbMF07XHJcbiAgICAgICAgY3VycmVudFNsaWRlSWQgPSBzbGlkZS5pZDtcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIDEtYmFzZWQgaW5kZXhcclxuICAgICAgICBjb25zdCBhbGxTbGlkZXMgPSBjb250ZXh0LnByZXNlbnRhdGlvbi5zbGlkZXM7XHJcbiAgICAgICAgYWxsU2xpZGVzLmxvYWQoJ2l0ZW1zL2lkJyk7XHJcbiAgICAgICAgYXdhaXQgY29udGV4dC5zeW5jKCk7XHJcblxyXG4gICAgICAgIGN1cnJlbnRTbGlkZUluZGV4ID0gbnVsbDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbFNsaWRlcy5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKGFsbFNsaWRlcy5pdGVtc1tpXS5pZCA9PT0gY3VycmVudFNsaWRlSWQpIHtcclxuICAgICAgICAgICAgY3VycmVudFNsaWRlSW5kZXggPSBpICsgMTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9IGNhdGNoIHtcclxuICAgIGN1cnJlbnRTbGlkZUlkID0gbnVsbDtcclxuICAgIGN1cnJlbnRTbGlkZUluZGV4ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIHVwZGF0ZVNsaWRlVUkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlU2l6ZVByZXZpZXcoKTogdm9pZCB7XHJcbiAgY29uc3QgdyA9IE51bWJlcihzbGlkZXJXaWR0aC52YWx1ZSk7XHJcbiAgY29uc3QgaCA9IE51bWJlcihzbGlkZXJIZWlnaHQudmFsdWUpO1xyXG4gIC8vIFByZXZpZXcgYm94IGlzIDY0w5c0ODsgc2NhbGUgcHJvcG9ydGlvbmFsbHlcclxuICBzaXplUHJldmlld0lubmVyLnN0eWxlLndpZHRoID0gYCR7KHcgLyAxMDApICogNTh9cHhgO1xyXG4gIHNpemVQcmV2aWV3SW5uZXIuc3R5bGUuaGVpZ2h0ID0gYCR7KGggLyAxMDApICogNDJ9cHhgO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmb3JtYXRBdXRvQ2xvc2VMYWJlbChzZWM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgaWYgKHNlYyA9PT0gMCkgcmV0dXJuIGkxOG4udCgnYXV0b0Nsb3NlT2ZmJyk7XHJcbiAgaWYgKHNlYyA8IDYwKSByZXR1cm4gYCR7c2VjfXNgO1xyXG4gIGNvbnN0IG0gPSBNYXRoLmZsb29yKHNlYyAvIDYwKTtcclxuICBjb25zdCBzID0gc2VjICUgNjA7XHJcbiAgaWYgKHNlYyA+PSAzNjAwKSByZXR1cm4gYCR7TWF0aC5mbG9vcihzZWMgLyAzNjAwKX1oYDtcclxuICByZXR1cm4gcyA9PT0gMCA/IGAke219bWAgOiBgJHttfW0gJHtzfXNgO1xyXG59XHJcblxyXG4vKiogQ29udmVydCBzZWNvbmRzIHZhbHVlIOKGkiBuZWFyZXN0IHNsaWRlciBpbmRleC4gKi9cclxuZnVuY3Rpb24gc2Vjb25kc1RvU2xpZGVySW5kZXgoc2VjOiBudW1iZXIpOiBudW1iZXIge1xyXG4gIGxldCBiZXN0ID0gMDtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IEFVVE9fQ0xPU0VfU1RFUFMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChNYXRoLmFicyhBVVRPX0NMT1NFX1NURVBTW2ldIC0gc2VjKSA8IE1hdGguYWJzKEFVVE9fQ0xPU0VfU1RFUFNbYmVzdF0gLSBzZWMpKSB7XHJcbiAgICAgIGJlc3QgPSBpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYmVzdDtcclxufVxyXG5cclxuLyoqIFJlYWQgYWN0dWFsIHNlY29uZHMgZnJvbSB0aGUgY3VycmVudCBzbGlkZXIgcG9zaXRpb24uICovXHJcbmZ1bmN0aW9uIGdldEF1dG9DbG9zZVNlY29uZHMoKTogbnVtYmVyIHtcclxuICByZXR1cm4gQVVUT19DTE9TRV9TVEVQU1tOdW1iZXIoc2xpZGVyQXV0b0Nsb3NlLnZhbHVlKV0gPz8gMDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0U2xpZGVyVUkod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHpvb206IG51bWJlciwgYXV0b09wZW46IGJvb2xlYW4sIGF1dG9DbG9zZVNlYzogbnVtYmVyKTogdm9pZCB7XHJcbiAgc2xpZGVyV2lkdGgudmFsdWUgPSBTdHJpbmcod2lkdGgpO1xyXG4gIHNsaWRlckhlaWdodC52YWx1ZSA9IFN0cmluZyhoZWlnaHQpO1xyXG4gIHNsaWRlclpvb20udmFsdWUgPSBTdHJpbmcoem9vbSk7XHJcbiAgc2xpZGVyV2lkdGhWYWx1ZS50ZXh0Q29udGVudCA9IGAke3dpZHRofSVgO1xyXG4gIHNsaWRlckhlaWdodFZhbHVlLnRleHRDb250ZW50ID0gYCR7aGVpZ2h0fSVgO1xyXG4gIHNsaWRlclpvb21WYWx1ZS50ZXh0Q29udGVudCA9IGAke3pvb219JWA7XHJcbiAgY2hrQXV0b09wZW4uY2hlY2tlZCA9IGF1dG9PcGVuO1xyXG4gIHNsaWRlckF1dG9DbG9zZS52YWx1ZSA9IFN0cmluZyhzZWNvbmRzVG9TbGlkZXJJbmRleChhdXRvQ2xvc2VTZWMpKTtcclxuICBzbGlkZXJBdXRvQ2xvc2VWYWx1ZS50ZXh0Q29udGVudCA9IGZvcm1hdEF1dG9DbG9zZUxhYmVsKGF1dG9DbG9zZVNlYyk7XHJcbiAgdXBkYXRlU2l6ZVByZXZpZXcoKTtcclxuICB1cGRhdGVBY3RpdmVQcmVzZXQoem9vbSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUFjdGl2ZVByZXNldCh6b29tOiBudW1iZXIpOiB2b2lkIHtcclxuICBwcmVzZXRCdXR0b25zLmZvckVhY2goKGJ0bikgPT4ge1xyXG4gICAgY29uc3QgdmFsID0gTnVtYmVyKGJ0bi5kYXRhc2V0Lnpvb20pO1xyXG4gICAgYnRuLmNsYXNzTGlzdC50b2dnbGUoJ2J0bi1wcmVzZXQtLWFjdGl2ZScsIHZhbCA9PT0gem9vbSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVNsaWRlVUkoKTogdm9pZCB7XHJcbiAgc2xpZGVOdW1iZXJFbC50ZXh0Q29udGVudCA9IGN1cnJlbnRTbGlkZUluZGV4ICE9IG51bGwgPyBTdHJpbmcoY3VycmVudFNsaWRlSW5kZXgpIDogJ+KAlCc7XHJcblxyXG4gIGNvbnN0IGRlZmF1bHRzID0gZ2V0RGVmYXVsdHMoKTtcclxuXHJcbiAgaWYgKGN1cnJlbnRTbGlkZUlkKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBnZXRTbGlkZUNvbmZpZyhjdXJyZW50U2xpZGVJZCk7XHJcbiAgICB1cmxJbnB1dC52YWx1ZSA9IGNvbmZpZz8udXJsID8/ICcnO1xyXG4gICAgc2V0U2xpZGVyVUkoXHJcbiAgICAgIGNvbmZpZz8uZGlhbG9nV2lkdGggPz8gZGVmYXVsdHMuZGlhbG9nV2lkdGgsXHJcbiAgICAgIGNvbmZpZz8uZGlhbG9nSGVpZ2h0ID8/IGRlZmF1bHRzLmRpYWxvZ0hlaWdodCxcclxuICAgICAgY29uZmlnPy56b29tID8/IGRlZmF1bHRzLnpvb20sXHJcbiAgICAgIGNvbmZpZz8uYXV0b09wZW4gPz8gZGVmYXVsdHMuYXV0b09wZW4sXHJcbiAgICAgIGNvbmZpZz8uYXV0b0Nsb3NlU2VjID8/IGRlZmF1bHRzLmF1dG9DbG9zZVNlYyxcclxuICAgICk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHVybElucHV0LnZhbHVlID0gJyc7XHJcbiAgICBzZXRTbGlkZXJVSShkZWZhdWx0cy5kaWFsb2dXaWR0aCwgZGVmYXVsdHMuZGlhbG9nSGVpZ2h0LCBkZWZhdWx0cy56b29tLCBkZWZhdWx0cy5hdXRvT3BlbiwgZGVmYXVsdHMuYXV0b0Nsb3NlU2VjKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZVNob3dCdXR0b25TdGF0ZSgpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgVVJMIHZhbGlkYXRpb24gJiBub3JtYWxpemF0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqXHJcbiAqIEF1dG8tcHJlcGVuZCBgaHR0cHM6Ly9gIGlmIHRoZSB1c2VyIG9taXR0ZWQgdGhlIHByb3RvY29sLlxyXG4gKiBSZXR1cm5zIHRoZSBub3JtYWxpemVkIFVSTCBzdHJpbmcuXHJcbiAqL1xyXG5mdW5jdGlvbiBub3JtYWxpemVVcmwodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgdHJpbW1lZCA9IHZhbHVlLnRyaW0oKTtcclxuICBpZiAoIXRyaW1tZWQpIHJldHVybiB0cmltbWVkO1xyXG4gIGlmICghL15odHRwcz86XFwvXFwvL2kudGVzdCh0cmltbWVkKSkge1xyXG4gICAgcmV0dXJuIGBodHRwczovLyR7dHJpbW1lZH1gO1xyXG4gIH1cclxuICByZXR1cm4gdHJpbW1lZDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNWYWxpZFVybCh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgaWYgKCF2YWx1ZS50cmltKCkpIHJldHVybiBmYWxzZTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgdSA9IG5ldyBVUkwodmFsdWUpO1xyXG4gICAgcmV0dXJuIHUucHJvdG9jb2wgPT09ICdodHRwOicgfHwgdS5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgU3RhdHVzIG1lc3NhZ2VzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gc2hvd1N0YXR1cyhrZXk6IFRyYW5zbGF0aW9uS2V5LCB0eXBlOiAnc3VjY2VzcycgfCAnZXJyb3InKTogdm9pZCB7XHJcbiAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSBpMThuLnQoa2V5KTtcclxuICBzdGF0dXNFbC5jbGFzc05hbWUgPSBgc3RhdHVzIHN0YXR1cy0ke3R5cGV9YDtcclxuICBzdGF0dXNFbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCB0eXBlID09PSAnZXJyb3InID8gJ2FsZXJ0JyA6ICdzdGF0dXMnKTtcclxuICBzdGF0dXNFbC5oaWRkZW4gPSBmYWxzZTtcclxuXHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBzdGF0dXNFbC5oaWRkZW4gPSB0cnVlO1xyXG4gIH0sIDMwMDApO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2hvdyBidXR0b24gc3RhdGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogRGlzYWJsZSBcIlNob3cgV2ViIFBhZ2VcIiB3aGVuIHRoZXJlIGlzIG5vIHNhdmVkIFVSTCBmb3IgdGhlIGN1cnJlbnQgc2xpZGUuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZVNob3dCdXR0b25TdGF0ZSgpOiB2b2lkIHtcclxuICBjb25zdCBoYXNVcmwgPSBjdXJyZW50U2xpZGVJZFxyXG4gICAgPyAhIWdldFNsaWRlQ29uZmlnKGN1cnJlbnRTbGlkZUlkKT8udXJsXHJcbiAgICA6IGZhbHNlO1xyXG4gIGJ0blNob3cuZGlzYWJsZWQgPSAhaGFzVXJsO1xyXG4gIGJ0blNob3cudGl0bGUgPSBoYXNVcmxcclxuICAgID8gdHJ1bmNhdGVVcmwoZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQhKSEudXJsKVxyXG4gICAgOiBpMThuLnQoJ25vVXJsRm9yU2xpZGUnKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEFwcGx5IGhhbmRsZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBcHBseSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoIWN1cnJlbnRTbGlkZUlkKSB7XHJcbiAgICBzaG93U3RhdHVzKCdzZWxlY3RTbGlkZScsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQXV0by1maXggbWlzc2luZyBwcm90b2NvbFxyXG4gIGxldCB1cmwgPSBub3JtYWxpemVVcmwodXJsSW5wdXQudmFsdWUpO1xyXG4gIGlmICh1cmwgIT09IHVybElucHV0LnZhbHVlLnRyaW0oKSAmJiB1cmwpIHtcclxuICAgIHVybElucHV0LnZhbHVlID0gdXJsO1xyXG4gICAgc2hvd1N0YXR1cygndXJsQXV0b0ZpeGVkJywgJ3N1Y2Nlc3MnKTtcclxuICB9XHJcblxyXG4gIGlmICghaXNWYWxpZFVybCh1cmwpKSB7XHJcbiAgICBzaG93U3RhdHVzKCdub1VybCcsICdlcnJvcicpO1xyXG4gICAgdXJsSW5wdXQuZm9jdXMoKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBzZXRTbGlkZUNvbmZpZyhjdXJyZW50U2xpZGVJZCwge1xyXG4gICAgICB1cmwsXHJcbiAgICAgIHpvb206IE51bWJlcihzbGlkZXJab29tLnZhbHVlKSxcclxuICAgICAgZGlhbG9nV2lkdGg6IE51bWJlcihzbGlkZXJXaWR0aC52YWx1ZSksXHJcbiAgICAgIGRpYWxvZ0hlaWdodDogTnVtYmVyKHNsaWRlckhlaWdodC52YWx1ZSksXHJcbiAgICAgIGF1dG9PcGVuOiBjaGtBdXRvT3Blbi5jaGVja2VkLFxyXG4gICAgICBhdXRvQ2xvc2VTZWM6IGdldEF1dG9DbG9zZVNlY29uZHMoKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHNob3dTdGF0dXMoJ3N1Y2Nlc3MnLCAnc3VjY2VzcycpO1xyXG4gICAgdXBkYXRlU2hvd0J1dHRvblN0YXRlKCk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBsb2dFcnJvcignRmFpbGVkIHRvIHNhdmUgc2xpZGUgY29uZmlnOicsIGVycik7XHJcbiAgICBzaG93U3RhdHVzKCdzZXR0aW5nc1NhdmVSZXRyeUZhaWxlZCcsICdlcnJvcicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNldCBhcyBkZWZhdWx0cyBoYW5kbGVyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2V0RGVmYXVsdHMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNldERlZmF1bHRzKHtcclxuICAgICAgdXJsOiAnJyxcclxuICAgICAgem9vbTogTnVtYmVyKHNsaWRlclpvb20udmFsdWUpLFxyXG4gICAgICBkaWFsb2dXaWR0aDogTnVtYmVyKHNsaWRlcldpZHRoLnZhbHVlKSxcclxuICAgICAgZGlhbG9nSGVpZ2h0OiBOdW1iZXIoc2xpZGVySGVpZ2h0LnZhbHVlKSxcclxuICAgICAgYXV0b09wZW46IGNoa0F1dG9PcGVuLmNoZWNrZWQsXHJcbiAgICAgIGF1dG9DbG9zZVNlYzogZ2V0QXV0b0Nsb3NlU2Vjb25kcygpLFxyXG4gICAgfSk7XHJcbiAgICBzaG93U3RhdHVzKCdkZWZhdWx0c1NhdmVkJywgJ3N1Y2Nlc3MnKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGxvZ0Vycm9yKCdGYWlsZWQgdG8gc2F2ZSBkZWZhdWx0czonLCBlcnIpO1xyXG4gICAgc2hvd1N0YXR1cygnc2V0dGluZ3NTYXZlUmV0cnlGYWlsZWQnLCAnZXJyb3InKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTbGlkZXIgLyBwcmVzZXQgaGFuZGxlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBoYW5kbGVXaWR0aElucHV0KCk6IHZvaWQge1xyXG4gIHNsaWRlcldpZHRoVmFsdWUudGV4dENvbnRlbnQgPSBgJHtzbGlkZXJXaWR0aC52YWx1ZX0lYDtcclxuICBpZiAoY2hrTG9ja1NpemUuY2hlY2tlZCkge1xyXG4gICAgc2xpZGVySGVpZ2h0LnZhbHVlID0gc2xpZGVyV2lkdGgudmFsdWU7XHJcbiAgICBzbGlkZXJIZWlnaHRWYWx1ZS50ZXh0Q29udGVudCA9IGAke3NsaWRlckhlaWdodC52YWx1ZX0lYDtcclxuICB9XHJcbiAgdXBkYXRlU2l6ZVByZXZpZXcoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlSGVpZ2h0SW5wdXQoKTogdm9pZCB7XHJcbiAgc2xpZGVySGVpZ2h0VmFsdWUudGV4dENvbnRlbnQgPSBgJHtzbGlkZXJIZWlnaHQudmFsdWV9JWA7XHJcbiAgaWYgKGNoa0xvY2tTaXplLmNoZWNrZWQpIHtcclxuICAgIHNsaWRlcldpZHRoLnZhbHVlID0gc2xpZGVySGVpZ2h0LnZhbHVlO1xyXG4gICAgc2xpZGVyV2lkdGhWYWx1ZS50ZXh0Q29udGVudCA9IGAke3NsaWRlcldpZHRoLnZhbHVlfSVgO1xyXG4gIH1cclxuICB1cGRhdGVTaXplUHJldmlldygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVab29tSW5wdXQoKTogdm9pZCB7XHJcbiAgY29uc3QgdmFsID0gTnVtYmVyKHNsaWRlclpvb20udmFsdWUpO1xyXG4gIHNsaWRlclpvb21WYWx1ZS50ZXh0Q29udGVudCA9IGAke3ZhbH0lYDtcclxuICB1cGRhdGVBY3RpdmVQcmVzZXQodmFsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlUHJlc2V0Q2xpY2soZTogRXZlbnQpOiB2b2lkIHtcclxuICBjb25zdCBidG4gPSAoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsb3Nlc3Q8SFRNTEJ1dHRvbkVsZW1lbnQ+KCcuYnRuLXByZXNldCcpO1xyXG4gIGlmICghYnRuPy5kYXRhc2V0Lnpvb20pIHJldHVybjtcclxuICBjb25zdCB2YWwgPSBOdW1iZXIoYnRuLmRhdGFzZXQuem9vbSk7XHJcbiAgc2xpZGVyWm9vbS52YWx1ZSA9IFN0cmluZyh2YWwpO1xyXG4gIHNsaWRlclpvb21WYWx1ZS50ZXh0Q29udGVudCA9IGAke3ZhbH0lYDtcclxuICB1cGRhdGVBY3RpdmVQcmVzZXQodmFsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlTG9ja1NpemVDaGFuZ2UoKTogdm9pZCB7XHJcbiAgaWYgKGNoa0xvY2tTaXplLmNoZWNrZWQpIHtcclxuICAgIC8vIFN5bmMgaGVpZ2h0IHRvIHdpZHRoXHJcbiAgICBzbGlkZXJIZWlnaHQudmFsdWUgPSBzbGlkZXJXaWR0aC52YWx1ZTtcclxuICAgIHNsaWRlckhlaWdodFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVySGVpZ2h0LnZhbHVlfSVgO1xyXG4gICAgdXBkYXRlU2l6ZVByZXZpZXcoKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUF1dG9DbG9zZUlucHV0KCk6IHZvaWQge1xyXG4gIHNsaWRlckF1dG9DbG9zZVZhbHVlLnRleHRDb250ZW50ID0gZm9ybWF0QXV0b0Nsb3NlTGFiZWwoZ2V0QXV0b0Nsb3NlU2Vjb25kcygpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlSW5mb1RvZ2dsZShoaW50SWQ6IHN0cmluZywgYnRuSWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gIGNvbnN0IGhpbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChoaW50SWQpO1xyXG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJ0bklkKTtcclxuICBpZiAoIWhpbnQgfHwgIWJ0bikgcmV0dXJuO1xyXG4gIGNvbnN0IHNob3cgPSBoaW50LmhpZGRlbjtcclxuICBoaW50LmhpZGRlbiA9ICFzaG93O1xyXG4gIGJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcoc2hvdykpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVBdXRvT3BlbkluZm9Ub2dnbGUoKTogdm9pZCB7XHJcbiAgaGFuZGxlSW5mb1RvZ2dsZSgnYXV0b29wZW4taGludCcsICdidG4tYXV0b29wZW4taW5mbycpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVBdXRvQ2xvc2VJbmZvVG9nZ2xlKCk6IHZvaWQge1xyXG4gIGhhbmRsZUluZm9Ub2dnbGUoJ2F1dG9jbG9zZS1oaW50JywgJ2J0bi1hdXRvY2xvc2UtaW5mbycpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgVmlld2VyIHN0YXR1cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbnR5cGUgVmlld2VyU3RhdGUgPSAnbG9hZGluZycgfCAnbG9hZGVkJyB8ICdibG9ja2VkJyB8ICdlcnJvcic7XHJcblxyXG5mdW5jdGlvbiBzZXRWaWV3ZXJTdGF0dXMoc3RhdGU6IFZpZXdlclN0YXRlKTogdm9pZCB7XHJcbiAgY29uc3Qga2V5TWFwOiBSZWNvcmQ8Vmlld2VyU3RhdGUsIFRyYW5zbGF0aW9uS2V5PiA9IHtcclxuICAgIGxvYWRpbmc6ICd2aWV3ZXJMb2FkaW5nJyxcclxuICAgIGxvYWRlZDogJ3ZpZXdlckxvYWRlZCcsXHJcbiAgICBibG9ja2VkOiAndmlld2VyQmxvY2tlZCcsXHJcbiAgICBlcnJvcjogJ3ZpZXdlckVycm9yJyxcclxuICB9O1xyXG5cclxuICB2aWV3ZXJTdGF0dXNFbC5oaWRkZW4gPSBmYWxzZTtcclxuICB2aWV3ZXJTdGF0dXNFbC5jbGFzc05hbWUgPSBgdmlld2VyLXN0YXR1cyB2aWV3ZXItc3RhdHVzLS0ke3N0YXRlfWA7XHJcbiAgdmlld2VyU3RhdHVzVGV4dC50ZXh0Q29udGVudCA9IGkxOG4udChrZXlNYXBbc3RhdGVdKTtcclxuXHJcbiAgLy8gQXV0by1oaWRlIHN1Y2Nlc3MvZXJyb3IgYWZ0ZXIgYSBkZWxheSAoa2VlcCBsb2FkaW5nL2Jsb2NrZWQgdmlzaWJsZSlcclxuICBpZiAodmlld2VyU3RhdHVzVGltZXIpIHtcclxuICAgIGNsZWFyVGltZW91dCh2aWV3ZXJTdGF0dXNUaW1lcik7XHJcbiAgICB2aWV3ZXJTdGF0dXNUaW1lciA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBpZiAoc3RhdGUgPT09ICdsb2FkZWQnKSB7XHJcbiAgICB2aWV3ZXJTdGF0dXNUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB2aWV3ZXJTdGF0dXNFbC5oaWRkZW4gPSB0cnVlO1xyXG4gICAgfSwgNDAwMCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoaWRlVmlld2VyU3RhdHVzKCk6IHZvaWQge1xyXG4gIGlmICh2aWV3ZXJTdGF0dXNUaW1lcikge1xyXG4gICAgY2xlYXJUaW1lb3V0KHZpZXdlclN0YXR1c1RpbWVyKTtcclxuICAgIHZpZXdlclN0YXR1c1RpbWVyID0gbnVsbDtcclxuICB9XHJcbiAgdmlld2VyU3RhdHVzRWwuaGlkZGVuID0gdHJ1ZTtcclxufVxyXG5cclxuLyoqIFBhcnNlIGFuZCBoYW5kbGUgc3RydWN0dXJlZCBtZXNzYWdlcyBmcm9tIHRoZSB2aWV3ZXIgZGlhbG9nLiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVWaWV3ZXJNZXNzYWdlKHJhd01lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBtc2cgPSBKU09OLnBhcnNlKHJhd01lc3NhZ2UpIGFzIHsgdHlwZTogc3RyaW5nOyB1cmw/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIH07XHJcblxyXG4gICAgc3dpdGNoIChtc2cudHlwZSkge1xyXG4gICAgICBjYXNlICdyZWFkeSc6XHJcbiAgICAgICAgc2V0Vmlld2VyU3RhdHVzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xvYWRlZCc6XHJcbiAgICAgICAgc2V0Vmlld2VyU3RhdHVzKCdsb2FkZWQnKTtcclxuICAgICAgICAvLyBTaG93IGRlYnVnIHJlc3VsdCBpZiBpdCBsb29rcyBsaWtlIGEgbW92ZVRvL3Jlc2l6ZVRvL3Jlc3RvcmUgcmVzcG9uc2VcclxuICAgICAgICBpZiAobXNnLnVybCAmJiAobXNnLnVybC5zdGFydHNXaXRoKCdtb3ZlVG86JykgfHwgbXNnLnVybC5zdGFydHNXaXRoKCdyZXNpemVUbzonKSB8fCBtc2cudXJsLnN0YXJ0c1dpdGgoJ3Jlc3RvcmVkJykpKSB7XHJcbiAgICAgICAgICBkYmcoYERFQlVHIHJlc3VsdDogJHttc2cudXJsfWApO1xyXG4gICAgICAgICAgY29uc3QgcmVzdWx0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGJnLXJlc3VsdCcpO1xyXG4gICAgICAgICAgaWYgKHJlc3VsdEVsKSByZXN1bHRFbC50ZXh0Q29udGVudCA9IG1zZy51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdibG9ja2VkJzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2Jsb2NrZWQnKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZXJyb3InOlxyXG4gICAgICAgIHNldFZpZXdlclN0YXR1cygnZXJyb3InKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY2xvc2UnOlxyXG4gICAgICAgIGxhdW5jaGVyLmNsb3NlKCk7XHJcbiAgICAgICAgYnRuU2hvdy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGhpZGVWaWV3ZXJTdGF0dXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9IGNhdGNoIHtcclxuICAgIC8vIE5vbi1KU09OIG1lc3NhZ2Ug4oCUIGlnbm9yZVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlVmlld2VyQ2xvc2VkKCk6IHZvaWQge1xyXG4gIGJ0blNob3cuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAvLyBTaG93IGJyaWVmIFwiY2xvc2VkXCIgc3RhdHVzIHRoZW4gaGlkZVxyXG4gIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IGZhbHNlO1xyXG4gIHZpZXdlclN0YXR1c0VsLmNsYXNzTmFtZSA9ICd2aWV3ZXItc3RhdHVzJztcclxuICB2aWV3ZXJTdGF0dXNUZXh0LnRleHRDb250ZW50ID0gaTE4bi50KCd2aWV3ZXJDbG9zZWQnKTtcclxuXHJcbiAgaWYgKHZpZXdlclN0YXR1c1RpbWVyKSBjbGVhclRpbWVvdXQodmlld2VyU3RhdHVzVGltZXIpO1xyXG4gIHZpZXdlclN0YXR1c1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICB2aWV3ZXJTdGF0dXNFbC5oaWRkZW4gPSB0cnVlO1xyXG4gIH0sIDIwMDApO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2hvdyBXZWIgUGFnZSBoYW5kbGVyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2hvdygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoIWN1cnJlbnRTbGlkZUlkKSB7XHJcbiAgICBzaG93U3RhdHVzKCdzZWxlY3RTbGlkZScsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQpO1xyXG5cclxuICBpZiAoIWNvbmZpZyB8fCAhY29uZmlnLnVybCkge1xyXG4gICAgc2hvd1N0YXR1cygnbm9VcmxGb3JTbGlkZScsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgbmV0d29yayBiZWZvcmUgb3BlbmluZ1xyXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAhbmF2aWdhdG9yLm9uTGluZSkge1xyXG4gICAgc2hvd1N0YXR1cygnbm9JbnRlcm5ldCcsICdlcnJvcicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgYnRuU2hvdy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgc2V0Vmlld2VyU3RhdHVzKCdsb2FkaW5nJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBsYXVuY2hlci5vcGVuKHtcclxuICAgICAgdXJsOiBjb25maWcudXJsLFxyXG4gICAgICB6b29tOiBjb25maWcuem9vbSxcclxuICAgICAgd2lkdGg6IGNvbmZpZy5kaWFsb2dXaWR0aCxcclxuICAgICAgaGVpZ2h0OiBjb25maWcuZGlhbG9nSGVpZ2h0LFxyXG4gICAgICBsYW5nOiBpMThuLmdldExvY2FsZSgpLFxyXG4gICAgICBhdXRvQ2xvc2VTZWM6IGNvbmZpZy5hdXRvQ2xvc2VTZWMsXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGJ0blNob3cuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIGhpZGVWaWV3ZXJTdGF0dXMoKTtcclxuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBEaWFsb2dFcnJvcikge1xyXG4gICAgICBzaG93U3RhdHVzKGVyci5pMThuS2V5LCAnZXJyb3InKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNob3dTdGF0dXMoJ2Vycm9yR2VuZXJpYycsICdlcnJvcicpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEd1aWRlIGhhbmRsZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuY29uc3QgU05JUFBFVFM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgbmdpbng6ICdhZGRfaGVhZGVyIENvbnRlbnQtU2VjdXJpdHktUG9saWN5IFwiZnJhbWUtYW5jZXN0b3JzICpcIjsnLFxyXG4gIGFwYWNoZTogJ0hlYWRlciBzZXQgQ29udGVudC1TZWN1cml0eS1Qb2xpY3kgXCJmcmFtZS1hbmNlc3RvcnMgKlwiXFxuSGVhZGVyIHVuc2V0IFgtRnJhbWUtT3B0aW9ucycsXHJcbiAgZXhwcmVzczogYGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XFxuICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVNlY3VyaXR5LVBvbGljeScsICdmcmFtZS1hbmNlc3RvcnMgKicpO1xcbiAgcmVzLnJlbW92ZUhlYWRlcignWC1GcmFtZS1PcHRpb25zJyk7XFxuICBuZXh0KCk7XFxufSk7YCxcclxuICBtZXRhOiAnPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCJcXG4gICAgICBjb250ZW50PVwiZnJhbWUtYW5jZXN0b3JzICpcIj4nLFxyXG59O1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlR3VpZGVUb2dnbGUoKTogdm9pZCB7XHJcbiAgY29uc3Qgc2VjdGlvbiA9ICQoJ2d1aWRlLXNlY3Rpb24nKTtcclxuICBjb25zdCB0b2dnbGUgPSAkKCdidG4tZ3VpZGUtdG9nZ2xlJyk7XHJcbiAgY29uc3QgaXNIaWRkZW4gPSBzZWN0aW9uLmhpZGRlbjtcclxuICBzZWN0aW9uLmhpZGRlbiA9ICFpc0hpZGRlbjtcclxuICB0b2dnbGUudGV4dENvbnRlbnQgPSBpMThuLnQoaXNIaWRkZW4gPyAnaGlkZVNldHVwR3VpZGUnIDogJ3NpdGVOb3RMb2FkaW5nJyk7XHJcbiAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhpc0hpZGRlbikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhY3RpdmF0ZUd1aWRlVGFiKHRhYklkOiBzdHJpbmcpOiB2b2lkIHtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PignI2d1aWRlLXNlY3Rpb24gW2RhdGEtZ3VpZGUtdGFiXScpLmZvckVhY2goKHQpID0+IHtcclxuICAgIGNvbnN0IGFjdGl2ZSA9IHQuZGF0YXNldC5ndWlkZVRhYiA9PT0gdGFiSWQ7XHJcbiAgICB0LmNsYXNzTGlzdC50b2dnbGUoJ2d1aWRlLXRhYi0tYWN0aXZlJywgYWN0aXZlKTtcclxuICAgIHQuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgU3RyaW5nKGFjdGl2ZSkpO1xyXG4gICAgdC50YWJJbmRleCA9IGFjdGl2ZSA/IDAgOiAtMTtcclxuICAgIGlmIChhY3RpdmUpIHQuZm9jdXMoKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJyNndWlkZS1zZWN0aW9uIFtkYXRhLWd1aWRlLXBhbmVsXScpLmZvckVhY2goKHApID0+IHtcclxuICAgIHAuaGlkZGVuID0gcC5kYXRhc2V0Lmd1aWRlUGFuZWwgIT09IHRhYklkO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVHdWlkZVRhYkNsaWNrKGU6IEV2ZW50KTogdm9pZCB7XHJcbiAgY29uc3QgdGFiID0gKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbG9zZXN0PEhUTUxCdXR0b25FbGVtZW50PignW2RhdGEtZ3VpZGUtdGFiXScpO1xyXG4gIGlmICghdGFiKSByZXR1cm47XHJcbiAgYWN0aXZhdGVHdWlkZVRhYih0YWIuZGF0YXNldC5ndWlkZVRhYiEpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVHdWlkZVRhYktleWRvd24oZTogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gIGNvbnN0IHRhYnMgPSBBcnJheS5mcm9tKFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MQnV0dG9uRWxlbWVudD4oJyNndWlkZS1zZWN0aW9uIFtkYXRhLWd1aWRlLXRhYl0nKSxcclxuICApO1xyXG4gIGNvbnN0IGN1cnJlbnQgPSB0YWJzLmZpbmRJbmRleCgodCkgPT4gdC5nZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKTtcclxuICBsZXQgbmV4dCA9IC0xO1xyXG5cclxuICBpZiAoZS5rZXkgPT09ICdBcnJvd1JpZ2h0JykgbmV4dCA9IChjdXJyZW50ICsgMSkgJSB0YWJzLmxlbmd0aDtcclxuICBlbHNlIGlmIChlLmtleSA9PT0gJ0Fycm93TGVmdCcpIG5leHQgPSAoY3VycmVudCAtIDEgKyB0YWJzLmxlbmd0aCkgJSB0YWJzLmxlbmd0aDtcclxuICBlbHNlIGlmIChlLmtleSA9PT0gJ0hvbWUnKSBuZXh0ID0gMDtcclxuICBlbHNlIGlmIChlLmtleSA9PT0gJ0VuZCcpIG5leHQgPSB0YWJzLmxlbmd0aCAtIDE7XHJcbiAgZWxzZSByZXR1cm47XHJcblxyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICBhY3RpdmF0ZUd1aWRlVGFiKHRhYnNbbmV4dF0uZGF0YXNldC5ndWlkZVRhYiEpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHdWlkZUNvcHkoZTogRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBidG4gPSAoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsb3Nlc3Q8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdbZGF0YS1jb3B5LXNuaXBwZXRdJyk7XHJcbiAgaWYgKCFidG4pIHJldHVybjtcclxuXHJcbiAgY29uc3Qga2V5ID0gYnRuLmRhdGFzZXQuY29weVNuaXBwZXQhO1xyXG4gIGNvbnN0IHRleHQgPSBTTklQUEVUU1trZXldO1xyXG4gIGlmICghdGV4dCkgcmV0dXJuO1xyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XHJcbiAgICBidG4udGV4dENvbnRlbnQgPSBpMThuLnQoJ2NvcGllZCcpO1xyXG4gICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2J0bi1jb3B5LS1jb3BpZWQnKTtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBidG4udGV4dENvbnRlbnQgPSBpMThuLnQoJ2NvcHknKTtcclxuICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1jb3B5LS1jb3BpZWQnKTtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gRmFsbGJhY2s6IHNlbGVjdCB0ZXh0IGluIHRoZSBjb2RlIGJsb2NrXHJcbiAgICBjb25zdCBwYW5lbCA9IGJ0bi5jbG9zZXN0KCdbZGF0YS1ndWlkZS1wYW5lbF0nKTtcclxuICAgIGNvbnN0IGNvZGUgPSBwYW5lbD8ucXVlcnlTZWxlY3RvcignY29kZScpO1xyXG4gICAgaWYgKGNvZGUpIHtcclxuICAgICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoY29kZSk7XHJcbiAgICAgIGNvbnN0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgc2VsPy5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgc2VsPy5hZGRSYW5nZShyYW5nZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgTGFuZ3VhZ2Ugc3dpdGNoIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3QgbG9jYWxlID0gbGFuZ1NlbGVjdC52YWx1ZSBhcyBMb2NhbGU7XHJcbiAgaTE4bi5zZXRMb2NhbGUobG9jYWxlKTtcclxuICBhcHBseUkxOG4oKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNldExhbmd1YWdlKGxvY2FsZSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvLyBub24tY3JpdGljYWwg4oCUIFVJIGFscmVhZHkgdXBkYXRlZFxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEtleWJvYXJkIHN1cHBvcnQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBoYW5kbGVVcmxLZXlkb3duKGU6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIGhhbmRsZUFwcGx5KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVidWcgcGFuZWwgKHRlbXBvcmFyeSDigJQgcmVtb3ZlIGFmdGVyIGZpeGluZykg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5sZXQgZGVidWdQYW5lbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxubGV0IGRlYnVnTGluZUNvdW50ID0gMDtcclxuXHJcbmZ1bmN0aW9uIGRiZyhtc2c6IHN0cmluZyk6IHZvaWQge1xyXG4gIGxvZ0RlYnVnKCdbVGFza3BhbmVdJywgbXNnKTtcclxuICBpZiAoIWRlYnVnUGFuZWwpIHtcclxuICAgIGRlYnVnUGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVidWctcGFuZWwnKTtcclxuICB9XHJcbiAgaWYgKGRlYnVnUGFuZWwpIHtcclxuICAgIGRlYnVnTGluZUNvdW50Kys7XHJcbiAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoJ2VuJywgeyBob3VyMTI6IGZhbHNlIH0pO1xyXG4gICAgZGVidWdQYW5lbC50ZXh0Q29udGVudCArPSBgXFxuJHtkZWJ1Z0xpbmVDb3VudH0uIFske3RpbWV9XSAke21zZ31gO1xyXG4gICAgZGVidWdQYW5lbC5zY3JvbGxUb3AgPSBkZWJ1Z1BhbmVsLnNjcm9sbEhlaWdodDtcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTbGlkZXNob3cgYXV0by1vcGVuIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG4vL1xyXG4vLyBUaGUgY29tbWFuZHMgcnVudGltZSAoRnVuY3Rpb25GaWxlKSBtYXkgbm90IHBlcnNpc3QgZHVyaW5nIHNsaWRlc2hvdyBvbiBhbGxcclxuLy8gUG93ZXJQb2ludCB2ZXJzaW9ucy4gQXMgYSByZWxpYWJsZSBmYWxsYmFjaywgdGhlIHRhc2twYW5lIGl0c2VsZiBwb2xscyBmb3JcclxuLy8gdmlldyBtb2RlIGNoYW5nZXMgYW5kIHNsaWRlIG5hdmlnYXRpb24gZHVyaW5nIHNsaWRlc2hvdy5cclxuLy9cclxuLy8gVXNlcyBnZXRBY3RpdmVWaWV3QXN5bmMoKSBpbnN0ZWFkIG9mIEFjdGl2ZVZpZXdDaGFuZ2VkIGV2ZW50IGJlY2F1c2VcclxuLy8gdGhlIGV2ZW50IG1heSBub3QgZmlyZSBpbiB0aGUgdGFza3BhbmUgY29udGV4dC5cclxuXHJcbi8qKiBIb3cgb2Z0ZW4gdG8gY2hlY2sgdGhlIGN1cnJlbnQgdmlldyBtb2RlIChtcykuICovXHJcbmNvbnN0IFZJRVdfUE9MTF9JTlRFUlZBTF9NUyA9IDIwMDA7XHJcblxyXG4vKiogSG93IG9mdGVuIHRvIGNoZWNrIHRoZSBjdXJyZW50IHNsaWRlIGR1cmluZyBzbGlkZXNob3cgKG1zKS4gKi9cclxuY29uc3QgU0xJREVfUE9MTF9JTlRFUlZBTF9NUyA9IDE1MDA7XHJcblxyXG5sZXQgdmlld1BvbGxUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0SW50ZXJ2YWw+IHwgbnVsbCA9IG51bGw7XHJcbmxldCBzbGlkZVBvbGxUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0SW50ZXJ2YWw+IHwgbnVsbCA9IG51bGw7XHJcbmxldCBzbGlkZXNob3dBY3RpdmUgPSBmYWxzZTtcclxubGV0IGxhc3RTbGlkZXNob3dTbGlkZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxubGV0IHNsaWRlUG9sbEJ1c3kgPSBmYWxzZTtcclxuXHJcbi8qKiBXaGV0aGVyIHRoZSB2aWV3ZXIgZGlhbG9nIGhhcyBiZWVuIG9wZW5lZCBmb3IgdGhlIGN1cnJlbnQgc2xpZGVzaG93IHNlc3Npb24uICovXHJcbmxldCBzbGlkZXNob3dEaWFsb2dPcGVuZWQgPSBmYWxzZTtcclxuXHJcbi8qKiBHZXQgdGhlIGN1cnJlbnQgdmlldyBtb2RlIChcImVkaXRcIiBvciBcInJlYWRcIikuICovXHJcbmZ1bmN0aW9uIGdldEFjdGl2ZVZpZXcoKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIE9mZmljZS5jb250ZXh0LmRvY3VtZW50LmdldEFjdGl2ZVZpZXdBc3luYygocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IE9mZmljZS5Bc3luY1Jlc3VsdFN0YXR1cy5TdWNjZWVkZWQpIHtcclxuICAgICAgICAgIHJlc29sdmUocmVzdWx0LnZhbHVlIGFzIHVua25vd24gYXMgc3RyaW5nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGJnKGBnZXRBY3RpdmVWaWV3IEZBSUxFRDogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWApO1xyXG4gICAgICAgICAgcmVzb2x2ZSgnZWRpdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgZGJnKGBnZXRBY3RpdmVWaWV3IEVYQ0VQVElPTjogJHtlcnJ9YCk7XHJcbiAgICAgIHJlc29sdmUoJ2VkaXQnKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgY3VycmVudCBzbGlkZSBJRC4gVHJpZXMgdHdvIG1ldGhvZHM6XHJcbiAqIDEuIFBvd2VyUG9pbnQgSlMgQVBJIGdldFNlbGVjdGVkU2xpZGVzKCkg4oCUIHdvcmtzIGluIGVkaXQgbW9kZVxyXG4gKiAyLiBDb21tb24gQVBJIGdldFNlbGVjdGVkRGF0YUFzeW5jKFNsaWRlUmFuZ2UpIOKAlCBtYXkgd29yayBpbiBzbGlkZXNob3dcclxuICpcclxuICogTWV0aG9kIDIgcmV0dXJucyBhIG51bWVyaWMgc2xpZGUgSUQsIHdoaWNoIHdlIG1hcCB0byB0aGUgSlMgQVBJIHN0cmluZyBJRFxyXG4gKiB1c2luZyBhIHByZS1idWlsdCBpbmRleOKGkmlkIGxvb2t1cCB0YWJsZS5cclxuICovXHJcblxyXG4vKiogTWFwIG9mIHNsaWRlIGluZGV4ICgxLWJhc2VkKSDihpIgUG93ZXJQb2ludCBKUyBBUEkgc2xpZGUgSUQuIEJ1aWx0IGJlZm9yZSBzbGlkZXNob3cuICovXHJcbmxldCBzbGlkZUluZGV4VG9JZDogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoKTtcclxuXHJcbi8qKiBCdWlsZCB0aGUgaW5kZXjihpJpZCBtYXAgZnJvbSBhbGwgc2xpZGVzIGluIHRoZSBwcmVzZW50YXRpb24uICovXHJcbmFzeW5jIGZ1bmN0aW9uIGJ1aWxkU2xpZGVJbmRleE1hcCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgUG93ZXJQb2ludC5ydW4oYXN5bmMgKGNvbnRleHQpID0+IHtcclxuICAgICAgY29uc3Qgc2xpZGVzID0gY29udGV4dC5wcmVzZW50YXRpb24uc2xpZGVzO1xyXG4gICAgICBzbGlkZXMubG9hZCgnaXRlbXMvaWQnKTtcclxuICAgICAgYXdhaXQgY29udGV4dC5zeW5jKCk7XHJcbiAgICAgIHNsaWRlSW5kZXhUb0lkID0gbmV3IE1hcCgpO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNsaWRlcy5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHNsaWRlSW5kZXhUb0lkLnNldChpICsgMSwgc2xpZGVzLml0ZW1zW2ldLmlkKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBlbnRyaWVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgc2xpZGVJbmRleFRvSWQuZm9yRWFjaCgoaWQsIGlkeCkgPT4gZW50cmllcy5wdXNoKGAke2lkeH3ihpIke2lkfWApKTtcclxuICAgIGRiZyhgU2xpZGUgbWFwOiAke2VudHJpZXMuam9pbignLCAnKX1gKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGRiZyhgYnVpbGRTbGlkZUluZGV4TWFwIEVSUk9SOiAke2Vycn1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBNZXRob2QgMTogUG93ZXJQb2ludCBKUyBBUEkg4oCUIGdldFNlbGVjdGVkU2xpZGVzKCkuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNsaWRlSWRWaWFKc0FwaSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICB0cnkge1xyXG4gICAgbGV0IHNsaWRlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgYXdhaXQgUG93ZXJQb2ludC5ydW4oYXN5bmMgKGNvbnRleHQpID0+IHtcclxuICAgICAgY29uc3Qgc2xpZGVzID0gY29udGV4dC5wcmVzZW50YXRpb24uZ2V0U2VsZWN0ZWRTbGlkZXMoKTtcclxuICAgICAgc2xpZGVzLmxvYWQoJ2l0ZW1zL2lkJyk7XHJcbiAgICAgIGF3YWl0IGNvbnRleHQuc3luYygpO1xyXG4gICAgICBpZiAoc2xpZGVzLml0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBzbGlkZUlkID0gc2xpZGVzLml0ZW1zWzBdLmlkO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzbGlkZUlkO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgZGJnKGBKUyBBUEkgZ2V0U2VsZWN0ZWRTbGlkZXMgRVJST1I6ICR7ZXJyfWApO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogTWV0aG9kIDI6IENvbW1vbiBBUEkg4oCUIGdldFNlbGVjdGVkRGF0YUFzeW5jKFNsaWRlUmFuZ2UpLiAqL1xyXG5mdW5jdGlvbiBnZXRTbGlkZUlkVmlhQ29tbW9uQXBpKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgT2ZmaWNlLmNvbnRleHQuZG9jdW1lbnQuZ2V0U2VsZWN0ZWREYXRhQXN5bmMoXHJcbiAgICAgICAgT2ZmaWNlLkNvZXJjaW9uVHlwZS5TbGlkZVJhbmdlLFxyXG4gICAgICAgIChyZXN1bHQpID0+IHtcclxuICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBPZmZpY2UuQXN5bmNSZXN1bHRTdGF0dXMuU3VjY2VlZGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSByZXN1bHQudmFsdWUgYXMgeyBzbGlkZXM/OiBBcnJheTx7IGlkOiBudW1iZXI7IGluZGV4OiBudW1iZXIgfT4gfTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuc2xpZGVzICYmIGRhdGEuc2xpZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICBjb25zdCBzbGlkZSA9IGRhdGEuc2xpZGVzWzBdO1xyXG4gICAgICAgICAgICAgIGRiZyhgQ29tbW9uQVBJIHNsaWRlOiBpZD0ke3NsaWRlLmlkfSBpbmRleD0ke3NsaWRlLmluZGV4fWApO1xyXG4gICAgICAgICAgICAgIC8vIE1hcCBpbmRleCB0byBKUyBBUEkgc2xpZGUgSURcclxuICAgICAgICAgICAgICBjb25zdCBqc0lkID0gc2xpZGVJbmRleFRvSWQuZ2V0KHNsaWRlLmluZGV4KTtcclxuICAgICAgICAgICAgICBpZiAoanNJZCkge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShqc0lkKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGJnKGBObyBKUyBBUEkgSUQgZm91bmQgZm9yIGluZGV4ICR7c2xpZGUuaW5kZXh9YCk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBkYmcoJ0NvbW1vbkFQSTogbm8gc2xpZGVzIGluIHJlc3VsdCcpO1xyXG4gICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRiZyhgQ29tbW9uQVBJIEZBSUxFRDogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWApO1xyXG4gICAgICAgICAgICByZXNvbHZlKG51bGwpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgZGJnKGBDb21tb25BUEkgRVhDRVBUSU9OOiAke2Vycn1gKTtcclxuICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuLyoqIFRyeSBib3RoIG1ldGhvZHMgdG8gZ2V0IHRoZSBjdXJyZW50IHNsaWRlIElELiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRTbGlkZXNob3dTbGlkZUlkKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gIC8vIFRyeSBKUyBBUEkgZmlyc3QgKHdvcmtzIHJlbGlhYmx5IGluIGVkaXQgbW9kZSlcclxuICBjb25zdCBqc1Jlc3VsdCA9IGF3YWl0IGdldFNsaWRlSWRWaWFKc0FwaSgpO1xyXG4gIGlmIChqc1Jlc3VsdCkge1xyXG4gICAgZGJnKGBzbGlkZUlkIHZpYSBKUyBBUEk6ICR7anNSZXN1bHR9YCk7XHJcbiAgICByZXR1cm4ganNSZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvLyBGYWxsYmFjazogQ29tbW9uIEFQSSAobWF5IHdvcmsgaW4gc2xpZGVzaG93KVxyXG4gIGNvbnN0IGNvbW1vblJlc3VsdCA9IGF3YWl0IGdldFNsaWRlSWRWaWFDb21tb25BcGkoKTtcclxuICBkYmcoYHNsaWRlSWQgdmlhIENvbW1vbkFQSTogJHtjb21tb25SZXN1bHR9YCk7XHJcbiAgcmV0dXJuIGNvbW1vblJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE9wZW4gb3IgdXBkYXRlIHRoZSB2aWV3ZXIgZm9yIGEgc2xpZGUgZHVyaW5nIHNsaWRlc2hvdy5cclxuICpcclxuICogQ1JJVElDQUw6IENsb3NpbmcgYGRpc3BsYXlEaWFsb2dBc3luY2AgZHVyaW5nIHNsaWRlc2hvdyBjYXVzZXMgUG93ZXJQb2ludFxyXG4gKiB0byBleGl0IHNsaWRlc2hvdyBtb2RlLiBXZSBtdXN0IE5FVkVSIGNsb3NlL3Jlb3BlbiB0aGUgZGlhbG9nLlxyXG4gKlxyXG4gKiBTdHJhdGVneTpcclxuICogLSBGaXJzdCBVUkwgaW4gc2xpZGVzaG93IOKGkiBvcGVuIGRpYWxvZyBub3JtYWxseSAod2l0aCB0aGUgVVJMKVxyXG4gKiAtIFN1YnNlcXVlbnQgVVJMcyDihpIgd3JpdGUgdG8gbG9jYWxTdG9yYWdlLCB2aWV3ZXIgcGlja3MgaXQgdXAgdmlhIGBzdG9yYWdlYCBldmVudFxyXG4gKiAtIFNsaWRlIHdpdGggbm8gVVJMIOKGkiB3cml0ZSBlbXB0eSBzdHJpbmcsIHZpZXdlciBzaG93cyBzdGFuZGJ5IChibGFjayBzY3JlZW4pXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBhdXRvT3BlblZpZXdlckZvclNsaWRlKHNsaWRlSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IGNvbmZpZyA9IGdldFNsaWRlQ29uZmlnKHNsaWRlSWQpO1xyXG4gIGRiZyhgYXV0b09wZW46IHNsaWRlPSR7c2xpZGVJZH0gdXJsPSR7Y29uZmlnPy51cmwgPz8gJ25vbmUnfSBhdXRvT3Blbj0ke2NvbmZpZz8uYXV0b09wZW59YCk7XHJcbiAgaWYgKCFjb25maWc/LnVybCB8fCAhY29uZmlnLmF1dG9PcGVuKSByZXR1cm47XHJcblxyXG4gIGlmIChzbGlkZXNob3dEaWFsb2dPcGVuZWQgJiYgbGF1bmNoZXIuaXNPcGVuKCkpIHtcclxuICAgIC8vIERpYWxvZyBhbHJlYWR5IG9wZW4g4oCUIHNlbmQgVVJMIHZpYSBtZXNzYWdlQ2hpbGQgKG5vIGNsb3NlL3Jlb3BlbiEpXHJcbiAgICBkYmcoYFNlbmRpbmcgVVJMIHZpYSBtZXNzYWdlQ2hpbGQ6ICR7Y29uZmlnLnVybC5zdWJzdHJpbmcoMCwgNTApfS4uLmApO1xyXG4gICAgY29uc3Qgc2VudCA9IGxhdW5jaGVyLnNlbmRNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHsgYWN0aW9uOiAnbmF2aWdhdGUnLCB1cmw6IGNvbmZpZy51cmwgfSkpO1xyXG4gICAgZGJnKGBtZXNzYWdlQ2hpbGQgcmVzdWx0OiAke3NlbnR9YCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBGaXJzdCB0aW1lIG9wZW5pbmcgZGlhbG9nIGluIHRoaXMgc2xpZGVzaG93IHNlc3Npb25cclxuICBjb25zdCBoaWRlTWV0aG9kID0gZ2V0U2VsZWN0ZWRIaWRlTWV0aG9kKCk7XHJcbiAgdHJ5IHtcclxuICAgIGRiZyhgT3BlbmluZyBkaWFsb2cgKGZpcnN0IHRpbWUpOiAke2NvbmZpZy51cmwuc3Vic3RyaW5nKDAsIDUwKX0uLi4gaGlkZT0ke2hpZGVNZXRob2R9YCk7XHJcbiAgICBhd2FpdCBsYXVuY2hlci5vcGVuKHtcclxuICAgICAgdXJsOiBjb25maWcudXJsLFxyXG4gICAgICB6b29tOiBjb25maWcuem9vbSxcclxuICAgICAgd2lkdGg6IGNvbmZpZy5kaWFsb2dXaWR0aCxcclxuICAgICAgaGVpZ2h0OiBjb25maWcuZGlhbG9nSGVpZ2h0LFxyXG4gICAgICBsYW5nOiBpMThuLmdldExvY2FsZSgpLFxyXG4gICAgICBhdXRvQ2xvc2VTZWM6IGNvbmZpZy5hdXRvQ2xvc2VTZWMsXHJcbiAgICAgIHNsaWRlc2hvdzogdHJ1ZSwgIC8vIFZpZXdlciB3aWxsIHNob3cgc3RhbmRieSBpbnN0ZWFkIG9mIGNsb3Npbmcgb24gdGltZXJcclxuICAgICAgaGlkZU1ldGhvZCxcclxuICAgIH0pO1xyXG4gICAgc2xpZGVzaG93RGlhbG9nT3BlbmVkID0gdHJ1ZTtcclxuICAgIGRiZygnRGlhbG9nIG9wZW5lZCBPSyAoZmlyc3QgdGltZSknKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGRiZyhgRGlhbG9nIG9wZW4gRkFJTEVEOiAke2Vycn1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBQb2xsIHNsaWRlIGNoYW5nZXMgZHVyaW5nIHNsaWRlc2hvdy4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcG9sbFNsaWRlSW5TbGlkZXNob3coKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgaWYgKCFzbGlkZXNob3dBY3RpdmUpIHJldHVybjtcclxuICBpZiAoc2xpZGVQb2xsQnVzeSkge1xyXG4gICAgZGJnKCdwb2xsIFNLSVBQRUQgKGJ1c3kpJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBzbGlkZVBvbGxCdXN5ID0gdHJ1ZTtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2xpZGVJZCA9IGF3YWl0IGdldFNsaWRlc2hvd1NsaWRlSWQoKTtcclxuICAgIGRiZyhgcG9sbCB0aWNrOiBnb3Q9JHtzbGlkZUlkfSBsYXN0PSR7bGFzdFNsaWRlc2hvd1NsaWRlSWR9YCk7XHJcblxyXG4gICAgaWYgKCFzbGlkZUlkKSB7XHJcbiAgICAgIGRiZygncG9sbDogc2xpZGVJZCBpcyBudWxsJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChzbGlkZUlkID09PSBsYXN0U2xpZGVzaG93U2xpZGVJZCkgcmV0dXJuO1xyXG5cclxuICAgIGRiZyhgU0xJREUgQ0hBTkdFRDogJHtsYXN0U2xpZGVzaG93U2xpZGVJZH0g4oaSICR7c2xpZGVJZH1gKTtcclxuICAgIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gc2xpZGVJZDtcclxuXHJcbiAgICBjb25zdCBjb25maWcgPSBnZXRTbGlkZUNvbmZpZyhzbGlkZUlkKTtcclxuICAgIGlmIChjb25maWc/LmF1dG9PcGVuICYmIGNvbmZpZy51cmwpIHtcclxuICAgICAgYXdhaXQgYXV0b09wZW5WaWV3ZXJGb3JTbGlkZShzbGlkZUlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFNsaWRlIGhhcyBubyBVUkwgb3IgYXV0b09wZW4gaXMgb2ZmLlxyXG4gICAgICAvLyBEbyBOT1QgY2xvc2UgdGhlIGRpYWxvZyAoaXQgd291bGQgZXhpdCBzbGlkZXNob3cpLlxyXG4gICAgICAvLyBJbnN0ZWFkLCB0ZWxsIHRoZSB2aWV3ZXIgdG8gc2hvdyBzdGFuZGJ5IChibGFjayBzY3JlZW4pLlxyXG4gICAgICBkYmcoYE5vIFVSTCBmb3Igc2xpZGUgJHtzbGlkZUlkfSDigJQgc2VuZGluZyBzdGFuZGJ5YCk7XHJcbiAgICAgIGlmIChzbGlkZXNob3dEaWFsb2dPcGVuZWQgJiYgbGF1bmNoZXIuaXNPcGVuKCkpIHtcclxuICAgICAgICBsYXVuY2hlci5zZW5kTWVzc2FnZShKU09OLnN0cmluZ2lmeSh7IGFjdGlvbjogJ3N0YW5kYnknIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgZGJnKGBwb2xsIEVSUk9SOiAke2Vycn1gKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgc2xpZGVQb2xsQnVzeSA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIENhbGxlZCB3aGVuIHNsaWRlc2hvdyBtb2RlIGlzIGRldGVjdGVkLiAqL1xyXG5hc3luYyBmdW5jdGlvbiBvblNsaWRlc2hvd0VudGVyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHNsaWRlc2hvd0FjdGl2ZSA9IHRydWU7XHJcbiAgbGFzdFNsaWRlc2hvd1NsaWRlSWQgPSBudWxsO1xyXG4gIHNsaWRlUG9sbEJ1c3kgPSBmYWxzZTtcclxuICBkYmcoJ1NMSURFU0hPVyBERVRFQ1RFRCcpO1xyXG5cclxuICAvLyBCdWlsZCBzbGlkZSBpbmRleCBtYXAgQkVGT1JFIHRyeWluZyB0byBnZXQgY3VycmVudCBzbGlkZS5cclxuICAvLyBUaGlzIGlzIG5lZWRlZCBmb3IgdGhlIENvbW1vbiBBUEkgZmFsbGJhY2sgd2hpY2ggcmV0dXJucyBpbmRleCwgbm90IElELlxyXG4gIGF3YWl0IGJ1aWxkU2xpZGVJbmRleE1hcCgpO1xyXG5cclxuICAvLyBJbW1lZGlhdGVseSB0cnkgdG8gb3BlbiB2aWV3ZXIgZm9yIHRoZSBjdXJyZW50IHNsaWRlXHJcbiAgZGJnKCdHZXR0aW5nIGN1cnJlbnQgc2xpZGUuLi4nKTtcclxuICBjb25zdCBzbGlkZUlkID0gYXdhaXQgZ2V0U2xpZGVzaG93U2xpZGVJZCgpO1xyXG4gIGRiZyhgQ3VycmVudCBzbGlkZSByZXN1bHQ6ICR7c2xpZGVJZH1gKTtcclxuXHJcbiAgaWYgKHNsaWRlSWQpIHtcclxuICAgIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gc2xpZGVJZDtcclxuICAgIGF3YWl0IGF1dG9PcGVuVmlld2VyRm9yU2xpZGUoc2xpZGVJZCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRiZygnQ291bGQgbm90IGRldGVybWluZSBjdXJyZW50IHNsaWRlIGluIHNsaWRlc2hvdycpO1xyXG4gIH1cclxuXHJcbiAgLy8gU3RhcnQgcG9sbGluZyBmb3Igc2xpZGUgY2hhbmdlc1xyXG4gIGlmIChzbGlkZVBvbGxUaW1lcikgY2xlYXJJbnRlcnZhbChzbGlkZVBvbGxUaW1lcik7XHJcbiAgc2xpZGVQb2xsVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7IHBvbGxTbGlkZUluU2xpZGVzaG93KCk7IH0sIFNMSURFX1BPTExfSU5URVJWQUxfTVMpO1xyXG4gIGRiZygnU2xpZGUgcG9sbGluZyBzdGFydGVkJyk7XHJcbn1cclxuXHJcbi8qKiBDYWxsZWQgd2hlbiBlZGl0IG1vZGUgaXMgcmVzdG9yZWQuICovXHJcbmZ1bmN0aW9uIG9uU2xpZGVzaG93RXhpdCgpOiB2b2lkIHtcclxuICBzbGlkZXNob3dBY3RpdmUgPSBmYWxzZTtcclxuICBzbGlkZXNob3dEaWFsb2dPcGVuZWQgPSBmYWxzZTtcclxuICBkYmcoJ1NMSURFU0hPVyBFTkRFRCcpO1xyXG4gIGlmIChzbGlkZVBvbGxUaW1lcikge1xyXG4gICAgY2xlYXJJbnRlcnZhbChzbGlkZVBvbGxUaW1lcik7XHJcbiAgICBzbGlkZVBvbGxUaW1lciA9IG51bGw7XHJcbiAgfVxyXG4gIGxhc3RTbGlkZXNob3dTbGlkZUlkID0gbnVsbDtcclxuXHJcbiAgLy8gU2FmZSB0byBjbG9zZSBkaWFsb2cgbm93IOKAlCBzbGlkZXNob3cgYWxyZWFkeSBleGl0ZWRcclxuICBsYXVuY2hlci5jbG9zZSgpO1xyXG59XHJcblxyXG4vKiogUGVyaW9kaWNhbGx5IGNoZWNrIHZpZXcgbW9kZSB0byBkZXRlY3Qgc2xpZGVzaG93IHN0YXJ0L2VuZC4gKi9cclxubGV0IHZpZXdQb2xsQ291bnQgPSAwO1xyXG5hc3luYyBmdW5jdGlvbiBwb2xsVmlld01vZGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdmlld1BvbGxDb3VudCsrO1xyXG4gIGNvbnN0IHZpZXcgPSBhd2FpdCBnZXRBY3RpdmVWaWV3KCk7XHJcbiAgY29uc3QgaXNTbGlkZXNob3cgPSB2aWV3ID09PSAncmVhZCc7XHJcblxyXG4gIC8vIExvZyBldmVyeSA1dGggcG9sbCB0byBzaG93IHBvbGxpbmcgaXMgYWxpdmUsIHBsdXMgZXZlcnkgbW9kZSBjaGFuZ2VcclxuICBpZiAodmlld1BvbGxDb3VudCAlIDUgPT09IDEpIHtcclxuICAgIGRiZyhgcG9sbCAjJHt2aWV3UG9sbENvdW50fTogdmlldz1cIiR7dmlld31cIiBhY3RpdmU9JHtzbGlkZXNob3dBY3RpdmV9YCk7XHJcbiAgfVxyXG5cclxuICBpZiAoaXNTbGlkZXNob3cgJiYgIXNsaWRlc2hvd0FjdGl2ZSkge1xyXG4gICAgYXdhaXQgb25TbGlkZXNob3dFbnRlcigpO1xyXG4gIH0gZWxzZSBpZiAoIWlzU2xpZGVzaG93ICYmIHNsaWRlc2hvd0FjdGl2ZSkge1xyXG4gICAgb25TbGlkZXNob3dFeGl0KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogU3RhcnQgbW9uaXRvcmluZyBmb3Igc2xpZGVzaG93IG1vZGUuICovXHJcbmZ1bmN0aW9uIHN0YXJ0Vmlld01vZGVQb2xsaW5nKCk6IHZvaWQge1xyXG4gIGlmICh2aWV3UG9sbFRpbWVyKSByZXR1cm47XHJcbiAgdmlld1BvbGxUaW1lciA9IHNldEludGVydmFsKCgpID0+IHsgcG9sbFZpZXdNb2RlKCk7IH0sIFZJRVdfUE9MTF9JTlRFUlZBTF9NUyk7XHJcbiAgZGJnKCdWaWV3IG1vZGUgcG9sbGluZyBTVEFSVEVEIChldmVyeSAycyknKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlYnVnOiBoaWRlIGRpYWxvZyB0ZXN0IGNvbnRyb2xzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFJlYWQgdGhlIHNlbGVjdGVkIGhpZGUgbWV0aG9kIGZyb20gZGVidWcgY2hlY2tib3hlcy4gKi9cclxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWRIaWRlTWV0aG9kKCk6ICdub25lJyB8ICdtb3ZlJyB8ICdyZXNpemUnIHtcclxuICBjb25zdCBjaGtNb3ZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RiZy1jaGstbW92ZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG4gIGNvbnN0IGNoa1Jlc2l6ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYmctY2hrLXJlc2l6ZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG4gIGlmIChjaGtNb3ZlPy5jaGVja2VkKSByZXR1cm4gJ21vdmUnO1xyXG4gIGlmIChjaGtSZXNpemU/LmNoZWNrZWQpIHJldHVybiAncmVzaXplJztcclxuICByZXR1cm4gJ25vbmUnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZW5kRGVidWdDb21tYW5kKGFjdGlvbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgaWYgKCFsYXVuY2hlci5pc09wZW4oKSkge1xyXG4gICAgZGJnKGBERUJVRyAke2FjdGlvbn06IGRpYWxvZyBub3Qgb3BlbmApO1xyXG4gICAgY29uc3QgcmVzdWx0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGJnLXJlc3VsdCcpO1xyXG4gICAgaWYgKHJlc3VsdEVsKSByZXN1bHRFbC50ZXh0Q29udGVudCA9ICdEaWFsb2cgbm90IG9wZW4g4oCUIG9wZW4gYSB3ZWIgcGFnZSBmaXJzdCc7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGNvbnN0IHNlbnQgPSBsYXVuY2hlci5zZW5kTWVzc2FnZShKU09OLnN0cmluZ2lmeSh7IGFjdGlvbiB9KSk7XHJcbiAgZGJnKGBERUJVRyAke2FjdGlvbn06IHNlbnQ9JHtzZW50fWApO1xyXG4gIGNvbnN0IHJlc3VsdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RiZy1yZXN1bHQnKTtcclxuICBpZiAocmVzdWx0RWwpIHJlc3VsdEVsLnRleHRDb250ZW50ID0gc2VudCA/IGBTZW50OiAke2FjdGlvbn0uLi5gIDogYEZhaWxlZCB0byBzZW5kICR7YWN0aW9ufWA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXREZWJ1Z0hpZGVDb250cm9scygpOiB2b2lkIHtcclxuICBjb25zdCBjaGtNb3ZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RiZy1jaGstbW92ZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG4gIGNvbnN0IGNoa1Jlc2l6ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYmctY2hrLXJlc2l6ZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG4gIGNvbnN0IGJ0blJlc3RvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGJnLWJ0bi1yZXN0b3JlJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsO1xyXG5cclxuICBjaGtNb3ZlPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICBpZiAoY2hrTW92ZS5jaGVja2VkKSB7XHJcbiAgICAgIHNlbmREZWJ1Z0NvbW1hbmQoJ2hpZGUtbW92ZScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VuZERlYnVnQ29tbWFuZCgncmVzdG9yZScpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBjaGtSZXNpemU/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICAgIGlmIChjaGtSZXNpemUuY2hlY2tlZCkge1xyXG4gICAgICBzZW5kRGVidWdDb21tYW5kKCdoaWRlLXJlc2l6ZScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VuZERlYnVnQ29tbWFuZCgncmVzdG9yZScpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBidG5SZXN0b3JlPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHNlbmREZWJ1Z0NvbW1hbmQoJ3Jlc3RvcmUnKTtcclxuICAgIGlmIChjaGtNb3ZlKSBjaGtNb3ZlLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgIGlmIChjaGtSZXNpemUpIGNoa1Jlc2l6ZS5jaGVja2VkID0gZmFsc2U7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBJbml0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gaW5pdCgpOiB2b2lkIHtcclxuICAvLyBDYWNoZSBET00gcmVmc1xyXG4gIHVybElucHV0ID0gJDxIVE1MSW5wdXRFbGVtZW50PigndXJsLWlucHV0Jyk7XHJcbiAgYnRuQXBwbHkgPSAkPEhUTUxCdXR0b25FbGVtZW50PignYnRuLWFwcGx5Jyk7XHJcbiAgYnRuU2hvdyA9ICQ8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdidG4tc2hvdycpO1xyXG4gIGJ0bkRlZmF1bHRzID0gJDxIVE1MQnV0dG9uRWxlbWVudD4oJ2J0bi1kZWZhdWx0cycpO1xyXG4gIHN0YXR1c0VsID0gJCgnc3RhdHVzJyk7XHJcbiAgc2xpZGVOdW1iZXJFbCA9ICQoJ3NsaWRlLW51bWJlcicpO1xyXG4gIGxhbmdTZWxlY3QgPSAkPEhUTUxTZWxlY3RFbGVtZW50PignbGFuZy1zZWxlY3QnKTtcclxuICBzbGlkZXJXaWR0aCA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ3NsaWRlci13aWR0aCcpO1xyXG4gIHNsaWRlckhlaWdodCA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ3NsaWRlci1oZWlnaHQnKTtcclxuICBzbGlkZXJab29tID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLXpvb20nKTtcclxuICBzbGlkZXJXaWR0aFZhbHVlID0gJCgnc2xpZGVyLXdpZHRoLXZhbHVlJyk7XHJcbiAgc2xpZGVySGVpZ2h0VmFsdWUgPSAkKCdzbGlkZXItaGVpZ2h0LXZhbHVlJyk7XHJcbiAgc2xpZGVyWm9vbVZhbHVlID0gJCgnc2xpZGVyLXpvb20tdmFsdWUnKTtcclxuICBzaXplUHJldmlld0lubmVyID0gJCgnc2l6ZS1wcmV2aWV3LWlubmVyJyk7XHJcbiAgY2hrQXV0b09wZW4gPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdjaGstYXV0by1vcGVuJyk7XHJcbiAgY2hrTG9ja1NpemUgPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdjaGstbG9jay1zaXplJyk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLWF1dG9jbG9zZScpO1xyXG4gIHNsaWRlckF1dG9DbG9zZVZhbHVlID0gJCgnc2xpZGVyLWF1dG9jbG9zZS12YWx1ZScpO1xyXG4gIHByZXNldEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PignLmJ0bi1wcmVzZXQnKTtcclxuICB2aWV3ZXJTdGF0dXNFbCA9ICQoJ3ZpZXdlci1zdGF0dXMnKTtcclxuICB2aWV3ZXJTdGF0dXNUZXh0ID0gJCgndmlld2VyLXN0YXR1cy10ZXh0Jyk7XHJcblxyXG4gIC8vIFJlc3RvcmUgc2F2ZWQgbGFuZ3VhZ2Ugb3IgZGV0ZWN0XHJcbiAgY29uc3Qgc2F2ZWRMYW5nID0gZ2V0TGFuZ3VhZ2UoKTtcclxuICBpZiAoc2F2ZWRMYW5nKSB7XHJcbiAgICBpMThuLnNldExvY2FsZShzYXZlZExhbmcpO1xyXG4gIH1cclxuICBsYW5nU2VsZWN0LnZhbHVlID0gaTE4bi5nZXRMb2NhbGUoKTtcclxuICBhcHBseUkxOG4oKTtcclxuXHJcbiAgLy8gRXZlbnQgbGlzdGVuZXJzXHJcbiAgYnRuQXBwbHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVBcHBseSk7XHJcbiAgYnRuU2hvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNob3cpO1xyXG4gIGJ0bkRlZmF1bHRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlU2V0RGVmYXVsdHMpO1xyXG4gIGxhbmdTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UpO1xyXG4gIHVybElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVVcmxLZXlkb3duKTtcclxuICBzbGlkZXJXaWR0aC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZVdpZHRoSW5wdXQpO1xyXG4gIHNsaWRlckhlaWdodC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZUhlaWdodElucHV0KTtcclxuICBzbGlkZXJab29tLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlWm9vbUlucHV0KTtcclxuICBjaGtMb2NrU2l6ZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVMb2NrU2l6ZUNoYW5nZSk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlQXV0b0Nsb3NlSW5wdXQpO1xyXG4gICQoJ2J0bi1hdXRvb3Blbi1pbmZvJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVBdXRvT3BlbkluZm9Ub2dnbGUpO1xyXG4gICQoJ2J0bi1hdXRvY2xvc2UtaW5mbycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQXV0b0Nsb3NlSW5mb1RvZ2dsZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnpvb20tcHJlc2V0cycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVByZXNldENsaWNrKTtcclxuICAkKCdidG4tZ3VpZGUtdG9nZ2xlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVHdWlkZVRvZ2dsZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmd1aWRlLXRhYnMnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVHdWlkZVRhYkNsaWNrKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3VpZGUtdGFicycpPy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlR3VpZGVUYWJLZXlkb3duIGFzIEV2ZW50TGlzdGVuZXIpO1xyXG4gICQoJ2d1aWRlLXNlY3Rpb24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUd1aWRlQ29weSk7XHJcblxyXG4gIC8vIERldGVjdCBjdXJyZW50IHNsaWRlICYgbGlzdGVuIGZvciBjaGFuZ2VzIChvbmx5IGluc2lkZSBQb3dlclBvaW50KVxyXG4gIGRldGVjdEN1cnJlbnRTbGlkZSgpO1xyXG4gIGJ1aWxkU2xpZGVJbmRleE1hcCgpO1xyXG5cclxuICB0cnkge1xyXG4gICAgT2ZmaWNlLmNvbnRleHQuZG9jdW1lbnQuYWRkSGFuZGxlckFzeW5jKFxyXG4gICAgICBPZmZpY2UuRXZlbnRUeXBlLkRvY3VtZW50U2VsZWN0aW9uQ2hhbmdlZCxcclxuICAgICAgKCkgPT4geyBkZXRlY3RDdXJyZW50U2xpZGUoKTsgfSxcclxuICAgICk7XHJcbiAgfSBjYXRjaCB7IC8qIG91dHNpZGUgT2ZmaWNlIGhvc3Qg4oCUIHNsaWRlIGRldGVjdGlvbiB1bmF2YWlsYWJsZSAqLyB9XHJcblxyXG4gIC8vIFZpZXdlciBtZXNzYWdlIOKGkiB1cGRhdGUgc3RhdHVzIGluZGljYXRvclxyXG4gIGxhdW5jaGVyLm9uTWVzc2FnZShoYW5kbGVWaWV3ZXJNZXNzYWdlKTtcclxuXHJcbiAgLy8gRGlhbG9nIGNsb3NlZCAodXNlciBjbG9zZWQgd2luZG93IG9yIG5hdmlnYXRpb24gZXJyb3IpIOKGkiB1cGRhdGUgVUlcclxuICBsYXVuY2hlci5vbkNsb3NlZChoYW5kbGVWaWV3ZXJDbG9zZWQpO1xyXG5cclxuICAvLyBTdGFydCBwb2xsaW5nIGZvciBzbGlkZXNob3cgbW9kZS5cclxuICAvLyBUaGUgY29tbWFuZHMgcnVudGltZSAoRnVuY3Rpb25GaWxlKSBtYXkgbm90IHBlcnNpc3QsIHNvIHRoZSB0YXNrcGFuZVxyXG4gIC8vIGhhbmRsZXMgYXV0by1vcGVuIGFzIGEgcmVsaWFibGUgZmFsbGJhY2suXHJcbiAgc3RhcnRWaWV3TW9kZVBvbGxpbmcoKTtcclxuXHJcbiAgLy8g4pSA4pSAIERFQlVHOiBoaWRlIGRpYWxvZyB0ZXN0IGNvbnRyb2xzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG4gIGluaXREZWJ1Z0hpZGVDb250cm9scygpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQm9vdHN0cmFwIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIoKTtcclxuT2ZmaWNlLm9uUmVhZHkoKCkgPT4gaW5pdCgpKTtcclxuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9