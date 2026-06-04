<template>
  <div class="system-config-page system-manage-page">
    <t-card class="system-manage-list-card system-config-card" :bordered="false">
      <template #title>
        <div class="system-manage-card-title">
          <span>文件列表</span>
          <t-tag theme="primary" variant="light">{{ ossCode || '未选择配置' }}</t-tag>
        </div>
      </template>
      <template #actions>
        <t-space size="small">
          <t-button variant="outline" @click="router.push({ name: 'system-configs' })">返回配置管理</t-button>
          <t-button theme="primary" :disabled="!ossCode" @click="openUploadDialog">上传</t-button>
          <t-button theme="primary" :loading="loading" @click="fetchFiles()">刷新</t-button>
        </t-space>
      </template>

      <t-alert
        v-if="!ossCode"
        theme="warning"
        message="缺少 ossCode，请从对象存储配置列表进入文件列表。"
      />

      <div class="system-config-panel">
        <t-space class="system-manage-filter system-storage-filter" :break-line="true">
          <t-input
            v-model="filters.prefix"
            class="system-manage-search"
            placeholder="输入目录前缀，例如 uploads/mobile-apps/"
            clearable
            @enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix-icon>
              <search-icon />
            </template>
          </t-input>
          <t-input
            v-model="filters.marker"
            class="system-config-marker-input"
            placeholder="Marker"
            clearable
            @enter="handleSearch"
            @clear="handleSearch"
          />
          <t-select v-model="filters.pageSize" class="system-config-status-filter">
            <t-option :value="50" label="50 条" />
            <t-option :value="100" label="100 条" />
            <t-option :value="200" label="200 条" />
          </t-select>
          <t-button theme="primary" :disabled="!ossCode" @click="handleSearch">查询</t-button>
          <t-button variant="outline" :disabled="!ossCode" @click="resetFilters">重置</t-button>
          <div class="oss-file-view-switch" aria-label="文件列表布局切换">
            <button
              type="button"
              title="网格布局"
              :class="{ 'is-active': viewMode === 'grid' }"
              @click="viewMode = 'grid'"
            >
              <view-module-icon />
            </button>
            <button
              type="button"
              title="表格布局"
              :class="{ 'is-active': viewMode === 'table' }"
              @click="viewMode = 'table'"
            >
              <view-list-icon />
            </button>
          </div>
        </t-space>

        <div v-if="viewMode === 'grid'" class="oss-file-grid">
          <div
            v-for="row in rows"
            :key="row.key"
            class="oss-file-card"
          >
            <span class="oss-file-card-icon">
              <file-icon />
            </span>
            <span class="oss-file-card-main">
              <strong>{{ row.name }}</strong>
              <small>{{ row.key }}</small>
            </span>
            <span class="oss-file-card-meta">
              <span>{{ formatFileSize(row.size) }}</span>
              <span>{{ row.contentType || '-' }}</span>
            </span>
            <span class="oss-file-card-footer">
              <span>{{ formatDateTime(row.updatedAt) }}</span>
              <t-button
                theme="primary"
                variant="text"
                size="small"
                :loading="signingKey === row.key"
                :disabled="Boolean(signingKey) && signingKey !== row.key"
                @click="createTemporaryAccess(row)"
              >
                临时访问
              </t-button>
            </span>
          </div>
          <t-alert
            v-if="!loading && !rows.length"
            theme="default"
            message="暂无文件，请调整查询条件或上传文件。"
          />
        </div>

        <t-table v-else row-key="key" hover :columns="columns" :data="rows" :loading="loading">
          <template #name="{ row }">
            <div class="system-manage-name-cell">
              <strong>{{ row.name }}</strong>
              <small>{{ row.key }}</small>
            </div>
          </template>
          <template #size="{ row }">
            <span>{{ formatFileSize(row.size) }}</span>
          </template>
          <template #updatedAt="{ row }">
            <span>{{ formatDateTime(row.updatedAt) }}</span>
          </template>
          <template #temporaryAccess="{ row }">
            <t-button
              theme="primary"
              variant="text"
              :loading="signingKey === row.key"
              :disabled="Boolean(signingKey) && signingKey !== row.key"
              @click="createTemporaryAccess(row)"
            >
              临时访问
            </t-button>
          </template>
        </t-table>

        <div class="system-config-file-actions">
          <t-button variant="outline" :disabled="!previousMarkers.length || loading" @click="loadPreviousPage">上一页</t-button>
          <t-button theme="primary" :disabled="!nextMarker || loading" @click="loadNextPage">下一页</t-button>
        </div>
      </div>
    </t-card>

    <t-dialog
      v-model:visible="temporaryAccessDialog.visible"
      header="临时访问链接已生成"
      width="640px"
      :confirm-btn="{ content: '打开临时链接', theme: 'primary', disabled: !temporaryAccessDialog.signedUrl }"
      cancel-btn="关闭"
      @confirm="openTemporaryAccessUrl"
    >
      <div class="oss-temporary-access-dialog">
        <t-alert
          theme="success"
          :message="`临时访问链接生成完毕，有效期至 ${formatDateTime(temporaryAccessDialog.expiresAt)}。`"
        />
        <div class="oss-temporary-access-item">
          <span>文件</span>
          <strong>{{ temporaryAccessDialog.objectKey }}</strong>
        </div>
        <div class="oss-temporary-access-item">
          <span>签名链接</span>
          <a :href="temporaryAccessDialog.signedUrl" target="_blank" rel="noopener noreferrer">
            {{ temporaryAccessDialog.signedUrl }}
          </a>
        </div>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="uploadDialogVisible"
      header="上传文件"
      width="780px"
      :confirm-btn="{ content: '上传', theme: 'primary', loading: uploading, disabled: !selectedFile }"
      cancel-btn="取消"
      @confirm="uploadSelectedFile"
      @cancel="closeUploadDialog"
      @close="closeUploadDialog"
    >
      <div class="oss-upload-dialog">
        <div class="oss-upload-steps">
          <div class="oss-upload-step is-done">
            <span>✓</span>
            <strong>选择上传对象</strong>
          </div>
          <div class="oss-upload-step-divider">›</div>
          <div class="oss-upload-step is-active">
            <span>2</span>
            <strong>设置对象属性</strong>
          </div>
        </div>

        <div class="oss-upload-target">
          <span>上传至</span>
          <strong>{{ uploadForm.prefix || '/' }}</strong>
        </div>

        <t-alert
          theme="warning"
          message="若上传路径中存在同名文件，上传将覆盖原有文件。上传操作会产生请求次数和上行流量。"
        />

        <t-form :data="uploadForm" label-align="top" class="oss-upload-form">
          <t-form-item label="上传路径">
            <t-input v-model="uploadForm.prefix" placeholder="例如 mobile/apps/" />
          </t-form-item>
          <t-form-item label="对象名称">
            <t-input v-model="uploadForm.objectName" placeholder="默认使用文件名" />
          </t-form-item>
        </t-form>

        <t-upload
          v-model="uploadFiles"
          class="oss-upload-control"
          theme="file-flow"
          draggable
          :auto-upload="false"
          :multiple="false"
          :max="1"
          :allow-upload-duplicate-file="true"
          :upload-button="null"
          :cancel-upload-button="null"
          trigger-button-text="选择文件"
          drag-content="未选择文件，拖拽文件到此区域或点击选择文件"
          tips="请选择要上传到当前 ossCode 配置下的文件"
          @change="handleUploadFilesChange"
          @remove="handleUploadFileRemove"
        />
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FileIcon, SearchIcon, ViewListIcon, ViewModuleIcon } from 'tdesign-icons-vue-next'
import {
  Alert as TAlert,
  Button as TButton,
  Card as TCard,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Table as TTable,
  Tag as TTag,
  Upload as TUpload
} from 'tdesign-vue-next'
import { listObjectStorageFilesApi, signObjectStorageFileApi, uploadObjectStorageFileApi } from '../../api/objectStorage'

