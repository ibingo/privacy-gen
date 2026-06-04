<template>
  <t-layout class="starter-shell">
    <t-aside v-if="showProjectMenu" class="starter-aside" :class="{ 'is-collapsed': asideCollapsed }">
      <div class="starter-aside-brand">
        <button class="starter-logo starter-logo-button" type="button" title="去首页" @click="goHome">
          <span class="logo-mark">P</span>
          <span>Privacy Gen</span>
        </button>
        <t-button class="aside-collapse-button" variant="text" shape="square" title="折叠菜单" @click="asideCollapsed = !asideCollapsed">
          <menu-unfold-icon v-if="asideCollapsed" />
          <menu-fold-icon v-else />
        </t-button>
      </div>

      <div class="starter-aside-menu">
        <t-menu
          :value="activeMenu"
          :expanded="expandedMenus"
          :collapsed="asideCollapsed"
          theme="light"
          class="nav-menu"
          @change="handleMenuChange"
          @expand="handleExpand"
        >
          <t-submenu
            v-for="group in visiblePageGroups"
            :key="group.title"
            :value="group.title"
          >
            <template #icon>
              <component :is="resolveIcon(group.icon)" />
            </template>
            <template #title>
              {{ group.title }}
            </template>
            <template v-for="page in group.children" :key="page.name">
              <t-submenu v-if="page.children" :value="page.name">
                <template #title>
                  {{ page.title }}
                </template>
                <t-menu-item
                  v-for="child in page.children"
                  :key="child.name"
                  :value="child.name"
                >
                  {{ child.title }}
                </t-menu-item>
              </t-submenu>
              <t-menu-item
                v-else
                :value="page.name"
              >
                {{ page.title }}
              </t-menu-item>
            </template>
          </t-submenu>
        </t-menu>
      </div>

      <div class="starter-aside-footer">TDesign Starter 0.12.0</div>
    </t-aside>

    <t-layout class="starter-main-layout" :class="{ 'is-account-route': accountRouteNames.includes(route.name) }">
      <t-header class="starter-header">
        <div class="topbar-left">
          <div v-if="!showProjectMenu" class="starter-logo">
            <span class="logo-mark">P</span>
            <span>Privacy Gen</span>
          </div>
          <t-button class="topbar-icon-button" variant="text" shape="square" title="去首页" @click="goHome">
            <home-icon />
          </t-button>
          <div class="topbar-search">
            <search-icon />
            <input type="search" placeholder="请输入搜索内容" />
          </div>
        </div>

        <div class="topbar-actions">
          <t-popup
            v-model="notificationPopupVisible"
            trigger="click"
            placement="bottom-right"
            overlay-inner-class-name="notification-popup"
            :overlay-inner-style="{ padding: 0 }"
          >
            <t-badge :count="notificationCount">
              <t-button class="topbar-icon-button" variant="text" shape="square" title="通知中心">
                <mail-icon />
              </t-button>
            </t-badge>
            <template #content>
              <div class="notification-panel">
                <div class="notification-panel-header">
                  <h3>通知中心</h3>
                  <button
                    class="notification-clear"
                    type="button"
                    @click="handleClearNotifications"
                  >
                    清空
                  </button>
                </div>

                <div v-if="notifications.length" class="notification-list">
                  <button
                    v-for="notification in notifications"
                    :key="notification.value"
                    class="notification-item"
                    type="button"
                  >
                    <p class="notification-item-title">{{ notification.title }}</p>
                    <div class="notification-item-meta">
                      <span class="notification-item-category">{{ notification.category }}</span>
                      <span class="notification-item-time">{{ notification.time }}</span>
                    </div>
                  </button>
                </div>

                <div v-else class="notification-empty">暂无通知</div>

                <button class="notification-more" type="button" @click="handleViewAllNotifications">
                  查看全部
                </button>
              </div>
            </template>
          </t-popup>

          <t-button class="topbar-icon-button" variant="text" shape="square" title="代码仓库">
            <logo-github-icon />
          </t-button>

          <t-button class="topbar-icon-button" variant="text" shape="square" title="帮助">
            <help-circle-icon />
          </t-button>

          <t-dropdown
            :options="localeOptions"
            trigger="click"
            placement="bottom-right"
            @click="handleLocaleChange"
          >
            <t-button class="topbar-icon-button" variant="text" shape="square" title="国际化切换">
              <translate-icon />
            </t-button>
          </t-dropdown>

          <t-popup
            v-model="projectPopupVisible"
            trigger="click"
            placement="bottom-right"
            overlay-inner-class-name="project-popup"
            :overlay-inner-style="{ padding: 0 }"
          >
            <button class="topbar-project" type="button">
              <folder-open-icon />
              <span>{{ selectedProject.name }}</span>
              <chevron-down-icon />
            </button>
            <template #content>
              <div class="project-panel">
                <div class="project-panel-scroll">
                  <section
                    v-for="group in projectGroups"
                    :key="group.title"
                    class="project-group"
                  >
                    <p class="project-group-title">{{ group.title }}</p>
                    <div class="project-grid">
                      <button
                        v-for="project in group.children"
                        :key="project.value"
                        class="project-option"
                        :class="{ 'is-active': project.value === selectedProjectValue }"
                        type="button"
                        @click="handleProjectChange(project)"
                      >
                        <span class="project-option-icon">{{ project.shortName }}</span>
                        <span class="project-option-main">
                          <span class="project-option-name">
                            <span>{{ project.name }}</span>
                            <span class="project-option-tag">{{ project.status }}</span>
                          </span>
                          <span class="project-option-desc">{{ project.description }}</span>
                        </span>
                      </button>
                    </div>
                  </section>
                </div>
                <button class="project-more" type="button" @click="handleViewMoreProjects">查看更多</button>
              </div>
            </template>
          </t-popup>

          <t-dropdown
            :options="userOptions"
            trigger="click"
            placement="bottom-right"
            @click="handleUserMenuClick"
          >
            <button class="topbar-user" type="button">
              <user-circle-icon />
              <span>{{ currentUserName }}</span>
              <chevron-down-icon />
            </button>
          </t-dropdown>
        </div>
      </t-header>

      <div v-if="showPageHeading" class="page-heading">
        <p class="eyebrow">{{ currentGroupTitle }}</p>
        <h2>{{ pageTitle }}</h2>
        <p>{{ pageDescription }}</p>
      </div>
      <t-content class="starter-main-content">
        <router-view />
      </t-content>
    </t-layout>

    <div v-if="showEditorChat" class="editor-chat-entry">
      <section
        v-if="editorChatVisible"
        class="editor-chat-panel"
        aria-label="AI 编辑助手"
      >
        <header class="editor-chat-header">
          <div class="editor-chat-title">
            <span class="editor-chat-title-icon">
              <robot-icon />
            </span>
            <span>
              <strong>AI 编辑助手</strong>
              <small>{{ pageTitle }}</small>
            </span>
          </div>
          <button
            class="editor-chat-close"
            type="button"
            aria-label="关闭 AI 编辑助手"
            @click="editorChatVisible = false"
          >
            <close-icon />
          </button>
        </header>
        <chatbot-component
          :key="route.fullPath"
          class="editor-chatbot"
          layout="single"
          :default-messages="editorChatDefaultMessages"
          :sender-props="editorChatSenderProps"
          :message-props="editorChatMessageProps"
          :chat-service-config="editorChatServiceConfig"
        />
      </section>

      <t-button
        class="editor-chat-fab"
        theme="primary"
        shape="circle"
        title="打开 AI 编辑助手"
        @click="editorChatVisible = !editorChatVisible"
      >
        <template #icon>
          <chat-bubble-icon />
        </template>
      </t-button>
    </div>
  </t-layout>
