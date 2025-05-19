<script setup lang="ts">
import { computed } from 'vue'
import { useHorsesStore } from '@/stores/horses'
import { type HorseResult } from '@/stores/results'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
  <Card class="overflow-hidden shadow-xl border">
    <CardHeader class="pb-4 border-b relative">
      <Badge class="absolute top-3 right-3">
        {{ t('game.round') }} {{ roundId }}
      </Badge>
      <h3 class="text-2xl font-bold text-center">{{ t('game.raceResults') }}</h3>
    </CardHeader>

    <CardContent class="p-0">
      <div v-if="!results.length" class="text-center text-gray-400 py-10 italic">
        {{ t('game.noResultsToDisplay') }}
      </div>

      <div v-else>
        <!-- Podium display for top 3 -->
        <div class="flex justify-center p-6 pb-2 pt-32">
          <div class="flex items-end gap-1 h-36">
            <!-- Second place -->
            <div v-if="sortedResults.length > 1" class="flex flex-col items-center">
              <div class="w-16 h-16 rounded-full border-4 flex items-center justify-center mb-2 overflow-hidden" :style="{
                borderColor: getHorseColor(sortedResults[1].horseId),
                backgroundColor: `${getHorseColor(sortedResults[1].horseId)}33`,
              }">
                <span class="text-3xl">🐎</span>
              </div>
              <div class="text-xs font-medium">{{ getHorseName(sortedResults[1].horseId) }}</div>
              <div class="font-mono text-xs text-gray-400">
                {{ sortedResults[1].time.toFixed(2) }}s
              </div>
              <div class="w-20 h-28 bg-gray-500 text-gray-100 mt-auto flex items-center justify-center rounded-t-md">
                <div class="text-4xl font-bold">2</div>
              </div>
            </div>

            <!-- First place -->
            <div v-if="sortedResults.length > 0" class="flex flex-col items-center z-10">
              <div class="w-20 h-20 rounded-full border-4 flex items-center justify-center mb-2 relative" :style="{
                borderColor: getHorseColor(sortedResults[0].horseId),
                backgroundColor: `${getHorseColor(sortedResults[0].horseId)}33`,
              }">
                <span class="text-4xl">🐎</span>
                <div class="absolute -top-8 right-5 text-3xl">🏆</div>
              </div>
              <div class="text-sm font-bold">{{ getHorseName(sortedResults[0].horseId) }}</div>
              <div class="font-mono text-xs text-primary font-semibold">
                {{ sortedResults[0].time.toFixed(2) }}s
              </div>
              <div
                class="w-24 h-36 bg-gradient-to-b from-primary to-accent mt-auto flex items-center justify-center rounded-t-md">
                <div class="text-5xl font-bold">1</div>
              </div>
            </div>

            <!-- Third place -->
            <div v-if="sortedResults.length > 2" class="flex flex-col items-center">
              <div class="w-14 h-14 rounded-full border-4 flex items-center justify-center mb-2" :style="{
                borderColor: getHorseColor(sortedResults[2].horseId),
                backgroundColor: `${getHorseColor(sortedResults[2].horseId)}33`,
              }">
                <span class="text-3xl">🐎</span>
              </div>
              <div class="text-xs font-medium">{{ getHorseName(sortedResults[2].horseId) }}</div>
              <div class="font-mono text-xs text-gray-400">
                {{ sortedResults[2].time.toFixed(2) }}s
              </div>
              <div class="w-20 h-20 bg-gray-500 text-gray-100 mt-auto flex items-center justify-center rounded-t-md">
                <div class="text-4xl font-bold">3</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Other positions -->
        <div v-if="sortedResults.length > 3" class="px-4 pb-4">
          <div class="text-sm text-muted-foreground uppercase tracking-wider mb-2 mt-2 font-medium">
            {{ t('game.otherPositions') }}
          </div>

          <div class="space-y-2">
            <div v-for="result in sortedResults.slice(3)" :key="result.horseId"
              class="flex items-center p-3 rounded-md border">
              <div class="font-semibold w-8 h-8 rounded-full flex items-center justify-center text-sm">
                {{ result.place }}
              </div>
              <div class="flex items-center flex-1 ml-3">
                <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: getHorseColor(result.horseId) }">
                </div>
                <div class="font-medium text-sm">{{ getHorseName(result.horseId) }}</div>
              </div>
              <div class="font-mono text-sm">{{ result.time.toFixed(2) }}s</div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
