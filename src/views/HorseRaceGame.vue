<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { useResultsStore } from '@/stores/results'
import { useRaceEngine } from '@/composables/useRaceEngine'

import HorseCard from '@/components/HorseCard.vue'
import RaceTrack from '@/components/RaceTrack.vue'
import ResultBoard from '@/components/ResultBoard.vue'
import GameControls from '@/components/GameControls.vue'
import FinalResultsBoard from '@/components/FinalResultsBoard.vue'

// Store instances
const horsesStore = useHorsesStore()
const raceStore = useRaceStore()
const resultsStore = useResultsStore()
const raceEngine = useRaceEngine()

// Track if app is initialized
const isInitialized = ref(false)

// Available speed multipliers
const speedOptions = [1, 2, 3, 4, 5]

// Current round results
const currentResult = computed(() => {
  if (!raceStore.currentRound) return null
  return resultsStore.getResultByRoundId(raceStore.currentRound.id)
})

// Event handlers
function handleGenerate() {
  console.log('Generate race clicked')
  raceEngine.initialize()
  isInitialized.value = true
}

function handleStart() {
  console.log('Start race clicked')
  raceEngine.startRace()
}

function handleNextRound() {
  console.log('Next round clicked')
  raceEngine.nextRound()
}

function handleReset() {
  console.log('Reset clicked')
  raceEngine.resetRace()
}

function handleRaceCompleted() {
  console.log('Race completed event received')
  console.log(
    'Before completeRound - isRoundCompleted:',
    raceStore.isRoundCompleted,
    'currentRoundIndex:',
    raceStore.currentRoundIndex,
  )
  raceStore.completeRound()
  console.log(
    'After completeRound - isRoundCompleted:',
    raceStore.isRoundCompleted,
    'currentRoundIndex:',
    raceStore.currentRoundIndex,
  )
}

function handleSpeedChange(multiplier: number) {
  console.log(`Setting speed multiplier to ${multiplier}x`)
  raceStore.setSpeedMultiplier(multiplier)
}

// Initialize on mount to have horses and schedule ready
onMounted(() => {
  console.log('HorseRaceGame component mounted')
  // Initialize on mount
  raceEngine.initialize()
  isInitialized.value = true
  console.log(
    'Game initialized with',
    horsesStore.horses.length,
    'horses and',
    raceStore.schedule.length,
    'rounds',
  )
})
</script>

<template>
  <div class="horse-race-game">
    <header class="game-header">
      <h1 class="game-title">Horse Racing Championship</h1>
    </header>

    <main class="game-content">
      <!-- Debug Panel -->
      <div class="debug-panel">
        <div class="debug-info">
          <p>currentRoundIndex: {{ raceStore.currentRoundIndex }}</p>
          <p>isRacing: {{ raceStore.isRacing }}</p>
          <p>isRoundCompleted: {{ raceStore.isRoundCompleted }}</p>
          <p>canStart: {{ raceStore.schedule.length > 0 && !raceStore.isRoundCompleted }}</p>
          <p>canNext: {{ raceStore.isRoundCompleted }}</p>
          <p>isLastRound: {{ raceStore.isLastRound }}</p>
        </div>

        <div class="debug-controls">
          <div class="speed-controls">
            <span class="speed-label">Animation Speed:</span>
            <div class="speed-buttons">
              <button
                v-for="speed in speedOptions"
                :key="speed"
                class="speed-button"
                :class="{ active: raceStore.speedMultiplier === speed }"
                @click="handleSpeedChange(speed)"
              >
                {{ speed }}x
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <GameControls
        :current-round-index="raceStore.currentRoundIndex"
        :is-racing="raceStore.isRacing"
        :can-start="raceStore.schedule.length > 0 && !raceStore.isRoundCompleted"
        :can-next="raceStore.isRoundCompleted"
        :is-last-round="raceStore.isLastRound"
        @generate="handleGenerate"
        @start="handleStart"
        @next-round="handleNextRound"
        @reset="handleReset"
      />

      <!-- Section: Horses List -->
      <section
        v-if="
          !raceStore.isRacing && horsesStore.horses.length > 0 && !raceStore.isAllRoundsCompleted
        "
        class="section"
      >
        <h2 class="section-title">Horses</h2>
        <div class="horses-container">
          <HorseCard v-for="horse in horsesStore.horses" :key="horse.id" :horse="horse" />
        </div>
      </section>

      <!-- Section: Race Track -->
      <section v-if="raceStore.isRacing || raceStore.isRoundCompleted" class="section">
        <RaceTrack
          :horses="raceStore.horsesInCurrentRound"
          :is-racing="raceStore.isRacing"
          :speed-multiplier="raceStore.speedMultiplier"
          @race-completed="handleRaceCompleted"
        />
      </section>

      <!-- Section: Current Round Results -->
      <section
        v-if="raceStore.isRoundCompleted && currentResult && !raceStore.isAllRoundsCompleted"
        class="section"
      >
        <ResultBoard :round-id="raceStore.currentRound?.id || 0" :results="currentResult.results" />
      </section>

      <!-- Section: Final Results (all rounds completed) -->
      <section v-if="raceStore.isAllRoundsCompleted" class="section">
        <FinalResultsBoard />
      </section>

      <!-- Game complete message -->
      <section v-if="raceStore.isAllRoundsCompleted" class="section game-complete">
        <h2>Championship Complete!</h2>
        <p>
          All rounds have been completed. You can see the final results above. Reset to start a new
          championship.
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.horse-race-game {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.debug-panel {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  font-family: monospace;
  font-size: 0.875rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}

.debug-info {
  flex: 1;
  min-width: 300px;
}

.debug-controls {
  flex: 1;
  min-width: 300px;
}

.debug-panel p {
  margin: 0.25rem 0;
}

.speed-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.speed-label {
  font-weight: bold;
  color: #4b5563;
}

.speed-buttons {
  display: flex;
  gap: 0.5rem;
}

.speed-button {
  background-color: #e5e7eb;
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.speed-button:hover {
  background-color: #d1d5db;
}

.speed-button.active {
  background-color: #3b82f6;
  color: white;
}

.game-header {
  margin-bottom: 2rem;
  text-align: center;
}

.game-title {
  font-size: 2rem;
  margin: 0;
  color: #1f2937;
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  margin: 0 0 1rem;
  color: #374151;
}

.horses-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.game-complete {
  text-align: center;
  padding: 2rem;
  background-color: #f0fdf4;
  border-radius: 0.5rem;
  border: 1px solid #86efac;
}

@media (max-width: 640px) {
  .horses-container {
    grid-template-columns: 1fr;
  }

  .debug-panel {
    flex-direction: column;
  }
}
</style>
