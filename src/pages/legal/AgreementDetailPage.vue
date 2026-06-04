<template>
  <div class="agreement-detail-page">
    <section class="agreement-detail-header">
      <t-card :bordered="false" class="agreement-detail-action-card agreement-detail-page-actions">
        <t-space class="agreement-detail-page-action-group">
          <t-button variant="outline" @click="goBack">返回</t-button>
          <t-button theme="primary" @click="goEdit">编辑</t-button>
        </t-space>
      </t-card>
    </section>

    <div class="agreement-detail-grid">
      <t-card title="基础信息" :bordered="false" class="agreement-detail-card">
        <div class="agreement-detail-fields">
          <div class="agreement-detail-field">
            <span>公司名称</span>
            <strong>{{ agreement?.companyName || '-' }}</strong>
          </div>
          <div class="agreement-detail-field">
            <span>联系邮箱</span>
            <strong>{{ agreement?.contactEmail || '-' }}</strong>
          </div>
          <div class="agreement-detail-field">
            <span>生效日期</span>
            <strong>{{ agreement?.effectiveDate || '-' }}</strong>
          </div>
        </div>
      </t-card>

      <t-card title="关联应用" :bordered="false" class="agreement-detail-card">
        <div class="agreement-detail-fields">
          <div class="agreement-detail-field">
            <span>应用名称</span>
            <strong>{{ agreement?.appName || '-' }}</strong>
          </div>
          <div class="agreement-detail-field">
            <span>适用终端</span>
            <strong>{{ agreement?.platform || '-' }}</strong>
          </div>
          <div class="agreement-detail-field">
            <span>版本范围</span>
            <strong>{{ agreement?.version || '-' }}</strong>
          </div>
          <div class="agreement-detail-field agreement-detail-field-wide">
            <span>包名</span>
            <strong>{{ agreement?.packageName || '-' }}</strong>
          </div>
        </div>
      </t-card>

      <t-card title="存档信息" :bordered="false" class="agreement-detail-card">
        <div class="agreement-detail-fields">
          <div class="agreement-detail-field">
            <span>文档状态</span>
            <strong>{{ agreement?.status || '-' }}</strong>
          </div>
          <div class="agreement-detail-field">
            <span>最近更新</span>
            <strong>{{ agreement?.updatedAt || '-' }}</strong>
          </div>
          <div class="agreement-detail-field">
            <span>存档时间</span>
            <strong>{{ agreement?.archivedAt || '-' }}</strong>
          </div>
        </div>
        <div class="agreement-detail-cloud-files">
          <div class="agreement-detail-cloud-files-title">云存储文件</div>
          <div v-if="agreement?.fileIds?.length" class="agreement-detail-cloud-file-list">
            <button
              v-for="file in agreement.fileIds"
              :key="file.fileId"
              class="agreement-detail-cloud-file"
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
        <div class="agreement-detail-archive-actions">
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

      <t-card title="服务范围" :bordered="false" class="agreement-detail-card">
        <p class="agreement-detail-note">{{ agreement?.serviceScope || '暂无服务范围说明' }}</p>
      </t-card>

      <t-card title="补充条款" :bordered="false" class="agreement-detail-card agreement-detail-wide-card">
        <p class="agreement-detail-note">{{ agreement?.additionalInfo || '暂无补充条款' }}</p>
      </t-card>
    </div>

    <t-card title="文档预览" :bordered="false" class="agreement-detail-card agreement-preview-card">
      <AgreementPreview v-if="agreement" :form-data="agreement" :show-actions="false" :show-title="false" />
    </t-card>

    <t-dialog
      v-model:visible="temporaryAccessDialog.visible"
      header="临时访问链接已生成"
      width="640px"
      :confirm-btn="{ content: '打开临时链接', theme: 'primary', disabled: !temporaryAccessDialog.signedUrl }"
      cancel-btn="关闭"
      @confirm="openTemporaryAccessUrl"
    >
      <div class="agreement-temporary-access-dialog">
        <div class="agreement-temporary-access-item">
          <span>文件</span>
          <strong>{{ temporaryAccessDialog.name || '-' }}</strong>
        </div>
        <div class="agreement-temporary-access-item">
          <span>过期时间</span>
          <strong>{{ formatDateTime(temporaryAccessDialog.expiresAt) }}</strong>
        </div>
        <div class="agreement-temporary-access-item">
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
  MessagePlugin,
  Space as TSpace
} from 'tdesign-vue-next'
import { ChevronDownIcon, CopyIcon, DownloadIcon, UploadIcon } from 'tdesign-icons-vue-next'
import AgreementPreview from '../../components/AgreementPreview.vue'
import { getUserAgreementDetailApi, publishUserAgreementApi } from '../../api/legalDocuments'
import { signObjectStorageFileApi } from '../../api/objectStorage'
import { buildHtmlDocument, downloadFile, markdownToHtml } from '../../utils/exportUtils'
import { buildSafeDocumentFilename, getLegalDocumentExportConfig, uploadLegalDocumentFile } from '../../utils/legalDocumentPublish'
import { generateAgreement } from '../../utils/agreementGenerator'

