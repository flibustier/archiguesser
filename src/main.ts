import { createApp } from "vue";

import App from "./App.vue";
import { onNavigation, startRouter } from "./router";
import { sendPageView } from "./services/api";

startRouter();
// the first page is counted by the analytics scripts themselves
onNavigation(({ path }) => sendPageView(path));

createApp(App).mount("#app");
