<template>
  <NuxtLink :to="`/documents/${doc.id}`">
    <div class="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3">
      <!-- Header -->
      <div class="flex items-start justify-between gap-2">
        <UBadge :label="typeLabel" :color="typeColor" variant="subtle" size="sm" />
        <span v-if="doc.viewCount" class="flex items-center gap-1 text-xs text-gray-400">
          <UIcon name="i-heroicons-eye" class="w-3 h-3" />
          {{ doc.viewCount }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="font-semibold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-primary-600 transition-colors line-clamp-2 flex-1">
        {{ doc.title }}
      </h3>

      <!-- AI Summary teaser -->
      <p v-if="summaryTeaser" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
        {{ summaryTeaser }}
      </p>

      <!-- Meta -->
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
        <span v-if="doc.ministry" class="flex items-center gap-1">
          <UIcon name="i-heroicons-building-office-2" class="w-3 h-3" />
          <span class="truncate max-w-[120px]">{{ doc.ministry }}</span>
        </span>
        <span v-if="doc.publishedAt" class="flex items-center gap-1">
          <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
          {{ formatDate(doc.publishedAt) }}
        </span>
        <span v-if="doc.pageCount" class="flex items-center gap-1">
          <UIcon name="i-heroicons-document" class="w-3 h-3" />
          {{ doc.pageCount }}p
        </span>
      </div>

      <!-- Tags -->
      <div v-if="doc.tags?.length" class="flex flex-wrap gap-1">
        <UBadge v-for="tag in doc.tags.slice(0, 3)" :key="tag" :label="tag" variant="outline" size="xs" color="gray" />
      </div>

      <UButton size="xs" variant="soft" block class="mt-auto">Lihat Dokumen</UButton>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

const props = defineProps<{ doc: Document }>()

const TYPE_LABELS: Record<string, string> = {
  law: 'Undang-Undang', regulation: 'Peraturan', decree: 'Keputusan',
  circular: 'Surat Edaran', guideline: 'Pedoman', other: 'Lainnya',
}
const TYPE_COLORS: Record<string, string> = {
  law: 'red', regulation: 'blue', decree: 'purple',
  circular: 'orange', guideline: 'green', other: 'gray',
}

const typeLabel = computed(() => TYPE_LABELS[props.doc.type] || props.doc.type)
const typeColor = computed(() => TYPE_COLORS[props.doc.type] || 'gray')
const summaryTeaser = computed(() => {
  const s = (props.doc as any).summary?.summary
  return s ? s.slice(0, 100) + (s.length > 100 ? '...' : '') : null
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
