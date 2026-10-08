<script setup lang="ts">
const { api } = useApi()
const toast = useToast()
const id = useRoute().params.id as string
const isNew = id === 'new'
useHead({ title: isNew ? 'برنامج جديد' : 'تعديل برنامج' })

interface Dep { date: string; seatsTotal: number; priceDouble?: number | null; priceTriple?: number | null; priceQuad?: number | null; isOpen: boolean; seatsTaken?: number }
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
    departures: p.departures.map((d: any) => ({ ...d, date: d.date.slice(0, 10), priceDouble: d.priceDouble && Number(d.priceDouble), priceTriple: d.priceTriple && Number(d.priceTriple), priceQuad: d.priceQuad && Number(d.priceQuad) })),
  })
}

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const addDep = () => f.departures.push({ date: '', seatsTotal: 40, priceDouble: null, priceTriple: null, priceQuad: null, isOpen: true })
const addDay = () => f.itinerary.push({ day: f.itinerary.length + 1, title: '', text: '' })
const saving = ref(false)

async function addGallery(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  for (const file of files) { try { f.gallery.push(await useApi().upload(file)) } catch (x) { toast.err(errMsg(x)) } }
  ;(e.target as HTMLInputElement).value = ''
}

async function save() {
  if (f.departures.some((d) => !d.date)) return toast.err('أكمل تواريخ المغادرة أو احذف الصفوف الفارغة')
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
    toast.ok('تم حفظ البرنامج'); await navigateTo('/packages')
  } catch (e) { toast.err(errMsg(e)) } finally { saving.value = false }
}
</script>

