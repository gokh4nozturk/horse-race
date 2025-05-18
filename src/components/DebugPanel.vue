<script setup lang="ts">
import { watch } from 'vue'
import { useRaceStore } from '@/stores/race'

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

// Store instance
const raceStore = useRaceStore()

// Props for the debug panel
defineProps<{
  open: boolean
  speedOptions: number[]
}>()

// Emits for speed multiplier changes
const emit = defineEmits<{
  'update:open': [open: boolean]
  'speed-change': [multiplier: number]
}>()

// Watch for speed multiplier changes and emit the new value
watch(raceStore.speedMultiplier, (multiplier) => {
  emit('speed-change', multiplier)
})

// Handle update open
function handleUpdateOpen(open: boolean) {
  emit('update:open', open)
}
</script>

<template>
  <Sheet :open="open" @update:open="handleUpdateOpen">
    <SheetTrigger as-child class="absolute top-0 right-0 z-10">
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
        <div class="bg-gray-50 p-4 rounded-lg border">
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

        <div class="bg-gray-50 p-4 rounded-lg border flex items-center gap-2 justify-between">
          <h3 class="text-sm font-medium">Animation Speed</h3>
          <ToggleGroup type="single" variant="outline" v-model="raceStore.speedMultiplier">
            <ToggleGroupItem value="1" aria-label="Toggle bold"> 1x </ToggleGroupItem>
            <ToggleGroupItem value="2" aria-label="Toggle bold"> 2x </ToggleGroupItem>
            <ToggleGroupItem value="3" aria-label="Toggle bold"> 3x </ToggleGroupItem>
            <ToggleGroupItem value="4" aria-label="Toggle bold"> 4x </ToggleGroupItem>
            <ToggleGroupItem value="5" aria-label="Toggle bold"> 5x </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
