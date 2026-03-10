<template>
  <NuxtLink :to="`/documents/${doc.id}`">
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-primary-400 transition-colors cursor-pointer group">
      <!-- Header -->
      <div class="flex items-start justify-between gap-2 mb-3">
        <UBadge :label="doc.type" variant="subtle" />
        <UBadge
          :label="doc.status"
          :color="statusColor"
          variant="subtle"
          size="xs"
        />
      </div>

      <!-- Title -->
      <h3 class="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-2 group-hover:text-primary-500 transition-colors line-clamp-2">
        {{ doc.title }}
      </h3>

      <!-- Meta -->
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span v-if="doc.ministry" class="flex items-center gap-1">
          <UIcon name="i-heroicons-building-office-2" class="w-3.5 h-3.5" />
          {{ doc.ministry }}
        </span>
        <span v-if="doc.publishedAt" class="flex items-center gap-1">
          <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
          {{ formatDate(doc.publishedAt) }}
        </span>
        <span v-if="doc.pageCount" class="flex items-center gap-1">
          <UIcon name="i-heroicons-document" class="w-3.5 h-3.5" />
          {{ doc.pageCount }}p
        </span>
      </div>

      <!-- Tags -->
      <div v-if="doc.tags?.length" class="flex flex-wrap gap-1 mt-3">
        <UBadge
          v-for="tag in doc.tags.slice(0, 3)"
          :key="tag"
          :label="tag"
          variant="outline"
          size="xs"
          color="gray"
        />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

const props = defineProps<{ doc: Document }>()

const statusColor = computed(() => {
  const map: Record<string, string> = { indexed: 'green', pending: 'yellow', error: 'red' }
  return map[props.doc.status] || 'gray'
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
