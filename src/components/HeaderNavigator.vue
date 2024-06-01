<script setup lang="ts">
import IconBack from "./icons/IconBack.vue";
import IconHelp from "./icons/IconHelp.vue";
import IconUser from "./icons/IconUser.vue";
import IconTrophy from "./icons/IconTrophy.vue";
import IconScoreboard from "./icons/IconScoreboard.vue";

defineEmits([
  "showArcadeModal",
  "showBackModal",
  "showInfoModal",
  "showUserModal",
  "showScoreModal",
]);
</script>

<template>
  <header>
    <div class="nav-bar">
      <div class="nav-left">
        <a
          href="/"
          id="brand"
          aria-label="Back to the daily challenge"
          tabindex="0"
          >ArchiGuesser</a
        >
      </div>
      <div class="nav-right">
        <a
          @click="$emit('showBackModal')"
          href="#replay"
          aria-label="Replay previous days"
          tabindex="1"
        >
          <IconBack />
        </a>
        <a
          @click="$emit('showArcadeModal')"
          href="#challenges"
          aria-label="Play themed challenges"
          tabindex="2"
        >
          <IconTrophy />
        </a>
        <a
          @click="$emit('showScoreModal')"
          href="#score"
          aria-label="Show your score"
          tabindex="3"
        >
          <IconScoreboard />
        </a>
        <a
          @click="$emit('showUserModal')"
          href="#login"
          aria-label="LogIn to your account or show informations if you’re already connected"
          tabindex="4"
        >
          <IconUser />
        </a>
        <a
          @click="$emit('showInfoModal')"
          href="#info"
          aria-label="Show informations about ArchiGuesser"
          tabindex="5"
        >
          <IconHelp />
        </a>
      </div>
    </div>
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
  &:focus-visible {
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
