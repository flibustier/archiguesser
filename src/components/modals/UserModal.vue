<script setup lang="ts">
import { ref } from "vue";

import BaseModal from "./BaseModal.vue";

import { getCredentials, setLogOut } from "@/services/store";

const email = ref(getCredentials()?.email);

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:isVisible"]);

const closeModal = () => emit("update:isVisible", false);
const logout = () => {
  setLogOut();
  closeModal();
  window.location.reload();
};
</script>

<template>
  <BaseModal
    title="Account"
    :is-visible="isVisible"
    @update:is-visible="closeModal"
  >
    <template #default>
      <p class="text-center">Your progress is saved on your logged devices!</p>
      <div class="form-row">
        <label for="email">Email</label>
        <input v-model="email" type="text" id="email" disabled />
      </div>

      <button class="btn-secondary btn-small self-center" @click="logout()">
        Logout
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.form-row {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  max-width: 25rem;
}

@media screen and (max-width: 456px) {
  .form-row {
    flex-direction: column;
  }
}

input {
  height: 1.5rem;
  width: 100%;
  max-width: 15rem;
  padding: 0.05rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background);
}
</style>