</template>

<script setup>
import { computed, h, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AppIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  CloseIcon,
  FileIcon,
  FileIconIcon,
  FolderOpenIcon,
  HelpCircleIcon,
  HomeIcon,
  ImageEditIcon,
  ImageAddIcon,
  LinkIcon,
  LogoGithubIcon,
  MailIcon,
  MenuFoldIcon,
  MenuUnfoldIcon,
  MobileListIcon,
  LogoutIcon,
  RobotIcon,
  RootListIcon,
  SearchIcon,
  SecuredIcon,
  Setting1Icon,
  TranslateIcon,
  UserCircleIcon,
  ViewListIcon,
  ViewModuleIcon
} from 'tdesign-icons-vue-next'
import { Chatbot as ChatbotComponent } from '@tdesign-vue-next/chat'
import {
  Aside as TAside,
  Badge as TBadge,
  Button as TButton,
  Content as TContent,
  Dropdown as TDropdown,
  Header as THeader,
  Layout as TLayout,
  Menu as TMenu,
  MenuItem as TMenuItem,
  Popup as TPopup,
  Submenu as TSubmenu
} from 'tdesign-vue-next'
import { pageGroups, pages } from '../config/pages'
import {
  defaultProjectRouteName,
  defaultProjectValue,
  PROJECT_STORAGE_KEY,
  projectGroups as staticGroups
} from '../config/projects'
import { getProjects } from '../api/projects'
import { getActiveIconProjectId } from '../config/iconProjects'
import { ensureAuthPermissions, fetchSession, getUser, getUserMenus, isSuperAdmin, logout } from '../utils/auth'

