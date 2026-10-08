<script setup lang="ts">
definePageMeta({ layout: 'blank' })
useHead({ title: 'تسجيل الدخول' })
const auth = useAuth()
const base = useRuntimeConfig().public.apiBase
const email = ref('')
const password = ref('')
const show = ref(false)
const busy = ref(false)
const error = ref('')

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
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 grid lg:grid-cols-2">
    <!-- animated background -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-32 -start-24 size-[28rem] rounded-full bg-brand-500/30 blur-3xl" style="animation: float 11s ease-in-out infinite" />
      <div class="absolute -bottom-40 -end-24 size-[30rem] rounded-full bg-brand-400/25 blur-3xl" style="animation: float 14s ease-in-out infinite reverse" />
      <div class="absolute inset-0 opacity-[.07]" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 28px 28px" />
    </div>

    <!-- brand side -->
    <div class="relative hidden lg:flex flex-col justify-between p-14 text-brand-100">
      <img src="/logo-mark.png" alt="مكة للسياحة" class="size-20 rounded-2xl bg-white p-2 object-contain shadow-2xl rise" />
      <div class="stagger">
        <h2 class="text-5xl font-extrabold leading-[1.25] text-white">أدِر رحلاتك<br />وحجوزاتك<br /><span class="text-brand-300">من مكان واحد</span></h2>
        <p class="mt-5 max-w-sm text-brand-300 leading-8">لوحة تحكم مكة للسياحة – دمياط. تابع الحجوزات، وحدّث البرامج والأسعار، وتواصل مع عملائك بسهولة.</p>
        <div class="mt-8 flex gap-6 text-sm text-brand-200">
          <span class="flex items-center gap-2"><UIcon name="i-lucide-shield-check" class="size-5 text-brand-300" />اتصال آمن</span>
          <span class="flex items-center gap-2"><UIcon name="i-lucide-zap" class="size-5 text-brand-300" />تحديث فوري</span>
        </div>
      </div>
      <p class="text-xs text-brand-400">© مكة للسياحة</p>
    </div>

    <!-- form side -->
    <div class="relative flex items-center justify-center p-5 sm:p-8">
      <form class="rise w-full max-w-md rounded-3xl bg-white/95 p-8 sm:p-10 shadow-2xl shadow-black/30 backdrop-blur" style="animation-delay: .1s" @submit.prevent="submit">
        <img src="/logo-mark.png" alt="" class="lg:hidden mb-5 size-14 rounded-xl bg-brand-100 p-1.5 object-contain" />
        <h1 class="text-3xl font-extrabold text-brand-900">أهلًا بعودتك</h1>
        <p class="mt-1.5 mb-7 text-sm text-brand-500">سجّل الدخول للمتابعة إلى لوحة الإدارة</p>

        <UFormField label="البريد الإلكتروني" class="mb-4">
          <UInput v-model="email" type="email" required autocomplete="username" dir="ltr" size="xl" icon="i-lucide-mail" placeholder="admin@makkatravell.com" class="w-full" />
        </UFormField>
        <UFormField label="كلمة المرور" class="mb-5">
          <UInput v-model="password" :type="show ? 'text' : 'password'" required autocomplete="current-password" dir="ltr" size="xl" icon="i-lucide-lock" class="w-full" :ui="{ trailing: 'pe-1' }">
            <template #trailing>
              <UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'" :aria-label="show ? 'إخفاء' : 'إظهار'" @click="show = !show" />
            </template>
          </UInput>
        </UFormField>

        <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition duration-200" leave-to-class="opacity-0">
          <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" class="mb-5" />
        </Transition>

        <UButton type="submit" size="xl" block :loading="busy" trailing-icon="i-lucide-arrow-left">تسجيل الدخول</UButton>
      </form>
    </div>
  </div>
</template>
