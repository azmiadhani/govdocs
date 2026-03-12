<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-4">
        <USkeleton class="h-8 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
        <USkeleton class="h-[500px] rounded-xl" />
      </div>
      <div class="space-y-4">
        <USkeleton class="h-64 rounded-xl" />
        <USkeleton class="h-32 rounded-xl" />
      </div>
    </div>

    <div v-else-if="doc">
      <UBreadcrumb :links="[{ label: 'Dokumen', to: '/documents' }, { label: doc.title }]" class="mb-6" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left column (65%) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Document header -->
          <div>
            <div class="flex flex-wrap gap-2 mb-3">
              <UBadge :label="typeLabel" :color="typeColor" />
              <UBadge v-if="doc.ministry" :label="doc.ministry" variant="outline" color="gray" />
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white leading-snug mb-3">{{ doc.title }}</h1>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500">
              <span v-if="doc.publishedAt" class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                {{ formatDate(doc.publishedAt) }}
              </span>
              <span v-if="doc.pageCount" class="flex items-center gap-1">
                <UIcon name="i-heroicons-document" class="w-4 h-4" />
                {{ doc.pageCount }} halaman
              </span>
              <span v-if="doc.viewCount" class="flex items-center gap-1">
                <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                {{ doc.viewCount }} dilihat
              </span>
            </div>
            <div v-if="doc.tags?.length" class="flex flex-wrap gap-1 mt-3">
              <UBadge v-for="tag in doc.tags" :key="tag" :label="tag" variant="outline" size="xs" color="gray" />
            </div>
          </div>

          <!-- PDF Preview -->
          <div v-if="doc.filePath">
            <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Pratinjau Dokumen</h2>
            <PdfPreview :src="previewUrl" />
            <div class="flex gap-2 mt-3">
              <UButton :href="previewUrl" target="_blank" variant="outline" size="sm" icon="i-heroicons-arrow-top-right-on-square">
                Buka Dokumen Penuh
              </UButton>
              <UButton :href="downloadUrl" size="sm" icon="i-heroicons-arrow-down-tray" download>
                Unduh PDF
              </UButton>
            </div>
          </div>

          <!-- Key Points -->
          <div>
            <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Poin Utama</h2>
            <div v-if="keyPoints?.length" class="space-y-2">
              <div v-for="(point, i) in keyPoints" :key="i" class="flex gap-3 p-3 bg-primary-50 dark:bg-primary-950/20 rounded-lg">
                <span class="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center shrink-0 font-bold">{{ i + 1 }}</span>
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ point }}</p>
              </div>
            </div>
            <div v-else class="flex items-center gap-2 text-sm text-gray-400 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <UIcon name="i-heroicons-information-circle" class="w-4 h-4 shrink-0" />
              Analisis AI belum tersedia untuk dokumen ini
            </div>
          </div>

          <!-- AI Summary -->
          <div>
            <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Ringkasan AI</h2>
            <div v-if="summary" class="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <MarkdownRenderer :content="summary" />
            </div>
            <div v-else class="flex items-center gap-2 text-sm text-gray-400 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <UIcon name="i-heroicons-information-circle" class="w-4 h-4 shrink-0" />
              Analisis AI belum tersedia untuk dokumen ini
            </div>
          </div>
        </div>

        <!-- Right column (35%) -->
        <div class="space-y-4">
          <!-- Document Info card -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-sm">Informasi Dokumen</h3>
            </template>
            <dl class="space-y-3 text-sm">
              <div>
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Jenis</dt>
                <dd class="font-medium">{{ typeLabel }}</dd>
              </div>
              <div v-if="doc.ministry">
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Kementerian</dt>
                <dd class="font-medium">{{ doc.ministry }}</dd>
              </div>
              <div v-if="doc.publishedAt">
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Diterbitkan</dt>
                <dd class="font-medium">{{ formatDate(doc.publishedAt) }}</dd>
              </div>
              <div v-if="doc.fileSize">
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Ukuran File</dt>
                <dd class="font-medium">{{ formatSize(doc.fileSize) }}</dd>
              </div>
              <div v-if="doc.pageCount">
                <dt class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Jumlah Halaman</dt>
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
              <UButton :href="downloadUrl" block icon="i-heroicons-arrow-down-tray" download>
                Unduh PDF
              </UButton>
            </template>
          </UCard>

          <!-- Chat card -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-sm flex items-center gap-2">
                <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4 text-primary-500" />
                Tanya Dokumen Ini
              </h3>
            </template>
            <p class="text-sm text-gray-500 mb-4">Gunakan AI untuk bertanya tentang isi dokumen ini secara interaktif.</p>
            <template v-if="isLoggedIn">
              <NuxtLink :to="`/chat/${doc.id}`">
                <UButton block icon="i-heroicons-chat-bubble-left-right">Mulai Chat</UButton>
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink :to="`/login?redirect=/chat/${doc.id}`">
                <UButton block variant="outline" icon="i-heroicons-lock-closed">Login untuk Chat</UButton>
              </NuxtLink>
            </template>
          </UCard>

          <!-- Related documents -->
          <UCard v-if="relatedDocuments.length">
            <template #header>
              <h3 class="font-semibold text-sm">Dokumen Terkait</h3>
            </template>
            <div class="space-y-3">
              <NuxtLink
                v-for="rel in relatedDocuments"
                :key="rel.id"
                :to="`/documents/${rel.id}`"
                class="block group"
              >
                <div class="flex gap-2 items-start">
                  <UBadge :label="rel.type" variant="subtle" size="xs" class="mt-0.5 shrink-0" />
                  <div>
                    <p class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                      {{ rel.title }}
                    </p>
                    <p v-if="rel.ministry" class="text-xs text-gray-400 mt-0.5">{{ rel.ministry }}</p>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </UCard>
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

definePageMeta({ layout: 'public' })

const route = useRoute()
const { isLoggedIn } = useAuth()

const doc = ref<Document | null>(null)
const summary = ref<string | null>(null)
const keyPoints = ref<string[] | null>(null)
const relatedDocuments = ref<any[]>([])
const pending = ref(true)

const TYPE_LABELS: Record<string, string> = {
  law: 'Undang-Undang', regulation: 'Peraturan', decree: 'Keputusan',
  circular: 'Surat Edaran', guideline: 'Pedoman', other: 'Lainnya',
}
const TYPE_COLORS: Record<string, string> = {
  law: 'red', regulation: 'blue', decree: 'purple',
  circular: 'orange', guideline: 'green', other: 'gray',
}

const typeLabel = computed(() => TYPE_LABELS[doc.value?.type || ''] || doc.value?.type || '')
const typeColor = computed(() => TYPE_COLORS[doc.value?.type || ''] || 'gray')

const filename = computed(() => doc.value?.filePath?.split('/').pop() || '')
const previewUrl = computed(() => `/api/public/files/${filename.value}?download=false`)
const downloadUrl = computed(() => `/api/public/files/${filename.value}?download=true`)

onMounted(async () => {
  try {
    const data = await $fetch<any>(`/api/public/documents/${route.params.id}`)
    doc.value = data.document
    summary.value = data.summary
    keyPoints.value = data.keyPoints
    relatedDocuments.value = data.relatedDocuments
  } finally {
    pending.value = false
  }
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

useHead(() => ({
  title: doc.value ? doc.value.title : 'Dokumen',
  meta: doc.value && summary.value
    ? [{ name: 'description', content: summary.value.slice(0, 160) }]
    : [],
}))
</script>
