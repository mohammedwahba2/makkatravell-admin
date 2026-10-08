<script setup lang="ts">
useHead({ title: 'رسائل التواصل' })
const { api } = useApi()
const notify = useNotify()
const { ask } = useConfirm()
const page = ref(1)
const { data, refresh, status } = useAsyncData('admin-inquiries', () => api('/admin/inquiries', { query: { page: page.value, limit: 15 } }), { watch: [page], server: false })
const loading = computed(() => status.value === 'pending' && !data.value)
const statusItems = Object.entries(INQUIRY_STATUS).map(([value, label]) => ({ label, value }))
async function setStatus(id: string, status: string) {
  try { await api(`/admin/inquiries/${id}`, { method: 'PATCH', body: { status } }); await refresh() } catch (e) { notify.err(errMsg(e)) }
}
async function remove(m: { id: string; name: string }) {
  if (!(await ask({ title: 'حذف الرسالة', description: `حذف رسالة "${m.name}"؟`, confirmLabel: 'حذف', danger: true }))) return
  try { await api(`/admin/inquiries/${m.id}`, { method: 'DELETE' }); notify.ok('تم الحذف'); await refresh() } catch (e) { notify.err(errMsg(e)) }
}
</script>
<template>
  <div>
    <UiPageHead title="رسائل التواصل" sub="الرسائل القادمة من نموذج اتصل بنا" />
    <div v-if="loading" class="space-y-3"><USkeleton v-for="i in 3" :key="i" class="h-32 rounded-2xl" /></div>
    <p v-else-if="!data?.items.length" class="rounded-2xl bg-white p-12 text-center text-brand-500 ring ring-brand-200/70">لا توجد رسائل</p>
    <div v-else class="stagger space-y-3">
      <article v-for="m in data.items" :key="m.id" class="rounded-2xl bg-white p-5 ring ring-brand-200/70">
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-3"><p class="font-extrabold">{{ m.name }}</p><StatusBadge kind="inquiry" :value="m.status" /></div>
          <span class="text-xs text-brand-500">{{ fdatetime(m.createdAt) }}</span>
        </div>
        <p v-if="m.subject" class="text-sm font-bold text-brand-700">{{ m.subject }}</p>
        <p class="mt-1 whitespace-pre-line text-sm leading-7">{{ m.message }}</p>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <UButton :to="`tel:${m.phone}`" color="neutral" variant="outline" icon="i-lucide-phone" size="sm"><span dir="ltr">{{ m.phone }}</span></UButton>
          <UButton v-if="m.email" :to="`mailto:${m.email}`" color="neutral" variant="outline" icon="i-lucide-mail" size="sm">{{ m.email }}</UButton>
          <USelect :model-value="m.status" :items="statusItems" size="sm" class="w-40" @update:model-value="(v: string) => setStatus(m.id, v)" />
          <UButton color="error" variant="soft" size="sm" icon="i-lucide-trash-2" aria-label="حذف" class="ms-auto" @click="remove(m)" />
        </div>
      </article>
    </div>
    <div v-if="data && data.pages > 1" class="mt-5 flex justify-center"><UPagination v-model:page="page" :total="data.total" :items-per-page="15" /></div>
  </div>
</template>
