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

  async function upload(file: File): Promise<string> {
    const fd = new FormData(); fd.append('file', file)
    return (await api<{ url: string }>('/admin/uploads', { method: 'POST', body: fd })).url
  }
  return { api, upload }
}
