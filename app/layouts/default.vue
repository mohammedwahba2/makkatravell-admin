<script setup lang="ts">
const auth = useAuth()
const route = useRoute()
const open = ref(false)
watch(() => route.fullPath, () => { open.value = false })

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
const active = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const logout = async () => {
  try { await useApi().api('/auth/logout', { method: 'POST' }) } catch { /* token may already be dead */ }
  auth.clear(); await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen lg:flex">
    <div v-if="open" class="fixed inset-0 bg-brand-ink/40 z-30 lg:hidden" @click="open = false" />
    <aside class="fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-brand-900 text-brand-100 flex flex-col transition-transform lg:translate-x-0"
      :class="open ? 'translate-x-0' : 'translate-x-full'">
      <div class="px-5 pt-6 pb-5 flex items-center gap-3 border-b border-white/10">
        <img src="/logo-mark.png" alt="" class="h-11 w-11 rounded-xl bg-white object-contain p-1" />
        <div><p class="font-extrabold leading-tight">مكة للسياحة</p><p class="text-xs text-brand-300">لوحة الإدارة</p></div>
      </div>
      <nav class="flex-1 overflow-y-auto p-3 space-y-1">
        <NuxtLink v-for="n in nav" :key="n.to" :to="n.to"
          class="flex items-center gap-3 rounded-xl px-3.5 h-11 text-sm font-semibold transition"
          :class="active(n.to) ? 'bg-brand-500 text-white' : 'text-brand-200 hover:bg-white/8'">
          <span :class="n.icon" class="text-lg" />{{ n.label }}
        </NuxtLink>
      </nav>
      <div class="p-3 border-t border-white/10">
        <div class="px-3 py-2 text-xs text-brand-300 truncate">{{ auth.user.value?.email }}</div>
        <button class="w-full flex items-center gap-3 rounded-xl px-3.5 h-11 text-sm font-semibold text-brand-200 hover:bg-white/8 cursor-pointer" @click="logout">
          <span class="i-lucide-log-out text-lg" />تسجيل الخروج
        </button>
      </div>
    </aside>

    <div class="flex-1 min-w-0">
      <header class="lg:hidden sticky top-0 z-20 h-14 bg-brand-900 text-white flex items-center justify-between px-4">
        <button class="p-2 -ms-2 cursor-pointer" aria-label="القائمة" @click="open = true"><span class="i-lucide-menu text-2xl" /></button>
        <span class="font-bold">مكة للسياحة</span><span class="w-8" />
      </header>
      <main class="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto"><slot /></main>
    </div>
  </div>
</template>
