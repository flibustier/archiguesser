<script setup lang="ts">
import IconTimes from "../icons/IconTimes.vue";

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:isVisible"]);

const closeModal = () => {
  emit("update:isVisible", false);
};
</script>

<template>
  <div class="modal" v-if="isVisible">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <div class="close" @click="closeModal">
          <IconTimes />
        </div>
      </div>
      <div class="modal-body">
        <slot></slot>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 2;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

.modal-content {
  background-color: var(--color-background);
  margin: 7% auto; /* 15% from the top and centered */
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  max-width: var(--max-width);
}

.close:hover,
.close:focus {
  cursor: pointer;
}

.modal-header {
  display: flex;
  justify-content: space-between;
}

.modal-header h2 {
  font-weight: 500;
  font-size: 1rem;
  text-transform: uppercase;
  text-align: center;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.modal-footer {
  font-size: 0.75rem;
  line-height: 1rem;
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
