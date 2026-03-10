<template>
  <div :class="['flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row']">
    <!-- Avatar -->
    <div
      :class="[
        'w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold',
        isUser ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
      ]"
    >
      {{ isUser ? 'U' : 'AI' }}
    </div>

    <!-- Bubble -->
    <div :class="['max-w-[80%] rounded-2xl px-4 py-2.5', isUser ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm']">
      <div v-if="isUser" class="text-sm whitespace-pre-wrap">{{ message.content }}</div>
      <MarkdownRenderer v-else :content="message.content" />

      <!-- Sources -->
      <div v-if="!isUser && message.sources?.length" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p class="text-xs text-gray-400 mb-1">Sources:</p>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="src in message.sources"
            :key="src.chunkId"
            class="text-xs bg-white dark:bg-gray-700 rounded px-1.5 py-0.5 text-gray-500"
          >
            {{ src.documentTitle }}, p.{{ src.pageNumber }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage as ChatMessageType } from '~/types'

const props = defineProps<{ message: ChatMessageType }>()
const isUser = computed(() => props.message.role === 'user')
</script>
