import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/authService'
import { ROLES } from '@/utils/constants'

const routes = [
  // Auth Routes
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      { path: '', redirect: '/auth/login' },
      { path: 'login', name: 'Login', component: () => import('@/pages/auth/Login.vue') },
      { path: 'register', name: 'Register', component: () => import('@/pages/auth/Register.vue') },
    ],
  },

  // Admin / Main Routes
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/Dashboard.vue'),
        meta: { title: 'Dashboard', icon: 'mdi-view-dashboard' },
      },

      // Students
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/pages/students/Students.vue'),
        meta: { title: 'Students', icon: 'mdi-account-group', roles: [ROLES.ADMIN, ROLES.TEACHER] },
      },
      {
        path: 'students/add',
        name: 'AddStudent',
        component: () => import('@/pages/students/AddStudent.vue'),
        meta: { title: 'Add Student', roles: [ROLES.ADMIN] },
      },
      {
        path: 'students/:id/edit',
        name: 'EditStudent',
        component: () => import('@/pages/students/EditStudent.vue'),
        meta: { title: 'Edit Student', roles: [ROLES.ADMIN] },
      },
      {
        path: 'students/:id',
        name: 'StudentDetail',
        component: () => import('@/pages/students/StudentDetail.vue'),
        meta: { title: 'Student Detail', roles: [ROLES.ADMIN, ROLES.TEACHER] },
      },

      // Teachers
      {
        path: 'teachers',
        name: 'Teachers',
        component: () => import('@/pages/teachers/Teachers.vue'),
        meta: { title: 'Teachers', icon: 'mdi-account-tie', roles: [ROLES.ADMIN] },
      },
      {
        path: 'teachers/add',
        name: 'AddTeacher',
        component: () => import('@/pages/teachers/AddTeacher.vue'),
        meta: { title: 'Add Teacher', roles: [ROLES.ADMIN] },
      },
      {
        path: 'teachers/:id/edit',
        name: 'EditTeacher',
        component: () => import('@/pages/teachers/EditTeacher.vue'),
        meta: { title: 'Edit Teacher', roles: [ROLES.ADMIN] },
      },

      // Payments
      {
        path: 'payments',
        name: 'Payments',
        component: () => import('@/pages/payments/Payments.vue'),
        meta: { title: 'Payments', icon: 'mdi-cash-multiple', roles: [ROLES.ADMIN] },
      },

      // Reports
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/pages/reports/Reports.vue'),
        meta: { title: 'Reports', icon: 'mdi-chart-bar', roles: [ROLES.ADMIN] },
      },

      // Settings
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/settings/Settings.vue'),
        meta: { title: 'Settings', icon: 'mdi-cog' },
      },
    ],
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const user = authService.getCurrentUser()
  const isAuth = !!user

  if (to.meta.requiresAuth && !isAuth) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresGuest && isAuth) {
    return next({ name: 'Dashboard' })
  }

  if (to.meta.roles && user && !to.meta.roles.includes(user.role)) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router