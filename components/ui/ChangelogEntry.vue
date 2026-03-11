<template>
  <div class="relative pl-8">
    <!-- Timeline dot -->
    <div
      class="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-950 shadow"
      :class="dotClass"
    />
    <!-- Timeline line (not on last item) -->
    <div v-if="!isLast" class="absolute left-[7px] top-5 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

    <div class="pb-10">
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <UBadge :color="badgeColor" variant="soft" size="xs">{{ typeLabel }}</UBadge>
        <span class="text-xs font-mono text-gray-400 dark:text-gray-500">v{{ entry.version }}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">
          {{ formatDate(entry.releasedAt) }}
        </span>
      </div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2">{{ entry.title }}</h3>
      <div class="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
        <MDC :value="entry.content" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  entry: {
    id: string
    version: string
    title: string
    content: string
    type: string
    releasedAt: string
  }
  isLast?: boolean
}>()

const TYPE_CONFIG: Record<string, { label: string; color: 'primary' | 'green' | 'blue' | 'orange' | 'red'; dot: string }> = {
  feature: { label: 'Fitur Baru', color: 'primary', dot: 'bg-primary-500' },
  improvement: { label: 'Peningkatan', color: 'blue', dot: 'bg-blue-500' },
  fix: { label: 'Perbaikan', color: 'green', dot: 'bg-green-500' },
  security: { label: 'Keamanan', color: 'orange', dot: 'bg-orange-500' },
  breaking: { label: 'Breaking Change', color: 'red', dot: 'bg-red-500' },
}

const config = computed(() => TYPE_CONFIG[props.entry.type] || TYPE_CONFIG.feature)
const typeLabel = computed(() => config.value.label)
const badgeColor = computed(() => config.value.color)
const dotClass = computed(() => config.value.dot)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
