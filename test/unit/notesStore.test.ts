import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { CURRENT_SCHEMA_VERSION, NOTES_STORAGE_KEY } from '../../app/services/notesStorage'
import { useNotesStore } from '../../app/stores/notes'
import type { Note } from '../../app/types/note'
import { MemoryStorage } from './memoryStorage'

function hydrate(memory = new MemoryStorage(), createId = () => 'generated-id') {
  const store = useNotesStore()
  store.hydrate({
    storage: memory,
    createId,
    now: () => 1000,
  })
  return { store, memory }
}

describe('notes store persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does not write storage until saveNote', () => {
    const { store, memory } = hydrate()
    const note = store.buildNote({ title: 'Новая', todos: [] })

    expect(note.id).toBe('generated-id')
    expect(store.notes).toEqual([])
    expect(memory.getItem(NOTES_STORAGE_KEY)).toBeNull()

    store.saveNote(note)

    expect(store.notes).toHaveLength(1)
    expect(JSON.parse(memory.getItem(NOTES_STORAGE_KEY) ?? '')).toMatchObject({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      notes: [note],
      updatedAt: 1000,
    })
  })

  it('keeps persisted data unchanged while a local copy is edited', () => {
    const { store, memory } = hydrate()
    const note = store.buildNote({ title: 'Черновик', todos: [] })
    store.saveNote(note)
    const before = memory.getItem(NOTES_STORAGE_KEY)

    const edited: Note = {
      ...note,
      title: 'Ещё не сохранено',
      todos: [{ id: 'todo-1', text: 'Пункт', completed: false }],
    }

    expect(store.getById(note.id)?.title).toBe('Черновик')
    expect(memory.getItem(NOTES_STORAGE_KEY)).toBe(before)

    store.saveNote(edited)
    expect(store.getById(note.id)?.title).toBe('Ещё не сохранено')
    expect(JSON.parse(memory.getItem(NOTES_STORAGE_KEY) ?? '').notes[0].title).toBe('Ещё не сохранено')
  })

  it('survives a reload from the same storage', () => {
    const memory = new MemoryStorage()
    const first = useNotesStore()
    first.hydrate({ storage: memory, createId: () => 'id-1', now: () => 1 })
    first.saveNote(first.buildNote({ title: 'После перезагрузки', todos: [] }))

    setActivePinia(createPinia())
    const second = useNotesStore()
    second.hydrate({ storage: memory })

    expect(second.notes.map(note => note.title)).toEqual(['После перезагрузки'])
  })

  it('deletes a note and persists the removal', () => {
    const { store, memory } = hydrate()
    const note = store.buildNote({ title: 'Удалить', todos: [] })
    store.saveNote(note)

    expect(store.deleteNote(note.id)).toBe(true)
    expect(store.notes).toEqual([])
    expect(JSON.parse(memory.getItem(NOTES_STORAGE_KEY) ?? '').notes).toEqual([])
  })

  it('starts empty when stored data is corrupt', () => {
    const memory = new MemoryStorage()
    memory.setItem(NOTES_STORAGE_KEY, '{broken')

    const { store } = hydrate(memory)
    expect(store.notes).toEqual([])
    expect(store.loadError).toBe('corrupt')
  })

  it('rejects an empty title instead of writing it', () => {
    const { store, memory } = hydrate()
    const note = store.buildNote({ title: '   ', todos: [] })

    expect(() => store.saveNote(note)).toThrow('title')
    expect(store.notes).toEqual([])
    expect(memory.getItem(NOTES_STORAGE_KEY)).toBeNull()
  })

  it('applies a storage event from another tab', () => {
    const { store, memory } = hydrate()
    store.saveNote(store.buildNote({ title: 'Локальная', todos: [] }))

    const incoming: Note[] = [
      {
        id: 'from-tab',
        title: 'С другой вкладки',
        todos: [],
      },
    ]
    memory.setItem(NOTES_STORAGE_KEY, JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      notes: incoming,
      updatedAt: 2000,
    }))

    store.handleStorageEvent({
      key: NOTES_STORAGE_KEY,
      storageArea: memory,
    })

    expect(store.notes).toEqual(incoming)
  })

  it('ignores storage events for other keys', () => {
    const { store } = hydrate()
    store.saveNote(store.buildNote({ title: 'Своя', todos: [] }))

    store.handleStorageEvent({
      key: 'something-else',
      storageArea: new MemoryStorage(),
    })

    expect(store.notes[0]?.title).toBe('Своя')
  })
})
