<script setup lang="ts">
const props = defineProps<{ points: { label: string; value: number }[]; unit?: string }>()
const W = 800, H = 250, PL = 34, PR = 8, PT = 16, PB = 28
const max = computed(() => { const m = Math.max(...props.points.map((p) => p.value), 0); return m <= 4 ? 4 : Math.ceil(m / 4) * 4 })
const xs = (i: number) => PL + (i * (W - PL - PR)) / Math.max(1, props.points.length - 1)
const ys = (v: number) => PT + (1 - v / max.value) * (H - PT - PB)
const pts = computed(() => props.points.map((p, i) => ({ x: xs(i), y: ys(p.value) })))

// monotone cubic interpolation (Fritsch–Carlson): smooth, never overshoots the data
const line = computed(() => {
  const p = pts.value
  const n = p.length
  if (n < 2) return ''
  const dx = (i: number) => p[i + 1]!.x - p[i]!.x
  const sl = Array.from({ length: n - 1 }, (_, i) => (p[i + 1]!.y - p[i]!.y) / dx(i))
  const m = Array.from({ length: n }, (_, i) => (i === 0 ? sl[0]! : i === n - 1 ? sl[n - 2]! : sl[i - 1]! * sl[i]! <= 0 ? 0 : (sl[i - 1]! + sl[i]!) / 2))
  for (let i = 0; i < n - 1; i++) {
    if (sl[i] === 0) { m[i] = 0; m[i + 1] = 0; continue }
    const a = m[i]! / sl[i]!, b = m[i + 1]! / sl[i]!, h = a * a + b * b
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * sl[i]!; m[i + 1] = t * b * sl[i]! }
  }
  let d = `M${p[0]!.x},${p[0]!.y}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx(i) / 3
    d += ` C${p[i]!.x + h},${p[i]!.y + m[i]! * h} ${p[i + 1]!.x - h},${p[i + 1]!.y - m[i + 1]! * h} ${p[i + 1]!.x},${p[i + 1]!.y}`
  }
  return d
})
const area = computed(() => (line.value ? `${line.value} L${PL + (W - PL - PR)},${H - PB} L${PL},${H - PB} Z` : ''))
const ticks = computed(() => [0, 1, 2, 3, 4].map((i) => ({ v: (max.value / 4) * i, y: ys((max.value / 4) * i) })))
const labelEvery = computed(() => Math.ceil(props.points.length / 6))

const hover = ref<number | null>(null)
const svg = ref<SVGSVGElement>()
function move(e: PointerEvent) {
  const r = svg.value!.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * W
  hover.value = Math.max(0, Math.min(props.points.length - 1, Math.round(((x - PL) / (W - PL - PR)) * (props.points.length - 1))))
}
const tip = computed(() => {
  const i = hover.value
  const p = i === null ? undefined : props.points[i], c = i === null ? undefined : pts.value[i]
  return p && c ? { ...p, x: c.x, y: c.y } : null
})
</script>

<template>
  <div class="relative" dir="ltr">
    <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="block h-auto w-full touch-none select-none" @pointermove="move" @pointerleave="hover = null">
      <defs>
        <linearGradient id="ac-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A56F4D" stop-opacity=".32" /><stop offset="1" stop-color="#A56F4D" stop-opacity="0" /></linearGradient>
      </defs>
      <g v-for="t in ticks" :key="t.v">
        <line :x1="PL" :x2="W - PR" :y1="t.y" :y2="t.y" stroke="#E8DCCB" stroke-dasharray="3 5" />
        <text :x="PL - 8" :y="t.y + 4" text-anchor="end" class="num" font-size="11" fill="#A56F4D">{{ Math.round(t.v) }}</text>
      </g>
      <path :d="area" fill="url(#ac-fill)" class="transition-opacity duration-700" />
      <path :d="line" fill="none" stroke="#5C3A28" stroke-width="2.25" stroke-linecap="round" pathLength="1" stroke-dasharray="1" style="animation: draw 1.4s cubic-bezier(.4,0,.2,1) both" />
      <g v-for="(p, i) in points" :key="p.label">
        <text v-if="i % labelEvery === 0" :x="xs(i)" :y="H - 8" text-anchor="middle" font-size="11" fill="#A56F4D" class="num">{{ p.label }}</text>
      </g>
      <g v-if="tip">
        <line :x1="tip.x" :x2="tip.x" :y1="PT" :y2="H - PB" stroke="#5C3A28" stroke-opacity=".35" />
        <circle :cx="tip.x" :cy="tip.y" r="5" fill="#fff" stroke="#5C3A28" stroke-width="2.5" />
      </g>
    </svg>
    <div v-if="tip" class="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-brand-950 px-2.5 py-1.5 text-xs text-white"
      :style="{ left: `${(tip.x / W) * 100}%`, top: `${(tip.y / H) * 100 - 3}%` }">
      <b class="num text-sm">{{ tip.value }}</b> {{ unit }} <span class="text-brand-300">· {{ tip.label }}</span>
    </div>
  </div>
</template>
