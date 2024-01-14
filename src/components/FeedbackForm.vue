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
  <div class="form-line">
    <div class="search">
      <input
        type="text"
        class="search-input"
        placeholder="Example: Leaning Tower of Pisa…"
        v-model="feedback"
        @keyup.enter="submit"
      />
    </div>
    <input
      class="submit-btn"
      type="submit"
      value="SUBMIT"
      @mousedown="submit"
      :disabled="sending || feedback.length < 3"
    />
  </div>
</template>

<style scoped>
.form-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
}

.search {
  position: relative;
  width: 85%;
  color: var(--color-background);
}

.search .search-input {
  font-size: 1rem;
  line-height: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  width: 100%;
  padding: 0 0.5rem;
}

.search .search-input:focus-visible {
  outline: 0px solid transparent;
  box-shadow: 0px 0px 3px 0px var(--color-border);
}

.submit-btn {
  border-radius: var(--border-radius);
  width: 15%;
  height: 100%;
  padding: 0.05rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.75rem;
  cursor: pointer;
  color: var(--color-primary-inverted);
  background-color: var(--color-primary);
  text-align: center;
  opacity: 100%;
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 60%;
  transition: opacity 0.4s;
}

@media screen and (max-width: 456px) {
  .form-line {
    flex-direction: column;
  }

  .search {
    width: 100%;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
