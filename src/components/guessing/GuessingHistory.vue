<script setup lang="ts">
import { computed } from "vue";

const guessesRemaining = computed(() => 6 - props.guesses.length);

const props = defineProps({
  guesses: {
    type: Array<string>,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const answerWords = props.answer.split(/\/|,|\s/);

const patchMatches = (word: string): string =>
  answerWords.includes(word) ? `<b>${word}</b>` : word;

const highlight = (guess: string) =>
  guess
    .split("/")
    .map((part) =>
      part
        .split(" ")
        .map((words) => words.split(",").map(patchMatches).join(","))
        .join(" ")
    )
    .join("/");
</script>

<template>
  <div class="guesses">
    <div class="guess" v-for="guess of guesses" :key="guess">
      <span class="guess-failed">❌</span
      ><span v-html="highlight(guess)"></span>
    </div>
    <div class="remaining" v-if="guessesRemaining === 1">
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
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);

  min-height: 2rem;
}

.guess-failed {
  margin-right: 0.5rem;
}

.remaining {
  font-size: 0.875rem;
  line-height: 1.25rem;

  text-align: center;
}

:deep(b) {
  background-color: #e0eae0;
}
</style>
