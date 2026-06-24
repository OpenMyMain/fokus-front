<template>
  <div class="loader-loading">
    <svg class="spinner" viewBox="0 0 50 50">
      <circle class="path-bg" cx="25" cy="25" r="20" fill="none" stroke-width="5"/>
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"/>
    </svg>
    <div class="loader-text">{{ props.message }}</div>
  </div>
</template>
<style scoped>
.loader-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100svh;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.spinner {
  animation: spin 2s linear infinite;
  width: 60px;
  height: 60px;
  margin-bottom: 18px;
}

.path {
  stroke: var(--color-primary);
  stroke-dasharray: 60 40;
  stroke-dashoffset: 0;
  stroke-linecap: round;
}

.path-bg {
  stroke: #e0e0e0;
}

.loader-text {
  font-size: 1.3rem;
  color: #333;
  letter-spacing: 0.02em;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script setup>
const props = defineProps({
  message: {
    type: String,
    default: 'Chargement en cours...'
  }
});
</script>
