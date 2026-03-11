<template>
  <div ref="container" class="flex-1 overflow-y-auto p-4 space-y-4">
    <ChatMessage v-for="msg in messages" :key="msg.id" :message="msg" />

    <!-- Streaming indicator -->
    <div v-if="streaming" class="flex gap-3">
      <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
        AI
      </div>
      <div class="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-2.5 bg-gray-100 dark:bg-gray-800">
        <StreamingText v-if="streamingText" :content="streamingText" :streaming="true" />
        <LoadingDots v-else />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!messages.length && !streaming" class="flex flex-col items-center justify-center h-full text-gray-400 py-12">
      <UIcon name="i-heroicons-chat-bubble-left-right" class="w-12 h-12 mb-3 opacity-40" />
      <p class="text-sm">Tanyakan apa saja tentang dokumen</p>
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

// Auto-scroll to bottom on new messages
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
