<template>
  <!-- Public card: entire card is a real NuxtLink -->
  <NuxtLink v-if="!adminMode" :to="`/documents/${doc.id}`"
    class="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 transition-all flex flex-col gap-3 hover:border-primary-400 hover:shadow-md cursor-pointer group">
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <UBadge :label="typeLabel" :color="typeColor" variant="subtle" size="sm" />
      <span v-if="doc.viewCount" class="flex items-center gap-1 text-xs text-gray-400">
        <UIcon name="i-heroicons-eye" class="w-3 h-3" />
        {{ doc.viewCount }}
      </span>
    </div>

    <!-- Title -->
    <h3
      class="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 flex-1 group-hover:text-primary-600 transition-colors">
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

    <!-- Footer -->
    <div class="mt-auto">
      <div
        class="flex items-center justify-center gap-1.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-medium py-1.5 px-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
        <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
        Lihat Dokumen
      </div>
    </div>
  </NuxtLink>

  <!-- Admin card: plain div with action buttons -->
  <div v-else
    class="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 transition-all flex flex-col gap-3">
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <UBadge :label="typeLabel" :color="typeColor" variant="subtle" size="sm" />
      <UBadge :label="doc.status" :color="statusColor" size="xs" variant="subtle" />
    </div>

    <!-- Title -->
    <h3 class="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 flex-1">
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

    <!-- Admin actions -->
    <div class="flex items-center gap-1 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
      <UTooltip text="Lihat">
        <UButton size="xs" variant="ghost" icon="i-heroicons-eye" :to="`/documents/${doc.id}`" target="_blank" />
      </UTooltip>
      <UTooltip text="Re-index">
        <UButton size="xs" variant="ghost" icon="i-heroicons-arrow-path" :loading="reindexing" @click="doReindex" />
      </UTooltip>
      <div class="ml-auto flex gap-1">
        <UTooltip text="Edit">
          <UButton size="xs" variant="ghost" icon="i-heroicons-pencil" :to="`/admin/documents/${doc.id}`" />
        </UTooltip>
        <UTooltip text="Hapus">
          <UButton size="xs" variant="ghost" color="red" icon="i-heroicons-trash" @click="emit('delete', doc)" />
        </UTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

const props = defineProps<{ doc: Document; adminMode?: boolean }>()
const emit = defineEmits<{ delete: [doc: Document] }>()

const reindexing = ref(false)

const TYPE_LABELS: Record<string, string> = {
  law: 'Undang-Undang', regulation: 'Peraturan', decree: 'Keputusan',
  circular: 'Surat Edaran', guideline: 'Pedoman', other: 'Lainnya',
}
const TYPE_COLORS: Record<string, string> = {
  law: 'red', regulation: 'blue', decree: 'purple',
  circular: 'orange', guideline: 'green', other: 'gray',
}
const STATUS_COLORS: Record<string, string> = {
  indexed: 'green', pending: 'yellow', error: 'red',
}

const typeLabel = computed(() => TYPE_LABELS[props.doc.type] || props.doc.type)
const typeColor = computed(() => (TYPE_COLORS[props.doc.type] || 'gray') as any)
const statusColor = computed(() => (STATUS_COLORS[props.doc.status || ''] || 'gray') as any)
const summaryTeaser = computed(() => {
  const s = (props.doc as any).summary?.summary
  return s ? s.slice(0, 100) + (s.length > 100 ? '...' : '') : null
})

async function doReindex() {
  reindexing.value = true
  try {
    await $fetch('/api/admin/reindex', { method: 'POST', body: { documentId: props.doc.id } })
  } finally {
    reindexing.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
