<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Play, SkipForward, Ban, MemoryStick } from 'lucide-vue-next'

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
  <div class="flex flex-wrap gap-2">
    <Button
      variant="outline"
      @click="onGenerate"
      :disabled="isRacing"
      class="border-primary hover:bg-primary/10 hover:text-primary"
    >
      <MemoryStick class="size-4" />
      Generate Race
    </Button>

    <Button variant="default" @click="onStart" :disabled="!canStart || isRacing">
      <Play class="size-4" />
      {{ currentRoundIndex < 0 ? 'Start Race' : 'Start Round' }}
    </Button>

    <Button
      variant="secondary"
      @click="onNextRound"
      :disabled="!canNext || isRacing || isLastRound"
    >
      <SkipForward class="size-4" />
      Next Round
    </Button>

    <Button variant="destructive" size="default" @click="onReset" :disabled="isRacing">
      <Ban class="size-4" />
      Reset
    </Button>
  </div>
</template>
