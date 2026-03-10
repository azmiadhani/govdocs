<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p class="text-sm text-gray-500">Manage documents and indexing</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="showUpload = true">Upload Document</UButton>
    </div>

    <!-- Upload modal -->
    <UModal v-model="showUpload" :ui="{ width: 'sm:max-w-xl' }">
      <DocumentUpload
        @uploaded="onUploaded"
        @cancel="showUpload = false"
      />
    </UModal>

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</div>
        <div class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</div>
      </UCard>
    </div>

    <!-- Recent documents table -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">All Documents</h2>
      </template>

      <UTable
        :rows="documents"
        :columns="columns"
        :loading="loading"
      >
        <template #status-data="{ row }">
          <UBadge :label="row.status" :color="statusColor(row.status)" />
        </template>
        <template #actions-data="{ row }">
          <div class="flex gap-1">
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-arrow-path"
              :loading="reindexing === row.id"
              title="Re-index"
              @click="reindex(row.id)"
            />
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-pencil"
              :to="`/admin/documents/${row.id}`"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="red"
              icon="i-heroicons-trash"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

definePageMeta({ middleware: 'admin' })

const { documents, total, loading, fetchDocuments, deleteDocument } = useDocuments()

const showUpload = ref(false)
const reindexing = ref<string | null>(null)

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type' },
  { key: 'ministry', label: 'Ministry' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]

const stats = computed(() => [
  { label: 'Total Documents', value: total.value },
  { label: 'Indexed', value: documents.value.filter((d) => d.status === 'indexed').length },
  { label: 'Pending', value: documents.value.filter((d) => d.status === 'pending').length },
  { label: 'Errors', value: documents.value.filter((d) => d.status === 'error').length },
])

function statusColor(status: string) {
  const map: Record<string, string> = { indexed: 'green', pending: 'yellow', error: 'red' }
  return map[status] || 'gray'
}

async function reindex(docId: string) {
  reindexing.value = docId
  try {
    await $fetch('/api/admin/reindex', { method: 'POST', body: { documentId: docId } })
    await fetchDocuments({ limit: 100 })
  } finally {
    reindexing.value = null
  }
}

async function confirmDelete(doc: Document) {
  if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return
  await deleteDocument(doc.id)
}

async function onUploaded() {
  showUpload.value = false
  await fetchDocuments({ limit: 100 })
}

onMounted(() => fetchDocuments({ limit: 100 }))
</script>
