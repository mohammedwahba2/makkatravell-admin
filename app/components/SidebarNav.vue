<script setup lang="ts">
export interface NavItem { to: string; label: string; icon: string; badge?: number }
defineProps<{ groups: { title: string; items: NavItem[] }[]; isActive: (to: string) => boolean; user?: { name?: string; email?: string } | null }>()
</script>
<template>
  <div class="flex h-full flex-col">
    <NuxtLink to="/" class="flex items-center gap-3 px-5 pb-5 pt-6">
      <img src="/logo-mark.png" alt="" class="size-10 rounded-md bg-white object-contain p-1" />
      <div class="leading-tight"><p class="text-[17px] font-extrabold text-white">مكة للسياحة</p><p class="text-[11px] tracking-wide text-brand-300">MAKKA TRAVEL · CONSOLE</p></div>
    </NuxtLink>

    <nav class="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-3">
      <div v-for="g in groups" :key="g.title">
        <p class="mb-2 px-3 text-[10px] font-bold tracking-[.18em] text-brand-400">{{ g.title }}</p>
        <div class="space-y-0.5">
          <NuxtLink v-for="n in g.items" :key="n.to" :to="n.to"
            class="group relative flex h-10 items-center gap-3 rounded-md px-3 text-[14px] font-semibold transition-colors duration-200"
            :class="isActive(n.to) ? 'bg-white/10 text-white' : 'text-brand-200/80 hover:bg-white/5 hover:text-white'">
            <span class="absolute inset-y-2 start-0 w-[3px] rounded-full bg-brand-400 transition-all duration-300" :class="isActive(n.to) ? 'opacity-100' : 'scale-y-0 opacity-0'" />
            <UIcon :name="n.icon" class="size-[18px] shrink-0" :class="isActive(n.to) ? 'text-brand-300' : ''" />
            <span class="flex-1">{{ n.label }}</span>
            <span v-if="n.badge" class="num grid h-5 min-w-5 place-items-center rounded bg-brand-400 px-1.5 text-[11px] font-bold text-brand-950">{{ n.badge }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div v-if="user" class="m-3 flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3">
      <span class="grid size-9 shrink-0 place-items-center rounded bg-brand-500 text-sm font-bold text-white">{{ (user.name || '؟').slice(0, 1) }}</span>
      <div class="min-w-0 leading-tight"><p class="truncate text-sm font-bold text-white">{{ user.name }}</p><p class="num truncate text-[11px] text-brand-300" dir="ltr">{{ user.email }}</p></div>
    </div>
  </div>
</template>
