export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  colorMode: { preference: 'light', fallback: 'light' },
  spaLoadingTemplate: true,
  runtimeConfig: { public: { apiBase: 'https://api.makkatravell.com/api' } },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      title: 'لوحة تحكم مكة للسياحة',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }, { name: 'robots', content: 'noindex, nofollow' }, { name: 'theme-color', content: '#5C3A28' }],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap' },
      ],
    },
  },
})
