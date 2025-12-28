import { RouterView, type RouteRecordRaw } from "vue-router";

const guardRoutes: RouteRecordRaw[] = [
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
    path: "/places/:id/edit",
    name: "edit-place",
    component: () => import("@/pages/EditPlacePage.vue"),
    meta: {
      title: "Edit Place",
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
    path: "/profile/create",
    name: "profile-create",
    component: () => import("@/pages/UserProfile/CreateProfilePage.vue"),
    meta: {
      title: "Create Profile",
      authRequired: true,
    },
  },
  {
    path: "/profile/manage-places",
    name: "manage-places",
    component: () => import("@/pages/UserProfile/ManagePlacesPage.vue"),
    meta: {
      title: "Manage Places",
      authRequired: true,
    },
  },
  {
    path: "/trip",
    name: "trip",
    component: () => import("@/pages/Trips/MainPage.vue"),
    meta: {
      title: "Trips",
      authRequired: true,
    },
  },
  {
    path: "/trip/:id",
    name: "trip-details",
    component: () => import("@/pages/Trips/TripPage.vue"),
    meta: {
      title: "Trip Details",
      authRequired: true,
    },
  },
  {
    path: "/admin", 
    name: "admin",
    component: () => import("@/pages/Admin/AdminPage.vue"),
    meta: {
      title: "Admin Dashboard",
      authRequired: true,
    },
  },
  {
    path: "/saved-places",
    name: "saved-places",
    component: () => import("@/pages/SavedPlacesPage.vue"),
    meta: {
      title: "Saved Places",
      authRequired: true,
    },
  },
  {
    path: "/forums",
    component: RouterView,
    meta: {
      title: "Forums",
      authRequired: false,
    },
    children: [
      {
        path: "",
        name: "forums-home",
        component: () => import("@/pages/Forums/MainPage.vue"),
        meta: {
          title: "Forums",
          authRequired: false,
        },
      },
      {
        path: "create",
        name: "create-post",
        component: () => import("@/pages/Forums/NewPostPage.vue"),
        meta: {
          title: "Create Post",
          authRequired: true,
        },
      },
      {
        path: ":postId",
        name: "post-details",
        component: () => import("@/pages/Forums/PostPage.vue"),
        meta: {
          title: "Post Details",
          authRequired: false,
        },
      },
      {
        path: ":postId/edit",
        name: "edit-post",
        component: () => import("@/pages/Forums/NewPostPage.vue"),
        meta: {
          title: "Edit Post",
          authRequired: true,
        },
      },
      // Not Found
      {
        path: ":catchAll(.*)",
        name: "not-found",
        component: () => import("@/pages/NotFound.vue"),
        meta: {
          title: "Not Found",
          authRequired: false,
        },
      },
    ],
  },
];

export default guardRoutes;
