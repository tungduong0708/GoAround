# Dark/Light Theme System

This project includes a complete dark/light theme system built with Vue 3, Pinia, and Tailwind CSS v4.

## Features

- ✨ **Two theme modes**: Light and Dark
- 💾 **Persistent**: Theme preference is saved to localStorage
- 🎨 **Smooth transitions**: CSS transitions for seamless theme switching
- 🔄 **Reactive**: Theme changes update across all components instantly
- ♿ **Accessible**: Proper ARIA labels and keyboard support
- 📁 **Well-organized**: Types, constants, and helpers in utils folder

## Files Structure

```
src/
├── utils/
│   ├── types/
│   │   └── theme.ts          # Theme type definition
│   ├── constants/
│   │   └── theme.ts          # Theme constants
│   ├── helpers/
│   │   └── theme.ts          # Theme helper functions
│   └── index.ts              # Export all utils
├── stores/
│   ├── index.ts              # Export all stores
│   └── themeStore.ts         # Theme management store (Pinia)
├── composables/
│   └── useTheme.ts           # Theme composable for easy usage
├── components/
│   └── ThemeToggle.vue       # Theme toggle button
└── style.css                 # CSS variables for both themes
```

## Usage

### Theme Toggle

Import and use the theme toggle component:

```vue
<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <ThemeToggle />
</template>
```

### Using the Theme Composable

Access theme state and controls in any component:

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, isDark, isLight, setTheme, toggleTheme } = useTheme()

// Example usage
const handleCustomThemeChange = () => {
  setTheme('dark') // or 'light'
}
</script>

<template>
  <div>
    <p>Current theme: {{ theme }}</p>
    <p>Is dark mode: {{ isDark }}</p>
    
    <button @click="toggleTheme">Toggle Theme</button>
    <button @click="setTheme('light')">Light</button>
    <button @click="setTheme('dark')">Dark</button>
  </div>
</template>
```

### Direct Store Access

If you need direct access to the Pinia store:

```typescript
import { useThemeStore } from '@/stores'

const themeStore = useThemeStore()

// Access state
console.log(themeStore.theme)

// Call actions
themeStore.setTheme('dark')
themeStore.toggleTheme()
```

## CSS Variables

The theme system uses Tailwind CSS v4 with CSS variables defined in `src/style.css`. All color variables automatically update when the theme changes:

### Available Color Variables

- `--background` / `--foreground`
- `--card` / `--card-foreground`
- `--popover` / `--popover-foreground`
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--muted` / `--muted-foreground`
- `--accent` / `--accent-foreground`
- `--destructive` / `--destructive-foreground`
- `--border`
- `--input`
- `--ring`
- Chart colors: `--chart-1` through `--chart-5`
- Sidebar colors: `--sidebar`, `--sidebar-foreground`, etc.

### Using Theme Colors in Components

Use Tailwind's color utilities that reference these variables:

```vue
<template>
  <div class="bg-background text-foreground">
    <div class="bg-card text-card-foreground p-4 rounded-lg">
      <h1 class="text-primary">Themed Content</h1>
      <p class="text-muted-foreground">This text adapts to the theme</p>
      <button class="bg-primary text-primary-foreground">Button</button>
    </div>
  </div>
</template>
```

### Adding Smooth Transitions

Add transitions to elements that should smoothly change when themes switch:

```vue
<template>
  <div class="bg-background text-foreground transition-colors duration-300">
    Content that smoothly transitions between themes
  </div>
</template>
```

## How It Works

1. **Initialization**: When the app starts, `main.ts` initializes the theme store
2. **Detection**: The store checks localStorage for saved preference or uses default (light)
3. **Application**: The appropriate theme class ('dark' or no class) is applied to `<html>`
4. **Persistence**: Theme preference is saved to localStorage
5. **CSS**: Tailwind CSS uses the `.dark` class to apply dark theme variables

## Customizing Theme Colors

To customize the theme colors, edit the CSS variables in `src/style.css`:

```css
:root {
  --background: oklch(1 0 0);  /* Light theme background */
  /* ... other light theme colors */
}

.dark {
  --background: oklch(0.141 0.005 285.823);  /* Dark theme background */
  /* ... other dark theme colors */
}
```

Colors use the OKLCH color space for better perceptual uniformity and vibrant colors.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful fallback to light theme if localStorage is not available

## API Reference

### useTheme() Composable

Returns:
- `theme`: Computed ref of current theme ('light' | 'dark')
- `isDark`: Computed boolean, true if dark theme is active
- `isLight`: Computed boolean, true if light theme is active
- `setTheme(theme)`: Function to set theme preference
- `toggleTheme()`: Function to toggle between light and dark

### useThemeStore() Store

State:
- `theme`: Current theme preference ('light' | 'dark')

Actions:
- `setTheme(theme)`: Set theme and save to localStorage
- `toggleTheme()`: Toggle between light and dark
- `initTheme()`: Initialize theme (called automatically)

### Utils Functions

Located in `src/utils/helpers/theme.ts`:
- `getStoredTheme()`: Get theme from localStorage
- `saveTheme(theme)`: Save theme to localStorage
- `getInitialTheme()`: Get initial theme (from storage or default)
- `applyThemeClass(theme)`: Apply theme class to document
- `getToggledTheme(currentTheme)`: Get opposite theme

## Tips

1. **Always use theme-aware classes**: Use Tailwind's color utilities (e.g., `bg-background`, `text-foreground`) instead of hardcoded colors
2. **Add transitions**: Use `transition-colors duration-300` for smooth theme changes
3. **Test both themes**: Always check your UI in both light and dark modes
4. **Consider contrast**: Ensure good contrast ratios in both themes for accessibility
5. **Use semantic colors**: Prefer `text-foreground` over `text-black` for better theme support

