export interface ConfirmOptions { title: string; description?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean }
interface State extends Required<Omit<ConfirmOptions, 'description'>> { open: boolean; description: string }

const defaults = (): Omit<State, 'open'> => ({ title: '', description: '', confirmLabel: 'تأكيد', cancelLabel: 'إلغاء', danger: false })
let resolver: ((v: boolean) => void) | null = null

export const useConfirmState = () => {
  const state = useState<State>('confirm-dialog', () => ({ open: false, ...defaults() }))
  const resolve = (v: boolean) => { state.value.open = false; resolver?.(v); resolver = null }
  return { state, resolve }
}

/** Promise-based replacement for window.confirm — renders a styled modal. */
export const useConfirm = () => {
  const { state } = useConfirmState()
  const ask = (o: ConfirmOptions) => new Promise<boolean>((res) => {
    resolver?.(false)
    resolver = res
    Object.assign(state.value, defaults(), o, { open: true })
  })
  return { ask }
}
