<template>
  <div
    class="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">

      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-gray-900 dark:text-white shrink-0">
        <div class="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
        </div>
        <span class="hidden md:block text-base">GovDocs <span class="text-primary-600">AI</span></span>
      </NuxtLink>

      <!-- Search bar -->
      <form class="flex-1 min-w-0" @submit.prevent="onSearch">
        <div
          class="flex items-center gap-1.5 w-full max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg px-3 h-9 focus-within:ring-2 focus-within:ring-primary-500 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all">
          <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 shrink-0" />
          <input v-model="searchQuery" type="text" placeholder="Cari dokumen pemerintah..."
            class="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            @keydown.enter="onSearch" />
          <button v-if="searchQuery" type="button"
            class="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click="searchQuery = ''">
            <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      <!-- Right actions -->
      <div class="flex items-center gap-2 shrink-0">
        <template v-if="isLoggedIn">
          <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
            <UButton variant="ghost" size="sm" color="gray" class="gap-1.5 px-2">
              <div
                class="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {{ userInitial }}
              </div>
              <span class="hidden sm:block text-sm text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{{
                user?.name }}</span>
              <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 text-gray-400" />
            </UButton>
          </UDropdown>
        </template>
        <template v-else>
          <NuxtLink to="/login">
            <UButton size="sm" variant="ghost" color="gray" label="Masuk" />
          </NuxtLink>
          <NuxtLink to="/login">
            <UButton size="sm" color="primary" label="Daftar" class="hidden sm:flex" />
          </NuxtLink>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isLoggedIn, logout } = useAuth()
const route = useRoute()

const searchQuery = ref((route.query.q as string) || '')

const userInitial = computed(() => user.value?.name?.charAt(0).toUpperCase() || '?')

const userMenuItems = computed(() => [[
  {
    label: user.value?.name || '',
    slot: 'account',
    disabled: true,
  },
], [
  {
    label: 'Manajemen Dokumen',
    icon: 'i-heroicons-squares-2x2',
    to: '/admin',
  },
  {
    label: 'Chat AI',
    icon: 'i-heroicons-chat-bubble-left-right',
    to: '/chat',
  },
], [
  {
    label: 'Keluar',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: logout,
  },
]])

function onSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/documents?q=${encodeURIComponent(searchQuery.value.trim())}`)
  } else {
    navigateTo('/documents')
  }
}

// Sync search query when navigating to documents page
watch(() => route.query.q, (val) => {
  if (route.path === '/documents') {
    searchQuery.value = (val as string) || ''
  }
})
</script>
