<script lang="ts" setup>
import { computed, ref } from "vue";
import { shuffle } from "@/services/utils";
import { search } from "./GuessingFormSearchEngine";

const props = defineProps({
  possibleAnswers: {
    type: Array<string>,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const choices = computed(() => {
  const similarProjects = search(props.answer, props.possibleAnswers).map(
    ({ suggestion }) => suggestion,
  );

  if (similarProjects.length >= 5) {
    return shuffle(similarProjects.slice(0, 5));
  }

  const othersProjects = props.possibleAnswers.filter(
    (answer) => !similarProjects.includes(answer),
  );
  const proposals = similarProjects.concat(
    othersProjects.slice(0, 5 - similarProjects.length),
  );

  return shuffle(proposals);
});

const choseIndex = ref();
const hasChosenRight = ref();

const emit = defineEmits(["submitted"]);
const select = (choice: string, choseIdx: number) => {
  choseIndex.value = choseIdx;
  hasChosenRight.value = choice === props.answer;
  setTimeout(() => {
    choseIndex.value = null;
    emit("submitted", choice);
  }, 300);
};
</script>

<template>
  <div class="column-stretch">
    <button
      v-for="(choice, i) in choices"
      :key="i"
      :class="{
        'btn-secondary': true,
        'btn-animated': true,
        wrong: choseIndex === i && !hasChosenRight,
        success: choseIndex === i && hasChosenRight,
      }"
      @click="select(choice, i)"
    >
      {{ choice }}
    </button>
  </div>
</template>

<style scoped>
.btn-animated {
  transition: background-color 0.3s ease-out;
}

.success {
  background-color: rgb(171, 217, 171);
}

.wrong {
  background-color: #fb545457;
}
</style>
