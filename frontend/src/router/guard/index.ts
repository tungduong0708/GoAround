import { RouterView, type RouteRecordRaw } from "vue-router";

const guardRoutes: RouteRecordRaw[] = [
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/pages/UserProfile/UserProfilePage.vue"),
    meta: {
      title: "Profile",
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
    path: "/trip/:tripId",
    name: "trip-details",
    component: () => import("@/pages/Trips/TripPage.vue"),
    meta: {
      title: "Trip Details",
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
