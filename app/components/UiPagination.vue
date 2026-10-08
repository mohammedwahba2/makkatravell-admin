<script setup lang="ts">
const props = defineProps<{ page: number; pages: number }>()
const emit = defineEmits<{ change: [number] }>()
</script>
<template>
  <div v-if="props.pages > 1" class="flex items-center justify-center gap-3 mt-5">
    <button class="btn-ghost" :disabled="props.page <= 1" @click="emit('change', props.page - 1)"><span class="i-lucide-chevron-right" />السابق</button>
    <span class="text-sm text-brand-700 font-semibold">{{ props.page }} / {{ props.pages }}</span>
    <button class="btn-ghost" :disabled="props.page >= props.pages" @click="emit('change', props.page + 1)">التالي<span class="i-lucide-chevron-left" /></button>
  </div>
</template>
