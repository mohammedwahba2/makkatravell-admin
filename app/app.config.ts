export default defineAppConfig({
  ui: {
    colors: { primary: 'brand', neutral: 'stone', success: 'emerald', warning: 'amber', error: 'red', info: 'sky' },
    button: { slots: { base: 'font-semibold' } },
    card: { slots: { root: 'rounded-[10px] ring-0 shadow-[0_1px_2px_rgb(59_36_24/.05),0_10px_28px_-16px_rgb(59_36_24/.14)]', header: 'border-b-0 pb-0', footer: 'border-t-0' } },
  },
})
