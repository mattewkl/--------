<template>
  <div class="note-editor">
    <EditorToolbar
      :can-undo="canUndo"
      :can-redo="canRedo"
      :can-save="canSave"
      @save="emit('save')"
      @cancel="emit('cancel')"
      @remove="emit('remove')"
      @undo="emit('undo')"
      @redo="emit('redo')"
    />

    <label class="note-editor__title">
      <span class="note-editor__label">Название</span>
      <input
        class="note-editor__field"
        type="text"
        :value="title"
        :aria-invalid="Boolean(titleError)"
        :aria-describedby="titleError ? 'note-title-error' : undefined"
        @input="emit('update:title', ($event.target as HTMLInputElement).value)"
      >
    </label>
    <p
      v-if="titleError"
      id="note-title-error"
      class="note-editor__error"
    >
      {{ titleError }}
    </p>

    <p class="note-editor__label">Пункты</p>
    <TodoList
      :todos="todos"
      @add="emit('addTodo', $event)"
      @remove="emit('removeTodo', $event)"
      @toggle="emit('toggleTodo', $event)"
      @update-text="(id, text) => emit('updateTodoText', id, text)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/note'

withDefaults(defineProps<{
  title: string
  todos: Todo[]
  titleError?: string
  canUndo?: boolean
  canRedo?: boolean
  canSave?: boolean
}>(), {
  titleError: '',
  canUndo: false,
  canRedo: false,
  canSave: true,
})

const emit = defineEmits<{
  save: []
  cancel: []
  remove: []
  undo: []
  redo: []
  'update:title': [value: string]
  addTodo: [text: string]
  removeTodo: [id: string]
  toggleTodo: [id: string]
  updateTodoText: [id: string, text: string]
}>()
</script>

<style scoped lang="scss">
.note-editor {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.note-editor__label {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--margin);
  font-family: var(--font-hand);
  font-size: 1.2rem;
}

.note-editor__field {
  width: 100%;
  padding: 0.2rem 0.1rem 0.35rem;
  overflow-wrap: anywhere;
  border: none;
  border-bottom: 1.5px solid var(--ink-soft);
  background: transparent;
  font-family: var(--font-hand);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--ink);

  &:focus {
    outline: none;
    border-bottom-style: dashed;
  }
}

.note-editor__error {
  color: var(--burgundy);
  font-size: 0.95rem;
}
</style>
