<script setup lang="ts">
useHead({ title: 'نظرة عامة' })
const { api } = useApi()
const auth = useAuth()
const { data: s, status } = useAsyncData('stats', () => api('/admin/stats'), { server: false })
const loading = computed(() => !s.value)

const hr = new Date().getHours()
const greeting = hr < 5 ? 'مساء الخير' : hr < 12 ? 'صباح الخير' : hr < 18 ? 'نهارك سعيد' : 'مساء الخير'

// zero-filled 30-day series
const series = computed(() => {
  const map = new Map<string, number>((s.value?.daily ?? []).map((d: any) => [new Date(d.day).toISOString().slice(0, 10), Number(d.count)]))
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400_000)
    return { label: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(d), value: map.get(d.toISOString().slice(0, 10)) ?? 0 }
  })
})
const total30 = computed(() => series.value.reduce((a, b) => a + b.value, 0))

const revenue = computed(() => s.value?.revenue ?? 0)
const shownRevenue = useCountUp(revenue)
const collected = computed(() => (s.value?.booked ? Math.min(100, Math.round((s.value.revenue / s.value.booked) * 100)) : 0))

const PIPE = [
  { key: 'PENDING', label: 'قيد المراجعة', color: '#D4A24C' },
  { key: 'CONFIRMED', label: 'مؤكد', color: '#2F7D5B' },
  { key: 'COMPLETED', label: 'مكتمل', color: '#3F7CA6' },
  { key: 'CANCELLED', label: 'ملغي', color: '#C25B4E' },
]
const pipe = computed(() => {
  const by = s.value?.byStatus ?? {}
  const total = PIPE.reduce((a, p) => a + (by[p.key] ?? 0), 0)
  return { total, items: PIPE.map((p) => ({ ...p, n: by[p.key] ?? 0, pct: total ? ((by[p.key] ?? 0) / total) * 100 : 0 })) }
})
const fill = (d: { seatsTaken: number; seatsTotal: number }) => Math.round((d.seatsTaken / d.seatsTotal) * 100)
const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('')
</script>

