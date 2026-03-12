<template>
  <component
    :is="adminMode ? 'div' : 'NuxtLink'"
    v-bind="adminMode ? {} : { to: `/documents/${doc.id}` }"
    class="block"
  >
    <div
      class="flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl transition-colors"
      :class="adminMode ? '' : 'hover:border-primary-400 group cursor-pointer'"
    >
      <!-- Type badge -->
      <div class="shrink-0">
        <UBadge :label="typeLabel" :color="typeColor" variant="subtle" size="sm" />
      </div>

      <!-- Title + Ministry -->
      <div class="flex-1 min-w-0">
        <p
          class="text-sm font-medium text-gray-900 dark:text-white truncate"
          :class="adminMode ? '' : 'group-hover:text-primary-600 transition-colors'"
        >
          {{ doc.title }}
        </p>
        <p v-if="doc.ministry" class="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
          <UIcon name="i-heroicons-building-office-2" class="w-3 h-3 shrink-0" />
          {{ doc.ministry }}
        </p>
      </div>

      <!-- Date (public mode only) -->
      <span v-if="doc.publishedAt && !adminMode" class="text-xs text-gray-400 shrink-0 hidden sm:block">
        {{ formatDate(doc.publishedAt) }}
      </span>

      <!-- Pages (public mode only) -->
      <span v-if="doc.pageCount && !adminMode" class="text-xs text-gray-400 shrink-0 hidden md:flex items-center gap-1">
        <UIcon name="i-heroicons-document" class="w-3 h-3" />
        {{ doc.pageCount }}
      </span>

      <!-- Views (public mode only) -->
      <span v-if="doc.viewCount && !adminMode" class="text-xs text-gray-400 shrink-0 hidden md:flex items-center gap-1">
        <UIcon name="i-heroicons-eye" class="w-3 h-3" />
        {{ doc.viewCount }}
      </span>

      <!-- Status badge (admin mode) -->
      <UBadge v-if="adminMode" :label="doc.status" :color="statusColor" size="xs" variant="subtle" class="shrink-0" />

      <!-- Admin actions -->
      <div v-if="adminMode" class="flex items-center gap-1 shrink-0">
        <UTooltip text="Lihat di situs">
          <UButton size="xs" variant="ghost" icon="i-heroicons-eye" :to="`/documents/${doc.id}`" />
        </UTooltip>
        <UTooltip text="Re-index">
          <UButton size="xs" variant="ghost" icon="i-heroicons-arrow-path" :loading="reindexing" @click="doReindex" />
        </UTooltip>
        <UTooltip text="Edit">
          <UButton size="xs" variant="ghost" icon="i-heroicons-pencil" :to="`/admin/documents/${doc.id}`" />
        </UTooltip>
        <UTooltip text="Hapus">
          <UButton size="xs" variant="ghost" color="red" icon="i-heroicons-trash" @click="emit('delete', doc)" />
        </UTooltip>
      </div>

      <!-- Arrow (public mode) -->
      <UIcon
        v-else
        name="i-heroicons-chevron-right"
        class="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors shrink-0"
      />
    </div>
  </component>
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
const typeColor = computed(() => TYPE_COLORS[props.doc.type] || 'gray')
const statusColor = computed(() => STATUS_COLORS[props.doc.status || ''] || 'gray')

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
