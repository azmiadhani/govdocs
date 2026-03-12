<template>
  <aside
    class="flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
    <!-- Logo -->
    <div class="px-5 py-5 border-b border-gray-100 dark:border-gray-800">
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-gray-900 dark:text-white text-base leading-tight">
          GovDocs <span class="text-primary-500">AI</span>
        </span>
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
      <!-- User nav -->
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>

      <NuxtLink
        v-for="item in userNavItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="item.active
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'"
      >
        <UIcon :name="item.icon" class="w-4 h-4 shrink-0" />
        {{ item.label }}
      </NuxtLink>

      <!-- Admin nav -->
      <template v-if="isAdmin">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mt-5 mb-2">Admin</p>

        <NuxtLink
          v-for="item in adminNavItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="item.active
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'"
        >
          <span class="flex items-center gap-2.5">
            <UIcon :name="item.icon" class="w-4 h-4 shrink-0" />
            {{ item.label }}
          </span>
          <UBadge
            v-if="item.badge && unreadCount > 0"
            :label="String(unreadCount)"
            color="red"
            size="xs"
            class="shrink-0"
          />
        </NuxtLink>
      </template>
    </nav>

    <!-- User section -->
    <div class="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
      <!-- Public site link for admins -->
      <a
        v-if="isAdmin"
        href="/"
        target="_blank"
        class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 shrink-0" />
        Lihat Situs Publik
      </a>

      <template v-if="user">
        <div class="flex items-center gap-3 px-3 py-2">
          <UAvatar :alt="user.name" size="sm" class="shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ user.email }}</p>
          </div>
          <UBadge :label="user.role" size="xs" variant="subtle" />
        </div>
        <UButton
          block
          variant="ghost"
          color="gray"
          icon="i-heroicons-arrow-right-on-rectangle"
          class="justify-start"
          @click="logout"
        >
          Keluar
        </UButton>
      </template>

      <template v-else>
        <UButton block to="/login" icon="i-heroicons-arrow-right-on-rectangle">
          Masuk
        </UButton>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { user, logout, isAdmin } = useAuth()
const route = useRoute()
const unreadCount = ref(0)

const userNavItems = computed(() => [
  {
    label: 'Dokumen',
    icon: 'i-heroicons-document-duplicate',
    to: '/documents',
    active: route.path === '/' || route.path.startsWith('/documents'),
  },
  {
    label: 'Chat',
    icon: 'i-heroicons-chat-bubble-left-right',
    to: '/chat',
    active: route.path.startsWith('/chat'),
  },
])

const adminNavItems = computed(() => [
  {
    label: 'Manajemen Dokumen',
    icon: 'i-heroicons-document-text',
    to: '/admin',
    active: route.path === '/admin' || route.path.startsWith('/admin/documents'),
  },
  {
    label: 'Pengguna',
    icon: 'i-heroicons-users',
    to: '/admin/users',
    active: route.path.startsWith('/admin/users'),
  },
  {
    label: 'Feedback',
    icon: 'i-heroicons-chat-bubble-left-ellipsis',
    to: '/admin/feedback',
    active: route.path.startsWith('/admin/feedback'),
    badge: true,
  },
  {
    label: 'Changelog',
    icon: 'i-heroicons-clock',
    to: '/admin/changelog',
    active: route.path.startsWith('/admin/changelog'),
  },
])

onMounted(async () => {
  if (!isAdmin.value) return
  try {
    const data = await $fetch<{ unreadCount: number }>('/api/admin/feedback?limit=1')
    unreadCount.value = data.unreadCount
  } catch {
    // silently ignore — badge is non-critical
  }
})
</script>
