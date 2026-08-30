import { NoteHistory } from '../domain/history'
import {
  inspectDraft,
  NEW_NOTE_ID,
  NoteDrafts,
  notesEqual,
  type DraftSession,
} from '../services/noteDrafts'
import type { Note, Todo } from '../types/note'
import { isTextEntryTarget, undoRedoFromHotkey } from '../utils/editHotkeys'

function cloneNote(note: Note): Note {
  return {
    id: note.id,
    title: note.title,
    todos: note.todos.map(todo => ({ ...todo })),
  }
}

function emptyNote(): Note {
  return {
    id: NEW_NOTE_ID,
    title: '',
    todos: [],
  }
}

export function useEditSession(noteId: MaybeRefOrGetter<string>) {
  const store = useNotesStore()
  const router = useRouter()
  const drafts = new NoteDrafts(window.localStorage)
  const history = new NoteHistory()
  const historyVersion = ref(0)

  const working = reactive<Note>(emptyNote())
  const original = ref<Note | null>(null)
  const missing = ref(false)
  const orphaned = ref(false)
  const draftOpen = ref(false)
  const cancelOpen = ref(false)
  const deleteOpen = ref(false)
  const pendingTodo = ref('')
  const pendingDraft = ref<DraftSession | null>(null)

  function bumpHistory(): void {
    historyVersion.value += 1
  }

  function currentId(): string {
    return toValue(noteId)
  }

  function snapshot(): DraftSession {
    return {
      noteId: currentId(),
      note: cloneNote(working),
      original: original.value ? cloneNote(original.value) : null,
      pendingTodo: pendingTodo.value,
    }
  }

  function queueDraft(): void {
    if (missing.value && !orphaned.value) {
      return
    }
    drafts.saveSoon(snapshot())
  }

  function replaceWorking(note: Note): void {
    working.id = note.id
    working.title = note.title
    working.todos.splice(0, working.todos.length, ...note.todos.map(todo => ({ ...todo })))
  }

  const canUndo = computed(() => {
    return historyVersion.value >= 0 && history.canUndo
  })

  const canRedo = computed(() => {
    return historyVersion.value >= 0 && history.canRedo
  })

  const titleError = computed(() => {
    return working.title.trim() ? '' : 'Название не может быть пустым'
  })

  const todoError = computed(() => {
    return working.todos.some(todo => !todo.text.trim())
      ? 'Есть пункты без текста'
      : ''
  })

  const canSave = computed(() => !titleError.value && !todoError.value)

  function boot(): void {
    history.reset()
    bumpHistory()
    orphaned.value = false
    draftOpen.value = false
    pendingDraft.value = null
    cancelOpen.value = false
    deleteOpen.value = false
    pendingTodo.value = ''

    const id = currentId()
    if (id === NEW_NOTE_ID) {
      replaceWorking(emptyNote())
      original.value = null
      missing.value = false
    } else {
      const saved = store.getById(id)
      if (!saved) {
        missing.value = true
        original.value = null
        replaceWorking(emptyNote())
      } else {
        missing.value = false
        replaceWorking(saved)
        original.value = cloneNote(saved)
      }
    }

    const loaded = drafts.load()
    if (!loaded.ok) {
      drafts.discard()
      return
    }
    if (!loaded.session || loaded.session.noteId !== id) {
      return
    }

    pendingDraft.value = loaded.session
    draftOpen.value = true
    if (missing.value) {
      missing.value = false
      orphaned.value = true
    }
  }

  function restoreDraft(): void {
    const session = pendingDraft.value
    draftOpen.value = false
    if (!session) {
      return
    }

    const inspection = inspectDraft(session, store.notes)
    replaceWorking(session.note)
    pendingTodo.value = session.pendingTodo
    if (inspection.status === 'orphaned') {
      orphaned.value = true
      original.value = null
    }
    history.reset()
    bumpHistory()
    pendingDraft.value = null
    drafts.saveNow(snapshot())
  }

  function discardDraft(): void {
    draftOpen.value = false
    pendingDraft.value = null
    drafts.discard()
    if (currentId() !== NEW_NOTE_ID && !store.getById(currentId())) {
      missing.value = true
      orphaned.value = false
    }
  }

  function onTitle(next: string): void {
    const before = working.title
    working.title = next
    history.recordTextEdit({
      kind: 'title',
      before,
      after: next,
    })
    bumpHistory()
    queueDraft()
  }

  function onTitleBlur(): void {
    history.finishTextEdit()
  }

  function onPendingTodo(value: string): void {
    pendingTodo.value = value
    queueDraft()
  }

  function addTodo(text: string): void {
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    }
    history.execute(working, {
      kind: 'todo-add',
      todo,
      index: working.todos.length,
    })
    pendingTodo.value = ''
    bumpHistory()
    queueDraft()
  }

  function removeTodo(id: string): void {
    const index = working.todos.findIndex(todo => todo.id === id)
    const todo = working.todos[index]
    if (index === -1 || !todo) {
      return
    }
    history.execute(working, {
      kind: 'todo-remove',
      todo: { ...todo },
      index,
    })
    bumpHistory()
    queueDraft()
  }

  function toggleTodo(id: string): void {
    const todo = working.todos.find(item => item.id === id)
    if (!todo) {
      return
    }
    history.execute(working, {
      kind: 'todo-toggle',
      todoId: id,
      before: todo.completed,
      after: !todo.completed,
    })
    bumpHistory()
    queueDraft()
  }

  function updateTodoText(id: string, text: string): void {
    const todo = working.todos.find(item => item.id === id)
    if (!todo || todo.text === text) {
      return
    }
    const before = todo.text
    todo.text = text
    history.recordTextEdit({
      kind: 'todo-text',
      todoId: id,
      before,
      after: text,
    })
    history.finishTextEdit()
    bumpHistory()
    queueDraft()
  }

  function undo(): void {
    if (history.undo(working)) {
      bumpHistory()
      queueDraft()
    }
  }

  function redo(): void {
    if (history.redo(working)) {
      bumpHistory()
      queueDraft()
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    const action = undoRedoFromHotkey(event)
    if (!action) {
      return
    }
    if (isTextEntryTarget(event.target)) {
      return
    }
    event.preventDefault()
    if (action === 'redo') {
      redo()
      return
    }
    undo()
  }

  function onPointerDown(event: Event): void {
    const active = document.activeElement
    if (!isTextEntryTarget(active) || !(active instanceof HTMLElement)) {
      return
    }
    const target = event.target
    if (target instanceof Node && (active === target || active.contains(target))) {
      return
    }
    active.blur()
  }

  function onPageHide(): void {
    drafts.flush()
  }

  function leave(): void {
    drafts.discard()
    history.reset()
    void router.push('/')
  }

  function save(): void {
    if (!canSave.value) {
      return
    }

    const payload = cloneNote(working)
    if (currentId() === NEW_NOTE_ID || orphaned.value || payload.id === NEW_NOTE_ID) {
      store.saveNote(store.buildNote({
        title: payload.title,
        todos: payload.todos,
      }))
    } else {
      store.saveNote(payload)
    }
    leave()
  }

  function confirmCancel(): void {
    cancelOpen.value = false
    leave()
  }

  function confirmDelete(): void {
    deleteOpen.value = false
    if (currentId() !== NEW_NOTE_ID && !orphaned.value) {
      store.deleteNote(currentId())
    }
    leave()
  }

  watch(() => toValue(noteId), () => {
    boot()
  }, { immediate: true })

  watch(() => store.notes, () => {
    const id = currentId()
    if (id === NEW_NOTE_ID || missing.value) {
      return
    }
    if (!store.getById(id)) {
      orphaned.value = true
    }
  }, { deep: true })

  onMounted(() => {
    window.addEventListener('keydown', onKeydown, true)
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('pagehide', onPageHide)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown, true)
    window.removeEventListener('pointerdown', onPointerDown, true)
    window.removeEventListener('pagehide', onPageHide)
  })

  const draftTitle = computed(() => {
    if (!pendingDraft.value) {
      return 'Восстановить черновик?'
    }
    const inspection = inspectDraft(pendingDraft.value, store.notes)
    if (inspection.status === 'orphaned') {
      return 'Заметка удалена. Восстановить черновик?'
    }
    if (inspection.status === 'stale') {
      return 'Заметка изменилась. Восстановить черновик?'
    }
    return 'Восстановить черновик?'
  })

  return {
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
  }
}
