<script setup lang="ts">
import { computed } from "vue";

import IconInfo from "../icons/IconInfo.vue";
import IconTimes from "../icons/IconTimes.vue";

const props = defineProps({
  guesses: {
    type: Array<string>,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  constructionYears: {
    type: String,
  },
});

const clickableBuiltYears = computed(() => {
  if (props.constructionYears?.includes("HE")) {
    return props.constructionYears.replace(
      "HE",
      `<a href="https://en.wikipedia.org/wiki/Holocene_calendar" target="_blank">HE</a>`,
    );
  }
  return props.constructionYears;
});

const guessesReverseOrder = computed(() => props.guesses.slice().reverse());

const guessesRemaining = computed(() => 6 - props.guesses.length);
const isLastGuessRemaining = computed(() => guessesRemaining.value === 1);

const places = computed(() => (props.answer.split("/").pop() || "").split(","));
const country = computed(() => places.value[places.value.length - 1]);
const city = computed(() => places.value[places.value.length - 2]);

const showYearsHint = computed(
  () => guessesRemaining.value <= 4 && props.constructionYears,
);
const showCountryHint = computed(
  () => guessesRemaining.value <= 3 && country.value,
);
const showHint = computed(() => showCountryHint.value || showYearsHint.value);

const hint = computed(
  () =>
    "Hint: " +
    (showYearsHint.value
      ? "Built in " + clickableBuiltYears.value + ". "
      : "") +
    (showCountryHint.value
      ? "The location is <b>" + country.value + "</b>"
      : "") +
    (isLastGuessRemaining.value && city.value
      ? ", <b>" + city.value + "</b>"
      : ""),
);

const answerWords = computed(() =>
  props.answer.split(/\/|,|-|\+|\s/).filter(Boolean),
);

const highlight = (guess: string) =>
  guess.replace(
    new RegExp("(" + answerWords.value.join("|") + ")", "gi"),
    "<b>$1</b>",
  );
</script>

<template>
  <div class="column guesses">
    <div class="guess border" v-if="showHint">
      <span class="guess-icon"><IconInfo /></span>
      <span v-html="hint" />
    </div>
    <div class="guess border" v-for="guess of guessesReverseOrder" :key="guess">
      <span class="guess-icon"><IconTimes /></span>
      <span v-html="highlight(guess)"></span>
    </div>
    <div class="text-center text-small">
      <span v-if="isLastGuessRemaining">Last guess remaining!</span>
      <span v-else>{{ guessesRemaining }} guesses remaining</span>
    </div>
  </div>
</template>

<style scoped>
.guesses {
  margin: 0.5rem 0;
  width: 100%;
  gap: 0.5rem;
}

.guess {
  display: flex;
  align-items: center;

  padding: 0.5rem;
  min-height: 2rem;
}

.guess-icon {
  display: flex;
  margin-right: 0.5rem;
}

.guess-icon > svg {
  height: 100%;
}

:deep(b) {
  background-color: var(--color-highlight);
  font-weight: initial;
}
</style>
