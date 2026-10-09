export const PACKAGE_TYPES: Record<string, string> = { HAJJ: 'حج', UMRAH: 'عمرة', RELIGIOUS_TOUR: 'سياحة دينية', INTERNATIONAL: 'سياحة خارجية', DOMESTIC: 'سياحة داخلية' }
export const BOOKING_STATUS: Record<string, string> = { PENDING: 'قيد المراجعة', CONFIRMED: 'مؤكد', CANCELLED: 'ملغي', COMPLETED: 'مكتمل' }
export const PAYMENT_STATUS: Record<string, string> = { UNPAID: 'غير مدفوع', PARTIAL: 'مدفوع جزئيًا', PAID: 'مدفوع', REFUNDED: 'مسترد' }
export const INQUIRY_STATUS: Record<string, string> = { NEW: 'جديد', IN_PROGRESS: 'قيد المتابعة', DONE: 'تم' }
export const ROOM_TYPES: Record<string, string> = { DOUBLE: 'ثنائية', TRIPLE: 'ثلاثية', QUAD: 'رباعية' }
export const money = (n: number | string) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n)) + ' ج.م'
export const fdate = (d: string | Date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
export const fdatetime = (d: string | Date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(d))
export const fnum = (n: number | string) => new Intl.NumberFormat('en-US').format(Number(n))
export const hijri = (d: Date = new Date()) => new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
export const greg = (d: Date = new Date()) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)

export const PAY_METHODS: Record<string, string> = { CASH: 'نقدًا', BANK_TRANSFER: 'تحويل بنكي', INSTAPAY: 'إنستا باي', WALLET: 'محفظة إلكترونية', CARD: 'بطاقة', REFUND: 'استرداد', OTHER: 'أخرى' }
export const DOC_KINDS: Record<string, string> = { PASSPORT: 'جواز سفر', PHOTO: 'صورة شخصية', ID: 'بطاقة هوية', OTHER: 'مستند آخر' }
export const AUDIT_ENTITIES: Record<string, string> = { bookings: 'الحجوزات', packages: 'البرامج', posts: 'المدونة', users: 'المستخدمون', settings: 'الإعدادات', documents: 'المستندات', auth: 'الدخول', faqs: 'الأسئلة', testimonials: 'الآراء', inquiries: 'الرسائل' }
export const fsize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)
export const dateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : '')
