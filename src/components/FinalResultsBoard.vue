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
  <Card class="shadow-md">
    <CardHeader>
      <h2 class="text-2xl font-bold text-center">Championship Final Results</h2>
    </CardHeader>
    <CardContent class="px-6 pb-6">
      <!-- Overall standings table -->
      <div class="overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="px-4 py-3">Position</TableHead>
              <TableHead class="px-4 py-3">Horse</TableHead>
              <TableHead class="px-4 py-3">Total Points</TableHead>
              <TableHead class="px-4 py-3">Races</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="(standing, index) in overallStandings"
              :key="standing.horseId"
              class="border-b"
            >
              <TableCell class="px-4 py-3 font-semibold text-center">{{ index + 1 }}</TableCell>
              <TableCell class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: standing.horseColor }"
                  ></div>
                  <span class="font-medium"
                    >{{ standing.horseName }} (#{{ standing.horseId }})</span
                  >
                </div>
              </TableCell>
              <TableCell class="px-4 py-3 font-semibold">{{ standing.totalPoints }}</TableCell>
              <TableCell class="px-4 py-3">{{ standing.totalRaces }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Individual round results -->
      <div>
        <h3 class="text-xl font-semibold mb-4">Round Results</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card v-for="roundResult in allResults" :key="roundResult.roundId" class="border">
            <CardHeader class="pb-2">
              <h4 class="font-semibold text-lg">Round {{ roundResult.roundId }}</h4>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow class="text-sm">
                    <TableHead class="pb-2 font-medium text-left">Pos</TableHead>
                    <TableHead class="pb-2 font-medium text-left">Horse</TableHead>
                    <TableHead class="pb-2 font-medium text-left">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="result in roundResult.results.slice(0, 3)"
                    :key="result.horseId"
                    class="border-b last:border-0"
                  >
                    <TableCell class="py-2 font-semibold">{{ result.place }}</TableCell>
                    <TableCell class="py-2">
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
                    </TableCell>
                    <TableCell class="py-2 text-sm tabular-nums">{{
                      formatTime(result.time)
                    }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
