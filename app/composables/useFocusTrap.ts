const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function isVisible(element: HTMLElement): boolean {
  return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible)
}

export function useFocusTrap(
  container: MaybeRefOrGetter<HTMLElement | null>,
  active: MaybeRefOrGetter<boolean>,
  onEscape?: () => void,
) {
  let previousFocus: HTMLElement | null = null

  function focusFirst(): void {
    const root = toValue(container)
    if (!root) {
      return
    }

    root.focus()
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!toValue(active)) {
      return
    }

    const root = toValue(container)
    if (!root) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onEscape?.()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusable = getFocusableElements(root)
    if (focusable.length === 0) {
      event.preventDefault()
      root.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) {
      event.preventDefault()
      root.focus()
      return
    }

    const current = document.activeElement

    if (event.shiftKey && (current === first || !root.contains(current))) {
      event.preventDefault()
      last.focus()
      return
    }

    if (!event.shiftKey && (current === last || !root.contains(current))) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(
    () => toValue(active),
    (isActive) => {
      if (isActive) {
        previousFocus = document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
        document.addEventListener('keydown', onKeydown, true)
        document.body.style.overflow = 'hidden'
        nextTick(() => {
          focusFirst()
        })
        return
      }

      document.removeEventListener('keydown', onKeydown, true)
      document.body.style.overflow = ''
      if (previousFocus?.isConnected) {
        previousFocus.focus()
      }
      previousFocus = null
    },
  )

  onUnmounted(() => {
    document.removeEventListener('keydown', onKeydown, true)
    document.body.style.overflow = ''
  })
}
