<template>
  <div class="starter-list-page">
    <t-breadcrumb v-if="showBreadcrumb" class="starter-list-breadcrumb">
      <t-breadcrumb-item v-for="item in normalizedBreadcrumb" :key="item">
        {{ item }}
      </t-breadcrumb-item>
    </t-breadcrumb>

    <slot name="before-card" />

    <t-card class="starter-list-card" :bordered="false">
      <div class="starter-list-toolbar">
        <div class="starter-list-toolbar-left">
          <t-button v-if="primaryAction" theme="primary" @click="$emit('primary')">
            <template #icon><add-icon /></template>
            {{ primaryAction }}
          </t-button>
          <slot name="actions" />
          <span v-if="summaryText" class="starter-list-summary">{{ summaryText }}</span>
        </div>
        <div class="starter-list-toolbar-right">
          <slot name="filters" />
          <t-input
            v-if="searchable"
            :model-value="keyword"
            class="starter-list-search"
            clearable
            :placeholder="searchPlaceholder"
            @update:model-value="$emit('update:keyword', $event)"
            @enter="$emit('search')"
          >
            <template #prefix-icon>
              <search-icon />
            </template>
          </t-input>
        </div>
      </div>

      <slot name="table-prefix" />

      <t-table
        row-key="id"
        hover
        :loading="loading"
        :columns="columns"
        :data="pagedData"
        :selected-row-keys="selectedRowKeys"
        :pagination="null"
        @select-change="$emit('select-change', $event)"
        @row-click="$emit('row-click', $event)"
      >
        <template v-for="name in tableSlotNames" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps" />
        </template>
      </t-table>

      <div class="starter-list-pagination">
        <t-pagination
          v-model:current="current"
          v-model:page-size="innerPageSize"
          :total="paginationTotal"
          :total-content="true"
          :page-size-options="pageSizeOptions"
          :show-jumper="false"
          :show-page-size="true"
        />
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { computed, ref, useSlots, watch } from 'vue'
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next'
import {
  Breadcrumb as TBreadcrumb,
  BreadcrumbItem as TBreadcrumbItem,
  Button as TButton,
  Card as TCard,
  Input as TInput,
  Pagination as TPagination,
  Table as TTable
} from 'tdesign-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  breadcrumb: {
    type: Array,
    default: () => []
  },
  showBreadcrumb: {
    type: Boolean,
    default: true
  },
  totalText: {
    type: String,
    default: ''
  },
  summaryText: {
    type: String,
    default: ''
  },
  keyword: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: '请输入内容搜索'
  },
  searchable: {
    type: Boolean,
    default: true
  },
  primaryAction: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  selectedRowKeys: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: [Object, null],
    default: null
  },
  pageSize: {
    type: Number,
    default: 5
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 20]
  }
})

const emit = defineEmits(['update:keyword', 'search', 'primary', 'select-change', 'row-click', 'page-change'])

const slots = useSlots()
const current = ref(1)
const innerPageSize = ref(props.pagination?.defaultPageSize || props.pageSize)

const normalizedBreadcrumb = computed(() => {
  return props.breadcrumb.length ? props.breadcrumb : ['列表页', props.title]
})

const tableSlotNames = computed(() => Object.keys(slots).filter((name) => !['actions', 'filters', 'before-card', 'table-prefix'].includes(name)))
const isServerPagination = computed(() => props.pagination && typeof props.pagination === 'object')
const paginationTotal = computed(() => isServerPagination.value ? (props.pagination.total || 0) : props.data.length)

const pagedData = computed(() => {
  if (isServerPagination.value) return props.data
  const start = (current.value - 1) * innerPageSize.value
  return props.data.slice(start, start + innerPageSize.value)
})

watch(
  () => props.data.length,
  () => {
    if (isServerPagination.value) return
    current.value = 1
  }
)

watch(
  () => props.pagination,
  (pagination) => {
    if (!pagination) return
    current.value = pagination.current || pagination.page || 1
    innerPageSize.value = pagination.pageSize || props.pageSize
  },
  { deep: true, immediate: true }
)

watch([current, innerPageSize], ([page, pageSize]) => {
  if (!isServerPagination.value) return
  emit('page-change', { page, pageSize })
})
</script>
