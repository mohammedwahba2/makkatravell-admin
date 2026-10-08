<script setup lang="ts">
const { toasts } = useToast()
</script>
<template>
  <div class="fixed bottom-5 inset-x-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4" aria-live="polite">
    <div v-for="t in toasts" :key="t.id"
      class="pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg text-white"
      :class="t.type === 'ok' ? 'bg-brand-700' : 'bg-red-700'">
      <span :class="t.type === 'ok' ? 'i-lucide-circle-check' : 'i-lucide-circle-alert'" />{{ t.text }}
    </div>
  </div>
</template>
