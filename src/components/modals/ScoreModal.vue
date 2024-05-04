<script setup lang="ts">
import { computed, ref } from "vue";

import BaseModal from "./BaseModal.vue";
import IconHelp from "../icons/IconHelp.vue";
import IconTrophy from "../icons/IconTrophy.vue";

import {
  getScore,
  getChallengesScore,
  getDailiesScore,
} from "@/services/store";

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const showDetails = ref(false);
const rank = ref();
const score = computed(getScore);

const emit = defineEmits(["update:isVisible"]);

const closeModal = () => emit("update:isVisible", false);
</script>

<template>
  <BaseModal
    title="Score"
    :is-visible="isVisible"
    @update:is-visible="closeModal"
  >
    <template #default>
      <div class="column">
        <div class="text-center">
          <h1>{{ score }}</h1>
          <h3>Daily Challenges: {{ getDailiesScore() }}</h3>
          <h3>Theme Challenges: {{ getChallengesScore() }}</h3>
        </div>

        <div class="rank" v-if="rank">
          <h3>You’re ranked <b>1th</b></h3>
        </div>

        <a class="text-center" @click="showDetails = true">
          <IconHelp /> <span> How are points counted ?</span></a
        >

        <ul v-if="showDetails">
          <li>
            Each daily challenge is 1 point, up to 7 (when found in 1 guess)
          </li>
          <li>
            50 points for the first level of a theme challenge <IconTrophy />,
          </li>
          <li>100 points for the second level,</li>
          <li>150 points for the third level, etc…</li>
          <li>50 bonus points when you’re signed in</li>
        </ul>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
a > svg {
  vertical-align: text-top;
  filter: invert(48%) sepia(73%) saturate(406%) hue-rotate(342deg)
    brightness(97%) contrast(83%);
}
</style>
