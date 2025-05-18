<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { useResultsStore } from '@/stores/results'
import { useRaceEngine } from '@/composables/useRaceEngine'

// At kartları artık kullanılmıyor
// import HorseCard from '@/components/HorseCard.vue'
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

const router = useRouter()
const route = useRoute()

const debugOpen = ref(false)

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
  // Only set the UI state to racing, actual race will start after countdown
  raceStore.isRacing = true

  // Debugging amaçlı log ekleyelim
  console.log('Start button clicked, isRacing set to true - countdown should start now')
}

function handleCountdownComplete() {
  console.log('Countdown completed, now starting the actual race')
  // Şimdi yarış motorunu başlatacağız
  if (!raceStore.isRacing) {
    // Eğer geri sayım bitti ama isRacing false ise, tekrar true yapalım
    console.log('isRacing is false, setting it to true')
    raceStore.isRacing = true
  }
  // Yarış mantığını başlat
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

function handleSpeedChange(multiplier: number) {
  console.log(`Setting speed multiplier to ${multiplier}x`)
  raceStore.setSpeedMultiplier(multiplier)
}

function handleDebug(open: boolean) {
  if (open) {
    router.replace('/debug')
  } else {
    router.replace('/')
  }
}

// Initialize on mount to have horses and schedule ready
onMounted(() => {
  console.log('HorseRaceGame component mounted')
  // Initialize on mount
  raceEngine.initialize()

  // Sayfanın yüklenmesi sırasında kısa bir gecikme ekleyerek, store'ların güncellenmesini sağlayalım
  setTimeout(() => {
    isInitialized.value = true
    console.log(
      'Game initialized with',
      horsesStore.horses.length,
      'horses and',
      raceStore.schedule.length,
      'rounds',
    )
  }, 100)
})

// Watch for route changes
watch(route.path, (newPath) => {
  debugOpen.value = newPath === '/debug'
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-4">
    <header class="mb-8 text-center flex flex-col gap-4">
      <h1 class="text-3xl font-bold">Horse Racing Championship</h1>

      <!-- Toolbar -->
      <div class="flex justify-between items-center">
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

        <div class="flex gap-2">
          <ModeToggle />

          <!-- Debug Panel -->
          <DebugPanel
            v-model:open="debugOpen"
            :speed-options="speedOptions"
            @speed-change="handleSpeedChange"
            @update:open="handleDebug"
          />
        </div>
      </div>
    </header>

    <main class="flex flex-col gap-6 relative">
      <!-- At kartları kaldırıldı -->

      <!-- Section: Race Track -->
      <section v-if="raceStore.schedule.length > 0" class="mb-6">
        <RaceTrack
          :horses="raceStore.horsesInCurrentRound"
          :is-racing="raceStore.isRacing"
          :speed-multiplier="raceStore.speedMultiplier"
          @race-completed="handleRaceCompleted"
          @countdown-complete="handleCountdownComplete"
        />
      </section>

      <!-- Section: Current Round Results -->
      <section
        v-if="raceStore.isRoundCompleted && currentResult && !raceStore.isAllRoundsCompleted"
        class="mb-6"
      >
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
