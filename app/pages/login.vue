<script setup lang="ts">
definePageMeta({ layout: 'blank' })
const auth = useAuth()
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const base = useRuntimeConfig().public.apiBase

async function submit() {
  busy.value = true; error.value = ''
  try {
    const r = await $fetch<{ accessToken: string; refreshToken: string; user: AuthUser }>(`${base}/auth/login`, { method: 'POST', body: { email: email.value, password: password.value } })
    if (!['ADMIN', 'EDITOR'].includes(r.user.role)) { error.value = 'هذا الحساب لا يملك صلاحية الدخول للوحة الإدارة'; return }
    auth.save(r)
    await navigateTo('/')
  } catch (e) { error.value = errMsg(e) } finally { busy.value = false }
}
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <div class="hidden lg:flex flex-col justify-between bg-brand-900 text-brand-100 p-12 relative overflow-hidden">
      <div class="absolute -bottom-32 -start-32 size-[28rem] rounded-full bg-brand-500/20 blur-3xl" />
      <img src="/logo-mark.png" alt="مكة للسياحة" class="h-20 w-20 rounded-2xl bg-white p-2 object-contain relative" />
      <div class="relative">
        <h2 class="text-4xl font-extrabold leading-tight">أدر رحلاتك وحجوزاتك<br />من مكان واحد</h2>
        <p class="mt-4 text-brand-300 max-w-sm">لوحة تحكم مكة للسياحة – دمياط.</p>
      </div>
      <p class="text-xs text-brand-400 relative">© مكة للسياحة</p>
    </div>
    <div class="flex items-center justify-center p-6">
      <form class="card w-full max-w-sm p-7" @submit.prevent="submit">
        <h1 class="text-2xl font-extrabold text-brand-900">تسجيل الدخول</h1>
        <p class="text-sm text-brand-500 mt-1 mb-6">أدخل بيانات حساب الإدارة</p>
        <label class="label" for="email">البريد الإلكتروني</label>
        <input id="email" v-model="email" type="email" required autocomplete="username" class="input mb-4" dir="ltr" />
        <label class="label" for="pw">كلمة المرور</label>
        <input id="pw" v-model="password" type="password" required autocomplete="current-password" class="input mb-4" dir="ltr" />
        <p v-if="error" class="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 mb-4" role="alert">{{ error }}</p>
        <button class="btn-primary w-full" :disabled="busy">{{ busy ? 'جاري الدخول…' : 'دخول' }}</button>
      </form>
    </div>
  </div>
</template>
