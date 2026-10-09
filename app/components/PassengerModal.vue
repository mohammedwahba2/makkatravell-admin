<script setup lang="ts">
const props = defineProps<{ bookingId: string; max: number; passengers: any[]; departure?: string | null }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [any] }>()
const { api } = useApi()
const notify = useNotify()
const rows = ref<any[]>([])
const saving = ref(false)
const blank = () => ({ fullName: '', gender: 'M', birthDate: '', passportNo: '', passportExpiry: '', nationality: 'مصري' })
watch(open, (v) => {
  if (!v) return
  rows.value = props.passengers.length ? props.passengers.map((p) => ({ ...p, birthDate: dateInput(p.birthDate), passportExpiry: dateInput(p.passportExpiry), passportNo: p.passportNo ?? '', gender: p.gender ?? 'M', nationality: p.nationality ?? 'مصري' })) : [blank()]
})
const genders = [{ label: 'ذكر', value: 'M' }, { label: 'أنثى', value: 'F' }]
const short = (r: any) => !!(r.passportExpiry && props.departure && new Date(r.passportExpiry) < new Date(new Date(props.departure).setMonth(new Date(props.departure).getMonth() + 6)))
async function save() {
  if (rows.value.some((r) => r.fullName.trim().length < 2)) return notify.err('أكمل أسماء المسافرين أو احذف الصفوف الفارغة')
  saving.value = true
  try {
    const body = { passengers: rows.value.map((r) => ({ fullName: r.fullName.trim(), gender: r.gender, birthDate: r.birthDate || undefined, passportNo: r.passportNo || undefined, passportExpiry: r.passportExpiry || undefined, nationality: r.nationality || undefined })) }
    emit('saved', await api(`/admin/bookings/${props.bookingId}/passengers`, { method: 'PUT', body })); notify.ok('تم حفظ بيانات المسافرين'); open.value = false
  } catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
</script>
<template>
  <UModal v-model:open="open" title="بيانات المسافرين" :description="`حتى ${max} مسافرين`" :ui="{ content: 'max-w-3xl' }">
    <template #body>
      <div class="space-y-3">
        <div v-for="(r, i) in rows" :key="i" class="grid grid-cols-2 gap-3 rounded-lg bg-brand-50 p-3 sm:grid-cols-6">
          <UFormField label="الاسم كما في الجواز" class="col-span-2 sm:col-span-3"><UInput v-model="r.fullName" class="w-full" /></UFormField>
          <UFormField label="النوع"><USelect v-model="r.gender" :items="genders" class="w-full" /></UFormField>
          <UFormField label="الميلاد" class="col-span-1 sm:col-span-2"><UInput v-model="r.birthDate" type="date" class="w-full" /></UFormField>
          <UFormField label="رقم الجواز" class="col-span-1 sm:col-span-2"><UInput v-model="r.passportNo" dir="ltr" class="w-full" /></UFormField>
          <UFormField label="انتهاء الجواز" class="col-span-1 sm:col-span-2" :hint="short(r) ? 'أقل من 6 أشهر بعد السفر!' : undefined"><UInput v-model="r.passportExpiry" type="date" class="w-full" :color="short(r) ? 'error' : undefined" /></UFormField>
          <UFormField label="الجنسية" class="col-span-1 sm:col-span-1"><UInput v-model="r.nationality" class="w-full" /></UFormField>
          <div class="flex items-end justify-end"><UButton color="error" variant="soft" icon="i-lucide-trash-2" aria-label="حذف" @click="rows.splice(i, 1)" /></div>
        </div>
        <UButton v-if="rows.length < max" color="neutral" variant="outline" icon="i-lucide-user-plus" @click="rows.push(blank())">إضافة مسافر</UButton>
      </div>
    </template>
    <template #footer><div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="outline" @click="open = false">إلغاء</UButton><UButton :loading="saving" @click="save">حفظ</UButton></div></template>
  </UModal>
</template>
