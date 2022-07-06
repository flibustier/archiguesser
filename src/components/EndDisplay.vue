<script setup lang="ts">
import { computed, ref } from "vue";
import { URL, APP_NAME } from "../config.json";

const showGuesses = ref(false);
const shareBtnContent = ref("SHARE");

const toggleGuesses = () => {
  showGuesses.value = !showGuesses.value;
};

const props = defineProps({
  hasWon: {
    type: Boolean,
    required: true,
  },
  guesses: {
    type: Array<string>,
    required: true,
  },
  dayNumber: {
    type: Number,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const shareMessage = computed(() => {
  const redSquares = "🟥 ".repeat(props.guesses.length - 1);
  const blackSquares = "⬛ ".repeat(6 - props.guesses.length);
  const midSquare = props.hasWon ? "🟩 " : "🟥 ";
  const squares = redSquares + midSquare + blackSquares;

  return `${APP_NAME} #${props.dayNumber}\n🏛 ${squares}\n\n${URL}`;
});

const copy = async () => {
  try {
    await navigator.clipboard.writeText(shareMessage.value);
  } catch (e) {
    console.log("fallback copy");
    const copyText = document.getElementById("share-message")?.textContent;
    const textArea = document.createElement("textarea");
    textArea.textContent = copyText || "";
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  } finally {
    shareBtnContent.value = "COPIED!";
    setTimeout(() => {
      shareBtnContent.value = "SHARE";
    }, 1000);
  }
};
</script>

<template>
  <div class="end-display">
    <h2 v-if="hasWon">You got it! 🎉</h2>
    <h2 v-else>
      The answer was: <span class="answer">{{ answer }}</span>
    </h2>
    <pre id="share-message">{{ shareMessage }}</pre>
    <button class="share-btn" @click="copy">{{ shareBtnContent }}</button>
    <div class="guesses-display">
      <button class="show-guesses-btn" @click="toggleGuesses">
        {{ showGuesses ? "Hide" : "Show" }} Guesses
      </button>
      <div v-if="showGuesses">
        <div v-for="(guess, i) of guesses" :key="guess">
          {{ i === guesses.length - 1 && hasWon ? "✅" : "❌" }} {{ guess }}
        </div>
      </div>
    </div>
    <div>Next challenge at <b class="emphasis">midnight</b>! 🕛</div>
    <p class="sponsor">
      ❤️ {{ APP_NAME }}?
      <a
        href="https://ko-fi.com/flibustier"
        target="_blank"
        rel="noreferrer"
        class="ml-1 underline"
        >Buy me a coffee!</a
      >
    </p>
  </div>
</template>

<style scoped>
.end-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

h2 {
  line-height: 1.75rem;
  text-align: center;
}

.answer {
  display: block;
  font-weight: 500;
}

.share-btn {
  font-size: 1.25rem;
  line-height: 1.75rem;

  padding: 0.25rem 0.75rem;

  color: var(--color-primary-inverted);
  background-color: var(--color-primary);
  border-radius: var(--border-radius);
}

.guesses-display {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0.5rem;
}

.show-guesses-btn {
  text-decoration-line: underline;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: transparent;
  background-image: none;
}

.sponsor {
  font-size: 0.75rem;
  line-height: 1rem;
  margin-top: 0.5rem;
}

.emphasis {
  font-weight: 500;
}
</style>
