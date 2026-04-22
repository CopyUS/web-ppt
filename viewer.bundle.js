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
// ─── Iframe blocking detection ────────────────────────────────────────────────
/**
 * Detects whether the target site blocks iframe embedding.
 *
 * Strategy:
 *  1. Listen for the iframe `load` event.
 *  2. On load, try to read `contentDocument`:
 *     - SecurityError (cross-origin) → site loaded normally.
 *     - No error + document URL is `about:blank` → browser silently blocked
 *       due to X-Frame-Options / CSP frame-ancestors.
 *  3. If `load` never fires within IFRAME_LOAD_TIMEOUT_MS → slow network.
 *
 * IMPORTANT: Never use `window.location.href = url` to auto-navigate.
 * That destroys the viewer page (messageChild listener, countdown timer,
 * standby overlay) making slideshow navigation impossible.
 */
function detectBlocking(iframe, url, autoCloseSec) {
    let loadFired = false;
    iframe.addEventListener('load', () => {
        loadFired = true;
        try {
            const doc = iframe.contentDocument;
            // When blocked by X-Frame-Options/CSP, browsers redirect iframe to about:blank.
            // Check for about:blank URL rather than empty body (avoids false positives
            // with SPAs that render asynchronously after the load event).
            const isBlocked = !doc || doc.URL === 'about:blank' || doc.URL === '';
            if (isBlocked) {
                (0, logger_1.logDebug)('Iframe blocked (about:blank detected) for:', url);
                showBlockedUI(url);
                sendToParent({ type: 'blocked', url });
            }
            else {
                sendToParent({ type: 'loaded', url });
                if (autoCloseSec > 0)
                    startCountdown(autoCloseSec);
            }
        }
        catch {
            // SecurityError: cross-origin content loaded successfully
            sendToParent({ type: 'loaded', url });
            if (autoCloseSec > 0)
                startCountdown(autoCloseSec);
        }
    });
    setTimeout(() => {
        if (!loadFired) {
            // Timeout: the site is probably just slow. Show timeout UI but do NOT
            // navigate away — the viewer must stay alive for slideshow communication.
            (0, logger_1.logDebug)('Iframe load timeout for:', url);
            showTimeoutUI(url);
            sendToParent({ type: 'error', url, error: 'timeout' });
        }
    }, constants_1.IFRAME_LOAD_TIMEOUT_MS);
}
// ─── UI state ─────────────────────────────────────────────────────────────────
function showBlockedUI(url) {
    const wrapper = document.getElementById('iframe-wrapper');
    const overlay = document.getElementById('blocked-overlay');
    if (wrapper)
        wrapper.hidden = true;
    if (overlay)
        overlay.hidden = false;
    initBlockedActions(url);
    initGuide();
}
function showNoUrlUI() {
    const wrapper = document.getElementById('iframe-wrapper');
    const msg = document.getElementById('no-url-message');
    if (wrapper)
        wrapper.hidden = true;
    if (msg)
        msg.hidden = false;
}
/** Show a timeout message when the iframe fails to load within the allowed time. */
function showTimeoutUI(url) {
    const wrapper = document.getElementById('iframe-wrapper');
    const overlay = document.getElementById('blocked-overlay');
    if (wrapper)
        wrapper.hidden = true;
    if (overlay) {
        overlay.hidden = false;
        // Reuse the blocked overlay but change the heading text to timeout message
        const heading = overlay.querySelector('[data-i18n="iframeBlocked"]');
        if (heading)
            heading.textContent = i18n_1.i18n.t('loadTimeout');
        const hint = overlay.querySelector('[data-i18n="iframeBlockedHint"]');
        if (hint)
            hint.textContent = i18n_1.i18n.t('noInternet');
    }
    initBlockedActions(url);
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
// ─── Blocked-overlay actions ──────────────────────────────────────────────────
/** Wire the two action buttons inside the blocked overlay. */
function initBlockedActions(url) {
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
function initGuide() {
    const toggleBtn = document.getElementById('btn-toggle-guide');
    const panel = document.getElementById('guide-panel');
    if (!toggleBtn || !panel)
        return;
    // Toggle visibility
    toggleBtn.addEventListener('click', () => {
        const opening = panel.hidden;
        panel.hidden = !opening;
        toggleBtn.textContent = i18n_1.i18n.t(opening ? 'hideSetupGuide' : 'showSetupGuide');
        toggleBtn.setAttribute('aria-expanded', String(opening));
    });
    // Tab switching
    const tabs = Array.from(panel.querySelectorAll('.guide-tab'));
    const codePanels = panel.querySelectorAll('.guide-code');
    function activateTab(target) {
        tabs.forEach((t) => {
            const isActive = t.dataset.tab === target;
            t.classList.toggle('active', isActive);
            t.setAttribute('aria-selected', String(isActive));
            t.tabIndex = isActive ? 0 : -1;
            if (isActive)
                t.focus();
        });
        codePanels.forEach((p) => {
            p.hidden = p.dataset.tabPanel !== target;
        });
    }
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    });
    // Arrow key navigation for tabs
    panel.querySelector('.guide-tabs')?.addEventListener('keydown', ((e) => {
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
        activateTab(tabs[next].dataset.tab);
    }));
    // Copy buttons
    panel.querySelectorAll('.btn-copy').forEach((btn) => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.copyTarget;
            if (!key || !CODE_SNIPPETS[key])
                return;
            navigator.clipboard.writeText(CODE_SNIPPETS[key]).then(() => {
                const original = btn.textContent;
                btn.textContent = i18n_1.i18n.t('copied');
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
        // Iframe mode (default)
        const iframe = document.getElementById('web-frame');
        applyZoom(iframe, zoom);
        detectBlocking(iframe, url, autoCloseSec);
        iframe.src = url;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUUsQ0FBQztZQUN2QixZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUM7Z0JBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hELENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILFlBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGOzs7R0FHRztBQUNILFNBQVMsS0FBSztJQUNaLDZDQUFnQyxHQUFFLENBQUM7SUFFbkMsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksT0FBTyxNQUFNLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRSxDQUFDO1FBQzFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMvQixDQUFDO1NBQU0sSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzdDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDO1NBQU0sQ0FBQztRQUNOLElBQUksRUFBRSxDQUFDO0lBQ1QsQ0FBQztBQUNILENBQUM7QUFFRCxLQUFLLEVBQUUsQ0FBQzs7Ozs7Ozs7OztBQ3R1QlIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvaTE4bi50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3NoYXJlZC9sb2dnZXIudHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy92aWV3ZXIvdmlld2VyLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvdmlld2VyL3ZpZXdlci5jc3M/N2Y4ZiJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyDilIDilIDilIAgU2V0dGluZyBrZXlzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFByZWZpeCBmb3IgcGVyLXNsaWRlIHNldHRpbmcga2V5cy4gRnVsbCBrZXk6IGB3ZWJwcHRfc2xpZGVfe3NsaWRlSWR9YC4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX1NMSURFX1BSRUZJWCA9ICd3ZWJwcHRfc2xpZGVfJztcclxuXHJcbi8qKiBLZXkgZm9yIHRoZSBzYXZlZCBVSSBsYW5ndWFnZS4gKi9cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdfS0VZX0xBTkdVQUdFID0gJ3dlYnBwdF9sYW5ndWFnZSc7XHJcblxyXG4vKiogS2V5IGZvciBnbG9iYWwgZGVmYXVsdCBzbGlkZSBjb25maWcuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9ERUZBVUxUUyA9ICd3ZWJwcHRfZGVmYXVsdHMnO1xyXG5cclxuLy8g4pSA4pSA4pSAIFZpZXdlciBkZWZhdWx0cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1pPT00gPSAxMDA7XHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0RJQUxPR19XSURUSCA9IDEwMDsgICAvLyAlIG9mIHNjcmVlblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9ESUFMT0dfSEVJR0hUID0gMTAwOyAgLy8gJSBvZiBzY3JlZW5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19PUEVOID0gdHJ1ZTtcclxuXHJcbi8vIOKUgOKUgOKUgCBDb25zdHJhaW50IHJhbmdlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBaT09NX01JTiA9IDUwO1xyXG5leHBvcnQgY29uc3QgWk9PTV9NQVggPSAzMDA7XHJcblxyXG4vLyDilIDilIDilIAgQXV0by1vcGVuIGRlbGF5IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19PUEVOX0RFTEFZX1NFQyA9IDA7ICAgLy8gMCA9IGltbWVkaWF0ZVxyXG5cclxuLyoqXHJcbiAqIE5vbi1saW5lYXIgbG9va3VwIHRhYmxlIGZvciB0aGUgYXV0by1vcGVuIGRlbGF5IHNsaWRlci5cclxuICogSW5kZXggPSBzbGlkZXIgcG9zaXRpb24sIHZhbHVlID0gc2Vjb25kcy5cclxuICogUmFuZ2U6IDDigJM2MHMuIEdyYW51bGFyaXR5OiAxcyB1cCB0byAxMHMsIHRoZW4gNXMgdXAgdG8gMzBzLCB0aGVuIDEwcyB1cCB0byA2MHMuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQVVUT19PUEVOX0RFTEFZX1NURVBTOiByZWFkb25seSBudW1iZXJbXSA9IFtcclxuICAvLyAw4oCTMTBzLCBzdGVwIDEgICgxMSB2YWx1ZXM6IGluZGljZXMgMOKAkzEwKVxyXG4gIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLFxyXG4gIC8vIDEw4oCTNjBzLCBzdGVwIDUgICgxMCB2YWx1ZXM6IGluZGljZXMgMTHigJMyMClcclxuICAxNSwgMjAsIDI1LCAzMCwgMzUsIDQwLCA0NSwgNTAsIDU1LCA2MCxcclxuICAvLyAx4oCTMyBtaW4sIHN0ZXAgMTVzICAoOCB2YWx1ZXM6IGluZGljZXMgMjHigJMyOClcclxuICA3NSwgOTAsIDEwNSwgMTIwLCAxMzUsIDE1MCwgMTY1LCAxODAsXHJcbiAgLy8gM+KAkzUgbWluLCBzdGVwIDMwcyAgKDQgdmFsdWVzOiBpbmRpY2VzIDI54oCTMzIpXHJcbiAgMjEwLCAyNDAsIDI3MCwgMzAwLFxyXG5dO1xyXG5cclxuLy8g4pSA4pSA4pSAIEF1dG8tY2xvc2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRPX0NMT1NFX1NFQyA9IDA7ICAgLy8gMCA9IGRpc2FibGVkXHJcbmV4cG9ydCBjb25zdCBBVVRPX0NMT1NFX01BWF9TRUMgPSAzNjAwO1xyXG5cclxuLyoqXHJcbiAqIE5vbi1saW5lYXIgbG9va3VwIHRhYmxlIGZvciB0aGUgYXV0by1jbG9zZSBzbGlkZXIuXHJcbiAqIEluZGV4ID0gc2xpZGVyIHBvc2l0aW9uLCB2YWx1ZSA9IHNlY29uZHMuXHJcbiAqIEdyYW51bGFyaXR5IGRlY3JlYXNlcyBhcyB2YWx1ZXMgZ3JvdzogMXMg4oaSIDVzIOKGkiAxNXMg4oaSIDMwcyDihpIgNjBzIOKGkiAzMDBzLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEFVVE9fQ0xPU0VfU1RFUFM6IHJlYWRvbmx5IG51bWJlcltdID0gW1xyXG4gIC8vIDDigJMxMHMsIHN0ZXAgMSAgKDExIHZhbHVlcylcclxuICAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCxcclxuICAvLyAxMOKAkzYwcywgc3RlcCA1ICAoMTAgdmFsdWVzKVxyXG4gIDE1LCAyMCwgMjUsIDMwLCAzNSwgNDAsIDQ1LCA1MCwgNTUsIDYwLFxyXG4gIC8vIDHigJMzIG1pbiwgc3RlcCAxNXMgICg4IHZhbHVlcylcclxuICA3NSwgOTAsIDEwNSwgMTIwLCAxMzUsIDE1MCwgMTY1LCAxODAsXHJcbiAgLy8gM+KAkzUgbWluLCBzdGVwIDMwcyAgKDQgdmFsdWVzKVxyXG4gIDIxMCwgMjQwLCAyNzAsIDMwMCxcclxuICAvLyA14oCTMTAgbWluLCBzdGVwIDYwcyAgKDUgdmFsdWVzKVxyXG4gIDM2MCwgNDIwLCA0ODAsIDU0MCwgNjAwLFxyXG4gIC8vIDEw4oCTNjAgbWluLCBzdGVwIDMwMHMgICgxMCB2YWx1ZXMpXHJcbiAgOTAwLCAxMjAwLCAxNTAwLCAxODAwLCAyMTAwLCAyNDAwLCAyNzAwLCAzMDAwLCAzMzAwLCAzNjAwLFxyXG5dO1xyXG5cclxuLy8g4pSA4pSA4pSAIEVycm9yIGhhbmRsaW5nIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NBVkVfTUFYX1JFVFJJRVMgPSAyO1xyXG5leHBvcnQgY29uc3QgU0VUVElOR1NfU0FWRV9SRVRSWV9ERUxBWV9NUyA9IDEwMDA7XHJcbmV4cG9ydCBjb25zdCBJRlJBTUVfTE9BRF9USU1FT1VUX01TID0gMTBfMDAwO1xyXG5leHBvcnQgY29uc3QgVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCA9IDYwO1xyXG5cclxuLyoqIFRydW5jYXRlIGEgVVJMIGZvciBkaXNwbGF5LCBhcHBlbmRpbmcgZWxsaXBzaXMgaWYgbmVlZGVkLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJ1bmNhdGVVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGlmICh1cmwubGVuZ3RoIDw9IFVSTF9ESVNQTEFZX01BWF9MRU5HVEgpIHJldHVybiB1cmw7XHJcbiAgcmV0dXJuIHVybC5zdWJzdHJpbmcoMCwgVVJMX0RJU1BMQVlfTUFYX0xFTkdUSCAtIDEpICsgJ1xcdTIwMjYnO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgRGVidWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogU2V0IHRvIGBmYWxzZWAgaW4gcHJvZHVjdGlvbiBidWlsZHMgdmlhIHdlYnBhY2sgRGVmaW5lUGx1Z2luLlxyXG4gKiBGYWxscyBiYWNrIHRvIGB0cnVlYCBzbyBkZXYvdGVzdCBydW5zIGFsd2F5cyBsb2cuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVCVUc6IGJvb2xlYW4gPVxyXG4gIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcHJvY2Vzcy5lbnYgIT09ICd1bmRlZmluZWQnXHJcbiAgICA/IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbidcclxuICAgIDogdHJ1ZTtcclxuIiwiaW1wb3J0IGxvY2FsZXNEYXRhIGZyb20gJy4uL2kxOG4vbG9jYWxlcy5qc29uJztcclxuXHJcbmV4cG9ydCB0eXBlIExvY2FsZSA9ICdlbicgfCAnemgnIHwgJ2VzJyB8ICdkZScgfCAnZnInIHwgJ2l0JyB8ICdhcicgfCAncHQnIHwgJ2hpJyB8ICdydSc7XHJcbmV4cG9ydCB0eXBlIFRyYW5zbGF0aW9uS2V5ID0ga2V5b2YgdHlwZW9mIGxvY2FsZXNEYXRhWydlbiddO1xyXG5cclxuLyoqIE1hcHMgYSBCQ1AgNDcgbGFuZ3VhZ2UgdGFnIHRvIGEgc3VwcG9ydGVkIExvY2FsZS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTG9jYWxlKGxhbmdUYWc6IHN0cmluZyk6IExvY2FsZSB7XHJcbiAgY29uc3QgdGFnID0gbGFuZ1RhZy50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnemgnKSkgcmV0dXJuICd6aCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdlcycpKSByZXR1cm4gJ2VzJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2RlJykpIHJldHVybiAnZGUnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnZnInKSkgcmV0dXJuICdmcic7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdpdCcpKSByZXR1cm4gJ2l0JztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2FyJykpIHJldHVybiAnYXInO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgncHQnKSkgcmV0dXJuICdwdCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdoaScpKSByZXR1cm4gJ2hpJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3J1JykpIHJldHVybiAncnUnO1xyXG4gIHJldHVybiAnZW4nO1xyXG59XHJcblxyXG5jbGFzcyBJMThuIHtcclxuICBwcml2YXRlIGxvY2FsZTogTG9jYWxlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGlzdGVuZXJzID0gbmV3IFNldDwoKSA9PiB2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMubG9jYWxlID0gdGhpcy5kZXRlY3RMb2NhbGUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGV0ZWN0TG9jYWxlKCk6IExvY2FsZSB7XHJcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiAnZW4nO1xyXG4gICAgcmV0dXJuIHBhcnNlTG9jYWxlKG5hdmlnYXRvci5sYW5ndWFnZSA/PyAnZW4nKTtcclxuICB9XHJcblxyXG4gIC8qKiBUcmFuc2xhdGUgYSBrZXkgaW4gdGhlIGN1cnJlbnQgbG9jYWxlLiBGYWxscyBiYWNrIHRvIEVuZ2xpc2gsIHRoZW4gdGhlIGtleSBpdHNlbGYuICovXHJcbiAgdChrZXk6IFRyYW5zbGF0aW9uS2V5KTogc3RyaW5nIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIGxvY2FsZXNEYXRhW3RoaXMubG9jYWxlXVtrZXldID8/XHJcbiAgICAgIGxvY2FsZXNEYXRhWydlbiddW2tleV0gPz9cclxuICAgICAga2V5XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZ2V0TG9jYWxlKCk6IExvY2FsZSB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2NhbGU7XHJcbiAgfVxyXG5cclxuICBnZXRBdmFpbGFibGVMb2NhbGVzKCk6IExvY2FsZVtdIHtcclxuICAgIHJldHVybiBbJ2VuJywgJ3poJywgJ2VzJywgJ2RlJywgJ2ZyJywgJ2l0JywgJ2FyJywgJ3B0JywgJ2hpJywgJ3J1J107XHJcbiAgfVxyXG5cclxuICAvKiogU3dpdGNoIGxvY2FsZSBhbmQgbm90aWZ5IGFsbCBsaXN0ZW5lcnMuICovXHJcbiAgc2V0TG9jYWxlKGxvY2FsZTogTG9jYWxlKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5sb2NhbGUgPT09IGxvY2FsZSkgcmV0dXJuO1xyXG4gICAgdGhpcy5sb2NhbGUgPSBsb2NhbGU7XHJcbiAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdWJzY3JpYmUgdG8gbG9jYWxlIGNoYW5nZXMuXHJcbiAgICogQHJldHVybnMgVW5zdWJzY3JpYmUgZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgb25Mb2NhbGVDaGFuZ2UobGlzdGVuZXI6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcclxuICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XHJcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBTaW5nbGV0b24gaTE4biBpbnN0YW5jZSBzaGFyZWQgYWNyb3NzIHRoZSBhZGQtaW4uICovXHJcbmV4cG9ydCBjb25zdCBpMThuID0gbmV3IEkxOG4oKTtcclxuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tICcuL2NvbnN0YW50cyc7XHJcblxyXG5jb25zdCBQUkVGSVggPSAnW1dlYlBQVF0nO1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xyXG5cclxuLyoqIExvZyBkZWJ1ZyBpbmZvIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0RlYnVnKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS5sb2coUFJFRklYLCAuLi5hcmdzKTtcclxufVxyXG5cclxuLyoqIExvZyB3YXJuaW5ncyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dXYXJuKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS53YXJuKFBSRUZJWCwgLi4uYXJncyk7XHJcbn1cclxuXHJcbi8qKiBMb2cgZXJyb3JzIOKAlCBuby1vcCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0Vycm9yKC4uLmFyZ3M6IHVua25vd25bXSk6IHZvaWQge1xyXG4gIGlmIChERUJVRykgY29uc29sZS5lcnJvcihQUkVGSVgsIC4uLmFyZ3MpO1xyXG59XHJcblxyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cclxuXHJcbi8qKlxyXG4gKiBJbnN0YWxsIGEgZ2xvYmFsIGhhbmRsZXIgZm9yIHVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbnMuXHJcbiAqIENhbGwgb25jZSBwZXIgZW50cnkgcG9pbnQgKHRhc2twYW5lLCB2aWV3ZXIsIGNvbW1hbmRzKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlcigpOiB2b2lkIHtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgKGV2ZW50OiBQcm9taXNlUmVqZWN0aW9uRXZlbnQpID0+IHtcclxuICAgIGxvZ0Vycm9yKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb246JywgZXZlbnQucmVhc29uKTtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaTE4biwgcGFyc2VMb2NhbGUsIHR5cGUgVHJhbnNsYXRpb25LZXkgfSBmcm9tICcuLi9zaGFyZWQvaTE4bic7XHJcbmltcG9ydCB7IFpPT01fTUlOLCBaT09NX01BWCwgREVGQVVMVF9aT09NLCBJRlJBTUVfTE9BRF9USU1FT1VUX01TLCBBVVRPX0NMT1NFX01BWF9TRUMsIHRydW5jYXRlVXJsIH0gZnJvbSAnLi4vc2hhcmVkL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7IGxvZ0RlYnVnLCBsb2dFcnJvciwgaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIgfSBmcm9tICcuLi9zaGFyZWQvbG9nZ2VyJztcclxuXHJcbi8vIOKUgOKUgOKUgCBDb2RlIHNuaXBwZXRzIGZvciB0aGUgb3duLXNpdGUgZ3VpZGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5jb25zdCBDT0RFX1NOSVBQRVRTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gIG5naW54OiAnYWRkX2hlYWRlciBDb250ZW50LVNlY3VyaXR5LVBvbGljeSBcImZyYW1lLWFuY2VzdG9ycyAqXCI7JyxcclxuICBhcGFjaGU6XHJcbiAgICAnSGVhZGVyIHNldCBDb250ZW50LVNlY3VyaXR5LVBvbGljeSBcImZyYW1lLWFuY2VzdG9ycyAqXCJcXG5IZWFkZXIgdW5zZXQgWC1GcmFtZS1PcHRpb25zJyxcclxuICBleHByZXNzOiBgYXBwLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcclxuICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVNlY3VyaXR5LVBvbGljeScsICdmcmFtZS1hbmNlc3RvcnMgKicpO1xyXG4gIHJlcy5yZW1vdmVIZWFkZXIoJ1gtRnJhbWUtT3B0aW9ucycpO1xyXG4gIG5leHQoKTtcclxufSk7YCxcclxufTtcclxuXHJcbi8vIOKUgOKUgOKUgCBNZXNzYWdlIHByb3RvY29sIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxudHlwZSBWaWV3ZXJNZXNzYWdlVHlwZSA9ICdyZWFkeScgfCAnbG9hZGVkJyB8ICdibG9ja2VkJyB8ICdlcnJvcicgfCAnY2xvc2UnO1xyXG5cclxuaW50ZXJmYWNlIFZpZXdlck1lc3NhZ2Uge1xyXG4gIHR5cGU6IFZpZXdlck1lc3NhZ2VUeXBlO1xyXG4gIHVybD86IHN0cmluZztcclxuICBlcnJvcj86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIFNlbmQgYSBzdHJ1Y3R1cmVkIG1lc3NhZ2UgdG8gdGhlIFRhc2sgUGFuZSBob3N0IHZpYSBPZmZpY2UuanMuXHJcbiAqIFNpbGVudCBuby1vcCB3aGVuIHJ1bm5pbmcgb3V0c2lkZSBhbiBPZmZpY2UgY29udGV4dCAoc3RhbmRhbG9uZSBicm93c2VyKS5cclxuICovXHJcbmZ1bmN0aW9uIHNlbmRUb1BhcmVudChtc2c6IFZpZXdlck1lc3NhZ2UpOiB2b2lkIHtcclxuICB0cnkge1xyXG4gICAgT2ZmaWNlLmNvbnRleHQudWkubWVzc2FnZVBhcmVudChKU09OLnN0cmluZ2lmeShtc2cpKTtcclxuICB9IGNhdGNoIHtcclxuICAgIC8vIE5vdCBpbiBhbiBPZmZpY2UgZGlhbG9nIGNvbnRleHQg4oCUIGlnbm9yZSAoc3RhbmRhbG9uZSBicm93c2VyIHRlc3QpXHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgUXVlcnkgcGFyYW1ldGVyIHBhcnNpbmcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG50eXBlIEhpZGVNZXRob2QgPSAnbm9uZScgfCAnbW92ZScgfCAncmVzaXplJztcclxuXHJcbmludGVyZmFjZSBWaWV3ZXJQYXJhbXMge1xyXG4gIHVybDogc3RyaW5nO1xyXG4gIHpvb206IG51bWJlcjtcclxuICBsYW5nOiBzdHJpbmc7XHJcbiAgYXV0b0Nsb3NlU2VjOiBudW1iZXI7XHJcbiAgc2xpZGVzaG93OiBib29sZWFuO1xyXG4gIGhpZGVNZXRob2Q6IEhpZGVNZXRob2Q7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlUGFyYW1zKCk6IFZpZXdlclBhcmFtcyB7XHJcbiAgY29uc3QgcCA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcblxyXG4gIGNvbnN0IHVybCA9IHAuZ2V0KCd1cmwnKSA/PyAnJztcclxuXHJcbiAgY29uc3QgcmF3Wm9vbSA9IHBhcnNlSW50KHAuZ2V0KCd6b29tJykgPz8gU3RyaW5nKERFRkFVTFRfWk9PTSksIDEwKTtcclxuICBjb25zdCB6b29tID0gaXNOYU4ocmF3Wm9vbSlcclxuICAgID8gREVGQVVMVF9aT09NXHJcbiAgICA6IE1hdGgubWluKFpPT01fTUFYLCBNYXRoLm1heChaT09NX01JTiwgcmF3Wm9vbSkpO1xyXG5cclxuICBjb25zdCBsYW5nID0gcC5nZXQoJ2xhbmcnKSA/P1xyXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnID8gbmF2aWdhdG9yLmxhbmd1YWdlIDogJ2VuJyk7XHJcblxyXG4gIGNvbnN0IHJhd0F1dG9DbG9zZSA9IHBhcnNlSW50KHAuZ2V0KCdhdXRvY2xvc2UnKSA/PyAnMCcsIDEwKTtcclxuICBjb25zdCBhdXRvQ2xvc2VTZWMgPSBpc05hTihyYXdBdXRvQ2xvc2UpXHJcbiAgICA/IDBcclxuICAgIDogTWF0aC5taW4oQVVUT19DTE9TRV9NQVhfU0VDLCBNYXRoLm1heCgwLCByYXdBdXRvQ2xvc2UpKTtcclxuXHJcbiAgY29uc3Qgc2xpZGVzaG93ID0gcC5nZXQoJ3NsaWRlc2hvdycpID09PSAnMSc7XHJcblxyXG4gIGNvbnN0IHJhd0hpZGUgPSBwLmdldCgnaGlkZScpID8/ICdub25lJztcclxuICBjb25zdCBoaWRlTWV0aG9kOiBIaWRlTWV0aG9kID0gKHJhd0hpZGUgPT09ICdtb3ZlJyB8fCByYXdIaWRlID09PSAncmVzaXplJykgPyByYXdIaWRlIDogJ25vbmUnO1xyXG5cclxuICByZXR1cm4geyB1cmwsIHpvb20sIGxhbmcsIGF1dG9DbG9zZVNlYywgc2xpZGVzaG93LCBoaWRlTWV0aG9kIH07XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBpMThuIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFJlcGxhY2UgdGV4dENvbnRlbnQgb2YgZXZlcnkgW2RhdGEtaTE4bl0gZWxlbWVudCB3aXRoIHRoZSB0cmFuc2xhdGVkIHN0cmluZy4gKi9cclxuZnVuY3Rpb24gYXBwbHlJMThuKCk6IHZvaWQge1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCdbZGF0YS1pMThuXScpLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICBjb25zdCBrZXkgPSBlbC5kYXRhc2V0LmkxOG4gYXMgVHJhbnNsYXRpb25LZXk7XHJcbiAgICBlbC50ZXh0Q29udGVudCA9IGkxOG4udChrZXkpO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgWm9vbSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKlxyXG4gKiBTY2FsZSB0aGUgaWZyYW1lIGJ5IGB6b29tYCUgdXNpbmcgQ1NTIHRyYW5zZm9ybSB3aGlsZSBrZWVwaW5nIGl0IGZ1bGwtc2NyZWVuLlxyXG4gKiBDb21wZW5zYXRlZCB3aWR0aC9oZWlnaHQgZW5zdXJlIHRoZSB2aWV3cG9ydCBpcyBhbHdheXMgY292ZXJlZC5cclxuICpcclxuICogICB6b29tID0gMTUwIOKGkiBjb250ZW50IGlzIDE1MCUgc2l6ZSAoem9vbWVkIGluLCBzaG93cyBsZXNzIGNvbnRlbnQpXHJcbiAqICAgem9vbSA9IDc1ICDihpIgY29udGVudCBpcyA3NSUgc2l6ZSAgKHpvb21lZCBvdXQsIHNob3dzIG1vcmUgY29udGVudClcclxuICovXHJcbmZ1bmN0aW9uIGFwcGx5Wm9vbShpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50LCB6b29tOiBudW1iZXIpOiB2b2lkIHtcclxuICBpZiAoem9vbSA9PT0gREVGQVVMVF9aT09NKSByZXR1cm47IC8vIENTUyBkZWZhdWx0cyBhbHJlYWR5IGNvdmVyIDEwMCVcclxuICBjb25zdCBmYWN0b3IgPSB6b29tIC8gMTAwO1xyXG4gIGlmcmFtZS5zdHlsZS53aWR0aCA9IGAkezEwMCAvIGZhY3Rvcn12d2A7XHJcbiAgaWZyYW1lLnN0eWxlLmhlaWdodCA9IGAkezEwMCAvIGZhY3Rvcn12aGA7XHJcbiAgaWZyYW1lLnN0eWxlLnRyYW5zZm9ybSA9IGBzY2FsZSgke2ZhY3Rvcn0pYDtcclxuICBpZnJhbWUuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJ3RvcCBsZWZ0JztcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIElmcmFtZSBibG9ja2luZyBkZXRlY3Rpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5cclxuLyoqXHJcbiAqIERldGVjdHMgd2hldGhlciB0aGUgdGFyZ2V0IHNpdGUgYmxvY2tzIGlmcmFtZSBlbWJlZGRpbmcuXHJcbiAqXHJcbiAqIFN0cmF0ZWd5OlxyXG4gKiAgMS4gTGlzdGVuIGZvciB0aGUgaWZyYW1lIGBsb2FkYCBldmVudC5cclxuICogIDIuIE9uIGxvYWQsIHRyeSB0byByZWFkIGBjb250ZW50RG9jdW1lbnRgOlxyXG4gKiAgICAgLSBTZWN1cml0eUVycm9yIChjcm9zcy1vcmlnaW4pIOKGkiBzaXRlIGxvYWRlZCBub3JtYWxseS5cclxuICogICAgIC0gTm8gZXJyb3IgKyBkb2N1bWVudCBVUkwgaXMgYGFib3V0OmJsYW5rYCDihpIgYnJvd3NlciBzaWxlbnRseSBibG9ja2VkXHJcbiAqICAgICAgIGR1ZSB0byBYLUZyYW1lLU9wdGlvbnMgLyBDU1AgZnJhbWUtYW5jZXN0b3JzLlxyXG4gKiAgMy4gSWYgYGxvYWRgIG5ldmVyIGZpcmVzIHdpdGhpbiBJRlJBTUVfTE9BRF9USU1FT1VUX01TIOKGkiBzbG93IG5ldHdvcmsuXHJcbiAqXHJcbiAqIElNUE9SVEFOVDogTmV2ZXIgdXNlIGB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybGAgdG8gYXV0by1uYXZpZ2F0ZS5cclxuICogVGhhdCBkZXN0cm95cyB0aGUgdmlld2VyIHBhZ2UgKG1lc3NhZ2VDaGlsZCBsaXN0ZW5lciwgY291bnRkb3duIHRpbWVyLFxyXG4gKiBzdGFuZGJ5IG92ZXJsYXkpIG1ha2luZyBzbGlkZXNob3cgbmF2aWdhdGlvbiBpbXBvc3NpYmxlLlxyXG4gKi9cclxuZnVuY3Rpb24gZGV0ZWN0QmxvY2tpbmcoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCwgdXJsOiBzdHJpbmcsIGF1dG9DbG9zZVNlYzogbnVtYmVyKTogdm9pZCB7XHJcbiAgbGV0IGxvYWRGaXJlZCA9IGZhbHNlO1xyXG5cclxuICBpZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcclxuICAgIGxvYWRGaXJlZCA9IHRydWU7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBkb2MgPSBpZnJhbWUuY29udGVudERvY3VtZW50O1xyXG4gICAgICAvLyBXaGVuIGJsb2NrZWQgYnkgWC1GcmFtZS1PcHRpb25zL0NTUCwgYnJvd3NlcnMgcmVkaXJlY3QgaWZyYW1lIHRvIGFib3V0OmJsYW5rLlxyXG4gICAgICAvLyBDaGVjayBmb3IgYWJvdXQ6YmxhbmsgVVJMIHJhdGhlciB0aGFuIGVtcHR5IGJvZHkgKGF2b2lkcyBmYWxzZSBwb3NpdGl2ZXNcclxuICAgICAgLy8gd2l0aCBTUEFzIHRoYXQgcmVuZGVyIGFzeW5jaHJvbm91c2x5IGFmdGVyIHRoZSBsb2FkIGV2ZW50KS5cclxuICAgICAgY29uc3QgaXNCbG9ja2VkID0gIWRvYyB8fCBkb2MuVVJMID09PSAnYWJvdXQ6YmxhbmsnIHx8IGRvYy5VUkwgPT09ICcnO1xyXG4gICAgICBpZiAoaXNCbG9ja2VkKSB7XHJcbiAgICAgICAgbG9nRGVidWcoJ0lmcmFtZSBibG9ja2VkIChhYm91dDpibGFuayBkZXRlY3RlZCkgZm9yOicsIHVybCk7XHJcbiAgICAgICAgc2hvd0Jsb2NrZWRVSSh1cmwpO1xyXG4gICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdibG9ja2VkJywgdXJsIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdsb2FkZWQnLCB1cmwgfSk7XHJcbiAgICAgICAgaWYgKGF1dG9DbG9zZVNlYyA+IDApIHN0YXJ0Q291bnRkb3duKGF1dG9DbG9zZVNlYyk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvLyBTZWN1cml0eUVycm9yOiBjcm9zcy1vcmlnaW4gY29udGVudCBsb2FkZWQgc3VjY2Vzc2Z1bGx5XHJcbiAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdsb2FkZWQnLCB1cmwgfSk7XHJcbiAgICAgIGlmIChhdXRvQ2xvc2VTZWMgPiAwKSBzdGFydENvdW50ZG93bihhdXRvQ2xvc2VTZWMpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIGlmICghbG9hZEZpcmVkKSB7XHJcbiAgICAgIC8vIFRpbWVvdXQ6IHRoZSBzaXRlIGlzIHByb2JhYmx5IGp1c3Qgc2xvdy4gU2hvdyB0aW1lb3V0IFVJIGJ1dCBkbyBOT1RcclxuICAgICAgLy8gbmF2aWdhdGUgYXdheSDigJQgdGhlIHZpZXdlciBtdXN0IHN0YXkgYWxpdmUgZm9yIHNsaWRlc2hvdyBjb21tdW5pY2F0aW9uLlxyXG4gICAgICBsb2dEZWJ1ZygnSWZyYW1lIGxvYWQgdGltZW91dCBmb3I6JywgdXJsKTtcclxuICAgICAgc2hvd1RpbWVvdXRVSSh1cmwpO1xyXG4gICAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnZXJyb3InLCB1cmwsIGVycm9yOiAndGltZW91dCcgfSk7XHJcbiAgICB9XHJcbiAgfSwgSUZSQU1FX0xPQURfVElNRU9VVF9NUyk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBVSSBzdGF0ZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIHNob3dCbG9ja2VkVUkodXJsOiBzdHJpbmcpOiB2b2lkIHtcclxuICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lmcmFtZS13cmFwcGVyJyk7XHJcbiAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdibG9ja2VkLW92ZXJsYXknKTtcclxuXHJcbiAgaWYgKHdyYXBwZXIpIHdyYXBwZXIuaGlkZGVuID0gdHJ1ZTtcclxuICBpZiAob3ZlcmxheSkgb3ZlcmxheS5oaWRkZW4gPSBmYWxzZTtcclxuXHJcbiAgaW5pdEJsb2NrZWRBY3Rpb25zKHVybCk7XHJcbiAgaW5pdEd1aWRlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3dOb1VybFVJKCk6IHZvaWQge1xyXG4gIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZyYW1lLXdyYXBwZXInKTtcclxuICBjb25zdCBtc2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm8tdXJsLW1lc3NhZ2UnKTtcclxuXHJcbiAgaWYgKHdyYXBwZXIpIHdyYXBwZXIuaGlkZGVuID0gdHJ1ZTtcclxuICBpZiAobXNnKSBtc2cuaGlkZGVuID0gZmFsc2U7XHJcbn1cclxuXHJcbi8qKiBTaG93IGEgdGltZW91dCBtZXNzYWdlIHdoZW4gdGhlIGlmcmFtZSBmYWlscyB0byBsb2FkIHdpdGhpbiB0aGUgYWxsb3dlZCB0aW1lLiAqL1xyXG5mdW5jdGlvbiBzaG93VGltZW91dFVJKHVybDogc3RyaW5nKTogdm9pZCB7XHJcbiAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnJhbWUtd3JhcHBlcicpO1xyXG4gIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmxvY2tlZC1vdmVybGF5Jyk7XHJcblxyXG4gIGlmICh3cmFwcGVyKSB3cmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgaWYgKG92ZXJsYXkpIHtcclxuICAgIG92ZXJsYXkuaGlkZGVuID0gZmFsc2U7XHJcbiAgICAvLyBSZXVzZSB0aGUgYmxvY2tlZCBvdmVybGF5IGJ1dCBjaGFuZ2UgdGhlIGhlYWRpbmcgdGV4dCB0byB0aW1lb3V0IG1lc3NhZ2VcclxuICAgIGNvbnN0IGhlYWRpbmcgPSBvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWkxOG49XCJpZnJhbWVCbG9ja2VkXCJdJyk7XHJcbiAgICBpZiAoaGVhZGluZykgaGVhZGluZy50ZXh0Q29udGVudCA9IGkxOG4udCgnbG9hZFRpbWVvdXQnKTtcclxuICAgIGNvbnN0IGhpbnQgPSBvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWkxOG49XCJpZnJhbWVCbG9ja2VkSGludFwiXScpO1xyXG4gICAgaWYgKGhpbnQpIGhpbnQudGV4dENvbnRlbnQgPSBpMThuLnQoJ25vSW50ZXJuZXQnKTtcclxuICB9XHJcblxyXG4gIGluaXRCbG9ja2VkQWN0aW9ucyh1cmwpO1xyXG59XHJcblxyXG4vKiogU2hvdyBhbiBvZmZsaW5lIG1lc3NhZ2UuIENhbGxlZCB3aGVuIG5hdmlnYXRvci5vbkxpbmUgaXMgZmFsc2UuICovXHJcbmZ1bmN0aW9uIHNob3dPZmZsaW5lVUkoKTogdm9pZCB7XHJcbiAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnJhbWUtd3JhcHBlcicpO1xyXG4gIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmxvY2tlZC1vdmVybGF5Jyk7XHJcblxyXG4gIGlmICh3cmFwcGVyKSB3cmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgaWYgKG92ZXJsYXkpIHtcclxuICAgIG92ZXJsYXkuaGlkZGVuID0gZmFsc2U7XHJcbiAgICBjb25zdCBoZWFkaW5nID0gb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1pMThuPVwiaWZyYW1lQmxvY2tlZFwiXScpO1xyXG4gICAgaWYgKGhlYWRpbmcpIGhlYWRpbmcudGV4dENvbnRlbnQgPSBpMThuLnQoJ25vSW50ZXJuZXQnKTtcclxuICAgIGNvbnN0IGhpbnQgPSBvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWkxOG49XCJpZnJhbWVCbG9ja2VkSGludFwiXScpO1xyXG4gICAgaWYgKGhpbnQpIGhpbnQudGV4dENvbnRlbnQgPSAnJztcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBUb29sYmFyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gaW5pdFRvb2xiYXIodXJsOiBzdHJpbmcpOiB2b2lkIHtcclxuICBjb25zdCB1cmxMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sYmFyLXVybCcpO1xyXG4gIGlmICh1cmxMYWJlbCkge1xyXG4gICAgdXJsTGFiZWwudGV4dENvbnRlbnQgPSB0cnVuY2F0ZVVybCh1cmwpO1xyXG4gICAgdXJsTGFiZWwudGl0bGUgPSB1cmw7IC8vIGZ1bGwgVVJMIGluIHRvb2x0aXBcclxuICB9XHJcblxyXG4gIC8vIENsb3NlIOKAlCBtZXNzYWdlIGhvc3Q7IGZhbGxiYWNrIHRvIHdpbmRvdy5jbG9zZSgpIGZvciBzdGFuZGFsb25lXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdjbG9zZScgfSk7XHJcbiAgICB0cnkgeyB3aW5kb3cuY2xvc2UoKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIE9wZW4gY3VycmVudCBVUkwgaW4gYSBuZXcgYnJvd3NlciB0YWJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLW9wZW4tYnJvd3NlcicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycsICdub29wZW5lcixub3JlZmVycmVyJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFwiU2hvdyBzZXR1cCBndWlkZVwiIGJ1dHRvbiBpcyBoYW5kbGVkIGJ5IGluaXRHdWlkZSgpIHdoZW4gdGhlIGJsb2NrZWQgb3ZlcmxheSBpcyBzaG93bi5cclxuXHJcbiAgLy8g4pSA4pSAIEhvdmVyIHJldmVhbCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuICAvLyBTaG93IHRvb2xiYXIgd2hlbiBtb3VzZSBlbnRlcnMgdG9wIDQwIHB4OyBoaWRlIGFmdGVyIGEgc2hvcnQgZGVsYXkgb24gbGVhdmUuXHJcbiAgY29uc3QgdG9vbGJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sYmFyJykgYXMgSFRNTEVsZW1lbnQ7XHJcbiAgbGV0IGhpZGVUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcclxuXHJcbiAgY29uc3Qgc2hvdyA9ICgpOiB2b2lkID0+IHtcclxuICAgIGlmIChoaWRlVGltZXIpIHsgY2xlYXJUaW1lb3V0KGhpZGVUaW1lcik7IGhpZGVUaW1lciA9IG51bGw7IH1cclxuICAgIHRvb2xiYXIuY2xhc3NMaXN0LmFkZCgndmlzaWJsZScpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHNjaGVkdWxlSGlkZSA9ICgpOiB2b2lkID0+IHtcclxuICAgIGhpZGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdG9vbGJhci5jbGFzc0xpc3QucmVtb3ZlKCd2aXNpYmxlJyksIDQwMCk7XHJcbiAgfTtcclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgIGlmIChlLmNsaWVudFkgPCA0MCkge1xyXG4gICAgICBzaG93KCk7XHJcbiAgICB9IGVsc2UgaWYgKCF0b29sYmFyLm1hdGNoZXMoJzpob3ZlcicpKSB7XHJcbiAgICAgIHNjaGVkdWxlSGlkZSgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICB0b29sYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBzaG93KTtcclxuICB0b29sYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBzY2hlZHVsZUhpZGUpO1xyXG5cclxuICAvLyBLZXlib2FyZDogcmV2ZWFsIHRvb2xiYXIgd2hlbiBmb2N1cyBlbnRlcnMgaXRcclxuICB0b29sYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBzaG93KTtcclxuICB0b29sYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0Jywgc2NoZWR1bGVIaWRlKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEJsb2NrZWQtb3ZlcmxheSBhY3Rpb25zIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFdpcmUgdGhlIHR3byBhY3Rpb24gYnV0dG9ucyBpbnNpZGUgdGhlIGJsb2NrZWQgb3ZlcmxheS4gKi9cclxuZnVuY3Rpb24gaW5pdEJsb2NrZWRBY3Rpb25zKHVybDogc3RyaW5nKTogdm9pZCB7XHJcbiAgLy8gXCJPcGVuIGRpcmVjdGx5XCIg4oCUIG5hdmlnYXRlIHRoZSB2aWV3ZXIgd2luZG93IGl0c2VsZiB0byB0aGUgdGFyZ2V0IFVSTC5cclxuICAvLyBXb3JrcyBiZWNhdXNlIGRpc3BsYXlEaWFsb2dBc3luYyBvcGVucyBhIHJlYWwgYnJvd3NlciB3aW5kb3cuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1uYXZpZ2F0ZS1kaXJlY3QnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcclxuICB9KTtcclxuXHJcbiAgLy8gXCJPcGVuIGluIGJyb3dzZXJcIiDigJQgb3BlbiBpbiBhIG5ldyBzeXN0ZW0gYnJvd3NlciB0YWIuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1vcGVuLWV4dGVybmFsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJywgJ25vb3BlbmVyLG5vcmVmZXJyZXInKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIE93bi1zaXRlIGd1aWRlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqIFNldCB1cCB0aGUgY29sbGFwc2libGUgZ3VpZGUgcGFuZWw6IHRvZ2dsZSwgdGFicywgY29weSBidXR0b25zLiAqL1xyXG5mdW5jdGlvbiBpbml0R3VpZGUoKTogdm9pZCB7XHJcbiAgY29uc3QgdG9nZ2xlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi10b2dnbGUtZ3VpZGUnKTtcclxuICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdndWlkZS1wYW5lbCcpO1xyXG4gIGlmICghdG9nZ2xlQnRuIHx8ICFwYW5lbCkgcmV0dXJuO1xyXG5cclxuICAvLyBUb2dnbGUgdmlzaWJpbGl0eVxyXG4gIHRvZ2dsZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNvbnN0IG9wZW5pbmcgPSBwYW5lbC5oaWRkZW47XHJcbiAgICBwYW5lbC5oaWRkZW4gPSAhb3BlbmluZztcclxuICAgIHRvZ2dsZUJ0bi50ZXh0Q29udGVudCA9IGkxOG4udChvcGVuaW5nID8gJ2hpZGVTZXR1cEd1aWRlJyA6ICdzaG93U2V0dXBHdWlkZScpO1xyXG4gICAgdG9nZ2xlQnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuaW5nKSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFRhYiBzd2l0Y2hpbmdcclxuICBjb25zdCB0YWJzID0gQXJyYXkuZnJvbShwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmd1aWRlLXRhYicpKTtcclxuICBjb25zdCBjb2RlUGFuZWxzID0gcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5ndWlkZS1jb2RlJyk7XHJcblxyXG4gIGZ1bmN0aW9uIGFjdGl2YXRlVGFiKHRhcmdldDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0YWJzLmZvckVhY2goKHQpID0+IHtcclxuICAgICAgY29uc3QgaXNBY3RpdmUgPSB0LmRhdGFzZXQudGFiID09PSB0YXJnZXQ7XHJcbiAgICAgIHQuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgaXNBY3RpdmUpO1xyXG4gICAgICB0LnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIFN0cmluZyhpc0FjdGl2ZSkpO1xyXG4gICAgICAodCBhcyBIVE1MRWxlbWVudCkudGFiSW5kZXggPSBpc0FjdGl2ZSA/IDAgOiAtMTtcclxuICAgICAgaWYgKGlzQWN0aXZlKSAodCBhcyBIVE1MRWxlbWVudCkuZm9jdXMoKTtcclxuICAgIH0pO1xyXG4gICAgY29kZVBhbmVscy5mb3JFYWNoKChwKSA9PiB7XHJcbiAgICAgIHAuaGlkZGVuID0gcC5kYXRhc2V0LnRhYlBhbmVsICE9PSB0YXJnZXQ7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHRhYnMuZm9yRWFjaCgodGFiKSA9PiB7XHJcbiAgICB0YWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBhY3RpdmF0ZVRhYih0YWIuZGF0YXNldC50YWIhKSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEFycm93IGtleSBuYXZpZ2F0aW9uIGZvciB0YWJzXHJcbiAgcGFuZWwucXVlcnlTZWxlY3RvcignLmd1aWRlLXRhYnMnKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsICgoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xyXG4gICAgY29uc3QgY3VycmVudCA9IHRhYnMuZmluZEluZGV4KCh0KSA9PiB0LmdldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcpID09PSAndHJ1ZScpO1xyXG4gICAgbGV0IG5leHQgPSAtMTtcclxuXHJcbiAgICBpZiAoZS5rZXkgPT09ICdBcnJvd1JpZ2h0JykgbmV4dCA9IChjdXJyZW50ICsgMSkgJSB0YWJzLmxlbmd0aDtcclxuICAgIGVsc2UgaWYgKGUua2V5ID09PSAnQXJyb3dMZWZ0JykgbmV4dCA9IChjdXJyZW50IC0gMSArIHRhYnMubGVuZ3RoKSAlIHRhYnMubGVuZ3RoO1xyXG4gICAgZWxzZSBpZiAoZS5rZXkgPT09ICdIb21lJykgbmV4dCA9IDA7XHJcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gJ0VuZCcpIG5leHQgPSB0YWJzLmxlbmd0aCAtIDE7XHJcbiAgICBlbHNlIHJldHVybjtcclxuXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBhY3RpdmF0ZVRhYih0YWJzW25leHRdLmRhdGFzZXQudGFiISk7XHJcbiAgfSkgYXMgRXZlbnRMaXN0ZW5lcik7XHJcblxyXG4gIC8vIENvcHkgYnV0dG9uc1xyXG4gIHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEJ1dHRvbkVsZW1lbnQ+KCcuYnRuLWNvcHknKS5mb3JFYWNoKChidG4pID0+IHtcclxuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3Qga2V5ID0gYnRuLmRhdGFzZXQuY29weVRhcmdldDtcclxuICAgICAgaWYgKCFrZXkgfHwgIUNPREVfU05JUFBFVFNba2V5XSkgcmV0dXJuO1xyXG5cclxuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoQ09ERV9TTklQUEVUU1trZXldKS50aGVuKCgpID0+IHtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbCA9IGJ0bi50ZXh0Q29udGVudDtcclxuICAgICAgICBidG4udGV4dENvbnRlbnQgPSBpMThuLnQoJ2NvcGllZCcpO1xyXG4gICAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCdjb3BpZWQnKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGJ0bi50ZXh0Q29udGVudCA9IG9yaWdpbmFsO1xyXG4gICAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2NvcGllZCcpO1xyXG4gICAgICAgIH0sIDE1MDApO1xyXG4gICAgICB9KS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgICAgLy8gQ2xpcGJvYXJkIEFQSSBub3QgYXZhaWxhYmxlIOKAlCBzZWxlY3QgdGV4dCBpbiB0aGUgPHByZT4gYXMgZmFsbGJhY2tcclxuICAgICAgICBjb25zdCBwcmUgPSBidG4ucGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcigncHJlJyk7XHJcbiAgICAgICAgaWYgKHByZSkge1xyXG4gICAgICAgICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKHByZSk7XHJcbiAgICAgICAgICBjb25zdCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICBzZWw/LnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgICAgICAgc2VsPy5hZGRSYW5nZShyYW5nZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgSW1hZ2UgbW9kZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmNvbnN0IElNQUdFX0VYVEVOU0lPTlMgPSAvXFwuKHBuZ3xqcGU/Z3xnaWZ8d2VicHxzdmcpJC9pO1xyXG5cclxuLyoqIENoZWNrIGlmIGEgVVJMIHBvaW50cyB0byBhbiBpbWFnZSBmaWxlIGJ5IGl0cyBwYXRobmFtZSBleHRlbnNpb24uICovXHJcbmZ1bmN0aW9uIGlzSW1hZ2VVcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIElNQUdFX0VYVEVOU0lPTlMudGVzdChuZXcgVVJMKHVybCkucGF0aG5hbWUpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEFkZCBhIGNhY2hlLWJ1c3RpbmcgcGFyYW1ldGVyIHRvIGZvcmNlIGZyZXNoIGltYWdlIGxvYWRzLiAqL1xyXG5mdW5jdGlvbiBjYWNoZUJ1c3QodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IHNlcGFyYXRvciA9IHVybC5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nO1xyXG4gIHJldHVybiBgJHt1cmx9JHtzZXBhcmF0b3J9X3Q9JHtEYXRlLm5vdygpfWA7XHJcbn1cclxuXHJcbi8qKiBBcHBseSB6b29tIHRvIHRoZSBpbWFnZSBlbGVtZW50IHVzaW5nIENTUyB0cmFuc2Zvcm0uICovXHJcbmZ1bmN0aW9uIGFwcGx5SW1hZ2Vab29tKGltZzogSFRNTEltYWdlRWxlbWVudCwgem9vbTogbnVtYmVyKTogdm9pZCB7XHJcbiAgaWYgKHpvb20gPT09IERFRkFVTFRfWk9PTSkgcmV0dXJuO1xyXG4gIGNvbnN0IGZhY3RvciA9IHpvb20gLyAxMDA7XHJcbiAgaW1nLnN0eWxlLnRyYW5zZm9ybSA9IGBzY2FsZSgke2ZhY3Rvcn0pYDtcclxuICBpbWcuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJ2NlbnRlciBjZW50ZXInO1xyXG59XHJcblxyXG4vKiogSW5pdGlhbGl6ZSBpbWFnZSBtb2RlOiBkaXNwbGF5IGEgc3RhdGljIGltYWdlIGluc3RlYWQgb2YgYW4gaWZyYW1lLiAqL1xyXG5mdW5jdGlvbiBpbml0SW1hZ2VNb2RlKHVybDogc3RyaW5nLCB6b29tOiBudW1iZXIsIGF1dG9DbG9zZVNlYzogbnVtYmVyKTogdm9pZCB7XHJcbiAgY29uc3QgaWZyYW1lV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnJhbWUtd3JhcHBlcicpO1xyXG4gIGNvbnN0IGltYWdlV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbWFnZS13cmFwcGVyJyk7XHJcbiAgY29uc3QgaW1nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltYWdlLWZyYW1lJykgYXMgSFRNTEltYWdlRWxlbWVudDtcclxuXHJcbiAgaWYgKGlmcmFtZVdyYXBwZXIpIGlmcmFtZVdyYXBwZXIuaGlkZGVuID0gdHJ1ZTtcclxuICBpZiAoaW1hZ2VXcmFwcGVyKSBpbWFnZVdyYXBwZXIuaGlkZGVuID0gZmFsc2U7XHJcblxyXG4gIGFwcGx5SW1hZ2Vab29tKGltZywgem9vbSk7XHJcblxyXG4gIGltZy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgbG9nRGVidWcoJ0ltYWdlIGxvYWRlZDonLCB1cmwpO1xyXG4gICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2xvYWRlZCcsIHVybCB9KTtcclxuXHJcbiAgICAvLyBSZXR1cm4gZm9jdXMgdG8gUG93ZXJQb2ludCBzbyB0aGUgY2xpY2tlci9yZW1vdGUgd29ya3MuXHJcbiAgICAvLyBUaGUgaW1hZ2Ugc3RheXMgdmlzaWJsZSBpbiB0aGUgZGlhbG9nIHdpbmRvdy5cclxuICAgIC8vIFNtYWxsIGRlbGF5IGVuc3VyZXMgdGhlIGRpYWxvZyBoYXMgZmluaXNoZWQgcmVuZGVyaW5nLlxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRyeSB7IHdpbmRvdy5ibHVyKCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfSwgMzAwKTtcclxuXHJcbiAgICBpZiAoYXV0b0Nsb3NlU2VjID4gMCkgc3RhcnRDb3VudGRvd24oYXV0b0Nsb3NlU2VjKTtcclxuICB9KTtcclxuXHJcbiAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4ge1xyXG4gICAgbG9nRXJyb3IoJ0ltYWdlIGZhaWxlZCB0byBsb2FkOicsIHVybCk7XHJcbiAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnZXJyb3InLCB1cmwsIGVycm9yOiAnSW1hZ2UgZmFpbGVkIHRvIGxvYWQnIH0pO1xyXG4gIH0pO1xyXG5cclxuICBpbWcuc3JjID0gY2FjaGVCdXN0KHVybCk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBBdXRvLWNsb3NlIGNvdW50ZG93biDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBTaG93IGEgY291bnRkb3duIGJhZGdlIGFuZCBhdXRvLWNsb3NlIChvciBzdGFuZGJ5IGluIHNsaWRlc2hvdyBtb2RlKS4gKi9cclxuZnVuY3Rpb24gc3RhcnRDb3VudGRvd24oc2Vjb25kczogbnVtYmVyKTogdm9pZCB7XHJcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRkb3duJyk7XHJcbiAgaWYgKCFlbCkgcmV0dXJuO1xyXG5cclxuICBsZXQgcmVtYWluaW5nID0gc2Vjb25kcztcclxuICBlbC50ZXh0Q29udGVudCA9IGkxOG4udCgnY291bnRkb3duVGV4dCcpLnJlcGxhY2UoJ3tufScsIFN0cmluZyhyZW1haW5pbmcpKTtcclxuICBlbC5oaWRkZW4gPSBmYWxzZTtcclxuXHJcbiAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICByZW1haW5pbmctLTtcclxuICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcclxuICAgICAgZWwuaGlkZGVuID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmIChzbGlkZXNob3dNb2RlKSB7XHJcbiAgICAgICAgLy8gVEVTVDogY2xvc2UgZGlhbG9nIHZpYSBob3N0LXNpZGUgbGF1bmNoZXIuY2xvc2UoKSBpbnN0ZWFkIG9mIHN0YW5kYnkuXHJcbiAgICAgICAgLy8gVGhpcyB0ZXN0cyB3aGV0aGVyIGRpYWxvZy5jbG9zZSgpIGV4aXRzIHNsaWRlc2hvdyBvciBub3QuXHJcbiAgICAgICAgbG9nRGVidWcoJ0F1dG8tY2xvc2UgdGltZXIgZXhwaXJlZCBpbiBzbGlkZXNob3cg4oCUIHNlbmRpbmcgY2xvc2UgdG8gaG9zdCcpO1xyXG4gICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdjbG9zZScgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Nsb3NlJyB9KTtcclxuICAgICAgICB0cnkgeyB3aW5kb3cuY2xvc2UoKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVsLnRleHRDb250ZW50ID0gaTE4bi50KCdjb3VudGRvd25UZXh0JykucmVwbGFjZSgne259JywgU3RyaW5nKHJlbWFpbmluZykpO1xyXG4gICAgfVxyXG4gIH0sIDEwMDApO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgU2xpZGVzaG93IGxpdmUtdXBkYXRlIHZpYSBsb2NhbFN0b3JhZ2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcbi8vXHJcbi8vIER1cmluZyBzbGlkZXNob3csIHRoZSB0YXNrcGFuZSBjYW4ndCBjbG9zZS9yZW9wZW4gdGhlIGRpYWxvZyAoaXQgZXhpdHNcclxuLy8gc2xpZGVzaG93KS4gSW5zdGVhZCwgdGhlIHRhc2twYW5lIHdyaXRlcyB0aGUgdGFyZ2V0IFVSTCB0byBsb2NhbFN0b3JhZ2VcclxuLy8gYW5kIHRoZSB2aWV3ZXIgbmF2aWdhdGVzIHRvIGl0LiBUaGlzIGFsbG93cyBzZWFtbGVzcyBzbGlkZSB0cmFuc2l0aW9ucy5cclxuLy9cclxuLy8gS2V5OiAnd2VicHB0X3NsaWRlc2hvd191cmwnXHJcbi8vIFZhbHVlOiBVUkwgc3RyaW5nIChlbXB0eSA9IHNob3cgc3RhbmRieS9ibGFuaylcclxuXHJcbi8qKiBDdXJyZW50IHpvb20gKHNldCBkdXJpbmcgaW5pdCwgcmV1c2VkIG9uIG5hdmlnYXRpb24pLiAqL1xyXG5sZXQgY3VycmVudFpvb20gPSBERUZBVUxUX1pPT007XHJcblxyXG4vKiogV2hldGhlciB0aGUgdmlld2VyIGlzIHJ1bm5pbmcgaW4gc2xpZGVzaG93IG1vZGUgKGRvbid0IGNsb3NlIG9uIHRpbWVyKS4gKi9cclxubGV0IHNsaWRlc2hvd01vZGUgPSBmYWxzZTtcclxuXHJcbi8qKiBIb3cgdG8gaGlkZSB0aGUgZGlhbG9nIHdpbmRvdyBhZnRlciB0aW1lciBleHBpcmVzIGluIHNsaWRlc2hvdyBtb2RlLiAqL1xyXG5sZXQgaGlkZU1ldGhvZFNldHRpbmc6IEhpZGVNZXRob2QgPSAnbm9uZSc7XHJcblxyXG4vKiogTmF2aWdhdGUgdGhlIHZpZXdlciB0byBhIG5ldyBVUkwgKGNhbGxlZCBmcm9tIHN0b3JhZ2UgbGlzdGVuZXIpLiAqL1xyXG5mdW5jdGlvbiBuYXZpZ2F0ZVRvVXJsKG5ld1VybDogc3RyaW5nKTogdm9pZCB7XHJcbiAgY29uc3QgaWZyYW1lV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnJhbWUtd3JhcHBlcicpO1xyXG4gIGNvbnN0IGltYWdlV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbWFnZS13cmFwcGVyJyk7XHJcbiAgY29uc3Qgc3RhbmRieSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFuZGJ5LW92ZXJsYXknKTtcclxuICBjb25zdCBibG9ja2VkT3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdibG9ja2VkLW92ZXJsYXknKTtcclxuICBjb25zdCBub1VybE1zZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduby11cmwtbWVzc2FnZScpO1xyXG5cclxuICBpZiAoIW5ld1VybCkge1xyXG4gICAgLy8gU2hvdyBzdGFuZGJ5IHN0YXRlIChibGFjay9ibGFuayBzY3JlZW4pXHJcbiAgICBpZiAoaWZyYW1lV3JhcHBlcikgaWZyYW1lV3JhcHBlci5oaWRkZW4gPSB0cnVlO1xyXG4gICAgaWYgKGltYWdlV3JhcHBlcikgaW1hZ2VXcmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAoYmxvY2tlZE92ZXJsYXkpIGJsb2NrZWRPdmVybGF5LmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAobm9VcmxNc2cpIG5vVXJsTXNnLmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAoc3RhbmRieSkgc3RhbmRieS5oaWRkZW4gPSBmYWxzZTtcclxuICAgIGxvZ0RlYnVnKCdWaWV3ZXI6IHN0YW5kYnkgKG5vIFVSTCknKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIEhpZGUgc3RhbmRieSwgc2hvdyBjb250ZW50XHJcbiAgaWYgKHN0YW5kYnkpIHN0YW5kYnkuaGlkZGVuID0gdHJ1ZTtcclxuICBpZiAoYmxvY2tlZE92ZXJsYXkpIGJsb2NrZWRPdmVybGF5LmhpZGRlbiA9IHRydWU7XHJcbiAgaWYgKG5vVXJsTXNnKSBub1VybE1zZy5oaWRkZW4gPSB0cnVlO1xyXG5cclxuICAvLyBSZXN0b3JlIHdpbmRvdyBpZiBpdCB3YXMgaGlkZGVuIChtb3ZlVG8vcmVzaXplVG8pXHJcbiAgaWYgKHNhdmVkV2luZG93U3RhdGUpIHtcclxuICAgIGxvZ0RlYnVnKCdSZXN0b3Jpbmcgd2luZG93IGJlZm9yZSBuYXZpZ2F0aW5nIHRvIG5ldyBVUkwnKTtcclxuICAgIGhhbmRsZVJlc3RvcmUoKTtcclxuICB9XHJcblxyXG4gIGlmIChpc0ltYWdlVXJsKG5ld1VybCkpIHtcclxuICAgIGlmIChpZnJhbWVXcmFwcGVyKSBpZnJhbWVXcmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAoaW1hZ2VXcmFwcGVyKSBpbWFnZVdyYXBwZXIuaGlkZGVuID0gZmFsc2U7XHJcbiAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1hZ2UtZnJhbWUnKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gICAgYXBwbHlJbWFnZVpvb20oaW1nLCBjdXJyZW50Wm9vbSk7XHJcbiAgICBpbWcuc3JjID0gY2FjaGVCdXN0KG5ld1VybCk7XHJcbiAgICBsb2dEZWJ1ZygnVmlld2VyOiBuYXZpZ2F0ZWQgdG8gaW1hZ2U6JywgbmV3VXJsKTtcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKGltYWdlV3JhcHBlcikgaW1hZ2VXcmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgICBpZiAoaWZyYW1lV3JhcHBlcikgaWZyYW1lV3JhcHBlci5oaWRkZW4gPSBmYWxzZTtcclxuICAgIGNvbnN0IGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3ZWItZnJhbWUnKSBhcyBIVE1MSUZyYW1lRWxlbWVudDtcclxuICAgIGFwcGx5Wm9vbShpZnJhbWUsIGN1cnJlbnRab29tKTtcclxuICAgIGlmcmFtZS5zcmMgPSBuZXdVcmw7XHJcbiAgICBsb2dEZWJ1ZygnVmlld2VyOiBuYXZpZ2F0ZWQgdG86JywgbmV3VXJsKTtcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSB0b29sYmFyIFVSTFxyXG4gIGNvbnN0IHVybExhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2xiYXItdXJsJyk7XHJcbiAgaWYgKHVybExhYmVsKSB7XHJcbiAgICB1cmxMYWJlbC50ZXh0Q29udGVudCA9IHRydW5jYXRlVXJsKG5ld1VybCk7XHJcbiAgICB1cmxMYWJlbC50aXRsZSA9IG5ld1VybDtcclxuICB9XHJcblxyXG4gIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdyZWFkeScsIHVybDogbmV3VXJsIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogTGlzdGVuIGZvciBtZXNzYWdlcyBmcm9tIHRoZSBob3N0ICh0YXNrcGFuZSkgdmlhIE9mZmljZS5qcyBEaWFsb2dBcGkgMS4yLlxyXG4gKlxyXG4gKiBUaGUgdGFza3BhbmUgY2FsbHMgYGRpYWxvZy5tZXNzYWdlQ2hpbGQoSlNPTi5zdHJpbmdpZnkoe2FjdGlvbiwgdXJsfSkpYC5cclxuICogVGhlIHZpZXdlciByZWNlaXZlcyBpdCB2aWEgYERpYWxvZ1BhcmVudE1lc3NhZ2VSZWNlaXZlZGAgZXZlbnQuXHJcbiAqXHJcbiAqIFRoaXMgaXMgdGhlIG9mZmljaWFsIHR3by13YXkgY29tbXVuaWNhdGlvbiBtZWNoYW5pc20gZm9yIE9mZmljZSBhZGQtaW4gZGlhbG9ncy5cclxuICogbG9jYWxTdG9yYWdlIGRvZXMgTk9UIHdvcmsgYmV0d2VlbiBXZWJWaWV3MiBwcm9jZXNzZXMgb24gT2ZmaWNlIERlc2t0b3AuXHJcbiAqL1xyXG5pbnRlcmZhY2UgUGFyZW50TWVzc2FnZSB7XHJcbiAgYWN0aW9uOiAnbmF2aWdhdGUnIHwgJ3N0YW5kYnknIHwgJ2hpZGUtbW92ZScgfCAnaGlkZS1yZXNpemUnIHwgJ3Jlc3RvcmUnO1xyXG4gIHVybD86IHN0cmluZztcclxufVxyXG5cclxuLyoqIFNhdmVkIHdpbmRvdyBwb3NpdGlvbi9zaXplIGJlZm9yZSBoaWRpbmcsIGZvciByZXN0b3JlLiAqL1xyXG5sZXQgc2F2ZWRXaW5kb3dTdGF0ZTogeyB4OiBudW1iZXI7IHk6IG51bWJlcjsgdzogbnVtYmVyOyBoOiBudW1iZXIgfSB8IG51bGwgPSBudWxsO1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlSGlkZU1vdmUoKTogc3RyaW5nIHtcclxuICBjb25zdCBieCA9IHdpbmRvdy5zY3JlZW5YLCBieSA9IHdpbmRvdy5zY3JlZW5ZO1xyXG4gIHNhdmVkV2luZG93U3RhdGUgPSB7IHg6IGJ4LCB5OiBieSwgdzogd2luZG93Lm91dGVyV2lkdGgsIGg6IHdpbmRvdy5vdXRlckhlaWdodCB9O1xyXG4gIHRyeSB7IHdpbmRvdy5tb3ZlVG8oLTMyMDAwLCAtMzIwMDApOyB9IGNhdGNoIHsgLyogKi8gfVxyXG4gIGNvbnN0IGF4ID0gd2luZG93LnNjcmVlblgsIGF5ID0gd2luZG93LnNjcmVlblk7XHJcbiAgY29uc3QgbW92ZWQgPSBieCAhPT0gYXggfHwgYnkgIT09IGF5O1xyXG4gIGNvbnN0IHJlc3VsdCA9IGBtb3ZlVG86ICgke2J4fSwke2J5fSnihpIoJHtheH0sJHtheX0pIG1vdmVkPSR7bW92ZWR9YDtcclxuICBsb2dEZWJ1ZyhyZXN1bHQpO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUhpZGVSZXNpemUoKTogc3RyaW5nIHtcclxuICBjb25zdCBidyA9IHdpbmRvdy5vdXRlcldpZHRoLCBiaCA9IHdpbmRvdy5vdXRlckhlaWdodDtcclxuICBzYXZlZFdpbmRvd1N0YXRlID0geyB4OiB3aW5kb3cuc2NyZWVuWCwgeTogd2luZG93LnNjcmVlblksIHc6IGJ3LCBoOiBiaCB9O1xyXG4gIHRyeSB7IHdpbmRvdy5yZXNpemVUbygxLCAxKTsgfSBjYXRjaCB7IC8qICovIH1cclxuICBjb25zdCBhdyA9IHdpbmRvdy5vdXRlcldpZHRoLCBhaCA9IHdpbmRvdy5vdXRlckhlaWdodDtcclxuICBjb25zdCByZXNpemVkID0gYncgIT09IGF3IHx8IGJoICE9PSBhaDtcclxuICBjb25zdCByZXN1bHQgPSBgcmVzaXplVG86ICgke2J3fXgke2JofSnihpIoJHthd314JHthaH0pIHJlc2l6ZWQ9JHtyZXNpemVkfWA7XHJcbiAgbG9nRGVidWcocmVzdWx0KTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVSZXN0b3JlKCk6IHN0cmluZyB7XHJcbiAgaWYgKCFzYXZlZFdpbmRvd1N0YXRlKSByZXR1cm4gJ3Jlc3RvcmU6IG5vIHNhdmVkIHN0YXRlJztcclxuICB0cnkge1xyXG4gICAgd2luZG93Lm1vdmVUbyhzYXZlZFdpbmRvd1N0YXRlLngsIHNhdmVkV2luZG93U3RhdGUueSk7XHJcbiAgICB3aW5kb3cucmVzaXplVG8oc2F2ZWRXaW5kb3dTdGF0ZS53LCBzYXZlZFdpbmRvd1N0YXRlLmgpO1xyXG4gIH0gY2F0Y2ggeyAvKiAqLyB9XHJcbiAgY29uc3QgcmVzdWx0ID0gYHJlc3RvcmVkIHRvICgke3NhdmVkV2luZG93U3RhdGUueH0sJHtzYXZlZFdpbmRvd1N0YXRlLnl9KSAke3NhdmVkV2luZG93U3RhdGUud314JHtzYXZlZFdpbmRvd1N0YXRlLmh9YDtcclxuICBzYXZlZFdpbmRvd1N0YXRlID0gbnVsbDtcclxuICBsb2dEZWJ1ZyhyZXN1bHQpO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRQYXJlbnRNZXNzYWdlTGlzdGVuZXIoKTogdm9pZCB7XHJcbiAgdHJ5IHtcclxuICAgIE9mZmljZS5jb250ZXh0LnVpLmFkZEhhbmRsZXJBc3luYyhcclxuICAgICAgT2ZmaWNlLkV2ZW50VHlwZS5EaWFsb2dQYXJlbnRNZXNzYWdlUmVjZWl2ZWQsXHJcbiAgICAgIChhcmc6IHsgbWVzc2FnZT86IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgICAgaWYgKCFhcmcubWVzc2FnZSkgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBtc2c6IFBhcmVudE1lc3NhZ2UgPSBKU09OLnBhcnNlKGFyZy5tZXNzYWdlKTtcclxuICAgICAgICAgIGxvZ0RlYnVnKCdWaWV3ZXI6IHBhcmVudCBtZXNzYWdlOicsIG1zZy5hY3Rpb24sIG1zZy51cmwgPz8gJycpO1xyXG5cclxuICAgICAgICAgIHN3aXRjaCAobXNnLmFjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlICduYXZpZ2F0ZSc6XHJcbiAgICAgICAgICAgICAgaWYgKG1zZy51cmwpIG5hdmlnYXRlVG9VcmwobXNnLnVybCk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3N0YW5kYnknOlxyXG4gICAgICAgICAgICAgIG5hdmlnYXRlVG9VcmwoJycpO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdoaWRlLW1vdmUnOiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcjEgPSBoYW5kbGVIaWRlTW92ZSgpO1xyXG4gICAgICAgICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdsb2FkZWQnLCB1cmw6IHIxIH0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ2hpZGUtcmVzaXplJzoge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHIyID0gaGFuZGxlSGlkZVJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdsb2FkZWQnLCB1cmw6IHIyIH0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ3Jlc3RvcmUnOiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcjMgPSBoYW5kbGVSZXN0b3JlKCk7XHJcbiAgICAgICAgICAgICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2xvYWRlZCcsIHVybDogcjMgfSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgIGxvZ0RlYnVnKCdWaWV3ZXI6IGZhaWxlZCB0byBwYXJzZSBwYXJlbnQgbWVzc2FnZTonLCBTdHJpbmcoZXJyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IE9mZmljZS5Bc3luY1Jlc3VsdFN0YXR1cy5TdWNjZWVkZWQpIHtcclxuICAgICAgICAgIGxvZ0RlYnVnKCdWaWV3ZXI6IHBhcmVudCBtZXNzYWdlIGhhbmRsZXIgcmVnaXN0ZXJlZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsb2dEZWJ1ZygnVmlld2VyOiBmYWlsZWQgdG8gcmVnaXN0ZXIgcGFyZW50IG1lc3NhZ2UgaGFuZGxlcjonLCBKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICApO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgbG9nRGVidWcoJ1ZpZXdlcjogRGlhbG9nUGFyZW50TWVzc2FnZVJlY2VpdmVkIG5vdCBzdXBwb3J0ZWQ6JywgU3RyaW5nKGVycikpO1xyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIElmcmFtZSBwb3N0TWVzc2FnZSBsaXN0ZW5lciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKlxyXG4gKiBMaXN0ZW4gZm9yIHBvc3RNZXNzYWdlIGZyb20gdGhlIHdlYnNpdGUgbG9hZGVkIGluIHRoZSBpZnJhbWUuXHJcbiAqIFRoaXMgYWxsb3dzIHRoZSB3ZWJzaXRlIHRvIGNvbnRyb2wgdGhlIGRpYWxvZyAoZS5nLiBjbG9zZSBpdCkuXHJcbiAqXHJcbiAqIFN1cHBvcnRlZCBtZXNzYWdlcyBmcm9tIHRoZSBpZnJhbWU6XHJcbiAqICAgeyBhY3Rpb246ICdjbG9zZS1kaWFsb2cnIH0gIOKAlCBjbG9zZSB0aGUgdmlld2VyIGRpYWxvZ1xyXG4gKi9cclxuZnVuY3Rpb24gaW5pdElmcmFtZU1lc3NhZ2VMaXN0ZW5lcigpOiB2b2lkIHtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XHJcbiAgICAvLyBPbmx5IHByb2Nlc3Mgb2JqZWN0IG1lc3NhZ2VzIHdpdGggYW4gYWN0aW9uIGZpZWxkXHJcbiAgICBpZiAoIWV2ZW50LmRhdGEgfHwgdHlwZW9mIGV2ZW50LmRhdGEgIT09ICdvYmplY3QnIHx8ICFldmVudC5kYXRhLmFjdGlvbikgcmV0dXJuO1xyXG5cclxuICAgIGxvZ0RlYnVnKGBWaWV3ZXI6IGlmcmFtZSBwb3N0TWVzc2FnZTogYWN0aW9uPSR7ZXZlbnQuZGF0YS5hY3Rpb259IG9yaWdpbj0ke2V2ZW50Lm9yaWdpbn1gKTtcclxuXHJcbiAgICBzd2l0Y2ggKGV2ZW50LmRhdGEuYWN0aW9uKSB7XHJcbiAgICAgIGNhc2UgJ2Nsb3NlLWRpYWxvZyc6XHJcbiAgICAgICAgbG9nRGVidWcoJ1ZpZXdlcjogY2xvc2UtZGlhbG9nIHJlY2VpdmVkIGZyb20gaWZyYW1lIOKAlCBjbG9zaW5nJyk7XHJcbiAgICAgICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Nsb3NlJyB9KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9KTtcclxuICBsb2dEZWJ1ZygnVmlld2VyOiBpZnJhbWUgcG9zdE1lc3NhZ2UgbGlzdGVuZXIgcmVnaXN0ZXJlZCcpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgTWFpbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIGluaXQoKTogdm9pZCB7XHJcbiAgY29uc3QgeyB1cmwsIHpvb20sIGxhbmcsIGF1dG9DbG9zZVNlYywgc2xpZGVzaG93LCBoaWRlTWV0aG9kIH0gPSBwYXJzZVBhcmFtcygpO1xyXG4gIGN1cnJlbnRab29tID0gem9vbTtcclxuICBzbGlkZXNob3dNb2RlID0gc2xpZGVzaG93O1xyXG4gIGhpZGVNZXRob2RTZXR0aW5nID0gaGlkZU1ldGhvZDtcclxuXHJcbiAgaTE4bi5zZXRMb2NhbGUocGFyc2VMb2NhbGUobGFuZykpO1xyXG4gIGFwcGx5STE4bigpO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIFVSTCB1cGRhdGVzIGZyb20gdGFza3BhbmUgdmlhIE9mZmljZS5qcyBtZXNzYWdlQ2hpbGQgKERpYWxvZ0FwaSAxLjIpXHJcbiAgaW5pdFBhcmVudE1lc3NhZ2VMaXN0ZW5lcigpO1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIHBvc3RNZXNzYWdlIGZyb20gdGhlIHdlYnNpdGUgaW4gdGhlIGlmcmFtZSAoZS5nLiBjbG9zZS1kaWFsb2cpXHJcbiAgaW5pdElmcmFtZU1lc3NhZ2VMaXN0ZW5lcigpO1xyXG5cclxuICBpZiAoIXVybCkge1xyXG4gICAgc2hvd05vVXJsVUkoKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIG5ldHdvcmsgYmVmb3JlIGxvYWRpbmdcclxuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgIW5hdmlnYXRvci5vbkxpbmUpIHtcclxuICAgIGxvZ0RlYnVnKCdCcm93c2VyIGlzIG9mZmxpbmUsIHNob3dpbmcgb2ZmbGluZSBVSScpO1xyXG4gICAgc2hvd09mZmxpbmVVSSgpO1xyXG4gICAgLy8gUmUtY2hlY2sgd2hlbiBjb25uZWN0aW9uIGlzIHJlc3RvcmVkXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb25saW5lJywgKCkgPT4ge1xyXG4gICAgICBsb2dEZWJ1ZygnQ29ubmVjdGlvbiByZXN0b3JlZCwgcmVsb2FkaW5nJyk7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcclxuICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdlcnJvcicsIHVybCwgZXJyb3I6ICdObyBpbnRlcm5ldCBjb25uZWN0aW9uJyB9KTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGluaXRUb29sYmFyKHVybCk7XHJcblxyXG4gIC8vIEltYWdlIG1vZGU6IGF1dG8tZGV0ZWN0ZWQgYnkgVVJMIGV4dGVuc2lvblxyXG4gIGlmIChpc0ltYWdlVXJsKHVybCkpIHtcclxuICAgIGxvZ0RlYnVnKCdJbWFnZSBVUkwgZGV0ZWN0ZWQsIHVzaW5nIGltYWdlIG1vZGUnKTtcclxuICAgIGluaXRJbWFnZU1vZGUodXJsLCB6b29tLCBhdXRvQ2xvc2VTZWMpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBJZnJhbWUgbW9kZSAoZGVmYXVsdClcclxuICAgIGNvbnN0IGlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3ZWItZnJhbWUnKSBhcyBIVE1MSUZyYW1lRWxlbWVudDtcclxuICAgIGFwcGx5Wm9vbShpZnJhbWUsIHpvb20pO1xyXG4gICAgZGV0ZWN0QmxvY2tpbmcoaWZyYW1lLCB1cmwsIGF1dG9DbG9zZVNlYyk7XHJcbiAgICBpZnJhbWUuc3JjID0gdXJsO1xyXG4gIH1cclxuXHJcbiAgLy8gTGlzdGVuIGZvciBnb2luZyBvZmZsaW5lIGFmdGVyIGluaXRpYWwgbG9hZFxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvZmZsaW5lJywgKCkgPT4ge1xyXG4gICAgbG9nRGVidWcoJ0Nvbm5lY3Rpb24gbG9zdCcpO1xyXG4gICAgc2hvd09mZmxpbmVVSSgpO1xyXG4gICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Vycm9yJywgdXJsLCBlcnJvcjogJ0Nvbm5lY3Rpb24gbG9zdCcgfSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEVzY2FwZSBrZXkgY2xvc2VzIHRoZSB2aWV3ZXJcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcclxuICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcclxuICAgICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Nsb3NlJyB9KTtcclxuICAgICAgdHJ5IHsgd2luZG93LmNsb3NlKCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAncmVhZHknLCB1cmwgfSk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBCb290c3RyYXAg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogLSBPZmZpY2UgY29udGV4dDogZGVmZXIgdW50aWwgT2ZmaWNlLm9uUmVhZHkoKSB0byBndWFyYW50ZWUgT2ZmaWNlLmpzIEFQSXMuXHJcbiAqIC0gU3RhbmRhbG9uZSAobm8gT2ZmaWNlLmpzIENETiwgZGV2IGJyb3dzZXIpOiBydW4gb24gRE9NQ29udGVudExvYWRlZC5cclxuICovXHJcbmZ1bmN0aW9uIHN0YXJ0KCk6IHZvaWQge1xyXG4gIGluc3RhbGxVbmhhbmRsZWRSZWplY3Rpb25IYW5kbGVyKCk7XHJcblxyXG4gIGlmICh0eXBlb2YgT2ZmaWNlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgT2ZmaWNlLm9uUmVhZHkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgIE9mZmljZS5vblJlYWR5KCgpID0+IGluaXQoKSk7XHJcbiAgfSBlbHNlIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcclxuICB9IGVsc2Uge1xyXG4gICAgaW5pdCgpO1xyXG4gIH1cclxufVxyXG5cclxuc3RhcnQoKTtcclxuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9