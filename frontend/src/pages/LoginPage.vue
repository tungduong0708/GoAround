<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/config/supabase/supabase';
import { useRouter } from 'vue-router';

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
    const { error } = await supabase.auth.signInWithOAuth({
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
    const { error } = await supabase.auth.signInWithPassword({
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
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    router.replace('/');
    return;
  }
  
  // Only turn off loading if we aren't redirecting
  isLoading.value = false;

  // 2. Set up listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
  <div class="login-page">
    <div class="login-brand">
      <img src="@/assets/GoAround-logo.svg" alt="GoAround" class="brand-mark">
      <h1 class="brand-title">Sign in to GoAround</h1>
    </div>

    <div class="login-card">
      <Button
        class="social-button"
        variant="outline"
        :disabled="isLoading"
        @click="handleGoogleLogin"
      >
        <img src="@/assets/google-logo.svg" alt="Google" class="social-icon" />
        <span v-if="isLoading">Signing in...</span>
        <span v-else>Continue with Google</span>
      </Button>

      <div class="divider">
        <span>or</span>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            placeholder="username@example.com"
            :disabled="isLoading"
            @input="handleEmailChange"
            @blur="handleEmailChange"
            :class="{ 'input-error': errors.email }"
          />
          <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
        </div>

        <div class="form-field">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.password)"
            placeholder="Enter your password"
            :disabled="isLoading"
            @input="handlePasswordChange"
            @blur="handlePasswordChange"
            :class="{ 'input-error': errors.password }"
          />
          <div class="field-helper">
            <label class="remember">
              <input
                v-model="rememberMe"
                type="checkbox"
                name="remember"
                :disabled="isLoading"
              >
              Remember me
            </label>
            <a class="helper-link" href="#">Forgot password?</a>
          </div>
          <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        </div>

        <Button
          type="submit"
          class="submit-button"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign in</span>
        </Button>
      </form>
    </div>

    <div class="signup-card">
      <span>New to GoAround?</span>
      <a href="#">Create an account</a>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100%;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background: radial-gradient(circle at top, #f8fafc 0%, #e5ebf3 45%, #e5ebf3 100%);
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.brand-mark {
  width: 48px;
  height: 48px;
}

.brand-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #21293b;
}

.login-card {
  width: min(420px, 100%);
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
}

.social-icon {
  width: 18px;
  height: 18px;
}

.divider {
  position: relative;
  text-align: center;
  color: #6c7280;
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #d0d7de;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
  color: #1f2937;
}

.field-helper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  margin-top: 0.35rem;
}

.remember {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #475467;
}

.remember input {
  width: 16px;
  height: 16px;
}

.helper-link {
  color: #2563eb;
  text-decoration: none;
}

.helper-link:hover {
  text-decoration: underline;
}

.submit-button {
  font-weight: 600;
  height: 42px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  margin-right: 0.5rem;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.field-error {
  color: #d93025;
  font-size: 0.8125rem;
}

.input-error {
  border-color: #d93025;
}

.signup-card {
  width: min(420px, 100%);
  text-align: center;
  border: 1px solid #d0d7de;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 1.25rem;
  color: #475467;
  display: flex;
  justify-content: center;
  gap: 0.35rem;
}

.signup-card a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.signup-card a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-page {
    padding: 2.5rem 1rem;
  }

  .login-card,
  .signup-card {
    padding: 1.5rem;
  }

  .brand-title {
    font-size: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
