<script setup lang="ts">
useHead({ title: 'مواعيد السفر' })
const { api, download } = useApi()
const notify = useNotify()
const when = ref('upcoming')
const { data, status } = useAsyncData('admin-departures', () => api('/admin/departures', { query: { when: when.value } }), { watch: [when], server: false })
const loading = computed(() => status.value === 'pending' && !data.value)
const chips = [{ label: 'القادمة', value: 'upcoming' }, { label: 'السابقة', value: 'past' }]
const busy = ref<string | null>(null)
const fill = (d: { seatsTaken: number; seatsTotal: number }) => Math.round((d.seatsTaken / d.seatsTotal) * 100)

async function exportList(d: { id: string }) {
  busy.value = d.id
  try { await download(`/admin/departures/${d.id}/export`); notify.ok('تم تنزيل القائمة') } catch (e) { notify.err(errMsg(e)) } finally { busy.value = null }
}
</script>

<template>
  <div>
    <UiPageHead title="مواعيد السفر" sub="المقاعد وقوائم المسافرين لكل موعد" />
    <FilterBar v-model:chip="when" :chips="chips" :total="data?.length" unit="موعد" :searchable="false" />

    <div class="panel rise overflow-x-auto" style="animation-delay:.08s">
      <table class="w-full min-w-[760px] text-sm">
        <thead class="bg-brand-50 text-xs text-brand-700"><tr><th class="p-3 text-start">البرنامج</th><th class="p-3 text-start">تاريخ السفر</th><th class="w-56 p-3 text-start">المقاعد</th><th class="p-3 text-start">الحجوزات</th><th class="p-3 text-start">القائمة</th></tr></thead>
        <tbody>
          <tr v-for="i in (loading ? 5 : 0)" :key="i" class="border-t border-brand-100"><td v-for="j in 5" :key="j" class="p-3"><USkeleton class="h-5" /></td></tr>
          <tr v-if="!loading && !data?.length"><td colspan="5" class="p-12 text-center text-brand-500">لا توجد مواعيد</td></tr>
          <tr v-for="d in data" :key="d.id" class="border-t border-brand-100 transition hover:bg-brand-50/70">
            <td class="p-3 font-bold text-brand-950">{{ d.package.title }}<UBadge v-if="!d.isOpen" color="warning" variant="subtle" class="ms-2">مغلق</UBadge></td>
            <td class="p-3 text-brand-700">{{ fdate(d.date) }}</td>
            <td class="p-3">
              <div class="flex items-center gap-3">
                <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100"><div class="h-full rounded-full" :class="fill(d) >= 85 ? 'bg-red-500' : fill(d) >= 60 ? 'bg-amber-500' : 'bg-brand-500'" :style="{ width: `${fill(d)}%` }" /></div>
                <span class="num w-14 text-end text-[13px] font-semibold"><b>{{ d.seatsTaken }}</b> / {{ d.seatsTotal }}</span>
              </div>
            </td>
            <td class="num p-3 font-semibold">{{ d.bookingsCount }}</td>
            <td class="p-3"><UButton color="neutral" variant="outline" size="sm" icon="i-lucide-download" :loading="busy === d.id" :disabled="!d.bookingsCount" @click="exportList(d)">تصدير Excel</UButton></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-3 text-[13px] text-brand-500">الملف بصيغة CSV ويفتح مباشرة في Excel. يشمل كل المسافرين في الحجوزات غير الملغاة مع بيانات الجوازات والمتبقي من الدفع.</p>
  </div>
</template>
