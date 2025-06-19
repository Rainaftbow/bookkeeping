import {createRouter, createWebHistory, isNavigationFailure, NavigationFailureType} from 'vue-router'
import {useUserStore} from "@/stores/userStore.js";
import {ElMessage} from "element-plus";

const routes = [
  {
    path: '/',
    name: 'root',
    redirect: { path: '/login' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import("@/views/LoginView.vue"),
    meta: { requireAuth: false },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import("@/views/admin.vue"),
    meta: { requireAuth: true },
  },
  {
    path: '/dashboard',
    component: () => import("@/views/userDashboard.vue"),
    children: [
      {
        path: 'diagrams',
        name: 'diagrams',
        component: () => import("@/components/Diagram.vue"),
        meta: { requireAuth: true }
      },
      {
        path: 'profile',
        name: 'userProfile',
        component: () => import("@/components/Profile.vue"),
        meta: { requireAuth: true }
      },
      {
        path: 'book',
        name: 'book',
        component: () => import("@/components/Book.vue"),
        meta: { requireAuth: true }
      },
      {
        path: 'shopping-list',
        name: 'shoppingList',
        component: () => import("@/components/shoppingList.vue"),
        meta: { requireAuth: true }
      },
      {
        path: 'saving-plan',
        name: 'savingPlan',
        component: () => import("@/components/savingPlan.vue"),
        meta: { requireAuth: true }
      },
      {
        path: '/shopping-list/:id',
        name: 'ShoppingListDetail',
        component: () => import('@/components/ShoppingListDetail.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  userStore.loadAuthFromStorage()
  const requireAuth = to.matched.some(record => record.meta.requireAuth);
  if (!userStore.isLoggedIn && requireAuth) {
    ElMessage.warning('请先登录')
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    };
  }

  if (to.name === 'login' && userStore.isLoggedIn) {
    return { name: 'dashboard' };
  }

  return true;
})

router.afterEach((to, from, failure) => {
  if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    ElMessage.info({grouping: true, message: '已在指定页面'})
  }
})

export default router
