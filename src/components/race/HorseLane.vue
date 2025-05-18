<script setup lang="ts">
import { computed } from 'vue'
import { type Horse } from '@/stores/horses'
import HorseAvatar from './HorseAvatar.vue'

const props = defineProps<{
  horse: Horse
  index: number
  isRacing: boolean
  verticalOffset: number
  raceDuration: number | undefined
  speedMultiplier: number
}>()

// Helper to adjust duration based on speed multiplier
const getAdjustedDuration = (duration: number): number => {
  return duration / (props.speedMultiplier || 1)
}

// Determine if this horse has a race duration assigned
const hasRaceDuration = computed(() => {
  return props.raceDuration !== undefined
})

// Background color class based on index
const bgClass = computed(() => {
  return props.index % 2 === 0 ? 'bg-gray-900/70' : 'bg-gray-950/70'
})
</script>

<template>
  <div
    class="flex h-20 relative overflow-hidden transition-all duration-500"
    :class="[bgClass, { 'h-16': isRacing }]"
  >
    <!-- Lane marker -->
    <div
      class="absolute inset-y-0 left-0 w-1 transition-colors duration-300"
      :style="{ backgroundColor: horse.color }"
    ></div>

    <!-- Lane background with subtle track texture -->
    <div
      class="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDBoNDB2MUgweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"
    ></div>

    <!-- Collapsible horse info area -->
    <div
      class="flex-shrink-0 flex items-center relative z-10 border-r border-gray-700/70 transition-all duration-700 bg-gradient-to-r from-gray-900/90 to-transparent overflow-hidden"
      :class="{
        'w-64 px-5 py-2': !isRacing,
        'w-14 px-2 py-1': isRacing,
      }"
      :style="{
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }"
    >
      <!-- Collapsed view (just horse number) - only visible when racing -->
      <div
        v-if="isRacing"
        class="relative group flex-shrink-0 opacity-0 transition-opacity duration-300"
        :class="{ 'opacity-100': isRacing }"
        :style="{
          transitionDelay: isRacing ? '0.2s' : '0s',
        }"
      >
        <div
          class="w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0 rounded-lg shadow-lg transition-all border-2 overflow-hidden"
          :style="{ borderColor: horse.color }"
        >
          <div
            class="absolute inset-0 opacity-60 rounded-lg"
            :style="{ backgroundColor: horse.color }"
          ></div>
          <span class="relative text-white font-extrabold">{{ index + 1 }}</span>
        </div>
      </div>

      <!-- Expanded view (full horse info) - hidden when racing -->
      <div
        class="flex items-center transition-all duration-500"
        :class="{
          'opacity-100 translate-x-0': !isRacing,
          'opacity-0 -translate-x-10': isRacing,
        }"
        :style="{
          transitionDelay: isRacing ? '0s' : '0.2s',
        }"
      >
        <!-- Horse position number with enhanced styling -->
        <div class="relative group">
          <div
            class="w-10 h-10 flex items-center justify-center text-lg font-bold mr-3 flex-shrink-0 rounded-lg shadow-lg transition-all duration-700 border-2 overflow-hidden"
            :style="{ borderColor: horse.color }"
          >
            <div
              class="absolute inset-0 opacity-60 rounded-lg"
              :style="{ backgroundColor: horse.color }"
            ></div>
            <span class="relative text-white font-extrabold">{{ index + 1 }}</span>
          </div>
          <!-- Pulsing effect when racing -->
          <div
            v-if="isRacing"
            class="absolute inset-0 rounded-lg animate-ping"
            :style="{ backgroundColor: horse.color, opacity: 0.2 }"
          ></div>
        </div>

        <!-- Horse details with improved layout -->
        <div class="flex flex-col transition-all duration-700">
          <!-- Horse name with better typography -->
          <div class="font-bold text-base flex items-center">
            <span>{{ horse.name }}</span>
            <span
              class="ml-1.5 px-1.5 py-0.5 text-xs rounded-md opacity-70"
              :style="{ backgroundColor: horse.color }"
            >
              #{{ horse.id }}
            </span>
          </div>

          <!-- Horse condition bar with improved visualization -->
          <div class="mt-1">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">Condition</span>
              <div
                class="w-28 h-3 bg-gray-800/80 rounded-full overflow-hidden shadow-inner relative"
              >
                <div
                  class="h-full rounded-full relative overflow-hidden"
                  :style="{ width: `${horse.condition}%`, backgroundColor: horse.color }"
                >
                  <!-- Shiny effect on condition bar -->
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-50"
                  ></div>
                </div>

                <!-- Condition percentage indicator -->
                <span
                  class="absolute inset-0 text-[10px] flex items-center justify-center font-medium"
                  :class="{
                    'text-white': horse.condition < 40,
                    'text-gray-200': horse.condition >= 40,
                  }"
                >
                  {{ horse.condition }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Race track lane - redesigned with better visual cues -->
    <div class="flex-1 relative">
      <!-- Grid lines for distance markers with improved styling -->
      <div
        class="absolute inset-0 grid grid-cols-4 divide-x divide-gray-700/30 pointer-events-none"
      >
        <!-- Add subtle gradient to each column section -->
        <div v-for="n in 4" :key="n" class="relative h-full">
          <div class="absolute inset-0" :class="n % 2 === 0 ? 'bg-gray-800/10' : ''"></div>
        </div>
      </div>

      <!-- Horse position with enhanced animations and lane deviation -->
      <div
        class="absolute transition-all flex items-center z-10"
        :class="{
          'animate-[horse-gallop_0.4s_ease-in-out_infinite]': isRacing && hasRaceDuration,
        }"
        :style="{
          left: isRacing && hasRaceDuration ? 'calc(100% - 80px)' : '12px',
          top:
            isRacing && hasRaceDuration
              ? `calc(50% - 20px + ${verticalOffset}px)`
              : 'calc(50% - 20px)',
          transitionDuration: hasRaceDuration
            ? `${getAdjustedDuration(raceDuration || 10)}s`
            : '0s',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.1, 0.64, 1)',
        }"
      >
        <!-- Horse Avatar component -->
        <HorseAvatar
          :is-racing="isRacing"
          :has-race-duration="hasRaceDuration"
          :color="horse.color"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes horse-gallop {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.05);
  }
}
</style>
