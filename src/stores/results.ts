import { defineStore } from 'pinia'

export interface HorseResult {
  horseId: number
  place: number
  time: number // in seconds
}

export interface RoundResult {
  roundId: number
  results: HorseResult[]
}

export const useResultsStore = defineStore('results', {
  state: () => ({
    results: [] as RoundResult[],
  }),

  getters: {
    getResultByRoundId: (state) => (roundId: number) => {
      return state.results.find((result) => result.roundId === roundId)
    },

    getLastResult: (state) => {
      if (state.results.length === 0) return null
      return state.results[state.results.length - 1]
    },

    // Get all round results sorted by round ID
    getAllResults: (state) => {
      return [...state.results].sort((a, b) => a.roundId - b.roundId)
    },
  },

  actions: {
    addResult(roundId: number, horseResults: HorseResult[]) {
      // Sort results by place
      const sortedResults = [...horseResults].sort((a, b) => a.place - b.place)

      // Check if we already have results for this round
      const existingIndex = this.results.findIndex((r) => r.roundId === roundId)

      if (existingIndex >= 0) {
        // Update existing results
        this.results[existingIndex] = { roundId, results: sortedResults }
      } else {
        // Add new results
        this.results.push({ roundId, results: sortedResults })
      }
    },

    clearResults() {
      this.results = []
    },
  },
})
