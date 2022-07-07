<script setup lang="ts">
import { computed } from "vue";

const guessesRemaining = computed(() => 6 - props.guesses.length);

const props = defineProps({
  guesses: {
    type: Array<string>,
    required: true,
  },
});
</script>

<template>
  <div class="guesses">
    <div class="guess" v-for="guess of guesses" :key="guess">
      <span class="guess-failed">❌</span>{{ guess }}
    </div>
    <div class="remaining" v-if="guessesRemaining === 1">
      Last guess remaining!
    </div>
    <div class="remaining" v-else>{{ guessesRemaining }} guesses remaining</div>
  </div>
</template>

<style scoped>
.guesses {
  margin: 0.5rem 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
}

.guess {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);

  min-height: 2rem;
}

.guess-failed {
  margin-right: 0.5rem;
}

.remaining {
  font-size: 0.875rem;
  line-height: 1.25rem;

  text-align: center;
}
</style>
