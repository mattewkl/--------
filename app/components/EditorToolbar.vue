<template>
  <div class="editor-toolbar" role="toolbar" aria-label="Действия с заметкой">
    <BaseButton :disabled="!canSave" @click="emit('save')">
      Сохранить
    </BaseButton>
    <BaseButton variant="ghost" @click="emit('cancel')">
      Отменить
    </BaseButton>
    <BaseButton variant="danger" @click="emit('remove')">
      Удалить
    </BaseButton>
    <span class="editor-toolbar__gap" aria-hidden="true" />
    <IconButton
      label="Отменить изменение (Ctrl+Z)"
      :disabled="!canUndo"
      @click="emit('undo')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
          d="M9 7H5v4M5.5 11A7 7 0 1 0 7 6.3"
        />
      </svg>
    </IconButton>
    <IconButton
      label="Повторить изменение (Shift+Ctrl+Z)"
      :disabled="!canRedo"
      @click="emit('redo')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
          d="M15 7h4v4M18.5 11A7 7 0 1 1 17 6.3"
        />
      </svg>
    </IconButton>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  canUndo?: boolean
  canRedo?: boolean
  canSave?: boolean
}>(), {
  canUndo: false,
  canRedo: false,
  canSave: true,
})

const emit = defineEmits<{
  save: []
  cancel: []
  remove: []
  undo: []
  redo: []
}>()
</script>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

@media (max-width: 480px) {
  .editor-toolbar :deep(.base-button) {
    flex: 1 1 calc(50% - 0.45rem);
  }
}

.editor-toolbar__gap {
  flex: 1 1 0.5rem;
  min-width: 0.25rem;
}
</style>
