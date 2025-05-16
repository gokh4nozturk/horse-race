<script setup lang="ts">
import { computed } from 'vue'
import { useHorsesStore } from '@/stores/horses'
import { type HorseResult } from '@/stores/results'

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
  <div class="result-board">
    <h3 class="board-title">Round {{ roundId }} Results</h3>

    <div class="results-container">
      <div v-if="!results.length" class="no-results">No results to display</div>

      <div v-else class="results-list">
        <div
          v-for="result in sortedResults"
          :key="result.horseId"
          class="result-item"
          :class="{
            'first-place': result.place === 1,
            'second-place': result.place === 2,
            'third-place': result.place === 3,
          }"
        >
          <div class="place">{{ result.place }}</div>
          <div class="horse-info">
            <div
              class="horse-color"
              :style="{ backgroundColor: getHorseColor(result.horseId) }"
            ></div>
            <div class="horse-name">{{ getHorseName(result.horseId) }}</div>
          </div>
          <div class="time">{{ result.time.toFixed(2) }}s</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-board {
  width: 100%;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.board-title {
  font-size: 1.25rem;
  margin: 0 0 1rem;
  text-align: center;
}

.results-container {
  width: 100%;
}

.no-results {
  text-align: center;
  color: #6b7280;
  padding: 2rem 0;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: #f9fafb;
}

.first-place {
  background-color: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.second-place {
  background-color: #f1f5f9;
  border-left: 4px solid #94a3b8;
}

.third-place {
  background-color: #fee2e2;
  border-left: 4px solid #b91c1c;
}

.place {
  font-weight: 600;
  font-size: 1.25rem;
  width: 2rem;
  text-align: center;
}

.horse-info {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
}

.horse-color {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  margin-right: 0.5rem;
}

.horse-name {
  font-weight: 500;
}

.time {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: #4b5563;
}
</style>
