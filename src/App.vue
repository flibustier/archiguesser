<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import GuessingForm from "./components/guessing/GuessingForm.vue";
import GuessingHistory from "./components/guessing/GuessingHistory.vue";
import PictureDisplay from "./components/picture-display/PictureDisplay.vue";
import EndDisplay from "./components/EndDisplay.vue";
import HeaderNavigator from "./components/HeaderNavigator.vue";

import { getDayNumberAndAnswer } from "./DailySelector";
const { dayNumber, answer } = reactive(getDayNumberAndAnswer());

const currentRound = ref(1);
const hasWon = ref(false);
const guesses: string[] = reactive([]);

console.log(localStorage.getItem("dayNumber"));
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

const onSubmittedAnswer = (guess: string) => {
  guesses.push(guess);
  localStorage.setItem("guesses", JSON.stringify(guesses));
  if (guess === answer) {
    console.log("You win!");
    hasWon.value = true;
    localStorage.setItem("hasWon", "true");
    currentRound.value = 6;
    localStorage.setItem("currentRound", currentRound.value.toString());

    return;
  }

  ++currentRound.value;
  localStorage.setItem("currentRound", currentRound.value.toString());
  if (isGameEnded.value) {
    // game over
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
      <GuessingForm @submitted-answer="onSubmittedAnswer" />
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
