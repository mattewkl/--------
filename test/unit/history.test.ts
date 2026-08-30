import { describe, expect, it } from 'vitest'
import {
  NoteHistory,
  type NotePatch,
} from '../../app/domain/history'
import type { Note, Todo } from '../../app/types/note'

function makeNote(): Note {
  return {
    id: 'note-1',
    title: 'Планы',
    todos: [
      { id: 'todo-1', text: 'Первый пункт', completed: false },
      { id: 'todo-2', text: 'Второй пункт', completed: true },
    ],
  }
}

describe('NoteHistory atomic patches', () => {
  it('undoes and redoes a title change', () => {
    const note = makeNote()
    const history = new NoteHistory()

    history.execute(note, {
      kind: 'title',
      before: 'Планы',
      after: 'Планы на неделю',
    })

    expect(note.title).toBe('Планы на неделю')
    expect(history.canUndo).toBe(true)
    expect(history.undo(note)).toBe(true)
    expect(note.title).toBe('Планы')
    expect(history.redo(note)).toBe(true)
    expect(note.title).toBe('Планы на неделю')
  })

  it('preserves a todo and its position through add/remove undo and redo', () => {
    const note = makeNote()
    const history = new NoteHistory()
    const inserted: Todo = {
      id: 'todo-new',
      text: 'Пункт посередине',
      completed: false,
    }

    history.execute(note, {
      kind: 'todo-add',
      todo: inserted,
      index: 1,
    })
    expect(note.todos.map(todo => todo.id)).toEqual(['todo-1', 'todo-new', 'todo-2'])

    history.execute(note, {
      kind: 'todo-remove',
      todo: inserted,
      index: 1,
    })
    expect(note.todos.map(todo => todo.id)).toEqual(['todo-1', 'todo-2'])

    history.undo(note)
    expect(note.todos[1]).toEqual(inserted)

    history.undo(note)
    expect(note.todos.map(todo => todo.id)).toEqual(['todo-1', 'todo-2'])

    history.redo(note)
    history.redo(note)
    expect(note.todos.map(todo => todo.id)).toEqual(['todo-1', 'todo-2'])
  })

  it('treats checkbox and todo text changes as separate atomic entries', () => {
    const note = makeNote()
    const history = new NoteHistory()

    history.execute(note, {
      kind: 'todo-toggle',
      todoId: 'todo-1',
      before: false,
      after: true,
    })
    history.execute(note, {
      kind: 'todo-text',
      todoId: 'todo-1',
      before: 'Первый пункт',
      after: 'Исправленный пункт',
    })

    expect(history.undoDepth).toBe(2)
    history.undo(note)
    expect(note.todos[0]).toMatchObject({ text: 'Первый пункт', completed: true })
    history.undo(note)
    expect(note.todos[0]).toMatchObject({ text: 'Первый пункт', completed: false })
  })

  it('rejects a patch for a missing todo instead of corrupting the note', () => {
    const note = makeNote()
    const history = new NoteHistory()

    expect(() => history.execute(note, {
      kind: 'todo-toggle',
      todoId: 'missing',
      before: false,
      after: true,
    })).toThrow('missing')
    expect(history.undoDepth).toBe(0)
  })
})

describe('NoteHistory branches and bounds', () => {
  it('clears the redo branch after a new change', () => {
    const note = makeNote()
    const history = new NoteHistory()

    history.execute(note, {
      kind: 'title',
      before: 'Планы',
      after: 'Черновик',
    })
    history.undo(note)
    expect(history.canRedo).toBe(true)

    history.execute(note, {
      kind: 'todo-toggle',
      todoId: 'todo-1',
      before: false,
      after: true,
    })

    expect(history.canRedo).toBe(false)
    expect(history.redo(note)).toBe(false)
  })

  it('keeps only the latest 50 delta patches', () => {
    const note = makeNote()
    const history = new NoteHistory({ limit: 50 })

    for (let index = 1; index <= 51; index += 1) {
      history.execute(note, {
        kind: 'title',
        before: index === 1 ? 'Планы' : `Название ${index - 1}`,
        after: `Название ${index}`,
      })
    }

    expect(history.undoDepth).toBe(50)
    for (let index = 0; index < 50; index += 1) {
      expect(history.undo(note)).toBe(true)
    }
    expect(note.title).toBe('Название 1')
    expect(history.undo(note)).toBe(false)
  })

  it('resets undo, redo and an active text batch', () => {
    const note = makeNote()
    const history = new NoteHistory()

    note.title = 'П'
    history.recordTextEdit({
      kind: 'title',
      before: 'Планы',
      after: 'П',
    }, 0)
    history.reset()

    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)
    expect(history.undoDepth).toBe(0)
    expect(history.redoDepth).toBe(0)
  })
})

describe('NoteHistory continuous text input', () => {
  it('coalesces continuous title input into one history entry', () => {
    const note = makeNote()
    const history = new NoteHistory({ coalesceWindowMs: 500 })

    const changes: Array<[string, number]> = [
      ['П', 0],
      ['Пл', 100],
      ['План', 250],
    ]
    let before = note.title

    for (const [after, timestamp] of changes) {
      note.title = after
      history.recordTextEdit({
        kind: 'title',
        before,
        after,
      }, timestamp)
      before = after
    }

    expect(history.undoDepth).toBe(1)
    history.undo(note)
    expect(note.title).toBe('Планы')
    history.redo(note)
    expect(note.title).toBe('План')
  })

  it('starts a new entry after an input pause or explicit blur flush', () => {
    const note = makeNote()
    const history = new NoteHistory({ coalesceWindowMs: 500 })

    note.title = 'План'
    history.recordTextEdit({
      kind: 'title',
      before: 'Планы',
      after: 'План',
    }, 0)

    note.title = 'План A'
    history.recordTextEdit({
      kind: 'title',
      before: 'План',
      after: 'План A',
    }, 700)

    history.finishTextEdit()
    note.title = 'План AB'
    history.recordTextEdit({
      kind: 'title',
      before: 'План A',
      after: 'План AB',
    }, 800)

    expect(history.undoDepth).toBe(3)
    history.undo(note)
    expect(note.title).toBe('План A')
    history.undo(note)
    expect(note.title).toBe('План')
  })

  it('does not merge edits of different fields', () => {
    const note = makeNote()
    const history = new NoteHistory()

    const patches: NotePatch[] = [
      {
        kind: 'todo-text',
        todoId: 'todo-1',
        before: 'Первый пункт',
        after: 'Первый',
      },
      {
        kind: 'todo-text',
        todoId: 'todo-2',
        before: 'Второй пункт',
        after: 'Второй',
      },
    ]

    note.todos[0]!.text = 'Первый'
    history.recordTextEdit(patches[0]!, 0)
    note.todos[1]!.text = 'Второй'
    history.recordTextEdit(patches[1]!, 100)

    expect(history.undoDepth).toBe(2)
  })

  it('ignores no-op text changes', () => {
    const history = new NoteHistory()

    history.recordTextEdit({
      kind: 'title',
      before: 'Планы',
      after: 'Планы',
    })

    expect(history.undoDepth).toBe(0)
  })
})
