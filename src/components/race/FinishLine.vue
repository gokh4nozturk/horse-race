<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  // Position as a percentage (0-100) of track width
  positionPercentage?: number
  roundDistance?: number
}>()

// Default to 100% if no position is provided (right edge)
const position = computed(() => props.positionPercentage || 100)

// Calculate the CSS positioning styles
const positionStyle = computed(() => {
  return {
    right: position.value === 100 ? '0' : 'auto',
    left: position.value < 100 ? `${position.value}%` : 'auto'
  }
})

</script>

<template>
  <div class="absolute h-[calc(100dvh-95px)] w-10 bottom-0 z-40" :style="positionStyle">
    <!-- Finish line with checkered pattern -->
    <div
      class="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg1djVIMHpNNSA1aDV2NUg1eiIgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJub256ZXJvIi8+PC9zdmc+')] bg-repeat relative">
      <!-- Distance text overlay -->
      <div class="absolute top-1/2 right-1/2 rotate-90 translate-x-1/2 translate-y-1/2">
        <div class="text-3xl font-bold text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
          {{ roundDistance }}m
        </div>
      </div>
    </div>
    <div class="absolute inset-y-0 -left-10 w-10 bg-gradient-to-r from-transparent to-white/5"></div>
  </div>
</template>
