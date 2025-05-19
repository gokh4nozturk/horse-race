<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
const { locale } = useI18n()
const currentLocale = ref(locale.value)

function changeLocale() {
  locale.value = currentLocale.value
  localStorage.setItem('locale', currentLocale.value)
}

// Initialize from localStorage if available
const savedLocale = localStorage.getItem('locale')
if (savedLocale && (savedLocale === 'en' || savedLocale === 'tr')) {
  currentLocale.value = savedLocale
  locale.value = savedLocale
}
</script>

<template>
  <ToggleGroup type="single" variant="outline" v-model="currentLocale" @update:modelValue="changeLocale">
    <ToggleGroupItem value="tr" aria-label="Toggle tr">
      <img
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+Cgk8bWFzayBpZD0iY2lyY2xlRmxhZ3NMYW5nVHIwIj4KCQk8Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI1NiIgZmlsbD0iI2ZmZiIgLz4KCTwvbWFzaz4KCTxnIG1hc2s9InVybCgjY2lyY2xlRmxhZ3NMYW5nVHIwKSI+CgkJPHBhdGggZmlsbD0iI2Q4MDAyNyIgZD0iTTAgMGg1MTJ2NTEySDB6IiAvPgoJCTxnIGZpbGw9IiNlZWUiPgoJCQk8cGF0aCBkPSJtMzUwIDE4MmwzMyA0Nmw1NC0xOGwtMzMgNDZsMzMgNDZsLTU0LTE4bC0zMyA0NnYtNTdsLTU0LTE3bDU0LTE4eiIgLz4KCQkJPHBhdGggZD0iTTI2MCAzNzBhMTE0IDExNCAwIDEgMSA1NC0yMTVhMTQxIDE0MSAwIDEgMCAwIDIwMmMtMTcgOS0zNSAxMy01NCAxMyIgLz4KCQk8L2c+Cgk8L2c+Cjwvc3ZnPg=="
        alt="tr" class="h-4 w-4" />
    </ToggleGroupItem>
    <ToggleGroupItem value="en" aria-label="Toggle en">
      <img
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+Cgk8bWFzayBpZD0iY2lyY2xlRmxhZ3NMYW5nRW4wIj4KCQk8Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI1NiIgZmlsbD0iI2ZmZiIgLz4KCTwvbWFzaz4KCTxnIG1hc2s9InVybCgjY2lyY2xlRmxhZ3NMYW5nRW4wKSI+CgkJPHBhdGggZmlsbD0iI2VlZSIgZD0ibTAgMGw4IDIybC04IDIzdjIzbDMyIDU0bC0zMiA1NHYzMmwzMiA0OGwtMzIgNDh2MzJsMzIgNTRsLTMyIDU0djY4bDIyLThsMjMgOGgyM2w1NC0zMmw1NCAzMmgzMmw0OC0zMmw0OCAzMmgzMmw1NC0zMmw1NCAzMmg2OGwtOC0yMmw4LTIzdi0yM2wtMzItNTRsMzItNTR2LTMybC0zMi00OGwzMi00OHYtMzJsLTMyLTU0bDMyLTU0VjBsLTIyIDhsLTIzLThoLTIzbC01NCAzMmwtNTQtMzJoLTMybC00OCAzMmwtNDgtMzJoLTMybC01NCAzMkw2OCAweiIgLz4KCQk8cGF0aCBmaWxsPSIjMDA1MmI0IiBkPSJNMzM2IDB2MTA4TDQ0NCAwWm0xNzYgNjhMNDA0IDE3NmgxMDh6TTAgMTc2aDEwOEwwIDY4Wk02OCAwbDEwOCAxMDhWMFptMTA4IDUxMlY0MDRMNjggNTEyWk0wIDQ0NGwxMDgtMTA4SDBabTUxMi0xMDhINDA0bDEwOCAxMDhabS02OCAxNzZMMzM2IDQwNHYxMDh6IiAvPgoJCTxwYXRoIGZpbGw9IiNkODAwMjciIGQ9Ik0wIDB2NDVsMTMxIDEzMWg0NXptMjA4IDB2MjA4SDB2OTZoMjA4djIwOGg5NlYzMDRoMjA4di05NkgzMDRWMHptMjU5IDBMMzM2IDEzMXY0NUw1MTIgMHpNMTc2IDMzNkwwIDUxMmg0NWwxMzEtMTMxem0xNjAgMGwxNzYgMTc2di00NUwzODEgMzM2eiIgLz4KCTwvZz4KPC9zdmc+"
        alt="tr" class="h-4 w-4" />
    </ToggleGroupItem>
  </ToggleGroup>
</template>
