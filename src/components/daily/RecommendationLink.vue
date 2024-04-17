<script setup lang="ts">
import { computed } from "vue";

import { sendEvent } from "@/services/api";

const props = defineProps({
  categories: {
    type: Array<string>,
    default: [],
  },
});

const recommendation = computed(() => {
  if (props.categories.includes("modernism")) {
    return {
      link: "https://amzn.to/4aiOqrL",
      picture: "/recommendations/modernism.jpg",
      event: "recommendations: modernism",
    };
  }
  if (props.categories.includes("organic")) {
    return {
      link: "https://amzn.to/3TYEYD5",
      picture: "/recommendations/lautner.jpg",
      event: "recommendations: lautner",
    };
  }
  if (props.categories.includes("niemeyer")) {
    return {
      link: "https://amzn.to/3U28d7J",
      picture: "/recommendations/niemeyer.jpg",
      event: "recommendations: niemeyer",
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
    @click="sendEvent(recommendation.event)"
  >
    <p style="text-align: center">Today’s suggestion</p>
    <img :src="recommendation.picture" height="180px" />
  </a>
</template>
