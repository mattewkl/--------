<template>
  <a class="skip-link" href="#main">К содержанию</a>
  <div class="notebook">
    <div class="notebook__desk">
      <div class="notebook__holes" aria-hidden="true">
        <span
          v-for="hole in 8"
          :key="hole"
          class="notebook__hole"
        />
      </div>
      <AppHeader/>
      <main id="main" class="notebook__sheet">
        <slot />
      </main>
    </div>
  </div>
</template>
