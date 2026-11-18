import {
  BrowserClient,
  captureException,
  dedupeIntegration,
  defaultStackParser,
  getCurrentScope,
  linkedErrorsIntegration,
  makeFetchTransport,
} from "@sentry/browser";

// Loaded by errors.ts after the first error only. This file keeps the same
// name from one deploy to the next (vite.config.mts), so a tab opened before a
// deploy can still load it. The service worker does not precache it either
// (build/vite-plugin-game.ts): visitors without errors never download it.
// It imports nothing from the app (the DSN comes from errors.ts): otherwise,
// in an old tab, it would load the main chunk of the new deploy.

const environment = () => {
  const host = location.hostname;
  if (host === "archiguesser.com" || host.endsWith(".archiguesser.com")) {
    return "production";
  }

  return host === "localhost" || host === "127.0.0.1" ? "local" : "preview";
};

// Nothing secret leaves in a report: an email, the token of a password reset
// link (64 hex characters) or anything shaped like a JWT is masked.
const JWT = /eyJ[\w-]*(\.[\w-]*){0,2}/g;
const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;
const TOKEN = /[\w-]{32,}/g;
const mask = (text?: string) =>
  text
    ?.replace(JWT, "[jwt]")
    .replace(EMAIL, "[email]")
    .replace(TOKEN, "[token]");

interface Page {
  path: string;
  tags: Record<string, string>;
}

export const start = (dsn: string, currentPage: () => Page) => {
  const client = new BrowserClient({
    dsn,
    environment: environment(),
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    // No breadcrumbs, no tracing, no replay: only the error itself
    integrations: [linkedErrorsIntegration(), dedupeIntegration()],
    // Nothing about the player: no user, cookies, headers, bodies or query
    // strings
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    // Add the host to "Failed to fetch" in the report only: the app's own
    // error stays the same
    enhanceFetchErrorMessages: "report-only",
    beforeSend(event) {
      const { path, tags } = currentPage();
      // The page by its pattern, without query string nor hash
      event.request = {
        url: location.origin + path,
        headers: { "User-Agent": navigator.userAgent },
      };
      event.tags = { ...tags, ...event.tags };
      event.message = mask(event.message);
      for (const exception of event.exception?.values ?? []) {
        exception.value = mask(exception.value);
      }
      // A rejected object is copied here in full: keep its keys only, they
      // are in the title
      if (event.extra?.__serialized__) {
        delete event.extra.__serialized__;
      }

      return event;
    },
  });
  getCurrentScope().setClient(client);
  client.init();

  return (error: unknown, tags?: Record<string, string>) =>
    captureException(error, { tags });
};
