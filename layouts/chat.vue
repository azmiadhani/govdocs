<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <!-- Mobile top bar -->
      <header class="flex lg:hidden items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <UButton
          icon="i-heroicons-bars-3"
          variant="ghost"
          color="gray"
          size="sm"
          @click="sidebarOpen = true"
        />
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center shrink-0">
            <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5 text-white" />
          </div>
          <span class="font-bold text-gray-900 dark:text-white text-sm">
            GovDocs <span class="text-primary-500">AI</span>
          </span>
        </div>
      </header>
      <div class="flex-1 overflow-hidden flex flex-col min-h-0">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
