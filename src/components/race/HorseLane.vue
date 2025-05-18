<script setup lang="ts">
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { type Horse } from '@/stores/horses'
import HorseAvatar from './HorseAvatar.vue'
import { useRaceStore } from '@/stores/race'

const props = defineProps<{
  horse: Horse
  index: number
  isRacing: boolean
  verticalOffset: number
  raceDuration: number | undefined
  speedMultiplier: number
}>()

const emit = defineEmits(['horseFinished'])

// Add race distance context from the parent
const raceStore = useRaceStore()
const MAX_RACE_DISTANCE = 2200 // The longest race (same as in RaceTrack)

// Calculate the finish line position based on current race distance
const finishLinePercentage = computed(() => {
  if (raceStore.currentRound) {
    return (raceStore.currentRound.distance / MAX_RACE_DISTANCE) * 100
  }
  return 100 // Default to 100% if no current round
})

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

// Animation variables
const horsePosition = ref(12) // Starting at 12px (left edge)
const finishPosition = ref(0) // Will be calculated on mount
const animationStartTime = ref(0)
const animationFrameId = ref(0)
const hasFinished = ref(false) // Track if horse has finished the race
const horseAvatarWidth = ref(40) // Default avatar width

// Create a reactive reference for finish position calculation
const recalculateFinishPosition = () => {
  // Get the parent element directly using this component's template
  const trackElement = document.querySelector('.flex-1.relative')
  if (trackElement) {
    const trackWidth = trackElement.clientWidth
    console.log('Track element width:', trackWidth)

    // Calculate finish position based on the finish line percentage
    const finishPercentage = finishLinePercentage.value

    // Calculate the exact finish position based on the track width and finish line percentage
    // Subtract the width of the horse avatar to ensure
    // the horse's front touches the finish line exactly
    finishPosition.value = trackWidth - horseAvatarWidth.value + 100

    console.log(`Horse #${props.horse.id} finish position set to:`, finishPosition.value, `(${finishPercentage}% of track width ${trackWidth}px)`)
  } else {
    console.error('Could not find track element')
    // Fallback to a reasonable default if element not found
    finishPosition.value = 800
  }
}

// Calculate target DOM element width on mount
onMounted(() => {
  // Use a small delay to ensure DOM is fully rendered
  setTimeout(() => {
    // Calculate finish position
    recalculateFinishPosition()

    // Start animation if racing is already active
    if (props.isRacing && hasRaceDuration.value) {
      horsePosition.value = 12 // Reset to start position
      animationStartTime.value = 0
      hasFinished.value = false // Reset finished state
      animationFrameId.value = requestAnimationFrame(animateHorse)
    }
  }, 100)

  // Add window resize listener to handle browser resizing
  window.addEventListener('resize', recalculateFinishPosition)
})

// Frame-based animation function
const animateHorse = (timestamp: number) => {
  if (!animationStartTime.value) {
    animationStartTime.value = timestamp
    console.log(`Horse #${props.horse.id} animation started, finish position:`, finishPosition.value)
  }

  // Calculate elapsed time
  const elapsedMs = timestamp - animationStartTime.value
  const duration = hasRaceDuration.value ? getAdjustedDuration(props.raceDuration || 10) * 1000 : 10000

  // Calculate progress (0 to 1)
  const progress = Math.min(elapsedMs / duration, 1)

  // Update position with easing
  // Using cubic-bezier-like easing
  const eased = cubicBezier(0.34, 1.1, 0.64, 1, progress)

  // Calculate new position based on animation progress
  // Starting point (12px) + (distance to finish * progress)
  let newPosition = 12 + ((finishPosition.value - 12) * eased)

  // Ensure horse never exceeds finish position during regular animation
  // Add a strict check to prevent going past the finish line
  if (newPosition >= finishPosition.value) {
    newPosition = finishPosition.value
    // If we've reached the exact finish position and we're not marked as finished
    if (!hasFinished.value) {
      hasFinished.value = true
      console.log(`Horse #${props.horse.id} reached EXACT finish line at ${finishPosition.value}px`)
      // Emit finish event after a small delay to ensure visuals are updated
      setTimeout(() => {
        emit('horseFinished', props.horse.id)
      }, 100)
    }
  }

  // Log position for debugging key horses
  if (props.horse.id < 3 && Math.abs(horsePosition.value - newPosition) > 10) {
    console.log(`Horse #${props.horse.id} position: ${Math.round(newPosition)}px, progress: ${(progress * 100).toFixed(1)}%, finish line at: ${finishPosition.value}px`)
  }

  // Update horse position
  horsePosition.value = newPosition

  // Check if horse has finished - ONLY WHEN HORSE HAS ACTUALLY REACHED THE FINISH LINE
  // This calculation needs to be very precise to ensure visual accuracy
  const distanceToFinish = finishPosition.value - horsePosition.value

  // Only finish when the horse has truly reached the finish line position
  // This ensures visual alignment with the finish line graphics
  if (distanceToFinish <= 0 && !hasFinished.value) {
    console.log(`Horse #${props.horse.id} reached finish line at position: ${Math.round(horsePosition.value)}px (finish at ${finishPosition.value}px)`)

    // Force the horse to the exact finish position for perfect visual alignment
    horsePosition.value = finishPosition.value
    hasFinished.value = true

    // Emit finish event after a small delay to ensure visuals are updated
    setTimeout(() => {
      emit('horseFinished', props.horse.id)
    }, 100)

    // Continue animation but stop updating position
    // This keeps the horse visible at the finish line
    animationFrameId.value = requestAnimationFrame(animateHorse)
    return
  }

  // Continue animation if not finished and still racing
  if (progress < 1 && props.isRacing) {
    animationFrameId.value = requestAnimationFrame(animateHorse)
  } else if (progress >= 1 && !hasFinished.value) {
    // Force finishing exactly at the line when animation completes
    console.log(`Horse #${props.horse.id} animation completed (progress=${progress}) - forcing position to ${finishPosition.value}px`)
    horsePosition.value = finishPosition.value
    hasFinished.value = true
    emit('horseFinished', props.horse.id)
  }
}

