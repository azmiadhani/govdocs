<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Document Library</h1>
      <p class="text-sm text-gray-500">{{ total }} government documents</p>
    </div>

    <!-- Filters -->
    <DocumentFilters
      class="mb-6"
      :search="filters.search"
      :type="filters.type"
      :ministry="filters.ministry"
      @update:search="onFilter('search', $event)"
      @update:type="onFilter('type', $event)"
      @update:ministry="onFilter('ministry', $event)"
    />

    <!-- Content -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <USkeleton v-for="i in 8" :key="i" class="h-48 rounded-xl" />
    </div>

    <DocumentGrid v-else :documents="documents" />

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
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { documents, total, totalPages, loading, fetchDocuments } = useDocuments()

const page = ref(1)
const limit = 20
const filters = reactive({ search: '', type: '', ministry: '' })

let debounceTimer: ReturnType<typeof setTimeout>

async function load() {
  await fetchDocuments({
    page: page.value,
    limit,
    search: filters.search || undefined,
    type: (filters.type as any) || undefined,
    ministry: filters.ministry || undefined,
  })
}

function onFilter(key: keyof typeof filters, value: string) {
  filters[key] = value
  page.value = 1
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 300)
}

function onPageChange(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>
