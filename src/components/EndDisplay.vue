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
  categories: {
    type: Array<string>,
    default: [],
  },
});

const isCommunity = computed(() => props.categories.includes("community"));

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
      <button class="show-guesses-btn" @click="toggleGuesses">
        {{ showGuesses ? "Hide" : "Show" }} Guesses
      </button>
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
      <button class="share-btn" @click="copy">
        <span>{{ shareBtnContent }}</span>
        <IconCopy style="fill: white" />
      </button>
      <div class="separator"></div>
      <div class="right-buttons">
        <button class="white-btn" @click="openLinks" v-if="links.length > 0">
          <span>Learn more about it</span>
          <IconWiki />
        </button>
        <button class="white-btn" @click="$emit('showBackModal')">
          <span>Try another one!</span>
          <IconBack />
        </button>
      </div>
    </div>
    <div class="extra">
      <p v-if="description" class="description">« {{ description }} »</p>
      <a
        v-if="props.categories.includes('modernism')"
        href="https://amzn.to/4aiOqrL"
        target="_blank"
        @click="() => sendEvent('recommendations: modernism')"
      >
        <p style="text-align: center">Today’s suggestion</p>
        <img src="/recommendations/modernism.jpg" height="180px" />
      </a>
    </div>
    <div v-if="isCommunity" style="text-align: center">
      This project has been brought to you by one of ArchiGuesser’s players.
      Thank you 👏
    </div>
    <div>
      <span>Next challenge <b class="emphasis">tomorrow</b>! 🕛</span>
    </div>
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

button {
  border-radius: var(--border-radius);
  padding: 0.25rem 0.75rem;
}

button svg {
  margin-left: 0.25rem;
  vertical-align: text-top;
}

.right-buttons,
.guesses-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.share-btn {
  font-size: 1.1rem;
  align-self: center;

  color: var(--color-primary-inverted);
  background-color: var(--color-primary);
}

.white-btn {
  border: 1px solid;
  background-color: var(--background-color);
}

.show-guesses-btn {
  text-decoration-line: underline;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: transparent;
  background-image: none;
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

.extra {
  display: flex;
  gap: 2rem;
  align-items: center;
}

@media screen and (max-width: 32rem) {
  .extra {
    flex-direction: column-reverse;
    gap: 1rem;
  }
}

.description {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1rem;
}

.sponsor {
  font-size: 0.75rem;
  line-height: 1rem;
  margin-top: 0.5rem;
}
</style>