const route = useRoute()
const router = useRouter()

const ossCode = computed(() => String(route.query.ossCode || ''))
const filters = reactive({
  prefix: String(route.query.prefix || ''),
  marker: String(route.query.marker || ''),
  pageSize: Number(route.query.pageSize || 100)
})

const rows = ref([])
const loading = ref(false)
const viewMode = ref('table')
const nextMarker = ref('')
const previousMarkers = ref([])
const signingKey = ref('')
const temporaryAccessDialog = reactive({
  visible: false,
  objectKey: '',
  signedUrl: '',
  expiresAt: ''
})
const uploadDialogVisible = ref(false)
const uploading = ref(false)
const uploadFiles = ref([])
const uploadForm = reactive({
  prefix: '',
  objectName: ''
})
const selectedFile = computed(() => uploadFiles.value[0]?.raw || null)

const columns = [
  { colKey: 'name', title: '文件名', minWidth: 260 },
  { colKey: 'size', title: '大小', width: 120 },
  { colKey: 'contentType', title: '类型', width: 180 },
  { colKey: 'updatedAt', title: '更新时间', width: 170 },
  { colKey: 'temporaryAccess', title: '临时访问', width: 120, fixed: 'right' }
]

const normalizeFile = (item = {}) => {
  const key = item.key || item.objectKey || item.name || item.fileName || item.path || ''
  return {
    fileId: item.fileId || item.id || item.file_id || '',
    key,
    name: item.name || item.fileName || key.split('/').filter(Boolean).pop() || key || '-',
    size: item.size ?? item.fileSize ?? item.contentLength ?? 0,
    contentType: item.contentType || item.mimeType || item.type || '-',
    updatedAt: item.updatedAt || item.lastModified || item.lastModifiedTime || item.modifiedAt || '',
    url: item.url || item.downloadUrl || item.accessUrl || ''
  }
}

