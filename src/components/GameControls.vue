<script setup lang="ts">
import { Button } from '@/components/ui/button'

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
  <div class="flex flex-wrap gap-2 mb-4">
    <Button variant="default" @click="onGenerate" :disabled="isRacing"> Generate Race </Button>

    <Button variant="secondary" @click="onStart" :disabled="!canStart || isRacing">
      {{ currentRoundIndex < 0 ? 'Start Race' : 'Start Round' }}
    </Button>

    <Button variant="outline" @click="onNextRound" :disabled="!canNext || isRacing || isLastRound">
      Next Round
    </Button>

    <Button variant="destructive" @click="onReset" :disabled="isRacing">Reset</Button>
  </div>
</template>