// Cubic bezier function implementation
const cubicBezier = (x1: number, y1: number, x2: number, y2: number, t: number) => {
  // Implementation of cubic bezier curve calculation
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx

  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t

  // Find t for given x using Newton-Raphson iteration
  let t2 = t
  for (let i = 0; i < 8; i++) {
    const x2 = sampleCurveX(t2) - t
    if (Math.abs(x2) < 0.001) break
    const d2 = (3 * ax * t2 + 2 * bx) * t2 + cx
    if (Math.abs(d2) < 1e-6) break
    t2 = t2 - x2 / d2
  }

  return sampleCurveY(t2)
}

// Watch for racing state change
watch(
  () => props.isRacing,
  (isRacing) => {
    console.log(`Horse #${props.horse.id} racing state changed:`, isRacing)

    if (isRacing && hasRaceDuration.value) {
      // Cancel any existing animation first
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = 0
      }

      // Reset animation state
      console.log(`Horse #${props.horse.id} animation reset, duration:`, props.raceDuration)
      horsePosition.value = 12 // Reset to start position
      animationStartTime.value = 0
      hasFinished.value = false // Reset finished state

      // Ensure we have a valid finish position
      if (finishPosition.value <= 0) {
        console.log('Recalculating finish position')
        recalculateFinishPosition()
      }

      // Start a new animation
      animationFrameId.value = requestAnimationFrame(animateHorse)
    } else {
      // Stop animation
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = 0
      }
      horsePosition.value = 12
      hasFinished.value = false // Reset finished state
    }
  },
  { immediate: true }
)

// Also watch for changes in race duration
watch(
  () => props.raceDuration,
  (newDuration) => {
    console.log(`Horse #${props.horse.id} race duration changed to:`, newDuration)

    // If we're already racing and now we got a duration, start animation
    if (props.isRacing && newDuration !== undefined && !animationFrameId.value) {
      console.log(`Horse #${props.horse.id} starting animation after receiving duration`)

      // Reset animation state
      horsePosition.value = 12
      animationStartTime.value = 0
      hasFinished.value = false

      // Ensure we have a valid finish position
      if (finishPosition.value <= 0) {
        recalculateFinishPosition()
      }

      // Start animation
      animationFrameId.value = requestAnimationFrame(animateHorse)
    }
  }
)

// Add watch for race distance changes via finishLinePercentage
watch(
  () => finishLinePercentage.value,
  (newPercentage) => {
    console.log(`Horse #${props.horse.id} finish line percentage changed to ${newPercentage.toFixed(2)}%`)

    // Recalculate finish position when percentage changes
    recalculateFinishPosition()
  }
)

// Clean up animation on component unmount
onUnmounted(() => {
  // Clean up window resize listener
  window.removeEventListener('resize', recalculateFinishPosition)

  // Clean up animation on component unmount
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = 0
  }
})
</script>

