<template>
  <NuxtLink :to="`/documents/${doc.id}`" class="block">
    <div class="flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-400 transition-colors group">
      <!-- Type badge -->
      <div class="shrink-0">
        <UBadge :label="typeLabel" :color="typeColor" variant="subtle" size="sm" />
      </div>

      <!-- Title + Ministry -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
          {{ doc.title }}
        </p>
        <p v-if="doc.ministry" class="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
          <UIcon name="i-heroicons-building-office-2" class="w-3 h-3 shrink-0" />
          {{ doc.ministry }}
        </p>
      </div>

      <!-- Date -->
      <span v-if="doc.publishedAt" class="text-xs text-gray-400 shrink-0 hidden sm:block">
        {{ formatDate(doc.publishedAt) }}
      </span>

      <!-- Pages -->
      <span v-if="doc.pageCount" class="text-xs text-gray-400 shrink-0 hidden md:flex items-center gap-1">
        <UIcon name="i-heroicons-document" class="w-3 h-3" />
        {{ doc.pageCount }}
      </span>

      <!-- Views -->
      <span v-if="doc.viewCount" class="text-xs text-gray-400 shrink-0 hidden md:flex items-center gap-1">
        <UIcon name="i-heroicons-eye" class="w-3 h-3" />
        {{ doc.viewCount }}
      </span>

      <!-- Arrow -->
      <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

const props = defineProps<{ doc: Document }>()

const TYPE_LABELS: Record<string, string> = {
  law: 'Undang-Undang',
  regulation: 'Peraturan',
  decree: 'Keputusan',
  circular: 'Surat Edaran',
  guideline: 'Pedoman',
  other: 'Lainnya',
}

const TYPE_COLORS: Record<string, string> = {
  law: 'red',
  regulation: 'blue',
  decree: 'purple',
  circular: 'orange',
  guideline: 'green',
  other: 'gray',
}

const typeLabel = computed(() => TYPE_LABELS[props.doc.type] || props.doc.type)
const typeColor = computed(() => TYPE_COLORS[props.doc.type] || 'gray')

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
