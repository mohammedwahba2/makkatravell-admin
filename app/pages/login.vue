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

// nested pointed arches (mihrab motif), drawn as SVG
const SQ3 = Math.sqrt(3)
const arch = (w: number, h: number) => `M${-w} 0 V${-h} A${2 * w} ${2 * w} 0 0 1 0 ${-(h + w * SQ3)} A${2 * w} ${2 * w} 0 0 1 ${w} ${-h} V0`
const arches = Array.from({ length: 9 }, (_, i) => ({ w: 34 + i * 30, h: 120 + i * 18, d: i }))
</script>

<template>
  <div class="grid min-h-screen bg-brand-100 lg:grid-cols-[1.15fr_1fr]">
    <!-- art side -->
    <div class="grain relative hidden overflow-hidden bg-brand-950 lg:block">
      <svg class="absolute inset-0 size-full" viewBox="0 0 700 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <pattern id="star" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M22 3 L26 14 L37 10 L33 21 L44 22 L33 25 L37 36 L26 30 L22 41 L18 30 L7 36 L11 25 L0 22 L11 21 L7 10 L18 14 Z" fill="none" stroke="#C98F68" stroke-opacity=".10" stroke-width=".6" />
          </pattern>
          <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8DCCB" /><stop offset="1" stop-color="#A56F4D" /></linearGradient>
          <radialGradient id="glow" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="#A56F4D" stop-opacity=".35" /><stop offset="1" stop-color="#A56F4D" stop-opacity="0" /></radialGradient>
        </defs>
        <rect width="700" height="900" fill="url(#star)" />
        <rect width="700" height="900" fill="url(#glow)" />
        <g transform="translate(350 900)" fill="none" stroke="url(#gl)">
          <path v-for="a in arches" :key="a.d" :d="arch(a.w, a.h)" :stroke-width="a.d === 0 ? 1.6 : 1" :stroke-opacity="1 - a.d * 0.09" pathLength="1" stroke-dasharray="1"
            :style="{ animation: `draw 2.2s cubic-bezier(.4,0,.2,1) ${a.d * 0.16}s both` }" />
        </g>
        <circle cx="350" cy="148" r="3" fill="#E8DCCB" class="pulse-dot" />
      </svg>
      <div class="relative z-10 flex h-full flex-col justify-between p-14">
        <div class="rise flex items-center gap-3"><img src="/logo-mark.png" alt="" class="h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,.4)]" /><div class="leading-tight"><p class="text-lg font-extrabold text-white">مكة للسياحة</p><p class="text-[11px] tracking-[.18em] text-brand-300">MAKKA TRAVEL · دمياط</p></div></div>
        <div class="stagger max-w-md">
          <p class="eyebrow mb-4 !text-brand-300">لوحة الإدارة</p>
          <h2 class="text-[46px] font-extrabold leading-[1.2] text-white">رحلات الحج والعمرة،<br /><span class="text-brand-300">تحت إدارتك.</span></h2>
          <p class="mt-5 leading-8 text-brand-200/80">تابع الحجوزات، وحدّث البرامج والمواعيد والأسعار، ورد على عملائك من مكان واحد.</p>
        </div>
      </div>
    </div>

    <!-- form side -->
    <div class="flex items-center justify-center px-6 py-12 sm:px-12">
      <form class="rise w-full max-w-[22rem]" @submit.prevent="submit">
        <img src="/logo-mark.png" alt="" class="mb-8 h-16 w-auto object-contain lg:hidden" />
        <p class="eyebrow mb-3">تسجيل الدخول</p>
        <h1 class="text-[34px] font-extrabold leading-tight tracking-tight text-brand-950">أهلًا بعودتك</h1>
        <p class="mb-9 mt-2 text-[15px] text-brand-600">أدخل بيانات حساب الإدارة للمتابعة.</p>

        <UFormField label="البريد الإلكتروني" class="mb-5">
          <UInput v-model="email" type="email" required autocomplete="username" dir="ltr" size="xl" placeholder="name@makkatravell.com" class="w-full" />
        </UFormField>
        <UFormField label="كلمة المرور" class="mb-6">
          <UInput v-model="password" :type="show ? 'text' : 'password'" required autocomplete="current-password" dir="ltr" size="xl" class="w-full" :ui="{ trailing: 'pe-1' }">
            <template #trailing><UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'" :aria-label="show ? 'إخفاء' : 'إظهار'" @click="show = !show" /></template>
          </UInput>
        </UFormField>

        <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-200" leave-to-class="opacity-0">
          <p v-if="error" class="mb-5 flex items-start gap-2 border-s-2 border-red-500 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert"><UIcon name="i-lucide-circle-alert" class="mt-0.5 size-4 shrink-0" />{{ error }}</p>
        </Transition>

        <UButton type="submit" size="xl" block :loading="busy" trailing-icon="i-lucide-arrow-left">دخول</UButton>
        <p class="mt-8 flex items-center gap-2 text-[12px] text-brand-500"><UIcon name="i-lucide-lock-keyhole" class="size-3.5" />اتصال مشفّر · الجلسات محمية بتجديد تلقائي</p>
      </form>
    </div>
  </div>
</template>
