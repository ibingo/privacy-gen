<template>
  <div class="i18n-tool-page">
    <section class="overview-section">
      <div class="i18n-import-layout">
        <t-alert theme="info" message="导入文件会先进入校验队列，完成后可在下方查看报告或重新导入。" />
      </div>

      <div class="i18n-import-filter-bar">
        <t-input v-model="keyword" class="i18n-import-search" clearable placeholder="搜索文件名、语种或标签">
          <template #suffix-icon><search-icon /></template>
        </t-input>
        <t-select v-model="formatFilter" class="i18n-import-filter-select" clearable placeholder="格式">
          <t-option v-for="format in formatOptions" :key="format" :value="format" :label="format" />
        </t-select>
        <t-select v-model="localeFilter" class="i18n-import-filter-select" clearable placeholder="语种">
          <t-option v-for="locale in rowLocaleOptions" :key="locale" :value="locale" :label="locale" />
        </t-select>
        <t-select v-model="statusFilter" class="i18n-import-filter-select" clearable placeholder="校验结果">
          <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
        </t-select>
        <t-select v-model="tagFilter" class="i18n-import-filter-select" clearable placeholder="标签">
          <t-option v-for="tag in tagOptions" :key="tag" :value="tag" :label="tag" />
        </t-select>
        <t-button class="i18n-import-filter-action" theme="primary" @click="openImportDialog">
          <template #icon><cloud-upload-icon /></template>
          导入文件
        </t-button>
      </div>

      <t-table row-key="id" hover :columns="columns" :data="filteredRows" :pagination="pagination">
        <template #tags="{ row }">
          <div class="i18n-import-tags-cell">
            <t-tag v-for="tag in row.tags" :key="tag" size="small" variant="light">{{ tag }}</t-tag>
            <span v-if="!row.tags?.length">-</span>
          </div>
        </template>
        <template #status="{ row }">
          <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
        </template>
        <template #operation>
          <t-space size="small">
            <t-button theme="primary" variant="text">查看报告</t-button>
            <t-button theme="primary" variant="text">重新导入</t-button>
          </t-space>
        </template>
      </t-table>
    </section>

    <t-dialog
      v-model:visible="importDialogVisible"
      header="导入文件"
      width="860px"
      confirm-btn="导入"
      cancel-btn="取消"
      :close-on-overlay-click="true"
      @confirm="importFiles"
      @cancel="closeImportDialog"
      @close="closeImportDialog"
    >
      <div class="i18n-import-preflight-dialog">
        <t-alert theme="info">
          上传资源文件后，按文件选择语种，并配置本次导入的标签和覆盖策略。
          <span class="i18n-import-supported-inline">
            支持类型：
            <t-popup
              v-for="item in supportedFileTypes"
              :key="item.label"
              trigger="hover"
              placement="top"
              overlay-inner-class-name="i18n-import-format-popup"
            >
              <t-tag class="i18n-import-format-tag" size="small" variant="light">{{ item.label }}</t-tag>
              <template #content>
                <div class="i18n-import-format-example">
                  <strong>{{ item.label }}</strong>
                  <code>{{ item.example }}</code>
                </div>
              </template>
            </t-popup>
          </span>
        </t-alert>

        <div class="i18n-import-dialog-grid">
          <div class="i18n-import-dialog-upload-panel">
            <label
              class="i18n-import-upload"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <input
                class="i18n-import-upload-input"
                type="file"
                multiple
                accept=".json,.strings,.xml,.csv,.arb,.yaml,.yml,.properties,.ini,.xlsx"
                @change="handleFileChange"
              />
              <cloud-upload-icon class="i18n-import-upload-icon" />
              <strong>点击或拖入文件到此区域上传</strong>
              <span>支持批量上传，文件语种可在右侧逐个调整</span>
            </label>

            <div v-if="selectedFiles.length" class="i18n-import-file-list">
              <div v-for="file in selectedFiles" :key="file.id" class="i18n-import-file-row">
                <div class="i18n-import-file-name">
                  <file-icon />
                  <span>{{ file.name }}</span>
                </div>
                <t-tag variant="light">{{ getFileFormat(file.name) }}</t-tag>
                <t-button
                  theme="danger"
                  variant="text"
                  shape="square"
                  title="移除文件"
                  @click="removeSelectedFile(file.id)"
                >
                  <template #icon><close-circle-icon /></template>
                </t-button>
              </div>
            </div>

            <div v-else class="i18n-import-empty-files">尚未选择文件</div>
          </div>

          <div class="i18n-import-dialog-options">
            <strong>导入配置</strong>
            <div class="i18n-import-dialog-file-list">
              <div v-for="file in selectedFiles" :key="file.id" class="i18n-import-dialog-file-row">
                <div class="i18n-import-file-name">
                  <file-icon />
                  <span>{{ file.name }}</span>
                </div>
                <t-select v-model="file.locale" class="i18n-import-file-locale" filterable placeholder="选择语种">
                  <t-option
                    v-for="locale in localeOptions"
                    :key="locale.value"
                    :value="locale.value"
                    :label="locale.shortLabel || locale.label"
                  />
                </t-select>
              </div>
              <div v-if="!selectedFiles.length" class="i18n-import-option-empty">上传文件后在这里设置文件语种</div>
            </div>

            <t-form class="i18n-import-preflight-form" :data="preflightForm" label-align="top">
              <t-form-item label="添加标签">
                <t-select
                  v-model="preflightForm.tags"
                  multiple
                  filterable
                  creatable
                  clearable
                  placeholder="选择或输入标签"
                >
                  <t-option v-for="tag in tagOptions" :key="tag" :value="tag" :label="tag" />
                </t-select>
              </t-form-item>

              <div class="i18n-import-preflight-checks">
                <t-checkbox v-model="preflightForm.overwrite">是否覆盖</t-checkbox>
                <t-checkbox v-model="preflightForm.convertPlaceholders">转换为通用占位符</t-checkbox>
              </div>
            </t-form>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { CloseCircleIcon, CloudUploadIcon, FileIcon, SearchIcon } from 'tdesign-icons-vue-next'
