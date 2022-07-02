<script setup lang="ts">
import { ref, computed } from "vue";
import IconSearch from "../icons/IconSearch.vue";
import { search } from "./GuessingFormSearchEngine";

const searchTerms = ref("");
const hasSelectedSuggestion = ref(false);

const filteredSuggestions = computed(() => search(searchTerms.value));
const isSelectionDone = computed(
  () => hasSelectedSuggestion.value || searchTerms.value.length === 0
);

const selectResult = (result: string) => {
  hasSelectedSuggestion.value = true;
  searchTerms.value = result;
};

const emit = defineEmits(["submitted-guess"]);

const emitAnswer = () => {
  if (isSelectionDone.value) {
    emit("submitted-guess", searchTerms.value);
    hasSelectedSuggestion.value = false;
    searchTerms.value = "";
  }
};
</script>

<template>
  <div>
    <ul
      v-if="!hasSelectedSuggestion && filteredSuggestions.length"
      class="suggestions"
    >
      <li
        v-for="filteredResult in filteredSuggestions"
        :key="filteredResult.suggestion"
        @click="selectResult(filteredResult.suggestion)"
      >
        <span v-html="filteredResult.highlightedSuggestion"></span>
      </li>
    </ul>

    <div class="form-line">
      <div class="search">
        <span class="search-logo">
          <IconSearch />
        </span>
        <input
          type="text"
          class="search-input"
          placeholder="Search for building name / architect / place…"
          v-model="searchTerms"
          autocomplete="off"
          v-on:input="hasSelectedSuggestion = false"
          @keyup.enter="emitAnswer"
        />
      </div>
      <input
        class="submit-btn"
        type="submit"
        :value="searchTerms === '' ? 'SKIP' : 'SUBMIT'"
        @mousedown="emitAnswer"
        :disabled="!isSelectionDone"
      />
    </div>
  </div>
</template>

<style scoped>
.suggestions,
.search-input {
  font-size: 1.125rem;
  line-height: 1.75rem;
}
.suggestions {
  position: absolute;
  bottom: 100%;
  top: auto;
  width: 100%;
  max-height: 9rem;
  margin: 0;
  padding: 0;

  background-color: var(--color-primary-inverted);

  list-style: none;
  border-width: 1px;
  border-radius: var(--border-radius);
  overflow-y: auto;
  transition: all 0.4s;
}

.suggestions li {
  display: list-item;
  cursor: pointer;
  padding-left: 0.25rem;
  padding-right: 0.25rem;

  margin: 0.25rem 0.35em;
  border-radius: var(--border-radius);
}

.suggestions li:hover {
  background-color: hsl(0, 0%, 90%);
}

.form-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
}

.search {
  position: relative;
  width: 85%;
  color: var(--color-background);
}

.search .search-logo {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  padding-left: 0.5rem;
  z-index: 300;
}

.search .search-input {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  width: 100%;
  padding-right: 0.5rem;
  padding-left: 2.5rem;
}

.submit-btn {
  border-radius: var(--border-radius);
  width: 15%;
  height: 100%;
  padding: 0.05rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.75rem;
  cursor: pointer;
  color: var(--color-primary-inverted);
  background-color: var(--color-primary);
  text-align: center;
  opacity: 100%;
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 60%;
  transition: opacity 0.4s;
}

@media screen and (max-width: 456px) {
  .form-line {
    flex-direction: column;
  }

  .search {
    width: 100%;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
