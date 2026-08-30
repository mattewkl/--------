import { isNote } from './notesSchema'
import type { StorageLike } from './notesStorage'
import type { Note } from '../types/note'

export const DRAFT_STORAGE_KEY = 'notebook.draft'
export const DRAFT_SCHEMA_VERSION = 1
export const NEW_NOTE_ID = 'new'

export interface DraftSession {
  noteId: string
  note: Note
  original: Note | null
  pendingTodo: string
}

export type DraftLoadResult =
  | { ok: true, session: DraftSession | null }
  | { ok: false, reason: 'corrupt' | 'unsupported' }

export type DraftInspection = {
  status: 'ready' | 'orphaned' | 'stale'
  session: DraftSession
}

export interface NoteDraftsOptions {
  debounceMs?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cloneNote(note: Note): Note {
  return {
    id: note.id,
    title: note.title,
    todos: note.todos.map(todo => ({ ...todo })),
  }
}

function cloneSession(session: DraftSession): DraftSession {
  return {
    noteId: session.noteId,
    note: cloneNote(session.note),
    original: session.original ? cloneNote(session.original) : null,
    pendingTodo: session.pendingTodo ?? '',
  }
}

export function notesEqual(left: Note, right: Note): boolean {
  if (left.id !== right.id || left.title !== right.title || left.todos.length !== right.todos.length) {
    return false
  }

  return left.todos.every((todo, index) => {
    const other = right.todos[index]
    return Boolean(
      other
      && todo.id === other.id
      && todo.text === other.text
      && todo.completed === other.completed,
    )
  })
}

export function parseDraft(raw: string | null): DraftLoadResult {
  if (raw === null || raw.trim() === '') {
    return { ok: true, session: null }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, reason: 'corrupt' }
  }

  if (!isRecord(parsed)) {
    return { ok: false, reason: 'corrupt' }
  }

  if (parsed.schemaVersion !== DRAFT_SCHEMA_VERSION) {
    if (typeof parsed.schemaVersion === 'number' && parsed.schemaVersion > DRAFT_SCHEMA_VERSION) {
      return { ok: false, reason: 'unsupported' }
    }
    return { ok: false, reason: 'corrupt' }
  }

  if (typeof parsed.noteId !== 'string' || parsed.noteId.length === 0 || !isNote(parsed.note)) {
    return { ok: false, reason: 'corrupt' }
  }

  if (parsed.original !== null && !isNote(parsed.original)) {
    return { ok: false, reason: 'corrupt' }
  }

  return {
    ok: true,
    session: {
      noteId: parsed.noteId,
      note: cloneNote(parsed.note),
      original: parsed.original ? cloneNote(parsed.original) : null,
      pendingTodo: typeof parsed.pendingTodo === 'string' ? parsed.pendingTodo : '',
    },
  }
}

export function inspectDraft(session: DraftSession, notes: Note[]): DraftInspection {
  if (session.noteId === NEW_NOTE_ID || session.original === null) {
    return { status: 'ready', session }
  }

  const current = notes.find(note => note.id === session.noteId)
  if (!current) {
    return { status: 'orphaned', session }
  }

  if (!notesEqual(session.original, current)) {
    return { status: 'stale', session }
  }

  return { status: 'ready', session }
}

export class NoteDrafts {
  readonly #storage: StorageLike
  readonly #key: string
  readonly #debounceMs: number
  #timer: ReturnType<typeof setTimeout> | null = null
  #pending: DraftSession | null = null

  constructor(storage: StorageLike, options: NoteDraftsOptions = {}, key = DRAFT_STORAGE_KEY) {
    this.#storage = storage
    this.#key = key
    this.#debounceMs = options.debounceMs ?? 300
  }

  load(): DraftLoadResult {
    return parseDraft(this.#storage.getItem(this.#key))
  }

  saveNow(session: DraftSession): void {
    this.#clearTimer()
    this.#pending = null
    this.#write(session)
  }

  saveSoon(session: DraftSession): void {
    this.#pending = cloneSession(session)
    this.#clearTimer()
    this.#timer = setTimeout(() => {
      if (this.#pending) {
        this.#write(this.#pending)
        this.#pending = null
      }
      this.#timer = null
    }, this.#debounceMs)
  }

  discard(): void {
    this.#clearTimer()
    this.#pending = null
    this.#storage.removeItem(this.#key)
  }

  #write(session: DraftSession): void {
    const payload = cloneSession(session)
    this.#storage.setItem(this.#key, JSON.stringify({
      schemaVersion: DRAFT_SCHEMA_VERSION,
      noteId: payload.noteId,
      note: payload.note,
      original: payload.original,
      pendingTodo: payload.pendingTodo,
    }))
  }

  #clearTimer(): void {
    if (this.#timer !== null) {
      clearTimeout(this.#timer)
      this.#timer = null
    }
  }

  flush(): void {
    this.#clearTimer()
    if (this.#pending) {
      this.#write(this.#pending)
      this.#pending = null
    }
  }
}

