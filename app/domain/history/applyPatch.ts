import type { Note, Todo } from '../../types/note'
import type { NotePatch } from './patches'

export type PatchDirection = 'forward' | 'backward'

function findTodo(note: Note, todoId: string): Todo {
  const todo = note.todos.find(item => item.id === todoId)

  if (!todo) {
    throw new Error(`Todo "${todoId}" is missing`)
  }

  return todo
}

function removeTodo(note: Note, todoId: string): void {
  const index = note.todos.findIndex(todo => todo.id === todoId)

  if (index === -1) {
    throw new Error(`Todo "${todoId}" is missing`)
  }

  note.todos.splice(index, 1)
}

function insertTodo(note: Note, todo: Todo, index: number): void {
  if (note.todos.some(item => item.id === todo.id)) {
    throw new Error(`Todo "${todo.id}" already exists`)
  }

  const safeIndex = Math.max(0, Math.min(index, note.todos.length))
  note.todos.splice(safeIndex, 0, { ...todo })
}

export function applyPatch(
  note: Note,
  patch: NotePatch,
  direction: PatchDirection,
): void {
  const forward = direction === 'forward'

  switch (patch.kind) {
    case 'title':
      note.title = forward ? patch.after : patch.before
      return

    case 'todo-text':
      findTodo(note, patch.todoId).text = forward ? patch.after : patch.before
      return

    case 'todo-toggle':
      findTodo(note, patch.todoId).completed = forward ? patch.after : patch.before
      return

    case 'todo-add':
      if (forward) {
        insertTodo(note, patch.todo, patch.index)
      } else {
        removeTodo(note, patch.todo.id)
      }
      return

    case 'todo-remove':
      if (forward) {
        removeTodo(note, patch.todo.id)
      } else {
        insertTodo(note, patch.todo, patch.index)
      }
  }
}
