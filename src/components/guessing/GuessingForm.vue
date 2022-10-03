<script setup lang="ts">
import { ref, computed } from "vue";
import { search } from "./GuessingFormSearchEngine";
import IconSearch from "../icons/IconSearch.vue";
import IconBackspace from "../icons/IconBackspace.vue";

const searchTerms = ref("");
const hasSelectedSuggestion = ref(false);
const preselected = ref();

const filteredSuggestions = computed(() => search(searchTerms.value));
const isSelectionDone = computed(
  () => hasSelectedSuggestion.value || searchTerms.value.length === 0
);

const resetSearchTerms = () => {
  hasSelectedSuggestion.value = false;
  searchTerms.value = "";
};

let deletePressCounter = 0;
const fastDelete = () => {
  if (++deletePressCounter > 6) {
    resetSearchTerms();
  }
};

const guessInput = (event: Event) => {
  searchTerms.value = (event.target as HTMLInputElement).value;
  hasSelectedSuggestion.value = false;
  preselected.value = null;
  if ((event as InputEvent).inputType !== "deleteContentBackward") {
    deletePressCounter = 0;
  }
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

  document.getElementById(`suggestion-${preselected.value}`)?.scrollIntoView({
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
        @click="validateGuess(filteredResult.suggestion)"
        @mouseover="() => (preselected = index)"
        :class="{ 'is-focus': preselected === index }"
        :id="`suggestion-${index}`"
      >
        <span v-html="filteredResult.highlightedSuggestion"></span>
      </li>
    </ul>

    <div class="form-line">
      <div class="search">
        <span class="icon-search">
          <IconSearch />
        </span>
        <input
          type="text"
          :class="`search-input ${searchTerms.length ? 'is-not-empty' : ''}`"
          placeholder="Search for building name / architect / place…"
          autocomplete="off"
          :value="searchTerms"
          @input="guessInput"
          @keyup.enter="submitGuess"
          @keyup.up="navigate('up')"
          @keyup.down="navigate('down')"
          @keydown.delete="fastDelete"
        />
        <span class="icon-times" v-if="searchTerms" @click="resetSearchTerms">
          <IconBackspace />
        </span>
      </div>
      <input
        class="submit-btn"
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
  padding-left: 0.25rem;
  padding-right: 0.25rem;

  margin: 0.25rem 0.35em;
  border-radius: var(--border-radius);
}

.suggestions .is-focus {
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

.search .icon-search {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  padding-left: 0.5rem;
  z-index: 1;
}

.search .icon-times {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding-right: 0.5rem;
  z-index: 1;
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
