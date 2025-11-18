# Quick Start Guide - Theme Setup

## What Was Implemented

A complete dark/light theme system has been set up for your Vue 3 + Tailwind CSS project:

### New Files Created:

1. **Utils - Types** (`src/utils/types/theme.ts`)
   - Theme type definition ('light' | 'dark')

2. **Utils - Constants** (`src/utils/constants/theme.ts`)
   - Theme storage key
   - Theme constants (LIGHT, DARK)
   - Default theme
   - Theme colors

3. **Utils - Helpers** (`src/utils/helpers/theme.ts`)
   - `getStoredTheme()` - Get theme from localStorage
   - `saveTheme()` - Save theme to localStorage
   - `getInitialTheme()` - Get initial theme (from storage or default)
   - `applyThemeClass()` - Apply theme class to document
   - `getToggledTheme()` - Toggle between light and dark

4. **Store** (`src/stores/themeStore.ts`)
   - Manages theme state with Pinia
   - Persists theme preference to localStorage
   - Automatically applies theme class to HTML element

5. **Composable** (`src/composables/useTheme.ts`)
   - Easy-to-use composable for accessing theme in components
   - Provides reactive theme state and toggle functions

6. **Component**:
   - `src/components/ThemeToggle.vue` - Button component with icon (using ui/button)

7. **Demo Page** (`src/pages/ThemeDemoPage.vue`)
   - Complete showcase of all theme colors and components
   - Interactive theme controls

### Files Modified:

1. **src/main.ts** - Initialized Pinia and theme store
2. **src/App.vue** - Added theme toggle example
3. **index.html** - Added transition class for smooth theme switching
4. **src/stores/index.ts** - Export theme store

## How to Use

### 1. The Theme Toggle is Already Working!

Open your app and you'll see a theme toggle button in the top-right corner. Click it to switch between light and dark modes.

### 2. Use Theme in Any Component

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, isDark, toggleTheme, setTheme } = useTheme()
</script>

<template>
  <div class="bg-background text-foreground">
    <button @click="toggleTheme">
      Current mode: {{ isDark ? 'Dark' : 'Light' }}
    </button>
    
    <!-- Or set specific theme -->
    <button @click="setTheme('light')">Light Mode</button>
    <button @click="setTheme('dark')">Dark Mode</button>
  </div>
</template>
```

### 3. View the Demo Page

To see all theme features, import and use `ThemeDemoPage.vue`:

```vue
<script setup lang="ts">
import ThemeDemoPage from './pages/ThemeDemoPage.vue'
</script>

<template>
  <ThemeDemoPage />
</template>
```

## Key Features

✅ **Toggle between Light/Dark** - Simple two-state theme system
✅ **Persistent** - Remembers your choice in localStorage  
✅ **Smooth Transitions** - Beautiful animations when switching themes  
✅ **Complete Color System** - All Tailwind colors adapt to the theme  
✅ **TypeScript Support** - Fully typed with TypeScript  
✅ **Accessible** - Proper ARIA labels and keyboard support
✅ **Well-organized Utils** - Types, constants, and helpers in utils folder

## Project Structure

```
src/
├── utils/
│   ├── types/
│   │   ├── theme.ts        # Theme type definition
│   │   └── index.ts        # Export types
│   ├── constants/
│   │   ├── theme.ts        # Theme constants
│   │   └── index.ts        # Export constants
│   ├── helpers/
│   │   ├── theme.ts        # Theme helper functions
│   │   └── index.ts        # Export helpers
│   └── index.ts            # Export all utils
├── stores/
│   ├── themeStore.ts       # Theme Pinia store
│   └── index.ts            # Export stores
├── composables/
│   ├── useTheme.ts         # Theme composable
│   └── index.ts            # Export composables
└── components/
    ├── ThemeToggle.vue     # Theme toggle with ui/button
    └── ThemeToggle.vue     # Theme toggle with ui/button

## Available Theme Classes

Use these Tailwind classes in your components:

**Backgrounds:**
- `bg-background` - Main background
- `bg-card` - Card backgrounds
- `bg-primary` - Primary color
- `bg-secondary` - Secondary color
- `bg-muted` - Muted/subdued backgrounds
- `bg-accent` - Accent/highlight backgrounds

**Text:**
- `text-foreground` - Default text
- `text-muted-foreground` - Subdued text
- `text-primary` - Primary colored text
- `text-destructive` - Error/warning text

**Borders:**
- `border-border` - Default borders
- `border-input` - Input borders

## Testing

1. Start your dev server: `npm run dev`
2. Click the theme toggle button
3. Check that:
   - Theme changes immediately
   - Refresh keeps your preference
   - All colors adapt properly

## Tips

1. Always use semantic color classes like `bg-background` instead of `bg-white`
2. Add `transition-colors duration-300` for smooth color transitions
3. Test your UI in both light and dark modes
4. Use `text-foreground` instead of `text-black` for better theme support

---

**Everything is ready to use! Your app now has a professional dark/light theme system.** 🎨

