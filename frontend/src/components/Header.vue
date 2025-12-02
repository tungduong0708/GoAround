<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import { headerNavLinks } from '@/utils/constants/header_routes'
import { useHeader } from '@/composables'


const props = withDefaults(defineProps<{
  isAuthenticated?: boolean
  displayName?: string, 
  avatarUrl?: string
}>(), {
  isAuthenticated: false,
  displayName: 'Guest',
  avatarUrl: ''
})

const { profileLink, profileLabel, profileSubtext, initials } = useHeader(props)
</script>
<template>
  <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
    <div class="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
      <RouterLink
        class="flex items-center gap-3 text-xl font-semibold text-foreground"
        :to="{ name: 'home' }"
      >
        <span class="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-primary text-lg text-white shadow-md">🌐</span>
        <span class="flex items-baseline gap-1">
          <span>Go</span>
          <span class="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Around</span>
        </span>
      </RouterLink>

      <NavigationMenu class="hidden flex-1 justify-center md:flex">
        <NavigationMenuList class="flex items-center gap-1">
          <NavigationMenuItem v-for="link in headerNavLinks" :key="link.label">
            <RouterLink v-slot="{ href, navigate, isActive }" :to="link.to" custom>
              <NavigationMenuLink
                :href="href"
                  :data-active="isActive ? 'true' : undefined"
                  :aria-current="isActive ? 'page' : undefined"
                  :class="cn(
                    navigationMenuTriggerStyle(),
                    'text-sm font-medium text-muted-foreground transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm'
                  )"
                @click="navigate"
              >
                {{ link.label }}
              </NavigationMenuLink>
            </RouterLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div class="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          class="hidden rounded-full px-4 font-semibold lg:inline-flex"
          :as-child="true"
        >
          <RouterLink :to="{ name: 'search' }">
            Search
          </RouterLink>
        </Button>

        <Button variant="outline" size="sm" class="rounded-full px-3">
          EN
        </Button>

        <Button
          variant="ghost"
          class="h-auto rounded-full px-1 py-0.5"
          :as-child="true"
        >
          <RouterLink :to="profileLink" class="flex items-center gap-2 px-2 py-1">
            <Avatar class="size-10 border">
              <AvatarImage v-if="props.avatarUrl" :src="props.avatarUrl" :alt="profileLabel" />
              <AvatarFallback>{{ initials }}</AvatarFallback>
            </Avatar>
            <div class="hidden text-left text-sm sm:flex sm:flex-col">
              <span class="font-semibold leading-tight">{{ profileLabel }}</span>
              <span class="text-xs text-muted-foreground">{{ profileSubtext }}</span>
            </div>
          </RouterLink>
        </Button>
      </div>
    </div>
  </header>
</template>
