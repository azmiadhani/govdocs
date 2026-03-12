<template>
  <div class="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-lg shrink-0">
        <div class="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
        </div>
        <span class="hidden sm:block">GovDocs <span class="text-primary-600">AI</span></span>
      </NuxtLink>

      <!-- Search bar (center) -->
      <form class="flex-1 max-w-xl" @submit.prevent="onSearch">
        <UInput
          v-model="searchQuery"
          placeholder="Cari dokumen pemerintah..."
          icon="i-heroicons-magnifying-glass"
          size="sm"
          class="w-full"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <UButton
              type="submit"
              size="xs"
              color="primary"
              label="Cari"
              class="mr-1"
            />
          </template>
        </UInput>
      </form>

      <!-- Right actions -->
      <div class="flex items-center gap-2 shrink-0">
        <template v-if="isLoggedIn">
          <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
            <UButton variant="ghost" size="sm" class="gap-2">
              <div class="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {{ userInitial }}
              </div>
              <span class="hidden sm:block text-sm text-gray-700 dark:text-gray-300">{{ user?.name }}</span>
              <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 text-gray-400" />
            </UButton>
          </UDropdown>
        </template>
        <template v-else>
          <NuxtLink to="/login">
            <UButton size="sm" variant="ghost" label="Masuk" />
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
