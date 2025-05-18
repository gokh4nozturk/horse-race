<script setup lang="ts">
import { computed } from 'vue'
import { useResultsStore } from '@/stores/results'
import { useHorsesStore } from '@/stores/horses'
import { Card, CardContent } from '@/components/ui/card'

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
  <Card class="shadow-md">
    <CardContent class="p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Championship Final Results</h2>

      <!-- Overall standings table -->
      <div class="overflow-x-auto mb-8">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Position</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Horse</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Total Points</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Races</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(standing, index) in overallStandings"
              :key="standing.horseId"
              class="border-b border-gray-200"
            >
              <td class="px-4 py-3 font-semibold text-gray-900 text-center">{{ index + 1 }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: standing.horseColor }"
                  ></div>
                  <span class="font-medium"
                    >{{ standing.horseName }} (#{{ standing.horseId }})</span
                  >
                </div>
              </td>
              <td class="px-4 py-3 font-semibold text-gray-900">{{ standing.totalPoints }}</td>
              <td class="px-4 py-3">{{ standing.totalRaces }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Individual round results -->
      <div>
        <h3 class="text-xl font-semibold text-gray-700 mb-4">Round Results</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="roundResult in allResults"
            :key="roundResult.roundId"
            class="bg-gray-50 border border-gray-200"
          >
            <CardContent class="p-4">
              <h4 class="font-semibold text-lg mb-3">Round {{ roundResult.roundId }}</h4>
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-300 text-sm">
                    <th class="pb-2 font-medium text-gray-600 text-left">Pos</th>
                    <th class="pb-2 font-medium text-gray-600 text-left">Horse</th>
                    <th class="pb-2 font-medium text-gray-600 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="result in roundResult.results.slice(0, 3)"
                    :key="result.horseId"
                    class="border-b border-gray-200 last:border-0"
                  >
                    <td class="py-2 font-semibold">{{ result.place }}</td>
                    <td class="py-2">
                      <div class="flex items-center">
                        <div
                          class="w-3 h-3 rounded-full mr-2"
                          :style="{
                            backgroundColor:
                              horsesStore.getHorseById(result.horseId)?.color || '#ccc',
                          }"
                        ></div>
                        <span class="text-sm">
                          {{ horsesStore.getHorseById(result.horseId)?.name || 'Unknown' }}
                        </span>
                      </div>
                    </td>
                    <td class="py-2 text-sm tabular-nums">{{ formatTime(result.time) }}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
