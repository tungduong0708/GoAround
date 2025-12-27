<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";

import { headerNavLinks } from "@/utils/constants/headerRoutes";
import { useHeader } from "@/composables";
import logo from "@/assets/GoAround-logo.svg";
import titleLogo from "@/assets/GoAround-title.svg";
import ThemeToggle from "./theme/ThemeToggle.vue";

// Dropdown state and logic

const {
  isAuthenticated,
  showDropdown,
  avatarUrl,
  profileLink,
  profileLabel,
  profileSubtext,
  initials,
  accountType,
  handleProfile,
  handleManagePlaces,
  handleLogout,
} = useHeader();

</script>
<template>
  <header
    class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
  >
    <div class="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
      <RouterLink
        class="flex items-center gap-3 text-xl font-semibold text-foreground"
        :to="{ name: 'home' }"
      >
        <span class="flex size-12 items-center justify-center">
          <img :src="logo" alt="GoAround Logo" />
        </span>
        <span class="flex h-16 items-center">
          <img
            :src="titleLogo"
            alt="GoAround"
            class="h-full w-auto object-contain dark:invert"
          />
        </span>
      </RouterLink>

      <NavigationMenu class="hidden flex-1 justify-center md:flex">
        <NavigationMenuList class="flex items-center gap-1">
          <NavigationMenuItem v-for="link in headerNavLinks" :key="link.label">
            <RouterLink
              v-slot="{ href, navigate, isActive }"
              :to="link.to"
              custom
            >
              <NavigationMenuLink
                :href="href"
                :data-active="isActive ? 'true' : undefined"
                :aria-current="isActive ? 'page' : undefined"
                :class="
                  cn(
                    navigationMenuTriggerStyle(),
                    'text-sm font-medium text-muted-foreground transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm'
                  )
                "
                @click="navigate"
              >
                {{ link.label }}
              </NavigationMenuLink>
            </RouterLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div class="ml-auto flex items-center gap-2">
        <div class="hidden h-6 w-px bg-border/60 lg:block" />

        <ThemeToggle />

        <div class="relative" v-if="isAuthenticated">
          <Button
            variant="ghost"
            class="h-auto rounded-full px-1 py-0.5"
            @click="showDropdown = !showDropdown"
          >
            <span class="flex items-center gap-2 px-2 py-1">
              <Avatar class="size-10 border">
                <AvatarImage
                  v-if="avatarUrl"
                  :src="avatarUrl"
                  :alt="profileLabel"
                />
                <AvatarFallback>{{ initials }}</AvatarFallback>
              </Avatar>
              <div class="hidden text-left text-sm sm:flex sm:flex-col">
                <span class="font-semibold leading-tight">{{ profileLabel }}</span>
                <span class="text-xs text-muted-foreground">{{ profileSubtext }}</span>
              </div>
            </span>
          </Button>
          <transition name="fade">
            <div
              v-if="showDropdown"
              class="absolute right-0 mt-2 w-40 rounded-md border bg-popover shadow-lg z-50"
              @click.outside="showDropdown = false"
            >
              <ul class="py-1">
                <li>
                  <button
                    class="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                    @click="handleProfile"
                  >
                    Profile
                  </button>
                </li>
                <li v-if="accountType === 'business'">
                  <button
                    class="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                    @click="handleManagePlaces"
                  >
                    Manage Places
                  </button>
                </li>
                <li>
                  <button
                    class="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                    @click="handleLogout"
                  >
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          </transition>
        </div>

        <Button
          v-else
          variant="ghost"
          class="h-auto rounded-full px-1 py-0.5"
          :as-child="true"
        >
          <RouterLink :to="profileLink" class="flex items-center gap-2 px-2 py-1">
            <Avatar class="size-10 border">
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
