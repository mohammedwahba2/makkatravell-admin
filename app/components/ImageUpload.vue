<script setup lang="ts">
const props = defineProps<{ modelValue?: string | null; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [string | null] }>()
const { upload } = useApi()
const toast = useToast()
const busy = ref(false)

async function pick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  busy.value = true
  try { emit('update:modelValue', await upload(f)) } catch (x) { toast.err(errMsg(x)) } finally { busy.value = false; (e.target as HTMLInputElement).value = '' }
}
</script>
<template>
  <div>
    <span v-if="label" class="label">{{ label }}</span>
    <div class="flex items-center gap-3">
      <div class="h-20 w-28 rounded-xl border border-dashed border-brand-300 bg-brand-50 overflow-hidden grid place-items-center shrink-0">
        <img v-if="props.modelValue" :src="props.modelValue" alt="" class="h-full w-full object-cover" />
        <span v-else class="i-lucide-image text-2xl text-brand-300" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="btn-ghost cursor-pointer" :class="{ 'opacity-50': busy }">
          <span class="i-lucide-upload" />{{ busy ? 'جاري الرفع…' : 'رفع صورة' }}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" class="sr-only" :disabled="busy" @change="pick" />
        </label>
        <button v-if="props.modelValue" type="button" class="text-xs text-red-600 text-start cursor-pointer" @click="emit('update:modelValue', null)">إزالة الصورة</button>
      </div>
    </div>
  </div>
</template>
