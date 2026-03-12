<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex gap-8">
      <!-- Filter sidebar -->
      <aside class="w-64 shrink-0 hidden md:block">
        <div class="sticky top-20">
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Filter Dokumen</h2>
          <FilterPanel
            :q="q"
            :sort="sort"
            :selected-types="selectedTypes"
            :selected-ministries="selectedMinistries"
            :available-types="availableTypes"
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
        <!-- Header -->
        <div class="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ q ? `Hasil untuk "${q}"` : 'Semua Dokumen' }}
            </h1>
            <p class="text-sm text-gray-500 mt-0.5">{{ total.toLocaleString('id-ID') }} dokumen ditemukan</p>
          </div>
          <!-- Actions row -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Smart Search trigger -->
            <UButton
              size="sm"
              icon="i-heroicons-sparkles"
              color="primary"
              variant="soft"
              label="Cari Cerdas"
              class="hidden sm:flex"
              @click="openSmartSearch"
            />
            <UButton
              size="sm"
              icon="i-heroicons-sparkles"
              color="primary"
              variant="soft"
              class="sm:hidden"
              @click="openSmartSearch"
            />
            <!-- View toggle -->
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
        <div v-if="pending">
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <USkeleton v-for="i in 9" :key="i" class="h-52 rounded-xl" />
          </div>
          <div v-else class="space-y-2">
            <USkeleton v-for="i in 9" :key="i" class="h-16 rounded-xl" />
          </div>
        </div>

        <!-- Grid view -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DocumentCard v-for="doc in documents" :key="doc.id" :doc="doc" />
          <div v-if="!documents.length" class="col-span-3 text-center py-16 text-gray-400">
            <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p class="text-sm">Tidak ada dokumen yang cocok</p>
          </div>
        </div>

        <!-- List view -->
        <div v-else class="space-y-2">
          <DocumentListItem v-for="doc in documents" :key="doc.id" :doc="doc" />
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

    <!-- Smart Search Modal -->
    <UModal v-model="smartSearchOpen" :ui="{ width: 'max-w-3xl' }">
      <UCard :ui="{ body: { padding: 'p-0' }, header: { padding: 'px-5 pt-5 pb-0' }, footer: { padding: 'p-0' } }">
        <template #header>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 class="font-semibold text-gray-900 dark:text-white text-base leading-tight">Pencarian Cerdas</h2>
                <p class="text-xs text-gray-400">Tanyakan apa saja dalam bahasa natural</p>
              </div>
            </div>
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" size="sm" @click="smartSearchOpen = false" />
          </div>
          <!-- Query input -->
          <form @submit.prevent="runSmartSearch">
            <div class="flex gap-2">
              <UInput
                v-model="smartQuery"
                placeholder="Contoh: Peraturan terbaru tentang pengadaan barang dan jasa..."
                icon="i-heroicons-magnifying-glass"
                class="flex-1"
                size="md"
                autofocus
                :disabled="ssLoading"
              />
              <UButton
                type="submit"
                size="md"
                icon="i-heroicons-sparkles"
                :loading="ssLoading"
                :disabled="!smartQuery.trim()"
              >
                Cari
              </UButton>
            </div>
          </form>
        </template>

        <!-- Results area -->
        <div class="px-5 py-5 max-h-[65vh] overflow-y-auto">
          <!-- Idle state -->
          <div
            v-if="!ssLoading && !ssResult && !ssError"
            class="py-10 text-center text-gray-400"
          >
            <UIcon name="i-heroicons-magnifying-glass-circle" class="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p class="text-sm">Masukkan pertanyaan di atas untuk memulai pencarian semantik</p>
            <p class="text-xs text-gray-300 mt-1">Sistem akan mencari dan merangkum dokumen yang relevan</p>
          </div>

          <SmartSearchResult
            v-else
            :loading="ssLoading"
            :result="ssResult"
            :error="ssError"
            :query="ssLastQuery"
          />
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

definePageMeta({ layout: 'public' })

const route = useRoute()
const limit = 12

