<script setup lang="ts">
useHead({ title: 'الأسئلة الشائعة' })
const { api } = useApi()
const notify = useNotify()
const { ask } = useConfirm()
const { data, refresh, status } = useAsyncData('admin-faqs', () => api('/admin/faqs'), { server: false })
const loading = computed(() => status.value === 'pending' && !data.value)
const open = ref(false)
const saving = ref(false)
const editing = ref<string | null>(null)
const blank = () => ({ question: '', answer: '', category: 'general', sortOrder: 0, isPublished: true })
const f = reactive(blank())
function edit(x?: any) {
  editing.value = x?.id ?? null
  Object.assign(f, x ? { question: x.question, answer: x.answer, category: x.category, sortOrder: x.sortOrder, isPublished: x.isPublished } : blank())
  open.value = true
}
async function save() {
  saving.value = true
  try { await api(editing.value ? `/admin/faqs/${editing.value}` : '/admin/faqs', { method: editing.value ? 'PATCH' : 'POST', body: { ...f } }); notify.ok('تم الحفظ'); open.value = false; await refresh() }
  catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
async function remove(x: { id: string; question: string }) {
  if (!(await ask({ title: 'حذف السؤال', description: `حذف "${x.question}"؟`, confirmLabel: 'حذف', danger: true }))) return
  try { await api(`/admin/faqs/${x.id}`, { method: 'DELETE' }); notify.ok('تم الحذف'); await refresh() } catch (e) { notify.err(errMsg(e)) }
}
</script>
<template>
  <div>
    <UiPageHead title="الأسئلة الشائعة" sub="تظهر في صفحة الأسئلة وتدعم نتائج جوجل (FAQ schema)">
      <UButton icon="i-lucide-plus" @click="edit()">سؤال جديد</UButton>
    </UiPageHead>
    <div class="rise divide-y divide-brand-100 rounded-2xl bg-white ring ring-brand-200/70">
      <div v-if="loading" class="space-y-3 p-4"><USkeleton v-for="i in 4" :key="i" class="h-14" /></div>
      <p v-else-if="!data?.length" class="p-12 text-center text-brand-500">لا توجد أسئلة</p>
      <div v-for="x in data" :key="x.id" class="flex items-start gap-3 p-4 transition hover:bg-brand-50/60">
        <div class="min-w-0 flex-1"><p class="font-bold">{{ x.question }}</p><p class="mt-1 line-clamp-2 text-sm text-brand-500">{{ x.answer }}</p></div>
        <UBadge :color="x.isPublished ? 'success' : 'warning'" variant="subtle">{{ x.isPublished ? 'منشور' : 'مخفي' }}</UBadge>
        <UButton color="neutral" variant="outline" icon="i-lucide-pencil" aria-label="تعديل" @click="edit(x)" />
        <UButton color="error" variant="soft" icon="i-lucide-trash-2" aria-label="حذف" @click="remove(x)" />
      </div>
    </div>

    <UModal v-model:open="open" :title="editing ? 'تعديل السؤال' : 'سؤال جديد'" :ui="{ content: 'max-w-lg' }">
      <template #body>
        <form id="faq-form" class="space-y-4" @submit.prevent="save">
          <UFormField label="السؤال" required><UInput v-model="f.question" required class="w-full" /></UFormField>
          <UFormField label="الإجابة" required><UTextarea v-model="f.answer" :rows="5" required class="w-full" /></UFormField>
          <div class="grid grid-cols-2 items-end gap-3">
            <UFormField label="الترتيب"><UInput v-model.number="f.sortOrder" type="number" class="w-full" /></UFormField>
            <USwitch v-model="f.isPublished" label="منشور" class="pb-2" />
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="outline" @click="open = false">إلغاء</UButton><UButton type="submit" form="faq-form" :loading="saving">حفظ</UButton></div>
      </template>
    </UModal>
  </div>
</template>
