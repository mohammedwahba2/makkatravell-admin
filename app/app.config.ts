export default defineAppConfig({
  ui: {
    colors: { primary: 'brand', neutral: 'stone', success: 'emerald', warning: 'amber', error: 'red', info: 'sky' },
    button: { slots: { base: 'font-semibold' } },
    card: { slots: { root: 'rounded-[10px] ring-0', header: 'border-b-0 pb-0', footer: 'border-t-0' } },
  },
})
