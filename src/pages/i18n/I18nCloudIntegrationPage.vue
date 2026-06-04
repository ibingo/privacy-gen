<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="云集成"
    :show-breadcrumb="false"
    :summary-text="`共 ${filteredRows.length} 项`"
    primary-action="新增集成"
    :columns="columns"
    :data="filteredRows"
    search-placeholder="搜索集成名称、平台或接入地址"
    @primary="createIntegration"
    @row-click="openDetail"
  >
    <template #filters>
      <t-select v-model="platformFilter" class="starter-list-filter-select" placeholder="平台">
        <t-option value="all" label="全部平台" />
        <t-option v-for="platform in platformOptions" :key="platform" :value="platform" :label="platform" />
      </t-select>
      <t-select v-model="typeFilter" class="starter-list-filter-select" placeholder="集成类型">
        <t-option value="all" label="全部类型" />
        <t-option v-for="type in typeOptions" :key="type" :value="type" :label="type" />
      </t-select>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="状态">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
      </t-select>
    </template>

    <template #name="{ row }">
      <div class="i18n-cloud-name-cell">
        <strong>{{ row.name }}</strong>
        <small>{{ row.endpoint }}</small>
      </div>
    </template>

    <template #platform="{ row }">
      <t-tag variant="light">{{ row.platform }}</t-tag>
    </template>

    <template #type="{ row }">
      <t-tag theme="primary" variant="light">{{ row.type }}</t-tag>
    </template>

    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
    </template>

    <template #operation="{ row }">
      <t-space size="small">
        <t-button theme="primary" variant="text" @click.stop="goToDetail(row)">详情</t-button>
        <t-button theme="primary" variant="text" @click.stop="testIntegration(row)">测试</t-button>
        <t-button theme="primary" variant="text">编辑</t-button>
      </t-space>
    </template>
  </starter-list-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button as TButton, MessagePlugin, Option as TOption, Select as TSelect, Space as TSpace, Tag as TTag } from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'

const router = useRouter()
const route = useRoute()
const keyword = ref('')
const platformFilter = ref('all')
const typeFilter = ref('all')
const statusFilter = ref('all')

const rows = [
  { id: 'cloud-001', name: '生产 CDN 分发', platform: 'Web', type: 'CDN 分发', endpoint: 'https://cdn.example.com/i18n', owner: '张楠', status: '已启用', statusTone: 'success', updatedAt: '2026-05-08 11:20' },
  { id: 'cloud-002', name: 'App 远程配置', platform: 'APP', type: '配置中心', endpoint: 'https://config.example.com/mobile/i18n', owner: '李晨', status: '已启用', statusTone: 'success', updatedAt: '2026-05-08 10:18' },
  { id: 'cloud-003', name: '翻译发布 Webhook', platform: '全部平台', type: 'Webhook', endpoint: 'https://ops.example.com/hooks/i18n-release', owner: '王璐', status: '待验证', statusTone: 'warning', updatedAt: '2026-05-07 18:42' },
  { id: 'cloud-004', name: '小程序云函数同步', platform: 'MiniApp', type: '云函数', endpoint: 'wx-cloud://i18n-sync', owner: '陈曦', status: '停用', statusTone: 'default', updatedAt: '2026-05-07 16:30' }
]

const platformOptions = [...new Set(rows.map((item) => item.platform))]
const typeOptions = [...new Set(rows.map((item) => item.type))]
const statusOptions = [...new Set(rows.map((item) => item.status))]

const columns = [
  { colKey: 'name', title: '集成名称', minWidth: 280 },
  { colKey: 'platform', title: '平台', width: 120 },
  { colKey: 'type', title: '集成类型', width: 130 },
  { colKey: 'owner', title: '负责人', width: 100 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'updatedAt', title: '更新时间', width: 170 },
  { colKey: 'operation', title: '操作', width: 180, fixed: 'right' }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.filter((item) => {
    const matchKeyword = !q || `${item.name} ${item.platform} ${item.type} ${item.endpoint} ${item.owner}`.toLowerCase().includes(q)
    const matchPlatform = platformFilter.value === 'all' || item.platform === platformFilter.value
    const matchType = typeFilter.value === 'all' || item.type === typeFilter.value
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    return matchKeyword && matchPlatform && matchType && matchStatus
  })
})

function createIntegration () {
  MessagePlugin.info('打开新增云集成表单')
}

function openDetail ({ row }) {
  goToDetail(row)
}

function goToDetail (row) {
  router.push({ name: 'i18n-cloud-integration-detail', params: { projectId: route.params.projectId, id: row.id } })
}

function testIntegration (row) {
  MessagePlugin.success(`${row.name} 连接测试已提交`)
}

function getStatusTheme (tone) {
  const themeMap = {
    success: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}
</script>
