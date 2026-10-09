<script setup lang="ts">
const { api, blob, compress } = useApi()
const notify = useNotify()
const { ask } = useConfirm()
const id = useRoute().params.id as string
const { data: b, refresh } = await useAsyncData(`booking-${id}`, () => api(`/admin/bookings/${id}`), { server: false })
useHead({ title: computed(() => (b.value ? `حجز ${b.value.reference}` : 'حجز')) })

const form = reactive({ status: '', adminNotes: '' })
watch(b, (v) => { if (v) Object.assign(form, { status: v.status, adminNotes: v.adminNotes ?? '' }) }, { immediate: true })
const statusItems = Object.entries(BOOKING_STATUS).map(([value, label]) => ({ label, value }))
const saving = ref(false)
async function save() {
  saving.value = true
  try { await api(`/admin/bookings/${id}`, { method: 'PATCH', body: { ...form } }); notify.ok('تم حفظ التغييرات'); await refresh() }
  catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
const remaining = computed(() => (b.value ? Math.max(0, Number(b.value.totalPrice) - Number(b.value.paidAmount)) : 0))
const wa = computed(() => (b.value ? `https://wa.me/${b.value.phone.replace(/^\+/, '').replace(/^0/, '20')}` : '#'))
const need = computed(() => (b.value ? b.value.adults + b.value.children : 0))

// ---- payments
const payOpen = ref(false)
const onPaid = (nb: any) => { b.value = nb }
async function removePayment(p: any) {
  if (!(await ask({ title: 'حذف الدفعة', description: `حذف دفعة ${money(p.amount)}؟ سيُعاد حساب المتبقي.`, confirmLabel: 'حذف', danger: true }))) return
  try { b.value = await api(`/admin/bookings/${id}/payments/${p.id}`, { method: 'DELETE' }); notify.ok('تم الحذف') } catch (e) { notify.err(errMsg(e)) }
}

// ---- travellers
const paxOpen = ref(false)
const expiryShort = (p: any) => !!(p.passportExpiry && b.value?.departure && new Date(p.passportExpiry) < new Date(new Date(b.value.departure.date).setMonth(new Date(b.value.departure.date).getMonth() + 6)))

// ---- documents
const docKind = ref('PASSPORT')
const docFor = ref<string>('all')
const kindItems = Object.entries(DOC_KINDS).map(([value, label]) => ({ label, value }))
const forItems = computed(() => [{ label: 'عام', value: 'all' }, ...(b.value?.passengers ?? []).map((p: any, i: number) => ({ label: p.fullName, value: String(i) }))])
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
async function pickDoc(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]; if (!f) return
  uploading.value = true
  try {
    const fd = new FormData(); fd.append('kind', docKind.value); if (docFor.value !== 'all') fd.append('passengerIx', docFor.value); fd.append('file', await compress(f))
    await api(`/admin/bookings/${id}/documents`, { method: 'POST', body: fd }); notify.ok('تم رفع المستند'); await refresh()
  } catch (x) { notify.err(errMsg(x)) } finally { uploading.value = false; input.value = '' }
}
async function viewDoc(d: any) {
  try { const url = URL.createObjectURL(await blob(`/admin/documents/${d.id}`)); window.open(url, '_blank'); setTimeout(() => URL.revokeObjectURL(url), 60_000) } catch (e) { notify.err(errMsg(e)) }
}
async function delDoc(d: any) {
  if (!(await ask({ title: 'حذف المستند', description: `حذف ${DOC_KINDS[d.kind]} نهائيًا؟`, confirmLabel: 'حذف', danger: true }))) return
  try { await api(`/admin/documents/${d.id}`, { method: 'DELETE' }); notify.ok('تم الحذف'); await refresh() } catch (e) { notify.err(errMsg(e)) }
}
const paxName = (ix: number | null) => (ix === null || ix === undefined ? 'عام' : b.value?.passengers?.[ix]?.fullName ?? `مسافر ${ix + 1}`)
</script>

