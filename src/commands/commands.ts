import { getSlideConfig, getLanguage } from '../shared/settings';
import { DialogLauncher } from '../shared/dialog-launcher';
import { parseLocale } from '../shared/i18n';
import { logDebug, logError, installUnhandledRejectionHandler } from '../shared/logger';

// ─── State ───────────────────────────────────────────────────────────────────

const launcher = new DialogLauncher();

/** Whether PowerPoint is currently in Slideshow ("read") mode. */
let inSlideshow = false;

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

// ─── Slideshow detection ────────────────────────────────────────────────────

// LIMITATION: PowerPoint Online treats Slideshow as a new session,
// ActiveViewChanged won't fire. Users must use the ribbon button manually.

/**
 * Handles view changes between edit ("edit") and slideshow ("read") modes.
 * - Entering slideshow: auto-opens the viewer if the current slide has autoOpen enabled.
 * - Leaving slideshow: closes any open viewer dialog.
 */
async function handleActiveViewChanged(args: { activeView: string }): Promise<void> {
  if (args.activeView === 'read') {
    // Entered slideshow mode
    inSlideshow = true;

    try {
      const slideId = await getCurrentSlideId();
      if (!slideId) return;

      const config = getSlideConfig(slideId);
      if (config?.autoOpen && config.url) {
        logDebug('Auto-opening viewer for slide:', slideId);
        await openViewerForSlide(slideId);
      }
    } catch (err) {
      logError('Auto-open on slideshow enter failed:', err);
    }
  } else {
    // Left slideshow mode (back to "edit")
    inSlideshow = false;
    launcher.close();
  }
}

/**
 * Handles slide changes during a slideshow.
 * If the new slide has autoOpen enabled, closes the current dialog and opens
 * a new one. If the new slide has no URL or autoOpen is off, closes the dialog.
 */
async function handleSlideChangedInSlideshow(): Promise<void> {
  if (!inSlideshow) return;

  try {
    const slideId = await getCurrentSlideId();
    if (!slideId) return;

    const config = getSlideConfig(slideId);

    if (config?.autoOpen && config.url) {
      logDebug('Auto-opening viewer on slide change:', slideId);
      await openViewerForSlide(slideId);
    } else {
      // Current slide has no URL or autoOpen is off — close any open dialog
      launcher.close();
    }
  } catch (err) {
    logError('Auto-open on slide change failed:', err);
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

installUnhandledRejectionHandler();

Office.onReady(() => {
  // Associate action IDs declared in manifest.json with handler functions.
  // "ShowWebPage" matches the executeFunction action in CommandsRuntime.
  Office.actions.associate('ShowWebPage', showWebPage);

  // Listen for view changes (edit ↔ slideshow).
  // LIMITATION: PowerPoint Online treats Slideshow as a new session,
  // ActiveViewChanged won't fire there. Auto-open only works on Desktop.
  try {
    Office.context.document.addHandlerAsync(
      Office.EventType.ActiveViewChanged,
      (args: { activeView: string }) => { handleActiveViewChanged(args); },
    );
  } catch {
    // ActiveViewChanged not supported on this platform — manual button only
  }

  // Listen for slide changes to handle auto-open during slideshow.
  // During edit mode this handler returns immediately (inSlideshow === false).
  try {
    Office.context.document.addHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      () => { handleSlideChangedInSlideshow(); },
    );
  } catch {
    // DocumentSelectionChanged not supported — auto-open on slide change unavailable
  }
});
