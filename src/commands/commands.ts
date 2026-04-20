import { getSlideConfig, getLanguage } from '../shared/settings';
import { DialogLauncher } from '../shared/dialog-launcher';
import { parseLocale } from '../shared/i18n';
import { logDebug, logError, installUnhandledRejectionHandler } from '../shared/logger';

// ─── State ───────────────────────────────────────────────────────────────────

const launcher = new DialogLauncher();

/** Whether PowerPoint is currently in Slideshow ("read") mode. */
let inSlideshow = false;

/** Polling interval handle for slide change detection during slideshow. */
let pollTimer: ReturnType<typeof setInterval> | null = null;

/** Last known slide ID — used by polling to detect slide changes. */
let lastPollSlideId: string | null = null;

/** Guard to prevent overlapping poll ticks. */
let pollBusy = false;

/** How often to check the current slide during slideshow (ms). */
const POLL_INTERVAL_MS = 1500;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve the ID of the currently selected slide, or `null`. */
async function getCurrentSlideId(): Promise<string | null> {
  try {
    let slideId: string | null = null;
    await PowerPoint.run(async (context) => {
      const slides = context.presentation.getSelectedSlides();
      slides.load('items/id');
      await context.sync();
      if (slides.items.length > 0) {
        slideId = slides.items[0].id;
      }
    });
    return slideId;
  } catch {
    return null;
  }
}

/** Resolve the language to pass to the viewer dialog. */
function resolveLanguage(): string {
  const savedLang = getLanguage();
  return savedLang ?? parseLocale(navigator.language);
}

/**
 * Open the viewer dialog for the given slide's config.
 * Closes any existing dialog first to avoid "dialog already open" errors.
 * Returns silently if the slide has no URL configured.
 */
async function openViewerForSlide(slideId: string): Promise<void> {
  const config = getSlideConfig(slideId);
  if (!config || !config.url) return;

  // Close existing dialog before opening a new one
  launcher.close();

  await launcher.open({
    url: config.url,
    zoom: config.zoom,
    width: config.dialogWidth,
    height: config.dialogHeight,
    lang: resolveLanguage(),
    autoCloseSec: config.autoCloseSec,
  });
}

// ─── Ribbon command: Show Web Page ───────────────────────────────────────────

/**
 * Called from the ribbon "Show Web Page" button.
 * Reads the saved config for the current slide and opens the viewer dialog.
 * If no URL is configured, the command completes silently (no Task Pane UI
 * is available in this runtime to show an error).
 */
async function showWebPage(event: Office.AddinCommands.Event): Promise<void> {
  try {
    const slideId = await getCurrentSlideId();
    if (slideId) {
      logDebug('Ribbon ShowWebPage for slide:', slideId);
      await openViewerForSlide(slideId);
    } else {
      logDebug('ShowWebPage: no slide selected');
    }
  } catch (err) {
    logError('ShowWebPage command failed:', err);
  }

  event.completed();
}

// ─── Slideshow polling ──────────────────────────────────────────────────────

/**
 * Poll the current slide during slideshow and auto-open/close the viewer.
 *
 * `DocumentSelectionChanged` does NOT reliably fire during slideshow mode
 * on PowerPoint Desktop — it is an edit-mode event. Polling is the only
 * robust way to detect slide navigation in presentation mode.
 */
async function pollCurrentSlide(): Promise<void> {
  if (!inSlideshow || pollBusy) return;

  pollBusy = true;
  try {
    const slideId = await getCurrentSlideId();
    if (!slideId) return;

    // No change — nothing to do
    if (slideId === lastPollSlideId) return;

    logDebug('Slideshow slide changed:', lastPollSlideId, '→', slideId);
    lastPollSlideId = slideId;

    const config = getSlideConfig(slideId);

    if (config?.autoOpen && config.url) {
      logDebug('Auto-opening viewer for slide:', slideId);
      await openViewerForSlide(slideId);
    } else {
      // Current slide has no URL or autoOpen is off — close any open dialog
      launcher.close();
    }
  } catch (err) {
    logError('Poll slide change failed:', err);
  } finally {
    pollBusy = false;
  }
}

