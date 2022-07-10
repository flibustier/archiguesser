<script setup lang="ts">
import { ref, watch } from "vue";
import PicturePaginator from "./PicturePaginator.vue";

const pictureShown = ref(1);

const props = defineProps({
  maxPictures: {
    type: Number,
    required: true,
  },
  dayNumber: {
    type: Number,
    required: true,
  },
});

watch(
  () => props.maxPictures,
  () => {
    pictureShown.value = props.maxPictures;
  }
);
</script>

<template>
  <img
    :alt="`Picture ${pictureShown}`"
    class="picture"
    :src="`${dayNumber}/${pictureShown}.jpg`"
  />

  <PicturePaginator
    :current-round="maxPictures"
    v-model:picture-shown="pictureShown"
  />
</template>

<style scoped>
.picture {
  display: block;
  margin: 0 auto 1rem;
  width: 100%;
  height: 27rem;
  inset: 0px;
  box-sizing: border-box;
  padding: 0px;
  border: medium none;
  object-fit: contain;
}
</style>
