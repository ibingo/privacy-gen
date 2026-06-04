export const pageGroups = [
  {
    title: '系统管理',
    icon: 'RootListIcon',
    adminOnly: true,
    children: [
      {
        name: 'system-users',
        path: '/system/users',
        title: '用户管理',
        description: '维护系统账号、登录状态、所属部门和数据权限。',
        icon: 'UserCircleIcon'
      },
      {
        name: 'system-roles',
        path: '/system/roles',
        title: '角色管理',
        description: '配置角色权限、菜单授权和功能范围。',
        icon: 'SecuredIcon'
      },
      {
        name: 'system-permissions',
        path: '/system/permissions',
        title: '权限管理',
        description: '查看系统权限点、权限编码和权限说明。',
        icon: 'SecuredIcon'
      },
      {
        name: 'system-menus',
        path: '/system/menus',
        title: '菜单管理',
        description: '维护系统菜单、路由、按钮权限和展示顺序。',
        icon: 'ViewListIcon'
      },
      {
        name: 'system-departments',
        path: '/system/departments',
        title: '部门管理',
        description: '管理组织部门、负责人和层级关系。',
        icon: 'RootListIcon'
      },
      {
        name: 'system-posts',
        path: '/system/posts',
        title: '岗位管理',
        description: '维护岗位编码、岗位名称和启停状态。',
        icon: 'UserCircleIcon'
      },
      {
        name: 'system-dicts',
        path: '/system/dicts',
        title: '字典管理',
        description: '管理系统字典类型、枚举值和业务展示文案。',
        icon: 'FileIcon'
      },
      {
        name: 'system-params',
        path: '/system/params',
        title: '参数设置',
        description: '维护系统运行参数、默认配置和开关项。',
        icon: 'Setting1Icon'
      },
      {
        name: 'system-short-links',
        path: '/system/short-links',
        title: '短链接管理',
        description: '查看短链接目标地址、访问次数、启用状态和过期状态。',
        icon: 'LinkIcon'
      },
      {
        name: 'system-ai-translation-services',
        path: '/system/ai-translation-services',
        title: 'AI 翻译来源',
        description: '管理全局 AI 翻译服务、模型、接口地址和提示词策略。',
        icon: 'TranslateIcon'
      },
      {
        name: 'system-clients',
        path: '/system/clients',
        title: '客户端管理',
        description: '管理接入客户端、密钥、回调地址和授权范围。',
        icon: 'MobileListIcon'
      },
      {
        name: 'system-projects',
        path: '/system/projects',
        title: '项目管理',
        description: '维护项目信息，配置项目与用户、角色、部门的绑定关系。',
        icon: 'FolderOpenIcon'
      },
      {
        name: 'system-configs',
        path: '/system/configs',
        title: '配置管理',
        description: '管理对象存储、短信服务和平台通用配置。',
        icon: 'Setting1Icon'
      },
      {
        name: 'system-test-management',
        title: '测试管理',
        description: '维护管理侧测试访问和环境准入配置。',
        icon: 'Setting1Icon',
        children: [
          {
            name: 'system-ip-whitelist',
            path: '/system/testing/ip-whitelist',
            title: 'IP 白名单',
            description: '管理允许进入内测环境的 IP 与 IP 段白名单。',
            icon: 'ViewListIcon'
          }
        ]
      },
    ]
  },
  {
    title: '法务',
    icon: 'RootListIcon',
    children: [
      {
        name: 'privacy-list',
        path: '/legal/privacy-policies',
        title: '隐私政策列表',
        description: '按项目统一查看隐私政策文档、状态与更新时间。',
        icon: 'SecuredIcon'
      },
      {
        name: 'agreement-list',
        path: '/legal/user-agreements',
        title: '用户协议列表',
        description: '按项目统一查看用户协议文档、状态与更新时间。',
        icon: 'FileIcon'
      },
      {
        name: 'config',
        path: '/legal/config',
        title: '配置',
        description: '管理生成文档时使用的本地配置。',
        icon: 'Setting1Icon'
      }
    ]
  },
  {
    title: '国际化',
    icon: 'TranslateIcon',
    children: [
      {
        name: 'i18n-overview',
        path: '/legal/i18n/projects/:projectId/overview',
        title: '概览',
        description: '查看国际化语言覆盖、待处理任务和最近发布情况。',
        icon: 'RootListIcon',
        hidden: true
      },
      {
        name: 'i18n-project-list',
        path: '/legal/i18n/projects',
        title: '文案项目',
        description: '按移动应用或手动项目管理国际化文案库，进入后维护多语言词条。',
        icon: 'ViewModuleIcon'
      },
      {
        name: 'i18n-import',
        path: '/legal/i18n/projects/:projectId/import',
        title: '导入',
        description: '导入国际化词条文件并校验缺失项、冲突项和语言覆盖率。',
        icon: 'FileIcon',
        hidden: true
      },
      {
        name: 'i18n-word-tags',
        path: '/legal/i18n/projects/:projectId/tags',
        title: '标签管理',
        description: '管理当前文案项目的标签、适用平台和关联文案数量。',
        icon: 'ViewListIcon',
        hidden: true
      },
      {
        name: 'i18n-operation-history',
        path: '/legal/i18n/projects/:projectId/operation-history',
        title: '操作记录',
        description: '查看当前文案项目的新增、修改、删除、发布和回滚记录。',
        icon: 'ViewListIcon',
        hidden: true
      },
      {
        name: 'i18n-task',
        path: '/legal/i18n/projects/:projectId/tasks',
        title: '任务',
        description: '查看导入、校验、发布和导出任务的执行状态与结果。',
        icon: 'Setting1Icon',
        hidden: true
      },
      {
        name: 'i18n-download',
        path: '/legal/i18n/projects/:projectId/download',
        title: '下载',
        description: '按语言、环境和版本导出国际化资源包。',
        icon: 'Setting1Icon',
        hidden: true
      },
      {
        name: 'i18n-cloud-integrations',
        path: '/legal/i18n/projects/:projectId/cloud-integrations',
        title: '云集成',
        description: '管理国际化云端同步、Webhook、CDN 分发和平台连接。',
        icon: 'Setting1Icon',
        hidden: true
      },
      {
        name: 'i18n-settings',
        path: '/legal/i18n/projects/:projectId/settings',
        title: '设置',
        description: '配置项目默认语种、目标语种和 Webhook 事件通知。',
        icon: 'Setting1Icon',
        hidden: true
      },
      {
        name: 'i18n-languages',
        path: '/legal/i18n/languages',
        title: '语种',
        description: '查看 PgyerexLangSupport 语种代码、Locale、Android 与 iOS/macOS 资源代码。',
        icon: 'TranslateIcon'
      }
    ]
  },
  {
    title: '图标资源',
    icon: 'FileIconIcon',
    children: [
      {
        name: 'icon-project-list',
        path: '/legal/icon-projects',
        title: '图标项目列表',
        description: '按产品和环境隔离管理图标资源库。',
        icon: 'RootListIcon'
      },
      {
        name: 'icon-list',
        path: '/legal/icon-projects/:projectId/icons',
        title: '图标工作区',
        description: '集中管理产品图标资源、分类、状态和导出格式。',
        icon: 'ViewModuleIcon'
      }
    ]
  },
  {
    title: '应用图标',
    icon: 'AppIcon',
    children: [
      {
        name: 'app-icon-list',
        path: '/legal/app-icons',
        title: '应用图标列表',
        description: '按应用统一管理移动端应用图标、生成平台、版本和发布状态。',
        icon: 'MobileListIcon'
      }
    ]
  },
  {
    title: '应用启动页',
    icon: 'ImageAddIcon',
    children: [
      {
        name: 'app-launch-list',
        path: '/legal/app-launches',
        title: '应用启动页列表',
        description: '按应用统一管理启动图资源、版本支持、生成状态和最近更新时间。',
        icon: 'MobileListIcon'
      }
    ]
  },
  {
    title: '移动应用中心',
    icon: 'MobileListIcon',
    children: [
      {
        name: 'mobile-app-overview',
        path: '/legal/mobile-apps/overview',
        title: '概览',
        description: '查看移动应用的平台分布、下载量、评分和最近发布动态。',
        icon: 'RootListIcon'
      },
      {
        name: 'mobile-app-list',
        path: '/legal/mobile-apps/list',
        title: '应用列表',
        description: '按平台和状态筛选移动应用，查看版本、下载量和更新记录。',
        icon: 'ViewModuleIcon'
      },
      {
        name: 'mobile-app-ab-tests',
        path: '/legal/mobile-apps/ab-tests',
        title: 'AB 测试',
        description: '管理移动端实验流量、版本策略、分组命中和转化指标。',
        icon: 'Setting1Icon'
      },
      {
        name: 'mobile-app-internal-testing',
        title: '内部测试',
        description: '维护业务侧内测用户、测试发布和灰度验证相关配置。',
        icon: 'Setting1Icon',
        children: [
          {
            name: 'mobile-app-beta-users',
            path: '/legal/mobile-apps/beta-users',
            title: '内测用户列表',
            description: '管理允许进入业务侧内测环境的用户白名单。',
            icon: 'ViewListIcon'
          },
          {
            name: 'mobile-app-beta-invites',
            path: '/legal/mobile-apps/beta-invites',
            title: '内测邀请列表',
            description: '管理公开邀请、密码邀请、指定版本和内测名额。',
            icon: 'FileIcon'
          },
          {
            name: 'mobile-app-beta-invite-templates',
            path: '/legal/mobile-apps/beta-invite-templates',
            title: '内测邀请模版',
            description: '管理内测邀请移动端和 PC 端页面模版。',
            icon: 'ViewModuleIcon'
          }
        ]
      }
    ]
  },
  {
    title: '功能特性管理',
    icon: 'Setting1Icon',
    children: [
      {
        name: 'mobile-app-experiments',
        path: '/legal/mobile-apps/experiments',
        title: '开关管理',
        description: '管理移动端特性开关、环境规则、Variation 和实验层。',
        icon: 'Setting1Icon'
      },
      {
        name: 'mobile-app-segment-group',
        title: '人群组',
        icon: 'ViewListIcon',
        children: [
          {
            name: 'mobile-app-segments',
            path: '/legal/mobile-apps/segments',
            title: '人群组列表',
            description: '管理可复用用户人群组，用于开关命中和实验筛选。',
            icon: 'ViewListIcon'
          },
          {
            name: 'mobile-app-segment-attributes',
            path: '/legal/mobile-apps/segment-attributes',
            title: '人群属性列表',
            description: '管理可在人群组条件中选择的用户属性。',
            icon: 'ViewListIcon'
          }
        ]
      },
      {
        name: 'mobile-app-flag-approvals',
        path: '/legal/mobile-apps/flag-approvals',
        title: '开关审批',
        description: '管理开关发布、灰度扩大和规则变更审批。',
        icon: 'FileIcon'
      }
    ]
  },
  {
    title: '账号中心',
    icon: 'UserCircleIcon',
    children: [
      {
        name: 'profile',
        path: '/account/profile',
        title: '个人中心',
        description: '查看个人资料、团队成员、服务产品和访问数据。',
        icon: 'UserCircleIcon'
      },
      {
        name: 'account-settings',
        path: '/account/settings',
        title: '账号设置',
        description: '维护账号基础信息、安全验证和登录保护策略。',
        icon: 'Setting1Icon'
      },
      {
        name: 'user-info-settings',
        path: '/account/user-info-settings',
        title: '用户信息设置',
        description: '维护个人资料展示信息和工作联系方式。',
        icon: 'UserIcon',
        hidden: true
      }
    ]
  }
]

