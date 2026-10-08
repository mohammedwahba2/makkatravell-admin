export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@unocss/nuxt'],
  css: ['~/assets/main.css'],
  runtimeConfig: { public: { apiBase: 'http://localhost:4000/api' } },
  app: {
    head: {
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      title: 'لوحة تحكم مكة للسياحة',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }, { name: 'robots', content: 'noindex, nofollow' }],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },
})
