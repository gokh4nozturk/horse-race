<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { useResultsStore } from '@/stores/results'
import { useRaceEngine } from '@/composables/useRaceEngine'

import RaceTrack from '@/components/RaceTrack.vue'
import ResultBoard from '@/components/ResultBoard.vue'
import GameControls from '@/components/GameControls.vue'
import FinalResultsBoard from '@/components/FinalResultsBoard.vue'
import DebugPanel from '@/components/DebugPanel.vue'
import ModeToggle from '@/components/ModeToggle.vue'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Store instances
const horsesStore = useHorsesStore()
const raceStore = useRaceStore()
const resultsStore = useResultsStore()
const raceEngine = useRaceEngine()

// Track if app is initialized
const isInitialized = ref(false)


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

  // Make sure we have a valid schedule and current round
  if (raceStore.schedule.length === 0) {
    console.error('No race schedule available, generating one first')
    raceEngine.initialize()

    // Set currentRoundIndex to 0 after initialization if needed
    if (raceStore.currentRoundIndex === -1) {
      raceStore.currentRoundIndex = 0
    }
  } else if (raceStore.currentRoundIndex === -1) {
    // If we have a schedule but no current round, set to first round
    console.warn('No current round selected, starting with first round')
    raceStore.currentRoundIndex = 0
  }

  // Check if we now have a valid current round
  const currentRound = raceStore.currentRound
  if (currentRound) {
    console.log(`Starting round ${currentRound.id} with ${currentRound.distance}m distance`)
    raceStore.isRacing = true
  } else {
    console.error('Failed to set current round, cannot start race')
    return
  }

  console.log('Start button clicked, isRacing set to true - countdown should start now')
}

function handleCountdownComplete() {
  console.log('Countdown completed, now starting the actual race')

  if (!raceStore.isRacing) {
    console.log('isRacing is false, setting it to true')
    raceStore.isRacing = true
  }

  raceEngine.startRace()
  console.log('Race engine startRace called after countdown')
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



// Initialize on mount to have horses and schedule ready
onMounted(async () => {
  console.log('HorseRaceGame component mounted')

  // Initialize race engine and ensure schedule is generated
  raceEngine.initialize()

  // Ensure currentRoundIndex is set to 0 after initialization
  if (raceStore.schedule.length > 0 && raceStore.currentRoundIndex === -1) {
    console.log('Setting currentRoundIndex to 0 to prepare first round')
    raceStore.currentRoundIndex = 0
  }

  // Short delay to ensure store state is updated before continuing
  await new Promise(resolve => setTimeout(resolve, 10))

  const currentRoundId = raceStore.currentRound?.id || 'None'

  setTimeout(() => {
    isInitialized.value = true
    console.log(
      'Game fully initialized with',
      horsesStore.horses.length,
      'horses and',
      raceStore.schedule.length,
      'rounds',
      'Current round:',
      currentRoundId
    )
  }, 100)
})


</script>

<template>
  <div class=" p-4">
    <header class="mb-8 text-center flex flex-col gap-4">
      <h1 class="text-3xl font-bold">Horse Racing Championship</h1>

      <!-- Toolbar -->
      <div class="flex justify-between items-center">
        <!-- Controls -->
        <GameControls :current-round-index="raceStore.currentRoundIndex" :is-racing="raceStore.isRacing"
          :can-start="raceStore.schedule.length > 0 && !raceStore.isRoundCompleted"
          :can-next="raceStore.isRoundCompleted" :is-last-round="raceStore.isLastRound" @generate="handleGenerate"
          @start="handleStart" @next-round="handleNextRound" @reset="handleReset" />

        <div class="flex gap-2">
          <ModeToggle />

          <!-- Debug Panel -->
          <DebugPanel />
        </div>
      </div>
    </header>

    <main class="flex flex-col gap-6 relative">
      <!-- At kartları kaldırıldı -->

      <!-- Section: Race Track -->
      <section v-if="raceStore.schedule.length > 0" class="mb-6">
        <RaceTrack :horses="raceStore.horsesInCurrentRound" :is-racing="raceStore.isRacing"
          :speed-multiplier="Number(raceStore.speedMultiplier)" @race-completed="handleRaceCompleted"
          @countdown-complete="handleCountdownComplete" />
      </section>

      <!-- Section: Current Round Results -->
      <section v-if="raceStore.isRoundCompleted && currentResult && !raceStore.isAllRoundsCompleted" class="mb-6">
        <ResultBoard :round-id="raceStore.currentRound?.id || 0" :results="currentResult.results" />
      </section>

      <!-- Section: Final Results (all rounds completed) -->
      <section v-if="raceStore.isAllRoundsCompleted" class="mb-6">
        <FinalResultsBoard />
      </section>

      <!-- Game complete message -->
      <Card v-if="raceStore.isAllRoundsCompleted" class="border-green-200 bg-green-50">
        <CardHeader>
          <h2 class="text-2xl font-bold text-green-800">Championship Complete!</h2>
        </CardHeader>
        <CardContent>
          <p class="text-green-700">
            All rounds have been completed. You can see the final results above. Reset to start a
            new championship.
          </p>
        </CardContent>
      </Card>
    </main>
  </div>
</template>
