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
  /*
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
  if (props.categories.includes("Iconic Houses")) {
    return {
      link: "https://amzn.to/3U8n28W",
      picture: "recommendations/iconic.jpg",
      event: "recommendations: iconic",
    };
  }
  if (props.categories.includes("mulan")) {
    return {
      link: "https://amzn.to/49LYV5T",
      picture: "recommendations/mulan.jpg",
      event: "recommendations: mulan",
    };
  }
    */
  if (props.categories.includes("scandinavian")) {
    return {
      picture: "scandinavian.png",
      link: "https://www.taschen.com/en/books/architecture-design/42322/scandinavian-design-40th-ed/?utm_source=RakutenMarketing&utm_medium=Affiliate&utm_campaign=4254102:ArchiGuesser&utm_content=2&utm_term=UKNetwork&ranMID=42784&ranEAID=F0FMjO8yDu0&ranSiteID=F0FMjO8yDu0-trFwdsWl_Vrwi3x_dfz7Aw",
    };
  }
  if (props.categories.includes("cabins")) {
    return {
      picture: "cabins.png",
      link: "https://www.taschen.com/en/books/architecture-design/49363/cabins/?utm_source=RakutenMarketing&utm_medium=Affiliate&utm_campaign=4254102:ArchiGuesser&utm_content=2&utm_term=UKNetwork&ranMID=42784&ranEAID=F0FMjO8yDu0&ranSiteID=F0FMjO8yDu0-lCZQ2wIrBHZiPUxUnAKegQ",
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
    @click="sendEvent(recommendation.picture.replace('.png', ''))"
  >
    <p style="text-align: center">Today’s suggestion</p>
    <img :src="'recommendations/' + recommendation.picture" height="180px" />
  </a>
</template>