const route = useRoute()
const router = useRouter()
const expandedMenus = ref(pageGroups.flatMap((group) => [
  group.title,
  ...group.children.filter((page) => page.children).map((page) => page.name)
]))
const selectedProjectValue = ref(localStorage.getItem(PROJECT_STORAGE_KEY) || defaultProjectValue)
const selectedLocaleValue = ref('zh-CN')
const projectPopupVisible = ref(false)
const projectGroups = ref(staticGroups)
const existingProjects = computed(() => projectGroups.value.flatMap((g) => g.children))
const notificationPopupVisible = ref(false)
const editorChatVisible = ref(false)
const asideCollapsed = ref(false)
const currentUser = ref(getUser())
const authMenus = ref(getUserMenus())

const locales = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' }
]

const notifications = ref([
  {
    value: 'notice-privacy',
    title: '腾讯大厦一楼改造施工项目 已通过审核！',
    category: '合同动态',
    time: '2021-01-01 08:00'
  },
  {
    value: 'notice-config',
    title: '三季度生产原材料采购项目 开票成功！',
    category: '票务动态',
    time: '2021-01-01 08:00'
  },
  {
    value: 'notice-export',
    title: '2021-01-01 10:00的【国家电网线下签约】会议即将开始，请提前10分钟前往 会议室1 进行签到！',
    category: '会议通知',
    time: '2021-01-01 08:00'
  },
  {
    value: 'notice-agreement',
    title: '一季度生产原材料采购项目 开票成功！',
    category: '票务动态',
    time: '2021-01-01 08:00'
  }
])

const iconMap = {
  AppIcon,
  FileIcon,
  FileIconIcon,
  FolderOpenIcon,
  ImageAddIcon,
  ImageEditIcon,
  LinkIcon,
  MobileListIcon,
  RootListIcon,
  SecuredIcon,
  Setting1Icon,
  TranslateIcon,
  UserCircleIcon,
  ViewListIcon,
  ViewModuleIcon
}

