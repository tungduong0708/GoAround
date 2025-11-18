<script setup lang="ts">
import ThemeToggle from './components/theme/ThemeToggle.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground transition-colors duration-300">
    <header class="fixed top-0 right-0 p-4">
      <ThemeToggle />
    </header>
    <div class="flex justify-center items-center pt-16">
      <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
