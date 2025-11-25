<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { Button } from '@/components/ui/button'

const { theme, isDark, isLight, setTheme } = useTheme()
</script>

<template>
  <div class="min-h-screen bg-background text-foreground transition-colors duration-300">
    <div class="container mx-auto p-8 max-w-4xl">
      <header class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-4xl font-bold">Theme Demo</h1>
        </div>
        <p class="text-muted-foreground">
          Demonstrating the dark/light theme system
        </p>
      </header>

      <main class="space-y-8">
        <!-- Theme Information -->
        <section class="bg-card text-card-foreground p-6 rounded-lg border">
          <h2 class="text-2xl font-semibold mb-4">Current Theme</h2>
          <div class="space-y-2">
            <p><strong>Theme:</strong> {{ theme }}</p>
            <p><strong>Is Dark Mode:</strong> {{ isDark }}</p>
            <p><strong>Is Light Mode:</strong> {{ isLight }}</p>
          </div>
        </section>

        <!-- Theme Controls -->
        <section class="bg-card text-card-foreground p-6 rounded-lg border">
          <h2 class="text-2xl font-semibold mb-4">Theme Controls</h2>
          <div class="flex gap-3">
            <Button
              @click="setTheme('light')"
              :variant="theme === 'light' ? 'default' : 'outline'"
            >
              Light
            </Button>
            <Button
              @click="setTheme('dark')"
              :variant="theme === 'dark' ? 'default' : 'outline'"
            >
              Dark
            </Button>
          </div>
        </section>

        <!-- Color Showcase -->
        <section class="bg-card text-card-foreground p-6 rounded-lg border">
          <h2 class="text-2xl font-semibold mb-4">Color Palette</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-background text-foreground p-4 rounded border">
              <p class="font-semibold">Background / Foreground</p>
              <p class="text-sm text-muted-foreground">Default page background</p>
            </div>
            <div class="bg-card text-card-foreground p-4 rounded border">
              <p class="font-semibold">Card</p>
              <p class="text-sm text-muted-foreground">Card containers</p>
            </div>
            <div class="bg-primary text-primary-foreground p-4 rounded">
              <p class="font-semibold">Primary</p>
              <p class="text-sm">Primary actions</p>
            </div>
            <div class="bg-secondary text-secondary-foreground p-4 rounded">
              <p class="font-semibold">Secondary</p>
              <p class="text-sm">Secondary actions</p>
            </div>
            <div class="bg-muted text-muted-foreground p-4 rounded">
              <p class="font-semibold">Muted</p>
              <p class="text-sm">Subdued content</p>
            </div>
            <div class="bg-accent text-accent-foreground p-4 rounded">
              <p class="font-semibold">Accent</p>
              <p class="text-sm">Highlighted content</p>
            </div>
            <div class="bg-destructive text-destructive-foreground p-4 rounded">
              <p class="font-semibold">Destructive</p>
              <p class="text-sm">Dangerous actions</p>
            </div>
          </div>
        </section>

        <!-- Button Variants -->
        <section class="bg-card text-card-foreground p-6 rounded-lg border">
          <h2 class="text-2xl font-semibold mb-4">Button Variants</h2>
          <div class="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        <!-- Text Colors -->
        <section class="bg-card text-card-foreground p-6 rounded-lg border">
          <h2 class="text-2xl font-semibold mb-4">Text Colors</h2>
          <div class="space-y-2">
            <p class="text-foreground">Default text (foreground)</p>
            <p class="text-muted-foreground">Muted text</p>
            <p class="text-primary">Primary colored text</p>
            <p class="text-secondary-foreground">Secondary text</p>
            <p class="text-destructive">Destructive/Error text</p>
          </div>
        </section>

        <!-- Borders and Inputs -->
        <section class="bg-card text-card-foreground p-6 rounded-lg border">
          <h2 class="text-2xl font-semibold mb-4">Forms</h2>
          <div class="space-y-4">
            <input
              type="text"
              placeholder="Text input"
              class="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              placeholder="Textarea"
              class="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              rows="3"
            ></textarea>
            <select class="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

