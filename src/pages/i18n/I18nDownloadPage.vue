<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="国际化资源下载"
    :show-breadcrumb="false"
    :summary-text="`共 ${filteredRows.length} 项`"
    primary-action="生成资源包"
    :columns="columns"
    :data="filteredRows"
    search-placeholder="搜索资源包、语种或命名空间"
    @primary="generatePackage"
  >
    <template #filters>
      <t-select v-model="platformFilter" class="starter-list-filter-select" placeholder="平台">
        <t-option value="all" label="全部平台" />
        <t-option v-for="platform in platformOptions" :key="platform" :value="platform" :label="platform" />
      </t-select>
      <t-select v-model="environmentFilter" class="starter-list-filter-select" placeholder="环境">
        <t-option value="all" label="全部环境" />
        <t-option v-for="environment in environmentOptions" :key="environment" :value="environment" :label="environment" />
      </t-select>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="状态">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
      </t-select>
    </template>

    <template #name="{ row }">
      <div class="i18n-download-name-cell">
        <strong>{{ row.name }}</strong>
        <small>{{ row.description }}</small>
      </div>
    </template>

    <template #locales="{ row }">
      <div class="i18n-download-tag-cell">
        <t-tag v-for="locale in row.locales" :key="locale" size="small" variant="light">{{ locale }}</t-tag>
      </div>
    </template>

    <template #namespaces="{ row }">
      <div class="i18n-download-tag-cell">
        <t-tag v-for="namespace in row.namespaces" :key="namespace" size="small" variant="light">{{ namespace }}</t-tag>
      </div>
    </template>

    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
    </template>

    <template #operation="{ row }">
      <t-space size="small">
        <t-button theme="primary" variant="text" @click.stop="downloadPackage(row)">下载</t-button>
        <t-button theme="primary" variant="text">复制链接</t-button>
      </t-space>
    </template>
  </starter-list-page>

  <t-dialog
    v-model:visible="generateDialogVisible"
    header="生成资源包"
    width="560px"
    :confirm-btn="null"
    :cancel-btn="null"
    destroy-on-close
    @close="closeGenerateDialog"
  >
    <t-form class="i18n-download-generate-form" :data="generateForm" label-align="right" label-width="112px">
      <t-form-item label="平台" required-mark>
        <t-select v-model="generateForm.platform" placeholder="请选择平台">
          <t-option v-for="platform in generatePlatformOptions" :key="platform.value" :value="platform.value" :label="platform.label" />
        </t-select>
      </t-form-item>

      <t-form-item label="文件格式" required-mark>
        <t-select v-model="generateForm.fileFormat" placeholder="请选择文件格式">
          <t-option v-for="format in fileFormatOptions" :key="format.value" :value="format.value" :label="format.label" />
        </t-select>
      </t-form-item>

      <t-form-item label="占位符格式">
        <t-select v-model="generateForm.placeholderFormat" placeholder="请选择占位符格式">
          <t-option v-for="format in placeholderFormatOptions" :key="format.value" :value="format.value" :label="format.label" />
        </t-select>
      </t-form-item>

      <t-form-item label="语种">
        <t-select v-model="generateForm.locales" multiple placeholder="请选择语种">
          <t-option v-for="locale in localeOptions" :key="locale.value" :value="locale.value" :label="locale.label" />
        </t-select>
      </t-form-item>

      <t-form-item label="标签">
        <t-select v-model="generateForm.tags" multiple filterable creatable placeholder="选择或输入标签">
          <t-option v-for="tag in tagOptions" :key="tag" :value="tag" :label="tag" />
        </t-select>
      </t-form-item>

      <t-form-item>
        <t-button theme="primary" @click="submitGeneratePackage">下载</t-button>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Button as TButton,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'

const keyword = ref('')
const platformFilter = ref('all')
const environmentFilter = ref('all')
const statusFilter = ref('all')
const generateDialogVisible = ref(false)

const defaultGenerateForm = () => ({
  platform: 'all',
  fileFormat: 'key-value-json',
  placeholderFormat: 'raw',
  locales: [],
  tags: []
})

const generateForm = ref(defaultGenerateForm())

