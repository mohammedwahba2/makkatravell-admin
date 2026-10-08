<script setup lang="ts">
useHead({ title: 'الرحلات والبرامج' })
const { api } = useApi()
const toast = useToast()
const page = ref(1)
const type = ref('')
const q = ref('')
const qd = refDebounced(q, 350)
const { data, refresh, status } = await useAsyncData('admin-packages', () => api('/admin/packages', { query: { page: page.value, limit: 12, type: type.value || undefined, q: qd.value || undefined } }),
  { watch: [page, type, qd], server: false })
watch([type, qd], () => { page.value = 1 })

async function remove(p: { id: string; title: string }) {
  if (!confirm(`حذف "${p.title}"؟ إن كان له حجوزات سيتم إخفاؤه بدل حذفه.`)) return
  try { await api(`/admin/packages/${p.id}`, { method: 'DELETE' }); toast.ok('تم'); await refresh() } catch (e) { toast.err(errMsg(e)) }
}
async function toggle(p: { id: string; isPublished: boolean }) {
  try { await api(`/admin/packages/${p.id}`, { method: 'PATCH', body: { isPublished: !p.isPublished } }); await refresh() } catch (e) { toast.err(errMsg(e)) }
}
</script>

<template>
  <div>
    <UiPageHead title="الرحلات والبرامج" sub="أضف برامج الحج والعمرة وحدّد المواعيد والأسعار">
      <NuxtLink to="/packages/new" class="btn-primary"><span class="i-lucide-plus" />برنامج جديد</NuxtLink>
    </UiPageHead>
    <div class="card p-4 mb-4 flex flex-wrap gap-3">
      <input v-model="q" class="input sm:max-w-xs" placeholder="بحث" aria-label="بحث" />
      <select v-model="type" class="input sm:max-w-[200px]" aria-label="النوع"><option value="">كل الأنواع</option><option v-for="(l, k) in PACKAGE_TYPES" :key="k" :value="k">{{ l }}</option></select>
    </div>
    <p v-if="status === 'pending'" class="text-brand-500">جاري التحميل…</p>
    <p v-else-if="!data?.items.length" class="card p-10 text-center text-brand-500">لا توجد برامج</p>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="p in data?.items" :key="p.id" class="card overflow-hidden flex flex-col">
        <div class="h-36 bg-brand-100 grid place-items-center">
          <img v-if="p.coverImage" :src="p.coverImage" alt="" class="h-full w-full object-cover" loading="lazy" />
          <span v-else class="i-lucide-image text-3xl text-brand-300" />
        </div>
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex items-center gap-2 mb-2"><UiBadge>{{ PACKAGE_TYPES[p.type] }}</UiBadge><UiBadge v-if="p.isFeatured" tone="info">مميز</UiBadge><UiBadge :tone="p.isPublished ? 'ok' : 'warn'">{{ p.isPublished ? 'منشور' : 'مخفي' }}</UiBadge></div>
          <h3 class="font-extrabold text-brand-900">{{ p.title }}</h3>
          <p class="text-sm text-brand-500 mt-1">{{ p.durationDays }} يوم · {{ p.departures.length }} موعد قادم</p>
          <p class="mt-2 font-extrabold text-brand-500">{{ money(p.basePrice) }}</p>
          <div class="mt-auto pt-4 flex gap-2">
            <NuxtLink :to="`/packages/${p.id}`" class="btn-ghost flex-1"><span class="i-lucide-pencil" />تعديل</NuxtLink>
            <button class="btn-ghost" :title="p.isPublished ? 'إخفاء' : 'نشر'" :aria-label="p.isPublished ? 'إخفاء' : 'نشر'" @click="toggle(p)"><span :class="p.isPublished ? 'i-lucide-eye-off' : 'i-lucide-eye'" /></button>
            <button class="btn-danger" aria-label="حذف" @click="remove(p)"><span class="i-lucide-trash-2" /></button>
          </div>
        </div>
      </article>
    </div>
    <UiPagination :page="page" :pages="data?.pages ?? 1" @change="page = $event" />
  </div>
</template>
