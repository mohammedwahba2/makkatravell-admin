<script setup lang="ts">
useHead({ title: 'الحجوزات' })
const { api } = useApi()
const route = useRoute()
const page = ref(1)
const status = ref<string>((route.query.status as string) || 'all')
const q = ref('')
const qd = refDebounced(q, 350)
const { data, status: st } = useAsyncData('bookings', () => api('/admin/bookings', { query: { page: page.value, limit: 15, status: status.value === 'all' ? undefined : status.value, q: qd.value || undefined } }),
  { watch: [page, status, qd], server: false })
watch([status, qd], () => { page.value = 1 })
const statusItems = [{ label: 'كل الحالات', value: 'all' }, ...Object.entries(BOOKING_STATUS).map(([value, label]) => ({ label, value }))]
const loading = computed(() => st.value === 'pending' && !data.value)
</script>

<template>
  <div>
    <UiPageHead title="الحجوزات" sub="تابع طلبات الحجز وأكّدها" />
    <div class="rise mb-4 flex flex-wrap gap-3 rounded-2xl bg-white p-4 ring ring-brand-200/70">
      <UInput v-model="q" icon="i-lucide-search" placeholder="بحث بالاسم أو الهاتف أو رقم الحجز" class="w-full sm:w-80" />
      <USelect v-model="status" :items="statusItems" class="w-full sm:w-52" />
    </div>

    <div class="rise overflow-x-auto rounded-2xl bg-white ring ring-brand-200/70" style="animation-delay:.08s">
      <table class="w-full min-w-[820px] text-sm">
        <thead class="bg-brand-50 text-xs text-brand-700">
          <tr><th class="p-3 text-start">رقم الحجز</th><th class="p-3 text-start">العميل</th><th class="p-3 text-start">البرنامج</th><th class="p-3 text-start">الإجمالي</th>
            <th class="p-3 text-start">الحالة</th><th class="p-3 text-start">الدفع</th><th class="p-3 text-start">التاريخ</th></tr>
        </thead>
        <tbody>
          <tr v-for="i in (loading ? 6 : 0)" :key="i" class="border-t border-brand-100"><td v-for="j in 7" :key="j" class="p-3"><USkeleton class="h-5" /></td></tr>
          <tr v-if="!loading && !data?.items.length"><td colspan="7" class="p-12 text-center text-brand-500"><UIcon name="i-lucide-inbox" class="mb-2 size-8 text-brand-300" /><p>لا توجد نتائج</p></td></tr>
          <tr v-for="b in data?.items" :key="b.id" class="cursor-pointer border-t border-brand-100 transition hover:bg-brand-50/70" @click="navigateTo(`/bookings/${b.id}`)">
            <td class="p-3 font-bold" dir="ltr">{{ b.reference }}</td>
            <td class="p-3"><p class="font-semibold">{{ b.fullName }}</p><p class="text-xs text-brand-500" dir="ltr">{{ b.phone }}</p></td>
            <td class="p-3">{{ b.package.title }}</td>
            <td class="p-3 font-semibold">{{ money(b.totalPrice) }}</td>
            <td class="p-3"><StatusBadge kind="booking" :value="b.status" /></td>
            <td class="p-3"><StatusBadge kind="payment" :value="b.paymentStatus" /></td>
            <td class="p-3 text-brand-500">{{ fdate(b.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="data && data.pages > 1" class="mt-5 flex justify-center"><UPagination v-model:page="page" :total="data.total" :items-per-page="15" /></div>
  </div>
</template>
