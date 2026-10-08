<script setup lang="ts">
useHead({ title: 'لوحة التحكم' })
const { api } = useApi()
const { data: s, status } = await useAsyncData('stats', () => api('/admin/stats'), { server: false })

const cards = computed(() => s.value ? [
  { label: 'إجمالي الحجوزات', value: s.value.bookings, icon: 'i-lucide-ticket' },
  { label: 'حجوزات قيد المراجعة', value: s.value.pending, icon: 'i-lucide-clock', hot: s.value.pending > 0 },
  { label: 'رسائل جديدة', value: s.value.newInquiries, icon: 'i-lucide-inbox', hot: s.value.newInquiries > 0 },
  { label: 'برامج منشورة', value: s.value.packages, icon: 'i-lucide-plane' },
  { label: 'المبالغ المحصّلة', value: money(s.value.revenue), icon: 'i-lucide-wallet', wide: true },
] : [])
const max = computed(() => Math.max(1, ...(s.value?.daily ?? []).map((d: any) => d.count)))
const tone = (st: string) => ({ PENDING: 'warn', CONFIRMED: 'ok', CANCELLED: 'bad', COMPLETED: 'info' } as const)[st as 'PENDING']
</script>

<template>
  <div>
    <UiPageHead title="لوحة التحكم" sub="نظرة سريعة على آخر نشاط" />
    <div v-if="status === 'pending'" class="text-brand-500">جاري التحميل…</div>
    <template v-else-if="s">
      <div class="grid gap-4 grid-cols-2 xl:grid-cols-5">
        <div v-for="c in cards" :key="c.label" class="card p-5" :class="c.wide ? 'col-span-2 xl:col-span-1' : ''">
          <div class="flex items-center justify-between text-brand-500"><span class="text-sm font-semibold">{{ c.label }}</span><span :class="c.icon" class="text-xl" /></div>
          <p class="mt-3 text-3xl font-extrabold" :class="c.hot ? 'text-brand-500' : 'text-brand-900'">{{ c.value }}</p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-5 mt-4">
        <section class="card p-5 lg:col-span-3">
          <h2 class="font-extrabold text-brand-900 mb-4">الحجوزات خلال آخر 30 يومًا</h2>
          <div v-if="!s.daily.length" class="text-sm text-brand-500 py-10 text-center">لا توجد حجوزات في هذه الفترة</div>
          <div v-else class="flex items-end gap-1.5 h-44">
            <div v-for="d in s.daily" :key="d.day" class="flex-1 min-w-0 flex flex-col items-center justify-end h-full gap-1" :title="`${fdate(d.day)}: ${d.count}`">
              <span class="text-[10px] text-brand-500">{{ d.count }}</span>
              <div class="w-full rounded-t-md bg-brand-500" :style="{ height: `${(d.count / max) * 100}%`, minHeight: '4px' }" />
            </div>
          </div>
        </section>
        <section class="card p-5 lg:col-span-2">
          <div class="flex items-center justify-between mb-3"><h2 class="font-extrabold text-brand-900">أحدث الحجوزات</h2><NuxtLink to="/bookings" class="text-xs font-bold text-brand-500">عرض الكل</NuxtLink></div>
          <p v-if="!s.recent.length" class="text-sm text-brand-500 py-8 text-center">لا توجد حجوزات بعد</p>
          <ul class="divide-y divide-brand-100">
            <li v-for="b in s.recent" :key="b.id">
              <NuxtLink :to="`/bookings/${b.id}`" class="flex items-center justify-between gap-3 py-3 hover:bg-brand-50 -mx-2 px-2 rounded-lg">
                <div class="min-w-0"><p class="font-bold text-sm truncate">{{ b.fullName }}</p><p class="text-xs text-brand-500" dir="ltr">{{ b.reference }}</p></div>
                <UiBadge :tone="tone(b.status)">{{ BOOKING_STATUS[b.status] }}</UiBadge>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>
