export const useNotify = () => {
  const toast = useToast()
  return {
    ok: (title: string) => toast.add({ title, color: 'success', icon: 'i-lucide-circle-check', duration: 3500 }),
    err: (title: string) => toast.add({ title, color: 'error', icon: 'i-lucide-circle-alert', duration: 5000 }),
  }
}
