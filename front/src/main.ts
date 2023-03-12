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
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import { aliases, mdi } from 'vuetify/iconsets/mdi'


const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
        defaultTheme: 'dark',
    },
    icons: {
        defaultSet: 'mdi',
    },
});


const app = createApp(App);
app.use(createPinia())
app.use(router)
app.use(store);
app.use(vuetify);
// app.use(Toast);
app.config.globalProperties.$notyf = new Notyf()
app.component('notification', Notification);
app.mount('#app')

