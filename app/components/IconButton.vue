<template>
  <button
    class="icon-button"
    :class="`icon-button--${variant}`"
    type="button"
    :aria-label="label"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  variant?: 'ink' | 'pencil' | 'danger'
  disabled?: boolean
}>(), {
  variant: 'pencil',
  disabled: false,
})
</script>

<style scoped lang="scss">
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1.5px solid var(--line);
  border-radius: 3px;
  background: var(--sticker);
  color: var(--ink);
  box-shadow: 1px 1px 0 rgba(43, 36, 28, 0.1);
  transition: transform var(--duration) ease;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px dashed var(--focus);
    outline-offset: 3px;
  }

  &:hover:not(:disabled) {
    transform: rotate(3deg);
  }

  &:disabled {
    opacity: 0.45;
  }

  :deep(svg) {
    width: 1.15rem;
    height: 1.15rem;
  }
}

.icon-button--ink {
  color: var(--ink);
}

.icon-button--danger {
  color: var(--burgundy);
  border-color: #e0b8b4;
}

@media (prefers-reduced-motion: reduce) {
  .icon-button {
    transition: none;

    &:hover:not(:disabled) {
      transform: none;
    }
  }
}
</style>
