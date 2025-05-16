<script setup lang="ts">
defineProps<{
  currentRoundIndex: number
  isRacing: boolean
  canStart: boolean
  canNext: boolean
  isLastRound: boolean
}>()

const emit = defineEmits<{
  generate: []
  start: []
  nextRound: []
  reset: []
}>()

const onGenerate = () => {
  console.log('Generate button clicked!')
  emit('generate')
}

const onStart = () => {
  console.log('Start button clicked!')
  emit('start')
}

const onNextRound = () => {
  console.log('Next Round button clicked!')
  emit('nextRound')
}

const onReset = () => {
  console.log('Reset button clicked!')
  emit('reset')
}
</script>

<template>
  <div class="controls">
    <button class="button button-primary" @click="onGenerate" :disabled="isRacing">
      Generate Race
    </button>

    <button class="button button-success" @click="onStart" :disabled="!canStart || isRacing">
      {{ currentRoundIndex < 0 ? 'Start Race' : 'Start Round' }}
    </button>

    <button
      class="button button-secondary"
      @click="onNextRound"
      :disabled="!canNext || isRacing || isLastRound"
    >
      Next Round
    </button>

    <button class="button button-danger" @click="onReset" :disabled="isRacing">Reset</button>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s,
    opacity 0.2s;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-primary {
  background-color: #3b82f6;
  color: white;
}

.button-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.button-success {
  background-color: #10b981;
  color: white;
}

.button-success:hover:not(:disabled) {
  background-color: #059669;
}

.button-secondary {
  background-color: #6b7280;
  color: white;
}

.button-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.button-danger {
  background-color: #ef4444;
  color: white;
}

.button-danger:hover:not(:disabled) {
  background-color: #dc2626;
}
</style>
