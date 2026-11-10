<script setup lang="ts">
import { ref } from "vue";

import { navigate } from "@/router";
import { fetchChallenge, findCategory } from "@/services/data";
import type { ChallengeProject } from "@/services/types";

import ArcadeGame from "@/components/arcade/ArcadeGame.vue";

// slug of the theme, from the URL (/challenge/le-corbusier)
const props = defineProps<{ category: string }>();

const category = findCategory(props.category);
const projects = ref<ChallengeProject[]>();
const isOffline = ref(false);

const load = async () => {
  isOffline.value = false;
  try {
    projects.value = await fetchChallenge(props.category);
  } catch {
    isOffline.value = true;
  }
};

if (category) {
  load();
} else {
  navigate("/challenges", { replace: true });
}
</script>

<template>
  <ArcadeGame
    v-if="category && projects"
    :category="category.name"
    :projects="projects"
  />
  <div v-else-if="isOffline" class="column text-center" role="alert">
    <p>This challenge could not be loaded: it looks like you are offline.</p>
    <button class="btn-secondary self-center" @click="load">Try again</button>
  </div>
</template>
