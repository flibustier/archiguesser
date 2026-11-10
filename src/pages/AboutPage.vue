<script setup lang="ts">
import AboutContent from "@/components/about/AboutContent.vue";

import { gameIndex } from "@/services/data";

document.title = "ArchiGuesser - About";
</script>

<template>
  <div class="page page-narrow">
    <h1 class="page-title">About</h1>

    <AboutContent />

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
