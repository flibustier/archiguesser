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
      class="btn-number"
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
  margin: 1rem 0;
  gap: var(--gap);
}

.btn-number {
  padding: 0.5rem;
}
</style>
