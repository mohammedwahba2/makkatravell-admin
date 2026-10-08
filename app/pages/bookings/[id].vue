<script setup lang="ts">
const { api } = useApi()
const toast = useToast()
const id = useRoute().params.id as string
const { data: b, refresh } = await useAsyncData(`booking-${id}`, () => api(`/admin/bookings/${id}`), { server: false })
useHead({ title: computed(() => b.value ? `حجز ${b.value.reference}` : 'حجز') })

const form = reactive({ status: '', paymentStatus: '', paidAmount: 0, adminNotes: '' })
watch(b, (v) => { if (v) Object.assign(form, { status: v.status, paymentStatus: v.paymentStatus, paidAmount: Number(v.paidAmount), adminNotes: v.adminNotes ?? '' }) }, { immediate: true })
const saving = ref(false)
async function save() {
  saving.value = true
  try { await api(`/admin/bookings/${id}`, { method: 'PATCH', body: { ...form } }); toast.ok('تم حفظ التغييرات'); await refresh() }
  catch (e) { toast.err(errMsg(e)) } finally { saving.value = false }
}
const remaining = computed(() => b.value ? Number(b.value.totalPrice) - Number(form.paidAmount) : 0)
const wa = computed(() => b.value ? `https://wa.me/${b.value.phone.replace(/^\+/, '').replace(/^0/, '20')}` : '#')
</script>

<template>
  <div v-if="b">
    <UiPageHead :title="`حجز ${b.reference}`" :sub="`أُنشئ في ${fdatetime(b.createdAt)}`">
      <NuxtLink to="/bookings" class="btn-ghost"><span class="i-lucide-arrow-right" />رجوع</NuxtLink>
      <a :href="wa" target="_blank" rel="noopener" class="btn-ghost"><span class="i-lucide-message-circle" />واتساب</a>
    </UiPageHead>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4">
        <section class="card p-5">
          <h2 class="font-extrabold mb-4">بيانات العميل</h2>
          <dl class="grid sm:grid-cols-2 gap-4 text-sm">
            <div><dt class="label">الاسم</dt><dd class="font-semibold">{{ b.fullName }}</dd></div>
            <div><dt class="label">الهاتف</dt><dd class="font-semibold" dir="ltr" style="text-align:right">{{ b.phone }}</dd></div>
            <div><dt class="label">البريد</dt><dd>{{ b.email || '—' }}</dd></div>
            <div><dt class="label">الرقم القومي</dt><dd>{{ b.nationalId || '—' }}</dd></div>
          </dl>
          <div v-if="b.notes" class="mt-4 rounded-xl bg-brand-50 p-3 text-sm"><span class="label">ملاحظات العميل</span>{{ b.notes }}</div>
        </section>
        <section class="card p-5">
          <h2 class="font-extrabold mb-4">تفاصيل الرحلة</h2>
          <dl class="grid sm:grid-cols-2 gap-4 text-sm">
            <div><dt class="label">البرنامج</dt><dd class="font-semibold">{{ b.package.title }}</dd></div>
            <div><dt class="label">موعد السفر</dt><dd>{{ b.departure ? fdate(b.departure.date) : 'غير محدد' }}</dd></div>
            <div><dt class="label">الأفراد</dt><dd>{{ b.adults }} بالغ<span v-if="b.children"> + {{ b.children }} طفل</span></dd></div>
            <div><dt class="label">نوع الغرفة</dt><dd>{{ ROOM_TYPES[b.roomType] }}</dd></div>
          </dl>
        </section>
        <section v-if="b.passengers.length" class="card p-5">
          <h2 class="font-extrabold mb-4">المسافرون ({{ b.passengers.length }})</h2>
          <ul class="divide-y divide-brand-100 text-sm">
            <li v-for="p in b.passengers" :key="p.id" class="py-2.5 flex flex-wrap justify-between gap-2">
              <span class="font-semibold">{{ p.fullName }}</span><span class="text-brand-500" dir="ltr">{{ p.passportNo || '—' }}</span>
            </li>
          </ul>
        </section>
      </div>

      <aside class="card p-5 h-fit space-y-4">
        <h2 class="font-extrabold">إدارة الحجز</h2>
        <div><label class="label" for="st">حالة الحجز</label>
          <select id="st" v-model="form.status" class="input"><option v-for="(l, k) in BOOKING_STATUS" :key="k" :value="k">{{ l }}</option></select></div>
        <div><label class="label" for="ps">حالة الدفع</label>
          <select id="ps" v-model="form.paymentStatus" class="input"><option v-for="(l, k) in PAYMENT_STATUS" :key="k" :value="k">{{ l }}</option></select></div>
        <div><label class="label" for="pa">المبلغ المدفوع (ج.م)</label><input id="pa" v-model.number="form.paidAmount" type="number" min="0" class="input" /></div>
        <div class="rounded-xl bg-brand-50 p-3 text-sm space-y-1.5">
          <p class="flex justify-between"><span>الإجمالي</span><b>{{ money(b.totalPrice) }}</b></p>
          <p class="flex justify-between"><span>المتبقي</span><b :class="remaining > 0 ? 'text-brand-500' : 'text-emerald-700'">{{ money(Math.max(0, remaining)) }}</b></p>
        </div>
        <div><label class="label" for="an">ملاحظات داخلية</label><textarea id="an" v-model="form.adminNotes" rows="3" class="input" /></div>
        <button class="btn-primary w-full" :disabled="saving" @click="save">{{ saving ? 'جاري الحفظ…' : 'حفظ التغييرات' }}</button>
      </aside>
    </div>
  </div>
</template>
