<script setup lang="ts">
import BaseModal from "./BaseModal.vue";
import AboutContent from "../about/AboutContent.vue";

import { setFirstTime } from "@/services/store";

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:isVisible"]);

const closeModal = () => {
  setFirstTime();
  emit("update:isVisible", false);
};
</script>

<template>
  <BaseModal
    title="Welcome to ArchiGuesser!"
    :is-visible="isVisible"
    @update:is-visible="closeModal"
  >
    <template #default>
      <AboutContent />
    </template>

    <template #footer>
      <button class="btn-secondary btn-small start" @click="closeModal">
        Start playing!
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.start {
  margin: auto;
}
</style>
