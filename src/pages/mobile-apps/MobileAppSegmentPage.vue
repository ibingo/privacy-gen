<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="人群组列表"
    :total-text="`共 ${filteredSegments.length} 项`"
    :summary-text="`已选 ${selectedCount} 项`"
    primary-action="新建人群组"
    :columns="columns"
    :data="filteredSegments"
    :selected-row-keys="selectedIds"
    @primary="router.push({ name: 'mobile-app-segment-create' })"
    @select-change="selectedIds = $event"
  >
    <template #filters>
      <t-select v-model="attributeCountFilter" class="starter-list-filter-select" placeholder="属性数">
        <t-option value="all" label="全部属性数" />
        <t-option value="single" label="单属性" />
        <t-option value="multiple" label="多属性" />
      </t-select>
      <t-select v-model="userScaleFilter" class="starter-list-filter-select" placeholder="用户规模">
        <t-option value="all" label="全部规模" />
        <t-option value="small" label="1 万以下" />
        <t-option value="medium" label="1 万至 10 万" />
        <t-option value="large" label="10 万以上" />
      </t-select>
    </template>
    <template #attributes="{ row }">{{ row.attributes.length }}</template>
    <template #users="{ row }">{{ formatNumber(row.users) }}</template>
    <template #operation="{ row }">
      <t-space size="small">
        <t-button theme="primary" variant="text" @click="router.push({ name: 'mobile-app-segment-edit', params: { id: row.id } })">详情</t-button>
        <t-button theme="danger" variant="text">删除</t-button>
      </t-space>
    </template>
  </starter-list-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button as TButton, Option as TOption, Select as TSelect, Space as TSpace } from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import { readFeatureSegments } from '../../config/featureFlags'

const router = useRouter()
const keyword = ref('')
const attributeCountFilter = ref('all')
const userScaleFilter = ref('all')
const selectedIds = ref([])
const segments = ref(readFeatureSegments())
const columns = [
  { colKey: 'row-select', type: 'multiple', width: 48 },
  { colKey: 'name', title: '人群组名称', minWidth: 220 },
  { colKey: 'key', title: '标识', minWidth: 180 },
  { colKey: 'attributes', title: '属性数', width: 100 },
  { colKey: 'users', title: '预估用户', width: 120 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const selectedCount = computed(() => selectedIds.value.length)
const filteredSegments = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return segments.value.filter((segment) => {
    const matchKeyword = !q || `${segment.name} ${segment.key} ${segment.description}`.toLowerCase().includes(q)
    const attributeCount = segment.attributes.length
    const matchAttributeCount = attributeCountFilter.value === 'all'
      || (attributeCountFilter.value === 'single' && attributeCount <= 1)
      || (attributeCountFilter.value === 'multiple' && attributeCount > 1)
    const matchUserScale = userScaleFilter.value === 'all'
      || (userScaleFilter.value === 'small' && segment.users < 10000)
      || (userScaleFilter.value === 'medium' && segment.users >= 10000 && segment.users < 100000)
      || (userScaleFilter.value === 'large' && segment.users >= 100000)
    return matchKeyword && matchAttributeCount && matchUserScale
  })
})

function formatNumber (n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>