const activeMenu = computed(() => {
  if (route.name?.startsWith?.('system-') && route.name?.endsWith?.('-create')) {
    return route.name.replace(/-create$/, '')
  }
  if (route.name === 'system-projects-edit') return 'system-projects'
  if (route.name === 'system-roles-edit') return 'system-roles'
  if (route.name === 'system-users-edit') return 'system-users'
  if (['system-ip-whitelist-create', 'system-ip-whitelist-edit'].includes(route.name)) return 'system-ip-whitelist'
  if (['privacy', 'privacy-edit', 'privacy-detail'].includes(route.name)) return 'privacy-list'
  if (['agreement', 'agreement-edit', 'agreement-detail'].includes(route.name)) return 'agreement-list'
  if (['icon-edit', 'icon-create'].includes(route.name)) return 'icon-list'
  if (route.name === 'i18n-languages') return 'i18n-languages'
  if (i18nRouteNames.includes(route.name)) return 'i18n-project-list'
  if (['app-icon-create', 'app-icon-generate'].includes(route.name)) return 'app-icon-list'
  if (['app-launch-create', 'app-launch-edit'].includes(route.name)) return 'app-launch-list'
  if (['mobile-app-platforms', 'mobile-app-detail', 'mobile-app-edit', 'mobile-app-versions', 'mobile-app-install-manage'].includes(route.name)) return 'mobile-app-list'
  if (['mobile-app-experiment-edit', 'mobile-app-experiment-create'].includes(route.name)) return 'mobile-app-experiments'
  if (['mobile-app-flag-configs', 'mobile-app-flag-config-edit', 'mobile-app-flag-prerequisite-edit'].includes(route.name)) return 'mobile-app-experiments'
  if (['mobile-app-segment-edit', 'mobile-app-segment-create'].includes(route.name)) return 'mobile-app-segments'
  if (['mobile-app-segment-attribute-detail', 'mobile-app-segment-attribute-create'].includes(route.name)) return 'mobile-app-segment-attributes'
  if (['mobile-app-beta-user-create', 'mobile-app-beta-user-edit'].includes(route.name)) return 'mobile-app-beta-users'
  if (['mobile-app-beta-invite-create', 'mobile-app-beta-invite-edit', 'mobile-app-beta-invite-detail'].includes(route.name)) return 'mobile-app-beta-invites'
  if (['mobile-app-beta-invite-template-create', 'mobile-app-beta-invite-template-edit'].includes(route.name)) return 'mobile-app-beta-invite-templates'
  if (route.name === 'mobile-app-flag-approval-edit') return 'mobile-app-flag-approvals'
  return route.name || 'home'
})
const pageMeta = computed(() => pages[route.name] || pages[defaultProjectRouteName] || pages.projects)
const pageTitle = computed(() => pageMeta.value.title)
const pageDescription = computed(() => pageMeta.value.description)
const accountRouteNames = ['profile', 'account-settings', 'user-info-settings']
const systemRouteNames = ['system-users', 'system-roles', 'system-permissions', 'system-menus', 'system-departments', 'system-posts', 'system-dicts', 'system-params', 'system-short-links', 'system-ai-translation-services', 'system-clients', 'system-projects', 'system-configs', 'object-storage-file-list', 'system-ip-whitelist']
const isSystemRoute = computed(() => systemRouteNames.includes(route.name) || systemRouteNames.some((name) => route.name === `${name}-create`) || route.name === 'system-projects-edit' || route.name === 'system-roles-edit' || route.name === 'system-users-edit' || route.name === 'system-ip-whitelist-edit')
const shellRouteNames = ['projects', 'workbench']
const i18nRouteNames = [
  'i18n-module',
  'i18n-overview',
  'i18n-project-list',
  'i18n-word-list',
  'i18n-operation-history',
  'i18n-word-tags',
  'i18n-import',
  'i18n-languages',
  'i18n-task',
  'i18n-task-create',
  'i18n-download',
  'i18n-cloud-integrations',
  'i18n-cloud-integration-detail',
  'i18n-settings'
]
const starterListRouteNames = [
  'privacy-list',
  'agreement-list',
  'i18n-overview',
  'i18n-project-list',
  'i18n-word-list',
  'i18n-operation-history',
  'i18n-word-tags',
  'i18n-import',
  'i18n-languages',
  'i18n-task',
  'i18n-settings',
  'i18n-download',
  'i18n-cloud-integrations',
  'icon-project-list',
  'app-icon-list',
  'app-launch-list',
  'mobile-app-experiments',
  'mobile-app-ab-tests',
  'mobile-app-flag-approvals',
  'mobile-app-segments',
  'mobile-app-segment-attributes',
  'mobile-app-beta-users',
  'mobile-app-beta-invites',
  'mobile-app-beta-invite-templates'
]

const normalizeMenuPath = (path) => {
  const value = String(path || '').trim()
  if (!value) return ''
  return `/${value.replace(/^\/+/, '')}`.replace(/\/+$/, '')
}

const collectMenuPaths = (menus = []) => {
  const paths = []
  const walk = (items) => {
    ;(Array.isArray(items) ? items : []).forEach((item) => {
      const path = normalizeMenuPath(item.path)
      if (path) paths.push(path)
      if (Array.isArray(item.children) && item.children.length) {
        walk(item.children)
      }
    })
  }
  walk(menus)
  return paths
}

