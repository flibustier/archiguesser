<script setup lang="ts">
import { reactive, computed, ref } from "vue";

import { syncUser } from "@/services/user";
import { getRealDayNumber } from "@/services/date";
import { getProjectInformation } from "@/services/projects";
import { sendEvent, sendResult, tagFeedbacks } from "@/services/api";
import { getLastFeedback, getStats, getScore } from "@/services/store";

import EndDisplay from "@/components/daily/EndDisplay.vue";
import GuessingForm from "@/components/input/GuessingForm.vue";
import PictureDisplay from "@/components/picture-display/PictureDisplay.vue";
import GuessingHistory from "@/components/input/GuessingHistory.vue";

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
const project = reactive(getProjectInformation(requestedDay));
const { dayNumber, answer, constructionYears, copyrights } = project;

document.title = `ArchiGuesser #${dayNumber} - Guess the daily architectural project from the pictures`;

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
    if (hasWon.value && dayNumber === getRealDayNumber() && getScore() > 100) {
      const lastFeedback = getLastFeedback();
      if (
        !lastFeedback ||
        (lastFeedback.value !== "never" &&
          getRealDayNumber() - lastFeedback.day > 6)
      ) {
        emit("showFeedbackModal");
      }
    }
  }
};

// temp
tagFeedbacks();
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
    :percent="percent"
    :project="project"
    @showBackModal="$emit('showBackModal')"
  />
</template>
