<script setup lang="ts">
defineProps(["filename", "alt"]);

const formats = ["webm", "mp4"];
</script>

<template>
  <video autoplay loop muted playsinline :aria-label="alt">
    <source
      v-for="format in formats"
      :key="format"
      :src="`/images/gif/${filename}.${format}`"
      :type="`video/${format}`"
    />
  </video>
</template>

<style scoped>
video {
  margin: auto;
  max-width: 100%;
}
</style>
