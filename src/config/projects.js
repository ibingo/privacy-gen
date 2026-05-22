export const PROJECT_STORAGE_KEY = 'privacy-gen:selected-project'

export const projectGroups = [
  {
    title: '法务与合规',
    children: [
      {
        value: 'legal-docs',
        name: '法务文档中心',
        shortName: '法',
        status: '已启用',
        statusTone: 'active',
        description: '隐私政策、用户协议与法务文档生成配置统一管理。'
      },
      {
        value: 'app-compliance',
        name: 'App 合规项目',
        shortName: '合',
        status: '已启用',
        statusTone: 'active',
        description: '应用上架材料、权限说明与合规清单维护。'
      },
      {
        value: 'sdk-audit',
        name: 'SDK 审计项目',
        shortName: '审',
        status: '已停用',
        statusTone: 'inactive',
        description: '第三方 SDK 资料、用途说明与共享信息审计。'
      }
    ]
  },
  {
    title: '运营与业务',
    children: [
      {
        value: 'merchant-center',
        name: '商户配置中心',
        shortName: '商',
        status: '已启用',
        statusTone: 'active',
        description: '主体资料、签约信息与业务服务配置集中维护。'
      },
      {
        value: 'content-review',
        name: '内容审核项目',
        shortName: '审',
        status: '已启用',
        statusTone: 'active',
        description: '条款文案、运营内容与发布前审核流程管理。'
      },
      {
        value: 'release-assets',
        name: '发布材料库',
        shortName: '发',
        status: '已停用',
        statusTone: 'inactive',
        description: '应用市场截图、描述文案与版本发布材料归档。'
      }
    ]
  },
  {
    title: '数据与模板',
    children: [
      {
        value: 'template-center',
        name: '模板中心',
        shortName: '模',
        status: '已启用',
        statusTone: 'active',
        description: '协议模板、变量占位符与法务条款版本维护。'
      },
      {
        value: 'export-tasks',
        name: '导出任务',
        shortName: '导',
        status: '已启用',
        statusTone: 'active',
        description: '文档导出、下载历史与批量任务执行状态查看。'
      },
      {
        value: 'risk-library',
        name: '风险规则库',
        shortName: '险',
        status: '已停用',
        statusTone: 'inactive',
        description: '合规规则、检查项与风险提示策略配置。'
      }
    ]
  }
]

export const existingProjects = projectGroups.flatMap((group) => group.children)

export const defaultProjectValue = existingProjects[0]?.value || ''

export const defaultProjectRouteName = 'privacy-list'