export const pages = pageGroups.reduce((acc, group) => {
  const collect = (items) => {
    items.forEach((page) => {
      acc[page.name] = page
      if (page.children) collect(page.children)
    })
  }
  collect(group.children)
  return acc
}, {})

pages.projects = {
  name: 'projects',
  path: '/legal/projects',
  title: '项目列表',
  description: '统一查看、搜索和切换当前可访问的项目。',
  icon: 'ViewListIcon'
}

pages.workbench = {
  name: 'workbench',
  path: '/workbench',
  title: '工作台',
  description: '选择项目选择、系统管理等不同工作入口。',
  icon: 'RootListIcon'
}

pages['object-storage-file-list'] = {
  name: 'object-storage-file-list',
  path: '/oss-list',
  title: '对象存储文件',
  description: '查看对象存储配置下的远程文件列表。',
  icon: 'ViewListIcon',
  hidden: true
}

pages.privacy = {
  name: 'privacy',
  path: '/legal/privacy/new',
  title: '新建隐私政策',
  description: '填写应用和第三方 SDK 信息，实时生成可复制、可下载的隐私政策文本。',
  icon: 'ViewListIcon'
}

pages['privacy-edit'] = {
  name: 'privacy-edit',
  path: '/legal/privacy-policies/:id/edit',
  title: '编辑隐私政策',
  description: '维护隐私政策关联应用、公司信息、SDK 信息和补充说明。',
  icon: 'ViewListIcon'
}

