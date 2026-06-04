<template>
  <div class="system-manage-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>内测邀请列表</h3>
        <p>管理业务侧内测邀请链接、邀请方式、应用版本和名额使用情况。</p>
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
        </div>
      </template>
      <template #actions>
        <t-space class="system-manage-filter" :break-line="true">
          <t-input
            v-model="keyword"
            class="system-manage-search"
            placeholder="搜索邀请名称、应用、平台、负责人或备注"
            clearable
          >
            <template #prefix-icon>
              <search-icon />
            </template>
          </t-input>
          <t-select v-model="typeFilter" class="system-manage-status-filter">
            <t-option value="all" label="全部方式" />
            <t-option value="public" label="公开邀请" />
            <t-option value="password" label="密码邀请" />
          </t-select>
          <t-select v-model="statusFilter" class="system-manage-status-filter">
            <t-option value="all" label="全部状态" />
            <t-option value="enabled" label="启用" />
            <t-option value="disabled" label="停用" />
            <t-option value="full" label="名额已满" />
            <t-option value="expired" label="已过期" />
          </t-select>
          <t-button theme="primary" @click="currentPage = 1">查询</t-button>
          <t-button variant="outline" @click="handleReset">重置</t-button>
        </t-space>
      </template>

      <t-table row-key="id" hover :columns="columns" :data="pagedRows">
        <template #title="{ row }">
          <div class="system-manage-name-cell">
            <strong>{{ row.title }}</strong>
            <small>{{ row.code }}</small>
          </div>
        </template>

        <template #platforms="{ row }">
          <t-space size="small">
            <t-tag v-for="platform in row.platforms" :key="platform" variant="light">
              {{ platform }}
            </t-tag>
          </t-space>
        </template>

        <template #inviteType="{ row }">
          <t-tag :theme="row.inviteType === 'password' ? 'warning' : 'primary'" variant="light">
            {{ getInviteTypeLabel(row.inviteType) }}
          </t-tag>
        </template>

        <template #reviewRequired="{ row }">
          <t-tag :theme="isReviewRequired(row) ? 'warning' : 'default'" variant="light">
            {{ isReviewRequired(row) ? '需审核' : '免审核' }}
          </t-tag>
        </template>

        <template #quota="{ row }">
          <div class="beta-invite-quota">
            <span>{{ row.usedCount }} / {{ row.quota }}</span>
            <t-progress :percentage="getQuotaPercent(row)" size="small" :label="false" />
          </div>
        </template>

        <template #status="{ row }">
          <t-tag :theme="getStatusTheme(row.status)" variant="light">
            {{ getStatusLabel(row.status) }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <t-space size="small">
            <t-button theme="primary" variant="text" @click="handleOpenInvite(row)">打开</t-button>
            <t-button v-if="row.sourceType === 'version-user-group-rollout'" theme="primary" variant="text" @click="handleDetail(row)">内测详情</t-button>
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
  Progress as TProgress,
  Select as TSelect,
  Space as TSpace,
  Table as TTable,
  Tag as TTag
} from 'tdesign-vue-next'
import { deleteBetaInvite, getInviteVersionLabel, readBetaInvites } from '../../config/betaInvites'
import { findBetaInviteTemplate } from '../../config/betaInviteTemplates'

const router = useRouter()
const keyword = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10
const rows = ref(readBetaInvites())

const columns = [
  { colKey: 'title', title: '邀请名称', minWidth: 240 },
  { colKey: 'appName', title: '内测应用', minWidth: 170 },
  { colKey: 'platforms', title: '平台', width: 170 },
  { colKey: 'versionLabel', title: '指定版本', minWidth: 180 },
  { colKey: 'templateName', title: '邀请模版', minWidth: 150 },
  { colKey: 'inviteType', title: '邀请方式', width: 120 },
  { colKey: 'reviewRequired', title: '是否审核', width: 110 },
  { colKey: 'quota', title: '内测用户数量', width: 160 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'expiresAt', title: '有效期至', width: 140 },
  { colKey: 'owner', title: '负责人', width: 130 },
  { colKey: 'operation', title: '操作', width: 170, fixed: 'right' }
]

const displayRows = computed(() => rows.value.map((row) => ({
  ...row,
  versionLabel: getInviteVersionLabel(row),
  templateName: findBetaInviteTemplate(row.templateId)?.name || '默认邀请模版'
})))

const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return displayRows.value.filter((row) => {
    const platforms = row.platforms || []
    const matchKeyword = !kw || `${row.title} ${row.code} ${row.appName} ${platforms.join(' ')} ${row.versionLabel} ${row.templateName} ${row.owner} ${row.remark}`.toLowerCase().includes(kw)
    const matchType = typeFilter.value === 'all' || row.inviteType === typeFilter.value
    const matchStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    return matchKeyword && matchType && matchStatus
  })
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

watch([keyword, typeFilter, statusFilter], () => {
  currentPage.value = 1
})

function getInviteTypeLabel (type) {
  return type === 'password' ? '密码邀请' : '公开邀请'
}

function isReviewRequired (row) {
  return row.inviteType === 'public' || (row.inviteType === 'password' && Boolean(row.passwordReviewEnabled))
}

function getStatusLabel (status) {
  const labels = {
    enabled: '启用',
    disabled: '停用',
    full: '名额已满',
    expired: '已过期'
  }
  return labels[status] || status
}

function getStatusTheme (status) {
  if (status === 'enabled') return 'success'
  if (status === 'full') return 'warning'
  if (status === 'expired') return 'danger'
  return 'default'
}

function getQuotaPercent (row) {
  if (!row.quota) return 0
  return Math.min(Math.round((row.usedCount / row.quota) * 100), 100)
}

function handleReset () {
  keyword.value = ''
  typeFilter.value = 'all'
  statusFilter.value = 'all'
  currentPage.value = 1
}

function handleCreate () {
  router.push({ name: 'mobile-app-beta-invite-create' })
}

function handleEdit (row) {
  router.push({ name: 'mobile-app-beta-invite-edit', params: { id: row.id } })
}

function handleDetail (row) {
  router.push({ name: 'mobile-app-beta-invite-detail', params: { id: row.id } })
}

function handleOpenInvite (row) {
  const routeData = router.resolve({ name: 'beta-invite', params: { code: row.code } })
  window.open(routeData.href, '_blank', 'noopener')
}

function handleDelete (row) {
  deleteBetaInvite(row.id)
  rows.value = readBetaInvites()
  MessagePlugin.success('内测邀请已删除')
}
</script>
