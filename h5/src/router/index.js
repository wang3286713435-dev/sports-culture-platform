import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/home.vue')
  },
  {
    path: '/courses',
    name: 'courses',
    component: () => import('../views/courses.vue')
  },
  {
    path: '/articles',
    name: 'articles',
    component: () => import('../views/articles.vue')
  },
  {
    path: '/venues',
    name: 'venues',
    component: () => import('../views/venues.vue')
  },
  {
    path: '/associations',
    name: 'associations',
    component: () => import('../views/associations.vue')
  },
  {
    path: '/referee',
    name: 'referee',
    component: () => import('../views/referee.vue')
  },
  {
    path: '/coaches',
    name: 'coaches',
    component: () => import('../views/sports.vue')
  },
  {
    path: '/coach/:id',
    name: 'coach-detail',
    component: () => import('../views/coach-detail.vue')
  },
  {
    path: '/course/:id',
    name: 'course-detail',
    component: () => import('../views/course-detail.vue')
  },
  {
    path: '/book/:courseId',
    name: 'book',
    component: () => import('../views/book.vue')
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/orders.vue')
  },
  {
    path: '/join',
    name: 'join',
    component: () => import('../views/join.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/profile.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/about.vue')
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('../views/user.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
