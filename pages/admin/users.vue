<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">Kelola Pengguna</h1>
      <p class="text-sm text-gray-500 mt-0.5">{{ users.length }} pengguna terdaftar</p>
    </div>

    <UCard :ui="{ body: { padding: 'p-0' } }">
      <!-- Loading -->
      <div v-if="pending" class="p-6 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
      </div>

      <!-- Empty -->
      <div v-else-if="!users.length" class="p-8 text-center text-gray-400">
        <UIcon name="i-heroicons-users" class="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p class="text-sm">Tidak ada pengguna</p>
      </div>

      <!-- Table -->
      <table v-else class="w-full text-sm">
        <thead class="border-b border-gray-200 dark:border-gray-700">
          <tr class="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
            <th class="px-4 py-3">Nama</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Role</th>
            <th class="px-4 py-3">Bergabung</th>
            <th class="px-4 py-3">Ubah Role</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="u in users"
            :key="u.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                  {{ u.name?.charAt(0).toUpperCase() }}
                </div>
                {{ u.name }}
                <UBadge v-if="u.id === currentUser?.id" label="Anda" color="gray" size="xs" />
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ u.email }}</td>
            <td class="px-4 py-3">
              <UBadge :label="u.role" :color="roleColor(u.role)" variant="soft" size="xs" />
            </td>
            <td class="px-4 py-3 text-gray-400 text-xs">{{ formatDate(u.createdAt) }}</td>
            <td class="px-4 py-3">
              <UTooltip :text="u.id === currentUser?.id ? 'Tidak dapat mengubah role sendiri' : ''">
                <USelect
                  :model-value="u.role"
                  :options="roleOptions"
                  size="xs"
                  :disabled="u.id === currentUser?.id || saving === u.id"
                  class="w-32"
                  @update:model-value="(role) => changeRole(u.id, role)"
                />
              </UTooltip>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <UAlert v-if="error" color="red" :description="error" class="mt-4" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { user: currentUser } = useAuth()
const toast = useToast()

const { data, pending, refresh } = await useAsyncData('admin-users', () =>
  $fetch<any[]>('/api/admin/users'),
)
const users = computed(() => data.value || [])

const saving = ref<string | null>(null)
const error = ref('')

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
]

function roleColor(role: string) {
  const map: Record<string, string> = { admin: 'red', editor: 'blue', viewer: 'gray' }
  return map[role] || 'gray'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function changeRole(userId: string, role: string) {
  saving.value = userId
  error.value = ''
  try {
    await $fetch(`/api/admin/users/${userId}/role`, { method: 'PATCH', body: { role } })
    await refresh()
    toast.add({ title: 'Role berhasil diubah', icon: 'i-heroicons-check-circle', color: 'green' })
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal mengubah role'
  } finally {
    saving.value = null
  }
}

useHead({ title: 'Kelola Pengguna | Admin' })
</script>