function syncRouteQuery () {
  router.replace({
    name: 'object-storage-file-list',
    query: {
      ossCode: ossCode.value,
      prefix: filters.prefix || undefined,
      marker: filters.marker || undefined,
      pageSize: filters.pageSize
    }
  })
}

async function fetchFiles ({ keepHistory = false } = {}) {
  if (!ossCode.value) return
  loading.value = true
  try {
    const data = await listObjectStorageFilesApi({
      ossCode: ossCode.value,
      prefix: filters.prefix || null,
      marker: filters.marker || null,
      pageSize: filters.pageSize || 100
    })
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.files)
        ? data.files
        : Array.isArray(data?.list)
          ? data.list
          : []
    rows.value = items.map(normalizeFile)
    nextMarker.value = data?.nextMarker || data?.nextContinuationToken || data?.nextPageMarker || ''
    if (!keepHistory) previousMarkers.value = []
    syncRouteQuery()
  } catch (error) {
    MessagePlugin.error(error.message || '对象存储文件列表加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch () {
  previousMarkers.value = []
  fetchFiles()
}

function resetFilters () {
  filters.prefix = ''
  filters.marker = ''
  filters.pageSize = 100
  previousMarkers.value = []
  fetchFiles()
}

function loadNextPage () {
  if (!nextMarker.value) return
  previousMarkers.value.push(filters.marker || '')
  filters.marker = nextMarker.value
  fetchFiles({ keepHistory: true })
}

function loadPreviousPage () {
  if (!previousMarkers.value.length) return
  filters.marker = previousMarkers.value.pop() || ''
  fetchFiles({ keepHistory: true })
}

function openFile (url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

async function createTemporaryAccess (row) {
  if (!ossCode.value) {
    MessagePlugin.warning('缺少 ossCode，无法生成临时访问链接')
    return
  }
  if (!row?.fileId) {
    MessagePlugin.warning('缺少文件 fileId，无法生成临时访问链接')
    return
  }
  signingKey.value = row.key
  try {
    const data = await signObjectStorageFileApi({
      fileId: row.fileId,
      ossCode: ossCode.value,
      expiresSeconds: 180
    })
    temporaryAccessDialog.objectKey = row.key
    temporaryAccessDialog.signedUrl = data?.signedUrl || data?.url || ''
    temporaryAccessDialog.expiresAt = data?.expiresAt || ''
    temporaryAccessDialog.visible = true
    if (!temporaryAccessDialog.signedUrl) {
      MessagePlugin.warning('临时访问链接已生成，但响应中缺少 signedUrl')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '临时访问链接生成失败')
  } finally {
    signingKey.value = ''
  }
}

function openTemporaryAccessUrl () {
  if (!temporaryAccessDialog.signedUrl) return
  openFile(temporaryAccessDialog.signedUrl)
}

function openUploadDialog () {
  uploadForm.prefix = filters.prefix || ''
  uploadForm.objectName = ''
  uploadFiles.value = []
  uploadDialogVisible.value = true
}

function closeUploadDialog () {
  if (uploading.value) return
  uploadDialogVisible.value = false
}

function handleUploadFilesChange (files) {
  uploadFiles.value = files.slice(-1)
  const file = uploadFiles.value[0]?.raw
  if (file && !uploadForm.objectName.trim()) {
    uploadForm.objectName = file.name
  }
}

function handleUploadFileRemove () {
  uploadFiles.value = []
  uploadForm.objectName = ''
}

async function uploadSelectedFile () {
  if (!ossCode.value) {
    MessagePlugin.warning('缺少 ossCode，无法上传文件')
    return
  }
  if (!selectedFile.value) {
    MessagePlugin.warning('请选择要上传的文件')
    return
  }
  const formData = new FormData()
  formData.append('ossCode', ossCode.value)
  formData.append('path', uploadForm.prefix.trim())
  formData.append('objectName', uploadForm.objectName.trim() || selectedFile.value.name)
  formData.append('file', selectedFile.value)

  uploading.value = true
  try {
    await uploadObjectStorageFileApi(formData)
    MessagePlugin.success('文件上传成功')
    uploadDialogVisible.value = false
    filters.prefix = uploadForm.prefix.trim()
    await fetchFiles()
  } catch (error) {
    MessagePlugin.error(error.message || '文件上传失败')
  } finally {
    uploading.value = false
  }
}

function formatFileSize (value) {
  const size = Number(value) || 0
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
}

function formatDateTime (value) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
}

watch(
  () => route.query,
  (query) => {
    filters.prefix = String(query.prefix || '')
    filters.marker = String(query.marker || '')
    filters.pageSize = Number(query.pageSize || 100)
  }
)

onMounted(() => {
  fetchFiles()
})
</script>

<style scoped>
.system-config-card .t-card__body {
  padding-top: 0;
}

.system-config-panel {
  display: grid;
  gap: 24px;
  padding: 22px 4px 8px;
}

.system-storage-filter {
  justify-content: flex-start;
}

.oss-file-view-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 3px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #f6f7fb;
}

