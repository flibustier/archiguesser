<script setup lang="ts">
import { ref } from "vue";

import { isLogged, isFirstTime } from "@/services/store";
import { getRealDayNumber } from "@/services/date";
import { LISTED_CATEGORIES, LOCKED_CATEGORIES_LOGGED } from "@/config.json";

const ALL_CATEGORIES = [
  ...LISTED_CATEGORIES,
  ...LOCKED_CATEGORIES_LOGGED,
  "test",
];

import InfoModal from "./components/modals/InfoModal.vue";
import BackModal from "./components/modals/BackModal.vue";
import UserModal from "./components/modals/UserModal.vue";
import ScoreModal from "./components/modals/ScoreModal.vue";
import LogInModal from "./components/modals/LogInModal.vue";
import ArcadeModal from "./components/modals/ArcadeModal.vue";
import FeedbackModal from "./components/modals/FeedbackModal.vue";
import HeaderNavigator from "./components/HeaderNavigator.vue";

import DailyPage from "./pages/DailyPage.vue";
import ArcadePage from "./pages/ArcadePage.vue";

const showBackModal = ref(window.location.hash === "#replay");
const showInfoModal = ref(window.location.hash === "#info" || isFirstTime());
const showUserModal = ref(false);
const showScoreModal = ref(window.location.hash === "#score");
const showLogInModal = ref(false);
const showArcadeModal = ref(window.location.hash === "#challenges");
const showFeedbackModal = ref(false);

const urlParameters = new URLSearchParams(window.location.search);
const requestedDay = urlParameters.get("day");
const isArcadeMode = ALL_CATEGORIES.includes(
  urlParameters.get("challenge") || "",
);

// disable days in future when it’s production
if (
  process.env.NODE_ENV === "production" &&
  requestedDay &&
  parseInt(requestedDay) > getRealDayNumber()
) {
  window.location.href = "/";
}
</script>

<template>
  <BackModal v-model:is-visible="showBackModal" />
  <InfoModal v-model:is-visible="showInfoModal" />
  <UserModal v-model:is-visible="showUserModal" />
  <ScoreModal v-model:is-visible="showScoreModal" />
  <LogInModal v-model:is-visible="showLogInModal" />
  <FeedbackModal v-model:is-visible="showFeedbackModal" />
  <ArcadeModal
    v-model:is-visible="showArcadeModal"
    @showLogInModal="showLogInModal = true"
  />

  <HeaderNavigator
    @showBackModal="showBackModal = true"
    @showInfoModal="showInfoModal = true"
    @showScoreModal="showScoreModal = true"
    @showArcadeModal="showArcadeModal = true"
    @showUserModal="
      isLogged() ? (showUserModal = true) : (showLogInModal = true)
    "
  />
  <main>
    <ArcadePage
      v-if="isArcadeMode"
      @showLogInModal="showLogInModal = true"
      @showScoreModal="showScoreModal = true"
      @showArcadeModal="showArcadeModal = true"
    />
    <DailyPage
      v-else
      @showBackModal="showBackModal = true"
      @showFeedbackModal="showFeedbackModal = true"
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
