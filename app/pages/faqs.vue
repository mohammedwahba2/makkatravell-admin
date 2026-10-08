<script setup lang="ts">
useHead({ title: 'الأسئلة الشائعة' })
const { api } = useApi()
const toast = useToast()
const { data, refresh } = await useAsyncData('admin-faqs', () => api('/admin/faqs'), { server: false })
const open = ref(false)
const editing = ref<string | null>(null)
const f = reactive({ question: '', answer: '', category: 'general', sortOrder: 0, isPublished: true })
function edit(x?: any) {
  editing.value = x?.id ?? null
  Object.assign(f, x ? { question: x.question, answer: x.answer, category: x.category, sortOrder: x.sortOrder, isPublished: x.isPublished } : { question: '', answer: '', category: 'general', sortOrder: 0, isPublished: true })
  open.value = true
}
async function save() {
  try { await api(editing.value ? `/admin/faqs/${editing.value}` : '/admin/faqs', { method: editing.value ? 'PATCH' : 'POST', body: { ...f } }); toast.ok('تم الحفظ'); open.value = false; await refresh() }
  catch (e) { toast.err(errMsg(e)) }
}
async function remove(id: string) {
  if (!confirm('حذف هذا السؤال؟')) return
  try { await api(`/admin/faqs/${id}`, { method: 'DELETE' }); await refresh() } catch (e) { toast.err(errMsg(e)) }
}
</script>
<template>
  <div>
    <UiPageHead title="الأسئلة الشائعة" sub="تظهر في صفحة الأسئلة وتدعم نتائج جوجل (FAQ schema)">
      <button class="btn-primary" @click="edit()"><span class="i-lucide-plus" />سؤال جديد</button>
    </UiPageHead>
    <div class="card divide-y divide-brand-100">
      <p v-if="!data?.length" class="p-10 text-center text-brand-500">لا توجد أسئلة</p>
      <div v-for="x in data" :key="x.id" class="p-4 flex items-start gap-3">
        <div class="flex-1 min-w-0"><p class="font-bold">{{ x.question }}</p><p class="text-sm text-brand-500 mt-1 line-clamp-2">{{ x.answer }}</p></div>
        <UiBadge :tone="x.isPublished ? 'ok' : 'warn'">{{ x.isPublished ? 'منشور' : 'مخفي' }}</UiBadge>
        <button class="btn-ghost" aria-label="تعديل" @click="edit(x)"><span class="i-lucide-pencil" /></button>
        <button class="btn-danger" aria-label="حذف" @click="remove(x.id)"><span class="i-lucide-trash-2" /></button>
      </div>
    </div>
    <UiModal :open="open" :title="editing ? 'تعديل السؤال' : 'سؤال جديد'" @close="open = false">
      <form class="space-y-4" @submit.prevent="save">
        <div><label class="label">السؤال *</label><input v-model="f.question" class="input" required /></div>
        <div><label class="label">الإجابة *</label><textarea v-model="f.answer" rows="5" class="input" required /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">الترتيب</label><input v-model.number="f.sortOrder" type="number" class="input" /></div>
          <label class="flex items-end gap-2 text-sm pb-2"><input v-model="f.isPublished" type="checkbox" class="accent-[#A56F4D]" />منشور</label>
        </div>
        <button class="btn-primary w-full">حفظ</button>
      </form>
    </UiModal>
  </div>
</template>
