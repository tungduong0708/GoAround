export const commonRoutes = [
    {
        "path": "/login",
        "name": "LoginPage",
        "component": () => import('@/pages/LoginPage.vue'), 
        "meta": {
            "authRequired": false
        }
    }
]