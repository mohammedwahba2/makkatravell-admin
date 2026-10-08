export interface Toast { id: number; text: string; type: 'ok' | 'err' }
export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])
  const push = (text: string, type: Toast['type']) => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, text, type })
    setTimeout(() => { toasts.value = toasts.value.filter((t) => t.id !== id) }, 3800)
  }
  return { toasts, ok: (t: string) => push(t, 'ok'), err: (t: string) => push(t, 'err') }
}
