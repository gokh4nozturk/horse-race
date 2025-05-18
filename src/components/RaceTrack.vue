<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRaceStore } from '@/stores/race'
import { useRaceEngine } from '@/composables/useRaceEngine'
import { type Horse } from '@/stores/horses'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

const props = defineProps<{
  horses: Horse[]
  isRacing: boolean
  speedMultiplier: number
}>()

const emit = defineEmits<{
  raceCompleted: []
}>()

const raceStore = useRaceStore()
const raceEngine = useRaceEngine()
const currentRound = computed(() => raceStore.currentRound)

// Store calculated race durations for each horse
const raceDurations = reactive<Record<number, number>>({})

// For debugging
const isAnimating = ref(false)

// Calculate the actual animation duration based on the speed multiplier
const getAdjustedDuration = (duration: number): number => {
  return duration / (props.speedMultiplier || 1)
}

// Calculate and set race durations when racing starts
watch(
  () => props.isRacing,
  (isRacing) => {
    console.log('RaceTrack - isRacing changed to:', isRacing, 'horses:', props.horses.length)

    if (isRacing && currentRound.value) {
      // Set animating state
      isAnimating.value = true
      console.log('Racing started, calculating times...')

      // Reset horses to start position first
      // This is important to ensure animation works properly
      Object.keys(raceDurations).forEach((key) => {
        delete raceDurations[Number(key)]
      })

      // Force a DOM update before starting animations
      setTimeout(() => {
        // Calculate race time for each horse
        props.horses.forEach((horse) => {
          const time = raceEngine.calculateRaceTime(horse.id, currentRound.value!.distance)
          console.log(`Horse #${horse.id} time:`, time)
          raceDurations[horse.id] = time
        })

        // Find the slowest horse's time to know when race is complete
        const maxDuration = Math.max(...Object.values(raceDurations))
        console.log('Max duration:', maxDuration)

        // Use adjusted duration based on speed multiplier
        const adjustedMaxDuration = getAdjustedDuration(maxDuration)
        console.log('Adjusted max duration (with speed multiplier):', adjustedMaxDuration)

        // Emit race completed after animation finishes
        setTimeout(
          () => {
            console.log('Race animation complete, emitting raceCompleted event')
            isAnimating.value = false
            emit('raceCompleted')
            console.log('raceCompleted event emitted')
          },
          adjustedMaxDuration * 1000 + 500 / (props.speedMultiplier || 1), // Add a small buffer, also adjusted
        )
      }, 50)
    } else if (!isRacing) {
      // Reset positions when race is not active
      Object.keys(raceDurations).forEach((key) => {
        delete raceDurations[Number(key)]
      })
    }
  },
  { immediate: true },
)

// Force recalculation of horse positions on component mount
onMounted(() => {
  console.log('RaceTrack mounted, horses:', props.horses.length)
})
</script>
<template>
  <Card class="overflow-hidden">
    <CardHeader class="pb-3 text-center">
      <h3 class="text-xl font-semibold">Round {{ currentRound?.id || 1 }}</h3>
      <p class="text-sm text-muted-foreground">Distance: {{ currentRound?.distance || 1200 }}m</p>

      <div
        v-if="speedMultiplier > 1"
        class="text-sm bg-blue-200 dark:bg-blue-900 px-2 py-1 rounded-2xl text-blue-700 dark:text-blue-200 font-semibold"
      >
        {{ speedMultiplier }}x Speed
      </div>
    </CardHeader>
    <CardContent>
      <div class="relative py-4">
        <!-- Finish line -->
        <div
          class="absolute h-full w-0.5 invert-100 bg-background top-0 right-[50px] z-10 before:content-['🏁'] before:absolute before:top-[-20px] before:left-[-8px] before:text-xl"
        />

        <!-- Horse lanes -->
        <div v-for="horse in horses" :key="horse.id" class="flex mb-4 h-10 last:mb-0">
          <div class="w-24 flex-shrink-0 flex flex-col justify-center mr-4">
            <div class="text-xs text-gray-500">#{{ horse.id }}</div>
            <div class="font-semibold">{{ horse.name }}</div>
          </div>

          <div class="flex-1 relative border-b border-dashed border-gray-300 h-full">
            <div
              class="absolute left-0 top-0 w-10 flex items-center h-full transition-all"
              :class="{ 'left-[calc(100%-40px)]': isRacing && raceDurations[horse.id] }"
              :style="{
                background: `linear-gradient(90deg, ${horse.color}22, transparent)`,
                transitionDuration: `${getAdjustedDuration(raceDurations[horse.id] || 10)}s`,
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }"
            >
              <div
                :class="
                  cn('text-2xl relative z-10', {
                    'scale-x-[-1]': isRacing && raceDurations[horse.id],
                  })
                "
              >
                🐎
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