const route = useRoute()
const router = useRouter()
const agreement = ref(null)
const pushingCloudStorage = ref(false)
const signingFileId = ref('')
const temporaryAccessDialog = ref({
  visible: false,
  fileId: '',
  name: '',
  signedUrl: '',
  expiresAt: ''
})

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
  router.push({ name: 'agreement-list' })
}

const goEdit = () => {
  router.push({ name: 'agreement-edit', params: { id: route.params.id } })
}

const normalizeAgreementDetail = (item = {}) => ({
  ...item,
  id: item.agreementId || item.id || '',
  version: item.versionId || item.version || '不限制',
  platform: item.applicableTerminal || item.platform || '',
  updatedAt: formatDateTime(item.updatedAt),
  createdAt: formatDateTime(item.createdAt),
  archivedAt: formatDateTime(item.archivedAt),
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

async function loadAgreement () {
  try {
    const data = await getUserAgreementDetailApi(route.params.id)
    if (!data) throw new Error('未找到用户协议')
    agreement.value = normalizeAgreementDetail(data)
  } catch (error) {
    MessagePlugin.warning('未找到用户协议')
    router.replace({ name: 'agreement-list' })
  }
}

const getAgreementText = () => {
  return agreement.value ? generateAgreement(agreement.value) : ''
}

const getFilename = (extension) => {
  return `${agreement.value?.appName || '用户协议'}.${extension}`
}

const getCloudStorageFilename = (extension) => {
  return buildSafeDocumentFilename(agreement.value?.appName || '用户协议', extension)
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(getAgreementText())
    MessagePlugin.success('已复制到剪贴板')
  } catch (err) {
    MessagePlugin.error('复制失败，请重试')
  }
}

const downloadAsMarkdown = () => {
  downloadFile(getFilename('md'), 'text/markdown;charset=utf-8', getAgreementText())
  MessagePlugin.success('Markdown 文件已下载')
}

const downloadAsTxt = () => {
  downloadFile(getFilename('txt'), 'text/plain;charset=utf-8', getAgreementText())
  MessagePlugin.success('TXT 文件已下载')
}

const downloadAsHtml = () => {
  const title = agreement.value?.appName || '用户协议'
  const html = buildHtmlDocument(title, markdownToHtml(getAgreementText()))
  downloadFile(getFilename('html'), 'text/html;charset=utf-8', html)
  MessagePlugin.success('HTML 文件已下载')
}

const buildExportContent = (type) => {
  if (type === 'html') {
    const title = agreement.value?.appName || '用户协议'
    return buildHtmlDocument(title, markdownToHtml(getAgreementText()))
  }
  return getAgreementText()
}

const handleDownload = (data) => {
  const value = data?.value
  if (value === 'markdown') downloadAsMarkdown()
  if (value === 'txt') downloadAsTxt()
  if (value === 'html') downloadAsHtml()
}

const handlePushToCloudStorage = async (data) => {
  if (!agreement.value?.id || pushingCloudStorage.value) return

  const type = data?.value || 'markdown'
  const config = getLegalDocumentExportConfig(type)
  pushingCloudStorage.value = true
  try {
    const fileId = await uploadLegalDocumentFile({
      filename: getCloudStorageFilename(config.extension),
      content: buildExportContent(type),
      contentType: config.contentType,
      path: `user-agreements/${agreement.value.id}`
    })
    const publishedAgreement = await publishUserAgreementApi({
      agreementId: agreement.value.id,
      fileIds: [fileId]
    })
    agreement.value = normalizeAgreementDetail(publishedAgreement)
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
  loadAgreement,
  { immediate: true }
)

function formatDateTime (value) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
}
</script>

<style scoped>
.agreement-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 24px 40px;
}

