<script setup lang="ts">
defineProps<{
  roundDistance?: number
}>()
</script>

<template>
  <div class="absolute h-[calc(100%-50px)] w-10 bottom-0 z-40 right-0">
    <!-- Finish line with checkered pattern -->
    <div
      class="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg1djVIMHpNNSA1aDV2NUg1eiIgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJub256ZXJvIi8+PC9zdmc+')] bg-repeat relative">
    </div>
    <div class="absolute inset-y-0 -left-10 w-10 bg-gradient-to-r from-transparent to-white/5"></div>
  </div>
</template>
