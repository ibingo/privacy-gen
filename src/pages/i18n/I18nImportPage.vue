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

      <div class="document-table">
        <div class="document-table-head document-table-row i18n-import-table-row">
          <span>文件名</span>
          <span>格式</span>
          <span>校验结果</span>
          <span>导入时间</span>
          <span>操作</span>
        </div>

        <div v-for="item in importRows" :key="item.id" class="document-table-row i18n-import-table-row">
          <span class="document-name">{{ item.name }}</span>
          <span>{{ item.format }}</span>
          <span><span class="document-status" :class="`is-${item.statusTone}`">{{ item.status }}</span></span>
          <span>{{ item.createdAt }}</span>
          <span class="document-actions-cell">
            <button type="button">查看报告</button>
            <button type="button">重新导入</button>
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const importRows = [
  { id: 'import-001', name: 'privacy-copy-20260508.xlsx', format: 'XLSX', status: '校验通过', statusTone: 'success', createdAt: '2026-05-08 11:22' },
  { id: 'import-002', name: 'agreement-ja.json', format: 'JSON', status: '待修复', statusTone: 'warning', createdAt: '2026-05-08 10:04' },
  { id: 'import-003', name: 'global-copy.csv', format: 'CSV', status: '导入中', statusTone: 'processing', createdAt: '2026-05-07 18:31' }
]
</script>
