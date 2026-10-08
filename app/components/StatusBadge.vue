<script setup lang="ts">
const props = defineProps<{ kind: 'booking' | 'payment' | 'inquiry'; value: string }>()
const MAP = {
  booking: { labels: BOOKING_STATUS, dots: { PENDING: 'bg-amber-500', CONFIRMED: 'bg-emerald-600', CANCELLED: 'bg-red-500', COMPLETED: 'bg-sky-600' } },
  payment: { labels: PAYMENT_STATUS, dots: { UNPAID: 'bg-red-500', PARTIAL: 'bg-amber-500', PAID: 'bg-emerald-600', REFUNDED: 'bg-stone-400' } },
  inquiry: { labels: INQUIRY_STATUS, dots: { NEW: 'bg-amber-500', IN_PROGRESS: 'bg-sky-600', DONE: 'bg-emerald-600' } },
} as const
const m = computed(() => MAP[props.kind])
const dot = computed(() => (m.value.dots as Record<string, string>)[props.value] ?? 'bg-stone-400')
</script>
<template>
  <span class="inline-flex items-center gap-2 text-[13px] font-semibold text-brand-800">
    <span class="size-2 rounded-full" :class="[dot, value === 'PENDING' || value === 'NEW' ? 'pulse-dot' : '']" />{{ (m.labels as Record<string, string>)[props.value] ?? props.value }}
  </span>
</template>
