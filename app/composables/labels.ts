export const PACKAGE_TYPES: Record<string, string> = { HAJJ: 'حج', UMRAH: 'عمرة', RELIGIOUS_TOUR: 'سياحة دينية', INTERNATIONAL: 'سياحة خارجية', DOMESTIC: 'سياحة داخلية' }
export const BOOKING_STATUS: Record<string, string> = { PENDING: 'قيد المراجعة', CONFIRMED: 'مؤكد', CANCELLED: 'ملغي', COMPLETED: 'مكتمل' }
export const PAYMENT_STATUS: Record<string, string> = { UNPAID: 'غير مدفوع', PARTIAL: 'مدفوع جزئيًا', PAID: 'مدفوع', REFUNDED: 'مسترد' }
export const INQUIRY_STATUS: Record<string, string> = { NEW: 'جديد', IN_PROGRESS: 'قيد المتابعة', DONE: 'تم' }
export const ROOM_TYPES: Record<string, string> = { DOUBLE: 'ثنائية', TRIPLE: 'ثلاثية', QUAD: 'رباعية' }
export const money = (n: number | string) => new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(Number(n)) + ' ج.م'
export const fdate = (d: string | Date) => new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(d))
export const fdatetime = (d: string | Date) => new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d))
