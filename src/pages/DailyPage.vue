<script setup lang="ts">
import { reactive, computed, ref } from "vue";

import { getLastFeedback, getStats, getScore } from "@/services/store";
import { syncUser } from "@/services/user";
import { getRealDayNumber } from "@/services/date";
import { getProjectInformation } from "@/services/projects";
import { sendEvent, sendResult } from "@/services/api";

import EndDisplay from "../components/EndDisplay.vue";
import GuessingForm from "../components/guessing/GuessingForm.vue";
import PictureDisplay from "../components/picture-display/PictureDisplay.vue";
import GuessingHistory from "../components/guessing/GuessingHistory.vue";

const emit = defineEmits(["showBackModal", "showFeedbackModal"]);

const urlParameters = new URLSearchParams(window.location.search);
const requestedDay = urlParameters.get("day");

// disable days in future when it’s production
if (
  process.env.NODE_ENV === "production" &&
  requestedDay &&
  parseInt(requestedDay) > getRealDayNumber()
) {
  window.location.href = "/";
}

const stats = getStats();
const percent = ref();
const guesses: string[] = reactive([]);
const { dayNumber, answer, constructionYears, copyrights, links, categories } =
  reactive(getProjectInformation(requestedDay));

if (localStorage.getItem("dayNumber") === dayNumber.toString()) {
  guesses.push(...JSON.parse(localStorage.getItem("guesses") || "[]"));
} else {
  localStorage.setItem("dayNumber", dayNumber.toString());
  localStorage.setItem("guesses", JSON.stringify([]));
}

const currentRound = computed(() => guesses.length + 1);
const hasWon = computed(
  () => guesses.length > 0 && guesses[guesses.length - 1] === answer,
);
const isGameEnded = computed(() => currentRound.value === 7 || hasWon.value);

const updateStats = (score: number) => {
  if (stats[dayNumber] == undefined) {
    stats[dayNumber] = score;
  }
  if (!stats.firstPlayed) {
    stats.firstPlayed = dayNumber;
  }
  stats.lastPlayed = dayNumber;
  localStorage.setItem("stats", JSON.stringify(stats));

  sendEvent(`Result ${dayNumber} : ${score}`);
};

const onSubmittedGuess = async (guess: string) => {
  guesses.push(guess);
  localStorage.setItem("guesses", JSON.stringify(guesses));

  if (isGameEnded.value) {
    const score = hasWon.value ? currentRound.value - 1 : 0;
    updateStats(score);
    percent.value = await sendResult(dayNumber, score, guesses, stats);
    syncUser();
    if (hasWon.value && dayNumber === getRealDayNumber() && getScore() > 30) {
      const lastFeedback = getLastFeedback();
      if (
        !lastFeedback ||
        (lastFeedback.value !== "never" &&
          getRealDayNumber() - lastFeedback.day > 5)
      ) {
        emit("showFeedbackModal");
      }
    }
  }
};
</script>

<template>
  <PictureDisplay
    :max-pictures="isGameEnded ? 6 : Math.min(currentRound, 6)"
    :day-number="dayNumber"
    :copyrights="copyrights"
  />

  <div v-if="!isGameEnded">
    <GuessingForm @submitted-guess="onSubmittedGuess" />
    <GuessingHistory
      :guesses="guesses"
      :answer="answer"
      :constructionYears="constructionYears"
    />
  </div>

  <EndDisplay
    v-else
    :guesses="guesses"
    :has-won="hasWon"
    :day-number="dayNumber"
    :answer="answer"
    :percent="percent"
    :links="links"
    :is-community="categories?.includes('community')"
    @showBackModal="$emit('showBackModal')"
  />
</template>
