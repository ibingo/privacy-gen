import { uploadObjectStorageFileApi } from '../api/objectStorage'

const LEGAL_DOCS_BUSINESS_SYSTEM = 'legal-docs'

const exportConfig = {
  markdown: {
    label: 'Markdown',
    extension: 'md',
    contentType: 'text/markdown;charset=utf-8'
  },
  txt: {
    label: 'TXT',
    extension: 'txt',
    contentType: 'text/plain;charset=utf-8'
  },
  html: {
    label: 'HTML',
    extension: 'html',
    contentType: 'text/html;charset=utf-8'
  }
}

export const getLegalDocumentExportConfig = (type) => exportConfig[type] || exportConfig.markdown

export async function uploadLegalDocumentFile ({ filename, content, contentType, path }) {
  const file = new File([content], filename, { type: contentType })
  const formData = new FormData()
  formData.append('businessSystem', LEGAL_DOCS_BUSINESS_SYSTEM)
  formData.append('path', path || LEGAL_DOCS_BUSINESS_SYSTEM)
  formData.append('objectName', filename)
  formData.append('file', file)

  const uploadedFile = await uploadObjectStorageFileApi(formData)
  const fileId = uploadedFile?.fileId || uploadedFile?.id || uploadedFile?.file_id
  if (!fileId) {
    throw new Error('文件上传成功，但响应中缺少 fileId')
  }
  return fileId
}

export function buildSafeDocumentFilename (name, extension) {
  const safeName = String(name || 'legal-document')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 120) || 'legal-document'
  return `${safeName}.${extension}`
}
