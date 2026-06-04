<template>
  <div class="system-manage-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>{{ pageTitle }}</h3>
        <p>{{ pageDescription }}</p>
      </div>
      <t-button theme="primary" @click="goCreate">
        <template #icon>
          <add-icon />
        </template>
        新增
      </t-button>
    </section>

    <t-card class="system-manage-list-card" :bordered="false">
      <template #title>
        <div class="system-manage-card-title">
          <span>数据列表</span>
          <t-tag theme="primary" variant="light">共 {{ filteredRows.length }} 项</t-tag>
        </div>
      </template>
      <template #actions>
        <t-space class="system-manage-filter" :break-line="true">
          <t-input
            v-model="keyword"
            class="system-manage-search"
            placeholder="搜索名称、编码、负责人"
            clearable
            @enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix-icon>
              <search-icon />
            </template>
          </t-input>
          <t-select v-model="statusFilter" class="system-manage-status-filter" @change="handleSearch">
            <t-option value="all" label="全部状态" />
            <t-option value="enabled" label="启用" />
            <t-option value="disabled" label="停用" />
          </t-select>
          <t-button theme="primary" @click="handleSearch">查询</t-button>
          <t-button variant="outline" @click="handleReset">重置</t-button>
        </t-space>
      </template>

      <t-alert
        v-if="!resourceApi"
        class="system-manage-api-tip"
        theme="info"
        message="当前后端 OpenAPI 未提供该模块接口，页面暂用本地示例数据。"
      />

      <t-table
        row-key="id"
        hover
        :columns="tableColumns"
        :data="pagedRows"
        :loading="loading"
      >
        <template #name="{ row }">
          <div class="system-manage-name-cell">
            <strong>{{ row.name }}</strong>
            <small>{{ row.code }}</small>
          </div>
        </template>

        <template #status="{ row }">
          <t-tag :theme="getStatusTheme(row.statusValue)" variant="light">
            {{ row.status }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <t-space size="small">
            <t-button
              v-if="route.name === 'system-projects'"
              theme="primary"
              variant="text"
              @click="handleEnterProject(row)"
            >
              进入
            </t-button>
            <t-button theme="primary" variant="text" @click="handleEdit(row)">编辑</t-button>
            <t-button theme="danger" variant="text" @click="confirmDelete(row)">删除</t-button>
          </t-space>
        </template>
      </t-table>

      <div class="system-manage-pagination">
        <t-pagination
          v-model:current="currentPage"
          :total="filteredRows.length"
          :page-size="pageSize"
          :show-jumper="false"
          :show-page-size="false"
        />
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AddIcon,
  SearchIcon
} from 'tdesign-icons-vue-next'
import {
  Alert as TAlert,
  Button as TButton,
  Card as TCard,
  DialogPlugin,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Pagination as TPagination,
  Select as TSelect,
  Space as TSpace,
  Table as TTable,
  Tag as TTag
} from 'tdesign-vue-next'
import { pages } from '../../config/pages'
import { getManagementResource } from '../../api/management'
import { PROJECT_STORAGE_KEY, defaultProjectRouteName } from '../../config/projects'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const remoteRows = ref([])
const loading = ref(false)
const pageSize = 10

const flattenTree = (items) => {
  const result = []
  const walk = (list, depth = 0) => {
    list.forEach((item) => {
      result.push({ ...item, depth })
      if (Array.isArray(item.children) && item.children.length) {
        walk(item.children, depth + 1)
      }
    })
  }
  walk(Array.isArray(items) ? items : [])
  return result
}

const pickFirstValue = (...values) => {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '')
}

const getRowIdentifier = (item) => {
  return pickFirstValue(
    item?.id,
    item?.projectId,
    item?.project_id,
    item?.value,
    item?.key,
    item?.projectCode,
    item?.code,
    item?.raw?.id,
    item?.raw?.projectId,
    item?.raw?.project_id,
    item?.raw?.value,
    item?.raw?.key,
    item?.raw?.projectCode,
    item?.raw?.code,
    item?.raw?.project?.id,
    item?.raw?.project?.projectId,
    item?.raw?.project?.value,
    item?.raw?.project?.projectCode,
    item?.raw?.project?.code
  )
}

const normalizeStatus = (status) => {
  if (status === 'active' || status === 'enabled' || status === '启用' || status === '1' || status === 1) {
    return { label: '启用', value: 'enabled' }
  }
  if (status === 'inactive' || status === 'disabled' || status === '停用' || status === '0' || status === 0) {
    return { label: '停用', value: 'disabled' }
  }
  return { label: status || '-', value: status || 'unknown' }
}

