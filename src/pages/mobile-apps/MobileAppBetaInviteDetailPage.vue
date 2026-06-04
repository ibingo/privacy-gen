<template>
  <div v-if="invite" class="system-create-page system-form-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>内测邀请详情</h3>
        <p>{{ invite.title }} · {{ invite.code }}</p>
      </div>
      <t-space>
        <t-button variant="outline" @click="goBack">返回</t-button>
        <t-button variant="outline" @click="openInvite">打开邀请页</t-button>
        <t-button theme="primary" @click="editInvite">编辑</t-button>
      </t-space>
    </section>

    <t-card class="system-form-card" :bordered="false">
      <template #title>
        <div class="system-form-card-title">
          <span>基础信息</span>
          <t-tag :theme="isAutoInvite ? 'warning' : 'primary'" variant="light">
            {{ isAutoInvite ? '灰度用户组' : getInviteTypeLabel(invite.inviteType) }}
          </t-tag>
        </div>
      </template>

      <div class="system-create-form system-base-form">
        <div class="system-form-section">
          <div class="system-form-section-title">邀请信息</div>
          <div class="system-create-grid">
            <div class="beta-invite-detail-item">
              <span>邀请名称</span>
              <strong>{{ invite.title }}</strong>
            </div>
            <div class="beta-invite-detail-item">
              <span>邀请编码</span>
              <strong>{{ invite.code }}</strong>
            </div>
            <div class="beta-invite-detail-item">
              <span>邀请方式</span>
              <strong>{{ getInviteTypeLabel(invite.inviteType) }}</strong>
            </div>
            <div class="beta-invite-detail-item">
              <span>邀请模版</span>
              <strong>{{ templateName }}</strong>
            </div>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">测试范围</div>
          <div class="system-create-grid">
            <div class="beta-invite-detail-item">
              <span>内测应用</span>
              <strong>{{ invite.appName }}</strong>
            </div>
            <div class="beta-invite-detail-item">
              <span>平台</span>
              <t-space class="beta-invite-detail-value" size="small">
                <t-tag v-for="platform in invite.platforms" :key="platform" variant="light">{{ platform }}</t-tag>
              </t-space>
            </div>
            <div class="beta-invite-detail-item">
              <span>指定版本</span>
              <strong>{{ versionLabel }}</strong>
            </div>
            <div class="beta-invite-detail-item">
              <span>状态</span>
              <div class="beta-invite-detail-value">
                <t-tag :theme="getStatusTheme(invite.status)" variant="light">{{ getStatusLabel(invite.status) }}</t-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">名额与有效期</div>
          <div class="system-create-grid">
            <div class="beta-invite-detail-item">
              <span>内测用户数量</span>
              <strong>{{ invite.usedCount }} / {{ invite.quota }}</strong>
            </div>
            <div class="beta-invite-detail-item">
              <span>有效期至</span>
              <strong>{{ invite.expiresAt }}</strong>
            </div>
            <div class="beta-invite-detail-item">
              <span>负责人</span>
              <strong>{{ invite.owner || '-' }}</strong>
            </div>
            <div class="beta-invite-detail-item">
              <span>来源</span>
              <strong>{{ isAutoInvite ? '版本指定用户组灰度自动创建' : '手动创建' }}</strong>
            </div>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">邀请说明</div>
          <div class="beta-invite-detail-remark">{{ invite.remark || '暂无备注' }}</div>
        </div>
      </div>
    </t-card>

    <t-card class="system-form-card" :bordered="false">
      <template #title>
        <div class="system-form-card-title">
          <span>已加入用户</span>
          <t-tag theme="primary" variant="light">共 {{ joinedUsers.length }} 人</t-tag>
        </div>
      </template>
      <t-table row-key="id" hover :columns="joinedUserColumns" :data="joinedUsers" :pagination="null">
        <template #user="{ row }">
          <div class="system-manage-name-cell">
            <strong>{{ row.userName || '-' }}</strong>
            <small>{{ row.account || row.phone || row.id }}</small>
          </div>
        </template>
        <template #operation="{ row }">
          <t-dropdown :options="getJoinedUserOperationOptions(row)" trigger="click" @click="handleJoinedUserOperation($event, row)">
            <t-button theme="primary" variant="text">
              操作
              <template #suffix>
                <chevron-down-icon />
              </template>
            </t-button>
          </t-dropdown>
        </template>
        <template #reviewStatus="{ row }">
          <t-tag :theme="getReviewStatusTheme(row.reviewStatus)" variant="light">
            {{ getReviewStatusLabel(row.reviewStatus) }}
          </t-tag>
        </template>
      </t-table>
    </t-card>
  </div>

  <div v-else class="system-manage-page">
    <t-card class="system-form-card" :bordered="false">
      <div class="mc-empty-state">
        <p>未找到该内测邀请</p>
        <t-button variant="outline" @click="goBack">返回内测邀请列表</t-button>
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDownIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  Dropdown as TDropdown,
  Space as TSpace,
  Tag as TTag,
  Table as TTable,
  MessagePlugin
} from 'tdesign-vue-next'
import { findBetaInvite, getInviteVersionLabel, isAutoCreatedBetaInvite, removeJoinedBetaInviteUser, updateJoinedBetaInviteUserReview } from '../../config/betaInvites'
import { findBetaInviteTemplate } from '../../config/betaInviteTemplates'

