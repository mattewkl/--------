import { useNotesStore } from '../stores/notes'

export default defineNuxtPlugin(() => {
  const store = useNotesStore()
  store.hydrate({ storage: window.localStorage })

  window.addEventListener('storage', (event) => {
    store.handleStorageEvent({ key: event.key })
  })
})
