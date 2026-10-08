<script setup lang="ts">
const { api } = useApi()
const notify = useNotify()
const id = useRoute().params.id as string
const { data: b, refresh } = await useAsyncData(`booking-${id}`, () => api(`/admin/bookings/${id}`), { server: false })
useHead({ title: computed(() => (b.value ? `حجز ${b.value.reference}` : 'حجز')) })

const form = reactive({ status: '', paymentStatus: '', paidAmount: 0, adminNotes: '' })
watch(b, (v) => { if (v) Object.assign(form, { status: v.status, paymentStatus: v.paymentStatus, paidAmount: Number(v.paidAmount), adminNotes: v.adminNotes ?? '' }) }, { immediate: true })
const statusItems = Object.entries(BOOKING_STATUS).map(([value, label]) => ({ label, value }))
const payItems = Object.entries(PAYMENT_STATUS).map(([value, label]) => ({ label, value }))
const saving = ref(false)
async function save() {
  saving.value = true
  try { await api(`/admin/bookings/${id}`, { method: 'PATCH', body: { ...form } }); notify.ok('تم حفظ التغييرات'); await refresh() }
  catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
const remaining = computed(() => (b.value ? Number(b.value.totalPrice) - Number(form.paidAmount) : 0))
const wa = computed(() => (b.value ? `https://wa.me/${b.value.phone.replace(/^\+/, '').replace(/^0/, '20')}` : '#'))
</script>

<template>
  <div v-if="b">
    <UiPageHead :title="`حجز ${b.reference}`" :sub="`أُنشئ في ${fdatetime(b.createdAt)}`">
      <UButton to="/bookings" color="neutral" variant="outline" icon="i-lucide-arrow-right">رجوع</UButton>
      <UButton :to="wa" target="_blank" color="success" variant="soft" icon="i-lucide-message-circle">واتساب</UButton>
    </UiPageHead>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="stagger space-y-4 lg:col-span-2">
        <UCard>
          <template #header><h2 class="font-extrabold">بيانات العميل</h2></template>
          <dl class="grid gap-4 text-sm sm:grid-cols-2">
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">الاسم</dt><dd class="font-semibold">{{ b.fullName }}</dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">الهاتف</dt><dd class="font-semibold" dir="ltr" style="text-align:right">{{ b.phone }}</dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">البريد</dt><dd>{{ b.email || '—' }}</dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">الرقم القومي</dt><dd>{{ b.nationalId || '—' }}</dd></div>
          </dl>
          <UAlert v-if="b.notes" class="mt-4" color="neutral" variant="subtle" title="ملاحظات العميل" :description="b.notes" icon="i-lucide-message-square-text" />
        </UCard>
        <UCard>
          <template #header><h2 class="font-extrabold">تفاصيل الرحلة</h2></template>
          <dl class="grid gap-4 text-sm sm:grid-cols-2">
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">البرنامج</dt><dd class="font-semibold">{{ b.package.title }}</dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">موعد السفر</dt><dd>{{ b.departure ? fdate(b.departure.date) : 'غير محدد' }}</dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">الأفراد</dt><dd>{{ b.adults }} بالغ<span v-if="b.children"> + {{ b.children }} طفل</span></dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">نوع الغرفة</dt><dd>{{ ROOM_TYPES[b.roomType] }}</dd></div>
          </dl>
        </UCard>
        <UCard v-if="b.passengers.length">
          <template #header><h2 class="font-extrabold">المسافرون ({{ b.passengers.length }})</h2></template>
          <ul class="divide-y divide-brand-100 text-sm">
            <li v-for="p in b.passengers" :key="p.id" class="flex flex-wrap justify-between gap-2 py-2.5"><span class="font-semibold">{{ p.fullName }}</span><span class="text-brand-500" dir="ltr">{{ p.passportNo || '—' }}</span></li>
          </ul>
        </UCard>
      </div>

      <UCard class="rise h-fit" style="animation-delay:.12s">
        <template #header><h2 class="font-extrabold">إدارة الحجز</h2></template>
        <div class="space-y-4">
          <UFormField label="حالة الحجز"><USelect v-model="form.status" :items="statusItems" class="w-full" /></UFormField>
          <UFormField label="حالة الدفع"><USelect v-model="form.paymentStatus" :items="payItems" class="w-full" /></UFormField>
          <UFormField label="المبلغ المدفوع (ج.م)"><UInput v-model.number="form.paidAmount" type="number" min="0" class="w-full" /></UFormField>
          <div class="space-y-1.5 rounded-xl bg-brand-50 p-3 text-sm">
            <p class="flex justify-between"><span>الإجمالي</span><b>{{ money(b.totalPrice) }}</b></p>
            <p class="flex justify-between"><span>المتبقي</span><b :class="remaining > 0 ? 'text-brand-500' : 'text-emerald-700'">{{ money(Math.max(0, remaining)) }}</b></p>
          </div>
          <UFormField label="ملاحظات داخلية"><UTextarea v-model="form.adminNotes" :rows="3" class="w-full" /></UFormField>
          <UButton block :loading="saving" @click="save">حفظ التغييرات</UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
