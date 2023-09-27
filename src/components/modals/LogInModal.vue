<script setup lang="ts">
import { ref, computed } from "vue";

import { LOGGED_RETRIES } from "@/config.json";

import BaseModal from "./BaseModal.vue";

import { signIn } from "@/services/api";
import { storeStatsAndChallenges } from "@/services/user";
import { getStats, getChallenges, setLogIn } from "@/services/store";

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:isVisible"]);

const closeModal = () => emit("update:isVisible", false);
const closeAndRefresh = () => {
  closeModal();
  window.location.reload();
};

const email = ref("");
const password = ref("");
const error = ref("");
const isLoading = ref(false);
const isAccountCreated = ref(false);

const isEmailValid = computed(() =>
  /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value),
);
const isPasswordValid = computed(() => password.value.length > 7);

const submit = async () => {
  isLoading.value = true;
  const formattedEmail = email.value.toLowerCase();
  const stats = getStats();
  const challenges = getChallenges();
  const resp = await signIn(formattedEmail, password.value, stats, challenges);
  if ("output" in resp) {
    error.value = resp.output;
  } else {
    // successful log in
    setLogIn(formattedEmail, password.value);

    if (resp.isCreated) {
      isAccountCreated.value = true;
    } else {
      storeStatsAndChallenges(resp);
      closeAndRefresh();
    }
  }
  isLoading.value = false;
};
</script>

<template>
  <BaseModal
    title="Sign In"
    :is-visible="isVisible"
    @update:is-visible="closeModal"
  >
    <template #default>
      <div class="created-info" v-if="isAccountCreated">
        <p>Your account has been created!</p>
        <button class="primary-btn" @click="closeAndRefresh">Got it!</button>
      </div>
      <div v-else>
        <p>
          Save your progress across all your devices with a <b>free account</b>,
          it takes only seconds to create!<br />
          Also you will have <b>{{ LOGGED_RETRIES }} daily retries</b> for
          challenges and earn points for the (future) scoreboard!
        </p>
        <form @submit.prevent="submit">
          <div class="form-line">
            <label for="email">Email</label>
            <input
              v-model="email"
              type="email"
              id="email"
              placeholder="ludwig@mvdr.com"
            />
          </div>

          <div class="form-line">
            <label for="password">Password</label>
            <input
              v-model="password"
              type="password"
              id="password"
              placeholder="Password (min 8 characters)"
            />
          </div>

          <p class="error-message" v-if="error">{{ error }}</p>

          <button
            class="primary-btn"
            :disabled="!isEmailValid || !isPasswordValid || isLoading"
          >
            {{ isLoading ? "Please Wait…" : "Sign In/Sign Up" }}
          </button>
        </form>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
p {
  text-align: center;
}

b {
  font-weight: 600;
}

.error-message {
  color: #c85503;
}

.created-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.form-line {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 25rem;
}

input {
  height: 1.5rem;
  width: 100%;
  max-width: 20rem;
  padding: 0.05rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background);
}

input:focus-visible {
  outline: 0px solid transparent;
  box-shadow: 0px 0px 3px 0px var(--color-border);
}

.primary-btn {
  margin-top: 0.5rem;
  padding: 0.05rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.75rem;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  border-radius: var(--border-radius);
  color: var(--color-primary-inverted);
  background-color: var(--color-primary);
}

.primary-btn:disabled {
  cursor: not-allowed;
  opacity: 60%;
  transition: opacity 0.4s;
}

@media screen and (max-width: 456px) {
  .form-line {
    flex-direction: column;
  }
}
</style>
