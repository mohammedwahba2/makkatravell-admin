<script setup lang="ts">
useHead({ title: 'المدونة' })
const { api } = useApi()
const toast = useToast()
const page = ref(1)
const { data, refresh } = await useAsyncData('admin-posts', () => api('/admin/posts', { query: { page: page.value, limit: 15 } }), { watch: [page], server: false })
async function remove(p: { id: string; title: string }) {
  if (!confirm(`حذف المقال "${p.title}" نهائيًا؟`)) return
  try { await api(`/admin/posts/${p.id}`, { method: 'DELETE' }); toast.ok('تم الحذف'); await refresh() } catch (e) { toast.err(errMsg(e)) }
}
</script>
<template>
  <div>
    <UiPageHead title="المدونة" sub="مقالات وإرشادات الحج والعمرة (تدعم ظهور الموقع في جوجل)">
      <NuxtLink to="/posts/new" class="btn-primary"><span class="i-lucide-plus" />مقال جديد</NuxtLink>
    </UiPageHead>
    <div class="card divide-y divide-brand-100">
      <p v-if="!data?.items.length" class="p-10 text-center text-brand-500">لا توجد مقالات</p>
      <div v-for="p in data?.items" :key="p.id" class="p-4 flex items-center gap-4">
        <img v-if="p.coverImage" :src="p.coverImage" alt="" class="size-14 rounded-lg object-cover shrink-0" loading="lazy" />
        <div v-else class="size-14 rounded-lg bg-brand-100 shrink-0" />
        <div class="min-w-0 flex-1"><p class="font-bold truncate">{{ p.title }}</p><p class="text-xs text-brand-500">{{ p.category }} · {{ fdate(p.publishedAt) }}</p></div>
        <UiBadge :tone="p.isPublished ? 'ok' : 'warn'">{{ p.isPublished ? 'منشور' : 'مسودة' }}</UiBadge>
        <NuxtLink :to="`/posts/${p.id}`" class="btn-ghost" aria-label="تعديل"><span class="i-lucide-pencil" /></NuxtLink>
        <button class="btn-danger" aria-label="حذف" @click="remove(p)"><span class="i-lucide-trash-2" /></button>
      </div>
    </div>
    <UiPagination :page="page" :pages="data?.pages ?? 1" @change="page = $event" />
  </div>
</template>
