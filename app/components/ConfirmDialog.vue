<template>
  <BaseModal
    :open="open"
    :title="title"
    :description-id="descriptionId"
    :close-on-backdrop="closeOnBackdrop"
    @close="cancel"
  >
    <p :id="descriptionId" class="confirm-dialog__message">
      <slot>{{ message }}</slot>
    </p>
    <template #footer>
      <BaseButton variant="ghost" @click="cancel">
        {{ cancelLabel }}
      </BaseButton>
      <BaseButton :variant="danger ? 'danger' : 'ink'" @click="confirm">
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
const descriptionId = useId()

withDefaults(defineProps<{
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  closeOnBackdrop?: boolean
}>(), {
  message: '',
  confirmLabel: 'Подтвердить',
  cancelLabel: 'Отмена',
  danger: false,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  close: []
  'update:open': [value: boolean]
}>()

function cancel(): void {
  emit('update:open', false)
  emit('cancel')
  emit('close')
}

function confirm(): void {
  emit('confirm')
  emit('update:open', false)
}
</script>

<style scoped lang="scss">
.confirm-dialog__message {
  max-width: 36ch;
  color: var(--muted);
}
</style>
