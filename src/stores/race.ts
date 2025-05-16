import { defineStore } from 'pinia'
import { useHorsesStore, type Horse } from './horses'

export interface RaceRound {
  id: number
  distance: number // in meters
  horseIds: number[] // 10 horses per round
}

export const useRaceStore = defineStore('race', {
  state: () => ({
    schedule: [] as RaceRound[],
    currentRoundIndex: -1, // -1 means not started
    isRacing: false,
    isRoundCompleted: false,
  }),

  getters: {
    currentRound: (state) => {
      if (state.currentRoundIndex < 0 || state.currentRoundIndex >= state.schedule.length) {
        return null
      }
      return state.schedule[state.currentRoundIndex]
    },

    isLastRound: (state) => {
      return state.currentRoundIndex === state.schedule.length - 1
    },

    horsesInCurrentRound: (state) => {
      const horsesStore = useHorsesStore()
      if (!state.schedule[state.currentRoundIndex]) return []

      return state.schedule[state.currentRoundIndex].horseIds
        .map((id) => horsesStore.getHorseById(id))
        .filter((horse) => horse !== undefined) as Horse[]
    },

    isAllRoundsCompleted: (state) => {
      return state.currentRoundIndex >= state.schedule.length - 1 && state.isRoundCompleted
    },
  },

  actions: {
    generateSchedule() {
      const horsesStore = useHorsesStore()

      // Generate 6 rounds with random distances and 10 random horses each
      const rounds = Array.from({ length: 6 }, (_, index) => {
        const roundId = index + 1

        // Get 10 random horses
        const horseIds = [...horsesStore.horses]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10)
          .map((horse) => horse.id)

        // Generate a distance between 1000-2000 meters
        const distance = 1000 + Math.floor(Math.random() * 11) * 100

        return {
          id: roundId,
          distance,
          horseIds,
        }
      })

      this.schedule = rounds
      this.currentRoundIndex = -1
      this.isRacing = false
      this.isRoundCompleted = false
    },

    startRace() {
      if (this.currentRoundIndex < 0) {
        this.currentRoundIndex = 0
      }
      this.isRacing = true
      this.isRoundCompleted = false
    },

    completeRound() {
      this.isRacing = false
      this.isRoundCompleted = true
    },

    nextRound() {
      console.log(
        'RaceStore.nextRound - current index:',
        this.currentRoundIndex,
        'max:',
        this.schedule.length - 1,
      )
      if (this.currentRoundIndex < this.schedule.length - 1) {
        this.currentRoundIndex++
        this.isRoundCompleted = false
        console.log('RaceStore.nextRound - advanced to:', this.currentRoundIndex)
      } else {
        console.log('RaceStore.nextRound - already at last round, not advancing')
      }
    },

    resetRace() {
      this.currentRoundIndex = -1
      this.isRacing = false
      this.isRoundCompleted = false
    },
  },
})
