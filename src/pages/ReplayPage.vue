<script setup lang="ts">
import { computed, ref } from "vue";

import IconBack from "@/components/icons/IconBack.vue";
import IconCheck from "@/components/icons/IconCheck.vue";
import ToggleSwitch from "@/components/basic/ToggleSwitch.vue";

import { SKIPPED_DAYS } from "@/config.json";
import { dayPath } from "@/router";
import { gameIndex } from "@/services/data";
import { replayableDays } from "@/services/days";
import { getRealDayNumber } from "@/services/date";
import { pictureFolder } from "@/services/pictures";
import { getStats, getSettings, setSetting } from "@/services/store";

const REPLAYABLE_DAYS = 60;

document.title = "ArchiGuesser - Replay previous days";

// the last 60 days that were actually played (every day in development)
const days = replayableDays(
  getRealDayNumber(),
  SKIPPED_DAYS,
  import.meta.env.DEV ? Infinity : REPLAYABLE_DAYS,
);
const monumentDays = new Set(gameIndex.monumentDays);

const showThumbnail = ref(getSettings().showThumbnail ?? true);
const toggleShowThumbnail = (value: boolean) => {
  showThumbnail.value = value;
  setSetting("showThumbnail", value);
};

const stats = computed(getStats);
const isDayPlayed = (day: number) => day in stats.value;
</script>

<template>
  <div class="page">
    <h1 class="page-title">Replay Previous Days</h1>

    <div class="header">
      <p v-if="!showThumbnail">🏛: Historic Monuments</p>
      <p v-else></p>
      <ToggleSwitch
        label="Show Thumbnails"
        :model-value="showThumbnail"
        @update:model-value="toggleShowThumbnail"
      />
    </div>

    <div :class="['days', showThumbnail ? 'image-grid' : 'text-grid']">
      <a
        href="/"
        :class="[
          'day',
          'clickable',
          showThumbnail ? 'image-cell' : 'text-cell',
        ]"
      >
        <span class="today">Today</span>
      </a>
      <a
        v-for="i in days"
        :key="i"
        :href="dayPath(i)"
        :aria-label="`Day ${i}` + (isDayPlayed(i) ? ' (already played)' : '')"
        :class="[
          'day',
          showThumbnail ? 'image-cell' : 'text-cell',
          isDayPlayed(i) ? 'done' : 'clickable',
        ]"
      >
        <template v-if="!showThumbnail">
          <div>
            <span>#{{ i }}</span>
            <span v-if="monumentDays.has(i)"> 🏛</span>
          </div>
          <div v-if="isDayPlayed(i)" class="icon icon-check">
            <IconCheck />
          </div>
          <div v-else class="icon icon-replay"><IconBack /></div>
        </template>
        <template v-else>
          <img
            class="thumbnail"
            loading="lazy"
            width="200"
            height="200"
            :src="`/${pictureFolder(i)}/0.jpg`"
            :alt="`#${i}`"
          />
          <div v-if="isDayPlayed(i)" class="thumbnail-overlay">
            <span style="margin-right: 0.5rem">#{{ i }}</span>
            <div class="icon icon-check"><IconCheck /></div>
          </div>
        </template>
      </a>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
}

.days {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.text-grid {
  gap: 1rem;
}

.image-grid {
  gap: 0.5rem;
  margin-top: 1rem;
}

.day {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  border: 1px solid transparent;
  color: inherit;
  text-decoration: none;
}

.text-cell {
  margin-top: 1rem;
  padding: 0.75rem;

  min-width: 6.4rem;
  border-radius: var(--border-radius);
  box-shadow: var(--color-shadow) 1px 2px 5px 0;
}

.image-cell {
  width: 202px;
  height: 202px;
  font-size: large;
}

.thumbnail {
  position: absolute;
  top: 0;
  left: 0;
}

@media screen and (max-width: 62rem) {
  .image-cell {
    width: 135px;
    height: 135px;
  }

  .thumbnail {
    width: 135px;
    height: 135px;
  }
}

.thumbnail-overlay {
  width: 100%;
  display: none;
}

.image-cell:hover .thumbnail-overlay,
.image-cell:focus-visible .thumbnail-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}

.done .thumbnail {
  filter: opacity(30%);
}

.clickable:hover,
.day:focus-visible {
  cursor: pointer;
  border-color: var(--color-primary);
  transition: border 0.3s;
}

.clickable:hover .today {
  color: var(--color-primary);
}

.clickable:hover .icon-replay {
  transition: filter 0.3s;

  filter: invert(48%) sepia(73%) saturate(406%) hue-rotate(342deg)
    brightness(97%) contrast(83%);
}

.today {
  width: 100%;
}

.icon {
  display: flex;
  height: 100%;
}

.icon-check {
  filter: invert(33%) sepia(9%) saturate(3150%) hue-rotate(32deg)
    brightness(115%) contrast(87%);
}

/* the filter above turns a black icon green: a light icon needs the colour itself */
:root[data-theme="dark"] .icon-check {
  filter: none;
}

:root[data-theme="dark"] .icon-check svg {
  fill: var(--color-success);
}
</style>
