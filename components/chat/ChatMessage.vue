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

      <!-- Sources: collapsible footnotes -->
      <div v-if="!isUser && message.sources?.length" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          @click="sourcesOpen = !sourcesOpen"
        >
          <UIcon :name="sourcesOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3 h-3" />
          {{ message.sources.length }} sumber referensi
        </button>
        <div v-if="sourcesOpen" class="mt-1.5 flex flex-col gap-1">
          <span
            v-for="(src, i) in message.sources"
            :key="src.chunkId"
            class="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5"
          >
            <span class="text-gray-300 dark:text-gray-600 shrink-0">[{{ i + 1 }}]</span>
            <span>{{ src.documentTitle }}, Halaman {{ src.pageNumber }}</span>
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
const sourcesOpen = ref(false)
</script>
