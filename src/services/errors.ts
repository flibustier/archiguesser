import type { App } from "vue";

import { BUGSINK_DSN } from "@/config.json";
import { currentRoute, routePattern } from "../router.ts";
import { isLoadError, reloadOnLoadError, watchLoadErrors } from "./reload.ts";

// Errors in the browser are sent to Bugsink (https://bug.cracking.ovh), which
// speaks the Sentry protocol. The Sentry SDK weighs about 20 KB gzipped, so it
// is only downloaded after the first error: a visit without errors costs
// nothing. Only production builds report, and only with a BUGSINK_DSN in
// config.json: leave it empty and the build has no SDK. A page of an older
// build that fails to load reloads instead (reload.ts).

type Send = (error: unknown, tags?: Record<string, string>) => void;

let sdk: Promise<Send> | undefined;

// The page by its pattern (/day/:day), with the day or the challenge as tags:
// they help to reproduce, and say nothing about the player.
const currentPage = () => {
  const route = currentRoute.value;
  const tags = Object.fromEntries(
    Object.entries(route.params).filter(([, value]) =>
      /^[\w-]{1,40}$/.test(value),
    ),
  );

  return { path: routePattern(route), tags };
};

const report = (error: unknown, tags?: Record<string, string>) => {
  // An empty DSN is known at build time: Rollup then drops the import() of
  // errors-sdk.ts, so errors-sdk.js is not even emitted
  if (!BUGSINK_DSN) {
    return;
  }
  // a reload did not help: the current build fails too, or the network does
  if (isLoadError(error)) {
    tags = { ...tags, reload: "skipped" };
  }
  sdk ??= import("./errors-sdk.ts").then(({ start }) =>
    start(BUGSINK_DSN, currentPage),
  );
  sdk
    .then((send) => send(error, tags))
    .catch(() => {
      // the SDK can't be loaded (offline…): nothing more to do
    });
};

const handle = (error: unknown) => {
  if (!reloadOnLoadError(error)) {
    report(error);
  }
};

export const trackErrors = (app: App) => {
  if (!import.meta.env.PROD) {
    return;
  }
  watchLoadErrors();

  // `error` without an Error object is a cross-origin "Script error.", which
  // tells nothing
  window.addEventListener(
    "error",
    (event) => event.error && handle(event.error),
  );
  window.addEventListener("unhandledrejection", (event) =>
    handle(event.reason),
  );

  // Vue only logs an error when no handler is set: keep the log in the console
  app.config.errorHandler = (error, _instance, info) => {
    if (reloadOnLoadError(error)) {
      return;
    }
    console.error(error);
    report(error, { vue: info });
  };
};