<template>
  <div>
    <!-- greeting -->
    <div class="rise mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="eyebrow mb-1.5">نظرة عامة</p>
        <h1 class="text-[30px] font-extrabold leading-tight tracking-tight text-brand-950">{{ greeting }}، {{ auth.user.value?.name }}</h1>
        <p v-if="s" class="mt-1 text-[15px] text-brand-600">
          <template v-if="s.pending">لديك <b class="num text-brand-950">{{ s.pending }}</b> حجز بانتظار المراجعة<template v-if="s.newInquiries"> و<b class="num text-brand-950">{{ s.newInquiries }}</b> رسالة جديدة</template>.</template>
          <template v-else>كل شيء تحت السيطرة، لا توجد حجوزات معلّقة.</template>
        </p>
      </div>
      <div class="flex gap-2">
        <UButton to="/packages/new" color="neutral" variant="outline" icon="i-lucide-plus">برنامج جديد</UButton>
        <UButton to="/bookings?status=PENDING" icon="i-lucide-arrow-up-left" trailing>مراجعة الحجوزات</UButton>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-12">
      <!-- revenue hero -->
      <section class="grain rise relative overflow-hidden rounded-[10px] bg-brand-900 p-6 text-brand-100 lg:col-span-4" style="animation-delay:.05s">
        <svg class="pointer-events-none absolute -bottom-10 -start-10 size-72 opacity-[.13]" viewBox="0 0 100 100" fill="none" stroke="#E8DCCB" stroke-width=".5">
          <path v-for="i in 5" :key="i" :d="`M${50 - i * 9} 100 V${60 - i * 4} A${i * 18} ${i * 18} 0 0 1 50 ${6 - i * 1.2} A${i * 18} ${i * 18} 0 0 1 ${50 + i * 9} ${60 - i * 4} V100`" />
        </svg>
        <p class="eyebrow !text-brand-300">إجمالي المحصّل</p>
        <USkeleton v-if="loading" class="mt-4 h-14 w-48 bg-white/10" />
        <p v-else class="num mt-3 text-[52px] font-bold leading-none text-white">{{ fnum(shownRevenue) }}<span class="ms-2 text-lg font-semibold text-brand-300">ج.م</span></p>
        <div class="mt-8">
          <div class="mb-2 flex justify-between text-[13px]"><span class="text-brand-300">نسبة التحصيل</span><b class="num text-white">{{ collected }}%</b></div>
          <div class="h-1.5 overflow-hidden rounded-full bg-white/15"><div class="h-full rounded-full bg-gradient-to-l from-brand-300 to-brand-400 transition-all duration-1000 ease-out" :style="{ width: `${collected}%` }" /></div>
          <p v-if="s" class="mt-3 text-[13px] text-brand-300">من إجمالي حجوزات بقيمة <b class="num text-brand-100">{{ fnum(s.booked) }}</b> ج.م</p>
        </div>
        <div v-if="s" class="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/10 text-center">
          <div class="bg-brand-900 py-3"><p class="num text-2xl font-bold text-white">{{ s.bookings }}</p><p class="text-[12px] text-brand-300">إجمالي الحجوزات</p></div>
          <div class="bg-brand-900 py-3"><p class="num text-2xl font-bold text-white">{{ s.packages }}</p><p class="text-[12px] text-brand-300">برامج منشورة</p></div>
        </div>
      </section>

      <!-- bookings chart -->
      <section class="panel rise p-6 lg:col-span-8" style="animation-delay:.1s">
        <div class="mb-2 flex items-start justify-between gap-4">
          <div><p class="eyebrow mb-1">آخر 30 يومًا</p><h2 class="text-lg font-extrabold text-brand-950">الحجوزات الجديدة</h2></div>
          <div class="text-end"><p class="num text-3xl font-bold leading-none text-brand-950">{{ total30 }}</p><p class="mt-1 text-[12px] text-brand-500">حجز في الفترة</p></div>
        </div>
        <USkeleton v-if="loading" class="h-[250px]" />
        <AreaChart v-else :points="series" unit="حجز" />
      </section>

      <!-- upcoming departures -->
      <section class="panel rise p-6 lg:col-span-7" style="animation-delay:.15s">
        <div class="mb-4 flex items-center justify-between"><div><p class="eyebrow mb-1">القادمة</p><h2 class="text-lg font-extrabold text-brand-950">مواعيد السفر والمقاعد</h2></div><UButton to="/packages" color="neutral" variant="ghost" size="sm" trailing-icon="i-lucide-arrow-up-left">البرامج</UButton></div>
        <div v-if="loading" class="space-y-4"><USkeleton v-for="i in 4" :key="i" class="h-10" /></div>
        <p v-else-if="!s.departures.length" class="py-10 text-center text-sm text-brand-500">لا توجد مواعيد قادمة. أضف مواعيد من صفحة البرنامج.</p>
        <ul v-else class="divide-y divide-brand-100">
          <li v-for="d in s.departures" :key="d.id" class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto]">
            <div class="min-w-0"><p class="truncate font-bold text-brand-950">{{ d.package.title }}</p><p class="text-[13px] text-brand-500">{{ fdate(d.date) }}</p></div>
            <div class="order-3 col-span-2 sm:order-none sm:col-span-1">
              <div class="h-1.5 overflow-hidden rounded-full bg-brand-100"><div class="h-full rounded-full transition-all duration-1000" :class="fill(d) >= 85 ? 'bg-red-500' : fill(d) >= 60 ? 'bg-amber-500' : 'bg-brand-500'" :style="{ width: `${fill(d)}%` }" /></div>
            </div>
            <p class="num text-end text-[13px] font-semibold text-brand-700"><b class="text-brand-950">{{ d.seatsTaken }}</b> / {{ d.seatsTotal }}</p>
          </li>
        </ul>
      </section>

      <!-- pipeline -->
      <section class="panel rise p-6 lg:col-span-5" style="animation-delay:.2s">
        <p class="eyebrow mb-1">توزيع الحجوزات</p>
        <h2 class="mb-5 text-lg font-extrabold text-brand-950">حالة الحجوزات</h2>
        <USkeleton v-if="loading" class="h-24" />
        <template v-else>
          <div v-if="pipe.total" class="flex h-3 gap-0.5 overflow-hidden rounded-sm">
            <div v-for="p in pipe.items" :key="p.key" class="h-full transition-all duration-1000" :style="{ width: `${p.pct}%`, background: p.color }" :title="`${p.label}: ${p.n}`" />
          </div>
          <div v-else class="h-3 rounded-sm bg-brand-100" />
          <ul class="mt-5 space-y-3">
            <li v-for="p in pipe.items" :key="p.key" class="flex items-center justify-between text-sm">
              <span class="flex items-center gap-2.5 text-brand-700"><span class="size-2.5 rounded-sm" :style="{ background: p.color }" />{{ p.label }}</span>
              <span class="num font-bold text-brand-950">{{ p.n }}<span class="ms-2 text-[12px] font-medium text-brand-400">{{ Math.round(p.pct) }}%</span></span>
            </li>
          </ul>
        </template>
      </section>

      <!-- recent bookings -->
      <section class="panel rise p-6 lg:col-span-12" style="animation-delay:.25s">
        <div class="mb-3 flex items-center justify-between"><div><p class="eyebrow mb-1">آخر النشاط</p><h2 class="text-lg font-extrabold text-brand-950">أحدث الحجوزات</h2></div><UButton to="/bookings" color="neutral" variant="ghost" size="sm" trailing-icon="i-lucide-arrow-up-left">عرض الكل</UButton></div>
        <div v-if="loading" class="space-y-2"><USkeleton v-for="i in 4" :key="i" class="h-12" /></div>
        <p v-else-if="!s.recent.length" class="py-10 text-center text-sm text-brand-500">لا توجد حجوزات بعد. ستظهر هنا فور وصول أول طلب من الموقع.</p>
        <ul v-else class="divide-y divide-brand-100">
          <li v-for="b in s.recent" :key="b.id">
            <NuxtLink :to="`/bookings/${b.id}`" class="-mx-3 grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md px-3 py-3 transition hover:bg-brand-50 sm:grid-cols-[auto_1fr_auto_auto_auto]">
              <span class="grid size-9 place-items-center rounded bg-brand-100 text-[13px] font-bold text-brand-700">{{ initials(b.fullName) }}</span>
              <div class="min-w-0"><p class="truncate font-bold text-brand-950">{{ b.fullName }}</p><p class="num text-[12px] text-brand-500" dir="ltr" style="text-align:right">{{ b.reference }}</p></div>
              <span class="num hidden text-[13px] text-brand-500 sm:block">{{ fdate(b.createdAt) }}</span>
              <b class="num hidden text-sm text-brand-950 sm:block">{{ money(b.totalPrice) }}</b>
              <StatusBadge kind="booking" :value="b.status" />
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
