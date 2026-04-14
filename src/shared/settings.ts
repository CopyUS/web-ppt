import type { Locale } from './i18n';
import {
  SETTING_KEY_SLIDE_PREFIX,
  SETTING_KEY_LANGUAGE,
  SETTING_KEY_DEFAULTS,
  DEFAULT_ZOOM,
  DEFAULT_DIALOG_WIDTH,
  DEFAULT_DIALOG_HEIGHT,
  DEFAULT_AUTO_OPEN,
  DEFAULT_AUTO_CLOSE_SEC,
  SETTINGS_SAVE_MAX_RETRIES,
  SETTINGS_SAVE_RETRY_DELAY_MS,
} from './constants';
import { logDebug, logError } from './logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WebPPTSlideConfig {
  url: string;
  zoom: number;          // 50–300
  dialogWidth: number;   // 30–100 (% of screen)
  dialogHeight: number;  // 30–100 (% of screen)
  autoOpen: boolean;
  autoCloseSec: number;  // 0 = disabled, 1–60 seconds
}

interface SaveResult {
  status: string;
  error: { message: string } | null;
}

/** Minimal subset of Office.Settings used by this module. */
interface SettingsStore {
  get(name: string): unknown;
  set(name: string, value: unknown): void;
  remove(name: string): void;
  saveAsync(callback: (result: SaveResult) => void): void;
}

// ─── Dependency injection (for testing) ──────────────────────────────────────

let _injectedStore: SettingsStore | null = null;

/**
 * Override the Office settings store. Pass `null` to restore the real one.
 * @internal Used in unit tests only.
 */
export function _injectSettingsStore(store: SettingsStore | null): void {
  _injectedStore = store;
}

/** In-memory fallback when running outside PowerPoint (e.g. browser testing). */
const _memoryStore: SettingsStore = (() => {
  const data = new Map<string, unknown>();
  return {
    get: (name: string) => data.get(name) ?? null,
    set: (name: string, value: unknown) => { data.set(name, value); },
    remove: (name: string) => { data.delete(name); },
    saveAsync: (cb: (r: SaveResult) => void) => { cb({ status: 'succeeded', error: null }); },
  };
})();

function getStore(): SettingsStore {
  if (_injectedStore) return _injectedStore;
  /* global Office */
  try {
    const settings = Office.context?.document?.settings;
    if (settings) return settings as unknown as SettingsStore;
  } catch { /* outside Office host */ }
  return _memoryStore;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function slideKey(slideId: string): string {
  return `${SETTING_KEY_SLIDE_PREFIX}${slideId}`;
}

function saveOnce(store: SettingsStore): Promise<void> {
  return new Promise((resolve, reject) => {
    store.saveAsync((result) => {
      if (result.status === 'failed') {
        reject(new Error(result.error?.message ?? 'Settings save failed'));
      } else {
        resolve();
      }
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Save settings with automatic retry.
 * Retries up to {@link SETTINGS_SAVE_MAX_RETRIES} times with a delay between attempts.
 */
async function save(store: SettingsStore): Promise<void> {
  for (let attempt = 0; attempt <= SETTINGS_SAVE_MAX_RETRIES; attempt++) {
    try {
      await saveOnce(store);
      return;
    } catch (err) {
      if (attempt < SETTINGS_SAVE_MAX_RETRIES) {
        logDebug(`Settings save attempt ${attempt + 1} failed, retrying...`);
        await delay(SETTINGS_SAVE_RETRY_DELAY_MS);
      } else {
        logError('Settings save failed after all retries:', err);
        throw err;
      }
    }
  }
}

// ─── Slide config ─────────────────────────────────────────────────────────────

/** Returns the saved config for a slide, or `null` if not set. */
export function getSlideConfig(slideId: string): WebPPTSlideConfig | null {
  const raw = getStore().get(slideKey(slideId));
  return raw ? (raw as WebPPTSlideConfig) : null;
}

/** Saves config for a slide and persists to document. */
export async function setSlideConfig(slideId: string, config: WebPPTSlideConfig): Promise<void> {
  const store = getStore();
  store.set(slideKey(slideId), config);
  await save(store);
}

/** Removes the saved config for a slide. */
export async function removeSlideConfig(slideId: string): Promise<void> {
  const store = getStore();
  store.remove(slideKey(slideId));
  await save(store);
}

// ─── Language ─────────────────────────────────────────────────────────────────

/** Returns the saved UI language, or `null` if not set. */
export function getLanguage(): Locale | null {
  return (getStore().get(SETTING_KEY_LANGUAGE) as Locale) ?? null;
}

/** Saves the UI language and persists to document. */
export async function setLanguage(locale: Locale): Promise<void> {
  const store = getStore();
  store.set(SETTING_KEY_LANGUAGE, locale);
  await save(store);
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

/** Returns saved global defaults, or built-in defaults if not set. */
export function getDefaults(): WebPPTSlideConfig {
  const stored = getStore().get(SETTING_KEY_DEFAULTS) as WebPPTSlideConfig | null;
  return stored ?? {
    url: '',
    zoom: DEFAULT_ZOOM,
    dialogWidth: DEFAULT_DIALOG_WIDTH,
    dialogHeight: DEFAULT_DIALOG_HEIGHT,
    autoOpen: DEFAULT_AUTO_OPEN,
    autoCloseSec: DEFAULT_AUTO_CLOSE_SEC,
  };
}

/** Saves global defaults and persists to document. */
export async function setDefaults(config: WebPPTSlideConfig): Promise<void> {
  const store = getStore();
  store.set(SETTING_KEY_DEFAULTS, config);
  await save(store);
}
