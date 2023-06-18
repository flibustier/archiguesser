<script setup lang="ts">
import IconBack from "./icons/IconBack.vue";
import IconHelp from "./icons/IconHelp.vue";
import IconUser from "./icons/IconUser.vue";
import IconTrophy from "./icons/IconTrophy.vue";

defineEmits([
  "showArcadeModal",
  "showBackModal",
  "showInfoModal",
  "showUserModal",
]);
</script>

<template>
  <header>
    <div class="nav-bar">
      <div class="nav-block nav-left">
        <a href="/" id="brand">ARCHIGUESSER</a>
      </div>
      <div class="nav-block nav-right">
        <a @click="$emit('showArcadeModal')">
          <IconTrophy />
        </a>
        <a @click="$emit('showBackModal')">
          <IconBack />
        </a>
        <a @click="$emit('showInfoModal')">
          <IconHelp />
        </a>
        <a @click="$emit('showUserModal')">
          <IconUser />
        </a>
      </div>
    </div>
  </header>
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
    gap: 1rem;
  }

  .nav-bar {
    height: 2rem;
  }
}
</style>