const isPageAllowedByMenus = (page, menuPaths) => {
  const pagePath = normalizeMenuPath(page.path)
  if (!pagePath) return false
  return menuPaths.some((menuPath) => pagePath === menuPath || pagePath.startsWith(`${menuPath}/`))
}

const filterPagesByMenus = (items, menuPaths) => {
  return items
    .filter((page) => !page.hidden)
    .map((page) => {
      const children = page.children ? filterPagesByMenus(page.children, menuPaths) : undefined
      if (children?.length) {
        return {
          ...page,
          children
        }
      }
      return isPageAllowedByMenus(page, menuPaths) ? page : null
    })
    .filter(Boolean)
}

const filterVisiblePages = (items) => {
  return items
    .filter((page) => !page.hidden)
    .map((page) => ({
      ...page,
      children: page.children ? filterVisiblePages(page.children) : undefined
    }))
}

const filterVisibleGroups = (groups) => {
  return groups
    .map((group) => ({
      ...group,
      children: filterVisiblePages(group.children || [])
    }))
    .filter((group) => group.children.length)
}

const visiblePageGroups = computed(() => {
  if (isSystemRoute.value) {
    return filterVisibleGroups(pageGroups.filter((group) => group.title === '系统管理' && isSuperAdmin()))
  }

  if (accountRouteNames.includes(route.name)) {
    return filterVisibleGroups(pageGroups.filter((group) => group.title === '账号中心'))
  }

  if (isSuperAdmin()) {
    return filterVisibleGroups(pageGroups.filter((group) => !group.adminOnly && group.title !== '账号中心'))
  }

  const menuPaths = collectMenuPaths(authMenus.value)
  return pageGroups
    .filter((group) => !group.adminOnly && group.title !== '账号中心')
    .map((group) => ({
      ...group,
      children: filterPagesByMenus(group.children, menuPaths)
    }))
    .filter((group) => group.children.length)
})
const showProjectMenu = computed(() => !shellRouteNames.includes(route.name))
const showPageHeading = computed(() => !isSystemRoute.value && !starterListRouteNames.includes(route.name) && !['projects', 'workbench', 'profile', 'privacy-detail', 'agreement-detail', 'i18n-task-create', 'i18n-cloud-integration-detail', 'icon-edit', 'icon-create', 'app-launch-edit', 'mobile-app-overview', 'mobile-app-platforms', 'mobile-app-detail', 'mobile-app-edit', 'mobile-app-versions', 'mobile-app-install-manage', 'mobile-app-experiment-edit', 'mobile-app-experiment-create', 'mobile-app-flag-config-edit', 'mobile-app-segment-edit', 'mobile-app-segment-attribute-create', 'mobile-app-segment-attribute-detail', 'mobile-app-flag-approval-edit', 'mobile-app-beta-user-create', 'mobile-app-beta-user-edit', 'mobile-app-beta-invite-create', 'mobile-app-beta-invite-edit', 'mobile-app-beta-invite-detail', 'mobile-app-beta-invite-template-create', 'mobile-app-beta-invite-template-edit', 'object-storage-file-list'].includes(route.name))
const editorRouteNames = [
  'privacy',
  'privacy-edit',
  'agreement',
  'agreement-edit',
  'i18n-task-create',
  'app-icon-create',
  'app-icon-generate',
  'app-launch-create',
  'app-launch-edit',
  'icon-create',
  'icon-edit'
]
const showEditorChat = computed(() => editorRouteNames.includes(route.name))
const selectedProject = computed(() => {
  return existingProjects.value.find((project) => project.value === selectedProjectValue.value) || existingProjects.value[0] || {
    value: defaultProjectValue,
    name: '请选择产品',
    shortName: '',
    status: '',
    description: ''
  }
})
const localeOptions = computed(() => {
  return locales.map((locale) => ({
    value: locale.value,
    content: locale.label,
    active: locale.value === selectedLocaleValue.value
  }))
})
const notificationCount = computed(() => notifications.value.length)
const currentUserName = computed(() => {
  const user = currentUser.value || {}
  return user.displayName
    || user.name
    || user.realName
    || user.nickname
    || user.nickName
    || user.username
    || user.account
    || user.loginName
    || '用户'
})
const userOptions = computed(() => [
  {
    value: 'profile',
    content: '个人中心',
    prefixIcon: () => h(UserCircleIcon)
  },
  {
    value: 'settings',
    content: '账号设置',
    prefixIcon: () => h(Setting1Icon)
  },
  {
    value: 'help',
    content: '帮助文档',
    prefixIcon: () => h(HelpCircleIcon),
    divider: true
  },
  {
    value: 'logout',
    content: '退出登录',
    prefixIcon: () => h(LogoutIcon)
  }
])

