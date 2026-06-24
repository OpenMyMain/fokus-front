import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'home',
      path: '/',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          name: 'index',
          path: '',
          component: () => import('@/views/HomeView.vue'),
        },
      ],
    },
    {
      name: 'auth',
      path: '/auth',
      component: () => import('@/views/Authentification/SelectActionView.vue'),
    },
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/Authentification/LoginView.vue'),
    },
    {
      name: 'logout',
      path: '/logout',
      component: () => import('@/views/Authentification/LogoutView.vue'),
    },
    {
      name: 'register_methods',
      path: '/register',
      component: () => import('@/views/Authentification/RegisterChoiceView.vue'),
    },
    {
      name: 'register_email',
      path: '/register/form',
      component: () => import('@/views/Authentification/RegisterView.vue'),
    },
    {
      name: 'forgot_password',
      path: '/forget-password',
      component: () => import('@/views/Authentification/ForgetPasswordView.vue'),
    },
    {
      name: 'reset_password',
      path: '/reset-password',
      component: () => import('@/views/Authentification/ResetPasswordView.vue'),
    },

    {
      name: 'kit_ui',
      path: '/kit-ui',
      component: () => import('@/views/Common/KitUiView.vue'),
    },
  ],
})

export default router
