<template>
  <button
    class="base-button"
    :class="`base-button--${variant}`"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'ink' | 'pencil' | 'danger' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
}>(), {
  variant: 'ink',
  type: 'button',
  disabled: false,
})
</script>

<style scoped lang="scss">
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  padding: 0.35rem 0.95rem;
  border: 1.5px solid currentColor;
  border-radius: var(--radius-btn);
  background: var(--sticker);
  box-shadow: 2px 2px 0 rgba(43, 36, 28, 0.12);
  text-decoration: none;
  letter-spacing: 0.01em;
  transition:
    transform var(--duration) ease,
    box-shadow var(--duration) ease;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px dashed var(--focus);
    outline-offset: 3px;
  }

  &:hover:not(:disabled) {
    transform: rotate(-0.5deg) translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translate(1px, 1px);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.45;
    box-shadow: none;
  }
}

.base-button--ink {
  color: var(--sticker);
  background: var(--ink);
  border-color: var(--ink);
}

.base-button--pencil {
  color: var(--pencil);
  background: #efe4c4;
  border-color: var(--pencil-soft);
}

.base-button--danger {
  color: var(--sticker);
  background: var(--burgundy);
  border-color: var(--burgundy-deep);
}

.base-button--ghost {
  color: var(--ink);
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.22em;

  &:hover:not(:disabled) {
    background: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;

    &:hover:not(:disabled),
    &:active:not(:disabled) {
      transform: none;
    }
  }
}
</style>
