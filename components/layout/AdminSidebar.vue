<template>
  <aside class="w-60 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-screen">
    <nav class="p-4 flex flex-col gap-1">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Admin</p>
      <UButton
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        variant="ghost"
        :icon="item.icon"
        :class="{ 'bg-gray-100 dark:bg-gray-800': $route.path === item.to }"
        class="justify-start w-full"
      >
        {{ item.label }}
      </UButton>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'i-heroicons-squares-2x2' },
  { to: '/admin/documents', label: 'Documents', icon: 'i-heroicons-document-text' },
]
</script>