const formatDateTime = (value) => {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

const normalizeRow = (item) => {
  const roleNames = Array.isArray(item.roleNames) ? item.roleNames.join('、') : ''
  const id = getRowIdentifier(item)
  const status = normalizeStatus(item.status)
  const code = route.name === 'system-projects'
    ? (item.code || item.projectCode || item.value || item.key || '')
    : (item.username || item.code || item.projectCode || item.value || item.key || item.path || (id ? String(id) : '-'))
  return {
    id,
    name: item.displayName || item.name || item.projectName || item.title || item.username || '-',
    code,
    owner: item.owner || item.departmentName || item.positionName || item.ownerName || item.leader || item.description || item.path || roleNames || item.permissionIds?.length || item.menuIds?.length || '-',
    status: status.label,
    statusValue: status.value,
    updatedAt: formatDateTime(item.updatedAt || item.createdAt),
    raw: item
  }
}

const moduleConfigs = {
  'system-users': {
    columns: [
      { key: 'name', title: '用户名称' },
      { key: 'owner', title: '所属部门' }
    ],
    seed: ['系统管理员', '法务管理员', '运营成员', '只读访客', '配置管理员', '审计专员', '产品负责人', '开发成员', '测试成员', '数据管理员']
  },
  'system-roles': {
    columns: [
      { key: 'name', title: '角色名称' },
      { key: 'owner', title: '权限范围' }
    ],
    seed: ['超级管理员', '系统管理员', '法务管理员', '项目管理员', '内容审核员', '应用管理员', '访客角色', '数据维护员', '审批管理员', '配置管理员']
  },
  'system-permissions': {
    columns: [
      { key: 'name', title: '权限名称' },
      { key: 'owner', title: '权限说明' }
    ],
    seed: ['用户查看', '用户编辑', '角色查看', '角色授权', '菜单查看', '部门维护', '岗位维护', '项目配置', '系统审计', '客户端接入']
  },
  'system-menus': {
    columns: [
      { key: 'name', title: '菜单名称' },
      { key: 'owner', title: '菜单类型' }
    ],
    seed: ['工作台', '系统管理', '用户管理', '角色管理', '菜单管理', '部门管理', '岗位管理', '字典管理', '参数设置', '客户端管理']
  },
  'system-departments': {
    columns: [
      { key: 'name', title: '部门名称' },
      { key: 'owner', title: '负责人' }
    ],
    seed: ['总部法务部', '合规平台组', '移动业务部', '国际化中心', '运营支持部', '客户成功部', '研发管理部', '数据治理部', '质量保障部', '基础平台部']
  },
  'system-posts': {
    columns: [
      { key: 'name', title: '岗位名称' },
      { key: 'owner', title: '岗位序列' }
    ],
    seed: ['法务负责人', '合规专员', '产品经理', '前端工程师', '后端工程师', '测试工程师', '运营专员', '客户经理', '数据分析师', '系统管理员']
  },
  'system-dicts': {
    columns: [
      { key: 'name', title: '字典名称' },
      { key: 'owner', title: '业务域' }
    ],
    seed: ['用户状态', '角色类型', '菜单类型', '项目状态', '文档状态', '审批状态', '应用平台', '客户端类型', '数据权限', '语言类型']
  },
  'system-params': {
    columns: [
      { key: 'name', title: '参数名称' },
      { key: 'owner', title: '参数值' }
    ],
    seed: ['登录验证码', '密码有效期', '默认语言', '会话超时', '文件大小限制', '导出水印', '审计日志', '系统标题', '默认项目', '消息通知']
  },
  'system-clients': {
    columns: [
      { key: 'name', title: '客户端名称' },
      { key: 'owner', title: '授权类型' }
    ],
    seed: ['Web 管理端', '移动工作台', '开放 API', '文档生成器', '图标资源站', '启动页工具', '国际化平台', '审批中心', '数据看板', '测试客户端']
  },
  'system-projects': {
    columns: [
      { key: 'name', title: '项目名称' },
      { key: 'owner', title: '负责人' }
    ],
    seed: ['隐私合规平台', '移动应用中心', '国际化管理', '法务文档系统', '图标资源管理', '数据治理平台', '审批工作流', '客户端网关', '配置中心', '审计日志系统']
  }
}

const pageMeta = computed(() => pages[route.name] || {})
const moduleConfig = computed(() => moduleConfigs[route.name] || moduleConfigs['system-users'])
const pageTitle = computed(() => pageMeta.value.title || '系统管理')
const pageDescription = computed(() => pageMeta.value.description || '维护系统基础配置和管理对象。')
const resourceApi = computed(() => getManagementResource(route.name))
const tableColumns = computed(() => [
  { colKey: 'name', title: moduleConfig.value.columns[0]?.title || '名称', minWidth: 260 },
  { colKey: 'owner', title: moduleConfig.value.columns[1]?.title || '说明', minWidth: 220 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'updatedAt', title: '更新时间', width: 170 },
  { colKey: 'operation', title: '操作', width: route.name === 'system-projects' ? 180 : 130, fixed: 'right' }
])
const fallbackRows = computed(() => moduleConfig.value.seed.map((name, index) => normalizeRow({
  id: `${route.name}-${index + 1}`,
  name,
  code: `${route.name}-${String(index + 1).padStart(2, '0')}`,
  owner: ['平台组', '法务部', '运营中心', '研发部'][index % 4],
  status: index % 5 === 3 ? 'disabled' : 'enabled',
  updatedAt: `2026-05-${String(25 - (index % 9)).padStart(2, '0')} ${String(9 + (index % 8)).padStart(2, '0')}:30`
})))
const rows = computed(() => resourceApi.value ? remoteRows.value : fallbackRows.value)
const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchKeyword = !kw || `${row.name} ${row.code} ${row.owner}`.toLowerCase().includes(kw)
    const matchStatus = statusFilter.value === 'all' || row.statusValue === statusFilter.value
    return matchKeyword && matchStatus
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)))
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

