import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHorsesStore } from '../horses'

describe('Horses Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
  })

  it('should start with empty horses array', () => {
    const store = useHorsesStore()
    expect(store.horses).toEqual([])
  })

  describe('generateHorses', () => {
    it('should generate 20 horses', () => {
      const store = useHorsesStore()
      store.generateHorses()
      expect(store.horses.length).toBe(20)
    })

    it('should generate horses with valid properties', () => {
      const store = useHorsesStore()
      store.generateHorses()

      // Check first horse for correct structure
      const firstHorse = store.horses[0]
      expect(firstHorse).toHaveProperty('id')
      expect(firstHorse).toHaveProperty('name')
      expect(firstHorse).toHaveProperty('color')
      expect(firstHorse).toHaveProperty('condition')

      // Validate all horses
      store.horses.forEach((horse) => {
        expect(typeof horse.id).toBe('number')
        expect(horse.id).toBeGreaterThan(0)

        expect(typeof horse.name).toBe('string')
        expect(horse.name.length).toBeGreaterThan(0)

        expect(typeof horse.color).toBe('string')
        expect(horse.color).toMatch(/^hsl\(\d+, 85%, 60%\)$/)

        expect(typeof horse.condition).toBe('number')
        expect(horse.condition).toBeGreaterThanOrEqual(1)
        expect(horse.condition).toBeLessThanOrEqual(100)
      })
    })

    it('should generate horses with unique IDs', () => {
      const store = useHorsesStore()
      store.generateHorses()

      const ids = store.horses.map((horse) => horse.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(store.horses.length)
    })
  })

  describe('getters', () => {
    it('getHorseById should return correct horse', () => {
      const store = useHorsesStore()
      store.generateHorses()

      const testHorse = store.horses[3]
      const foundHorse = store.getHorseById(testHorse.id)

      expect(foundHorse).toEqual(testHorse)
    })

    it('getHorseById should return undefined for non-existent ID', () => {
      const store = useHorsesStore()
      store.generateHorses()

      const nonExistentId = 999
      const foundHorse = store.getHorseById(nonExistentId)

      expect(foundHorse).toBeUndefined()
    })
  })
})
