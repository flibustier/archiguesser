<script setup lang="ts">
import { ref, watch, computed } from "vue";
import PicturePaginator from "./PicturePaginator.vue";

const props = defineProps({
  maxPictures: {
    type: Number,
    default: 1,
  },
  dayNumber: {
    type: Number,
    required: true,
  },
  copyrights: {
    type: Object,
    required: true,
  },
  onlyLastPicture: {
    type: Boolean,
    default: false,
  },
});

const pictureShown = ref(props.onlyLastPicture ? 6 : 1);

watch(
  () => props.maxPictures,
  () => {
    pictureShown.value = props.maxPictures;
  },
);

const pictureCopyright = computed(
  () => props.copyrights[pictureShown.value] || props.copyrights["*"] || "",
);

const imgSrc = (picture: number) => `${props.dayNumber}/${picture}.jpg`;
</script>

<template>
  <div>
    <img
      :alt="`Picture ${pictureShown} is loading…`"
      class="picture"
      :src="imgSrc(pictureShown)"
      :key="pictureShown"
    />
    <link
      v-if="pictureShown < 6"
      rel="prefetch"
      as="image"
      type="image/jpeg"
      :href="imgSrc(pictureShown + 1)"
    />
    <div class="credit">
      <span v-if="$props.dayNumber === 666">#{{ props.dayNumber }}&nbsp;</span>
      <span v-if="pictureCopyright">📷</span>&nbsp;{{ pictureCopyright }}
    </div>

    <PicturePaginator
      v-if="!onlyLastPicture"
      :current-round="maxPictures"
      v-model:picture-shown="pictureShown"
    />
  </div>
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
  text-align: center;
}

@media screen and (min-width: 62rem) {
  .picture {
    height: 36rem;
  }
}
</style>
