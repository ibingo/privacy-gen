import { createRouter, createWebHashHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import { pages } from '../config/pages'
import { isAuthenticated, isSuperAdmin } from '../utils/auth'

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
    path: '/beta-invite/:code',
    name: 'beta-invite',
    component: () => import('../pages/mobile-apps/MobileAppBetaInviteLandingPage.vue'),
    meta: {
      requiresAuth: false,
      title: '内测邀请'
    }
  },
  {
    path: '/beta-user-invite/:id',
    name: 'beta-user-invite',
    component: () => import('../pages/mobile-apps/MobileAppBetaUserInvitePage.vue'),
    meta: {
      requiresAuth: false,
      title: '特邀内测'
    }
  },
  {
    path: '/',
    component: AppLayout,
    redirect: { name: 'login' },
    children: [
      {
        path: 'workbench',
        name: 'workbench',
        component: () => import('../pages/workbench/WorkbenchPage.vue'),
        meta: pages.workbench
      },
      {
        path: 'legal/projects',
        name: 'projects',
        component: () => import('../pages/legal/ProjectListPage.vue'),
        meta: pages.projects
      },
      ...[
        'system-users',
        'system-roles',
        'system-permissions',
        'system-menus',
        'system-departments',
        'system-posts',
        'system-dicts',
        'system-params',
        'system-clients',
        'system-projects'
      ].map((name) => ({
        path: pages[name].path.replace(/^\//, ''),
        name,
        component: () => import('../pages/system/SystemManagePage.vue'),
        meta: {
          ...pages[name],
          requiresSuperAdmin: true
        }
      })),
      ...[
        'system-users',
        'system-roles',
        'system-permissions',
        'system-menus',
        'system-departments',
        'system-posts',
        'system-dicts',
        'system-params',
        'system-clients',
        'system-projects'
      ].map((name) => ({
        path: `${pages[name].path.replace(/^\//, '')}/new`,
        name: `${name}-create`,
        component: () => import('../pages/system/SystemCreatePage.vue'),
        meta: {
          ...pages[name],
          name: `${name}-create`,
          path: `${pages[name].path}/new`,
          title: `新建${pages[name].title.replace(/管理$/, '')}`,
          description: `新增${pages[name].title.replace(/管理$/, '')}记录并维护基础配置。`,
          requiresSuperAdmin: true
        }
      })),
      {
        path: 'system/testing/ip-whitelist',
        name: 'system-ip-whitelist',
        component: () => import('../pages/system/SystemIpWhitelistPage.vue'),
        meta: {
          ...pages['system-ip-whitelist'],
          requiresSuperAdmin: true
        }
      },
      {
        path: 'system/testing/ip-whitelist/new',
        name: 'system-ip-whitelist-create',
        component: () => import('../pages/system/SystemIpWhitelistEditPage.vue'),
        meta: {
          ...pages['system-ip-whitelist-create'],
          requiresSuperAdmin: true
        }
      },
      {
        path: 'system/testing/ip-whitelist/:id/edit',
        name: 'system-ip-whitelist-edit',
        component: () => import('../pages/system/SystemIpWhitelistEditPage.vue'),
        meta: {
          ...pages['system-ip-whitelist-edit'],
          requiresSuperAdmin: true
        }
      },
      {
        path: 'system/projects/:code/edit',
        alias: 'system/projects/:code/bindings',
        name: 'system-projects-edit',
        component: () => import('../pages/system/SystemProjectEditPage.vue'),
        meta: {
          ...pages['system-projects'],
          name: 'system-projects-edit',
          path: '/system/projects/:code/edit',
          title: '编辑项目',
          description: '维护项目信息，并配置项目与用户、角色、部门的绑定关系。',
          requiresSuperAdmin: true
        }
      },
      {
        path: 'system/roles/:id/edit',
        name: 'system-roles-edit',
        component: () => import('../pages/system/SystemRoleEditPage.vue'),
        meta: {
          ...pages['system-roles'],
          name: 'system-roles-edit',
          path: '/system/roles/:id/edit',
          title: '编辑角色',
          description: '维护角色信息，并配置角色与权限、菜单的绑定关系。',
          requiresSuperAdmin: true
        }
      },
      {
        path: 'system/users/:username/edit',
        name: 'system-users-edit',
        component: () => import('../pages/system/SystemUserEditPage.vue'),
        meta: {
          ...pages['system-users'],
          name: 'system-users-edit',
          path: '/system/users/:username/edit',
          title: '编辑用户',
          description: '维护用户账号信息，配置所属部门、岗位和角色。',
          requiresSuperAdmin: true
        }
      },
      {
        path: 'account/profile',
        name: 'profile',
        component: () => import('../pages/account/ProfilePage.vue'),
        meta: pages.profile
      },
      {
        path: 'account/settings',
        name: 'account-settings',
        component: () => import('../pages/account/AccountSettingsPage.vue'),
        meta: pages['account-settings']
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
        path: 'legal/mobile-apps/beta-users',
        name: 'mobile-app-beta-users',
        component: () => import('../pages/mobile-apps/MobileAppBetaUserPage.vue'),
        meta: pages['mobile-app-beta-users']
      },
      {
        path: 'legal/mobile-apps/beta-users/new',
        name: 'mobile-app-beta-user-create',
        component: () => import('../pages/mobile-apps/MobileAppBetaUserEditPage.vue'),
        meta: pages['mobile-app-beta-user-create']
      },
      {
        path: 'legal/mobile-apps/beta-users/:id/edit',
        name: 'mobile-app-beta-user-edit',
        component: () => import('../pages/mobile-apps/MobileAppBetaUserEditPage.vue'),
        meta: pages['mobile-app-beta-user-edit']
      },
      {
        path: 'legal/mobile-apps/beta-invites',
        name: 'mobile-app-beta-invites',
        component: () => import('../pages/mobile-apps/MobileAppBetaInvitePage.vue'),
        meta: pages['mobile-app-beta-invites']
      },
      {
        path: 'legal/mobile-apps/beta-invites/new',
        name: 'mobile-app-beta-invite-create',
        component: () => import('../pages/mobile-apps/MobileAppBetaInviteEditPage.vue'),
        meta: pages['mobile-app-beta-invite-create']
      },
      {
        path: 'legal/mobile-apps/beta-invites/:id/edit',
        name: 'mobile-app-beta-invite-edit',
        component: () => import('../pages/mobile-apps/MobileAppBetaInviteEditPage.vue'),
        meta: pages['mobile-app-beta-invite-edit']
      },
      {
        path: 'legal/mobile-apps/beta-invite-templates',
        name: 'mobile-app-beta-invite-templates',
        component: () => import('../pages/mobile-apps/MobileAppBetaInviteTemplatePage.vue'),
        meta: pages['mobile-app-beta-invite-templates']
      },
      {
        path: 'legal/mobile-apps/beta-invite-templates/new',
        name: 'mobile-app-beta-invite-template-create',
        component: () => import('../pages/mobile-apps/MobileAppBetaInviteTemplateEditPage.vue'),
        meta: pages['mobile-app-beta-invite-template-create']
      },
      {
        path: 'legal/mobile-apps/beta-invite-templates/:id/edit',
        name: 'mobile-app-beta-invite-template-edit',
        component: () => import('../pages/mobile-apps/MobileAppBetaInviteTemplateEditPage.vue'),
        meta: pages['mobile-app-beta-invite-template-edit']
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
      return { name: 'workbench' }
    }

    if (to.meta?.requiresSuperAdmin && !isSuperAdmin()) {
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
