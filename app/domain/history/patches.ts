import type { Todo } from '../../types/note'

export interface TitlePatch {
  kind: 'title'
  before: string
  after: string
}

export interface TodoTextPatch {
  kind: 'todo-text'
  todoId: string
  before: string
  after: string
}

export interface TodoTogglePatch {
  kind: 'todo-toggle'
  todoId: string
  before: boolean
  after: boolean
}

export interface TodoAddPatch {
  kind: 'todo-add'
  todo: Todo
  index: number
}

export interface TodoRemovePatch {
  kind: 'todo-remove'
  todo: Todo
  index: number
}

export type TextPatch = TitlePatch | TodoTextPatch

export type NotePatch =
  | TextPatch
  | TodoTogglePatch
  | TodoAddPatch
  | TodoRemovePatch

export function isTextPatch(patch: NotePatch): patch is TextPatch {
  return patch.kind === 'title' || patch.kind === 'todo-text'
}

export function textPatchKey(patch: TextPatch): string {
  return patch.kind === 'title'
    ? 'title'
    : `todo-text:${patch.todoId}`
}

export function isNoopTextPatch(patch: TextPatch): boolean {
  return patch.before === patch.after
}

export function mergeTextPatches(
  previous: TextPatch,
  next: TextPatch,
): TextPatch | null {
  if (textPatchKey(previous) !== textPatchKey(next)) {
    return null
  }

  if (previous.after !== next.before) {
    return null
  }

  if (previous.kind === 'title' && next.kind === 'title') {
    return {
      kind: 'title',
      before: previous.before,
      after: next.after,
    }
  }

  if (previous.kind === 'todo-text' && next.kind === 'todo-text') {
    return {
      kind: 'todo-text',
      todoId: previous.todoId,
      before: previous.before,
      after: next.after,
    }
  }

  return null
}

export function clonePatch(patch: NotePatch): NotePatch {
  if (patch.kind === 'todo-add' || patch.kind === 'todo-remove') {
    return {
      ...patch,
      todo: { ...patch.todo },
    }
  }

  return { ...patch }
}
