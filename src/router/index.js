// router/index.js
import {createRouter, createWebHistory} from 'vue-router'
import FormMain from "@/views/Form/FormMain.vue";
import FormFill from "@/views/Form/FormFill.vue";
import FormShow from "@/views/Form/FormShow.vue";
import FormShowDetail from "@/views/Form/FormShowDetail.vue";
import LoginRegister from "@/views/Login/LoginResiger.vue";
import UserLogout from "@/views/Login/UserLogout.vue";
import ShowCommitHistory from "@/views/Form/FormShowCommitHistory.vue";
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
            },
            {
                path: 'commit-history',
                name: 'commitHistory',
                component: ShowCommitHistory,
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
