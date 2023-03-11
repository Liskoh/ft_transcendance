import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import Vuex from 'vuex'
import {store} from "@/stores/store";
import {Notyf} from "notyf";
import Notification from "@/components/Notification.vue";

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { mdi } from 'vuetify/iconsets/mdi'


const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    themes: {
        light: {
            background: '#F5F5F5',
            primary: '#3F51B5', // bleu
            secondary: '#9C27B0', // violet
            accent: '#FF5722', // orange
            error: '#f44336', // rouge
            warning: '#FFC107', // jaune
            info: '#00BCD4', // bleu ciel
            success: '#4CAF50' // vert
        }
    }
});


const app = createApp(App);
app.use(createPinia())
app.use(router)
app.use(store);
app.use(vuetify);
// app.use(Toast);
app.config.globalProperties.$notyf = new Notyf()
app.config.isCustomElement = tag => tag.startsWith('v-')
app.component('notification', Notification);
app.mount('#app')

