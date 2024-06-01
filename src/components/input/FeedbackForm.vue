<script setup lang="ts">
import { ref } from "vue";

import { sendFeedback } from "@/services/api";
import { saveFeedback } from "@/services/store";

const feedback = ref("");
const sending = ref(false);

const emit = defineEmits(["submitted"]);

const submit = async () => {
  await sendFeedback(feedback.value);
  saveFeedback(feedback.value);
  emit("submitted");
};
</script>

<template>
  <div class="input-row">
    <div class="input-wrap">
      <input
        type="text"
        placeholder="Example: Leaning Tower of Pisa…"
        v-model="feedback"
        @keyup.enter="submit"
      />
    </div>
    <button
      class="btn-primary btn-small"
      type="submit"
      @mousedown="submit"
      :disabled="sending || feedback.length < 3"
    >
      SUBMIT
    </button>
  </div>
</template>

<style scoped>
.input-wrap {
  width: 85%;
}
</style>
