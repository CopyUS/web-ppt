import { DEBUG } from './constants';

const PREFIX = '[WebPPT]';

/* eslint-disable no-console */

/** Log debug info — no-op in production builds. */
export function logDebug(...args: unknown[]): void {
  if (DEBUG) console.log(PREFIX, ...args);
}

/** Log warnings — no-op in production builds. */
export function logWarn(...args: unknown[]): void {
  if (DEBUG) console.warn(PREFIX, ...args);
}

/** Log errors — no-op in production builds. */
export function logError(...args: unknown[]): void {
  if (DEBUG) console.error(PREFIX, ...args);
}

/* eslint-enable no-console */

/**
 * Install a global handler for unhandled promise rejections.
 * Call once per entry point (taskpane, viewer, commands).
 */
export function installUnhandledRejectionHandler(): void {
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    logError('Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
}
