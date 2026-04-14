// ─── Setting keys ─────────────────────────────────────────────────────────────

/** Prefix for per-slide setting keys. Full key: `webppt_slide_{slideId}`. */
export const SETTING_KEY_SLIDE_PREFIX = 'webppt_slide_';

/** Key for the saved UI language. */
export const SETTING_KEY_LANGUAGE = 'webppt_language';

/** Key for global default slide config. */
export const SETTING_KEY_DEFAULTS = 'webppt_defaults';

// ─── Viewer defaults ──────────────────────────────────────────────────────────

export const DEFAULT_ZOOM = 100;
export const DEFAULT_DIALOG_WIDTH = 80;   // % of screen
export const DEFAULT_DIALOG_HEIGHT = 80;  // % of screen
export const DEFAULT_AUTO_OPEN = true;

// ─── Constraint ranges ────────────────────────────────────────────────────────

export const ZOOM_MIN = 50;
export const ZOOM_MAX = 300;

// ─── Auto-close ──────────────────────────────────────────────────────────────

export const DEFAULT_AUTO_CLOSE_SEC = 0;   // 0 = disabled
export const AUTO_CLOSE_MAX_SEC = 3600;

/**
 * Non-linear lookup table for the auto-close slider.
 * Index = slider position, value = seconds.
 * Granularity decreases as values grow: 1s → 5s → 15s → 30s → 60s → 300s.
 */
export const AUTO_CLOSE_STEPS: readonly number[] = [
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

export const SETTINGS_SAVE_MAX_RETRIES = 2;
export const SETTINGS_SAVE_RETRY_DELAY_MS = 1000;
export const IFRAME_LOAD_TIMEOUT_MS = 10_000;
export const URL_DISPLAY_MAX_LENGTH = 60;

/** Truncate a URL for display, appending ellipsis if needed. */
export function truncateUrl(url: string): string {
  if (url.length <= URL_DISPLAY_MAX_LENGTH) return url;
  return url.substring(0, URL_DISPLAY_MAX_LENGTH - 1) + '\u2026';
}

// ─── Debug ───────────────────────────────────────────────────────────────────

/**
 * Set to `false` in production builds via webpack DefinePlugin.
 * Falls back to `true` so dev/test runs always log.
 */
export const DEBUG: boolean =
  typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : true;
