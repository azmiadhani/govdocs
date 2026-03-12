<template>
  <div class="space-y-6">

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-primary-500 animate-pulse shrink-0" />
        <span>Menganalisis dokumen relevan...</span>
      </div>
      <USkeleton class="h-40 rounded-xl" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <USkeleton v-for="i in 4" :key="i" class="h-32 rounded-xl" />
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      color="red"
      icon="i-heroicons-exclamation-triangle"
      :title="error"
    />

    <!-- Results -->
    <template v-else-if="result">

      <!-- AI Answer card -->
      <UCard class="border-primary-200 dark:border-primary-800">
        <template #header>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center shrink-0">
              <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5 text-white" />
            </div>
            <h3 class="font-semibold text-sm text-gray-900 dark:text-white">Jawaban AI</h3>

            <!-- Confidence badge (only shown when result has confidence data) -->
            <UTooltip
              v-if="result.confidence"
              :text="confidenceTooltip"
              class="ml-auto"
            >
              <div class="flex items-center gap-1.5 cursor-default">
                <div class="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="confidenceBarColor"
                    :style="{ width: `${Math.round(result.confidence.rerankScore * 100)}%` }"
                  />
                </div>
                <span class="text-xs font-medium" :class="confidenceTextColor">
                  {{ confidenceLabel }}
                </span>
              </div>
            </UTooltip>

            <UBadge
              v-else
              label="Berdasarkan dokumen terindeks"
              size="xs"
              variant="subtle"
              color="primary"
              class="ml-auto"
            />
          </div>
        </template>

        <div class="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownRenderer :content="result.answer" />
        </div>

        <!-- Confidence detail strip (subtle, below answer) -->
        <template v-if="result.confidence" #footer>
          <div class="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span class="flex items-center gap-1">
              <UIcon name="i-heroicons-document-text" class="w-3 h-3" />
              {{ result.confidence.supportingChunks }} kutipan ditemukan
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-heroicons-chart-bar" class="w-3 h-3" />
              Skor relevansi: {{ Math.round(result.confidence.topScore * 100) }}%
            </span>
          </div>
        </template>
      </UCard>

      <!-- No documents found -->
      <div v-if="!result.documents.length" class="text-center py-8 text-gray-400">
        <UIcon name="i-heroicons-document-magnifying-glass" class="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p class="text-sm">Tidak ada dokumen yang cocok ditemukan</p>
      </div>

      <!-- Documents grid -->
      <div v-else>
        <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          {{ result.documents.length }} Dokumen Relevan Ditemukan
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NuxtLink
            v-for="doc in result.documents"
            :key="doc.id"
            :to="buildDocLink(doc)"
            class="block group"
          >
            <div
              class="h-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-sm transition-all"
            >
              <!-- Header row -->
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex flex-wrap gap-1 min-w-0">
                  <UBadge
                    v-if="doc.type"
                    :label="TYPE_LABELS[doc.type] || doc.type"
                    :color="TYPE_COLORS[doc.type] || 'gray'"
                    size="xs"
                    variant="subtle"
                    class="shrink-0"
                  />
                  <UBadge
                    v-if="doc.year"
                    :label="doc.year"
                    size="xs"
                    variant="outline"
                    color="gray"
                    class="shrink-0"
                  />
                </div>
                <!-- Relevance score bar -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <div class="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary-500 rounded-full transition-all"
                      :style="{ width: `${Math.min(doc.score * 100, 100)}%` }"
                    />
                  </div>
                  <span class="text-xs text-gray-400">{{ Math.round(doc.score * 100) }}%</span>
                </div>
              </div>

              <!-- Title -->
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 leading-snug line-clamp-2 mb-1 transition-colors">
                {{ doc.title }}
              </p>

              <!-- Ministry -->
              <p v-if="doc.ministry" class="text-xs text-gray-400 truncate mb-2.5">
                {{ doc.ministry }}
              </p>

              <!-- Best highlight snippet -->
              <div
                v-if="doc.highlights[0]"
                class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 leading-relaxed line-clamp-3"
              >
                <span class="text-gray-400 mr-1">Hal. {{ doc.highlights[0].pageNumber ?? '?' }} —</span>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <span v-html="highlightSnippet(doc.highlights[0].snippet, query)" />
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import type { SmartSearchResult } from '~/types'

const props = defineProps<{
  loading: boolean
  result: SmartSearchResult | null
  error: string | null
  query: string
}>()

const TYPE_LABELS: Record<string, string> = {
  law: 'Undang-Undang',
  regulation: 'Peraturan',
  decree: 'Keputusan',
  circular: 'Surat Edaran',
  guideline: 'Pedoman',
  other: 'Lainnya',
}

const TYPE_COLORS: Record<string, string> = {
  law: 'red',
  regulation: 'blue',
  decree: 'purple',
  circular: 'orange',
  guideline: 'green',
  other: 'gray',
}

// ── Confidence computed helpers ───────────────────────────────────────────────

const confidenceScore = computed(() => props.result?.confidence?.rerankScore ?? 0)

const confidenceLabel = computed(() => {
  const s = confidenceScore.value
  if (s >= 0.75) return 'Tinggi'
  if (s >= 0.45) return 'Sedang'
  return 'Rendah'
})

const confidenceBarColor = computed(() => {
  const s = confidenceScore.value
  if (s >= 0.75) return 'bg-green-500'
  if (s >= 0.45) return 'bg-yellow-500'
  return 'bg-orange-400'
})

const confidenceTextColor = computed(() => {
  const s = confidenceScore.value
  if (s >= 0.75) return 'text-green-600 dark:text-green-400'
  if (s >= 0.45) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-orange-500 dark:text-orange-400'
})

const confidenceTooltip = computed(() => {
  const c = props.result?.confidence
  if (!c) return ''
  return `${c.supportingChunks} kutipan · relevansi ${Math.round(c.topScore * 100)}% · rerank ${Math.round(c.rerankScore * 100)}%`
})

// ─────────────────────────────────────────────────────────────────────────────

function buildDocLink(doc: NonNullable<SmartSearchResult['documents']>[number]): string {
  const best = doc.highlights[0]
  if (best?.pageNumber && best.pageNumber > 1) {
    return `/documents/${doc.id}?page=${best.pageNumber}`
  }
  return `/documents/${doc.id}`
}

/**
 * Safely highlight query keywords inside a plain-text snippet.
 * 1. Escape all HTML in the snippet first (XSS prevention).
 * 2. Then inject only controlled <mark> tags.
 */
function highlightSnippet(text: string, query: string): string {
  const escaped = escapeHtml(text)
  if (!query.trim()) return escaped

  // Only highlight words longer than 2 chars to avoid noise
  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => escapeRegExp(w))

  if (!words.length) return escaped

  const pattern = words.join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  return escaped.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-800/60 rounded px-0.5 not-italic font-medium text-gray-900 dark:text-yellow-100">$1</mark>',
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>
