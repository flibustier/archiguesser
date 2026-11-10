<script setup lang="ts">
import { ref, computed } from "vue";

import { LOGGED_RETRIES } from "@/config.json";

import { navigate, refresh } from "@/router";
import {
  deleteAccount,
  requestPasswordReset,
  resetPassword,
  signIn,
} from "@/services/api";
import { storeStatsAndChallenges, syncUser } from "@/services/user";
import {
  getChallenges,
  getCredentials,
  getStats,
  isLogged,
  setLogIn,
  setLogOut,
} from "@/services/store";

document.title = "ArchiGuesser - Your account";

const UNREACHABLE = "The server could not be reached, please try again later.";

// link received by email: /account?reset=<token>
const resetToken = new URLSearchParams(window.location.search).get("reset");

const logged = isLogged();
const credentials = getCredentials();

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
        : UNREACHABLE;
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

// --- forgotten password ---------------------------------------------------

const showForgotten = ref(false);
const forgottenMessage = ref("");

const sendResetLink = async () => {
  isLoading.value = true;
  error.value = "";
  const outcome = await requestPasswordReset(email.value.toLowerCase());
  if (outcome === "sent") {
    forgottenMessage.value =
      "If an account exists for this address, an email is on its way. The link is valid for one hour.";
  } else {
    error.value =
      outcome === "unavailable"
        ? "Password reset is not available right now, please write to contact@archiguesser.com."
        : UNREACHABLE;
  }
  isLoading.value = false;
};

const chooseNewPassword = async () => {
  isLoading.value = true;
  error.value = "";
  const outcome = await resetPassword(resetToken || "", password.value);
  if (outcome.email) {
    setLogIn(outcome.email, password.value);
    await syncUser();
    navigate("/account", { replace: true });
  } else {
    error.value = outcome.error || UNREACHABLE;
  }
  isLoading.value = false;
};

// --- account deletion -----------------------------------------------------

const confirmDeletion = ref(false);

const deleteMyAccount = async () => {
  isLoading.value = true;
  error.value = "";
  if (await deleteAccount(credentials.email, credentials.password)) {
    setLogOut();
    refresh();
  } else {
    error.value = "Your account could not be deleted, please try again later.";
  }
  isLoading.value = false;
};
</script>

<template>
  <div v-if="resetToken" class="page page-narrow">
    <h1 class="page-title">New password</h1>
    <form class="column" @submit.prevent="chooseNewPassword">
      <div class="input-row">
        <label for="password">New password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="Password (min 8 characters)"
        />
      </div>

      <p v-if="error" class="error-message text-center" role="alert">
        {{ error }}
      </p>

      <button
        class="btn-primary btn-small"
        :disabled="!isPasswordValid || isLoading"
      >
        {{ isLoading ? "Please Wait…" : "Save my new password" }}
      </button>
      <a class="text-small" href="/account">Back to sign in</a>
    </form>
  </div>

  <div v-else-if="isAccountCreated" class="page page-narrow text-center">
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
        :value="credentials.email"
        type="text"
        name="email"
        disabled
      />
    </div>

    <button class="btn-secondary btn-small self-center" @click="logout()">
      Logout
    </button>

    <div class="danger column">
      <template v-if="!confirmDeletion">
        <button
          class="link-button text-small self-center"
          @click="confirmDeletion = true"
        >
          Delete my account
        </button>
      </template>
      <template v-else>
        <p class="text-center">
          Your account and the progress saved with it will be deleted for good.
          Your scores stay on this device.
        </p>
        <p v-if="error" class="error-message text-center" role="alert">
          {{ error }}
        </p>
        <div class="row self-center">
          <button
            class="btn-secondary btn-small"
            @click="confirmDeletion = false"
          >
            Keep my account
          </button>
          <button
            class="btn-primary btn-small"
            :disabled="isLoading"
            @click="deleteMyAccount"
          >
            Yes, delete my account
          </button>
        </div>
      </template>
    </div>
  </div>

  <div v-else-if="showForgotten" class="page page-narrow">
    <h1 class="page-title">Forgotten password</h1>
    <p v-if="forgottenMessage" class="text-center" role="status">
      {{ forgottenMessage }}
    </p>
    <form v-else class="column" @submit.prevent="sendResetLink">
      <p class="text-center">
        Enter the email of your account: we will send you a link to choose a new
        password.
      </p>
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

      <p v-if="error" class="error-message text-center" role="alert">
        {{ error }}
      </p>

      <button
        class="btn-primary btn-small"
        :disabled="!isEmailValid || isLoading"
      >
        {{ isLoading ? "Please Wait…" : "Send me a link" }}
      </button>
    </form>
    <button
      class="link-button text-small self-center"
      @click="((showForgotten = false), (error = ''))"
    >
      Back to sign in
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
    <button
      class="link-button text-small self-center"
      @click="((showForgotten = true), (error = ''))"
    >
      Forgot your password?
    </button>
  </div>
</template>

<style scoped>
.error-message {
  color: var(--color-warning);
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

.link-button {
  padding: 0;
  background: none;
  text-decoration: underline;
}

.danger {
  margin-top: 2rem;
}
</style>
