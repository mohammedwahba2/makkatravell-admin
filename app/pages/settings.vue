<script setup lang="ts">
useHead({ title: 'إعدادات الموقع' })
const { api } = useApi()
const toast = useToast()
const auth = useAuth()
const all = await api('/settings')
const f = reactive({
  name: '', tagline: '', city: '', phone: '', whatsapp: '', email: '', address: '', workingHours: '', facebook: '', instagram: '', tiktok: '', youtube: '',
})
const s = all.site ?? {}
Object.assign(f, { name: s.name ?? '', tagline: s.tagline ?? '', city: s.city ?? '', phone: s.phone ?? '', whatsapp: s.whatsapp ?? '', email: s.email ?? '',
  address: s.address ?? '', workingHours: s.workingHours ?? '', ...(s.social ?? {}) })
const saving = ref(false)
async function save() {
  saving.value = true
  const { facebook, instagram, tiktok, youtube, ...rest } = f
  try { await api('/admin/settings/site', { method: 'PUT', body: { value: { ...rest, country: 'مصر', social: { facebook, instagram, tiktok, youtube } } } }); toast.ok('تم حفظ الإعدادات') }
  catch (e) { toast.err(errMsg(e)) } finally { saving.value = false }
}
</script>
<template>
  <form @submit.prevent="save">
    <UiPageHead title="إعدادات الموقع" sub="بيانات التواصل تظهر في الموقع كله وفي بيانات جوجل">
      <button class="btn-primary" :disabled="saving || auth.user.value?.role !== 'ADMIN'">{{ saving ? 'جاري الحفظ…' : 'حفظ' }}</button>
    </UiPageHead>
    <p v-if="auth.user.value?.role !== 'ADMIN'" class="mb-4 rounded-xl bg-amber-50 text-amber-800 text-sm p-3">تعديل الإعدادات متاح للمدير فقط.</p>
    <div class="grid gap-4 lg:grid-cols-2">
      <section class="card p-5 grid gap-4">
        <h2 class="font-extrabold">بيانات الشركة</h2>
        <div><label class="label">اسم الموقع</label><input v-model="f.name" class="input" required /></div>
        <div><label class="label">الشعار النصي</label><input v-model="f.tagline" class="input" /></div>
        <div><label class="label">المدينة</label><input v-model="f.city" class="input" /></div>
        <div><label class="label">العنوان</label><input v-model="f.address" class="input" /></div>
        <div><label class="label">مواعيد العمل</label><input v-model="f.workingHours" class="input" /></div>
      </section>
      <section class="card p-5 grid gap-4 content-start">
        <h2 class="font-extrabold">التواصل</h2>
        <div><label class="label">الهاتف (بصيغة دولية +20…)</label><input v-model="f.phone" class="input" dir="ltr" /></div>
        <div><label class="label">واتساب (أرقام فقط بكود الدولة)</label><input v-model="f.whatsapp" class="input" dir="ltr" /></div>
        <div><label class="label">البريد الإلكتروني</label><input v-model="f.email" type="email" class="input" dir="ltr" /></div>
        <div><label class="label">فيسبوك</label><input v-model="f.facebook" class="input" dir="ltr" placeholder="https://" /></div>
        <div><label class="label">إنستجرام</label><input v-model="f.instagram" class="input" dir="ltr" placeholder="https://" /></div>
        <div><label class="label">تيك توك</label><input v-model="f.tiktok" class="input" dir="ltr" placeholder="https://" /></div>
        <div><label class="label">يوتيوب</label><input v-model="f.youtube" class="input" dir="ltr" placeholder="https://" /></div>
      </section>
    </div>
  </form>
</template>