const getProjectGroupTitle = (project) => {
  if (project.group && typeof project.group === 'object') {
    return project.group.title || project.group.name || project.group.label
  }

  return project.groupTitle
    || project.groupName
    || project.projectGroupName
    || project.categoryName
    || project.category
    || project.group
    || '项目列表'
}

const normalizeProject = (project) => {
  const name = project.name || project.label || project.title || project.value || '未命名项目'
  return {
    ...project,
    value: project.value || project.id || project.code || project.key || name,
    name,
    shortName: project.shortName || project.abbr || name.slice(0, 1),
    status: project.status || '已启用',
    statusTone: project.statusTone || 'active',
    description: project.description || project.desc || ''
  }
}

const groupProjects = (projects) => {
  if (!Array.isArray(projects) || !projects.length) return staticGroups

  const grouped = new Map()
  projects.forEach((project) => {
    const normalizedProject = normalizeProject(project)
    const groupTitle = getProjectGroupTitle(project)
    if (!grouped.has(groupTitle)) {
      grouped.set(groupTitle, {
        title: groupTitle,
        children: []
      })
    }
    grouped.get(groupTitle).children.push(normalizedProject)
  })

  return Array.from(grouped.values())
}

const syncSelectedProject = () => {
  const projects = existingProjects.value
  if (!projects.length) return

  const storedValue = localStorage.getItem(PROJECT_STORAGE_KEY)
  const nextValue = projects.some((project) => project.value === storedValue)
    ? storedValue
    : projects[0].value

  selectedProjectValue.value = nextValue
  localStorage.setItem(PROJECT_STORAGE_KEY, nextValue)
}
const currentGroupTitle = computed(() => {
  if (accountRouteNames.includes(route.name)) return '账号中心'
  if (isSystemRoute.value) return '系统管理'

  const routeName = ['app-launch-create', 'app-launch-edit'].includes(route.name)
    ? 'app-launch-list'
    : ['app-icon-create', 'app-icon-generate'].includes(route.name)
    ? 'app-icon-list'
    : ['icon-edit', 'icon-create'].includes(route.name)
    ? 'icon-list'
    : route.name === 'i18n-languages'
    ? 'i18n-languages'
    : i18nRouteNames.includes(route.name)
    ? 'i18n-project-list'
    : ['mobile-app-experiment-edit', 'mobile-app-experiment-create'].includes(route.name)
    ? 'mobile-app-experiments'
    : ['mobile-app-flag-configs', 'mobile-app-flag-config-edit', 'mobile-app-flag-prerequisite-edit'].includes(route.name)
    ? 'mobile-app-experiments'
    : ['mobile-app-segment-edit', 'mobile-app-segment-create'].includes(route.name)
    ? 'mobile-app-segments'
    : ['mobile-app-segment-attribute-detail', 'mobile-app-segment-attribute-create'].includes(route.name)
    ? 'mobile-app-segment-attributes'
    : route.name === 'mobile-app-flag-approval-edit'
    ? 'mobile-app-flag-approvals'
    : ['mobile-app-platforms', 'mobile-app-detail', 'mobile-app-edit', 'mobile-app-versions', 'mobile-app-install-manage'].includes(route.name)
    ? 'mobile-app-list'
    : route.name
  const group = visiblePageGroups.value.find((item) => item.children.some((page) => {
    if (page.name === routeName) return true
    return page.children?.some((child) => child.name === routeName)
  }))
  return group?.title || pageGroups[0]?.title || selectedProject.value?.name || ''
})
const editorChatDefaultMessages = computed(() => [
  {
    id: 'editor-chat-welcome',
    role: 'assistant',
    status: 'complete',
    datetime: new Date().toISOString(),
    content: [
      {
        type: 'markdown',
        data: `我可以协助你编辑「${pageTitle.value}」。可以直接描述要生成、检查或优化的内容。`
      }
    ]
  }
])
const editorChatSenderProps = {
  placeholder: '输入编辑需求，例如：检查当前文案风险点',
  actions: ['send'],
  autosize: {
    minRows: 2,
    maxRows: 4
  }
}
const editorChatMessageProps = {
  assistant: {
    name: 'AI 编辑助手',
    avatar: () => h(RobotIcon),
    variant: 'outline',
    actions: ['copy', 'good', 'bad']
  },
  user: {
    name: '我',
    variant: 'text',
    actions: false
  }
}
const editorChatServiceConfig = computed(() => ({
  stream: false,
  endpoint: 'data:application/json,{}',
  onComplete: (_isAborted, params) => ({
    type: 'markdown',
    data: createEditorChatReply(params?.prompt || '')
  })
}))

