<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Play, SkipForward, Ban, MemoryStick } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  currentRoundIndex: number
  isRacing: boolean
  canStart: boolean
  canNext: boolean
  isLastRound: boolean
}>()

const emit = defineEmits<{
  generate: []
  start: []
  nextRound: []
  reset: []
}>()

const onGenerate = () => {
  console.log('Generate button clicked!')
  emit('generate')
}

const onStart = () => {
  console.log('Start button clicked!')
  emit('start')
}

const onNextRound = () => {
  console.log('Next Round button clicked!')
  emit('nextRound')
}

const onReset = () => {
  console.log('Reset button clicked!')
  emit('reset')
}
</script>

<template>
  <div class="flex gap-2">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="outline" size="icon" @click="onGenerate" :disabled="isRacing"
            class="relative overflow-hidden">
            <div class="absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <MemoryStick class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {{ t('game.generateRace') }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="default" @click="onStart" size="icon" :disabled="!canStart || isRacing"
            class="relative overflow-hidden">
            <div class="absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <Play class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent> {{ currentRoundIndex < 0 ? t('game.startRace') : t('game.startRound') }} </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="secondary" @click="onNextRound" size="icon" :disabled="!canNext || isRacing || isLastRound"
            class="relative overflow-hidden">
            <div class="absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <SkipForward class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {{ t('game.nextRound') }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="destructive" size="icon" @click="onReset" :disabled="isRacing"
            class="relative overflow-hidden">
            <Ban class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {{ t('game.resetRace') }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
