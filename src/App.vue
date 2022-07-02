<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import GuessingForm from "./components/guessing/GuessingForm.vue";
import GuessingHistory from "./components/guessing/GuessingHistory.vue";
import PictureDisplay from "./components/picture-display/PictureDisplay.vue";
import EndDisplay from "./components/EndDisplay.vue";
import HeaderNavigator from "./components/HeaderNavigator.vue";

import { getDayNumberAndAnswer } from "./DailySelector";

const urlParameters = new URLSearchParams(window.location.search);
const { dayNumber, answer } = reactive(
  getDayNumberAndAnswer(urlParameters.get("day"))
);

const currentRound = ref(1);
const hasWon = ref(false);
const guesses: string[] = reactive([]);
const stats = JSON.parse(localStorage.getItem("stats") || "{}");

if (localStorage.getItem("dayNumber") === dayNumber.toString()) {
  currentRound.value = parseInt(localStorage.getItem("currentRound") || "1");
  hasWon.value = localStorage.getItem("hasWon") === "true" || false;
  guesses.push(...JSON.parse(localStorage.getItem("guesses") || "[]"));
} else {
  localStorage.setItem("dayNumber", dayNumber.toString());
  localStorage.setItem("currentRound", "1");
  localStorage.setItem("hasWon", "false");
  localStorage.setItem("guesses", JSON.stringify([]));
}

const isGameEnded = computed(() => currentRound.value === 7 || hasWon.value);

const updateStats = () => {
  if (!stats.firstPlayed) {
    stats.firstPlayed = dayNumber;
  }
  stats.lastPlayed = dayNumber;
  localStorage.setItem("stats", JSON.stringify(stats));
};

const onSubmittedGuess = (guess: string) => {
  guesses.push(guess);
  localStorage.setItem("guesses", JSON.stringify(guesses));
  if (guess === answer) {
    hasWon.value = true;
    localStorage.setItem("hasWon", "true");
    stats[currentRound.value] = (stats[currentRound.value] || 0) + 1;
    currentRound.value = 6;
    localStorage.setItem("currentRound", currentRound.value.toString());
    updateStats();

    return;
  }

  ++currentRound.value;
  localStorage.setItem("currentRound", currentRound.value.toString());
  if (isGameEnded.value) {
    stats[0] = (stats[0] || 0) + 1;
    updateStats();

    return;
  }
};
</script>

<template>
  <HeaderNavigator />
  <main>
    <PictureDisplay
      :max-pictures="Math.min(currentRound, 6)"
      :day-number="dayNumber"
    />

    <div v-if="!isGameEnded">
      <GuessingForm @submitted-guess="onSubmittedGuess" />
      <GuessingHistory :guesses="guesses" />
    </div>

    <EndDisplay
      v-else
      :guesses="guesses"
      :has-won="hasWon"
      :day-number="dayNumber"
      :answer="answer"
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
