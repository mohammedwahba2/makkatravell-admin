<script setup lang="ts">
defineProps<{ title: string; open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>
<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4" @keydown.esc="emit('close')">
      <div class="absolute inset-0 bg-brand-ink/50" @click="emit('close')" />
      <div class="relative card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" role="dialog" aria-modal="true">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-extrabold text-brand-900">{{ title }}</h2>
          <button class="p-1 cursor-pointer text-brand-500" aria-label="إغلاق" @click="emit('close')"><span class="i-lucide-x text-xl" /></button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
