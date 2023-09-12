<script setup lang="ts">
import { computed, ref } from "vue";

import {
  ITEMS_PER_LEVEL,
  MAX_LEVEL,
  ANONYMOUS_RETRIES,
  LOGGED_RETRIES,
} from "@/config.json";
import { sendChallengeResult, sendEvent } from "@/api";
import { getProjectsByCategory, getRealDayNumber } from "@/DailySelector";
import {
  getChallenges,
  isLogged,
  setChallenges,
  getCredentials,
} from "@/store";

import IconWiki from "@/components/icons/IconWiki.vue";
import IconRetry from "@/components/icons/IconRetry.vue";
import IconScore from "@/components/icons/IconScoreboard.vue";
import IconTrophy from "@/components/icons/IconTrophy.vue";
import GuessingForm from "@/components/guessing/GuessingForm.vue";
import PictureDisplay from "@/components/picture-display/PictureDisplay.vue";

defineEmits(["showArcadeModal", "showLogInModal", "showScoreModal"]);

const urlParameters = new URLSearchParams(window.location.search);
const requestedCategory = urlParameters.get("challenge") || "";

const shuffle = (array: any[]) => {
  let randIndex;
  let currIndex = array.length;

  while (currIndex != 0) {
    randIndex = Math.floor(Math.random() * currIndex);
    currIndex--;

    [array[currIndex], array[randIndex]] = [array[randIndex], array[currIndex]];
  }

  return array;
};
const projects = shuffle(getProjectsByCategory(requestedCategory));
const maxLevel = Math.min(
  MAX_LEVEL,
  Math.floor(projects.length / ITEMS_PER_LEVEL),
);

let retryCount = 0;
const storage = getChallenges();
if (storage.dayNumber === getRealDayNumber()) {
  retryCount = parseInt(storage.retryCount);
} else {
  // init challenges storage
  setChallenges("dayNumber", getRealDayNumber());
  setChallenges("retryCount", retryCount);
}
const retryQuota = isLogged() ? LOGGED_RETRIES : ANONYMOUS_RETRIES;
const isRetryQuotaExceeded = retryCount > retryQuota;

const currentLevel = ref(0);
// get the current level for this category if already set
if (storage[requestedCategory]) {
  currentLevel.value = parseInt(storage[requestedCategory]);
}
const hasReachMaxLevel = computed(() => currentLevel.value === maxLevel);
const lastItem =
  ITEMS_PER_LEVEL * (currentLevel.value + (hasReachMaxLevel.value ? 0 : 1));

const remainingGuesses = ref(lastItem);
const isGameOver = ref(false);
const hasWon = computed(() => remainingGuesses.value === 0);

const greenSquares = computed(() => lastItem - remainingGuesses.value);
const blackSquares = computed(
  () => remainingGuesses.value - (isGameOver.value ? 1 : 0),
);

const currentGuess = computed(() => projects[remainingGuesses.value - 1]);

const refresh = () => window.location.reload();
const goHome = () => window.location.replace("/");

const sendResult = (failedOn = "") => {
  sendEvent(`Challenge ${requestedCategory} : ${currentLevel.value}`);
  sendChallengeResult(
    greenSquares.value,
    currentLevel.value,
    requestedCategory,
    failedOn,
    getChallenges(),
    getCredentials(),
  );
};

const onSubmittedGuess = (guess: string) => {
  if (guess !== currentGuess.value.answer) {
    isGameOver.value = true;
    setChallenges("retryCount", retryCount + 1);
    sendResult(currentGuess.value.answer);
  } else {
    remainingGuesses.value--;
    if (hasWon.value) {
      sendResult();
      currentLevel.value = Math.min(maxLevel, currentLevel.value + 1);
      setChallenges(requestedCategory, currentLevel.value);
    }
  }
};

const openLinks = () => {
  window.open(currentGuess.value.links[0], "_blank")?.focus();
  sendEvent("Learn");
};
</script>

