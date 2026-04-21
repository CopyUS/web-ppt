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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUVELGdGQUFnRjtBQUVoRjs7O0dBR0c7QUFDSCxTQUFTLEtBQUs7SUFDWiw2Q0FBZ0MsR0FBRSxDQUFDO0lBRW5DLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE9BQU8sTUFBTSxDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUMxRSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDL0IsQ0FBQztTQUFNLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUM3QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztTQUFNLENBQUM7UUFDTixJQUFJLEVBQUUsQ0FBQztJQUNULENBQUM7QUFDSCxDQUFDO0FBRUQsS0FBSyxFQUFFLENBQUM7Ozs7Ozs7Ozs7QUN6c0JSIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvY29uc3RhbnRzLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvc2hhcmVkL2kxOG4udHMiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi8uL3NyYy9zaGFyZWQvbG9nZ2VyLnRzIiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViLXBwdC1hZGRpbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYi1wcHQtYWRkaW4vLi9zcmMvdmlld2VyL3ZpZXdlci50cyIsIndlYnBhY2s6Ly93ZWItcHB0LWFkZGluLy4vc3JjL3ZpZXdlci92aWV3ZXIuY3NzPzdmOGYiXSwic291cmNlc0NvbnRlbnQiOlsiLy8g4pSA4pSA4pSAIFNldHRpbmcga2V5cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBQcmVmaXggZm9yIHBlci1zbGlkZSBzZXR0aW5nIGtleXMuIEZ1bGwga2V5OiBgd2VicHB0X3NsaWRlX3tzbGlkZUlkfWAuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9TTElERV9QUkVGSVggPSAnd2VicHB0X3NsaWRlXyc7XHJcblxyXG4vKiogS2V5IGZvciB0aGUgc2F2ZWQgVUkgbGFuZ3VhZ2UuICovXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HX0tFWV9MQU5HVUFHRSA9ICd3ZWJwcHRfbGFuZ3VhZ2UnO1xyXG5cclxuLyoqIEtleSBmb3IgZ2xvYmFsIGRlZmF1bHQgc2xpZGUgY29uZmlnLiAqL1xyXG5leHBvcnQgY29uc3QgU0VUVElOR19LRVlfREVGQVVMVFMgPSAnd2VicHB0X2RlZmF1bHRzJztcclxuXHJcbi8vIOKUgOKUgOKUgCBWaWV3ZXIgZGVmYXVsdHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9aT09NID0gMTAwO1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9ESUFMT0dfV0lEVEggPSA4MDsgICAvLyAlIG9mIHNjcmVlblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9ESUFMT0dfSEVJR0hUID0gODA7ICAvLyAlIG9mIHNjcmVlblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRPX09QRU4gPSB0cnVlO1xyXG5cclxuLy8g4pSA4pSA4pSAIENvbnN0cmFpbnQgcmFuZ2VzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IFpPT01fTUlOID0gNTA7XHJcbmV4cG9ydCBjb25zdCBaT09NX01BWCA9IDMwMDtcclxuXHJcbi8vIOKUgOKUgOKUgCBBdXRvLWNsb3NlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19DTE9TRV9TRUMgPSAwOyAgIC8vIDAgPSBkaXNhYmxlZFxyXG5leHBvcnQgY29uc3QgQVVUT19DTE9TRV9NQVhfU0VDID0gMzYwMDtcclxuXHJcbi8qKlxyXG4gKiBOb24tbGluZWFyIGxvb2t1cCB0YWJsZSBmb3IgdGhlIGF1dG8tY2xvc2Ugc2xpZGVyLlxyXG4gKiBJbmRleCA9IHNsaWRlciBwb3NpdGlvbiwgdmFsdWUgPSBzZWNvbmRzLlxyXG4gKiBHcmFudWxhcml0eSBkZWNyZWFzZXMgYXMgdmFsdWVzIGdyb3c6IDFzIOKGkiA1cyDihpIgMTVzIOKGkiAzMHMg4oaSIDYwcyDihpIgMzAwcy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBBVVRPX0NMT1NFX1NURVBTOiByZWFkb25seSBudW1iZXJbXSA9IFtcclxuICAvLyAw4oCTMTBzLCBzdGVwIDEgICgxMSB2YWx1ZXMpXHJcbiAgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsXHJcbiAgLy8gMTDigJM2MHMsIHN0ZXAgNSAgKDEwIHZhbHVlcylcclxuICAxNSwgMjAsIDI1LCAzMCwgMzUsIDQwLCA0NSwgNTAsIDU1LCA2MCxcclxuICAvLyAx4oCTMyBtaW4sIHN0ZXAgMTVzICAoOCB2YWx1ZXMpXHJcbiAgNzUsIDkwLCAxMDUsIDEyMCwgMTM1LCAxNTAsIDE2NSwgMTgwLFxyXG4gIC8vIDPigJM1IG1pbiwgc3RlcCAzMHMgICg0IHZhbHVlcylcclxuICAyMTAsIDI0MCwgMjcwLCAzMDAsXHJcbiAgLy8gNeKAkzEwIG1pbiwgc3RlcCA2MHMgICg1IHZhbHVlcylcclxuICAzNjAsIDQyMCwgNDgwLCA1NDAsIDYwMCxcclxuICAvLyAxMOKAkzYwIG1pbiwgc3RlcCAzMDBzICAoMTAgdmFsdWVzKVxyXG4gIDkwMCwgMTIwMCwgMTUwMCwgMTgwMCwgMjEwMCwgMjQwMCwgMjcwMCwgMzAwMCwgMzMwMCwgMzYwMCxcclxuXTtcclxuXHJcbi8vIOKUgOKUgOKUgCBFcnJvciBoYW5kbGluZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HU19TQVZFX01BWF9SRVRSSUVTID0gMjtcclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NBVkVfUkVUUllfREVMQVlfTVMgPSAxMDAwO1xyXG5leHBvcnQgY29uc3QgSUZSQU1FX0xPQURfVElNRU9VVF9NUyA9IDEwXzAwMDtcclxuZXhwb3J0IGNvbnN0IFVSTF9ESVNQTEFZX01BWF9MRU5HVEggPSA2MDtcclxuXHJcbi8qKiBUcnVuY2F0ZSBhIFVSTCBmb3IgZGlzcGxheSwgYXBwZW5kaW5nIGVsbGlwc2lzIGlmIG5lZWRlZC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRydW5jYXRlVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBpZiAodXJsLmxlbmd0aCA8PSBVUkxfRElTUExBWV9NQVhfTEVOR1RIKSByZXR1cm4gdXJsO1xyXG4gIHJldHVybiB1cmwuc3Vic3RyaW5nKDAsIFVSTF9ESVNQTEFZX01BWF9MRU5HVEggLSAxKSArICdcXHUyMDI2JztcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIERlYnVnIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuLyoqXHJcbiAqIFNldCB0byBgZmFsc2VgIGluIHByb2R1Y3Rpb24gYnVpbGRzIHZpYSB3ZWJwYWNrIERlZmluZVBsdWdpbi5cclxuICogRmFsbHMgYmFjayB0byBgdHJ1ZWAgc28gZGV2L3Rlc3QgcnVucyBhbHdheXMgbG9nLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFQlVHOiBib29sZWFuID1cclxuICB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MuZW52ICE9PSAndW5kZWZpbmVkJ1xyXG4gICAgPyBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXHJcbiAgICA6IHRydWU7XHJcbiIsImltcG9ydCBsb2NhbGVzRGF0YSBmcm9tICcuLi9pMThuL2xvY2FsZXMuanNvbic7XHJcblxyXG5leHBvcnQgdHlwZSBMb2NhbGUgPSAnZW4nIHwgJ3poJyB8ICdlcycgfCAnZGUnIHwgJ2ZyJyB8ICdpdCcgfCAnYXInIHwgJ3B0JyB8ICdoaScgfCAncnUnO1xyXG5leHBvcnQgdHlwZSBUcmFuc2xhdGlvbktleSA9IGtleW9mIHR5cGVvZiBsb2NhbGVzRGF0YVsnZW4nXTtcclxuXHJcbi8qKiBNYXBzIGEgQkNQIDQ3IGxhbmd1YWdlIHRhZyB0byBhIHN1cHBvcnRlZCBMb2NhbGUuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsZShsYW5nVGFnOiBzdHJpbmcpOiBMb2NhbGUge1xyXG4gIGNvbnN0IHRhZyA9IGxhbmdUYWcudG9Mb3dlckNhc2UoKTtcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3poJykpIHJldHVybiAnemgnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnZXMnKSkgcmV0dXJuICdlcyc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdkZScpKSByZXR1cm4gJ2RlJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ2ZyJykpIHJldHVybiAnZnInO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnaXQnKSkgcmV0dXJuICdpdCc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdhcicpKSByZXR1cm4gJ2FyJztcclxuICBpZiAodGFnLnN0YXJ0c1dpdGgoJ3B0JykpIHJldHVybiAncHQnO1xyXG4gIGlmICh0YWcuc3RhcnRzV2l0aCgnaGknKSkgcmV0dXJuICdoaSc7XHJcbiAgaWYgKHRhZy5zdGFydHNXaXRoKCdydScpKSByZXR1cm4gJ3J1JztcclxuICByZXR1cm4gJ2VuJztcclxufVxyXG5cclxuY2xhc3MgSTE4biB7XHJcbiAgcHJpdmF0ZSBsb2NhbGU6IExvY2FsZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGxpc3RlbmVycyA9IG5ldyBTZXQ8KCkgPT4gdm9pZD4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmxvY2FsZSA9IHRoaXMuZGV0ZWN0TG9jYWxlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRldGVjdExvY2FsZSgpOiBMb2NhbGUge1xyXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gJ2VuJztcclxuICAgIHJldHVybiBwYXJzZUxvY2FsZShuYXZpZ2F0b3IubGFuZ3VhZ2UgPz8gJ2VuJyk7XHJcbiAgfVxyXG5cclxuICAvKiogVHJhbnNsYXRlIGEga2V5IGluIHRoZSBjdXJyZW50IGxvY2FsZS4gRmFsbHMgYmFjayB0byBFbmdsaXNoLCB0aGVuIHRoZSBrZXkgaXRzZWxmLiAqL1xyXG4gIHQoa2V5OiBUcmFuc2xhdGlvbktleSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBsb2NhbGVzRGF0YVt0aGlzLmxvY2FsZV1ba2V5XSA/P1xyXG4gICAgICBsb2NhbGVzRGF0YVsnZW4nXVtrZXldID8/XHJcbiAgICAgIGtleVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGdldExvY2FsZSgpOiBMb2NhbGUge1xyXG4gICAgcmV0dXJuIHRoaXMubG9jYWxlO1xyXG4gIH1cclxuXHJcbiAgZ2V0QXZhaWxhYmxlTG9jYWxlcygpOiBMb2NhbGVbXSB7XHJcbiAgICByZXR1cm4gWydlbicsICd6aCcsICdlcycsICdkZScsICdmcicsICdpdCcsICdhcicsICdwdCcsICdoaScsICdydSddO1xyXG4gIH1cclxuXHJcbiAgLyoqIFN3aXRjaCBsb2NhbGUgYW5kIG5vdGlmeSBhbGwgbGlzdGVuZXJzLiAqL1xyXG4gIHNldExvY2FsZShsb2NhbGU6IExvY2FsZSk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMubG9jYWxlID09PSBsb2NhbGUpIHJldHVybjtcclxuICAgIHRoaXMubG9jYWxlID0gbG9jYWxlO1xyXG4gICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3Vic2NyaWJlIHRvIGxvY2FsZSBjaGFuZ2VzLlxyXG4gICAqIEByZXR1cm5zIFVuc3Vic2NyaWJlIGZ1bmN0aW9uLlxyXG4gICAqL1xyXG4gIG9uTG9jYWxlQ2hhbmdlKGxpc3RlbmVyOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XHJcbiAgICB0aGlzLmxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xyXG4gICAgcmV0dXJuICgpID0+IHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogU2luZ2xldG9uIGkxOG4gaW5zdGFuY2Ugc2hhcmVkIGFjcm9zcyB0aGUgYWRkLWluLiAqL1xyXG5leHBvcnQgY29uc3QgaTE4biA9IG5ldyBJMThuKCk7XHJcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuY29uc3QgUFJFRklYID0gJ1tXZWJQUFRdJztcclxuXHJcbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cclxuXHJcbi8qKiBMb2cgZGVidWcgaW5mbyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dEZWJ1ZyguLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcclxuICBpZiAoREVCVUcpIGNvbnNvbGUubG9nKFBSRUZJWCwgLi4uYXJncyk7XHJcbn1cclxuXHJcbi8qKiBMb2cgd2FybmluZ3Mg4oCUIG5vLW9wIGluIHByb2R1Y3Rpb24gYnVpbGRzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9nV2FybiguLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcclxuICBpZiAoREVCVUcpIGNvbnNvbGUud2FybihQUkVGSVgsIC4uLmFyZ3MpO1xyXG59XHJcblxyXG4vKiogTG9nIGVycm9ycyDigJQgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dFcnJvciguLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcclxuICBpZiAoREVCVUcpIGNvbnNvbGUuZXJyb3IoUFJFRklYLCAuLi5hcmdzKTtcclxufVxyXG5cclxuLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXHJcblxyXG4vKipcclxuICogSW5zdGFsbCBhIGdsb2JhbCBoYW5kbGVyIGZvciB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb25zLlxyXG4gKiBDYWxsIG9uY2UgcGVyIGVudHJ5IHBvaW50ICh0YXNrcGFuZSwgdmlld2VyLCBjb21tYW5kcykuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIoKTogdm9pZCB7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChldmVudDogUHJvbWlzZVJlamVjdGlvbkV2ZW50KSA9PiB7XHJcbiAgICBsb2dFcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uOicsIGV2ZW50LnJlYXNvbik7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGkxOG4sIHBhcnNlTG9jYWxlLCB0eXBlIFRyYW5zbGF0aW9uS2V5IH0gZnJvbSAnLi4vc2hhcmVkL2kxOG4nO1xyXG5pbXBvcnQgeyBaT09NX01JTiwgWk9PTV9NQVgsIERFRkFVTFRfWk9PTSwgSUZSQU1FX0xPQURfVElNRU9VVF9NUywgQVVUT19DTE9TRV9NQVhfU0VDLCB0cnVuY2F0ZVVybCB9IGZyb20gJy4uL3NoYXJlZC9jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBsb2dEZWJ1ZywgbG9nRXJyb3IsIGluc3RhbGxVbmhhbmRsZWRSZWplY3Rpb25IYW5kbGVyIH0gZnJvbSAnLi4vc2hhcmVkL2xvZ2dlcic7XHJcblxyXG4vLyDilIDilIDilIAgQ29kZSBzbmlwcGV0cyBmb3IgdGhlIG93bi1zaXRlIGd1aWRlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuY29uc3QgQ09ERV9TTklQUEVUUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICBuZ2lueDogJ2FkZF9oZWFkZXIgQ29udGVudC1TZWN1cml0eS1Qb2xpY3kgXCJmcmFtZS1hbmNlc3RvcnMgKlwiOycsXHJcbiAgYXBhY2hlOlxyXG4gICAgJ0hlYWRlciBzZXQgQ29udGVudC1TZWN1cml0eS1Qb2xpY3kgXCJmcmFtZS1hbmNlc3RvcnMgKlwiXFxuSGVhZGVyIHVuc2V0IFgtRnJhbWUtT3B0aW9ucycsXHJcbiAgZXhwcmVzczogYGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgcmVzLnNldEhlYWRlcignQ29udGVudC1TZWN1cml0eS1Qb2xpY3knLCAnZnJhbWUtYW5jZXN0b3JzIConKTtcclxuICByZXMucmVtb3ZlSGVhZGVyKCdYLUZyYW1lLU9wdGlvbnMnKTtcclxuICBuZXh0KCk7XHJcbn0pO2AsXHJcbn07XHJcblxyXG4vLyDilIDilIDilIAgTWVzc2FnZSBwcm90b2NvbCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbnR5cGUgVmlld2VyTWVzc2FnZVR5cGUgPSAncmVhZHknIHwgJ2xvYWRlZCcgfCAnYmxvY2tlZCcgfCAnZXJyb3InIHwgJ2Nsb3NlJztcclxuXHJcbmludGVyZmFjZSBWaWV3ZXJNZXNzYWdlIHtcclxuICB0eXBlOiBWaWV3ZXJNZXNzYWdlVHlwZTtcclxuICB1cmw/OiBzdHJpbmc7XHJcbiAgZXJyb3I/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZW5kIGEgc3RydWN0dXJlZCBtZXNzYWdlIHRvIHRoZSBUYXNrIFBhbmUgaG9zdCB2aWEgT2ZmaWNlLmpzLlxyXG4gKiBTaWxlbnQgbm8tb3Agd2hlbiBydW5uaW5nIG91dHNpZGUgYW4gT2ZmaWNlIGNvbnRleHQgKHN0YW5kYWxvbmUgYnJvd3NlcikuXHJcbiAqL1xyXG5mdW5jdGlvbiBzZW5kVG9QYXJlbnQobXNnOiBWaWV3ZXJNZXNzYWdlKTogdm9pZCB7XHJcbiAgdHJ5IHtcclxuICAgIE9mZmljZS5jb250ZXh0LnVpLm1lc3NhZ2VQYXJlbnQoSlNPTi5zdHJpbmdpZnkobXNnKSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICAvLyBOb3QgaW4gYW4gT2ZmaWNlIGRpYWxvZyBjb250ZXh0IOKAlCBpZ25vcmUgKHN0YW5kYWxvbmUgYnJvd3NlciB0ZXN0KVxyXG4gIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFF1ZXJ5IHBhcmFtZXRlciBwYXJzaW5nIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxudHlwZSBIaWRlTWV0aG9kID0gJ25vbmUnIHwgJ21vdmUnIHwgJ3Jlc2l6ZSc7XHJcblxyXG5pbnRlcmZhY2UgVmlld2VyUGFyYW1zIHtcclxuICB1cmw6IHN0cmluZztcclxuICB6b29tOiBudW1iZXI7XHJcbiAgbGFuZzogc3RyaW5nO1xyXG4gIGF1dG9DbG9zZVNlYzogbnVtYmVyO1xyXG4gIHNsaWRlc2hvdzogYm9vbGVhbjtcclxuICBoaWRlTWV0aG9kOiBIaWRlTWV0aG9kO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZVBhcmFtcygpOiBWaWV3ZXJQYXJhbXMge1xyXG4gIGNvbnN0IHAgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG5cclxuICBjb25zdCB1cmwgPSBwLmdldCgndXJsJykgPz8gJyc7XHJcblxyXG4gIGNvbnN0IHJhd1pvb20gPSBwYXJzZUludChwLmdldCgnem9vbScpID8/IFN0cmluZyhERUZBVUxUX1pPT00pLCAxMCk7XHJcbiAgY29uc3Qgem9vbSA9IGlzTmFOKHJhd1pvb20pXHJcbiAgICA/IERFRkFVTFRfWk9PTVxyXG4gICAgOiBNYXRoLm1pbihaT09NX01BWCwgTWF0aC5tYXgoWk9PTV9NSU4sIHJhd1pvb20pKTtcclxuXHJcbiAgY29uc3QgbGFuZyA9IHAuZ2V0KCdsYW5nJykgPz9cclxuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyA/IG5hdmlnYXRvci5sYW5ndWFnZSA6ICdlbicpO1xyXG5cclxuICBjb25zdCByYXdBdXRvQ2xvc2UgPSBwYXJzZUludChwLmdldCgnYXV0b2Nsb3NlJykgPz8gJzAnLCAxMCk7XHJcbiAgY29uc3QgYXV0b0Nsb3NlU2VjID0gaXNOYU4ocmF3QXV0b0Nsb3NlKVxyXG4gICAgPyAwXHJcbiAgICA6IE1hdGgubWluKEFVVE9fQ0xPU0VfTUFYX1NFQywgTWF0aC5tYXgoMCwgcmF3QXV0b0Nsb3NlKSk7XHJcblxyXG4gIGNvbnN0IHNsaWRlc2hvdyA9IHAuZ2V0KCdzbGlkZXNob3cnKSA9PT0gJzEnO1xyXG5cclxuICBjb25zdCByYXdIaWRlID0gcC5nZXQoJ2hpZGUnKSA/PyAnbm9uZSc7XHJcbiAgY29uc3QgaGlkZU1ldGhvZDogSGlkZU1ldGhvZCA9IChyYXdIaWRlID09PSAnbW92ZScgfHwgcmF3SGlkZSA9PT0gJ3Jlc2l6ZScpID8gcmF3SGlkZSA6ICdub25lJztcclxuXHJcbiAgcmV0dXJuIHsgdXJsLCB6b29tLCBsYW5nLCBhdXRvQ2xvc2VTZWMsIHNsaWRlc2hvdywgaGlkZU1ldGhvZCB9O1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgaTE4biDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBSZXBsYWNlIHRleHRDb250ZW50IG9mIGV2ZXJ5IFtkYXRhLWkxOG5dIGVsZW1lbnQgd2l0aCB0aGUgdHJhbnNsYXRlZCBzdHJpbmcuICovXHJcbmZ1bmN0aW9uIGFwcGx5STE4bigpOiB2b2lkIHtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignW2RhdGEtaTE4bl0nKS5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgY29uc3Qga2V5ID0gZWwuZGF0YXNldC5pMThuIGFzIFRyYW5zbGF0aW9uS2V5O1xyXG4gICAgZWwudGV4dENvbnRlbnQgPSBpMThuLnQoa2V5KTtcclxuICB9KTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFpvb20g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKipcclxuICogU2NhbGUgdGhlIGlmcmFtZSBieSBgem9vbWAlIHVzaW5nIENTUyB0cmFuc2Zvcm0gd2hpbGUga2VlcGluZyBpdCBmdWxsLXNjcmVlbi5cclxuICogQ29tcGVuc2F0ZWQgd2lkdGgvaGVpZ2h0IGVuc3VyZSB0aGUgdmlld3BvcnQgaXMgYWx3YXlzIGNvdmVyZWQuXHJcbiAqXHJcbiAqICAgem9vbSA9IDE1MCDihpIgY29udGVudCBpcyAxNTAlIHNpemUgKHpvb21lZCBpbiwgc2hvd3MgbGVzcyBjb250ZW50KVxyXG4gKiAgIHpvb20gPSA3NSAg4oaSIGNvbnRlbnQgaXMgNzUlIHNpemUgICh6b29tZWQgb3V0LCBzaG93cyBtb3JlIGNvbnRlbnQpXHJcbiAqL1xyXG5mdW5jdGlvbiBhcHBseVpvb20oaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCwgem9vbTogbnVtYmVyKTogdm9pZCB7XHJcbiAgaWYgKHpvb20gPT09IERFRkFVTFRfWk9PTSkgcmV0dXJuOyAvLyBDU1MgZGVmYXVsdHMgYWxyZWFkeSBjb3ZlciAxMDAlXHJcbiAgY29uc3QgZmFjdG9yID0gem9vbSAvIDEwMDtcclxuICBpZnJhbWUuc3R5bGUud2lkdGggPSBgJHsxMDAgLyBmYWN0b3J9dndgO1xyXG4gIGlmcmFtZS5zdHlsZS5oZWlnaHQgPSBgJHsxMDAgLyBmYWN0b3J9dmhgO1xyXG4gIGlmcmFtZS5zdHlsZS50cmFuc2Zvcm0gPSBgc2NhbGUoJHtmYWN0b3J9KWA7XHJcbiAgaWZyYW1lLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9ICd0b3AgbGVmdCc7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBJZnJhbWUgYmxvY2tpbmcgZGV0ZWN0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuXHJcbi8qKlxyXG4gKiBEZXRlY3RzIHdoZXRoZXIgdGhlIHRhcmdldCBzaXRlIGJsb2NrcyBpZnJhbWUgZW1iZWRkaW5nLlxyXG4gKlxyXG4gKiBTdHJhdGVneTpcclxuICogIDEuIExpc3RlbiBmb3IgdGhlIGlmcmFtZSBgbG9hZGAgZXZlbnQuXHJcbiAqICAyLiBPbiBsb2FkLCB0cnkgdG8gcmVhZCBgY29udGVudERvY3VtZW50YDpcclxuICogICAgIC0gU2VjdXJpdHlFcnJvciAoY3Jvc3Mtb3JpZ2luKSDihpIgc2l0ZSBsb2FkZWQgbm9ybWFsbHkuXHJcbiAqICAgICAtIE5vIGVycm9yICsgZG9jdW1lbnQgVVJMIGlzIGBhYm91dDpibGFua2Ag4oaSIGJyb3dzZXIgc2lsZW50bHkgYmxvY2tlZFxyXG4gKiAgICAgICBkdWUgdG8gWC1GcmFtZS1PcHRpb25zIC8gQ1NQIGZyYW1lLWFuY2VzdG9ycy5cclxuICogIDMuIElmIGBsb2FkYCBuZXZlciBmaXJlcyB3aXRoaW4gSUZSQU1FX0xPQURfVElNRU9VVF9NUyDihpIgc2xvdyBuZXR3b3JrLlxyXG4gKlxyXG4gKiBJTVBPUlRBTlQ6IE5ldmVyIHVzZSBgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmxgIHRvIGF1dG8tbmF2aWdhdGUuXHJcbiAqIFRoYXQgZGVzdHJveXMgdGhlIHZpZXdlciBwYWdlIChtZXNzYWdlQ2hpbGQgbGlzdGVuZXIsIGNvdW50ZG93biB0aW1lcixcclxuICogc3RhbmRieSBvdmVybGF5KSBtYWtpbmcgc2xpZGVzaG93IG5hdmlnYXRpb24gaW1wb3NzaWJsZS5cclxuICovXHJcbmZ1bmN0aW9uIGRldGVjdEJsb2NraW5nKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQsIHVybDogc3RyaW5nLCBhdXRvQ2xvc2VTZWM6IG51bWJlcik6IHZvaWQge1xyXG4gIGxldCBsb2FkRmlyZWQgPSBmYWxzZTtcclxuXHJcbiAgaWZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICBsb2FkRmlyZWQgPSB0cnVlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZG9jID0gaWZyYW1lLmNvbnRlbnREb2N1bWVudDtcclxuICAgICAgLy8gV2hlbiBibG9ja2VkIGJ5IFgtRnJhbWUtT3B0aW9ucy9DU1AsIGJyb3dzZXJzIHJlZGlyZWN0IGlmcmFtZSB0byBhYm91dDpibGFuay5cclxuICAgICAgLy8gQ2hlY2sgZm9yIGFib3V0OmJsYW5rIFVSTCByYXRoZXIgdGhhbiBlbXB0eSBib2R5IChhdm9pZHMgZmFsc2UgcG9zaXRpdmVzXHJcbiAgICAgIC8vIHdpdGggU1BBcyB0aGF0IHJlbmRlciBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgbG9hZCBldmVudCkuXHJcbiAgICAgIGNvbnN0IGlzQmxvY2tlZCA9ICFkb2MgfHwgZG9jLlVSTCA9PT0gJ2Fib3V0OmJsYW5rJyB8fCBkb2MuVVJMID09PSAnJztcclxuICAgICAgaWYgKGlzQmxvY2tlZCkge1xyXG4gICAgICAgIGxvZ0RlYnVnKCdJZnJhbWUgYmxvY2tlZCAoYWJvdXQ6YmxhbmsgZGV0ZWN0ZWQpIGZvcjonLCB1cmwpO1xyXG4gICAgICAgIHNob3dCbG9ja2VkVUkodXJsKTtcclxuICAgICAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnYmxvY2tlZCcsIHVybCB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnbG9hZGVkJywgdXJsIH0pO1xyXG4gICAgICAgIGlmIChhdXRvQ2xvc2VTZWMgPiAwKSBzdGFydENvdW50ZG93bihhdXRvQ2xvc2VTZWMpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgLy8gU2VjdXJpdHlFcnJvcjogY3Jvc3Mtb3JpZ2luIGNvbnRlbnQgbG9hZGVkIHN1Y2Nlc3NmdWxseVxyXG4gICAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnbG9hZGVkJywgdXJsIH0pO1xyXG4gICAgICBpZiAoYXV0b0Nsb3NlU2VjID4gMCkgc3RhcnRDb3VudGRvd24oYXV0b0Nsb3NlU2VjKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBpZiAoIWxvYWRGaXJlZCkge1xyXG4gICAgICAvLyBUaW1lb3V0OiB0aGUgc2l0ZSBpcyBwcm9iYWJseSBqdXN0IHNsb3cuIFNob3cgdGltZW91dCBVSSBidXQgZG8gTk9UXHJcbiAgICAgIC8vIG5hdmlnYXRlIGF3YXkg4oCUIHRoZSB2aWV3ZXIgbXVzdCBzdGF5IGFsaXZlIGZvciBzbGlkZXNob3cgY29tbXVuaWNhdGlvbi5cclxuICAgICAgbG9nRGVidWcoJ0lmcmFtZSBsb2FkIHRpbWVvdXQgZm9yOicsIHVybCk7XHJcbiAgICAgIHNob3dUaW1lb3V0VUkodXJsKTtcclxuICAgICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Vycm9yJywgdXJsLCBlcnJvcjogJ3RpbWVvdXQnIH0pO1xyXG4gICAgfVxyXG4gIH0sIElGUkFNRV9MT0FEX1RJTUVPVVRfTVMpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgVUkgc3RhdGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5mdW5jdGlvbiBzaG93QmxvY2tlZFVJKHVybDogc3RyaW5nKTogdm9pZCB7XHJcbiAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnJhbWUtd3JhcHBlcicpO1xyXG4gIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmxvY2tlZC1vdmVybGF5Jyk7XHJcblxyXG4gIGlmICh3cmFwcGVyKSB3cmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgaWYgKG92ZXJsYXkpIG92ZXJsYXkuaGlkZGVuID0gZmFsc2U7XHJcblxyXG4gIGluaXRCbG9ja2VkQWN0aW9ucyh1cmwpO1xyXG4gIGluaXRHdWlkZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzaG93Tm9VcmxVSSgpOiB2b2lkIHtcclxuICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lmcmFtZS13cmFwcGVyJyk7XHJcbiAgY29uc3QgbXNnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vLXVybC1tZXNzYWdlJyk7XHJcblxyXG4gIGlmICh3cmFwcGVyKSB3cmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgaWYgKG1zZykgbXNnLmhpZGRlbiA9IGZhbHNlO1xyXG59XHJcblxyXG4vKiogU2hvdyBhIHRpbWVvdXQgbWVzc2FnZSB3aGVuIHRoZSBpZnJhbWUgZmFpbHMgdG8gbG9hZCB3aXRoaW4gdGhlIGFsbG93ZWQgdGltZS4gKi9cclxuZnVuY3Rpb24gc2hvd1RpbWVvdXRVSSh1cmw6IHN0cmluZyk6IHZvaWQge1xyXG4gIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZyYW1lLXdyYXBwZXInKTtcclxuICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jsb2NrZWQtb3ZlcmxheScpO1xyXG5cclxuICBpZiAod3JhcHBlcikgd3JhcHBlci5oaWRkZW4gPSB0cnVlO1xyXG4gIGlmIChvdmVybGF5KSB7XHJcbiAgICBvdmVybGF5LmhpZGRlbiA9IGZhbHNlO1xyXG4gICAgLy8gUmV1c2UgdGhlIGJsb2NrZWQgb3ZlcmxheSBidXQgY2hhbmdlIHRoZSBoZWFkaW5nIHRleHQgdG8gdGltZW91dCBtZXNzYWdlXHJcbiAgICBjb25zdCBoZWFkaW5nID0gb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1pMThuPVwiaWZyYW1lQmxvY2tlZFwiXScpO1xyXG4gICAgaWYgKGhlYWRpbmcpIGhlYWRpbmcudGV4dENvbnRlbnQgPSBpMThuLnQoJ2xvYWRUaW1lb3V0Jyk7XHJcbiAgICBjb25zdCBoaW50ID0gb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1pMThuPVwiaWZyYW1lQmxvY2tlZEhpbnRcIl0nKTtcclxuICAgIGlmIChoaW50KSBoaW50LnRleHRDb250ZW50ID0gaTE4bi50KCdub0ludGVybmV0Jyk7XHJcbiAgfVxyXG5cclxuICBpbml0QmxvY2tlZEFjdGlvbnModXJsKTtcclxufVxyXG5cclxuLyoqIFNob3cgYW4gb2ZmbGluZSBtZXNzYWdlLiBDYWxsZWQgd2hlbiBuYXZpZ2F0b3Iub25MaW5lIGlzIGZhbHNlLiAqL1xyXG5mdW5jdGlvbiBzaG93T2ZmbGluZVVJKCk6IHZvaWQge1xyXG4gIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZyYW1lLXdyYXBwZXInKTtcclxuICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jsb2NrZWQtb3ZlcmxheScpO1xyXG5cclxuICBpZiAod3JhcHBlcikgd3JhcHBlci5oaWRkZW4gPSB0cnVlO1xyXG4gIGlmIChvdmVybGF5KSB7XHJcbiAgICBvdmVybGF5LmhpZGRlbiA9IGZhbHNlO1xyXG4gICAgY29uc3QgaGVhZGluZyA9IG92ZXJsYXkucXVlcnlTZWxlY3RvcignW2RhdGEtaTE4bj1cImlmcmFtZUJsb2NrZWRcIl0nKTtcclxuICAgIGlmIChoZWFkaW5nKSBoZWFkaW5nLnRleHRDb250ZW50ID0gaTE4bi50KCdub0ludGVybmV0Jyk7XHJcbiAgICBjb25zdCBoaW50ID0gb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1pMThuPVwiaWZyYW1lQmxvY2tlZEhpbnRcIl0nKTtcclxuICAgIGlmIChoaW50KSBoaW50LnRleHRDb250ZW50ID0gJyc7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDilIDilIDilIAgVG9vbGJhciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmZ1bmN0aW9uIGluaXRUb29sYmFyKHVybDogc3RyaW5nKTogdm9pZCB7XHJcbiAgY29uc3QgdXJsTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbGJhci11cmwnKTtcclxuICBpZiAodXJsTGFiZWwpIHtcclxuICAgIHVybExhYmVsLnRleHRDb250ZW50ID0gdHJ1bmNhdGVVcmwodXJsKTtcclxuICAgIHVybExhYmVsLnRpdGxlID0gdXJsOyAvLyBmdWxsIFVSTCBpbiB0b29sdGlwXHJcbiAgfVxyXG5cclxuICAvLyBDbG9zZSDigJQgbWVzc2FnZSBob3N0OyBmYWxsYmFjayB0byB3aW5kb3cuY2xvc2UoKSBmb3Igc3RhbmRhbG9uZVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnY2xvc2UnIH0pO1xyXG4gICAgdHJ5IHsgd2luZG93LmNsb3NlKCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gIH0pO1xyXG5cclxuICAvLyBPcGVuIGN1cnJlbnQgVVJMIGluIGEgbmV3IGJyb3dzZXIgdGFiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1vcGVuLWJyb3dzZXInKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICB3aW5kb3cub3Blbih1cmwsICdfYmxhbmsnLCAnbm9vcGVuZXIsbm9yZWZlcnJlcicpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBcIlNob3cgc2V0dXAgZ3VpZGVcIiBidXR0b24gaXMgaGFuZGxlZCBieSBpbml0R3VpZGUoKSB3aGVuIHRoZSBibG9ja2VkIG92ZXJsYXkgaXMgc2hvd24uXHJcblxyXG4gIC8vIOKUgOKUgCBIb3ZlciByZXZlYWwg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcbiAgLy8gU2hvdyB0b29sYmFyIHdoZW4gbW91c2UgZW50ZXJzIHRvcCA0MCBweDsgaGlkZSBhZnRlciBhIHNob3J0IGRlbGF5IG9uIGxlYXZlLlxyXG4gIGNvbnN0IHRvb2xiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbGJhcicpIGFzIEhUTUxFbGVtZW50O1xyXG4gIGxldCBoaWRlVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIGNvbnN0IHNob3cgPSAoKTogdm9pZCA9PiB7XHJcbiAgICBpZiAoaGlkZVRpbWVyKSB7IGNsZWFyVGltZW91dChoaWRlVGltZXIpOyBoaWRlVGltZXIgPSBudWxsOyB9XHJcbiAgICB0b29sYmFyLmNsYXNzTGlzdC5hZGQoJ3Zpc2libGUnKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBzY2hlZHVsZUhpZGUgPSAoKTogdm9pZCA9PiB7XHJcbiAgICBoaWRlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRvb2xiYXIuY2xhc3NMaXN0LnJlbW92ZSgndmlzaWJsZScpLCA0MDApO1xyXG4gIH07XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZS5jbGllbnRZIDwgNDApIHtcclxuICAgICAgc2hvdygpO1xyXG4gICAgfSBlbHNlIGlmICghdG9vbGJhci5tYXRjaGVzKCc6aG92ZXInKSkge1xyXG4gICAgICBzY2hlZHVsZUhpZGUoKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgdG9vbGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgc2hvdyk7XHJcbiAgdG9vbGJhci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgc2NoZWR1bGVIaWRlKTtcclxuXHJcbiAgLy8gS2V5Ym9hcmQ6IHJldmVhbCB0b29sYmFyIHdoZW4gZm9jdXMgZW50ZXJzIGl0XHJcbiAgdG9vbGJhci5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgc2hvdyk7XHJcbiAgdG9vbGJhci5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHNjaGVkdWxlSGlkZSk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBCbG9ja2VkLW92ZXJsYXkgYWN0aW9ucyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBXaXJlIHRoZSB0d28gYWN0aW9uIGJ1dHRvbnMgaW5zaWRlIHRoZSBibG9ja2VkIG92ZXJsYXkuICovXHJcbmZ1bmN0aW9uIGluaXRCbG9ja2VkQWN0aW9ucyh1cmw6IHN0cmluZyk6IHZvaWQge1xyXG4gIC8vIFwiT3BlbiBkaXJlY3RseVwiIOKAlCBuYXZpZ2F0ZSB0aGUgdmlld2VyIHdpbmRvdyBpdHNlbGYgdG8gdGhlIHRhcmdldCBVUkwuXHJcbiAgLy8gV29ya3MgYmVjYXVzZSBkaXNwbGF5RGlhbG9nQXN5bmMgb3BlbnMgYSByZWFsIGJyb3dzZXIgd2luZG93LlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tbmF2aWdhdGUtZGlyZWN0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFwiT3BlbiBpbiBicm93c2VyXCIg4oCUIG9wZW4gaW4gYSBuZXcgc3lzdGVtIGJyb3dzZXIgdGFiLlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tb3Blbi1leHRlcm5hbCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycsICdub29wZW5lcixub3JlZmVycmVyJyk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBPd24tc2l0ZSBndWlkZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKiBTZXQgdXAgdGhlIGNvbGxhcHNpYmxlIGd1aWRlIHBhbmVsOiB0b2dnbGUsIHRhYnMsIGNvcHkgYnV0dG9ucy4gKi9cclxuZnVuY3Rpb24gaW5pdEd1aWRlKCk6IHZvaWQge1xyXG4gIGNvbnN0IHRvZ2dsZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tdG9nZ2xlLWd1aWRlJyk7XHJcbiAgY29uc3QgcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ3VpZGUtcGFuZWwnKTtcclxuICBpZiAoIXRvZ2dsZUJ0biB8fCAhcGFuZWwpIHJldHVybjtcclxuXHJcbiAgLy8gVG9nZ2xlIHZpc2liaWxpdHlcclxuICB0b2dnbGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBjb25zdCBvcGVuaW5nID0gcGFuZWwuaGlkZGVuO1xyXG4gICAgcGFuZWwuaGlkZGVuID0gIW9wZW5pbmc7XHJcbiAgICB0b2dnbGVCdG4udGV4dENvbnRlbnQgPSBpMThuLnQob3BlbmluZyA/ICdoaWRlU2V0dXBHdWlkZScgOiAnc2hvd1NldHVwR3VpZGUnKTtcclxuICAgIHRvZ2dsZUJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbmluZykpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBUYWIgc3dpdGNoaW5nXHJcbiAgY29uc3QgdGFicyA9IEFycmF5LmZyb20ocGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5ndWlkZS10YWInKSk7XHJcbiAgY29uc3QgY29kZVBhbmVscyA9IHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuZ3VpZGUtY29kZScpO1xyXG5cclxuICBmdW5jdGlvbiBhY3RpdmF0ZVRhYih0YXJnZXQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGFicy5mb3JFYWNoKCh0KSA9PiB7XHJcbiAgICAgIGNvbnN0IGlzQWN0aXZlID0gdC5kYXRhc2V0LnRhYiA9PT0gdGFyZ2V0O1xyXG4gICAgICB0LmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGlzQWN0aXZlKTtcclxuICAgICAgdC5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCBTdHJpbmcoaXNBY3RpdmUpKTtcclxuICAgICAgKHQgYXMgSFRNTEVsZW1lbnQpLnRhYkluZGV4ID0gaXNBY3RpdmUgPyAwIDogLTE7XHJcbiAgICAgIGlmIChpc0FjdGl2ZSkgKHQgYXMgSFRNTEVsZW1lbnQpLmZvY3VzKCk7XHJcbiAgICB9KTtcclxuICAgIGNvZGVQYW5lbHMuZm9yRWFjaCgocCkgPT4ge1xyXG4gICAgICBwLmhpZGRlbiA9IHAuZGF0YXNldC50YWJQYW5lbCAhPT0gdGFyZ2V0O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0YWJzLmZvckVhY2goKHRhYikgPT4ge1xyXG4gICAgdGFiLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gYWN0aXZhdGVUYWIodGFiLmRhdGFzZXQudGFiISkpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBBcnJvdyBrZXkgbmF2aWdhdGlvbiBmb3IgdGFic1xyXG4gIHBhbmVsLnF1ZXJ5U2VsZWN0b3IoJy5ndWlkZS10YWJzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcclxuICAgIGNvbnN0IGN1cnJlbnQgPSB0YWJzLmZpbmRJbmRleCgodCkgPT4gdC5nZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKTtcclxuICAgIGxldCBuZXh0ID0gLTE7XHJcblxyXG4gICAgaWYgKGUua2V5ID09PSAnQXJyb3dSaWdodCcpIG5leHQgPSAoY3VycmVudCArIDEpICUgdGFicy5sZW5ndGg7XHJcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gJ0Fycm93TGVmdCcpIG5leHQgPSAoY3VycmVudCAtIDEgKyB0YWJzLmxlbmd0aCkgJSB0YWJzLmxlbmd0aDtcclxuICAgIGVsc2UgaWYgKGUua2V5ID09PSAnSG9tZScpIG5leHQgPSAwO1xyXG4gICAgZWxzZSBpZiAoZS5rZXkgPT09ICdFbmQnKSBuZXh0ID0gdGFicy5sZW5ndGggLSAxO1xyXG4gICAgZWxzZSByZXR1cm47XHJcblxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgYWN0aXZhdGVUYWIodGFic1tuZXh0XS5kYXRhc2V0LnRhYiEpO1xyXG4gIH0pIGFzIEV2ZW50TGlzdGVuZXIpO1xyXG5cclxuICAvLyBDb3B5IGJ1dHRvbnNcclxuICBwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PignLmJ0bi1jb3B5JykuZm9yRWFjaCgoYnRuKSA9PiB7XHJcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGtleSA9IGJ0bi5kYXRhc2V0LmNvcHlUYXJnZXQ7XHJcbiAgICAgIGlmICgha2V5IHx8ICFDT0RFX1NOSVBQRVRTW2tleV0pIHJldHVybjtcclxuXHJcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KENPREVfU05JUFBFVFNba2V5XSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSBidG4udGV4dENvbnRlbnQ7XHJcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gaTE4bi50KCdjb3BpZWQnKTtcclxuICAgICAgICBidG4uY2xhc3NMaXN0LmFkZCgnY29waWVkJyk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbDtcclxuICAgICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdjb3BpZWQnKTtcclxuICAgICAgICB9LCAxNTAwKTtcclxuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIC8vIENsaXBib2FyZCBBUEkgbm90IGF2YWlsYWJsZSDigJQgc2VsZWN0IHRleHQgaW4gdGhlIDxwcmU+IGFzIGZhbGxiYWNrXHJcbiAgICAgICAgY29uc3QgcHJlID0gYnRuLnBhcmVudEVsZW1lbnQ/LnF1ZXJ5U2VsZWN0b3IoJ3ByZScpO1xyXG4gICAgICAgIGlmIChwcmUpIHtcclxuICAgICAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhwcmUpO1xyXG4gICAgICAgICAgY29uc3Qgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgICAgc2VsPy5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgICAgIHNlbD8uYWRkUmFuZ2UocmFuZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEltYWdlIG1vZGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5jb25zdCBJTUFHRV9FWFRFTlNJT05TID0gL1xcLihwbmd8anBlP2d8Z2lmfHdlYnB8c3ZnKSQvaTtcclxuXHJcbi8qKiBDaGVjayBpZiBhIFVSTCBwb2ludHMgdG8gYW4gaW1hZ2UgZmlsZSBieSBpdHMgcGF0aG5hbWUgZXh0ZW5zaW9uLiAqL1xyXG5mdW5jdGlvbiBpc0ltYWdlVXJsKHVybDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBJTUFHRV9FWFRFTlNJT05TLnRlc3QobmV3IFVSTCh1cmwpLnBhdGhuYW1lKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBBZGQgYSBjYWNoZS1idXN0aW5nIHBhcmFtZXRlciB0byBmb3JjZSBmcmVzaCBpbWFnZSBsb2Fkcy4gKi9cclxuZnVuY3Rpb24gY2FjaGVCdXN0KHVybDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBzZXBhcmF0b3IgPSB1cmwuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JztcclxuICByZXR1cm4gYCR7dXJsfSR7c2VwYXJhdG9yfV90PSR7RGF0ZS5ub3coKX1gO1xyXG59XHJcblxyXG4vKiogQXBwbHkgem9vbSB0byB0aGUgaW1hZ2UgZWxlbWVudCB1c2luZyBDU1MgdHJhbnNmb3JtLiAqL1xyXG5mdW5jdGlvbiBhcHBseUltYWdlWm9vbShpbWc6IEhUTUxJbWFnZUVsZW1lbnQsIHpvb206IG51bWJlcik6IHZvaWQge1xyXG4gIGlmICh6b29tID09PSBERUZBVUxUX1pPT00pIHJldHVybjtcclxuICBjb25zdCBmYWN0b3IgPSB6b29tIC8gMTAwO1xyXG4gIGltZy5zdHlsZS50cmFuc2Zvcm0gPSBgc2NhbGUoJHtmYWN0b3J9KWA7XHJcbiAgaW1nLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9ICdjZW50ZXIgY2VudGVyJztcclxufVxyXG5cclxuLyoqIEluaXRpYWxpemUgaW1hZ2UgbW9kZTogZGlzcGxheSBhIHN0YXRpYyBpbWFnZSBpbnN0ZWFkIG9mIGFuIGlmcmFtZS4gKi9cclxuZnVuY3Rpb24gaW5pdEltYWdlTW9kZSh1cmw6IHN0cmluZywgem9vbTogbnVtYmVyLCBhdXRvQ2xvc2VTZWM6IG51bWJlcik6IHZvaWQge1xyXG4gIGNvbnN0IGlmcmFtZVdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZyYW1lLXdyYXBwZXInKTtcclxuICBjb25zdCBpbWFnZVdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1hZ2Utd3JhcHBlcicpO1xyXG4gIGNvbnN0IGltZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbWFnZS1mcmFtZScpIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XHJcblxyXG4gIGlmIChpZnJhbWVXcmFwcGVyKSBpZnJhbWVXcmFwcGVyLmhpZGRlbiA9IHRydWU7XHJcbiAgaWYgKGltYWdlV3JhcHBlcikgaW1hZ2VXcmFwcGVyLmhpZGRlbiA9IGZhbHNlO1xyXG5cclxuICBhcHBseUltYWdlWm9vbShpbWcsIHpvb20pO1xyXG5cclxuICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcclxuICAgIGxvZ0RlYnVnKCdJbWFnZSBsb2FkZWQ6JywgdXJsKTtcclxuICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdsb2FkZWQnLCB1cmwgfSk7XHJcblxyXG4gICAgLy8gUmV0dXJuIGZvY3VzIHRvIFBvd2VyUG9pbnQgc28gdGhlIGNsaWNrZXIvcmVtb3RlIHdvcmtzLlxyXG4gICAgLy8gVGhlIGltYWdlIHN0YXlzIHZpc2libGUgaW4gdGhlIGRpYWxvZyB3aW5kb3cuXHJcbiAgICAvLyBTbWFsbCBkZWxheSBlbnN1cmVzIHRoZSBkaWFsb2cgaGFzIGZpbmlzaGVkIHJlbmRlcmluZy5cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0cnkgeyB3aW5kb3cuYmx1cigpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH0sIDMwMCk7XHJcblxyXG4gICAgaWYgKGF1dG9DbG9zZVNlYyA+IDApIHN0YXJ0Q291bnRkb3duKGF1dG9DbG9zZVNlYyk7XHJcbiAgfSk7XHJcblxyXG4gIGltZy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsICgpID0+IHtcclxuICAgIGxvZ0Vycm9yKCdJbWFnZSBmYWlsZWQgdG8gbG9hZDonLCB1cmwpO1xyXG4gICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Vycm9yJywgdXJsLCBlcnJvcjogJ0ltYWdlIGZhaWxlZCB0byBsb2FkJyB9KTtcclxuICB9KTtcclxuXHJcbiAgaW1nLnNyYyA9IGNhY2hlQnVzdCh1cmwpO1xyXG59XHJcblxyXG4vLyDilIDilIDilIAgQXV0by1jbG9zZSBjb3VudGRvd24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG4vKiogU2hvdyBhIGNvdW50ZG93biBiYWRnZSBhbmQgYXV0by1jbG9zZSAob3Igc3RhbmRieSBpbiBzbGlkZXNob3cgbW9kZSkuICovXHJcbmZ1bmN0aW9uIHN0YXJ0Q291bnRkb3duKHNlY29uZHM6IG51bWJlcik6IHZvaWQge1xyXG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZG93bicpO1xyXG4gIGlmICghZWwpIHJldHVybjtcclxuXHJcbiAgbGV0IHJlbWFpbmluZyA9IHNlY29uZHM7XHJcbiAgZWwudGV4dENvbnRlbnQgPSBpMThuLnQoJ2NvdW50ZG93blRleHQnKS5yZXBsYWNlKCd7bn0nLCBTdHJpbmcocmVtYWluaW5nKSk7XHJcbiAgZWwuaGlkZGVuID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0IHRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgcmVtYWluaW5nLS07XHJcbiAgICBpZiAocmVtYWluaW5nIDw9IDApIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XHJcbiAgICAgIGVsLmhpZGRlbiA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoc2xpZGVzaG93TW9kZSkge1xyXG4gICAgICAgIC8vIFRFU1Q6IGNsb3NlIGRpYWxvZyB2aWEgaG9zdC1zaWRlIGxhdW5jaGVyLmNsb3NlKCkgaW5zdGVhZCBvZiBzdGFuZGJ5LlxyXG4gICAgICAgIC8vIFRoaXMgdGVzdHMgd2hldGhlciBkaWFsb2cuY2xvc2UoKSBleGl0cyBzbGlkZXNob3cgb3Igbm90LlxyXG4gICAgICAgIGxvZ0RlYnVnKCdBdXRvLWNsb3NlIHRpbWVyIGV4cGlyZWQgaW4gc2xpZGVzaG93IOKAlCBzZW5kaW5nIGNsb3NlIHRvIGhvc3QnKTtcclxuICAgICAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnY2xvc2UnIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdjbG9zZScgfSk7XHJcbiAgICAgICAgdHJ5IHsgd2luZG93LmNsb3NlKCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlbC50ZXh0Q29udGVudCA9IGkxOG4udCgnY291bnRkb3duVGV4dCcpLnJlcGxhY2UoJ3tufScsIFN0cmluZyhyZW1haW5pbmcpKTtcclxuICAgIH1cclxuICB9LCAxMDAwKTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIFNsaWRlc2hvdyBsaXZlLXVwZGF0ZSB2aWEgbG9jYWxTdG9yYWdlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG4vL1xyXG4vLyBEdXJpbmcgc2xpZGVzaG93LCB0aGUgdGFza3BhbmUgY2FuJ3QgY2xvc2UvcmVvcGVuIHRoZSBkaWFsb2cgKGl0IGV4aXRzXHJcbi8vIHNsaWRlc2hvdykuIEluc3RlYWQsIHRoZSB0YXNrcGFuZSB3cml0ZXMgdGhlIHRhcmdldCBVUkwgdG8gbG9jYWxTdG9yYWdlXHJcbi8vIGFuZCB0aGUgdmlld2VyIG5hdmlnYXRlcyB0byBpdC4gVGhpcyBhbGxvd3Mgc2VhbWxlc3Mgc2xpZGUgdHJhbnNpdGlvbnMuXHJcbi8vXHJcbi8vIEtleTogJ3dlYnBwdF9zbGlkZXNob3dfdXJsJ1xyXG4vLyBWYWx1ZTogVVJMIHN0cmluZyAoZW1wdHkgPSBzaG93IHN0YW5kYnkvYmxhbmspXHJcblxyXG4vKiogQ3VycmVudCB6b29tIChzZXQgZHVyaW5nIGluaXQsIHJldXNlZCBvbiBuYXZpZ2F0aW9uKS4gKi9cclxubGV0IGN1cnJlbnRab29tID0gREVGQVVMVF9aT09NO1xyXG5cclxuLyoqIFdoZXRoZXIgdGhlIHZpZXdlciBpcyBydW5uaW5nIGluIHNsaWRlc2hvdyBtb2RlIChkb24ndCBjbG9zZSBvbiB0aW1lcikuICovXHJcbmxldCBzbGlkZXNob3dNb2RlID0gZmFsc2U7XHJcblxyXG4vKiogSG93IHRvIGhpZGUgdGhlIGRpYWxvZyB3aW5kb3cgYWZ0ZXIgdGltZXIgZXhwaXJlcyBpbiBzbGlkZXNob3cgbW9kZS4gKi9cclxubGV0IGhpZGVNZXRob2RTZXR0aW5nOiBIaWRlTWV0aG9kID0gJ25vbmUnO1xyXG5cclxuLyoqIE5hdmlnYXRlIHRoZSB2aWV3ZXIgdG8gYSBuZXcgVVJMIChjYWxsZWQgZnJvbSBzdG9yYWdlIGxpc3RlbmVyKS4gKi9cclxuZnVuY3Rpb24gbmF2aWdhdGVUb1VybChuZXdVcmw6IHN0cmluZyk6IHZvaWQge1xyXG4gIGNvbnN0IGlmcmFtZVdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZyYW1lLXdyYXBwZXInKTtcclxuICBjb25zdCBpbWFnZVdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1hZ2Utd3JhcHBlcicpO1xyXG4gIGNvbnN0IHN0YW5kYnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhbmRieS1vdmVybGF5Jyk7XHJcbiAgY29uc3QgYmxvY2tlZE92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmxvY2tlZC1vdmVybGF5Jyk7XHJcbiAgY29uc3Qgbm9VcmxNc2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm8tdXJsLW1lc3NhZ2UnKTtcclxuXHJcbiAgaWYgKCFuZXdVcmwpIHtcclxuICAgIC8vIFNob3cgc3RhbmRieSBzdGF0ZSAoYmxhY2svYmxhbmsgc2NyZWVuKVxyXG4gICAgaWYgKGlmcmFtZVdyYXBwZXIpIGlmcmFtZVdyYXBwZXIuaGlkZGVuID0gdHJ1ZTtcclxuICAgIGlmIChpbWFnZVdyYXBwZXIpIGltYWdlV3JhcHBlci5oaWRkZW4gPSB0cnVlO1xyXG4gICAgaWYgKGJsb2NrZWRPdmVybGF5KSBibG9ja2VkT3ZlcmxheS5oaWRkZW4gPSB0cnVlO1xyXG4gICAgaWYgKG5vVXJsTXNnKSBub1VybE1zZy5oaWRkZW4gPSB0cnVlO1xyXG4gICAgaWYgKHN0YW5kYnkpIHN0YW5kYnkuaGlkZGVuID0gZmFsc2U7XHJcbiAgICBsb2dEZWJ1ZygnVmlld2VyOiBzdGFuZGJ5IChubyBVUkwpJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBIaWRlIHN0YW5kYnksIHNob3cgY29udGVudFxyXG4gIGlmIChzdGFuZGJ5KSBzdGFuZGJ5LmhpZGRlbiA9IHRydWU7XHJcbiAgaWYgKGJsb2NrZWRPdmVybGF5KSBibG9ja2VkT3ZlcmxheS5oaWRkZW4gPSB0cnVlO1xyXG4gIGlmIChub1VybE1zZykgbm9VcmxNc2cuaGlkZGVuID0gdHJ1ZTtcclxuXHJcbiAgLy8gUmVzdG9yZSB3aW5kb3cgaWYgaXQgd2FzIGhpZGRlbiAobW92ZVRvL3Jlc2l6ZVRvKVxyXG4gIGlmIChzYXZlZFdpbmRvd1N0YXRlKSB7XHJcbiAgICBsb2dEZWJ1ZygnUmVzdG9yaW5nIHdpbmRvdyBiZWZvcmUgbmF2aWdhdGluZyB0byBuZXcgVVJMJyk7XHJcbiAgICBoYW5kbGVSZXN0b3JlKCk7XHJcbiAgfVxyXG5cclxuICBpZiAoaXNJbWFnZVVybChuZXdVcmwpKSB7XHJcbiAgICBpZiAoaWZyYW1lV3JhcHBlcikgaWZyYW1lV3JhcHBlci5oaWRkZW4gPSB0cnVlO1xyXG4gICAgaWYgKGltYWdlV3JhcHBlcikgaW1hZ2VXcmFwcGVyLmhpZGRlbiA9IGZhbHNlO1xyXG4gICAgY29uc3QgaW1nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltYWdlLWZyYW1lJykgYXMgSFRNTEltYWdlRWxlbWVudDtcclxuICAgIGFwcGx5SW1hZ2Vab29tKGltZywgY3VycmVudFpvb20pO1xyXG4gICAgaW1nLnNyYyA9IGNhY2hlQnVzdChuZXdVcmwpO1xyXG4gICAgbG9nRGVidWcoJ1ZpZXdlcjogbmF2aWdhdGVkIHRvIGltYWdlOicsIG5ld1VybCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGlmIChpbWFnZVdyYXBwZXIpIGltYWdlV3JhcHBlci5oaWRkZW4gPSB0cnVlO1xyXG4gICAgaWYgKGlmcmFtZVdyYXBwZXIpIGlmcmFtZVdyYXBwZXIuaGlkZGVuID0gZmFsc2U7XHJcbiAgICBjb25zdCBpZnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2ViLWZyYW1lJykgYXMgSFRNTElGcmFtZUVsZW1lbnQ7XHJcbiAgICBhcHBseVpvb20oaWZyYW1lLCBjdXJyZW50Wm9vbSk7XHJcbiAgICBpZnJhbWUuc3JjID0gbmV3VXJsO1xyXG4gICAgbG9nRGVidWcoJ1ZpZXdlcjogbmF2aWdhdGVkIHRvOicsIG5ld1VybCk7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgdG9vbGJhciBVUkxcclxuICBjb25zdCB1cmxMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sYmFyLXVybCcpO1xyXG4gIGlmICh1cmxMYWJlbCkge1xyXG4gICAgdXJsTGFiZWwudGV4dENvbnRlbnQgPSB0cnVuY2F0ZVVybChuZXdVcmwpO1xyXG4gICAgdXJsTGFiZWwudGl0bGUgPSBuZXdVcmw7XHJcbiAgfVxyXG5cclxuICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAncmVhZHknLCB1cmw6IG5ld1VybCB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSB0aGUgaG9zdCAodGFza3BhbmUpIHZpYSBPZmZpY2UuanMgRGlhbG9nQXBpIDEuMi5cclxuICpcclxuICogVGhlIHRhc2twYW5lIGNhbGxzIGBkaWFsb2cubWVzc2FnZUNoaWxkKEpTT04uc3RyaW5naWZ5KHthY3Rpb24sIHVybH0pKWAuXHJcbiAqIFRoZSB2aWV3ZXIgcmVjZWl2ZXMgaXQgdmlhIGBEaWFsb2dQYXJlbnRNZXNzYWdlUmVjZWl2ZWRgIGV2ZW50LlxyXG4gKlxyXG4gKiBUaGlzIGlzIHRoZSBvZmZpY2lhbCB0d28td2F5IGNvbW11bmljYXRpb24gbWVjaGFuaXNtIGZvciBPZmZpY2UgYWRkLWluIGRpYWxvZ3MuXHJcbiAqIGxvY2FsU3RvcmFnZSBkb2VzIE5PVCB3b3JrIGJldHdlZW4gV2ViVmlldzIgcHJvY2Vzc2VzIG9uIE9mZmljZSBEZXNrdG9wLlxyXG4gKi9cclxuaW50ZXJmYWNlIFBhcmVudE1lc3NhZ2Uge1xyXG4gIGFjdGlvbjogJ25hdmlnYXRlJyB8ICdzdGFuZGJ5JyB8ICdoaWRlLW1vdmUnIHwgJ2hpZGUtcmVzaXplJyB8ICdyZXN0b3JlJztcclxuICB1cmw/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBTYXZlZCB3aW5kb3cgcG9zaXRpb24vc2l6ZSBiZWZvcmUgaGlkaW5nLCBmb3IgcmVzdG9yZS4gKi9cclxubGV0IHNhdmVkV2luZG93U3RhdGU6IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHc6IG51bWJlcjsgaDogbnVtYmVyIH0gfCBudWxsID0gbnVsbDtcclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUhpZGVNb3ZlKCk6IHN0cmluZyB7XHJcbiAgY29uc3QgYnggPSB3aW5kb3cuc2NyZWVuWCwgYnkgPSB3aW5kb3cuc2NyZWVuWTtcclxuICBzYXZlZFdpbmRvd1N0YXRlID0geyB4OiBieCwgeTogYnksIHc6IHdpbmRvdy5vdXRlcldpZHRoLCBoOiB3aW5kb3cub3V0ZXJIZWlnaHQgfTtcclxuICB0cnkgeyB3aW5kb3cubW92ZVRvKC0zMjAwMCwgLTMyMDAwKTsgfSBjYXRjaCB7IC8qICovIH1cclxuICBjb25zdCBheCA9IHdpbmRvdy5zY3JlZW5YLCBheSA9IHdpbmRvdy5zY3JlZW5ZO1xyXG4gIGNvbnN0IG1vdmVkID0gYnggIT09IGF4IHx8IGJ5ICE9PSBheTtcclxuICBjb25zdCByZXN1bHQgPSBgbW92ZVRvOiAoJHtieH0sJHtieX0p4oaSKCR7YXh9LCR7YXl9KSBtb3ZlZD0ke21vdmVkfWA7XHJcbiAgbG9nRGVidWcocmVzdWx0KTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVIaWRlUmVzaXplKCk6IHN0cmluZyB7XHJcbiAgY29uc3QgYncgPSB3aW5kb3cub3V0ZXJXaWR0aCwgYmggPSB3aW5kb3cub3V0ZXJIZWlnaHQ7XHJcbiAgc2F2ZWRXaW5kb3dTdGF0ZSA9IHsgeDogd2luZG93LnNjcmVlblgsIHk6IHdpbmRvdy5zY3JlZW5ZLCB3OiBidywgaDogYmggfTtcclxuICB0cnkgeyB3aW5kb3cucmVzaXplVG8oMSwgMSk7IH0gY2F0Y2ggeyAvKiAqLyB9XHJcbiAgY29uc3QgYXcgPSB3aW5kb3cub3V0ZXJXaWR0aCwgYWggPSB3aW5kb3cub3V0ZXJIZWlnaHQ7XHJcbiAgY29uc3QgcmVzaXplZCA9IGJ3ICE9PSBhdyB8fCBiaCAhPT0gYWg7XHJcbiAgY29uc3QgcmVzdWx0ID0gYHJlc2l6ZVRvOiAoJHtid314JHtiaH0p4oaSKCR7YXd9eCR7YWh9KSByZXNpemVkPSR7cmVzaXplZH1gO1xyXG4gIGxvZ0RlYnVnKHJlc3VsdCk7XHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlUmVzdG9yZSgpOiBzdHJpbmcge1xyXG4gIGlmICghc2F2ZWRXaW5kb3dTdGF0ZSkgcmV0dXJuICdyZXN0b3JlOiBubyBzYXZlZCBzdGF0ZSc7XHJcbiAgdHJ5IHtcclxuICAgIHdpbmRvdy5tb3ZlVG8oc2F2ZWRXaW5kb3dTdGF0ZS54LCBzYXZlZFdpbmRvd1N0YXRlLnkpO1xyXG4gICAgd2luZG93LnJlc2l6ZVRvKHNhdmVkV2luZG93U3RhdGUudywgc2F2ZWRXaW5kb3dTdGF0ZS5oKTtcclxuICB9IGNhdGNoIHsgLyogKi8gfVxyXG4gIGNvbnN0IHJlc3VsdCA9IGByZXN0b3JlZCB0byAoJHtzYXZlZFdpbmRvd1N0YXRlLnh9LCR7c2F2ZWRXaW5kb3dTdGF0ZS55fSkgJHtzYXZlZFdpbmRvd1N0YXRlLnd9eCR7c2F2ZWRXaW5kb3dTdGF0ZS5ofWA7XHJcbiAgc2F2ZWRXaW5kb3dTdGF0ZSA9IG51bGw7XHJcbiAgbG9nRGVidWcocmVzdWx0KTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0UGFyZW50TWVzc2FnZUxpc3RlbmVyKCk6IHZvaWQge1xyXG4gIHRyeSB7XHJcbiAgICBPZmZpY2UuY29udGV4dC51aS5hZGRIYW5kbGVyQXN5bmMoXHJcbiAgICAgIE9mZmljZS5FdmVudFR5cGUuRGlhbG9nUGFyZW50TWVzc2FnZVJlY2VpdmVkLFxyXG4gICAgICAoYXJnOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICAgIGlmICghYXJnLm1lc3NhZ2UpIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgbXNnOiBQYXJlbnRNZXNzYWdlID0gSlNPTi5wYXJzZShhcmcubWVzc2FnZSk7XHJcbiAgICAgICAgICBsb2dEZWJ1ZygnVmlld2VyOiBwYXJlbnQgbWVzc2FnZTonLCBtc2cuYWN0aW9uLCBtc2cudXJsID8/ICcnKTtcclxuXHJcbiAgICAgICAgICBzd2l0Y2ggKG1zZy5hY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSAnbmF2aWdhdGUnOlxyXG4gICAgICAgICAgICAgIGlmIChtc2cudXJsKSBuYXZpZ2F0ZVRvVXJsKG1zZy51cmwpO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzdGFuZGJ5JzpcclxuICAgICAgICAgICAgICBuYXZpZ2F0ZVRvVXJsKCcnKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnaGlkZS1tb3ZlJzoge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHIxID0gaGFuZGxlSGlkZU1vdmUoKTtcclxuICAgICAgICAgICAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnbG9hZGVkJywgdXJsOiByMSB9KTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdoaWRlLXJlc2l6ZSc6IHtcclxuICAgICAgICAgICAgICBjb25zdCByMiA9IGhhbmRsZUhpZGVSZXNpemUoKTtcclxuICAgICAgICAgICAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnbG9hZGVkJywgdXJsOiByMiB9KTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdyZXN0b3JlJzoge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHIzID0gaGFuZGxlUmVzdG9yZSgpO1xyXG4gICAgICAgICAgICAgIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdsb2FkZWQnLCB1cmw6IHIzIH0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICBsb2dEZWJ1ZygnVmlld2VyOiBmYWlsZWQgdG8gcGFyc2UgcGFyZW50IG1lc3NhZ2U6JywgU3RyaW5nKGVycikpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBPZmZpY2UuQXN5bmNSZXN1bHRTdGF0dXMuU3VjY2VlZGVkKSB7XHJcbiAgICAgICAgICBsb2dEZWJ1ZygnVmlld2VyOiBwYXJlbnQgbWVzc2FnZSBoYW5kbGVyIHJlZ2lzdGVyZWQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbG9nRGVidWcoJ1ZpZXdlcjogZmFpbGVkIHRvIHJlZ2lzdGVyIHBhcmVudCBtZXNzYWdlIGhhbmRsZXI6JywgSlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgKTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGxvZ0RlYnVnKCdWaWV3ZXI6IERpYWxvZ1BhcmVudE1lc3NhZ2VSZWNlaXZlZCBub3Qgc3VwcG9ydGVkOicsIFN0cmluZyhlcnIpKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBNYWluIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZnVuY3Rpb24gaW5pdCgpOiB2b2lkIHtcclxuICBjb25zdCB7IHVybCwgem9vbSwgbGFuZywgYXV0b0Nsb3NlU2VjLCBzbGlkZXNob3csIGhpZGVNZXRob2QgfSA9IHBhcnNlUGFyYW1zKCk7XHJcbiAgY3VycmVudFpvb20gPSB6b29tO1xyXG4gIHNsaWRlc2hvd01vZGUgPSBzbGlkZXNob3c7XHJcbiAgaGlkZU1ldGhvZFNldHRpbmcgPSBoaWRlTWV0aG9kO1xyXG5cclxuICBpMThuLnNldExvY2FsZShwYXJzZUxvY2FsZShsYW5nKSk7XHJcbiAgYXBwbHlJMThuKCk7XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgVVJMIHVwZGF0ZXMgZnJvbSB0YXNrcGFuZSB2aWEgT2ZmaWNlLmpzIG1lc3NhZ2VDaGlsZCAoRGlhbG9nQXBpIDEuMilcclxuICBpbml0UGFyZW50TWVzc2FnZUxpc3RlbmVyKCk7XHJcblxyXG4gIGlmICghdXJsKSB7XHJcbiAgICBzaG93Tm9VcmxVSSgpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgbmV0d29yayBiZWZvcmUgbG9hZGluZ1xyXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAhbmF2aWdhdG9yLm9uTGluZSkge1xyXG4gICAgbG9nRGVidWcoJ0Jyb3dzZXIgaXMgb2ZmbGluZSwgc2hvd2luZyBvZmZsaW5lIFVJJyk7XHJcbiAgICBzaG93T2ZmbGluZVVJKCk7XHJcbiAgICAvLyBSZS1jaGVjayB3aGVuIGNvbm5lY3Rpb24gaXMgcmVzdG9yZWRcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCAoKSA9PiB7XHJcbiAgICAgIGxvZ0RlYnVnKCdDb25uZWN0aW9uIHJlc3RvcmVkLCByZWxvYWRpbmcnKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xyXG4gICAgc2VuZFRvUGFyZW50KHsgdHlwZTogJ2Vycm9yJywgdXJsLCBlcnJvcjogJ05vIGludGVybmV0IGNvbm5lY3Rpb24nIH0pO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaW5pdFRvb2xiYXIodXJsKTtcclxuXHJcbiAgLy8gSW1hZ2UgbW9kZTogYXV0by1kZXRlY3RlZCBieSBVUkwgZXh0ZW5zaW9uXHJcbiAgaWYgKGlzSW1hZ2VVcmwodXJsKSkge1xyXG4gICAgbG9nRGVidWcoJ0ltYWdlIFVSTCBkZXRlY3RlZCwgdXNpbmcgaW1hZ2UgbW9kZScpO1xyXG4gICAgaW5pdEltYWdlTW9kZSh1cmwsIHpvb20sIGF1dG9DbG9zZVNlYyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIElmcmFtZSBtb2RlIChkZWZhdWx0KVxyXG4gICAgY29uc3QgaWZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dlYi1mcmFtZScpIGFzIEhUTUxJRnJhbWVFbGVtZW50O1xyXG4gICAgYXBwbHlab29tKGlmcmFtZSwgem9vbSk7XHJcbiAgICBkZXRlY3RCbG9ja2luZyhpZnJhbWUsIHVybCwgYXV0b0Nsb3NlU2VjKTtcclxuICAgIGlmcmFtZS5zcmMgPSB1cmw7XHJcbiAgfVxyXG5cclxuICAvLyBMaXN0ZW4gZm9yIGdvaW5nIG9mZmxpbmUgYWZ0ZXIgaW5pdGlhbCBsb2FkXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29mZmxpbmUnLCAoKSA9PiB7XHJcbiAgICBsb2dEZWJ1ZygnQ29ubmVjdGlvbiBsb3N0Jyk7XHJcbiAgICBzaG93T2ZmbGluZVVJKCk7XHJcbiAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnZXJyb3InLCB1cmwsIGVycm9yOiAnQ29ubmVjdGlvbiBsb3N0JyB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gRXNjYXBlIGtleSBjbG9zZXMgdGhlIHZpZXdlclxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xyXG4gICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xyXG4gICAgICBzZW5kVG9QYXJlbnQoeyB0eXBlOiAnY2xvc2UnIH0pO1xyXG4gICAgICB0cnkgeyB3aW5kb3cuY2xvc2UoKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHNlbmRUb1BhcmVudCh7IHR5cGU6ICdyZWFkeScsIHVybCB9KTtcclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEJvb3RzdHJhcCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbi8qKlxyXG4gKiAtIE9mZmljZSBjb250ZXh0OiBkZWZlciB1bnRpbCBPZmZpY2Uub25SZWFkeSgpIHRvIGd1YXJhbnRlZSBPZmZpY2UuanMgQVBJcy5cclxuICogLSBTdGFuZGFsb25lIChubyBPZmZpY2UuanMgQ0ROLCBkZXYgYnJvd3Nlcik6IHJ1biBvbiBET01Db250ZW50TG9hZGVkLlxyXG4gKi9cclxuZnVuY3Rpb24gc3RhcnQoKTogdm9pZCB7XHJcbiAgaW5zdGFsbFVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZXIoKTtcclxuXHJcbiAgaWYgKHR5cGVvZiBPZmZpY2UgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBPZmZpY2Uub25SZWFkeSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgT2ZmaWNlLm9uUmVhZHkoKCkgPT4gaW5pdCgpKTtcclxuICB9IGVsc2UgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBpbml0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5zdGFydCgpO1xyXG4iLCIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=