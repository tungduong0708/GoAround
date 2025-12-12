<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";
import { useTheme } from "@/composables/useTheme.ts";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="outline"
          size="icon"
          @click="toggleTheme"
          class="theme-toggle relative flex-shrink-0 overflow-hidden rounded-lg border-2"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-pressed="isDark"
        >
          <!-- Sun Icon - visible in light mode -->
          <Sun
            class="theme-icon absolute h-[1.2rem] w-[1.2rem] text-chart-5 drop-shadow-sm transition-all duration-300 ease-out"
            :class="
              isDark
                ? 'rotate-90 scale-0 opacity-0'
                : 'rotate-0 scale-100 opacity-100'
            "
          />
          <!-- Moon Icon - visible in dark mode -->
          <Moon
            class="theme-icon absolute h-[1.2rem] w-[1.2rem] text-chart-1 drop-shadow-sm transition-all duration-300 ease-out"
            :class="
              isDark
                ? 'rotate-0 scale-100 opacity-100'
                : '-rotate-90 scale-0 opacity-0'
            "
          />
          <span class="sr-only">
            {{ isDark ? "Switch to light mode" : "Switch to dark mode" }}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" :side-offset="8">
        <p>{{ isDark ? "Switch to light mode" : "Switch to dark mode" }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<style scoped>
.theme-toggle {
  border-color: var(--input);
  background-color: var(--background);
  transition: transform 0.15s ease, background-color 0.15s ease,
    border-color 0.15s ease, box-shadow 0.15s ease;
}

.theme-toggle:hover {
  border-color: var(--ring);
  background-color: var(--secondary);
}

.theme-toggle:active {
  transform: scale(0.92);
  background-color: var(--muted);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-toggle:focus-visible {
  outline: none;
  border-color: var(--ring);
  box-shadow: 0 0 0 2px var(--ring);
}

.theme-icon {
  will-change: transform, opacity;
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
