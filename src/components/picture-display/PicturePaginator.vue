<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const props = defineProps({
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

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "ArrowLeft" && props.pictureShown > 1) {
    updatePictureShown(props.pictureShown - 1);
  } else if (
    e.key === "ArrowRight" &&
    props.pictureShown < props.currentRound
  ) {
    updatePictureShown(props.pictureShown + 1);
  }
};

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
});
onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
});
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
  margin: var(--gap-2x);
  gap: var(--gap);
}

button:hover:not(.btn-primary) {
  background-color: hsl(0, 0%, 87%);
}
</style>
