import { createApp } from "vue";

import App from "./App.vue";
import { currentRoute, onNavigation, startRouter } from "./router";
import { watchInstallation } from "./services/install";
import { watchTheme } from "./services/theme";
import { sendPageView, sendPendingResults } from "./services/api";

watchTheme();
startRouter();
// The first page is counted by the analytics scripts themselves, and a link
// to the page already shown is not a new page view.
let countedPath = currentRoute.value.path;
onNavigation(({ path }) => {
  if (path !== countedPath) {
    countedPath = path;
    sendPageView(path);
  }
});

createApp(App).mount("#app");

// results of games played without a connection
sendPendingResults();
window.addEventListener("online", () => sendPendingResults());

watchInstallation();
// The service worker makes the app installable and keeps it usable offline.
// Not in development: it would serve stale files while coding.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // the app works without it
    });
  });
}
