<template>
  <div class="system-manage-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>IP 白名单</h3>
        <p>管理允许进入内测环境的 IP 与 IP 段白名单。</p>
      </div>
      <t-button theme="primary" @click="handleCreate">
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
            placeholder="搜索名称或 IP 段"
            clearable
          >
            <template #prefix-icon>
              <search-icon />
            </template>
          </t-input>
          <t-button theme="primary" @click="currentPage = 1">查询</t-button>
          <t-button variant="outline" @click="handleReset">重置</t-button>
        </t-space>
      </template>

      <t-table
        row-key="id"
        hover
        :columns="columns"
        :data="pagedRows"
      >
        <template #name="{ row }">
          <div class="system-manage-name-cell">
            <strong>{{ row.name }}</strong>
            <small>{{ row.description }}</small>
          </div>
        </template>

        <template #operation="{ row }">
          <t-space size="small">
            <t-button theme="primary" variant="text" @click="handleEdit(row)">编辑</t-button>
            <t-button theme="danger" variant="text" @click="handleDelete(row)">删除</t-button>
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
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  MessagePlugin,
  Pagination as TPagination,
  Space as TSpace,
  Table as TTable,
  Tag as TTag,
  Input as TInput
} from 'tdesign-vue-next'

const router = useRouter()
const keyword = ref('')
const currentPage = ref(1)
const pageSize = 10

const rows = ref([
  { id: 'beta-ip-001', name: '内网IP段', ipRange: '10.0.0.0/32', description: '内测环境内网访问白名单' },
  { id: 'beta-ip-002', name: '公司公网IP', ipRange: '58.214.44.25', description: '公司办公公网出口' },
  { id: 'beta-ip-003', name: '移动组预发布', ipRange: '192.168.14.0/8', description: '移动组预发布访问段' },
  { id: 'beta-ip-004', name: '公司预发布', ipRange: '192.168.0.0/16', description: '公司预发布环境访问段' },
  { id: 'beta-ip-005', name: '测试组预发布', ipRange: '192.168.11.0/8', description: '测试组预发布访问段' },
  { id: 'beta-ip-006', name: '动态ip预发布', ipRange: '192.168.254.0/8', description: '动态 IP 预发布访问段' },
  { id: 'beta-ip-007', name: '内网2', ipRange: '223.112.146.10', description: '备用内测访问 IP' }
])

const columns = [
  { colKey: 'name', title: '名称', minWidth: 220 },
  { colKey: 'ipRange', title: 'IP / IP 段', minWidth: 220 },
  { colKey: 'description', title: '说明', minWidth: 260 },
  { colKey: 'operation', title: '操作', width: 130, fixed: 'right' }
]

const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    return !kw || `${row.name} ${row.ipRange} ${row.description}`.toLowerCase().includes(kw)
  })
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

watch(keyword, () => {
  currentPage.value = 1
})

function handleReset () {
  keyword.value = ''
  currentPage.value = 1
}

function handleCreate () {
  router.push({ name: 'system-ip-whitelist-create' })
}

function handleEdit (row) {
  router.push({ name: 'system-ip-whitelist-edit', params: { id: row.id } })
}

function handleDelete (row) {
  rows.value = rows.value.filter((item) => item.id !== row.id)
  MessagePlugin.success('内测白名单已删除')
}
</script>
