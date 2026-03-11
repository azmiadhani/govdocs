<template>
  <div ref="container" class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
    <!-- Empty state -->
    <div v-if="!messages.length && !streaming" class="flex flex-col items-center justify-center h-full text-center px-6">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
        <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-white" />
      </div>
      <h3 class="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">Asisten Dokumen AI</h3>
      <p class="text-sm text-gray-400 max-w-xs">Tanyakan apa saja tentang dokumen pemerintah yang telah diindeks</p>
    </div>

    <!-- Messages -->
    <div v-else class="px-4 py-6 space-y-6 max-w-4xl mx-auto">
      <ChatMessage v-for="msg in messages" :key="msg.id" :message="msg" />

      <!-- Streaming bubble -->
      <div v-if="streaming" class="flex gap-3">
        <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 bg-gradient-to-br from-violet-500 to-indigo-600">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-white" />
        </div>
        <div class="max-w-[78%] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <StreamingText v-if="streamingText" :content="streamingText" :streaming="true" />
          <LoadingDots v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/types'

const props = defineProps<{
  messages: ChatMessage[]
  streaming?: boolean
  streamingText?: string
}>()

const container = ref<HTMLElement>()

watch(
  () => [props.messages.length, props.streamingText],
  async () => {
    await nextTick()
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight
    }
  }
)
</script>
