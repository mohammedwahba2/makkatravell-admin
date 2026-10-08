<script setup lang="ts">
const auth = useAuth()
const route = useRoute()
const { ask } = useConfirm()
const drawer = ref(false)
watch(() => route.fullPath, () => { drawer.value = false })

const nav = [
  { to: '/', label: 'لوحة التحكم', icon: 'i-lucide-layout-dashboard' },
  { to: '/bookings', label: 'الحجوزات', icon: 'i-lucide-ticket' },
  { to: '/packages', label: 'الرحلات والبرامج', icon: 'i-lucide-plane' },
  { to: '/posts', label: 'المدونة', icon: 'i-lucide-newspaper' },
  { to: '/faqs', label: 'الأسئلة الشائعة', icon: 'i-lucide-circle-help' },
  { to: '/testimonials', label: 'آراء العملاء', icon: 'i-lucide-message-square-quote' },
  { to: '/inquiries', label: 'رسائل التواصل', icon: 'i-lucide-inbox' },
  { to: '/settings', label: 'إعدادات الموقع', icon: 'i-lucide-settings' },
]
const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const current = computed(() => nav.find((n) => isActive(n.to))?.label ?? 'لوحة التحكم')

async function logout() {
  if (!(await ask({ title: 'تسجيل الخروج', description: 'هل تريد تسجيل الخروج من لوحة التحكم؟', confirmLabel: 'خروج', danger: true }))) return
  try { await useApi().api('/auth/logout', { method: 'POST' }) } catch { /* token may already be invalid */ }
  auth.clear(); await navigateTo('/login')
}
const menu = computed(() => [[{ label: auth.user.value?.email ?? '', type: 'label' as const }], [{ label: 'تسجيل الخروج', icon: 'i-lucide-log-out', color: 'error' as const, onSelect: logout }]])
</script>

<template>
  <div class="min-h-screen bg-brand-100 lg:flex">
    <!-- desktop sidebar -->
    <aside class="hidden lg:flex sticky top-0 h-screen w-72 shrink-0 flex-col bg-brand-900 text-brand-100">
      <SidebarNav :nav="nav" :is-active="isActive" />
    </aside>

    <!-- mobile drawer -->
    <USlideover v-model:open="drawer" side="right" title="القائمة" :ui="{ content: 'max-w-72 bg-brand-900 text-brand-100', header: 'hidden', body: 'p-0' }">
      <template #body><div class="flex h-full flex-col"><SidebarNav :nav="nav" :is-active="isActive" /></div></template>
    </USlideover>

    <div class="flex-1 min-w-0">
      <header class="sticky top-0 z-20 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 bg-brand-100/80 backdrop-blur-md border-b border-brand-200/60">
        <div class="flex items-center gap-3">
          <UButton class="lg:hidden" color="neutral" variant="ghost" icon="i-lucide-menu" aria-label="القائمة" @click="drawer = true" />
          <span class="font-bold text-brand-800">{{ current }}</span>
        </div>
        <div class="flex items-center gap-2">
          <UButton color="neutral" variant="ghost" icon="i-lucide-external-link" to="https://makkatravell.com" target="_blank" class="hidden sm:inline-flex">الموقع</UButton>
          <UDropdownMenu :items="menu" :content="{ align: 'start' }">
            <UButton color="neutral" variant="outline" class="rounded-full ps-1.5" trailing-icon="i-lucide-chevron-down">
              <UAvatar :alt="auth.user.value?.name" size="xs" :ui="{ root: 'bg-brand-700 text-white' }" />
              <span class="hidden sm:inline">{{ auth.user.value?.name }}</span>
            </UButton>
          </UDropdownMenu>
        </div>
      </header>
      <main class="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto"><slot /></main>
    </div>
  </div>
</template>
