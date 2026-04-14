import {
  _injectSettingsStore,
  getSlideConfig,
  setSlideConfig,
  removeSlideConfig,
  getLanguage,
  setLanguage,
  getDefaults,
  setDefaults,
  type WebPPTSlideConfig,
} from '../src/shared/settings';
import {
  DEFAULT_ZOOM,
  DEFAULT_DIALOG_WIDTH,
  DEFAULT_DIALOG_HEIGHT,
  DEFAULT_AUTO_OPEN,
  DEFAULT_AUTO_CLOSE_SEC,
  SETTING_KEY_SLIDE_PREFIX,
  SETTING_KEY_LANGUAGE,
  SETTING_KEY_DEFAULTS,
} from '../src/shared/constants';

// ─── Mock store factory ───────────────────────────────────────────────────────

function createMockStore() {
  const data: Record<string, unknown> = {};
  let failOnSave = false;

  return {
    get: (key: string) => data[key] ?? null,
    set: (key: string, value: unknown) => { data[key] = value; },
    remove: (key: string) => { delete data[key]; },
    saveAsync: (cb: (r: { status: string; error: { message: string } | null }) => void) => {
      cb(failOnSave
        ? { status: 'failed', error: { message: 'Disk full' } }
        : { status: 'succeeded', error: null });
    },
    /** Test helper: make saveAsync fail. */
    setFailOnSave: (v: boolean) => { failOnSave = v; },
    /** Direct data access for assertions. */
    data,
  };
}

let store: ReturnType<typeof createMockStore>;

beforeEach(() => {
  store = createMockStore();
  _injectSettingsStore(store);
});

afterAll(() => {
  _injectSettingsStore(null);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SLIDE_ID = 'slide-abc-123';
const SLIDE_KEY = `${SETTING_KEY_SLIDE_PREFIX}${SLIDE_ID}`;

const sampleConfig: WebPPTSlideConfig = {
  url: 'https://example.com',
  zoom: 120,
  dialogWidth: 75,
  dialogHeight: 70,
  autoOpen: true,
  autoCloseSec: 10,
};

// ─── constants.ts sanity ─────────────────────────────────────────────────────

describe('constants', () => {
  it('slide prefix is correct', () => {
    expect(SETTING_KEY_SLIDE_PREFIX).toBe('webppt_slide_');
  });

  it('language key is correct', () => {
    expect(SETTING_KEY_LANGUAGE).toBe('webppt_language');
  });

  it('defaults key is correct', () => {
    expect(SETTING_KEY_DEFAULTS).toBe('webppt_defaults');
  });

  it('built-in defaults are sensible', () => {
    expect(DEFAULT_ZOOM).toBe(100);
    expect(DEFAULT_DIALOG_WIDTH).toBe(80);
    expect(DEFAULT_DIALOG_HEIGHT).toBe(80);
    expect(DEFAULT_AUTO_OPEN).toBe(true);
  });
});

// ─── getSlideConfig / setSlideConfig ─────────────────────────────────────────

describe('getSlideConfig', () => {
  it('returns null when no config is saved', () => {
    expect(getSlideConfig(SLIDE_ID)).toBeNull();
  });

  it('returns saved config', async () => {
    await setSlideConfig(SLIDE_ID, sampleConfig);
    expect(getSlideConfig(SLIDE_ID)).toEqual(sampleConfig);
  });

  it('uses the correct storage key', async () => {
    await setSlideConfig(SLIDE_ID, sampleConfig);
    expect(store.data[SLIDE_KEY]).toEqual(sampleConfig);
  });

  it('different slide IDs are independent', async () => {
    const other = { ...sampleConfig, url: 'https://other.com' };
    await setSlideConfig('slide-1', sampleConfig);
    await setSlideConfig('slide-2', other);
    expect(getSlideConfig('slide-1')).toEqual(sampleConfig);
    expect(getSlideConfig('slide-2')).toEqual(other);
  });
});

describe('setSlideConfig', () => {
  it('overwrites a previously saved config', async () => {
    await setSlideConfig(SLIDE_ID, sampleConfig);
    const updated = { ...sampleConfig, url: 'https://updated.com', zoom: 150 };
    await setSlideConfig(SLIDE_ID, updated);
    expect(getSlideConfig(SLIDE_ID)).toEqual(updated);
  });

  it('rejects when saveAsync fails', async () => {
    store.setFailOnSave(true);
    await expect(setSlideConfig(SLIDE_ID, sampleConfig)).rejects.toThrow('Disk full');
  });
});

// ─── removeSlideConfig ────────────────────────────────────────────────────────

describe('removeSlideConfig', () => {
  it('removes a saved config', async () => {
    await setSlideConfig(SLIDE_ID, sampleConfig);
    await removeSlideConfig(SLIDE_ID);
    expect(getSlideConfig(SLIDE_ID)).toBeNull();
  });

  it('does not throw when removing a non-existent config', async () => {
    await expect(removeSlideConfig('nonexistent-slide')).resolves.toBeUndefined();
  });

  it('rejects when saveAsync fails', async () => {
    store.setFailOnSave(true);
    await expect(removeSlideConfig(SLIDE_ID)).rejects.toThrow('Disk full');
  });
});

// ─── getLanguage / setLanguage ────────────────────────────────────────────────

describe('getLanguage', () => {
  it('returns null when no language is saved', () => {
    expect(getLanguage()).toBeNull();
  });

  it('returns saved language', async () => {
    await setLanguage('ru');
    expect(getLanguage()).toBe('ru');
  });
});

describe('setLanguage', () => {
  it('saves each supported locale', async () => {
    for (const locale of ['en', 'ru', 'es'] as const) {
      await setLanguage(locale);
      expect(getLanguage()).toBe(locale);
    }
  });

  it('uses the correct storage key', async () => {
    await setLanguage('es');
    expect(store.data[SETTING_KEY_LANGUAGE]).toBe('es');
  });

  it('rejects when saveAsync fails', async () => {
    store.setFailOnSave(true);
    await expect(setLanguage('ru')).rejects.toThrow('Disk full');
  });
});

// ─── getDefaults / setDefaults ────────────────────────────────────────────────

describe('getDefaults', () => {
  it('returns built-in defaults when nothing is stored', () => {
    expect(getDefaults()).toEqual({
      url: '',
      zoom: DEFAULT_ZOOM,
      dialogWidth: DEFAULT_DIALOG_WIDTH,
      dialogHeight: DEFAULT_DIALOG_HEIGHT,
      autoOpen: DEFAULT_AUTO_OPEN,
      autoCloseSec: DEFAULT_AUTO_CLOSE_SEC,
    });
  });

  it('returns stored defaults after setDefaults', async () => {
    const custom: WebPPTSlideConfig = {
      url: '',
      zoom: 150,
      dialogWidth: 60,
      dialogHeight: 60,
      autoOpen: true,
      autoCloseSec: 15,
    };
    await setDefaults(custom);
    expect(getDefaults()).toEqual(custom);
  });
});

describe('setDefaults', () => {
  it('uses the correct storage key', async () => {
    await setDefaults(sampleConfig);
    expect(store.data[SETTING_KEY_DEFAULTS]).toEqual(sampleConfig);
  });

  it('rejects when saveAsync fails', async () => {
    store.setFailOnSave(true);
    await expect(setDefaults(sampleConfig)).rejects.toThrow('Disk full');
  });
});
