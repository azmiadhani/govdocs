<template>
  <nav class="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-lg">
        <div class="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
        </div>
        GovDocs AI
      </NuxtLink>

      <div class="flex items-center gap-3">
        <NuxtLink to="/documents" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">
          Dokumen
        </NuxtLink>
        <template v-if="isLoggedIn">
          <NuxtLink to="/">
            <UButton size="sm" variant="soft">Perpustakaan</UButton>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login">
            <UButton size="sm">Masuk</UButton>
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { isLoggedIn } = useAuth()
</script>
