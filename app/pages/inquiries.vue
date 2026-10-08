<script setup lang="ts">
useHead({ title: 'رسائل التواصل' })
const { api } = useApi()
const toast = useToast()
const page = ref(1)
const { data, refresh } = await useAsyncData('admin-inquiries', () => api('/admin/inquiries', { query: { page: page.value, limit: 15 } }), { watch: [page], server: false })
const tone = (s: string) => ({ NEW: 'warn', IN_PROGRESS: 'info', DONE: 'ok' } as const)[s as 'NEW']
async function setStatus(id: string, status: string) {
  try { await api(`/admin/inquiries/${id}`, { method: 'PATCH', body: { status } }); await refresh() } catch (e) { toast.err(errMsg(e)) }
}
async function remove(id: string) {
  if (!confirm('حذف الرسالة؟')) return
  try { await api(`/admin/inquiries/${id}`, { method: 'DELETE' }); await refresh() } catch (e) { toast.err(errMsg(e)) }
}
</script>
<template>
  <div>
    <UiPageHead title="رسائل التواصل" sub="الرسائل القادمة من نموذج اتصل بنا" />
    <p v-if="!data?.items.length" class="card p-10 text-center text-brand-500">لا توجد رسائل</p>
    <div class="space-y-3">
      <article v-for="m in data?.items" :key="m.id" class="card p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-3"><p class="font-extrabold">{{ m.name }}</p><UiBadge :tone="tone(m.status)">{{ INQUIRY_STATUS[m.status] }}</UiBadge></div>
          <span class="text-xs text-brand-500">{{ fdatetime(m.createdAt) }}</span>
        </div>
        <p v-if="m.subject" class="text-sm font-bold text-brand-700">{{ m.subject }}</p>
        <p class="text-sm leading-7 mt-1 whitespace-pre-line">{{ m.message }}</p>
        <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <a :href="`tel:${m.phone}`" class="btn-ghost" dir="ltr"><span class="i-lucide-phone" />{{ m.phone }}</a>
          <a v-if="m.email" :href="`mailto:${m.email}`" class="btn-ghost"><span class="i-lucide-mail" />{{ m.email }}</a>
          <select :value="m.status" class="input !w-auto" aria-label="الحالة" @change="setStatus(m.id, ($event.target as HTMLSelectElement).value)">
            <option v-for="(l, k) in INQUIRY_STATUS" :key="k" :value="k">{{ l }}</option>
          </select>
          <button class="btn-danger ms-auto" aria-label="حذف" @click="remove(m.id)"><span class="i-lucide-trash-2" /></button>
        </div>
      </article>
    </div>
    <UiPagination :page="page" :pages="data?.pages ?? 1" @change="page = $event" />
  </div>
</template>
