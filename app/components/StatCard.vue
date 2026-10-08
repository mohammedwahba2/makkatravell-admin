<script setup lang="ts">
const props = defineProps<{ label: string; value: number; icon: string; hot?: boolean; currency?: boolean }>()
const fmtMoney = money
const n = useCountUp(toRef(props, 'value'))
</script>
<template>
  <div class="lift rounded-2xl bg-white ring ring-brand-200/70 p-5">
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-brand-500">{{ label }}</span>
      <span class="grid size-10 place-items-center rounded-xl" :class="hot ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-700'"><UIcon :name="icon" class="size-5" /></span>
    </div>
    <p class="mt-3 text-3xl font-extrabold tabular-nums" :class="hot ? 'text-brand-500' : 'text-brand-900'">{{ currency ? fmtMoney(n) : n.toLocaleString('ar-EG') }}</p>
  </div>
</template>
