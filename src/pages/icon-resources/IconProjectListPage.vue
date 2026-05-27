<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="图标项目列表"
    primary-action="新建图标项目"
    search-placeholder="请输入内容搜索"
    :breadcrumb="['图标资源管理', '图标项目列表']"
    :columns="columns"
    :data="filteredRows"
    :selected-row-keys="selectedRowKeys"
    @primary="createProject"
    @select-change="handleSelectChange"
  >
    <template #actions>
      <span class="starter-list-summary">已选 {{ selectedRowKeys.length }} 项</span>
    </template>

    <template #filters>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="项目状态">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
      </t-select>
      <t-select v-model="environmentFilter" class="starter-list-filter-select" placeholder="隔离环境">
        <t-option value="all" label="全部环境" />
        <t-option v-for="env in environmentOptions" :key="env" :value="env" :label="env" />
      </t-select>
    </template>

    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
    </template>

    <template #operation="{ row }">
      <t-space size="small">
        <t-button theme="primary" variant="text" @click="openProject(row)">详情</t-button>
        <t-button theme="danger" variant="text">删除</t-button>
      </t-space>
    </template>
  </starter-list-page>

  <div v-if="projectDialogVisible" class="icon-dialog-mask" @click.self="closeProjectDialog">
    <div class="icon-dialog">
      <h3>新建图标项目</h3>
      <label class="icon-field">
        <span>项目名称</span>
        <input v-model="projectForm.name" type="text" placeholder="例如：商城生产图标库" @keydown.enter="saveProject" />
      </label>
      <label class="icon-field">
        <span>隔离环境</span>
        <select v-model="projectForm.environment">
          <option value="开发">开发</option>
          <option value="测试">测试</option>
          <option value="预发">预发</option>
          <option value="生产">生产</option>
        </select>
      </label>
      <label class="icon-field">
        <span>版本号</span>
        <input v-model="projectForm.version" type="text" placeholder="V1.0.0" @keydown.enter="saveProject" />
      </label>
      <div class="icon-dialog-actions">
        <button class="icon-secondary-button" type="button" @click="closeProjectDialog">取消</button>
        <button class="document-primary-button" type="button" @click="saveProject">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Button as TButton,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import {
  createIconProject,
  readIconProjects,
  setActiveIconProjectId
} from '../../config/iconProjects'

const router = useRouter()
const keyword = ref('')
const statusFilter = ref('all')
const environmentFilter = ref('all')
const selectedRowKeys = ref(readIconProjects().filter((item) => item.checked).map((item) => item.id))
const rows = ref(readIconProjects())
const projectDialogVisible = ref(false)
const projectForm = reactive({
  name: '',
  environment: '开发',
  version: 'V1.0.0'
})

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 48 },
  { colKey: 'name', title: '项目名称', minWidth: 240 },
  { colKey: 'status', title: '项目状态', width: 120 },
  { colKey: 'version', title: '版本号', width: 120 },
  { colKey: 'environment', title: '隔离环境', width: 120 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const statusOptions = computed(() => [...new Set(rows.value.map((item) => item.status).filter(Boolean))])
const environmentOptions = computed(() => [...new Set(rows.value.map((item) => item.environment).filter(Boolean))])

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.value.filter((item) => {
    const matchKeyword = !q || `${item.name} ${item.status} ${item.version} ${item.environment}`.toLowerCase().includes(q)
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    const matchEnvironment = environmentFilter.value === 'all' || item.environment === environmentFilter.value
    return matchKeyword && matchStatus && matchEnvironment
  })
})

const getStatusTheme = (tone) => {
  const themeMap = {
    success: 'success',
    active: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}

const handleSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

const openProject = (project) => {
  setActiveIconProjectId(project.id)
  router.push({ name: 'icon-list', params: { projectId: project.id } })
}

const createProject = () => {
  projectDialogVisible.value = true
}

const closeProjectDialog = () => {
  projectDialogVisible.value = false
  projectForm.name = ''
  projectForm.environment = '开发'
  projectForm.version = 'V1.0.0'
}

const saveProject = () => {
  if (!projectForm.name.trim()) {
    MessagePlugin.warning('请输入项目名称')
    return
  }

  const project = createIconProject(projectForm)
  rows.value = readIconProjects()
  setActiveIconProjectId(project.id)
  closeProjectDialog()
  MessagePlugin.success('图标项目已创建')
  router.push({ name: 'icon-list', params: { projectId: project.id } })
}
</script>
