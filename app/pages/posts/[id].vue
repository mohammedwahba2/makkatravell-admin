<script setup lang="ts">
const { api } = useApi()
const notify = useNotify()
const id = useRoute().params.id as string
const isNew = id === 'new'
useHead({ title: isNew ? 'مقال جديد' : 'تعديل مقال' })
const f = reactive({ title: '', slug: '', excerpt: '', content: '', coverImage: null as string | null, category: 'إرشادات', isPublished: true, seoTitle: '', seoDescription: '' })
if (!isNew) {
  const p = await api(`/admin/posts/${id}`)
  Object.assign(f, p, { seoTitle: p.seoTitle ?? '', seoDescription: p.seoDescription ?? '' })
}
const saving = ref(false)
async function save() {
  saving.value = true
  const body = { title: f.title, slug: f.slug || undefined, excerpt: f.excerpt, content: f.content, coverImage: f.coverImage || undefined,
    category: f.category, isPublished: f.isPublished, seoTitle: f.seoTitle || undefined, seoDescription: f.seoDescription || undefined }
  try {
    await api(isNew ? '/admin/posts' : `/admin/posts/${id}`, { method: isNew ? 'POST' : 'PATCH', body })
    notify.ok('تم الحفظ'); await navigateTo('/posts')
  } catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
</script>
<template>
  <form @submit.prevent="save">
    <UiPageHead :title="isNew ? 'مقال جديد' : 'تعديل المقال'">
      <UButton to="/posts" color="neutral" variant="outline">إلغاء</UButton>
      <UButton type="submit" :loading="saving" icon="i-lucide-save">حفظ</UButton>
    </UiPageHead>
    <div class="grid gap-4 lg:grid-cols-3">
      <UCard class="lg:col-span-2">
        <div class="space-y-4">
          <UFormField label="العنوان" required><UInput v-model="f.title" required maxlength="200" class="w-full" /></UFormField>
          <UFormField label="مقدمة قصيرة" required><UTextarea v-model="f.excerpt" :rows="2" required maxlength="400" class="w-full" /></UFormField>
          <UFormField label="المحتوى" required hint="فقرة جديدة بسطر فارغ، وعنوان فرعي بـ ## في بداية السطر"><UTextarea v-model="f.content" :rows="16" required class="w-full" /></UFormField>
        </div>
      </UCard>
      <aside class="space-y-4">
        <UCard>
          <div class="space-y-4">
            <USwitch v-model="f.isPublished" label="منشور" />
            <UFormField label="التصنيف"><UInput v-model="f.category" class="w-full" /></UFormField>
            <ImageUpload v-model="f.coverImage" label="صورة المقال" />
          </div>
        </UCard>
        <UCard>
          <template #header><h2 class="font-extrabold">SEO</h2></template>
          <div class="space-y-4">
            <UFormField label="الرابط (slug)"><UInput v-model="f.slug" placeholder="يُولَّد تلقائيًا" class="w-full" /></UFormField>
            <UFormField :label="`عنوان SEO (${f.seoTitle.length}/70)`"><UInput v-model="f.seoTitle" maxlength="70" class="w-full" /></UFormField>
            <UFormField :label="`وصف SEO (${f.seoDescription.length}/170)`"><UTextarea v-model="f.seoDescription" maxlength="170" :rows="3" class="w-full" /></UFormField>
          </div>
        </UCard>
      </aside>
    </div>
  </form>
</template>
