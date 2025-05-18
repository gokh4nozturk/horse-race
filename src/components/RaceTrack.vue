<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRaceStore } from '@/stores/race'
import { useRaceEngine } from '@/composables/useRaceEngine'
import { type Horse } from '@/stores/horses'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { toast } from 'vue-sonner'

// Import modular components
import RaceHeader from '@/components/race/RaceHeader.vue'
import CountdownTimer from '@/components/race/CountdownTimer.vue'
import DistanceMarkers from '@/components/race/DistanceMarkers.vue'
import FinishLine from '@/components/race/FinishLine.vue'
import HorseLane from '@/components/race/HorseLane.vue'

const props = defineProps<{
  horses: Horse[]
  isRacing: boolean
  speedMultiplier: number
}>()

const emit = defineEmits<{
  raceCompleted: [error?: string]
  countdownComplete: []
}>()

const countdownRef = ref<InstanceType<typeof CountdownTimer> | null>(null)
const isCountingDown = ref(false)

const raceStore = useRaceStore()
const raceEngine = useRaceEngine()
const currentRound = computed(() => {
  // If no current round, log a warning
  if (!raceStore.currentRound) {
    console.warn('RaceTrack: No current round available')
  }
  return raceStore.currentRound
})

// Store calculated race durations for each horse
const raceDurations = reactive<Record<number, number>>({})

// Store vertical offsets for each horse to create lane deviation
const verticalOffsets = reactive<Record<number, number>>({})

// Store position changes for more dynamic racing
const positionChanges = reactive<
  Record<
    number,
    {
      lastChangeTime: number
      nextChangeTime: number
      targetOffset: number
      currentOffset: number
    }
  >
>({})

// For debugging
const isAnimating = ref(false)
const raceError = ref<string | null>(null)

// Calculate the actual animation duration based on the speed multiplier
const getAdjustedDuration = (duration: number): number => {
  return duration / (props.speedMultiplier || 1)
}

// Generate a random number between min and max
const getRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

// Handle countdown completion
const handleCountdownComplete = () => {
  console.log('Countdown completed in parent component')
  isCountingDown.value = false
  emit('countdownComplete')

  // Check if we have a valid currentRound before starting race
  if (currentRound.value) {
    raceError.value = null
    startRace()
  } else {
    const errorMsg = 'Cannot start race: No current round available'
    console.error(errorMsg)
    raceError.value = errorMsg
    // Notify parent that we had an error
    emit('raceCompleted', errorMsg)
  }
}

// Update isCountingDown when CountdownTimer changes state
watch(
  () => countdownRef.value?.isCountingDown,
  (newValue) => {
    if (newValue !== undefined) {
      isCountingDown.value = newValue
    }
  },
  { immediate: true },
)

// Watch for currentRound changes to clear errors when it becomes available
watch(
  () => currentRound.value,
  (newValue) => {
    if (newValue) {
      console.log('Current round is now available:', newValue.id)
      raceError.value = null
    }
  },
  { immediate: true },
)

// Watch for isRacing change to initialize race
watch(
  () => props.isRacing,
  (isRacing) => {
    console.log('RaceTrack - isRacing changed to:', isRacing, 'horses:', props.horses.length)

    if (isRacing) {
      console.log('Reset positions when starting a new race')
      // Reset positions when starting a new race
      Object.keys(raceDurations).forEach((key) => {
        delete raceDurations[Number(key)]
      })

      // Reset vertical offsets
      Object.keys(verticalOffsets).forEach((key) => {
        verticalOffsets[Number(key)] = 0
      })

      // Set isCountingDown from component to true to prevent animation starting too early
      isCountingDown.value = true
    }
  },
  { immediate: true },
)

// Start the actual race
const startRace = () => {
  console.log('Starting actual race animation')

  // Set animating state
  isAnimating.value = true

  // Check if we have a valid currentRound
  if (!currentRound.value) {
    const errorMsg = 'No current round available, cannot start race'
    console.error(errorMsg)
    raceError.value = errorMsg
    return
  }

  // Get the race distance
  const raceDistance = currentRound.value.distance
  console.log(`Race distance: ${raceDistance}m for ${props.horses.length} horses`)

  // Reset any previous error
  raceError.value = null

  // Initialize position changes for dynamic racing
  initializePositionChanges()

  // Force a DOM update before starting animations
  setTimeout(() => {
    // Clear previous race durations
    Object.keys(raceDurations).forEach((key) => {
      delete raceDurations[Number(key)]
    })

    console.log('Calculating race times for horses:', props.horses.map(h => h.id).join(', '))

    // Calculate race time for each horse
    props.horses.forEach((horse) => {
      const time = raceEngine.calculateRaceTime(horse.id, raceDistance)
      console.log(`Horse #${horse.id} time: ${time}s with condition: ${horse.condition}%`)
      raceDurations[horse.id] = time
    })

    // Log all race durations
    console.log('All race durations:', Object.entries(raceDurations).map(([id, time]) => `Horse #${id}: ${time}s`).join(', '))

    // Find the slowest horse's time to know when race is complete
    const maxDuration = Math.max(...Object.values(raceDurations))
    console.log('Max duration:', maxDuration)

    // Use adjusted duration based on speed multiplier
    const adjustedMaxDuration = getAdjustedDuration(maxDuration)
    console.log('Adjusted max duration (with speed multiplier):', adjustedMaxDuration)

    // Now we're using the event system instead of setTimeout for completion detection
    // The actual race completion is handled by the handleHorseFinished method
    console.log('Race setup complete, horses will move via animation')
  }, 50)
}

