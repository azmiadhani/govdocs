<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Feedback & Pesan</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ total }} pesan
          <span v-if="unreadCount > 0" class="text-orange-500 font-medium"> · {{ unreadCount }} belum dibaca</span>
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
        :class="activeTab === tab.value
          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        @click="setTab(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.value === '' && unreadCount > 0" class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
          {{ unreadCount }}
        </span>
      </button>
    </div>

    <UCard :ui="{ body: { padding: 'p-0' } }">
      <!-- Loading -->
      <div v-if="pending" class="p-6 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>

      <!-- Empty -->
      <div v-else-if="!items.length" class="p-10 text-center text-gray-400">
        <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p class="text-sm">Tidak ada pesan</p>
      </div>

      <!-- Table -->
      <table v-else class="w-full text-sm">
        <thead class="border-b border-gray-200 dark:border-gray-700">
          <tr class="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
            <th class="px-4 py-3">Pengirim</th>
            <th class="px-4 py-3">Subjek</th>
            <th class="px-4 py-3">Pesan</th>
            <th class="px-4 py-3">Tanggal</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="item in items"
            :key="item.id"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
            :class="item.status === 'unread' ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''"
            @click="openModal(item)"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900 dark:text-white" :class="item.status === 'unread' ? 'font-semibold' : ''">
                {{ item.name }}
              </p>
              <p class="text-xs text-gray-400">{{ item.email }}</p>
            </td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs">
              <span :class="item.status === 'unread' ? 'font-semibold' : ''">{{ item.subject }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs">
              <span class="truncate block max-w-48">{{ item.message.slice(0, 80) }}{{ item.message.length > 80 ? '…' : '' }}</span>
            </td>
            <td class="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{{ formatDate(item.createdAt) }}</td>
            <td class="px-4 py-3">
              <UBadge :label="statusLabel(item.status)" :color="statusColor(item.status)" variant="soft" size="xs" />
            </td>
            <td class="px-4 py-3 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <UButton
                  v-if="item.status === 'unread'"
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-eye"
                  title="Tandai Dibaca"
                  :loading="updating === item.id"
                  @click="updateStatus(item, 'read')"
                />
                <UButton
                  v-if="item.status !== 'replied'"
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-check-circle"
                  title="Tandai Dibalas"
                  :loading="updating === item.id"
                  @click="updateStatus(item, 'replied')"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <!-- Detail Modal -->
    <UModal v-model="showModal">
      <UCard v-if="selected">
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ selected.subject }}</h3>
              <p class="text-sm text-gray-500 mt-0.5">{{ selected.name }} &lt;{{ selected.email }}&gt;</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(selected.createdAt) }}</p>
            </div>
            <UButton variant="ghost" icon="i-heroicons-x-mark" size="xs" @click="showModal = false" />
          </div>
        </template>

        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{{ selected.message }}</p>

        <template #footer>
          <div class="flex items-center justify-between">
            <UBadge :label="statusLabel(selected.status)" :color="statusColor(selected.status)" variant="soft" />
            <div class="flex gap-2">
              <UButton
                v-if="selected.status !== 'read' && selected.status !== 'replied'"
                size="sm"
                variant="ghost"
                :loading="updating === selected.id"
                @click="updateStatus(selected, 'read')"
              >
                Tandai Dibaca
              </UButton>
              <UButton
                v-if="selected.status !== 'replied'"
                size="sm"
                :loading="updating === selected.id"
                @click="updateStatus(selected, 'replied')"
              >
                Tandai Dibalas
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const activeTab = ref('')
const showModal = ref(false)
const selected = ref<any>(null)
const updating = ref<string | null>(null)

const tabs = [
  { label: 'Semua', value: '' },
  { label: 'Belum Dibaca', value: 'unread' },
  { label: 'Dibaca', value: 'read' },
  { label: 'Dibalas', value: 'replied' },
]

const { data, pending, refresh } = await useAsyncData(
  () => `admin-feedback-${activeTab.value}`,
  () => $fetch<{ items: any[]; total: number; unreadCount: number }>(`/api/admin/feedback${activeTab.value ? `?status=${activeTab.value}` : ''}`),
)

const items = computed(() => data.value?.items || [])
const total = computed(() => data.value?.total || 0)
const unreadCount = computed(() => data.value?.unreadCount || 0)

function setTab(val: string) {
  activeTab.value = val
  refresh()
}

function openModal(item: any) {
  selected.value = item
  showModal.value = true
  if (item.status === 'unread') updateStatus(item, 'read')
}

async function updateStatus(item: any, status: string) {
  updating.value = item.id
  try {
    await $fetch(`/api/admin/feedback/${item.id}`, { method: 'PATCH', body: { status } })
    item.status = status
    if (selected.value?.id === item.id) selected.value.status = status
    await refresh()
  } catch {
    // ignore
  } finally {
    updating.value = null
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = { unread: 'Belum Dibaca', read: 'Dibaca', replied: 'Dibalas' }
  return map[status] || status
}

function statusColor(status: string) {
  const map: Record<string, string> = { unread: 'orange', read: 'blue', replied: 'green' }
  return map[status] || 'gray'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

useHead({ title: 'Feedback | Admin' })
</script>
