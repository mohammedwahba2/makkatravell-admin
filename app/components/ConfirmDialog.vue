<script setup lang="ts">
const { state, resolve } = useConfirmState()
</script>
<template>
  <UModal :open="state.open" :title="state.title" :description="state.description || undefined"
    :ui="{ content: 'max-w-md' }" @update:open="(v: boolean) => { if (!v) resolve(false) }">
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="resolve(false)">{{ state.cancelLabel }}</UButton>
        <UButton :color="state.danger ? 'error' : 'primary'" @click="resolve(true)">{{ state.confirmLabel }}</UButton>
      </div>
    </template>
  </UModal>
</template>
