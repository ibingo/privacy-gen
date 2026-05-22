<template>
  <div class="document-list-page">
    <div class="document-list-panel">
      <div class="document-list-toolbar">
        <div class="document-list-actions">
          <button class="document-primary-button" type="button" @click="router.push({ name: 'mobile-app-segment-attribute-create' })">新建属性</button>
          <span class="document-selection-text">已选 {{ selectedCount }} 项</span>
        </div>

        <label class="document-search">
          <search-icon />
          <input v-model="keyword" type="search" placeholder="请输入内容搜索" />
        </label>
      </div>

      <div class="document-table">
        <div class="document-table-head document-table-row segment-attribute-table-row">
          <span></span>
          <span>属性名称</span>
          <span>属性标识</span>
          <span>类型</span>
          <span>可选值</span>
          <span>描述</span>
          <span>操作</span>
        </div>

        <div v-for="attribute in filteredAttributes" :key="attribute.id" class="document-table-row segment-attribute-table-row">
          <span class="document-cell-check">
            <input type="checkbox" v-model="selectedIds" :value="attribute.id" />
          </span>
          <span class="document-name">{{ attribute.name }}</span>
          <span>{{ attribute.key }}</span>
          <span>
            <span class="document-status is-processing">{{ attribute.type }}</span>
          </span>
          <span>{{ attribute.values.join(', ') || '-' }}</span>
          <span>{{ attribute.description || '-' }}</span>
          <span class="document-actions-cell">
            <button type="button" @click="router.push({ name: 'mobile-app-segment-attribute-detail', params: { id: attribute.id } })">详情</button>
            <button type="button" class="is-danger" :disabled="attribute.isDefault" @click="handleDeleteAttribute(attribute)">删除</button>
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
import { MessagePlugin } from 'tdesign-vue-next'
import { deleteSegmentAttribute, readSegmentAttributes } from '../../config/featureFlags'

const router = useRouter()
const keyword = ref('')
const selectedIds = ref([])
const segmentAttributes = ref(readSegmentAttributes())

const selectedCount = computed(() => selectedIds.value.length)
const filteredAttributes = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return segmentAttributes.value
  return segmentAttributes.value.filter((attribute) => {
    return `${attribute.name} ${attribute.key} ${attribute.type} ${attribute.description}`.toLowerCase().includes(q)
  })
})

function handleDeleteAttribute (attribute) {
  if (attribute.isDefault) {
    MessagePlugin.warning('默认属性不可删除')
    return
  }
  deleteSegmentAttribute(attribute.id)
  segmentAttributes.value = readSegmentAttributes()
  selectedIds.value = selectedIds.value.filter((id) => id !== attribute.id)
  MessagePlugin.success('人群属性已删除')
}
</script>
