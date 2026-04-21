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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUUsZUFBZSxDQUFDLENBQUM7SUFFOUQscUVBQXFFO0lBQ3JFLGtCQUFrQixFQUFFLENBQUM7SUFDckIsa0JBQWtCLEVBQUUsQ0FBQztJQUVyQixJQUFJLENBQUM7UUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQ3JDLE1BQU0sQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEVBQ3pDLEdBQUcsRUFBRSxHQUFHLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ2hDLENBQUM7SUFDSixDQUFDO0lBQUMsTUFBTSxDQUFDLENBQUMsdURBQXVELENBQUMsQ0FBQztJQUVuRSwyQ0FBMkM7SUFDM0MsUUFBUSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBRXhDLHFFQUFxRTtJQUNyRSxRQUFRLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFFdEMsb0NBQW9DO0lBQ3BDLHVFQUF1RTtJQUN2RSw0Q0FBNEM7SUFDNUMsb0JBQW9CLEVBQUUsQ0FBQztJQUV2Qiw2RUFBNkU7SUFDN0UscUJBQXFCLEVBQUUsQ0FBQztBQUMxQixDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLDZDQUFnQyxHQUFFLENBQUM7QUFDbkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FDOWlDN0IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvZGlhbG9nLWxhdW5jaGVyLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL2kxOG4udHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvbG9nZ2VyLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL3NldHRpbmdzLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvdGFza3BhbmUvdGFza3BhbmUudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy90YXNrcGFuZS90YXNrcGFuZS5jc3M/NGM3NiJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyDilIDilIDilIAgU2V0dGluZyBrZXlzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFByZWZpeCBmb3IgcGVyLXNsaWRlIHNldHRpbmcga2V5cy4gRnVsbCBrZXk6IGB3ZWJwcHRfc2xpZGVfe3NsaWRlSWR9YC4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX1NMSURFX1BSRUZJWCA9ICd3ZWJwcHRfc2xpZGVfJztcclxuXHJcbi8qKiBLZXkgZm9yIHRoZSBzYXZlZCBVSSBsYW5ndWFnZS4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX0xBTkdVQUdFID0gJ3dlYnBwdF9sYW5ndWFnZSc7XHJcblxyXG4vKiogS2V5IGZvciBnbG9iYWwgZGVmYXVsdCBzbGlkZSBjb25maWcuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9ERUZBVUxUUyA9ICd3ZWJwcHRfZGVmYXVsdHMnO1xyXG5cclxuLy8g4pSA4pSA4pSAIFZpZXdlciBkZWZhdWx0cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1pPT00gPSAxMDA7XHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0RJQUxPR19XSURUSCA9IDgwOyAgIC8vICUgb2Ygc2NyZWVuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0RJQUxPR19IRUlHSFQgPSA4MDsgIC8vICUgb2Ygc2NyZWVuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FVVE9fT1BFTiA9IHRydWU7XHJcblxyXG4vLyDilIDilIDilIAgQ29uc3RyYWludCByYW5nZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgWk9PTV9NSU4gPSA1MDtcclxuZXhwb3J0IGNvbnN0IFpPT01fTUFYID0gMzAwO1xyXG5cclxuLy8g4pSA4pSA4pSAIEF1dG8tY2xvc2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRPX0NMT1NFX1NFQyA9IDA7ICAgLy8gMCA9IGRpc2FibGVkXHJcbmV4cG9ydCBjb25zdCBBVVRPX0NMT1NFX01BWF9TRUMgPSAzNjAwO1xyXG5cclxuLyoqXHJcbiAqIE5vbi1saW5lYXIgbG9va3VwIHRhYmxlIGZvciB0aGUgYXV0by1jbG9zZSBzbGlkZXIuXHJcbiAqIEluZGV4ID0gc2xpZGVyIHBvc2l0aW9uLCB2YWx1ZSA9IHNlY29uZHMuXHJcbiAqIEdyYW51bGFyaXR5IGRlY3JlYXNlcyBhcyB2YWx1ZXMgZ3JvdzogMXMg4oaSIDVzIOKGkiAxNXMg4oaSIDMwcyDihpIgNjBzIOKGkiAzMDBzLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEFVVE9fQ0xPU0VfU1RFUFM6IHJlYWRvbmx5IG51bWJlcltdID0gW1xyXG4gIC8vIDDigJMxMHMsIHN0ZXAgMSAgKDExIHZhbHVlcylcclxuICAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCxcclxuICAvLyAxMOKAkzYwcywgc3RlcCA1ICAoMTAgdmFsdWVzKVxyXG4gIDE1LCAyMCwgMjUsIDMwLCAzNSwgNDAsIDQ1LCA1MCwgNTUsIDYwLFxyXG4gIC8vIDHigJMzIG1pbiwgc3RlcCAxNXMgICg4IHZhbHVlcylcclxuICA3NSwgOTAsIDEwNSwgMTIwLCAxMzUsIDE1MCwgMTY1LCAxODAsXHJcbiAgLy8gM+KAkzUgbWluLCBzdGVwIDMwcyAgKDQgdmFsdWVzKVxyXG4gIDIxMCwgMjQwLCAyNzAsIDMwMCxcclxuICAvLyA14oCTMTAgbWluLCBzdGVwIDYwcyAgKDUgdmFsdWVzKVxyXG4gIDM2MCwgNDIwLCA0ODAsIDU0MCwgNjAwLFxyXG4gIC8vIDEw4oCTNjAgbWluLCBzdGVwIDMwMHMgICgxMCB2YWx1ZXMpXHJcbiAgOTAwLCAxMjAwLCAxNTAwLCAxODAwLCAyMTAwLCAyNDAwLCAyNzAwLCAzMDAwLCAzMzAwLCAzNjAwLFxyXG5dO1xyXG5cclxuLy8g4pSA4pSA4pSAIEVycm9yIGhhbmRsaW5nIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMgPSAyO1xyXG5leHBvcnQgY29uc3QgU0VUVElOR1NfU0FWRV9SRVRSWV9ERUxBWV9NUyA9IDEwMDA7XHJcbmV4cG9ydCBjb25zdCBJRlJBTUVfTE9BRF9USU1FT1VUX01TID0gMTBfMDAwO1xyXG5leHBvcnQgY29uc3QgVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCA9IDYwO1xyXG5cclxuLyoqIFRydW5jYXRlIGEgVVJMIGZvciBkaXNwbGF5LCBhcHBlbmRpbmcgZWxsaXBzaXMgaWYgbmVlZGVkLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJ1bmNhdGVVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGlmICh1cmwubGVuZ3RoIDw9IFVSTF9ESVNQTEFZX01BWF9MRU5HVEgpIHJldHVybiB1cmw7XHJcbiAgcmV0dXJuIHVybC5zdWJzdHJpbmcoMCwgVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCAtIDEpICsgJ1xcdTIwMjYnO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVidWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogU2V0IHRvIGBmYWxzZWAgaW4gcHJvZHVjdGlvbiBidWlsZHMgdmlhIHdlYnBhY2sgRGVmaW5lUGx1Z2luLlxyXG4gKiBGYWxscyBiYWNrIHRvIGB0cnVlYCBzbyBkZXYvdGVzdCBydW5zIGFsd2F5cyBsb2cuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVCVUc6IGJvb2xlYW4gPVxyXG4gIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcHJvY2Vzcy5lbnYgIT09ICd1bmRlZmluZWQnXHJcbiAgICA/IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbidcclxuICAgIDogdHJ1ZTtcclxuIiwiaW1wb3J0IHsgaTE4biwgdHlwZSBUcmFuc2xhdGlvbktleSB9IGZyb20gJy4vaTE4bic7XHJcbmltcG9ydCB7IGxvZ0RlYnVnLCBsb2dFcnJvciB9IGZyb20gJy4vbG9nZ2VyJztcclxuXHJcbi8vIOKUgOKUgOKUgCBDb25zdGFudHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogRmlsZW5hbWUgb2YgdGhlIHZpZXdlciBwYWdlIGJ1aWx0IGJ5IHdlYnBhY2suICovXHJcbmV4cG9ydCBjb25zdCBWSUVXRVJfUEFHRSA9ICd2aWV3ZXIuaHRtbCc7XHJcblxyXG4vKiogT2ZmaWNlIGRpc3BsYXlEaWFsb2dBc3luYyBlcnJvciBjb2Rlcy4gKi9cclxuY29uc3QgT1BFTl9FUlIgPSB7XHJcbiAgLyoqIEEgZGlhbG9nIGlzIGFscmVhZHkgb3BlbmVkIGZyb20gdGhpcyBhZGQtaW4uICovXHJcbiAgQUxSRUFEWV9PUEVORUQ6IDEyMDA3LFxyXG4gIC8qKiBVc2VyIGRpc21pc3NlZCB0aGUgZGlhbG9nIHByb21wdCAvIHBvcHVwIGJsb2NrZXIuICovXHJcbiAgUE9QVVBfQkxPQ0tFRDogMTIwMDksXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyDilIDilIDilIAgVHlwZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpYWxvZ0NvbmZpZyB7XHJcbiAgdXJsOiBzdHJpbmc7XHJcbiAgem9vbTogbnVtYmVyO1xyXG4gIHdpZHRoOiBudW1iZXI7ICAgLy8gJSBvZiBzY3JlZW4gKDEw4oCTMTAwKVxyXG4gIGhlaWdodDogbnVtYmVyOyAgLy8gJSBvZiBzY3JlZW4gKDEw4oCTMTAwKVxyXG4gIGxhbmc6IHN0cmluZztcclxuICBhdXRvQ2xvc2VTZWM/OiBudW1iZXI7ICAvLyAwIG9yIHVuZGVmaW5lZCA9IGRpc2FibGVkXHJcbiAgc2xpZGVzaG93PzogYm9vbGVhbjsgICAgLy8gdHJ1ZSA9IGRpYWxvZyBpcyBpbiBzbGlkZXNob3cgbW9kZSAoZG9uJ3QgYWN0dWFsbHkgY2xvc2Ugb24gdGltZXIpXHJcbiAgaGlkZU1ldGhvZD86ICdub25lJyB8ICdtb3ZlJyB8ICdyZXNpemUnOyAgLy8gaG93IHRvIGhpZGUgZGlhbG9nIGFmdGVyIHRpbWVyIGluIHNsaWRlc2hvd1xyXG59XHJcblxyXG4vKiogVHlwZWQgZXJyb3IgdGhyb3duIGJ5IHtAbGluayBEaWFsb2dMYXVuY2hlcn0uICovXHJcbmV4cG9ydCBjbGFzcyBEaWFsb2dFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyByZWFkb25seSBpMThuS2V5OiBUcmFuc2xhdGlvbktleSxcclxuICAgIHB1YmxpYyByZWFkb25seSBvZmZpY2VDb2RlPzogbnVtYmVyLFxyXG4gICkge1xyXG4gICAgc3VwZXIoaTE4bi50KGkxOG5LZXkpKTtcclxuICAgIHRoaXMubmFtZSA9ICdEaWFsb2dFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgREkgaW50ZXJmYWNlcyAodGVzdGFibGUgd2l0aG91dCBPZmZpY2UgcnVudGltZSkg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogTWluaW1hbCBzdWJzZXQgb2YgT2ZmaWNlLkRpYWxvZyB1c2VkIGJ5IHRoaXMgbW9kdWxlLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE9mZmljZURpYWxvZyB7XHJcbiAgY2xvc2UoKTogdm9pZDtcclxuICBhZGRFdmVudEhhbmRsZXIoXHJcbiAgICBldmVudFR5cGU6IHN0cmluZyxcclxuICAgIGhhbmRsZXI6IChhcmc6IHsgbWVzc2FnZT86IHN0cmluZzsgZXJyb3I/OiBudW1iZXIgfSkgPT4gdm9pZCxcclxuICApOiB2b2lkO1xyXG4gIC8qKiBTZW5kIGEgbWVzc2FnZSBmcm9tIGhvc3QgdG8gZGlhbG9nIChEaWFsb2dBcGkgMS4yKykuIE1heSBub3QgZXhpc3Qgb24gb2xkZXIgT2ZmaWNlLiAqL1xyXG4gIG1lc3NhZ2VDaGlsZD8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcclxufVxyXG5cclxuaW50ZXJmYWNlIERpYWxvZ09wZW5SZXN1bHQge1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG4gIHZhbHVlOiBPZmZpY2VEaWFsb2c7XHJcbiAgZXJyb3I6IHsgY29kZTogbnVtYmVyOyBtZXNzYWdlOiBzdHJpbmcgfTtcclxufVxyXG5cclxuLyoqIE1pbmltYWwgc3Vic2V0IG9mIE9mZmljZS5jb250ZXh0LnVpIG5lZWRlZCBmb3IgZGlhbG9nIG9wZXJhdGlvbnMuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nQXBpIHtcclxuICBkaXNwbGF5RGlhbG9nQXN5bmMoXHJcbiAgICBzdGFydEFkZHJlc3M6IHN0cmluZyxcclxuICAgIG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgY2FsbGJhY2s6IChyZXN1bHQ6IERpYWxvZ09wZW5SZXN1bHQpID0+IHZvaWQsXHJcbiAgKTogdm9pZDtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlcGVuZGVuY3kgaW5qZWN0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxubGV0IF9pbmplY3RlZEFwaTogRGlhbG9nQXBpIHwgbnVsbCA9IG51bGw7XHJcbmxldCBfaW5qZWN0ZWRCYXNlVXJsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSB0aGUgT2ZmaWNlIGRpYWxvZyBBUEkuIFBhc3MgYG51bGxgIHRvIHJlc3RvcmUgdGhlIHJlYWwgb25lLlxyXG4gKiBAaW50ZXJuYWwgVXNlZCBpbiB1bml0IHRlc3RzIG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX2luamVjdERpYWxvZ0FwaShhcGk6IERpYWxvZ0FwaSB8IG51bGwpOiB2b2lkIHtcclxuICBfaW5qZWN0ZWRBcGkgPSBhcGk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSB0aGUgdmlld2VyIGJhc2UgVVJMLiBQYXNzIGBudWxsYCB0byByZXN0b3JlIGF1dG8tZGV0ZWN0aW9uLlxyXG4gKiBAaW50ZXJuYWwgVXNlZCBpbiB1bml0IHRlc3RzIG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX2luamVjdEJhc2VVcmwodXJsOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XHJcbiAgX2luamVjdGVkQmFzZVVybCA9IHVybDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXBpKCk6IERpYWxvZ0FwaSB7XHJcbiAgaWYgKF9pbmplY3RlZEFwaSkgcmV0dXJuIF9pbmplY3RlZEFwaTtcclxuICByZXR1cm4gT2ZmaWNlLmNvbnRleHQudWkgYXMgdW5rbm93biBhcyBEaWFsb2dBcGk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFZpZXdlckJhc2VVcmwoKTogc3RyaW5nIHtcclxuICBpZiAoX2luamVjdGVkQmFzZVVybCkgcmV0dXJuIF9pbmplY3RlZEJhc2VVcmw7XHJcbiAgY29uc3QgZGlyID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teL10qJC8sICcnKTtcclxuICByZXR1cm4gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke2Rpcn0vJHtWSUVXRVJfUEFHRX1gO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGlhbG9nTGF1bmNoZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY2xhc3MgRGlhbG9nTGF1bmNoZXIge1xyXG4gIHByaXZhdGUgZGlhbG9nOiBPZmZpY2VEaWFsb2cgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIG1lc3NhZ2VDYWxsYmFjazogKChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBjbG9zZWRDYWxsYmFjazogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8qKiBCdWlsZCB0aGUgZnVsbCB2aWV3ZXIgVVJMIHdpdGggcXVlcnkgcGFyYW1ldGVycy4gKi9cclxuICBwcml2YXRlIGJ1aWxkVmlld2VyVXJsKGNvbmZpZzogRGlhbG9nQ29uZmlnKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xyXG4gICAgICB1cmw6IGNvbmZpZy51cmwsXHJcbiAgICAgIHpvb206IFN0cmluZyhjb25maWcuem9vbSksXHJcbiAgICAgIGxhbmc6IGNvbmZpZy5sYW5nLFxyXG4gICAgfSk7XHJcbiAgICBpZiAoY29uZmlnLmF1dG9DbG9zZVNlYyAmJiBjb25maWcuYXV0b0Nsb3NlU2VjID4gMCkge1xyXG4gICAgICBwYXJhbXMuc2V0KCdhdXRvY2xvc2UnLCBTdHJpbmcoY29uZmlnLmF1dG9DbG9zZVNlYykpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5zbGlkZXNob3cpIHtcclxuICAgICAgcGFyYW1zLnNldCgnc2xpZGVzaG93JywgJzEnKTtcclxuICAgIH1cclxuICAgIGlmIChjb25maWcuaGlkZU1ldGhvZCAmJiBjb25maWcuaGlkZU1ldGhvZCAhPT0gJ25vbmUnKSB7XHJcbiAgICAgIHBhcmFtcy5zZXQoJ2hpZGUnLCBjb25maWcuaGlkZU1ldGhvZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYCR7Z2V0Vmlld2VyQmFzZVVybCgpfT8ke3BhcmFtcy50b1N0cmluZygpfWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPcGVuIHRoZSB2aWV3ZXIgZGlhbG9nIHdpdGggdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXHJcbiAgICogSWYgYSBkaWFsb2cgaXMgYWxyZWFkeSBvcGVuLCBjbG9zZXMgaXQgZmlyc3QgYW5kIHJlb3BlbnMuXHJcbiAgICogUmVqZWN0cyB3aXRoIHtAbGluayBEaWFsb2dFcnJvcn0gaWYgdGhlIGRpYWxvZyBjYW5ub3QgYmUgb3BlbmVkLlxyXG4gICAqL1xyXG4gIGFzeW5jIG9wZW4oY29uZmlnOiBEaWFsb2dDb25maWcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIC8vIEF1dG8tY2xvc2UgYW55IGV4aXN0aW5nIGRpYWxvZyBiZWZvcmUgb3BlbmluZyBhIG5ldyBvbmVcclxuICAgIGlmICh0aGlzLmRpYWxvZykge1xyXG4gICAgICBsb2dEZWJ1ZygnQ2xvc2luZyBleGlzdGluZyBkaWFsb2cgYmVmb3JlIG9wZW5pbmcgYSBuZXcgb25lJyk7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHdWFyZDogY2hlY2sgdGhhdCBkaXNwbGF5RGlhbG9nQXN5bmMgaXMgYXZhaWxhYmxlXHJcbiAgICBjb25zdCBhcGkgPSBnZXRBcGkoKTtcclxuICAgIGlmICghYXBpIHx8IHR5cGVvZiBhcGkuZGlzcGxheURpYWxvZ0FzeW5jICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBEaWFsb2dFcnJvcignZGlhbG9nVW5zdXBwb3J0ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3ZXJVcmwgPSB0aGlzLmJ1aWxkVmlld2VyVXJsKGNvbmZpZyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudHJ5T3BlbihhcGksIHZpZXdlclVybCwgY29uZmlnLCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRlbXB0IHRvIG9wZW4gdGhlIGRpYWxvZy4gSWYgT2ZmaWNlIHJldHVybnMgMTIwMDcgKGFscmVhZHkgb3BlbmVkKVxyXG4gICAqIG9uIHRoZSBmaXJzdCB0cnksIHdhaXQgYnJpZWZseSBhbmQgcmV0cnkgb25jZSDigJQgdGhlIHByZXZpb3VzIGNsb3NlKClcclxuICAgKiBtYXkgbm90IGhhdmUgZnVsbHkgcHJvcGFnYXRlZCB5ZXQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlPcGVuKFxyXG4gICAgYXBpOiBEaWFsb2dBcGksXHJcbiAgICB2aWV3ZXJVcmw6IHN0cmluZyxcclxuICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnLFxyXG4gICAgaXNSZXRyeTogYm9vbGVhbixcclxuICApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGFwaS5kaXNwbGF5RGlhbG9nQXN5bmMoXHJcbiAgICAgICAgdmlld2VyVXJsLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHdpZHRoOiBjb25maWcud2lkdGgsXHJcbiAgICAgICAgICBoZWlnaHQ6IGNvbmZpZy5oZWlnaHQsXHJcbiAgICAgICAgICBkaXNwbGF5SW5JZnJhbWU6IGZhbHNlLFxyXG4gICAgICAgICAgcHJvbXB0QmVmb3JlT3BlbjogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcclxuICAgICAgICAgICAgLy8gT24gZmlyc3QgYXR0ZW1wdCwgaWYgT2ZmaWNlIHNheXMgXCJhbHJlYWR5IG9wZW5lZFwiLCByZXRyeSBvbmNlXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuZXJyb3IuY29kZSA9PT0gT1BFTl9FUlIuQUxSRUFEWV9PUEVORUQgJiYgIWlzUmV0cnkpIHtcclxuICAgICAgICAgICAgICBsb2dEZWJ1ZygnR290IDEyMDA3IChhbHJlYWR5IG9wZW5lZCkg4oCUIHJldHJ5aW5nIGFmdGVyIGRlbGF5Jyk7XHJcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyeU9wZW4oYXBpLCB2aWV3ZXJVcmwsIGNvbmZpZywgdHJ1ZSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxvZ0Vycm9yKCdkaXNwbGF5RGlhbG9nQXN5bmMgZmFpbGVkOicsIHJlc3VsdC5lcnJvci5jb2RlLCByZXN1bHQuZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHJlamVjdCh0aGlzLm1hcE9wZW5FcnJvcihyZXN1bHQuZXJyb3IuY29kZSkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5kaWFsb2cgPSByZXN1bHQudmFsdWU7XHJcblxyXG4gICAgICAgICAgdGhpcy5kaWFsb2cuYWRkRXZlbnRIYW5kbGVyKFxyXG4gICAgICAgICAgICAnZGlhbG9nTWVzc2FnZVJlY2VpdmVkJyxcclxuICAgICAgICAgICAgKGFyZykgPT4gdGhpcy5oYW5kbGVNZXNzYWdlKGFyZyksXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIHRoaXMuZGlhbG9nLmFkZEV2ZW50SGFuZGxlcihcclxuICAgICAgICAgICAgJ2RpYWxvZ0V2ZW50UmVjZWl2ZWQnLFxyXG4gICAgICAgICAgICAoYXJnKSA9PiB0aGlzLmhhbmRsZUV2ZW50KGFyZyksXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIGxvZ0RlYnVnKCdEaWFsb2cgb3BlbmVkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBDbG9zZSB0aGUgZGlhbG9nIGlmIGl0IGlzIG9wZW4uIFNhZmUgdG8gY2FsbCB3aGVuIGFscmVhZHkgY2xvc2VkLiAqL1xyXG4gIGNsb3NlKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmRpYWxvZykgcmV0dXJuO1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5kaWFsb2cuY2xvc2UoKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBsb2dFcnJvcignRXJyb3IgY2xvc2luZyBkaWFsb2c6JywgZXJyKTtcclxuICAgIH1cclxuICAgIHRoaXMuZGlhbG9nID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbmQgYSBtZXNzYWdlIGZyb20gdGhlIGhvc3QgKHRhc2twYW5lL2NvbW1hbmRzKSB0byB0aGUgZGlhbG9nLlxyXG4gICAqIFVzZXMgRGlhbG9nQXBpIDEuMiBgbWVzc2FnZUNoaWxkKClgLiBSZXR1cm5zIGZhbHNlIGlmIG5vdCBzdXBwb3J0ZWQuXHJcbiAgICovXHJcbiAgc2VuZE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXRoaXMuZGlhbG9nKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGlhbG9nLm1lc3NhZ2VDaGlsZCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBsb2dEZWJ1ZygnbWVzc2FnZUNoaWxkIG5vdCBhdmFpbGFibGUgb24gdGhpcyBPZmZpY2UgdmVyc2lvbicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLmRpYWxvZy5tZXNzYWdlQ2hpbGQobWVzc2FnZSk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdtZXNzYWdlQ2hpbGQgZmFpbGVkOicsIGVycik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBkaWFsb2cgaXMgY3VycmVudGx5IG9wZW4uICovXHJcbiAgaXNPcGVuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlhbG9nICE9PSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIFN1YnNjcmliZSB0byBtZXNzYWdlcyBzZW50IGZyb20gdGhlIHZpZXdlciB2aWEgYE9mZmljZS5jb250ZXh0LnVpLm1lc3NhZ2VQYXJlbnRgLiAqL1xyXG4gIG9uTWVzc2FnZShjYWxsYmFjazogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5tZXNzYWdlQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICB9XHJcblxyXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIGRpYWxvZyBiZWluZyBjbG9zZWQgKGJ5IHVzZXIgb3IgbmF2aWdhdGlvbiBlcnJvcikuICovXHJcbiAgb25DbG9zZWQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMuY2xvc2VkQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICB9XHJcblxyXG4gIC8vIOKUgOKUgOKUgCBQcml2YXRlIGhhbmRsZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuICBwcml2YXRlIGhhbmRsZU1lc3NhZ2UoYXJnOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSk6IHZvaWQge1xyXG4gICAgaWYgKGFyZy5tZXNzYWdlICYmIHRoaXMubWVzc2FnZUNhbGxiYWNrKSB7XHJcbiAgICAgIHRoaXMubWVzc2FnZUNhbGxiYWNrKGFyZy5tZXNzYWdlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRXZlbnQoYXJnOiB7IGVycm9yPzogbnVtYmVyIH0pOiB2b2lkIHtcclxuICAgIC8vIEFsbCBEaWFsb2dFdmVudFJlY2VpdmVkIGNvZGVzICgxMjAwMiBjbG9zZWQsIDEyMDAzIG1peGVkIGNvbnRlbnQsXHJcbiAgICAvLyAxMjAwNiBjcm9zcy1kb21haW4pIG1lYW4gdGhlIGRpYWxvZyBpcyBubyBsb25nZXIgdXNhYmxlLlxyXG4gICAgbG9nRGVidWcoJ0RpYWxvZyBldmVudCByZWNlaXZlZCwgY29kZTonLCBhcmcuZXJyb3IpO1xyXG4gICAgdGhpcy5kaWFsb2cgPSBudWxsO1xyXG4gICAgaWYgKHRoaXMuY2xvc2VkQ2FsbGJhY2spIHtcclxuICAgICAgdGhpcy5jbG9zZWRDYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtYXBPcGVuRXJyb3IoY29kZTogbnVtYmVyKTogRGlhbG9nRXJyb3Ige1xyXG4gICAgc3dpdGNoIChjb2RlKSB7XHJcbiAgICAgIGNhc2UgT1BFTl9FUlIuQUxSRUFEWV9PUEVORUQ6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2dFcnJvcignZGlhbG9nQWxyZWFkeU9wZW4nLCBjb2RlKTtcclxuICAgICAgY2FzZSBPUEVOX0VSUi5QT1BVUF9CTE9DS0VEOlxyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nRXJyb3IoJ2RpYWxvZ0Jsb2NrZWQnLCBjb2RlKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gbmV3IERpYWxvZ0Vycm9yKCdlcnJvckdlbmVyaWMnLCBjb2RlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IGxvY2FsZXNEYXRhIGZyb20gJy4uL2kxOG4vbG9jYWxlcy5qc29uJztcclxuXHJcbmV4cG9ydCB0eXBlIExvY2FsZSA9ICdlbicgfCAnemgnIHwgJ2VzJyB8ICdkZScgfCAnZnInIHwgJ2l0JyB8ICdhcicgfCAncHQnIHwgJ2hpJyB8ICdydSc7XHJcbmV4cG9ydCB0eXBlIFRyYW5zbGF0aW9uS2V5ID0ga2V5b2YgdHlwZW9mIGxvY2FsZXNEYXRhWydlbiddO1xyXG5cclxuLyoqIE1hcHMgYSBCQ1AgNDcgbGFuZ3VhZ2UgdGFnIHRvIGEgc3VwcG9ydGVkIExvY2FsZS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTG9jYWxlKGxhbmdUYWc6IHN0cmluZyk6IExvY2FsZSB7XHJcbiAgY29uc3QgdGFnID0gbGFuZ1RhZy50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnemgnKSkgcmV0dXJuICd6aCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdlcycpKSByZXR1cm4gJ2VzJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2RlJykpIHJldHVybiAnZGUnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnZnInKSkgcmV0dXJuICdmcic7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdpdCcpKSByZXR1cm4gJ2l0JztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2FyJykpIHJldHVybiAnYXInO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgncHQnKSkgcmV0dXJuICdwdCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdoaScpKSByZXR1cm4gJ2hpJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3J1JykpIHJldHVybiAncnUnO1xyXG4gIHJldHVybiAnZW4nO1xyXG59XHJcblxyXG5jbGFzcyBJMThuIHtcclxuICBwcml2YXRlIGxvY2FsZTogTG9jYWxlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGlzdGVuZXJzID0gbmV3IFNldDwoKSA9PiB2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMubG9jYWxlID0gdGhpcy5kZXRlY3RMb2NhbGUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGV0ZWN0TG9jYWxlKCk6IExvY2FsZSB7XHJcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiAnZW4nO1xyXG4gICAgcmV0dXJuIHBhcnNlTG9jYWxlKG5hdmlnYXRvci5sYW5ndWFnZSA/PyAnZW4nKTtcclxuICB9XHJcblxyXG4gIC8qKiBUcmFuc2xhdGUgYSBrZXkgaW4gdGhlIGN1cnJlbnQgbG9jYWxlLiBGYWxscyBiYWNrIHRvIEVuZ2xpc2gsIHRoZW4gdGhlIGtleSBpdHNlbGYuICovXHJcbiAgdChrZXk6IFRyYW5zbGF0aW9uS2V5KTogc3RyaW5nIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIGxvY2FsZXNEYXRhW3RoaXMubG9jYWxlXVtrZXldID8/XHJcbiAgICAgIGxvY2FsZXNEYXRhWydlbiddW2tleV0gPz9cclxuICAgICAga2V5XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZ2V0TG9jYWxlKCk6IExvY2FsZSB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2NhbGU7XHJcbiAgfVxyXG5cclxuICBnZXRBdmFpbGFibGVMb2NhbGVzKCk6IExvY2FsZVtdIHtcclxuICAgIHJldHVybiBbJ2VuJywgJ3poJywgJ2VzJywgJ2RlJywgJ2ZyJywgJ2l0JywgJ2FyJywgJ3B0JywgJ2hpJywgJ3J1J107XHJcbiAgfVxyXG5cclxuICAvKiogU3dpdGNoIGxvY2FsZSBhbmQgbm90aWZ5IGFsbCBsaXN0ZW5lcnMuICovXHJcbiAgc2V0TG9jYWxlKGxvY2FsZTogTG9jYWxlKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5sb2NhbGUgPT09IGxvY2FsZSkgcmV0dXJuO1xyXG4gICAgdGhpcy5sb2NhbGUgPSBsb2NhbGU7XHJcbiAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdWJzY3JpYmUgdG8gbG9jYWxlIGNoYW5nZXMuXHJcbiAgICogQHJldHVybnMgVW5zdWJzY3JpYmUgZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgb25Mb2NhbGVDaGFuZ2UobGlzdGVuZXI6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcclxuICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XHJcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBTaW5nbGV0b24gaTE4biBpbnN0YW5jZSBzaGFyZWQgYWNyb3NzIHRoZSBhZGQtaW4uICovXHJcbmV4cG9ydCBjb25zdCBpMThuID0gbmV3IEkxOG4oKTtcclxuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tICcuL2NvbnN0YW50cyc7XHJcblxyXG5jb25zdCBQUkVGSVggPSAnW1dlYlBQVF0nO1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xyXG5cclxuLyoqIExvZyBkZWJ1ZyBpbmZvIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0RlYnVnKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS5sb2coUFJFRklYLCAuLi5hcmdzKTtcclxufVxyXG5cclxuLyoqIExvZyB3YXJuaW5ncyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dXYXJuKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS53YXJuKFBSRUZJWCwgLi4uYXJncyk7XHJcbn1cclxuXHJcbi8qKiBMb2cgZXJyb3JzIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0Vycm9yKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS5lcnJvcihQUkVGSVgsIC4uLmFyZ3MpO1xyXG59XHJcblxyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cclxuXHJcbi8qKlxyXG4gKiBJbnN0YWxsIGEgZ2xvYmFsIGhhbmRsZXIgZm9yIHVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbnMuXHJcbiAqIENhbGwgb25jZSBwZXIgZW50cnkgcG9pbnQgKHRhc2twYW5lLCB2aWV3ZXIsIGNvbW1hbmRzKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlcigpOiB2b2lkIHtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgKGV2ZW50OiBQcm9taXNlUmVqZWN0aW9uRXZlbnQpID0+IHtcclxuICAgIGxvZ0Vycm9yKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb246JywgZXZlbnQucmVhc29uKTtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcbn1cclxuIiwiaW1wb3J0IHR5cGUgeyBMb2NhbGUgfSBmcm9tICcuL2kxOG4nO1xyXG5pbXBvcnQge1xyXG4gIFNFVFRJTkdfS0VZX1NMSURFX1BSRUZJWCxcclxuICBTRVRUSU5HX0tFWV9MQU5HVUFHRSxcclxuICBTRVRUSU5HX0tFWV9ERUZBVUxUUyxcclxuICBERUZBVUxUX1pPT00sXHJcbiAgREVGQVVMVF9ESUFMT0dfV0lEVEgsXHJcbiAgREVGQVVMVF9ESUFMT0dfSEVJR0hULFxyXG4gIERFRkFVTFRfQVVUT19PUEVOLFxyXG4gIERFRkFVTFRfQVVUT19DTE9TRV9TRUMsXHJcbiAgU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFUyxcclxuICBTRVRUSU5HU19TQVZFX1JFVFJZX0RFTEFZX01TLFxyXG59IGZyb20gJy4vY29uc3RhbnRzJztcclxuaW1wb3J0IHsgbG9nRGVidWcsIGxvZ0Vycm9yIH0gZnJvbSAnLi9sb2dnZXInO1xyXG5cclxuLy8g4pSA4pSA4pSAIFR5cGVzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBXZWJQUFRTbGlkZUNvbmZpZyB7XHJcbiAgdXJsOiBzdHJpbmc7XHJcbiAgem9vbTogbnVtYmVyOyAgICAgICAgICAvLyA1MOKAkzMwMFxyXG4gIGRpYWxvZ1dpZHRoOiBudW1iZXI7ICAgLy8gMzDigJMxMDAgKCUgb2Ygc2NyZWVuKVxyXG4gIGRpYWxvZ0hlaWdodDogbnVtYmVyOyAgLy8gMzDigJMxMDAgKCUgb2Ygc2NyZWVuKVxyXG4gIGF1dG9PcGVuOiBib29sZWFuO1xyXG4gIGF1dG9DbG9zZVNlYzogbnVtYmVyOyAgLy8gMCA9IGRpc2FibGVkLCAx4oCTNjAgc2Vjb25kc1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU2F2ZVJlc3VsdCB7XHJcbiAgc3RhdHVzOiBzdHJpbmc7XHJcbiAgZXJyb3I6IHsgbWVzc2FnZTogc3RyaW5nIH0gfCBudWxsO1xyXG59XHJcblxyXG4vKiogTWluaW1hbCBzdWJzZXQgb2YgT2ZmaWNlLlNldHRpbmdzIHVzZWQgYnkgdGhpcyBtb2R1bGUuICovXHJcbmludGVyZmFjZSBTZXR0aW5nc1N0b3JlIHtcclxuICBnZXQobmFtZTogc3RyaW5nKTogdW5rbm93bjtcclxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQ7XHJcbiAgcmVtb3ZlKG5hbWU6IHN0cmluZyk6IHZvaWQ7XHJcbiAgc2F2ZUFzeW5jKGNhbGxiYWNrOiAocmVzdWx0OiBTYXZlUmVzdWx0KSA9PiB2b2lkKTogdm9pZDtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlcGVuZGVuY3kgaW5qZWN0aW9uIChmb3IgdGVzdGluZykg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5sZXQgX2luamVjdGVkU3RvcmU6IFNldHRpbmdzU3RvcmUgfCBudWxsID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSB0aGUgT2ZmaWNlIHNldHRpbmdzIHN0b3JlLiBQYXNzIGBudWxsYCB0byByZXN0b3JlIHRoZSByZWFsIG9uZS5cclxuICogQGludGVybmFsIFVzZWQgaW4gdW5pdCB0ZXN0cyBvbmx5LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9pbmplY3RTZXR0aW5nc1N0b3JlKHN0b3JlOiBTZXR0aW5nc1N0b3JlIHwgbnVsbCk6IHZvaWQge1xyXG4gIF9pbmplY3RlZFN0b3JlID0gc3RvcmU7XHJcbn1cclxuXHJcbi8qKiBJbi1tZW1vcnkgZmFsbGJhY2sgd2hlbiBydW5uaW5nIG91dHNpZGUgUG93ZXJQb2ludCAoZS5nLiBicm93c2VyIHRlc3RpbmcpLiAqL1xyXG5jb25zdCBfbWVtb3J5U3RvcmU6IFNldHRpbmdzU3RvcmUgPSAoKCkgPT4ge1xyXG4gIGNvbnN0IGRhdGEgPSBuZXcgTWFwPHN0cmluZywgdW5rbm93bj4oKTtcclxuICByZXR1cm4ge1xyXG4gICAgZ2V0OiAobmFtZTogc3RyaW5nKSA9PiBkYXRhLmdldChuYW1lKSA/PyBudWxsLFxyXG4gICAgc2V0OiAobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikgPT4geyBkYXRhLnNldChuYW1lLCB2YWx1ZSk7IH0sXHJcbiAgICByZW1vdmU6IChuYW1lOiBzdHJpbmcpID0+IHsgZGF0YS5kZWxldGUobmFtZSk7IH0sXHJcbiAgICBzYXZlQXN5bmM6IChjYjogKHI6IFNhdmVSZXN1bHQpID0+IHZvaWQpID0+IHsgY2IoeyBzdGF0dXM6ICdzdWNjZWVkZWQnLCBlcnJvcjogbnVsbCB9KTsgfSxcclxuICB9O1xyXG59KSgpO1xyXG5cclxuZnVuY3Rpb24gZ2V0U3RvcmUoKTogU2V0dGluZ3NTdG9yZSB7XHJcbiAgaWYgKF9pbmplY3RlZFN0b3JlKSByZXR1cm4gX2luamVjdGVkU3RvcmU7XHJcbiAgLyogZ2xvYmFsIE9mZmljZSAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IE9mZmljZS5jb250ZXh0Py5kb2N1bWVudD8uc2V0dGluZ3M7XHJcbiAgICBpZiAoc2V0dGluZ3MpIHJldHVybiBzZXR0aW5ncyBhcyB1bmtub3duIGFzIFNldHRpbmdzU3RvcmU7XHJcbiAgfSBjYXRjaCB7IC8qIG91dHNpZGUgT2ZmaWNlIGhvc3QgKi8gfVxyXG4gIHJldHVybiBfbWVtb3J5U3RvcmU7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBJbnRlcm5hbCBoZWxwZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gc2xpZGVLZXkoc2xpZGVJZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gYCR7U0VUVElOR19LRVlfU0xJREVfUFJFRklYfSR7c2xpZGVJZH1gO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlT25jZShzdG9yZTogU2V0dGluZ3NTdG9yZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBzdG9yZS5zYXZlQXN5bmMoKHJlc3VsdCkgPT4ge1xyXG4gICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKHJlc3VsdC5lcnJvcj8ubWVzc2FnZSA/PyAnU2V0dGluZ3Mgc2F2ZSBmYWlsZWQnKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVsYXkobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG4vKipcclxuICogU2F2ZSBzZXR0aW5ncyB3aXRoIGF1dG9tYXRpYyByZXRyeS5cclxuICogUmV0cmllcyB1cCB0byB7QGxpbmsgU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFU30gdGltZXMgd2l0aCBhIGRlbGF5IGJldHdlZW4gYXR0ZW1wdHMuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBzYXZlKHN0b3JlOiBTZXR0aW5nc1N0b3JlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IGF0dGVtcHQgPD0gU0VUVElOR1NfU0FWRV9NQVhfUkVUUklFUzsgYXR0ZW1wdCsrKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBzYXZlT25jZShzdG9yZSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBpZiAoYXR0ZW1wdCA8IFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMpIHtcclxuICAgICAgICBsb2dEZWJ1ZyhgU2V0dGluZ3Mgc2F2ZSBhdHRlbXB0ICR7YXR0ZW1wdCArIDF9IGZhaWxlZCwgcmV0cnlpbmcuLi5gKTtcclxuICAgICAgICBhd2FpdCBkZWxheShTRVRUSU5HU19TQVZFX1JFVFJZX0RFTEFZX01TKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsb2dFcnJvcignU2V0dGluZ3Mgc2F2ZSBmYWlsZWQgYWZ0ZXIgYWxsIHJldHJpZXM6JywgZXJyKTtcclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTbGlkZSBjb25maWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUmV0dXJucyB0aGUgc2F2ZWQgY29uZmlnIGZvciBhIHNsaWRlLCBvciBgbnVsbGAgaWYgbm90IHNldC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFNsaWRlQ29uZmlnKHNsaWRlSWQ6IHN0cmluZyk6IFdlYlBQVFNsaWRlQ29uZmlnIHwgbnVsbCB7XHJcbiAgY29uc3QgcmF3ID0gZ2V0U3RvcmUoKS5nZXQoc2xpZGVLZXkoc2xpZGVJZCkpO1xyXG4gIHJldHVybiByYXcgPyAocmF3IGFzIFdlYlBQVFNsaWRlQ29uZmlnKSA6IG51bGw7XHJcbn1cclxuXHJcbi8qKiBTYXZlcyBjb25maWcgZm9yIGEgc2xpZGUgYW5kIHBlcnNpc3RzIHRvIGRvY3VtZW50LiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U2xpZGVDb25maWcoc2xpZGVJZDogc3RyaW5nLCBjb25maWc6IFdlYlBQVFNsaWRlQ29uZmlnKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnNldChzbGlkZUtleShzbGlkZUlkKSwgY29uZmlnKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG5cclxuLyoqIFJlbW92ZXMgdGhlIHNhdmVkIGNvbmZpZyBmb3IgYSBzbGlkZS4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVNsaWRlQ29uZmlnKHNsaWRlSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKTtcclxuICBzdG9yZS5yZW1vdmUoc2xpZGVLZXkoc2xpZGVJZCkpO1xyXG4gIGF3YWl0IHNhdmUoc3RvcmUpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgTGFuZ3VhZ2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUmV0dXJucyB0aGUgc2F2ZWQgVUkgbGFuZ3VhZ2UsIG9yIGBudWxsYCBpZiBub3Qgc2V0LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGFuZ3VhZ2UoKTogTG9jYWxlIHwgbnVsbCB7XHJcbiAgcmV0dXJuIChnZXRTdG9yZSgpLmdldChTRVRUSU5HX0tFWV9MQU5HVUFHRSkgYXMgTG9jYWxlKSA/PyBudWxsO1xyXG59XHJcblxyXG4vKiogU2F2ZXMgdGhlIFVJIGxhbmd1YWdlIGFuZCBwZXJzaXN0cyB0byBkb2N1bWVudC4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldExhbmd1YWdlKGxvY2FsZTogTG9jYWxlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnNldChTRVRUSU5HX0tFWV9MQU5HVUFHRSwgbG9jYWxlKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlZmF1bHRzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFJldHVybnMgc2F2ZWQgZ2xvYmFsIGRlZmF1bHRzLCBvciBidWlsdC1pbiBkZWZhdWx0cyBpZiBub3Qgc2V0LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdHMoKTogV2ViUFBUU2xpZGVDb25maWcge1xyXG4gIGNvbnN0IHN0b3JlZCA9IGdldFN0b3JlKCkuZ2V0KFNFVFRJTkdfS0VZX0RFRkFVTFRTKSBhcyBXZWJQUFRTbGlkZUNvbmZpZyB8IG51bGw7XHJcbiAgcmV0dXJuIHN0b3JlZCA/PyB7XHJcbiAgICB1cmw6ICcnLFxyXG4gICAgem9vbTogREVGQVVMVF9aT09NLFxyXG4gICAgZGlhbG9nV2lkdGg6IERFRkFVTFRfRElBTE9HX1dJRFRILFxyXG4gICAgZGlhbG9nSGVpZ2h0OiBERUZBVUxUX0RJQUxPR19IRUlHSFQsXHJcbiAgICBhdXRvT3BlbjogREVGQVVMVF9BVVRPX09QRU4sXHJcbiAgICBhdXRvQ2xvc2VTZWM6IERFRkFVTFRfQVVUT19DTE9TRV9TRUMsXHJcbiAgfTtcclxufVxyXG5cclxuLyoqIFNhdmVzIGdsb2JhbCBkZWZhdWx0cyBhbmQgcGVyc2lzdHMgdG8gZG9jdW1lbnQuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXREZWZhdWx0cyhjb25maWc6IFdlYlBQVFNsaWRlQ29uZmlnKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpO1xyXG4gIHN0b3JlLnNldChTRVRUSU5HX0tFWV9ERUZBVUxUUywgY29uZmlnKTtcclxuICBhd2FpdCBzYXZlKHN0b3JlKTtcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBpMThuLCB0eXBlIExvY2FsZSwgdHlwZSBUcmFuc2xhdGlvbktleSB9IGZyb20gJy4uL3NoYXJlZC9pMThuJztcclxuaW1wb3J0IHsgZ2V0U2xpZGVDb25maWcsIHNldFNsaWRlQ29uZmlnLCBnZXRMYW5ndWFnZSwgc2V0TGFuZ3VhZ2UsIGdldERlZmF1bHRzLCBzZXREZWZhdWx0cyB9IGZyb20gJy4uL3NoYXJlZC9zZXR0aW5ncyc7XHJcbmltcG9ydCB7IERpYWxvZ0xhdW5jaGVyLCBEaWFsb2dFcnJvciB9IGZyb20gJy4uL3NoYXJlZC9kaWFsb2ctbGF1bmNoZXInO1xyXG5pbXBvcnQgeyBsb2dEZWJ1ZywgbG9nRXJyb3IsIGluc3RhbGxVbmhhbmRsZWRSZWplY3Rpb25IYW5kbGVyIH0gZnJvbSAnLi4vc2hhcmVkL2xvZ2dlcic7XHJcbmltcG9ydCB7IEFVVE9fQ0xPU0VfU1RFUFMsIHRydW5jYXRlVXJsIH0gZnJvbSAnLi4vc2hhcmVkL2NvbnN0YW50cyc7XHJcblxyXG4vLyDilIDilIDilIAgRE9NIHJlZmVyZW5jZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5jb25zdCAkID0gPFQgZXh0ZW5kcyBIVE1MRWxlbWVudD4oaWQ6IHN0cmluZyk6IFQgPT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkgYXMgVDtcclxuXHJcbmxldCB1cmxJbnB1dDogSFRNTElucHV0RWxlbWVudDtcclxubGV0IGJ0bkFwcGx5OiBIVE1MQnV0dG9uRWxlbWVudDtcclxubGV0IGJ0blNob3c6IEhUTUxCdXR0b25FbGVtZW50O1xyXG5sZXQgYnRuRGVmYXVsdHMhOiBIVE1MQnV0dG9uRWxlbWVudDtcclxubGV0IHN0YXR1c0VsOiBIVE1MRWxlbWVudDtcclxubGV0IHNsaWRlTnVtYmVyRWw6IEhUTUxFbGVtZW50O1xyXG5sZXQgbGFuZ1NlbGVjdDogSFRNTFNlbGVjdEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJXaWR0aCE6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJIZWlnaHQhOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVyWm9vbSE6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJXaWR0aFZhbHVlITogSFRNTEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJIZWlnaHRWYWx1ZSE6IEhUTUxFbGVtZW50O1xyXG5sZXQgc2xpZGVyWm9vbVZhbHVlITogSFRNTEVsZW1lbnQ7XHJcbmxldCBzaXplUHJldmlld0lubmVyITogSFRNTEVsZW1lbnQ7XHJcbmxldCBjaGtBdXRvT3BlbiE6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBjaGtMb2NrU2l6ZSE6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbmxldCBzbGlkZXJBdXRvQ2xvc2UhOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5sZXQgc2xpZGVyQXV0b0Nsb3NlVmFsdWUhOiBIVE1MRWxlbWVudDtcclxubGV0IHByZXNldEJ1dHRvbnMhOiBOb2RlTGlzdE9mPEhUTUxCdXR0b25FbGVtZW50PjtcclxubGV0IHZpZXdlclN0YXR1c0VsITogSFRNTEVsZW1lbnQ7XHJcbmxldCB2aWV3ZXJTdGF0dXNUZXh0ITogSFRNTEVsZW1lbnQ7XHJcblxyXG4vLyDilIDilIDilIAgU3RhdGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5sZXQgY3VycmVudFNsaWRlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5sZXQgY3VycmVudFNsaWRlSW5kZXg6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5jb25zdCBsYXVuY2hlciA9IG5ldyBEaWFsb2dMYXVuY2hlcigpO1xyXG5sZXQgdmlld2VyU3RhdHVzVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XHJcblxyXG4vLyDilIDilIDilIAgaTE4biDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIGFwcGx5STE4bigpOiB2b2lkIHtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignW2RhdGEtaTE4bl0nKS5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgY29uc3Qga2V5ID0gZWwuZGF0YXNldC5pMThuIGFzIFRyYW5zbGF0aW9uS2V5O1xyXG4gICAgZWwudGV4dENvbnRlbnQgPSBpMThuLnQoa2V5KTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PignW2RhdGEtaTE4bi1wbGFjZWhvbGRlcl0nKS5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgY29uc3Qga2V5ID0gZWwuZGF0YXNldC5pMThuUGxhY2Vob2xkZXIgYXMgVHJhbnNsYXRpb25LZXk7XHJcbiAgICBlbC5wbGFjZWhvbGRlciA9IGkxOG4udChrZXkpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignW2RhdGEtaTE4bi10aXRsZV0nKS5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgY29uc3Qga2V5ID0gZWwuZGF0YXNldC5pMThuVGl0bGUgYXMgVHJhbnNsYXRpb25LZXk7XHJcbiAgICBlbC50aXRsZSA9IGkxOG4udChrZXkpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBLZWVwIDxodG1sIGxhbmc+IGluIHN5bmMgd2l0aCB0aGUgYWN0aXZlIGxvY2FsZVxyXG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5sYW5nID0gaTE4bi5nZXRMb2NhbGUoKTtcclxuXHJcbiAgLy8gR3VpZGUgdG9nZ2xlIGJ1dHRvbiB1c2VzIGRhdGEtaTE4bj1cInNpdGVOb3RMb2FkaW5nXCIsIGJ1dCB3aGVuIHRoZSBndWlkZVxyXG4gIC8vIGlzIGN1cnJlbnRseSBvcGVuIHRoZSBsYWJlbCBzaG91bGQgcmVhZCBcImhpZGVTZXR1cEd1aWRlXCIgaW5zdGVhZC5cclxuICBjb25zdCBndWlkZVNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ3VpZGUtc2VjdGlvbicpO1xyXG4gIGlmIChndWlkZVNlY3Rpb24gJiYgIWd1aWRlU2VjdGlvbi5oaWRkZW4pIHtcclxuICAgIGNvbnN0IHRvZ2dsZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tZ3VpZGUtdG9nZ2xlJyk7XHJcbiAgICBpZiAodG9nZ2xlQnRuKSB7XHJcbiAgICAgIHRvZ2dsZUJ0bi50ZXh0Q29udGVudCA9IGkxOG4udCgnaGlkZVNldHVwR3VpZGUnKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTbGlkZSBkZXRlY3Rpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5hc3luYyBmdW5jdGlvbiBkZXRlY3RDdXJyZW50U2xpZGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IFBvd2VyUG9pbnQucnVuKGFzeW5jIChjb250ZXh0KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNsaWRlcyA9IGNvbnRleHQucHJlc2VudGF0aW9uLmdldFNlbGVjdGVkU2xpZGVzKCk7XHJcbiAgICAgIHNsaWRlcy5sb2FkKCdpdGVtcy9pZCcpO1xyXG4gICAgICBhd2FpdCBjb250ZXh0LnN5bmMoKTtcclxuXHJcbiAgICAgIGlmIChzbGlkZXMuaXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHNsaWRlID0gc2xpZGVzLml0ZW1zWzBdO1xyXG4gICAgICAgIGN1cnJlbnRTbGlkZUlkID0gc2xpZGUuaWQ7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSAxLWJhc2VkIGluZGV4XHJcbiAgICAgICAgY29uc3QgYWxsU2xpZGVzID0gY29udGV4dC5wcmVzZW50YXRpb24uc2xpZGVzO1xyXG4gICAgICAgIGFsbFNsaWRlcy5sb2FkKCdpdGVtcy9pZCcpO1xyXG4gICAgICAgIGF3YWl0IGNvbnRleHQuc3luYygpO1xyXG5cclxuICAgICAgICBjdXJyZW50U2xpZGVJbmRleCA9IG51bGw7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxTbGlkZXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChhbGxTbGlkZXMuaXRlbXNbaV0uaWQgPT09IGN1cnJlbnRTbGlkZUlkKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTbGlkZUluZGV4ID0gaSArIDE7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICBjdXJyZW50U2xpZGVJZCA9IG51bGw7XHJcbiAgICBjdXJyZW50U2xpZGVJbmRleCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVTbGlkZVVJKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVNpemVQcmV2aWV3KCk6IHZvaWQge1xyXG4gIGNvbnN0IHcgPSBOdW1iZXIoc2xpZGVyV2lkdGgudmFsdWUpO1xyXG4gIGNvbnN0IGggPSBOdW1iZXIoc2xpZGVySGVpZ2h0LnZhbHVlKTtcclxuICAvLyBQcmV2aWV3IGJveCBpcyA2NMOXNDg7IHNjYWxlIHByb3BvcnRpb25hbGx5XHJcbiAgc2l6ZVByZXZpZXdJbm5lci5zdHlsZS53aWR0aCA9IGAkeyh3IC8gMTAwKSAqIDU4fXB4YDtcclxuICBzaXplUHJldmlld0lubmVyLnN0eWxlLmhlaWdodCA9IGAkeyhoIC8gMTAwKSAqIDQyfXB4YDtcclxufVxyXG5cclxuZnVuY3Rpb24gZm9ybWF0QXV0b0Nsb3NlTGFiZWwoc2VjOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gIGlmIChzZWMgPT09IDApIHJldHVybiBpMThuLnQoJ2F1dG9DbG9zZU9mZicpO1xyXG4gIGlmIChzZWMgPCA2MCkgcmV0dXJuIGAke3NlY31zYDtcclxuICBjb25zdCBtID0gTWF0aC5mbG9vcihzZWMgLyA2MCk7XHJcbiAgY29uc3QgcyA9IHNlYyAlIDYwO1xyXG4gIGlmIChzZWMgPj0gMzYwMCkgcmV0dXJuIGAke01hdGguZmxvb3Ioc2VjIC8gMzYwMCl9aGA7XHJcbiAgcmV0dXJuIHMgPT09IDAgPyBgJHttfW1gIDogYCR7bX1tICR7c31zYDtcclxufVxyXG5cclxuLyoqIENvbnZlcnQgc2Vjb25kcyB2YWx1ZSDihpIgbmVhcmVzdCBzbGlkZXIgaW5kZXguICovXHJcbmZ1bmN0aW9uIHNlY29uZHNUb1NsaWRlckluZGV4KHNlYzogbnVtYmVyKTogbnVtYmVyIHtcclxuICBsZXQgYmVzdCA9IDA7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBBVVRPX0NMT1NFX1NURVBTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoTWF0aC5hYnMoQVVUT19DTE9TRV9TVEVQU1tpXSAtIHNlYykgPCBNYXRoLmFicyhBVVRPX0NMT1NFX1NURVBTW2Jlc3RdIC0gc2VjKSkge1xyXG4gICAgICBiZXN0ID0gaTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGJlc3Q7XHJcbn1cclxuXHJcbi8qKiBSZWFkIGFjdHVhbCBzZWNvbmRzIGZyb20gdGhlIGN1cnJlbnQgc2xpZGVyIHBvc2l0aW9uLiAqL1xyXG5mdW5jdGlvbiBnZXRBdXRvQ2xvc2VTZWNvbmRzKCk6IG51bWJlciB7XHJcbiAgcmV0dXJuIEFVVE9fQ0xPU0VfU1RFUFNbTnVtYmVyKHNsaWRlckF1dG9DbG9zZS52YWx1ZSldID8/IDA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFNsaWRlclVJKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB6b29tOiBudW1iZXIsIGF1dG9PcGVuOiBib29sZWFuLCBhdXRvQ2xvc2VTZWM6IG51bWJlcik6IHZvaWQge1xyXG4gIHNsaWRlcldpZHRoLnZhbHVlID0gU3RyaW5nKHdpZHRoKTtcclxuICBzbGlkZXJIZWlnaHQudmFsdWUgPSBTdHJpbmcoaGVpZ2h0KTtcclxuICBzbGlkZXJab29tLnZhbHVlID0gU3RyaW5nKHpvb20pO1xyXG4gIHNsaWRlcldpZHRoVmFsdWUudGV4dENvbnRlbnQgPSBgJHt3aWR0aH0lYDtcclxuICBzbGlkZXJIZWlnaHRWYWx1ZS50ZXh0Q29udGVudCA9IGAke2hlaWdodH0lYDtcclxuICBzbGlkZXJab29tVmFsdWUudGV4dENvbnRlbnQgPSBgJHt6b29tfSVgO1xyXG4gIGNoa0F1dG9PcGVuLmNoZWNrZWQgPSBhdXRvT3BlbjtcclxuICBzbGlkZXJBdXRvQ2xvc2UudmFsdWUgPSBTdHJpbmcoc2Vjb25kc1RvU2xpZGVySW5kZXgoYXV0b0Nsb3NlU2VjKSk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlVmFsdWUudGV4dENvbnRlbnQgPSBmb3JtYXRBdXRvQ2xvc2VMYWJlbChhdXRvQ2xvc2VTZWMpO1xyXG4gIHVwZGF0ZVNpemVQcmV2aWV3KCk7XHJcbiAgdXBkYXRlQWN0aXZlUHJlc2V0KHpvb20pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVBY3RpdmVQcmVzZXQoem9vbTogbnVtYmVyKTogdm9pZCB7XHJcbiAgcHJlc2V0QnV0dG9ucy5mb3JFYWNoKChidG4pID0+IHtcclxuICAgIGNvbnN0IHZhbCA9IE51bWJlcihidG4uZGF0YXNldC56b29tKTtcclxuICAgIGJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdidG4tcHJlc2V0LS1hY3RpdmUnLCB2YWwgPT09IHpvb20pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVTbGlkZVVJKCk6IHZvaWQge1xyXG4gIHNsaWRlTnVtYmVyRWwudGV4dENvbnRlbnQgPSBjdXJyZW50U2xpZGVJbmRleCAhPSBudWxsID8gU3RyaW5nKGN1cnJlbnRTbGlkZUluZGV4KSA6ICfigJQnO1xyXG5cclxuICBjb25zdCBkZWZhdWx0cyA9IGdldERlZmF1bHRzKCk7XHJcblxyXG4gIGlmIChjdXJyZW50U2xpZGVJZCkge1xyXG4gICAgY29uc3QgY29uZmlnID0gZ2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQpO1xyXG4gICAgdXJsSW5wdXQudmFsdWUgPSBjb25maWc/LnVybCA/PyAnJztcclxuICAgIHNldFNsaWRlclVJKFxyXG4gICAgICBjb25maWc/LmRpYWxvZ1dpZHRoID8/IGRlZmF1bHRzLmRpYWxvZ1dpZHRoLFxyXG4gICAgICBjb25maWc/LmRpYWxvZ0hlaWdodCA/PyBkZWZhdWx0cy5kaWFsb2dIZWlnaHQsXHJcbiAgICAgIGNvbmZpZz8uem9vbSA/PyBkZWZhdWx0cy56b29tLFxyXG4gICAgICBjb25maWc/LmF1dG9PcGVuID8/IGRlZmF1bHRzLmF1dG9PcGVuLFxyXG4gICAgICBjb25maWc/LmF1dG9DbG9zZVNlYyA/PyBkZWZhdWx0cy5hdXRvQ2xvc2VTZWMsXHJcbiAgICApO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB1cmxJbnB1dC52YWx1ZSA9ICcnO1xyXG4gICAgc2V0U2xpZGVyVUkoZGVmYXVsdHMuZGlhbG9nV2lkdGgsIGRlZmF1bHRzLmRpYWxvZ0hlaWdodCwgZGVmYXVsdHMuem9vbSwgZGVmYXVsdHMuYXV0b09wZW4sIGRlZmF1bHRzLmF1dG9DbG9zZVNlYyk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVTaG93QnV0dG9uU3RhdGUoKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFVSTCB2YWxpZGF0aW9uICYgbm9ybWFsaXphdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKlxyXG4gKiBBdXRvLXByZXBlbmQgYGh0dHBzOi8vYCBpZiB0aGUgdXNlciBvbWl0dGVkIHRoZSBwcm90b2NvbC5cclxuICogUmV0dXJucyB0aGUgbm9ybWFsaXplZCBVUkwgc3RyaW5nLlxyXG4gKi9cclxuZnVuY3Rpb24gbm9ybWFsaXplVXJsKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IHRyaW1tZWQgPSB2YWx1ZS50cmltKCk7XHJcbiAgaWYgKCF0cmltbWVkKSByZXR1cm4gdHJpbW1lZDtcclxuICBpZiAoIS9eaHR0cHM/OlxcL1xcLy9pLnRlc3QodHJpbW1lZCkpIHtcclxuICAgIHJldHVybiBgaHR0cHM6Ly8ke3RyaW1tZWR9YDtcclxuICB9XHJcbiAgcmV0dXJuIHRyaW1tZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzVmFsaWRVcmwodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIGlmICghdmFsdWUudHJpbSgpKSByZXR1cm4gZmFsc2U7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHUgPSBuZXcgVVJMKHZhbHVlKTtcclxuICAgIHJldHVybiB1LnByb3RvY29sID09PSAnaHR0cDonIHx8IHUucHJvdG9jb2wgPT09ICdodHRwczonO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFN0YXR1cyBtZXNzYWdlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIHNob3dTdGF0dXMoa2V5OiBUcmFuc2xhdGlvbktleSwgdHlwZTogJ3N1Y2Nlc3MnIHwgJ2Vycm9yJyk6IHZvaWQge1xyXG4gIHN0YXR1c0VsLnRleHRDb250ZW50ID0gaTE4bi50KGtleSk7XHJcbiAgc3RhdHVzRWwuY2xhc3NOYW1lID0gYHN0YXR1cyBzdGF0dXMtJHt0eXBlfWA7XHJcbiAgc3RhdHVzRWwuc2V0QXR0cmlidXRlKCdyb2xlJywgdHlwZSA9PT0gJ2Vycm9yJyA/ICdhbGVydCcgOiAnc3RhdHVzJyk7XHJcbiAgc3RhdHVzRWwuaGlkZGVuID0gZmFsc2U7XHJcblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgc3RhdHVzRWwuaGlkZGVuID0gdHJ1ZTtcclxuICB9LCAzMDAwKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNob3cgYnV0dG9uIHN0YXRlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIERpc2FibGUgXCJTaG93IFdlYiBQYWdlXCIgd2hlbiB0aGVyZSBpcyBubyBzYXZlZCBVUkwgZm9yIHRoZSBjdXJyZW50IHNsaWRlLiAqL1xyXG5mdW5jdGlvbiB1cGRhdGVTaG93QnV0dG9uU3RhdGUoKTogdm9pZCB7XHJcbiAgY29uc3QgaGFzVXJsID0gY3VycmVudFNsaWRlSWRcclxuICAgID8gISFnZXRTbGlkZUNvbmZpZyhjdXJyZW50U2xpZGVJZCk/LnVybFxyXG4gICAgOiBmYWxzZTtcclxuICBidG5TaG93LmRpc2FibGVkID0gIWhhc1VybDtcclxuICBidG5TaG93LnRpdGxlID0gaGFzVXJsXHJcbiAgICA/IHRydW5jYXRlVXJsKGdldFNsaWRlQ29uZmlnKGN1cnJlbnRTbGlkZUlkISkhLnVybClcclxuICAgIDogaTE4bi50KCdub1VybEZvclNsaWRlJyk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBBcHBseSBoYW5kbGVyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQXBwbHkoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgaWYgKCFjdXJyZW50U2xpZGVJZCkge1xyXG4gICAgc2hvd1N0YXR1cygnc2VsZWN0U2xpZGUnLCAnZXJyb3InKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIEF1dG8tZml4IG1pc3NpbmcgcHJvdG9jb2xcclxuICBsZXQgdXJsID0gbm9ybWFsaXplVXJsKHVybElucHV0LnZhbHVlKTtcclxuICBpZiAodXJsICE9PSB1cmxJbnB1dC52YWx1ZS50cmltKCkgJiYgdXJsKSB7XHJcbiAgICB1cmxJbnB1dC52YWx1ZSA9IHVybDtcclxuICAgIHNob3dTdGF0dXMoJ3VybEF1dG9GaXhlZCcsICdzdWNjZXNzJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIWlzVmFsaWRVcmwodXJsKSkge1xyXG4gICAgc2hvd1N0YXR1cygnbm9VcmwnLCAnZXJyb3InKTtcclxuICAgIHVybElucHV0LmZvY3VzKCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgc2V0U2xpZGVDb25maWcoY3VycmVudFNsaWRlSWQsIHtcclxuICAgICAgdXJsLFxyXG4gICAgICB6b29tOiBOdW1iZXIoc2xpZGVyWm9vbS52YWx1ZSksXHJcbiAgICAgIGRpYWxvZ1dpZHRoOiBOdW1iZXIoc2xpZGVyV2lkdGgudmFsdWUpLFxyXG4gICAgICBkaWFsb2dIZWlnaHQ6IE51bWJlcihzbGlkZXJIZWlnaHQudmFsdWUpLFxyXG4gICAgICBhdXRvT3BlbjogY2hrQXV0b09wZW4uY2hlY2tlZCxcclxuICAgICAgYXV0b0Nsb3NlU2VjOiBnZXRBdXRvQ2xvc2VTZWNvbmRzKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBzaG93U3RhdHVzKCdzdWNjZXNzJywgJ3N1Y2Nlc3MnKTtcclxuICAgIHVwZGF0ZVNob3dCdXR0b25TdGF0ZSgpO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgbG9nRXJyb3IoJ0ZhaWxlZCB0byBzYXZlIHNsaWRlIGNvbmZpZzonLCBlcnIpO1xyXG4gICAgc2hvd1N0YXR1cygnc2V0dGluZ3NTYXZlUmV0cnlGYWlsZWQnLCAnZXJyb3InKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTZXQgYXMgZGVmYXVsdHMgaGFuZGxlciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNldERlZmF1bHRzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBzZXREZWZhdWx0cyh7XHJcbiAgICAgIHVybDogJycsXHJcbiAgICAgIHpvb206IE51bWJlcihzbGlkZXJab29tLnZhbHVlKSxcclxuICAgICAgZGlhbG9nV2lkdGg6IE51bWJlcihzbGlkZXJXaWR0aC52YWx1ZSksXHJcbiAgICAgIGRpYWxvZ0hlaWdodDogTnVtYmVyKHNsaWRlckhlaWdodC52YWx1ZSksXHJcbiAgICAgIGF1dG9PcGVuOiBjaGtBdXRvT3Blbi5jaGVja2VkLFxyXG4gICAgICBhdXRvQ2xvc2VTZWM6IGdldEF1dG9DbG9zZVNlY29uZHMoKSxcclxuICAgIH0pO1xyXG4gICAgc2hvd1N0YXR1cygnZGVmYXVsdHNTYXZlZCcsICdzdWNjZXNzJyk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBsb2dFcnJvcignRmFpbGVkIHRvIHNhdmUgZGVmYXVsdHM6JywgZXJyKTtcclxuICAgIHNob3dTdGF0dXMoJ3NldHRpbmdzU2F2ZVJldHJ5RmFpbGVkJywgJ2Vycm9yJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGVyIC8gcHJlc2V0IGhhbmRsZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gaGFuZGxlV2lkdGhJbnB1dCgpOiB2b2lkIHtcclxuICBzbGlkZXJXaWR0aFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVyV2lkdGgudmFsdWV9JWA7XHJcbiAgaWYgKGNoa0xvY2tTaXplLmNoZWNrZWQpIHtcclxuICAgIHNsaWRlckhlaWdodC52YWx1ZSA9IHNsaWRlcldpZHRoLnZhbHVlO1xyXG4gICAgc2xpZGVySGVpZ2h0VmFsdWUudGV4dENvbnRlbnQgPSBgJHtzbGlkZXJIZWlnaHQudmFsdWV9JWA7XHJcbiAgfVxyXG4gIHVwZGF0ZVNpemVQcmV2aWV3KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUhlaWdodElucHV0KCk6IHZvaWQge1xyXG4gIHNsaWRlckhlaWdodFZhbHVlLnRleHRDb250ZW50ID0gYCR7c2xpZGVySGVpZ2h0LnZhbHVlfSVgO1xyXG4gIGlmIChjaGtMb2NrU2l6ZS5jaGVja2VkKSB7XHJcbiAgICBzbGlkZXJXaWR0aC52YWx1ZSA9IHNsaWRlckhlaWdodC52YWx1ZTtcclxuICAgIHNsaWRlcldpZHRoVmFsdWUudGV4dENvbnRlbnQgPSBgJHtzbGlkZXJXaWR0aC52YWx1ZX0lYDtcclxuICB9XHJcbiAgdXBkYXRlU2l6ZVByZXZpZXcoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlWm9vbUlucHV0KCk6IHZvaWQge1xyXG4gIGNvbnN0IHZhbCA9IE51bWJlcihzbGlkZXJab29tLnZhbHVlKTtcclxuICBzbGlkZXJab29tVmFsdWUudGV4dENvbnRlbnQgPSBgJHt2YWx9JWA7XHJcbiAgdXBkYXRlQWN0aXZlUHJlc2V0KHZhbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVByZXNldENsaWNrKGU6IEV2ZW50KTogdm9pZCB7XHJcbiAgY29uc3QgYnRuID0gKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbG9zZXN0PEhUTUxCdXR0b25FbGVtZW50PignLmJ0bi1wcmVzZXQnKTtcclxuICBpZiAoIWJ0bj8uZGF0YXNldC56b29tKSByZXR1cm47XHJcbiAgY29uc3QgdmFsID0gTnVtYmVyKGJ0bi5kYXRhc2V0Lnpvb20pO1xyXG4gIHNsaWRlclpvb20udmFsdWUgPSBTdHJpbmcodmFsKTtcclxuICBzbGlkZXJab29tVmFsdWUudGV4dENvbnRlbnQgPSBgJHt2YWx9JWA7XHJcbiAgdXBkYXRlQWN0aXZlUHJlc2V0KHZhbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUxvY2tTaXplQ2hhbmdlKCk6IHZvaWQge1xyXG4gIGlmIChjaGtMb2NrU2l6ZS5jaGVja2VkKSB7XHJcbiAgICAvLyBTeW5jIGhlaWdodCB0byB3aWR0aFxyXG4gICAgc2xpZGVySGVpZ2h0LnZhbHVlID0gc2xpZGVyV2lkdGgudmFsdWU7XHJcbiAgICBzbGlkZXJIZWlnaHRWYWx1ZS50ZXh0Q29udGVudCA9IGAke3NsaWRlckhlaWdodC52YWx1ZX0lYDtcclxuICAgIHVwZGF0ZVNpemVQcmV2aWV3KCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVBdXRvQ2xvc2VJbnB1dCgpOiB2b2lkIHtcclxuICBzbGlkZXJBdXRvQ2xvc2VWYWx1ZS50ZXh0Q29udGVudCA9IGZvcm1hdEF1dG9DbG9zZUxhYmVsKGdldEF1dG9DbG9zZVNlY29uZHMoKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUluZm9Ub2dnbGUoaGludElkOiBzdHJpbmcsIGJ0bklkOiBzdHJpbmcpOiB2b2lkIHtcclxuICBjb25zdCBoaW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaGludElkKTtcclxuICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChidG5JZCk7XHJcbiAgaWYgKCFoaW50IHx8ICFidG4pIHJldHVybjtcclxuICBjb25zdCBzaG93ID0gaGludC5oaWRkZW47XHJcbiAgaGludC5oaWRkZW4gPSAhc2hvdztcclxuICBidG4uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKHNob3cpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQXV0b09wZW5JbmZvVG9nZ2xlKCk6IHZvaWQge1xyXG4gIGhhbmRsZUluZm9Ub2dnbGUoJ2F1dG9vcGVuLWhpbnQnLCAnYnRuLWF1dG9vcGVuLWluZm8nKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQXV0b0Nsb3NlSW5mb1RvZ2dsZSgpOiB2b2lkIHtcclxuICBoYW5kbGVJbmZvVG9nZ2xlKCdhdXRvY2xvc2UtaGludCcsICdidG4tYXV0b2Nsb3NlLWluZm8nKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFZpZXdlciBzdGF0dXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG50eXBlIFZpZXdlclN0YXRlID0gJ2xvYWRpbmcnIHwgJ2xvYWRlZCcgfCAnYmxvY2tlZCcgfCAnZXJyb3InO1xyXG5cclxuZnVuY3Rpb24gc2V0Vmlld2VyU3RhdHVzKHN0YXRlOiBWaWV3ZXJTdGF0ZSk6IHZvaWQge1xyXG4gIGNvbnN0IGtleU1hcDogUmVjb3JkPFZpZXdlclN0YXRlLCBUcmFuc2xhdGlvbktleT4gPSB7XHJcbiAgICBsb2FkaW5nOiAndmlld2VyTG9hZGluZycsXHJcbiAgICBsb2FkZWQ6ICd2aWV3ZXJMb2FkZWQnLFxyXG4gICAgYmxvY2tlZDogJ3ZpZXdlckJsb2NrZWQnLFxyXG4gICAgZXJyb3I6ICd2aWV3ZXJFcnJvcicsXHJcbiAgfTtcclxuXHJcbiAgdmlld2VyU3RhdHVzRWwuaGlkZGVuID0gZmFsc2U7XHJcbiAgdmlld2VyU3RhdHVzRWwuY2xhc3NOYW1lID0gYHZpZXdlci1zdGF0dXMgdmlld2VyLXN0YXR1cy0tJHtzdGF0ZX1gO1xyXG4gIHZpZXdlclN0YXR1c1RleHQudGV4dENvbnRlbnQgPSBpMThuLnQoa2V5TWFwW3N0YXRlXSk7XHJcblxyXG4gIC8vIEF1dG8taGlkZSBzdWNjZXNzL2Vycm9yIGFmdGVyIGEgZGVsYXkgKGtlZXAgbG9hZGluZy9ibG9ja2VkIHZpc2libGUpXHJcbiAgaWYgKHZpZXdlclN0YXR1c1RpbWVyKSB7XHJcbiAgICBjbGVhclRpbWVvdXQodmlld2VyU3RhdHVzVGltZXIpO1xyXG4gICAgdmlld2VyU3RhdHVzVGltZXIgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgaWYgKHN0YXRlID09PSAnbG9hZGVkJykge1xyXG4gICAgdmlld2VyU3RhdHVzVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdmlld2VyU3RhdHVzRWwuaGlkZGVuID0gdHJ1ZTtcclxuICAgIH0sIDQwMDApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGlkZVZpZXdlclN0YXR1cygpOiB2b2lkIHtcclxuICBpZiAodmlld2VyU3RhdHVzVGltZXIpIHtcclxuICAgIGNsZWFyVGltZW91dCh2aWV3ZXJTdGF0dXNUaW1lcik7XHJcbiAgICB2aWV3ZXJTdGF0dXNUaW1lciA9IG51bGw7XHJcbiAgfVxyXG4gIHZpZXdlclN0YXR1c0VsLmhpZGRlbiA9IHRydWU7XHJcbn1cclxuXHJcbi8qKiBQYXJzZSBhbmQgaGFuZGxlIHN0cnVjdHVyZWQgbWVzc2FnZXMgZnJvbSB0aGUgdmlld2VyIGRpYWxvZy4gKi9cclxuZnVuY3Rpb24gaGFuZGxlVmlld2VyTWVzc2FnZShyYXdNZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbXNnID0gSlNPTi5wYXJzZShyYXdNZXNzYWdlKSBhcyB7IHR5cGU6IHN0cmluZzsgdXJsPzogc3RyaW5nOyBlcnJvcj86IHN0cmluZyB9O1xyXG5cclxuICAgIHN3aXRjaCAobXNnLnR5cGUpIHtcclxuICAgICAgY2FzZSAncmVhZHknOlxyXG4gICAgICAgIHNldFZpZXdlclN0YXR1cygnbG9hZGluZycpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsb2FkZWQnOlxyXG4gICAgICAgIHNldFZpZXdlclN0YXR1cygnbG9hZGVkJyk7XHJcbiAgICAgICAgLy8gU2hvdyBkZWJ1ZyByZXN1bHQgaWYgaXQgbG9va3MgbGlrZSBhIG1vdmVUby9yZXNpemVUby9yZXN0b3JlIHJlc3BvbnNlXHJcbiAgICAgICAgaWYgKG1zZy51cmwgJiYgKG1zZy51cmwuc3RhcnRzV2l0aCgnbW92ZVRvOicpIHx8IG1zZy51cmwuc3RhcnRzV2l0aCgncmVzaXplVG86JykgfHwgbXNnLnVybC5zdGFydHNXaXRoKCdyZXN0b3JlZCcpKSkge1xyXG4gICAgICAgICAgZGJnKGBERUJVRyByZXN1bHQ6ICR7bXNnLnVybH1gKTtcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RiZy1yZXN1bHQnKTtcclxuICAgICAgICAgIGlmIChyZXN1bHRFbCkgcmVzdWx0RWwudGV4dENvbnRlbnQgPSBtc2cudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnYmxvY2tlZCc6XHJcbiAgICAgICAgc2V0Vmlld2VyU3RhdHVzKCdibG9ja2VkJyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Vycm9yJzpcclxuICAgICAgICBzZXRWaWV3ZXJTdGF0dXMoJ2Vycm9yJyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Nsb3NlJzpcclxuICAgICAgICAvLyBTYXZlIHNsaWRlIElEIEJFRk9SRSBjbG9zZSDigJQgb25TbGlkZXNob3dFeGl0IG1heSByZXNldCBsYXN0U2xpZGVzaG93U2xpZGVJZFxyXG4gICAgICAgIGlmIChsYXN0U2xpZGVzaG93U2xpZGVJZCkge1xyXG4gICAgICAgICAgbGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWQgPSBsYXN0U2xpZGVzaG93U2xpZGVJZDtcclxuICAgICAgICAgIGRiZyhgRGlhbG9nIGNsb3Npbmcgb24gc2xpZGUgJHtsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZH0g4oCUIHdpbGwgbm90IHJlLW9wZW4gdW50aWwgc2xpZGUgY2hhbmdlc2ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsYXVuY2hlci5jbG9zZSgpO1xyXG4gICAgICAgIGJ0blNob3cuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBoaWRlVmlld2VyU3RhdHVzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvLyBOb24tSlNPTiBtZXNzYWdlIOKAlCBpZ25vcmVcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVZpZXdlckNsb3NlZCgpOiB2b2lkIHtcclxuICBidG5TaG93LmRpc2FibGVkID0gZmFsc2U7XHJcbiAgLy8gUmVtZW1iZXIgd2hpY2ggc2xpZGUgdGhlIGRpYWxvZyB3YXMgY2xvc2VkIG9uIChwcmV2ZW50IHJlLW9wZW5pbmcpLlxyXG4gIC8vIE1heSBhbHJlYWR5IGJlIHNldCBieSAnY2xvc2UnIG1lc3NhZ2UgaGFuZGxlciAoYmVmb3JlIGxhdW5jaGVyLmNsb3NlKS5cclxuICBpZiAobGFzdFNsaWRlc2hvd1NsaWRlSWQgJiYgIWxhc3REaWFsb2dDbG9zZWRTbGlkZUlkKSB7XHJcbiAgICBsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZCA9IGxhc3RTbGlkZXNob3dTbGlkZUlkO1xyXG4gICAgZGJnKGBEaWFsb2cgY2xvc2VkIChldmVudCkgb24gc2xpZGUgJHtsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZH1gKTtcclxuICB9XHJcbiAgLy8gU2hvdyBicmllZiBcImNsb3NlZFwiIHN0YXR1cyB0aGVuIGhpZGVcclxuICB2aWV3ZXJTdGF0dXNFbC5oaWRkZW4gPSBmYWxzZTtcclxuICB2aWV3ZXJTdGF0dXNFbC5jbGFzc05hbWUgPSAndmlld2VyLXN0YXR1cyc7XHJcbiAgdmlld2VyU3RhdHVzVGV4dC50ZXh0Q29udGVudCA9IGkxOG4udCgndmlld2VyQ2xvc2VkJyk7XHJcblxyXG4gIGlmICh2aWV3ZXJTdGF0dXNUaW1lcikgY2xlYXJUaW1lb3V0KHZpZXdlclN0YXR1c1RpbWVyKTtcclxuICB2aWV3ZXJTdGF0dXNUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgdmlld2VyU3RhdHVzRWwuaGlkZGVuID0gdHJ1ZTtcclxuICB9LCAyMDAwKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNob3cgV2ViIFBhZ2UgaGFuZGxlciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNob3coKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgaWYgKCFjdXJyZW50U2xpZGVJZCkge1xyXG4gICAgc2hvd1N0YXR1cygnc2VsZWN0U2xpZGUnLCAnZXJyb3InKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNvbmZpZyA9IGdldFNsaWRlQ29uZmlnKGN1cnJlbnRTbGlkZUlkKTtcclxuXHJcbiAgaWYgKCFjb25maWcgfHwgIWNvbmZpZy51cmwpIHtcclxuICAgIHNob3dTdGF0dXMoJ25vVXJsRm9yU2xpZGUnLCAnZXJyb3InKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIG5ldHdvcmsgYmVmb3JlIG9wZW5pbmdcclxuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgIW5hdmlnYXRvci5vbkxpbmUpIHtcclxuICAgIHNob3dTdGF0dXMoJ25vSW50ZXJuZXQnLCAnZXJyb3InKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGJ0blNob3cuZGlzYWJsZWQgPSB0cnVlO1xyXG4gIHNldFZpZXdlclN0YXR1cygnbG9hZGluZycpO1xyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgbGF1bmNoZXIub3Blbih7XHJcbiAgICAgIHVybDogY29uZmlnLnVybCxcclxuICAgICAgem9vbTogY29uZmlnLnpvb20sXHJcbiAgICAgIHdpZHRoOiBjb25maWcuZGlhbG9nV2lkdGgsXHJcbiAgICAgIGhlaWdodDogY29uZmlnLmRpYWxvZ0hlaWdodCxcclxuICAgICAgbGFuZzogaTE4bi5nZXRMb2NhbGUoKSxcclxuICAgICAgYXV0b0Nsb3NlU2VjOiBjb25maWcuYXV0b0Nsb3NlU2VjLFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBidG5TaG93LmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICBoaWRlVmlld2VyU3RhdHVzKCk7XHJcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgRGlhbG9nRXJyb3IpIHtcclxuICAgICAgc2hvd1N0YXR1cyhlcnIuaTE4bktleSwgJ2Vycm9yJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzaG93U3RhdHVzKCdlcnJvckdlbmVyaWMnLCAnZXJyb3InKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBHdWlkZSBoYW5kbGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmNvbnN0IFNOSVBQRVRTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gIG5naW54OiAnYWRkX2hlYWRlciBDb250ZW50LVNlY3VyaXR5LVBvbGljeSBcImZyYW1lLWFuY2VzdG9ycyAqXCI7JyxcclxuICBhcGFjaGU6ICdIZWFkZXIgc2V0IENvbnRlbnQtU2VjdXJpdHktUG9saWN5IFwiZnJhbWUtYW5jZXN0b3JzICpcIlxcbkhlYWRlciB1bnNldCBYLUZyYW1lLU9wdGlvbnMnLFxyXG4gIGV4cHJlc3M6IGBhcHAudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xcbiAgcmVzLnNldEhlYWRlcignQ29udGVudC1TZWN1cml0eS1Qb2xpY3knLCAnZnJhbWUtYW5jZXN0b3JzIConKTtcXG4gIHJlcy5yZW1vdmVIZWFkZXIoJ1gtRnJhbWUtT3B0aW9ucycpO1xcbiAgbmV4dCgpO1xcbn0pO2AsXHJcbiAgbWV0YTogJzxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiXFxuICAgICAgY29udGVudD1cImZyYW1lLWFuY2VzdG9ycyAqXCI+JyxcclxufTtcclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUd1aWRlVG9nZ2xlKCk6IHZvaWQge1xyXG4gIGNvbnN0IHNlY3Rpb24gPSAkKCdndWlkZS1zZWN0aW9uJyk7XHJcbiAgY29uc3QgdG9nZ2xlID0gJCgnYnRuLWd1aWRlLXRvZ2dsZScpO1xyXG4gIGNvbnN0IGlzSGlkZGVuID0gc2VjdGlvbi5oaWRkZW47XHJcbiAgc2VjdGlvbi5oaWRkZW4gPSAhaXNIaWRkZW47XHJcbiAgdG9nZ2xlLnRleHRDb250ZW50ID0gaTE4bi50KGlzSGlkZGVuID8gJ2hpZGVTZXR1cEd1aWRlJyA6ICdzaXRlTm90TG9hZGluZycpO1xyXG4gIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcoaXNIaWRkZW4pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWN0aXZhdGVHdWlkZVRhYih0YWJJZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MQnV0dG9uRWxlbWVudD4oJyNndWlkZS1zZWN0aW9uIFtkYXRhLWd1aWRlLXRhYl0nKS5mb3JFYWNoKCh0KSA9PiB7XHJcbiAgICBjb25zdCBhY3RpdmUgPSB0LmRhdGFzZXQuZ3VpZGVUYWIgPT09IHRhYklkO1xyXG4gICAgdC5jbGFzc0xpc3QudG9nZ2xlKCdndWlkZS10YWItLWFjdGl2ZScsIGFjdGl2ZSk7XHJcbiAgICB0LnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIFN0cmluZyhhY3RpdmUpKTtcclxuICAgIHQudGFiSW5kZXggPSBhY3RpdmUgPyAwIDogLTE7XHJcbiAgICBpZiAoYWN0aXZlKSB0LmZvY3VzKCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcjZ3VpZGUtc2VjdGlvbiBbZGF0YS1ndWlkZS1wYW5lbF0nKS5mb3JFYWNoKChwKSA9PiB7XHJcbiAgICBwLmhpZGRlbiA9IHAuZGF0YXNldC5ndWlkZVBhbmVsICE9PSB0YWJJZDtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlR3VpZGVUYWJDbGljayhlOiBFdmVudCk6IHZvaWQge1xyXG4gIGNvbnN0IHRhYiA9IChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xvc2VzdDxIVE1MQnV0dG9uRWxlbWVudD4oJ1tkYXRhLWd1aWRlLXRhYl0nKTtcclxuICBpZiAoIXRhYikgcmV0dXJuO1xyXG4gIGFjdGl2YXRlR3VpZGVUYWIodGFiLmRhdGFzZXQuZ3VpZGVUYWIhKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlR3VpZGVUYWJLZXlkb3duKGU6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICBjb25zdCB0YWJzID0gQXJyYXkuZnJvbShcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEJ1dHRvbkVsZW1lbnQ+KCcjZ3VpZGUtc2VjdGlvbiBbZGF0YS1ndWlkZS10YWJdJyksXHJcbiAgKTtcclxuICBjb25zdCBjdXJyZW50ID0gdGFicy5maW5kSW5kZXgoKHQpID0+IHQuZ2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJykgPT09ICd0cnVlJyk7XHJcbiAgbGV0IG5leHQgPSAtMTtcclxuXHJcbiAgaWYgKGUua2V5ID09PSAnQXJyb3dSaWdodCcpIG5leHQgPSAoY3VycmVudCArIDEpICUgdGFicy5sZW5ndGg7XHJcbiAgZWxzZSBpZiAoZS5rZXkgPT09ICdBcnJvd0xlZnQnKSBuZXh0ID0gKGN1cnJlbnQgLSAxICsgdGFicy5sZW5ndGgpICUgdGFicy5sZW5ndGg7XHJcbiAgZWxzZSBpZiAoZS5rZXkgPT09ICdIb21lJykgbmV4dCA9IDA7XHJcbiAgZWxzZSBpZiAoZS5rZXkgPT09ICdFbmQnKSBuZXh0ID0gdGFicy5sZW5ndGggLSAxO1xyXG4gIGVsc2UgcmV0dXJuO1xyXG5cclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgYWN0aXZhdGVHdWlkZVRhYih0YWJzW25leHRdLmRhdGFzZXQuZ3VpZGVUYWIhKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR3VpZGVDb3B5KGU6IEV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3QgYnRuID0gKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbG9zZXN0PEhUTUxCdXR0b25FbGVtZW50PignW2RhdGEtY29weS1zbmlwcGV0XScpO1xyXG4gIGlmICghYnRuKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGtleSA9IGJ0bi5kYXRhc2V0LmNvcHlTbmlwcGV0ITtcclxuICBjb25zdCB0ZXh0ID0gU05JUFBFVFNba2V5XTtcclxuICBpZiAoIXRleHQpIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xyXG4gICAgYnRuLnRleHRDb250ZW50ID0gaTE4bi50KCdjb3BpZWQnKTtcclxuICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCdidG4tY29weS0tY29waWVkJyk7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgYnRuLnRleHRDb250ZW50ID0gaTE4bi50KCdjb3B5Jyk7XHJcbiAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdidG4tY29weS0tY29waWVkJyk7XHJcbiAgICB9LCAyMDAwKTtcclxuICB9IGNhdGNoIHtcclxuICAgIC8vIEZhbGxiYWNrOiBzZWxlY3QgdGV4dCBpbiB0aGUgY29kZSBibG9ja1xyXG4gICAgY29uc3QgcGFuZWwgPSBidG4uY2xvc2VzdCgnW2RhdGEtZ3VpZGUtcGFuZWxdJyk7XHJcbiAgICBjb25zdCBjb2RlID0gcGFuZWw/LnF1ZXJ5U2VsZWN0b3IoJ2NvZGUnKTtcclxuICAgIGlmIChjb2RlKSB7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGNvZGUpO1xyXG4gICAgICBjb25zdCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICAgIHNlbD8ucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICAgIHNlbD8uYWRkUmFuZ2UocmFuZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIExhbmd1YWdlIHN3aXRjaCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxhbmd1YWdlQ2hhbmdlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IGxvY2FsZSA9IGxhbmdTZWxlY3QudmFsdWUgYXMgTG9jYWxlO1xyXG4gIGkxOG4uc2V0TG9jYWxlKGxvY2FsZSk7XHJcbiAgYXBwbHlJMThuKCk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBzZXRMYW5ndWFnZShsb2NhbGUpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gbm9uLWNyaXRpY2FsIOKAlCBVSSBhbHJlYWR5IHVwZGF0ZWRcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBLZXlib2FyZCBzdXBwb3J0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gaGFuZGxlVXJsS2V5ZG93bihlOiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XHJcbiAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBoYW5kbGVBcHBseSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlYnVnIHBhbmVsICh0ZW1wb3Jhcnkg4oCUIHJlbW92ZSBhZnRlciBmaXhpbmcpIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxubGV0IGRlYnVnUGFuZWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbmxldCBkZWJ1Z0xpbmVDb3VudCA9IDA7XHJcblxyXG5mdW5jdGlvbiBkYmcobXNnOiBzdHJpbmcpOiB2b2lkIHtcclxuICBsb2dEZWJ1ZygnW1Rhc2twYW5lXScsIG1zZyk7XHJcbiAgaWYgKCFkZWJ1Z1BhbmVsKSB7XHJcbiAgICBkZWJ1Z1BhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlYnVnLXBhbmVsJyk7XHJcbiAgfVxyXG4gIGlmIChkZWJ1Z1BhbmVsKSB7XHJcbiAgICBkZWJ1Z0xpbmVDb3VudCsrO1xyXG4gICAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCdlbicsIHsgaG91cjEyOiBmYWxzZSB9KTtcclxuICAgIGRlYnVnUGFuZWwudGV4dENvbnRlbnQgKz0gYFxcbiR7ZGVidWdMaW5lQ291bnR9LiBbJHt0aW1lfV0gJHttc2d9YDtcclxuICAgIGRlYnVnUGFuZWwuc2Nyb2xsVG9wID0gZGVidWdQYW5lbC5zY3JvbGxIZWlnaHQ7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGVzaG93IGF1dG8tb3BlbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuLy9cclxuLy8gVGhlIGNvbW1hbmRzIHJ1bnRpbWUgKEZ1bmN0aW9uRmlsZSkgbWF5IG5vdCBwZXJzaXN0IGR1cmluZyBzbGlkZXNob3cgb24gYWxsXHJcbi8vIFBvd2VyUG9pbnQgdmVyc2lvbnMuIEFzIGEgcmVsaWFibGUgZmFsbGJhY2ssIHRoZSB0YXNrcGFuZSBpdHNlbGYgcG9sbHMgZm9yXHJcbi8vIHZpZXcgbW9kZSBjaGFuZ2VzIGFuZCBzbGlkZSBuYXZpZ2F0aW9uIGR1cmluZyBzbGlkZXNob3cuXHJcbi8vXHJcbi8vIFVzZXMgZ2V0QWN0aXZlVmlld0FzeW5jKCkgaW5zdGVhZCBvZiBBY3RpdmVWaWV3Q2hhbmdlZCBldmVudCBiZWNhdXNlXHJcbi8vIHRoZSBldmVudCBtYXkgbm90IGZpcmUgaW4gdGhlIHRhc2twYW5lIGNvbnRleHQuXHJcblxyXG4vKiogSG93IG9mdGVuIHRvIGNoZWNrIHRoZSBjdXJyZW50IHZpZXcgbW9kZSAobXMpLiAqL1xyXG5jb25zdCBWSUVXX1BPTExfSU5URVJWQUxfTVMgPSAyMDAwO1xyXG5cclxuLyoqIEhvdyBvZnRlbiB0byBjaGVjayB0aGUgY3VycmVudCBzbGlkZSBkdXJpbmcgc2xpZGVzaG93IChtcykuICovXHJcbmNvbnN0IFNMSURFX1BPTExfSU5URVJWQUxfTVMgPSAxNTAwO1xyXG5cclxubGV0IHZpZXdQb2xsVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldEludGVydmFsPiB8IG51bGwgPSBudWxsO1xyXG5sZXQgc2xpZGVQb2xsVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldEludGVydmFsPiB8IG51bGwgPSBudWxsO1xyXG5sZXQgc2xpZGVzaG93QWN0aXZlID0gZmFsc2U7XHJcbmxldCBsYXN0U2xpZGVzaG93U2xpZGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbmxldCBzbGlkZVBvbGxCdXN5ID0gZmFsc2U7XHJcblxyXG4vKiogV2hldGhlciB0aGUgdmlld2VyIGRpYWxvZyBoYXMgYmVlbiBvcGVuZWQgZm9yIHRoZSBjdXJyZW50IHNsaWRlc2hvdyBzZXNzaW9uLiAqL1xyXG5sZXQgc2xpZGVzaG93RGlhbG9nT3BlbmVkID0gZmFsc2U7XHJcblxyXG4vKiogU2xpZGUgSUQgZm9yIHdoaWNoIHRoZSBkaWFsb2cgd2FzIGxhc3QgY2xvc2VkICh0byBwcmV2ZW50IHJlLW9wZW5pbmcgb24gc2FtZSBzbGlkZSkuICovXHJcbmxldCBsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcblxyXG4vKiogR2V0IHRoZSBjdXJyZW50IHZpZXcgbW9kZSAoXCJlZGl0XCIgb3IgXCJyZWFkXCIpLiAqL1xyXG5mdW5jdGlvbiBnZXRBY3RpdmVWaWV3KCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBPZmZpY2UuY29udGV4dC5kb2N1bWVudC5nZXRBY3RpdmVWaWV3QXN5bmMoKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBPZmZpY2UuQXN5bmNSZXN1bHRTdGF0dXMuU3VjY2VlZGVkKSB7XHJcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdC52YWx1ZSBhcyB1bmtub3duIGFzIHN0cmluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRiZyhgZ2V0QWN0aXZlVmlldyBGQUlMRUQ6ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gKTtcclxuICAgICAgICAgIHJlc29sdmUoJ2VkaXQnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGRiZyhgZ2V0QWN0aXZlVmlldyBFWENFUFRJT046ICR7ZXJyfWApO1xyXG4gICAgICByZXNvbHZlKCdlZGl0Jyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGN1cnJlbnQgc2xpZGUgSUQuIFRyaWVzIHR3byBtZXRob2RzOlxyXG4gKiAxLiBQb3dlclBvaW50IEpTIEFQSSBnZXRTZWxlY3RlZFNsaWRlcygpIOKAlCB3b3JrcyBpbiBlZGl0IG1vZGVcclxuICogMi4gQ29tbW9uIEFQSSBnZXRTZWxlY3RlZERhdGFBc3luYyhTbGlkZVJhbmdlKSDigJQgbWF5IHdvcmsgaW4gc2xpZGVzaG93XHJcbiAqXHJcbiAqIE1ldGhvZCAyIHJldHVybnMgYSBudW1lcmljIHNsaWRlIElELCB3aGljaCB3ZSBtYXAgdG8gdGhlIEpTIEFQSSBzdHJpbmcgSURcclxuICogdXNpbmcgYSBwcmUtYnVpbHQgaW5kZXjihpJpZCBsb29rdXAgdGFibGUuXHJcbiAqL1xyXG5cclxuLyoqIE1hcCBvZiBzbGlkZSBpbmRleCAoMS1iYXNlZCkg4oaSIFBvd2VyUG9pbnQgSlMgQVBJIHNsaWRlIElELiBCdWlsdCBiZWZvcmUgc2xpZGVzaG93LiAqL1xyXG5sZXQgc2xpZGVJbmRleFRvSWQ6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XHJcblxyXG4vKiogQnVpbGQgdGhlIGluZGV44oaSaWQgbWFwIGZyb20gYWxsIHNsaWRlcyBpbiB0aGUgcHJlc2VudGF0aW9uLiAqL1xyXG5hc3luYyBmdW5jdGlvbiBidWlsZFNsaWRlSW5kZXhNYXAoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IFBvd2VyUG9pbnQucnVuKGFzeW5jIChjb250ZXh0KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNsaWRlcyA9IGNvbnRleHQucHJlc2VudGF0aW9uLnNsaWRlcztcclxuICAgICAgc2xpZGVzLmxvYWQoJ2l0ZW1zL2lkJyk7XHJcbiAgICAgIGF3YWl0IGNvbnRleHQuc3luYygpO1xyXG4gICAgICBzbGlkZUluZGV4VG9JZCA9IG5ldyBNYXAoKTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbGlkZXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBzbGlkZUluZGV4VG9JZC5zZXQoaSArIDEsIHNsaWRlcy5pdGVtc1tpXS5pZCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc3QgZW50cmllczogc3RyaW5nW10gPSBbXTtcclxuICAgIHNsaWRlSW5kZXhUb0lkLmZvckVhY2goKGlkLCBpZHgpID0+IGVudHJpZXMucHVzaChgJHtpZHh94oaSJHtpZH1gKSk7XHJcbiAgICBkYmcoYFNsaWRlIG1hcDogJHtlbnRyaWVzLmpvaW4oJywgJyl9YCk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBkYmcoYGJ1aWxkU2xpZGVJbmRleE1hcCBFUlJPUjogJHtlcnJ9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogTWV0aG9kIDE6IFBvd2VyUG9pbnQgSlMgQVBJIOKAlCBnZXRTZWxlY3RlZFNsaWRlcygpLiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRTbGlkZUlkVmlhSnNBcGkoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgdHJ5IHtcclxuICAgIGxldCBzbGlkZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIGF3YWl0IFBvd2VyUG9pbnQucnVuKGFzeW5jIChjb250ZXh0KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNsaWRlcyA9IGNvbnRleHQucHJlc2VudGF0aW9uLmdldFNlbGVjdGVkU2xpZGVzKCk7XHJcbiAgICAgIHNsaWRlcy5sb2FkKCdpdGVtcy9pZCcpO1xyXG4gICAgICBhd2FpdCBjb250ZXh0LnN5bmMoKTtcclxuICAgICAgaWYgKHNsaWRlcy5pdGVtcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgc2xpZGVJZCA9IHNsaWRlcy5pdGVtc1swXS5pZDtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc2xpZGVJZDtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGRiZyhgSlMgQVBJIGdldFNlbGVjdGVkU2xpZGVzIEVSUk9SOiAke2Vycn1gKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIE1ldGhvZCAyOiBDb21tb24gQVBJIOKAlCBnZXRTZWxlY3RlZERhdGFBc3luYyhTbGlkZVJhbmdlKS4gKi9cclxuZnVuY3Rpb24gZ2V0U2xpZGVJZFZpYUNvbW1vbkFwaSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIE9mZmljZS5jb250ZXh0LmRvY3VtZW50LmdldFNlbGVjdGVkRGF0YUFzeW5jKFxyXG4gICAgICAgIE9mZmljZS5Db2VyY2lvblR5cGUuU2xpZGVSYW5nZSxcclxuICAgICAgICAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gT2ZmaWNlLkFzeW5jUmVzdWx0U3RhdHVzLlN1Y2NlZWRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gcmVzdWx0LnZhbHVlIGFzIHsgc2xpZGVzPzogQXJyYXk8eyBpZDogbnVtYmVyOyBpbmRleDogbnVtYmVyIH0+IH07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnNsaWRlcyAmJiBkYXRhLnNsaWRlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgc2xpZGUgPSBkYXRhLnNsaWRlc1swXTtcclxuICAgICAgICAgICAgICBkYmcoYENvbW1vbkFQSSBzbGlkZTogaWQ9JHtzbGlkZS5pZH0gaW5kZXg9JHtzbGlkZS5pbmRleH1gKTtcclxuICAgICAgICAgICAgICAvLyBNYXAgaW5kZXggdG8gSlMgQVBJIHNsaWRlIElEXHJcbiAgICAgICAgICAgICAgY29uc3QganNJZCA9IHNsaWRlSW5kZXhUb0lkLmdldChzbGlkZS5pbmRleCk7XHJcbiAgICAgICAgICAgICAgaWYgKGpzSWQpIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoanNJZCk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRiZyhgTm8gSlMgQVBJIElEIGZvdW5kIGZvciBpbmRleCAke3NsaWRlLmluZGV4fWApO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgZGJnKCdDb21tb25BUEk6IG5vIHNsaWRlcyBpbiByZXN1bHQnKTtcclxuICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkYmcoYENvbW1vbkFQSSBGQUlMRUQ6ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gKTtcclxuICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICApO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGRiZyhgQ29tbW9uQVBJIEVYQ0VQVElPTjogJHtlcnJ9YCk7XHJcbiAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8qKiBUcnkgYm90aCBtZXRob2RzIHRvIGdldCB0aGUgY3VycmVudCBzbGlkZSBJRC4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0U2xpZGVzaG93U2xpZGVJZCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAvLyBUcnkgSlMgQVBJIGZpcnN0ICh3b3JrcyByZWxpYWJseSBpbiBlZGl0IG1vZGUpXHJcbiAgY29uc3QganNSZXN1bHQgPSBhd2FpdCBnZXRTbGlkZUlkVmlhSnNBcGkoKTtcclxuICBpZiAoanNSZXN1bHQpIHtcclxuICAgIGRiZyhgc2xpZGVJZCB2aWEgSlMgQVBJOiAke2pzUmVzdWx0fWApO1xyXG4gICAgcmV0dXJuIGpzUmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLy8gRmFsbGJhY2s6IENvbW1vbiBBUEkgKG1heSB3b3JrIGluIHNsaWRlc2hvdylcclxuICBjb25zdCBjb21tb25SZXN1bHQgPSBhd2FpdCBnZXRTbGlkZUlkVmlhQ29tbW9uQXBpKCk7XHJcbiAgZGJnKGBzbGlkZUlkIHZpYSBDb21tb25BUEk6ICR7Y29tbW9uUmVzdWx0fWApO1xyXG4gIHJldHVybiBjb21tb25SZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPcGVuIG9yIHVwZGF0ZSB0aGUgdmlld2VyIGZvciBhIHNsaWRlIGR1cmluZyBzbGlkZXNob3cuXHJcbiAqXHJcbiAqIENSSVRJQ0FMOiBDbG9zaW5nIGBkaXNwbGF5RGlhbG9nQXN5bmNgIGR1cmluZyBzbGlkZXNob3cgY2F1c2VzIFBvd2VyUG9pbnRcclxuICogdG8gZXhpdCBzbGlkZXNob3cgbW9kZS4gV2UgbXVzdCBORVZFUiBjbG9zZS9yZW9wZW4gdGhlIGRpYWxvZy5cclxuICpcclxuICogU3RyYXRlZ3k6XHJcbiAqIC0gRmlyc3QgVVJMIGluIHNsaWRlc2hvdyDihpIgb3BlbiBkaWFsb2cgbm9ybWFsbHkgKHdpdGggdGhlIFVSTClcclxuICogLSBTdWJzZXF1ZW50IFVSTHMg4oaSIHdyaXRlIHRvIGxvY2FsU3RvcmFnZSwgdmlld2VyIHBpY2tzIGl0IHVwIHZpYSBgc3RvcmFnZWAgZXZlbnRcclxuICogLSBTbGlkZSB3aXRoIG5vIFVSTCDihpIgd3JpdGUgZW1wdHkgc3RyaW5nLCB2aWV3ZXIgc2hvd3Mgc3RhbmRieSAoYmxhY2sgc2NyZWVuKVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gYXV0b09wZW5WaWV3ZXJGb3JTbGlkZShzbGlkZUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCBjb25maWcgPSBnZXRTbGlkZUNvbmZpZyhzbGlkZUlkKTtcclxuICBkYmcoYGF1dG9PcGVuOiBzbGlkZT0ke3NsaWRlSWR9IHVybD0ke2NvbmZpZz8udXJsID8/ICdub25lJ30gYXV0b09wZW49JHtjb25maWc/LmF1dG9PcGVufSBsYXN0Q2xvc2VkPSR7bGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWR9YCk7XHJcbiAgaWYgKCFjb25maWc/LnVybCB8fCAhY29uZmlnLmF1dG9PcGVuKSByZXR1cm47XHJcblxyXG4gIC8vIEd1YXJkOiBkb24ndCByZS1vcGVuIGRpYWxvZyBmb3IgdGhlIHNhbWUgc2xpZGUgaXQgd2FzIGNsb3NlZCBvblxyXG4gIGlmIChzbGlkZUlkID09PSBsYXN0RGlhbG9nQ2xvc2VkU2xpZGVJZCkge1xyXG4gICAgZGJnKGBhdXRvT3BlbjogU0tJUFBFRCDigJQgZGlhbG9nIHdhcyBhbHJlYWR5IGNsb3NlZCBmb3Igc2xpZGUgJHtzbGlkZUlkfWApO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKHNsaWRlc2hvd0RpYWxvZ09wZW5lZCAmJiBsYXVuY2hlci5pc09wZW4oKSkge1xyXG4gICAgLy8gRGlhbG9nIGFscmVhZHkgb3BlbiDigJQgc2VuZCBVUkwgdmlhIG1lc3NhZ2VDaGlsZCAobm8gY2xvc2UvcmVvcGVuISlcclxuICAgIGRiZyhgU2VuZGluZyBVUkwgdmlhIG1lc3NhZ2VDaGlsZDogJHtjb25maWcudXJsLnN1YnN0cmluZygwLCA1MCl9Li4uYCk7XHJcbiAgICBjb25zdCBzZW50ID0gbGF1bmNoZXIuc2VuZE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoeyBhY3Rpb246ICduYXZpZ2F0ZScsIHVybDogY29uZmlnLnVybCB9KSk7XHJcbiAgICBkYmcoYG1lc3NhZ2VDaGlsZCByZXN1bHQ6ICR7c2VudH1gKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIEZpcnN0IHRpbWUgb3BlbmluZyBkaWFsb2cgaW4gdGhpcyBzbGlkZXNob3cgc2Vzc2lvblxyXG4gIGNvbnN0IGhpZGVNZXRob2QgPSBnZXRTZWxlY3RlZEhpZGVNZXRob2QoKTtcclxuICB0cnkge1xyXG4gICAgZGJnKGBPcGVuaW5nIGRpYWxvZyAoZmlyc3QgdGltZSk6ICR7Y29uZmlnLnVybC5zdWJzdHJpbmcoMCwgNTApfS4uLiBoaWRlPSR7aGlkZU1ldGhvZH1gKTtcclxuICAgIGF3YWl0IGxhdW5jaGVyLm9wZW4oe1xyXG4gICAgICB1cmw6IGNvbmZpZy51cmwsXHJcbiAgICAgIHpvb206IGNvbmZpZy56b29tLFxyXG4gICAgICB3aWR0aDogY29uZmlnLmRpYWxvZ1dpZHRoLFxyXG4gICAgICBoZWlnaHQ6IGNvbmZpZy5kaWFsb2dIZWlnaHQsXHJcbiAgICAgIGxhbmc6IGkxOG4uZ2V0TG9jYWxlKCksXHJcbiAgICAgIGF1dG9DbG9zZVNlYzogY29uZmlnLmF1dG9DbG9zZVNlYyxcclxuICAgICAgc2xpZGVzaG93OiB0cnVlLCAgLy8gVmlld2VyIHdpbGwgc2hvdyBzdGFuZGJ5IGluc3RlYWQgb2YgY2xvc2luZyBvbiB0aW1lclxyXG4gICAgICBoaWRlTWV0aG9kLFxyXG4gICAgfSk7XHJcbiAgICBzbGlkZXNob3dEaWFsb2dPcGVuZWQgPSB0cnVlO1xyXG4gICAgZGJnKCdEaWFsb2cgb3BlbmVkIE9LIChmaXJzdCB0aW1lKScpO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgZGJnKGBEaWFsb2cgb3BlbiBGQUlMRUQ6ICR7ZXJyfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIFBvbGwgc2xpZGUgY2hhbmdlcyBkdXJpbmcgc2xpZGVzaG93LiAqL1xyXG5hc3luYyBmdW5jdGlvbiBwb2xsU2xpZGVJblNsaWRlc2hvdygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoIXNsaWRlc2hvd0FjdGl2ZSkgcmV0dXJuO1xyXG4gIGlmIChzbGlkZVBvbGxCdXN5KSB7XHJcbiAgICBkYmcoJ3BvbGwgU0tJUFBFRCAoYnVzeSknKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHNsaWRlUG9sbEJ1c3kgPSB0cnVlO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzbGlkZUlkID0gYXdhaXQgZ2V0U2xpZGVzaG93U2xpZGVJZCgpO1xyXG4gICAgZGJnKGBwb2xsIHRpY2s6IGdvdD0ke3NsaWRlSWR9IGxhc3Q9JHtsYXN0U2xpZGVzaG93U2xpZGVJZH1gKTtcclxuXHJcbiAgICBpZiAoIXNsaWRlSWQpIHtcclxuICAgICAgZGJnKCdwb2xsOiBzbGlkZUlkIGlzIG51bGwnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHNsaWRlSWQgPT09IGxhc3RTbGlkZXNob3dTbGlkZUlkKSByZXR1cm47XHJcblxyXG4gICAgZGJnKGBTTElERSBDSEFOR0VEOiAke2xhc3RTbGlkZXNob3dTbGlkZUlkfSDihpIgJHtzbGlkZUlkfWApO1xyXG4gICAgbGFzdFNsaWRlc2hvd1NsaWRlSWQgPSBzbGlkZUlkO1xyXG4gICAgbGFzdERpYWxvZ0Nsb3NlZFNsaWRlSWQgPSBudWxsOyAgLy8gUmVzZXQ6IGFsbG93IGRpYWxvZyBmb3IgdGhlIG5ldyBzbGlkZVxyXG5cclxuICAgIGNvbnN0IGNvbmZpZyA9IGdldFNsaWRlQ29uZmlnKHNsaWRlSWQpO1xyXG4gICAgaWYgKGNvbmZpZz8uYXV0b09wZW4gJiYgY29uZmlnLnVybCkge1xyXG4gICAgICBhd2FpdCBhdXRvT3BlblZpZXdlckZvclNsaWRlKHNsaWRlSWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gU2xpZGUgaGFzIG5vIFVSTCBvciBhdXRvT3BlbiBpcyBvZmYuXHJcbiAgICAgIC8vIERvIE5PVCBjbG9zZSB0aGUgZGlhbG9nIChpdCB3b3VsZCBleGl0IHNsaWRlc2hvdykuXHJcbiAgICAgIC8vIEluc3RlYWQsIHRlbGwgdGhlIHZpZXdlciB0byBzaG93IHN0YW5kYnkgKGJsYWNrIHNjcmVlbikuXHJcbiAgICAgIGRiZyhgTm8gVVJMIGZvciBzbGlkZSAke3NsaWRlSWR9IOKAlCBzZW5kaW5nIHN0YW5kYnlgKTtcclxuICAgICAgaWYgKHNsaWRlc2hvd0RpYWxvZ09wZW5lZCAmJiBsYXVuY2hlci5pc09wZW4oKSkge1xyXG4gICAgICAgIGxhdW5jaGVyLnNlbmRNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHsgYWN0aW9uOiAnc3RhbmRieScgfSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBkYmcoYHBvbGwgRVJST1I6ICR7ZXJyfWApO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBzbGlkZVBvbGxCdXN5ID0gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQ2FsbGVkIHdoZW4gc2xpZGVzaG93IG1vZGUgaXMgZGV0ZWN0ZWQuICovXHJcbmFzeW5jIGZ1bmN0aW9uIG9uU2xpZGVzaG93RW50ZXIoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgc2xpZGVzaG93QWN0aXZlID0gdHJ1ZTtcclxuICBsYXN0U2xpZGVzaG93U2xpZGVJZCA9IG51bGw7XHJcbiAgc2xpZGVQb2xsQnVzeSA9IGZhbHNlO1xyXG4gIGRiZygnU0xJREVTSE9XIERFVEVDVEVEJyk7XHJcblxyXG4gIC8vIEJ1aWxkIHNsaWRlIGluZGV4IG1hcCBCRUZPUkUgdHJ5aW5nIHRvIGdldCBjdXJyZW50IHNsaWRlLlxyXG4gIC8vIFRoaXMgaXMgbmVlZGVkIGZvciB0aGUgQ29tbW9uIEFQSSBmYWxsYmFjayB3aGljaCByZXR1cm5zIGluZGV4LCBub3QgSUQuXHJcbiAgYXdhaXQgYnVpbGRTbGlkZUluZGV4TWFwKCk7XHJcblxyXG4gIC8vIEltbWVkaWF0ZWx5IHRyeSB0byBvcGVuIHZpZXdlciBmb3IgdGhlIGN1cnJlbnQgc2xpZGVcclxuICBkYmcoJ0dldHRpbmcgY3VycmVudCBzbGlkZS4uLicpO1xyXG4gIGNvbnN0IHNsaWRlSWQgPSBhd2FpdCBnZXRTbGlkZXNob3dTbGlkZUlkKCk7XHJcbiAgZGJnKGBDdXJyZW50IHNsaWRlIHJlc3VsdDogJHtzbGlkZUlkfWApO1xyXG5cclxuICBpZiAoc2xpZGVJZCkge1xyXG4gICAgbGFzdFNsaWRlc2hvd1NsaWRlSWQgPSBzbGlkZUlkO1xyXG4gICAgYXdhaXQgYXV0b09wZW5WaWV3ZXJGb3JTbGlkZShzbGlkZUlkKTtcclxuICB9IGVsc2Uge1xyXG4gICAgZGJnKCdDb3VsZCBub3QgZGV0ZXJtaW5lIGN1cnJlbnQgc2xpZGUgaW4gc2xpZGVzaG93Jyk7XHJcbiAgfVxyXG5cclxuICAvLyBTdGFydCBwb2xsaW5nIGZvciBzbGlkZSBjaGFuZ2VzXHJcbiAgaWYgKHNsaWRlUG9sbFRpbWVyKSBjbGVhckludGVydmFsKHNsaWRlUG9sbFRpbWVyKTtcclxuICBzbGlkZVBvbGxUaW1lciA9IHNldEludGVydmFsKCgpID0+IHsgcG9sbFNsaWRlSW5TbGlkZXNob3coKTsgfSwgU0xJREVfUE9MTF9JTlRFUlZBTF9NUyk7XHJcbiAgZGJnKCdTbGlkZSBwb2xsaW5nIHN0YXJ0ZWQnKTtcclxufVxyXG5cclxuLyoqIENhbGxlZCB3aGVuIGVkaXQgbW9kZSBpcyByZXN0b3JlZC4gKi9cclxuZnVuY3Rpb24gb25TbGlkZXNob3dFeGl0KCk6IHZvaWQge1xyXG4gIHNsaWRlc2hvd0FjdGl2ZSA9IGZhbHNlO1xyXG4gIHNsaWRlc2hvd0RpYWxvZ09wZW5lZCA9IGZhbHNlO1xyXG4gIGRiZygnU0xJREVTSE9XIEVOREVEJyk7XHJcbiAgaWYgKHNsaWRlUG9sbFRpbWVyKSB7XHJcbiAgICBjbGVhckludGVydmFsKHNsaWRlUG9sbFRpbWVyKTtcclxuICAgIHNsaWRlUG9sbFRpbWVyID0gbnVsbDtcclxuICB9XHJcbiAgbGFzdFNsaWRlc2hvd1NsaWRlSWQgPSBudWxsO1xyXG5cclxuICAvLyBTYWZlIHRvIGNsb3NlIGRpYWxvZyBub3cg4oCUIHNsaWRlc2hvdyBhbHJlYWR5IGV4aXRlZFxyXG4gIGxhdW5jaGVyLmNsb3NlKCk7XHJcbn1cclxuXHJcbi8qKiBQZXJpb2RpY2FsbHkgY2hlY2sgdmlldyBtb2RlIHRvIGRldGVjdCBzbGlkZXNob3cgc3RhcnQvZW5kLiAqL1xyXG5sZXQgdmlld1BvbGxDb3VudCA9IDA7XHJcbmFzeW5jIGZ1bmN0aW9uIHBvbGxWaWV3TW9kZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICB2aWV3UG9sbENvdW50Kys7XHJcbiAgY29uc3QgdmlldyA9IGF3YWl0IGdldEFjdGl2ZVZpZXcoKTtcclxuICBjb25zdCBpc1NsaWRlc2hvdyA9IHZpZXcgPT09ICdyZWFkJztcclxuXHJcbiAgLy8gTG9nIGV2ZXJ5IDV0aCBwb2xsIHRvIHNob3cgcG9sbGluZyBpcyBhbGl2ZSwgcGx1cyBldmVyeSBtb2RlIGNoYW5nZVxyXG4gIGlmICh2aWV3UG9sbENvdW50ICUgNSA9PT0gMSkge1xyXG4gICAgZGJnKGBwb2xsICMke3ZpZXdQb2xsQ291bnR9OiB2aWV3PVwiJHt2aWV3fVwiIGFjdGl2ZT0ke3NsaWRlc2hvd0FjdGl2ZX1gKTtcclxuICB9XHJcblxyXG4gIGlmIChpc1NsaWRlc2hvdyAmJiAhc2xpZGVzaG93QWN0aXZlKSB7XHJcbiAgICBhd2FpdCBvblNsaWRlc2hvd0VudGVyKCk7XHJcbiAgfSBlbHNlIGlmICghaXNTbGlkZXNob3cgJiYgc2xpZGVzaG93QWN0aXZlKSB7XHJcbiAgICBvblNsaWRlc2hvd0V4aXQoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBTdGFydCBtb25pdG9yaW5nIGZvciBzbGlkZXNob3cgbW9kZS4gKi9cclxuZnVuY3Rpb24gc3RhcnRWaWV3TW9kZVBvbGxpbmcoKTogdm9pZCB7XHJcbiAgaWYgKHZpZXdQb2xsVGltZXIpIHJldHVybjtcclxuICB2aWV3UG9sbFRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4geyBwb2xsVmlld01vZGUoKTsgfSwgVklFV19QT0xMX0lOVEVSVkFMX01TKTtcclxuICBkYmcoJ1ZpZXcgbW9kZSBwb2xsaW5nIFNUQVJURUQgKGV2ZXJ5IDJzKScpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVidWc6IGhpZGUgZGlhbG9nIHRlc3QgY29udHJvbHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogUmVhZCB0aGUgc2VsZWN0ZWQgaGlkZSBtZXRob2QgZnJvbSBkZWJ1ZyBjaGVja2JveGVzLiAqL1xyXG5mdW5jdGlvbiBnZXRTZWxlY3RlZEhpZGVNZXRob2QoKTogJ25vbmUnIHwgJ21vdmUnIHwgJ3Jlc2l6ZScge1xyXG4gIGNvbnN0IGNoa01vdmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGJnLWNoay1tb3ZlJykgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcbiAgY29uc3QgY2hrUmVzaXplID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RiZy1jaGstcmVzaXplJykgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcbiAgaWYgKGNoa01vdmU/LmNoZWNrZWQpIHJldHVybiAnbW92ZSc7XHJcbiAgaWYgKGNoa1Jlc2l6ZT8uY2hlY2tlZCkgcmV0dXJuICdyZXNpemUnO1xyXG4gIHJldHVybiAnbm9uZSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmREZWJ1Z0NvbW1hbmQoYWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcclxuICBpZiAoIWxhdW5jaGVyLmlzT3BlbigpKSB7XHJcbiAgICBkYmcoYERFQlVHICR7YWN0aW9ufTogZGlhbG9nIG5vdCBvcGVuYCk7XHJcbiAgICBjb25zdCByZXN1bHRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYmctcmVzdWx0Jyk7XHJcbiAgICBpZiAocmVzdWx0RWwpIHJlc3VsdEVsLnRleHRDb250ZW50ID0gJ0RpYWxvZyBub3Qgb3BlbiDigJQgb3BlbiBhIHdlYiBwYWdlIGZpcnN0JztcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgY29uc3Qgc2VudCA9IGxhdW5jaGVyLnNlbmRNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHsgYWN0aW9uIH0pKTtcclxuICBkYmcoYERFQlVHICR7YWN0aW9ufTogc2VudD0ke3NlbnR9YCk7XHJcbiAgY29uc3QgcmVzdWx0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGJnLXJlc3VsdCcpO1xyXG4gIGlmIChyZXN1bHRFbCkgcmVzdWx0RWwudGV4dENvbnRlbnQgPSBzZW50ID8gYFNlbnQ6ICR7YWN0aW9ufS4uLmAgOiBgRmFpbGVkIHRvIHNlbmQgJHthY3Rpb259YDtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdERlYnVnSGlkZUNvbnRyb2xzKCk6IHZvaWQge1xyXG4gIGNvbnN0IGNoa01vdmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGJnLWNoay1tb3ZlJykgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcbiAgY29uc3QgY2hrUmVzaXplID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RiZy1jaGstcmVzaXplJykgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcbiAgY29uc3QgYnRuUmVzdG9yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYmctYnRuLXJlc3RvcmUnKSBhcyBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGw7XHJcblxyXG4gIGNoa01vdmU/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICAgIGlmIChjaGtNb3ZlLmNoZWNrZWQpIHtcclxuICAgICAgc2VuZERlYnVnQ29tbWFuZCgnaGlkZS1tb3ZlJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZW5kRGVidWdDb21tYW5kKCdyZXN0b3JlJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGNoa1Jlc2l6ZT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgaWYgKGNoa1Jlc2l6ZS5jaGVja2VkKSB7XHJcbiAgICAgIHNlbmREZWJ1Z0NvbW1hbmQoJ2hpZGUtcmVzaXplJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZW5kRGVidWdDb21tYW5kKCdyZXN0b3JlJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGJ0blJlc3RvcmU/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc2VuZERlYnVnQ29tbWFuZCgncmVzdG9yZScpO1xyXG4gICAgaWYgKGNoa01vdmUpIGNoa01vdmUuY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgaWYgKGNoa1Jlc2l6ZSkgY2hrUmVzaXplLmNoZWNrZWQgPSBmYWxzZTtcclxuICB9KTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEluaXQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBpbml0KCk6IHZvaWQge1xyXG4gIC8vIENhY2hlIERPTSByZWZzXHJcbiAgdXJsSW5wdXQgPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCd1cmwtaW5wdXQnKTtcclxuICBidG5BcHBseSA9ICQ8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdidG4tYXBwbHknKTtcclxuICBidG5TaG93ID0gJDxIVE1MQnV0dG9uRWxlbWVudD4oJ2J0bi1zaG93Jyk7XHJcbiAgYnRuRGVmYXVsdHMgPSAkPEhUTUxCdXR0b25FbGVtZW50PignYnRuLWRlZmF1bHRzJyk7XHJcbiAgc3RhdHVzRWwgPSAkKCdzdGF0dXMnKTtcclxuICBzbGlkZU51bWJlckVsID0gJCgnc2xpZGUtbnVtYmVyJyk7XHJcbiAgbGFuZ1NlbGVjdCA9ICQ8SFRNTFNlbGVjdEVsZW1lbnQ+KCdsYW5nLXNlbGVjdCcpO1xyXG4gIHNsaWRlcldpZHRoID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLXdpZHRoJyk7XHJcbiAgc2xpZGVySGVpZ2h0ID0gJDxIVE1MSW5wdXRFbGVtZW50Pignc2xpZGVyLWhlaWdodCcpO1xyXG4gIHNsaWRlclpvb20gPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdzbGlkZXItem9vbScpO1xyXG4gIHNsaWRlcldpZHRoVmFsdWUgPSAkKCdzbGlkZXItd2lkdGgtdmFsdWUnKTtcclxuICBzbGlkZXJIZWlnaHRWYWx1ZSA9ICQoJ3NsaWRlci1oZWlnaHQtdmFsdWUnKTtcclxuICBzbGlkZXJab29tVmFsdWUgPSAkKCdzbGlkZXItem9vbS12YWx1ZScpO1xyXG4gIHNpemVQcmV2aWV3SW5uZXIgPSAkKCdzaXplLXByZXZpZXctaW5uZXInKTtcclxuICBjaGtBdXRvT3BlbiA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ2Noay1hdXRvLW9wZW4nKTtcclxuICBjaGtMb2NrU2l6ZSA9ICQ8SFRNTElucHV0RWxlbWVudD4oJ2Noay1sb2NrLXNpemUnKTtcclxuICBzbGlkZXJBdXRvQ2xvc2UgPSAkPEhUTUxJbnB1dEVsZW1lbnQ+KCdzbGlkZXItYXV0b2Nsb3NlJyk7XHJcbiAgc2xpZGVyQXV0b0Nsb3NlVmFsdWUgPSAkKCdzbGlkZXItYXV0b2Nsb3NlLXZhbHVlJyk7XHJcbiAgcHJlc2V0QnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEJ1dHRvbkVsZW1lbnQ+KCcuYnRuLXByZXNldCcpO1xyXG4gIHZpZXdlclN0YXR1c0VsID0gJCgndmlld2VyLXN0YXR1cycpO1xyXG4gIHZpZXdlclN0YXR1c1RleHQgPSAkKCd2aWV3ZXItc3RhdHVzLXRleHQnKTtcclxuXHJcbiAgLy8gUmVzdG9yZSBzYXZlZCBsYW5ndWFnZSBvciBkZXRlY3RcclxuICBjb25zdCBzYXZlZExhbmcgPSBnZXRMYW5ndWFnZSgpO1xyXG4gIGlmIChzYXZlZExhbmcpIHtcclxuICAgIGkxOG4uc2V0TG9jYWxlKHNhdmVkTGFuZyk7XHJcbiAgfVxyXG4gIGxhbmdTZWxlY3QudmFsdWUgPSBpMThuLmdldExvY2FsZSgpO1xyXG4gIGFwcGx5STE4bigpO1xyXG5cclxuICAvLyBFdmVudCBsaXN0ZW5lcnNcclxuICBidG5BcHBseS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUFwcGx5KTtcclxuICBidG5TaG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlU2hvdyk7XHJcbiAgYnRuRGVmYXVsdHMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZXREZWZhdWx0cyk7XHJcbiAgbGFuZ1NlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVMYW5ndWFnZUNoYW5nZSk7XHJcbiAgdXJsSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZVVybEtleWRvd24pO1xyXG4gIHNsaWRlcldpZHRoLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlV2lkdGhJbnB1dCk7XHJcbiAgc2xpZGVySGVpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgaGFuZGxlSGVpZ2h0SW5wdXQpO1xyXG4gIHNsaWRlclpvb20uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBoYW5kbGVab29tSW5wdXQpO1xyXG4gIGNoa0xvY2tTaXplLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUxvY2tTaXplQ2hhbmdlKTtcclxuICBzbGlkZXJBdXRvQ2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBoYW5kbGVBdXRvQ2xvc2VJbnB1dCk7XHJcbiAgJCgnYnRuLWF1dG9vcGVuLWluZm8nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUF1dG9PcGVuSW5mb1RvZ2dsZSk7XHJcbiAgJCgnYnRuLWF1dG9jbG9zZS1pbmZvJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVBdXRvQ2xvc2VJbmZvVG9nZ2xlKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuem9vbS1wcmVzZXRzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlUHJlc2V0Q2xpY2spO1xyXG4gICQoJ2J0bi1ndWlkZS10b2dnbGUnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUd1aWRlVG9nZ2xlKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3VpZGUtdGFicycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUd1aWRlVGFiQ2xpY2spO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ndWlkZS10YWJzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVHdWlkZVRhYktleWRvd24gYXMgRXZlbnRMaXN0ZW5lcik7XHJcbiAgJCgnZ3VpZGUtc2VjdGlvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlR3VpZGVDb3B5KTtcclxuXHJcbiAgLy8gRGV0ZWN0IGN1cnJlbnQgc2xpZGUgJiBsaXN0ZW4gZm9yIGNoYW5nZXMgKG9ubHkgaW5zaWRlIFBvd2VyUG9pbnQpXHJcbiAgZGV0ZWN0Q3VycmVudFNsaWRlKCk7XHJcbiAgYnVpbGRTbGlkZUluZGV4TWFwKCk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBPZmZpY2UuY29udGV4dC5kb2N1bWVudC5hZGRIYW5kbGVyQXN5bmMoXHJcbiAgICAgIE9mZmljZS5FdmVudFR5cGUuRG9jdW1lbnRTZWxlY3Rpb25DaGFuZ2VkLFxyXG4gICAgICAoKSA9PiB7IGRldGVjdEN1cnJlbnRTbGlkZSgpOyB9LFxyXG4gICAgKTtcclxuICB9IGNhdGNoIHsgLyogb3V0c2lkZSBPZmZpY2UgaG9zdCDigJQgc2xpZGUgZGV0ZWN0aW9uIHVuYXZhaWxhYmxlICovIH1cclxuXHJcbiAgLy8gVmlld2VyIG1lc3NhZ2Ug4oaSIHVwZGF0ZSBzdGF0dXMgaW5kaWNhdG9yXHJcbiAgbGF1bmNoZXIub25NZXNzYWdlKGhhbmRsZVZpZXdlck1lc3NhZ2UpO1xyXG5cclxuICAvLyBEaWFsb2cgY2xvc2VkICh1c2VyIGNsb3NlZCB3aW5kb3cgb3IgbmF2aWdhdGlvbiBlcnJvcikg4oaSIHVwZGF0ZSBVSVxyXG4gIGxhdW5jaGVyLm9uQ2xvc2VkKGhhbmRsZVZpZXdlckNsb3NlZCk7XHJcblxyXG4gIC8vIFN0YXJ0IHBvbGxpbmcgZm9yIHNsaWRlc2hvdyBtb2RlLlxyXG4gIC8vIFRoZSBjb21tYW5kcyBydW50aW1lIChGdW5jdGlvbkZpbGUpIG1heSBub3QgcGVyc2lzdCwgc28gdGhlIHRhc2twYW5lXHJcbiAgLy8gaGFuZGxlcyBhdXRvLW9wZW4gYXMgYSByZWxpYWJsZSBmYWxsYmFjay5cclxuICBzdGFydFZpZXdNb2RlUG9sbGluZygpO1xyXG5cclxuICAvLyDilIDilIAgREVCVUc6IGhpZGUgZGlhbG9nIHRlc3QgY29udHJvbHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcbiAgaW5pdERlYnVnSGlkZUNvbnRyb2xzKCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBCb290c3RyYXAg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5pbnN0YWxsVW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlcigpO1xyXG5PZmZpY2Uub25SZWFkeSgoKSA9PiBpbml0KCkpO1xyXG4iLCIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=