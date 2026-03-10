<template>
  <nav class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="font-bold text-xl text-gray-900 dark:text-white">GovDocs <span class="text-primary-500">AI</span></span>
        </NuxtLink>

        <!-- Nav links -->
        <div class="hidden md:flex items-center gap-1">
          <UButton
            variant="ghost"
            to="/"
            :class="{ 'bg-gray-100 dark:bg-gray-800': $route.path === '/' }"
          >
            Documents
          </UButton>
          <UButton
            variant="ghost"
            to="/chat"
            :class="{ 'bg-gray-100 dark:bg-gray-800': $route.path.startsWith('/chat') }"
          >
            Chat
          </UButton>
          <UButton
            v-if="isAdmin"
            variant="ghost"
            to="/admin"
            :class="{ 'bg-gray-100 dark:bg-gray-800': $route.path.startsWith('/admin') }"
          >
            Admin
          </UButton>
        </div>

        <!-- User menu -->
        <div class="flex items-center gap-3">
          <UDropdown
            v-if="user"
            :items="userMenuItems"
            :ui="{ item: { disabled: 'cursor-text select-text' } }"
          >
            <UButton variant="ghost" trailing-icon="i-heroicons-chevron-down-20-solid">
              {{ user.name }}
              <UBadge :label="user.role" size="xs" class="ml-1" />
            </UButton>
          </UDropdown>
          <UButton v-else to="/login" variant="solid">Sign In</UButton>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { user, logout, isAdmin } = useAuth()
const route = useRoute()

const userMenuItems = computed(() => [
  [
    {
      label: user.value?.email || '',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: logout,
    },
  ],
])
</script>
