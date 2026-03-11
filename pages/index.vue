<template>
  <div>
    <!-- Hero -->
    <section class="relative bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;" />
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
          Ditenagai oleh AI
        </div>
        <h1 class="text-4xl sm:text-5xl font-bold leading-tight mb-4">
          Temukan & Pahami<br />
          <span class="text-yellow-300">Dokumen Pemerintah</span>
        </h1>
        <p class="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
          Platform cerdas untuk mengakses, mencari, dan menganalisis dokumen kebijakan pemerintah Indonesia dengan bantuan kecerdasan buatan.
        </p>

        <div class="max-w-2xl mx-auto mb-6">
          <form class="flex gap-2" @submit.prevent="onSearch">
            <UInput
              v-model="searchQuery"
              size="xl"
              placeholder="Cari peraturan, kebijakan, undang-undang..."
              icon="i-heroicons-magnifying-glass"
              class="flex-1"
              autofocus
            />
            <UButton type="submit" size="xl" color="yellow" label="Cari" />
          </form>
        </div>

        <div v-if="popularSearches.length" class="flex flex-wrap items-center justify-center gap-2">
          <span class="text-sm text-primary-200">Pencarian populer:</span>
          <SearchChip
            v-for="chip in popularSearches"
            :key="chip.query"
            :label="chip.query"
            :type="chip.type"
            @click="navigateTo(`/documents?q=${encodeURIComponent(chip.query)}`)"
          />
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="py-16 bg-gray-50 dark:bg-gray-950">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Platform dalam Angka</h2>
          <p class="text-gray-500 dark:text-gray-400">Data real-time dari sistem kami</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard :value="stats.totalDocuments" label="Total Dokumen" icon="i-heroicons-document-text" color="blue" />
          <StatCard :value="stats.totalQuestionsAsked" label="Pertanyaan Dijawab AI" icon="i-heroicons-chat-bubble-left-right" color="purple" />
          <StatCard :value="stats.totalMinistries" label="Kementerian/Lembaga" icon="i-heroicons-building-office-2" color="green" />
          <StatCard :value="stats.totalTypes" label="Kategori Dokumen" icon="i-heroicons-squares-2x2" color="orange" />
          <StatCard :value="stats.totalPagesIndexed" label="Halaman Terindeks" icon="i-heroicons-document-duplicate" color="pink" />
          <StatCard :value="stats.totalSummaries" label="Ringkasan AI" icon="i-heroicons-sparkles" color="indigo" />
        </div>
      </div>
    </section>

    <!-- Telusuri berdasarkan Kategori -->
    <section v-if="categoryItems.length" class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Telusuri berdasarkan Kategori</h2>
          <p class="text-gray-500 dark:text-gray-400">Temukan dokumen yang Anda cari berdasarkan jenis regulasi</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <CategoryCard
            v-for="cat in categoryItems"
            :key="cat.type"
            :type="cat.type"
            :label="cat.label"
            :count="cat.count"
            :icon="cat.icon"
            :color="cat.color"
          />
        </div>
      </div>
    </section>

    <!-- Dokumen Terbaru -->
    <section v-if="latestDocs.length" class="py-16 bg-gray-50 dark:bg-gray-950">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dokumen Terbaru</h2>
            <p class="text-gray-500 dark:text-gray-400">Dokumen yang baru saja ditambahkan ke platform</p>
          </div>
          <NuxtLink to="/documents?sort=newest" class="hidden sm:block">
            <UButton variant="ghost" size="sm" icon="i-heroicons-arrow-right" trailing>Lihat Semua</UButton>
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DocumentCard v-for="doc in latestDocs" :key="doc.id" :doc="doc" />
        </div>
        <div class="mt-6 text-center sm:hidden">
          <NuxtLink to="/documents?sort=newest">
            <UButton variant="outline" size="sm">Lihat Semua Dokumen</UButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Mulai Eksplorasi Dokumen</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">Jelajahi dokumen kebijakan, peraturan, dan undang-undang secara gratis.</p>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink to="/documents">
            <UButton size="lg" icon="i-heroicons-magnifying-glass">Jelajahi Dokumen</UButton>
          </NuxtLink>
          <NuxtLink :to="isLoggedIn ? '/chat' : '/chat-ai'">
            <UButton size="lg" variant="outline" icon="i-heroicons-chat-bubble-left-right">
              {{ isLoggedIn ? 'Mulai Chat AI' : 'Coba Chat AI' }}
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

definePageMeta({ layout: 'public' })

const { isLoggedIn } = useAuth()
const searchQuery = ref('')

const TYPE_META: Record<string, { label: string; icon: string; color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' }> = {
  law: { label: 'Undang-Undang', icon: 'i-heroicons-scale', color: 'blue' },
  regulation: { label: 'Peraturan', icon: 'i-heroicons-document-text', color: 'green' },
  decree: { label: 'Keputusan', icon: 'i-heroicons-stamp', color: 'purple' },
  circular: { label: 'Surat Edaran', icon: 'i-heroicons-envelope', color: 'orange' },
  guideline: { label: 'Pedoman', icon: 'i-heroicons-book-open', color: 'indigo' },
  other: { label: 'Lainnya', icon: 'i-heroicons-folder', color: 'red' },
}

const [{ data: statsData }, { data: popularData }, { data: latestData }] = await Promise.all([
  useAsyncData('public-stats', () => $fetch<any>('/api/public/stats')),
  useAsyncData('popular-searches', () => $fetch<any[]>('/api/public/popular-searches')),
  useAsyncData('latest-docs', () => $fetch<Document[]>('/api/public/documents/latest')),
])

const stats = computed(() => statsData.value || {
  totalDocuments: 0, totalQuestionsAsked: 0, totalMinistries: 0,
  totalTypes: 0, totalPagesIndexed: 0, totalSummaries: 0,
  typeBreakdown: [],
})
const popularSearches = computed(() => popularData.value || [])
const latestDocs = computed(() => latestData.value || [])

const categoryItems = computed(() =>
  (stats.value.typeBreakdown || []).map((t: { type: string; count: number }) => ({
    type: t.type,
    count: t.count,
    label: TYPE_META[t.type]?.label || t.type,
    icon: TYPE_META[t.type]?.icon || 'i-heroicons-document',
    color: TYPE_META[t.type]?.color || 'blue',
  })),
)

function onSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/documents?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

useHead({ title: 'GovDocs AI — Platform Dokumen Pemerintah Indonesia' })
</script>
