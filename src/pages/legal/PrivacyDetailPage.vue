<template>
  <div class="privacy-detail-page">
    <section class="privacy-detail-header">
      <t-card :bordered="false" class="privacy-detail-action-card privacy-detail-page-actions">
        <t-space class="privacy-detail-page-action-group">
          <t-button variant="outline" @click="goBack">返回</t-button>
          <t-button theme="primary" @click="goEdit">编辑</t-button>
        </t-space>
      </t-card>
    </section>

    <div class="privacy-detail-grid">
      <t-card title="基础信息" :bordered="false" class="privacy-detail-card">
        <div class="privacy-detail-fields">
          <div class="privacy-detail-field">
            <span>公司名称</span>
            <strong>{{ policy?.companyName || '-' }}</strong>
          </div>
          <div class="privacy-detail-field">
            <span>联系邮箱</span>
            <strong>{{ policy?.contactEmail || '-' }}</strong>
          </div>
          <div class="privacy-detail-field">
            <span>生效日期</span>
            <strong>{{ policy?.effectiveDate || '-' }}</strong>
          </div>
        </div>
      </t-card>

      <t-card title="关联应用" :bordered="false" class="privacy-detail-card">
        <div class="privacy-detail-fields">
          <div class="privacy-detail-field">
            <span>应用名称</span>
            <strong>{{ policy?.appName || '-' }}</strong>
          </div>
          <div class="privacy-detail-field">
            <span>适用终端</span>
            <strong>{{ policy?.platform || '-' }}</strong>
          </div>
          <div class="privacy-detail-field">
            <span>版本范围</span>
            <strong>{{ policy?.version || '-' }}</strong>
          </div>
          <div class="privacy-detail-field privacy-detail-field-wide">
            <span>包名</span>
            <strong>{{ policy?.packageName || '-' }}</strong>
          </div>
        </div>
      </t-card>

      <t-card title="存档信息" :bordered="false" class="privacy-detail-card">
        <div class="privacy-detail-fields">
          <div class="privacy-detail-field">
            <span>文档状态</span>
            <strong>{{ policy?.status || '-' }}</strong>
          </div>
          <div class="privacy-detail-field">
            <span>最近更新</span>
            <strong>{{ policy?.updatedAt || '-' }}</strong>
          </div>
          <div class="privacy-detail-field">
            <span>存档时间</span>
            <strong>{{ policy?.archivedAt || '-' }}</strong>
          </div>
        </div>
        <div class="privacy-detail-cloud-files">
          <div class="privacy-detail-cloud-files-title">云存储文件</div>
          <div v-if="policy?.fileIds?.length" class="privacy-detail-cloud-file-list">
            <button
              v-for="file in policy.fileIds"
              :key="file.fileId"
              class="privacy-detail-cloud-file"
              type="button"
              :disabled="signingFileId === file.fileId"
              @click="confirmTemporaryAccess(file)"
            >
              <strong>{{ file.name || '-' }}</strong>
              <span>{{ file.fileId }}</span>
            </button>
          </div>
          <p v-else>暂无云存储文件</p>
        </div>
        <div class="privacy-detail-archive-actions">
          <t-button theme="primary" @click="copyToClipboard">
            <template #icon><CopyIcon /></template>
            复制到剪贴板
          </t-button>
          <t-dropdown :options="downloadOptions" trigger="click" placement="bottom-right" @click="handleDownload">
            <t-button variant="outline">
              <template #icon><DownloadIcon /></template>
              下载
              <template #suffix><ChevronDownIcon /></template>
            </t-button>
          </t-dropdown>
          <t-dropdown :options="cloudStorageOptions" trigger="click" placement="bottom-right" @click="handlePushToCloudStorage">
            <t-button variant="outline" :loading="pushingCloudStorage">
              <template #icon><UploadIcon /></template>
              推送至云存储
              <template #suffix><ChevronDownIcon /></template>
            </t-button>
          </t-dropdown>
        </div>
      </t-card>

      <t-card title="补充说明" :bordered="false" class="privacy-detail-card">
        <p class="privacy-detail-note">{{ policy?.additionalInfo || '暂无补充说明' }}</p>
      </t-card>
    </div>

    <t-card title="第三方 SDK" :bordered="false" class="privacy-detail-card">
      <t-table row-key="name" :columns="sdkColumns" :data="policy?.sdkList || []" :pagination="null">
        <template #empty>
          <t-empty description="暂无 SDK 信息" />
        </template>
      </t-table>
    </t-card>

    <t-card title="文档预览" :bordered="false" class="privacy-detail-card privacy-preview-card">
      <PolicyPreview v-if="policy" :form-data="policy" :show-actions="false" :show-title="false" />
    </t-card>

    <t-dialog
      v-model:visible="temporaryAccessDialog.visible"
      header="临时访问链接已生成"
      width="640px"
      :confirm-btn="{ content: '打开临时链接', theme: 'primary', disabled: !temporaryAccessDialog.signedUrl }"
      cancel-btn="关闭"
      @confirm="openTemporaryAccessUrl"
    >
      <div class="privacy-temporary-access-dialog">
        <div class="privacy-temporary-access-item">
          <span>文件</span>
          <strong>{{ temporaryAccessDialog.name || '-' }}</strong>
        </div>
        <div class="privacy-temporary-access-item">
          <span>过期时间</span>
          <strong>{{ formatDateTime(temporaryAccessDialog.expiresAt) }}</strong>
        </div>
        <div class="privacy-temporary-access-item">
          <span>签名链接</span>
          <a :href="temporaryAccessDialog.signedUrl" target="_blank" rel="noopener noreferrer">
            {{ temporaryAccessDialog.signedUrl }}
          </a>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Button as TButton,
  Card as TCard,
  Dialog as TDialog,
  DialogPlugin,
  Dropdown as TDropdown,
  Empty as TEmpty,
  MessagePlugin,
  Space as TSpace,
  Table as TTable
} from 'tdesign-vue-next'
import { ChevronDownIcon, CopyIcon, DownloadIcon, UploadIcon } from 'tdesign-icons-vue-next'
import PolicyPreview from '../../components/PolicyPreview.vue'
import { getPrivacyPolicyDetailApi, publishPrivacyPolicyApi } from '../../api/legalDocuments'
import { signObjectStorageFileApi } from '../../api/objectStorage'
import { buildHtmlDocument, downloadFile, markdownToHtml } from '../../utils/exportUtils'
import { buildSafeDocumentFilename, getLegalDocumentExportConfig, uploadLegalDocumentFile } from '../../utils/legalDocumentPublish'
import { generatePolicy } from '../../utils/policyGenerator'

