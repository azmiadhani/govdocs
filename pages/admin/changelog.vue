<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Kelola Changelog</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ entries.length }} entri total</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreate">Tambah Entri</UButton>
    </div>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <div v-if="pending" class="p-8 text-center text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2" />
        Memuat...
      </div>
      <div v-else-if="!entries.length" class="p-8 text-center text-gray-400">
        <UIcon name="i-heroicons-clock" class="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p class="text-sm">Belum ada entri changelog</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead class="border-b border-gray-200 dark:border-gray-700">
          <tr class="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
            <th class="px-4 py-3">Versi</th>
            <th class="px-4 py-3">Judul</th>
            <th class="px-4 py-3">Tipe</th>
            <th class="px-4 py-3">Tanggal</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="entry in entries" :key="entry.id" class="hover:bg-gray-50 dark:hover:bg-gray-900">
            <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">v{{ entry.version }}</td>
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">{{ entry.title }}</td>
            <td class="px-4 py-3">
              <UBadge :color="TYPE_COLORS[entry.type] || 'gray'" variant="soft" size="xs">
                {{ TYPE_LABELS[entry.type] || entry.type }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(entry.releasedAt) }}</td>
            <td class="px-4 py-3">
              <UBadge :color="entry.published ? 'green' : 'gray'" variant="soft" size="xs">
                {{ entry.published ? 'Dipublikasi' : 'Draft' }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-pencil"
                  @click="openEdit(entry)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="red"
                  icon="i-heroicons-trash"
                  @click="confirmDelete(entry)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model="showModal" :ui="{ width: 'max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ editingEntry ? 'Edit Entri' : 'Tambah Entri Baru' }}
            </h3>
            <UButton variant="ghost" icon="i-heroicons-x-mark" size="xs" @click="showModal = false" />
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Versi" required>
              <UInput v-model="form.version" placeholder="1.0.0" />
            </UFormGroup>
            <UFormGroup label="Tipe" required>
              <USelect v-model="form.type" :options="typeOptions" />
            </UFormGroup>
          </div>
          <UFormGroup label="Judul" required>
            <UInput v-model="form.title" placeholder="Judul perubahan" />
          </UFormGroup>
          <UFormGroup label="Tanggal Rilis" required>
            <UInput v-model="form.releasedAt" type="date" />
          </UFormGroup>
          <UFormGroup label="Konten (Markdown)" required>
            <UTextarea v-model="form.content" placeholder="Deskripsi perubahan dalam format Markdown..." :rows="6" />
          </UFormGroup>
          <UFormGroup>
            <UCheckbox v-model="form.published" label="Publikasikan sekarang" />
          </UFormGroup>

          <UAlert v-if="formError" color="red" :description="formError" />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showModal = false">Batal</UButton>
            <UButton :loading="saving" @click="save">
              {{ editingEntry ? 'Simpan Perubahan' : 'Tambah Entri' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Delete Confirm Modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="font-semibold text-gray-900 dark:text-white">Hapus Entri</h3>
        </template>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Yakin ingin menghapus entri <strong>"{{ deletingEntry?.title }}"</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showDeleteModal = false">Batal</UButton>
            <UButton color="red" :loading="deleting" @click="doDelete">Hapus</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const TYPE_LABELS: Record<string, string> = {
  feature: 'Fitur Baru',
  improvement: 'Peningkatan',
  fix: 'Perbaikan',
  security: 'Keamanan',
  breaking: 'Breaking Change',
}

const TYPE_COLORS: Record<string, string> = {
  feature: 'primary',
  improvement: 'blue',
  fix: 'green',
  security: 'orange',
  breaking: 'red',
}

const typeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))

const { data, pending, refresh } = await useAsyncData('admin-changelog', () =>
  $fetch<any[]>('/api/admin/changelog'),
)
const entries = computed(() => data.value || [])

// Modal state
const showModal = ref(false)
const editingEntry = ref<any>(null)
const form = reactive({
  version: '',
  title: '',
  content: '',
  type: 'feature',
  published: false,
  releasedAt: new Date().toISOString().slice(0, 10),
})
const formError = ref('')
const saving = ref(false)

function openCreate() {
  editingEntry.value = null
  form.version = ''
  form.title = ''
  form.content = ''
  form.type = 'feature'
  form.published = false
  form.releasedAt = new Date().toISOString().slice(0, 10)
  formError.value = ''
  showModal.value = true
}

function openEdit(entry: any) {
  editingEntry.value = entry
  form.version = entry.version
  form.title = entry.title
  form.content = entry.content
  form.type = entry.type
  form.published = entry.published
  form.releasedAt = entry.releasedAt
  formError.value = ''
  showModal.value = true
}

async function save() {
  if (!form.version || !form.title || !form.content || !form.releasedAt) {
    formError.value = 'Semua kolom wajib diisi'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    if (editingEntry.value) {
      await $fetch(`/api/admin/changelog/${editingEntry.value.id}`, { method: 'PATCH', body: form })
    } else {
      await $fetch('/api/admin/changelog', { method: 'POST', body: form })
    }
    showModal.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err.data?.message || 'Gagal menyimpan entri'
  } finally {
    saving.value = false
  }
}

// Delete
const showDeleteModal = ref(false)
const deletingEntry = ref<any>(null)
const deleting = ref(false)

function confirmDelete(entry: any) {
  deletingEntry.value = entry
  showDeleteModal.value = true
}

async function doDelete() {
  if (!deletingEntry.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/changelog/${deletingEntry.value.id}`, { method: 'DELETE' })
    showDeleteModal.value = false
    await refresh()
  } catch {
    // ignore
  } finally {
    deleting.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

useHead({ title: 'Kelola Changelog | Admin' })
</script>
