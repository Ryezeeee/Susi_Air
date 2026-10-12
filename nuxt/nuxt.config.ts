// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  // Authenticated, mobile-first operations tool: no SEO need, and a pure SPA
  // keeps the token on the client only and deploys as static files.
  ssr: false,

  modules: ['@pinia/nuxt'],
  css: ['~/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: { additionalData: '@use "~/assets/scss/tokens" as *;\n' },
      },
    },
  },

  runtimeConfig: {
    public: {
      // Override with NUXT_PUBLIC_API_BASE / NUXT_PUBLIC_APP_TODAY at build time.
      apiBase: 'http://localhost:3001',
      appToday: '2026-05-15',
    },
  },

  app: {
    head: {
      title: 'Susi Air Pilot',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0E2138' },
        { name: 'description', content: 'Susi Air Pilot App: schedule, flight hours and duty limits.' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/susi-air-logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  typescript: { strict: true },
});
