<script setup lang="ts">
defineProps<{ nav: { to: string; label: string; icon: string }[]; isActive: (to: string) => boolean }>()
</script>
<template>
  <div class="flex h-full flex-col">
    <NuxtLink to="/" class="px-5 pt-6 pb-5 flex items-center gap-3 border-b border-white/10">
      <img src="/logo-mark.png" alt="" class="size-11 rounded-xl bg-white object-contain p-1" />
      <div><p class="font-extrabold leading-tight">مكة للسياحة</p><p class="text-xs text-brand-300">لوحة الإدارة</p></div>
    </NuxtLink>
    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      <NuxtLink v-for="n in nav" :key="n.to" :to="n.to"
        class="group relative flex items-center gap-3 rounded-xl px-3.5 h-11 text-sm font-semibold transition-all duration-300"
        :class="isActive(n.to) ? 'bg-brand-500 text-white shadow-lg shadow-black/20' : 'text-brand-200 hover:bg-white/8 hover:ps-5'">
        <UIcon :name="n.icon" class="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />{{ n.label }}
      </NuxtLink>
    </nav>
    <p class="p-4 text-[11px] text-brand-400">© مكة للسياحة – دمياط</p>
  </div>
</template>
