<script setup lang="ts">
useHead({ title: 'إعدادات الموقع' })
const { api } = useApi()
const notify = useNotify()
const auth = useAuth()
const all = await api('/settings')
const f = reactive({ name: '', tagline: '', city: '', phone: '', whatsapp: '', email: '', address: '', workingHours: '', facebook: '', instagram: '', tiktok: '', youtube: '' })
const s = all.site ?? {}
Object.assign(f, { name: s.name ?? '', tagline: s.tagline ?? '', city: s.city ?? '', phone: s.phone ?? '', whatsapp: s.whatsapp ?? '', email: s.email ?? '',
  address: s.address ?? '', workingHours: s.workingHours ?? '', ...(s.social ?? {}) })
const saving = ref(false)
const isAdmin = computed(() => auth.user.value?.role === 'ADMIN')
async function save() {
  saving.value = true
  const { facebook, instagram, tiktok, youtube, ...rest } = f
  try { await api('/admin/settings/site', { method: 'PUT', body: { value: { ...rest, country: 'مصر', social: { facebook, instagram, tiktok, youtube } } } }); notify.ok('تم حفظ الإعدادات') }
  catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
</script>
<template>
  <form @submit.prevent="save">
    <UiPageHead title="إعدادات الموقع" sub="بيانات التواصل تظهر في الموقع كله وفي بيانات جوجل">
      <UButton type="submit" :loading="saving" :disabled="!isAdmin" icon="i-lucide-save">حفظ</UButton>
    </UiPageHead>
    <UAlert v-if="!isAdmin" class="mb-4" color="warning" variant="subtle" icon="i-lucide-lock" description="تعديل الإعدادات متاح للمدير فقط." />
    <div class="stagger grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header><h2 class="font-extrabold">بيانات الشركة</h2></template>
        <div class="space-y-4">
          <UFormField label="اسم الموقع"><UInput v-model="f.name" required class="w-full" /></UFormField>
          <UFormField label="الشعار النصي"><UInput v-model="f.tagline" class="w-full" /></UFormField>
          <UFormField label="المدينة"><UInput v-model="f.city" class="w-full" /></UFormField>
          <UFormField label="العنوان"><UInput v-model="f.address" class="w-full" /></UFormField>
          <UFormField label="مواعيد العمل"><UInput v-model="f.workingHours" class="w-full" /></UFormField>
        </div>
      </UCard>
      <UCard>
        <template #header><h2 class="font-extrabold">التواصل</h2></template>
        <div class="space-y-4">
          <UFormField label="الهاتف (بصيغة دولية +20…)"><UInput v-model="f.phone" dir="ltr" icon="i-lucide-phone" class="w-full" /></UFormField>
          <UFormField label="واتساب (أرقام فقط بكود الدولة)"><UInput v-model="f.whatsapp" dir="ltr" icon="i-lucide-message-circle" class="w-full" /></UFormField>
          <UFormField label="البريد الإلكتروني"><UInput v-model="f.email" type="email" dir="ltr" icon="i-lucide-mail" class="w-full" /></UFormField>
          <UFormField label="فيسبوك"><UInput v-model="f.facebook" dir="ltr" placeholder="https://" class="w-full" /></UFormField>
          <UFormField label="إنستجرام"><UInput v-model="f.instagram" dir="ltr" placeholder="https://" class="w-full" /></UFormField>
          <UFormField label="تيك توك"><UInput v-model="f.tiktok" dir="ltr" placeholder="https://" class="w-full" /></UFormField>
          <UFormField label="يوتيوب"><UInput v-model="f.youtube" dir="ltr" placeholder="https://" class="w-full" /></UFormField>
        </div>
      </UCard>
    </div>
  </form>
</template>
