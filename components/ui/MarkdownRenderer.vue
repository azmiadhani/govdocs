<template>
  <div class="prose dark:prose-invert max-w-none prose-sm" v-html="rendered" />
</template>

<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{ content: string }>()

const rendered = computed(() => marked.parse(props.content || '') as string)
</script>
