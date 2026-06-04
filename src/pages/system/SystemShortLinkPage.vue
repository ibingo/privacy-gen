<template>
  <div class="system-manage-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>短链接管理</h3>
        <p>查看短链接目标地址、访问次数、启用状态和过期状态。</p>
      </div>
      <t-button theme="primary" @click="openCreateDialog">
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
          <t-tag theme="primary" variant="light">共 {{ total }} 项</t-tag>
        </div>
      </template>
      <template #actions>
        <t-space class="system-manage-filter" :break-line="true">
          <t-input
            v-model="keyword"
            class="system-manage-search"
            placeholder="搜索编码、短链、目标地址"
            clearable
            @enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix-icon>
              <search-icon />
            </template>
          </t-input>
          <t-select v-model="enabledFilter" class="system-manage-status-filter" @change="handleSearch">
            <t-option value="all" label="全部启用状态" />
            <t-option value="true" label="启用" />
            <t-option value="false" label="停用" />
          </t-select>
          <t-select v-model="expiredFilter" class="system-manage-status-filter" @change="handleSearch">
            <t-option value="all" label="全部过期状态" />
            <t-option value="true" label="已过期" />
            <t-option value="false" label="未过期" />
          </t-select>
          <t-button theme="primary" @click="handleSearch">查询</t-button>
          <t-button variant="outline" @click="handleReset">重置</t-button>
        </t-space>
      </template>

      <t-table
        row-key="code"
        hover
        :columns="columns"
        :data="rows"
        :loading="loading"
      >
        <template #code="{ row }">
          <div class="system-manage-name-cell">
            <strong>{{ row.code }}</strong>
            <small>{{ row.shortPath }}</small>
          </div>
        </template>

        <template #shortUrl="{ row }">
          <a class="system-short-link-url" :href="row.shortUrl" target="_blank" rel="noreferrer">{{ row.shortUrl }}</a>
        </template>

        <template #targetUrl="{ row }">
          <span class="system-short-link-target">{{ row.targetUrl }}</span>
        </template>

        <template #enabled="{ row }">
          <t-tag :theme="row.enabled ? 'success' : 'default'" variant="light">
            {{ row.enabled ? '启用' : '停用' }}
          </t-tag>
        </template>

        <template #expired="{ row }">
          <t-tag :theme="row.expired ? 'warning' : 'success'" variant="light">
            {{ row.expired ? '已过期' : '未过期' }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <t-space size="small">
            <t-button theme="primary" variant="text" @click="copyText(row.shortUrl)">复制短链</t-button>
          </t-space>
        </template>
      </t-table>

      <div class="system-manage-pagination">
        <t-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-size-options="[10, 20, 50]"
          :show-jumper="false"
          :show-page-size="true"
          @current-change="fetchRows"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </t-card>

    <t-dialog
      v-model:visible="createDialogVisible"
      header="新建短链接"
      width="640px"
      :close-on-overlay-click="false"
      :confirm-btn="{ content: '创建', theme: 'primary', loading: saving }"
      cancel-btn="取消"
      @confirm="handleCreate"
      @cancel="closeCreateDialog"
      @close="closeCreateDialog"
    >
      <t-form ref="createFormRef" :data="createForm" :rules="rules" label-align="top" class="system-short-link-form">
        <div class="system-short-link-form-grid">
          <t-form-item label="目标地址" name="targetUrl">
            <t-input v-model="createForm.targetUrl" clearable placeholder="请输入目标地址" />
          </t-form-item>
          <t-form-item label="短链接编码" name="code">
            <t-input v-model="createForm.code" clearable placeholder="点击生成或手动输入" />
          </t-form-item>
          <t-form-item label="有效期" name="neverExpire">
            <t-switch v-model="createForm.neverExpire" :label="['永不过期', '设置过期']" @change="handleNeverExpireChange" />
          </t-form-item>
          <t-form-item label="过期时间" name="expiresAt">
            <t-date-picker
              v-model="createForm.expiresAt"
              clearable
              :disabled="createForm.neverExpire"
              enable-time-picker
              format="YYYY-MM-DD HH:mm"
              value-type="YYYY-MM-DDTHH:mm:ss.sssZ"
              :placeholder="createForm.neverExpire ? '永不过期' : '请选择过期时间'"
            />
          </t-form-item>
          <t-form-item label="TTL（秒）" name="ttlSeconds">
            <t-input-number
              v-model="createForm.ttlSeconds"
              :disabled="createForm.neverExpire"
              :min="0"
              :step="1"
              placeholder="可选"
            />
          </t-form-item>
          <t-form-item label="密码校验" name="passwordEnabled">
            <t-switch v-model="createForm.passwordEnabled" :label="['开启', '关闭']" @change="handlePasswordEnabledChange" />
          </t-form-item>
          <t-form-item v-if="createForm.passwordEnabled" label="访问密码" name="password">
            <t-input
              v-model="createForm.password"
              clearable
              maxlength="4"
              placeholder="请输入 4 位数字或字母"
              type="password"
            />
          </t-form-item>
          <t-form-item label="启用状态" name="enabled">
            <t-switch v-model="createForm.enabled" :label="['启用', '停用']" />
          </t-form-item>
          <t-form-item label="随机生成 code">
            <t-space size="small">
              <t-input-number v-model="generateForm.length" :min="4" :max="64" :step="1" style="width: 132px" />
              <t-select v-model="generateForm.complexity" style="width: 146px">
                <t-option value="numeric" label="数字" />
                <t-option value="lower" label="小写字母" />
                <t-option value="mixed" label="字母数字" />
                <t-option value="strong" label="强复杂度" />
              </t-select>
              <t-switch v-model="generateForm.excludeAmbiguous" :label="['排除歧义字符', '包含歧义字符']" />
              <t-button variant="outline" :loading="generatingCode" @click="handleGenerateCode">生成</t-button>
            </t-space>
          </t-form-item>
        </div>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Button as TButton,
  Card as TCard,
  DatePicker as TDatePicker,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  InputNumber as TInputNumber,
  MessagePlugin,
  Option as TOption,
  Pagination as TPagination,
  Select as TSelect,
  Space as TSpace,
  Table as TTable,
  Tag as TTag,
  Switch as TSwitch
} from 'tdesign-vue-next'
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next'
import { getManagementResource } from '../../api/management'

