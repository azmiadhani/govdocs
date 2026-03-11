<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dasbor Admin</h1>
        <p class="text-sm text-gray-500">Kelola dokumen dan pengindeksan</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="showUpload = true">Unggah Dokumen</UButton>
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
        <h2 class="font-semibold">Semua Dokumen</h2>
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
  { key: 'title', label: 'Judul' },
  { key: 'type', label: 'Jenis' },
  { key: 'ministry', label: 'Kementerian' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]

const stats = computed(() => [
  { label: 'Total Dokumen', value: total.value },
  { label: 'Terindeks', value: documents.value.filter((d) => d.status === 'indexed').length },
  { label: 'Tertunda', value: documents.value.filter((d) => d.status === 'pending').length },
  { label: 'Error', value: documents.value.filter((d) => d.status === 'error').length },
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
  if (!confirm(`Hapus "${doc.title}"? Tindakan ini tidak dapat dibatalkan.`)) return
  await deleteDocument(doc.id)
}

async function onUploaded() {
  showUpload.value = false
  await fetchDocuments({ limit: 100 })
  // Poll until no documents are pending (indexing runs in background)
  const poll = setInterval(async () => {
    await fetchDocuments({ limit: 100 })
    if (!documents.value.some((d) => d.status === 'pending')) {
      clearInterval(poll)
    }
  }, 3000)
}

onMounted(() => fetchDocuments({ limit: 100 }))
</script>
