<template>
  <div class="edit-page">
    <p class="edit-page__back">
      <NuxtLink to="/" class="edit-page__back-link">← к списку</NuxtLink>
    </p>

    <EmptyState v-if="missing">
      <template #title>Такой заметки нет</template>
      <template #text>Ссылка устарела или заметку уже удалили. Можно вернуться к списку.</template>
      <template #action>
        <BaseButton variant="pencil" @click="goHome">К списку</BaseButton>
      </template>
    </EmptyState>

    <template v-else>
      <p v-if="orphaned" class="edit-page__warn">
        Эту заметку удалили в другой вкладке. Можно сохранить как новую или уйти к списку.
      </p>

      <NoteEditor
        :title="working.title"
        :todos="working.todos"
        :pending-todo="pendingTodo"
        :title-error="titleError"
        :can-save="canSave"
        :can-undo="canUndo"
        :can-redo="canRedo"
        @update:title="onTitle"
        @title-blur="onTitleBlur"
        @update:pending-todo="onPendingTodo"
        @add-todo="addTodo"
        @remove-todo="removeTodo"
        @toggle-todo="toggleTodo"
        @update-todo-text="updateTodoText"
        @save="save"
        @cancel="cancelOpen = true"
        @remove="deleteOpen = true"
        @undo="undo"
        @redo="redo"
      />
      <p v-if="todoError" class="edit-page__error">{{ todoError }}</p>
    </template>

    <DraftRecoveryDialog
      v-model:open="draftOpen"
      :title="draftTitle"
      @restore="restoreDraft"
      @discard="discardDraft"
    />

    <ConfirmDialog
      v-model:open="cancelOpen"
      title="Отменить редактирование?"
      message="Несохранённые изменения пропадут из этой сессии. Черновик тоже сбросится."
      confirm-label="Отменить"
      @confirm="confirmCancel"
    />

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
const route = useRoute()
const router = useRouter()

const noteId = computed(() => {
  const param = route.params.id
  if (Array.isArray(param)) {
    return param[0] ?? 'new'
  }
  return param || 'new'
})

const {
  working,
  missing,
  orphaned,
  draftOpen,
  cancelOpen,
  deleteOpen,
  canUndo,
  canRedo,
  canSave,
  titleError,
  todoError,
  draftTitle,
  onTitle,
  onTitleBlur,
  pendingTodo,
  onPendingTodo,
  addTodo,
  removeTodo,
  toggleTodo,
  updateTodoText,
  undo,
  redo,
  save,
  confirmCancel,
  confirmDelete,
  restoreDraft,
  discardDraft,
} = useEditSession(noteId)

function goHome(): void {
  void router.push('/')
}

useHead({
  title: 'Редактирование',
})
</script>

<style scoped lang="scss">
.edit-page__back {
  margin-bottom: 0.7rem;
  font-size: 0.95rem;
}

.edit-page__back-link {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  color: var(--ink);
  text-underline-offset: 0.18em;
}

.edit-page__warn {
  margin-bottom: 0.9rem;
  color: var(--burgundy);
  max-width: 42ch;
}

.edit-page__error {
  margin-top: 0.6rem;
  color: var(--burgundy);
}
</style>
