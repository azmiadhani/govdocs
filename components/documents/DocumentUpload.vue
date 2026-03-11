<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold">Unggah Dokumen</h3>
    </template>

    <UForm :state="form" class="space-y-4" @submit="handleSubmit">
      <UFormGroup label="Judul" required>
        <UInput v-model="form.title" placeholder="Judul dokumen" />
      </UFormGroup>

      <div class="grid grid-cols-2 gap-4">
        <UFormGroup label="Jenis" required>
          <USelect v-model="form.type" :options="typeOptions" />
        </UFormGroup>
        <UFormGroup label="Kementerian">
          <UInput v-model="form.ministry" placeholder="Kementerian penerbit" />
        </UFormGroup>
      </div>

      <UFormGroup label="Tanggal Terbit">
        <UInput v-model="form.publishedAt" type="date" />
      </UFormGroup>

      <UFormGroup label="File PDF" required>
        <div
          class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
          @click="fileInput?.click()"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p class="text-sm text-gray-500">
            {{ file ? file.name : 'Klik atau seret file PDF ke sini' }}
          </p>
          <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="onFileChange" />
        </div>
      </UFormGroup>

      <UAlert v-if="error" color="red" :description="error" />

      <UAlert
        v-if="uploaded"
        color="green"
        title="Unggah berhasil"
        description="Dokumen sedang diindeks di latar belakang. Status akan diperbarui menjadi 'terindeks' sebentar lagi."
      />

      <div class="flex justify-end gap-2">
        <UButton type="button" variant="ghost" @click="emit('cancel')">Batal</UButton>
        <UButton type="submit" :loading="uploading" :disabled="!file || !form.title || uploaded">
          Upload & Index
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'uploaded', docId: string): void
  (e: 'cancel'): void
}>()

const { uploadDocument } = useDocuments()

const fileInput = ref<HTMLInputElement>()
const file = ref<File | null>(null)
const uploading = ref(false)
const error = ref('')
const uploaded = ref(false)

const form = reactive({
  title: '',
  type: 'other',
  ministry: '',
  publishedAt: '',
})

const typeOptions = [
  { label: 'Undang-Undang', value: 'law' },
  { label: 'Peraturan', value: 'regulation' },
  { label: 'Keputusan', value: 'decree' },
  { label: 'Surat Edaran', value: 'circular' },
  { label: 'Pedoman', value: 'guideline' },
  { label: 'Lainnya', value: 'other' },
]

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
}

function onDrop(e: DragEvent) {
  file.value = e.dataTransfer?.files[0] ?? null
}

async function handleSubmit() {
  if (!file.value) return
  uploading.value = true
  error.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file.value)
    fd.append('title', form.title)
    fd.append('type', form.type)
    fd.append('ministry', form.ministry)
    if (form.publishedAt) fd.append('publishedAt', form.publishedAt)
    fd.append('tags', JSON.stringify([]))
    const doc = await uploadDocument(fd)
    uploaded.value = true
    setTimeout(() => emit('uploaded', doc.id), 1500)
  } catch (err: any) {
    error.value = err.data?.message || 'Unggah gagal. Silakan coba lagi.'
  } finally {
    uploading.value = false
  }
}
</script>
