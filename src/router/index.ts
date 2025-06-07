import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ACCESS_ENUMS from '@/access/accessEnums'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/user/login',
      name: '登录页',
      component: () => import('../layouts/user/UserLoginPage.vue'),
    },
    {
      path: '/user/register',
      name: '注册页',
      component: () => import('../layouts/user/UserRegisterPage.vue'),
    },
    {
      path: '/admin/userManage',
      name: '用户管理页',
      component: () => import('../layouts/admin/UserManagePage.vue'),
      meta: {
        access: ACCESS_ENUMS.ADMIN,
      }
    },
    {
      path: '/admin/user/edit',
      name: '用户编辑页',
      component: () => import('../layouts/admin/UserEditPage.vue'),
      meta: {
        access: ACCESS_ENUMS.ADMIN,
      },
    },
    {
      path: '/user/profile',
      name: '个人中心',
      component: () => import('../layouts/user/UserProfilePage.vue'),
    },
    {
      path: '/noAuth',
      name: '无权限',
      component: () => import('../views/noAuthView.vue'),
    },
  ],
})

export default router
