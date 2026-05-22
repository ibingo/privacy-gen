import { createRouter, createWebHashHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import { pages } from '../config/pages'
import { isAuthenticated } from '../utils/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/auth/LoginPage.vue'),
    meta: {
      requiresAuth: false,
      title: '登录'
    }
  },
  {
    path: '/install/:id',
    name: 'mobile-install',
    component: () => import('../pages/mobile-apps/MobileInstallPage.vue'),
    meta: {
      requiresAuth: false,
      title: '安装应用'
    }
  },
  {
    path: '/',
    component: AppLayout,
    redirect: { name: 'login' },
    children: [
      {
        path: 'legal/projects',
        name: 'projects',
        component: () => import('../pages/legal/ProjectListPage.vue'),
        meta: pages.projects
      },
      {
        path: 'legal/privacy-policies',
        name: 'privacy-list',
        component: () => import('../pages/legal/PrivacyListPage.vue'),
        meta: pages['privacy-list']
      },
      {
        path: 'legal/user-agreements',
        name: 'agreement-list',
        component: () => import('../pages/legal/AgreementListPage.vue'),
        meta: pages['agreement-list']
      },
      {
        path: 'legal/privacy/new',
        name: 'privacy',
        component: () => import('../pages/legal/PrivacyPage.vue'),
        meta: pages.privacy
      },
      {
        path: 'legal/agreement/new',
        name: 'agreement',
        component: () => import('../pages/legal/AgreementPage.vue'),
        meta: pages.agreement
      },
      {
        path: 'legal/config',
        name: 'config',
        component: () => import('../pages/legal/ConfigPage.vue'),
        meta: pages.config
      },
      {
        path: 'legal/i18n/overview',
        name: 'i18n-overview',
        component: () => import('../pages/i18n/I18nOverviewPage.vue'),
        meta: pages['i18n-overview']
      },
      {
        path: 'legal/i18n/copies',
        name: 'i18n-copy-list',
        component: () => import('../pages/i18n/I18nCopyListPage.vue'),
        meta: pages['i18n-copy-list']
      },
      {
        path: 'legal/i18n/import',
        name: 'i18n-import',
        component: () => import('../pages/i18n/I18nImportPage.vue'),
        meta: pages['i18n-import']
      },
      {
        path: 'legal/i18n/tasks',
        name: 'i18n-task',
        component: () => import('../pages/i18n/I18nTaskPage.vue'),
        meta: pages['i18n-task']
      },
      {
        path: 'legal/i18n/tasks/new',
        name: 'i18n-task-create',
        component: () => import('../pages/i18n/I18nTaskCreatePage.vue'),
        meta: pages['i18n-task-create']
      },
      {
        path: 'legal/i18n/download',
        name: 'i18n-download',
        component: () => import('../pages/i18n/I18nDownloadPage.vue'),
        meta: pages['i18n-download']
      },
      {
        path: 'legal/icons',
        redirect: { name: 'icon-project-list' }
      },
      {
        path: 'legal/app-icons',
        name: 'app-icon-list',
        component: () => import('../pages/app-icons/AppIconListPage.vue'),
        meta: pages['app-icon-list']
      },
      {
        path: 'legal/app-icons/new',
        name: 'app-icon-create',
        component: () => import('../pages/app-icons/AppIconListPage.vue'),
        meta: pages['app-icon-create']
      },
      {
        path: 'legal/app-icons/:id/generate',
        name: 'app-icon-generate',
        component: () => import('../pages/app-icons/AppIconGeneratePage.vue'),
        meta: pages['app-icon-generate']
      },
      {
        path: 'legal/app-launches',
        name: 'app-launch-list',
        component: () => import('../pages/app-launches/AppLaunchListPage.vue'),
        meta: pages['app-launch-list']
      },
      {
        path: 'legal/app-launches/new',
        name: 'app-launch-create',
        component: () => import('../pages/app-launches/AppLaunchListPage.vue'),
        meta: pages['app-launch-create']
      },
      {
        path: 'legal/app-launches/:id/edit',
        name: 'app-launch-edit',
        component: () => import('../pages/app-launches/AppLaunchEditPage.vue'),
        meta: pages['app-launch-edit']
      },
      {
        path: 'legal/icon-projects',
        name: 'icon-project-list',
        component: () => import('../pages/icon-resources/IconProjectListPage.vue'),
        meta: pages['icon-project-list']
      },
      {
        path: 'legal/icon-projects/:projectId/icons',
        name: 'icon-list',
        component: () => import('../pages/icon-resources/IconListPage.vue'),
        meta: pages['icon-list']
      },
      {
        path: 'legal/icon-projects/:projectId/icons/new',
        name: 'icon-create',
        component: () => import('../pages/icon-resources/IconEditPage.vue'),
        meta: pages['icon-create']
      },
      {
        path: 'legal/icon-projects/:projectId/icons/:id',
        name: 'icon-edit',
        component: () => import('../pages/icon-resources/IconEditPage.vue'),
        meta: pages['icon-edit']
      },
      {
        path: 'legal/mobile-apps/overview',
        name: 'mobile-app-overview',
        component: () => import('../pages/mobile-apps/MobileAppOverviewPage.vue'),
        meta: pages['mobile-app-overview']
      },
      {
        path: 'legal/mobile-apps/list',
        name: 'mobile-app-list',
        component: () => import('../pages/mobile-apps/MobileAppListPage.vue'),
        meta: pages['mobile-app-list']
      },
      {
        path: 'legal/mobile-apps/experiments',
        name: 'mobile-app-experiments',
        component: () => import('../pages/mobile-apps/MobileAppExperimentPage.vue'),
        meta: pages['mobile-app-experiments']
      },
      {
        path: 'legal/mobile-apps/experiments/new',
        name: 'mobile-app-experiment-create',
        component: () => import('../pages/mobile-apps/MobileAppExperimentEditPage.vue'),
        meta: pages['mobile-app-experiment-create']
      },
      {
        path: 'legal/mobile-apps/experiments/:id/edit',
        name: 'mobile-app-experiment-edit',
        component: () => import('../pages/mobile-apps/MobileAppExperimentEditPage.vue'),
        meta: pages['mobile-app-experiment-edit']
      },
      {
        path: 'legal/mobile-apps/flag-configs/:id',
        name: 'mobile-app-flag-configs',
        component: () => import('../pages/mobile-apps/MobileAppFlagConfigPage.vue'),
        meta: pages['mobile-app-flag-configs']
      },
      {
        path: 'legal/mobile-apps/flag-configs/:id/edit',
        name: 'mobile-app-flag-config-edit',
        component: () => import('../pages/mobile-apps/MobileAppFlagConfigEditPage.vue'),
        meta: pages['mobile-app-flag-config-edit']
      },
      {
        path: 'legal/mobile-apps/flag-configs/:id/prerequisite',
        name: 'mobile-app-flag-prerequisite-edit',
        component: () => import('../pages/mobile-apps/MobileAppFlagPrerequisiteEditPage.vue'),
        meta: pages['mobile-app-flag-prerequisite-edit']
      },
      {
        path: 'legal/mobile-apps/segments',
        name: 'mobile-app-segments',
        component: () => import('../pages/mobile-apps/MobileAppSegmentPage.vue'),
        meta: pages['mobile-app-segments']
      },
      {
        path: 'legal/mobile-apps/segment-attributes',
        name: 'mobile-app-segment-attributes',
        component: () => import('../pages/mobile-apps/MobileAppSegmentAttributePage.vue'),
        meta: pages['mobile-app-segment-attributes']
      },
      {
        path: 'legal/mobile-apps/segment-attributes/new',
        name: 'mobile-app-segment-attribute-create',
        component: () => import('../pages/mobile-apps/MobileAppSegmentAttributeCreatePage.vue'),
        meta: pages['mobile-app-segment-attribute-create']
      },
      {
        path: 'legal/mobile-apps/segment-attributes/:id',
        name: 'mobile-app-segment-attribute-detail',
        component: () => import('../pages/mobile-apps/MobileAppSegmentAttributeDetailPage.vue'),
        meta: pages['mobile-app-segment-attribute-detail']
      },
      {
        path: 'legal/mobile-apps/segments/new',
        name: 'mobile-app-segment-create',
        component: () => import('../pages/mobile-apps/MobileAppSegmentEditPage.vue'),
        meta: pages['mobile-app-segment-create']
      },
      {
        path: 'legal/mobile-apps/segments/:id/edit',
        name: 'mobile-app-segment-edit',
        component: () => import('../pages/mobile-apps/MobileAppSegmentEditPage.vue'),
        meta: pages['mobile-app-segment-edit']
      },
      {
        path: 'legal/mobile-apps/flag-approvals',
        name: 'mobile-app-flag-approvals',
        component: () => import('../pages/mobile-apps/MobileAppFlagApprovalPage.vue'),
        meta: pages['mobile-app-flag-approvals']
      },
      {
        path: 'legal/mobile-apps/flag-approvals/:id/edit',
        name: 'mobile-app-flag-approval-edit',
        component: () => import('../pages/mobile-apps/MobileAppFlagApprovalEditPage.vue'),
        meta: pages['mobile-app-flag-approval-edit']
      },
      {
        path: 'legal/mobile-apps/ab-tests',
        name: 'mobile-app-ab-tests',
        component: () => import('../pages/mobile-apps/MobileAppAbTestPage.vue'),
        meta: pages['mobile-app-ab-tests']
      },
      {
        path: 'legal/mobile-apps/:id',
        name: 'mobile-app-detail',
        component: () => import('../pages/mobile-apps/MobileAppDetailPage.vue'),
        meta: pages['mobile-app-detail']
      },
      {
        path: 'legal/mobile-apps/:id/edit',
        name: 'mobile-app-edit',
        component: () => import('../pages/mobile-apps/MobileAppEditPage.vue'),
        meta: pages['mobile-app-edit']
      },
      {
        path: 'legal/mobile-apps/:id/versions',
        name: 'mobile-app-versions',
        component: () => import('../pages/mobile-apps/MobileAppVersionListPage.vue'),
        meta: pages['mobile-app-versions']
      },
      {
        path: 'legal/mobile-apps/:id/install',
        name: 'mobile-app-install-manage',
        component: () => import('../pages/mobile-apps/MobileAppInstallManagePage.vue'),
        meta: pages['mobile-app-install-manage']
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta?.requiresAuth === false) {
    return true
  }

  if (isAuthenticated()) {
    if (to.name === 'login') {
      return { name: 'projects' }
    }

    return true
  }

  return {
    name: 'login',
    query: to.fullPath === '/' ? undefined : { redirect: to.fullPath }
  }
})

export default router
