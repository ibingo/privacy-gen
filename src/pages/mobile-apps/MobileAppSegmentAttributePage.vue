<template>
  <div class="document-list-page">
    <div class="document-list-panel">
      <div class="document-list-toolbar">
        <div class="document-list-actions">
          <button class="document-primary-button" type="button" @click="router.push({ name: 'mobile-app-segment-attribute-create' })">新建属性</button>
          <span class="document-selection-text">已选 {{ selectedCount }} 项</span>
        </div>

        <div class="document-list-actions">
          <t-select v-model="typeFilter" class="starter-list-filter-select" placeholder="属性类型">
            <t-option value="all" label="全部类型" />
            <t-option v-for="type in typeOptions" :key="type" :value="type" :label="type" />
          </t-select>
          <t-select v-model="sourceFilter" class="starter-list-filter-select" placeholder="属性来源">
            <t-option value="all" label="全部来源" />
            <t-option value="default" label="默认属性" />
            <t-option value="custom" label="自定义属性" />
          </t-select>
          <label class="document-search">
            <search-icon />
            <input v-model="keyword" type="search" placeholder="请输入内容搜索" />
          </label>
        </div>
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

        <div v-for="attribute in pagedAttributes" :key="attribute.id" class="document-table-row segment-attribute-table-row">
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

      <div v-if="filteredAttributes.length > 0" class="starter-list-pagination">
        <t-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="filteredAttributes.length"
          :total-content="true"
          :page-size-options="[5, 10, 20]"
          :show-jumper="false"
          :show-page-size="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { MessagePlugin, Option as TOption, Pagination as TPagination, Select as TSelect } from 'tdesign-vue-next'
import { deleteSegmentAttribute, readSegmentAttributes } from '../../config/featureFlags'

const router = useRouter()
const keyword = ref('')
const typeFilter = ref('all')
const sourceFilter = ref('all')
const selectedIds = ref([])
const segmentAttributes = ref(readSegmentAttributes())
const currentPage = ref(1)
const pageSize = ref(5)
const typeOptions = computed(() => [...new Set(segmentAttributes.value.map((attribute) => attribute.type).filter(Boolean))])

const selectedCount = computed(() => selectedIds.value.length)
const filteredAttributes = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return segmentAttributes.value.filter((attribute) => {
    const matchKeyword = !q || `${attribute.name} ${attribute.key} ${attribute.type} ${attribute.description}`.toLowerCase().includes(q)
    const matchType = typeFilter.value === 'all' || attribute.type === typeFilter.value
    const matchSource = sourceFilter.value === 'all'
      || (sourceFilter.value === 'default' && attribute.isDefault)
      || (sourceFilter.value === 'custom' && !attribute.isDefault)
    return matchKeyword && matchType && matchSource
  })
})

const pagedAttributes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAttributes.value.slice(start, start + pageSize.value)
})

watch([keyword, typeFilter, sourceFilter, pageSize], () => {
  currentPage.value = 1
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