const resolveIcon = (iconName) => iconMap[iconName] || ViewListIcon

const createEditorChatReply = (prompt) => {
  const normalizedPrompt = prompt.trim() || '当前编辑内容'
  return [
    `已收到你在「${pageTitle.value}」中的请求：${normalizedPrompt}`,
    '',
    '建议可以从这几项开始处理：',
    '',
    '1. 明确适用对象、版本范围和生效场景。',
    '2. 检查必填字段、命名、尺寸、平台或法务条款是否完整。',
    '3. 生成内容前先对照当前项目配置，避免跨项目复用错误信息。',
    '',
    '当前接入的是本地示例响应；后续可以把 `chatServiceConfig.endpoint` 替换为真实 AI 服务接口。'
  ].join('\n')
}

const handleMenuChange = (name) => {
  if (name === 'icon-list') {
    router.push({ name, params: { projectId: getActiveIconProjectId() } })
    return
  }

  router.push({ name })
}

const handleExpand = (values) => {
  expandedMenus.value = values
}

const goHome = () => {
  if (route.name === 'workbench') return
  router.push({ name: 'workbench' })
}

watch(
  () => route.fullPath,
  () => {
    selectedProjectValue.value = localStorage.getItem(PROJECT_STORAGE_KEY) || defaultProjectValue
    if (!showEditorChat.value) {
      editorChatVisible.value = false
    }
  }
)

onMounted(async () => {
  try {
    await fetchSession()
    currentUser.value = getUser()
    if (!isSuperAdmin()) {
      const data = await ensureAuthPermissions()
      authMenus.value = data.menus
    }
  } catch {
    currentUser.value = getUser()
  }

  try {
    const projects = await getProjects()
    projectGroups.value = groupProjects(projects)
    syncSelectedProject()
  } catch {
    projectGroups.value = staticGroups
    syncSelectedProject()
  }
})

const handleProjectChange = (data) => {
  selectedProjectValue.value = data.value
  localStorage.setItem(PROJECT_STORAGE_KEY, data.value)
  projectPopupVisible.value = false
  if (route.name !== defaultProjectRouteName) {
    router.push({ name: defaultProjectRouteName })
  }
}

const handleLocaleChange = (data) => {
  selectedLocaleValue.value = data.value
}

const handleViewMoreProjects = () => {
  projectPopupVisible.value = false
  router.push({ name: 'projects', query: { redirect: route.fullPath } })
}

const handleClearNotifications = () => {
  notifications.value = []
}

const handleViewAllNotifications = () => {
  notificationPopupVisible.value = false
}

const handleUserMenuClick = async ({ value }) => {
  if (value === 'profile') {
    router.push({ name: 'profile' })
    return
  }

  if (value === 'settings') {
    router.push({ name: 'account-settings' })
    return
  }

  if (value !== 'logout') {
    return
  }

  await logout()
  router.replace({
    name: 'login',
    query: route.fullPath ? { redirect: route.fullPath } : undefined
  })
}
</script>
