<script setup lang="ts">
import { computed, ref } from "vue";

import BaseModal from "./BaseModal.vue";
import IconBack from "../icons/IconBack.vue";
import IconCheck from "../icons/IconCheck.vue";
import ToggleSwitch from "../basic/ToggleSwitch.vue";

import { getStats, getSettings, setSetting } from "@/store";
import { getRealDayNumber, isMonument } from "@/DailySelector";

const realCurrentDay = getRealDayNumber();
// range of 60 numbers starting at real current day
const days = [...Array(realCurrentDay).keys()]
  .slice(realCurrentDay - 59)
  .reverse();

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const showThumbnail = ref(getSettings().showThumbnail || false);
const toggleShowThumbnail = (value: boolean) => {
  showThumbnail.value = value;
  setSetting("showThumbnail", value);
};

const emit = defineEmits(["update:isVisible"]);
const closeModal = () => emit("update:isVisible", false);

const stats = computed(getStats);

const isDayPlayed = (day: number) => day in stats.value;
const goToDay = (i?: number) => (window.location.href = i ? `/?day=${i}` : "/");
</script>

<template>
  <BaseModal
    title="Replay Previous Days"
    :is-visible="isVisible"
    @update:is-visible="closeModal"
  >
    <template #default>
      <div>
        <div class="header">
          <p>🏛: Historic Monuments</p>
          <ToggleSwitch
            label="Show Thumbnails"
            :model-value="showThumbnail"
            @update:model-value="toggleShowThumbnail"
          />
        </div>

        <div :class="['days', showThumbnail ? 'image-grid' : 'text-grid']">
          <div
            :class="[
              'day',
              'clickable',
              showThumbnail ? 'image-cell' : 'text-cell',
            ]"
            @click="goToDay()"
          >
            <span class="today">Today</span>
          </div>
          <div v-for="i in days" :key="i" @click="goToDay(i)">
            <div
              :class="[
                'day',
                'text-cell',
                isDayPlayed(i) ? 'done' : 'clickable',
              ]"
              v-if="!showThumbnail"
            >
              <div>
                <span>#{{ i }}</span>
                <span v-if="isMonument(i)"> 🏛</span>
              </div>
              <div v-if="isDayPlayed(i)" class="icon icon-check">
                <IconCheck />
              </div>
              <div v-else class="icon icon-replay"><IconBack /></div>
            </div>
            <div
              :class="[
                'day',
                'image-cell',
                isDayPlayed(i) ? 'done' : 'clickable',
              ]"
              v-else
            >
              <img class="thumbnail" :src="`${i}/0.jpg`" :alt="`#${i}`" />
              <div v-if="isDayPlayed(i)" class="thumbnail-overlay">
                <span style="margin-right: 0.5rem">#{{ i }}</span>
                <div class="icon icon-check"><IconCheck /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer> </template>
  </BaseModal>
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
}

.text-cell {
  margin-top: 1rem;
  padding: 0.75rem;

  min-width: 6.4rem;
  border-radius: var(--border-radius);
  box-shadow: rgba(213, 217, 217, 0.5) 1px 2px 5px 0;
}

.image-cell {
  width: 200px;
  height: 200px;
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

.image-cell:hover .thumbnail-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}

.done .thumbnail {
  filter: opacity(30%);
}

.clickable:hover {
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
</style>
