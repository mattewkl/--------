<template>
  <div class="ui-page">
    <p class="ui-page__back">
      <NuxtLink to="/">← к заметкам</NuxtLink>
    </p>

    <h2 class="ui-page__heading">Каталог UI</h2>
    <p class="ui-page__lead">Все переиспользуемые компоненты. Модалки проверяйте только с клавиатуры: Tab, Shift+Tab, Escape.</p>

    <section class="ui-section" aria-labelledby="ui-header">
      <h3 id="ui-header" class="ui-section__title">AppHeader</h3>
      <div class="ui-section__demo">
        <AppHeader>
          Пример заголовка
          <template #actions>
            <BaseButton variant="pencil">Действие</BaseButton>
          </template>
        </AppHeader>
      </div>
    </section>

    <section class="ui-section" aria-labelledby="ui-buttons">
      <h3 id="ui-buttons" class="ui-section__title">BaseButton</h3>
      <div class="ui-section__row">
        <BaseButton>Чернила</BaseButton>
        <BaseButton variant="pencil">Карандаш</BaseButton>
        <BaseButton variant="danger">Удалить</BaseButton>
        <BaseButton variant="ghost">Отмена</BaseButton>
        <BaseButton disabled>Нельзя</BaseButton>
      </div>
    </section>

    <section class="ui-section" aria-labelledby="ui-icons">
      <h3 id="ui-icons" class="ui-section__title">IconButton</h3>
      <div class="ui-section__row">
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
        <IconButton label="Недоступно" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.8"
              d="M5 12h14"
            />
          </svg>
        </IconButton>
      </div>
    </section>

    <section class="ui-section" aria-labelledby="ui-empty">
      <h3 id="ui-empty" class="ui-section__title">EmptyState</h3>
      <EmptyState>
        <template #title>Пустой лист</template>
        <template #text>Слот текста и слот действия.</template>
        <template #action>
          <BaseButton>Что-нибудь сделать</BaseButton>
        </template>
      </EmptyState>
    </section>

    <section class="ui-section" aria-labelledby="ui-modals">
      <h3 id="ui-modals" class="ui-section__title">BaseModal и ConfirmDialog</h3>
      <div class="ui-section__row">
        <BaseButton variant="pencil" @click="modalOpen = true">
          Открыть модалку
        </BaseButton>
        <BaseButton variant="danger" @click="confirmOpen = true">
          Открыть подтверждение
        </BaseButton>
      </div>
      <p v-if="lastAction" class="ui-section__note">Последнее действие: {{ lastAction }}</p>
    </section>

    <BaseModal v-model:open="modalOpen" title="Листок поверх тетради">
      <p>Tab ходит только внутри окна. Escape и клик по полю закрывают его. Фокус вернётся на кнопку.</p>
      <template #footer>
        <BaseButton variant="ghost" @click="modalOpen = false">Закрыть</BaseButton>
        <BaseButton @click="modalOpen = false">Понятно</BaseButton>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Удалить черновик?"
      message="Это учебный диалог. Подтверждение без alert()."
      confirm-label="Удалить"
      danger
      @confirm="lastAction = 'подтвердили'"
      @cancel="lastAction = 'отменили'"
    />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Каталог UI',
})

const modalOpen = ref(false)
const confirmOpen = ref(false)
const lastAction = ref('')
</script>

<style scoped lang="scss">
.ui-page__back {
  margin-bottom: 0.35rem;
  font-size: 0.95rem;
}

.ui-page__back a {
  color: var(--ink-soft);
}

.ui-page__heading {
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  line-height: 1.1;
}

.ui-page__lead {
  max-width: 42ch;
  margin: 0.25rem 0 1.25rem;
  color: var(--muted);
}

.ui-section {
  margin-bottom: 1.75rem;
}

.ui-section__title {
  margin-bottom: 0.55rem;
  color: var(--pencil);
  font-family: var(--font-hand);
  font-size: 1.35rem;
  font-weight: 500;
}

.ui-section__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
}

.ui-section__demo {
  padding: 0.25rem 0;
}

.ui-section__note {
  margin-top: 0.6rem;
  color: var(--muted);
}
</style>
