import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from "@/components/Login.vue";
import Upload from "@/components/Upload.vue";
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'root',
            redirect: '/home'
        },
        {
            path: '/home',
            name: 'home',
            component: HomeView
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('../views/ChatView.vue')
        },
        {
            path: '/playerprofile',
            name: 'playerprofile',
            component: () => import('../views/PlayerProfileView.vue') // Lazy Load
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/upload',
            name: 'upload',
            component: Upload
        },
        {
            path: '/game',
            name: 'game',
            component: () => import('../views/GameView.vue')
        },
        {
            path: '/gameresult',
            name: 'gameresult',
            component: () => import('../views/GameResultView.vue')
        },
        {
            path: '/auth/intra',
            name: 'authintra',
            component: () => import('../views/RedirectView.vue')
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/SettingsView.vue')
        },
        {
            path: '/pong',
            name: 'pong',
            component: () => import('../views/PongView.vue')
        },
        {
            path: '/profile/:login',
            name: 'profile',
            props: true,
            component: () => import('../views/ProfileView.vue')
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const token: string | null = localStorage.getItem('token');
    let ret: boolean = false;
    const input: string = 'http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/users/upload';
    const options = {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        },
    };

    try {
        const response = await fetch(input, options);
        if (response.ok)
            ret = true;
    } catch (error) {}

    if (!ret) {
        if (to.name !== 'login') {
            next({name: 'login'});
            return;
        }
    }
    console.log(ret);
    next();
})

export default router
