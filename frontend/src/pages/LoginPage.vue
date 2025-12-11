<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// 1. Removed unnecessary Vee-Validate component imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useLoginForm } from '@/composables'

const {
  email,
  password,
  rememberMe,
  isLoading,
  errors,
  isFormValid,
  handleGoogleLogin,
  onSubmit,
} = useLoginForm()
</script>

<template>
  <div class="min-h-screen w-full bg-background text-foreground px-4 py-12 sm:py-16 flex flex-col items-center gap-6">
    <div class="flex flex-col items-center gap-3 text-center">
      <img src="@/assets/GoAround-logo.svg" alt="GoAround" class="h-12 w-12"/>
      <h1 class="text-2xl font-semibold text-foreground">Sign in to GoAround</h1>
      <p class="text-sm text-muted-foreground">Access your saved trips and forums</p>
    </div>

    <Card class="w-full max-w-md border border-border bg-card text-card-foreground shadow-xl shadow-foreground/5">
      <CardHeader class="space-y-1 text-center">
        <CardTitle class="text-xl font-semibold">Welcome back</CardTitle>
        <CardDescription>Sign in with Google or your email and password.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <Button
          class="w-full gap-2 font-semibold text-foreground"
          variant="outline"
          :disabled="isLoading"
          @click="handleGoogleLogin"
        >
          <img src="@/assets/google-logo.svg" alt="Google" class="h-4 w-4"/>
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Continue with Google</span>
        </Button>

        <div class="flex items-center gap-3 text-sm text-muted-foreground">
          <Separator class="flex-1" />
          <span>or</span>
          <Separator class="flex-1" />
        </div>

        <form class="space-y-5" @submit.prevent="onSubmit">
          
          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">Email</Label>
            <Input
              v-model="email"
              id="email"
              type="email"
              autocomplete="email"
              placeholder="username@example.com"
              :disabled="isLoading"
              :class="errors.email ? 'border-destructive focus-visible:ring-destructive' : ''"
              :aria-invalid="!!errors.email"
            />
            <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-sm font-medium">Password</Label>
            <Input
              v-model="password"
              id="password"
              type="password"
              autocomplete="current-password"
              placeholder="Enter your password"
              :disabled="isLoading"
              :class="errors.password ? 'border-destructive focus-visible:ring-destructive' : ''"
              :aria-invalid="!!errors.password"
            />
            
            <div class="flex items-center justify-between text-sm text-muted-foreground">
              <div class="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  v-model:checked="rememberMe"
                  name="remember"
                  :disabled="isLoading"
                />
                <Label for="remember" class="text-sm text-foreground">Remember me</Label>
              </div>
              <Button variant="link" class="h-auto px-0 font-semibold" :as-child="true">
                <a href="#">Forgot password?</a>
              </Button>
            </div>
            
            <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
          </div>

          <p v-if="errors.general" class="text-sm text-destructive">{{ errors.general }}</p>
          <Button type="submit" class="w-full font-semibold" :disabled="!isFormValid || isLoading">
            <Spinner v-if="isLoading" class="mr-2" aria-hidden="true" />
            <span v-if="isLoading">Signing in...</span>
            <span v-else>Sign in</span>
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card class="w-full max-w-md border border-border bg-card/80">
      <CardContent class="flex items-center justify-center gap-2 py-4 text-muted-foreground">
        <span>New to GoAround?</span>
        <Button variant="link" class="p-0 h-auto font-semibold" :as-child="true">
          <RouterLink to="/signup">Create an account</RouterLink>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>