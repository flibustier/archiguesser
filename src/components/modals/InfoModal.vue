<script setup lang="ts">
import IconPictures from "../icons/IconPictures.vue";
import IconEye from "../icons/IconEye.vue";
import IconList from "../icons/IconList.vue";
import BaseModal from "./BaseModal.vue";

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
      <div class="text-with-icon">
        <IconPictures />
        <p>Use the image provided to guess the name of the project.</p>
      </div>
      <div class="text-with-icon">
        <IconEye />
        <p>
          If you get a guess wrong a new image from the project is revealed.
        </p>
      </div>
      <div class="text-with-icon">
        <IconList />
        <p>
          You have a maximum of 6 guesses (which means 6 pictures) to find the
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
      <p>
        Got a suggestion or want to contribute ? Contact me via
        <a href="mailto:contact@archiguesser.com">email</a> or
        <a href="https://www.instagram.com/archiguesser/">Instagram</a>
      </p>
    </template>
  </BaseModal>
</template>

<style scoped>
.text-with-icon {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.space-before {
  margin-top: 1rem;
}
</style>
