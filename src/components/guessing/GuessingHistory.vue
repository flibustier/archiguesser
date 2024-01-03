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

const answerWords = computed(() =>
  props.answer.split(/\/|,|-|\s/).filter(Boolean),
);

const highlight = (guess: string) =>
  guess.replace(
    new RegExp("(" + answerWords.value.join("|") + ")", "gi"),
    "<b>$1</b>",
  );
</script>

<template>
  <div class="guesses">
    <div class="guess" v-if="showHint">
      <span class="guess-icon"><IconInfo /></span>
      <span>Hint:&nbsp;</span>
      <span v-if="showYearsHint">
        Built in <span v-html="clickableBuiltYears" />.&nbsp;
      </span>
      <span v-if="showCountryHint"
        >The location is <b>{{ country }}</b>
      </span>
      <span v-if="isLastGuessRemaining && city"
        >, <b>{{ city }}</b>
      </span>
    </div>
    <div class="guess" v-for="guess of guessesReverseOrder" :key="guess">
      <span class="guess-icon"><IconTimes /></span>
      <span v-html="highlight(guess)"></span>
    </div>
    <div class="remaining" v-if="isLastGuessRemaining">
      Last guess remaining!
    </div>
    <div class="remaining" v-else>{{ guessesRemaining }} guesses remaining</div>
  </div>
</template>

<style scoped>
.guesses {
  margin: 0.5rem 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
}

.guess {
  display: flex;
  align-items: center;

  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  min-height: 2rem;
}

.guess-icon {
  display: flex;
  margin-right: 0.5rem;
}

.guess-icon > svg {
  height: 100%;
}

.remaining {
  font-size: 0.875rem;
  line-height: 1.25rem;

  text-align: center;
}

:deep(b) {
  background-color: var(--color-highlight);
}
</style>
