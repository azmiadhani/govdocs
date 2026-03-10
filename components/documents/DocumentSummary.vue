<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold flex items-center gap-2">
          <UIcon name="i-heroicons-sparkles" class="text-primary-500" />
          AI Summary
        </h3>
        <UButton
          v-if="!summary && !loading"
          size="sm"
          variant="soft"
          @click="fetchSummary"
        >
          Generate
        </UButton>
      </div>
    </template>

    <div v-if="loading" class="py-6 flex items-center justify-center gap-2 text-gray-400">
      <LoadingDots />
      <span class="text-sm">Generating summary…</span>
    </div>

    <div v-else-if="error" class="py-4">
      <UAlert color="red" :description="error" />
    </div>

    <div v-else-if="summary">
      <MarkdownRenderer :content="summary.summary" />
    </div>

    <div v-else class="py-6 text-center text-sm text-gray-400">
      Click "Generate" to create an AI summary for this document.
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{ documentId: string }>()

const { summary, loading, error, fetchSummary } = useAISummary(props.documentId)

// Auto-fetch on mount
onMounted(fetchSummary)
</script>
