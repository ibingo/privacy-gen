<template>
  <div class="document-list-page">
    <div class="document-list-panel">
      <div class="document-list-toolbar">
        <div class="document-list-actions">
          <button class="document-primary-button" type="button">新建文案</button>
          <span class="document-selection-text">已选 3 项</span>
        </div>

        <label class="document-search">
          <search-icon />
          <input v-model="keyword" type="search" placeholder="请输入内容搜索" />
        </label>
      </div>

      <div class="document-table">
        <div class="document-table-head document-table-row">
          <span></span>
          <span>文案 Key</span>
          <span>状态</span>
          <span>默认语言</span>
          <span>覆盖语言数</span>
          <span>最近更新</span>
          <span>操作</span>
        </div>

        <div v-for="item in filteredRows" :key="item.id" class="document-table-row">
          <span class="document-cell-check">
            <input type="checkbox" :checked="item.checked" />
          </span>
          <span class="document-name">{{ item.name }}</span>
          <span>
            <span class="document-status" :class="`is-${item.statusTone}`">{{ item.status }}</span>
          </span>
          <span>{{ item.locale }}</span>
          <span>{{ item.coverage }}</span>
          <span>{{ item.updatedAt }}</span>
          <span class="document-actions-cell">
            <button type="button">详情</button>
            <button type="button" class="is-danger">删除</button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { SearchIcon } from 'tdesign-icons-vue-next'

const keyword = ref('')

const rows = [
  { id: 'i18n-001', name: 'privacy.title', status: '已完成', statusTone: 'success', locale: 'zh-CN', coverage: '8', updatedAt: '2026-05-08 10:40', checked: true },
  { id: 'i18n-002', name: 'agreement.export.button', status: '待发布', statusTone: 'warning', locale: 'en-US', coverage: '6', updatedAt: '2026-05-08 09:18', checked: true },
  { id: 'i18n-003', name: 'project.empty.description', status: '审核中', statusTone: 'processing', locale: 'zh-CN', coverage: '5', updatedAt: '2026-05-07 20:06', checked: true },
  { id: 'i18n-004', name: 'policy.form.sdk.label', status: '已完成', statusTone: 'success', locale: 'ja-JP', coverage: '8', updatedAt: '2026-05-07 16:11', checked: false },
  { id: 'i18n-005', name: 'layout.notification.empty', status: '审核失败', statusTone: 'danger', locale: 'zh-CN', coverage: '3', updatedAt: '2026-05-06 14:25', checked: false }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((item) => `${item.name} ${item.locale}`.toLowerCase().includes(q))
})
</script>
