<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, Zap, CircleDashed } from 'lucide-vue-next'

const props = defineProps<{
  roundId: number
  distance: number
  isRacing: boolean
  speedMultiplier: number
  isCountingDown: boolean
}>()

const raceTitle = computed(() => {
  if (props.isCountingDown) return 'Ready...'
  if (props.isRacing) return 'Race in Progress'
  return 'Ready to Race'
})
</script>

<template>
  <div
    class="pb-4 text-center relative border-b border-gray-800/50 transition-all duration-700 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900"
    :class="{ 'pb-2': isRacing }"
  >
    <!-- Race title with glow effect -->
    <div class="relative">
      <!-- Round indicator with enhanced design -->
      <div
        class="absolute left-4 top-1 bg-gradient-to-r from-indigo-800 to-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all duration-700 border border-indigo-500/30"
        :class="{ 'scale-90 opacity-90 py-1.5': isRacing }"
      >
        <div class="flex items-center">
          <CircleDashed class="size-4 mr-1.5 text-indigo-300 shrink-0" />
          <span>Round {{ roundId }}</span>
        </div>
      </div>

      <h3
        class="text-2xl font-bold my-2 text-white transition-all duration-700 glow"
        :class="{ 'text-xl my-1 opacity-90': isRacing }"
      >
        {{ raceTitle }}
      </h3>
    </div>

    <!-- Race info pills with improved design -->
    <div
      class="flex items-center justify-center gap-5 mt-3 transition-all duration-700"
      :class="{ 'gap-3 mt-2 scale-95': isRacing }"
    >
      <div
        class="px-4 py-1.5 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg text-sm flex items-center shadow-md transition-all duration-700 border border-gray-700"
        :class="{ 'px-3 py-1 scale-95': isRacing }"
      >
        <TrendingUp class="size-4 mr-1.5 shrink-0" />
        <span class="text-gray-300 mr-2">Distance:</span>
        <span class="font-mono font-bold text-white text-base">{{ distance }}m</span>
      </div>

      <div
        v-if="speedMultiplier > 1"
        class="px-4 py-1.5 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg text-sm flex items-center shadow-md transition-all duration-700 border border-blue-700/50"
        :class="{ 'px-3 py-1 scale-95': isRacing }"
      >
        <Zap class="size-4 mr-1.5 text-blue-300 shrink-0" />
        <span class="text-blue-200 mr-2">Speed:</span>
        <span class="font-mono font-bold text-white text-base">{{ speedMultiplier }}x</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glow {
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.5),
    0 0 20px rgba(255, 255, 255, 0.3);
}
</style>
