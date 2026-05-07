import { createRouter, createWebHashHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import { pages } from '../config/pages'

const routes = [
  {
    path: '/',
    component: AppLayout,
    redirect: { name: 'home' },
    children: [
      {
        path: 'legal',
        name: 'home',
        component: () => import('../pages/HomePage.vue'),
        meta: pages.home
      },
      {
        path: 'legal/privacy',
        name: 'privacy',
        component: () => import('../pages/PrivacyPage.vue'),
        meta: pages.privacy
      },
      {
        path: 'legal/agreement',
        name: 'agreement',
        component: () => import('../pages/AgreementPage.vue'),
        meta: pages.agreement
      },
      {
        path: 'legal/config',
        name: 'config',
        component: () => import('../pages/ConfigPage.vue'),
        meta: pages.config
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/legal'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