pages['privacy-detail'] = {
  name: 'privacy-detail',
  path: '/legal/privacy-policies/:id',
  title: '隐私政策详情',
  description: '以只读卡片查看隐私政策基础信息、SDK 明细和文档预览。',
  icon: 'SecuredIcon'
}

pages.agreement = {
  name: 'agreement',
  path: '/legal/agreement/new',
  title: '新建用户协议',
  description: '填写应用和服务信息，实时生成参考通用法律声明结构的用户协议文本。',
  icon: 'FileIcon'
}

pages['agreement-edit'] = {
  name: 'agreement-edit',
  path: '/legal/user-agreements/:id/edit',
  title: '编辑用户协议',
  description: '维护用户协议关联应用、服务范围、公司信息和补充条款。',
  icon: 'FileIcon'
}

pages['agreement-detail'] = {
  name: 'agreement-detail',
  path: '/legal/user-agreements/:id',
  title: '用户协议详情',
  description: '以只读卡片查看用户协议基础信息、存档状态和文档预览。',
  icon: 'FileIcon'
}

pages['i18n-cloud-integration-detail'] = {
  name: 'i18n-cloud-integration-detail',
  path: '/legal/i18n/projects/:projectId/cloud-integrations/:id',
  title: '云集成详情',
  description: '查看和维护云集成的版本、预览、发布和接入记录。',
  icon: 'Setting1Icon'
}

