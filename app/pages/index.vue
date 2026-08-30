<template>
  <div class="home">
    <div class="home__toolbar">
      <BaseButton @click="goCreate">Новая заметка</BaseButton>
    </div>

    <EmptyState v-if="store.notes.length === 0">
      <template #title>Страницы ещё чистые</template>
      <template #text>Создайте первую заметку — она останется в тетради после сохранения.</template>
      <template #action>
        <BaseButton @click="goCreate">Новая заметка</BaseButton>
      </template>
    </EmptyState>

    <div v-else class="home__cards">
      <NoteCard
        v-for="note in store.notes"
        :key="note.id"
        :note="note"
        @edit="goEdit"
        @remove="askDelete"
      />
    </div>

    <ConfirmDialog
      v-model:open="deleteOpen"
      title="Удалить заметку?"
      message="Заметка исчезнет из тетради. Это нельзя отменить."
      confirm-label="Удалить"
      danger
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
const store = useNotesStore()
const router = useRouter()
const deleteOpen = ref(false)
const pendingId = ref<string | null>(null)

function goCreate(): void {
  void router.push('/notes/new')
}

function goEdit(id: string): void {
  void router.push(`/notes/${id}`)
}

function askDelete(id: string): void {
  pendingId.value = id
  deleteOpen.value = true
}

function confirmDelete(): void {
  if (pendingId.value) {
    store.deleteNote(pendingId.value)
  }
  pendingId.value = null
}

useHead({
  title: 'Заметки',
})
</script>

<style scoped lang="scss">
.home__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  margin-bottom: 1.1rem;
}

.home__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
  gap: 1rem;
}

.home__cards :deep(.note-card:nth-child(even)) {
  transform: rotate(0.8deg);
}

@media (prefers-reduced-motion: reduce) {
  .home__cards :deep(.note-card:nth-child(even)) {
    transform: none;
  }
}
</style>
