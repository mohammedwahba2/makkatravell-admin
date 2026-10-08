<script setup lang="ts">
const { api, upload } = useApi()
const notify = useNotify()
const { ask } = useConfirm()
const id = useRoute().params.id as string
const isNew = id === 'new'
useHead({ title: isNew ? 'برنامج جديد' : 'تعديل برنامج' })

interface Dep { date: string; seatsTotal: number; priceDouble?: number; priceTriple?: number; priceQuad?: number; isOpen: boolean; seatsTaken?: number }
interface Day { day: number; title: string; text: string }

const f = reactive({
  title: '', slug: '', type: 'UMRAH', summary: '', description: '', durationDays: 10, nightsMakkah: 0, nightsMadinah: 0,
  makkahHotel: '', madinahHotel: '', hotelStars: 4, airline: '', departureCity: 'القاهرة', coverImage: null as string | null,
  gallery: [] as string[], includesText: '', excludesText: '', itinerary: [] as Day[], basePrice: 0,
  isFeatured: false, isPublished: true, sortOrder: 0, seoTitle: '', seoDescription: '', departures: [] as Dep[],
})

if (!isNew) {
  const p = await api(`/admin/packages/${id}`)
  Object.assign(f, p, {
    makkahHotel: p.makkahHotel ?? '', madinahHotel: p.madinahHotel ?? '', airline: p.airline ?? '', seoTitle: p.seoTitle ?? '', seoDescription: p.seoDescription ?? '',
    basePrice: Number(p.basePrice), includesText: (p.includes ?? []).join('\n'), excludesText: (p.excludes ?? []).join('\n'),
    itinerary: p.itinerary ?? [], gallery: p.gallery ?? [],
    departures: p.departures.map((d: any) => ({ ...d, date: d.date.slice(0, 10), priceDouble: d.priceDouble ? Number(d.priceDouble) : undefined, priceTriple: d.priceTriple ? Number(d.priceTriple) : undefined, priceQuad: d.priceQuad ? Number(d.priceQuad) : undefined })),
  })
}

const typeItems = Object.entries(PACKAGE_TYPES).map(([value, label]) => ({ label, value }))
const starItems = [1, 2, 3, 4, 5].map((n) => ({ label: `${n} نجوم`, value: n }))
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const addDep = () => f.departures.push({ date: '', seatsTotal: 40, priceDouble: undefined, priceTriple: undefined, priceQuad: undefined, isOpen: true })
const addDay = () => f.itinerary.push({ day: f.itinerary.length + 1, title: '', text: '' })
const saving = ref(false)
const galleryInput = ref<HTMLInputElement>()

async function addGallery(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  for (const file of files) { try { f.gallery.push(await upload(file)) } catch (x) { notify.err(errMsg(x)) } }
  ;(e.target as HTMLInputElement).value = ''
}
async function removeDep(i: number) {
  if (!(await ask({ title: 'حذف الموعد', description: 'سيتم حذف هذا الموعد عند حفظ البرنامج.', confirmLabel: 'حذف', danger: true }))) return
  f.departures.splice(i, 1)
}

async function save() {
  if (f.departures.some((d) => !d.date)) return notify.err('أكمل تواريخ المغادرة أو احذف الصفوف الفارغة')
  saving.value = true
  const num = (v: unknown) => (v === null || v === '' || v === undefined ? undefined : Number(v))
  const body = {
    title: f.title, slug: f.slug || undefined, type: f.type, summary: f.summary, description: f.description,
    durationDays: f.durationDays, nightsMakkah: f.nightsMakkah, nightsMadinah: f.nightsMadinah,
    makkahHotel: f.makkahHotel || undefined, madinahHotel: f.madinahHotel || undefined, hotelStars: f.hotelStars,
    airline: f.airline || undefined, departureCity: f.departureCity, coverImage: f.coverImage || undefined, gallery: f.gallery,
    includes: lines(f.includesText), excludes: lines(f.excludesText), itinerary: f.itinerary, basePrice: f.basePrice,
    isFeatured: f.isFeatured, isPublished: f.isPublished, sortOrder: f.sortOrder,
    seoTitle: f.seoTitle || undefined, seoDescription: f.seoDescription || undefined,
    departures: f.departures.map((d) => ({ date: d.date, seatsTotal: d.seatsTotal, isOpen: d.isOpen, priceDouble: num(d.priceDouble), priceTriple: num(d.priceTriple), priceQuad: num(d.priceQuad) })),
  }
  try {
    await api(isNew ? '/admin/packages' : `/admin/packages/${id}`, { method: isNew ? 'POST' : 'PATCH', body })
    notify.ok('تم حفظ البرنامج'); await navigateTo('/packages')
  } catch (e) { notify.err(errMsg(e)) } finally { saving.value = false }
}
</script>

