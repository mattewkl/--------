<template>
  <div class="todo-item" :class="{ 'todo-item--preview': preview }">
    <label class="todo-item__check">
      <input
        class="todo-item__box"
        type="checkbox"
        :checked="completed"
        :disabled="preview"
        :tabindex="preview ? -1 : 0"
        @change="onToggle"
      >
      <span class="todo-item__mark" aria-hidden="true" />
      <span class="visually-hidden">
        {{ preview ? 'Пункт в превью' : 'Выполнено' }}
      </span>
    </label>

    <p
      v-if="preview"
      class="todo-item__text"
      :class="{ 'todo-item__text--done': completed }"
    >
      {{ text }}
    </p>
    <input
      v-else
      :id="inputId"
      v-model="draft"
      class="todo-item__input"
      type="text"
      :aria-label="`Текст пункта: ${text}`"
      @blur="commitText"
      @keydown.enter.prevent="commitText"
    >

    <IconButton
      v-if="!preview"
      class="todo-item__remove"
      label="Удалить пункт"
      variant="danger"
      @click="emit('remove')"
    >
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
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  completed: boolean
  preview?: boolean
}>(), {
  preview: false,
})

const emit = defineEmits<{
  toggle: []
  remove: []
  'update:text': [value: string]
}>()

const inputId = useId()
const draft = ref(props.text)

watch(() => props.text, (value) => {
  draft.value = value
})

function onToggle(event: Event): void {
  if (props.preview) {
    event.preventDefault()
    return
  }
  emit('toggle')
}

function commitText(): void {
  const next = draft.value.trim()
  if (next !== props.text) {
    emit('update:text', next)
  }
}
</script>

<style scoped lang="scss">
.todo-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.45rem 0.55rem;
}

.todo-item--preview {
  grid-template-columns: auto minmax(0, 1fr);
}

.todo-item--preview .todo-item__check {
  width: 1.15rem;
  height: 1.15rem;
  margin: 0.2rem 0 0;
}

.todo-item__check {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin: -0.5rem 0 0 -0.5rem;
}

.todo-item__box {
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  &:focus-visible + .todo-item__mark {
    outline: 2px dashed var(--focus);
    outline-offset: 2px;
  }

  &:checked + .todo-item__mark::after {
    opacity: 1;
  }
}

.todo-item__mark {
  display: block;
  width: 1.15rem;
  height: 1.15rem;
  border: 1.5px solid var(--ink-soft);
  border-radius: 2px;
  background: #fffdf4;

  &::after {
    content: '';
    display: block;
    width: 0.28rem;
    height: 0.55rem;
    margin: 0.08rem 0 0 0.35rem;
    border-right: 2px solid var(--ink);
    border-bottom: 2px solid var(--ink);
    transform: rotate(40deg);
    opacity: 0;
  }
}

.todo-item__text,
.todo-item__input {
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.4;
}

.todo-item__text--done {
  color: var(--muted);
  text-decoration: line-through;
  text-decoration-thickness: 1px;
}

.todo-item__input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.35rem 0.15rem;
  border: none;
  border-bottom: 1px dashed var(--line);
  background: transparent;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px dashed var(--focus);
    outline-offset: 3px;
    border-bottom-color: var(--ink);
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
