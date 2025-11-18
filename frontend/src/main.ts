import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { useThemeStore } from '@/stores'
import router from './router/index.ts'

const app = createApp(App)
const pinia = createPinia()
const themeStore = useThemeStore()

themeStore.initTheme()
app.use(pinia)
app.use(router)
app.mount('#app')