.oss-file-view-switch button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.oss-file-view-switch button:hover,
.oss-file-view-switch button.is-active {
  background: #ffffff;
  color: #0052d9;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
}

.system-config-marker-input {
  width: 240px;
}

.system-config-status-filter {
  width: 140px;
}

.system-config-file-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.oss-file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.oss-file-card {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  min-height: 154px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: inherit;
  text-align: left;
  cursor: default;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.oss-file-card:hover {
  border-color: #0052d9;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.oss-file-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #eef4ff;
  color: #0052d9;
  font-size: 20px;
}

.oss-file-card-main {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.oss-file-card-main strong,
.oss-file-card-main small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.oss-file-card-main strong {
  color: #111827;
  font-size: 14px;
}

.oss-file-card-main small {
  color: #6b7280;
  font-size: 12px;
}

.oss-file-card-meta,
.oss-file-card-footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #6b7280;
  font-size: 12px;
}

.oss-file-card-meta {
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.oss-temporary-access-dialog {
  display: grid;
  gap: 16px;
}

.oss-temporary-access-item {
  display: grid;
  gap: 8px;
}

.oss-temporary-access-item span {
  color: #6b7280;
  font-size: 12px;
}

.oss-temporary-access-item strong,
.oss-temporary-access-item a {
  overflow-wrap: anywhere;
  color: #111827;
}

.oss-temporary-access-item a {
  color: #0052d9;
  text-decoration: none;
}

.oss-upload-dialog {
  display: grid;
  gap: 20px;
}

.oss-upload-steps {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #edf1f5;
}

.oss-upload-step {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #111827;
}

.oss-upload-step span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #0052d9;
  color: #ffffff;
  font-weight: 700;
}

.oss-upload-step-divider {
  color: #9ca3af;
  font-size: 28px;
  line-height: 1;
}

.oss-upload-target {
  display: flex;
  align-items: center;
  gap: 12px;
}

.oss-upload-target span {
  color: #6b7280;
}

.oss-upload-target strong {
  color: #0052d9;
}

.oss-upload-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.oss-upload-control {
  width: 100%;
}

@media (max-width: 720px) {
  .oss-upload-form {
    grid-template-columns: 1fr;
  }

  .oss-upload-target,
  .oss-upload-steps {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
