import type { RouteRecordRaw } from "vue-router";

const commonRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/HomePage.vue"),
    meta: {
      title: "Home",
      authRequired: false,
    },
  },
  {
    path: "/landing",
    name: "landing",
    component: () => import("@/pages/LandingPage.vue"),
    meta: {
      title: "Landing",
      authRequired: false,
    },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/LoginPage.vue"),
    meta: {
      title: "Login",
      authRequired: false,
      hideHeader: true,
    },
  },
  {
    path: "/signup",
    name: "signup",
    component: () => import("@/pages/SignupPage.vue"),
    meta: {
      title: "Sign Up",
      authRequired: false,
      hideHeader: true,
    },
  },
  {
    path: "/search",
    name: "search",
    component: () => import("@/pages/SearchPage.vue"),
    meta: {
      title: "Search",
      authRequired: false,
    },
  },
  {
    path: "/places/:id",
    name: "details",
    component: () => import("@/pages/PlaceDetailsPage.vue"),
    meta: {
      title: "Place Details",
      authRequired: false,
    },
  },
  {
    path: "/places/create",
    name: "create-place",
    component: () => import("@/pages/CreatePlacePage.vue"),
    meta: {
      title: "Create Place",
      authRequired: true,
    },
  },
  {
    path: "/profile",
    name: "profile-me",
    component: () => import("@/pages/UserProfile/UserProfilePage.vue"),
    meta: {
      title: "My Profile",
      authRequired: true,
    },
  },
  {
    path: "/users/:id",
    name: "user-profile",
    component: () => import("@/pages/UserProfile/UserProfilePage.vue"),
    meta: {
      title: "User Profile",
      authRequired: false,
    },
  },
];

export default commonRoutes;
