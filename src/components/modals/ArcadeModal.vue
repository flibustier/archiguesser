<script setup lang="ts">
import { capitalize } from "vue";

import BaseModal from "./BaseModal.vue";
import IconTrophy from "../icons/IconTrophy.vue";

import { ITEMS_PER_LEVEL, MAX_LEVEL, LISTED_CATEGORIES } from "@/config.json";
import { getProjectsByCategory } from "@/services/projects";
import { getChallenges } from "@/services/store";

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:isVisible"]);
const closeModal = () => emit("update:isVisible", false);

const goToCategory = (category: string) =>
  (window.location.href = `/?challenge=${category}`);

const currentLevel = (category: string) => getChallenges()[category] || 0;
const maxLevel = (category: string) =>
  Math.min(
    MAX_LEVEL,
    Math.floor(getProjectsByCategory(category).length / ITEMS_PER_LEVEL),
  );
</script>

<template>
  <BaseModal
    title="Projects By Theme"
    :is-visible="isVisible"
    @update:is-visible="closeModal"
  >
    <template #default>
      <div>
        <div class="header">
          <p>
            Select a theme, you will have a series of random projects to guess
            with only one image per project, so no error is allowed!
          </p>
          <p class="text-with-icons">
            If you succeed, you will win a trophy and level up! <IconTrophy />
          </p>
        </div>

        <div class="image-grid">
          <div
            v-for="(category, i) of LISTED_CATEGORIES"
            :key="category"
            @click="goToCategory(category)"
          >
            <div class="image-cell clickable">
              <img
                class="thumbnail"
                :src="`categories/${category}.jpg`"
                :alt="`#${i}`"
              />
              <div class="thumbnail-overlay">
                <span class="category">{{ capitalize(category) }}</span>
                <span class="level"
                  ><IconTrophy />{{ currentLevel(category) }}/{{
                    maxLevel(category)
                  }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.header {
  text-align: center;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.image-cell {
  display: flex;
  width: 202px;
  height: 202px;
  font-size: large;
  text-align: center;
  border: 1px solid transparent;
}

.thumbnail {
  position: absolute;
  top: 0;
  left: 0;

  filter: opacity(30%);
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

.image-cell .thumbnail-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.clickable:hover {
  cursor: pointer;
  border-color: var(--color-primary);
  transition: border 0.3s;
}

.category {
  font-weight: 500;
}

.level {
  font-weight: 300;
}
</style>