const route = useRoute()
const router = useRouter()
const policy = ref(null)
const pushingCloudStorage = ref(false)
const signingFileId = ref('')
const temporaryAccessDialog = ref({
  visible: false,
  fileId: '',
  name: '',
  signedUrl: '',
  expiresAt: ''
})

const sdkColumns = [
  { colKey: 'name', title: 'SDK 名称', minWidth: 140 },
  { colKey: 'company', title: '第三方公司', minWidth: 160 },
  { colKey: 'purpose', title: '使用目的', minWidth: 180 },
  { colKey: 'dataTypes', title: '个人信息类型', minWidth: 180 },
  { colKey: 'processing', title: '处理方式', width: 140 },
  { colKey: 'privacyUrl', title: '隐私政策链接', minWidth: 180 }
]

const downloadOptions = [
  { content: '下载 Markdown', value: 'markdown' },
  { content: '下载 TXT', value: 'txt' },
  { content: '下载 HTML', value: 'html' }
]

const cloudStorageOptions = [
  { content: '推送 Markdown', value: 'markdown' },
  { content: '推送 TXT', value: 'txt' },
  { content: '推送 HTML', value: 'html' }
]

const goBack = () => {
  router.push({ name: 'privacy-list' })
}

const goEdit = () => {
  router.push({ name: 'privacy-edit', params: { id: route.params.id } })
}

const normalizePolicyDetail = (item = {}) => ({
  ...item,
  id: item.policyId || item.id || '',
  version: item.versionId || item.version || '不限制',
  platform: item.applicableTerminal || item.platform || '',
  updatedAt: formatDateTime(item.updatedAt),
  createdAt: formatDateTime(item.createdAt),
  archivedAt: formatDateTime(item.archivedAt),
  sdkList: Array.isArray(item.sdkList) ? item.sdkList : [],
  fileIds: normalizeFileIds(item.fileIds)
})

