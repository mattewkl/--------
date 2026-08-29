<template>
  <div class="ui-page">
    <p class="ui-page__back">
      <NuxtLink to="/">← к заметкам</NuxtLink>
    </p>

    <h2 class="ui-page__heading">Каталог UI</h2>
    <p class="ui-page__lead">Все переиспользуемые компоненты. Модалки проверяйте только с клавиатуры: Tab, Shift+Tab, Escape.</p>
    <p v-if="lastAction" class="ui-section__note">Последнее действие: {{ lastAction }}</p>

    <section class="ui-section" aria-labelledby="ui-header">
      <h3 id="ui-header" class="ui-section__title">AppHeader</h3>
      <div class="ui-section__demo">
        <AppHeader>
          Пример заголовка
          <template #actions>
            <BaseButton variant="pencil">Действие</BaseButton>
          </template>
        </AppHeader>
      </div>
    </section>

    <section class="ui-section" aria-labelledby="ui-buttons">
      <h3 id="ui-buttons" class="ui-section__title">BaseButton</h3>
      <div class="ui-section__row">
        <BaseButton>Чернила</BaseButton>
        <BaseButton variant="pencil">Карандаш</BaseButton>
        <BaseButton variant="danger">Удалить</BaseButton>
        <BaseButton variant="ghost">Отмена</BaseButton>
        <BaseButton disabled>Нельзя</BaseButton>
      </div>
    </section>

    <section class="ui-section" aria-labelledby="ui-icons">
      <h3 id="ui-icons" class="ui-section__title">IconButton</h3>
      <div class="ui-section__row">
        <IconButton label="Добавить пункт">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.8"
              d="M12 5v14M5 12h14"
            />
          </svg>
        </IconButton>
        <IconButton label="Удалить" variant="danger">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M5 7h14M10 7V5h4v2m-7 0v12h10V7"
            />
          </svg>
        </IconButton>
        <IconButton label="Недоступно" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.8"
              d="M5 12h14"
            />
          </svg>
        </IconButton>
      </div>
    </section>

    <section class="ui-section" aria-labelledby="ui-empty">
      <h3 id="ui-empty" class="ui-section__title">EmptyState</h3>
      <EmptyState>
        <template #title>Пустой лист</template>
        <template #text>Слот текста и слот действия.</template>
        <template #action>
          <BaseButton>Что-нибудь сделать</BaseButton>
        </template>
      </EmptyState>
    </section>

    <section class="ui-section" aria-labelledby="ui-modals">
      <h3 id="ui-modals" class="ui-section__title">BaseModal и ConfirmDialog</h3>
      <div class="ui-section__row">
        <BaseButton variant="pencil" @click="modalOpen = true">
          Открыть модалку
        </BaseButton>
        <BaseButton variant="danger" @click="confirmOpen = true">
          Открыть подтверждение
        </BaseButton>
      </div>
    </section>

    <BaseModal v-model:open="modalOpen" title="Листок поверх тетради">
      <p>Tab ходит только внутри окна. Escape и клик по полю закрывают его. Фокус вернётся на кнопку.</p>
      <template #footer>
        <BaseButton variant="ghost" @click="modalOpen = false">Закрыть</BaseButton>
        <BaseButton @click="modalOpen = false">Понятно</BaseButton>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Удалить черновик?"
      message="Это учебный диалог. Подтверждение без alert()."
      confirm-label="Удалить"
      danger
      @confirm="lastAction = 'подтвердили'"
      @cancel="lastAction = 'отменили'"
    />

    <section class="ui-section" aria-labelledby="ui-cards">
      <h3 id="ui-cards" class="ui-section__title">NoteCard и превью Todo</h3>
      <p class="ui-section__note">Чекбоксы в превью только для вида, отметить нельзя. Четвёртый пункт скрыт за «ещё».</p>
      <div class="ui-cards">
        <NoteCard
          v-for="note in MOCK_NOTES"
          :key="note.id"
          :note="note"
          @edit="lastAction = `изменить ${$event}`"
          @remove="lastAction = `удалить ${$event}`"
        />
      </div>
    </section>

    <section class="ui-section" aria-labelledby="ui-editor">
      <h3 id="ui-editor" class="ui-section__title">NoteEditor</h3>
      <p class="ui-section__note">Локальный mock: без сохранения и без настоящей истории. Undo/Redo здесь для вида кнопок.</p>
      <NoteEditor
        :title="editor.title"
        :todos="editor.todos"
        :title-error="titleError"
        :can-save="canSave"
        :can-undo="true"
        :can-redo="false"
        @update:title="editor.title = $event"
        @add-todo="addTodo"
        @remove-todo="removeTodo"
        @toggle-todo="toggleTodo"
        @update-todo-text="updateTodoText"
        @save="lastAction = 'сохранить (mock)'"
        @cancel="lastAction = 'отменить редактирование (mock)'"
        @remove="lastAction = 'удалить заметку (mock)'"
        @undo="lastAction = 'undo (mock)'"
        @redo="lastAction = 'redo (mock)'"
      />
    </section>

    <section class="ui-section" aria-labelledby="ui-draft">
      <h3 id="ui-draft" class="ui-section__title">DraftRecoveryDialog</h3>
      <BaseButton variant="pencil" @click="draftOpen = true">
        Показать восстановление черновика
      </BaseButton>
    </section>

    <DraftRecoveryDialog
      v-model:open="draftOpen"
      @restore="lastAction = 'восстановить черновик'"
      @discard="lastAction = 'отказаться от черновика'"
    />
  </div>
</template>

<script setup lang="ts">
import { MOCK_NOTES } from '~/mocks/notes'
import type { Note } from '~/types/note'

useHead({
  title: 'Каталог UI',
})

const modalOpen = ref(false)
const confirmOpen = ref(false)
const draftOpen = ref(false)
const lastAction = ref('')

const editor = reactive<Note>(structuredClone(MOCK_NOTES[0] as Note))
const titleError = computed(() => {
  return editor.title.trim() ? '' : 'Название не может быть пустым'
})
const canSave = computed(() => editor.title.trim().length > 0)

function addTodo(text: string): void {
  editor.todos.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
  })
}

function removeTodo(id: string): void {
  editor.todos = editor.todos.filter(todo => todo.id !== id)
}

function toggleTodo(id: string): void {
  const todo = editor.todos.find(item => item.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

function updateTodoText(id: string, text: string): void {
  const todo = editor.todos.find(item => item.id === id)
  if (todo) {
    todo.text = text
  }
}
</script>

<style scoped lang="scss">
.ui-page__back {
  margin-bottom: 0.35rem;
  font-size: 0.95rem;
}

.ui-page__back a {
  color: var(--ink-soft);
}

.ui-page__heading {
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  line-height: 1.1;
}

.ui-page__lead {
  max-width: 42ch;
  margin: 0.25rem 0 1.25rem;
  color: var(--muted);
}

.ui-section {
  margin-bottom: 1.75rem;
}

.ui-section__title {
  margin-bottom: 0.55rem;
  color: var(--pencil);
  font-family: var(--font-hand);
  font-size: 1.35rem;
  font-weight: 500;
}

.ui-section__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
}

.ui-section__demo {
  padding: 0.25rem 0;
}

.ui-section__note {
  margin-top: 0.6rem;
  color: var(--muted);
}

.ui-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
  margin-top: 0.75rem;
}

.ui-cards :deep(.note-card:nth-child(even)) {
  transform: rotate(0.8deg);
}

@media (prefers-reduced-motion: reduce) {
  .ui-cards :deep(.note-card:nth-child(even)) {
    transform: none;
  }
}
</style>
