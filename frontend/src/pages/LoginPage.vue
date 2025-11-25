<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {supabase} from '@/config/supabase/supabase';
import {useRouter} from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(true);
const errors = ref<{ email?: string; password?: string }>({});
// Store subscription here so we can access it in onUnmounted
const authListener = ref<{ unsubscribe: () => void } | null>(null);

const isFormValid = computed(() => {
  return email.value.trim() !== '' &&
      password.value.trim() !== '' &&
      Object.keys(errors.value).length === 0;
});

const validateEmail = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

const validatePassword = (value: string) => {
  return value.length >= 6;
};

const handleEmailChange = () => {
  if (!email.value.trim()) {
    errors.value.email = 'Email is required';
    return;
  }

  if (!validateEmail(email.value)) {
    errors.value.email = 'Enter a valid email address';
    return;
  }

  delete errors.value.email;
};

const handlePasswordChange = () => {
  if (!password.value.trim()) {
    errors.value.password = 'Password is required';
    return;
  }

  if (!validatePassword(password.value)) {
    errors.value.password = 'Password must be at least 6 characters';
    return;
  }

  delete errors.value.password;
};

const handleGoogleLogin = async () => {
  isLoading.value = true;
  try {
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      throw error;
    }
  } catch (error) {
    errors.value.password = 'Google login failed. Please try again.';
    console.error('Google login failed', error);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  handleEmailChange();
  handlePasswordChange();

  if (!isFormValid.value) {
    return;
  }

  isLoading.value = true;
  try {
    const {error} = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) {
      throw error;
    }
    router.push('/');
  } catch (error) {
    errors.value.password = 'Invalid email or password';
    console.error('Email login failed', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  // 1. Check session
  const {data: {session}} = await supabase.auth.getSession();

  if (session) {
    router.replace('/');
    return;
  }

  // Only turn off loading if we aren't redirecting
  isLoading.value = false;

  // 2. Set up listener
  const {data: {subscription}} = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      router.replace('/');
    }
  });

  // Save subscription to ref
  authListener.value = subscription;
});

// 3. Clean up (This must be at the root level of setup, NOT inside onMounted)
onUnmounted(() => {
  if (authListener.value) {
    authListener.value.unsubscribe();
  }
});

</script>

<template>
  <div class="min-h-screen w-full bg-background text-foreground px-4 py-12 sm:py-16 flex flex-col items-center gap-6">
    <div class="flex flex-col items-center gap-3 text-center">
      <img src="@/assets/GoAround-logo.svg" alt="GoAround" class="h-12 w-12"/>
      <h1 class="text-2xl font-semibold text-foreground">Sign in to GoAround</h1>
      <p class="text-sm text-muted-foreground">Access your saved trips and forums</p>
    </div>

    <div
        class="w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xl shadow-foreground/5">
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

      <div class="flex items-center gap-3 py-3 text-sm text-muted-foreground">
        <span class="h-px flex-1 bg-border" aria-hidden="true"></span>
        <span>or</span>
        <span class="h-px flex-1 bg-border" aria-hidden="true"></span>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="email" class="text-sm font-medium text-foreground">Email</Label>
          <Input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              :aria-invalid="Boolean(errors.email)"
              placeholder="username@example.com"
              :disabled="isLoading"
              class="bg-background text-foreground border-input placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              @input="handleEmailChange"
              @blur="handleEmailChange"
              :class="{ 'border-destructive focus-visible:ring-destructive': errors.email }"
          />
          <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
        </div>

        <div class="space-y-2">
          <Label for="password" class="text-sm font-medium text-foreground">Password</Label>
          <Input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              :aria-invalid="Boolean(errors.password)"
              placeholder="Enter your password"
              :disabled="isLoading"
              class="bg-background text-foreground
                   border-input placeholder:text-muted-foreground
                   focus-visible:ring-ring focus-visible:ring-2
                   focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              @input="handlePasswordChange"
              @blur="handlePasswordChange"
              :class="{ 'border-destructive focus-visible:ring-destructive': errors.password }"
          />
          <div class="flex items-center justify-between text-sm text-muted-foreground">
            <label class="inline-flex items-center gap-2">
              <input
                  v-model="rememberMe"
                  type="checkbox"
                  name="remember"
                  :disabled="isLoading"
                  class="size-4 rounded border-input bg-background text-primary focus:ring-ring"
              >
              Remember me
            </label>
            <a class="font-semibold text-primary hover:text-primary/80" href="#">
              Forgot password?
            </a>
          </div>
          <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
        </div>

        <Button type="submit" class="w-full font-semibold" :disabled="!isFormValid || isLoading">
          <span
              v-if="isLoading"
              class="mr-2 inline-flex size-4 animate-spin rounded-full border-2 border-card border-t-primary"
              aria-hidden="true"
          ></span>
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign in</span>
        </Button>
      </form>
    </div>

    <div
        class="w-full max-w-md rounded-2xl border border-border bg-card/80 px-6 py-4 text-center text-muted-foreground">
      <span>New to GoAround?</span>
      <a class="ml-2 font-semibold text-primary hover:text-primary/80" href="#">
        Create an account
      </a>
    </div>
  </div>
</template>
