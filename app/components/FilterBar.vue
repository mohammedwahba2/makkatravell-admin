<script setup lang="ts">
export interface Chip { label: string; value: string; count?: number }
withDefaults(defineProps<{ placeholder?: string; chips?: Chip[]; total?: number; unit?: string; searchable?: boolean }>(), { searchable: true })
const q = defineModel<string>('q', { default: '' })
const chip = defineModel<string>('chip', { default: 'all' })

const input = ref<{ inputRef?: HTMLInputElement } | null>(null)
function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !t.isContentEditable) { e.preventDefault(); input.value?.inputRef?.focus() }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="rise mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div v-if="chips?.length" class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0" style="scrollbar-width: none">
      <button v-for="c in chips" :key="c.value" type="button"
        class="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md px-3.5 text-[13px] font-semibold transition-all duration-200"
        :class="chip === c.value ? 'bg-brand-900 text-white shadow-md shadow-brand-900/20' : 'bg-white text-brand-700 shadow-[0_1px_2px_rgb(59_36_24/.06)] hover:bg-brand-50'"
        @click="chip = c.value">
        {{ c.label }}
        <span v-if="c.count !== undefined" class="num rounded px-1.5 text-[11px] leading-5" :class="chip === c.value ? 'bg-white/15 text-brand-100' : 'bg-brand-100 text-brand-600'">{{ c.count }}</span>
      </button>
    </div>

    <div class="flex items-center gap-3">
      <span v-if="total !== undefined" class="hidden whitespace-nowrap text-[13px] text-brand-500 sm:block"><b class="num text-brand-900">{{ total }}</b> {{ unit }}</span>
      <UInput v-if="searchable" ref="input" v-model="q" variant="none" icon="i-lucide-search" :placeholder="placeholder ?? 'بحث…'" class="w-full lg:w-80"
        :ui="{ base: 'h-9 rounded-md bg-white shadow-[0_1px_2px_rgb(59_36_24/.06)] transition focus-visible:ring-2 focus-visible:ring-brand-500', leadingIcon: 'text-brand-400' }">
        <template #trailing>
          <UButton v-if="q" color="neutral" variant="link" size="xs" icon="i-lucide-x" aria-label="مسح" @click="q = ''" />
          <kbd v-else class="num hidden rounded bg-brand-100 px-1.5 text-[11px] leading-5 text-brand-500 sm:block">/</kbd>
        </template>
      </UInput>
    </div>
  </div>
</template>