<template>
  <main v-if="isRetryQuotaExceeded" class="expended">
    <header>
      <p>You’ve reached your {{ retryQuota }} daily retry! 🥲</p>
      <p v-if="isLogged()">Nice work!! Keep trying tomorrow!</p>
      <p v-else>
        Fortunately, you can have <b>{{ LOGGED_RETRIES }} daily retry</b> with
        an account (free & instant)!
      </p>
    </header>
    <button class="white-btn center" @click="goHome()" v-if="isLogged()">
      <span>Back to daily challenge</span>
    </button>
    <button class="primary-btn" @click="$emit('showLogInModal')" v-else>
      <span>Sign Up/Sign In</span>
    </button>
  </main>
  <main v-else :class="hasWon ? 'expended' : ''">
    <header v-if="!hasWon">
      You’re playing the <b>{{ requestedCategory }}</b> challenge, you’re
      currently <b>level {{ currentLevel }}</b
      >, so you have <b>{{ lastItem }}</b> projects to guess properly to win!
    </header>
    <div class="progress">
      <span class="square green" v-for="i in greenSquares" :key="i">🟩</span>
      <span class="square red" v-if="isGameOver">🟥</span>
      <span class="square black" v-for="i in blackSquares" :key="i">⬛</span>
    </div>
    <PictureDisplay
      v-if="!hasWon"
      :only-last-picture="true"
      :day-number="currentGuess.days[0]"
      :copyrights="currentGuess.copyrights[0]"
    />

    <div v-if="!(isGameOver || hasWon)">
      <GuessingForm @submitted-guess="onSubmittedGuess" />
    </div>
    <div class="end-display" v-else>
      <div v-if="hasWon">
        <h2>You got it!! 🎉</h2>
        <br />
        <h3 v-if="hasReachMaxLevel">
          You’ve reached the maximum level for this challenge! 🏆 Congrats!!
          👏<br />
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
          The answer was: <span class="answer">{{ currentGuess.answer }}</span>
        </h2>
      </div>
      <div class="buttons">
        <button
          v-if="hasWon && !hasReachMaxLevel"
          class="primary-btn"
          @click="refresh()"
        >
          <span>Next Level!</span>
          <IconTrophy style="fill: white" />
        </button>
        <button v-else-if="!hasWon" class="primary-btn" @click="refresh()">
          <span>Retry</span>
          <IconRetry style="fill: white" />
        </button>
        <div class="separator" v-if="!hasReachMaxLevel"></div>
        <div class="right-buttons">
          <button
            class="white-btn"
            @click="openLinks()"
            v-if="!hasWon && currentGuess.links.length > 0"
          >
            <span>Learn more about it</span>
            <IconWiki />
          </button>
          <button class="white-btn" @click="$emit('showScoreModal')">
            <span>Check your score</span>
            <IconScore />
          </button>
          <button class="white-btn" @click="$emit('showArcadeModal')">
            <span>Try another challenge</span>
            <IconTrophy />
          </button>
          <button class="white-btn" @click="goHome()">
            <span>Back to daily challenge</span>
            <IconRetry />
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

main.expended {
  gap: 2rem;
}

header {
  text-align: center;
}

b {
  font-weight: 600;
}

.progress {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

/* end display */
.end-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.answer {
  display: block;
  font-weight: 500;
}

.buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.separator {
  background-color: var(--color-border);
  width: 1px;
}

button {
  border-radius: var(--border-radius);
  padding: 0.25rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

button svg {
  margin-left: 0.5rem;
  vertical-align: text-top;
}

.right-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.primary-btn {
  align-self: center;
  font-size: 0.875rem;
  line-height: 1.75rem;
  color: var(--color-primary-inverted);
  background-color: var(--color-primary);
}

.white-btn {
  border: 1px solid;
  background-color: var(--background-color);
  justify-content: space-between;
}

.center {
  align-self: center;
}
</style>
