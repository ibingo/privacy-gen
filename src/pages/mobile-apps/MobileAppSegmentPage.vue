<template>
  <div class="document-list-page">
    <div class="document-list-panel">
      <div class="document-list-toolbar">
        <div class="document-list-actions">
          <button class="document-primary-button" type="button" @click="router.push({ name: 'mobile-app-segment-create' })">新建人群组</button>
          <span class="document-selection-text">已选 {{ selectedCount }} 项</span>
        </div>

        <label class="document-search">
          <search-icon />
          <input v-model="keyword" type="search" placeholder="请输入内容搜索" />
        </label>
      </div>

      <div class="document-table">
        <div class="document-table-head document-table-row segment-table-row">
          <span></span>
          <span>人群组名称</span>
          <span>标识</span>
          <span>属性数</span>
          <span>预估用户</span>
          <span>最近更新</span>
          <span>操作</span>
        </div>

        <div v-for="segment in filteredSegments" :key="segment.id" class="document-table-row segment-table-row">
          <span class="document-cell-check">
            <input type="checkbox" v-model="selectedIds" :value="segment.id" />
          </span>
          <span class="document-name">{{ segment.name }}</span>
          <span>{{ segment.key }}</span>
          <span>{{ segment.attributes.length }}</span>
          <span>{{ formatNumber(segment.users) }}</span>
          <span>{{ segment.updatedAt }}</span>
          <span class="document-actions-cell">
            <button type="button" @click="router.push({ name: 'mobile-app-segment-edit', params: { id: segment.id } })">详情</button>
            <button type="button" class="is-danger">删除</button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { readFeatureSegments } from '../../config/featureFlags'

const router = useRouter()
const keyword = ref('')
const selectedIds = ref([])
const segments = ref(readFeatureSegments())

const selectedCount = computed(() => selectedIds.value.length)
const filteredSegments = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return segments.value
  return segments.value.filter((segment) => {
    return `${segment.name} ${segment.key} ${segment.description}`.toLowerCase().includes(q)
  })
})

function formatNumber (n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>
