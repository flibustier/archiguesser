<script setup lang="ts">
import AboutContent from "@/components/about/AboutContent.vue";

import { gameIndex } from "@/services/data";
import { install, installPrompt, isInstalled, isIOS } from "@/services/install";
import { setThemeChoice, themeChoice } from "@/services/theme";
import type { ThemeChoice } from "@/services/theme";

const THEMES: { choice: ThemeChoice; label: string }[] = [
  { choice: "auto", label: "Same as device" },
  { choice: "light", label: "Light" },
  { choice: "dark", label: "Dark" },
];

document.title = "ArchiGuesser - About";
</script>

<template>
  <div class="page page-narrow">
    <h1 class="page-title">About</h1>

    <AboutContent />

    <section
      v-if="!isInstalled() && (installPrompt || isIOS())"
      class="install"
    >
      <h2 class="page-title">Play it like an app</h2>
      <template v-if="installPrompt">
        <p>
          Install ArchiGuesser on this device: it opens full screen from your
          home screen and keeps working with a bad connection.
        </p>
        <button class="btn-primary" @click="install">
          Install ArchiGuesser
        </button>
      </template>
      <p v-else>
        On iPhone and iPad: tap the <b>Share</b> button of Safari, then
        <b>Add to Home Screen</b>.
      </p>
    </section>

    <section class="appearance">
      <h2 class="page-title">Appearance</h2>
      <div class="themes" role="group" aria-label="Colours of the app">
        <button
          v-for="{ choice, label } in THEMES"
          :key="choice"
          :class="['btn-small', { 'btn-primary': themeChoice === choice }]"
          :aria-pressed="themeChoice === choice"
          @click="setThemeChoice(choice)"
        >
          {{ label }}
        </button>
      </div>
    </section>

    <footer class="footer">
      <p>
        Got a suggestion or want to contribute ? Contact me via
        <a href="https://www.instagram.com/archiguesser/">Instagram</a> or
        <a href="mailto:contact@archiguesser.com">email</a> !
      </p>
      <p>
        <a href="https://ko-fi.com/flibustier" target="_blank" rel="noreferrer"
          >Buy me a coffee? ☕️</a
        >
        #{{ gameIndex.lastDay }}
      </p>
    </footer>

    <a class="self-center" href="/">Back to the daily challenge</a>
  </div>
</template>

<style scoped>
.install,
.appearance {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap);
  text-align: center;
  margin-top: 1rem;
}

.themes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--gap);
}

.footer {
  margin-top: 1rem;
  font-size: 0.8rem;
  line-height: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: var(--gap-2x);
}
</style>
