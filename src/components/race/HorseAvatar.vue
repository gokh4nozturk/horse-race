<script setup lang="ts">
import { cn } from '@/lib/utils'
import { useColorMode } from '@vueuse/core'

defineProps<{
  isRacing: boolean
  hasRaceDuration: boolean
  color: string
  hasFinished?: boolean
}>()

const colorMode = useColorMode()
</script>

<template>
  <div class="relative">
    <!-- Track dust effect -->
    <div v-if="isRacing && hasRaceDuration && !hasFinished" class="absolute right-8 bottom-0 w-32 h-5" :style="{
      background: `radial-gradient(ellipse at right, ${color}40, transparent 70%)`,
      opacity: '0.7',
    }"></div>

    <!-- Motion trail effect -->
    <div v-if="isRacing && hasRaceDuration && !hasFinished"
      class="absolute right-9 top-1/2 transform -translate-y-1/2 h-3 z-50" :style="{
        width: '80px',
        background: colorMode === 'dark'
          ? `linear-gradient(to left, ${color}90, transparent)`
          : `linear-gradient(to left, ${color}90, transparent)`,
        opacity: colorMode === 'dark' ? '0.8' : '0.7',
        filter: 'blur(2px)',
      }" />

    <!-- Horse silhouette shadow -->
    <div v-if="isRacing && hasRaceDuration"
      class="absolute -bottom-2 right-10 w-12 h-2 bg-black/40 rounded-full blur-sm transform scale-x-150" />

    <!-- Horse emoji with enhanced styling -->
    <div :class="cn('text-4xl filter drop-shadow-lg transition-transform', {
      'scale-x-[-1.1] scale-y-[1.1]': isRacing && hasRaceDuration && !hasFinished,
      'scale-[1.1]': !isRacing || hasFinished,
    })
      ">
      🐎
    </div>

    <!-- Enhanced dust particles effect -->
    <div v-if="isRacing && hasRaceDuration && !hasFinished" :class="cn('absolute -bottom-1 right-8 text-lg', {
      'animate-horse-dust scale-x-[-1]': isRacing && hasRaceDuration && !hasFinished,
    })
      ">
      <span class="opacity-70">💨</span>
    </div>

    <!-- Success indicator for finished horses -->
    <div v-if="hasFinished" class="absolute -top-4 -right-2 text-lg animate-bounce">
      🏁
    </div>
  </div>
</template>