<template>
  <form @submit.prevent="save">
    <UiPageHead :title="isNew ? 'برنامج جديد' : 'تعديل البرنامج'">
      <UButton to="/packages" color="neutral" variant="outline">إلغاء</UButton>
      <UButton type="submit" :loading="saving" icon="i-lucide-save">حفظ</UButton>
    </UiPageHead>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="stagger space-y-4 lg:col-span-2">
        <UCard>
          <template #header><h2 class="font-extrabold">المعلومات الأساسية</h2></template>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="عنوان البرنامج" required class="sm:col-span-2"><UInput v-model="f.title" required maxlength="160" class="w-full" /></UFormField>
            <UFormField label="النوع"><USelect v-model="f.type" :items="typeItems" class="w-full" /></UFormField>
            <UFormField label="السعر الأساسي (ج.م)" required><UInput v-model.number="f.basePrice" type="number" min="0" required class="w-full" /></UFormField>
            <UFormField label="ملخص قصير" required class="sm:col-span-2"><UTextarea v-model="f.summary" :rows="2" required maxlength="400" class="w-full" /></UFormField>
            <UFormField label="الوصف التفصيلي" required class="sm:col-span-2"><UTextarea v-model="f.description" :rows="6" required class="w-full" /></UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header><h2 class="font-extrabold">الإقامة والطيران</h2></template>
          <div class="grid gap-4 sm:grid-cols-3">
            <UFormField label="عدد الأيام"><UInput v-model.number="f.durationDays" type="number" min="1" max="90" required class="w-full" /></UFormField>
            <UFormField label="ليالي مكة"><UInput v-model.number="f.nightsMakkah" type="number" min="0" class="w-full" /></UFormField>
            <UFormField label="ليالي المدينة"><UInput v-model.number="f.nightsMadinah" type="number" min="0" class="w-full" /></UFormField>
            <UFormField label="فندق مكة"><UInput v-model="f.makkahHotel" class="w-full" /></UFormField>
            <UFormField label="فندق المدينة"><UInput v-model="f.madinahHotel" class="w-full" /></UFormField>
            <UFormField label="تصنيف الفندق"><USelect v-model="f.hotelStars" :items="starItems" class="w-full" /></UFormField>
            <UFormField label="شركة الطيران"><UInput v-model="f.airline" class="w-full" /></UFormField>
            <UFormField label="مدينة الانطلاق"><UInput v-model="f.departureCity" class="w-full" /></UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header><div class="flex items-center justify-between"><h2 class="font-extrabold">مواعيد المغادرة والأسعار</h2><UButton color="neutral" variant="outline" icon="i-lucide-plus" size="sm" @click="addDep">موعد</UButton></div></template>
          <p v-if="!f.departures.length" class="text-sm text-brand-500">لا توجد مواعيد. أضف موعدًا ليتمكن العملاء من الحجز بتاريخ محدد.</p>
          <TransitionGroup tag="div" class="space-y-3" enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition duration-200" leave-to-class="opacity-0">
            <div v-for="(d, i) in f.departures" :key="i" class="grid grid-cols-2 items-end gap-3 rounded-lg bg-brand-50 p-3 sm:grid-cols-6">
              <UFormField label="التاريخ" class="col-span-2"><UInput v-model="d.date" type="date" required class="w-full" /></UFormField>
              <UFormField label="المقاعد"><UInput v-model.number="d.seatsTotal" type="number" min="1" class="w-full" /></UFormField>
              <UFormField label="ثنائي"><UInput v-model.number="d.priceDouble" type="number" min="0" placeholder="—" class="w-full" /></UFormField>
              <UFormField label="ثلاثي"><UInput v-model.number="d.priceTriple" type="number" min="0" placeholder="—" class="w-full" /></UFormField>
              <UFormField label="رباعي"><UInput v-model.number="d.priceQuad" type="number" min="0" placeholder="—" class="w-full" /></UFormField>
              <USwitch v-model="d.isOpen" label="مفتوح للحجز" class="col-span-2 sm:col-span-3" />
              <p v-if="d.seatsTaken" class="text-xs text-brand-500 sm:col-span-2">محجوز: {{ d.seatsTaken }}</p>
              <UButton color="error" variant="soft" icon="i-lucide-trash-2" aria-label="حذف الموعد" class="justify-self-end sm:col-start-6" @click="removeDep(i)" />
            </div>
          </TransitionGroup>
          <p class="mt-3 text-xs text-brand-500">المواعيد التي عليها حجوزات لا تُحذف تلقائيًا للحفاظ على بيانات الحجوزات.</p>
        </UCard>

        <UCard>
          <template #header><h2 class="font-extrabold">ما يشمله البرنامج</h2></template>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="يشمل (سطر لكل بند)"><UTextarea v-model="f.includesText" :rows="6" class="w-full" /></UFormField>
            <UFormField label="لا يشمل (سطر لكل بند)"><UTextarea v-model="f.excludesText" :rows="6" class="w-full" /></UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header><div class="flex items-center justify-between"><h2 class="font-extrabold">البرنامج اليومي</h2><UButton color="neutral" variant="outline" icon="i-lucide-plus" size="sm" @click="addDay">يوم</UButton></div></template>
          <div class="space-y-3">
            <div v-for="(d, i) in f.itinerary" :key="i" class="grid items-start gap-3 rounded-lg bg-brand-50 p-3 sm:grid-cols-[84px_1fr_auto]">
              <UInput v-model.number="d.day" type="number" min="1" aria-label="رقم اليوم" />
              <div class="space-y-2"><UInput v-model="d.title" placeholder="عنوان اليوم" class="w-full" /><UTextarea v-model="d.text" :rows="2" placeholder="التفاصيل" class="w-full" /></div>
              <UButton color="error" variant="soft" icon="i-lucide-trash-2" aria-label="حذف اليوم" @click="f.itinerary.splice(i, 1)" />
            </div>
          </div>
        </UCard>
      </div>

      <aside class="stagger space-y-4">
        <UCard>
          <template #header><h2 class="font-extrabold">النشر</h2></template>
          <div class="space-y-4">
            <USwitch v-model="f.isPublished" label="منشور على الموقع" />
            <USwitch v-model="f.isFeatured" label="برنامج مميز (يظهر بالرئيسية)" />
            <UFormField label="ترتيب العرض"><UInput v-model.number="f.sortOrder" type="number" class="w-full" /></UFormField>
          </div>
        </UCard>
        <UCard>
          <template #header><h2 class="font-extrabold">الصور</h2></template>
          <div class="space-y-5">
            <ImageUpload v-model="f.coverImage" label="صورة الغلاف" />
            <div>
              <span class="mb-1.5 block text-sm font-medium text-brand-800">معرض الصور</span>
              <div class="mb-2 grid grid-cols-3 gap-2">
                <div v-for="(g, i) in f.gallery" :key="g" class="group relative aspect-square overflow-hidden rounded-lg">
                  <img :src="g" alt="" class="size-full object-cover" />
                  <button type="button" class="absolute inset-0 grid cursor-pointer place-items-center bg-brand-950/60 text-white opacity-0 transition focus:opacity-100 group-hover:opacity-100" aria-label="حذف الصورة" @click="f.gallery.splice(i, 1)"><UIcon name="i-lucide-trash-2" class="size-5" /></button>
                </div>
              </div>
              <UButton color="neutral" variant="outline" icon="i-lucide-images" @click="galleryInput?.click()">إضافة صور</UButton>
              <input ref="galleryInput" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" class="sr-only" @change="addGallery" />
            </div>
          </div>
        </UCard>
        <UCard>
          <template #header><h2 class="font-extrabold">تحسين محركات البحث</h2></template>
          <div class="space-y-4">
            <UFormField label="الرابط (slug)"><UInput v-model="f.slug" placeholder="يُولَّد تلقائيًا" class="w-full" /></UFormField>
            <UFormField :label="`عنوان SEO (${f.seoTitle.length}/70)`"><UInput v-model="f.seoTitle" maxlength="70" class="w-full" /></UFormField>
            <UFormField :label="`وصف SEO (${f.seoDescription.length}/170)`"><UTextarea v-model="f.seoDescription" maxlength="170" :rows="3" class="w-full" /></UFormField>
          </div>
        </UCard>
      </aside>
    </div>
  </form>
</template>
