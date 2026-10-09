<script setup lang="ts">
const auth = useAuth()
const route = useRoute()
const { ask } = useConfirm()
const { api } = useApi()
const drawer = ref(false)
watch(() => route.fullPath, () => { drawer.value = false })

const { data: stats, refresh: refreshStats } = useAsyncData('stats', () => api('/admin/stats'), { server: false })
let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(refreshStats, 60_000) })
onBeforeUnmount(() => clearInterval(timer))

const groups = computed(() => [
  { title: 'التشغيل', items: [
    { to: '/', label: 'نظرة عامة', icon: 'i-lucide-layout-grid' },
    { to: '/bookings', label: 'الحجوزات', icon: 'i-lucide-ticket', badge: stats.value?.pending },
    { to: '/departures', label: 'مواعيد السفر', icon: 'i-lucide-calendar-check' },
    { to: '/inquiries', label: 'رسائل التواصل', icon: 'i-lucide-inbox', badge: stats.value?.newInquiries },
  ] },
  { title: 'المحتوى', items: [
    { to: '/packages', label: 'الرحلات والبرامج', icon: 'i-lucide-plane' },
    { to: '/posts', label: 'المدونة', icon: 'i-lucide-newspaper' },
    { to: '/faqs', label: 'الأسئلة الشائعة', icon: 'i-lucide-circle-help' },
    { to: '/testimonials', label: 'آراء العملاء', icon: 'i-lucide-quote' },
  ] },
  { title: 'النظام', items: [
    ...(auth.user.value?.role === 'ADMIN' ? [{ to: '/users', label: 'الفريق', icon: 'i-lucide-users' }, { to: '/audit', label: 'سجل النشاط', icon: 'i-lucide-history' }] : []),
    { to: '/settings', label: 'إعدادات الموقع', icon: 'i-lucide-sliders-horizontal' },
  ] },
])
const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const alerts = computed(() => (stats.value?.pending ?? 0) + (stats.value?.newInquiries ?? 0))

async function logout() {
  if (!(await ask({ title: 'تسجيل الخروج', description: 'هل تريد تسجيل الخروج من لوحة التحكم؟', confirmLabel: 'خروج', danger: true }))) return
  try { await api('/auth/logout', { method: 'POST' }) } catch { /* token may already be invalid */ }
  auth.clear(); await navigateTo('/login')
}
const pwOpen = ref(false)
const menu = computed(() => [
  [{ label: auth.user.value?.email ?? '', type: 'label' as const }],
  [{ label: 'حسابي والأمان', icon: 'i-lucide-shield-check', to: '/account' }, { label: 'تغيير كلمة المرور', icon: 'i-lucide-key-round', onSelect: () => { pwOpen.value = true } }],
  [{ label: 'تسجيل الخروج', icon: 'i-lucide-log-out', color: 'error' as const, onSelect: logout }],
])
const today = greg(), hj = hijri()
</script>

<template>
  <div class="min-h-screen bg-brand-100">
    <aside class="grain fixed inset-y-0 start-0 z-30 hidden w-[17rem] bg-brand-950 lg:block">
      <SidebarNav :groups="groups" :is-active="isActive" :user="auth.user.value" />
    </aside>

    <USlideover v-model:open="drawer" side="right" title="القائمة" :ui="{ content: 'max-w-[17rem] bg-brand-950', header: 'hidden', body: 'p-0' }">
      <template #body><SidebarNav :groups="groups" :is-active="isActive" :user="auth.user.value" /></template>
    </USlideover>

    <div class="min-w-0 lg:ps-[17rem]">
      <header class="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 bg-brand-100/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <UButton class="lg:hidden" color="neutral" variant="ghost" icon="i-lucide-menu" aria-label="القائمة" @click="drawer = true" />
          <div class="hidden items-center gap-2 text-[13px] text-brand-600 sm:flex">
            <UIcon name="i-lucide-calendar" class="size-4 text-brand-400" /><span class="font-semibold">{{ today }}</span><span class="text-brand-300">·</span><span>{{ hj }}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <UTooltip :text="alerts ? `${alerts} عنصر بانتظار المتابعة` : 'لا جديد'">
            <UButton to="/bookings?status=PENDING" color="neutral" variant="ghost" icon="i-lucide-bell" aria-label="التنبيهات" class="relative">
              <span v-if="alerts" class="absolute end-1.5 top-1.5 size-2 rounded-full bg-brand-500 pulse-dot" />
            </UButton>
          </UTooltip>
          <UButton color="neutral" variant="ghost" icon="i-lucide-external-link" to="https://makkatravell.com" target="_blank" class="hidden sm:inline-flex">الموقع</UButton>
          <UDropdownMenu :items="menu" :content="{ align: 'start' }">
            <UButton color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down" class="ps-1.5">
              <span class="grid size-6 place-items-center rounded bg-brand-700 text-xs font-bold text-white">{{ (auth.user.value?.name || '؟').slice(0, 1) }}</span>
              <span class="hidden sm:inline">{{ auth.user.value?.name }}</span>
            </UButton>
          </UDropdownMenu>
        </div>
      </header>
      <ChangePasswordModal v-model:open="pwOpen" />
      <main class="mx-auto max-w-[1360px] p-4 sm:p-6 lg:p-8"><slot /></main>
    </div>
  </div>
</template>
