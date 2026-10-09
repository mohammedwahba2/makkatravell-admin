<script setup lang="ts">
const props = defineProps<{ bookingId: string; remaining: number }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [any] }>()
const { api } = useApi()
const notify = useNotify()
const f = reactive({ amount: 0, method: 'CASH', reference: '', note: '', paidAt: '' })
const saving = ref(false)
const methods = Object.entries(PAY_METHODS).map(([value, label]) => ({ label, value }))
watch(open, (v) => { if (v) Object.assign(f, { amount: Math.max(0, props.remaining), method: 'CASH', reference: '', note: '', paidAt: new Date().toISOString().slice(0, 10) }) })
async function save() {
  if (!f.amount) return notify.err('أدخل المبلغ')
  const amount = f.method === 'REFUND' ? -Math.abs(f.amount) : Math.abs(f.amount)
  saving.value = true
  try { emit('saved', await api(`/admin/bookings/${props.bookingId}/payments`, { method: 'POST', body: { amount, method: f.method, reference: f.reference || undefined, note: f.note || undefined, paidAt: f.paidAt || undefined } })); notify.ok('تم تسجيل الدفعة'); open.value = false }
  catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
</script>
<template>
  <UModal v-model:open="open" title="تسجيل دفعة" :description="remaining > 0 ? `المتبقي ${money(remaining)}` : undefined" :ui="{ content: 'max-w-md' }">
    <template #body>
      <form id="pay-form" class="space-y-4" @submit.prevent="save">
        <UFormField :label="f.method === 'REFUND' ? 'مبلغ الاسترداد (ج.م)' : 'المبلغ (ج.م)'" required><UInput v-model.number="f.amount" type="number" min="0" step="0.01" class="w-full" /></UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="طريقة الدفع"><USelect v-model="f.method" :items="methods" class="w-full" /></UFormField>
          <UFormField label="تاريخ الدفع"><UInput v-model="f.paidAt" type="date" class="w-full" /></UFormField>
        </div>
        <UFormField label="رقم العملية / الإيصال"><UInput v-model="f.reference" dir="ltr" class="w-full" /></UFormField>
        <UFormField label="ملاحظة"><UInput v-model="f.note" class="w-full" /></UFormField>
      </form>
    </template>
    <template #footer><div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="outline" @click="open = false">إلغاء</UButton><UButton type="submit" form="pay-form" :loading="saving">{{ f.method === 'REFUND' ? 'تسجيل الاسترداد' : 'تسجيل الدفعة' }}</UButton></div></template>
  </UModal>
</template>
