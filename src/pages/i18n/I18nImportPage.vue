<template>
  <div class="i18n-tool-page">
    <section class="overview-section">
      <div class="overview-header">
        <div>
          <h3>导入国际化资源</h3>
          <p>支持 JSON、CSV、XLSX。导入后会自动校验语言列、重复 Key 和缺失翻译。</p>
        </div>
      </div>

      <div class="i18n-upload-box">
        <div class="i18n-upload-icon">+</div>
        <h4>拖拽文件到这里，或点击上传</h4>
        <p>建议单次导入不超过 10MB</p>
      </div>

      <t-table row-key="id" hover :columns="columns" :data="importRows" :pagination="pagination">
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
  </div>
</template>

<script setup>
import {
  Button as TButton,
  Space as TSpace,
  Table as TTable,
  Tag as TTag
} from 'tdesign-vue-next'

const importRows = [
  { id: 'import-001', name: 'privacy-copy-20260508.xlsx', format: 'XLSX', status: '校验通过', statusTone: 'success', createdAt: '2026-05-08 11:22' },
  { id: 'import-002', name: 'agreement-ja.json', format: 'JSON', status: '待修复', statusTone: 'warning', createdAt: '2026-05-08 10:04' },
  { id: 'import-003', name: 'global-copy.csv', format: 'CSV', status: '导入中', statusTone: 'processing', createdAt: '2026-05-07 18:31' }
]
const columns = [
  { colKey: 'name', title: '文件名', minWidth: 260 },
  { colKey: 'format', title: '格式', width: 120 },
  { colKey: 'status', title: '校验结果', width: 140 },
  { colKey: 'createdAt', title: '导入时间', width: 180 },
  { colKey: 'operation', title: '操作', width: 180, fixed: 'right' }
]
const pagination = {
  defaultCurrent: 1,
  defaultPageSize: 10,
  showJumper: false
}
const getStatusTheme = (tone) => {
  const themeMap = {
    success: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}
</script>