watch([() => route.name, keyword, statusFilter], () => {
  currentPage.value = 1
})

watch(totalPages, (pagesCount) => {
  if (currentPage.value > pagesCount) currentPage.value = pagesCount
})

watch(() => route.name, () => {
  fetchRows()
})

onMounted(() => {
  fetchRows()
})

const goCreate = () => {
  router.push({ name: `${route.name}-create` })
}

const fetchRows = async () => {
  const api = resourceApi.value
  if (!api?.list) {
    remoteRows.value = []
    return
  }

  loading.value = true
  try {
    const params = route.name === 'system-users'
      ? {
          keyword: keyword.value || undefined,
          status: statusFilter.value === 'all' ? undefined : statusFilter.value
        }
      : undefined
    const data = await api.list(params)
    const list = ['system-menus', 'system-departments'].includes(route.name) ? flattenTree(data) : data
    remoteRows.value = (Array.isArray(list) ? list : []).map(normalizeRow)
  } catch (e) {
    MessagePlugin.error(e.message || '加载列表失败')
    remoteRows.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  if (resourceApi.value) {
    fetchRows()
  }
}

const handleReset = () => {
  keyword.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1
  if (resourceApi.value) {
    fetchRows()
  }
}

const getStatusTheme = (status) => {
  if (status === 'enabled') return 'success'
  if (status === 'disabled') return 'default'
  return 'warning'
}

const handleEnterProject = (item) => {
  const code = pickFirstValue(item?.code, item?.raw?.code, item?.raw?.projectCode, item?.raw?.value, item?.raw?.key)
  if (!code) {
    MessagePlugin.warning('当前项目缺少项目编码')
    return
  }
  localStorage.setItem(PROJECT_STORAGE_KEY, code)
  router.push({ name: defaultProjectRouteName })
}

const handleEdit = (item) => {
  if (route.name === 'system-projects') {
    handleEditProject(item)
    return
  }
  if (route.name === 'system-roles') {
    handleEditRole(item)
    return
  }
  if (route.name === 'system-users') {
    handleEditUser(item)
    return
  }
  MessagePlugin.info('当前模块暂未配置编辑页')
}

const handleEditProject = (item) => {
  const code = pickFirstValue(item?.code, item?.raw?.code, item?.raw?.projectCode, item?.raw?.value, item?.raw?.key)
  if (!code) {
    MessagePlugin.warning('当前项目缺少项目编码')
    return
  }

  router.push({ name: 'system-projects-edit', params: { code: String(code) } })
}

const handleEditRole = (item) => {
  const id = pickFirstValue(item?.id, item?.raw?.id)
  if (!id) {
    MessagePlugin.warning('当前角色缺少标识')
    return
  }

  router.push({ name: 'system-roles-edit', params: { id: String(id) } })
}

const handleEditUser = (item) => {
  const username = pickFirstValue(item?.raw?.username, item?.raw?.code, item?.code)
  if (!username) {
    MessagePlugin.warning('当前用户缺少登录账号')
    return
  }

  router.push({ name: 'system-users-edit', params: { username: String(username) } })
}

const confirmDelete = (item) => {
  DialogPlugin.confirm({
    header: '确认删除',
    body: `删除后不可恢复，确认删除「${item.name}」吗？`,
    theme: 'warning',
    confirmBtn: {
      content: '删除',
      theme: 'danger'
    },
    cancelBtn: '取消',
    onConfirm: async ({ hide }) => {
      await handleDelete(item)
      hide()
    }
  })
}

const handleDelete = async (item) => {
  const api = resourceApi.value
  if (!api?.remove || !item.id) {
    MessagePlugin.warning('当前模块暂不支持删除接口')
    return
  }

  try {
    await api.remove(item.id)
    MessagePlugin.success('删除成功')
    await fetchRows()
  } catch (e) {
    MessagePlugin.error(e.message || '删除失败')
  }
}
</script>
