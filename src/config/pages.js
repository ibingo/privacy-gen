export const pageGroups = [
  {
    title: '法务',
    icon: 'RootListIcon',
    children: [
      {
        name: 'home',
        path: '/legal',
        title: '路由与菜单管理',
        description: '统一管理法务相关页面入口，按 TDesign Starter 的导航方式收拢到单一菜单分组。',
        icon: 'ViewListIcon'
      },
      {
        name: 'privacy',
        path: '/legal/privacy',
        title: 'App 隐私政策生成器',
        description: '填写应用和第三方 SDK 信息，实时生成可复制、可下载的隐私政策文本。',
        icon: 'SecuredIcon'
      },
      {
        name: 'agreement',
        path: '/legal/agreement',
        title: 'App 用户协议生成器',
        description: '填写应用和服务信息，实时生成参考通用法律声明结构的用户协议文本。',
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
  }
]

export const pages = pageGroups.reduce((acc, group) => {
  group.children.forEach((page) => {
    acc[page.name] = page
  })
  return acc
}, {})

export const homeSections = [
  {
    title: '法务',
    description: '所有法务相关页面统一纳入导航菜单，避免首页承担分流职责。',
    children: pageGroups[0].children.filter((page) => page.name !== 'home')
  }
]
