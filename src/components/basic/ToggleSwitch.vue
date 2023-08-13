<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <div>
    <span style="margin-right: 0.5rem">{{ label }}</span>
    <label class="switch">
      <input
        type="checkbox"
        :checked="modelValue"
        @input="
          ({ target }) =>
            $emit('update:modelValue', (target as HTMLInputElement).checked)
        "
      />
      <span class="slider"></span>
    </label>
  </div>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 23px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 34px;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 19px;
  width: 19px;
  left: 2px;
  bottom: 2px;
  border-radius: 50%;
  background-color: var(--color-background);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  -webkit-transform: translateX(18px);
  -ms-transform: translateX(18px);
  transform: translateX(18px);
}
</style>
