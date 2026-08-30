import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Note, Todo } from '../types/note'
import {
  NOTES_STORAGE_KEY,
  NotesStorage,
  type NotesLoadReason,
  type StorageLike,
} from '../services/notesStorage'

export interface NotesStoreDeps {
  storage: StorageLike
  createId?: () => string
  now?: () => number
}

export interface NoteDraft {
  title: string
  todos: Todo[]
}

function cloneNote(note: Note): Note {
  return {
    id: note.id,
    title: note.title,
    todos: note.todos.map(todo => ({ ...todo })),
  }
}

function defaultId(): string {
  return crypto.randomUUID()
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loadError = ref<NotesLoadReason | null>(null)
  const updatedAt = ref<number | null>(null)

  let adapter: NotesStorage | null = null
  let createId = defaultId
  let now = () => Date.now()

  function persist(): void {
    if (!adapter) {
      throw new Error('Notes store is not hydrated')
    }
    const timestamp = now()
    adapter.save(notes.value, timestamp)
    updatedAt.value = timestamp
  }

  function hydrate(deps: NotesStoreDeps): void {
    adapter = new NotesStorage(deps.storage)
    createId = deps.createId ?? defaultId
    now = deps.now ?? (() => Date.now())

    const result = adapter.load()
    if (result.ok) {
      notes.value = result.notes
      updatedAt.value = result.updatedAt
      loadError.value = null
      return
    }

    notes.value = []
    updatedAt.value = null
    loadError.value = result.reason
  }

  function buildNote(draft: NoteDraft): Note {
    return {
      id: createId(),
      title: draft.title,
      todos: draft.todos.map(todo => ({ ...todo })),
    }
  }

  function getById(id: string): Note | undefined {
    const note = notes.value.find(item => item.id === id)
    return note ? cloneNote(note) : undefined
  }

  function saveNote(note: Note): void {
    if (!adapter) {
      throw new Error('Notes store is not hydrated')
    }

    const title = note.title.trim()
    if (!title) {
      throw new Error('Note title must not be empty')
    }

    const next = cloneNote({ ...note, title })
    const index = notes.value.findIndex(item => item.id === next.id)
    if (index === -1) {
      notes.value = [...notes.value, next]
    } else {
      const copy = notes.value.slice()
      copy[index] = next
      notes.value = copy
    }
    persist()
  }

  function deleteNote(id: string): boolean {
    if (!adapter) {
      throw new Error('Notes store is not hydrated')
    }

    const next = notes.value.filter(note => note.id !== id)
    if (next.length === notes.value.length) {
      return false
    }

    notes.value = next
    persist()
    return true
  }

  function handleStorageEvent(event: { key: string | null, storageArea?: StorageLike }): void {
    if (!adapter) {
      return
    }
    if (event.key !== NOTES_STORAGE_KEY) {
      return
    }

    const result = adapter.load()
    if (result.ok) {
      notes.value = result.notes
      updatedAt.value = result.updatedAt
      loadError.value = null
      return
    }

    notes.value = []
    updatedAt.value = null
    loadError.value = result.reason
  }

  return {
    notes,
    loadError,
    updatedAt,
    hydrate,
    buildNote,
    getById,
    saveNote,
    deleteNote,
    handleStorageEvent,
  }
})
