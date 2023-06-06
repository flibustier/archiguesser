<script setup lang="ts">
import { ref, watch, computed } from "vue";
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
  copyrights: {
    type: Object,
    required: true,
  },
});

watch(
  () => props.maxPictures,
  () => {
    pictureShown.value = props.maxPictures;
  }
);

const pictureCopyright = computed(
  () => props.copyrights[pictureShown.value] || props.copyrights["*"] || ""
);

const imgSrc = (picture: number) => `${props.dayNumber}/${picture}.jpg`;
</script>

<template>
  <img
    :alt="`Picture ${pictureShown}`"
    class="picture"
    :src="imgSrc(pictureShown)"
  />
  <link
    v-if="pictureShown < 6"
    rel="prefetch"
    as="image"
    type="image/jpeg"
    :href="imgSrc(pictureShown + 1)"
  />
  <div class="credit">
    <span v-if="pictureCopyright">📷</span>&nbsp;{{ pictureCopyright }}
  </div>

  <PicturePaginator
    :current-round="maxPictures"
    v-model:picture-shown="pictureShown"
  />
</template>

<style scoped>
.credit {
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: center;
}

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

@media screen and (min-width: 62rem) {
  .picture {
    height: 36rem;
  }
}
</style>
