// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: ['@pinia/nuxt'],
  app: {
    head: {
      link: [
        {'rel': 'stylesheet', 'href': 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css'}
      ]
    }
  },
  devtools: { enabled: true }
})
