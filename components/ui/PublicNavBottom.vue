<template>
  <div class="sticky top-14 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-11">
        <!-- Nav links -->
        <nav class="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors"
            :class="isActive(item.to)
              ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'"
          >
            <UIcon :name="item.icon" class="w-4 h-4 shrink-0" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Chat AI CTA -->
        <NuxtLink :to="chatTarget" class="shrink-0 ml-4">
          <UButton
            size="xs"
            color="primary"
            icon="i-heroicons-sparkles"
            label="Chat AI"
            class="hidden sm:flex"
          />
          <UButton
            size="xs"
            color="primary"
            icon="i-heroicons-sparkles"
            class="sm:hidden"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn } = useAuth()
const route = useRoute()

const navItems = [
  { label: 'Beranda', to: '/', icon: 'i-heroicons-home' },
  { label: 'Dokumen', to: '/documents', icon: 'i-heroicons-document-text' },
  { label: 'Tentang', to: '/about', icon: 'i-heroicons-information-circle' },
  { label: 'FAQ', to: '/faq', icon: 'i-heroicons-question-mark-circle' },
  { label: 'Kontak', to: '/contact', icon: 'i-heroicons-envelope' },
  { label: 'Riwayat', to: '/changelog', icon: 'i-heroicons-clock' },
]

const chatTarget = computed(() => isLoggedIn.value ? '/chat' : '/chat-ai')

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
