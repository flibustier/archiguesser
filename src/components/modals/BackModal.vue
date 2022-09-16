<script setup lang="ts">
import { computed } from "vue";

import BaseModal from "./BaseModal.vue";
import IconBack from "../icons/IconBack.vue";
import IconCheck from "../icons/IconCheck.vue";

import { getRealDayNumber, isMonument } from "@/DailySelector";
const realCurrentDay = getRealDayNumber();

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:isVisible"]);

const closeModal = () => {
  emit("update:isVisible", false);
};

const stats = computed(() => JSON.parse(localStorage.getItem("stats") || "{}"));

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
        <p>🏛: Historic Monuments</p>
        <div class="days-selection">
          <div
            :class="`day-selection ${stats[i] ? '' : 'clickable'}`"
            v-for="i of realCurrentDay - 1"
            :key="i"
            @click="goToDay(i)"
          >
            <div>
              <span>#{{ i }}</span>
              <span v-if="isMonument(i)"> 🏛</span>
            </div>
            <div v-if="stats[i]" class="icon icon-check"><IconCheck /></div>
            <div v-else class="icon icon-replay"><IconBack /></div>
          </div>
          <div class="day-selection clickable" @click="goToDay()">
            <span class="today">Today</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer> </template>
  </BaseModal>
</template>

<style scoped>
.days-selection {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.day-selection {
  margin-top: 1rem;
  padding: 0.75rem;

  min-width: 6.4rem;
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  box-shadow: rgba(213, 217, 217, 0.5) 1px 2px 5px 0;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}

.clickable:hover {
  cursor: pointer;
  border-color: var(--color-primary);
  border-right: 1px solid var(--color-primary);
  transition: border-bottom 0.3s, border-left 0.9s, border-top 2.1s,
    border-right 2.7s;
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
