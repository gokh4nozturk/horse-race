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
import Progress from '@/components/ui/progress/Progress.vue'
import { CircleCheck, SlidersVertical } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'

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
  await new Promise((resolve) => setTimeout(resolve, 10))

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
      currentRoundId,
    )
  }, 100)
})
</script>

<template>
  <div class="min-h-screen bg-background bg-cover bg-center bg-blend-overlay text-foreground" style="
      background-image:
        url('/bg-texture.png'),
        radial-gradient(circle at top right, rgb(var(--primary) / 0.1), transparent 60%),
        radial-gradient(circle at left, rgb(var(--accent) / 0.05), transparent 40%),
        linear-gradient(to bottom, var(--background), var(--card), var(--muted));
    ">
    <!-- Top Navigation Bar -->
    <header
      class="bg-card border-border border-b px-6 py-3 flex justify-between items-center shadow-lg backdrop-blur-sm">
      <div class="flex items-center gap-3">
        <img src="" alt="Championship Logo" class="w-10 h-10" onerror="this.src='https://placehold.co/40x40?text=🏇'" />
        <h1 class="text-3xl font-bold tracking-wide text-foreground">
          Horse Racing Championship
        </h1>
      </div>

      <div class="flex gap-3">
        <ModeToggle />
        <DebugPanel />
      </div>
    </header>

    <main class="container mx-auto grid grid-cols-12 gap-5 p-4">
      <!-- Main Race Area - Takes most of the screen -->
      <section v-if="raceStore.schedule.length > 0"
        class="col-span-12 lg:col-span-9 mb-4 rounded-xl border border-border bg-card backdrop-blur-sm overflow-hidden shadow-xl relative">
        <div class="p-2 border-b border-border bg-card flex justify-between items-center">
          <h2 class="text-xl font-bold text-foreground">
            <span v-if="raceStore.currentRound">
              Round {{ raceStore.currentRound.id }} - {{ raceStore.currentRound.distance }}m
            </span>
            <span v-else>Race Track</span>
          </h2>
          <div class="flex items-center gap-2">
            <Badge v-if="raceStore.isRacing" variant="destructive" class="animate-pulse uppercase">
              Live
            </Badge>
            <Badge v-else-if="raceStore.isRoundCompleted" class="uppercase">
              Completed
            </Badge>
            <Badge v-else variant="secondary" class="uppercase">Ready</Badge>
          </div>
        </div>
        <RaceTrack :horses="raceStore.horsesInCurrentRound" :is-racing="raceStore.isRacing"
          :speed-multiplier="Number(raceStore.speedMultiplier)" @race-completed="handleRaceCompleted"
          @countdown-complete="handleCountdownComplete" />
      </section>

      <!-- Sidebar with Controls and Results -->
      <aside class="col-span-12 lg:col-span-3 flex flex-col gap-4">
        <!-- Game Controls Panel -->
        <div class="bg-card backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg relative overflow-hidden">
          <h3 class="text-lg font-bold mb-3 flex items-center text-foreground">
            <SlidersVertical class="h-5 w-5 mr-2" />
            Race Controls
          </h3>
          <GameControls :current-round-index="raceStore.currentRoundIndex" :is-racing="raceStore.isRacing"
            :can-start="raceStore.schedule.length > 0 && !raceStore.isRoundCompleted"
            :can-next="raceStore.isRoundCompleted" :is-last-round="raceStore.isLastRound" @generate="handleGenerate"
            @start="handleStart" @next-round="handleNextRound" @reset="handleReset" />
        </div>

        <!-- Championship Progress -->
        <div v-if="raceStore.schedule.length > 0"
          class="bg-card backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg relative overflow-hidden">
          <h3 class="text-lg font-bold mb-3 flex items-center text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Championship Progress
          </h3>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-muted-foreground">Progress:</span>
            <span class="text-xs font-bold text-foreground">
              Round {{ raceStore.currentRoundIndex + 1 }} of {{ raceStore.schedule.length }}
            </span>
          </div>
          <Progress :model-value="((raceStore.currentRoundIndex + 1) / raceStore.schedule.length) * 100" />
        </div>
      </aside>

      <!-- Results Section (Current Round) -->
      <section v-if="raceStore.isRoundCompleted && currentResult && !raceStore.isAllRoundsCompleted"
        class="col-span-12 lg:col-span-9 bg-card backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg relative overflow-hidden">
        <h3 class="text-lg font-bold mb-3 flex items-center text-foreground">
          <CircleCheck class="h-5 w-5 mr-2 text-primary" />
          Round {{ raceStore.currentRound?.id }} Results
        </h3>
        <ResultBoard :round-id="raceStore.currentRound?.id || 0" :results="currentResult.results" />
      </section>

      <!-- Final Results (all rounds completed) -->
      <section v-if="raceStore.isAllRoundsCompleted"
        class="col-span-12 bg-card backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg relative overflow-hidden">
        <h3 class="text-lg font-bold mb-3 flex items-center text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Championship Final Results
        </h3>
        <FinalResultsBoard />
      </section>

      <!-- Championship Complete Message -->
      <div v-if="raceStore.isAllRoundsCompleted"
        class="col-span-12 bg-gradient-to-r from-primary via-accent to-destructive rounded-lg p-6 text-center shadow-2xl">
        <h2 class="text-2xl font-bold text-white mb-2 drop-shadow-md">
          🏆 Championship Complete! 🏆
        </h2>
        <p class="text-white text-opacity-90">
          Congratulations on completing the championship! View the final standings above.
        </p>
        <button @click="handleReset"
          class="relative overflow-hidden mt-4 px-6 py-2 rounded-full font-bold text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-500 shadow-md border border-white/30 bg-white/95 hover:bg-white">
          Start New Championship
        </button>
      </div>
    </main>

    <!-- No races message -->
    <div v-if="isInitialized && raceStore.schedule.length === 0"
      class="container mx-auto p-8 mt-10 bg-card backdrop-blur-sm border border-border rounded-lg text-center shadow-2xl">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-primary mb-4 drop-shadow-md" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h2 class="text-2xl font-bold mb-3 text-foreground">
        No Races Generated
      </h2>
      <p class="text-muted-foreground mb-4">Generate a new race championship to begin!</p>
      <button @click="handleGenerate"
        class="relative overflow-hidden bg-primary px-6 py-3 text-white rounded-full font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2">
        Generate New Championship
      </button>
    </div>
  </div>
</template>
