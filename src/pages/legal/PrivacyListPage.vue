<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="隐私政策列表"
    :total-text="`共 ${filteredRows.length} 项`"
    :summary-text="`已选 ${selectedRowKeys.length} 项`"
    primary-action="新建隐私政策"
    :columns="columns"
    :data="filteredRows"
    :selected-row-keys="selectedRowKeys"
    @primary="goToCreate"
    @select-change="selectedRowKeys = $event"
  >
    <template #filters>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="文档状态">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
      </t-select>
      <t-select v-model="platformFilter" class="starter-list-filter-select" placeholder="适用终端">
        <t-option value="all" label="全部终端" />
        <t-option v-for="platform in platformOptions" :key="platform" :value="platform" :label="platform" />
      </t-select>
    </template>
    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
    </template>
    <template #operation>
      <t-space size="small">
        <t-button theme="primary" variant="text" @click="goToCreate">详情</t-button>
        <t-button theme="danger" variant="text">删除</t-button>
      </t-space>
    </template>
  </starter-list-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button as TButton, Option as TOption, Select as TSelect, Space as TSpace, Tag as TTag } from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'

const router = useRouter()
const keyword = ref('')
const statusFilter = ref('all')
const platformFilter = ref('all')

const rows = [
  { id: 'pp-001', name: '小米商城 App 隐私政策', status: '已完成', statusTone: 'success', version: 'V3.2.0', platform: 'iOS / Android', updatedAt: '2026-05-08 09:20', checked: true },
  { id: 'pp-002', name: '会员中心 小程序隐私政策', status: '待发布', statusTone: 'warning', version: 'V2.1.3', platform: '微信小程序', updatedAt: '2026-05-07 18:10', checked: true },
  { id: 'pp-003', name: '出海版 App 隐私政策', status: '审核中', statusTone: 'processing', version: 'V1.9.4', platform: 'Android', updatedAt: '2026-05-07 15:44', checked: false },
  { id: 'pp-004', name: '车机端隐私政策', status: '已完成', statusTone: 'success', version: 'V1.4.2', platform: '车机', updatedAt: '2026-05-06 20:31', checked: false },
  { id: 'pp-005', name: '海外账号中心隐私政策', status: '审核失败', statusTone: 'danger', version: 'V2.0.1', platform: 'Web', updatedAt: '2026-05-06 11:09', checked: false },
  { id: 'pp-006', name: 'IoT 设备配网隐私政策', status: '待发布', statusTone: 'warning', version: 'V1.0.8', platform: 'IoT', updatedAt: '2026-05-05 16:27', checked: false },
  { id: 'pp-007', name: '门店导购 App 隐私政策', status: '已完成', statusTone: 'success', version: 'V2.6.5', platform: 'Android', updatedAt: '2026-05-05 09:16', checked: false }
]
const selectedRowKeys = ref(rows.filter((item) => item.checked).map((item) => item.id))
const statusOptions = [...new Set(rows.map((item) => item.status))]
const platformOptions = [...new Set(rows.map((item) => item.platform))]
const columns = [
  { colKey: 'row-select', type: 'multiple', width: 48 },
  { colKey: 'name', title: '文档名称', minWidth: 240 },
  { colKey: 'status', title: '文档状态', width: 120 },
  { colKey: 'version', title: '版本号', width: 120 },
  { colKey: 'platform', title: '适用终端', width: 150 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.filter((item) => {
    const matchKeyword = !q || `${item.name} ${item.version} ${item.platform}`.toLowerCase().includes(q)
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    const matchPlatform = platformFilter.value === 'all' || item.platform === platformFilter.value
    return matchKeyword && matchStatus && matchPlatform
  })
})

const goToCreate = () => {
  router.push({ name: 'privacy' })
}

const getStatusTheme = (tone) => {
  const themeMap = {
    success: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}
</script>
