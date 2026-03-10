<template>
  <div class="prose dark:prose-invert max-w-none prose-sm" v-html="rendered">
    <span v-if="streaming" class="inline-block w-2 h-4 bg-primary-500 animate-pulse ml-0.5" />
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{
  content: string
  streaming?: boolean
}>()

const rendered = computed(() => marked.parse(props.content || '') as string)
</script>
