<script setup lang="ts">
import { computed } from 'vue'
import { useResultsStore } from '@/stores/results'
import { useHorsesStore } from '@/stores/horses'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const resultsStore = useResultsStore()
const horsesStore = useHorsesStore()

// Get all results from all rounds sorted by round ID
const allResults = computed(() => resultsStore.getAllResults)

// Calculate overall standings based on all race results
const overallStandings = computed(() => {
  // Create a map to track total points for each horse
  const pointsMap = new Map()

  // Scoring system: 1st place: 10 points, 2nd: 8 points, 3rd: 6 points,
  // 4th: 5 points, 5th: 4 points, 6th: 3 points, 7th: 2 points, 8th+: 1 point
  const pointsSystem = [10, 8, 6, 5, 4, 3, 2, 1, 1, 1]

  // Process each round's results
  allResults.value.forEach((roundResult) => {
    roundResult.results.forEach((horseResult) => {
      const points = pointsSystem[horseResult.place - 1] || 0
      const currentPoints = pointsMap.get(horseResult.horseId) || 0
      pointsMap.set(horseResult.horseId, currentPoints + points)
    })
  })

  // Convert to array and sort by points (highest first)
  const standings = Array.from(pointsMap.entries()).map(([horseId, points]) => {
    const horse = horsesStore.getHorseById(Number(horseId))
    return {
      horseId: Number(horseId),
      horseName: horse?.name || 'Unknown Horse',
      horseColor: horse?.color || '#ccc',
      totalPoints: points,
      totalRaces: countHorseRaces(Number(horseId)),
    }
  })

  // Sort by total points (descending)
  return standings.sort((a, b) => b.totalPoints - a.totalPoints)
})

// Count how many races a horse participated in
function countHorseRaces(horseId: number): number {
  return allResults.value.filter((round) =>
    round.results.some((result) => result.horseId === horseId),
  ).length
}

// Format time as mm:ss.ms
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}
</script>

