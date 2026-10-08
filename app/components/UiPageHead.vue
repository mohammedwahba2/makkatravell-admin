<script setup lang="ts">
defineProps<{ title: string; sub?: string }>()
</script>
<template>
  <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
    <div><h1 class="text-2xl font-extrabold text-brand-900">{{ title }}</h1><p v-if="sub" class="text-sm text-brand-500 mt-1">{{ sub }}</p></div>
    <div class="flex items-center gap-2"><slot /></div>
  </div>
</template>
