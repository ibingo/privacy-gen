<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="用户协议列表"
    :total-text="`共 ${total} 项`"
    :summary-text="`已选 ${selectedRowKeys.length} 项`"
    primary-action="新建用户协议"
    :columns="columns"
    :data="rows"
    :loading="loading"
    :pagination="{ current: page, pageSize, total }"
    :page-size="pageSize"
    :page-size-options="[10, 20, 50]"
    :selected-row-keys="selectedRowKeys"
    @primary="goToCreate"
    @search="handleSearch"
    @page-change="handlePageChange"
    @select-change="selectedRowKeys = $event"
  >
    <template #filters>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="协议状态" @change="handleSearch">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
      </t-select>
    </template>
    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.status)" variant="light">{{ row.status }}</t-tag>
    </template>
    <template #operation="{ row }">
      <t-dropdown :options="getOperationOptions(row)" trigger="click" @click="handleOperation($event, row)">
        <t-button theme="primary" variant="text">
          操作
          <template #suffix>
            <chevron-down-icon />
          </template>
        </t-button>
      </t-dropdown>
    </template>
  </starter-list-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button as TButton, DialogPlugin, Dropdown as TDropdown, MessagePlugin, Option as TOption, Select as TSelect, Tag as TTag } from 'tdesign-vue-next'
import { ChevronDownIcon } from 'tdesign-icons-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import { archiveUserAgreement, deleteUserAgreement } from '../../config/userAgreements'
import { listUserAgreementsApi } from '../../api/legalDocuments'

const router = useRouter()
const keyword = ref('')
const statusFilter = ref('all')

const rows = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selectedRowKeys = ref([])
const statusOptions = computed(() => {
  const options = [...new Set(rows.value.map((item) => item.status).filter(Boolean))]
  return options.length ? options : ['待存档', '已存档']
})
const columns = [
  { colKey: 'row-select', type: 'multiple', width: 48 },
  { colKey: 'appName', title: '应用名称', minWidth: 180 },
  { colKey: 'status', title: '文档状态', width: 120 },
  { colKey: 'version', title: '版本范围', width: 120 },
  { colKey: 'platform', title: '适用终端', width: 150 },
  { colKey: 'companyName', title: '公司名称', width: 180 },
  { colKey: 'effectiveDate', title: '生效日期', width: 130 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const normalizeUserAgreement = (item = {}) => ({
  ...item,
  id: item.agreementId || item.id,
  version: item.versionId || item.version || '不限制',
  platform: item.applicableTerminal || item.platform || '-',
  updatedAt: formatDateTime(item.updatedAt),
  createdAt: formatDateTime(item.createdAt)
})

async function fetchRows () {
  loading.value = true
  try {
    const data = await listUserAgreementsApi({
      keyword: keyword.value.trim(),
      appId: '',
      versionId: '不限制',
      status: statusFilter.value === 'all' ? '' : statusFilter.value,
      page: page.value,
      pageSize: pageSize.value
    })
    rows.value = Array.isArray(data?.items) ? data.items.map(normalizeUserAgreement) : []
    total.value = Number(data?.total || 0)
    page.value = Number(data?.page || page.value)
    pageSize.value = Number(data?.pageSize || pageSize.value)
  } catch (error) {
    MessagePlugin.error(error.message || '用户协议列表加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch () {
  page.value = 1
  fetchRows()
}

function handlePageChange ({ page: nextPage, pageSize: nextPageSize }) {
  page.value = nextPage
  pageSize.value = nextPageSize
  fetchRows()
}

const goToCreate = () => {
  router.push({ name: 'agreement' })
}

const refreshRows = () => {
  fetchRows()
}

const goToDetail = (row) => {
  router.push({ name: 'agreement-detail', params: { id: row.id } })
}

const handleArchive = (row) => {
  archiveUserAgreement(row.id)
  refreshRows()
  MessagePlugin.success('用户协议已存档')
}

const handleDelete = (row) => {
  const confirmDialog = DialogPlugin.confirm({
    header: '删除用户协议',
    body: `确认删除 ${row.appName} 的用户协议？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'danger',
    onConfirm: () => {
      deleteUserAgreement(row.id)
      selectedRowKeys.value = selectedRowKeys.value.filter((id) => id !== row.id)
      refreshRows()
      MessagePlugin.success('用户协议已删除')
      confirmDialog.hide()
    }
  })
}

const getOperationOptions = (row) => [
  { content: '详情', value: 'detail' },
  { content: '发布', value: 'archive', disabled: row.status === '已存档' },
  { content: '删除', value: 'delete' }
]

const handleOperation = (data, row) => {
  const value = data?.value
  if (value === 'detail') goToDetail(row)
  if (value === 'archive') handleArchive(row)
  if (value === 'delete') handleDelete(row)
}

const getStatusTheme = (status) => {
  const themeMap = {
    已存档: 'success',
    待存档: 'warning'
  }
  return themeMap[status] || 'default'
}

function formatDateTime (value) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
}

onMounted(() => {
  fetchRows()
})
</script>
