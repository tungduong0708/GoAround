import { createRouter, createWebHistory } from "vue-router";
import commonRoutes from "./common";
import guardRoutes from "./guard";
import { useSearchStore, useAuthStore, useUserProfileStore } from "@/stores";

const routes = [
  ...commonRoutes,
  ...guardRoutes,
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/pages/NotFound.vue"),
    meta: {
      title: "Not Found",
      authRequired: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Authentication guard - protect routes that require auth
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const userProfileStore = useUserProfileStore();

  // Always ensure session is initialized before checking authentication
  if (!authStore.session) {
    await authStore.initSession();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.meta.authRequired === true;

  // Check ban status first for authenticated users
  if (isAuthenticated && to.name !== "banned") {
    // Fetch profile if not already loaded
    if (!userProfileStore.profile && userProfileStore.profileExists !== false) {
      try {
        await userProfileStore.fetchProfile();
      } catch (error) {
        // If profile fetch fails, let the user continue for now
        console.error('Failed to fetch profile in router guard:', error);
      }
    }

    // Force redirect banned users to banned page for ANY route
    if (userProfileStore.profile?.ban_until) {
      next({ name: "banned", replace: true });
      return;
    }
  }

  // Redirect unauthenticated users to login for protected routes
  if (requiresAuth && !isAuthenticated) {
    next({
      name: "login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  // Redirect authenticated users away from login/signup pages
  if (isAuthenticated && (to.name === "login" || to.name === "signup")) {
    next({ name: "auth-callback" });
    return;
  }

  next();
});

// Set page title after navigation
router.afterEach((to, from) => {
  // Update page title
  const title = to.meta.title as string | undefined;
  document.title = title ? `${title} | GoAround` : "GoAround";

  // Reset search when navigating away from search-related routes
  const searchPreservedRoutes = ["search", "details"];
  const isFromSearchRoute = searchPreservedRoutes.includes(from.name as string);
  const isToSearchRoute = searchPreservedRoutes.includes(to.name as string);

  if (isFromSearchRoute && !isToSearchRoute) {
    const searchStore = useSearchStore();
    searchStore.resetSearch();
    console.log("Reset search");
  }
});

export default router;
