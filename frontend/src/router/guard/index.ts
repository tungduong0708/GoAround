import type { RouteRecordRaw } from "vue-router";

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
    name: "forums",
    children: [
      {
        path: "/",
        name: "forums-home",
        component: () => import("@/pages/Forums/MainPage.vue"),
        meta: {
          title: "Forums",
          authRequired: false,
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
        path: "search",
        name: "forums-search",
        component: () => import("@/pages/Forums/SearchPage.vue"),
        meta: {
          title: "Search Forums",
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
    ],
  },
];

export default guardRoutes;