/** Start polling for slide changes. Called when entering slideshow. */
function startSlideshowPolling(): void {
  stopSlideshowPolling();
  lastPollSlideId = null;
  pollBusy = false;
  logDebug('Starting slideshow polling (interval:', POLL_INTERVAL_MS, 'ms)');
  pollTimer = setInterval(() => { pollCurrentSlide(); }, POLL_INTERVAL_MS);
}

/** Stop polling. Called when leaving slideshow. */
function stopSlideshowPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  lastPollSlideId = null;
}

// ─── Slideshow detection ────────────────────────────────────────────────────

// LIMITATION: PowerPoint Online treats Slideshow as a new session,
// ActiveViewChanged won't fire. Users must use the ribbon button manually.

/**
 * Handles view changes between edit ("edit") and slideshow ("read") modes.
 * - Entering slideshow: starts polling + auto-opens viewer for the first slide.
 * - Leaving slideshow: stops polling + closes any open viewer dialog.
 */
async function handleActiveViewChanged(args: { activeView: string }): Promise<void> {
  logDebug('ActiveViewChanged:', args.activeView);

  if (args.activeView === 'read') {
    // Entered slideshow mode
    inSlideshow = true;

    try {
      const slideId = await getCurrentSlideId();
      logDebug('Slideshow entered, current slide:', slideId);

      if (slideId) {
        lastPollSlideId = slideId;
        const config = getSlideConfig(slideId);
        if (config?.autoOpen && config.url) {
          logDebug('Auto-opening viewer for initial slide:', slideId);
          await openViewerForSlide(slideId);
        }
      }
    } catch (err) {
      logError('Auto-open on slideshow enter failed:', err);
    }

    // Start polling for slide changes during slideshow.
    // DocumentSelectionChanged does NOT fire reliably in slideshow mode,
    // so polling is the primary mechanism for detecting slide navigation.
    startSlideshowPolling();
  } else {
    // Left slideshow mode (back to "edit")
    logDebug('Slideshow exited');
    inSlideshow = false;
    stopSlideshowPolling();
    launcher.close();
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

installUnhandledRejectionHandler();

Office.onReady(() => {
  logDebug('Commands runtime ready');

  // Associate action IDs declared in manifest with handler functions.
  // "ShowWebPage" matches the executeFunction action in the unified JSON manifest.
  Office.actions.associate('ShowWebPage', showWebPage);

  // Also expose as global for XML manifest compatibility.
  // XML manifest uses <FunctionName>showWebPage</FunctionName> which looks up
  // the function on the global scope if Office.actions.associate doesn't match.
  (globalThis as Record<string, unknown>).showWebPage = showWebPage;

  // Listen for view changes (edit ↔ slideshow).
  // LIMITATION: PowerPoint Online treats Slideshow as a new session,
  // ActiveViewChanged won't fire there. Auto-open only works on Desktop.
  try {
    Office.context.document.addHandlerAsync(
      Office.EventType.ActiveViewChanged,
      (args: { activeView: string }) => { handleActiveViewChanged(args); },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          logDebug('ActiveViewChanged handler registered');
        } else {
          logError('Failed to register ActiveViewChanged:', result.error);
        }
      },
    );
  } catch (err) {
    logError('ActiveViewChanged not supported:', err);
  }

  // Also listen for DocumentSelectionChanged as a secondary trigger.
  // This may fire on some Desktop versions during slideshow (undocumented),
  // providing faster detection than polling in those cases.
  try {
    Office.context.document.addHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      () => {
        if (!inSlideshow) return;
        // Let the next poll tick handle it immediately instead of waiting
        pollCurrentSlide();
      },
    );
  } catch {
    // DocumentSelectionChanged not supported — polling is the only mechanism
  }
});
