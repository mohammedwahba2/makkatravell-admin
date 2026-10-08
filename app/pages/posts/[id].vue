<script setup lang="ts">
const { api } = useApi()
const toast = useToast()
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
    toast.ok('تم الحفظ'); await navigateTo('/posts')
  } catch (e) { toast.err(errMsg(e)) } finally { saving.value = false }
}
</script>
<template>
  <form @submit.prevent="save">
    <UiPageHead :title="isNew ? 'مقال جديد' : 'تعديل المقال'">
      <NuxtLink to="/posts" class="btn-ghost">إلغاء</NuxtLink><button class="btn-primary" :disabled="saving">{{ saving ? 'جاري الحفظ…' : 'حفظ' }}</button>
    </UiPageHead>
    <div class="grid gap-4 lg:grid-cols-3">
      <section class="card p-5 lg:col-span-2 space-y-4">
        <div><label class="label">العنوان *</label><input v-model="f.title" class="input" required maxlength="200" /></div>
        <div><label class="label">مقدمة قصيرة *</label><textarea v-model="f.excerpt" rows="2" class="input" required maxlength="400" /></div>
        <div><label class="label">المحتوى * <span class="text-brand-400">(فقرة جديدة بسطر فارغ، وعنوان فرعي بـ ## في بداية السطر)</span></label><textarea v-model="f.content" rows="16" class="input" required /></div>
      </section>
      <aside class="space-y-4">
        <section class="card p-5 space-y-4">
          <label class="flex items-center gap-2 text-sm"><input v-model="f.isPublished" type="checkbox" class="accent-[#A56F4D]" />منشور</label>
          <div><label class="label">التصنيف</label><input v-model="f.category" class="input" /></div>
          <ImageUpload v-model="f.coverImage" label="صورة المقال" />
        </section>
        <section class="card p-5 space-y-4">
          <h2 class="font-extrabold">SEO</h2>
          <div><label class="label">الرابط (slug)</label><input v-model="f.slug" class="input" placeholder="يُولَّد تلقائيًا" /></div>
          <div><label class="label">عنوان SEO ({{ f.seoTitle.length }}/70)</label><input v-model="f.seoTitle" maxlength="70" class="input" /></div>
          <div><label class="label">وصف SEO ({{ f.seoDescription.length }}/170)</label><textarea v-model="f.seoDescription" maxlength="170" rows="3" class="input" /></div>
        </section>
      </aside>
    </div>
  </form>
</template>
