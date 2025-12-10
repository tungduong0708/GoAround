<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from './components/theme/ThemeToggle.vue'
import AppHeader from './components/Header.vue'

const route = useRoute()
const showHeader = computed(() => route.meta.hideHeader !== true)
</script>

<template>
  <div class="main-layout">
    <AppHeader
      v-if="showHeader"
      class="app-header"
    />
    <div class="content-shell">
      <ThemeToggle class="theme-toggle" />
      <RouterView class="router-view" />
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;700&display=swap");

html {
  font-family: "Quicksand", sans-serif;
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}
.content-shell {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}
.theme-toggle {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 5;
}
.router-view {
  flex: 1;
  overflow: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
}
</style>
