<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRaceStore } from '@/stores/race'
import { useRouter, useRoute } from 'vue-router'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { QUERY_PARAMS } from '@/router/constants'

// Store instance
const raceStore = useRaceStore()
const router = useRouter()
const route = useRoute()

const open = ref(false)
const speedMultiplier = ref('1')
let isUpdatingFromRoute = false

// Initialize speed multiplier from route query if available
onMounted(() => {
  const speedParam = route.query[QUERY_PARAMS.SPEED]?.toString()
  if (speedParam && ['1', '2', '3', '4', '5'].includes(speedParam)) {
    speedMultiplier.value = speedParam
    raceStore.setSpeedMultiplier(Number(speedParam))
  }

  // Set debug panel state based on query parameter
  open.value = route.query[QUERY_PARAMS.SHEET_NAME] === 'debug'
})

// Watch for speed multiplier changes and update store
watch(speedMultiplier, (newMultiplier) => {
  if (isUpdatingFromRoute) return

  raceStore.setSpeedMultiplier(Number(newMultiplier))

  // Update query parameter without changing the current path
  const newQuery = { ...route.query, [QUERY_PARAMS.SPEED]: newMultiplier }
  router.replace({ query: newQuery })
    .catch(err => console.error('Router error:', err))
})

// Watch for query parameter changes to update debug panel state
watch(() => route.query[QUERY_PARAMS.SHEET_NAME], (newSheetName) => {
  open.value = newSheetName === 'debug'
}, { immediate: true })

// Watch for query parameter changes to update speed multiplier
watch(() => route.query[QUERY_PARAMS.SPEED], (newSpeed) => {
  if (newSpeed && ['1', '2', '3', '4', '5'].includes(newSpeed.toString())) {
    isUpdatingFromRoute = true
    speedMultiplier.value = newSpeed.toString()
    isUpdatingFromRoute = false
  }
}, { immediate: true })

function handleDebug(isOpen: boolean) {
  // Update only the debug query parameter, preserving other query parameters
  const newQuery = { ...route.query }

  if (isOpen) {
    newQuery[QUERY_PARAMS.SHEET_NAME] = 'debug'
  } else {
    delete newQuery[QUERY_PARAMS.SHEET_NAME]
  }

  router.replace({ query: newQuery })
    .catch(err => console.error('Router navigation error:', err))
}
</script>

<template>
  <Sheet :open="open" @update:open="handleDebug">
    <SheetTrigger as-child>
      <Button variant="outline">Debug</Button>
    </SheetTrigger>
    <SheetContent class="px-4 sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Debug</SheetTitle>
        <SheetDescription>
          This is a debug panel. It will show you the current state of the game.
        </SheetDescription>
      </SheetHeader>
      <div class="mt-6 space-y-4">
        <div class="p-4 rounded-lg border">
          <h3 class="text-sm font-medium mb-2">Game State</h3>
          <div class="font-mono text-xs space-y-1.5">
            <p>currentRoundIndex: {{ raceStore.currentRoundIndex }}</p>
            <p>isRacing: {{ raceStore.isRacing }}</p>
            <p>isRoundCompleted: {{ raceStore.isRoundCompleted }}</p>
            <p>canStart: {{ raceStore.schedule.length > 0 && !raceStore.isRoundCompleted }}</p>
            <p>canNext: {{ raceStore.isRoundCompleted }}</p>
            <p>isLastRound: {{ raceStore.isLastRound }}</p>
          </div>
        </div>

        <div class="p-4 rounded-lg border flex items-center gap-2 justify-between">
          <h3 class="text-sm font-medium">Animation Speed</h3>
          <ToggleGroup type="single" variant="outline" v-model="speedMultiplier">
            <ToggleGroupItem value="1" aria-label="Toggle speed"> 1x </ToggleGroupItem>
            <ToggleGroupItem value="2" aria-label="Toggle speed"> 2x </ToggleGroupItem>
            <ToggleGroupItem value="3" aria-label="Toggle speed"> 3x </ToggleGroupItem>
            <ToggleGroupItem value="4" aria-label="Toggle speed"> 4x </ToggleGroupItem>
            <ToggleGroupItem value="5" aria-label="Toggle speed"> 5x </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
