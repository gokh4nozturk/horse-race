<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRaceStore } from '@/stores/race'
import { useRaceEngine } from '@/composables/useRaceEngine'
import { type Horse } from '@/stores/horses'

const props = defineProps<{
  horses: Horse[]
  isRacing: boolean
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

        // Emit race completed after animation finishes
        setTimeout(
          () => {
            console.log('Race animation complete, emitting raceCompleted event')
            isAnimating.value = false
            emit('raceCompleted')
            console.log('raceCompleted event emitted')
          },
          maxDuration * 1000 + 500,
        ) // Add a small buffer
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
  <div class="race-track-container">
    <div v-if="currentRound" class="round-info">
      <h3>Round {{ currentRound.id }}</h3>
      <p>Distance: {{ currentRound.distance }}m</p>
    </div>

    <div class="race-track">
      <div class="finish-line"></div>

      <div v-for="horse in horses" :key="horse.id" class="horse-lane">
        <div class="lane-info">
          <div class="lane-number">#{{ horse.id }}</div>
          <div class="lane-name">{{ horse.name }}</div>
        </div>

        <div class="lane-track">
          <div
            class="horse-racer"
            :class="{ 'is-racing': isRacing && raceDurations[horse.id] }"
            :style="{
              background: `linear-gradient(90deg, ${horse.color}22, transparent)`,
              '--race-duration': `${raceDurations[horse.id] || 10}s`,
            }"
          >
            <div class="horse-emoji">🐎</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.race-track-container {
  width: 100%;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
}

.round-info {
  margin-bottom: 1rem;
  text-align: center;
}

.round-info h3 {
  font-size: 1.25rem;
  margin: 0;
}

.round-info p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.race-track {
  position: relative;
  width: 100%;
  padding: 1rem 0;
}

.finish-line {
  position: absolute;
  height: 100%;
  width: 2px;
  background-color: #000;
  top: 0;
  right: 50px;
  z-index: 1;
}

.finish-line::before {
  content: '🏁';
  position: absolute;
  top: -20px;
  left: -8px;
  font-size: 1.25rem;
}

.horse-lane {
  display: flex;
  margin-bottom: 1rem;
  height: 40px;
}

.lane-info {
  width: 100px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 1rem;
}

.lane-number {
  font-size: 0.75rem;
  color: #6b7280;
}

.lane-name {
  font-weight: 600;
}

.lane-track {
  flex: 1;
  position: relative;
  border-bottom: 1px dashed #d1d5db;
  height: 100%;
}

.horse-racer {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  display: flex;
  align-items: center;
  height: 100%;
  transition: left var(--race-duration) cubic-bezier(0.4, 0, 0.2, 1);
}

.horse-racer.is-racing {
  left: calc(100% - 40px);
}

.horse-emoji {
  font-size: 1.75rem;
  position: relative;
  z-index: 2;
}
</style>
