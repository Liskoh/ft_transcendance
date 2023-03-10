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
        light : {
            dark: false,
            primary: '#E53935',
            secondary: '#FFCDD2',
            // dark: false,
            // primary: #E53935,
            // secondary: #FFCDD2,
        }
    }
})

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

