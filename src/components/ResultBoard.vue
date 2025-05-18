<script setup lang="ts">
import { computed } from 'vue'
import { useHorsesStore } from '@/stores/horses'
import { type HorseResult } from '@/stores/results'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

const props = defineProps<{
  roundId: number
  results: HorseResult[]
}>()

const horsesStore = useHorsesStore()

// Get horse data from the store
const getHorseName = (horseId: number): string => {
  const horse = horsesStore.getHorseById(horseId)
  return horse?.name || `Horse #${horseId}`
}

const getHorseColor = (horseId: number): string => {
  const horse = horsesStore.getHorseById(horseId)
  return horse?.color || '#ccc'
}

// Sort results by place
const sortedResults = computed(() => {
  return [...props.results].sort((a, b) => a.place - b.place)
})
</script>
<template>
  <Card>
    <CardHeader>
      <h3 class="text-xl font-semibold text-center">Round {{ roundId }} Results</h3>
    </CardHeader>
    <CardContent>
      <div v-if="!results.length" class="text-center text-muted-foreground py-8">
        No results to display
      </div>

      <div v-else class="flex flex-col space-y-2">
        <div
          v-for="result in sortedResults"
          :key="result.horseId"
          class="flex items-center p-3 rounded-md"
          :class="{
            'bg-amber-50 dark:bg-amber-900 border-l-4 border-amber-500 dark:border-amber-500':
              result.place === 1,
            'bg-gray-50 dark:bg-gray-900 border-l-4 border-gray-400 dark:border-gray-400':
              result.place === 2,
            'bg-red-50 dark:bg-red-900 border-l-4 border-red-700 dark:border-red-700':
              result.place === 3,
            'bg-gray-50 dark:bg-gray-900 dark:border-gray-900': result.place > 3,
          }"
        >
          <div class="font-semibold text-xl w-8 text-center">{{ result.place }}</div>
          <div class="flex items-center flex-1 ml-2">
            <div
              class="w-4 h-4 rounded-full mr-2"
              :style="{ backgroundColor: getHorseColor(result.horseId) }"
            ></div>
            <div class="font-medium">{{ getHorseName(result.horseId) }}</div>
          </div>
          <div class="font-semibold tabular-nums">{{ result.time.toFixed(2) }}s</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
