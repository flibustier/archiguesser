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
      <p>Your progress is saved on your logged devices!<br /></p>
      <div class="form-line">
        <label for="email">Email</label>
        <input v-model="email" type="text" id="email" disabled />
      </div>

      <button class="white-btn" @click="logout()">Logout</button>
    </template>
  </BaseModal>
</template>

<style scoped>
p {
  text-align: center;
}

.form-line {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  max-width: 25rem;
}

@media screen and (max-width: 456px) {
  .form-line {
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

button {
  border-radius: var(--border-radius);
  padding: 0.25rem 0.75rem;
}

.white-btn {
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  align-self: center;
}
</style>
