<template>
  <ul class="preview-list">
    <li
      v-for="todo in visible"
      :key="todo.id"
      class="preview-list__item"
    >
      <TodoItem
        :text="todo.text"
        :completed="todo.completed"
        preview
      />
    </li>
    <li v-if="hiddenCount > 0" class="preview-list__more">
      ещё {{ hiddenCount }}
    </li>
    <li v-if="todos.length === 0" class="preview-list__empty">
      Пунктов пока нет
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/note'

const props = withDefaults(defineProps<{
  todos: Todo[]
  limit?: number
}>(), {
  limit: 3,
})

const visible = computed(() => props.todos.slice(0, props.limit))
const hiddenCount = computed(() => Math.max(0, props.todos.length - props.limit))
</script>

<style scoped lang="scss">
.preview-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.preview-list__more,
.preview-list__empty {
  color: var(--muted);
  font-family: var(--font-hand);
  font-size: 1.15rem;
}
</style>
