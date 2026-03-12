<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Dokumen</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ total.toLocaleString('id-ID') }} dokumen tersedia</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="showUpload = true">Unggah Dokumen</UButton>
    </div>

    <!-- Upload modal -->
    <UModal v-model="showUpload" :ui="{ width: 'sm:max-w-xl' }">
      <DocumentUpload @uploaded="onUploaded" @cancel="showUpload = false" />
    </UModal>

    <!-- Unread feedback alert -->
    <UAlert
      v-if="unreadFeedback > 0"
      icon="i-heroicons-chat-bubble-left-ellipsis"
      color="orange"
      variant="soft"
      :title="`${unreadFeedback} pesan feedback belum dibaca`"
      class="mb-6"
    >
      <template #description>
        <NuxtLink to="/admin/feedback" class="underline font-medium">Lihat feedback</NuxtLink>
      </template>
    </UAlert>

    <!-- Stats bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <UCard v-for="stat in stats" :key="stat.label" :class="stat.highlight ? 'ring-1 ring-red-200 dark:ring-red-800' : ''">
        <div
          class="text-2xl font-bold"
          :class="stat.highlight ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'"
        >
          {{ stat.value }}
        </div>
        <div class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</div>
      </UCard>
    </div>

    <!-- Filter + content -->
    <div class="flex gap-6">
      <!-- Filter sidebar -->
      <aside class="w-56 shrink-0 hidden md:block">
        <div class="sticky top-6">
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Filter Dokumen</h2>
          <FilterPanel
            :q="q"
            :sort="sort"
            :selected-types="selectedTypes"
            :selected-ministries="selectedMinistries"
            :available-types="AVAILABLE_TYPES"
            :available-ministries="availableMinistries"
            @update:q="onQ"
            @update:sort="onSort"
            @update:selected-types="onTypes"
            @update:selected-ministries="onMinistries"
            @reset="onReset"
          />
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 min-w-0">
        <!-- View toggle -->
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-gray-500">
            <span v-if="q">Hasil untuk "<strong>{{ q }}</strong>"</span>
            <span v-else>Semua dokumen</span>
          </p>
          <div class="flex items-center gap-1">
            <UButton
              :variant="viewMode === 'grid' ? 'solid' : 'ghost'"
              icon="i-heroicons-squares-2x2"
              size="sm"
              color="gray"
              @click="setViewMode('grid')"
            />
            <UButton
              :variant="viewMode === 'list' ? 'solid' : 'ghost'"
              icon="i-heroicons-list-bullet"
              size="sm"
              color="gray"
              @click="setViewMode('list')"
            />
          </div>
        </div>

        <!-- Loading skeletons -->
        <div v-if="loading">
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <USkeleton v-for="i in 9" :key="i" class="h-52 rounded-xl" />
          </div>
          <div v-else class="space-y-2">
            <USkeleton v-for="i in 9" :key="i" class="h-16 rounded-xl" />
          </div>
        </div>

        <!-- Grid view -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DocumentCard
            v-for="doc in documents"
            :key="doc.id"
            :doc="doc"
            admin-mode
            @delete="confirmDelete"
          />
          <div v-if="!documents.length" class="col-span-3 text-center py-16 text-gray-400">
            <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p class="text-sm">Tidak ada dokumen yang cocok</p>
          </div>
        </div>

        <!-- List view -->
        <div v-else class="space-y-2">
          <DocumentListItem
            v-for="doc in documents"
            :key="doc.id"
            :doc="doc"
            admin-mode
            @delete="confirmDelete"
          />
          <div v-if="!documents.length" class="text-center py-16 text-gray-400">
            <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p class="text-sm">Tidak ada dokumen yang cocok</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <UPagination
            v-model="page"
            :total="total"
            :page-count="limit"
            @update:model-value="onPageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const limit = 12
const q = ref('')
const sort = ref('newest')
const selectedTypes = ref<string[]>([])
const selectedMinistries = ref<string[]>([])
const page = ref(1)
const viewMode = ref<'grid' | 'list'>('grid')
const showUpload = ref(false)
const unreadFeedback = ref(0)

const AVAILABLE_TYPES = ['law', 'regulation', 'decree', 'circular', 'guideline', 'other']

const { documents, total, totalPages, loading, fetchDocuments, deleteDocument } = useDocuments()

// Compute unique ministries from current results
const availableMinistries = computed(() =>
  [...new Set(documents.value.map((d) => d.ministry).filter(Boolean) as string[])].sort(),
)

const stats = computed(() => {
  const byStatus = (s: string) => documents.value.filter((d) => d.status === s).length
  return [
    { label: 'Total', value: total.value, highlight: false },
    { label: 'Terindeks', value: byStatus('indexed'), highlight: false },
    { label: 'Tertunda', value: byStatus('pending'), highlight: false },
    { label: 'Error', value: byStatus('error'), highlight: byStatus('error') > 0 },
  ]
})

// Sort mapping from FilterPanel values → API params
function sortParams(s: string) {
  const map: Record<string, { sort: string; order: string }> = {
    newest: { sort: 'createdAt', order: 'DESC' },
    oldest: { sort: 'createdAt', order: 'ASC' },
    views: { sort: 'viewCount', order: 'DESC' },
    relevance: { sort: 'createdAt', order: 'DESC' },
  }
  return map[s] || map.newest
}

async function load() {
  const { sort: sortBy, order } = sortParams(sort.value)
  await fetchDocuments({
    page: page.value,
    limit,
    sort: sortBy,
    order,
    search: q.value || undefined,
    type: selectedTypes.value[0] || undefined,
    ministry: selectedMinistries.value[0] || undefined,
  } as any)
}

onMounted(async () => {
  const saved = localStorage.getItem('adminDocViewMode')
  if (saved === 'list' || saved === 'grid') viewMode.value = saved
  await load()
  try {
    const data = await $fetch<{ unreadCount: number }>('/api/admin/feedback?limit=1')
    unreadFeedback.value = data.unreadCount
  } catch {}
})

function setViewMode(m: 'grid' | 'list') {
  viewMode.value = m
  localStorage.setItem('adminDocViewMode', m)
}

function onQ(v: string) { q.value = v; page.value = 1; load() }
function onSort(v: string) { sort.value = v; page.value = 1; load() }
function onTypes(v: string[]) { selectedTypes.value = v; page.value = 1; load() }
function onMinistries(v: string[]) { selectedMinistries.value = v; page.value = 1; load() }
function onPageChange(p: number) { page.value = p; load() }
function onReset() {
  q.value = ''; sort.value = 'newest'; selectedTypes.value = []; selectedMinistries.value = []
  page.value = 1; load()
}

async function confirmDelete(doc: Document) {
  if (!confirm(`Hapus "${doc.title}"? Tindakan ini tidak dapat dibatalkan.`)) return
  await deleteDocument(doc.id)
}

async function onUploaded() {
  showUpload.value = false
  await load()
  const poll = setInterval(async () => {
    await load()
    if (!documents.value.some((d) => d.status === 'pending')) clearInterval(poll)
  }, 3000)
}

useHead({ title: 'Manajemen Dokumen' })
</script>
