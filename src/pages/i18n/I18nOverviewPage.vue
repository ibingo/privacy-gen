<template>
  <div class="i18n-overview-page">
    <div class="i18n-overview-grid">
      <section class="overview-section i18n-metric-card" v-for="card in summaryCards" :key="card.title">
        <p class="i18n-metric-label">{{ card.title }}</p>
        <h3>{{ card.value }}</h3>
        <span>{{ card.description }}</span>
      </section>
    </div>

    <div class="i18n-overview-panels">
      <section class="overview-section">
        <div class="overview-header">
          <div>
            <h3>语言覆盖</h3>
            <p>查看核心语言的词条覆盖率与待翻译数量。</p>
          </div>
        </div>

        <div class="document-table">
          <div class="document-table-head document-table-row i18n-config-table-row">
            <span>语言</span>
            <span>区域</span>
            <span>状态</span>
            <span>覆盖率</span>
            <span>待翻译</span>
            <span>最近发布</span>
          </div>

          <div v-for="item in localeRows" :key="item.id" class="document-table-row i18n-config-table-row">
            <span class="document-name">{{ item.language }}</span>
            <span>{{ item.region }}</span>
            <span><span class="document-status" :class="`is-${item.statusTone}`">{{ item.status }}</span></span>
            <span>{{ item.coverage }}</span>
            <span>{{ item.pending }}</span>
            <span>{{ item.publishedAt }}</span>
          </div>
        </div>
      </section>

      <section class="overview-section">
        <div class="overview-header">
          <div>
            <h3>最近任务</h3>
            <p>导入、校验与下载任务的最新执行情况。</p>
          </div>
        </div>

        <div class="route-table">
          <div v-for="task in tasks" :key="task.title" class="route-table-row route-table-action i18n-task-row">
            <span class="route-title">{{ task.title }}</span>
            <span class="route-path">{{ task.type }}</span>
            <span class="route-description">{{ task.description }}</span>
            <span class="document-status" :class="`is-${task.statusTone}`">{{ task.status }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const summaryCards = [
  { title: '支持语言', value: '12', description: '含 4 个待发布语言' },
  { title: '词条总数', value: '3,842', description: '较上周新增 126 条' },
  { title: '待处理问题', value: '27', description: '缺失翻译与格式冲突' },
  { title: '最近发布', value: '2 次', description: '24 小时内资源包导出' }
]

const localeRows = [
  { id: 'lang-001', language: '简体中文', region: '中国大陆', status: '已启用', statusTone: 'success', coverage: '100%', pending: '0', publishedAt: '2026-05-08 11:00' },
  { id: 'lang-002', language: 'English', region: 'Global', status: '已启用', statusTone: 'success', coverage: '97%', pending: '18', publishedAt: '2026-05-07 19:30' },
  { id: 'lang-003', language: '日本語', region: '日本', status: '待发布', statusTone: 'warning', coverage: '91%', pending: '52', publishedAt: '2026-05-06 15:40' },
  { id: 'lang-004', language: '한국어', region: '韩国', status: '审核中', statusTone: 'processing', coverage: '88%', pending: '64', publishedAt: '2026-05-05 13:15' }
]

const tasks = [
  { title: '2026-05-08 全量词条导入', type: '导入', description: '已完成 3 个命名空间解析与差异比对。', status: '完成', statusTone: 'success' },
  { title: '海外版本资源包导出', type: '下载', description: '生成 Android / iOS 多语言资源包。', status: '处理中', statusTone: 'processing' },
  { title: '日语缺失项校验', type: '校验', description: '发现 18 条缺失翻译，待补齐后重新发布。', status: '待处理', statusTone: 'warning' }
]
</script>
