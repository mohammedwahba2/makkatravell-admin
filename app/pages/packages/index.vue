<script setup lang="ts">
useHead({ title: 'الرحلات والبرامج' })
const { api } = useApi()
const notify = useNotify()
const { ask } = useConfirm()
const page = ref(1)
const type = ref('all')
const q = ref('')
const qd = refDebounced(q, 350)
const { data, refresh, status } = useAsyncData('admin-packages', () => api('/admin/packages', { query: { page: page.value, limit: 12, type: type.value === 'all' ? undefined : type.value, q: qd.value || undefined } }),
  { watch: [page, type, qd], server: false })
watch([type, qd], () => { page.value = 1 })
const typeItems = [{ label: 'كل الأنواع', value: 'all' }, ...Object.entries(PACKAGE_TYPES).map(([value, label]) => ({ label, value }))]
const loading = computed(() => status.value === 'pending' && !data.value)

async function remove(p: { id: string; title: string }) {
  if (!(await ask({ title: 'حذف البرنامج', description: `هل تريد حذف "${p.title}"؟ إن كان له حجوزات سيتم إخفاؤه بدل حذفه.`, confirmLabel: 'حذف', danger: true }))) return
  try { await api(`/admin/packages/${p.id}`, { method: 'DELETE' }); notify.ok('تم'); await refresh() } catch (e) { notify.err(errMsg(e)) }
}
async function toggle(p: { id: string; isPublished: boolean }) {
  try { await api(`/admin/packages/${p.id}`, { method: 'PATCH', body: { isPublished: !p.isPublished } }); await refresh() } catch (e) { notify.err(errMsg(e)) }
}
</script>

<template>
  <div>
    <UiPageHead title="الرحلات والبرامج" sub="أضف برامج الحج والعمرة وحدّد المواعيد والأسعار">
      <UButton to="/packages/new" icon="i-lucide-plus">برنامج جديد</UButton>
    </UiPageHead>
    <div class="panel rise mb-4 flex flex-wrap gap-3 p-4">
      <UInput v-model="q" icon="i-lucide-search" placeholder="بحث" class="w-full sm:w-72" />
      <USelect v-model="type" :items="typeItems" class="w-full sm:w-52" />
    </div>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><USkeleton v-for="i in 6" :key="i" class="h-72 rounded-2xl" /></div>
    <div v-else-if="!data?.items.length" class="panel p-12 text-center text-brand-500">لا توجد برامج</div>
    <div v-else class="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="p in data.items" :key="p.id" class="panel lift flex flex-col overflow-hidden">
        <div class="grid h-36 place-items-center bg-brand-100">
          <img v-if="p.coverImage" :src="p.coverImage" alt="" class="size-full object-cover" loading="lazy" />
          <UIcon v-else name="i-lucide-image" class="size-9 text-brand-300" />
        </div>
        <div class="flex flex-1 flex-col p-4">
          <div class="mb-2 flex flex-wrap items-center gap-1.5">
            <UBadge color="neutral" variant="subtle">{{ PACKAGE_TYPES[p.type] }}</UBadge>
            <UBadge v-if="p.isFeatured" color="info" variant="subtle">مميز</UBadge>
            <UBadge :color="p.isPublished ? 'success' : 'warning'" variant="subtle">{{ p.isPublished ? 'منشور' : 'مخفي' }}</UBadge>
          </div>
          <h3 class="font-extrabold text-brand-900">{{ p.title }}</h3>
          <p class="mt-1 text-sm text-brand-500">{{ p.durationDays }} يوم · {{ p.departures.length }} موعد قادم</p>
          <p class="mt-2 font-extrabold text-brand-500">{{ money(p.basePrice) }}</p>
          <div class="mt-auto flex gap-2 pt-4">
            <UButton :to="`/packages/${p.id}`" color="neutral" variant="outline" icon="i-lucide-pencil" class="flex-1 justify-center">تعديل</UButton>
            <UButton color="neutral" variant="outline" :icon="p.isPublished ? 'i-lucide-eye-off' : 'i-lucide-eye'" :aria-label="p.isPublished ? 'إخفاء' : 'نشر'" @click="toggle(p)" />
            <UButton color="error" variant="soft" icon="i-lucide-trash-2" aria-label="حذف" @click="remove(p)" />
          </div>
        </div>
      </article>
    </div>
    <div v-if="data && data.pages > 1" class="mt-5 flex justify-center"><UPagination v-model:page="page" :total="data.total" :items-per-page="12" /></div>
  </div>
</template>
