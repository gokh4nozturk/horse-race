<script setup lang="ts">
import { computed } from 'vue'
import { useResultsStore } from '@/stores/results'
import { useHorsesStore } from '@/stores/horses'

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
  <div class="final-results-board">
    <h2 class="final-results-title">Championship Final Results</h2>

    <!-- Overall standings table -->
    <div class="standings-table-container">
      <table class="standings-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Horse</th>
            <th>Total Points</th>
            <th>Races</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(standing, index) in overallStandings" :key="standing.horseId">
            <td class="position">{{ index + 1 }}</td>
            <td class="horse-info">
              <div
                class="horse-color-indicator"
                :style="{ backgroundColor: standing.horseColor }"
              ></div>
              <span>{{ standing.horseName }} (#{{ standing.horseId }})</span>
            </td>
            <td class="points">{{ standing.totalPoints }}</td>
            <td>{{ standing.totalRaces }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Individual round results -->
    <div class="round-results">
      <h3 class="rounds-title">Round Results</h3>

      <div class="round-cards">
        <div v-for="roundResult in allResults" :key="roundResult.roundId" class="round-card">
          <h4 class="round-title">Round {{ roundResult.roundId }}</h4>
          <table class="round-results-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Horse</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in roundResult.results.slice(0, 3)" :key="result.horseId">
                <td class="position">{{ result.place }}</td>
                <td class="horse-info">
                  <div
                    class="horse-color-indicator"
                    :style="{
                      backgroundColor: horsesStore.getHorseById(result.horseId)?.color || '#ccc',
                    }"
                  ></div>
                  <span>{{ horsesStore.getHorseById(result.horseId)?.name || 'Unknown' }}</span>
                </td>
                <td>{{ formatTime(result.time) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.final-results-board {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.final-results-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.standings-table-container {
  margin-bottom: 2rem;
  overflow-x: auto;
}

.standings-table,
.round-results-table {
  width: 100%;
  border-collapse: collapse;
}

.standings-table th,
.standings-table td,
.round-results-table th,
.round-results-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.standings-table th,
.round-results-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
}

.position {
  font-weight: 600;
  color: #111827;
  text-align: center;
}

.horse-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.horse-color-indicator {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.points {
  font-weight: 600;
  color: #111827;
}

.rounds-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 1.5rem 0 1rem;
}

.round-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.round-card {
  background-color: #f9fafb;
  border-radius: 0.375rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.round-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: #374151;
}

@media (max-width: 640px) {
  .round-cards {
    grid-template-columns: 1fr;
  }
}
</style>