<template>
  <Card
    class="overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl"
  >
    <CardHeader class="pb-4 border-b border-gray-700 flex justify-between items-center">
      <div class="flex items-center justify-center w-full relative">
        <div class="absolute left-0 top-0 text-3xl">🏆</div>
        <h2
          class="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400"
        >
          Championship Final Results
        </h2>
      </div>
    </CardHeader>
    <CardContent class="p-0">
      <!-- Champion spotlight -->
      <div
        v-if="overallStandings.length > 0"
        class="p-6 pb-2 bg-gradient-to-b from-amber-900/30 to-transparent relative overflow-hidden"
      >
        <div class="absolute inset-0 flex justify-center overflow-hidden">
          <div
            class="absolute w-96 h-96 bg-amber-500/10 rounded-full animate-pulse"
            style="animation-duration: 4s"
          ></div>
        </div>

        <div class="flex items-center justify-center relative z-10">
          <div class="text-center">
            <div class="text-amber-500 text-sm font-bold uppercase tracking-widest mb-2">
              Champion
            </div>
            <div class="flex justify-center">
              <div
                class="w-28 h-28 border-4 rounded-full flex items-center justify-center mb-2 relative overflow-hidden"
                :style="{
                  borderColor: overallStandings[0].horseColor,
                  background: `radial-gradient(circle, ${overallStandings[0].horseColor}40 0%, ${overallStandings[0].horseColor}10 70%)`,
                }"
              >
                <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                <span class="text-5xl relative">🐎</span>
                <div class="absolute -top-2 -right-2 text-4xl rotate-12 drop-shadow-lg">👑</div>
              </div>
            </div>
            <h3 class="text-3xl font-bold">{{ overallStandings[0].horseName }}</h3>
            <div class="flex items-center justify-center gap-3 mt-2">
              <div class="flex flex-col items-center bg-gray-800/50 p-2 rounded-lg min-w-14">
                <span class="text-xs text-gray-400">Points</span>
                <span class="text-xl font-bold text-amber-400">{{
                  overallStandings[0].totalPoints
                }}</span>
              </div>
              <div class="flex flex-col items-center bg-gray-800/50 p-2 rounded-lg min-w-14">
                <span class="text-xs text-gray-400">Races</span>
                <span class="text-xl font-bold text-amber-400">{{
                  overallStandings[0].totalRaces
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Overall standings table -->
      <div class="p-4">
        <div class="text-sm text-gray-400 uppercase tracking-wider mb-2 font-medium">Standings</div>
        <div class="overflow-hidden rounded-lg border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow class="border-b border-gray-700 bg-gray-800/50">
                <TableHead class="text-white px-4 py-3 w-16">Position</TableHead>
                <TableHead class="text-white px-4 py-3">Horse</TableHead>
                <TableHead class="text-white px-4 py-3 text-right">Points</TableHead>
                <TableHead class="text-white px-4 py-3 text-right">Races</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(standing, index) in overallStandings"
                :key="standing.horseId"
                class="border-b border-gray-700/50 last:border-0 hover:bg-gray-800/30 transition-colors"
                :class="{
                  'bg-amber-900/20': index === 0,
                  'bg-gray-700/20': index === 1,
                  'bg-orange-900/20': index === 2,
                }"
              >
                <TableCell class="px-4 py-3 font-bold text-center">
                  <div
                    class="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
                    :class="{
                      'bg-amber-500 text-amber-950': index === 0,
                      'bg-gray-400 text-gray-900': index === 1,
                      'bg-orange-700 text-orange-100': index === 2,
                      'bg-gray-800 text-gray-300': index > 2,
                    }"
                  >
                    {{ index + 1 }}
                  </div>
                </TableCell>
                <TableCell class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-4 h-4 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: standing.horseColor }"
                    ></div>
                    <span class="font-medium">{{ standing.horseName }}</span>
                    <span class="text-xs text-gray-500">#{{ standing.horseId }}</span>
                  </div>
                </TableCell>
                <TableCell class="px-4 py-3 text-right font-mono font-bold">
                  {{ standing.totalPoints }}
                </TableCell>
                <TableCell class="px-4 py-3 text-right font-mono">
                  {{ standing.totalRaces }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Individual round results -->
      <div class="px-4 pb-6">
        <div class="text-sm text-gray-400 uppercase tracking-wider mb-3 mt-6 font-medium">
          Round Results
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="roundResult in allResults"
            :key="roundResult.roundId"
            class="border border-gray-700 bg-gray-800/40 overflow-hidden"
          >
            <CardHeader class="pb-2 bg-gray-800">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-lg">Round {{ roundResult.roundId }}</h4>
                <div class="text-xs text-gray-400 font-mono">
                  {{ roundResult.results.length }} horses
                </div>
              </div>
            </CardHeader>
            <CardContent class="p-3">
              <div class="space-y-2">
                <div
                  v-for="result in roundResult.results.slice(0, 3)"
                  :key="result.horseId"
                  class="flex items-center p-2 rounded border-l-2"
                  :class="{
                    'bg-amber-950/30 border-amber-500': result.place === 1,
                    'bg-gray-800/30 border-gray-500': result.place === 2,
                    'bg-orange-950/30 border-orange-700': result.place === 3,
                  }"
                >
                  <div
                    class="font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2"
                    :class="{
                      'bg-amber-500 text-amber-950': result.place === 1,
                      'bg-gray-500 text-gray-100': result.place === 2,
                      'bg-orange-700 text-white': result.place === 3,
                    }"
                  >
                    {{ result.place }}
                  </div>
                  <div class="flex items-center flex-1">
                    <div
                      class="w-3 h-3 rounded-full mr-2"
                      :style="{
                        backgroundColor: horsesStore.getHorseById(result.horseId)?.color || '#ccc',
                      }"
                    ></div>
                    <span class="text-sm font-medium line-clamp-1">
                      {{ horsesStore.getHorseById(result.horseId)?.name || 'Unknown' }}
                    </span>
                  </div>
                  <div class="text-xs font-mono tabular-nums">
                    {{ formatTime(result.time) }}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
