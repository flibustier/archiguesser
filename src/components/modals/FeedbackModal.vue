<script setup lang="ts">
import { ref, computed } from "vue";

import FeedbackForm from "../FeedbackForm.vue";
import BaseModal from "./BaseModal.vue";

import { saveFeedback, getLastFeedback } from "@/services/store";

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

const skipModal = (neverAskAgain?: string) => {
  saveFeedback(neverAskAgain);
  closeModal();
};

const submitted = ref(false);

const onSubmitted = () => {
  submitted.value = true;
  setTimeout(closeModal, 2000);
};

const feedbackAlreadySkipped = computed(
  () => getLastFeedback()?.value === "skipped",
);
</script>

<template>
  <BaseModal
    title="Well done! 🎉"
    :is-visible="isVisible"
    @update:is-visible="() => skipModal()"
  >
    <template #default>
      <div v-if="!submitted">
        <p class="text">
          Thank you for playing today’s ArchiGuesser!<br />
          You’re one of our best players. 🏆<br />
          <br />
          You get to write down a project you would like to see on ArchiGuesser
        </p>

        <FeedbackForm @submitted="onSubmitted" />
      </div>
      <p v-else class="text">Thank you for your suggestion!</p>
    </template>

    <template v-if="!submitted" #footer>
      <button
        v-if="feedbackAlreadySkipped"
        class="white-btn"
        @click="() => skipModal('never')"
      >
        Don’t ask me again
      </button>
      <button class="white-btn" @click="() => skipModal()">Maybe later</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.text {
  text-align: center;
}

button {
  border-radius: var(--border-radius);
  padding: 0.25rem 0.75rem;
}

.white-btn {
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  margin: auto;
}
</style>
