<template>
  <div class="i18n-tool-page">
    <section class="overview-section">
      <div class="overview-header">
        <div>
          <h3>下载国际化资源包</h3>
          <p>按语言、平台与环境筛选后导出资源文件，便于客户端接入和灰度发布。</p>
        </div>
      </div>

      <div class="i18n-download-grid">
        <div class="i18n-download-card" v-for="item in downloads" :key="item.title">
          <h4>{{ item.title }}</h4>
          <p>{{ item.description }}</p>
          <div class="i18n-download-meta">
            <span>{{ item.scope }}</span>
            <span>{{ item.updatedAt }}</span>
          </div>
          <button class="document-primary-button" type="button">下载</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const downloads = [
  { title: '全量资源包', description: '包含所有已启用语言与全部命名空间。', scope: '生产环境', updatedAt: '2026-05-08 11:10' },
  { title: '移动端资源包', description: '导出 Android / iOS 使用的核心文案。', scope: 'App 端', updatedAt: '2026-05-08 10:42' },
  { title: '海外语言包', description: '仅包含英语、日语、韩语与东南亚语言。', scope: '国际站', updatedAt: '2026-05-07 17:28' }
]
</script>
