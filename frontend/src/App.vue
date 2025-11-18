<script setup lang="ts">
import ThemeToggle from './components/theme/ThemeToggle.vue'
</script>

<template>
 <div class="main-layout"> 
  <!--
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
   <HelloWorld msg="Vite + Vue" />
  -->
    <RouterView class="router-view"/>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;700&display=swap");

html{
  font-family: 'Quicksand', sans-serif;
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}
.router-view {
  flex: 1;
  overflow: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>