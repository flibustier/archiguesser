<script setup lang="ts">
import { ref, computed, reactive } from "vue";

import ToggleSwitch from "@/components/basic/ToggleSwitch.vue";

import { sendFeedback } from "@/services/api";
import {
  isLogged,
  saveFeedback,
  getSavedFeedbacks,
  getFeedbackFormRecurringData,
  setFeedbackFormRecurringData,
} from "@/services/store";

const isSending = ref(false);

const formData = reactive({
  ...getFeedbackFormRecurringData(),
  link: "",
  project: "",
  is_involved: false,
});

const emit = defineEmits(["submitted"]);

const submit = async () => {
  isSending.value = true;
  setFeedbackFormRecurringData(formData);
  await sendFeedback(formData);
  saveFeedback(formData.project);
  emit("submitted");
  isSending.value = false;
};

const isFormValid = computed(() => formData.project.length > 3);

const hasAlreadyContribute = getSavedFeedbacks().length > 0;
</script>

<template>
  <form>
    <div class="input-wrap">
      <label for="project">
        You get to write down a project you would like to see on
        ArchiGuesser:</label
      >
      <input
        id="project"
        name="project"
        type="text"
        placeholder="Example: The leaning tower of Pisa…"
        v-model="formData.project"
      />
    </div>

    <template v-if="isFormValid || hasAlreadyContribute">
      <div class="input-wrap-line">
        <label for="is-involved">
          Were you involved in this project or worked for the studio that
          carried out this project?
        </label>
        <ToggleSwitch id="is-involved" v-model="formData.is_involved" />
      </div>

      <div class="input-wrap-line">
        <label for="want-credit"
          >Would you like to be credited for this suggestion?</label
        >
        <ToggleSwitch id="want-credit" v-model="formData.want_credit" />
      </div>

      <div v-if="formData.want_credit" class="input-wrap">
        <label for="public-name"
          >On which name would you like to be credited?</label
        >
        <input
          id="public-name"
          name="public-name"
          type="text"
          placeholder="Le Corbusier (Ateliers Jean Prouvé)"
          v-model="formData.credit_name"
        />
      </div>

      <div class="input-wrap">
        <label for="link"
          >(Optional) A Wikipedia link or an Architecture website (ArchDaily,
          wikiarquitectura, …) of the project:
        </label>
        <input
          id="link"
          name="link"
          type="text"
          placeholder="https://en.wikipedia.org/wiki/Leaning_Tower_of_Pisa"
          v-model="formData.link"
        />
      </div>

      <div v-if="!isLogged()" class="input-wrap">
        <label for="email"
          >(Optional) Would you like to be contacted if additional information
          is required regarding your suggestion?</label
        >
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email address"
          v-model="formData.email"
        />
      </div>
    </template>

    <button
      class="btn-primary btn-small"
      type="submit"
      @mousedown="submit"
      :disabled="isSending || !isFormValid"
    >
      Submit
    </button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  max-width: 32rem;
}

.input-wrap-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

label {
  margin-bottom: 0.25rem;
}
</style>
