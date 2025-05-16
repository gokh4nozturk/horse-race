import { defineStore } from 'pinia'

export interface Horse {
  id: number
  name: string
  color: string
  condition: number // 0-100
}

export const useHorsesStore = defineStore('horses', {
  state: () => ({
    horses: [] as Horse[],
  }),
  getters: {
    getHorseById: (state) => (id: number) => {
      return state.horses.find((horse) => horse.id === id)
    },
  },
  actions: {
    generateHorses() {
      // Generate 20 horses with unique colors and condition scores
      const horses = Array.from({ length: 20 }, (_, index) => {
        return {
          id: index + 1,
          name: generateHorseName(index),
          color: generateUniqueColor(index),
          condition: Math.floor(Math.random() * 31) + 70, // 70-100 condition score
        }
      })

      this.horses = horses
    },
  },
})

// Helper functions
function generateHorseName(index: number): string {
  const names = [
    'Thunder',
    'Bolt',
    'Shadow',
    'Spirit',
    'Storm',
    'Lightning',
    'Blaze',
    'Arrow',
    'Phoenix',
    'Comet',
    'Sierra',
    'Luna',
    'Orion',
    'Titan',
    'Neptune',
    'Apollo',
    'Atlas',
    'Zeus',
    'Hercules',
    'Pegasus',
  ]

  return names[index % names.length]
}

function generateUniqueColor(index: number): string {
  // Generate HSL colors with good separation for visual distinction
  const hue = (index * 18) % 360 // Spread hues around the color wheel
  return `hsl(${hue}, 85%, 60%)`
}
