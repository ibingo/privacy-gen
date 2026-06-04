<template>
  <div class="system-manage-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>内测用户列表</h3>
        <p>管理允许进入业务侧内测环境的用户、应用、平台和有效期。</p>
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
            placeholder="搜索用户、手机号、应用或备注"
            clearable
          >
            <template #prefix-icon>
              <search-icon />
            </template>
          </t-input>
          <t-select v-model="statusFilter" class="system-manage-status-filter">
            <t-option value="all" label="全部状态" />
            <t-option value="enabled" label="启用" />
            <t-option value="disabled" label="停用" />
            <t-option value="expired" label="已过期" />
          </t-select>
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
        <template #user="{ row }">
          <div class="system-manage-name-cell">
            <strong>{{ row.userName }}</strong>
            <small>{{ row.account }}</small>
          </div>
        </template>

        <template #status="{ row }">
          <t-tag :theme="getStatusTheme(row.status)" variant="light">
            {{ getStatusLabel(row.status) }}
          </t-tag>
        </template>

        <template #appNames="{ row }">
          <div class="system-manage-name-cell">
            <strong v-for="appName in row.appNames" :key="appName">{{ appName }}</strong>
          </div>
        </template>

        <template #operation="{ row }">
          <t-space size="small">
            <t-button theme="primary" variant="text" @click="handleInvite(row)">邀请</t-button>
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

    <t-dialog
      v-model:visible="inviteDialogVisible"
      header="选择内测邀请"
      width="620px"
      confirm-btn="发送邀请"
      cancel-btn="取消"
      :confirm-on-enter="false"
      @confirm="handleConfirmInvite"
    >
      <div class="beta-user-invite-dialog">
        <t-form :data="inviteForm" label-align="right" label-width="120px">
          <t-form-item label="内测用户">
            <strong>{{ currentInviteUser?.userName || '-' }}</strong>
          </t-form-item>
          <t-form-item label="内测邀请" required-mark>
            <t-select
              v-model="inviteForm.inviteId"
              filterable
              placeholder="请选择内测邀请"
              :popup-props="{ overlayInnerClassName: 'beta-user-invite-select-popup' }"
            >
              <t-option
                v-for="invite in inviteOptions"
                :key="invite.id"
                :value="invite.id"
                :label="formatInviteOption(invite)"
              >
                <div class="beta-user-invite-option">
                  <strong>{{ invite.title }}</strong>
                  <span>
                    {{ invite.appName }}
                    <template v-if="invite.platforms?.length"> · {{ invite.platforms.join(' / ') }}</template>
                    · {{ getInviteVersionLabel(invite) }}
                  </span>
                  <small>
                    {{ getInviteTypeLabel(invite.inviteType) }} · {{ invite.usedCount }} / {{ invite.quota }} · 有效期至 {{ invite.expiresAt }}
                  </small>
                </div>
              </t-option>
            </t-select>
          </t-form-item>
          <t-form-item label="通知用户">
            <t-checkbox-group v-model="inviteForm.notifyMethods">
              <t-checkbox value="email">邮件通知</t-checkbox>
              <t-checkbox value="sms">短信通知</t-checkbox>
            </t-checkbox-group>
          </t-form-item>
        </t-form>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  Checkbox as TCheckbox,
  CheckboxGroup as TCheckboxGroup,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Pagination as TPagination,
  Select as TSelect,
  Space as TSpace,
  Table as TTable,
  Tag as TTag
} from 'tdesign-vue-next'
import { addBetaUserJoinedTest, deleteBetaUser, readBetaUsers } from '../../config/betaUsers'
import { getInviteVersionLabel, readBetaInvites } from '../../config/betaInvites'

const router = useRouter()
const keyword = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10

const rows = ref(readBetaUsers())
const inviteDialogVisible = ref(false)
const currentInviteUser = ref(null)
const inviteForm = ref({
  inviteId: '',
  notifyMethods: []
})
const inviteOptions = computed(() => readBetaInvites().filter((invite) => invite.status === 'enabled'))

const columns = [
  { colKey: 'user', title: '用户', minWidth: 240 },
  { colKey: 'phone', title: '手机号', width: 140 },
  { colKey: 'appNames', title: '内测应用', minWidth: 180 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'expiresAt', title: '有效期至', width: 140 },
  { colKey: 'remark', title: '备注', minWidth: 180 },
  { colKey: 'operation', title: '操作', width: 170, fixed: 'right' }
]

const displayRows = computed(() => rows.value.map((row) => ({
  ...row,
  appNames: row.appNames?.length ? row.appNames : [row.appName].filter(Boolean)
})))

const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return displayRows.value.filter((row) => {
    const appNames = row.appNames || []
    const matchKeyword = !kw || `${row.userName} ${row.account} ${row.phone} ${appNames.join(' ')} ${row.remark}`.toLowerCase().includes(kw)
    const matchStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    return matchKeyword && matchStatus
  })
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

watch([keyword, statusFilter], () => {
  currentPage.value = 1
})

function getStatusLabel (status) {
  const labels = {
    enabled: '启用',
    disabled: '停用',
    expired: '已过期'
  }
  return labels[status] || status
}

function getStatusTheme (status) {
  if (status === 'enabled') return 'success'
  if (status === 'expired') return 'warning'
  return 'default'
}

function handleReset () {
  keyword.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1
}

function handleCreate () {
  router.push({ name: 'mobile-app-beta-user-create' })
}

function handleEdit (row) {
  router.push({ name: 'mobile-app-beta-user-edit', params: { id: row.id } })
}

function handleInvite (row) {
  currentInviteUser.value = row
  inviteForm.value = {
    inviteId: '',
    notifyMethods: []
  }
  inviteDialogVisible.value = true
}

function handleDelete (row) {
  deleteBetaUser(row.id)
  rows.value = readBetaUsers()
  MessagePlugin.success('内测用户已删除')
}

function formatInviteOption (invite) {
  return `${invite.title} · ${invite.appName} · ${(invite.platforms || []).join('/')} · ${getInviteVersionLabel(invite)}`
}

function getInviteTypeLabel (type) {
  return type === 'password' ? '密码邀请' : '公开邀请'
}

function handleConfirmInvite () {
  if (!currentInviteUser.value || !inviteForm.value.inviteId) {
    MessagePlugin.warning('请选择内测邀请')
    return
  }
  const updated = addBetaUserJoinedTest(currentInviteUser.value.id, inviteForm.value.inviteId, {
    notifyByEmail: inviteForm.value.notifyMethods.includes('email'),
    notifyBySms: inviteForm.value.notifyMethods.includes('sms')
  })
  if (!updated) {
    MessagePlugin.warning('发送邀请失败，未找到内测邀请')
    return
  }
  rows.value = readBetaUsers()
  inviteDialogVisible.value = false
  MessagePlugin.success('内测邀请已发送')
}
</script>

<style scoped>
.beta-user-invite-option {
  display: grid;
  gap: 4px;
  width: 100%;
  min-width: 0;
  padding: 4px 0;
  line-height: 1.35;
  white-space: normal;
}

:global(.beta-user-invite-select-popup .t-select-option) {
  height: auto;
  min-height: 64px;
  align-items: flex-start;
  padding-top: 8px;
  padding-bottom: 8px;
}

:global(.beta-user-invite-select-popup .t-select-option__content) {
  width: 100%;
  min-width: 0;
}

.beta-user-invite-option strong {
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.beta-user-invite-option span,
.beta-user-invite-option small {
  color: #6b7280;
  font-size: 12px;
}
</style>
