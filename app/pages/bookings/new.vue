<script setup lang="ts">
useHead({ title: 'حجز يدوي' })
const { api } = useApi()
const notify = useNotify()
const { data: pk } = await useAsyncData('pk-for-manual', () => api('/admin/packages', { query: { limit: 100 } }), { server: false })
const pkgItems = computed(() => (pk.value?.items ?? []).filter((p: any) => p.isPublished).map((p: any) => ({ label: p.title, value: p.id })))
const f = reactive({ packageId: '', departureId: '', roomType: 'TRIPLE', adults: 2, children: 0, fullName: '', phone: '', email: '', nationalId: '', notes: '', status: 'CONFIRMED', override: '' as string | number })
const pkg = computed(() => (pk.value?.items ?? []).find((p: any) => p.id === f.packageId))
const depItems = computed(() => (pkg.value?.departures ?? []).map((d: any) => ({ label: `${fdate(d.date)} — متبقي ${d.seatsTotal - d.seatsTaken}`, value: d.id, disabled: d.seatsTotal - d.seatsTaken <= 0 })))
watch(() => f.packageId, () => { f.departureId = depItems.value.find((d: any) => !d.disabled)?.value ?? '' })
const dep = computed(() => pkg.value?.departures?.find((d: any) => d.id === f.departureId))
const unit = computed(() => Number(({ DOUBLE: dep.value?.priceDouble, TRIPLE: dep.value?.priceTriple, QUAD: dep.value?.priceQuad } as Record<string, any>)[f.roomType] || pkg.value?.basePrice || 0))
const estimate = computed(() => unit.value * f.adults + unit.value * 0.75 * f.children)
const roomItems = Object.entries(ROOM_TYPES).map(([value, label]) => ({ label, value }))
const stItems = Object.entries(BOOKING_STATUS).filter(([k]) => k !== 'CANCELLED').map(([value, label]) => ({ label, value }))
const saving = ref(false)
async function save() {
  if (!f.packageId) return notify.err('اختر البرنامج')
  if (!isEgPhone(f.phone)) return notify.err('رقم الموبايل غير صحيح')
  saving.value = true
  try {
    const body: Record<string, unknown> = { packageId: f.packageId, ...(f.departureId ? { departureId: f.departureId } : {}), roomType: f.roomType, adults: f.adults, children: f.children, fullName: f.fullName.trim(), phone: f.phone.replace(/\s/g, ''),
      ...(f.email ? { email: f.email } : {}), ...(f.nationalId ? { nationalId: f.nationalId } : {}), ...(f.notes ? { notes: f.notes } : {}), status: f.status, ...(f.override !== '' ? { totalPrice: Number(f.override) } : {}) }
    const r = await api('/admin/bookings', { method: 'POST', body }); notify.ok(`تم إنشاء الحجز ${r.reference}`); await navigateTo(`/bookings/${r.id}`)
  } catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
const isEgPhone = (v: string) => /^\+?[0-9]{8,15}$/.test(v.replace(/\s/g, ''))
</script>
<template>
  <form @submit.prevent="save">
    <UiPageHead title="حجز يدوي" sub="للحجوزات التليفونية أو الحضورية"><UButton to="/bookings" color="neutral" variant="outline">إلغاء</UButton><UButton type="submit" :loading="saving" icon="i-lucide-save">إنشاء الحجز</UButton></UiPageHead>
    <div class="grid gap-4 lg:grid-cols-3">
      <div class="stagger space-y-4 lg:col-span-2">
        <UCard><template #header><h2 class="font-extrabold">الرحلة</h2></template>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="البرنامج" required class="sm:col-span-2"><USelect v-model="f.packageId" :items="pkgItems" placeholder="اختر البرنامج" class="w-full" /></UFormField>
            <UFormField label="موعد السفر"><USelect v-model="f.departureId" :items="depItems" :disabled="!f.packageId" placeholder="—" class="w-full" /></UFormField>
            <UFormField label="نوع الغرفة"><USelect v-model="f.roomType" :items="roomItems" class="w-full" /></UFormField>
            <UFormField label="بالغين"><UInput v-model.number="f.adults" type="number" min="1" max="20" class="w-full" /></UFormField>
            <UFormField label="أطفال"><UInput v-model.number="f.children" type="number" min="0" max="20" class="w-full" /></UFormField>
          </div></UCard>
        <UCard><template #header><h2 class="font-extrabold">بيانات العميل</h2></template>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="الاسم" required><UInput v-model="f.fullName" required class="w-full" /></UFormField>
            <UFormField label="الموبايل" required><UInput v-model="f.phone" dir="ltr" required class="w-full" /></UFormField>
            <UFormField label="البريد"><UInput v-model="f.email" type="email" dir="ltr" class="w-full" /></UFormField>
            <UFormField label="الرقم القومي"><UInput v-model="f.nationalId" dir="ltr" class="w-full" /></UFormField>
            <UFormField label="ملاحظات" class="sm:col-span-2"><UTextarea v-model="f.notes" :rows="2" class="w-full" /></UFormField>
          </div></UCard>
      </div>
      <UCard class="rise h-fit"><template #header><h2 class="font-extrabold">الحساب</h2></template>
        <div class="space-y-4">
          <div class="rounded-xl bg-brand-50 p-4 text-sm"><p class="flex justify-between"><span>سعر الفرد</span><b class="num">{{ money(unit) }}</b></p><p class="mt-2 flex justify-between"><span>الإجمالي المحسوب</span><b class="num text-lg text-brand-900">{{ money(estimate) }}</b></p></div>
          <UFormField label="تعديل الإجمالي (اختياري)" hint="لخصم أو سعر خاص"><UInput v-model="f.override" type="number" min="0" placeholder="اتركه فارغًا لاستخدام المحسوب" class="w-full" /></UFormField>
          <UFormField label="حالة الحجز"><USelect v-model="f.status" :items="stItems" class="w-full" /></UFormField>
          <p class="text-xs leading-6 text-brand-500">بعد الإنشاء تسجّل الدفعات وبيانات المسافرين من صفحة الحجز.</p>
        </div></UCard>
    </div>
  </form>
</template>
