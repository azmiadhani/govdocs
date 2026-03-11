<template>
  <div>
    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-8 w-64" />
      <USkeleton class="h-4 w-40" />
      <USkeleton class="h-48 rounded-xl" />
    </div>

    <div v-else-if="doc">
      <!-- Breadcrumb -->
      <UBreadcrumb
        :links="[{ label: 'Dokumen' }, { label: doc.title }]"
        class="mb-6"
      />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: metadata + actions -->
        <div class="lg:col-span-1 space-y-4">
          <UCard>
            <template #header>
              <div class="flex items-start justify-between gap-2">
                <h1 class="font-bold text-lg leading-snug">{{ doc.title }}</h1>
                <UBadge :label="doc.status" :color="statusColor" />
              </div>
            </template>

            <dl class="space-y-3 text-sm">
              <div>
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Jenis</dt>
                <dd class="font-medium capitalize">{{ doc.type }}</dd>
              </div>
              <div v-if="doc.ministry">
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Kementerian</dt>
                <dd class="font-medium">{{ doc.ministry }}</dd>
              </div>
              <div v-if="doc.publishedAt">
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Diterbitkan</dt>
                <dd class="font-medium">{{ formatDate(doc.publishedAt) }}</dd>
              </div>
              <div v-if="doc.pageCount">
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Halaman</dt>
                <dd class="font-medium">{{ doc.pageCount }}</dd>
              </div>
              <div v-if="doc.tags?.length">
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Label</dt>
                <dd class="flex flex-wrap gap-1 mt-1">
                  <UBadge v-for="tag in doc.tags" :key="tag" :label="tag" variant="outline" size="xs" color="gray" />
                </dd>
              </div>
            </dl>

            <template #footer>
              <div class="flex gap-2">
                <UButton
                  :to="`/chat/${doc.id}`"
                  icon="i-heroicons-chat-bubble-left-right"
                  size="sm"
                  block
                >
                  Chat tentang dokumen ini
                </UButton>
              </div>
            </template>
          </UCard>

          <DocumentKeyPoints :summary="doc.summary ?? null" />
        </div>

        <!-- Right: summary -->
        <div class="lg:col-span-2 space-y-4">
          <DocumentSummary :document-id="doc.id" />
        </div>
      </div>
    </div>

    <div v-else>
      <UAlert color="red" title="Dokumen tidak ditemukan" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { fetchDocument } = useDocuments()

const doc = ref<Document | null>(null)
const pending = ref(true)

onMounted(async () => {
  try {
    doc.value = await fetchDocument(route.params.id as string)
  } finally {
    pending.value = false
  }
})

const statusColor = computed(() => {
  const map: Record<string, string> = { indexed: 'green', pending: 'yellow', error: 'red' }
  return map[doc.value?.status || ''] || 'gray'
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

useHead(() => ({
  title: doc.value ? `${doc.value.title} | GovDocs AI` : 'GovDocs AI',
}))
</script>
