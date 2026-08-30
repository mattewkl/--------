const TEXT_INPUT_TYPES = new Set([
  '',
  'text',
  'search',
  'password',
  'email',
  'url',
  'tel',
  'number',
])

export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (target == null || typeof HTMLElement === 'undefined') {
    return false
  }

  if (target instanceof HTMLTextAreaElement) {
    return true
  }

  if (target instanceof HTMLInputElement) {
    return TEXT_INPUT_TYPES.has(target.type)
  }

  return target instanceof HTMLElement && target.isContentEditable
}

export function undoRedoFromHotkey(event: KeyboardEvent): 'undo' | 'redo' | null {
  const isZ = event.code === 'KeyZ' || event.key === 'z' || event.key === 'Z'
  if (!isZ || !(event.ctrlKey || event.metaKey) || event.altKey) {
    return null
  }

  return event.shiftKey ? 'redo' : 'undo'
}
