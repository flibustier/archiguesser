<script setup lang="ts">
import BaseModal from "./BaseModal.vue";

import IconEye from "../icons/IconEye.vue";
import IconList from "../icons/IconList.vue";
import IconPictures from "../icons/IconPictures.vue";

import { lastDay } from "@/services/projects";

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
</script>

<template>
  <BaseModal
    title="About"
    :is-visible="isVisible"
    @update:is-visible="closeModal"
  >
    <template #default>
      <p>
        ArchiGuesser is a game for architects and enthusiasts, inspired by
        <a href="https://framed.wtf" class="underline">Framed</a>,
        <a
          href="https://www.nytimes.com/games/wordle/index.html"
          class="underline"
          >Wordle</a
        >
        and
        <a
          href="https://medium.com/floodgates/the-complete-and-authoritative-list-of-wordle-spinoffs-fb00bfafc448"
          class="underline"
          >all the other spinoffs</a
        >.
      </p>
      <p>Each day an architectural project is picked from a curated list</p>
      <div class="row">
        <IconPictures />
        <p>Use the image provided to guess the name of the project.</p>
      </div>
      <div class="row">
        <IconEye />
        <p>
          If you get a guess wrong a new image from the project is revealed.<br />
          A hint is given after 3 tries.
        </p>
      </div>
      <div class="row">
        <IconList />
        <p>
          You have a maximum of 6 tries (which means 6 pictures) to find the
          project of the day.
        </p>
      </div>
      <p class="space-before">
        All picture rights go to the rightful owners - no copyright infringement
        intended.
      </p>
      <p>
        This project is Open Source and can be found on
        <a href="https://github.com/flibustier/archiguesser">GitHub</a>.
      </p>
    </template>

    <template #footer>
      <div>
        <p>
          Got a suggestion or want to contribute ? Contact me via
          <a href="https://www.instagram.com/archiguesser/">Instagram</a> or
          <a href="mailto:contact@archiguesser.com">email</a> !
        </p>
      </div>
      <div>
        <p>
          <a
            href="https://ko-fi.com/flibustier"
            target="_blank"
            rel="noreferrer"
            >Buy me a coffee? ☕️</a
          >
          #{{ lastDay() }}
        </p>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.row {
  align-items: center;
}

.space-before {
  margin-top: 1rem;
}
</style>
