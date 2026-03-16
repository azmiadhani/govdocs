<template>
  <div class="space-y-6">
    <!-- Search -->
    <div>
      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pencarian</label>
      <form @submit.prevent="emit('search', localQ)">
        <UInput
          v-model="localQ"
          placeholder="Cari dokumen..."
          icon="i-heroicons-magnifying-glass"
          size="sm"
          @input="onSearch"
        />
      </form>
    </div>

    <!-- Sort -->
    <div>
      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Urutkan</label>
      <USelect v-model="localSort" :options="sortOptions" size="sm" @change="emit('update:sort', localSort)" />
    </div>

    <!-- Document Type -->
    <div v-if="availableTypes.length">
      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Jenis Dokumen</label>
      <div class="space-y-1.5">
        <label
          v-for="t in availableTypes"
          :key="t"
          class="flex items-center gap-2 cursor-pointer group"
        >
          <input
            type="checkbox"
            :checked="selectedTypes.includes(t)"
            class="rounded border-gray-300 text-primary-600"
            @change="toggleType(t)"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors">
            {{ TYPE_LABELS[t] || t }}
          </span>
        </label>
      </div>
    </div>

    <!-- Ministry -->
    <div v-if="availableMinistries.length">
      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kementerian / Lembaga</label>
      <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        <label
          v-for="m in availableMinistries"
          :key="m"
          class="flex items-center gap-2 cursor-pointer group"
        >
          <input
            type="checkbox"
            :checked="selectedMinistries.includes(m)"
            class="rounded border-gray-300 text-primary-600"
            @change="toggleMinistry(m)"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors leading-tight">
            {{ m }}
          </span>
        </label>
      </div>
    </div>

    <!-- Reset -->
    <UButton
      v-if="hasFilters"
      block
      variant="outline"
      color="gray"
      size="sm"
      icon="i-heroicons-x-mark"
      @click="reset"
    >
      Reset Filter
    </UButton>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  q?: string
  sort?: string
  selectedTypes?: string[]
  selectedMinistries?: string[]
  availableTypes: string[]
  availableMinistries: string[]
}>()

const emit = defineEmits<{
  (e: 'update:q', v: string): void
  (e: 'update:sort', v: string): void
  (e: 'update:selectedTypes', v: string[]): void
  (e: 'update:selectedMinistries', v: string[]): void
  (e: 'reset'): void
  (e: 'search', v: string): void
}>()

const TYPE_LABELS: Record<string, string> = {
  law: 'Undang-Undang',
  regulation: 'Peraturan',
  decree: 'Keputusan',
  circular: 'Surat Edaran',
  guideline: 'Pedoman',
  other: 'Lainnya',
}

const sortOptions = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Terpopuler', value: 'views' },
  { label: 'Relevansi', value: 'relevance' },
]

const localQ = ref(props.q || '')
const localSort = ref(props.sort || 'newest')
const selectedTypes = ref<string[]>(props.selectedTypes || [])
const selectedMinistries = ref<string[]>(props.selectedMinistries || [])

let debounce: ReturnType<typeof setTimeout>
function onSearch() {
  clearTimeout(debounce)
  debounce = setTimeout(() => emit('update:q', localQ.value), 300)
}

function toggleType(t: string) {
  const idx = selectedTypes.value.indexOf(t)
  if (idx >= 0) selectedTypes.value.splice(idx, 1)
  else selectedTypes.value.push(t)
  emit('update:selectedTypes', [...selectedTypes.value])
}

function toggleMinistry(m: string) {
  const idx = selectedMinistries.value.indexOf(m)
  if (idx >= 0) selectedMinistries.value.splice(idx, 1)
  else selectedMinistries.value.push(m)
  emit('update:selectedMinistries', [...selectedMinistries.value])
}

function reset() {
  localQ.value = ''
  localSort.value = 'newest'
  selectedTypes.value = []
  selectedMinistries.value = []
  emit('reset')
}

const hasFilters = computed(
  () => localQ.value || localSort.value !== 'newest' || selectedTypes.value.length || selectedMinistries.value.length,
)

watch(() => props.q, (v) => { localQ.value = v || '' })
watch(() => props.sort, (v) => { localSort.value = v || 'newest' })
</script>
