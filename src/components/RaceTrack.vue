<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRaceStore } from '@/stores/race'
import { useRaceEngine } from '@/composables/useRaceEngine'
import { type Horse } from '@/stores/horses'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { TrendingUp, Zap } from 'lucide-vue-next'

const props = defineProps<{
  horses: Horse[]
  isRacing: boolean
  speedMultiplier: number
}>()

const emit = defineEmits<{
  raceCompleted: []
  countdownComplete: []
}>()

// Add countdown ref
const countdown = ref<number | null>(null)
const isCountingDown = ref(false)

const raceStore = useRaceStore()
const raceEngine = useRaceEngine()
const currentRound = computed(() => raceStore.currentRound)

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

// Calculate the actual animation duration based on the speed multiplier
const getAdjustedDuration = (duration: number): number => {
  return duration / (props.speedMultiplier || 1)
}

// Generate a random number between min and max
const getRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

// Start countdown function
const startCountdown = () => {
  console.log('Starting countdown')
  isCountingDown.value = true
  countdown.value = 3

  // Countdown başlangıcında log yazalım
  console.log('COUNTDOWN STARTED: ', countdown.value)

  const interval = setInterval(() => {
    if (countdown.value && countdown.value > 1) {
      countdown.value--
      console.log('COUNTDOWN: ', countdown.value)
    } else {
      clearInterval(interval)
      countdown.value = null
      isCountingDown.value = false
      console.log('COUNTDOWN COMPLETED')
      emit('countdownComplete')
    }
  }, 1000 / props.speedMultiplier)
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

// Watch for isRacing change to start countdown
watch(
  () => props.isRacing,
  (isRacing) => {
    console.log('RaceTrack - isRacing changed to:', isRacing, 'horses:', props.horses.length)

    if (isRacing && !isCountingDown.value && countdown.value === null) {
      console.log('Starting countdown from isRacing watcher')
      // Reset positions when starting a new race
      Object.keys(raceDurations).forEach((key) => {
        delete raceDurations[Number(key)]
      })

      // Reset vertical offsets
      Object.keys(verticalOffsets).forEach((key) => {
        verticalOffsets[Number(key)] = 0
      })

      // Start countdown
      startCountdown()
    } else if (!isRacing) {
      // Reset countdown if race stopped externally
      countdown.value = null
      isCountingDown.value = false
    }
  },
  { immediate: true },
)

// Watch for countdown completion to start the actual race
watch(
  () => isCountingDown.value,
  (isCounting, prevCounting) => {
    if (prevCounting && !isCounting && props.isRacing && currentRound.value) {
      // The countdown just finished, now start the actual race
      console.log('Countdown complete, starting actual race animation')

      // Set animating state
      isAnimating.value = true

      // Initialize position changes for dynamic racing
      initializePositionChanges()

      // Force a DOM update before starting animations
      setTimeout(() => {
        // Calculate race time for each horse
        props.horses.forEach((horse) => {
          const time = raceEngine.calculateRaceTime(horse.id, currentRound.value!.distance)
          console.log(`Horse #${horse.id} time:`, time)
          raceDurations[horse.id] = time
        })

        // Log all race durations
        console.log('All race durations:', { ...raceDurations })

        // Find the slowest horse's time to know when race is complete
        const maxDuration = Math.max(...Object.values(raceDurations))
        console.log('Max duration:', maxDuration)

        // Use adjusted duration based on speed multiplier
        const adjustedMaxDuration = getAdjustedDuration(maxDuration)
        console.log('Adjusted max duration (with speed multiplier):', adjustedMaxDuration)

        // Create an array to track horses that have finished
        const finishedHorses = reactive(new Set<number>())

        // Sort horses by their race time to determine finish order
        const sortedHorses = [...props.horses]
          .map((horse) => ({
            id: horse.id,
            time: raceDurations[horse.id],
          }))
          .sort((a, b) => a.time - b.time)

        // Set up individual finish timers for each horse
        sortedHorses.forEach((horse) => {
          const adjustedTime = getAdjustedDuration(horse.time)

          setTimeout(() => {
            console.log(`Horse #${horse.id} reached the finish line!`)
            finishedHorses.add(horse.id)

            // If all horses have finished, emit race completed event after a short delay
            if (finishedHorses.size === props.horses.length) {
              setTimeout(() => {
                console.log('All horses have finished the race')
                isAnimating.value = false
                emit('raceCompleted')
                console.log('raceCompleted event emitted')
              }, 500 / props.speedMultiplier) // Short delay after the last horse
            }
          }, adjustedTime * 1000) // Convert to milliseconds
        })
      }, 50)
    }
  },
)

// Force recalculation of horse positions on component mount
onMounted(() => {
  console.log('RaceTrack mounted, horses:', props.horses.length)
})

// Ensure horses list is valid and non-empty
const validHorses = computed(() => {
  return props.horses && props.horses.length > 0 ? props.horses : []
})
</script>
<template>
  <Card
    class="overflow-hidden border-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white shadow-2xl relative"
  >
    <!-- Race track header -->
    <CardHeader
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
            <svg
              class="w-4 h-4 mr-1.5 text-indigo-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              ></path>
            </svg>
            <span>Round {{ currentRound?.id || 1 }}</span>
          </div>
        </div>

        <!-- Countdown overlay - tüm sayfa üzerinde görünecek -->
        <div
          v-if="countdown !== null"
          class="fixed inset-0 flex items-center justify-center z-[999] bg-black/60 backdrop-blur-sm"
        >
          <div
            class="bg-black/80 rounded-full w-48 h-48 flex items-center justify-center border-4 border-white/20"
          >
            <span class="text-8xl font-bold text-white animate-pulse">{{ countdown }}</span>
          </div>
        </div>

        <h3
          class="text-2xl font-bold my-2 text-white transition-all duration-700 glow"
          :class="{ 'text-xl my-1 opacity-90': isRacing }"
        >
          <span v-if="isCountingDown">Ready...</span>
          <span v-else-if="isRacing">Race in Progress</span>
          <span v-else>Ready to Race</span>
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
          <span class="font-mono font-bold text-white text-base"
            >{{ currentRound?.distance || 1200 }}m</span
          >
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
    </CardHeader>

    <!-- Race track content -->
    <CardContent class="p-0 relative">
      <!-- Distance markers at top with improved visualization -->
      <div
        class="flex justify-between px-6 py-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 text-center text-xs font-mono transition-all duration-700 relative"
        :class="{ 'py-1 opacity-80': isRacing }"
      >
        <!-- Distance marker lines -->
        <div class="absolute inset-x-0 bottom-0 h-1 bg-gray-800 flex">
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
          <span class="mb-1">{{ Math.floor((currentRound?.distance || 1200) * 0.25) }}m</span>
          <div class="w-1 h-2 bg-gray-500 rounded-full"></div>
        </div>
        <div class="flex flex-col items-center">
          <span class="mb-1">{{ Math.floor((currentRound?.distance || 1200) * 0.5) }}m</span>
          <div class="w-1 h-3 bg-gray-400 rounded-full"></div>
        </div>
        <div class="flex flex-col items-center">
          <span class="mb-1">{{ Math.floor((currentRound?.distance || 1200) * 0.75) }}m</span>
          <div class="w-1 h-2 bg-gray-500 rounded-full"></div>
        </div>
        <div class="font-medium flex flex-col items-center">
          <span class="mb-1">{{ currentRound?.distance || 1200 }}m</span>
          <div class="w-1 h-3 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      <!-- Finish line with enhanced checker pattern and lighting effect -->
      <div class="absolute h-full w-10 top-0 right-0 z-40">
        <div
          class="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg1djVIMHpNNSA1aDV2NUg1eiIgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJub256ZXJvIi8+PC9zdmc+')] bg-repeat"
        ></div>
        <div
          class="absolute inset-y-0 -left-10 w-10 bg-gradient-to-r from-transparent to-white/5"
        ></div>
        <!-- Add finish flag at the top of finish line -->
        <div class="absolute -top-4 -right-4 text-2xl animate-bounce origin-bottom-left">🏁</div>
      </div>

      <!-- Track content with lanes -->
      <div class="relative">
        <!-- Racetrack background with 3D effect -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 opacity-40"
        ></div>

        <!-- Horse lanes -->
        <div class="px-0">
          <div v-if="validHorses.length === 0" class="p-8 text-center">
            <div class="text-gray-400 mb-2">Horses are being prepared...</div>
            <div class="flex justify-center">
              <div class="animate-pulse text-3xl">🐎</div>
            </div>
          </div>
          <div
            v-for="(horse, index) in validHorses"
            :key="horse.id"
            class="flex h-20 relative overflow-hidden transition-all duration-500"
            :class="[index % 2 === 0 ? 'bg-gray-900/70' : 'bg-gray-950/70', { 'h-16': isRacing }]"
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
                  'animate-[horse-gallop_0.4s_ease-in-out_infinite]': isRacing && !isCountingDown,
                }"
                :style="{
                  left: isRacing && !isCountingDown ? 'calc(100% - 80px)' : '12px',
                  top:
                    isRacing && !isCountingDown
                      ? `calc(50% - 20px + ${verticalOffsets[horse.id] || 0}px)`
                      : 'calc(50% - 20px)',
                  transitionDuration: `${getAdjustedDuration(raceDurations[horse.id] || 10)}s`,
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.1, 0.64, 1)',
                }"
              >
                <!-- Enhanced horse visualization -->
                <div class="relative">
                  <!-- Track dust effect -->
                  <div
                    v-if="isRacing && raceDurations[horse.id]"
                    class="absolute right-8 bottom-0 w-32 h-5"
                    :style="{
                      background: `radial-gradient(ellipse at right, ${horse.color}40, transparent 70%)`,
                      opacity: '0.7',
                    }"
                  ></div>

                  <!-- Motion trail effect -->
                  <div
                    v-if="isRacing && raceDurations[horse.id]"
                    class="absolute right-9 top-1/2 transform -translate-y-1/2 h-3"
                    :style="{
                      width: '80px',
                      background: `linear-gradient(to left, ${horse.color}90, transparent)`,
                      opacity: '0.7',
                      filter: 'blur(2px)',
                    }"
                  ></div>

                  <!-- Horse silhouette shadow -->
                  <div
                    v-if="isRacing && raceDurations[horse.id]"
                    class="absolute -bottom-2 right-10 w-12 h-2 bg-black/40 rounded-full blur-sm transform scale-x-150"
                  ></div>

                  <!-- Horse emoji with enhanced styling -->
                  <div
                    :class="
                      cn('text-4xl filter drop-shadow-lg transition-transform', {
                        'scale-x-[-1.1] scale-y-[1.1]': isRacing && raceDurations[horse.id],
                        'scale-[1.1]': !isRacing,
                      })
                    "
                  >
                    🐎
                  </div>

                  <!-- Enhanced dust particles effect -->
                  <div
                    v-if="isRacing && raceDurations[horse.id]"
                    :class="
                      cn('absolute -bottom-1 right-8 text-lg', {
                        'animate-[horse-dust_0.3s_ease-in-out_infinite] scale-x-[-1]':
                          isRacing && raceDurations[horse.id],
                      })
                    "
                  >
                    <span class="opacity-70">💨</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

.glow {
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.5),
    0 0 20px rgba(255, 255, 255, 0.3);
}
</style>
