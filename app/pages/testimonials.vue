<script setup lang="ts">
useHead({ title: 'آراء العملاء' })
const { api } = useApi()
const notify = useNotify()
const { ask } = useConfirm()
const { data, refresh, status } = useAsyncData('admin-testimonials', () => api('/admin/testimonials'), { server: false })
const loading = computed(() => status.value === 'pending' && !data.value)
const open = ref(false)
const saving = ref(false)
const editing = ref<string | null>(null)
const blank = () => ({ name: '', city: '', text: '', rating: 5, isPublished: true })
const f = reactive(blank())
const ratingItems = [5, 4, 3, 2, 1].map((n) => ({ label: `${n} ★`, value: n }))
function edit(x?: any) {
  editing.value = x?.id ?? null
  Object.assign(f, x ? { name: x.name, city: x.city ?? '', text: x.text, rating: x.rating, isPublished: x.isPublished } : blank())
  open.value = true
}
async function save() {
  saving.value = true
  try { await api(editing.value ? `/admin/testimonials/${editing.value}` : '/admin/testimonials', { method: editing.value ? 'PATCH' : 'POST', body: { ...f, city: f.city || undefined } }); notify.ok('تم الحفظ'); open.value = false; await refresh() }
  catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
async function remove(x: { id: string; name: string }) {
  if (!(await ask({ title: 'حذف الرأي', description: `حذف رأي "${x.name}"؟`, confirmLabel: 'حذف', danger: true }))) return
  try { await api(`/admin/testimonials/${x.id}`, { method: 'DELETE' }); notify.ok('تم الحذف'); await refresh() } catch (e) { notify.err(errMsg(e)) }
}
</script>
<template>
  <div>
    <UiPageHead title="آراء العملاء"><UButton icon="i-lucide-plus" @click="edit()">رأي جديد</UButton></UiPageHead>
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><USkeleton v-for="i in 3" :key="i" class="h-44 rounded-2xl" /></div>
    <p v-else-if="!data?.length" class="rounded-2xl bg-white p-12 text-center text-brand-500 ring ring-brand-200/70">لا توجد آراء</p>
    <div v-else class="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="x in data" :key="x.id" class="lift flex flex-col rounded-2xl bg-white p-5 ring ring-brand-200/70">
        <div class="mb-2 flex text-amber-500"><UIcon v-for="n in x.rating" :key="n" name="i-lucide-star" class="size-4 fill-current" /></div>
        <p class="flex-1 text-sm leading-7">{{ x.text }}</p>
        <div class="mt-4 flex items-center justify-between gap-2">
          <div><p class="text-sm font-bold">{{ x.name }}</p><p class="text-xs text-brand-500">{{ x.city }}</p></div>
          <div class="flex items-center gap-1.5">
            <UBadge :color="x.isPublished ? 'success' : 'warning'" variant="subtle">{{ x.isPublished ? 'منشور' : 'مخفي' }}</UBadge>
            <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-pencil" aria-label="تعديل" @click="edit(x)" />
            <UButton color="error" variant="soft" size="sm" icon="i-lucide-trash-2" aria-label="حذف" @click="remove(x)" />
          </div>
        </div>
      </article>
    </div>

    <UModal v-model:open="open" :title="editing ? 'تعديل الرأي' : 'رأي جديد'" :ui="{ content: 'max-w-lg' }">
      <template #body>
        <form id="t-form" class="space-y-4" @submit.prevent="save">
          <div class="grid grid-cols-2 gap-3"><UFormField label="الاسم" required><UInput v-model="f.name" required class="w-full" /></UFormField><UFormField label="المدينة"><UInput v-model="f.city" class="w-full" /></UFormField></div>
          <UFormField label="الرأي" required><UTextarea v-model="f.text" :rows="4" required maxlength="1000" class="w-full" /></UFormField>
          <div class="grid grid-cols-2 items-end gap-3"><UFormField label="التقييم"><USelect v-model="f.rating" :items="ratingItems" class="w-full" /></UFormField><USwitch v-model="f.isPublished" label="منشور" class="pb-2" /></div>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="outline" @click="open = false">إلغاء</UButton><UButton type="submit" form="t-form" :loading="saving">حفظ</UButton></div>
      </template>
    </UModal>
  </div>
</template>
