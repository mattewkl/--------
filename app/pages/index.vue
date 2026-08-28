<template>
  <div class="preview">
    <EmptyState>
      <template #title>Страницы ещё чистые</template>
      <template #text>Это каркас тетради: кнопки, пустое состояние и фокус с клавиатуры. Заметки появятся позже.</template>
      <template #action>
        <BaseButton>Новая заметка</BaseButton>
      </template>
    </EmptyState>

    <section class="preview__kit" aria-label="Набор кнопок">
      <BaseButton>Чернила</BaseButton>
      <BaseButton variant="pencil">Карандаш</BaseButton>
      <BaseButton variant="danger">Удалить</BaseButton>
      <BaseButton variant="ghost">Отмена</BaseButton>
      <BaseButton disabled>Нельзя</BaseButton>
      <IconButton label="Добавить пункт">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="1.8"
            d="M12 5v14M5 12h14"
          />
        </svg>
      </IconButton>
      <IconButton label="Удалить" variant="danger">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M5 7h14M10 7V5h4v2m-7 0v12h10V7"
          />
        </svg>
      </IconButton>
    </section>
  </div>
</template>

<style scoped lang="scss">
.preview__kit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin-top: 1.75rem;
  padding-top: 0.35rem;
}
</style>
