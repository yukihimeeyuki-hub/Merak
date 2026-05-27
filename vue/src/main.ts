import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import '@styles/style.scss'
import i18n from "@/language";

const app = createApp(App)

app.use(i18n)
app.use(router)
app.use(pinia)


app.mount('#app')
