import {
  NOTES_STORAGE_KEY,
  parsePersistedNotes,
  serializePersistedNotes,
  type NotesLoadResult,
} from './notesSchema'
import type { Note } from '../types/note'

export {
  CURRENT_SCHEMA_VERSION,
  NOTES_STORAGE_KEY,
  type NotesLoadReason,
  type NotesLoadResult,
} from './notesSchema'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export class NotesStorage {
  constructor(
    private readonly storage: StorageLike,
    private readonly key = NOTES_STORAGE_KEY,
  ) {}

  load(): NotesLoadResult {
    return parsePersistedNotes(this.storage.getItem(this.key))
  }

  save(notes: Note[], updatedAt: number): void {
    this.storage.setItem(
      this.key,
      JSON.stringify(serializePersistedNotes(notes, updatedAt)),
    )
  }
}
