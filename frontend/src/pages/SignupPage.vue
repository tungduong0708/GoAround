<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useSignupForm } from "@/composables/useSignupForm";

const {
  email,
  password,
  confirmPassword,
  isLoading,
  errors,
  isFormValid,
  handleGoogleSignup,
  onSubmit,
} = useSignupForm();
</script>

<template>
  <div
    class="flex-1 w-full bg-background text-foreground px-4 py-12 sm:py-16 flex flex-col items-center gap-6"
  >
    <div class="flex flex-col items-center gap-3 text-center">
      <img src="@/assets/GoAround-logo.svg" alt="GoAround" class="h-12 w-12" />
      <h1 class="text-2xl font-semibold text-foreground">
        Create your GoAround account
      </h1>
      <p class="text-sm text-muted-foreground">
        Start planning your adventures today
      </p>
    </div>

    <Card
      v-motion-slide-visible-once-bottom
      class="w-full max-w-md border border-border bg-card text-card-foreground shadow-xl shadow-foreground/5"
    >
      <CardHeader class="space-y-1 text-center">
        <CardTitle class="text-xl font-semibold">Get started</CardTitle>
        <CardDescription
          >Sign up with Google or create a new account with your
          email.</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-5">
        <Button
          class="w-full gap-2 font-semibold text-foreground"
          variant="outline"
          :disabled="isLoading"
          @click="handleGoogleSignup"
        >
          <img src="@/assets/google-logo.svg" alt="Google" class="h-4 w-4" />
          <span v-if="isLoading">Signing up...</span>
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
              :class="
                errors.email
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              "
              :aria-invalid="!!errors.email"
            />
            <p v-if="errors.email" class="text-sm text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-sm font-medium">Password</Label>
            <Input
              v-model="password"
              id="password"
              type="password"
              autocomplete="new-password"
              placeholder="Create a password (min. 6 characters)"
              :disabled="isLoading"
              :class="
                errors.password
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              "
              :aria-invalid="!!errors.password"
            />
            <p v-if="errors.password" class="text-sm text-destructive">
              {{ errors.password }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="confirmPassword" class="text-sm font-medium"
              >Confirm Password</Label
            >
            <Input
              v-model="confirmPassword"
              id="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Re-enter your password"
              :disabled="isLoading"
              :class="
                errors.confirmPassword
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              "
              :aria-invalid="!!errors.confirmPassword"
            />
            <p v-if="errors.confirmPassword" class="text-sm text-destructive">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <p v-if="errors.general" class="text-sm text-destructive">
            {{ errors.general }}
          </p>
          <Button
            type="submit"
            class="w-full font-semibold"
            :disabled="!isFormValid || isLoading"
          >
            <Spinner v-if="isLoading" class="mr-2" aria-hidden="true" />
            <span v-if="isLoading">Creating account...</span>
            <span v-else>Create account</span>
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card
      v-motion-slide-visible-once-bottom
      :delay="200"
      class="w-full max-w-md border border-border bg-card/80"
    >
      <CardContent
        class="flex items-center justify-center gap-2 py-4 text-muted-foreground"
      >
        <span>Already have an account?</span>
        <Button
          variant="link"
          class="p-0 h-auto font-semibold"
          :as-child="true"
        >
          <RouterLink to="/login">Sign in</RouterLink>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped></style>
