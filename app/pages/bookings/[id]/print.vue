<script setup lang="ts">
definePageMeta({ layout: 'blank' })
const { api } = useApi()
const id = useRoute().params.id as string
const { data } = await useAsyncData(`print-${id}`, async () => {
  const [b, s] = await Promise.all([api(`/admin/bookings/${id}`), api('/settings').catch(() => ({}))])
  return { b, site: (s as any).site ?? {} }
}, { server: false })
const b = computed(() => data.value?.b)
const site = computed(() => data.value?.site ?? {})
useHead({ title: computed(() => (b.value ? `إيصال ${b.value.reference}` : 'إيصال')), meta: [{ name: 'robots', content: 'noindex' }] })
const remaining = computed(() => (b.value ? Math.max(0, Number(b.value.totalPrice) - Number(b.value.paidAmount)) : 0))
const doPrint = () => window.print()
const today = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { dateStyle: 'long' }).format(new Date())
</script>

<template>
  <div v-if="b" class="sheet-wrap">
    <div class="no-print toolbar"><UButton icon="i-lucide-printer" @click="doPrint">طباعة / حفظ PDF</UButton><UButton color="neutral" variant="outline" :to="`/bookings/${id}`">رجوع للحجز</UButton><span class="hint">من نافذة الطباعة اختر «حفظ كملف PDF».</span></div>
    <article class="sheet">
      <header class="head">
        <div class="brand"><img src="/logo-mark.png" alt="" /><div><h1>مكة للسياحة</h1><p>{{ site.address }}</p><p dir="ltr" class="num">{{ site.phone }}</p><p v-if="site.licenseNumber">{{ site.licenseAuthority || 'رقم الترخيص' }}: <b class="num">{{ site.licenseNumber }}</b></p></div></div>
        <div class="meta"><h2>تأكيد حجز وإيصال</h2><p>رقم الحجز: <b class="num" dir="ltr">{{ b.reference }}</b></p><p>التاريخ: {{ today }}</p><p>الحالة: <b>{{ BOOKING_STATUS[b.status] }}</b></p></div>
      </header>

      <section><h3>بيانات العميل</h3>
        <table class="kv"><tbody><tr><th>الاسم</th><td>{{ b.fullName }}</td><th>الهاتف</th><td class="num" dir="ltr">{{ b.phone }}</td></tr><tr v-if="b.email || b.nationalId"><th>البريد</th><td dir="ltr">{{ b.email || '—' }}</td><th>الرقم القومي</th><td class="num">{{ b.nationalId || '—' }}</td></tr></tbody></table></section>

      <section><h3>تفاصيل الرحلة</h3>
        <table class="kv"><tbody><tr><th>البرنامج</th><td>{{ b.package.title }}</td><th>المدة</th><td>{{ b.package.durationDays }} يوم</td></tr>
          <tr><th>موعد السفر</th><td>{{ b.departure ? fdate(b.departure.date) : 'يُحدد لاحقًا' }}</td><th>الغرفة</th><td>{{ ROOM_TYPES[b.roomType] }}</td></tr>
          <tr><th>الأفراد</th><td>{{ b.adults }} بالغ<span v-if="b.children"> + {{ b.children }} طفل</span></td><th>الانطلاق من</th><td>{{ b.package.departureCity }}</td></tr></tbody></table></section>

      <section v-if="b.passengers.length"><h3>المسافرون</h3>
        <table class="grid"><thead><tr><th>#</th><th>الاسم</th><th>رقم الجواز</th><th>انتهاء الجواز</th><th>الجنسية</th></tr></thead>
          <tbody><tr v-for="(p, i) in b.passengers" :key="p.id"><td class="num">{{ Number(i) + 1 }}</td><td>{{ p.fullName }}</td><td class="num" dir="ltr">{{ p.passportNo || '—' }}</td><td class="num">{{ p.passportExpiry ? fdate(p.passportExpiry) : '—' }}</td><td>{{ p.nationality || '—' }}</td></tr></tbody></table></section>

      <section><h3>الحساب</h3>
        <table class="grid"><thead><tr><th>التاريخ</th><th>طريقة الدفع</th><th>المرجع</th><th class="end">المبلغ (ج.م)</th></tr></thead>
          <tbody><tr v-for="p in ([...b.payments] as any[]).reverse()" :key="p.id"><td class="num">{{ fdate(p.paidAt) }}</td><td>{{ PAY_METHODS[p.method] ?? p.method }}</td><td class="num" dir="ltr">{{ p.reference || '—' }}</td><td class="num end">{{ fnum(p.amount) }}</td></tr>
            <tr v-if="!b.payments.length"><td colspan="4" class="muted">لا توجد دفعات مسجّلة</td></tr></tbody></table>
        <div class="totals"><p><span>إجمالي قيمة الحجز</span><b class="num">{{ fnum(b.totalPrice) }} ج.م</b></p><p><span>المدفوع</span><b class="num">{{ fnum(b.paidAmount) }} ج.م</b></p><p class="due"><span>المتبقي</span><b class="num">{{ fnum(remaining) }} ج.م</b></p></div></section>

      <section class="terms"><h3>ملاحظات هامة</h3><ul>
        <li>هذا المستند يخضع للشروط والأحكام وسياسة الإلغاء والاسترداد المنشورة على makkatravell.com.</li>
        <li>على المسافر تقديم مستندات صحيحة وسارية، وقرار التأشيرة للجهات الرسمية.</li>
        <li>تُؤكَّد التفاصيل النهائية للرحلة كتابيًا قبل السفر.</li></ul></section>

      <footer class="sign"><div><p>توقيع العميل</p><span /></div><div><p>توقيع واختم الشركة</p><span /></div></footer>
    </article>
  </div>
