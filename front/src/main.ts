import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import Vuex from 'vuex'
import {store} from "@/stores/store";
import {Notyf} from "notyf";
import Notification from "@/components/Notification.vue";
// import Toast from "vue-toastification";

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(store);
// app.use(Toast);
app.config.globalProperties.$notyf = new Notyf()
app.component('notification', Notification);
app.mount('#app')

