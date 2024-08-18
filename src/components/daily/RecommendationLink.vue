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
  if (props.categories.includes("kuma")) {
    return {
      picture: "kuma.png",
      link: "https://click.linksynergy.com/link?id=F0FMjO8yDu0&offerid=518265.4278413964194940177913468&type=2&murl=https%3a%2f%2ftaschen.com%2fen%2fbooks%2farchitecture-design%2f01192%2fkuma-complete-works-1988-today%2f%3fforceCountry%3dGB",
    };
  }
  if (props.categories.includes("foster")) {
    return {
      picture: "foster.png",
      link: "https://click.linksynergy.com/link?id=F0FMjO8yDu0&offerid=518265.4278412929871400615978700&type=2&murl=https%3a%2f%2ftaschen.com%2fen%2fbooks%2farchitecture-design%2f08111%2fnorman-foster-complete-works-1965-today%2f%3fforceCountry%3dGB",
    };
  }
  if (props.categories.includes("calatrava")) {
    return {
      picture: "calatrava.png",
      link: "https://click.linksynergy.com/link?id=F0FMjO8yDu0&offerid=518265.4278414257896043665763664&type=2&murl=https%3a%2f%2ftaschen.com%2fen%2fbooks%2farchitecture-design%2f08123%2fcalatrava-complete-works-1979-today%2f%3fforceCountry%3dGB",
    };
  }
  if (props.categories.includes("niemeyer")) {
    return {
      picture: "niemeyer.jpg",
      link: "https://click.linksynergy.com/link?id=F0FMjO8yDu0&offerid=518265.427845776677642023176160&type=2&murl=https%3a%2f%2ftaschen.com%2fen%2fbooks%2farchitecture-design%2f49282%2fniemeyer%2f%3fforceCountry%3dGB",
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
