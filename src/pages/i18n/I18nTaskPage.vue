<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="国际化任务"
    :total-text="`共 ${filteredRows.length} 项`"
    primary-action="新建任务"
    :columns="columns"
    :data="filteredRows"
    @primary="goToCreate"
  >
    <template #filters>
      <t-select v-model="typeFilter" class="starter-list-filter-select" placeholder="任务类型">
        <t-option value="all" label="全部类型" />
        <t-option v-for="type in typeOptions" :key="type" :value="type" :label="type" />
      </t-select>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="状态">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
      </t-select>
    </template>
    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
    </template>
    <template #operation>
      <t-space size="small">
        <t-button theme="primary" variant="text">详情</t-button>
        <t-button theme="primary" variant="text">重试</t-button>
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
const typeFilter = ref('all')
const statusFilter = ref('all')

const rows = [
  { id: 'task-001', name: '全量词条导入 2026-05-08', type: '导入', status: '完成', statusTone: 'success', owner: '张楠', startedAt: '2026-05-08 11:20', updatedAt: '2026-05-08 11:24' },
  { id: 'task-002', name: '日语缺失项校验', type: '校验', status: '处理中', statusTone: 'processing', owner: '李晨', startedAt: '2026-05-08 10:08', updatedAt: '2026-05-08 11:18' },
  { id: 'task-003', name: '海外资源包导出', type: '下载', status: '待处理', statusTone: 'warning', owner: '王璐', startedAt: '2026-05-08 09:40', updatedAt: '2026-05-08 10:02' },
  { id: 'task-004', name: '韩语资源发布', type: '发布', status: '失败', statusTone: 'danger', owner: '陈曦', startedAt: '2026-05-07 18:31', updatedAt: '2026-05-07 18:48' }
]
const typeOptions = [...new Set(rows.map((item) => item.type))]
const statusOptions = [...new Set(rows.map((item) => item.status))]
const columns = [
  { colKey: 'name', title: '任务名称', minWidth: 240 },
  { colKey: 'type', title: '任务类型', width: 100 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'owner', title: '处理人', width: 100 },
  { colKey: 'startedAt', title: '开始时间', width: 170 },
  { colKey: 'updatedAt', title: '最近更新时间', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.filter((item) => {
    const matchKeyword = !q || `${item.name} ${item.type} ${item.owner}`.toLowerCase().includes(q)
    const matchType = typeFilter.value === 'all' || item.type === typeFilter.value
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    return matchKeyword && matchType && matchStatus
  })
})

const goToCreate = () => {
  router.push({ name: 'i18n-task-create' })
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
