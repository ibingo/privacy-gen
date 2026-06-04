<template>
  <div class="system-create-page system-form-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>{{ pageTitle }}</h3>
        <p>{{ pageDescription }}</p>
      </div>
      <t-button variant="outline" @click="goBack">返回</t-button>
    </section>

    <t-card class="system-form-card" :bordered="false">
      <template #title>
        <div class="system-form-card-title">
          <span>基础信息</span>
          <t-tag :theme="isAutoInvite ? 'warning' : 'primary'" variant="light">
            {{ isCreateMode ? '新建' : isAutoInvite ? '灰度用户组' : '编辑' }}
          </t-tag>
        </div>
      </template>

      <t-form class="system-create-form system-base-form" :data="formData" label-align="right" label-width="130px">
        <div class="system-form-section">
          <div class="system-form-section-title">邀请信息</div>
          <div class="system-create-grid">
            <t-form-item label="邀请名称" required-mark>
              <t-input v-model="formData.title" :disabled="isLockedField('title')" placeholder="请输入邀请名称" />
            </t-form-item>
            <t-form-item label="邀请编码" required-mark>
              <t-input v-model="formData.code" :disabled="isLockedField('code')" placeholder="请输入邀请编码" />
            </t-form-item>
            <t-form-item label="邀请方式" required-mark>
              <t-radio-group v-model="formData.inviteType">
                <t-radio-button value="public">公开邀请</t-radio-button>
                <t-radio-button value="password">密码邀请</t-radio-button>
              </t-radio-group>
            </t-form-item>
            <t-form-item label="邀请模版" required-mark>
              <t-select v-model="formData.templateId" filterable placeholder="请选择邀请模版">
                <t-option
                  v-for="template in templateOptions"
                  :key="template.id"
                  :value="template.id"
                  :label="template.isDefault ? `${template.name}（默认）` : template.name"
                />
              </t-select>
            </t-form-item>
            <t-form-item v-if="formData.inviteType === 'password'" label="邀请密码" required-mark>
              <t-input v-model="formData.password" placeholder="请输入邀请密码" />
            </t-form-item>
            <t-form-item v-if="formData.inviteType === 'password'" label="密码审核">
              <t-switch v-model="formData.passwordReviewEnabled" />
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">测试范围</div>
          <div class="system-create-grid">
            <t-form-item label="内测应用" required-mark>
              <t-select v-model="formData.appName" filterable :disabled="isLockedField('appName')" placeholder="请选择内测应用">
                <t-option
                  v-for="appName in appNameOptions"
                  :key="appName"
                  :value="appName"
                  :label="appName"
                />
              </t-select>
            </t-form-item>
            <t-form-item label="平台" required-mark>
              <t-select v-model="formData.platforms" multiple clearable :disabled="isLockedField('platforms')" placeholder="请选择平台">
                <t-option value="iOS" label="iOS" />
                <t-option value="Android" label="Android" />
                <t-option value="Web App" label="Web App" />
              </t-select>
            </t-form-item>
            <t-form-item label="指定版本" required-mark>
              <t-select v-model="formData.versionId" filterable :disabled="isLockedField('versionId')" placeholder="请选择指定版本">
                <t-option value="all" label="不限制版本" />
                <t-option
                  v-for="version in versionOptions"
                  :key="version.id"
                  :value="version.id"
                  :label="formatVersionOption(version)"
                />
              </t-select>
            </t-form-item>
            <t-form-item label="状态" required-mark>
              <t-select v-model="formData.status" :disabled="isLockedField('status')" placeholder="请选择状态">
                <t-option value="enabled" label="启用" />
                <t-option value="disabled" label="停用" />
                <t-option value="full" label="名额已满" />
                <t-option value="expired" label="已过期" />
              </t-select>
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">名额与有效期</div>
          <div class="system-create-grid">
            <t-form-item label="内测用户数量" required-mark>
              <t-input-number v-model="formData.quota" :min="1" :max="99999" theme="column" />
            </t-form-item>
            <t-form-item label="已使用数量">
              <t-input-number v-model="formData.usedCount" :min="0" :max="formData.quota || 99999" theme="column" />
            </t-form-item>
            <t-form-item label="有效期至" required-mark>
              <t-date-picker v-model="formData.expiresAt" clearable placeholder="请选择有效期" />
            </t-form-item>
            <t-form-item label="负责人">
              <t-input v-model="formData.owner" placeholder="请输入负责人" />
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">邀请说明</div>
          <t-form-item label="备注">
            <t-textarea v-model="formData.remark" :autosize="{ minRows: 4, maxRows: 6 }" placeholder="请输入备注" />
          </t-form-item>
        </div>

        <div class="system-create-actions system-form-actions">
          <t-button theme="primary" @click="handleSubmit">保存</t-button>
          <t-button variant="outline" @click="goBack">取消</t-button>
        </div>
      </t-form>
    </t-card>

    <t-card v-if="!isCreateMode" class="system-form-card" :bordered="false">
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
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDownIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  DatePicker as TDatePicker,
  Dropdown as TDropdown,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  InputNumber as TInputNumber,
  MessagePlugin,
  Option as TOption,
  RadioButton as TRadioButton,
  RadioGroup as TRadioGroup,
  Select as TSelect,
  Switch as TSwitch,
  Tag as TTag,
  Table as TTable,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import { createBetaInvite, findBetaInvite, isAutoCreatedBetaInvite, isInviteReviewEnabled, removeJoinedBetaInviteUser, updateBetaInvite, updateJoinedBetaInviteUserReview } from '../../config/betaInvites'