const keyword = ref('')
const enabledFilter = ref('all')
const expiredFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const rows = ref([])
const loading = ref(false)
const createDialogVisible = ref(false)
const saving = ref(false)
const generatingCode = ref(false)
const createFormRef = ref()
const createForm = reactive({
  targetUrl: '',
  code: '',
  expiresAt: '',
  ttlSeconds: 0,
  neverExpire: true,
  passwordEnabled: false,
  password: '',
  enabled: true
})
const generateForm = reactive({
  length: 8,
  complexity: 'mixed',
  excludeAmbiguous: true
})

const columns = [
  { colKey: 'code', title: '编码 / 短链路径', minWidth: 220 },
  { colKey: 'shortUrl', title: '短链地址', minWidth: 220 },
  { colKey: 'targetUrl', title: '目标地址', minWidth: 280 },
  { colKey: 'visitCount', title: '访问次数', width: 110 },
  { colKey: 'enabled', title: '启用状态', width: 110 },
  { colKey: 'expired', title: '过期状态', width: 110 },
  { colKey: 'lastVisitedAt', title: '最近访问', width: 170 },
  { colKey: 'updatedAt', title: '更新时间', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const resourceApi = computed(() => getManagementResource('system-short-links'))

const rules = {
  targetUrl: [{ required: true, message: '请输入目标地址', type: 'error' }],
  code: [{ required: true, message: '请生成或输入短链接编码', type: 'error' }]
}

const passwordPattern = /^[A-Za-z0-9]{4}$/

const normalizeRow = (item) => ({
  code: item.code || '-',
  shortPath: item.shortPath || '-',
  shortUrl: item.shortUrl || '-',
  targetUrl: item.targetUrl || '-',
  expiresAt: formatDateTime(item.expiresAt),
  enabled: Boolean(item.enabled),
  expired: Boolean(item.expired),
  visitCount: item.visitCount ?? 0,
  lastVisitedAt: formatDateTime(item.lastVisitedAt),
  createdAt: formatDateTime(item.createdAt),
  updatedAt: formatDateTime(item.updatedAt)
})

const formatDateTime = (value) => {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

const buildParams = () => ({
  keyword: keyword.value.trim() || undefined,
  enabled: enabledFilter.value === 'all' ? undefined : enabledFilter.value === 'true',
  expired: expiredFilter.value === 'all' ? undefined : expiredFilter.value === 'true',
  page: currentPage.value - 1,
  pageSize: pageSize.value
})

const fetchRows = async () => {
  const api = resourceApi.value
  if (!api?.list) return

  loading.value = true
  try {
    const data = await api.list(buildParams())
    rows.value = Array.isArray(data?.items) ? data.items.map(normalizeRow) : []
    total.value = data?.total ?? 0
    currentPage.value = (data?.page ?? (currentPage.value - 1)) + 1
    pageSize.value = data?.pageSize || pageSize.value
  } catch (e) {
    MessagePlugin.error(e.message || '加载列表失败')
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const resetCreateForm = () => {
  createForm.targetUrl = ''
  createForm.code = ''
  createForm.expiresAt = ''
  createForm.ttlSeconds = 0
  createForm.neverExpire = true
  createForm.passwordEnabled = false
  createForm.password = ''
  createForm.enabled = true
}

const handleNeverExpireChange = (checked) => {
  if (!checked) return
  createForm.expiresAt = ''
  createForm.ttlSeconds = 0
}

const handlePasswordEnabledChange = (checked) => {
  if (checked) return
  createForm.password = ''
}

const openCreateDialog = () => {
  resetCreateForm()
  createDialogVisible.value = true
}

const closeCreateDialog = () => {
  createDialogVisible.value = false
}

const handleGenerateCode = async () => {
  const api = resourceApi.value
  if (!api?.generateCode) return

  generatingCode.value = true
  try {
    const data = await api.generateCode({
      length: Number(generateForm.length) || 0,
      complexity: generateForm.complexity,
      excludeAmbiguous: generateForm.excludeAmbiguous
    })
    const code = typeof data === 'string' ? data : data?.code || data?.value || ''
    if (!code) {
      MessagePlugin.error('生成结果为空')
      return
    }
    createForm.code = code
    MessagePlugin.success('已生成短链接编码')
  } catch (e) {
    MessagePlugin.error(e.message || '生成短链接编码失败')
  } finally {
    generatingCode.value = false
  }
}

const handleCreate = async () => {
  const api = resourceApi.value
  if (!api?.create) return

  const valid = await createFormRef.value?.validate?.().catch(() => false)
  if (!valid) return

  const password = createForm.password.trim()
  if (createForm.passwordEnabled && !passwordPattern.test(password)) {
    MessagePlugin.warning('访问密码需为 4 位数字或字母')
    return
  }

  saving.value = true
  try {
    await api.create({
      targetUrl: createForm.targetUrl,
      code: createForm.code,
      expiresAt: createForm.neverExpire ? undefined : createForm.expiresAt || undefined,
      ttlSeconds: createForm.neverExpire ? 0 : Number(createForm.ttlSeconds) || 0,
      password: createForm.passwordEnabled ? password : '',
      enabled: createForm.enabled
    })
    MessagePlugin.success('创建成功')
    createDialogVisible.value = false
    await fetchRows()
  } catch (e) {
    MessagePlugin.error(e.message || '创建失败')
  } finally {
    saving.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchRows()
}

const handleReset = () => {
  keyword.value = ''
  enabledFilter.value = 'all'
  expiredFilter.value = 'all'
  currentPage.value = 1
  fetchRows()
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchRows()
}

const copyText = async (text) => {
  if (!text || text === '-') {
    MessagePlugin.warning('暂无可复制的短链接')
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    MessagePlugin.success('已复制短链接')
  } catch (e) {
    MessagePlugin.error('复制失败')
  }
}

watch([keyword, enabledFilter, expiredFilter], () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchRows()
})
</script>

<style scoped>
.system-short-link-url,
.system-short-link-target {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.system-short-link-url {
  color: var(--td-brand-color);
}
</style>