pages['i18n-word-list'] = {
  name: 'i18n-word-list',
  path: '/legal/i18n/projects/:projectId',
  title: '国际化文案列表',
  description: '集中查看当前文案项目的多语言文案条目、状态与最近更新时间。',
  icon: 'ViewListIcon',
  hidden: true
}

pages['i18n-operation-history'] = {
  name: 'i18n-operation-history',
  path: '/legal/i18n/projects/:projectId/operation-history',
  title: '操作记录',
  description: '查看当前文案项目的新增、修改、删除、发布和回滚记录。',
  icon: 'ViewListIcon',
  hidden: true
}

pages['i18n-word-tags'] = {
  name: 'i18n-word-tags',
  path: '/legal/i18n/projects/:projectId/tags',
  title: '标签管理',
  description: '管理当前文案项目的标签、适用平台和关联文案数量。',
  icon: 'ViewListIcon',
  hidden: true
}

pages['system-ip-whitelist-create'] = {
  name: 'system-ip-whitelist-create',
  path: '/system/testing/ip-whitelist/new',
  title: '新建 IP 白名单',
  description: '填写名称、IP 或 IP 段后加入管理侧内测访问白名单。',
  icon: 'ViewListIcon'
}

pages['system-ip-whitelist-edit'] = {
  name: 'system-ip-whitelist-edit',
  path: '/system/testing/ip-whitelist/:id/edit',
  title: '编辑 IP 白名单',
  description: '维护管理侧内测访问白名单的名称、IP 段和说明。',
  icon: 'ViewListIcon'
}

pages['mobile-app-beta-user-create'] = {
  name: 'mobile-app-beta-user-create',
  path: '/legal/mobile-apps/beta-users/new',
  title: '新建内测用户',
  description: '填写用户、应用、平台和有效期后加入业务侧内测名单。',
  icon: 'ViewListIcon'
}

pages['mobile-app-beta-user-edit'] = {
  name: 'mobile-app-beta-user-edit',
  path: '/legal/mobile-apps/beta-users/:id/edit',
  title: '编辑内测用户',
  description: '维护业务侧内测用户的访问状态、应用平台和有效期。',
  icon: 'ViewListIcon'
}

