<script setup lang="ts">
import { computed } from "vue";

import { sendEvent } from "@/services/api";
import recommendations from "@/assets/recommendations.json";

const props = defineProps({
  recommendation: {
    type: String,
    default: "",
  },
});

const recommendation = computed(() => {
  if (props.recommendation in recommendations) {
    return recommendations[props.recommendation];
  }
  return null;
});
</script>

<template>
  <a
    v-if="recommendation"
    :href="recommendation.link"
    rel="sponsored"
    target="_blank"
    @click="sendEvent(recommendation.picture.replace('.png', ''))"
  >
    <p style="text-align: center">Today’s reading</p>
    <img :src="'recommendations/' + recommendation.picture" height="180px" />
    <img
      border="0"
      width="1"
      height="1"
      src="https://ad.linksynergy.com/fs-bin/show?id=F0FMjO8yDu0&bids=518265.4278413964194940177913468&type=2&subid=0"
    />
  </a>
</template>
