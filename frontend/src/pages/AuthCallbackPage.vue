<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserProfileStore } from '@/stores'
import { Spinner } from '@/components/ui/spinner'

const router = useRouter()
const userProfileStore = useUserProfileStore()

onMounted(async () => {
  console.log('[AuthCallback] Checking user profile...')
  
  try {
    const profileExists = await userProfileStore.fetchProfile()
    
    if (!profileExists) {
      // No profile found, redirect to create profile
      console.log('[AuthCallback] No profile found, redirecting to create profile')
      router.replace({ name: 'profile-create' })
      return
    }
    
    console.log("userProfileStore.profile:", userProfileStore.profile)
    // Check if user is banned
    if (userProfileStore.profile?.ban_until) {
      console.log('[AuthCallback] User is banned, redirecting to banned page')
      router.replace({ name: 'banned' })
      return
    }
    
    // Profile exists and user is not banned, redirect to home
    console.log('[AuthCallback] Profile found, redirecting to home')
    router.replace({ name: 'home' })
  } catch (error) {
    // On error, redirect to profile creation to be safe
    console.error('[AuthCallback] Error checking profile:', error)
    router.replace({ name: 'profile-create' })
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="flex flex-col items-center gap-4">
      <Spinner class="h-8 w-8" />
      <p class="text-muted-foreground">Loading your profile...</p>
    </div>
  </div>
</template>
