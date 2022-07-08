<script setup lang="ts">
import IconBack from "./icons/IconBack.vue";
import IconHelp from "./icons/IconHelp.vue";
import BrandTitle from "./icons/BrandTitle.vue";

import InfoModal from "./modals/InfoModal.vue";
import BackModal from "./modals/BackModal.vue";

import { ref } from "vue";

const showBackModal = ref(false);
const showInfoModal = ref(false);
</script>

<template>
  <header>
    <div class="nav-bar">
      <div class="nav-block nav-left">
        <a href="/" id="brand"><BrandTitle /></a>
      </div>
      <div class="nav-block nav-right">
        <a @click="showBackModal = true">
          <IconBack />
        </a>
        <a @click="showInfoModal = true">
          <IconHelp />
        </a>
      </div>
    </div>
  </header>
  <BackModal v-model:is-visible="showBackModal" />
  <InfoModal v-model:is-visible="showInfoModal" />
</template>

<style scoped>
header {
  display: block;
  position: relative;
  left: 0;
  right: 0;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.7s;
}

.nav-bar {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1rem;
  line-height: 3rem;
}

.nav-block {
  display: flex;
  flex-direction: row;
}

.nav-bar a {
  padding: 0 0.5rem;
  color: inherit;
  text-decoration: none;
  text-transform: uppercase;
  transition: border 0.4s;
}

.nav-bar a:hover {
  transition: filter 0.3s;

  filter: invert(48%) sepia(73%) saturate(406%) hue-rotate(342deg)
    brightness(97%) contrast(83%);
}

.nav-bar a svg {
  height: 100%;
}

#brand {
  height: 1rem;
}

#brand svg {
  position: absolute;
  top: 0;
  bottom: 0;
}

@media screen and (max-width: 300px) {
  .nav-right {
    display: none;
  }

  .nav-bar {
    height: 2rem;
  }
}
</style>
