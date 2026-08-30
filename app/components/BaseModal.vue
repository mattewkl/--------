<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-root"
    >
      <div
        class="modal-root__backdrop"
        @click="onBackdropClick"
      />
      <div
        ref="panelRef"
        class="modal-root__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        tabindex="-1"
      >
        <header class="modal-root__header">
          <h2 :id="titleId" class="modal-root__title">
            <slot name="title">{{ title }}</slot>
          </h2>
          <IconButton
            label="Закрыть"
            @click="close"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="1.8"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </IconButton>
        </header>
        <div class="modal-root__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal-root__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  descriptionId?: string
  closeOnBackdrop?: boolean
}>(), {
  title: 'Диалог',
  descriptionId: undefined,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
  'update:open': [value: boolean]
}>()

const panelRef = ref<HTMLElement | null>(null)
const titleId = useId()

function close(): void {
  emit('update:open', false)
  emit('close')
}

function onBackdropClick(): void {
  if (props.closeOnBackdrop) {
    close()
  }
}

useFocusTrap(panelRef, () => props.open, close)
</script>

<style scoped lang="scss">
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.modal-root__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(62, 46, 24, 0.42);
}

.modal-root__panel {
  position: relative;
  width: min(28rem, 100%);
  padding: 1rem 1.1rem 1.15rem;
  background: var(--sticker);
  border: 1.5px solid #c9b892;
  box-shadow: 6px 8px 0 rgba(43, 36, 28, 0.14);
  transform: rotate(-0.6deg);
}

.modal-root__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
}

.modal-root__title {
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 1.85rem;
  font-weight: 700;
  line-height: 1.1;
}

.modal-root__body {
  color: var(--text);
}

.modal-root__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.1rem;
}

@media (prefers-reduced-motion: reduce) {
  .modal-root__panel {
    transform: none;
  }
}
</style>
