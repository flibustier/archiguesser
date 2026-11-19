// After a deploy, a tab opened before keeps running the previous build: the
// pages it has not shown yet are files of that build. The deploy keeps them
// online for a week (scripts/keep-old-assets.sh), the service worker keeps
// them too (build/sw.js); later, or on a network blip, loading one fails.
// Vite then fires a vite:preloadError event, and the import() rejects with the
// same error. Noted here, that error reloads the page on the current build
// (errors.ts) instead of leaving a page that does not open.

const loadErrors = new WeakSet<object>();
let reloading = false;

// A load error soon after such a reload does not come from an old tab: the
// current build fails too, or the network does. Reloading again would loop,
// the error is reported instead.
const RELOADED_AT = "reloadedAt";
const RELOAD_INTERVAL = 60 * 1000;

export const watchLoadErrors = () =>
  window.addEventListener("vite:preloadError", (event) => {
    const { payload } = event as Event & { payload: unknown };
    if (payload instanceof Object) {
      loadErrors.add(payload);
    }
  });

export const isLoadError = (error: unknown) =>
  error instanceof Object && loadErrors.has(error);

const reload = () => {
  if (!navigator.onLine) {
    return false;
  }
  try {
    const reloadedAt = Number(sessionStorage.getItem(RELOADED_AT));
    if (Date.now() - reloadedAt < RELOAD_INTERVAL) {
      return false;
    }
    sessionStorage.setItem(RELOADED_AT, String(Date.now()));
  } catch {
    // without sessionStorage, nothing would stop a reload loop
    return false;
  }
  reloading = true;
  // navigate() (router.ts) changes the URL before it shows the page: the
  // URL is the one of the page that failed
  location.reload();
  return true;
};

// True when the page reloads, for this load error or already: the error
// needs no report then.
export const reloadOnLoadError = (error: unknown) =>
  reloading || (isLoadError(error) && reload());
