export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxt/test-utils/module',
  ],
  css: ['~/assets/styles/main.scss'],
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Заметки',
      meta: [
        { name: 'description', content: 'Тетрадь заметок со списками дел' },
        { name: 'theme-color', content: '#e8d5a8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap',
        },
      ],
    },
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
