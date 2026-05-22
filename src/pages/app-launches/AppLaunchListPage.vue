<template>
  <div class="app-launch-list-page">
    <t-card class="app-launch-list-card" :bordered="false">
      <template #title>
        <div class="app-launch-card-title">
          <span>应用启动页</span>
          <t-tag theme="primary" variant="light">共 {{ rows.length }} 项</t-tag>
        </div>
      </template>
      <template #actions>
        <t-space>
          <t-input
            v-model="keyword"
            class="app-launch-search"
            clearable
            placeholder="搜索启动图名称、资源缩写或版本支持"
          >
            <template #prefix-icon>
              <search-icon />
            </template>
          </t-input>
          <t-button theme="primary" @click="openCreateDialog">
            <template #icon><add-icon /></template>
            新建
          </t-button>
        </t-space>
      </template>

      <t-table
        row-key="id"
        hover
        :columns="columns"
        :data="filteredRows"
        :selected-row-keys="selectedRowKeys"
        :pagination="pagination"
        @select-change="handleSelectChange"
      >
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
      </t-table>
    </t-card>

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
import { AddIcon, LayersIcon, SearchIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Table as TTable,
  Tag as TTag
} from 'tdesign-vue-next'
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

const pagination = {
  defaultCurrent: 1,
  defaultPageSize: 10,
  showJumper: false
}

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
  if (!q) return rows.value

  return rows.value.filter((item) => {
    const versionText = getVersionLabels(item.versionSupport).join(' ')
    return `${item.name} ${item.resourceKey} ${versionText}`.toLowerCase().includes(q)
  })
})

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
