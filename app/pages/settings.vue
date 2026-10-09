<script setup lang="ts">
useHead({ title: 'إعدادات الموقع' })
const { api } = useApi()
const notify = useNotify()
const auth = useAuth()
const all = await api('/settings')
const f = reactive({ name: '', tagline: '', city: '', phone: '', whatsapp: '', email: '', address: '', workingHours: '', facebook: '', instagram: '', tiktok: '', youtube: '',
  licenseNumber: '', licenseAuthority: '', responseTime: '', paymentNote: '', gaId: '', metaPixelId: '', tiktokPixelId: '' })
const payments = ref<{ label: string; details: string }[]>([])
const s = all.site ?? {}
Object.assign(f, { name: s.name ?? '', tagline: s.tagline ?? '', city: s.city ?? '', phone: s.phone ?? '', whatsapp: s.whatsapp ?? '', email: s.email ?? '',
  address: s.address ?? '', workingHours: s.workingHours ?? '', ...(s.social ?? {}),
  licenseNumber: s.licenseNumber ?? '', licenseAuthority: s.licenseAuthority ?? '', responseTime: s.responseTime ?? '', paymentNote: s.paymentNote ?? '',
  gaId: s.tracking?.gaId ?? '', metaPixelId: s.tracking?.metaPixelId ?? '', tiktokPixelId: s.tracking?.tiktokPixelId ?? '' })
payments.value = Array.isArray(s.paymentMethods) ? s.paymentMethods.map((x: any) => ({ label: x.label ?? '', details: x.details ?? '' })) : []
const saving = ref(false)
const isAdmin = computed(() => auth.user.value?.role === 'ADMIN')
async function save() {
  saving.value = true
  const { facebook, instagram, tiktok, youtube, gaId, metaPixelId, tiktokPixelId, ...rest } = f
  try { await api('/admin/settings/site', { method: 'PUT', body: { value: { ...rest, country: 'مصر', social: { facebook, instagram, tiktok, youtube }, paymentMethods: payments.value.filter((p) => p.label.trim()), tracking: { gaId: gaId.trim(), metaPixelId: metaPixelId.trim(), tiktokPixelId: tiktokPixelId.trim() } } } }); notify.ok('تم حفظ الإعدادات') }
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
      <UCard>
        <template #header><h2 class="font-extrabold">الترخيص والثقة</h2></template>
        <div class="space-y-4">
          <UFormField label="رقم ترخيص الشركة" hint="يظهر في الفوتر وصفحة «من نحن» وبيانات جوجل"><UInput v-model="f.licenseNumber" dir="ltr" class="w-full" /></UFormField>
          <UFormField label="جهة الترخيص" hint="مثال: ترخيص وزارة السياحة والآثار"><UInput v-model="f.licenseAuthority" class="w-full" /></UFormField>
        </div>
      </UCard>
      <UCard>
        <template #header><h2 class="font-extrabold">بعد إرسال الحجز</h2></template>
        <div class="space-y-4">
          <UFormField label="مدة الرد على الطلبات" hint="مثال: خلال ساعتين في أوقات العمل"><UInput v-model="f.responseTime" class="w-full" /></UFormField>
          <div>
            <span class="mb-1.5 block text-sm font-medium text-brand-800">طرق الدفع التي تظهر للعميل</span>
            <div class="space-y-2">
              <div v-for="(p, i) in payments" :key="i" class="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2"><UInput v-model="p.label" placeholder="مثال: إنستا باي" /><UInput v-model="p.details" dir="auto" placeholder="الرقم أو بيانات الحساب" /><UButton color="error" variant="soft" icon="i-lucide-trash-2" aria-label="حذف" @click="payments.splice(i, 1)" /></div>
              <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-plus" @click="payments.push({ label: '', details: '' })">إضافة طريقة دفع</UButton>
            </div>
          </div>
          <UFormField label="ملاحظة عن الدفع" hint="تظهر تحت طرق الدفع"><UTextarea v-model="f.paymentNote" :rows="2" class="w-full" /></UFormField>
        </div>
      </UCard>
      <UCard>
        <template #header><h2 class="font-extrabold">التتبع والإعلانات</h2></template>
        <div class="space-y-4">
          <UFormField label="Google Analytics" hint="يبدأ بـ G-"><UInput v-model="f.gaId" dir="ltr" placeholder="G-XXXXXXXXXX" class="w-full" /></UFormField>
          <UFormField label="Meta (Facebook) Pixel ID" hint="أرقام فقط"><UInput v-model="f.metaPixelId" dir="ltr" placeholder="1234567890" class="w-full" /></UFormField>
          <UFormField label="TikTok Pixel ID"><UInput v-model="f.tiktokPixelId" dir="ltr" placeholder="C1ABCDE2FGHIJ" class="w-full" /></UFormField>
          <p class="text-xs leading-6 text-brand-500">بعد الحفظ تُفعَّل أدوات التتبع على الموقع خلال دقائق، وتُسجَّل أحداث: عرض برنامج، بدء الحجز، إرسال حجز، النقر على واتساب أو الاتصال.</p>
        </div>
      </UCard>
    </div>
  </form>
</template>
