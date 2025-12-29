<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "./components/Header.vue";
import AppFooter from "./components/Footer.vue";
import { Toaster } from "@/components/ui/sonner";

const route = useRoute();
const showHeader = computed(() => route.meta.hideHeader !== true);
const showFooter = computed(() => route.meta.hideFooter !== true);
</script>

<template>
  <div class="main-layout">
    <AppHeader v-if="showHeader" class="app-header" />
    <div class="content-shell">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
      <AppFooter v-if="showFooter" />
      <Toaster position="top-right" rich-colors />
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

.router-view {
  flex: 1 0 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
