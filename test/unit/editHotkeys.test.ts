import { describe, expect, it } from 'vitest'
import { undoRedoFromHotkey } from '../../app/utils/editHotkeys'

function hotkey(partial: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key: 'z',
    code: 'KeyZ',
    ctrlKey: true,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...partial,
  } as KeyboardEvent
}

describe('undoRedoFromHotkey', () => {
  it('maps Ctrl+Z and Cmd+Z to undo', () => {
    expect(undoRedoFromHotkey(hotkey())).toBe('undo')
    expect(undoRedoFromHotkey(hotkey({ ctrlKey: false, metaKey: true }))).toBe('undo')
  })

  it('maps Shift+Ctrl+Z to redo', () => {
    expect(undoRedoFromHotkey(hotkey({ shiftKey: true }))).toBe('redo')
  })

  it('recognizes the physical Z key on a Russian layout', () => {
    expect(undoRedoFromHotkey(hotkey({ key: 'я', code: 'KeyZ' }))).toBe('undo')
    expect(undoRedoFromHotkey(hotkey({ key: 'я', code: 'KeyZ', shiftKey: true }))).toBe('redo')
  })

  it('ignores other keys and Alt combinations', () => {
    expect(undoRedoFromHotkey(hotkey({ key: 'y', code: 'KeyY' }))).toBeNull()
    expect(undoRedoFromHotkey(hotkey({ altKey: true }))).toBeNull()
    expect(undoRedoFromHotkey(hotkey({ ctrlKey: false, metaKey: false }))).toBeNull()
  })
})
