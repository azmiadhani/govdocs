<template>
  <div v-if="documents.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <DocumentCard v-for="doc in documents" :key="doc.id" :doc="doc" />
  </div>
  <div v-else class="text-center py-20 text-gray-400">
    <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 mx-auto mb-3 opacity-50" />
    <p class="text-sm">No documents found</p>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

defineProps<{ documents: Document[] }>()
</script>
