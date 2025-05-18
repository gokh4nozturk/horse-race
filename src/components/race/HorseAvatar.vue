<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  isRacing: boolean
  hasRaceDuration: boolean
  color: string
}>()
</script>

<template>
  <div class="relative">
    <!-- Track dust effect -->
    <div
      v-if="isRacing && hasRaceDuration"
      class="absolute right-8 bottom-0 w-32 h-5"
      :style="{
        background: `radial-gradient(ellipse at right, ${color}40, transparent 70%)`,
        opacity: '0.7',
      }"
    ></div>

    <!-- Motion trail effect -->
    <div
      v-if="isRacing && hasRaceDuration"
      class="absolute right-9 top-1/2 transform -translate-y-1/2 h-3"
      :style="{
        width: '80px',
        background: `linear-gradient(to left, ${color}90, transparent)`,
        opacity: '0.7',
        filter: 'blur(2px)',
      }"
    ></div>

    <!-- Horse silhouette shadow -->
    <div
      v-if="isRacing && hasRaceDuration"
      class="absolute -bottom-2 right-10 w-12 h-2 bg-black/40 rounded-full blur-sm transform scale-x-150"
    ></div>

    <!-- Horse emoji with enhanced styling -->
    <div
      :class="
        cn('text-4xl filter drop-shadow-lg transition-transform', {
          'scale-x-[-1.1] scale-y-[1.1]': isRacing && hasRaceDuration,
          'scale-[1.1]': !isRacing,
        })
      "
    >
      🐎
    </div>

    <!-- Enhanced dust particles effect -->
    <div
      v-if="isRacing && hasRaceDuration"
      :class="
        cn('absolute -bottom-1 right-8 text-lg', {
          'animate-[horse-dust_0.3s_ease-in-out_infinite] scale-x-[-1]':
            isRacing && hasRaceDuration,
        })
      "
    >
      <span class="opacity-70">💨</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes horse-dust {
  0%,
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-2px) scale(1.2) rotate(-5deg);
    opacity: 0.8;
  }
}
</style>
