import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { useThemeStore, useAuthStore } from "@/stores";
import router from "./router/index.ts";

import { MotionPlugin } from "@vueuse/motion";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(MotionPlugin);

const themeStore = useThemeStore(pinia);
themeStore.initTheme();

const authStore = useAuthStore(pinia);
authStore.initialize();

app.mount("#app");
