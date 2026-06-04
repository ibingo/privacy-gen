<template>
  <div class="starter-list-page">
    <div class="starter-list-breadcrumb">移动应用中心 / 内部测试 / 内测邀请模版</div>

    <t-card class="starter-list-card" :bordered="false">
      <div class="starter-list-toolbar">
        <div class="starter-list-toolbar-left">
          <t-input v-model="keyword" class="starter-list-search" placeholder="搜索模版名称、编码或负责人" clearable>
            <template #prefix-icon><search-icon /></template>
          </t-input>
          <t-select v-model="statusFilter" class="starter-list-filter-select">
            <t-option value="all" label="全部状态" />
            <t-option value="enabled" label="启用" />
            <t-option value="disabled" label="停用" />
          </t-select>
        </div>
        <div class="starter-list-toolbar-right">
          <t-button theme="primary" @click="handleCreate">
            <template #icon><add-icon /></template>
            新增
          </t-button>
        </div>
      </div>

      <t-table row-key="id" hover :columns="columns" :data="pagedRows">
        <template #name="{ row }">
          <div class="mobile-app-table-name">
            <span class="beta-template-thumb" :style="getThumbStyle(row)">
              <span>{{ row.name.slice(0, 1) }}</span>
            </span>
            <div class="mobile-app-table-main">
              <strong>{{ row.name }}</strong>
              <small>{{ row.code }}</small>
            </div>
          </div>
        </template>

        <template #isDefault="{ row }">
          <t-tag :theme="row.isDefault ? 'primary' : 'default'" variant="light">
            {{ row.isDefault ? '默认模版' : '普通模版' }}
          </t-tag>
        </template>

        <template #status="{ row }">
          <t-tag :theme="row.status === 'enabled' ? 'success' : 'default'" variant="light">
            {{ row.status === 'enabled' ? '启用' : '停用' }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <t-space size="small">
            <t-button v-if="!row.isDefault" theme="primary" variant="text" @click="handleEdit(row)">编辑</t-button>
            <t-button v-if="row.isDefault" theme="primary" variant="text" @click="handleCopy(row)">复制创建</t-button>
            <t-button v-if="!row.isDefault" theme="primary" variant="text" @click="handleSetDefault(row)">设为默认</t-button>
            <t-button v-if="!row.isDefault" theme="danger" variant="text" @click="handleDelete(row)">删除</t-button>
          </t-space>
        </template>
      </t-table>

      <div class="starter-list-pagination">
        <t-pagination
          v-model:current="currentPage"
          :total="filteredRows.length"
          :page-size="pageSize"
          :show-page-size="false"
          :show-jumper="false"
          show-total
        />
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Pagination as TPagination,
  Select as TSelect,
  Space as TSpace,
  Table as TTable,
  Tag as TTag
} from 'tdesign-vue-next'
import {
  copyBetaInviteTemplate,
  deleteBetaInviteTemplate,
  readBetaInviteTemplates,
  setDefaultBetaInviteTemplate
} from '../../config/betaInviteTemplates'

const router = useRouter()
const keyword = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10
const rows = ref(readBetaInviteTemplates())

const columns = [
  { colKey: 'name', title: '模版名称', minWidth: 240 },
  { colKey: 'platform', title: '适用端', width: 140 },
  { colKey: 'isDefault', title: '默认状态', width: 120 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'owner', title: '负责人', width: 140 },
  { colKey: 'updatedAt', title: '更新时间', width: 170 },
  { colKey: 'description', title: '说明', minWidth: 260, ellipsis: true },
  { colKey: 'operation', title: '操作', width: 210, fixed: 'right' }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesKeyword = !q || `${row.name} ${row.code} ${row.owner} ${row.description}`.toLowerCase().includes(q)
    const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    return matchesKeyword && matchesStatus
  })
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

watch([keyword, statusFilter], () => {
  currentPage.value = 1
})

function getThumbStyle (row) {
  return {
    background: row.style?.primaryColor || '#0052d9',
    color: row.style?.buttonTextColor || '#ffffff',
    borderRadius: `${row.style?.iconRadius || 18}px`
  }
}

function reloadRows () {
  rows.value = readBetaInviteTemplates()
}

function handleCreate () {
  router.push({ name: 'mobile-app-beta-invite-template-create' })
}

function handleEdit (row) {
  router.push({ name: 'mobile-app-beta-invite-template-edit', params: { id: row.id } })
}

function handleCopy (row) {
  const template = copyBetaInviteTemplate(row.id)
  reloadRows()
  MessagePlugin.success('已复制默认模版，可继续编辑副本')
  router.push({ name: 'mobile-app-beta-invite-template-edit', params: { id: template.id } })
}

function handleSetDefault (row) {
  setDefaultBetaInviteTemplate(row.id)
  reloadRows()
  MessagePlugin.success('默认邀请模版已更新')
}

function handleDelete (row) {
  deleteBetaInviteTemplate(row.id)
  reloadRows()
  MessagePlugin.success('邀请模版已删除')
}
</script>
