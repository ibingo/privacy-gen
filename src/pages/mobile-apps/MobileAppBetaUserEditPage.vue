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
          <t-tag theme="primary" variant="light">{{ isCreateMode ? '新建' : '编辑' }}</t-tag>
        </div>
      </template>

      <t-form class="system-create-form system-base-form" :data="formData" label-align="right" label-width="120px">
        <div class="system-form-section">
          <div class="system-form-section-title">用户信息</div>
          <div class="system-create-grid">
            <t-form-item label="用户名称" required-mark>
              <t-input v-model="formData.userName" placeholder="请输入用户名称" />
            </t-form-item>
            <t-form-item label="登录账号" required-mark>
              <t-input v-model="formData.account" placeholder="请输入登录账号或邮箱" />
            </t-form-item>
            <t-form-item label="手机号">
              <t-input v-model="formData.phone" placeholder="请输入手机号" />
            </t-form-item>
            <t-form-item label="内测应用" required-mark>
              <t-select v-model="formData.appNames" multiple filterable placeholder="请选择内测应用">
                <t-option
                  v-for="appName in appNameOptions"
                  :key="appName"
                  :value="appName"
                  :label="appName"
                />
              </t-select>
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">测试资格</div>
          <div class="system-create-grid">
            <t-form-item label="状态" required-mark>
              <t-select v-model="formData.status" placeholder="请选择状态">
                <t-option value="enabled" label="启用" />
                <t-option value="disabled" label="停用" />
                <t-option value="expired" label="已过期" />
              </t-select>
            </t-form-item>
            <t-form-item label="有效期至" required-mark>
              <t-date-picker v-model="formData.expiresAt" clearable placeholder="请选择有效期" />
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">补充说明</div>
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
          <span>已加入内测</span>
          <t-tag theme="primary" variant="light">共 {{ joinedTests.length }} 项</t-tag>
        </div>
      </template>
      <t-table row-key="id" hover :columns="joinedTestColumns" :data="pagedJoinedTests" :pagination="null">
        <template #invite="{ row }">
          <div class="system-manage-name-cell">
            <strong>{{ row.inviteTitle }}</strong>
            <small>{{ row.inviteId }}</small>
          </div>
        </template>
        <template #appPlatforms="{ row }">
          <div class="system-manage-name-cell">
            <strong>{{ row.appName }}</strong>
            <small>{{ row.platforms?.length ? row.platforms.join(' / ') : '-' }}</small>
          </div>
        </template>
        <template #notify="{ row }">
          <t-space size="small">
            <t-tag v-if="row.notifyByEmail" variant="light">邮件</t-tag>
            <t-tag v-if="row.notifyBySms" variant="light">短信</t-tag>
            <span v-if="!row.notifyByEmail && !row.notifyBySms">-</span>
          </t-space>
        </template>
        <template #operation="{ row }">
          <t-dropdown :options="joinedTestOperationOptions" trigger="click" @click="handleJoinedTestOperation($event, row)">
            <t-button theme="primary" variant="text">
              操作
              <template #suffix>
                <chevron-down-icon />
              </template>
            </t-button>
          </t-dropdown>
        </template>
      </t-table>
      <div class="system-manage-pagination">
        <t-pagination
          v-model:current="joinedTestPage"
          :total="joinedTests.length"
          :page-size="joinedTestPageSize"
          :show-jumper="false"
          :show-page-size="false"
          show-total
        />
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
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
  MessagePlugin,
  Option as TOption,
  Pagination as TPagination,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag,
  Table as TTable,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import { createBetaUser, findBetaUser, getBetaUserJoinedTests, removeBetaUserJoinedTest, updateBetaUser } from '../../config/betaUsers'
import { readMobileApps } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const isCreateMode = computed(() => route.name === 'mobile-app-beta-user-create')
const pageTitle = computed(() => isCreateMode.value ? '新建内测用户' : '编辑内测用户')
const pageDescription = computed(() => isCreateMode.value
  ? '填写用户、内测应用和有效期后加入业务侧内测名单。'
  : '维护业务侧内测用户的访问状态、内测应用和有效期。')

const currentRow = ref(findBetaUser(route.params.id))
const mobileApps = computed(() => readMobileApps())
const appNameOptions = computed(() => [...new Set(mobileApps.value.map((app) => app.name))])
const joinedTests = computed(() => getBetaUserJoinedTests(currentRow.value))
const joinedTestPage = ref(1)
const joinedTestPageSize = 5
const pagedJoinedTests = computed(() => {
  const start = (joinedTestPage.value - 1) * joinedTestPageSize
  return joinedTests.value.slice(start, start + joinedTestPageSize)
})
const joinedTestOperationOptions = [{ content: '退出', value: 'exit' }]
const joinedTestColumns = [
  { colKey: 'invite', title: '内测邀请', minWidth: 220 },
  { colKey: 'appPlatforms', title: '应用平台', minWidth: 180 },
  { colKey: 'versionLabel', title: '指定版本', minWidth: 180 },
  { colKey: 'joinedAt', title: '加入时间', width: 170 },
  { colKey: 'notify', title: '通知方式', width: 130 },
  { colKey: 'operation', title: '操作', width: 100, fixed: 'right' }
]
const formData = reactive({
  userName: currentRow.value?.userName || '',
  account: currentRow.value?.account || '',
  phone: currentRow.value?.phone || '',
  appNames: currentRow.value?.appNames?.length ? currentRow.value.appNames : [currentRow.value?.appName || 'Privacy Gen'].filter(Boolean),
  status: currentRow.value?.status || 'enabled',
  expiresAt: currentRow.value?.expiresAt || '',
  remark: currentRow.value?.remark || ''
})

function goBack () {
  router.push({ name: 'mobile-app-beta-users' })
}

function handleSubmit () {
  if (!formData.userName.trim() || !formData.account.trim() || !formData.appNames.length || !formData.expiresAt) {
    MessagePlugin.warning('请填写用户名称、登录账号、内测应用和有效期')
    return
  }
  const payload = {
    ...formData,
    appName: formData.appNames[0] || '',
    platforms: currentRow.value?.platforms || [],
    versionId: currentRow.value?.versionId || 'all',
    templateId: currentRow.value?.templateId,
    joinedTests: currentRow.value?.joinedTests || []
  }
  if (isCreateMode.value) {
    createBetaUser(payload)
  } else {
    updateBetaUser(route.params.id, payload)
  }
  MessagePlugin.success(isCreateMode.value ? '内测用户已创建' : '内测用户已保存')
  goBack()
}

function handleJoinedTestOperation (option, row) {
  if (option?.value !== 'exit') return
  const updated = removeBetaUserJoinedTest(route.params.id, row.id)
  if (!updated) {
    MessagePlugin.warning('退出失败，未找到该内测记录')
    return
  }
  currentRow.value = updated
  const maxPage = Math.max(Math.ceil(joinedTests.value.length / joinedTestPageSize), 1)
  if (joinedTestPage.value > maxPage) joinedTestPage.value = maxPage
  MessagePlugin.success('已退出该内测')
}
</script>
