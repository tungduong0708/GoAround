import { createRouter, createWebHistory } from "vue-router";
import commonRoutes from "./common";
import guardRoutes from "./guard";
import { useSearchStore, useAuthStore } from "@/stores";

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

  // Initialize auth state if not already done
  if (!authStore.session && !authStore.isLoading) {
    await authStore.initSession();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.meta.authRequired === true;

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
    next({ name: "home" });
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
  }
});

export default router;
