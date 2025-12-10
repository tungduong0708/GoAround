<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";
import { useTheme } from "@/composables/useTheme.ts";
import { Button } from "@/components/ui/button";

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    @click="toggleTheme"
    :title="theme === 'dark' ? 'Dark Mode' : 'Light Mode'"
    class="theme-toggle"
  >
    <Sun v-if="theme === 'light'" class="h-5 w-5 transition-all" />
    <Moon v-else class="h-5 w-5 transition-all" />
    <span class="sr-only">{{
      theme === "dark" ? "Dark Mode" : "Light Mode"
    }}</span>
  </Button>
</template>

<style scoped>
.theme-toggle {
  transition: transform 0.2s ease;
}

.theme-toggle:active {
  transform: scale(0.95);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
