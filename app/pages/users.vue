<script setup lang="ts">
useHead({ title: 'الفريق' })
const { api } = useApi()
const notify = useNotify()
const { ask } = useConfirm()
const auth = useAuth()
if (auth.user.value?.role !== 'ADMIN') await navigateTo('/')

const { data, refresh, status } = useAsyncData('admin-users', () => api('/admin/users'), { server: false })
const loading = computed(() => status.value === 'pending' && !data.value)
const ROLE: Record<string, string> = { ADMIN: 'مدير', EDITOR: 'محرر' }
const roleItems = Object.entries(ROLE).map(([value, label]) => ({ label, value }))

const open = ref(false)
const saving = ref(false)
const editing = ref<any | null>(null)
const f = reactive({ name: '', email: '', phone: '', role: 'EDITOR', password: '', isActive: true })
function edit(u?: any) {
  editing.value = u ?? null
  Object.assign(f, u ? { name: u.name, email: u.email, phone: u.phone ?? '', role: u.role, password: '', isActive: u.isActive } : { name: '', email: '', phone: '', role: 'EDITOR', password: '', isActive: true })
  open.value = true
}
const isSelf = computed(() => editing.value?.id === auth.user.value?.id)

async function save() {
  if (editing.value?.isActive && !f.isActive && !(await ask({ title: 'تعطيل الحساب', description: `لن يتمكن ${editing.value.name} من الدخول بعد الآن.`, confirmLabel: 'تعطيل', danger: true }))) return
  saving.value = true
  try {
    if (editing.value) await api(`/admin/users/${editing.value.id}`, { method: 'PATCH', body: { name: f.name, phone: f.phone || undefined, ...(isSelf.value ? {} : { role: f.role, isActive: f.isActive }), ...(f.password ? { password: f.password } : {}) } })
    else await api('/admin/users', { method: 'POST', body: { name: f.name, email: f.email, phone: f.phone || undefined, role: f.role, password: f.password } })
    notify.ok('تم الحفظ'); open.value = false; await refresh()
  } catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('')
</script>

<template>
  <div>
    <UiPageHead title="الفريق" sub="حسابات الإدارة والموظفين"><UButton icon="i-lucide-user-plus" @click="edit()">مستخدم جديد</UButton></UiPageHead>

    <div class="panel rise divide-y divide-brand-100 overflow-hidden">
      <div v-if="loading" class="space-y-3 p-4"><USkeleton v-for="i in 3" :key="i" class="h-14" /></div>
      <div v-for="u in data" :key="u.id" class="flex items-center gap-4 p-4 transition hover:bg-brand-50/60" :class="u.isActive ? '' : 'opacity-60'">
        <span class="grid size-10 shrink-0 place-items-center rounded bg-brand-100 text-sm font-bold text-brand-700">{{ initials(u.name) }}</span>
        <div class="min-w-0 flex-1"><p class="truncate font-bold text-brand-950">{{ u.name }} <span v-if="u.id === auth.user.value?.id" class="text-xs font-medium text-brand-500">(أنت)</span></p><p class="num truncate text-[13px] text-brand-500" dir="ltr" style="text-align:right">{{ u.email }}</p></div>
        <UBadge :color="u.role === 'ADMIN' ? 'primary' : 'neutral'" variant="subtle">{{ ROLE[u.role] }}</UBadge>
        <span class="hidden items-center gap-2 text-[13px] font-semibold sm:inline-flex"><span class="size-2 rounded-full" :class="u.isActive ? 'bg-emerald-600' : 'bg-stone-400'" />{{ u.isActive ? 'نشط' : 'معطّل' }}</span>
        <UButton color="neutral" variant="outline" icon="i-lucide-pencil" aria-label="تعديل" @click="edit(u)" />
      </div>
    </div>

    <UModal v-model:open="open" :title="editing ? 'تعديل المستخدم' : 'مستخدم جديد'" :ui="{ content: 'max-w-lg' }">
      <template #body>
        <form id="user-form" class="space-y-4" @submit.prevent="save">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="الاسم" required><UInput v-model="f.name" required class="w-full" /></UFormField>
            <UFormField label="الهاتف"><UInput v-model="f.phone" dir="ltr" class="w-full" /></UFormField>
          </div>
          <UFormField label="البريد الإلكتروني" required><UInput v-model="f.email" type="email" required :disabled="!!editing" dir="ltr" class="w-full" /></UFormField>
          <UFormField label="الدور" :hint="isSelf ? 'لا يمكنك تغيير دورك' : 'المحرر لا يدير الفريق ولا الإعدادات'"><USelect v-model="f.role" :items="roleItems" :disabled="isSelf" class="w-full" /></UFormField>
          <UFormField :label="editing ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'" hint="10 أحرف على الأقل" :required="!editing"><UInput v-model="f.password" type="password" :required="!editing" autocomplete="new-password" dir="ltr" class="w-full" /></UFormField>
          <USwitch v-if="editing && !isSelf" v-model="f.isActive" label="الحساب نشط" />
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="outline" @click="open = false">إلغاء</UButton><UButton type="submit" form="user-form" :loading="saving">حفظ</UButton></div>
      </template>
    </UModal>
  </div>
</template>
