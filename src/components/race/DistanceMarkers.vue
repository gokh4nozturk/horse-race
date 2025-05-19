<script setup lang="ts">
defineProps<{
  maxDistance: number
  isRacing: boolean
}>()
</script>

<template>
  <div
    class="flex justify-between px-6 py-2 bg-gradient-to-r from-background/90 via-background/80 to-background/90 border-b border-gray-700/50 text-center text-xs font-mono transition-all duration-700 relative"
    :class="{ 'py-1 opacity-80': isRacing }">
    <!-- Distance marker lines -->
    <div class="absolute inset-x-0 bottom-0 h-1 bg-background/80 flex">
      <div class="h-full w-1/4 border-r border-gray-600"></div>
      <div class="h-full w-1/4 border-r border-gray-600"></div>
      <div class="h-full w-1/4 border-r border-gray-600"></div>
      <div class="h-full w-1/4"></div>
    </div>

    <div class="font-medium flex flex-col items-center">
      <span class="mb-1">0m</span>
      <div class="w-1 h-3 bg-gray-400 rounded-full"></div>
    </div>
    <div class="flex flex-col items-center">
      <span class="mb-1">{{ Math.floor(maxDistance * 0.25) }}m</span>
      <div class="w-1 h-2 bg-gray-500 rounded-full"></div>
    </div>
    <div class="flex flex-col items-center">
      <span class="mb-1">{{ Math.floor(maxDistance * 0.5) }}m</span>
      <div class="w-1 h-3 bg-gray-400 rounded-full"></div>
    </div>
    <div class="flex flex-col items-center">
      <span class="mb-1">{{ Math.floor(maxDistance * 0.75) }}m</span>
      <div class="w-1 h-2 bg-gray-500 rounded-full"></div>
    </div>
    <div class="font-medium flex flex-col items-center">
      <span class="mb-1">{{ maxDistance }}m</span>
      <div class="w-1 h-3 bg-gray-400 rounded-full"></div>
    </div>
  </div>
</template>