const normalizeFileIds = (fileIds) => {
  if (!Array.isArray(fileIds)) return []
  return fileIds
    .map((file) => {
      if (typeof file === 'string') return { fileId: file, name: file }
      return {
        fileId: file?.fileId || file?.id || '',
        name: file?.name || file?.fileName || file?.objectName || file?.fileId || file?.id || ''
      }
    })
    .filter((file) => file.fileId)
}

async function loadPolicy () {
  try {
    const data = await getPrivacyPolicyDetailApi(route.params.id)
    if (!data) throw new Error('未找到隐私政策')
    policy.value = normalizePolicyDetail(data)
  } catch (error) {
    MessagePlugin.warning('未找到隐私政策')
    router.replace({ name: 'privacy-list' })
  }
}

const getPolicyText = () => {
  return policy.value ? generatePolicy(policy.value) : ''
}

const getFilename = (extension) => {
  return `${policy.value?.appName || '隐私政策'}.${extension}`
}

const getCloudStorageFilename = (extension) => {
  return buildSafeDocumentFilename(policy.value?.appName || '隐私政策', extension)
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(getPolicyText())
    MessagePlugin.success('已复制到剪贴板')
  } catch (err) {
    MessagePlugin.error('复制失败，请重试')
  }
}

const downloadAsMarkdown = () => {
  downloadFile(getFilename('md'), 'text/markdown;charset=utf-8', getPolicyText())
  MessagePlugin.success('Markdown 文件已下载')
}

const downloadAsTxt = () => {
  downloadFile(getFilename('txt'), 'text/plain;charset=utf-8', getPolicyText())
  MessagePlugin.success('TXT 文件已下载')
}

const downloadAsHtml = () => {
  const title = policy.value?.appName || '隐私政策'
  const html = buildHtmlDocument(title, markdownToHtml(getPolicyText()))
  downloadFile(getFilename('html'), 'text/html;charset=utf-8', html)
  MessagePlugin.success('HTML 文件已下载')
}

const buildExportContent = (type) => {
  if (type === 'html') {
    const title = policy.value?.appName || '隐私政策'
    return buildHtmlDocument(title, markdownToHtml(getPolicyText()))
  }
  return getPolicyText()
}

const handleDownload = (data) => {
  const value = data?.value
  if (value === 'markdown') downloadAsMarkdown()
  if (value === 'txt') downloadAsTxt()
  if (value === 'html') downloadAsHtml()
}

const handlePushToCloudStorage = async (data) => {
  if (!policy.value?.id || pushingCloudStorage.value) return

  const type = data?.value || 'markdown'
  const config = getLegalDocumentExportConfig(type)
  pushingCloudStorage.value = true
  try {
    const fileId = await uploadLegalDocumentFile({
      filename: getCloudStorageFilename(config.extension),
      content: buildExportContent(type),
      contentType: config.contentType,
      path: `privacy-policies/${policy.value.id}`
    })
    const publishedPolicy = await publishPrivacyPolicyApi({
      policyId: policy.value.id,
      fileIds: [fileId]
    })
    policy.value = normalizePolicyDetail(publishedPolicy)
    MessagePlugin.success(`${config.label} 已上传并发布`)
  } catch (error) {
    MessagePlugin.error(error.message || `${config.label} 推送失败`)
  } finally {
    pushingCloudStorage.value = false
  }
}

const confirmTemporaryAccess = (file) => {
  if (!file?.fileId || signingFileId.value) return
  const confirmDialog = DialogPlugin.confirm({
    header: '临时访问',
    body: `确认生成 ${file.name || file.fileId} 的临时访问链接？有效期 3 分钟。`,
    confirmBtn: '生成临时链接',
    cancelBtn: '取消',
    onConfirm: async () => {
      confirmDialog.hide()
      await createTemporaryAccess(file)
    }
  })
}

