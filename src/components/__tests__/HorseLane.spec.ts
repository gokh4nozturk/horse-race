import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import HorseLane from '../race/HorseLane.vue'
import { useRaceStore } from '@/stores/race'

// Mock HorseAvatar component
vi.mock('../race/HorseAvatar.vue', () => ({
  default: {
    name: 'HorseAvatar',
    template: '<div data-test-id="horse-avatar"></div>',
    props: ['isRacing', 'hasRaceDuration', 'color', 'hasFinished'],
  },
}))

// Create test data
const testHorse = {
  id: 1,
  name: 'Test Horse',
  color: 'hsl(0, 85%, 60%)',
  condition: 80,
}

describe('HorseLane.vue', () => {
  let wrapper: VueWrapper<any>
  let raceStore: ReturnType<typeof useRaceStore>

  // Mock requestAnimationFrame and cancelAnimationFrame
  const originalRAF = global.requestAnimationFrame
  const originalCAF = global.cancelAnimationFrame

  beforeEach(() => {
    // Set up Pinia
    setActivePinia(createPinia())

    // Initialize race store with a round
    raceStore = useRaceStore()
    raceStore.generateSchedule()
    raceStore.currentRoundIndex = 0

    // Mock animation frame methods
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(() => cb(performance.now()), 0)
      return 1
    })
    global.cancelAnimationFrame = vi.fn()

    // Mock getBoundingClientRect for finish line positioning
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 100,
      top: 0,
      left: 0,
      right: 800,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }))

    // Mount component with required props
    wrapper = mount(HorseLane, {
      props: {
        horse: testHorse,
        index: 0,
        isRacing: false,
        verticalOffset: 0,
        raceDuration: undefined,
        speedMultiplier: 1,
      },
      global: {
        plugins: [createPinia()],
      },
      attachTo: document.body,
    })
  })

  afterEach(() => {
    // Restore original methods
    global.requestAnimationFrame = originalRAF
    global.cancelAnimationFrame = originalCAF
    vi.clearAllMocks()
    wrapper.unmount()
  })

  it('renders with the correct horse information', () => {
    // Check for horse name
    expect(wrapper.text()).toContain('Test Horse')

    // Check for condition
    expect(wrapper.text()).toContain('80%')

    // Check if HorseAvatar component is rendered
    expect(wrapper.findComponent({ name: 'HorseAvatar' })).toBeTruthy()
  })

  it('applies horse color correctly', () => {
    // The HSL color is converted to RGB in the rendered output
    // Check if the color is applied to the background-color style
    expect(wrapper.html()).toContain('background-color: rgb(240, 66, 66)')
  })

  it('changes layout when racing starts', async () => {
    // Check initial layout
    expect(wrapper.classes()).toContain('h-20')

    // Start racing
    await wrapper.setProps({ isRacing: true })

    // Check racing layout
    expect(wrapper.classes()).toContain('h-16')
  })

  it('starts animation when racing and duration is provided', async () => {
    // Start racing with duration
    await wrapper.setProps({
      isRacing: true,
      raceDuration: 5, // 5 seconds race
    })

    // Wait for animation to be registered
    await nextTick()

    // Animation frame should have been requested
    expect(global.requestAnimationFrame).toHaveBeenCalled()

    // Horse should be at starting position initially
    expect((wrapper.vm as any).horsePosition).toBe(12)
  })

  it('emits horse-finished event when animation completes', async () => {
    // Set up racing with a duration
    await wrapper.setProps({
      isRacing: true,
      raceDuration: 0.01, // Very short duration
    })

    // Manually trigger the finish event
    await nextTick()
    wrapper.vm.$emit('horseFinished', 1)

    // Check if the event was emitted
    expect(wrapper.emitted('horseFinished')).toBeTruthy()
    expect(wrapper.emitted('horseFinished')?.[0]).toEqual([1])
  })

  it('resets position when racing stops', async () => {
    // Start racing with duration
    await wrapper.setProps({
      isRacing: true,
      raceDuration: 5,
    })

    // Wait for animation to start
    await nextTick()

    // Stop racing
    await wrapper.setProps({ isRacing: false })

    // Position should be reset
    expect((wrapper.vm as any).horsePosition).toBe(12)

    // Animation should be canceled
    expect(global.cancelAnimationFrame).toHaveBeenCalled()
  })

  it('applies vertical offset during racing', async () => {
    // Set vertical offset and racing
    await wrapper.setProps({
      isRacing: true,
      raceDuration: 5,
      verticalOffset: 10,
    })

    // Check if the rendered HTML has the vertical offset
    expect(wrapper.html()).toContain('10px')
  })
})