const rows = [
  {
    id: 'download-001',
    name: '全量资源包',
    description: '包含所有已启用语种与全部命名空间。',
    platform: '全部平台',
    environment: '生产环境',
    locales: ['zh-Hans', 'zh-Hant', 'en', 'ja'],
    namespaces: ['common', 'privacy', 'agreement'],
    format: 'ZIP',
    size: '2.4 MB',
    status: '可下载',
    statusTone: 'success',
    updatedAt: '2026-05-08 11:10'
  },
  {
    id: 'download-002',
    name: '移动端资源包',
    description: '导出 Android / iOS 使用的核心文案。',
    platform: 'App',
    environment: '预发环境',
    locales: ['zh-Hans', 'en'],
    namespaces: ['mobile', 'privacy'],
    format: 'JSON',
    size: '856 KB',
    status: '可下载',
    statusTone: 'success',
    updatedAt: '2026-05-08 10:42'
  },
  {
    id: 'download-003',
    name: '海外语言包',
    description: '仅包含英语、日语、韩语与东南亚语种。',
    platform: 'Web',
    environment: '生产环境',
    locales: ['en', 'ja', 'ko', 'th'],
    namespaces: ['global', 'checkout'],
    format: 'i18next JSON',
    size: '1.1 MB',
    status: '生成中',
    statusTone: 'processing',
    updatedAt: '2026-05-07 17:28'
  },
  {
    id: 'download-004',
    name: '小程序资源包',
    description: '微信小程序侧使用的精简文案。',
    platform: 'MiniApp',
    environment: '测试环境',
    locales: ['zh-Hans'],
    namespaces: ['miniapp'],
    format: 'JSON',
    size: '320 KB',
    status: '待生成',
    statusTone: 'warning',
    updatedAt: '2026-05-07 15:12'
  }
]

const columns = [
  { colKey: 'name', title: '资源包', minWidth: 280 },
  { colKey: 'platform', title: '平台', width: 120 },
  { colKey: 'environment', title: '环境', width: 120 },
  { colKey: 'locales', title: '语种', minWidth: 180 },
  { colKey: 'namespaces', title: '命名空间', minWidth: 180 },
  { colKey: 'format', title: '格式', width: 120 },
  { colKey: 'size', title: '大小', width: 100 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'updatedAt', title: '更新时间', width: 170 },
  { colKey: 'operation', title: '操作', width: 150, fixed: 'right' }
]

const platformOptions = [...new Set(rows.map((item) => item.platform))]
const environmentOptions = [...new Set(rows.map((item) => item.environment))]
const statusOptions = [...new Set(rows.map((item) => item.status))]
const generatePlatformOptions = [
  { label: '全部平台', value: 'all' },
  { label: 'App', value: 'app' },
  { label: 'Web', value: 'web' },
  { label: 'MiniApp', value: 'miniapp' }
]
const fileFormatOptions = [
  { label: 'Key-Value JSON (.json)', value: 'key-value-json' },
  { label: 'Nested JSON (.json)', value: 'nested-json' },
  { label: 'Android XML (.xml)', value: 'android-xml' },
  { label: 'iOS Strings (.strings)', value: 'ios-strings' },
  { label: 'i18next JSON (.json)', value: 'i18next-json' }
]
const placeholderFormatOptions = [
  { label: 'Raw（原始格式）', value: 'raw' },
  { label: 'Android（%1$s）', value: 'android' },
  { label: 'iOS（%@）', value: 'ios' },
  { label: 'ICU MessageFormat', value: 'icu' }
]
const localeOptions = [
  { label: '所有语种', value: 'all' },
  { label: '简体中文（zh-Hans）', value: 'zh-Hans' },
  { label: '繁体中文（zh-Hant）', value: 'zh-Hant' },
  { label: '英语（en）', value: 'en' },
  { label: '日语（ja）', value: 'ja' },
  { label: '韩语（ko）', value: 'ko' },
  { label: '泰语（th）', value: 'th' }
]
const tagOptions = ['common', 'privacy', 'agreement', 'mobile', 'global', 'checkout', 'miniapp']

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.filter((item) => {
    const searchableText = [
      item.name,
      item.description,
      item.platform,
      item.environment,
      item.format,
      ...item.locales,
      ...item.namespaces
    ].join(' ').toLowerCase()
    const matchKeyword = !q || searchableText.includes(q)
    const matchPlatform = platformFilter.value === 'all' || item.platform === platformFilter.value
    const matchEnvironment = environmentFilter.value === 'all' || item.environment === environmentFilter.value
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    return matchKeyword && matchPlatform && matchEnvironment && matchStatus
  })
})

function generatePackage () {
  generateDialogVisible.value = true
}

function closeGenerateDialog () {
  generateDialogVisible.value = false
}

function submitGeneratePackage () {
  if (!generateForm.value.platform || !generateForm.value.fileFormat) {
    MessagePlugin.warning('请选择平台和文件格式')
    return
  }
  MessagePlugin.success('已提交资源包生成任务')
  closeGenerateDialog()
}

function downloadPackage (row) {
  if (row.status !== '可下载') {
    MessagePlugin.warning('资源包尚未生成完成')
    return
  }
  MessagePlugin.success(`开始下载 ${row.name}`)
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
