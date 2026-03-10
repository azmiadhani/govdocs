<template>
  <UCard v-if="summary?.keyPoints?.length">
    <template #header>
      <h3 class="font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-list-bullet" class="text-primary-500" />
        Key Points
      </h3>
    </template>

    <ul class="space-y-2">
      <li
        v-for="(point, i) in summary.keyPoints"
        :key="i"
        class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
      >
        <span class="text-primary-500 font-bold shrink-0 mt-0.5">{{ i + 1 }}.</span>
        {{ point }}
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import type { AiSummary } from '~/types'

defineProps<{ summary: AiSummary | null }>()
</script>
