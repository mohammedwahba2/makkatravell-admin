<script setup lang="ts">
useHead({ title: 'لوحة التحكم' })
const { api } = useApi()
const { data: s, status } = useAsyncData('stats', () => api('/admin/stats'), { server: false })
const loading = computed(() => status.value === 'pending' || !s.value)
const max = computed(() => Math.max(1, ...(s.value?.daily ?? []).map((d: any) => d.count)))
const grown = ref(false)
watch(s, () => { grown.value = false; nextTick(() => requestAnimationFrame(() => { grown.value = true })) })
</script>

<template>
  <div>
    <UiPageHead title="لوحة التحكم" sub="نظرة سريعة على آخر نشاط" />

    <div v-if="loading" class="grid gap-4 grid-cols-2 xl:grid-cols-5"><USkeleton v-for="i in 5" :key="i" class="h-[118px] rounded-2xl" /></div>
    <div v-else class="stagger grid gap-4 grid-cols-2 xl:grid-cols-5">
      <StatCard label="إجمالي الحجوزات" :value="s.bookings" icon="i-lucide-ticket" />
      <StatCard label="حجوزات قيد المراجعة" :value="s.pending" icon="i-lucide-clock" :hot="s.pending > 0" />
      <StatCard label="رسائل جديدة" :value="s.newInquiries" icon="i-lucide-inbox" :hot="s.newInquiries > 0" />
      <StatCard label="برامج منشورة" :value="s.packages" icon="i-lucide-plane" />
      <div class="col-span-2 xl:col-span-1"><StatCard label="المبالغ المحصّلة" :value="s.revenue" icon="i-lucide-wallet" currency /></div>
    </div>

    <div class="grid gap-4 lg:grid-cols-5 mt-4">
      <section class="rise lg:col-span-3 rounded-2xl bg-white ring ring-brand-200/70 p-5" style="animation-delay:.15s">
        <h2 class="font-extrabold text-brand-900 mb-4">الحجوزات خلال آخر 30 يومًا</h2>
        <USkeleton v-if="loading" class="h-44" />
        <p v-else-if="!s.daily.length" class="py-14 text-center text-sm text-brand-500">لا توجد حجوزات في هذه الفترة</p>
        <div v-else class="flex h-44 items-end gap-1.5">
          <div v-for="(d, i) in s.daily" :key="d.day" class="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" :title="`${fdate(d.day)}: ${d.count}`">
            <span class="text-[10px] text-brand-500">{{ d.count }}</span>
            <div class="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-700 ease-out"
              :style="{ height: grown ? `${(Number(d.count) / max) * 100}%` : '0%', minHeight: grown ? '4px' : '0', transitionDelay: `${Number(i) * 40}ms` }" />
          </div>
        </div>
      </section>

      <section class="rise lg:col-span-2 rounded-2xl bg-white ring ring-brand-200/70 p-5" style="animation-delay:.22s">
        <div class="mb-3 flex items-center justify-between"><h2 class="font-extrabold text-brand-900">أحدث الحجوزات</h2><UButton to="/bookings" variant="link" size="xs">عرض الكل</UButton></div>
        <div v-if="loading" class="space-y-3"><USkeleton v-for="i in 4" :key="i" class="h-12" /></div>
        <p v-else-if="!s.recent.length" class="py-10 text-center text-sm text-brand-500">لا توجد حجوزات بعد</p>
        <ul v-else class="divide-y divide-brand-100">
          <li v-for="b in s.recent" :key="b.id">
            <NuxtLink :to="`/bookings/${b.id}`" class="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition hover:bg-brand-50">
              <div class="min-w-0"><p class="truncate text-sm font-bold">{{ b.fullName }}</p><p class="text-xs text-brand-500" dir="ltr">{{ b.reference }}</p></div>
              <StatusBadge kind="booking" :value="b.status" />
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
