<script setup lang="ts">
defineProps<{ title: string; sub?: string }>()
</script>
<template>
  <div class="rise mb-7 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p v-if="sub" class="eyebrow mb-1.5">{{ sub }}</p>
      <h1 class="text-[28px] font-extrabold leading-tight tracking-tight text-brand-950">{{ title }}</h1>
    </div>
    <div class="flex items-center gap-2"><slot /></div>
  </div>
</template>
