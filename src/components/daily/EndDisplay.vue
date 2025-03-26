<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { URL, APP_NAME } from "@/config.json";

import { sendEvent, fetchWikipediaSummary } from "@/services/api";

import IconBack from "../icons/IconBack.vue";
import IconCopy from "../icons/IconCopy.vue";
import IconWiki from "../icons/IconWiki.vue";
import IconCheck from "../icons/IconCheck.vue";
import IconTimes from "../icons/IconTimes.vue";

import RecommendationLink from "./RecommendationLink.vue";

const description = ref("");
const showGuesses = ref(false);
const shareBtnContent = ref("SHARE");
const voted = ref(false);

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
  percent: {
    type: Number,
    required: false,
  },
  project: {
    type: Object,
    required: true,
  },
});

const isCommunity = computed(() =>
  props.project.categories.includes("community"),
);

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
  return `${APP_NAME} #${props.project.dayNumber}\n🏛 ${
    document.getElementById("share-message")?.textContent || ""
  }\n\n${URL}/?day=${props.project.dayNumber}`;
});

const copy = async () => {
  const copyText = shareMessage.value;
  try {
    await navigator.clipboard.writeText(copyText);
  } catch {
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

const vote = (result) => {
  sendEvent("HS1: " + result);
  voted.value = true;
};

const openLinks = () => {
  window.open(props.project.links[0], "_blank")?.focus();
  sendEvent("Learn");
};

onMounted(async () => {
  if (props.project.links.length > 0) {
    description.value = await fetchWikipediaSummary(props.project.links[0]);
  }
});
</script>

<template>
  <div class="column end-display">
    <div class="result">
      <h2 v-if="hasWon">You got it! 🎉</h2>
      <h2 v-else>
        The answer was: <span class="answer">{{ project.answer }}</span>
      </h2>
      <div v-if="percent && percent < 50" class="emphasis">
        🥇 Only {{ percent }}% found it in {{ guesses.length }} tries or less!
        Well done! 👏
      </div>
    </div>
    <div id="share-message" v-html="resultSquares" />
    <div class="column-stretch">
      <a class="text-small text-center" href="#" @click="toggleGuesses">
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
    <p v-if="project['hors-serie']" style="text-align: center">
      <template v-if="!voted">
        <b>Did you enjoy this <i>Hors-Série</i>?<br /></b>
        <a @click="vote('yes')">Yes, I want to play more of these!</a>
        <br />
        <a @click="vote('no')">No, I prefer the daily challenge</a>
      </template>
      <template v-else> Thank you for your feedback! </template>
    </p>
    <div class="row">
      <button class="btn-primary" @click="copy">
        <span>{{ shareBtnContent }}</span>
        <IconCopy style="fill: white" />
      </button>
      <div class="separator"></div>
      <div class="column-stretch">
        <button
          class="btn-secondary"
          @click="openLinks"
          v-if="project.links.length > 0"
        >
          <span>Learn more about it</span>
          <IconWiki />
        </button>
        <button class="btn-secondary" @click="$emit('showBackModal')">
          <span>Try another one!</span>
          <IconBack />
        </button>
      </div>
    </div>
    <div class="extra">
      <p v-if="project['hors-serie']">
        Featured projects :<br />
        1.
        <a href="https://www.oma.com/projects/parc-de-la-villette"
          >Parc de la Villette / OMA / 1982</a
        ><br />
        2.
        <a href="https://fr.wikipedia.org/wiki/Maison_de_Loo">Maison de Loo</a
        ><br />
        3.
        <a
          href="https://en.wikipedia.org/wiki/Passerelle_L%C3%A9opold-S%C3%A9dar-Senghor"
          >Passerelle Léopold-Sédar-Senghor (passerelle Solférino) / Marc
          Mimram</a
        ><br />
        4.
        <a href="https://en.wikipedia.org/wiki/Plan_Voisin"
          >Plan Voisin / Le Corbusier</a
        ><br />
        5.
        <a href="https://en.wikipedia.org/wiki/Gare_de_l%27Est">Gare de l’Est</a
        ><br />
      </p>
      <p v-if="description" class="description border" v-html="description" />
      <RecommendationLink :recommendation="project.recommendation" />
    </div>
    <p v-if="isCommunity" class="text-center">
      This project has been brought to you by
      {{ project.credits ? project.credits + ", an" : "one of" }} ArchiGuesser’s
      players. Thank you 👏
    </p>
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
  align-items: center;
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

.separator {
  background-color: var(--color-border);
  width: 1px;
}

.btn-primary {
  font-size: 1.1rem;
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
  align-items: center;
  gap: 2rem;
}

@media screen and (max-width: 48rem) {
  .extra {
    flex-direction: column-reverse;
    gap: 1rem;
  }
}

.description {
  padding: 1rem;
  text-align: justify;
  max-width: 62rem;
}

.sponsor {
  font-size: 0.75rem;
  line-height: 1rem;
  margin-top: 0.5rem;
}
</style>
