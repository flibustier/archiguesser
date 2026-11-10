<script setup lang="ts">
import { reactive, computed, ref } from "vue";

import { navigate } from "@/router";
import { syncUser } from "@/services/user";
import { resolveDay } from "@/services/days";
import { getRealDayNumber } from "@/services/date";
import { fetchDay, gameIndex } from "@/services/data";
import { sendEvent, sendResult } from "@/services/api";
import type { DayProject } from "@/services/types";
import {
  getGuesses,
  getLastFeedback,
  getScore,
  getStats,
  setGuesses,
} from "@/services/store";

import EndDisplay from "@/components/daily/EndDisplay.vue";
import GuessingForm from "@/components/input/GuessingForm.vue";
import PictureDisplay from "@/components/picture-display/PictureDisplay.vue";
import GuessingHistory from "@/components/input/GuessingHistory.vue";

// "day" comes from the URL (/day/12); without it, today is played
const props = defineProps<{ day?: string }>();
const emit = defineEmits(["showFeedbackModal"]);

const today = getRealDayNumber();
const requestedDay = props.day === undefined ? today : parseInt(props.day);

// The list of days comes with the app. If today is not in it, the app in
// memory is probably older than the latest days: load the current one, once.
const RELOADED_FOR = "reloadedForDay";
if (
  props.day === undefined &&
  today > gameIndex.lastDay &&
  sessionStorage.getItem(RELOADED_FOR) !== today.toString()
) {
  sessionStorage.setItem(RELOADED_FOR, today.toString());
  window.location.reload();
}

// days prepared in advance are only playable in development
const isFromTheFuture = import.meta.env.PROD && requestedDay > today;
const dayNumber = resolveDay(
  isFromTheFuture ? today : requestedDay,
  today,
  gameIndex,
);

if (
  isFromTheFuture ||
  (props.day !== undefined && dayNumber !== requestedDay)
) {
  // unknown or future day in the URL: play the most recent day instead
  navigate("/", { replace: true });
}

document.title = `ArchiGuesser #${dayNumber} - Guess the daily architectural project from the pictures`;

const stats = getStats();
const percent = ref();
const project = ref<DayProject>();
const isOffline = ref(false);
const guesses: string[] = reactive(getGuesses(dayNumber));

const load = async () => {
  isOffline.value = false;
  try {
    project.value = await fetchDay(dayNumber);
  } catch {
    isOffline.value = true;
  }
};
load();

const horsSerie = computed(() => project.value?.["hors-serie"]);
const currentRound = computed(() => guesses.length + 1);
const hasWon = computed(
  () =>
    guesses.length > 0 && guesses[guesses.length - 1] === project.value?.answer,
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
  setGuesses(dayNumber, guesses);

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
</script>

<template>
  <template v-if="horsSerie && !isGameEnded">
    <h3>Today is an <i>Hors-Série</i>!</h3>
    <p class="text-intro">
      Try to guess the <b>{{ horsSerie.toLowerCase() }}</b> from the
      architecture! Good luck! 👏
    </p>
  </template>

  <!-- the picture does not wait for the project's data -->
  <PictureDisplay
    :max-pictures="isGameEnded ? 6 : Math.min(currentRound, 6)"
    :day-number="dayNumber"
    :copyrights="project?.copyrights || {}"
  />

  <template v-if="project">
    <div v-if="!isGameEnded">
      <GuessingForm
        :hors-serie="horsSerie"
        :answer="project.answer"
        @submitted-guess="onSubmittedGuess"
      />
      <GuessingHistory
        :without-hints="!!horsSerie || project.noHints"
        :guesses="guesses"
        :answer="project.answer"
        :construction-years="project.constructionYears"
      />
    </div>

    <EndDisplay
      v-else
      :guesses="guesses"
      :has-won="hasWon"
      :percent="percent"
      :project="project"
    />
  </template>
  <div v-else-if="isOffline" class="column offline" role="alert">
    <p>
      This day could not be loaded: it looks like you are offline.<br />
      A connection is needed the first time a day is opened.
    </p>
    <button class="btn-secondary self-center" @click="load">Try again</button>
  </div>
</template>

<style scoped>
.text-intro,
.offline {
  text-align: center;
  margin-bottom: 1rem;
}
</style>
