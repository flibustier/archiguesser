<script setup lang="ts">
import { ref } from "vue";

import InfoModal from "./components/modals/InfoModal.vue";
import BackModal from "./components/modals/BackModal.vue";
import UserModal from "./components/modals/UserModal.vue";
import ScoreModal from "./components/modals/ScoreModal.vue";
import LogInModal from "./components/modals/LogInModal.vue";
import ArcadeModal from "./components/modals/ArcadeModal.vue";
import HeaderNavigator from "./components/HeaderNavigator.vue";

import DailyPage from "./pages/DailyPage.vue";
import ArcadePage from "./pages/ArcadePage.vue";

import { isLogged } from "./store";
import { LISTED_CATEGORIES } from "./config.json";

const showBackModal = ref(false);
const showInfoModal = ref(false);
const showUserModal = ref(false);
const showScoreModal = ref(false);
const showLogInModal = ref(false);
const showArcadeModal = ref(false);

const urlParameters = new URLSearchParams(window.location.search);
const isArcadeMode = LISTED_CATEGORIES.includes(
  urlParameters.get("challenge") || "",
);
</script>

<template>
  <BackModal v-model:is-visible="showBackModal" />
  <InfoModal v-model:is-visible="showInfoModal" />
  <UserModal v-model:is-visible="showUserModal" />
  <ScoreModal v-model:is-visible="showScoreModal" />
  <LogInModal v-model:is-visible="showLogInModal" />
  <ArcadeModal v-model:is-visible="showArcadeModal" />
  <HeaderNavigator
    @showBackModal="showBackModal = true"
    @showInfoModal="showInfoModal = true"
    @showScoreModal="showScoreModal = true"
    @showUserModal="
      isLogged() ? (showUserModal = true) : (showLogInModal = true)
    "
    @showArcadeModal="showArcadeModal = true"
  />
  <main>
    <ArcadePage
      v-if="isArcadeMode"
      @showArcadeModal="showArcadeModal = true"
      @showLogInModal="showLogInModal = true"
      @showScoreModal="showScoreModal = true"
    />
    <DailyPage v-else @showBackModal="showBackModal = true" />
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