<template>
  <div class="flex h-20 relative overflow-hidden transition-all duration-500" :class="[bgClass, { 'h-16': isRacing }]">
    <!-- Lane marker -->
    <div class="absolute inset-y-0 left-0 w-1 transition-colors duration-300"
      :style="{ backgroundColor: horse.color }" />

    <!-- Lane background with subtle track texture -->
    <div
      class="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDBoNDB2MUgweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

    <!-- Collapsible horse info area -->
    <div
      class="flex-shrink-0 flex items-center relative z-10 border-r border-gray-700/70 transition-all duration-700 bg-gradient-to-r from-gray-900/90 to-transparent overflow-hidden"
      :class="{
        'w-64 px-5 py-2': !isRacing,
        'w-14 px-2 py-1': isRacing,
      }" :style="{
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }">
      <!-- Collapsed view (just horse number) - only visible when racing -->
      <div v-if="isRacing" class="relative group flex-shrink-0 opacity-0 transition-opacity duration-300"
        :class="{ 'opacity-100': isRacing }" :style="{
          transitionDelay: isRacing ? '0.2s' : '0s',
        }">
        <div
          class="w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0 rounded-lg shadow-lg transition-all border-2 overflow-hidden"
          :style="{ borderColor: horse.color }">
          <div class="absolute inset-0 opacity-60 rounded-lg" :style="{ backgroundColor: horse.color }"></div>
          <span class="relative text-white font-extrabold">{{ index + 1 }}</span>
        </div>
      </div>

      <!-- Expanded view (full horse info) - hidden when racing -->
      <div class="flex items-center transition-all duration-500" :class="{
        'opacity-100 translate-x-0': !isRacing,
        'opacity-0 -translate-x-10': isRacing,
      }" :style="{
        transitionDelay: isRacing ? '0s' : '0.2s',
      }">
        <!-- Horse position number with enhanced styling -->
        <div class="relative group">
          <div
            class="w-10 h-10 flex items-center justify-center text-lg font-bold mr-3 flex-shrink-0 rounded-lg shadow-lg transition-all duration-700 border-2 overflow-hidden"
            :style="{ borderColor: horse.color }">
            <div class="absolute inset-0 opacity-60 rounded-lg" :style="{ backgroundColor: horse.color }"></div>
            <span class="relative text-white font-extrabold">{{ index + 1 }}</span>
          </div>
          <!-- Pulsing effect when racing -->
          <div v-if="isRacing" class="absolute inset-0 rounded-lg animate-ping"
            :style="{ backgroundColor: horse.color, opacity: 0.2 }"></div>
        </div>

        <!-- Horse details with improved layout -->
        <div class="flex flex-col transition-all duration-700">
          <!-- Horse name with better typography -->
          <div class="font-bold text-base flex items-center">
            <span>{{ horse.name }}</span>
            <span class="ml-1.5 px-1.5 py-0.5 text-xs rounded-md text-neutral-700"
              :style="{ backgroundColor: horse.color }">
              #{{ horse.id }}
            </span>
          </div>

          <!-- Horse condition bar with improved visualization -->
          <div class="mt-1">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">Condition</span>
              <div class="w-28 h-3 bg-gray-800/80 rounded-full overflow-hidden shadow-inner relative">
                <div class="h-full rounded-full relative overflow-hidden"
                  :style="{ width: `${horse.condition}%`, backgroundColor: horse.color }">
                  <!-- Shiny effect on condition bar -->
                  <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-50"></div>
                </div>

                <!-- Condition percentage indicator -->
                <span class="absolute inset-0 text-[10px] flex items-center justify-center font-medium" :class="{
                  'text-white': horse.condition < 40,
                  'text-gray-200': horse.condition >= 40,
                }">
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
      <div class="absolute inset-0 grid grid-cols-4 divide-x divide-gray-700/30 pointer-events-none">
        <!-- Add subtle gradient to each column section -->
        <div v-for="n in 4" :key="n" class="relative h-full">
          <div class="absolute inset-0" :class="n % 2 === 0 ? 'bg-gray-800/10' : ''"></div>
        </div>
      </div>

      <!-- Horse position with enhanced animations and lane deviation -->
      <div class="absolute flex items-center z-10" :class="{
        'animate-[horse-gallop_0.4s_ease-in-out_infinite]': isRacing && hasRaceDuration && !hasFinished,
      }" :style="{
        left: `${horsePosition}px`,
        top:
          isRacing && hasRaceDuration
            ? `calc(50% - 20px + ${verticalOffset}px)`
            : 'calc(50% - 20px)',
      }">
        <!-- Horse Avatar component -->
        <HorseAvatar :is-racing="isRacing && !hasFinished" :has-race-duration="hasRaceDuration" :color="horse.color"
          :has-finished="hasFinished" />
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
