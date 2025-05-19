import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRaceStore } from '../race'

// Mock the horses store since we'll need it for race functionality
vi.mock('../horses', () => {
  return {
    useHorsesStore: vi.fn(() => ({
      horses: Array.from({ length: 20 }, (_, index) => ({
        id: index + 1,
        name: `Horse ${index + 1}`,
        color: `hsl(${index * 18}, 85%, 60%)`,
        condition: Math.floor(Math.random() * 100) + 1,
      })),
      getHorseById: (id: number) => {
        const horses = Array.from({ length: 20 }, (_, index) => ({
          id: index + 1,
          name: `Horse ${index + 1}`,
          color: `hsl(${index * 18}, 85%, 60%)`,
          condition: Math.floor(Math.random() * 100) + 1,
        }))
        return horses.find((horse) => horse.id === id)
      },
    })),
  }
})

describe('Race Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
  })

  it('should have the correct initial state', () => {
    const store = useRaceStore()
    expect(store.schedule).toEqual([])
    expect(store.currentRoundIndex).toBe(-1)
    expect(store.isRacing).toBe(false)
    expect(store.isRoundCompleted).toBe(false)
    expect(store.speedMultiplier).toBe(1)
  })

  describe('generateSchedule', () => {
    it('should generate 6 rounds with the correct distances', () => {
      const store = useRaceStore()
      store.generateSchedule()

      expect(store.schedule.length).toBe(6)

      // Check distances match the requirement
      expect(store.schedule[0].distance).toBe(1200)
      expect(store.schedule[1].distance).toBe(1400)
      expect(store.schedule[2].distance).toBe(1600)
      expect(store.schedule[3].distance).toBe(1800)
      expect(store.schedule[4].distance).toBe(2000)
      expect(store.schedule[5].distance).toBe(2200)
    })

    it('should include 10 horses in each round', () => {
      const store = useRaceStore()
      store.generateSchedule()

      store.schedule.forEach((round) => {
        expect(round.horseIds.length).toBe(10)
      })
    })

    it('should reset race state when generating schedule', () => {
      const store = useRaceStore()

      // Set some active race state
      store.currentRoundIndex = 2
      store.isRacing = true
      store.isRoundCompleted = true

      // Generate new schedule should reset all these
      store.generateSchedule()

      expect(store.currentRoundIndex).toBe(-1)
      expect(store.isRacing).toBe(false)
      expect(store.isRoundCompleted).toBe(false)
    })
  })

  describe('race control actions', () => {
    beforeEach(() => {
      const store = useRaceStore()
      store.generateSchedule()
    })

    it('startRace should set the correct state', () => {
      const store = useRaceStore()
      store.startRace()

      expect(store.currentRoundIndex).toBe(0)
      expect(store.isRacing).toBe(true)
      expect(store.isRoundCompleted).toBe(false)
    })

    it('startRace should not change round if already racing', () => {
      const store = useRaceStore()
      store.currentRoundIndex = 2
      store.startRace()

      expect(store.currentRoundIndex).toBe(2)
      expect(store.isRacing).toBe(true)
    })

    it('completeRound should set the correct state', () => {
      const store = useRaceStore()
      store.startRace()
      store.completeRound()

      expect(store.isRacing).toBe(false)
      expect(store.isRoundCompleted).toBe(true)
    })

    it('nextRound should advance to the next round', () => {
      const store = useRaceStore()
      store.startRace() // Start at round 0
      store.completeRound()
      store.nextRound()

      expect(store.currentRoundIndex).toBe(1)
      expect(store.isRoundCompleted).toBe(false)
    })

    it('nextRound should not advance beyond the last round', () => {
      const store = useRaceStore()

      // Set to last round
      store.currentRoundIndex = store.schedule.length - 1
      store.nextRound()

      expect(store.currentRoundIndex).toBe(store.schedule.length - 1)
    })

    it('resetRace should reset race state', () => {
      const store = useRaceStore()

      store.startRace()
      store.completeRound()
      store.resetRace()

      expect(store.currentRoundIndex).toBe(-1)
      expect(store.isRacing).toBe(false)
      expect(store.isRoundCompleted).toBe(false)
    })

    it('setSpeedMultiplier should update the speed multiplier', () => {
      const store = useRaceStore()

      store.setSpeedMultiplier(2)
      expect(store.speedMultiplier).toBe(2)

      store.setSpeedMultiplier(4)
      expect(store.speedMultiplier).toBe(4)
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      const store = useRaceStore()
      store.generateSchedule()
    })

    it('currentRound should return the active round', () => {
      const store = useRaceStore()
      store.currentRoundIndex = 2

      const round = store.currentRound
      expect(round).toEqual(store.schedule[2])
    })

    it('currentRound should return null if no active round', () => {
      const store = useRaceStore()
      store.currentRoundIndex = -1

      expect(store.currentRound).toBeNull()
    })

    it('isLastRound should return true for the last round', () => {
      const store = useRaceStore()
      store.currentRoundIndex = store.schedule.length - 1

      expect(store.isLastRound).toBe(true)
    })

    it('isLastRound should return false if not on the last round', () => {
      const store = useRaceStore()
      store.currentRoundIndex = 0

      expect(store.isLastRound).toBe(false)
    })

    it('horsesInCurrentRound should return horses for the current round', () => {
      const store = useRaceStore()
      store.currentRoundIndex = 0

      const horses = store.horsesInCurrentRound
      expect(horses.length).toBe(10)

      // Check if they're valid horse objects
      horses.forEach((horse) => {
        expect(horse).toHaveProperty('id')
        expect(horse).toHaveProperty('name')
        expect(horse).toHaveProperty('color')
        expect(horse).toHaveProperty('condition')
      })
    })

    it('isAllRoundsCompleted should be true when last round is completed', () => {
      const store = useRaceStore()
      store.currentRoundIndex = store.schedule.length - 1
      store.isRoundCompleted = true

      expect(store.isAllRoundsCompleted).toBe(true)
    })

    it('isAllRoundsCompleted should be false if not on last round', () => {
      const store = useRaceStore()
      store.currentRoundIndex = 2
      store.isRoundCompleted = true

      expect(store.isAllRoundsCompleted).toBe(false)
    })
  })
})
