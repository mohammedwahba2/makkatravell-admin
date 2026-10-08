import { defineConfig, presetWind4, presetIcons, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [presetWind4(), presetIcons({ scale: 1.15, extraProperties: { 'vertical-align': 'middle', display: 'inline-block' } })],
  transformers: [transformerDirectives()],
  theme: {
    font: { sans: 'Cairo, system-ui, sans-serif' },
    colors: {
      brand: { 50: '#FBF8F3', 100: '#F5EFE7', 200: '#E8DCCB', 300: '#D9B79A', 400: '#C98F68', 500: '#A56F4D', 600: '#85573B', 700: '#5C3A28', 800: '#472C1F', 900: '#3B2418', ink: '#241811' },
    },
  },
  shortcuts: {
    card: 'bg-white rounded-2xl border border-brand-200/70 shadow-[0_1px_2px_rgb(59_36_24/0.04)]',
    btn: 'inline-flex items-center justify-center gap-2 rounded-xl px-4 h-10 text-sm font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
    'btn-primary': 'btn bg-brand-700 text-white hover:bg-brand-800',
    'btn-ghost': 'btn bg-transparent text-brand-700 border border-brand-200 hover:bg-brand-100',
    'btn-danger': 'btn bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
    input: 'w-full h-10 rounded-xl border border-brand-200 bg-white px-3 text-sm text-brand-ink placeholder:text-brand-400/70 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-400/20',
    label: 'block text-xs font-semibold text-brand-700 mb-1.5',
  },
})
