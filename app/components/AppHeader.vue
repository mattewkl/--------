<template>
  <header class="app-header">
    <div class="app-header__titles">
      <p class="app-header__kicker">рабочая тетрадь</p>
      <h1 class="app-header__title">
        <slot>Заметки для теста в МКК Небус</slot>
      </h1>
    </div>
    <div v-if="$slots.actions" class="app-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem 1.25rem;
  padding: 0.15rem 0 1.1rem;
  margin-bottom: 0.6rem;
  border-bottom: 1px solid #c9b892;
}

.app-header__kicker {
  color: var(--margin);
  font-family: var(--font-hand);
  font-size: 1.15rem;
  letter-spacing: 0.04em;
}

.app-header__title {
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(2.2rem, 6vw, 3.2rem);
  font-weight: 700;
  line-height: 0.95;
  transform: rotate(-1.2deg);
  transform-origin: left bottom;
}

.app-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (prefers-reduced-motion: reduce) {
  .app-header__title {
    transform: none;
  }
}
</style>
