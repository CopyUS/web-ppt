import { i18n, type TranslationKey } from './i18n';
import { logDebug, logError } from './logger';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Filename of the viewer page built by webpack. */
export const VIEWER_PAGE = 'viewer.html';

/** Office displayDialogAsync error codes. */
const OPEN_ERR = {
  /** A dialog is already opened from this add-in. */
  ALREADY_OPENED: 12007,
  /** User dismissed the dialog prompt / popup blocker. */
  POPUP_BLOCKED: 12009,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DialogConfig {
  url: string;
  zoom: number;
  width: number;   // % of screen (10–100)
  height: number;  // % of screen (10–100)
  lang: string;
  autoCloseSec?: number;  // 0 or undefined = disabled
}

/** Typed error thrown by {@link DialogLauncher}. */
export class DialogError extends Error {
  constructor(
    public readonly i18nKey: TranslationKey,
    public readonly officeCode?: number,
  ) {
    super(i18n.t(i18nKey));
    this.name = 'DialogError';
  }
}

// ─── DI interfaces (testable without Office runtime) ─────────────────────────

/** Minimal subset of Office.Dialog used by this module. */
export interface OfficeDialog {
  close(): void;
  addEventHandler(
    eventType: string,
    handler: (arg: { message?: string; error?: number }) => void,
  ): void;
}

interface DialogOpenResult {
  status: string;
  value: OfficeDialog;
  error: { code: number; message: string };
}

/** Minimal subset of Office.context.ui needed for dialog operations. */
export interface DialogApi {
  displayDialogAsync(
    startAddress: string,
    options: Record<string, unknown>,
    callback: (result: DialogOpenResult) => void,
  ): void;
}

// ─── Dependency injection ────────────────────────────────────────────────────

let _injectedApi: DialogApi | null = null;
let _injectedBaseUrl: string | null = null;

/**
 * Override the Office dialog API. Pass `null` to restore the real one.
 * @internal Used in unit tests only.
 */
export function _injectDialogApi(api: DialogApi | null): void {
  _injectedApi = api;
}

/**
 * Override the viewer base URL. Pass `null` to restore auto-detection.
 * @internal Used in unit tests only.
 */
export function _injectBaseUrl(url: string | null): void {
  _injectedBaseUrl = url;
}

function getApi(): DialogApi {
  if (_injectedApi) return _injectedApi;
  return Office.context.ui as unknown as DialogApi;
}

function getViewerBaseUrl(): string {
  if (_injectedBaseUrl) return _injectedBaseUrl;
  const dir = window.location.pathname.replace(/\/[^/]*$/, '');
  return `${window.location.origin}${dir}/${VIEWER_PAGE}`;
}

// ─── DialogLauncher ──────────────────────────────────────────────────────────

export class DialogLauncher {
  private dialog: OfficeDialog | null = null;
  private messageCallback: ((message: string) => void) | null = null;
  private closedCallback: (() => void) | null = null;

  /** Build the full viewer URL with query parameters. */
  private buildViewerUrl(config: DialogConfig): string {
    const params = new URLSearchParams({
      url: config.url,
      zoom: String(config.zoom),
      lang: config.lang,
    });
    if (config.autoCloseSec && config.autoCloseSec > 0) {
      params.set('autoclose', String(config.autoCloseSec));
    }
    return `${getViewerBaseUrl()}?${params.toString()}`;
  }

  /**
   * Open the viewer dialog with the given configuration.
   * If a dialog is already open, closes it first and reopens.
   * Rejects with {@link DialogError} if the dialog cannot be opened.
   */
  async open(config: DialogConfig): Promise<void> {
    // Auto-close any existing dialog before opening a new one
    if (this.dialog) {
      logDebug('Closing existing dialog before opening a new one');
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
  private tryOpen(
    api: DialogApi,
    viewerUrl: string,
    config: DialogConfig,
    isRetry: boolean,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      api.displayDialogAsync(
        viewerUrl,
        {
          width: config.width,
          height: config.height,
          displayInIframe: false,
          promptBeforeOpen: false,
        },
        (result) => {
          if (result.status === 'failed') {
            // On first attempt, if Office says "already opened", retry once
            if (result.error.code === OPEN_ERR.ALREADY_OPENED && !isRetry) {
              logDebug('Got 12007 (already opened) — retrying after delay');
              setTimeout(() => {
                this.tryOpen(api, viewerUrl, config, true).then(resolve, reject);
              }, 300);
              return;
            }
            logError('displayDialogAsync failed:', result.error.code, result.error.message);
            reject(this.mapOpenError(result.error.code));
            return;
          }

          this.dialog = result.value;

          this.dialog.addEventHandler(
            'dialogMessageReceived',
            (arg) => this.handleMessage(arg),
          );

          this.dialog.addEventHandler(
            'dialogEventReceived',
            (arg) => this.handleEvent(arg),
          );

          logDebug('Dialog opened successfully');
          resolve();
        },
      );
    });
  }

  /** Close the dialog if it is open. Safe to call when already closed. */
  close(): void {
    if (!this.dialog) return;
    try {
      this.dialog.close();
    } catch (err) {
      logError('Error closing dialog:', err);
    }
    this.dialog = null;
  }

  /** Whether the dialog is currently open. */
  isOpen(): boolean {
    return this.dialog !== null;
  }

  /** Subscribe to messages sent from the viewer via `Office.context.ui.messageParent`. */
  onMessage(callback: (message: string) => void): void {
    this.messageCallback = callback;
  }

  /** Subscribe to the dialog being closed (by user or navigation error). */
  onClosed(callback: () => void): void {
    this.closedCallback = callback;
  }

  // ─── Private handlers ────────────────────────────────────────────────────

  private handleMessage(arg: { message?: string }): void {
    if (arg.message && this.messageCallback) {
      this.messageCallback(arg.message);
    }
  }

  private handleEvent(arg: { error?: number }): void {
    // All DialogEventReceived codes (12002 closed, 12003 mixed content,
    // 12006 cross-domain) mean the dialog is no longer usable.
    logDebug('Dialog event received, code:', arg.error);
    this.dialog = null;
    if (this.closedCallback) {
      this.closedCallback();
    }
  }

  private mapOpenError(code: number): DialogError {
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