// Manage lane changes for more dynamic racing
const initializePositionChanges = () => {
  props.horses.forEach((horse) => {
    // Initialize position changes for each horse
    positionChanges[horse.id] = {
      lastChangeTime: 0,
      nextChangeTime: getRandomNumber(1, 3),
      targetOffset: 0,
      currentOffset: 0,
    }
  })

  // Set up interval to update vertical positions during race
  if (props.isRacing) {
    const intervalTime = 100 / props.speedMultiplier

    const positionInterval = setInterval(() => {
      if (!props.isRacing) {
        clearInterval(positionInterval)
        return
      }

      // Update vertical positions for each horse
      props.horses.forEach((horse) => {
        const horseChanges = positionChanges[horse.id]
        const elapsedTime = Date.now() / 1000

        // Check if it's time for a position change
        if (elapsedTime >= horseChanges.nextChangeTime) {
          // Set a new target offset (lane deviation)
          horseChanges.targetOffset = getRandomNumber(-15, 15)
          horseChanges.lastChangeTime = elapsedTime
          horseChanges.nextChangeTime = elapsedTime + getRandomNumber(0.5, 2)
        }

        // Smoothly interpolate towards target offset
        horseChanges.currentOffset =
          horseChanges.currentOffset +
          (horseChanges.targetOffset - horseChanges.currentOffset) * 0.1

        // Apply the calculated offset
        verticalOffsets[horse.id] = horseChanges.currentOffset
      })
    }, intervalTime)
  }
}

// Ensure horses list is valid and non-empty
const validHorses = computed(() => {
  return props.horses && props.horses.length > 0 ? props.horses : []
})

// Handle horse finished event
const handleHorseFinished = (horseId: number) => {
  console.log(`Horse #${horseId} finished the race`)
  toast.success(`Horse #${horseId} finished the race`)

  // Remove the finished horse from the raceDurations
  delete raceDurations[horseId]

  // Log remaining horses
  const remainingHorses = Object.keys(raceDurations).map(id => Number(id))
  console.log(`Remaining horses: ${remainingHorses.length > 0 ? remainingHorses.join(', ') : 'None'}`)

  // Check if all horses have finished
  if (Object.keys(raceDurations).length === 0) {
    console.log('All horses have finished the race')
    isAnimating.value = false

    // Small delay before emitting the raceCompleted event
    // This gives the UI time to update and show all horses at the finish line
    setTimeout(() => {
      console.log('Emitting raceCompleted event')
      emit('raceCompleted', raceError.value || undefined)
    }, 500)
  }
}
</script>
<template>
  <Card
    class="overflow-hidden border-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white shadow-2xl relative">
    <!-- Race track header -->
    <CardHeader>
      <RaceHeader :round-id="currentRound?.id || 1" :distance="currentRound?.distance || 1200" :is-racing="isRacing"
        :speed-multiplier="speedMultiplier" :is-counting-down="isCountingDown" />
    </CardHeader>

    <!-- Countdown timer -->
    <CountdownTimer ref="countdownRef" :is-active="isRacing" @complete="handleCountdownComplete" />

    <!-- Error message for race errors -->
    <div v-if="raceError" class="bg-red-900/80 text-white px-4 py-3 text-center font-semibold">
      {{ raceError }}
    </div>

    <!-- Race track content -->
    <CardContent class="p-0 relative">
      <!-- Distance markers at top -->
      <DistanceMarkers :max-distance="raceStore.currentRound?.distance || 0" :is-racing="isRacing" />

      <!-- Finish line -->
      <FinishLine />

      <!-- Track content with lanes -->
      <div class="relative">
        <!-- Racetrack background with 3D effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 opacity-40"></div>

        <!-- Horse lanes -->
        <div class="px-0">
          <div v-if="validHorses.length === 0" class="p-8 text-center">
            <div class="text-gray-400 mb-2">Horses are being prepared...</div>
            <div class="flex justify-center">
              <div class="animate-pulse text-3xl">🐎</div>
            </div>
          </div>

          <!-- Use the HorseLane component for each horse -->
          <HorseLane v-for="(horse, index) in validHorses" :key="horse.id" :horse="horse" :index="index"
            :is-racing="isRacing" :vertical-offset="verticalOffsets[horse.id] || 0"
            :race-duration="raceDurations[horse.id]" :speed-multiplier="speedMultiplier"
            @horse-finished="handleHorseFinished" />
        </div>
      </div>
    </CardContent>
  </Card>
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
