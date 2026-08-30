<template>
  <div class="todo-list">
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :text="todo.text"
      :completed="todo.completed"
      @toggle="emit('toggle', todo.id)"
      @remove="emit('remove', todo.id)"
      @update:text="emit('updateText', todo.id, $event)"
    />

    <div class="todo-list__add">
      <input
        v-model="draft"
        class="todo-list__field"
        type="text"
        placeholder="Новый пункт"
        aria-label="Текст нового пункта"
        @keydown.enter.prevent="add"
      >
      <BaseButton type="button" variant="pencil" @click="add">Добавить</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/note'

const props = withDefaults(defineProps<{
  todos: Todo[]
  pendingTodo?: string
}>(), {
  pendingTodo: '',
})

const emit = defineEmits<{
  add: [text: string]
  remove: [id: string]
  toggle: [id: string]
  updateText: [id: string, text: string]
  'update:pendingTodo': [value: string]
}>()

const draft = computed({
  get: () => props.pendingTodo ?? '',
  set: (value: string) => emit('update:pendingTodo', value),
})

function add(): void {
  const text = draft.value.trim()
  if (!text) {
    return
  }
  emit('add', text)
  draft.value = ''
}
</script>

<style scoped lang="scss">
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.todo-list__add {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.todo-list__field {
  flex: 1 1 12rem;
  min-width: 0;
  padding: 0.35rem 0.2rem;
  border: none;
  border-bottom: 1px dashed var(--line);
  background: transparent;

  &:focus {
    outline: none;
    border-bottom-color: var(--ink);
  }
}
</style>