.agreement-detail-header {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.agreement-detail-action-card,
.agreement-detail-card {
  border-radius: 8px;
}

.agreement-detail-action-card :deep(.t-card__body) {
  padding: 12px;
}

.agreement-detail-page-actions {
  min-width: 160px;
}

.agreement-detail-page-action-group {
  display: flex;
  justify-content: flex-end;
}

.agreement-detail-page-action-group :deep(.t-space) {
  flex-direction: row;
  flex-wrap: nowrap;
}

.agreement-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.agreement-detail-card :deep(.t-card__body) {
  padding: 24px;
}

.agreement-detail-wide-card {
  grid-column: 1 / -1;
}

.agreement-detail-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 24px;
}

.agreement-detail-archive-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eaecf0;
}

.agreement-detail-cloud-files {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #eaecf0;
}

.agreement-detail-cloud-files-title {
  color: #667085;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.agreement-detail-cloud-file-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.agreement-detail-cloud-file {
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

.agreement-detail-cloud-file:hover {
  border-color: #0052d9;
  background: #f5f9ff;
}

.agreement-detail-cloud-file:disabled {
  cursor: wait;
  opacity: 0.7;
}

.agreement-detail-cloud-file strong,
.agreement-detail-cloud-file span {
  overflow-wrap: anywhere;
}

.agreement-detail-cloud-file strong {
  color: #1f2937;
  font-size: 14px;
}

.agreement-detail-cloud-file span,
.agreement-detail-cloud-files p {
  margin: 0;
  color: #667085;
  font-size: 12px;
  line-height: 20px;
}

.agreement-temporary-access-dialog {
  display: grid;
  gap: 16px;
}

.agreement-temporary-access-item {
  display: grid;
  gap: 8px;
}

.agreement-temporary-access-item span {
  color: #667085;
  font-size: 12px;
}

.agreement-temporary-access-item strong,
.agreement-temporary-access-item a {
  overflow-wrap: anywhere;
}

.agreement-temporary-access-item a {
  color: #0052d9;
  text-decoration: none;
}

.agreement-detail-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.agreement-detail-field-wide {
  grid-column: 1 / -1;
}

.agreement-detail-field span {
  color: #667085;
  font-size: 13px;
  line-height: 20px;
}

.agreement-detail-field strong {
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 24px;
  overflow-wrap: anywhere;
}

.agreement-detail-note {
  margin: 0;
  min-height: 72px;
  color: #344054;
  font-size: 14px;
  line-height: 24px;
  white-space: pre-wrap;
}

.agreement-preview-card :deep(.preview-panel) {
  box-shadow: none;
  max-height: none;
  background: transparent;
}

.agreement-preview-card :deep(.preview-panel .t-card__body) {
  padding: 0;
}

.agreement-preview-card :deep(.policy-content) {
  padding: 32px 36px;
}

@media (max-width: 960px) {
  .agreement-detail-grid {
    grid-template-columns: 1fr;
  }

  .agreement-detail-wide-card {
    grid-column: auto;
  }
}

@media (max-width: 640px) {
  .agreement-detail-page {
    padding: 12px 14px 28px;
  }

  .agreement-detail-page-action-group :deep(.t-space) {
    flex-wrap: wrap;
  }

  .agreement-detail-fields {
    grid-template-columns: 1fr;
  }
}
</style>
