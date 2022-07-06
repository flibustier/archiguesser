<script setup lang="ts">
import IconLove from "./icons/IconLove.vue";
import IconHelp from "./icons/IconHelp.vue";
import BrandTitle from "./icons/BrandTitle.vue";
import InfoModal from "./modals/InfoModal.vue";

import { ref } from "vue";

const showInfoModal = ref(false);
</script>

<template>
  <header>
    <div class="nav-bar">
      <div class="nav-block nav-left">
        <a href="/" id="brand"><BrandTitle /></a>
      </div>
      <div class="nav-block nav-right">
        <a>
          <IconLove />
        </a>
        <a @click="showInfoModal = true">
          <IconHelp />
        </a>
      </div>
    </div>
  </header>
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
}

.nav-bar {
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