</template>

<style>
.sheet-wrap { background: #E8DCCB; min-height: 100vh; padding: 20px; }
.toolbar { max-width: 210mm; margin: 0 auto 14px; display: flex; gap: 10px; align-items: center; }
.toolbar .hint { color: #5C3A28; font-size: 13px; }
.sheet { background: #fff; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 14mm 15mm; color: #241811; font-size: 13px; line-height: 1.7; }
.sheet .head { display: flex; justify-content: space-between; gap: 20px; border-bottom: 2px solid #3B2418; padding-bottom: 12px; }
.sheet .brand { display: flex; gap: 12px; align-items: flex-start; } .sheet .brand img { width: 54px; height: 54px; object-fit: contain; }
.sheet h1 { font-size: 22px; font-weight: 800; margin: 0; color: #3B2418; } .sheet .brand p { margin: 0; color: #5C3A28; font-size: 12px; }
.sheet .meta { text-align: end; } .sheet .meta h2 { margin: 0 0 4px; font-size: 18px; font-weight: 800; } .sheet .meta p { margin: 0; }
.sheet section { margin-top: 16px; } .sheet h3 { margin: 0 0 6px; font-size: 14px; font-weight: 800; color: #85573B; border-bottom: 1px solid #E8DCCB; padding-bottom: 3px; }
.sheet table { width: 100%; border-collapse: collapse; } .sheet .kv th { width: 16%; text-align: start; color: #85573B; font-weight: 600; padding: 4px 0; } .sheet .kv td { padding: 4px 0; font-weight: 600; }
.sheet .grid th { background: #F5EFE7; padding: 6px 8px; text-align: start; font-size: 12px; } .sheet .grid td { border-bottom: 1px solid #E8DCCB; padding: 6px 8px; }
.sheet .end { text-align: end; } .sheet .muted { color: #A56F4D; text-align: center; }
.sheet .totals { margin-top: 10px; margin-inline-start: auto; width: 60%; } .sheet .totals p { display: flex; justify-content: space-between; margin: 0; padding: 4px 8px; border-bottom: 1px solid #E8DCCB; }
.sheet .totals .due { background: #3B2418; color: #fff; font-size: 15px; border: 0; }
.sheet .terms ul { margin: 0; padding-inline-start: 18px; color: #3B2418; font-size: 12px; }
.sheet .sign { display: flex; justify-content: space-between; gap: 40px; margin-top: 36px; } .sheet .sign div { flex: 1; text-align: center; } .sheet .sign span { display: block; border-bottom: 1px solid #241811; height: 46px; } .sheet .sign p { margin: 0 0 4px; font-weight: 700; font-size: 12px; }
@media print { .no-print { display: none !important; } .sheet-wrap { background: #fff; padding: 0; } .sheet { width: auto; min-height: 0; padding: 0; } @page { size: A4; margin: 12mm; } }
</style>
