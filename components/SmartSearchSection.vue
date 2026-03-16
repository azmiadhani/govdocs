<template>
  <div class="mb-8 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50/40 dark:bg-primary-950/20 p-5">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 class="font-semibold text-gray-900 dark:text-white text-sm leading-tight">Pencarian Cerdas</h2>
          <p v-if="query" class="text-xs text-gray-500 dark:text-gray-400">untuk "{{ query }}"</p>
        </div>
      </div>
      <UButton
        icon="i-heroicons-x-mark"
        variant="ghost"
        color="gray"
        size="xs"
        label="Tutup"
        @click="$emit('dismiss')"
      />
    </div>

    <SmartSearchResult
      :loading="loading"
      :result="result"
      :error="error"
      :query="query"
    />
  </div>
</template>

<script setup lang="ts">
import type { SmartSearchResult as SmartSearchResultType } from '~/types'

defineProps<{
  loading: boolean
  result: SmartSearchResultType | null
  error: string | null
  query: string
}>()

defineEmits<{
  dismiss: []
}>()
</script>
