<script setup lang="ts">
import { type Horse } from '@/stores/horses'
import { Card, CardContent } from '@/components/ui/card'

// Props
defineProps<{
  horse: Horse
}>()
</script>
<template>
  <Card
    class="overflow-hidden transition-all hover:shadow-md border-l-4"
    :style="{ 'border-left-color': horse.color }"
  >
    <CardContent class="p-4 flex items-center">
      <div
        class="flex items-center justify-center w-10 h-10 rounded-full mr-3 flex-shrink-0"
        :style="{ backgroundColor: horse.color }"
      >
        <div class="text-xl">🐎</div>
      </div>
      <div class="flex-1">
        <div class="font-medium text-base mb-1">{{ horse.name }}</div>
        <div class="flex items-center">
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
            <div
              class="h-full rounded-full"
              :style="{ width: `${horse.condition}%`, backgroundColor: horse.color }"
            ></div>
          </div>
          <span class="text-xs text-gray-500 font-medium">{{ horse.condition }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