pages['mobile-app-beta-invite-create'] = {
  name: 'mobile-app-beta-invite-create',
  path: '/legal/mobile-apps/beta-invites/new',
  title: '新建内测邀请',
  description: '配置邀请链接、应用平台、指定版本和内测用户数量。',
  icon: 'FileIcon'
}

pages['mobile-app-beta-invite-edit'] = {
  name: 'mobile-app-beta-invite-edit',
  path: '/legal/mobile-apps/beta-invites/:id/edit',
  title: '编辑内测邀请',
  description: '维护内测邀请的访问方式、版本范围、名额和有效期。',
  icon: 'FileIcon'
}

pages['mobile-app-beta-invite-detail'] = {
  name: 'mobile-app-beta-invite-detail',
  path: '/legal/mobile-apps/beta-invites/:id/detail',
  title: '内测邀请详情',
  description: '查看内测邀请的基础信息、测试范围、名额和来源。',
  icon: 'FileIcon'
}

pages['mobile-app-beta-invite-template-create'] = {
  name: 'mobile-app-beta-invite-template-create',
  path: '/legal/mobile-apps/beta-invite-templates/new',
  title: '新建内测邀请模版',
  description: '基于启动图编辑能力配置邀请页画布、图层和样式。',
  icon: 'ViewModuleIcon'
}

pages['mobile-app-beta-invite-template-edit'] = {
  name: 'mobile-app-beta-invite-template-edit',
  path: '/legal/mobile-apps/beta-invite-templates/:id/edit',
  title: '编辑内测邀请模版',
  description: '维护邀请页模版的基础信息、图层位置、颜色和按钮样式。',
  icon: 'ViewModuleIcon'
}

pages['i18n-task-create'] = {
  name: 'i18n-task-create',
  path: '/legal/i18n/projects/:projectId/tasks/new',
  title: '新建任务',
  description: '配置翻译源、语种与文案筛选条件后创建国际化任务。',
  icon: 'Setting1Icon'
}

pages['app-icon-create'] = {
  name: 'app-icon-create',
  path: '/legal/app-icons/new',
  title: '新建应用图标',
  description: '上传 1024px 源图后生成 iOS、Android、Web App 和 Cordova 等平台图标资源。',
  icon: 'ImageAddIcon'
}

pages['app-icon-generate'] = {
  name: 'app-icon-generate',
  path: '/legal/app-icons/:id/generate',
  title: '生成参数',
  description: '配置圆角、内边距、背景、输出平台和文件命名后生成应用图标资源。',
  icon: 'Setting1Icon'
}

pages['app-launch-create'] = {
  name: 'app-launch-create',
  path: '/legal/app-launches/new',
  title: '新建应用启动页',
  description: '填写启动图名称、资源缩写和版本支持后进入启动页编辑器。',
  icon: 'ImageAddIcon'
}

pages['app-launch-edit'] = {
  name: 'app-launch-edit',
  path: '/legal/app-launches/:id/edit',
  title: '应用启动页编辑',
  description: '调整启动页背景、图层位置、缩放和设备尺寸后生成资源。',
  icon: 'ImageEditIcon'
}

pages['icon-edit'] = {
  name: 'icon-edit',
  path: '/legal/icon-projects/:projectId/icons/:id',
  title: '图标编辑',
  description: '导入 Figma 文件，调整图标样式并导出 Compose ImageVector 或 Android Vector XML。',
  icon: 'ImageEditIcon'
}

pages['icon-create'] = {
  name: 'icon-create',
  path: '/legal/icon-projects/:projectId/icons/new',
  title: '图标编辑',
  description: '导入 Figma 文件，调整图标样式并导出 Compose ImageVector 或 Android Vector XML。',
  icon: 'ImageEditIcon'
}

pages['mobile-app-detail'] = {
  name: 'mobile-app-detail',
  path: '/legal/mobile-apps/:id',
  title: '应用详情',
  description: '查看移动应用的基本信息、部署环境、核心功能和版本记录。',
  icon: 'MobileListIcon'
}

