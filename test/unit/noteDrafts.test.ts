import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DRAFT_STORAGE_KEY,
  inspectDraft,
  NoteDrafts,
  NEW_NOTE_ID,
} from '../../app/services/noteDrafts'
import type { Note } from '../../app/types/note'
import { MemoryStorage } from './memoryStorage'

function makeNote(id = 'note-1'): Note {
  return {
    id,
    title: 'Планы',
    todos: [{ id: 'todo-1', text: 'Пункт', completed: false }],
  }
}

function session(note = makeNote(), original: Note | null = makeNote(), pendingTodo = '') {
  return {
    noteId: note.id,
    note,
    original,
    pendingTodo,
  }
}

describe('NoteDrafts persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads nothing from empty storage', () => {
    const drafts = new NoteDrafts(new MemoryStorage())
    expect(drafts.load()).toEqual({ ok: true, session: null })
  })

  it('writes a versioned draft immediately with saveNow', () => {
    const memory = new MemoryStorage()
    const drafts = new NoteDrafts(memory)
    const current = session()

    drafts.saveNow(current)

    expect(JSON.parse(memory.getItem(DRAFT_STORAGE_KEY) ?? '')).toMatchObject({
      schemaVersion: 1,
      noteId: 'note-1',
      note: current.note,
      original: current.original,
    })
  })

  it('debounces saveSoon and keeps only the latest note', () => {
    const memory = new MemoryStorage()
    const drafts = new NoteDrafts(memory, { debounceMs: 300 })
    const first = session({ ...makeNote(), title: 'П' })
    const second = session({ ...makeNote(), title: 'План' })

    drafts.saveSoon(first)
    expect(memory.getItem(DRAFT_STORAGE_KEY)).toBeNull()

    drafts.saveSoon(second)
    vi.advanceTimersByTime(299)
    expect(memory.getItem(DRAFT_STORAGE_KEY)).toBeNull()

    vi.advanceTimersByTime(1)
    expect(JSON.parse(memory.getItem(DRAFT_STORAGE_KEY) ?? '').note.title).toBe('План')
  })

  it('flushes a pending debounced draft immediately', () => {
    const memory = new MemoryStorage()
    const drafts = new NoteDrafts(memory, { debounceMs: 300 })

    drafts.saveSoon(session(makeNote(), makeNote(), 'черновик пункта'))
    expect(memory.getItem(DRAFT_STORAGE_KEY)).toBeNull()

    drafts.flush()
    expect(JSON.parse(memory.getItem(DRAFT_STORAGE_KEY) ?? '').pendingTodo).toBe('черновик пункта')
  })

  it('survives a reload from the same storage', () => {
    const memory = new MemoryStorage()
    new NoteDrafts(memory).saveNow(session())

    const loaded = new NoteDrafts(memory).load()
    expect(loaded.ok).toBe(true)
    if (loaded.ok) {
      expect(loaded.session?.note.title).toBe('Планы')
      expect(loaded.session?.noteId).toBe('note-1')
    }
  })

  it('persists unfinished new-todo input and restores it after reload', () => {
    const memory = new MemoryStorage()
    const current = session(makeNote(), makeNote(), 'ывфаафвыфававы')
    new NoteDrafts(memory).saveNow(current)

    const loaded = new NoteDrafts(memory).load()
    expect(loaded.ok).toBe(true)
    if (loaded.ok) {
      expect(loaded.session?.pendingTodo).toBe('ывфаафвыфававы')
    }
  })

  it('treats a missing pendingTodo field as an empty string', () => {
    const memory = new MemoryStorage()
    memory.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      noteId: 'note-1',
      note: makeNote(),
      original: makeNote(),
    }))

    const loaded = new NoteDrafts(memory).load()
    expect(loaded.ok).toBe(true)
    if (loaded.ok) {
      expect(loaded.session?.pendingTodo).toBe('')
    }
  })

  it('clears the draft on discard', () => {
    const memory = new MemoryStorage()
    const drafts = new NoteDrafts(memory)
    drafts.saveNow(session())
    drafts.saveSoon(session({ ...makeNote(), title: 'ещё' }))

    drafts.discard()

    expect(memory.getItem(DRAFT_STORAGE_KEY)).toBeNull()
    expect(drafts.load()).toEqual({ ok: true, session: null })
  })

  it('treats broken JSON as corrupt', () => {
    const memory = new MemoryStorage()
    memory.setItem(DRAFT_STORAGE_KEY, '{broken')

    expect(new NoteDrafts(memory).load()).toEqual({
      ok: false,
      reason: 'corrupt',
    })
  })

  it('rejects an unsupported schema version', () => {
    const memory = new MemoryStorage()
    memory.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      schemaVersion: 9,
      noteId: 'note-1',
      note: makeNote(),
      original: makeNote(),
    }))

    expect(new NoteDrafts(memory).load()).toEqual({
      ok: false,
      reason: 'unsupported',
    })
  })
})

describe('inspectDraft', () => {
  it('is ready when the saved note still matches the snapshot', () => {
    const note = makeNote()
    expect(inspectDraft(session(note, note), [note])).toEqual({
      status: 'ready',
      session: session(note, note),
    })
  })

  it('is orphaned when the source note was deleted in another tab', () => {
    const draft = session()
    expect(inspectDraft(draft, [])).toEqual({
      status: 'orphaned',
      session: draft,
    })
  })

  it('is stale when the source note changed after the draft started', () => {
    const original = makeNote()
    const current = { ...original, title: 'Уже сохранено в другой вкладке' }
    const draft = session({ ...original, title: 'Мой черновик' }, original)

    expect(inspectDraft(draft, [current])).toEqual({
      status: 'stale',
      session: draft,
    })
  })

  it('never orphans a new-note draft', () => {
    const note = makeNote(NEW_NOTE_ID)
    const draft = session(note, null)

    expect(inspectDraft(draft, [])).toEqual({
      status: 'ready',
      session: draft,
    })
  })
})
