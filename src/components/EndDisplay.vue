<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { URL, APP_NAME } from "../config.json";

import { sendEvent, fetchWikipediaSummary } from "@/services/api";

import IconBack from "./icons/IconBack.vue";
import IconCopy from "./icons/IconCopy.vue";
import IconWiki from "./icons/IconWiki.vue";
import IconCheck from "./icons/IconCheck.vue";
import IconTimes from "./icons/IconTimes.vue";

const description = ref("");
const showGuesses = ref(false);
const shareBtnContent = ref("SHARE");

const toggleGuesses = () => {
  sendEvent("Show Guesses");
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
  percent: {
    type: Number,
    required: false,
  },
  links: {
    type: Array<string>,
    default: [],
  },
});

const resultSquares = computed(() => {
  const redSquares = `<span class="square red">🟥</span> `.repeat(
    props.guesses.length - 1,
  );
  const blackSquares = `<span class="square black">⬛</span> `.repeat(
    6 - props.guesses.length,
  );
  const midSquare = props.hasWon
    ? `<span class="square green">🟩</span> `
    : `<span class="square red">🟥</span> `;
  const squares = redSquares + midSquare + blackSquares;

  return `${squares}`;
});

const shareMessage = computed(() => {
  return `${APP_NAME} #${props.dayNumber}\n🏛 ${
    document.getElementById("share-message")?.textContent || ""
  }\n\n${URL}`;
});

const copy = async () => {
  const copyText = shareMessage.value;
  try {
    await navigator.clipboard.writeText(copyText);
  } catch (e) {
    console.log("fallback copy");
    const textArea = document.createElement("textarea");
    textArea.textContent = copyText;
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  } finally {
    shareBtnContent.value = "COPIED!";
    setTimeout(() => {
      shareBtnContent.value = "SHARE";
    }, 2000);
    sendEvent("Shared");
  }
};

const openLinks = () => {
  window.open(props.links[0], "_blank")?.focus();
  sendEvent("Learn");
};

onMounted(async () => {
  if (props.links.length > 0) {
    description.value = await fetchWikipediaSummary(props.links[0]);
  }
});
</script>

<template>
  <div class="end-display">
    <div class="result">
      <h2 v-if="hasWon">You got it! 🎉</h2>
      <h2 v-else>
        The answer was: <span class="answer">{{ answer }}</span>
      </h2>
      <div v-if="percent && percent < 50" class="emphasis">
        🥇 Only {{ percent }}% found it in {{ guesses.length }} tries or less!
        Well done! 👏
      </div>
    </div>
    <div id="share-message" v-html="resultSquares" />
    <div class="guesses-display">
      <a class="show-guesses" @click="toggleGuesses">
        {{ showGuesses ? "Hide" : "Show" }} Guesses
      </a>
      <div v-if="showGuesses" class="history">
        <div v-for="(guess, i) of guesses" :key="guess" class="history-row">
          <span class="history-icon">
            <IconCheck v-if="i === guesses.length - 1 && hasWon" />
            <IconTimes v-else />
          </span>
          <span>{{ guess || "…" }}</span>
        </div>
      </div>
    </div>
    <div class="buttons">
      <button class="btn-primary" @click="copy">
        {{ shareBtnContent }}
        <IconCopy style="fill: white" />
      </button>
      <div class="separator"></div>
      <div class="btn-group">
        <button
          class="btn-secondary btn-with-icon"
          @click="openLinks"
          v-if="links.length > 0"
        >
          <span>Learn more about it</span>
          <IconWiki />
        </button>
        <button
          class="btn-secondary btn-with-icon"
          @click="$emit('showBackModal')"
        >
          <span>Try another one</span>
          <IconBack />
        </button>
      </div>
    </div>
    <p v-if="description" class="description">
      « {{ description }} » <a @click="openLinks">Show more…</a>
    </p>
    <div>Next challenge <b class="emphasis">tomorrow</b>! 🕛</div>
    <p class="sponsor" v-if="false">
      ❤️ {{ APP_NAME }}?
      <a href="https://www.instagram.com/archiguesser/" target="_blank"
        >Follow me on Instagram!</a
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

.emphasis {
  margin-top: 0.5rem;
  font-weight: 500;
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

.guesses-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.show-guesses {
  text-align: center;
}

.history {
  display: flex;
  flex-direction: column-reverse;
}

.history-row {
  display: flex;
  align-items: center;
  gap: var(--gap);
}

.history-icon {
  display: flex;
}

.description {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1rem;
}

.sponsor {
  font-size: 0.9rem;
  line-height: 1rem;
  margin-top: 0.5rem;
}
</style>
