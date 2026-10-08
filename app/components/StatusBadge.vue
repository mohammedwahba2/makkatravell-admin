<script setup lang="ts">
const props = defineProps<{ kind: 'booking' | 'payment' | 'inquiry'; value: string }>()
const MAP = {
  booking: { labels: BOOKING_STATUS, colors: { PENDING: 'warning', CONFIRMED: 'success', CANCELLED: 'error', COMPLETED: 'info' } },
  payment: { labels: PAYMENT_STATUS, colors: { UNPAID: 'error', PARTIAL: 'warning', PAID: 'success', REFUNDED: 'neutral' } },
  inquiry: { labels: INQUIRY_STATUS, colors: { NEW: 'warning', IN_PROGRESS: 'info', DONE: 'success' } },
} as const
const m = computed(() => MAP[props.kind])
const color = computed(() => ((m.value.colors as Record<string, string>)[props.value] ?? 'neutral') as 'success')
</script>
<template><UBadge :color="color" variant="subtle" size="md" class="rounded-full">{{ m.labels[props.value] ?? props.value }}</UBadge></template>
