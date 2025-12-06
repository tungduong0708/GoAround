import { createRouter, createWebHistory } from "vue-router";
import commonRoutes from "./common";
import guardRoutes from "./guard";

const routes = [
  ...commonRoutes,
  ...guardRoutes,
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/pages/NotFound.vue"),
    meta: {
      title: "Not Found",
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