// URL-synced state
const q = ref((route.query.q as string) || '')
const sort = ref((route.query.sort as string) || 'newest')
const selectedTypes = ref<string[]>(route.query.type ? [route.query.type as string] : [])
const selectedMinistries = ref<string[]>(route.query.ministry ? [route.query.ministry as string] : [])
const page = ref(parseInt(route.query.page as string) || 1)

// Flag to skip watcher when URL change is triggered by us (not external navigation)
let internalNav = false

// Sync state from URL only when navigating here from an external page (e.g. landing page chips)
watch(() => route.query, (newQuery) => {
  if (internalNav) { internalNav = false; return }
  q.value = (newQuery.q as string) || ''
  sort.value = (newQuery.sort as string) || 'newest'
  selectedTypes.value = newQuery.type ? [newQuery.type as string] : []
  selectedMinistries.value = newQuery.ministry ? [newQuery.ministry as string] : []
  page.value = parseInt(newQuery.page as string) || 1
  load()
})

// View mode (persisted in localStorage)
const viewMode = ref<'grid' | 'list'>('grid')
onMounted(() => {
  const saved = localStorage.getItem('docViewMode')
  if (saved === 'list' || saved === 'grid') viewMode.value = saved
})
function setViewMode(m: 'grid' | 'list') {
  viewMode.value = m
  localStorage.setItem('docViewMode', m)
}

// Fetch
const documents = ref<Document[]>([])
const total = ref(0)
const totalPages = ref(1)
const availableTypes = ref<string[]>([])
const availableMinistries = ref<string[]>([])
const pending = ref(true)

async function load() {
  pending.value = true
  try {
    const params: Record<string, any> = {
      page: page.value,
      limit,
      sort: sort.value,
    }
    if (q.value) params.q = q.value
    if (selectedTypes.value.length === 1) params.type = selectedTypes.value[0]
    if (selectedMinistries.value.length === 1) params.ministry = selectedMinistries.value[0]

    const data = await $fetch<any>('/api/public/documents', { params })
    documents.value = data.documents
    total.value = data.total
    totalPages.value = data.totalPages
    availableTypes.value = data.availableTypes
    availableMinistries.value = data.availableMinistries
  } finally {
    pending.value = false
  }
}

function syncUrl() {
  const query: Record<string, any> = {}
  if (q.value) query.q = q.value
  if (sort.value !== 'newest') query.sort = sort.value
  if (selectedTypes.value.length) query.type = selectedTypes.value[0]
  if (selectedMinistries.value.length) query.ministry = selectedMinistries.value[0]
  if (page.value > 1) query.page = page.value
  internalNav = true
  navigateTo({ query }, { replace: true })
}

function onQ(v: string) { q.value = v; page.value = 1; syncUrl(); load() }
function onSort(v: string) { sort.value = v; page.value = 1; syncUrl(); load() }
function onTypes(v: string[]) { selectedTypes.value = v; page.value = 1; syncUrl(); load() }
function onMinistries(v: string[]) { selectedMinistries.value = v; page.value = 1; syncUrl(); load() }
function onPageChange(p: number) { page.value = p; syncUrl(); load() }
function onReset() {
  q.value = ''; sort.value = 'newest'; selectedTypes.value = []; selectedMinistries.value = []
  page.value = 1; syncUrl(); load()
}

onMounted(load)

// Smart Search modal
const smartSearchOpen = ref(false)
const smartQuery = ref('')
const { loading: ssLoading, result: ssResult, error: ssError, lastQuery: ssLastQuery, search: ssSearch, clear: ssClear } = useSmartSearch()

function openSmartSearch() {
  // Pre-fill with current keyword search if any
  if (q.value && !smartQuery.value) smartQuery.value = q.value
  ssClear()
  smartSearchOpen.value = true
}

function runSmartSearch() {
  ssSearch(smartQuery.value)
}

useHead({ title: computed(() => q.value ? `Hasil: "${q.value}"` : 'Dokumen') })
</script>
