<script setup lang="ts">
import { type Horse } from '@/stores/horses'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Props
defineProps<{
  horse: Horse
}>()
</script>

<template>
  <Card :class="cn(
    'overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg group border-0 bg-gray-800 text-white',
  )" :style="{ boxShadow: `0 8px 24px ${horse.color}33` }">
    <CardHeader class="py-3 px-4 pb-2 flex flex-row items-center justify-between">
      <div class="flex items-center">
        <div class="flex items-center justify-center w-12 h-12 rounded-full mr-3 flex-shrink-0 relative overflow-hidden"
          :style="{ backgroundColor: `${horse.color}22`, border: `2px solid ${horse.color}` }">
          <div class="text-2xl transform group-hover:scale-110 transition-transform">🐎</div>
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div>
          <div class="font-bold text-lg">{{ horse.name }}</div>
          <div class="text-xs text-gray-400">#{{ horse.id }}</div>
        </div>
      </div>
      <div class="text-2xl font-bold" :style="{ color: horse.color }">
        {{ horse.condition }}
      </div>
    </CardHeader>
    <CardContent class="px-4 py-3 pt-0">
      <div class="mt-2">
        <div class="text-xs uppercase tracking-wider text-gray-400 mb-1">Condition</div>
        <div class="flex items-center">
          <div class="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden relative">
            <div class="h-full rounded-full relative z-10 flex items-center"
              :style="{ width: `${horse.condition}%`, backgroundColor: horse.color }">
              <div v-if="horse.condition > 5" class="absolute right-1 top-0 bottom-0 w-2 bg-white/30 rounded-full">
              </div>
            </div>
            <div class="absolute inset-0 bg-white/5 animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