const createTemporaryAccess = async (file) => {
  signingFileId.value = file.fileId
  try {
    const data = await signObjectStorageFileApi({
      fileId: file.fileId,
      expiresSeconds: 180
    })
    temporaryAccessDialog.value = {
      visible: true,
      fileId: file.fileId,
      name: file.name || file.fileId,
      signedUrl: data?.signedUrl || data?.url || '',
      expiresAt: data?.expiresAt || ''
    }
    if (!temporaryAccessDialog.value.signedUrl) {
      MessagePlugin.warning('临时访问链接已生成，但响应中缺少 signedUrl')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '临时访问链接生成失败')
  } finally {
    signingFileId.value = ''
  }
}

const openTemporaryAccessUrl = () => {
  if (!temporaryAccessDialog.value.signedUrl) return
  window.open(temporaryAccessDialog.value.signedUrl, '_blank', 'noopener,noreferrer')
}

watch(
  () => route.params.id,
  loadPolicy,
  { immediate: true }
)

function formatDateTime (value) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
}
</script>

<style scoped>
.privacy-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 24px 40px;
}

.privacy-detail-header {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.privacy-detail-action-card {
  border-radius: 8px;
}

.privacy-detail-action-card :deep(.t-card__body) {
  padding: 12px;
}

.privacy-detail-page-actions {
  min-width: 160px;
}

.privacy-detail-page-action-group {
  display: flex;
  justify-content: flex-end;
}

.privacy-detail-page-action-group :deep(.t-space) {
  flex-direction: row;
  flex-wrap: nowrap;
}

.privacy-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.privacy-detail-card {
  border-radius: 8px;
}

.privacy-detail-card :deep(.t-card__body) {
  padding: 24px;
}

.privacy-detail-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 24px;
}

.privacy-detail-archive-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eaecf0;
}

.privacy-detail-cloud-files {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #eaecf0;
}

.privacy-detail-cloud-files-title {
  color: #667085;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.privacy-detail-cloud-file-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.privacy-detail-cloud-file {
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #eaecf0;
  border-radius: 6px;
  background: #f9fafb;
  text-align: left;
  cursor: pointer;
}

.privacy-detail-cloud-file:hover {
  border-color: #0052d9;
  background: #f5f9ff;
}

.privacy-detail-cloud-file:disabled {
  cursor: wait;
  opacity: 0.7;
}

.privacy-detail-cloud-file strong,
.privacy-detail-cloud-file span {
  overflow-wrap: anywhere;
}

.privacy-detail-cloud-file strong {
  color: #1f2937;
  font-size: 14px;
}

.privacy-detail-cloud-file span,
.privacy-detail-cloud-files p {
  margin: 0;
  color: #667085;
  font-size: 12px;
  line-height: 20px;
}

.privacy-temporary-access-dialog {
  display: grid;
  gap: 16px;
}

.privacy-temporary-access-item {
  display: grid;
  gap: 8px;
}

.privacy-temporary-access-item span {
  color: #667085;
  font-size: 12px;
}

.privacy-temporary-access-item strong,
.privacy-temporary-access-item a {
  overflow-wrap: anywhere;
}

.privacy-temporary-access-item a {
  color: #0052d9;
  text-decoration: none;
}

.privacy-detail-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.privacy-detail-field-wide {
  grid-column: 1 / -1;
}

.privacy-detail-field span {
  color: #667085;
  font-size: 13px;
  line-height: 20px;
}

.privacy-detail-field strong {
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 24px;
  overflow-wrap: anywhere;
}

.privacy-detail-note {
  margin: 0;
  min-height: 72px;
  color: #344054;
  font-size: 14px;
  line-height: 24px;
  white-space: pre-wrap;
}

.privacy-preview-card :deep(.preview-panel) {
  box-shadow: none;
  max-height: none;
  background: transparent;
}

.privacy-preview-card :deep(.preview-panel .t-card__body) {
  padding: 0;
}

.privacy-preview-card :deep(.policy-content) {
  padding: 32px 36px;
}

@media (max-width: 960px) {
  .privacy-detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .privacy-detail-page {
    padding: 12px 14px 28px;
  }

  .privacy-detail-page-action-group :deep(.t-space) {
    flex-wrap: wrap;
  }

  .privacy-detail-fields {
    grid-template-columns: 1fr;
  }
}
</style>
