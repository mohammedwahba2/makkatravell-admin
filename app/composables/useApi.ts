type Opts = { method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; body?: unknown; query?: Record<string, unknown> }

export const errMsg = (e: unknown): string => {
  const d = (e as { data?: { message?: string | string[] } })?.data?.message
  return Array.isArray(d) ? d.join('، ') : d || 'حدث خطأ غير متوقع'
}

let refreshing: Promise<boolean> | null = null

export const useApi = () => {
  const base = useRuntimeConfig().public.apiBase
  const auth = useAuth()

  const tryRefresh = async () => {
    if (!auth.tokens.value) return false
    refreshing ??= $fetch<{ accessToken: string; refreshToken: string; user: AuthUser }>(`${base}/auth/refresh`, {
      method: 'POST', body: { refreshToken: auth.tokens.value.refreshToken },
    }).then((r) => { auth.save(r); return true }).catch(() => false).finally(() => { refreshing = null })
    return refreshing
  }

  async function api<T = any>(path: string, o: Opts = {}, retry = true): Promise<T> {
    try {
      return await $fetch<T>(`${base}${path}`, {
        method: o.method ?? 'GET', body: o.body as never, query: o.query as never,
        headers: auth.tokens.value ? { Authorization: `Bearer ${auth.tokens.value.accessToken}` } : undefined,
      })
    } catch (e: any) {
      if (e?.statusCode === 401 && retry && (await tryRefresh())) return api<T>(path, o, false)
      if (e?.statusCode === 401) { auth.clear(); await navigateTo('/login') }
      throw e
    }
  }

  // Phones produce 5–10 MB photos; Vercel rejects bodies > 4.5 MB, so downscale + re-encode first.
  async function compress(file: File): Promise<File> {
    if (!file.type.startsWith('image/') || file.size < 600_000) return file
    try {
      const bmp = await createImageBitmap(file)
      const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
      const c = document.createElement('canvas')
      c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
      c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
      const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/webp', 0.85))
      return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' }) : file
    } catch { return file }
  }

  /** Authenticated file download (CSV exports): reads the filename from Content-Disposition. */
  async function download(path: string, query?: Record<string, unknown>, retry = true): Promise<void> {
    try {
      const r = await $fetch.raw<Blob>(`${base}${path}`, { query: query as never, responseType: 'blob',
        headers: auth.tokens.value ? { Authorization: `Bearer ${auth.tokens.value.accessToken}` } : undefined })
      const m = /filename\*=UTF-8''([^;]+)/i.exec(r.headers.get('content-disposition') ?? '')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(r._data as Blob); a.download = m ? decodeURIComponent(m[1]!) : 'export.csv'
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    } catch (e: any) {
      if (e?.statusCode === 401 && retry && (await tryRefresh())) return download(path, query, false)
      if (e?.statusCode === 401) { auth.clear(); await navigateTo('/login') }
      throw e
    }
  }

  /** Authenticated binary fetch (private documents): returns a Blob the caller can open in a new tab. */
  async function blob(path: string, retry = true): Promise<Blob> {
    try {
      return await $fetch<Blob>(`${base}${path}`, { responseType: 'blob', headers: auth.tokens.value ? { Authorization: `Bearer ${auth.tokens.value.accessToken}` } : undefined })
    } catch (e: any) {
      if (e?.statusCode === 401 && retry && (await tryRefresh())) return blob(path, false)
      throw e
    }
  }

  async function upload(input: File): Promise<string> {
    const file = await compress(input)
    const fd = new FormData(); fd.append('file', file)
    return (await api<{ url: string }>('/admin/uploads', { method: 'POST', body: fd })).url
  }
  return { api, upload, download, blob, compress }
}
