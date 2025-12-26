<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useUserProfileStore } from '@/stores'
import { UserService } from '@/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Building2, Upload } from 'lucide-vue-next'
import type { IUserCreate } from '@/utils/interfaces'

const router = useRouter()
const authStore = useAuthStore()
const userProfileStore = useUserProfileStore()

// Form state
const accountType = ref<'traveler' | 'business'>('traveler')
const username = ref('')
const fullName = ref('')
const avatarUrl = ref('')
const businessImageUrl = ref('')
const businessDescription = ref('')

// UI state
const isLoading = ref(false)
const errorMessage = ref('')

// Computed
const userEmail = computed(() => authStore.user?.email || '')
const isFormValid = computed(() => {
  const basicValid = username.value.trim() !== '' && fullName.value.trim() !== ''
  if (accountType.value === 'business') {
    return basicValid && businessImageUrl.value.trim() !== '' && businessDescription.value.trim() !== ''
  }
  return basicValid
})

const initials = computed(() => {
  if (!fullName.value) return 'U'
  return fullName.value
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Actions
const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const payload: IUserCreate = {
      username: username.value.trim(),
      full_name: fullName.value.trim(),
      avatar_url: avatarUrl.value.trim() || null,
      signup_type: accountType.value,
    }

    if (accountType.value === 'business') {
      payload.business_image_url = businessImageUrl.value.trim()
      payload.business_description = businessDescription.value.trim()
    }

    const createdProfile = await UserService.createUser(payload)
    
    // Update profile store with the newly created profile
    userProfileStore.updateProfile(createdProfile)
    
    // Navigate to home after successful profile creation
    router.push({ name: 'home' })
  } catch (error: any) {
    console.error('Profile creation failed:', error)
    errorMessage.value = error?.message || 'Failed to create profile. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const selectAccountType = (type: 'traveler' | 'business') => {
  accountType.value = type
}
</script>

<template>
  <div class="flex-1 w-full bg-background text-foreground px-4 py-12 sm:py-16 flex flex-col items-center gap-6">
    <div class="flex flex-col items-center gap-3 text-center">
      <Avatar class="h-16 w-16 bg-primary/10">
        <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="fullName || 'User'" />
        <AvatarFallback class="text-primary text-2xl">
          {{ initials }}
        </AvatarFallback>
      </Avatar>
      <h1 class="text-3xl font-bold text-foreground">Complete Your Profile</h1>
      <p class="text-sm text-muted-foreground max-w-md">
        Set up your {{ accountType === 'business' ? 'business' : '' }} profile and provide verification documents
      </p>
      <p class="text-sm text-muted-foreground">{{ userEmail }}</p>
    </div>

    <Card class="w-full max-w-2xl border border-border bg-card text-card-foreground shadow-xl">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">Profile Information</CardTitle>
        <CardDescription>Complete the form below to finish setting up your account</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Account Type -->
          <div class="space-y-3">
            <Label class="text-sm font-medium">
              Account Type <span class="text-destructive">*</span>
            </Label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="selectAccountType('traveler')"
                :class="[
                  'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                  accountType === 'traveler'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary/50'
                ]"
              >
                <User :size="32" :class="accountType === 'traveler' ? 'text-primary' : 'text-muted-foreground'" />
                <div class="text-center">
                  <div class="font-semibold text-foreground">Traveler</div>
                  <div class="text-xs text-muted-foreground">Explore and plan trips</div>
                </div>
              </button>

              <button
                type="button"
                @click="selectAccountType('business')"
                :class="[
                  'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                  accountType === 'business'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary/50'
                ]"
              >
                <Building2 :size="32" :class="accountType === 'business' ? 'text-primary' : 'text-muted-foreground'" />
                <div class="text-center">
                  <div class="font-semibold text-foreground">Business</div>
                  <div class="text-xs text-muted-foreground">Manage your places</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Username -->
          <div class="space-y-2">
            <Label for="username" class="text-sm font-medium">
              Username <span class="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="johndoe123"
              :disabled="isLoading"
              required
            />
          </div>

          <!-- Full Name -->
          <div class="space-y-2">
            <Label for="fullName" class="text-sm font-medium">
              Full Name <span class="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              v-model="fullName"
              type="text"
              placeholder="John Doe"
              :disabled="isLoading"
              required
            />
          </div>

          <!-- Avatar URL -->
          <div class="space-y-2">
            <Label for="avatarUrl" class="text-sm font-medium">
              Avatar URL <span class="text-muted-foreground">(Optional)</span>
            </Label>
            <div class="flex gap-2">
              <Input
                id="avatarUrl"
                v-model="avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                :disabled="isLoading"
                class="flex-1"
              />
              <Button type="button" variant="outline" size="icon" :disabled="isLoading">
                <Upload :size="16" />
              </Button>
            </div>
          </div>

          <!-- Business Verification (shown only for business accounts) -->
          <div v-if="accountType === 'business'" class="space-y-4 pt-4 border-t">
            <h3 class="text-lg font-semibold">Business Verification</h3>

            <div class="space-y-2">
              <Label for="businessImageUrl" class="text-sm font-medium">
                Business Image URL <span class="text-destructive">*</span>
              </Label>
              <div class="flex gap-2">
                <Input
                  id="businessImageUrl"
                  v-model="businessImageUrl"
                  type="url"
                  placeholder="https://example.com/business-document.jpg"
                  :disabled="isLoading"
                  class="flex-1"
                  required
                />
                <Button type="button" variant="outline" size="icon" :disabled="isLoading">
                  <Upload :size="16" />
                </Button>
              </div>
              <p class="text-xs text-muted-foreground">
                Upload a business registration document or license
              </p>
            </div>

            <div class="space-y-2">
              <Label for="businessDescription" class="text-sm font-medium">
                Business Description <span class="text-destructive">*</span>
              </Label>
              <Textarea
                id="businessDescription"
                v-model="businessDescription"
                placeholder="Describe your business, the places you manage, and your verification details..."
                :disabled="isLoading"
                rows="4"
                required
              />
              <p class="text-xs text-muted-foreground">
                Provide details about your business for verification purposes
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <p v-if="errorMessage" class="text-sm text-destructive">
            {{ errorMessage }}
          </p>

          <!-- Submit Button -->
          <Button
            type="submit"
            class="w-full font-semibold"
            :disabled="!isFormValid || isLoading"
          >
            <Spinner v-if="isLoading" class="mr-2" aria-hidden="true" />
            <span v-if="isLoading">Creating profile...</span>
            <span v-else>Create Profile</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
</style>
