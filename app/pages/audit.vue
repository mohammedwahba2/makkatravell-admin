<script setup lang="ts">
useHead({ title: 'سجل النشاط' })
const { api } = useApi()
const auth = useAuth()
if (auth.user.value?.role !== 'ADMIN') await navigateTo('/')
const page = ref(1)
const entity = ref('all')
const q = ref('')
const qd = refDebounced(q, 350)
const { data, status } = useAsyncData('audit', () => api('/admin/audit', { query: { page: page.value, limit: 30, entity: entity.value === 'all' ? undefined : entity.value, q: qd.value || undefined } }), { watch: [page, entity, qd], server: false })
watch([entity, qd], () => { page.value = 1 })
const chips = [{ label: 'الكل', value: 'all' }, ...['bookings', 'packages', 'documents', 'users', 'settings', 'auth'].map((v) => ({ label: AUDIT_ENTITIES[v]!, value: v }))]
const loading = computed(() => status.value === 'pending' && !data.value)
const tone: Record<string, string> = { CREATE: 'bg-emerald-600', UPDATE: 'bg-amber-500', PATCH: 'bg-amber-500', PUT: 'bg-amber-500', POST: 'bg-emerald-600', DELETE: 'bg-red-500', LOGIN: 'bg-sky-600', LOGIN_FAILED: 'bg-red-600', VIEW: 'bg-stone-400' }
const act: Record<string, string> = { CREATE: 'إضافة', POST: 'إضافة', UPDATE: 'تعديل', PATCH: 'تعديل', PUT: 'تعديل', DELETE: 'حذف', LOGIN: 'دخول', LOGIN_FAILED: 'دخول فاشل', VIEW: 'عرض' }
</script>
<template>
  <div>
    <UiPageHead title="سجل النشاط" sub="من فعل ماذا ومتى" />
    <FilterBar v-model:q="q" v-model:chip="entity" placeholder="بحث بالاسم أو الوصف" :chips="chips" :total="data?.total" unit="سجل" />
    <div class="panel rise overflow-x-auto">
      <table class="w-full min-w-[720px] text-sm">
        <thead class="bg-brand-50 text-xs text-brand-700"><tr><th class="p-3 text-start">الوقت</th><th class="p-3 text-start">المستخدم</th><th class="p-3 text-start">الإجراء</th><th class="p-3 text-start">التفاصيل</th></tr></thead>
        <tbody>
          <tr v-for="i in (loading ? 8 : 0)" :key="i" class="border-t border-brand-100"><td v-for="j in 4" :key="j" class="p-3"><USkeleton class="h-5" /></td></tr>
          <tr v-if="!loading && !data?.items.length"><td colspan="4" class="p-12 text-center text-brand-500">لا توجد سجلات</td></tr>
          <tr v-for="r in data?.items" :key="r.id" class="border-t border-brand-100 hover:bg-brand-50/60">
            <td class="num whitespace-nowrap p-3 text-brand-500">{{ fdatetime(r.createdAt) }}</td>
            <td class="p-3 font-semibold">{{ r.userName }}</td>
            <td class="p-3"><span class="inline-flex items-center gap-2 text-[13px] font-semibold"><span class="size-2 rounded-full" :class="tone[r.action] ?? 'bg-stone-400'" />{{ act[r.action] ?? r.action }}</span></td>
            <td class="p-3">{{ r.summary }}<span v-if="r.ip" class="num ms-2 text-xs text-brand-400" dir="ltr">{{ r.ip }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="data && data.pages > 1" class="mt-5 flex justify-center"><UPagination v-model:page="page" :total="data.total" :items-per-page="30" /></div>
  </div>
</template>
