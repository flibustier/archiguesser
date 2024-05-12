<script setup lang="ts">
defineProps({
  currentRound: {
    type: Number,
    required: true,
  },

  pictureShown: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:pictureShown"]);

const updatePictureShown = (value: number) =>
  emit("update:pictureShown", value);
</script>

<template>
  <div class="paginator">
    <button
      v-for="i in currentRound"
      :key="i"
      :class="{ 'btn-primary': i === pictureShown }"
      @mousedown="updatePictureShown(i)"
    >
      {{ i }}
    </button>
  </div>
</template>

<style scoped>
.paginator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: var(--gap-2x);
  gap: var(--gap);
}
</style>
