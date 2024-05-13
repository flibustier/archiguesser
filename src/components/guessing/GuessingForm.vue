<script setup lang="ts">
import { ref, computed } from "vue";
import { search } from "./GuessingFormSearchEngine";
import IconSearch from "../icons/IconSearch.vue";
import IconBackspace from "../icons/IconBackspace.vue";

const searchTerms = ref("");
const hasSelectedSuggestion = ref(false);
const preselected = ref();
const suggestionsRefs = ref([] as (HTMLElement | null)[]);

const filteredSuggestions = computed(() => search(searchTerms.value));
const isSelectionDone = computed(
  () => hasSelectedSuggestion.value || searchTerms.value.length === 0,
);

const resetSearchTerms = () => {
  hasSelectedSuggestion.value = false;
  searchTerms.value = "";
};

const guessInput = () => {
  hasSelectedSuggestion.value = false;
  preselected.value = null;
  navigate("up");
};

const validateGuess = (result: string) => {
  searchTerms.value = result;
  hasSelectedSuggestion.value = true;
};

const emit = defineEmits(["submitted-guess"]);
const submitGuess = () => {
  if (isSelectionDone.value) {
    emit("submitted-guess", searchTerms.value);
    resetSearchTerms();
  } else if (preselected.value != null) {
    validateGuess(filteredSuggestions.value[preselected.value].suggestion);
  }
};

const navigate = (direction: "up" | "down") => {
  if (filteredSuggestions.value.length === 0) {
    return;
  }

  if (preselected.value == null) {
    preselected.value = 0;
  } else if (direction === "up") {
    if (preselected.value === 0) {
      preselected.value = filteredSuggestions.value.length - 1;
    } else {
      preselected.value--;
    }
  } else {
    preselected.value =
      (preselected.value + 1) % filteredSuggestions.value.length;
  }

  suggestionsRefs.value[preselected.value]?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "start",
  });
};
</script>

<template>
  <div>
    <ul
      v-if="!hasSelectedSuggestion && filteredSuggestions.length"
      class="suggestions"
    >
      <li
        v-for="(filteredResult, index) in filteredSuggestions"
        :key="index"
        ref="suggestionsRefs"
        :class="{ 'is-focus': preselected === index }"
        @click="validateGuess(filteredResult.suggestion)"
        @mouseover="() => (preselected = index)"
      >
        <span v-html="filteredResult.highlightedSuggestion"></span>
      </li>
    </ul>

    <div class="form-line">
      <div class="search">
        <span class="icon icon-search">
          <IconSearch />
        </span>
        <input
          type="text"
          :class="`search-input ${searchTerms.length ? 'is-not-empty' : ''}`"
          placeholder="Search for building name / architect / place…"
          autocomplete="off"
          v-model="searchTerms"
          @input="guessInput"
          @keyup.enter="submitGuess"
          @keyup.up="navigate('up')"
          @keyup.down="navigate('down')"
        />
        <span
          class="icon icon-times"
          v-if="searchTerms"
          @click="resetSearchTerms"
        >
          <IconBackspace />
        </span>
      </div>
      <input
        class="submit-btn btn-primary btn-small"
        type="submit"
        :value="searchTerms === '' ? 'SKIP' : 'SUBMIT'"
        @mousedown="submitGuess"
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
  padding: 0 0.25rem;
  margin: 0.25rem 0.35em;
  border-radius: var(--border-radius);
}

.suggestions .is-focus {
  background-color: var(--color-light-background);
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

.search .icon {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  z-index: 1;
}

.search .icon-search {
  left: 0;
  padding-left: var(--gap);
}

.search .icon-times {
  right: 0;
  padding-right: var(--gap);
  cursor: pointer;
}

.search .search-input {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  width: 100%;
  padding-right: 0.5rem;
  padding-left: 2.5rem;
}

.search .search-input.is-not-empty {
  padding-right: 2.5rem;
}

.search .search-input:focus-visible {
  outline: 0px solid transparent;
  box-shadow: 0px 0px 3px 0px var(--color-border);
}

.submit-btn {
  border-radius: var(--border-radius);
  width: 15%;
  height: 100%;
  cursor: pointer;
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
