<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
    <PublicNavTop />
    <PublicNavBottom />
    <main class="flex-1">
      <slot />
    </main>
    <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <div class="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center">
              <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5 text-white" />
            </div>
            GovDocs AI
          </div>
          <p class="text-xs text-gray-400 dark:text-gray-500">
            Platform Dokumen Pemerintah Indonesia &mdash; &copy; {{ new Date().getFullYear() }}
          </p>
          <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <NuxtLink to="/about" class="hover:text-gray-900 dark:hover:text-white transition-colors">Tentang</NuxtLink>
            <NuxtLink to="/faq" class="hover:text-gray-900 dark:hover:text-white transition-colors">FAQ</NuxtLink>
            <NuxtLink to="/contact" class="hover:text-gray-900 dark:hover:text-white transition-colors">Kontak</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
