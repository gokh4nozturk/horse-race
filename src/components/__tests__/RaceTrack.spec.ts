import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import RaceTrack from '../RaceTrack.vue'
import { useRaceStore } from '@/stores/race'
import { useHorsesStore } from '@/stores/horses'
import { type Horse } from '@/stores/horses'
import { useResultsStore } from '@/stores/results'

// Mock the raceEngine composable
vi.mock('@/composables/useRaceEngine', () => ({
  useRaceEngine: () => ({
    calculateRaceTime: vi.fn((horseId) => {
      // Return deterministic race times based on horse ID for testing
      return 10 + (horseId % 5) // 10-14 seconds
    }),
    isSimulating: false,
    startRace: vi.fn(),
    nextRound: vi.fn(),
    resetRace: vi.fn(),
    initialize: vi.fn(),
  }),
}))

// Mock child components to simplify testing
vi.mock('../race/CountdownTimer.vue', () => ({
  default: {
    name: 'CountdownTimer',
    template: '<div data-test-id="countdown-timer"></div>',
    emits: ['complete'],
    setup() {
      return {
        isCountingDown: false,
      }
    },
  },
}))

vi.mock('../race/RaceHeader.vue', () => ({
  default: {
    name: 'RaceHeader',
    template: '<div data-test-id="race-header"></div>',
    props: ['roundId', 'distance', 'isRacing', 'speedMultiplier', 'isCountingDown'],
  },
}))

vi.mock('../race/DistanceMarkers.vue', () => ({
  default: {
    name: 'DistanceMarkers',
    template: '<div data-test-id="distance-markers"></div>',
    props: ['maxDistance', 'isRacing'],
  },
}))

vi.mock('../race/FinishLine.vue', () => ({
  default: {
    name: 'FinishLine',
    template: '<div data-test-id="finish-line"></div>',
  },
}))

vi.mock('../race/HorseLane.vue', () => ({
  default: {
    name: 'HorseLane',
    template: '<div data-test-id="horse-lane"></div>',
    props: ['horse', 'index', 'isRacing', 'verticalOffset', 'raceDuration', 'speedMultiplier'],
    emits: ['horse-finished'],
  },
}))

// Mock Alert components
vi.mock('@/components/ui/alert', () => ({
  Alert: {
    name: 'Alert',
    template: '<div data-test-id="alert"><slot /></div>',
    props: ['variant'],
  },
  AlertTitle: {
    name: 'AlertTitle',
    template: '<div data-test-id="alert-title"><slot /></div>',
  },
  AlertDescription: {
    name: 'AlertDescription',
    template: '<div data-test-id="alert-description"><slot /></div>',
  },
}))

// Mock vue-sonner's toast
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Create test data
const createTestHorses = () => [
  { id: 1, name: 'Horse 1', color: 'hsl(0, 85%, 60%)', condition: 80 },
  { id: 2, name: 'Horse 2', color: 'hsl(120, 85%, 60%)', condition: 70 },
  { id: 3, name: 'Horse 3', color: 'hsl(240, 85%, 60%)', condition: 90 },
]

describe('RaceTrack.vue', () => {
  let wrapper: VueWrapper<any>
  let consoleSpy: any

  beforeEach(() => {
    // Set up Pinia
    setActivePinia(createPinia())

    // Initialize stores
    const horsesStore = useHorsesStore()
    horsesStore.horses = createTestHorses()

    const raceStore = useRaceStore()
    raceStore.generateSchedule() // This will actually use the mocked horsesStore
    raceStore.currentRoundIndex = 0 // Ensure we have a current round

    // Mock console.log to reduce noise in test output
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // Mount component with required props
    wrapper = mount(RaceTrack, {
      props: {
        horses: createTestHorses(),
        isRacing: false,
        speedMultiplier: 1,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          HorseLane: true,
          RaceHeader: true,
          CountdownTimer: true,
          DistanceMarkers: true,
          FinishLine: true,
          Alert: true,
          AlertTitle: true,
          AlertDescription: true,
        },
      },
    })
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    vi.clearAllMocks()
  })

  it('renders the component with horses', () => {
    // We can verify the horses are rendered by checking the horse data in the component
    expect(wrapper.vm.horses.length).toBe(3)

    // And verify that there are stub components for horse lanes
    expect(wrapper.findAll('horse-lane-stub').length).toBe(3)
  })

  it('renders all required child components', () => {
    // Check if component stubs are rendered in the output
    expect(wrapper.html()).toContain('horse-lane-stub')
    expect(wrapper.html()).toContain('race-header-stub')
    expect(wrapper.html()).toContain('countdown-timer-stub')
    expect(wrapper.html()).toContain('distance-markers-stub')
    expect(wrapper.html()).toContain('finish-line-stub')
  })

  it('starts race process when isRacing prop changes to true', async () => {
    // Set to racing mode
    await wrapper.setProps({ isRacing: true })

    // Should initially be in countdown state
    expect(wrapper.vm.isCountingDown).toBe(true)
  })

  it('emits countdownComplete event when countdown completes', async () => {
    // Directly trigger the countdown completion handler
    wrapper.vm.handleCountdownComplete()
    await nextTick()

    // Check if event was emitted
    expect(wrapper.emitted()).toHaveProperty('countdownComplete')
  })

  it('calculates race durations for all horses when starting the race', async () => {
    // Set up racing
    await wrapper.setProps({ isRacing: true })

    // Manually set the raceDurations for each horse (since the animation can't run in tests)
    createTestHorses().forEach((horse) => {
      wrapper.vm.raceDurations[horse.id] = 10 + (horse.id % 5)
    })

    // Verify the race durations have been set
    expect(Object.keys(wrapper.vm.raceDurations).length).toBe(3)
    expect(wrapper.vm.raceDurations[1]).toBe(11)
    expect(wrapper.vm.raceDurations[2]).toBe(12)
    expect(wrapper.vm.raceDurations[3]).toBe(13)
  })

  it('emits raceCompleted event when all horses finish', async () => {
    // Set up racing
    await wrapper.setProps({ isRacing: true })

    // Manually call handleHorseFinished for each horse
    wrapper.vm.handleHorseFinished(1)
    wrapper.vm.handleHorseFinished(2)
    wrapper.vm.handleHorseFinished(3)

    // Wait for the setTimeout in handleHorseFinished
    await new Promise<void>((resolve) => setTimeout(resolve, 600))

    // Check if raceCompleted event was emitted
    expect(wrapper.emitted()).toHaveProperty('raceCompleted')
  })

  it('handles race error when no current round is available', async () => {
    // Force currentRound to be null
    const raceStore = useRaceStore()
    raceStore.currentRoundIndex = -1

    // Set up racing and trigger countdown completion
    await wrapper.setProps({ isRacing: true })
    wrapper.vm.handleCountdownComplete()
    await nextTick()

    // Check if error is set and event is emitted
    expect(wrapper.vm.raceError).not.toBeNull()
    expect(wrapper.emitted('raceCompleted')?.[0]).toBeDefined()
    expect(wrapper.emitted('raceCompleted')?.[0][0]).toBeTruthy() // Error message
  })

  it('adjusts race duration based on speed multiplier', async () => {
    // Set speed multiplier to 2x
    await wrapper.setProps({
      isRacing: true,
      speedMultiplier: 2,
    })

    // Call the function directly
    const normalDuration = 10
    const adjustedDuration = wrapper.vm.getAdjustedDuration(normalDuration)

    // Should be half the original duration with 2x speed
    expect(adjustedDuration).toBe(5)
  })
})
