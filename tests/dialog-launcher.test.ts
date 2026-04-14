import {
  DialogLauncher,
  DialogError,
  DialogConfig,
  _injectDialogApi,
  _injectBaseUrl,
} from '../src/shared/dialog-launcher';

// Stub i18n — just return the key as the translated string.
jest.mock('../src/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockDialog() {
  return {
    close: jest.fn(),
    addEventHandler: jest.fn(),
  };
}

type EventHandler = (arg: { message?: string; error?: number }) => void;

/** Extract a registered handler by event type string. */
function getHandler(
  mockDialog: ReturnType<typeof createMockDialog>,
  eventType: string,
): EventHandler {
  const call = mockDialog.addEventHandler.mock.calls.find(
    ([type]: [string]) => type === eventType,
  );
  if (!call) throw new Error(`No handler registered for "${eventType}"`);
  return call[1] as EventHandler;
}

const BASE_URL = 'https://localhost:3000/viewer.html';

const DEFAULT_CONFIG: DialogConfig = {
  url: 'https://example.com',
  zoom: 100,
  width: 80,
  height: 80,
  lang: 'en',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DialogLauncher', () => {
  let launcher: DialogLauncher;
  let mockApi: { displayDialogAsync: jest.Mock };
  let mockDialog: ReturnType<typeof createMockDialog>;

  beforeEach(() => {
    mockDialog = createMockDialog();
    mockApi = {
      displayDialogAsync: jest.fn((_url, _opts, cb) => {
        cb({ status: 'succeeded', value: mockDialog, error: null });
      }),
    };

    _injectDialogApi(mockApi);
    _injectBaseUrl(BASE_URL);
    launcher = new DialogLauncher();
  });

  afterEach(() => {
    _injectDialogApi(null);
    _injectBaseUrl(null);
  });

  // ── open ───────────────────────────────────────────────────────────────

  describe('open', () => {
    it('calls displayDialogAsync with correct URL and options', async () => {
      await launcher.open(DEFAULT_CONFIG);

      expect(mockApi.displayDialogAsync).toHaveBeenCalledTimes(1);
      const [url, options] = mockApi.displayDialogAsync.mock.calls[0];

      expect(url).toContain(BASE_URL);
      expect(url).toContain('url=' + encodeURIComponent('https://example.com'));
      expect(url).toContain('zoom=100');
      expect(url).toContain('lang=en');

      expect(options).toEqual({
        width: 80,
        height: 80,
        displayInIframe: false,
        promptBeforeOpen: false,
      });
    });

    it('includes autoclose param when autoCloseSec > 0', async () => {
      await launcher.open({ ...DEFAULT_CONFIG, autoCloseSec: 15 });
      const calledUrl: string = mockApi.displayDialogAsync.mock.calls[0][0];
      expect(calledUrl).toContain('autoclose=15');
    });

    it('omits autoclose param when autoCloseSec is 0', async () => {
      await launcher.open({ ...DEFAULT_CONFIG, autoCloseSec: 0 });
      const calledUrl: string = mockApi.displayDialogAsync.mock.calls[0][0];
      expect(calledUrl).not.toContain('autoclose');
    });

    it('encodes special characters in the target URL', async () => {
      await launcher.open({
        ...DEFAULT_CONFIG,
        url: 'https://example.com/path?foo=bar&baz=1',
      });

      const calledUrl: string = mockApi.displayDialogAsync.mock.calls[0][0];
      expect(calledUrl).toContain(
        'url=' + encodeURIComponent('https://example.com/path?foo=bar&baz=1'),
      );
    });

    it('sets isOpen() to true after success', async () => {
      expect(launcher.isOpen()).toBe(false);
      await launcher.open(DEFAULT_CONFIG);
      expect(launcher.isOpen()).toBe(true);
    });

    it('registers both event handlers on the dialog', async () => {
      await launcher.open(DEFAULT_CONFIG);
      expect(mockDialog.addEventHandler).toHaveBeenCalledTimes(2);
      expect(mockDialog.addEventHandler).toHaveBeenCalledWith(
        'dialogMessageReceived',
        expect.any(Function),
      );
      expect(mockDialog.addEventHandler).toHaveBeenCalledWith(
        'dialogEventReceived',
        expect.any(Function),
      );
    });

    it('auto-closes an existing dialog and reopens successfully', async () => {
      await launcher.open(DEFAULT_CONFIG);
      expect(launcher.isOpen()).toBe(true);

      // Second open should auto-close the first and succeed
      await launcher.open(DEFAULT_CONFIG);
      expect(mockDialog.close).toHaveBeenCalledTimes(1);
      expect(launcher.isOpen()).toBe(true);
      expect(mockApi.displayDialogAsync).toHaveBeenCalledTimes(2);
    });

    it('rejects with dialogAlreadyOpen for Office error 12007', async () => {
      mockApi.displayDialogAsync.mockImplementation((_u: string, _o: unknown, cb: Function) => {
        cb({ status: 'failed', error: { code: 12007, message: 'Already opened' } });
      });

      await expect(launcher.open(DEFAULT_CONFIG)).rejects.toMatchObject({
        i18nKey: 'dialogAlreadyOpen',
        officeCode: 12007,
      });
    });

    it('rejects with dialogBlocked for Office error 12009 (popup blocker)', async () => {
      mockApi.displayDialogAsync.mockImplementation((_u: string, _o: unknown, cb: Function) => {
        cb({ status: 'failed', error: { code: 12009, message: 'Popup blocked' } });
      });

      await expect(launcher.open(DEFAULT_CONFIG)).rejects.toMatchObject({
        i18nKey: 'dialogBlocked',
        officeCode: 12009,
      });
    });

    it('rejects with errorGeneric for unknown Office error codes', async () => {
      mockApi.displayDialogAsync.mockImplementation((_u: string, _o: unknown, cb: Function) => {
        cb({ status: 'failed', error: { code: 12002, message: 'Domain error' } });
      });

      await expect(launcher.open(DEFAULT_CONFIG)).rejects.toMatchObject({
        i18nKey: 'errorGeneric',
        officeCode: 12002,
      });
    });
  });

  // ── close ──────────────────────────────────────────────────────────────

  describe('close', () => {
    it('calls dialog.close() and sets isOpen() to false', async () => {
      await launcher.open(DEFAULT_CONFIG);
      launcher.close();
      expect(mockDialog.close).toHaveBeenCalledTimes(1);
      expect(launcher.isOpen()).toBe(false);
    });

    it('is safe to call when already closed', () => {
      expect(() => launcher.close()).not.toThrow();
      expect(mockDialog.close).not.toHaveBeenCalled();
    });

    it('is safe to call multiple times', async () => {
      await launcher.open(DEFAULT_CONFIG);
      launcher.close();
      launcher.close();
      expect(mockDialog.close).toHaveBeenCalledTimes(1);
    });
  });

  // ── onMessage ──────────────────────────────────────────────────────────

  describe('onMessage', () => {
    it('invokes callback when dialog sends a message', async () => {
      const cb = jest.fn();
      launcher.onMessage(cb);
      await launcher.open(DEFAULT_CONFIG);

      const handler = getHandler(mockDialog, 'dialogMessageReceived');
      handler({ message: '{"action":"navigate"}' });

      expect(cb).toHaveBeenCalledWith('{"action":"navigate"}');
    });

    it('does not invoke callback for empty messages', async () => {
      const cb = jest.fn();
      launcher.onMessage(cb);
      await launcher.open(DEFAULT_CONFIG);

      const handler = getHandler(mockDialog, 'dialogMessageReceived');
      handler({ message: '' });

      expect(cb).not.toHaveBeenCalled();
    });

    it('does not invoke callback for missing message property', async () => {
      const cb = jest.fn();
      launcher.onMessage(cb);
      await launcher.open(DEFAULT_CONFIG);

      const handler = getHandler(mockDialog, 'dialogMessageReceived');
      handler({});

      expect(cb).not.toHaveBeenCalled();
    });
  });

  // ── onClosed ───────────────────────────────────────────────────────────

  describe('onClosed', () => {
    it('invokes callback when dialog fires closed event (12002)', async () => {
      const cb = jest.fn();
      launcher.onClosed(cb);
      await launcher.open(DEFAULT_CONFIG);

      const handler = getHandler(mockDialog, 'dialogEventReceived');
      handler({ error: 12002 });

      expect(cb).toHaveBeenCalledTimes(1);
      expect(launcher.isOpen()).toBe(false);
    });

    it('invokes callback on cross-domain navigation (12006)', async () => {
      const cb = jest.fn();
      launcher.onClosed(cb);
      await launcher.open(DEFAULT_CONFIG);

      const handler = getHandler(mockDialog, 'dialogEventReceived');
      handler({ error: 12006 });

      expect(cb).toHaveBeenCalledTimes(1);
      expect(launcher.isOpen()).toBe(false);
    });

    it('allows re-opening after dialog is closed by event', async () => {
      launcher.onClosed(() => {});
      await launcher.open(DEFAULT_CONFIG);

      const handler = getHandler(mockDialog, 'dialogEventReceived');
      handler({ error: 12002 });

      // Should not throw — dialog slot is free again
      await expect(launcher.open(DEFAULT_CONFIG)).resolves.toBeUndefined();
    });
  });
});
