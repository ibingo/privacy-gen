<template>
  <div>
    <starter-list-page
      v-model:keyword="keyword"
      title="应用启动页列表"
      primary-action="新建"
      search-placeholder="搜索启动图名称、资源缩写或版本支持"
      :breadcrumb="['应用启动页管理', '应用启动页列表']"
      :columns="columns"
      :data="filteredRows"
      :selected-row-keys="selectedRowKeys"
      @primary="openCreateDialog"
      @select-change="handleSelectChange"
    >
      <template #actions>
        <span class="starter-list-summary">已选 {{ selectedRowKeys.length }} 项</span>
      </template>

      <template #filters>
        <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="状态">
          <t-option value="all" label="全部状态" />
          <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
        </t-select>
        <t-select v-model="deviceFilter" class="starter-list-filter-select" placeholder="设备类型">
          <t-option value="all" label="全部设备" />
          <t-option v-for="device in launchDeviceOptions" :key="device.value" :value="device.value" :label="device.label" />
        </t-select>
        <t-select v-model="versionFilter" class="starter-list-filter-select" placeholder="版本支持">
          <t-option value="all" label="全部版本" />
          <t-option v-for="version in launchVersionOptions" :key="version.value" :value="version.value" :label="version.label" />
        </t-select>
      </template>

        <template #name="{ row }">
          <div class="app-launch-table-name">
            <span class="app-launch-preview" :style="{ background: row.backgroundColor }">
              <layers-icon :style="{ color: row.logoColor }" />
            </span>
            <span class="app-launch-table-main">
              <strong>{{ row.name }}</strong>
              <small>{{ getDeviceLabel(row.device) }}</small>
            </span>
          </div>
        </template>

        <template #versionSupport="{ row }">
          <t-space size="small" :break-line="true">
            <t-tag
              v-for="version in getVersionLabels(row.versionSupport)"
              :key="version"
              variant="light"
            >
              {{ version }}
            </t-tag>
          </t-space>
        </template>

        <template #status="{ row }">
          <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">
            {{ row.status }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <t-space size="small">
            <t-button theme="primary" variant="text" @click="goToEditor(row)">编辑</t-button>
            <t-button theme="danger" variant="text" @click="removeLaunch(row)">删除</t-button>
          </t-space>
        </template>
    </starter-list-page>

    <t-dialog
      v-model:visible="createDialogVisible"
      header="新建应用启动页"
      width="520px"
      confirm-btn="创建"
      :close-on-overlay-click="false"
      @confirm="saveLaunch"
      @cancel="closeCreateDialog"
      @close="closeCreateDialog"
    >
      <t-form layout="vertical" class="app-launch-create-form">
        <t-form-item label="启动图名称" required-mark>
          <t-input
            v-model="form.name"
            clearable
            placeholder="例如：商城启动页"
            @enter="saveLaunch"
          />
        </t-form-item>
        <t-form-item label="资源缩写" required-mark>
          <t-input
            v-model="form.resourceKey"
            clearable
            placeholder="例如：mall_splash"
            @enter="saveLaunch"
          />
        </t-form-item>
        <t-form-item label="版本支持" required-mark>
          <t-select
            v-model="form.versionSupport"
            multiple
            filterable
            clearable
            :min-collapsed-num="3"
            placeholder="搜索并选择版本支持"
          >
            <t-option
              v-for="version in launchVersionOptions"
              :key="version.value"
              :value="version.value"
              :label="`${version.label} · ${version.detail}`"
            />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayersIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import {
  createAppLaunch,
  deleteAppLaunch,
  launchDeviceOptions,
  launchVersionOptions,
  readAppLaunches
} from '../../config/appLaunches'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const statusFilter = ref('all')
const deviceFilter = ref('all')
const versionFilter = ref('all')
const rows = ref(readAppLaunches())
const selectedRowKeys = ref(rows.value.filter((item) => item.checked).map((item) => item.id))
const createDialogVisible = ref(false)
const form = reactive({
  name: '',
  resourceKey: '',
  versionSupport: ['ios', 'android']
})

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 48 },
  { colKey: 'name', title: '启动图名称', minWidth: 260 },
  { colKey: 'resourceKey', title: '资源缩写', width: 160 },
  { colKey: 'versionSupport', title: '版本支持', minWidth: 220 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const versionLabelMap = launchVersionOptions.reduce((acc, version) => {
  acc[version.value] = version.label
  return acc
}, {})

const deviceLabelMap = launchDeviceOptions.reduce((acc, device) => {
  acc[device.value] = `${device.label} · ${device.size}`
  return acc
}, {})

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.value.filter((item) => {
    const versionText = getVersionLabels(item.versionSupport).join(' ')
    const matchKeyword = !q || `${item.name} ${item.resourceKey} ${versionText}`.toLowerCase().includes(q)
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    const matchDevice = deviceFilter.value === 'all' || item.device === deviceFilter.value
    const matchVersion = versionFilter.value === 'all' || (item.versionSupport || []).includes(versionFilter.value)
    return matchKeyword && matchStatus && matchDevice && matchVersion
  })
})

const statusOptions = computed(() => [...new Set(rows.value.map((item) => item.status).filter(Boolean))])

watch(
  () => route.name,
  (name) => {
    createDialogVisible.value = name === 'app-launch-create'
  },
  { immediate: true }
)

const resetForm = () => {
  form.name = ''
  form.resourceKey = ''
  form.versionSupport = ['ios', 'android']
}

const getVersionLabels = (versions) => {
  return (versions || []).map((version) => versionLabelMap[version] || version)
}

const getDeviceLabel = (device) => deviceLabelMap[device] || '未选择设备'

const getStatusTheme = (tone) => {
  const themeMap = {
    success: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}

const handleSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

const openCreateDialog = () => {
  router.push({ name: 'app-launch-create' })
}

const closeCreateDialog = () => {
  createDialogVisible.value = false
  resetForm()
  if (route.name === 'app-launch-create') {
    router.push({ name: 'app-launch-list' })
  }
}

const saveLaunch = () => {
  if (!form.name.trim()) {
    MessagePlugin.warning('请输入启动图名称')
    return
  }

  if (!form.resourceKey.trim()) {
    MessagePlugin.warning('请输入资源缩写')
    return
  }

  if (!form.versionSupport.length) {
    MessagePlugin.warning('请至少选择一个版本支持')
    return
  }

  const launch = createAppLaunch(form)
  rows.value = readAppLaunches()
  closeCreateDialog()
  MessagePlugin.success('应用启动页已创建')
  router.push({ name: 'app-launch-edit', params: { id: launch.id } })
}

const goToEditor = (item) => {
  router.push({ name: 'app-launch-edit', params: { id: item.id } })
}

const removeLaunch = (item) => {
  const deleted = deleteAppLaunch(item.id)
  rows.value = readAppLaunches()
  selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== item.id)
  MessagePlugin.success(deleted ? '应用启动页已删除' : '应用启动页不存在或已删除')
}
</script>
