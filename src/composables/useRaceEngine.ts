import { ref } from 'vue'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { useResultsStore, type HorseResult } from '@/stores/results'

export function useRaceEngine() {
  const horsesStore = useHorsesStore()
  const raceStore = useRaceStore()
  const resultsStore = useResultsStore()

  const isSimulating = ref(false)

  // Calculate race duration based on horse condition and some randomness
  function calculateRaceTime(horseId: number, distance: number): number {
    const horse = horsesStore.getHorseById(horseId)
    if (!horse) return 999 // Fallback for invalid horse

    // Base speed depends on condition (1-100)
    // Higher condition = lower time (faster)
    const baseTimePerMeter = 0.05 - (horse.condition / 100) * 0.02

    // Add some randomness (±10%)
    const randomFactor = 0.9 + Math.random() * 0.2

    // Calculate total time for the distance
    return Number.parseFloat((baseTimePerMeter * distance * randomFactor).toFixed(2))
  }

  async function simulateRace() {
    if (!raceStore.currentRound || isSimulating.value) {
      console.log('Cannot simulate: no current round or already simulating')
      return
    }

    console.log(
      'Starting simulation for round',
      raceStore.currentRound.id,
      'isSimulating:',
      isSimulating.value,
      'isRoundCompleted:',
      raceStore.isRoundCompleted,
    )
    isSimulating.value = true
    // Set isRacing to true BEFORE simulating to ensure the UI updates
    raceStore.isRacing = true
    const { id: roundId, distance, horseIds } = raceStore.currentRound

    // Log current round data
    console.log('Round data:', { roundId, distance, horseIds })

    // Calculate finish times for all horses
    const results: HorseResult[] = horseIds.map((horseId) => {
      const time = calculateRaceTime(horseId, distance)
      console.log(`Horse #${horseId} calculated time: ${time}s`)
      return {
        horseId,
        place: 0, // Will be determined after sorting
        time: time,
      }
    })

    // Sort by time (fastest first) and assign places
    results
      .sort((a, b) => a.time - b.time)
      .forEach((result, index) => {
        result.place = index + 1
      })

    // Simulate race animation time (use the slowest horse's time + 1s for UI)
    const slowestTime = Math.max(...results.map((r) => r.time))
    console.log('Slowest time:', slowestTime, 'seconds')

    // Store results immediately but keep the "simulating" state until animation completes
    console.log('Storing results for round', roundId)
    resultsStore.addResult(roundId, results)

    // Wait for animation to finish
    console.log('Waiting for animation to complete... (will wait', slowestTime * 1000 + 200, 'ms)')
    await new Promise((resolve) => setTimeout(resolve, slowestTime * 1000 + 200))

    console.log('Simulation complete, setting isSimulating to false')
    isSimulating.value = false
    console.log('isSimulating is now:', isSimulating.value)

    // We don't automatically complete the round here anymore
    // The RaceTrack component will emit an event that triggers completeRound
    // This creates better coordination between the visual animation and state changes
  }

  // Start race process
  async function startRace() {
    if (isSimulating.value) {
      console.log('Cannot start: race already in progress')
      return
    }

    console.log('Starting race...')
    raceStore.startRace() // This sets isRacing to true in raceStore
    await simulateRace()
  }

  // Continue to next round
  async function nextRound() {
    console.log(
      'RaceEngine.nextRound - isSimulating:',
      isSimulating.value,
      'isLastRound:',
      raceStore.isLastRound,
      'currentRoundIndex:',
      raceStore.currentRoundIndex,
    )

    if (isSimulating.value) {
      console.log('Cannot proceed: race in progress')
      return
    }

    if (raceStore.isLastRound) {
      console.log('Cannot proceed: already at last round')
      return
    }

    console.log('Moving to next round')
    raceStore.nextRound()
    console.log(
      'After raceStore.nextRound - currentRoundIndex:',
      raceStore.currentRoundIndex,
      'currentRound:',
      raceStore.currentRound,
    )

    // We DON'T set isRacing here because simulateRace will do it
    // This ensures proper UI state synchronization
    await simulateRace()
  }

  // Reset and prepare a new race
  function resetRace() {
    if (isSimulating.value) {
      console.log('Cannot reset: race in progress')
      return
    }

    console.log('Resetting race')
    resultsStore.clearResults()
    raceStore.resetRace()
  }

  // Initialize everything
  function initialize() {
    console.log('Initializing race engine')
    horsesStore.generateHorses()
    raceStore.generateSchedule()
    resultsStore.clearResults()
    console.log('Initialization complete')
  }

  return {
    isSimulating,
    startRace,
    nextRound,
    resetRace,
    initialize,
    calculateRaceTime,
  }
}
