/** Animates a number from 0 to `target` when it changes. */
export const useCountUp = (target: Ref<number> | ComputedRef<number>, ms = 900) => {
  const shown = ref(0)
  let raf = 0
  watch(target, (to) => {
    cancelAnimationFrame(raf)
    const from = shown.value, t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms)
      shown.value = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }, { immediate: true })
  onScopeDispose(() => cancelAnimationFrame(raf))
  return shown
}
