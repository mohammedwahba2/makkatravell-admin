<script setup lang="ts">
const props = defineProps<{ modelValue?: string | null; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [string | null] }>()
const { upload } = useApi()
const notify = useNotify()
const busy = ref(false)
const input = ref<HTMLInputElement>()

async function pick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  busy.value = true
  try { emit('update:modelValue', await upload(f)) } catch (x) { notify.err(errMsg(x)) } finally { busy.value = false; (e.target as HTMLInputElement).value = '' }
}
</script>
<template>
  <div>
    <span v-if="label" class="block text-sm font-medium text-brand-800 mb-1.5">{{ label }}</span>
    <div class="flex items-center gap-3">
      <div class="h-20 w-28 rounded-xl border border-dashed border-brand-300 bg-brand-50 overflow-hidden grid place-items-center shrink-0">
        <img v-if="props.modelValue" :src="props.modelValue" alt="" class="h-full w-full object-cover" />
        <UIcon v-else name="i-lucide-image" class="size-7 text-brand-300" />
      </div>
      <div class="flex flex-col items-start gap-1.5">
        <UButton color="neutral" variant="outline" icon="i-lucide-upload" :loading="busy" @click="input?.click()">رفع صورة</UButton>
        <UButton v-if="props.modelValue" color="error" variant="link" size="xs" class="px-0" @click="emit('update:modelValue', null)">إزالة الصورة</UButton>
        <input ref="input" type="file" accept="image/jpeg,image/png,image/webp,image/avif" class="sr-only" @change="pick" />
      </div>
    </div>
  </div>
</template>
