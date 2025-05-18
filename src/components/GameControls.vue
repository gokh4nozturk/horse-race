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
  <div class="flex flex-wrap gap-3">
    <Button
      variant="outline"
      @click="onGenerate"
      :disabled="isRacing"
      class="relative overflow-hidden border-blue-600/60 text-blue-500 bg-blue-950/30 hover:bg-blue-900/50 hover:text-blue-300 dark:text-blue-400 dark:border-blue-600/80 h-10 px-4 py-2 group"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
      ></div>
      <MemoryStick class="size-4 mr-2" />
      Generate Race
    </Button>

    <Button
      variant="default"
      @click="onStart"
      :disabled="!canStart || isRacing"
      class="relative overflow-hidden bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-600 hover:to-green-500 dark:from-green-800 dark:to-green-700 border-0 shadow-lg shadow-green-900/20 h-10 px-4 py-2 group"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
      ></div>
      <Play class="size-4 mr-2" />
      {{ currentRoundIndex < 0 ? 'Start Race' : 'Start Round' }}
    </Button>

    <Button
      variant="secondary"
      @click="onNextRound"
      :disabled="!canNext || isRacing || isLastRound"
      class="relative overflow-hidden bg-gradient-to-r from-blue-800 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-600 dark:from-blue-900 dark:to-indigo-800 border-0 shadow-lg shadow-blue-900/20 h-10 px-4 py-2 group disabled:opacity-60 disabled:bg-gray-700 disabled:cursor-not-allowed"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
      ></div>
      <SkipForward class="size-4 mr-2" />
      Next Round
    </Button>

    <Button
      variant="destructive"
      size="default"
      @click="onReset"
      :disabled="isRacing"
      class="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-600 text-white hover:from-red-600 hover:to-red-500 border-0 shadow-lg shadow-red-900/20 h-10 px-4 py-2 group"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
      ></div>
      <Ban class="size-4 mr-2" />
      Reset
    </Button>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
