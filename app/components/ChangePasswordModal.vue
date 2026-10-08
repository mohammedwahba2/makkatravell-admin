<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const { api } = useApi()
const auth = useAuth()
const notify = useNotify()
const f = reactive({ current: '', next: '', confirm: '' })
const busy = ref(false)
const error = ref('')
const show = ref(false)
watch(open, (v) => { if (v) { Object.assign(f, { current: '', next: '', confirm: '' }); error.value = '' } })

async function submit() {
  error.value = ''
  if (f.next.length < 10) return void (error.value = 'كلمة المرور الجديدة يجب ألا تقل عن 10 أحرف')
  if (f.next !== f.confirm) return void (error.value = 'تأكيد كلمة المرور غير مطابق')
  busy.value = true
  try {
    const r = await api<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/change-password', { method: 'POST', body: { currentPassword: f.current, newPassword: f.next } })
    auth.save(r); notify.ok('تم تغيير كلمة المرور'); open.value = false
  } catch (e) { error.value = errMsg(e) } finally { busy.value = false }
}
</script>
<template>
  <UModal v-model:open="open" title="تغيير كلمة المرور" description="سيتم تسجيل خروجك من باقي الأجهزة." :ui="{ content: 'max-w-md' }">
    <template #body>
      <form id="pw-form" class="space-y-4" @submit.prevent="submit">
        <UFormField label="كلمة المرور الحالية"><UInput v-model="f.current" :type="show ? 'text' : 'password'" required autocomplete="current-password" dir="ltr" class="w-full" /></UFormField>
        <UFormField label="كلمة المرور الجديدة" hint="10 أحرف على الأقل"><UInput v-model="f.next" :type="show ? 'text' : 'password'" required autocomplete="new-password" dir="ltr" class="w-full" /></UFormField>
        <UFormField label="تأكيد كلمة المرور الجديدة"><UInput v-model="f.confirm" :type="show ? 'text' : 'password'" required autocomplete="new-password" dir="ltr" class="w-full" /></UFormField>
        <UCheckbox v-model="show" label="إظهار كلمات المرور" />
        <p v-if="error" class="flex items-start gap-2 border-s-2 border-red-500 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert"><UIcon name="i-lucide-circle-alert" class="mt-0.5 size-4 shrink-0" />{{ error }}</p>
      </form>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="outline" @click="open = false">إلغاء</UButton><UButton type="submit" form="pw-form" :loading="busy">حفظ</UButton></div>
    </template>
  </UModal>
</template>
