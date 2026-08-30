import type { Note } from '../../types/note'
import { applyPatch } from './applyPatch'
import {
  clonePatch,
  isNoopTextPatch,
  isTextPatch,
  mergeTextPatches,
  textPatchKey,
  type NotePatch,
  type TextPatch,
} from './patches'

export interface NoteHistoryOptions {
  limit?: number
  coalesceWindowMs?: number
}

interface ActiveTextBatch {
  key: string
  lastTimestamp: number
}

const DEFAULT_LIMIT = 50
const DEFAULT_COALESCE_WINDOW_MS = 500

export class NoteHistory {
  readonly #limit: number
  readonly #coalesceWindowMs: number
  readonly #undoStack: NotePatch[] = []
  readonly #redoStack: NotePatch[] = []
  #activeTextBatch: ActiveTextBatch | null = null

  constructor(options: NoteHistoryOptions = {}) {
    const limit = options.limit ?? DEFAULT_LIMIT
    const coalesceWindowMs = options.coalesceWindowMs
      ?? DEFAULT_COALESCE_WINDOW_MS

    if (!Number.isInteger(limit) || limit < 1) {
      throw new RangeError('History limit must be a positive integer')
    }
    if (!Number.isFinite(coalesceWindowMs) || coalesceWindowMs < 0) {
      throw new RangeError('Coalesce window must be a non-negative number')
    }

    this.#limit = limit
    this.#coalesceWindowMs = coalesceWindowMs
  }

  get canUndo(): boolean {
    return this.#undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.#redoStack.length > 0
  }

  get undoDepth(): number {
    return this.#undoStack.length
  }

  get redoDepth(): number {
    return this.#redoStack.length
  }

  execute(note: Note, patch: NotePatch): void {
    this.finishTextEdit()

    const storedPatch = clonePatch(patch)
    applyPatch(note, storedPatch, 'forward')
    this.#pushUndo(storedPatch)
    this.#redoStack.length = 0
  }

  /**
   * Records text already applied by v-model/input handling.
   * Adjacent changes in the same field share one delta until blur or pause.
   */
  recordTextEdit(patch: NotePatch, timestamp = Date.now()): void {
    if (!isTextPatch(patch)) {
      throw new TypeError('recordTextEdit accepts only title or todo text patches')
    }
    if (isNoopTextPatch(patch)) {
      return
    }

    const storedPatch = clonePatch(patch) as TextPatch
    const key = textPatchKey(storedPatch)
    const active = this.#activeTextBatch
    const elapsed = active ? timestamp - active.lastTimestamp : Infinity
    const previous = this.#undoStack.at(-1)
    const canMerge = Boolean(
      active
      && active.key === key
      && elapsed >= 0
      && elapsed <= this.#coalesceWindowMs
      && previous
      && isTextPatch(previous),
    )

    if (canMerge && previous && isTextPatch(previous)) {
      const merged = mergeTextPatches(previous, storedPatch)
      if (merged) {
        this.#undoStack[this.#undoStack.length - 1] = merged
        this.#activeTextBatch = { key, lastTimestamp: timestamp }
        this.#redoStack.length = 0
        return
      }
    }

    this.#pushUndo(storedPatch)
    this.#redoStack.length = 0
    this.#activeTextBatch = { key, lastTimestamp: timestamp }
  }

  finishTextEdit(): void {
    this.#activeTextBatch = null
  }

  undo(note: Note): boolean {
    this.finishTextEdit()
    const patch = this.#undoStack.pop()
    if (!patch) {
      return false
    }

    try {
      applyPatch(note, patch, 'backward')
    } catch (error) {
      this.#undoStack.push(patch)
      throw error
    }

    this.#redoStack.push(patch)
    return true
  }

  redo(note: Note): boolean {
    this.finishTextEdit()
    const patch = this.#redoStack.pop()
    if (!patch) {
      return false
    }

    try {
      applyPatch(note, patch, 'forward')
    } catch (error) {
      this.#redoStack.push(patch)
      throw error
    }

    this.#pushUndo(patch)
    return true
  }

  reset(): void {
    this.#undoStack.length = 0
    this.#redoStack.length = 0
    this.#activeTextBatch = null
  }

  #pushUndo(patch: NotePatch): void {
    this.#undoStack.push(patch)

    if (this.#undoStack.length > this.#limit) {
      this.#undoStack.splice(0, this.#undoStack.length - this.#limit)
    }
  }
}
