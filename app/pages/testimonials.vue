<script setup lang="ts">
useHead({ title: 'آراء العملاء' })
const { api } = useApi()
const toast = useToast()
const { data, refresh } = await useAsyncData('admin-testimonials', () => api('/admin/testimonials'), { server: false })
const open = ref(false)
const editing = ref<string | null>(null)
const f = reactive({ name: '', city: '', text: '', rating: 5, isPublished: true })
function edit(x?: any) {
  editing.value = x?.id ?? null
  Object.assign(f, x ? { name: x.name, city: x.city ?? '', text: x.text, rating: x.rating, isPublished: x.isPublished } : { name: '', city: '', text: '', rating: 5, isPublished: true })
  open.value = true
}
async function save() {
  try { await api(editing.value ? `/admin/testimonials/${editing.value}` : '/admin/testimonials', { method: editing.value ? 'PATCH' : 'POST', body: { ...f, city: f.city || undefined } }); toast.ok('تم الحفظ'); open.value = false; await refresh() }
  catch (e) { toast.err(errMsg(e)) }
}
async function remove(id: string) {
  if (!confirm('حذف هذا الرأي؟')) return
  try { await api(`/admin/testimonials/${id}`, { method: 'DELETE' }); await refresh() } catch (e) { toast.err(errMsg(e)) }
}
</script>
<template>
  <div>
    <UiPageHead title="آراء العملاء"><button class="btn-primary" @click="edit()"><span class="i-lucide-plus" />رأي جديد</button></UiPageHead>
    <p v-if="!data?.length" class="card p-10 text-center text-brand-500">لا توجد آراء</p>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="x in data" :key="x.id" class="card p-5 flex flex-col">
        <div class="flex text-amber-500 mb-2"><span v-for="n in x.rating" :key="n" class="i-lucide-star" /></div>
        <p class="text-sm leading-7 flex-1">{{ x.text }}</p>
        <div class="mt-4 flex items-center justify-between gap-2">
          <div><p class="font-bold text-sm">{{ x.name }}</p><p class="text-xs text-brand-500">{{ x.city }}</p></div>
          <div class="flex items-center gap-2"><UiBadge :tone="x.isPublished ? 'ok' : 'warn'">{{ x.isPublished ? 'منشور' : 'مخفي' }}</UiBadge>
            <button class="btn-ghost !px-3" aria-label="تعديل" @click="edit(x)"><span class="i-lucide-pencil" /></button>
            <button class="btn-danger !px-3" aria-label="حذف" @click="remove(x.id)"><span class="i-lucide-trash-2" /></button></div>
        </div>
      </article>
    </div>
    <UiModal :open="open" :title="editing ? 'تعديل الرأي' : 'رأي جديد'" @close="open = false">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid grid-cols-2 gap-3"><div><label class="label">الاسم *</label><input v-model="f.name" class="input" required /></div><div><label class="label">المدينة</label><input v-model="f.city" class="input" /></div></div>
        <div><label class="label">الرأي *</label><textarea v-model="f.text" rows="4" class="input" required maxlength="1000" /></div>
        <div class="grid grid-cols-2 gap-3"><div><label class="label">التقييم</label><select v-model.number="f.rating" class="input"><option v-for="n in [5,4,3,2,1]" :key="n" :value="n">{{ n }}</option></select></div>
          <label class="flex items-end gap-2 text-sm pb-2"><input v-model="f.isPublished" type="checkbox" class="accent-[#A56F4D]" />منشور</label></div>
        <button class="btn-primary w-full">حفظ</button>
      </form>
    </UiModal>
  </div>
</template>
