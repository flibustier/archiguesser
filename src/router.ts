// A small router on top of the History API: real URLs, no page reload.
//
//   /                    today's game
//   /day/:day            a previous day
//   /replay              list of previous days
//   /challenges          list of themed challenges
//   /challenge/:category one themed challenge
//   /score  /account  /about
//
// Plain <a href="/replay"> links are enough: clicks on internal links are
// intercepted globally (see startRouter).

import { shallowRef } from "vue";

import { slugify } from "./services/slug.ts";

export type RouteName =
  | "daily"
  | "day"
  | "replay"
  | "challenges"
  | "challenge"
  | "score"
  | "account"
  | "about";

export interface Route {
  name: RouteName;
  path: string;
  params: Record<string, string>;
}

const ROUTES: [RouteName, string][] = [
  ["daily", "/"],
  ["day", "/day/:day"],
  ["replay", "/replay"],
  ["challenges", "/challenges"],
  ["challenge", "/challenge/:category"],
  ["score", "/score"],
  ["account", "/account"],
  ["about", "/about"],
];

const HOME: Route = { name: "daily", path: "/", params: {} };

const trimSlash = (path: string) =>
  path.length > 1 ? path.replace(/\/+$/, "") || "/" : path;

export const matchRoute = (rawPath: string): Route | undefined => {
  const path = trimSlash(rawPath).replace(/\.html$/, "");
  const segments = path.split("/");

  for (const [name, pattern] of ROUTES) {
    const patternSegments = pattern.split("/");
    if (patternSegments.length !== segments.length) {
      continue;
    }
    const params: Record<string, string> = {};
    const matches = patternSegments.every((patternSegment, i) => {
      if (patternSegment.startsWith(":")) {
        try {
          params[patternSegment.slice(1)] = decodeURIComponent(segments[i]);
        } catch {
          return false;
        }
        return segments[i] !== "";
      }
      return patternSegment === segments[i];
    });
    if (matches) {
      return { name, path, params };
    }
  }

  return undefined;
};

const LEGACY_HASHES: Record<string, string> = {
  "#replay": "/replay",
  "#challenges": "/challenges",
  "#score": "/score",
  "#login": "/account",
  "#info": "/about",
};

// URLs used before the router existed. Shared results all point to /?day=N,
// so these must keep working forever.
export const legacyRedirect = (url: {
  pathname: string;
  search: string;
  hash: string;
}): string | undefined => {
  if (trimSlash(url.pathname) !== "/") {
    return undefined;
  }
  const parameters = new URLSearchParams(url.search);
  const day = parameters.get("day");
  if (day !== null && /^\d+$/.test(day)) {
    return `/day/${parseInt(day)}`;
  }
  const challenge = parameters.get("challenge");
  if (challenge) {
    return `/challenge/${slugify(challenge)}`;
  }

  return LEGACY_HASHES[url.hash];
};

export const dayPath = (day: number) => `/day/${day}`;
export const challengePath = (category: string) =>
  `/challenge/${slugify(category)}`;

export const currentRoute = shallowRef<Route>(HOME);
// Incremented on every navigation, including a refresh of the same URL:
// pages are keyed on it, so each navigation starts from a fresh page.
export const navigationCount = shallowRef(0);

type Listener = (route: Route) => void;
const listeners: Listener[] = [];
export const onNavigation = (listener: Listener) => listeners.push(listener);

const show = (path: string) => {
  currentRoute.value = matchRoute(path) || HOME;
  navigationCount.value++;
};

export const navigate = (path: string, { replace = false } = {}) => {
  const route = matchRoute(path);
  if (!route) {
    window.location.assign(path);
    return;
  }
  if (replace) {
    window.history.replaceState(null, "", path);
  } else {
    window.history.pushState(null, "", path);
  }
  show(path);
  window.scrollTo(0, 0);
  listeners.forEach((listener) => listener(currentRoute.value));
};

// Start the current page again (next level, retry…)
export const refresh = () => {
  navigationCount.value++;
  window.scrollTo(0, 0);
};

const isPlainLeftClick = (event: MouseEvent) =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey &&
  !event.defaultPrevented;

export const startRouter = () => {
  const redirect = legacyRedirect(window.location);
  if (redirect) {
    window.history.replaceState(null, "", redirect);
  } else if (!matchRoute(window.location.pathname)) {
    // unknown URL (served by 404.html): back to today's game
    window.history.replaceState(null, "", "/");
  }
  show(window.location.pathname);

  window.addEventListener("popstate", () => {
    show(window.location.pathname);
    listeners.forEach((listener) => listener(currentRoute.value));
  });

  document.addEventListener("click", (event) => {
    const link = (event.target as Element | null)?.closest?.("a");
    if (
      !link ||
      !isPlainLeftClick(event) ||
      link.target ||
      link.hasAttribute("download") ||
      link.origin !== window.location.origin ||
      !link.getAttribute("href")?.startsWith("/")
    ) {
      return;
    }
    const route = matchRoute(link.pathname);
    if (route) {
      event.preventDefault();
      navigate(link.pathname);
    }
  });
};
