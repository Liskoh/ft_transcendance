import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from "@/components/Login.vue";
import Upload from "@/components/Upload.vue";

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
            path: '/pong',
            name: 'pong',
            component: () => import('../views/PongView.vue')
        },
    ]
})

export default router
