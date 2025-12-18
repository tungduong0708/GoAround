<script setup lang="ts">
import logo from "@/assets/GoAround-logo.svg";
import titleLogo from "@/assets/GoAround-title.svg";
import facebookLogo from "@/assets/facebook-logo.svg";
import pinterestLogo from "@/assets/pinterest-logo.svg";
import instagramLogo from "@/assets/instagram-logo.svg";
import twitterLogo from "@/assets/twitter-logo.svg";

const socialLinks = [
  { name: "Facebook", icon: facebookLogo, url: "https://facebook.com" },
  { name: "Pinterest", icon: pinterestLogo, url: "https://pinterest.com" },
  { name: "Instagram", icon: instagramLogo, url: "https://instagram.com" },
  { name: "Twitter", icon: twitterLogo, url: "https://twitter.com" },
];

const contactInfo = {
  phone: "+123 456 789",
  email: "info@travellian.com",
  address: "1245, New York, USA",
};
</script>

<template>
  <footer
    class="mt-auto bg-gray-200 dark:bg-gray-800 border-t border-border px-4 py-8"
  >
    <div class="mx-auto max-w-6xl">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <!-- Brand Section - Centered -->
        <div class="flex justify-center md:justify-start">
          <div class="flex items-center gap-4">
            <span class="flex items-center justify-center w-20 h-20">
              <img
                :src="logo"
                alt="GoAround Logo"
                class="w-full h-full object-contain"
              />
            </span>
            <span class="flex items-center h-24">
              <img
                :src="titleLogo"
                alt="GoAround"
                class="h-full w-auto object-contain dark:invert"
              />
            </span>
          </div>
        </div>

        <!-- Contact Info Section -->
        <div class="flex flex-col items-center gap-3">
          <h3 class="text-base font-semibold text-foreground">Contact Info</h3>
          <ul class="flex flex-col gap-2">
            <li class="flex items-center gap-1 text-sm text-muted-foreground">
              <span class="w-5 text-center">📞</span>
              <span>{{ contactInfo.phone }}</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-muted-foreground">
              <span class="w-5 text-center">✉️</span>
              <span>{{ contactInfo.email }}</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-muted-foreground">
              <span class="w-5 text-center">📍</span>
              <span>{{ contactInfo.address }}</span>
            </li>
          </ul>
        </div>

        <!-- Social Links Section -->
        <div class="flex flex-col items-center md:items-end gap-3">
          <h3 class="text-base font-semibold text-foreground">Follow us on</h3>
          <div class="flex gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              :aria-label="social.name"
              class="flex items-center justify-center w-9 h-9 rounded-full bg-foreground hover:bg-primary hover:scale-110 transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                :src="social.icon"
                :alt="social.name"
                class="w-4 h-4 invert dark:invert-0"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Copyright Section -->
      <div class="mt-2 pt-2 border-t border-border/50 text-center">
        <p class="text-sm text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} GoAround. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
