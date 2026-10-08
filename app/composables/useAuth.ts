export interface AuthUser { id: string; name: string; email: string; role: string }
const KEY = 'mk_admin_auth'

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const tokens = useState<{ accessToken: string; refreshToken: string } | null>('auth-tokens', () => null)

  const load = () => {
    if (tokens.value || !import.meta.client) return
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) { const d = JSON.parse(raw); tokens.value = d.tokens; user.value = d.user }
    } catch { /* corrupted storage: treat as logged out */ }
  }
  const save = (d: { accessToken: string; refreshToken: string; user: AuthUser }) => {
    tokens.value = { accessToken: d.accessToken, refreshToken: d.refreshToken }
    user.value = d.user
    try { localStorage.setItem(KEY, JSON.stringify({ tokens: tokens.value, user: d.user })) } catch { /* private mode */ }
  }
  const clear = () => {
    tokens.value = null; user.value = null
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  }
  const isLoggedIn = computed(() => !!tokens.value)
  return { user, tokens, load, save, clear, isLoggedIn }
}
