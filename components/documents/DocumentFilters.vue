<template>
  <div class="flex flex-wrap items-center gap-3">
    <UInput
      v-model="localSearch"
      placeholder="Cari dokumen..."
      icon="i-heroicons-magnifying-glass"
      class="w-64"
      @input="emit('update:search', localSearch)"
    />
    <USelect
      v-model="localType"
      :options="typeOptions"
      placeholder="Semua jenis"
      class="w-40"
      @change="emit('update:type', localType)"
    />
    <UInput
      v-model="localMinistry"
      placeholder="Kementerian"
      class="w-44"
      @input="emit('update:ministry', localMinistry)"
    />
    <UButton
      v-if="hasFilters"
      variant="ghost"
      icon="i-heroicons-x-mark"
      size="sm"
      @click="clearAll"
    >
      Clear
    </UButton>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  search?: string
  type?: string
  ministry?: string
}>()

const emit = defineEmits<{
  (e: 'update:search', v: string): void
  (e: 'update:type', v: string): void
  (e: 'update:ministry', v: string): void
}>()

const localSearch = ref(props.search || '')
const localType = ref(props.type || '')
const localMinistry = ref(props.ministry || '')

const typeOptions = [
  { label: 'Semua Jenis', value: '' },
  { label: 'Undang-Undang', value: 'law' },
  { label: 'Peraturan', value: 'regulation' },
  { label: 'Keputusan', value: 'decree' },
  { label: 'Surat Edaran', value: 'circular' },
  { label: 'Pedoman', value: 'guideline' },
  { label: 'Lainnya', value: 'other' },
]

const hasFilters = computed(() => localSearch.value || localType.value || localMinistry.value)

function clearAll() {
  localSearch.value = ''
  localType.value = ''
  localMinistry.value = ''
  emit('update:search', '')
  emit('update:type', '')
  emit('update:ministry', '')
}
</script>
