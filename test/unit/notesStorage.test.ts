import { describe, expect, it } from 'vitest'
import {
  CURRENT_SCHEMA_VERSION,
  NOTES_STORAGE_KEY,
  NotesStorage,
} from '../../app/services/notesStorage'
import type { Note } from '../../app/types/note'
import { MemoryStorage } from './memoryStorage'

function sampleNotes(): Note[] {
  return [
    {
      id: 'note-1',
      title: 'Планы',
      todos: [{ id: 'todo-1', text: 'Пункт', completed: false }],
    },
  ]
}

describe('NotesStorage load', () => {
  it('returns empty notes when storage is empty', () => {
    const storage = new NotesStorage(new MemoryStorage())

    expect(storage.load()).toEqual({
      ok: true,
      notes: [],
      updatedAt: null,
    })
  })

  it('loads a versioned payload', () => {
    const memory = new MemoryStorage()
    memory.setItem(NOTES_STORAGE_KEY, JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      notes: sampleNotes(),
      updatedAt: 1700000000000,
    }))

    expect(new NotesStorage(memory).load()).toEqual({
      ok: true,
      notes: sampleNotes(),
      updatedAt: 1700000000000,
    })
  })

  it('migrates a legacy unversioned notes array', () => {
    const memory = new MemoryStorage()
    memory.setItem(NOTES_STORAGE_KEY, JSON.stringify({
      notes: sampleNotes(),
    }))

    const result = new NotesStorage(memory).load()

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.notes).toEqual(sampleNotes())
    }
  })

  it('treats broken JSON as corrupt without throwing', () => {
    const memory = new MemoryStorage()
    memory.setItem(NOTES_STORAGE_KEY, '{not-json')

    expect(new NotesStorage(memory).load()).toEqual({
      ok: false,
      reason: 'corrupt',
    })
  })

  it('rejects an unsupported schema version', () => {
    const memory = new MemoryStorage()
    memory.setItem(NOTES_STORAGE_KEY, JSON.stringify({
      schemaVersion: 99,
      notes: sampleNotes(),
      updatedAt: 1,
    }))

    expect(new NotesStorage(memory).load()).toEqual({
      ok: false,
      reason: 'unsupported',
    })
  })

  it('rejects a payload that is not a note list', () => {
    const memory = new MemoryStorage()
    memory.setItem(NOTES_STORAGE_KEY, JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      notes: [{ id: 1, title: true }],
      updatedAt: 1,
    }))

    expect(new NotesStorage(memory).load()).toEqual({
      ok: false,
      reason: 'corrupt',
    })
  })
})

describe('NotesStorage save', () => {
  it('writes schema version with the notes', () => {
    const memory = new MemoryStorage()
    const storage = new NotesStorage(memory)

    storage.save(sampleNotes(), 42)

    expect(JSON.parse(memory.getItem(NOTES_STORAGE_KEY) ?? '')).toEqual({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      notes: sampleNotes(),
      updatedAt: 42,
    })
  })
})
