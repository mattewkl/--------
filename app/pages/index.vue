<template>
  <EmptyState>
    <template #title>Страницы ещё чистые</template>
    <template #text>
      Здесь будет список заметок. Набор компонентов лежит отдельно, на странице каталога.
    </template>
    <template #action>
      <NuxtLink to="/ui" class="home-link">Каталог UI</NuxtLink>
    </template>
  </EmptyState>
</template>

<style scoped lang="scss">
.home-link {
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 1.35rem;
  text-underline-offset: 0.18em;
}
</style>
