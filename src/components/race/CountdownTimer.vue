<script setup lang="ts">
import { ref, watch } from 'vue'
import NumberFlow from '@number-flow/vue'

const COUNT_DOWN_VALUE = 3

const props = defineProps<{
  isActive: boolean
  speedMultiplier: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const countdown = ref<number | null>(null)
const isCountingDown = ref(false)

// Start countdown function
const startCountdown = () => {
  isCountingDown.value = true
  countdown.value = COUNT_DOWN_VALUE

  console.log('COUNTDOWN STARTED: ', countdown.value)

  const interval = setInterval(() => {
    if (countdown.value && countdown.value > 1) {
      countdown.value--
      console.log('COUNTDOWN: ', countdown.value)
    } else {
      clearInterval(interval)
      countdown.value = null
      isCountingDown.value = false
      console.log('COUNTDOWN COMPLETED')
      emit('complete')
    }
  }, 1000 / props.speedMultiplier)
}

// Watch for isActive change to start countdown
watch(
  () => props.isActive,
  (isActive) => {
    if (isActive && !isCountingDown.value && countdown.value === null) {
      console.log('Starting countdown')
      startCountdown()
    } else if (!isActive) {
      // Reset countdown if stopped externally
      countdown.value = null
      isCountingDown.value = false
    }
  },
  { immediate: true },
)

// Export relevant values for parent component
defineExpose({
  isCountingDown,
  countdown,
})
</script>

<template>
  <!-- Countdown overlay -->
  <div
    v-if="countdown !== null"
    class="fixed inset-0 flex items-center justify-center z-[999] bg-black/60 backdrop-blur-sm"
  >
    <div
      class="bg-black/80 rounded-full w-48 h-48 flex items-center justify-center border-4 border-white/20"
    >
      <NumberFlow :value="countdown" class="text-8xl font-bold text-white" />
    </div>
  </div>
</template>
