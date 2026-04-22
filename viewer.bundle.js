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
/*!******************************!*\
  !*** ./src/viewer/viewer.ts ***!
  \******************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const i18n_1 = __webpack_require__(/*! ../shared/i18n */ "./src/shared/i18n.ts");
const constants_1 = __webpack_require__(/*! ../shared/constants */ "./src/shared/constants.ts");
const logger_1 = __webpack_require__(/*! ../shared/logger */ "./src/shared/logger.ts");
// ─── Code snippets for the own-site guide ────────────────────────────────────
const CODE_SNIPPETS = {
    nginx: 'add_header Content-Security-Policy "frame-ancestors *";',
    apache: 'Header set Content-Security-Policy "frame-ancestors *"\nHeader unset X-Frame-Options',
    express: `app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.removeHeader('X-Frame-Options');
  next();
});`,
};
/**
 * Send a structured message to the Task Pane host via Office.js.
 * Silent no-op when running outside an Office context (standalone browser).
 */
function sendToParent(msg) {
    try {
        Office.context.ui.messageParent(JSON.stringify(msg));
    }
    catch {
        // Not in an Office dialog context — ignore (standalone browser test)
    }
}
function parseParams() {
    const p = new URLSearchParams(window.location.search);
    const url = p.get('url') ?? '';
    const rawZoom = parseInt(p.get('zoom') ?? String(constants_1.DEFAULT_ZOOM), 10);
    const zoom = isNaN(rawZoom)
        ? constants_1.DEFAULT_ZOOM
        : Math.min(constants_1.ZOOM_MAX, Math.max(constants_1.ZOOM_MIN, rawZoom));
    const lang = p.get('lang') ??
        (typeof navigator !== 'undefined' ? navigator.language : 'en');
    const rawAutoClose = parseInt(p.get('autoclose') ?? '0', 10);
    const autoCloseSec = isNaN(rawAutoClose)
        ? 0
        : Math.min(constants_1.AUTO_CLOSE_MAX_SEC, Math.max(0, rawAutoClose));
    const slideshow = p.get('slideshow') === '1';
    const rawHide = p.get('hide') ?? 'none';
    const hideMethod = (rawHide === 'move' || rawHide === 'resize') ? rawHide : 'none';
    return { url, zoom, lang, autoCloseSec, slideshow, hideMethod };
}
// ─── i18n ─────────────────────────────────────────────────────────────────────
/** Replace textContent of every [data-i18n] element with the translated string. */
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        el.textContent = i18n_1.i18n.t(key);
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
function applyZoom(iframe, zoom) {
    if (zoom === constants_1.DEFAULT_ZOOM)
        return; // CSS defaults already cover 100%
    const factor = zoom / 100;
    iframe.style.width = `${100 / factor}vw`;
    iframe.style.height = `${100 / factor}vh`;
    iframe.style.transform = `scale(${factor})`;
    iframe.style.transformOrigin = 'top left';
}
// ─── UI state ─────────────────────────────────────────────────────────────────
function showNoUrlUI() {
    const wrapper = document.getElementById('iframe-wrapper');
    const msg = document.getElementById('no-url-message');
    if (wrapper)
        wrapper.hidden = true;
    if (msg)
        msg.hidden = false;
}
/** Show an offline message. Called when navigator.onLine is false. */
function showOfflineUI() {
    const wrapper = document.getElementById('iframe-wrapper');
    const overlay = document.getElementById('blocked-overlay');
    if (wrapper)
        wrapper.hidden = true;
    if (overlay) {
        overlay.hidden = false;
        const heading = overlay.querySelector('[data-i18n="iframeBlocked"]');
        if (heading)
            heading.textContent = i18n_1.i18n.t('noInternet');
        const hint = overlay.querySelector('[data-i18n="iframeBlockedHint"]');
        if (hint)
            hint.textContent = '';
    }
}
// ─── Toolbar ──────────────────────────────────────────────────────────────────
function initToolbar(url) {
    const urlLabel = document.getElementById('toolbar-url');
    if (urlLabel) {
        urlLabel.textContent = (0, constants_1.truncateUrl)(url);
        urlLabel.title = url; // full URL in tooltip
    }
    // Close — message host; fallback to window.close() for standalone
    document.getElementById('btn-close')?.addEventListener('click', () => {
        sendToParent({ type: 'close' });
        try {
            window.close();
        }
        catch { /* ignore */ }
    });
    // Open current URL in a new browser tab
    document.getElementById('btn-open-browser')?.addEventListener('click', () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    });
    // "Show setup guide" button is handled by initGuide() when the blocked overlay is shown.
    // ── Hover reveal ───────────────────────────────────────────────────────────
    // Show toolbar when mouse enters top 40 px; hide after a short delay on leave.
    const toolbar = document.getElementById('toolbar');
    let hideTimer = null;
    const show = () => {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        toolbar.classList.add('visible');
    };
    const scheduleHide = () => {
        hideTimer = setTimeout(() => toolbar.classList.remove('visible'), 400);
    };
    document.addEventListener('mousemove', (e) => {
        if (e.clientY < 40) {
            show();
        }
        else if (!toolbar.matches(':hover')) {
            scheduleHide();
        }
    });
    toolbar.addEventListener('mouseenter', show);
    toolbar.addEventListener('mouseleave', scheduleHide);
    // Keyboard: reveal toolbar when focus enters it
    toolbar.addEventListener('focusin', show);
    toolbar.addEventListener('focusout', scheduleHide);
}
// ─── Image mode ──────────────────────────────────────────────────────────────
const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg)$/i;
/** Check if a URL points to an image file by its pathname extension. */
function isImageUrl(url) {
    try {
        return IMAGE_EXTENSIONS.test(new URL(url).pathname);
    }
    catch {
        return false;
    }
}
/** Add a cache-busting parameter to force fresh image loads. */
function cacheBust(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_t=${Date.now()}`;
}
/** Apply zoom to the image element using CSS transform. */
function applyImageZoom(img, zoom) {
    if (zoom === constants_1.DEFAULT_ZOOM)
        return;
    const factor = zoom / 100;
    img.style.transform = `scale(${factor})`;
    img.style.transformOrigin = 'center center';
}
/** Initialize image mode: display a static image instead of an iframe. */
function initImageMode(url, zoom, autoCloseSec) {
    const iframeWrapper = document.getElementById('iframe-wrapper');
    const imageWrapper = document.getElementById('image-wrapper');
    const img = document.getElementById('image-frame');
    if (iframeWrapper)
        iframeWrapper.hidden = true;
    if (imageWrapper)
        imageWrapper.hidden = false;
    applyImageZoom(img, zoom);
    img.addEventListener('load', () => {
        (0, logger_1.logDebug)('Image loaded:', url);
        sendToParent({ type: 'loaded', url });
        // Return focus to PowerPoint so the clicker/remote works.
        // The image stays visible in the dialog window.
        // Small delay ensures the dialog has finished rendering.
        setTimeout(() => {
            try {
                window.blur();
            }
            catch { /* ignore */ }
        }, 300);
        if (autoCloseSec > 0)
            startCountdown(autoCloseSec);
    });
    img.addEventListener('error', () => {
        (0, logger_1.logError)('Image failed to load:', url);
        sendToParent({ type: 'error', url, error: 'Image failed to load' });
    });
    img.src = cacheBust(url);
}
// ─── Auto-close countdown ────────────────────────────────────────────────────
/** Show a countdown badge and auto-close (or standby in slideshow mode). */
function startCountdown(seconds) {
    const el = document.getElementById('countdown');
    if (!el)
        return;
    let remaining = seconds;
    el.textContent = i18n_1.i18n.t('countdownText').replace('{n}', String(remaining));
    el.hidden = false;
    const timer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(timer);
            el.hidden = true;
            if (slideshowMode) {
                // TEST: close dialog via host-side launcher.close() instead of standby.
                // This tests whether dialog.close() exits slideshow or not.
                (0, logger_1.logDebug)('Auto-close timer expired in slideshow — sending close to host');
                sendToParent({ type: 'close' });
            }
            else {
                sendToParent({ type: 'close' });
                try {
                    window.close();
                }
                catch { /* ignore */ }
            }
        }
        else {
            el.textContent = i18n_1.i18n.t('countdownText').replace('{n}', String(remaining));
        }
    }, 1000);
}
// ─── Slideshow live-update via localStorage ─────────────────────────────────
//
// During slideshow, the taskpane can't close/reopen the dialog (it exits
// slideshow). Instead, the taskpane writes the target URL to localStorage
// and the viewer navigates to it. This allows seamless slide transitions.
//
// Key: 'webppt_slideshow_url'
// Value: URL string (empty = show standby/blank)
/** Current zoom (set during init, reused on navigation). */
let currentZoom = constants_1.DEFAULT_ZOOM;
/** Whether the viewer is running in slideshow mode (don't close on timer). */
let slideshowMode = false;
/** How to hide the dialog window after timer expires in slideshow mode. */
let hideMethodSetting = 'none';
/** Navigate the viewer to a new URL (called from storage listener). */
function navigateToUrl(newUrl) {
    const iframeWrapper = document.getElementById('iframe-wrapper');
    const imageWrapper = document.getElementById('image-wrapper');
    const standby = document.getElementById('standby-overlay');
    const blockedOverlay = document.getElementById('blocked-overlay');
    const noUrlMsg = document.getElementById('no-url-message');
    if (!newUrl) {
        // Show standby state (black/blank screen)
        if (iframeWrapper)
            iframeWrapper.hidden = true;
        if (imageWrapper)
            imageWrapper.hidden = true;
        if (blockedOverlay)
            blockedOverlay.hidden = true;
        if (noUrlMsg)
            noUrlMsg.hidden = true;
        if (standby)
            standby.hidden = false;
        (0, logger_1.logDebug)('Viewer: standby (no URL)');
        return;
    }
    // Hide standby, show content
    if (standby)
        standby.hidden = true;
    if (blockedOverlay)
        blockedOverlay.hidden = true;
    if (noUrlMsg)
        noUrlMsg.hidden = true;
    // Restore window if it was hidden (moveTo/resizeTo)
    if (savedWindowState) {
        (0, logger_1.logDebug)('Restoring window before navigating to new URL');
        handleRestore();
    }
    if (isImageUrl(newUrl)) {
        if (iframeWrapper)
            iframeWrapper.hidden = true;
        if (imageWrapper)
            imageWrapper.hidden = false;
        const img = document.getElementById('image-frame');
        applyImageZoom(img, currentZoom);
        img.src = cacheBust(newUrl);
        (0, logger_1.logDebug)('Viewer: navigated to image:', newUrl);
    }
    else {
        if (imageWrapper)
            imageWrapper.hidden = true;
        if (iframeWrapper)
            iframeWrapper.hidden = false;
        const iframe = document.getElementById('web-frame');
        applyZoom(iframe, currentZoom);
        iframe.src = newUrl;
        (0, logger_1.logDebug)('Viewer: navigated to:', newUrl);
    }
    // Update toolbar URL
    const urlLabel = document.getElementById('toolbar-url');
    if (urlLabel) {
        urlLabel.textContent = (0, constants_1.truncateUrl)(newUrl);
        urlLabel.title = newUrl;
    }
    sendToParent({ type: 'ready', url: newUrl });
}
/** Saved window position/size before hiding, for restore. */
let savedWindowState = null;
function handleHideMove() {
    const bx = window.screenX, by = window.screenY;
    savedWindowState = { x: bx, y: by, w: window.outerWidth, h: window.outerHeight };
    try {
        window.moveTo(-32000, -32000);
    }
    catch { /* */ }
    const ax = window.screenX, ay = window.screenY;
    const moved = bx !== ax || by !== ay;
    const result = `moveTo: (${bx},${by})→(${ax},${ay}) moved=${moved}`;
    (0, logger_1.logDebug)(result);
    return result;
}
function handleHideResize() {
    const bw = window.outerWidth, bh = window.outerHeight;
    savedWindowState = { x: window.screenX, y: window.screenY, w: bw, h: bh };
    try {
        window.resizeTo(1, 1);
    }
    catch { /* */ }
    const aw = window.outerWidth, ah = window.outerHeight;
    const resized = bw !== aw || bh !== ah;
    const result = `resizeTo: (${bw}x${bh})→(${aw}x${ah}) resized=${resized}`;
    (0, logger_1.logDebug)(result);
    return result;
}
function handleRestore() {
    if (!savedWindowState)
        return 'restore: no saved state';
    try {
        window.moveTo(savedWindowState.x, savedWindowState.y);
        window.resizeTo(savedWindowState.w, savedWindowState.h);
    }
    catch { /* */ }
    const result = `restored to (${savedWindowState.x},${savedWindowState.y}) ${savedWindowState.w}x${savedWindowState.h}`;
    savedWindowState = null;
    (0, logger_1.logDebug)(result);
    return result;
}
function initParentMessageListener() {
    try {
        Office.context.ui.addHandlerAsync(Office.EventType.DialogParentMessageReceived, (arg) => {
            if (!arg.message)
                return;
            try {
                const msg = JSON.parse(arg.message);
                (0, logger_1.logDebug)('Viewer: parent message:', msg.action, msg.url ?? '');
                switch (msg.action) {
                    case 'navigate':
                        if (msg.url)
                            navigateToUrl(msg.url);
                        break;
                    case 'standby':
                        navigateToUrl('');
                        break;
                    case 'hide-move': {
                        const r1 = handleHideMove();
                        sendToParent({ type: 'loaded', url: r1 });
                        break;
                    }
                    case 'hide-resize': {
                        const r2 = handleHideResize();
                        sendToParent({ type: 'loaded', url: r2 });
                        break;
                    }
                    case 'restore': {
                        const r3 = handleRestore();
                        sendToParent({ type: 'loaded', url: r3 });
                        break;
                    }
                }
            }
            catch (err) {
                (0, logger_1.logDebug)('Viewer: failed to parse parent message:', String(err));
            }
        }, (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                (0, logger_1.logDebug)('Viewer: parent message handler registered');
            }
            else {
                (0, logger_1.logDebug)('Viewer: failed to register parent message handler:', JSON.stringify(result.error));
            }
        });
    }
    catch (err) {
        (0, logger_1.logDebug)('Viewer: DialogParentMessageReceived not supported:', String(err));
    }
}
// ─── Iframe postMessage listener ─────────────────────────────────────────────
/**
 * Listen for postMessage from the website loaded in the iframe.
 * This allows the website to control the dialog (e.g. close it).
 *
 * Supported messages from the iframe:
 *   { action: 'close-dialog' }  — close the viewer dialog
 */
function initIframeMessageListener() {
    window.addEventListener('message', (event) => {
        // Only process object messages with an action field
        if (!event.data || typeof event.data !== 'object' || !event.data.action)
            return;
        (0, logger_1.logDebug)(`Viewer: iframe postMessage: action=${event.data.action} origin=${event.origin}`);
        switch (event.data.action) {
            case 'close-dialog':
                (0, logger_1.logDebug)('Viewer: close-dialog received from iframe — closing');
                sendToParent({ type: 'close' });
                break;
        }
    });
    (0, logger_1.logDebug)('Viewer: iframe postMessage listener registered');
}
// ─── Main ─────────────────────────────────────────────────────────────────────
function init() {
    const { url, zoom, lang, autoCloseSec, slideshow, hideMethod } = parseParams();
    currentZoom = zoom;
    slideshowMode = slideshow;
    hideMethodSetting = hideMethod;
    i18n_1.i18n.setLocale((0, i18n_1.parseLocale)(lang));
    applyI18n();
    // Listen for URL updates from taskpane via Office.js messageChild (DialogApi 1.2)
    initParentMessageListener();
    // Listen for postMessage from the website in the iframe (e.g. close-dialog)
    initIframeMessageListener();
    if (!url) {
        showNoUrlUI();
        return;
    }
    // Check network before loading
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        (0, logger_1.logDebug)('Browser is offline, showing offline UI');
        showOfflineUI();
        // Re-check when connection is restored
        window.addEventListener('online', () => {
            (0, logger_1.logDebug)('Connection restored, reloading');
            window.location.reload();
        }, { once: true });
        sendToParent({ type: 'error', url, error: 'No internet connection' });
        return;
    }
    initToolbar(url);
    // Image mode: auto-detected by URL extension
    if (isImageUrl(url)) {
        (0, logger_1.logDebug)('Image URL detected, using image mode');
        initImageMode(url, zoom, autoCloseSec);
    }
    else {
        // Iframe mode (default) — load directly without blocking detection
        const iframe = document.getElementById('web-frame');
        applyZoom(iframe, zoom);
        iframe.src = url;
        sendToParent({ type: 'loaded', url });
        if (autoCloseSec > 0)
            startCountdown(autoCloseSec);
    }
    // Listen for going offline after initial load
    window.addEventListener('offline', () => {
        (0, logger_1.logDebug)('Connection lost');
        showOfflineUI();
        sendToParent({ type: 'error', url, error: 'Connection lost' });
    });
    // Escape key closes the viewer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            sendToParent({ type: 'close' });
            try {
                window.close();
            }
            catch { /* ignore */ }
        }
    });
    sendToParent({ type: 'ready', url });
}
// ─── Bootstrap ───────────────────────────────────────────────────────────────
/**
 * - Office context: defer until Office.onReady() to guarantee Office.js APIs.
 * - Standalone (no Office.js CDN, dev browser): run on DOMContentLoaded.
 */
function start() {
    (0, logger_1.installUnhandledRejectionHandler)();
    if (typeof Office !== 'undefined' && typeof Office.onReady === 'function') {
        Office.onReady(() => init());
    }
    else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
}
start();

})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!*******************************!*\
  !*** ./src/viewer/viewer.css ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QztBQUVELGdGQUFnRjtBQUVoRjs7O0dBR0c7QUFDSCxTQUFTLEtBQUs7SUFDWiw2Q0FBZ0MsR0FBRSxDQUFDO0lBRW5DLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE9BQU8sTUFBTSxDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUMxRSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDL0IsQ0FBQztTQUFNLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUM3QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztTQUFNLENBQUM7UUFDTixJQUFJLEVBQUUsQ0FBQztJQUNULENBQUM7QUFDSCxDQUFDO0FBRUQsS0FBSyxFQUFFLENBQUM7Ozs7Ozs7Ozs7QUNsakJSIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvY29uc3RhbnRzLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL2kxOG4udHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvbG9nZ2VyLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvdmlld2VyL3ZpZXdlci50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3ZpZXdlci92aWV3ZXIuY3NzPzdmOGYiXSwic291cmNlc0NvbnRlbnQiOlsiLy8g4pSA4pSA4pSAIFNldHRpbmcga2V5cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBQcmVmaXggZm9yIHBlci1zbGlkZSBzZXR0aW5nIGtleXMuIEZ1bGwga2V5OiBgd2VicHB0X3NsaWRlX3tzbGlkZUlkfWAuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9TTElERV9QUkVGSVggPSAnd2VicHB0X3NsaWRlXyc7XHJcblxyXG4vKiogS2V5IGZvciB0aGUgc2F2ZWQgVUkgbGFuZ3VhZ2UuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9MQU5HVUFHRSA9ICd3ZWJwcHRfbGFuZ3VhZ2UnO1xyXG5cclxuLyoqIEtleSBmb3IgZ2xvYmFsIGRlZmF1bHQgc2xpZGUgY29uZmlnLiAqL1xyXG5leHBvcnQgY29uc3QgU0VUVElOR19LRVlfREVGQVVMVFMgPSAnd2VicHB0X2RlZmF1bHRzJztcclxuXHJcbi8vIOKUgOKUgOKUgCBWaWV3ZXIgZGVmYXVsdHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9aT09NID0gMTAwO1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9ESUFMT0dfV0lEVEggPSAxMDA7ICAgLy8gJSBvZiBzY3JlZW5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRElBTE9HX0hFSUdIVCA9IDEwMDsgIC8vICUgb2Ygc2NyZWVuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FVVE9fT1BFTiA9IHRydWU7XHJcblxyXG4vLyDilIDilIDilIAgQ29uc3RyYWludCByYW5nZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgWk9PTV9NSU4gPSA1MDtcclxuZXhwb3J0IGNvbnN0IFpPT01fTUFYID0gMzAwO1xyXG5cclxuLy8g4pSA4pSA4pSAIEF1dG8tb3BlbiBkZWxheSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FVVE9fT1BFTl9ERUxBWV9TRUMgPSAwOyAgIC8vIDAgPSBpbW1lZGlhdGVcclxuXHJcbi8qKlxyXG4gKiBOb24tbGluZWFyIGxvb2t1cCB0YWJsZSBmb3IgdGhlIGF1dG8tb3BlbiBkZWxheSBzbGlkZXIuXHJcbiAqIEluZGV4ID0gc2xpZGVyIHBvc2l0aW9uLCB2YWx1ZSA9IHNlY29uZHMuXHJcbiAqIFJhbmdlOiAw4oCTNjBzLiBHcmFudWxhcml0eTogMXMgdXAgdG8gMTBzLCB0aGVuIDVzIHVwIHRvIDMwcywgdGhlbiAxMHMgdXAgdG8gNjBzLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEFVVE9fT1BFTl9ERUxBWV9TVEVQUzogcmVhZG9ubHkgbnVtYmVyW10gPSBbXHJcbiAgLy8gMOKAkzEwcywgc3RlcCAxICAoMTEgdmFsdWVzOiBpbmRpY2VzIDDigJMxMClcclxuICAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCxcclxuICAvLyAxMOKAkzYwcywgc3RlcCA1ICAoMTAgdmFsdWVzOiBpbmRpY2VzIDEx4oCTMjApXHJcbiAgMTUsIDIwLCAyNSwgMzAsIDM1LCA0MCwgNDUsIDUwLCA1NSwgNjAsXHJcbiAgLy8gMeKAkzMgbWluLCBzdGVwIDE1cyAgKDggdmFsdWVzOiBpbmRpY2VzIDIx4oCTMjgpXHJcbiAgNzUsIDkwLCAxMDUsIDEyMCwgMTM1LCAxNTAsIDE2NSwgMTgwLFxyXG4gIC8vIDPigJM1IG1pbiwgc3RlcCAzMHMgICg0IHZhbHVlczogaW5kaWNlcyAyOeKAkzMyKVxyXG4gIDIxMCwgMjQwLCAyNzAsIDMwMCxcclxuXTtcclxuXHJcbi8vIOKUgOKUgOKUgCBBdXRvLWNsb3NlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19DTE9TRV9TRUMgPSAwOyAgIC8vIDAgPSBkaXNhYmxlZFxyXG5leHBvcnQgY29uc3QgQVVUT19DTE9TRV9NQVhfU0VDID0gMzYwMDtcclxuXHJcbi8qKlxyXG4gKiBOb24tbGluZWFyIGxvb2t1cCB0YWJsZSBmb3IgdGhlIGF1dG8tY2xvc2Ugc2xpZGVyLlxyXG4gKiBJbmRleCA9IHNsaWRlciBwb3NpdGlvbiwgdmFsdWUgPSBzZWNvbmRzLlxyXG4gKiBHcmFudWxhcml0eSBkZWNyZWFzZXMgYXMgdmFsdWVzIGdyb3c6IDFzIOKGkiA1cyDihpIgMTVzIOKGkiAzMHMg4oaSIDYwcyDihpIgMzAwcy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBBVVRPX0NMT1NFX1NURVBTOiByZWFkb25seSBudW1iZXJbXSA9IFtcclxuICAvLyAw4oCTMTBzLCBzdGVwIDEgICgxMSB2YWx1ZXMpXHJcbiAgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsXHJcbiAgLy8gMTDigJM2MHMsIHN0ZXAgNSAgKDEwIHZhbHVlcylcclxuICAxNSwgMjAsIDI1LCAzMCwgMzUsIDQwLCA0NSwgNTAsIDU1LCA2MCxcclxuICAvLyAx4oCTMyBtaW4sIHN0ZXAgMTVzICAoOCB2YWx1ZXMpXHJcbiAgNzUsIDkwLCAxMDUsIDEyMCwgMTM1LCAxNTAsIDE2NSwgMTgwLFxyXG4gIC8vIDPigJM1IG1pbiwgc3RlcCAzMHMgICg0IHZhbHVlcylcclxuICAyMTAsIDI0MCwgMjcwLCAzMDAsXHJcbiAgLy8gNeKAkzEwIG1pbiwgc3RlcCA2MHMgICg1IHZhbHVlcylcclxuICAzNjAsIDQyMCwgNDgwLCA1NDAsIDYwMCxcclxuICAvLyAxMOKAkzYwIG1pbiwgc3RlcCAzMDBzICAoMTAgdmFsdWVzKVxyXG4gIDkwMCwgMTIwMCwgMTUwMCwgMTgwMCwgMjEwMCwgMjQwMCwgMjcwMCwgMzAwMCwgMzMwMCwgMzYwMCxcclxuXTtcclxuXHJcbi8vIOKUgOKUgOKUgCBFcnJvciBoYW5kbGluZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HU19TQVZFX01BWF9SRVRSSUVTID0gMjtcclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NBVkVfUkVUUllfREVMQVlfTVMgPSAxMDAwO1xyXG5leHBvcnQgY29uc3QgSUZSQU1FX0xPQURfVElNRU9VVF9NUyA9IDEwXzAwMDtcclxuZXhwb3J0IGNvbnN0IFVSTF9ESVNQTEFZX01BWF9MRU5HVEggPSA2MDtcclxuXHJcbi8qKiBUcnVuY2F0ZSBhIFVSTCBmb3IgZGlzcGxheSwgYXBwZW5kaW5nIGVsbGlwc2lzIGlmIG5lZWRlZC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRydW5jYXRlVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBpZiAodXJsLmxlbmd0aCA8PSBVUkxfRElTUExBWV9NQVhfTEVOR1RIKSByZXR1cm4gdXJsO1xyXG4gIHJldHVybiB1cmwuc3Vic3RyaW5nKDAsIFVSTF9ESVNQTEFZX01BWF9MRU5HVEggLSAxKSArICdcXHUyMDI2JztcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlYnVnIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqXHJcbiAqIFNldCB0byBgZmFsc2VgIGluIHByb2R1Y3Rpb24gYnVpbGRzIHZpYSB3ZWJwYWNrIERlZmluZVBsdWdpbi5cclxuICogRmFsbHMgYmFjayB0byBgdHJ1ZWAgc28gZGV2L3Rlc3QgcnVucyBhbHdheXMgbG9nLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFQlVHOiBib29sZWFuID1cclxuICB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MuZW52ICE9PSAndW5kZWZpbmVkJ1xyXG4gICAgPyBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXHJcbiAgICA6IHRydWU7XHJcbiIsImltcG9ydCBsb2NhbGVzRGF0YSBmcm9tICcuLi9pMThuL2xvY2FsZXMuanNvbic7XHJcblxyXG5leHBvcnQgdHlwZSBMb2NhbGUgPSAnZW4nIHwgJ3poJyB8ICdlcycgfCAnZGUnIHwgJ2ZyJyB8ICdpdCcgfCAnYXInIHwgJ3B0JyB8ICdoaScgfCAncnUnO1xyXG5leHBvcnQgdHlwZSBUcmFuc2xhdGlvbktleSA9IGtleW9mIHR5cGVvZiBsb2NhbGVzRGF0YVsnZW4nXTtcclxuXHJcbi8qKiBNYXBzIGEgQkNQIDQ3IGxhbmd1YWdlIHRhZyB0byBhIHN1cHBvcnRlZCBMb2NhbGUuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsZShsYW5nVGFnOiBzdHJpbmcpOiBMb2NhbGUge1xyXG4gIGNvbnN0IHRhZyA9IGxhbmdUYWcudG9Mb3dlckNhc2UoKTtcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3poJykpIHJldHVybiAnemgnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnZXMnKSkgcmV0dXJuICdlcyc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdkZScpKSByZXR1cm4gJ2RlJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2ZyJykpIHJldHVybiAnZnInO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnaXQnKSkgcmV0dXJuICdpdCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdhcicpKSByZXR1cm4gJ2FyJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3B0JykpIHJldHVybiAncHQnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnaGknKSkgcmV0dXJuICdoaSc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdydScpKSByZXR1cm4gJ3J1JztcclxuICByZXR1cm4gJ2VuJztcclxufVxyXG5cclxuY2xhc3MgSTE4biB7XHJcbiAgcHJpdmF0ZSBsb2NhbGU6IExvY2FsZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGxpc3RlbmVycyA9IG5ldyBTZXQ8KCkgPT4gdm9pZD4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmxvY2FsZSA9IHRoaXMuZGV0ZWN0TG9jYWxlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRldGVjdExvY2FsZSgpOiBMb2NhbGUge1xyXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gJ2VuJztcclxuICAgIHJldHVybiBwYXJzZUxvY2FsZShuYXZpZ2F0b3IubGFuZ3VhZ2UgPz8gJ2VuJyk7XHJcbiAgfVxyXG5cclxuICAvKiogVHJhbnNsYXRlIGEga2V5IGluIHRoZSBjdXJyZW50IGxvY2FsZS4gRmFsbHMgYmFjayB0byBFbmdsaXNoLCB0aGVuIHRoZSBrZXkgaXRzZWxmLiAqL1xyXG4gIHQoa2V5OiBUcmFuc2xhdGlvbktleSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBsb2NhbGVzRGF0YVt0aGlzLmxvY2FsZV1ba2V5XSA/P1xyXG4gICAgICBsb2NhbGVzRGF0YVsnZW4nXVtrZXldID8/XHJcbiAgICAgIGtleVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGdldExvY2FsZSgpOiBMb2NhbGUge1xyXG4gICAgcmV0dXJuIHRoaXMubG9jYWxlO1xyXG4gIH1cclxuXHJcbiAgZ2V0QXZhaWxhYmxlTG9jYWxlcygpOiBMb2NhbGVbXSB7XHJcbiAgICByZXR1cm4gWydlbicsICd6aCcsICdlcycsICdkZScsICdmcicsICdpdCcsICdhcicsICdwdCcsICdoaScsICdydSddO1xyXG4gIH1cclxuXHJcbiAgLyoqIFN3aXRjaCBsb2NhbGUgYW5kIG5vdGlmeSBhbGwgbGlzdGVuZXJzLiAqL1xyXG4gIHNldExvY2FsZShsb2NhbGU6IExvY2FsZSk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMubG9jYWxlID09PSBsb2NhbGUpIHJldHVybjtcclxuICAgIHRoaXMubG9jYWxlID0gbG9jYWxlO1xyXG4gICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3Vic2NyaWJlIHRvIGxvY2FsZSBjaGFuZ2VzLlxyXG4gICAqIEByZXR1cm5zIFVuc3Vic2NyaWJlIGZ1bmN0aW9uLlxyXG4gICAqL1xyXG4gIG9uTG9jYWxlQ2hhbmdlKGxpc3RlbmVyOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XHJcbiAgICB0aGlzLmxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xyXG4gICAgcmV0dXJuICgpID0+IHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogU2luZ2xldG9uIGkxOG4gaW5zdGFuY2Ugc2hhcmVkIGFjcm9zcyB0aGUgYWRkLWluLiAqL1xyXG5leHBvcnQgY29uc3QgaTE4biA9IG5ldyBJMThuKCk7XHJcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuY29uc3QgUFJFRklYID0gJ1tXZWJQUFRdJztcclxuXHJcbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cclxuXHJcbi8qKiBMb2cgZGVidWcgaW5mbyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dEZWJ1ZyguLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcclxuICBpZiAoREVCVUcpIGNvbnNvbGUubG9nKFBSRUZJWCwgLi4uYXJncyk7XHJcbn1cclxuXHJcbi8qKiBMb2cgd2FybmluZ3Mg4oCUIG5vLW9wIGluIHByb2R1Y3Rpb24gYnVpbGRzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9nV2FybiguLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcclxuICBpZiAoREVCVUcpIGNvbnNvbGUud2FybihQUkVGSVgsIC4uLmFyZ3MpO1xyXG59XHJcblxyXG4vKiogTG9nIGVycm9ycyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dFcnJvciguLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcclxuICBpZiAoREVCVUcpIGNvbnNvbGUuZXJyb3IoUFJFRklYLCAuLi5hcmdzKTtcclxufVxyXG5cclxuLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXHJcblxyXG4vKipcclxuICogSW5zdGFsbCBhIGdsb2JhbCBoYW5kbGVyIGZvciB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb25zLlxyXG4gKiBDYWxsIG9uY2UgcGVyIGVudHJ5IHBvaW50ICh0YXNrcGFuZSwgdmlld2VyLCBjb21tYW5kcykuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIoKTogdm9pZCB7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChldmVudDogUHJvbWlzZVJlamVjdGlvbkV2ZW50KSA9PiB7XHJcbiAgICBsb2dFcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uOicsIGV2ZW50LnJlYXNvbik7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGkxOG4sIHBhcnNlTG9jYWxlLCB0eXBlIFRyYW5zbGF0aW9uS2V5IH0gZnJvbSAnLi4vc2hhcmVkL2kxOG4nO1xyXG5pbXBvcnQgeyBaT09NX01JTiwgWk9PTV9NQVgsIERFRkFVTFRfWk9PTSwgQVVUT19DTE9TRV9NQVhfU0VDLCB0cnVuY2F0ZVVybCB9IGZyb20gJy4uL3NoYXJlZC9jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBsb2dEZWJ1ZywgbG9nRXJyb3IsIGluc3RhbGxVbmhhbmRsZWRSZWplY3Rpb25IYW5kbGVyIH0gZnJvbSAnLi4vc2hhcmVkL2xvZ2dlcic7XHJcblxyXG4vLyDilIDilIDilIAgQ29kZSBzbmlwcGV0cyBmb3IgdGhlIG93bi1zaXRlIGd1aWRlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuY29uc3QgQ09ERV9TTklQUEVUUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICBuZ2lueDogJ2FkZF9oZWFkZXIgQ29udGVudC1TZWN1cml0eS1Qb2xpY3kgXCJmcmFtZS1hbmNlc3RvcnMgKlwiOycsXHJcbiAgYXBhY2hlOlxyXG4gICAgJ0hlYWRlciBzZXQgQ29udGVudC1TZWN1cml0eS1Qb2xpY3kgXCJmcmFtZS1hbmNlc3RvcnMgKlwiXFxuSGVhZGVyIHVuc2V0IFgtRnJhbWUtT3B0aW9ucycsXHJcbiAgZXhwcmVzczogYGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgcmVzLnNldEhlYWRlcignQ29udGVudC1TZWN1cml0eS1Qb2xpY3knLCAnZnJhbWUtYW5jZXN0b3JzIConKTtcclxuICByZXMucmVtb3ZlSGVhZGVyKCdYLUZyYW1lLU9wdGlvbnMnKTtcclxuICBuZXh0KCk7XHJcbn0pO2AsXHJcbn07XHJcblxyXG4vLyDilIDilIDilIAgTWVzc2FnZSBwcm90b2NvbCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbnR5cGUgVmlld2VyTWVzc2FnZVR5cGUgPSAncmVhZHknIHwgJ2xvYWRlZCcgfCAnYmxvY2tlZCcgfCAnZXJyb3InIHwgJ2Nsb3NlJztcclxuXHJcbmludGVyZmFjZSBWaWV3ZXJNZXNzYWdlIHtcclxuICB0eXBlOiBWaWV3ZXJNZXNzYWdlVHlwZTtcclxuICB1cmw/OiBzdHJpbmc7XHJcbiAgZXJyb3I/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZW5kIGEgc3RydWN0dXJlZCBtZXNzYWdlIHRvIHRoZSBUYXNrIFBhbmUgaG9zdCB2aWEgT2ZmaWNlLmpzLlxyXG4gKiBTaWxlbnQgbm8tb3Agd2hlbiBydW5uaW5nIG91dHNpZGUgYW4gT2ZmaWNlIGNvbnRleHQgKHN0YW5kYWxvbmUgYnJvd3NlcikuXHJcbiAqL1xyXG5mdW5jdGlvbiBzZW5kVG9QYXJlbnQobXNnOiBWaWV3ZXJNZXNzYWdlKTogdm9pZCB7XHJcbiAgdHJ5IHtcclxuICAgIE9mZmljZS5jb250ZXh0LnVpLm1lc3NhZ2VQYXJlbnQoSlNPTi5zdHJpbmdpZnkobXNnKSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvLyBOb3QgaW4gYW4gT2ZmaWNlIGRpYWxvZyBjb250ZXh0IOKAlCBpZ25vcmUgKHN0YW5kYWxvbmUgYnJvd3NlciB0ZXN0KVxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFF1ZXJ5IHBhcmFtZXRlciBwYXJzaW5nIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxudHlwZSBIaWRlTWV0aG9kID0gJ25vbmUnIHwgJ21vdmUnIHwgJ3Jlc2l6ZSc7XHJcblxyXG5pbnRlcmZhY2UgVmlld2VyUGFyYW1zIHtcclxuICB1cmw6IHN0cmluZztcclxuICB6b29tOiBudW1iZXI7XHJcbiAgbGFuZzogc3RyaW5nO1xyXG4gIGF1dG9DbG9zZVNlYzogbnVtYmVyO1xyXG4gIHNsaWRlc2hvdzogYm9vbGVhbjtcclxuICBoaWRlTWV0aG9kOiBIaWRlTWV0aG9kO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZVBhcmFtcygpOiBWaWV3ZXJQYXJhbXMge1xyXG4gIGNvbnN0IHAgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG5cclxuICBjb25zdCB1cmwgPSBwLmdldCgndXJsJykgPz8gJyc7XHJcblxyXG4gIGNvbnN0IHJhd1pvb20gPSBwYXJzZUludChwLmdldCgnem9vbScpID8/IFN0cmluZyhERUZBVUxUX1pPT00pLCAxMCk7XHJcbiAgY29uc3Qgem9vbSA9IGlzTmFOKHJhd1pvb20pXHJcbiAgICA/IERFRkFVTFRfWk9PTVxyXG4gICAgOiBNYXRoLm1pbihaT09NX01BWCwgTWF0aC5tYXgoWk9PTV9NSU4sIHJhd1pvb20pKTtcclxuXHJcbiAgY29uc3QgbGFuZyA9IHAuZ2V0KCdsYW5nJykgPz9cclxuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyA/IG5hdmlnYXRvci5sYW5ndWFnZSA6ICdlbicpO1xyXG5cclxuICBjb25zdCByYXdBdXRvQ2xvc2UgPSBwYXJzZUludChwLmdldCgnYXV0b2Nsb3NlJykgPz8gJzAnLCAxMCk7XHJcbiAgY29uc3QgYXV0b0Nsb3NlU2VjID0gaXNOYU4ocmF3QXV0b0Nsb3NlKVxyXG4gICAgPyAwXHJcbiAgICA6IE1hdGgubWluKEFVVE9fQ0xPU0VfTUFYX1NFQywgTWF0aC5tYXgoMCwgcmF3QXV0b0Nsb3NlKSk7XHJcblxyXG4gIGNvbnN0IHNsaWRlc2hvdyA9IHAuZ2V0KCdzbGlkZXNob3cnKSA9PT0gJzEnO1xyXG5cclxuICBjb25zdCByYXdIaWRlID0gcC5nZXQoJ2hpZGUnKSA/PyAnbm9uZSc7XHJcbiAgY29uc3QgaGlkZU1ldGhvZDogSGlkZU1ldGhvZCA9IChyYXdIaWRlID09PSAnbW92ZScgfHwgcmF3SGlkZSA9PT0gJ3Jlc2l6ZScpID8gcmF3SGlkZSA6ICdub25lJztcclxuXHJcbiAgcmV0dXJuIHsgdXJsLCB6b29tLCBsYW5nLCBhdXRvQ2xvc2VTZWMsIHNsaWRlc2hvdywgaGlkZU1ldGhvZCB9O1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgaTE4biDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBSZXBsYWNlIHRleHRDb250ZW50IG9mIGV2ZXJ5IFtkYXRhLWkxOG5dIGVsZW1lbnQgd2l0aCB0aGUgdHJhbnNsYXRlZCBzdHJpbmcuICovXHJcbmZ1bmN0aW9uIGFwcGx5STE4bigpOiB2b2lkIHtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignW2RhdGEtaTE4bl0nKS5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgY29uc3Qga2V5ID0gZWwuZGF0YXNldC5pMThuIGFzIFRyYW5zbGF0aW9uS2V5O1xyXG4gICAgZWwudGV4dENvbnRlbnQgPSBpMThuLnQoa2V5KTtcclxuICB9KTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFpvb20g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogU2NhbGUgdGhlIGlmcmFtZSBieSBgem9vbWAlIHVzaW5nIENTUyB0cmFuc2Zvcm0gd2hpbGUga2VlcGluZyBpdCBmdWxsLXNjcmVlbi5cclxuICogQ29tcGVuc2F0ZWQgd2lkdGgvaGVpZ2h0IGVuc3VyZSB0aGUgdmlld3BvcnQgaXMgYWx3YXlzIGNvdmVyZWQuXHJcbiAqXHJcbiAqICAgem9vbSA9IDE1MCDihpIgY29udGVudCBpcyAxNTAlIHNpemUgKHpvb21lZCBpbiwgc2hvd3MgbGVzcyBjb250ZW50KVxyXG4gKiAgIHpvb20gPSA3NSAg4oaSIGNvbnRlbnQgaXMgNzUlIHNpemUgICh6b29tZWQgb3V0LCBzaG93cyBtb3JlIGNvbnRlbnQpXHJcbiAqL1xyXG5mdW5jdGlvbiBhcHBseVpvb20oaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCwgem9vbTogbnVtYmVyKTogdm9pZCB7XHJcbiAgaWYgKHpvb20gPT09IERFRkFVTFRfWk9PTSkgcmV0dXJuOyAvLyBDU1MgZGVmYXVsdHMgYWxyZWFkeSBjb3ZlciAxMDAlXHJcbiAgY29uc3QgZmFjdG9yID0gem9vbSAvIDEwMDtcclxuICBpZnJhbWUuc3R5bGUud2lkdGggPSBgJHsxMDAgLyBmYWN0b3J9dndgO1xyXG4gIGlmcmFtZS5zdHlsZS5oZWlnaHQgPSBgJHsxMDAgLyBmYWN0b3J9dmhgO1xyXG4gIGlmcmFtZS5zdHlsZS50cmFuc2Zvcm0gPSBgc2NhbGUoJHtmYWN0b3J9KWA7XHJcbiAgaWZyYW1lLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9ICd0b3AgbGVmdCc7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBVSSBzdGF0ZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIHNob3dOb1VybFVJKCk6IHZvaWQge1xyXG4gIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZyYW1lLXdyYXBwZXInKTtcclxuICBjb25zdCBtc2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm8tdXJsLW1lc3NhZ2UnKTtcclxuXHJcbiAgaWYgKHdyYXBwZXIpIHdyYXBwZXIuaGlkZGVuID0gdHJ1ZTtcclxuICBpZiAobXNnKSBtc2cuaGlkZGVuID0gZmFsc2U7XHJcbn1cclxuXHJcbi8qKiBTaG93IGFuIG9mZmxpbmUgbWVzc2FnZS4gQ2FsbGVkIHdoZW4gbmF2aWdhdG9yLm9uTGluZSBpcyBmYWxzZS4gKi9cclxuZnVuY3Rpb24gc2hvd09mZmxpbmVVSSgpOiB2b2lkIHtcclxuICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lmcmFtZS13cmFwcGVyJyk7XHJcbiAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdibG9ja2VkLW92ZXJsYXknKTtcclxuXHJcbiAgaWYgKHdyYXBwZXIpIHdyYXBwZXIuaGlkZGVuID0gdHJ1ZTtcclxuICBpZiAob3ZlcmxheSkge1xyXG4gICAgb3ZlcmxheS5oaWRkZW4gPSBmYWxzZTtcclxuICAgIGNvbnN0IGhlYWRpbmcgPSBvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWkxOG49XCJpZnJhbWVCbG9ja2VkXCJdJyk7XHJcbiAgICBpZiAoaGVhZGluZykgaGVhZGluZy50ZXh0Q29udGVudCA9IGkxOG4udCgnbm9JbnRlcm5ldCcpO1xyXG4gICAgY29uc3QgaGludCA9IG92ZXJsYXkucXVlcnlTZWxlY3RvcignW2RhdGEtaTE4bj1cImlmcmFtZUJsb2NrZWRIaW50XCJdJyk7XHJcbiAgICBpZiAoaGludCkgaGludC50ZXh0Q29udGVudCA9ICcnO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFRvb2xiYXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBpbml0VG9vbGJhcih1cmw6IHN0cmluZyk6IHZvaWQge1xyXG4gIGNvbnN0IHVybExhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2xiYXItdXJsJyk7XHJcbiAgaWYgKHVybExhYmVsKSB7XHJcbiAgICB1cmxMYWJlbC50ZXh0Q29udGVudCA9IHRydW5jYXRlVXJsKHVybCk7XHJcbiAgICB1cmxMYWJlbC50aXRsZSA9IHVybDsgLy8gZnVsbCBVUkwgaW4gdG9vbHRpcFxyXG4gIH1cclxuXHJcbiAgLy8gQ2xvc2Ug4oCUIG1lc3NhZ2UgaG9zdDsgZmFsbGJhY2sgdG8gd2luZG93LmNsb3NlKCkgZm9yIHN0YW5kYWxvbmVcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Nsb3NlJyB9KTtcclxuICAgIHRyeSB7IHdpbmRvdy5jbG9zZSgpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICB9KTtcclxuXHJcbiAgLy8gT3BlbiBjdXJyZW50IFVSTCBpbiBhIG5ldyBicm93c2VyIHRhYlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tb3Blbi1icm93c2VyJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJywgJ25vb3BlbmVyLG5vcmVmZXJyZXInKTtcclxuICB9KTtcclxuXHJcbiAgLy8gXCJTaG93IHNldHVwIGd1aWRlXCIgYnV0dG9uIGlzIGhhbmRsZWQgYnkgaW5pdEd1aWRlKCkgd2hlbiB0aGUgYmxvY2tlZCBvdmVybGF5IGlzIHNob3duLlxyXG5cclxuICAvLyDilIDilIAgSG92ZXIgcmV2ZWFsIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG4gIC8vIFNob3cgdG9vbGJhciB3aGVuIG1vdXNlIGVudGVycyB0b3AgNDAgcHg7IGhpZGUgYWZ0ZXIgYSBzaG9ydCBkZWxheSBvbiBsZWF2ZS5cclxuICBjb25zdCB0b29sYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2xiYXInKSBhcyBIVE1MRWxlbWVudDtcclxuICBsZXQgaGlkZVRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xyXG5cclxuICBjb25zdCBzaG93ID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgaWYgKGhpZGVUaW1lcikgeyBjbGVhclRpbWVvdXQoaGlkZVRpbWVyKTsgaGlkZVRpbWVyID0gbnVsbDsgfVxyXG4gICAgdG9vbGJhci5jbGFzc0xpc3QuYWRkKCd2aXNpYmxlJyk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc2NoZWR1bGVIaWRlID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgaGlkZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0b29sYmFyLmNsYXNzTGlzdC5yZW1vdmUoJ3Zpc2libGUnKSwgNDAwKTtcclxuICB9O1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgaWYgKGUuY2xpZW50WSA8IDQwKSB7XHJcbiAgICAgIHNob3coKTtcclxuICAgIH0gZWxzZSBpZiAoIXRvb2xiYXIubWF0Y2hlcygnOmhvdmVyJykpIHtcclxuICAgICAgc2NoZWR1bGVIaWRlKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHRvb2xiYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHNob3cpO1xyXG4gIHRvb2xiYXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHNjaGVkdWxlSGlkZSk7XHJcblxyXG4gIC8vIEtleWJvYXJkOiByZXZlYWwgdG9vbGJhciB3aGVuIGZvY3VzIGVudGVycyBpdFxyXG4gIHRvb2xiYXIuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIHNob3cpO1xyXG4gIHRvb2xiYXIuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBzY2hlZHVsZUhpZGUpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgSW1hZ2UgbW9kZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmNvbnN0IElNQUdFX0VYVEVOU0lPTlMgPSAvXFwuKHBuZ3xqcGU/Z3xnaWZ8d2VicHxzdmcpJC9pO1xyXG5cclxuLyoqIENoZWNrIGlmIGEgVVJMIHBvaW50cyB0byBhbiBpbWFnZSBmaWxlIGJ5IGl0cyBwYXRobmFtZSBleHRlbnNpb24uICovXHJcbmZ1bmN0aW9uIGlzSW1hZ2VVcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIElNQUdFX0VYVEVOU0lPTlMudGVzdChuZXcgVVJMKHVybCkucGF0aG5hbWUpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEFkZCBhIGNhY2hlLWJ1c3RpbmcgcGFyYW1ldGVyIHRvIGZvcmNlIGZyZXNoIGltYWdlIGxvYWRzLiAqL1xyXG5mdW5jdGlvbiBjYWNoZUJ1c3QodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IHNlcGFyYXRvciA9IHVybC5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nO1xyXG4gIHJldHVybiBgJHt1cmx9JHtzZXBhcmF0b3J9X3Q9JHtEYXRlLm5vdygpfWA7XHJcbn1cclxuXHJcbi8qKiBBcHBseSB6b29tIHRvIHRoZSBpbWFnZSBlbGVtZW50IHVzaW5nIENTUyB0cmFuc2Zvcm0uICovXHJcbmZ1bmN0aW9uIGFwcGx5SW1hZ2Vab29tKGltZzogSFRNTEltYWdlRWxlbWVudCwgem9vbTogbnVtYmVyKTogdm9pZCB7XHJcbiAgaWYgKHpvb20gPT09IERFRkFVTFRfWk9PTSkgcmV0dXJuO1xyXG4gIGNvbnN0IGZhY3RvciA9IHpvb20gLyAxMDA7XHJcbiAgaW1nLnN0eWxlLnRyYW5zZm9ybSA9IGBzY2FsZSgke2ZhY3Rvcn0pYDtcclxuICBpbWcuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJ2NlbnRlciBjZW50ZXInO1xyXG59XHJcblxyXG4vKiogSW5pdGlhbGl6ZSBpbWFnZSBtb2RlOiBkaXNwbGF5IGEgc3RhdGljIGltYWdlIGluc3RlYWQgb2YgYW4gaWZyYW1lLiAqL1xyXG5mdW5jdGlvbiBpbml0SW1hZ2VNb2RlKHVybDogc3RyaW5nLCB6b29tOiBudW1iZXIsIGF1dG9DbG9zZVNlYzogbnVtYmVyKTogdm9pZCB7XHJcbiAgY29uc3QgaWZyYW1lV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnJhbWUtd3JhcHBlcicpO1xyXG4gIGNvbnN0IGltYWdlV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbWFnZS13cmFwcGVyJyk7XHJcbiAgY29uc3QgaW1nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltYWdlLWZyYW1lJykgYXMgSFRNTEltYWdlRWxlbWVudDtcclxuXHJcbiAgaWYgKGlmcmFtZVdyYXBwZXIpIGlmcmFtZVdyYXBwZXIuaGlkZGVuID0gdHJ1ZTtcclxuICBpZiAoaW1hZ2VXcmFwcGVyKSBpbWFnZVdyYXBwZXIuaGlkZGVuID0gZmFsc2U7XHJcblxyXG4gIGFwcGx5SW1hZ2Vab29tKGltZywgem9vbSk7XHJcblxyXG4gIGltZy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgbG9nRGVidWcoJ0ltYWdlIGxvYWRlZDonLCB1cmwpO1xyXG4gICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2xvYWRlZCcsIHVybCB9KTtcclxuXHJcbiAgICAvLyBSZXR1cm4gZm9jdXMgdG8gUG93ZXJQb2ludCBzbyB0aGUgY2xpY2tlci9yZW1vdGUgd29ya3MuXHJcbiAgICAvLyBUaGUgaW1hZ2Ugc3RheXMgdmlzaWJsZSBpbiB0aGUgZGlhbG9nIHdpbmRvdy5cclxuICAgIC8vIFNtYWxsIGRlbGF5IGVuc3VyZXMgdGhlIGRpYWxvZyBoYXMgZmluaXNoZWQgcmVuZGVyaW5nLlxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRyeSB7IHdpbmRvdy5ibHVyKCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfSwgMzAwKTtcclxuXHJcbiAgICBpZiAoYXV0b0Nsb3NlU2VjID4gMCkgc3RhcnRDb3VudGRvd24oYXV0b0Nsb3NlU2VjKTtcclxuICB9KTtcclxuXHJcbiAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4ge1xyXG4gICAgbG9nRXJyb3IoJ0ltYWdlIGZhaWxlZCB0byBsb2FkOicsIHVybCk7XHJcbiAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnZXJyb3InLCB1cmwsIGVycm9yOiAnSW1hZ2UgZmFpbGVkIHRvIGxvYWQnIH0pO1xyXG4gIH0pO1xyXG5cclxuICBpbWcuc3JjID0gY2FjaGVCdXN0KHVybCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBBdXRvLWNsb3NlIGNvdW50ZG93biDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBTaG93IGEgY291bnRkb3duIGJhZGdlIGFuZCBhdXRvLWNsb3NlIChvciBzdGFuZGJ5IGluIHNsaWRlc2hvdyBtb2RlKS4gKi9cclxuZnVuY3Rpb24gc3RhcnRDb3VudGRvd24oc2Vjb25kczogbnVtYmVyKTogdm9pZCB7XHJcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRkb3duJyk7XHJcbiAgaWYgKCFlbCkgcmV0dXJuO1xyXG5cclxuICBsZXQgcmVtYWluaW5nID0gc2Vjb25kcztcclxuICBlbC50ZXh0Q29udGVudCA9IGkxOG4udCgnY291bnRkb3duVGV4dCcpLnJlcGxhY2UoJ3tufScsIFN0cmluZyhyZW1haW5pbmcpKTtcclxuICBlbC5oaWRkZW4gPSBmYWxzZTtcclxuXHJcbiAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICByZW1haW5pbmctLTtcclxuICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcclxuICAgICAgZWwuaGlkZGVuID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmIChzbGlkZXNob3dNb2RlKSB7XHJcbiAgICAgICAgLy8gVEVTVDogY2xvc2UgZGlhbG9nIHZpYSBob3N0LXNpZGUgbGF1bmNoZXIuY2xvc2UoKSBpbnN0ZWFkIG9mIHN0YW5kYnkuXHJcbiAgICAgICAgLy8gVGhpcyB0ZXN0cyB3aGV0aGVyIGRpYWxvZy5jbG9zZSgpIGV4aXRzIHNsaWRlc2hvdyBvciBub3QuXHJcbiAgICAgICAgbG9nRGVidWcoJ0F1dG8tY2xvc2UgdGltZXIgZXhwaXJlZCBpbiBzbGlkZXNob3cg4oCUIHNlbmRpbmcgY2xvc2UgdG8gaG9zdCcpO1xyXG4gICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdjbG9zZScgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Nsb3NlJyB9KTtcclxuICAgICAgICB0cnkgeyB3aW5kb3cuY2xvc2UoKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVsLnRleHRDb250ZW50ID0gaTE4bi50KCdjb3VudGRvd25UZXh0JykucmVwbGFjZSgne259JywgU3RyaW5nKHJlbWFpbmluZykpO1xyXG4gICAgfVxyXG4gIH0sIDEwMDApO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGVzaG93IGxpdmUtdXBkYXRlIHZpYSBsb2NhbFN0b3JhZ2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcbi8vXHJcbi8vIER1cmluZyBzbGlkZXNob3csIHRoZSB0YXNrcGFuZSBjYW4ndCBjbG9zZS9yZW9wZW4gdGhlIGRpYWxvZyAoaXQgZXhpdHNcclxuLy8gc2xpZGVzaG93KS4gSW5zdGVhZCwgdGhlIHRhc2twYW5lIHdyaXRlcyB0aGUgdGFyZ2V0IFVSTCB0byBsb2NhbFN0b3JhZ2VcclxuLy8gYW5kIHRoZSB2aWV3ZXIgbmF2aWdhdGVzIHRvIGl0LiBUaGlzIGFsbG93cyBzZWFtbGVzcyBzbGlkZSB0cmFuc2l0aW9ucy5cclxuLy9cclxuLy8gS2V5OiAnd2VicHB0X3NsaWRlc2hvd191cmwnXHJcbi8vIFZhbHVlOiBVUkwgc3RyaW5nIChlbXB0eSA9IHNob3cgc3RhbmRieS9ibGFuaylcclxuXHJcbi8qKiBDdXJyZW50IHpvb20gKHNldCBkdXJpbmcgaW5pdCwgcmV1c2VkIG9uIG5hdmlnYXRpb24pLiAqL1xyXG5sZXQgY3VycmVudFpvb20gPSBERUZBVUxUX1pPT007XHJcblxyXG4vKiogV2hldGhlciB0aGUgdmlld2VyIGlzIHJ1bm5pbmcgaW4gc2xpZGVzaG93IG1vZGUgKGRvbid0IGNsb3NlIG9uIHRpbWVyKS4gKi9cclxubGV0IHNsaWRlc2hvd01vZGUgPSBmYWxzZTtcclxuXHJcbi8qKiBIb3cgdG8gaGlkZSB0aGUgZGlhbG9nIHdpbmRvdyBhZnRlciB0aW1lciBleHBpcmVzIGluIHNsaWRlc2hvdyBtb2RlLiAqL1xyXG5sZXQgaGlkZU1ldGhvZFNldHRpbmc6IEhpZGVNZXRob2QgPSAnbm9uZSc7XHJcblxyXG4vKiogTmF2aWdhdGUgdGhlIHZpZXdlciB0byBhIG5ldyBVUkwgKGNhbGxlZCBmcm9tIHN0b3JhZ2UgbGlzdGVuZXIpLiAqL1xyXG5mdW5jdGlvbiBuYXZpZ2F0ZVRvVXJsKG5ld1VybDogc3RyaW5nKTogdm9pZCB7XHJcbiAgY29uc3QgaWZyYW1lV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnJhbWUtd3JhcHBlcicpO1xyXG4gIGNvbnN0IGltYWdlV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbWFnZS13cmFwcGVyJyk7XHJcbiAgY29uc3Qgc3RhbmRieSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFuZGJ5LW92ZXJsYXknKTtcclxuICBjb25zdCBibG9ja2VkT3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdibG9ja2VkLW92ZXJsYXknKTtcclxuICBjb25zdCBub1VybE1zZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduby11cmwtbWVzc2FnZScpO1xyXG5cclxuICBpZiAoIW5ld1VybCkge1xyXG4gICAgLy8gU2hvdyBzdGFuZGJ5IHN0YXRlIChibGFjay9ibGFuayBzY3JlZW4pXHJcbiAgICBpZiAoaWZyYW1lV3JhcHBlcikgaWZyYW1lV3JhcHBlci5oaWRkZW4gPSB0cnVlO1xyXG4gICAgaWYgKGltYWdlV3JhcHBlcikgaW1hZ2VXcmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAoYmxvY2tlZE92ZXJsYXkpIGJsb2NrZWRPdmVybGF5LmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAobm9VcmxNc2cpIG5vVXJsTXNnLmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAoc3RhbmRieSkgc3RhbmRieS5oaWRkZW4gPSBmYWxzZTtcclxuICAgIGxvZ0RlYnVnKCdWaWV3ZXI6IHN0YW5kYnkgKG5vIFVSTCknKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIEhpZGUgc3RhbmRieSwgc2hvdyBjb250ZW50XHJcbiAgaWYgKHN0YW5kYnkpIHN0YW5kYnkuaGlkZGVuID0gdHJ1ZTtcclxuICBpZiAoYmxvY2tlZE92ZXJsYXkpIGJsb2NrZWRPdmVybGF5LmhpZGRlbiA9IHRydWU7XHJcbiAgaWYgKG5vVXJsTXNnKSBub1VybE1zZy5oaWRkZW4gPSB0cnVlO1xyXG5cclxuICAvLyBSZXN0b3JlIHdpbmRvdyBpZiBpdCB3YXMgaGlkZGVuIChtb3ZlVG8vcmVzaXplVG8pXHJcbiAgaWYgKHNhdmVkV2luZG93U3RhdGUpIHtcclxuICAgIGxvZ0RlYnVnKCdSZXN0b3Jpbmcgd2luZG93IGJlZm9yZSBuYXZpZ2F0aW5nIHRvIG5ldyBVUkwnKTtcclxuICAgIGhhbmRsZVJlc3RvcmUoKTtcclxuICB9XHJcblxyXG4gIGlmIChpc0ltYWdlVXJsKG5ld1VybCkpIHtcclxuICAgIGlmIChpZnJhbWVXcmFwcGVyKSBpZnJhbWVXcmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAoaW1hZ2VXcmFwcGVyKSBpbWFnZVdyYXBwZXIuaGlkZGVuID0gZmFsc2U7XHJcbiAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1hZ2UtZnJhbWUnKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gICAgYXBwbHlJbWFnZVpvb20oaW1nLCBjdXJyZW50Wm9vbSk7XHJcbiAgICBpbWcuc3JjID0gY2FjaGVCdXN0KG5ld1VybCk7XHJcbiAgICBsb2dEZWJ1ZygnVmlld2VyOiBuYXZpZ2F0ZWQgdG8gaW1hZ2U6JywgbmV3VXJsKTtcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKGltYWdlV3JhcHBlcikgaW1hZ2VXcmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAoaWZyYW1lV3JhcHBlcikgaWZyYW1lV3JhcHBlci5oaWRkZW4gPSBmYWxzZTtcclxuICAgIGNvbnN0IGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3ZWItZnJhbWUnKSBhcyBIVE1MSUZyYW1lRWxlbWVudDtcclxuICAgIGFwcGx5Wm9vbShpZnJhbWUsIGN1cnJlbnRab29tKTtcclxuICAgIGlmcmFtZS5zcmMgPSBuZXdVcmw7XHJcbiAgICBsb2dEZWJ1ZygnVmlld2VyOiBuYXZpZ2F0ZWQgdG86JywgbmV3VXJsKTtcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSB0b29sYmFyIFVSTFxyXG4gIGNvbnN0IHVybExhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2xiYXItdXJsJyk7XHJcbiAgaWYgKHVybExhYmVsKSB7XHJcbiAgICB1cmxMYWJlbC50ZXh0Q29udGVudCA9IHRydW5jYXRlVXJsKG5ld1VybCk7XHJcbiAgICB1cmxMYWJlbC50aXRsZSA9IG5ld1VybDtcclxuICB9XHJcblxyXG4gIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdyZWFkeScsIHVybDogbmV3VXJsIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogTGlzdGVuIGZvciBtZXNzYWdlcyBmcm9tIHRoZSBob3N0ICh0YXNrcGFuZSkgdmlhIE9mZmljZS5qcyBEaWFsb2dBcGkgMS4yLlxyXG4gKlxyXG4gKiBUaGUgdGFza3BhbmUgY2FsbHMgYGRpYWxvZy5tZXNzYWdlQ2hpbGQoSlNPTi5zdHJpbmdpZnkoe2FjdGlvbiwgdXJsfSkpYC5cclxuICogVGhlIHZpZXdlciByZWNlaXZlcyBpdCB2aWEgYERpYWxvZ1BhcmVudE1lc3NhZ2VSZWNlaXZlZGAgZXZlbnQuXHJcbiAqXHJcbiAqIFRoaXMgaXMgdGhlIG9mZmljaWFsIHR3by13YXkgY29tbXVuaWNhdGlvbiBtZWNoYW5pc20gZm9yIE9mZmljZSBhZGQtaW4gZGlhbG9ncy5cclxuICogbG9jYWxTdG9yYWdlIGRvZXMgTk9UIHdvcmsgYmV0d2VlbiBXZWJWaWV3MiBwcm9jZXNzZXMgb24gT2ZmaWNlIERlc2t0b3AuXHJcbiAqL1xyXG5pbnRlcmZhY2UgUGFyZW50TWVzc2FnZSB7XHJcbiAgYWN0aW9uOiAnbmF2aWdhdGUnIHwgJ3N0YW5kYnknIHwgJ2hpZGUtbW92ZScgfCAnaGlkZS1yZXNpemUnIHwgJ3Jlc3RvcmUnO1xyXG4gIHVybD86IHN0cmluZztcclxufVxyXG5cclxuLyoqIFNhdmVkIHdpbmRvdyBwb3NpdGlvbi9zaXplIGJlZm9yZSBoaWRpbmcsIGZvciByZXN0b3JlLiAqL1xyXG5sZXQgc2F2ZWRXaW5kb3dTdGF0ZTogeyB4OiBudW1iZXI7IHk6IG51bWJlcjsgdzogbnVtYmVyOyBoOiBudW1iZXIgfSB8IG51bGwgPSBudWxsO1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlSGlkZU1vdmUoKTogc3RyaW5nIHtcclxuICBjb25zdCBieCA9IHdpbmRvdy5zY3JlZW5YLCBieSA9IHdpbmRvdy5zY3JlZW5ZO1xyXG4gIHNhdmVkV2luZG93U3RhdGUgPSB7IHg6IGJ4LCB5OiBieSwgdzogd2luZG93Lm91dGVyV2lkdGgsIGg6IHdpbmRvdy5vdXRlckhlaWdodCB9O1xyXG4gIHRyeSB7IHdpbmRvdy5tb3ZlVG8oLTMyMDAwLCAtMzIwMDApOyB9IGNhdGNoIHsgLyogKi8gfVxyXG4gIGNvbnN0IGF4ID0gd2luZG93LnNjcmVlblgsIGF5ID0gd2luZG93LnNjcmVlblk7XHJcbiAgY29uc3QgbW92ZWQgPSBieCAhPT0gYXggfHwgYnkgIT09IGF5O1xyXG4gIGNvbnN0IHJlc3VsdCA9IGBtb3ZlVG86ICgke2J4fSwke2J5fSnihpIoJHtheH0sJHtheX0pIG1vdmVkPSR7bW92ZWR9YDtcclxuICBsb2dEZWJ1ZyhyZXN1bHQpO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUhpZGVSZXNpemUoKTogc3RyaW5nIHtcclxuICBjb25zdCBidyA9IHdpbmRvdy5vdXRlcldpZHRoLCBiaCA9IHdpbmRvdy5vdXRlckhlaWdodDtcclxuICBzYXZlZFdpbmRvd1N0YXRlID0geyB4OiB3aW5kb3cuc2NyZWVuWCwgeTogd2luZG93LnNjcmVlblksIHc6IGJ3LCBoOiBiaCB9O1xyXG4gIHRyeSB7IHdpbmRvdy5yZXNpemVUbygxLCAxKTsgfSBjYXRjaCB7IC8qICovIH1cclxuICBjb25zdCBhdyA9IHdpbmRvdy5vdXRlcldpZHRoLCBhaCA9IHdpbmRvdy5vdXRlckhlaWdodDtcclxuICBjb25zdCByZXNpemVkID0gYncgIT09IGF3IHx8IGJoICE9PSBhaDtcclxuICBjb25zdCByZXN1bHQgPSBgcmVzaXplVG86ICgke2J3fXgke2JofSnihpIoJHthd314JHthaH0pIHJlc2l6ZWQ9JHtyZXNpemVkfWA7XHJcbiAgbG9nRGVidWcocmVzdWx0KTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVSZXN0b3JlKCk6IHN0cmluZyB7XHJcbiAgaWYgKCFzYXZlZFdpbmRvd1N0YXRlKSByZXR1cm4gJ3Jlc3RvcmU6IG5vIHNhdmVkIHN0YXRlJztcclxuICB0cnkge1xyXG4gICAgd2luZG93Lm1vdmVUbyhzYXZlZFdpbmRvd1N0YXRlLngsIHNhdmVkV2luZG93U3RhdGUueSk7XHJcbiAgICB3aW5kb3cucmVzaXplVG8oc2F2ZWRXaW5kb3dTdGF0ZS53LCBzYXZlZFdpbmRvd1N0YXRlLmgpO1xyXG4gIH0gY2F0Y2ggeyAvKiAqLyB9XHJcbiAgY29uc3QgcmVzdWx0ID0gYHJlc3RvcmVkIHRvICgke3NhdmVkV2luZG93U3RhdGUueH0sJHtzYXZlZFdpbmRvd1N0YXRlLnl9KSAke3NhdmVkV2luZG93U3RhdGUud314JHtzYXZlZFdpbmRvd1N0YXRlLmh9YDtcclxuICBzYXZlZFdpbmRvd1N0YXRlID0gbnVsbDtcclxuICBsb2dEZWJ1ZyhyZXN1bHQpO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRQYXJlbnRNZXNzYWdlTGlzdGVuZXIoKTogdm9pZCB7XHJcbiAgdHJ5IHtcclxuICAgIE9mZmljZS5jb250ZXh0LnVpLmFkZEhhbmRsZXJBc3luYyhcclxuICAgICAgT2ZmaWNlLkV2ZW50VHlwZS5EaWFsb2dQYXJlbnRNZXNzYWdlUmVjZWl2ZWQsXHJcbiAgICAgIChhcmc6IHsgbWVzc2FnZT86IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgICAgaWYgKCFhcmcubWVzc2FnZSkgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBtc2c6IFBhcmVudE1lc3NhZ2UgPSBKU09OLnBhcnNlKGFyZy5tZXNzYWdlKTtcclxuICAgICAgICAgIGxvZ0RlYnVnKCdWaWV3ZXI6IHBhcmVudCBtZXNzYWdlOicsIG1zZy5hY3Rpb24sIG1zZy51cmwgPz8gJycpO1xyXG5cclxuICAgICAgICAgIHN3aXRjaCAobXNnLmFjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlICduYXZpZ2F0ZSc6XHJcbiAgICAgICAgICAgICAgaWYgKG1zZy51cmwpIG5hdmlnYXRlVG9VcmwobXNnLnVybCk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3N0YW5kYnknOlxyXG4gICAgICAgICAgICAgIG5hdmlnYXRlVG9VcmwoJycpO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdoaWRlLW1vdmUnOiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcjEgPSBoYW5kbGVIaWRlTW92ZSgpO1xyXG4gICAgICAgICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdsb2FkZWQnLCB1cmw6IHIxIH0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ2hpZGUtcmVzaXplJzoge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHIyID0gaGFuZGxlSGlkZVJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdsb2FkZWQnLCB1cmw6IHIyIH0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ3Jlc3RvcmUnOiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcjMgPSBoYW5kbGVSZXN0b3JlKCk7XHJcbiAgICAgICAgICAgICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2xvYWRlZCcsIHVybDogcjMgfSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgIGxvZ0RlYnVnKCdWaWV3ZXI6IGZhaWxlZCB0byBwYXJzZSBwYXJlbnQgbWVzc2FnZTonLCBTdHJpbmcoZXJyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IE9mZmljZS5Bc3luY1Jlc3VsdFN0YXR1cy5TdWNjZWVkZWQpIHtcclxuICAgICAgICAgIGxvZ0RlYnVnKCdWaWV3ZXI6IHBhcmVudCBtZXNzYWdlIGhhbmRsZXIgcmVnaXN0ZXJlZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsb2dEZWJ1ZygnVmlld2VyOiBmYWlsZWQgdG8gcmVnaXN0ZXIgcGFyZW50IG1lc3NhZ2UgaGFuZGxlcjonLCBKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICApO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgbG9nRGVidWcoJ1ZpZXdlcjogRGlhbG9nUGFyZW50TWVzc2FnZVJlY2VpdmVkIG5vdCBzdXBwb3J0ZWQ6JywgU3RyaW5nKGVycikpO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIElmcmFtZSBwb3N0TWVzc2FnZSBsaXN0ZW5lciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKlxyXG4gKiBMaXN0ZW4gZm9yIHBvc3RNZXNzYWdlIGZyb20gdGhlIHdlYnNpdGUgbG9hZGVkIGluIHRoZSBpZnJhbWUuXHJcbiAqIFRoaXMgYWxsb3dzIHRoZSB3ZWJzaXRlIHRvIGNvbnRyb2wgdGhlIGRpYWxvZyAoZS5nLiBjbG9zZSBpdCkuXHJcbiAqXHJcbiAqIFN1cHBvcnRlZCBtZXNzYWdlcyBmcm9tIHRoZSBpZnJhbWU6XHJcbiAqICAgeyBhY3Rpb246ICdjbG9zZS1kaWFsb2cnIH0gIOKAlCBjbG9zZSB0aGUgdmlld2VyIGRpYWxvZ1xyXG4gKi9cclxuZnVuY3Rpb24gaW5pdElmcmFtZU1lc3NhZ2VMaXN0ZW5lcigpOiB2b2lkIHtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XHJcbiAgICAvLyBPbmx5IHByb2Nlc3Mgb2JqZWN0IG1lc3NhZ2VzIHdpdGggYW4gYWN0aW9uIGZpZWxkXHJcbiAgICBpZiAoIWV2ZW50LmRhdGEgfHwgdHlwZW9mIGV2ZW50LmRhdGEgIT09ICdvYmplY3QnIHx8ICFldmVudC5kYXRhLmFjdGlvbikgcmV0dXJuO1xyXG5cclxuICAgIGxvZ0RlYnVnKGBWaWV3ZXI6IGlmcmFtZSBwb3N0TWVzc2FnZTogYWN0aW9uPSR7ZXZlbnQuZGF0YS5hY3Rpb259IG9yaWdpbj0ke2V2ZW50Lm9yaWdpbn1gKTtcclxuXHJcbiAgICBzd2l0Y2ggKGV2ZW50LmRhdGEuYWN0aW9uKSB7XHJcbiAgICAgIGNhc2UgJ2Nsb3NlLWRpYWxvZyc6XHJcbiAgICAgICAgbG9nRGVidWcoJ1ZpZXdlcjogY2xvc2UtZGlhbG9nIHJlY2VpdmVkIGZyb20gaWZyYW1lIOKAlCBjbG9zaW5nJyk7XHJcbiAgICAgICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Nsb3NlJyB9KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9KTtcclxuICBsb2dEZWJ1ZygnVmlld2VyOiBpZnJhbWUgcG9zdE1lc3NhZ2UgbGlzdGVuZXIgcmVnaXN0ZXJlZCcpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgTWFpbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIGluaXQoKTogdm9pZCB7XHJcbiAgY29uc3QgeyB1cmwsIHpvb20sIGxhbmcsIGF1dG9DbG9zZVNlYywgc2xpZGVzaG93LCBoaWRlTWV0aG9kIH0gPSBwYXJzZVBhcmFtcygpO1xyXG4gIGN1cnJlbnRab29tID0gem9vbTtcclxuICBzbGlkZXNob3dNb2RlID0gc2xpZGVzaG93O1xyXG4gIGhpZGVNZXRob2RTZXR0aW5nID0gaGlkZU1ldGhvZDtcclxuXHJcbiAgaTE4bi5zZXRMb2NhbGUocGFyc2VMb2NhbGUobGFuZykpO1xyXG4gIGFwcGx5STE4bigpO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIFVSTCB1cGRhdGVzIGZyb20gdGFza3BhbmUgdmlhIE9mZmljZS5qcyBtZXNzYWdlQ2hpbGQgKERpYWxvZ0FwaSAxLjIpXHJcbiAgaW5pdFBhcmVudE1lc3NhZ2VMaXN0ZW5lcigpO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIHBvc3RNZXNzYWdlIGZyb20gdGhlIHdlYnNpdGUgaW4gdGhlIGlmcmFtZSAoZS5nLiBjbG9zZS1kaWFsb2cpXHJcbiAgaW5pdElmcmFtZU1lc3NhZ2VMaXN0ZW5lcigpO1xyXG5cclxuICBpZiAoIXVybCkge1xyXG4gICAgc2hvd05vVXJsVUkoKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIG5ldHdvcmsgYmVmb3JlIGxvYWRpbmdcclxuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgIW5hdmlnYXRvci5vbkxpbmUpIHtcclxuICAgIGxvZ0RlYnVnKCdCcm93c2VyIGlzIG9mZmxpbmUsIHNob3dpbmcgb2ZmbGluZSBVSScpO1xyXG4gICAgc2hvd09mZmxpbmVVSSgpO1xyXG4gICAgLy8gUmUtY2hlY2sgd2hlbiBjb25uZWN0aW9uIGlzIHJlc3RvcmVkXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb25saW5lJywgKCkgPT4ge1xyXG4gICAgICBsb2dEZWJ1ZygnQ29ubmVjdGlvbiByZXN0b3JlZCwgcmVsb2FkaW5nJyk7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcclxuICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdlcnJvcicsIHVybCwgZXJyb3I6ICdObyBpbnRlcm5ldCBjb25uZWN0aW9uJyB9KTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGluaXRUb29sYmFyKHVybCk7XHJcblxyXG4gIC8vIEltYWdlIG1vZGU6IGF1dG8tZGV0ZWN0ZWQgYnkgVVJMIGV4dGVuc2lvblxyXG4gIGlmIChpc0ltYWdlVXJsKHVybCkpIHtcclxuICAgIGxvZ0RlYnVnKCdJbWFnZSBVUkwgZGV0ZWN0ZWQsIHVzaW5nIGltYWdlIG1vZGUnKTtcclxuICAgIGluaXRJbWFnZU1vZGUodXJsLCB6b29tLCBhdXRvQ2xvc2VTZWMpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBJZnJhbWUgbW9kZSAoZGVmYXVsdCkg4oCUIGxvYWQgZGlyZWN0bHkgd2l0aG91dCBibG9ja2luZyBkZXRlY3Rpb25cclxuICAgIGNvbnN0IGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3ZWItZnJhbWUnKSBhcyBIVE1MSUZyYW1lRWxlbWVudDtcclxuICAgIGFwcGx5Wm9vbShpZnJhbWUsIHpvb20pO1xyXG4gICAgaWZyYW1lLnNyYyA9IHVybDtcclxuICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdsb2FkZWQnLCB1cmwgfSk7XHJcbiAgICBpZiAoYXV0b0Nsb3NlU2VjID4gMCkgc3RhcnRDb3VudGRvd24oYXV0b0Nsb3NlU2VjKTtcclxuICB9XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgZ29pbmcgb2ZmbGluZSBhZnRlciBpbml0aWFsIGxvYWRcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsICgpID0+IHtcclxuICAgIGxvZ0RlYnVnKCdDb25uZWN0aW9uIGxvc3QnKTtcclxuICAgIHNob3dPZmZsaW5lVUkoKTtcclxuICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdlcnJvcicsIHVybCwgZXJyb3I6ICdDb25uZWN0aW9uIGxvc3QnIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBFc2NhcGUga2V5IGNsb3NlcyB0aGUgdmlld2VyXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XHJcbiAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdjbG9zZScgfSk7XHJcbiAgICAgIHRyeSB7IHdpbmRvdy5jbG9zZSgpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ3JlYWR5JywgdXJsIH0pO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQm9vdHN0cmFwIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqXHJcbiAqIC0gT2ZmaWNlIGNvbnRleHQ6IGRlZmVyIHVudGlsIE9mZmljZS5vblJlYWR5KCkgdG8gZ3VhcmFudGVlIE9mZmljZS5qcyBBUElzLlxyXG4gKiAtIFN0YW5kYWxvbmUgKG5vIE9mZmljZS5qcyBDRE4sIGRldiBicm93c2VyKTogcnVuIG9uIERPTUNvbnRlbnRMb2FkZWQuXHJcbiAqL1xyXG5mdW5jdGlvbiBzdGFydCgpOiB2b2lkIHtcclxuICBpbnN0YWxsVW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlcigpO1xyXG5cclxuICBpZiAodHlwZW9mIE9mZmljZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIE9mZmljZS5vblJlYWR5ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICBPZmZpY2Uub25SZWFkeSgoKSA9PiBpbml0KCkpO1xyXG4gIH0gZWxzZSBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGluaXQoKTtcclxuICB9XHJcbn1cclxuXHJcbnN0YXJ0KCk7XHJcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==