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
    const extractBids = /offerid=(\d+.\d+)/.exec(
      recommendations[props.recommendation].link,
    );
    const bids = extractBids.length > 1 ? extractBids[1] : null;
    return {
      name: props.recommendation,
      picture: props.recommendation.toLowerCase() + ".jpg",
      bids,
      ...recommendations[props.recommendation],
    };
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
    @click="sendEvent('Recommendation: ' + recommendation.name)"
  >
    <p style="text-align: center">Today’s reading</p>
    <img :src="'recommendations/' + recommendation.picture" height="180px" />
    <img
      v-if="recommendation.bids"
      border="0"
      width="1"
      height="1"
      :src="`https://ad.linksynergy.com/fs-bin/show?id=F0FMjO8yDu0&bids=${recommendation.bids}&type=2&subid=0`"
    />
  </a>
</template>
