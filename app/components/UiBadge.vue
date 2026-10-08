<script setup lang="ts">
const props = defineProps<{ tone?: 'ok' | 'warn' | 'bad' | 'info' | 'mute' }>()
const cls = { ok: 'bg-emerald-50 text-emerald-700', warn: 'bg-amber-50 text-amber-700', bad: 'bg-red-50 text-red-700', info: 'bg-sky-50 text-sky-700', mute: 'bg-brand-100 text-brand-700' }
</script>
<template><span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold" :class="cls[props.tone ?? 'mute']"><slot /></span></template>
