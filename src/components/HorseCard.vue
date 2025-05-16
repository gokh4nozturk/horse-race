<script setup lang="ts">
import { type Horse } from '@/stores/horses'

// Props
defineProps<{
  horse: Horse
}>()
</script>
<template>
  <div class="horse-card" :style="{ '--horse-color': horse.color }">
    <div class="horse-avatar" :style="{ backgroundColor: horse.color }">
      <div class="horse-icon">🐎</div>
    </div>
    <div class="horse-info">
      <div class="horse-name">{{ horse.name }}</div>
      <div class="horse-condition">
        <div class="condition-bar">
          <div class="condition-fill" :style="{ width: `${horse.condition}%` }"></div>
        </div>
        <span class="condition-text">{{ horse.condition }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.horse-card {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--horse-color);
  margin-bottom: 0.5rem;
}

.horse-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.horse-icon {
  font-size: 1.5rem;
}

.horse-info {
  flex: 1;
}

.horse-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.horse-condition {
  display: flex;
  align-items: center;
}

.condition-bar {
  flex: 1;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin-right: 0.5rem;
}

.condition-fill {
  height: 100%;
  background-color: var(--horse-color);
  border-radius: 9999px;
}

.condition-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}
</style>
