<script setup lang="ts">
import { computed, ref } from "vue";

import IconHelp from "@/components/icons/IconHelp.vue";
import IconTrophy from "@/components/icons/IconTrophy.vue";

import { getRealDayNumber } from "@/services/date";
import { computeStatistics } from "@/services/statistics";
import {
  getScore,
  getStats,
  getChallengesScore,
  getDailiesScore,
} from "@/services/store";

document.title = "ArchiGuesser - Your score";

const showDetails = ref(false);
const score = getScore();
const statistics = computeStatistics(getStats(), getRealDayNumber());

const LABELS = ["1", "2", "3", "4", "5", "6", "✕"];
const bars = computed(() => {
  const highest = Math.max(1, ...statistics.distribution);

  return statistics.distribution.map((count, i) => ({
    label: LABELS[i],
    name: i < 6 ? `Found in ${i + 1}` : "Not found",
    count,
    // an empty bar still shows its number
    width: Math.max(8, Math.round((count / highest) * 100)),
    isLoss: i === 6,
  }));
});
</script>

<template>
  <div class="page page-narrow">
    <h1 class="page-title">Score</h1>

    <div class="text-center">
      <p class="score">{{ score }}</p>
      <h3>Daily Challenges: {{ getDailiesScore() }}</h3>
      <h3>Theme Challenges: {{ getChallengesScore() }}</h3>
    </div>

    <dl class="figures">
      <div>
        <dd>{{ statistics.played }}</dd>
        <dt>Played</dt>
      </div>
      <div>
        <dd>{{ statistics.winRate }}%</dd>
        <dt>Found</dt>
      </div>
      <div>
        <dd>{{ statistics.currentStreak }}</dd>
        <dt>Current streak</dt>
      </div>
      <div>
        <dd>{{ statistics.bestStreak }}</dd>
        <dt>Best streak</dt>
      </div>
    </dl>

    <section v-if="statistics.played > 0" aria-label="Guess distribution">
      <h2 class="page-title">Guess distribution</h2>
      <ol class="distribution">
        <li
          v-for="bar in bars"
          :key="bar.label"
          :aria-label="`${bar.name}: ${bar.count}`"
        >
          <span class="label" aria-hidden="true">{{ bar.label }}</span>
          <span
            :class="['bar', { loss: bar.isLoss, empty: bar.count === 0 }]"
            :style="{ width: bar.width + '%' }"
            aria-hidden="true"
          >
            {{ bar.count }}
          </span>
        </li>
      </ol>
    </section>
    <p v-else class="text-center">
      Play <a href="/">today’s challenge</a> to start your statistics!
    </p>

    <button
      class="details-toggle"
      :aria-expanded="showDetails"
      @click="showDetails = !showDetails"
    >
      <IconHelp /> <span>How are points counted ?</span>
    </button>

    <ul v-if="showDetails">
      <li>Each daily challenge is 1 point, up to 7 (when found in 1 guess)</li>
      <li>
        50 points for the first level of a theme challenge <IconTrophy />,
      </li>
      <li>100 points for the second level,</li>
      <li>150 points for the third level, etc…</li>
      <li>50 bonus points when you’re signed in</li>
    </ul>
  </div>
</template>

<style scoped>
.score {
  font-size: 2rem;
  font-weight: 500;
  line-height: 1.5;
}

.figures {
  display: flex;
  justify-content: space-around;
  text-align: center;
  gap: var(--gap);
}

.figures dd {
  font-size: 1.5rem;
  font-weight: 500;
}

.figures dt {
  font-size: 0.875rem;
}

.distribution {
  list-style: none;
  padding: 0;
  margin-top: var(--gap);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.distribution li {
  display: flex;
  align-items: center;
  gap: var(--gap);
}

.label {
  width: 1rem;
  text-align: center;
}

.bar {
  min-width: 2rem;
  padding: 0 0.5rem;
  text-align: right;
  color: white;
  background-color: #2f7d2f;
  border-radius: 0.25rem;
}

.bar.loss {
  background-color: #c9523a;
}

.bar.empty {
  color: var(--color-text);
  background-color: var(--color-light-background);
}

.details-toggle {
  align-self: center;
  background: none;
  text-decoration: underline;
  gap: 0.5rem;
}

.details-toggle > svg {
  margin: 0;
  filter: invert(48%) sepia(73%) saturate(406%) hue-rotate(342deg)
    brightness(97%) contrast(83%);
}
</style>