import { DEFAULT_BETA_INVITE_TEMPLATE_ID, readBetaInviteTemplates } from '../../config/betaInviteTemplates'
import { readMobileApps, readMobileAppVersions } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const isCreateMode = computed(() => route.name === 'mobile-app-beta-invite-create')
const currentRow = ref(findBetaInvite(route.params.id))
const isAutoInvite = computed(() => isAutoCreatedBetaInvite(currentRow.value))
const pageTitle = computed(() => isCreateMode.value ? '新建内测邀请' : '编辑内测邀请')
const pageDescription = computed(() => isCreateMode.value
  ? '配置邀请链接、应用平台、指定版本和内测用户数量。'
  : isAutoInvite.value
    ? '该邀请由指定用户组灰度自动创建，测试范围参数不可编辑。'
    : '维护内测邀请的访问方式、版本范围、名额和有效期。')
const mobileApps = computed(() => readMobileApps())
const appNameOptions = computed(() => [...new Set(mobileApps.value.map((app) => app.name))])
const templateOptions = computed(() => readBetaInviteTemplates().filter((template) => template.status === 'enabled' || template.id === formData.templateId))
const joinedUsers = computed(() => currentRow.value?.joinedUsers || [])
const inviteNeedsReview = computed(() => isInviteReviewEnabled(formData))
const joinedUserColumns = [
  { colKey: 'user', title: '用户', minWidth: 220 },
  { colKey: 'phone', title: '手机号', width: 140 },
  { colKey: 'joinedAt', title: '加入时间', width: 180 },
  { colKey: 'source', title: '来源', minWidth: 160 },
  { colKey: 'reviewStatus', title: '审核状态', width: 120 },
  { colKey: 'operation', title: '操作', width: 100, fixed: 'right' }
]

const formData = reactive({
  title: currentRow.value?.title || '',
  code: currentRow.value?.code || '',
  appName: currentRow.value?.appName || 'Privacy Gen',
  platforms: currentRow.value?.platforms || ['iOS'],
  versionId: currentRow.value?.versionId || 'all',
  templateId: currentRow.value?.templateId || DEFAULT_BETA_INVITE_TEMPLATE_ID,
  inviteType: currentRow.value?.inviteType || 'public',
  password: currentRow.value?.password || '',
  passwordReviewEnabled: Boolean(currentRow.value?.passwordReviewEnabled),
  quota: currentRow.value?.quota || 50,
  usedCount: currentRow.value?.usedCount || 0,
  status: currentRow.value?.status || 'enabled',
  expiresAt: currentRow.value?.expiresAt || '',
  owner: currentRow.value?.owner || '',
  remark: currentRow.value?.remark || ''
})

function isLockedField (field) {
  if (!isAutoInvite.value) return false
  return currentRow.value?.lockedFields?.includes(field)
}

const selectedApps = computed(() => {
  return mobileApps.value.filter((app) => app.name === formData.appName && formData.platforms.includes(app.platform))
})

const versionOptions = computed(() => {
  return selectedApps.value.flatMap((app) => {
    return readMobileAppVersions(app.id).map((version) => ({
      ...version,
      platform: app.platform
    }))
  })
})

watch([() => formData.appName, () => formData.platforms], () => {
  if (formData.versionId !== 'all' && !versionOptions.value.some((version) => version.id === formData.versionId)) {
    formData.versionId = 'all'
  }
}, { deep: true })

watch(() => formData.inviteType, () => {
  if (formData.inviteType === 'public') {
    formData.password = ''
    formData.passwordReviewEnabled = false
  }
})

function formatVersionOption (version) {
  return `${version.platform} · ${version.version} · Build ${version.buildNumber} · ${version.channel}`
}

function goBack () {
  router.push({ name: 'mobile-app-beta-invites' })
}

function handleRemoveJoinedUser (row) {
  const updated = removeJoinedBetaInviteUser(route.params.id, row.id)
  if (!updated) {
    MessagePlugin.warning('移除失败，未找到该用户')
    return
  }
  formData.usedCount = updated.usedCount
  formData.status = updated.status
  currentRow.value = updated
  MessagePlugin.success('内测用户已移除')
}

function getReviewStatusLabel (status) {
  const labels = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return labels[status] || status || (inviteNeedsReview.value ? '待审核' : '已通过')
}

function getReviewStatusTheme (status) {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
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
  if (!nextStatus) return
  const updated = updateJoinedBetaInviteUserReview(route.params.id, row.id, nextStatus)
  if (!updated) {
    MessagePlugin.warning('审核操作失败，未找到该用户')
    return
  }
  currentRow.value = updated
  MessagePlugin.success(`审核状态已更新为${getReviewStatusLabel(nextStatus)}`)
}

function handleSubmit () {
  if (!formData.title.trim() || !formData.code.trim() || !formData.appName || !formData.platforms.length || !formData.versionId || !formData.templateId || !formData.expiresAt || !formData.quota) {
    MessagePlugin.warning('请填写邀请名称、编码、应用、平台、指定版本、邀请模版、有效期和内测用户数量')
    return
  }
  if (formData.inviteType === 'password' && !formData.password.trim()) {
    MessagePlugin.warning('密码邀请需要填写邀请密码')
    return
  }
  const payload = {
    ...formData,
    passwordReviewEnabled: formData.inviteType === 'password' && Boolean(formData.passwordReviewEnabled),
    quota: Number(formData.quota),
    usedCount: Number(formData.usedCount) || 0
  }
  if (isAutoInvite.value) {
    ;['title', 'code', 'appName', 'platforms', 'versionId', 'status'].forEach((field) => {
      payload[field] = currentRow.value[field]
    })
  }
  if (isCreateMode.value) {
    createBetaInvite(payload)
  } else {
    updateBetaInvite(route.params.id, payload)
  }
  MessagePlugin.success(isCreateMode.value ? '内测邀请已创建' : '内测邀请已保存')
  goBack()
}
</script>
