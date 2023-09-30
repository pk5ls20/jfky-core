// router/index.js
import {createRouter, createWebHistory} from 'vue-router'
import FormMain from "@/views/FormMain.vue";
import FormFill from "@/views/FormFill.vue";
import FormShow from "@/views/FormShow.vue";
import FormShowDetail from "@/views/FormShowDetail.vue";
import LoginRegister from "@/views/LoginResiger.vue";
import UserLogout from "@/views/UserLogout.vue";
// import WalineContent from "@/views/WalineContent.vue";

const routes = [
    {
        path: '/form',
        name: 'formMain',
        component: FormMain,
        children: [
            {
                path: 'fill',
                component: FormFill
            },
            {
                path: 'show',
                component: FormShow
            },
            {
                path: 'show/:id',
                component: FormShowDetail
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: LoginRegister,
    },
    {
        path: '/logout',
        name: 'logout',
        component: UserLogout,
    },
    {
        path: '/',
        redirect: '/form'
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        beforeEnter: (to, from, next) => {
            if (to.path.startsWith('/api')) {
                next({name: 'not-found-api'});
            } else {
                next('/');
            }
        }
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
