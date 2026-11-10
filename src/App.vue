<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
} from "vue";

import { currentRoute, navigationCount, refresh } from "@/router";
import { isFirstTime } from "@/services/store";
import { getRealDayNumber } from "@/services/date";

import WelcomeModal from "./components/modals/WelcomeModal.vue";
import FeedbackModal from "./components/modals/FeedbackModal.vue";
import HeaderNavigator from "./components/HeaderNavigator.vue";

// the game is on screen at once, the other pages are downloaded when opened
import DailyPage from "./pages/DailyPage.vue";

const pages = {
  daily: DailyPage,
  day: DailyPage,
  challenge: defineAsyncComponent(() => import("./pages/ArcadePage.vue")),
  replay: defineAsyncComponent(() => import("./pages/ReplayPage.vue")),
  challenges: defineAsyncComponent(() => import("./pages/ChallengesPage.vue")),
  score: defineAsyncComponent(() => import("./pages/ScorePage.vue")),
  account: defineAsyncComponent(() => import("./pages/AccountPage.vue")),
  about: defineAsyncComponent(() => import("./pages/AboutPage.vue")),
};

const page = computed(() => pages[currentRoute.value.name]);
const isGame = computed(() =>
  ["daily", "day", "challenge"].includes(currentRoute.value.name),
);

const showWelcomeModal = ref(isFirstTime());
const showFeedbackModal = ref(false);

// An app left open overnight (installed app, pinned tab) shows the new day
// when it comes back to the foreground.
let dayShown = getRealDayNumber();
const onVisibilityChange = () => {
  if (document.visibilityState !== "visible") {
    return;
  }
  const today = getRealDayNumber();
  if (today !== dayShown) {
    dayShown = today;
    if (currentRoute.value.name === "daily") {
      refresh();
    }
  }
};
onMounted(() =>
  document.addEventListener("visibilitychange", onVisibilityChange),
);
onUnmounted(() =>
  document.removeEventListener("visibilitychange", onVisibilityChange),
);
</script>

<template>
  <WelcomeModal v-if="isGame" v-model:is-visible="showWelcomeModal" />
  <FeedbackModal v-model:is-visible="showFeedbackModal" />

  <HeaderNavigator />
  <main>
    <component
      :is="page"
      :key="navigationCount"
      v-bind="currentRoute.params"
      @show-feedback-modal="showFeedbackModal = true"
    />
  </main>
</template>

<style>
@import "./assets/base.css";

main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1rem;
}
</style>
