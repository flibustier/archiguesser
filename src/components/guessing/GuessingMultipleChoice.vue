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
  <div class="btns-group">
    <button
      v-for="(choice, i) in choices"
      :key="i"
      :class="{
        'btn-white': true,
        'btn-chose': true,
        'btn-chose-wrong': choseIndex === i && !hasChosenRight,
        'btn-chose-success': choseIndex === i && hasChosenRight,
      }"
      @click="select(choice, i)"
    >
      {{ choice }}
    </button>
  </div>
</template>

<style scoped>
button {
  border-radius: var(--border-radius);
  padding: 0.25rem 0.75rem;
}

.btn-chose {
  transition: background-color 0.3s ease-out;
}

.btn-chose-success {
  background-color: rgb(171, 217, 171);
}

.btn-chose-wrong {
  background-color: #fb545457;
}
</style>
