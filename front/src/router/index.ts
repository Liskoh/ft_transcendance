import {createRouter, createWebHistory} from 'vue-router'
import Login from "@/views/LoginView.vue";
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'root',
            redirect: '/settings'
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('../views/ChatView.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: Login
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
            path: '/profile/:nickname',
            name: 'profile',
            props: true,
            component: () => import('../views/ProfileView.vue')
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const token: string | null = localStorage.getItem('token');
    let ret: boolean = true;
    const input: string = 'http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/users/verify';
    const options = {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        },
    };

    try {
        const response = await fetch(input, options);
        ret = response.ok;
    } catch (error) {}

    if (!ret) {
        if (to.name !== 'login') {
            next({name: 'login'});
            return;
        }
    }
    next();
});

export default router
