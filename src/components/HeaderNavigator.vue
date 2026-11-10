<script setup lang="ts">
import IconBack from "./icons/IconBack.vue";
import IconHelp from "./icons/IconHelp.vue";
import IconUser from "./icons/IconUser.vue";
import IconTrophy from "./icons/IconTrophy.vue";
import IconScoreboard from "./icons/IconScoreboard.vue";

import { currentRoute, type RouteName } from "@/router";

const current = (...names: RouteName[]) =>
  names.includes(currentRoute.value.name) ? "page" : undefined;
</script>

<template>
  <header>
    <nav class="nav-bar" aria-label="Main">
      <div class="nav-left">
        <a id="brand" href="/" aria-label="Back to the daily challenge">
          ArchiGuesser
        </a>
      </div>
      <div class="nav-right">
        <a
          href="/replay"
          aria-label="Replay previous days"
          :aria-current="current('replay')"
        >
          <IconBack />
        </a>
        <a
          href="/challenges"
          aria-label="Play themed challenges"
          :aria-current="current('challenges', 'challenge')"
        >
          <IconTrophy />
        </a>
        <a
          href="/score"
          aria-label="Show your score"
          :aria-current="current('score')"
        >
          <IconScoreboard />
        </a>
        <a
          href="/account"
          aria-label="LogIn to your account or show informations if you’re already connected"
          :aria-current="current('account')"
        >
          <IconUser />
        </a>
        <a
          href="/about"
          aria-label="Show informations about ArchiGuesser"
          :aria-current="current('about')"
        >
          <IconHelp />
        </a>
      </div>
    </nav>
  </header>
</template>

<style scoped>
header {
  border-bottom: 1px solid var(--color-border);
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1rem;
  line-height: 3rem;
}

.nav-left,
.nav-right {
  display: flex;
}

.nav-bar a {
  padding: 0 0.5rem;
  color: inherit;
  text-decoration: none;

  &:hover,
  &:focus-visible,
  &[aria-current="page"] {
    transition: filter 0.3s;

    filter: invert(48%) sepia(73%) saturate(406%) hue-rotate(342deg)
      brightness(97%) contrast(83%);
  }

  svg {
    height: 100%;
  }
}

#brand {
  font-size: 1.25rem;
  font-weight: 300;
}

@media screen and (max-width: 300px) {
  .nav-left {
    display: none;
  }

  .nav-right {
    width: 100%;
    justify-content: center;
  }
}
</style>
