import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import Vuex from 'vuex'
import {store} from "@/stores/store";
import {Notyf} from "notyf";

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(store);
app.config.globalProperties.$notyf = new Notyf()

app.mount('#app')
