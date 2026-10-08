<script setup lang="ts">
useHead({ title: 'المدونة' })
const { api } = useApi()
const notify = useNotify()
const { ask } = useConfirm()
const page = ref(1)
const { data, refresh, status } = useAsyncData('admin-posts', () => api('/admin/posts', { query: { page: page.value, limit: 15 } }), { watch: [page], server: false })
const loading = computed(() => status.value === 'pending' && !data.value)
async function remove(p: { id: string; title: string }) {
  if (!(await ask({ title: 'حذف المقال', description: `سيتم حذف "${p.title}" نهائيًا ولا يمكن التراجع.`, confirmLabel: 'حذف', danger: true }))) return
  try { await api(`/admin/posts/${p.id}`, { method: 'DELETE' }); notify.ok('تم الحذف'); await refresh() } catch (e) { notify.err(errMsg(e)) }
}
</script>
<template>
  <div>
    <UiPageHead title="المدونة" sub="مقالات وإرشادات الحج والعمرة (تدعم ظهور الموقع في جوجل)">
      <UButton to="/posts/new" icon="i-lucide-plus">مقال جديد</UButton>
    </UiPageHead>
    <div class="rise divide-y divide-brand-100 rounded-2xl bg-white ring ring-brand-200/70">
      <div v-if="loading" class="space-y-3 p-4"><USkeleton v-for="i in 4" :key="i" class="h-14" /></div>
      <p v-else-if="!data?.items.length" class="p-12 text-center text-brand-500">لا توجد مقالات</p>
      <div v-for="p in data?.items" :key="p.id" class="flex items-center gap-4 p-4 transition hover:bg-brand-50/60">
        <img v-if="p.coverImage" :src="p.coverImage" alt="" class="size-14 shrink-0 rounded-lg object-cover" loading="lazy" />
        <div v-else class="size-14 shrink-0 rounded-lg bg-brand-100" />
        <div class="min-w-0 flex-1"><p class="truncate font-bold">{{ p.title }}</p><p class="text-xs text-brand-500">{{ p.category }} · {{ fdate(p.publishedAt) }}</p></div>
        <UBadge :color="p.isPublished ? 'success' : 'warning'" variant="subtle">{{ p.isPublished ? 'منشور' : 'مسودة' }}</UBadge>
        <UButton :to="`/posts/${p.id}`" color="neutral" variant="outline" icon="i-lucide-pencil" aria-label="تعديل" />
        <UButton color="error" variant="soft" icon="i-lucide-trash-2" aria-label="حذف" @click="remove(p)" />
      </div>
    </div>
    <div v-if="data && data.pages > 1" class="mt-5 flex justify-center"><UPagination v-model:page="page" :total="data.total" :items-per-page="15" /></div>
  </div>
</template>
