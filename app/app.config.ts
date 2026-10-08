export default defineAppConfig({
  ui: {
    colors: { primary: 'brand', neutral: 'stone', success: 'emerald', warning: 'amber', error: 'red', info: 'sky' },
    button: { slots: { base: 'font-semibold' } },
    card: { slots: { root: 'rounded-2xl ring-brand-200/70' } },
  },
})
