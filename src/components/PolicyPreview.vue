<template>
  <t-card class="panel preview-panel" :bordered="false">
    <template v-if="showTitle" #title>
      <div class="panel-title">
        <div class="preview-title-main">
          <span>隐私政策预览</span>
          <t-tag theme="warning" variant="light">{{ policyText.length }} 字符</t-tag>
        </div>
        <t-space v-if="showActions" class="preview-actions" :break-line="true" size="small">
          <t-button theme="primary" @click="copyToClipboard">
            <template #icon><CopyIcon /></template>
            复制到剪贴板
          </t-button>
          <t-button variant="outline" @click="downloadAsMarkdown">
            <template #icon><DownloadIcon /></template>
            下载 Markdown
          </t-button>
          <t-button variant="outline" @click="downloadAsTxt">
            <template #icon><FileIcon /></template>
            下载 TXT
          </t-button>
          <t-button variant="outline" @click="downloadAsHtml">
            <template #icon><FileIcon /></template>
            下载 HTML
          </t-button>
        </t-space>
      </div>
    </template>

    <div class="policy-content" ref="policyContent" v-html="renderedPolicy"></div>
  </t-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Button as TButton,
  Card as TCard,
  MessagePlugin,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'
import { CopyIcon, DownloadIcon, FileIcon } from 'tdesign-icons-vue-next'
import { buildHtmlDocument, downloadFile, markdownToHtml } from '../utils/exportUtils'
import { generatePolicy } from '../utils/policyGenerator'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showTitle: {
    type: Boolean,
    default: true
  }
})

const policyContent = ref(null)

const policyText = computed(() => {
  return generatePolicy(props.formData)
})

const renderedPolicy = computed(() => {
  return markdownToHtml(policyText.value)
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(policyText.value)
    MessagePlugin.success('已复制到剪贴板')
  } catch (err) {
    MessagePlugin.error('复制失败，请重试')
  }
}

const downloadAsMarkdown = () => {
  downloadFile(`${props.formData.appName || '隐私政策'}.md`, 'text/markdown;charset=utf-8', policyText.value)
  MessagePlugin.success('Markdown 文件已下载')
}

const downloadAsTxt = () => {
  downloadFile(`${props.formData.appName || '隐私政策'}.txt`, 'text/plain;charset=utf-8', policyText.value)
  MessagePlugin.success('TXT 文件已下载')
}

const downloadAsHtml = () => {
  const filename = `${props.formData.appName || '隐私政策'}.html`
  const html = buildHtmlDocument(props.formData.appName || '隐私政策', renderedPolicy.value)
  downloadFile(filename, 'text/html;charset=utf-8', html)
  MessagePlugin.success('HTML 文件已下载')
}
</script>

<style scoped>
.panel-title {
  align-items: flex-start;
  gap: 16px;
}

.preview-title-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.preview-actions {
  justify-content: flex-end;
  margin-left: auto;
}

@media (max-width: 900px) {
  .panel-title {
    flex-direction: column;
  }

  .preview-actions {
    justify-content: flex-start;
    margin-left: 0;
  }
}
</style>
