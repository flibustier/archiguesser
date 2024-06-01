<script setup lang="ts">
import { sendEvent } from "@/services/api";

import IconWiki from "@/components/icons/IconWiki.vue";
import IconRetry from "@/components/icons/IconRetry.vue";
import IconScore from "@/components/icons/IconScoreboard.vue";
import IconTrophy from "@/components/icons/IconTrophy.vue";

defineEmits(["showArcadeModal", "showScoreModal"]);

const props = defineProps([
  "hasWon",
  "hasReachMaxLevel",
  "currentLevel",
  "currentProject",
]);

const refresh = () => window.location.reload();
const goHome = () => window.location.replace("/");

const openLinks = () => {
  window.open(props.currentProject.value.links[0], "_blank")?.focus();
  sendEvent("Learn");
};
</script>

<template>
  <div v-if="hasWon">
    <h2>You got it!! 🎉</h2>
    <br />
    <h3 v-if="hasReachMaxLevel">
      You’ve reached the maximum level for this challenge! 🏆 Congrats!! 👏<br />
      New levels will be added soon, stay tuned!
    </h3>
    <h3 v-else>
      You’re now level {{ currentLevel }}! 🏆 You’ve earned
      {{ currentLevel * 50 }} points!
    </h3>
    <br />
  </div>
  <div v-else>
    <h2>
      The answer was:
      <span class="answer">{{ currentProject.answer }}</span>
    </h2>
  </div>
  <div class="row">
    <template v-if="!hasReachMaxLevel">
      <button v-if="hasWon" class="btn-primary" @click="refresh()">
        <span>Next Level!</span>
        <IconTrophy style="fill: white" />
      </button>
      <button v-else class="btn-primary" @click="refresh()">
        <span>Retry</span>
        <IconRetry style="fill: white" />
      </button>
      <div class="separator" />
    </template>
    <div class="column-stretch">
      <button
        class="btn-secondary"
        @click="openLinks()"
        v-if="!hasWon && currentProject.links.length > 0"
      >
        <span>Learn more about it</span>
        <IconWiki />
      </button>
      <button
        v-if="hasWon"
        class="btn-secondary"
        @click="$emit('showScoreModal')"
      >
        <span>Check your score</span>
        <IconScore />
      </button>
      <button class="btn-secondary" @click="$emit('showArcadeModal')">
        <span>Try another challenge</span>
        <IconTrophy />
      </button>
      <button class="btn-secondary" @click="goHome()">
        <span>Back to daily challenge</span>
        <IconRetry />
      </button>
    </div>
  </div>
</template>

<style scoped>
.separator {
  background-color: var(--color-border);
  width: 1px;
}

@media screen and (max-width: 400px) {
  .row {
    flex-direction: column;
  }

  .separator {
    display: none;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>
