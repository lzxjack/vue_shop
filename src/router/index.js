import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

// const routes = [{
//         path: '/',
//         redirect: '/login'
//     },
//     {
//         path: '/login',
//         component: Login
//     },
//     {
//         path: '/home',
//         component: Home
//     }
// ]

// const router = new VueRouter({
//     routes
// });

const router = new VueRouter({
    routes: [{
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            component: Login
        },
        {
            path: '/home',
            component: Home
        }
    ]
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 要访问的路径
    // from 代表从哪个路径跳转而来
    // next放行函数
    //     next()放行   next('/login')强制跳转到login页

    // 去的是登录页，直接放行
    if (to.path === '/login') return next();
    // 去的不是登录页，获取token
    const tokenStr = window.sessionStorage.getItem('token');
    // 没有token，强制跳转到登录页
    if (!tokenStr) return next('/login');
    // 有token，放行
    next();
});


export default router