<template>
  <div class="border-b border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-900">
    <div class="flex items-center gap-2 mb-2">
      <UIcon name="i-heroicons-funnel" class="w-4 h-4 text-gray-400" />
      <span class="text-xs font-medium text-gray-500">Document scope</span>
    </div>
    <div class="flex flex-wrap gap-2">
      <UBadge
        label="All Documents"
        :color="selected.length === 0 ? 'primary' : 'gray'"
        class="cursor-pointer"
        @click="selected = []"
      />
      <UBadge
        v-for="doc in documents"
        :key="doc.id"
        :label="doc.title"
        :color="selected.includes(doc.id) ? 'primary' : 'gray'"
        class="cursor-pointer truncate max-w-[180px]"
        @click="toggleDoc(doc.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

const props = defineProps<{ documents: Document[] }>()
const emit = defineEmits<{ (e: 'update:selected', v: string[]): void }>()

const selected = ref<string[]>([])

watch(selected, (val) => emit('update:selected', val))

function toggleDoc(id: string) {
  const idx = selected.value.indexOf(id)
  if (idx >= 0) selected.value.splice(idx, 1)
  else selected.value.push(id)
}
</script>
