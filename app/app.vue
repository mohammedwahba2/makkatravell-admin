<script setup lang="ts">
import { ar } from '@nuxt/ui/locale'
</script>
<template>
  <UApp :locale="ar" :toaster="{ position: 'bottom-center', duration: 4000 }">
    <NuxtLoadingIndicator color="#A56F4D" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ConfirmDialog />
  </UApp>
</template>