pages['mobile-app-platforms'] = {
  name: 'mobile-app-platforms',
  path: '/legal/mobile-apps/groups/:id',
  title: '多端应用',
  description: '按平台查看同一个业务应用下的 iOS、Android、Web App 等端应用。',
  icon: 'MobileListIcon'
}

pages['mobile-app-edit'] = {
  name: 'mobile-app-edit',
  path: '/legal/mobile-apps/:id/edit',
  title: '应用编辑',
  description: '编辑应用基础信息、安装页内容、分发设置和展示资料。',
  icon: 'Setting1Icon'
}

pages['mobile-app-versions'] = {
  name: 'mobile-app-versions',
  path: '/legal/mobile-apps/:id/versions',
  title: '版本管理',
  description: '查看版本列表并发布新版本，管理安装包、下载记录和发布说明。',
  icon: 'ViewListIcon'
}

pages['mobile-app-install-manage'] = {
  name: 'mobile-app-install-manage',
  path: '/legal/mobile-apps/:id/install',
  title: '安装管理',
  description: '管理安装链接、安装页介绍、应用截图、下载状态和更多安装设置。',
  icon: 'Setting1Icon'
}

pages['mobile-app-experiment-edit'] = {
  name: 'mobile-app-experiment-edit',
  path: '/legal/mobile-apps/experiments/:id/edit',
  title: '编辑开关',
  description: '编辑特性开关的基础信息、环境状态、负责人和前置条件。',
  icon: 'Setting1Icon'
}

pages['mobile-app-experiment-create'] = {
  name: 'mobile-app-experiment-create',
  path: '/legal/mobile-apps/experiments/new',
  title: '新建开关',
  description: '创建特性开关并配置默认规则、Variation 和负责人。',
  icon: 'Setting1Icon'
}

pages['mobile-app-flag-configs'] = {
  name: 'mobile-app-flag-configs',
  path: '/legal/mobile-apps/flag-configs/:id',
  title: '开关配置',
  description: '查看开关默认值、Variation、规则命中和灰度比例。',
  icon: 'Setting1Icon'
}

pages['mobile-app-flag-config-edit'] = {
  name: 'mobile-app-flag-config-edit',
  path: '/legal/mobile-apps/flag-configs/:id/edit',
  title: '编辑开关配置',
  description: '编辑开关 Variation、规则命中、默认返回和关闭返回值。',
  icon: 'Setting1Icon'
}

pages['mobile-app-flag-prerequisite-edit'] = {
  name: 'mobile-app-flag-prerequisite-edit',
  path: '/legal/mobile-apps/flag-configs/:id/prerequisite',
  title: '前置条件',
  description: '配置开关生效前必须满足的应用、环境和版本条件。',
  icon: 'Setting1Icon'
}

pages['mobile-app-segment-edit'] = {
  name: 'mobile-app-segment-edit',
  path: '/legal/mobile-apps/segments/:id/edit',
  title: '编辑用户组',
  description: '编辑用户人群组的标识、描述和命中规则。',
  icon: 'ViewListIcon'
}

pages['mobile-app-segment-create'] = {
  name: 'mobile-app-segment-create',
  path: '/legal/mobile-apps/segments/new',
  title: '新建用户组',
  description: '创建可复用用户人群组，并配置人群属性条件。',
  icon: 'ViewListIcon'
}

pages['mobile-app-segment-attribute-create'] = {
  name: 'mobile-app-segment-attribute-create',
  path: '/legal/mobile-apps/segment-attributes/new',
  title: '新建人群属性',
  description: '创建可在人群组条件中复用的用户属性。',
  icon: 'ViewListIcon'
}

pages['mobile-app-segment-attribute-detail'] = {
  name: 'mobile-app-segment-attribute-detail',
  path: '/legal/mobile-apps/segment-attributes/:id',
  title: '人群属性详情',
  description: '查看和维护人群属性的可选值。',
  icon: 'ViewListIcon'
}

pages['mobile-app-flag-approval-edit'] = {
  name: 'mobile-app-flag-approval-edit',
  path: '/legal/mobile-apps/flag-approvals/:id/edit',
  title: '编辑开关审批',
  description: '编辑开关发布、灰度扩大和规则变更审批记录。',
  icon: 'FileIcon'
}
