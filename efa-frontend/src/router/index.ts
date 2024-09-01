import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import Team from '@/views/Team.vue';
import Register from '@/views/Register.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'show-home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/team',
      name: 'team',
      component: Team
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    }
  ]
})

export default router
