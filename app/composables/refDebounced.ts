export function refDebounced<T>(source: Ref<T>, ms = 300): Ref<T> {
  const out = ref(source.value) as Ref<T>
  let t: ReturnType<typeof setTimeout>
  watch(source, (v) => { clearTimeout(t); t = setTimeout(() => { out.value = v }, ms) })
  onScopeDispose(() => clearTimeout(t))
  return out
}
