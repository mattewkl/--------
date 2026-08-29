<template>
  <ConfirmDialog
    :open="open"
    title="Восстановить черновик?"
    message="Есть несохранённое редактирование. Можно вернуть его или начать заново."
    confirm-label="Восстановить"
    cancel-label="Отказаться"
    :close-on-backdrop="false"
    @confirm="emit('restore')"
    @cancel="emit('discard')"
    @update:open="emit('update:open', $event)"
  />
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  restore: []
  discard: []
  'update:open': [value: boolean]
}>()
</script>
