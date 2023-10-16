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
      :class="{ 'number-btn': true, 'is-active': i === pictureShown }"
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
  gap: 0.5rem;
}

.paginator .number-btn {
  font-size: 1rem;
  line-height: 1rem;
  padding: 0.5rem;
  border-radius: var(--border-radius);
}

.paginator .is-active {
  background-color: var(--color-primary);
  color: var(--color-primary-inverted);
}
</style>