const route = useRoute()
const router = useRouter()
const inviteState = ref(findBetaInvite(route.params.id))
const invite = computed(() => inviteState.value)
const isAutoInvite = computed(() => isAutoCreatedBetaInvite(invite.value))
const versionLabel = computed(() => getInviteVersionLabel(invite.value))
const templateName = computed(() => findBetaInviteTemplate(invite.value?.templateId)?.name || '默认邀请模版')
const joinedUsers = computed(() => invite.value?.joinedUsers || [])
const joinedUserColumns = [
  { colKey: 'user', title: '用户', minWidth: 220 },
  { colKey: 'phone', title: '手机号', width: 140 },
  { colKey: 'joinedAt', title: '加入时间', width: 180 },
  { colKey: 'source', title: '来源', minWidth: 160 },
  { colKey: 'reviewStatus', title: '审核状态', width: 120 },
  { colKey: 'operation', title: '操作', width: 100, fixed: 'right' }
]

function getInviteTypeLabel (type) {
  return type === 'password' ? '密码邀请' : '公开邀请'
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

function getReviewStatusLabel (status) {
  const labels = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return labels[status] || status || '待审核'
}

function getReviewStatusTheme (status) {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
}

function goBack () {
  router.push({ name: 'mobile-app-beta-invites' })
}

function editInvite () {
  if (!invite.value) return
  router.push({ name: 'mobile-app-beta-invite-edit', params: { id: invite.value.id } })
}

function openInvite () {
  if (!invite.value) return
  const routeData = router.resolve({ name: 'beta-invite', params: { code: invite.value.code } })
  window.open(routeData.href, '_blank', 'noopener')
}

function handleRemoveJoinedUser (row) {
  const updated = removeJoinedBetaInviteUser(route.params.id, row.id)
  if (!updated) {
    MessagePlugin.warning('移除失败，未找到该用户')
    return
  }
  inviteState.value = updated
  MessagePlugin.success('内测用户已移除')
}

function getJoinedUserOperationOptions (row) {
  const options = []
  if (row.reviewStatus !== 'approved') options.push({ content: '审核通过', value: 'approve' })
  if (row.reviewStatus !== 'rejected') options.push({ content: '审核拒绝', value: 'reject' })
  if (row.reviewStatus !== 'pending') options.push({ content: '重置待审核', value: 'pending' })
  options.push({ content: '移除', value: 'remove' })
  return options
}

function handleJoinedUserOperation (option, row) {
  const action = option?.value
  if (action === 'remove') {
    handleRemoveJoinedUser(row)
    return
  }
  const reviewStatusMap = {
    approve: 'approved',
    reject: 'rejected',
    pending: 'pending'
  }
  const nextStatus = reviewStatusMap[action]
  if (!nextStatus || !invite.value) return
  const updated = updateJoinedBetaInviteUserReview(invite.value.id, row.id, nextStatus)
  if (!updated) {
    MessagePlugin.warning('审核操作失败，未找到该用户')
    return
  }
  inviteState.value = updated
  MessagePlugin.success(`审核状态已更新为${getReviewStatusLabel(nextStatus)}`)
}
</script>
