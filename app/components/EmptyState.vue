<template>
  <section class="empty-state" aria-labelledby="empty-title">
    <p class="empty-state__mark" aria-hidden="true">*</p>
    <h2 id="empty-title" class="empty-state__title">
      <slot name="title">Пока пусто</slot>
    </h2>
    <p class="empty-state__text">
      <slot name="text">Здесь появятся заметки, как страницы в тетради.</slot>
    </p>
    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.empty-state {
  max-width: 28rem;
  padding: 1.5rem 0 2rem;
}

.empty-state__mark {
  margin-bottom: 0.15rem;
  color: var(--margin);
  font-family: var(--font-hand);
  font-size: 2.4rem;
  line-height: 1;
}

.empty-state__title {
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  line-height: 1.1;
}

.empty-state__text {
  margin-top: 0.4rem;
  color: var(--muted);
  max-width: 34ch;
}

.empty-state__action {
  margin-top: 1.1rem;
}
</style>