<template>
  <div v-if="b">
    <UiPageHead :title="`حجز ${b.reference}`" :sub="`أُنشئ في ${fdatetime(b.createdAt)} · ${b.source === 'STAFF' ? 'أدخله موظف' : 'من الموقع'}`">
      <UButton to="/bookings" color="neutral" variant="outline" icon="i-lucide-arrow-right">رجوع</UButton>
      <UButton :to="`/bookings/${id}/print`" target="_blank" color="neutral" variant="outline" icon="i-lucide-printer">طباعة / PDF</UButton>
      <UButton :to="wa" target="_blank" color="success" variant="soft" icon="i-lucide-message-circle">واتساب</UButton>
    </UiPageHead>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="stagger space-y-4 lg:col-span-2">
        <UCard>
          <template #header><h2 class="font-extrabold">بيانات العميل والرحلة</h2></template>
          <dl class="grid gap-4 text-sm sm:grid-cols-2">
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">الاسم</dt><dd class="font-semibold">{{ b.fullName }}</dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">الهاتف</dt><dd class="num font-semibold" dir="ltr" style="text-align:right">{{ b.phone }}</dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">البريد / الرقم القومي</dt><dd>{{ b.email || '—' }} · <span class="num">{{ b.nationalId || '—' }}</span></dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">البرنامج</dt><dd class="font-semibold">{{ b.package.title }}</dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">موعد السفر</dt><dd>{{ b.departure ? fdate(b.departure.date) : 'غير محدد' }}</dd></div>
            <div><dt class="mb-1 text-xs font-semibold text-brand-500">الأفراد والغرفة</dt><dd>{{ b.adults }} بالغ<span v-if="b.children"> + {{ b.children }} طفل</span> · {{ ROOM_TYPES[b.roomType] }}</dd></div>
          </dl>
          <UAlert v-if="b.notes" class="mt-4" color="neutral" variant="subtle" title="ملاحظات العميل" :description="b.notes" icon="i-lucide-message-square-text" />
        </UCard>

        <UCard>
          <template #header><div class="flex items-center justify-between gap-3"><h2 class="font-extrabold">المسافرون <span class="num text-brand-500">{{ b.passengers.length }}/{{ need }}</span></h2><UButton color="neutral" variant="outline" size="sm" icon="i-lucide-pencil" @click="paxOpen = true">{{ b.passengers.length ? 'تعديل' : 'إضافة' }}</UButton></div></template>
          <UAlert v-if="b.passengers.length < need" class="mb-4" color="warning" variant="subtle" icon="i-lucide-user-round-search" :description="`ينقص ${need - b.passengers.length} مسافر(ين). يمكن للعميل إكمالها من صفحة «تتبع حجزك» أو تُدخل أنت البيانات.`" />
          <p v-if="!b.passengers.length" class="py-6 text-center text-sm text-brand-500">لم تُسجَّل بيانات المسافرين بعد.</p>
          <div v-else class="overflow-x-auto"><table class="w-full min-w-[620px] text-sm">
            <thead class="text-xs text-brand-500"><tr><th class="py-2 text-start">الاسم</th><th class="py-2 text-start">الجواز</th><th class="py-2 text-start">انتهاء الجواز</th><th class="py-2 text-start">الميلاد</th><th class="py-2 text-start">الجنسية</th></tr></thead>
            <tbody><tr v-for="p in b.passengers" :key="p.id" class="border-t border-brand-100">
              <td class="py-2.5 font-semibold">{{ p.fullName }}</td><td class="num py-2.5" dir="ltr" style="text-align:right">{{ p.passportNo || '—' }}</td>
              <td class="py-2.5" :class="expiryShort(p) ? 'font-bold text-red-600' : ''"><span class="num">{{ p.passportExpiry ? fdate(p.passportExpiry) : '—' }}</span><UBadge v-if="expiryShort(p)" color="error" variant="subtle" class="ms-2">قبل 6 أشهر</UBadge></td>
              <td class="num py-2.5">{{ p.birthDate ? fdate(p.birthDate) : '—' }}</td><td class="py-2.5">{{ p.nationality || '—' }}</td></tr></tbody></table></div>
        </UCard>

        <UCard>
          <template #header><div class="flex flex-wrap items-center justify-between gap-3"><h2 class="font-extrabold">المستندات (خاصة)</h2>
            <div class="flex flex-wrap items-center gap-2"><USelect v-model="docKind" :items="kindItems" size="sm" class="w-36" /><USelect v-model="docFor" :items="forItems" size="sm" class="w-40" />
              <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-upload" :loading="uploading" @click="fileInput?.click()">رفع</UButton><input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="sr-only" @change="pickDoc" /></div></div></template>
          <p v-if="!b.documents.length" class="py-6 text-center text-sm text-brand-500">لا توجد مستندات. تظهر هنا صور الجوازات التي يرفعها العميل.</p>
          <ul v-else class="divide-y divide-brand-100">
            <li v-for="d in b.documents" :key="d.id" class="flex items-center gap-3 py-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-600"><UIcon :name="d.mimeType === 'application/pdf' ? 'i-lucide-file-text' : 'i-lucide-image'" class="size-5" /></span>
              <div class="min-w-0 flex-1"><p class="truncate text-sm font-bold">{{ DOC_KINDS[d.kind] }} — {{ paxName(d.passengerIx) }}</p><p class="text-xs text-brand-500">{{ d.filename }} · <span class="num">{{ fsize(d.size) }}</span> · {{ d.uploadedBy === 'CUSTOMER' ? 'رفعه العميل' : 'رفعه موظف' }} · {{ fdatetime(d.createdAt) }}</p></div>
              <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-eye" @click="viewDoc(d)">عرض</UButton>
              <UButton color="error" variant="soft" size="sm" icon="i-lucide-trash-2" aria-label="حذف" @click="delDoc(d)" />
            </li>
          </ul>
          <p class="mt-3 flex items-center gap-2 text-xs text-brand-500"><UIcon name="i-lucide-lock" class="size-3.5" />لا تُعرض هذه الملفات إلا للموظفين بعد تسجيل الدخول، ويُسجَّل كل عرض في سجل النشاط.</p>
        </UCard>

        <UCard>
          <template #header><div class="flex items-center justify-between gap-3"><h2 class="font-extrabold">الدفعات</h2><UButton size="sm" icon="i-lucide-plus" @click="payOpen = true">تسجيل دفعة</UButton></div></template>
          <p v-if="!b.payments.length" class="py-6 text-center text-sm text-brand-500">لا توجد دفعات مسجّلة.</p>
          <ul v-else class="divide-y divide-brand-100">
            <li v-for="p in b.payments" :key="p.id" class="flex items-center gap-3 py-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-lg" :class="Number(p.amount) < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'"><UIcon :name="Number(p.amount) < 0 ? 'i-lucide-undo-2' : 'i-lucide-banknote'" class="size-5" /></span>
              <div class="min-w-0 flex-1"><p class="text-sm font-bold"><span class="num">{{ money(Math.abs(Number(p.amount))) }}</span> <span class="font-medium text-brand-500">— {{ PAY_METHODS[p.method] ?? p.method }}</span></p><p class="text-xs text-brand-500">{{ fdate(p.paidAt) }}<template v-if="p.reference"> · <span class="num" dir="ltr">{{ p.reference }}</span></template><template v-if="p.note"> · {{ p.note }}</template><template v-if="p.createdByName"> · {{ p.createdByName }}</template></p></div>
              <UButton color="error" variant="soft" size="sm" icon="i-lucide-trash-2" aria-label="حذف" @click="removePayment(p)" />
            </li>
          </ul>
        </UCard>
      </div>

      <UCard class="rise h-fit lg:sticky lg:top-20" style="animation-delay:.12s">
        <template #header><h2 class="font-extrabold">إدارة الحجز</h2></template>
        <div class="space-y-4">
          <UFormField label="حالة الحجز"><USelect v-model="form.status" :items="statusItems" class="w-full" /></UFormField>
          <div class="space-y-2 rounded-xl bg-brand-50 p-4 text-sm">
            <p class="flex justify-between"><span>الإجمالي</span><b class="num">{{ money(b.totalPrice) }}</b></p>
            <p class="flex justify-between"><span>المدفوع</span><b class="num text-emerald-700">{{ money(b.paidAmount) }}</b></p>
            <p class="flex justify-between"><span>المتبقي</span><b class="num" :class="remaining > 0 ? 'text-brand-500' : 'text-emerald-700'">{{ money(remaining) }}</b></p>
            <p class="flex items-center justify-between border-t border-brand-100 pt-2"><span>حالة الدفع</span><StatusBadge kind="payment" :value="b.paymentStatus" /></p>
          </div>
          <UFormField label="ملاحظات داخلية"><UTextarea v-model="form.adminNotes" :rows="3" class="w-full" /></UFormField>
          <UButton block :loading="saving" @click="save">حفظ التغييرات</UButton>
        </div>
      </UCard>
    </div>

    <PaymentModal v-model:open="payOpen" :booking-id="id" :remaining="remaining" @saved="onPaid" />
    <PassengerModal v-model:open="paxOpen" :booking-id="id" :max="need" :passengers="b.passengers" :departure="b.departure?.date" @saved="(nb: any) => (b = nb)" />
  </div>
</template>
