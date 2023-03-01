import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import Vue3Notification from '@kyvg/vue3-notification'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vue3Notification);

app.mount('#app')
