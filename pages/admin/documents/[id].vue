<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <UBreadcrumb
        :links="[{ label: 'Admin', to: '/admin' }, { label: 'Edit Dokumen' }]"
        class="mb-4"
      />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Edit Dokumen</h1>
    </div>

    <div v-if="loading" class="space-y-4">
      <USkeleton v-for="i in 4" :key="i" class="h-10 rounded-lg" />
    </div>

    <UCard v-else-if="doc">
      <UForm :state="form" class="space-y-4" @submit="save">
        <UFormGroup label="Judul" required>
          <UInput v-model="form.title" />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Jenis">
            <USelect v-model="form.type" :options="typeOptions" />
          </UFormGroup>
          <UFormGroup label="Kementerian">
            <UInput v-model="form.ministry" />
          </UFormGroup>
        </div>

        <UFormGroup label="Tanggal Terbit">
          <UInput v-model="form.publishedAt" type="date" />
        </UFormGroup>

        <!-- Status info (read-only) -->
        <UFormGroup label="Status Indeks">
          <div class="flex items-center gap-2 mt-1">
            <UBadge :label="doc.status" :color="statusColor" />
            <span v-if="doc.status === 'indexed'" class="text-xs text-gray-400">
              Dokumen terindeks dan dapat dicari
            </span>
          </div>
        </UFormGroup>

        <UAlert v-if="error" color="red" :description="error" />
        <UAlert v-if="saved" color="green" description="Berhasil disimpan" />

        <div class="flex gap-2 pt-2">
          <UButton type="submit" :loading="saving">Simpan Perubahan</UButton>
          <UButton
            variant="outline"
            :loading="reindexing"
            icon="i-heroicons-arrow-path"
            @click="reindex"
          >
            Re-index
          </UButton>
          <UButton to="/admin" variant="ghost">Batal</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { fetchDocument, updateDocument } = useDocuments()

const doc = ref<Document | null>(null)
const loading = ref(true)
const saving = ref(false)
const reindexing = ref(false)
const error = ref('')
const saved = ref(false)

const form = reactive({ title: '', type: 'other', ministry: '', publishedAt: '' })

const typeOptions = [
  { label: 'Undang-Undang', value: 'law' },
  { label: 'Peraturan', value: 'regulation' },
  { label: 'Keputusan', value: 'decree' },
  { label: 'Surat Edaran', value: 'circular' },
  { label: 'Pedoman', value: 'guideline' },
  { label: 'Lainnya', value: 'other' },
]

const statusColor = computed(() => {
  const map: Record<string, string> = { indexed: 'green', pending: 'yellow', error: 'red' }
  return map[doc.value?.status || ''] || 'gray'
})

onMounted(async () => {
  try {
    const d = await fetchDocument(route.params.id as string)
    doc.value = d
    form.title = d.title
    form.type = d.type
    form.ministry = d.ministry || ''
    form.publishedAt = d.publishedAt ? d.publishedAt.split('T')[0] : ''
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  error.value = ''
  saved.value = false
  try {
    await updateDocument(doc.value!.id, form)
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

async function reindex() {
  reindexing.value = true
  try {
    await $fetch('/api/admin/reindex', { method: 'POST', body: { documentId: doc.value!.id } })
    doc.value = await fetchDocument(doc.value!.id)
  } finally {
    reindexing.value = false
  }
}
</script>
