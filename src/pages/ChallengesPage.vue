<script setup lang="ts">
import { capitalize, ref } from "vue";

import IconTrophy from "@/components/icons/IconTrophy.vue";
import IconLocked from "@/components/icons/IconLocked.vue";
import IconUnlocked from "@/components/icons/IconUnlocked.vue";

import {
  ITEMS_PER_LEVEL,
  MAX_LEVEL,
  LISTED_CATEGORIES,
  LOCKED_CATEGORIES_LOGGED,
} from "@/config.json";
import { challengePath, navigate } from "@/router";
import { categoryByName } from "@/services/data";
import { getChallenges, isLogged } from "@/services/store";

document.title = "ArchiGuesser - Themed challenges";

const categories = [...LISTED_CATEGORIES, ...LOCKED_CATEGORIES_LOGGED];
const challenges = getChallenges();

// category asking to sign in (first click on a locked theme)
const askingToSignIn = ref("");

const isCategoryLocked = (category: string) =>
  LOCKED_CATEGORIES_LOGGED.includes(category) && !isLogged();

const onClick = (event: MouseEvent, category: string) => {
  if (!isCategoryLocked(category)) {
    return; // a normal link
  }
  event.preventDefault();
  event.stopPropagation();
  if (askingToSignIn.value === category) {
    navigate("/account");
    return;
  }
  askingToSignIn.value = category;
  setTimeout(() => {
    if (askingToSignIn.value === category) {
      askingToSignIn.value = "";
    }
  }, 10_000);
};

const currentLevel = (category: string) => challenges[category] || 0;
const maxLevel = (category: string) =>
  Math.min(
    MAX_LEVEL,
    Math.floor((categoryByName(category)?.count || 0) / ITEMS_PER_LEVEL),
  );
</script>

<template>
  <div class="page">
    <h1 class="page-title">Projects By Theme</h1>

    <div class="header">
      <p>
        Select a theme, you will have a series of random projects to guess with
        only one image per project, so no error is allowed!
      </p>
      <p>If you succeed, you will win a trophy and level up! <IconTrophy /></p>
    </div>

    <div class="image-grid">
      <a
        v-for="category of categories"
        :key="category"
        class="image-cell clickable"
        :href="challengePath(category)"
        @click="onClick($event, category)"
      >
        <img
          class="thumbnail"
          loading="lazy"
          width="200"
          height="200"
          :src="`/categories/${category}.jpg`"
          alt=""
        />
        <div class="thumbnail-overlay">
          <span v-if="askingToSignIn === category">
            You must be signed in to play this challenge (click again to sign
            in)
          </span>
          <template v-else>
            <span class="category">{{ capitalize(category) }}</span>
            <span class="level">
              <IconTrophy />
              {{ currentLevel(category) }}/{{ maxLevel(category) }}
            </span>
            <template v-if="LOCKED_CATEGORIES_LOGGED.includes(category)">
              <IconLocked v-if="!isLogged()" />
              <IconUnlocked v-else />
            </template>
          </template>
        </div>
      </a>
    </div>
  </div>
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
  color: inherit;
  text-decoration: none;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.clickable:hover,
.clickable:focus-visible {
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
