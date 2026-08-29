<template>
  <article class="note-card">
    <h3 class="note-card__title">{{ note.title }}</h3>
    <NotePreviewList :todos="note.todos" />
    <div class="note-card__actions">
      <BaseButton variant="pencil" @click="emit('edit', note.id)">
        Изменить
      </BaseButton>
      <BaseButton variant="danger" @click="emit('remove', note.id)">
        Удалить
      </BaseButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Note } from '~/types/note'

defineProps<{
  note: Note
}>()

const emit = defineEmits<{
  edit: [id: string]
  remove: [id: string]
}>()
</script>

<style scoped lang="scss">
.note-card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.9rem 1rem 1rem;
  background: var(--sticker);
  border: 1.5px solid #d2c19a;
  box-shadow: 3px 4px 0 rgba(43, 36, 28, 0.1);
  transform: rotate(-0.5deg);
}

.note-card__title {
  overflow-wrap: anywhere;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1.1;
}

.note-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: auto;
}

@media (prefers-reduced-motion: reduce) {
  .note-card {
    transform: none;
  }
}
</style>