import {
  Alert as TAlert,
  Button as TButton,
  Checkbox as TCheckbox,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Popup as TPopup,
  Select as TSelect,
  Space as TSpace,
  Table as TTable,
  Tag as TTag
} from 'tdesign-vue-next'
import { i18nLocaleOptions, readI18nSettings } from '../../config/i18nSettings'

const settings = readI18nSettings()
const localeOptions = [
  getLocaleMeta(settings.sourceLocale),
  ...settings.targetLocales.map(getLocaleMeta)
]
const selectedFiles = ref([])
const importDialogVisible = ref(false)
const keyword = ref('')
const formatFilter = ref('')
const localeFilter = ref('')
const statusFilter = ref('')
const tagFilter = ref('')
const preflightForm = reactive({
  tags: [],
  overwrite: false,
  convertPlaceholders: false
})
const importRows = ref([
  { id: 'import-001', name: 'privacy-word-20260508.xlsx', format: 'XLSX', locale: '英语', tags: ['Web'], status: '校验通过', statusTone: 'success', createdAt: '2026-05-08 11:22' },
  { id: 'import-002', name: 'agreement-ja.json', format: 'JSON', locale: '日语', tags: ['App'], status: '待修复', statusTone: 'warning', createdAt: '2026-05-08 10:04' },
  { id: 'import-003', name: 'global-word.csv', format: 'CSV', locale: '中文', tags: [], status: '导入中', statusTone: 'processing', createdAt: '2026-05-07 18:31' }
])
const supportedFileTypes = [
  { label: 'Key-Value JSON (.json)', example: '{"common_confirm":"确认","common_cancel":"取消"}' },
  { label: 'Apple Strings (.strings)', example: '"common_confirm" = "确认";' },
  { label: 'Android String Resources (.xml)', example: '<string name="common_confirm">确认</string>' },
  { label: 'CSV (.csv)', example: 'common_confirm,确认,確認,Confirm,APP' },
  { label: 'Flutter ARB (.arb)', example: '{"common_confirm":"确认","@common_confirm":{"description":"确认按钮"}}' },
  { label: 'YAML (.yaml)', example: 'common_confirm: 确认' },
  { label: 'Java Properties (.properties)', example: 'common_confirm=确认' },
  { label: 'INI (.ini)', example: 'common_confirm=确认' },
  { label: 'Excel (.xlsx)', example: 'Key | zh-Hans | zh-Hant | en | 平台' },
  { label: 'i18next JSON (.json)', example: '{"common":{"confirm":"确认"}}' }
]
const baseTagOptions = ['APP', 'Web', 'Android', 'iOS', 'H5', 'MiniApp']
const tagOptions = computed(() => [...new Set([...baseTagOptions, ...importRows.value.flatMap((item) => item.tags || [])])])
const formatOptions = computed(() => [...new Set(importRows.value.map((item) => item.format).filter(Boolean))])
const rowLocaleOptions = computed(() => [...new Set(importRows.value.map((item) => item.locale).filter(Boolean))])
const statusOptions = computed(() => [...new Set(importRows.value.map((item) => item.status).filter(Boolean))])
const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return importRows.value.filter((item) => {
    const tags = item.tags || []
    const searchableText = [item.name, item.format, item.locale, item.status, ...tags].join(' ').toLowerCase()
    const matchKeyword = !q || searchableText.includes(q)
    const matchFormat = !formatFilter.value || item.format === formatFilter.value
    const matchLocale = !localeFilter.value || item.locale === localeFilter.value
    const matchStatus = !statusFilter.value || item.status === statusFilter.value
    const matchTag = !tagFilter.value || tags.includes(tagFilter.value)
    return matchKeyword && matchFormat && matchLocale && matchStatus && matchTag
  })
})
const columns = [
  { colKey: 'name', title: '文件名', minWidth: 260 },
  { colKey: 'format', title: '格式', width: 120 },
  { colKey: 'locale', title: '语种', width: 120 },
  { colKey: 'tags', title: '标签', minWidth: 160 },
  { colKey: 'status', title: '校验结果', width: 140 },
  { colKey: 'createdAt', title: '导入时间', width: 180 },
  { colKey: 'operation', title: '操作', width: 180, fixed: 'right' }
]
const pagination = computed(() => ({
  defaultCurrent: 1,
  defaultPageSize: 10,
  total: filteredRows.value.length,
  showJumper: false
}))
const getStatusTheme = (tone) => {
  const themeMap = {
    success: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}

function getLocaleMeta (localeValue) {
  return i18nLocaleOptions.find((item) => item.value === localeValue) || {
    value: localeValue,
    label: localeValue,
    shortLabel: localeValue
  }
}

function handleFileChange (event) {
  addFiles(Array.from(event.target.files || []))
  event.target.value = ''
}

function handleDrop (event) {
  addFiles(Array.from(event.dataTransfer?.files || []))
}

function addFiles (files) {
  const nextFiles = files.map((file) => ({
    id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
    name: file.name,
    size: file.size,
    locale: settings.sourceLocale
  }))
  selectedFiles.value = [...selectedFiles.value, ...nextFiles]
}

function removeSelectedFile (id) {
  selectedFiles.value = selectedFiles.value.filter((file) => file.id !== id)
}

function openImportDialog () {
  importDialogVisible.value = true
}

function closeImportDialog () {
  importDialogVisible.value = false
}

function importFiles () {
  if (!selectedFiles.value.length) {
    MessagePlugin.warning('请先上传文件')
    return
  }

  const missingLocale = selectedFiles.value.some((file) => !file.locale)
  if (missingLocale) {
    MessagePlugin.warning('请为每个文件选择语种')
    return
  }

  const rows = selectedFiles.value.map((file) => {
    const locale = getLocaleMeta(file.locale)
    return {
      id: `import-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      format: getFileFormat(file.name),
      locale: locale.shortLabel || locale.label,
      tags: [...preflightForm.tags],
      status: preflightForm.overwrite ? '覆盖导入' : '校验通过',
      statusTone: preflightForm.overwrite ? 'warning' : 'success',
      createdAt: '2026-05-27 00:00'
    }
  })
  importRows.value = [...rows, ...importRows.value]
  selectedFiles.value = []
  importDialogVisible.value = false
  MessagePlugin.success(`已提交 ${rows.length} 个文件导入`)
}

function getFileFormat (name) {
  const extension = name.split('.').pop()?.toUpperCase() || '-'
  if (extension === 'STRINGS') return 'iOS'
  if (extension === 'XML') return 'XML'
  if (extension === 'YML') return 'YAML'
  return extension
}
</script>
