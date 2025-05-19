import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResultsStore, type HorseResult } from '../results'

describe('Results Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
  })

  it('should start with empty results array', () => {
    const store = useResultsStore()
    expect(store.results).toEqual([])
  })

  describe('addResult', () => {
    it('should add a new round result correctly', () => {
      const store = useResultsStore()

      const roundId = 1
      const horseResults: HorseResult[] = [
        { horseId: 1, place: 1, time: 70.5 },
        { horseId: 2, place: 2, time: 72.1 },
        { horseId: 3, place: 3, time: 74.3 },
      ]

      store.addResult(roundId, horseResults)

      expect(store.results.length).toBe(1)
      expect(store.results[0].roundId).toBe(roundId)
      expect(store.results[0].results).toHaveLength(3)
    })

    it('should sort results by place when adding', () => {
      const store = useResultsStore()

      const roundId = 1
      const horseResults: HorseResult[] = [
        { horseId: 3, place: 3, time: 74.3 },
        { horseId: 1, place: 1, time: 70.5 },
        { horseId: 2, place: 2, time: 72.1 },
      ]

      store.addResult(roundId, horseResults)

      expect(store.results[0].results[0].place).toBe(1)
      expect(store.results[0].results[1].place).toBe(2)
      expect(store.results[0].results[2].place).toBe(3)
    })

    it('should update existing round results', () => {
      const store = useResultsStore()

      // Add initial results
      store.addResult(1, [
        { horseId: 1, place: 1, time: 70.5 },
        { horseId: 2, place: 2, time: 72.1 },
      ])

      // Update with new results for same round
      const updatedResults: HorseResult[] = [
        { horseId: 3, place: 1, time: 69.8 },
        { horseId: 1, place: 2, time: 70.5 },
        { horseId: 2, place: 3, time: 72.1 },
      ]

      store.addResult(1, updatedResults)

      expect(store.results.length).toBe(1) // Still just one round
      expect(store.results[0].results).toHaveLength(3) // But now 3 horses
      expect(store.results[0].results[0].horseId).toBe(3) // New winner
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      const store = useResultsStore()

      // Add results for three rounds
      store.addResult(1, [
        { horseId: 1, place: 1, time: 70.5 },
        { horseId: 2, place: 2, time: 72.1 },
      ])

      store.addResult(2, [
        { horseId: 3, place: 1, time: 68.2 },
        { horseId: 1, place: 2, time: 69.0 },
      ])

      store.addResult(3, [
        { horseId: 2, place: 1, time: 65.7 },
        { horseId: 3, place: 2, time: 66.3 },
      ])
    })

    it('getResultByRoundId should return correct round result', () => {
      const store = useResultsStore()

      const round2Results = store.getResultByRoundId(2)

      expect(round2Results).toBeDefined()
      expect(round2Results?.roundId).toBe(2)
      expect(round2Results?.results[0].horseId).toBe(3)
    })

    it('getResultByRoundId should return undefined for non-existent round', () => {
      const store = useResultsStore()

      const nonExistentRound = store.getResultByRoundId(999)

      expect(nonExistentRound).toBeUndefined()
    })

    it('getLastResult should return the most recent result', () => {
      const store = useResultsStore()

      const lastResult = store.getLastResult

      expect(lastResult).not.toBeNull()
      expect(lastResult?.roundId).toBe(3)
    })

    it('getLastResult should return null if no results exist', () => {
      const store = useResultsStore()
      store.clearResults()

      const lastResult = store.getLastResult

      expect(lastResult).toBeNull()
    })

    it('getAllResults should return all results sorted by round ID', () => {
      const store = useResultsStore()

      const allResults = store.getAllResults

      expect(allResults).toHaveLength(3)
      expect(allResults[0].roundId).toBe(1)
      expect(allResults[1].roundId).toBe(2)
      expect(allResults[2].roundId).toBe(3)
    })
  })

  describe('clearResults', () => {
    it('should remove all results', () => {
      const store = useResultsStore()

      // Add some results
      store.addResult(1, [
        { horseId: 1, place: 1, time: 70.5 },
        { horseId: 2, place: 2, time: 72.1 },
      ])

      expect(store.results.length).toBe(1)

      // Clear results
      store.clearResults()

      expect(store.results).toEqual([])
    })
  })
})
