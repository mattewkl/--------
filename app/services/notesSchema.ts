import type { Note, Todo } from '../types/note'

export const CURRENT_SCHEMA_VERSION = 1
export const NOTES_STORAGE_KEY = 'notebook.notes'

export type NotesLoadReason = 'corrupt' | 'unsupported'

export type NotesLoadResult =
  | { ok: true, notes: Note[], updatedAt: number | null }
  | { ok: false, reason: NotesLoadReason }

interface PersistedNotesV1 {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION
  notes: Note[]
  updatedAt: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTodo(value: unknown): value is Todo {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.id === 'string'
    && value.id.length > 0
    && typeof value.text === 'string'
    && typeof value.completed === 'boolean'
}

export function isNote(value: unknown): value is Note {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.id === 'string'
    && value.id.length > 0
    && typeof value.title === 'string'
    && Array.isArray(value.todos)
    && value.todos.every(isTodo)
}

function cloneNote(note: Note): Note {
  return {
    id: note.id,
    title: note.title,
    todos: note.todos.map(todo => ({ ...todo })),
  }
}

export function parsePersistedNotes(raw: string | null): NotesLoadResult {
  if (raw === null || raw.trim() === '') {
    return { ok: true, notes: [], updatedAt: null }
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

  const version = parsed.schemaVersion
  if (version !== undefined && version !== CURRENT_SCHEMA_VERSION) {
    if (typeof version === 'number' && version > CURRENT_SCHEMA_VERSION) {
      return { ok: false, reason: 'unsupported' }
    }
    if (typeof version !== 'number' || version < 1) {
      return { ok: false, reason: 'corrupt' }
    }
  }

  if (!Array.isArray(parsed.notes) || !parsed.notes.every(isNote)) {
    return { ok: false, reason: 'corrupt' }
  }

  const notes = parsed.notes.map(cloneNote)
  const updatedAt = typeof parsed.updatedAt === 'number'
    ? parsed.updatedAt
    : null

  return { ok: true, notes, updatedAt }
}

export function serializePersistedNotes(
  notes: Note[],
  updatedAt: number,
): PersistedNotesV1 {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    notes: notes.map(cloneNote),
    updatedAt,
  }
}