<template>
  <form @submit.prevent="save">
    <UiPageHead :title="isNew ? 'برنامج جديد' : 'تعديل البرنامج'">
      <NuxtLink to="/packages" class="btn-ghost">إلغاء</NuxtLink>
      <button class="btn-primary" :disabled="saving">{{ saving ? 'جاري الحفظ…' : 'حفظ' }}</button>
    </UiPageHead>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4">
        <section class="card p-5 grid sm:grid-cols-2 gap-4">
          <h2 class="font-extrabold sm:col-span-2">المعلومات الأساسية</h2>
          <div class="sm:col-span-2"><label class="label" for="t">عنوان البرنامج *</label><input id="t" v-model="f.title" class="input" required maxlength="160" /></div>
          <div><label class="label" for="ty">النوع</label><select id="ty" v-model="f.type" class="input"><option v-for="(l, k) in PACKAGE_TYPES" :key="k" :value="k">{{ l }}</option></select></div>
          <div><label class="label" for="pr">السعر الأساسي (ج.م) *</label><input id="pr" v-model.number="f.basePrice" type="number" min="0" class="input" required /></div>
          <div class="sm:col-span-2"><label class="label" for="su">ملخص قصير *</label><textarea id="su" v-model="f.summary" rows="2" class="input" required maxlength="400" /></div>
          <div class="sm:col-span-2"><label class="label" for="de">الوصف التفصيلي *</label><textarea id="de" v-model="f.description" rows="6" class="input" required /></div>
        </section>

        <section class="card p-5 grid sm:grid-cols-3 gap-4">
          <h2 class="font-extrabold sm:col-span-3">الإقامة والطيران</h2>
          <div><label class="label">عدد الأيام</label><input v-model.number="f.durationDays" type="number" min="1" max="90" class="input" required /></div>
          <div><label class="label">ليالي مكة</label><input v-model.number="f.nightsMakkah" type="number" min="0" class="input" /></div>
          <div><label class="label">ليالي المدينة</label><input v-model.number="f.nightsMadinah" type="number" min="0" class="input" /></div>
          <div class="sm:col-span-1"><label class="label">فندق مكة</label><input v-model="f.makkahHotel" class="input" /></div>
          <div><label class="label">فندق المدينة</label><input v-model="f.madinahHotel" class="input" /></div>
          <div><label class="label">تصنيف الفندق</label><select v-model.number="f.hotelStars" class="input"><option v-for="n in 5" :key="n" :value="n">{{ n }} نجوم</option></select></div>
          <div><label class="label">شركة الطيران</label><input v-model="f.airline" class="input" /></div>
          <div><label class="label">مدينة الانطلاق</label><input v-model="f.departureCity" class="input" /></div>
        </section>

        <section class="card p-5 space-y-4">
          <div class="flex items-center justify-between"><h2 class="font-extrabold">مواعيد المغادرة والأسعار</h2><button type="button" class="btn-ghost" @click="addDep"><span class="i-lucide-plus" />موعد</button></div>
          <p v-if="!f.departures.length" class="text-sm text-brand-500">لا توجد مواعيد. أضف موعدًا ليتمكن العملاء من الحجز بتاريخ محدد.</p>
          <div v-for="(d, i) in f.departures" :key="i" class="rounded-xl border border-brand-200 p-3 grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
            <div class="col-span-2"><label class="label">التاريخ</label><input v-model="d.date" type="date" class="input" required /></div>
            <div><label class="label">المقاعد</label><input v-model.number="d.seatsTotal" type="number" min="1" class="input" /></div>
            <div><label class="label">ثنائي</label><input v-model.number="d.priceDouble" type="number" min="0" class="input" placeholder="—" /></div>
            <div><label class="label">ثلاثي</label><input v-model.number="d.priceTriple" type="number" min="0" class="input" placeholder="—" /></div>
            <div><label class="label">رباعي</label><input v-model.number="d.priceQuad" type="number" min="0" class="input" placeholder="—" /></div>
            <label class="col-span-1 flex items-center gap-2 text-sm"><input v-model="d.isOpen" type="checkbox" class="accent-[#A56F4D]" />مفتوح</label>
            <p v-if="d.seatsTaken" class="col-span-2 text-xs text-brand-500">محجوز: {{ d.seatsTaken }}</p>
            <button type="button" class="btn-danger col-span-1 sm:col-start-6 justify-self-end" aria-label="حذف الموعد" @click="f.departures.splice(i, 1)"><span class="i-lucide-trash-2" /></button>
          </div>
          <p class="text-xs text-brand-500">المواعيد التي عليها حجوزات لا تُحذف تلقائيًا للحفاظ على بيانات الحجوزات.</p>
        </section>

        <section class="card p-5 grid sm:grid-cols-2 gap-4">
          <h2 class="font-extrabold sm:col-span-2">ما يشمله البرنامج</h2>
          <div><label class="label">يشمل (سطر لكل بند)</label><textarea v-model="f.includesText" rows="6" class="input" /></div>
          <div><label class="label">لا يشمل (سطر لكل بند)</label><textarea v-model="f.excludesText" rows="6" class="input" /></div>
        </section>

        <section class="card p-5 space-y-3">
          <div class="flex items-center justify-between"><h2 class="font-extrabold">البرنامج اليومي</h2><button type="button" class="btn-ghost" @click="addDay"><span class="i-lucide-plus" />يوم</button></div>
          <div v-for="(d, i) in f.itinerary" :key="i" class="rounded-xl border border-brand-200 p-3 grid sm:grid-cols-[80px_1fr_auto] gap-3 items-start">
            <input v-model.number="d.day" type="number" min="1" class="input" aria-label="رقم اليوم" />
            <div class="space-y-2"><input v-model="d.title" class="input" placeholder="عنوان اليوم" /><textarea v-model="d.text" rows="2" class="input" placeholder="التفاصيل" /></div>
            <button type="button" class="btn-danger" aria-label="حذف اليوم" @click="f.itinerary.splice(i, 1)"><span class="i-lucide-trash-2" /></button>
          </div>
        </section>
      </div>

      <aside class="space-y-4">
        <section class="card p-5 space-y-4">
          <h2 class="font-extrabold">النشر</h2>
          <label class="flex items-center gap-2 text-sm"><input v-model="f.isPublished" type="checkbox" class="accent-[#A56F4D]" />منشور على الموقع</label>
          <label class="flex items-center gap-2 text-sm"><input v-model="f.isFeatured" type="checkbox" class="accent-[#A56F4D]" />برنامج مميز (يظهر بالرئيسية)</label>
          <div><label class="label">ترتيب العرض</label><input v-model.number="f.sortOrder" type="number" class="input" /></div>
        </section>
        <section class="card p-5 space-y-4">
          <h2 class="font-extrabold">الصور</h2>
          <ImageUpload v-model="f.coverImage" label="صورة الغلاف" />
          <div>
            <span class="label">معرض الصور</span>
            <div class="grid grid-cols-3 gap-2 mb-2">
              <div v-for="(g, i) in f.gallery" :key="g" class="relative aspect-square rounded-lg overflow-hidden group">
                <img :src="g" alt="" class="size-full object-cover" />
                <button type="button" class="absolute inset-0 bg-brand-ink/60 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 grid place-items-center cursor-pointer" aria-label="حذف الصورة" @click="f.gallery.splice(i, 1)"><span class="i-lucide-trash-2 text-lg" /></button>
              </div>
            </div>
            <label class="btn-ghost cursor-pointer"><span class="i-lucide-images" />إضافة صور<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" class="sr-only" @change="addGallery" /></label>
          </div>
        </section>
        <section class="card p-5 space-y-4">
          <h2 class="font-extrabold">تحسين محركات البحث</h2>
          <div><label class="label">الرابط (slug)</label><input v-model="f.slug" class="input" placeholder="يُولَّد تلقائيًا" /></div>
          <div><label class="label">عنوان SEO <span class="text-brand-400">({{ f.seoTitle.length }}/70)</span></label><input v-model="f.seoTitle" maxlength="70" class="input" /></div>
          <div><label class="label">وصف SEO <span class="text-brand-400">({{ f.seoDescription.length }}/170)</span></label><textarea v-model="f.seoDescription" maxlength="170" rows="3" class="input" /></div>
        </section>
      </aside>
    </div>
  </form>
</template>
