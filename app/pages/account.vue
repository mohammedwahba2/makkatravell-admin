<script setup lang="ts">
useHead({ title: 'حسابي والأمان' })
const { api } = useApi()
const notify = useNotify()
const auth = useAuth()
const { data: me, refresh } = await useAsyncData('me', () => api('/auth/me'), { server: false })
const pwOpen = ref(false)

// ---- 2FA setup
const setup = ref<{ secret: string; qr: string } | null>(null)
const code = ref('')
const busy = ref(false)
const recovery = ref<string[] | null>(null)
async function start() { busy.value = true; try { setup.value = await api('/auth/2fa/setup', { method: 'POST' }); code.value = '' } catch (e) { notify.err(errMsg(e)) } finally { busy.value = false } }
async function enable() {
  busy.value = true
  try { const r = await api<{ recoveryCodes: string[] }>('/auth/2fa/enable', { method: 'POST', body: { code: code.value } }); recovery.value = r.recoveryCodes; setup.value = null; await refresh(); notify.ok('تم تفعيل التحقق بخطوتين') }
  catch (e) { notify.err(errMsg(e)) } finally { busy.value = false }
}
const dis = reactive({ open: false, password: '', code: '' })
async function disable() {
  busy.value = true
  try { await api('/auth/2fa/disable', { method: 'POST', body: { password: dis.password, code: dis.code } }); dis.open = false; dis.password = ''; dis.code = ''; await refresh(); notify.ok('تم إيقاف التحقق بخطوتين') }
  catch (e) { notify.err(errMsg(e)) } finally { busy.value = false }
}
const copyCodes = async () => { try { await navigator.clipboard.writeText(recovery.value!.join('\n')); notify.ok('تم النسخ') } catch { notify.err('تعذّر النسخ') } }
</script>
<template>
  <div class="max-w-3xl">
    <UiPageHead title="حسابي والأمان" sub="بياناتك وحماية حسابك" />
    <div v-if="me" class="stagger space-y-4">
      <UCard>
        <template #header><h2 class="font-extrabold">الحساب</h2></template>
        <dl class="grid gap-4 text-sm sm:grid-cols-3">
          <div><dt class="mb-1 text-xs font-semibold text-brand-500">الاسم</dt><dd class="font-semibold">{{ me.name }}</dd></div>
          <div><dt class="mb-1 text-xs font-semibold text-brand-500">البريد</dt><dd class="num" dir="ltr" style="text-align:right">{{ me.email }}</dd></div>
          <div><dt class="mb-1 text-xs font-semibold text-brand-500">الدور / آخر دخول</dt><dd>{{ me.role === 'ADMIN' ? 'مدير' : 'محرر' }} · {{ me.lastLoginAt ? fdatetime(me.lastLoginAt) : '—' }}</dd></div>
        </dl>
        <div class="mt-5"><UButton color="neutral" variant="outline" icon="i-lucide-key-round" @click="pwOpen = true">تغيير كلمة المرور</UButton></div>
      </UCard>

      <UCard>
        <template #header><div class="flex items-center justify-between gap-3"><h2 class="font-extrabold">التحقق بخطوتين (2FA)</h2><UBadge :color="me.totpEnabled ? 'success' : 'warning'" variant="subtle">{{ me.totpEnabled ? 'مفعّل' : 'غير مفعّل' }}</UBadge></div></template>
        <p class="text-sm leading-7 text-brand-700">يضيف رمزًا مؤقتًا من تطبيق على موبايلك (Google Authenticator أو Microsoft Authenticator أو Authy) عند كل تسجيل دخول، فلا تكفي كلمة المرور وحدها لاختراق الحساب. <b>ننصح بتفعيله لكل المديرين.</b></p>

        <template v-if="!me.totpEnabled && !setup">
          <UButton class="mt-4" icon="i-lucide-shield-plus" :loading="busy" @click="start">تفعيل التحقق بخطوتين</UButton>
        </template>

        <div v-if="setup" class="mt-5 grid gap-6 rounded-xl bg-brand-50 p-5 sm:grid-cols-[auto_1fr]">
          <img :src="setup.qr" alt="رمز QR" class="size-[180px] rounded-lg bg-white p-2" />
          <div class="space-y-3 text-sm">
            <ol class="list-decimal space-y-1.5 ps-5 leading-7 text-brand-800"><li>افتح تطبيق المصادقة واختر «إضافة حساب» ثم امسح الرمز.</li><li>أو أدخل المفتاح يدويًا: <code class="num select-all rounded bg-white px-2 py-0.5" dir="ltr">{{ setup.secret }}</code></li><li>اكتب الرمز المكوّن من 6 أرقام الذي يظهر في التطبيق:</li></ol>
            <div class="flex gap-2"><UInput v-model="code" inputmode="numeric" maxlength="6" placeholder="000000" dir="ltr" class="w-36" /><UButton :loading="busy" :disabled="code.length < 6" @click="enable">تأكيد وتفعيل</UButton><UButton color="neutral" variant="ghost" @click="setup = null">إلغاء</UButton></div>
          </div>
        </div>

        <div v-if="me.totpEnabled" class="mt-4 flex flex-wrap items-center gap-3">
          <p class="text-sm text-brand-600">أكواد الاسترداد المتبقية: <b class="num">{{ me.recoveryLeft }}</b></p>
          <UButton color="error" variant="soft" icon="i-lucide-shield-off" @click="dis.open = true">إيقاف التحقق بخطوتين</UButton>
        </div>
      </UCard>
    </div>

    <UModal :open="!!recovery" title="احفظ أكواد الاسترداد" description="تُعرض هذه المرة فقط" :dismissible="false" :ui="{ content: 'max-w-md' }">
      <template #body>
        <p class="mb-3 text-sm leading-7 text-brand-700">لو ضاع موبايلك تستطيع الدخول بأحد هذه الأكواد (كل كود يُستعمل مرة واحدة). احفظها في مكان آمن، مثل مدير كلمات المرور.</p>
        <ul class="num grid grid-cols-2 gap-2 rounded-lg bg-brand-50 p-4 text-center font-bold" dir="ltr"><li v-for="c in recovery" :key="c" class="rounded bg-white py-1.5">{{ c }}</li></ul>
      </template>
      <template #footer><div class="flex w-full justify-between gap-2"><UButton color="neutral" variant="outline" icon="i-lucide-copy" @click="copyCodes">نسخ</UButton><UButton @click="recovery = null">حفظتها، متابعة</UButton></div></template>
    </UModal>

    <UModal v-model:open="dis.open" title="إيقاف التحقق بخطوتين" :ui="{ content: 'max-w-md' }">
      <template #body><form id="dis-form" class="space-y-4" @submit.prevent="disable"><UFormField label="كلمة المرور"><UInput v-model="dis.password" type="password" class="w-full" dir="ltr" /></UFormField><UFormField label="رمز من التطبيق أو كود استرداد"><UInput v-model="dis.code" class="w-full" dir="ltr" /></UFormField></form></template>
      <template #footer><div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="outline" @click="dis.open = false">إلغاء</UButton><UButton type="submit" form="dis-form" color="error" :loading="busy">إيقاف</UButton></div></template>
    </UModal>
    <ChangePasswordModal v-model:open="pwOpen" />
  </div>
</template>
