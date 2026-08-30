<template>
  <ConfirmDialog
    :open="open"
    :title="title"
    :message="message"
    confirm-label="Восстановить"
    cancel-label="Отказаться"
    :close-on-backdrop="false"
    @confirm="emit('restore')"
    @cancel="emit('discard')"
    @update:open="emit('update:open', $event)"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title?: string
  message?: string
}>(), {
  title: 'Восстановить черновик?',
  message: 'Есть несохранённое редактирование. Можно вернуть его или начать заново.',
})

const emit = defineEmits<{
  restore: []
  discard: []
  'update:open': [value: boolean]
}>()
</script>
