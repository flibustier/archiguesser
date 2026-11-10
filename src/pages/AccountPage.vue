<script setup lang="ts">
import { ref, computed } from "vue";

import { LOGGED_RETRIES } from "@/config.json";

import { refresh } from "@/router";
import { signIn } from "@/services/api";
import { storeStatsAndChallenges } from "@/services/user";
import {
  getChallenges,
  getCredentials,
  getStats,
  isLogged,
  setLogIn,
  setLogOut,
} from "@/services/store";

document.title = "ArchiGuesser - Your account";

const logged = isLogged();
const loggedEmail = getCredentials().email;

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
  error.value = "";
  const formattedEmail = email.value.toLowerCase();
  const resp = await signIn(
    formattedEmail,
    password.value,
    getStats(),
    getChallenges(),
  );
  if ("output" in resp) {
    error.value =
      typeof resp.output === "string" && resp.output
        ? resp.output
        : "The server could not be reached, please try again later.";
  } else {
    // successful log in
    setLogIn(formattedEmail, password.value);

    if (resp.isCreated) {
      isAccountCreated.value = true;
    } else {
      storeStatsAndChallenges(resp);
      refresh();
    }
  }
  isLoading.value = false;
};

const logout = () => {
  setLogOut();
  refresh();
};
</script>

<template>
  <div v-if="isAccountCreated" class="page page-narrow text-center">
    <h1 class="page-title">Account</h1>
    <p>Your account has been created!</p>
    <button class="btn-primary btn-small" @click="refresh()">Got it!</button>
  </div>

  <div v-else-if="logged" class="page page-narrow">
    <h1 class="page-title">Account</h1>
    <p class="text-center">Your progress is saved on your logged devices!</p>
    <div class="input-row account-row">
      <label for="email">Email</label>
      <input
        id="email"
        :value="loggedEmail"
        type="text"
        name="email"
        disabled
      />
    </div>

    <button class="btn-secondary btn-small self-center" @click="logout()">
      Logout
    </button>
  </div>

  <div v-else class="page page-narrow">
    <h1 class="page-title">Sign In</h1>
    <p class="text-center">
      Save your progress across all your devices with a <b>free account</b>, it
      takes only seconds to create!<br />
      Also you will have <b>{{ LOGGED_RETRIES }} daily retries</b> for
      challenges and earn points for the (future) scoreboard!
    </p>
    <form class="column" @submit.prevent="submit">
      <div class="input-row">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="ludwig@mvdr.com"
        />
      </div>

      <div class="input-row">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Password (min 8 characters)"
        />
      </div>

      <p v-if="error" class="error-message text-center" role="alert">
        {{ error }}
      </p>

      <button
        class="btn-primary btn-small"
        :disabled="!isEmailValid || !isPasswordValid || isLoading"
      >
        {{ isLoading ? "Please Wait…" : "Sign In/Sign Up" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.error-message {
  color: #c85503;
}

form {
  align-items: center;
  margin-top: 0.5rem;
}

.account-row {
  justify-content: space-evenly;
}

.input-row {
  max-width: 25rem;

  input {
    height: 1.5rem;
    width: 100%;
    max-width: 20rem;
    padding: 0.05rem 0.5rem;
    font-size: small;
  }
}
</style>
