<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, Zap } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  roundId: number
  distance: number
  isRacing: boolean
  speedMultiplier: number
  isCountingDown: boolean
}>()

const raceTitle = computed(() => {
  if (props.isCountingDown) return t('game.header.ready')
  if (props.isRacing) return t('game.header.inProgress')
  return t('game.header.readyToRace')
})
</script>

<template>
  <div :class="cn(
    'pb-4 text-center relative border-b transition-all duration-700 ',
    { 'pb-2': isRacing }
  )">
    <div class="relative">
      <h3 :class="cn(
        'text-2xl font-bold my-2 transition-all duration-700 [text-shadow:0_0_10px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.3)]',
        { 'text-xl my-1 opacity-90': isRacing }
      )">
        {{ raceTitle }}
      </h3>
    </div>

    <!-- Race info pills with improved design -->
    <div :class="cn(
      'flex items-center justify-center gap-5 mt-3 transition-all duration-700',
      { 'gap-3 mt-2 scale-95': isRacing }
    )">
      <div :class="cn(
        'px-4 py-1.5 rounded-lg text-sm flex items-center shadow-md transition-all duration-700 border',
        { 'px-3 py-1 scale-95': isRacing }
      )">
        <TrendingUp class="size-4 mr-1.5 shrink-0" />
        <span class="mr-2">{{ t('game.header.distance') }}:</span>
        <span class="font-mono font-bold text-base">{{ distance }}m</span>
      </div>

      <div v-if="speedMultiplier > 1" :class="cn(
        'px-4 py-1.5 rounded-lg text-sm flex items-center shadow-md transition-all duration-700 border',
        { 'px-3 py-1 scale-95': isRacing }
      )">
        <Zap class="size-4 mr-1.5 shrink-0" />
        <span class="mr-2">{{ t('game.header.speed') }}:</span>
        <span class="font-mono font-bold text-base">{{ speedMultiplier }}x</span>
      </div>
    </div>
  </div>
</template>
