<script setup lang="ts">
import { Button } from '@/components/ui/button';
</script>

<template>
  <!-- centered full-screen wrapper -->
  <div class="login-wrapper">
    <!-- refined container sized like the screenshot -->
    <div class="login-container">
      <!-- existing card — now fills the login-container -->
      <div class="bg-white card">
        <!-- Logo Section -->
        <div class="logo-row">
            <div class="logo-mark">
              <img src="@/assets/GoAround-logo.svg" alt="GoAround Logo" />
            </div>
            <div class="logo-title">
              <img src="@/assets/GoAround-title.svg" alt="GoAround Text Logo" />
            </div>
        </div>

        <!-- Title -->
        <h1 class="page-title">
            Sign up to fully access GoAround
        </h1>

        <!-- Button Container -->
        <div class="btns">
            <Button class="btn">Continue with Google</Button>
            <Button class="btn">Continue with email</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* dark backdrop to match screenshot */
.login-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f1f1f; /* dark outer background */
  padding: 2rem;
  box-sizing: border-box;
}

/* container sized to match screenshot proportions (max width + viewport-relative) */
.login-container {
  width: min(1100px, 92vw);
  height: min(760px, 86vh);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

/* card refinements */
.card {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 40px;
  border: 2px solid #000;
  padding: 48px;
  box-sizing: border-box;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
}

/* logo row: larger mark + title, aligned like image */
.logo-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.logo-mark img {
  width: 96px;
  height: 96px;
  object-fit: contain;
  display: block;
}
.logo-title img {
  height: 56px;
  object-fit: contain;
  display: block;
}

/* page title large and bold like screenshot */
.page-title {
  font-size: 2.25rem; /* ~36px */
  line-height: 1.1;
  font-weight: 700;
  color: #0b0b0b;
  margin: 0.5rem 0 1.75rem 0;
}

/* center buttons and constrain their width */
.btns {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
  margin-top: auto; /* push buttons toward bottom if extra space */
  padding-bottom: 8px;
}
.btns .btn {
  width: min(640px, 70%);
  max-width: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 9999px;
  border: 2px solid #000;
  font-weight: 600;
  font-size: 1.05rem;
  background: transparent;
}

/* responsive fallback */
@media (max-width: 640px) {
  .login-container {
    width: 92vw;
    height: auto;
    max-height: 90vh;
    padding: 0;
  }
  .card {
    padding: 20px;
    border-radius: 24px;
    height: auto;
  }
  .logo-mark img {
    width: 72px;
    height: 72px;
  }
  .logo-title img {
    height: 44px;
  }
  .page-title {
    font-size: 1.5rem;
  }
  .btns .btn {
    width: 100%;
  }
}
</style>