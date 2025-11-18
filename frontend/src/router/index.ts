import { createRouter, createWebHistory } from "vue-router";
import { commonRoutes } from "./common";

const routes = [
    ...commonRoutes
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;