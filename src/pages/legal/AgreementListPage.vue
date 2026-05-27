<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="用户协议列表"
    :total-text="`共 ${filteredRows.length} 项`"
    :summary-text="`已选 ${selectedRowKeys.length} 项`"
    primary-action="新建用户协议"
    :columns="columns"
    :data="filteredRows"
    :selected-row-keys="selectedRowKeys"
    @primary="goToCreate"
    @select-change="selectedRowKeys = $event"
  >
    <template #filters>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="协议状态">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
      </t-select>
      <t-select v-model="businessTypeFilter" class="starter-list-filter-select" placeholder="业务类型">
        <t-option value="all" label="全部类型" />
        <t-option v-for="type in businessTypeOptions" :key="type" :value="type" :label="type" />
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
const businessTypeFilter = ref('all')

const rows = [
  { id: 'ua-001', name: '小米商城 App 用户协议', status: '已完成', statusTone: 'success', version: 'V5.0.2', businessType: '电商', updatedAt: '2026-05-08 10:32', checked: true },
  { id: 'ua-002', name: '会员中心服务协议', status: '待发布', statusTone: 'warning', version: 'V2.3.1', businessType: '会员', updatedAt: '2026-05-07 19:03', checked: true },
  { id: 'ua-003', name: '智能家居服务协议', status: '审核中', statusTone: 'processing', version: 'V3.1.8', businessType: 'IoT', updatedAt: '2026-05-07 14:51', checked: false },
  { id: 'ua-004', name: '售后服务协议', status: '已完成', statusTone: 'success', version: 'V1.7.4', businessType: '售后', updatedAt: '2026-05-06 21:15', checked: false },
  { id: 'ua-005', name: '国际站服务条款', status: '审核失败', statusTone: 'danger', version: 'V2.4.0', businessType: '出海', updatedAt: '2026-05-06 12:28', checked: false },
  { id: 'ua-006', name: '设备云服务协议', status: '待发布', statusTone: 'warning', version: 'V1.2.9', businessType: '云服务', updatedAt: '2026-05-05 17:40', checked: false },
  { id: 'ua-007', name: '门店会员注册协议', status: '已完成', statusTone: 'success', version: 'V4.1.6', businessType: '零售', updatedAt: '2026-05-05 08:56', checked: false }
]
const selectedRowKeys = ref(rows.filter((item) => item.checked).map((item) => item.id))
const statusOptions = [...new Set(rows.map((item) => item.status))]
const businessTypeOptions = [...new Set(rows.map((item) => item.businessType))]
const columns = [
  { colKey: 'row-select', type: 'multiple', width: 48 },
  { colKey: 'name', title: '协议名称', minWidth: 240 },
  { colKey: 'status', title: '协议状态', width: 120 },
  { colKey: 'version', title: '版本号', width: 120 },
  { colKey: 'businessType', title: '业务类型', width: 140 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.filter((item) => {
    const matchKeyword = !q || `${item.name} ${item.version} ${item.businessType}`.toLowerCase().includes(q)
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    const matchBusinessType = businessTypeFilter.value === 'all' || item.businessType === businessTypeFilter.value
    return matchKeyword && matchStatus && matchBusinessType
  })
})

const goToCreate = () => {
  router.push({ name: 'agreement' })
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
