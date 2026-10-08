<script setup lang="ts">
useHead({ title: 'الحجوزات' })
const { api } = useApi()
const route = useRoute()
const page = ref(1)
const status = ref<string>((route.query.status as string) || '')
const q = ref('')
const qDebounced = refDebounced(q, 350)
const { data, status: st } = await useAsyncData('bookings', () => api('/admin/bookings', { query: { page: page.value, limit: 15, status: status.value || undefined, q: qDebounced.value || undefined } }),
  { watch: [page, status, qDebounced], server: false })
watch([status, qDebounced], () => { page.value = 1 })
const tone = (s: string) => ({ PENDING: 'warn', CONFIRMED: 'ok', CANCELLED: 'bad', COMPLETED: 'info' } as const)[s as 'PENDING']
const ptone = (s: string) => ({ UNPAID: 'bad', PARTIAL: 'warn', PAID: 'ok', REFUNDED: 'mute' } as const)[s as 'PAID']
</script>

<template>
  <div>
    <UiPageHead title="الحجوزات" sub="تابع طلبات الحجز وأكدها" />
    <div class="card p-4 mb-4 flex flex-wrap gap-3">
      <input v-model="q" class="input sm:max-w-xs" placeholder="بحث بالاسم أو الهاتف أو رقم الحجز" aria-label="بحث" />
      <select v-model="status" class="input sm:max-w-[200px]" aria-label="الحالة">
        <option value="">كل الحالات</option>
        <option v-for="(l, k) in BOOKING_STATUS" :key="k" :value="k">{{ l }}</option>
      </select>
    </div>
    <div class="card overflow-x-auto">
      <table class="min-w-[760px] text-sm">
        <thead class="bg-brand-50 text-brand-700 text-xs"><tr class="text-start">
          <th class="p-3 text-start">رقم الحجز</th><th class="p-3 text-start">العميل</th><th class="p-3 text-start">البرنامج</th><th class="p-3 text-start">الإجمالي</th>
          <th class="p-3 text-start">الحالة</th><th class="p-3 text-start">الدفع</th><th class="p-3 text-start">التاريخ</th></tr></thead>
        <tbody>
          <tr v-if="st === 'pending'"><td colspan="7" class="p-8 text-center text-brand-500">جاري التحميل…</td></tr>
          <tr v-else-if="!data?.items.length"><td colspan="7" class="p-8 text-center text-brand-500">لا توجد نتائج</td></tr>
          <tr v-for="b in data?.items" :key="b.id" class="border-t border-brand-100 hover:bg-brand-50/60 cursor-pointer" @click="navigateTo(`/bookings/${b.id}`)">
            <td class="p-3 font-bold" dir="ltr">{{ b.reference }}</td>
            <td class="p-3"><p class="font-semibold">{{ b.fullName }}</p><p class="text-xs text-brand-500" dir="ltr">{{ b.phone }}</p></td>
            <td class="p-3">{{ b.package.title }}</td>
            <td class="p-3 font-semibold">{{ money(b.totalPrice) }}</td>
            <td class="p-3"><UiBadge :tone="tone(b.status)">{{ BOOKING_STATUS[b.status] }}</UiBadge></td>
            <td class="p-3"><UiBadge :tone="ptone(b.paymentStatus)">{{ PAYMENT_STATUS[b.paymentStatus] }}</UiBadge></td>
            <td class="p-3 text-brand-500">{{ fdate(b.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <UiPagination :page="page" :pages="data?.pages ?? 1" @change="page = $event" />
  </div>
</template>
