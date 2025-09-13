import * as icons from '@maxtan/ez-ui-icons'

export default defineNuxtPlugin((nuxtApp) => {
  for (const [key, component] of Object.entries(icons)) {
    nuxtApp.vueApp.component(key, component)
  }
})
