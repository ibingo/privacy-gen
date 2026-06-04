<template>
  <div class="i18n-operation-history-page">
    <div class="i18n-operation-history-toolbar">
      <t-select v-model="typeFilter" class="i18n-operation-history-filter" placeholder="操作类型">
        <t-option value="all" label="全部类型" />
        <t-option v-for="type in typeOptions" :key="type.value" :value="type.value" :label="type.label" />
      </t-select>
      <t-select v-model="operatorFilter" class="i18n-operation-history-filter" placeholder="操作人">
        <t-option value="all" label="全部操作人" />
        <t-option v-for="operator in operatorOptions" :key="operator" :value="operator" :label="operator" />
      </t-select>
      <t-date-range-picker
        v-model="dateRange"
        class="i18n-operation-history-date"
        clearable
        format="YYYY-MM-DD"
        value-type="YYYY-MM-DD"
        placeholder="请选择日期范围"
      />
    </div>

    <div v-if="groupedRecords.length" class="i18n-operation-history-list">
      <section v-for="group in groupedRecords" :key="group.key" class="i18n-operation-history-group">
        <h3>{{ group.title }}</h3>
        <div class="i18n-operation-history-items">
          <article v-for="record in group.items" :key="record.id" class="i18n-operation-history-item">
            <t-avatar class="i18n-operation-history-avatar" :image="record.avatar">
              {{ record.operator.slice(0, 1) }}
            </t-avatar>
            <div class="i18n-operation-history-content">
              <div class="i18n-operation-history-main">
                <span class="i18n-operation-history-operator">{{ record.operator }}</span>
                <span>{{ record.message }}</span>
                <t-tag :theme="record.theme" variant="light" size="small">{{ record.type }}</t-tag>
              </div>
              <p v-if="record.detail">{{ record.detail }}</p>
              <time>{{ record.time }}</time>
            </div>
            <t-space class="i18n-operation-history-actions" size="small">
              <t-button theme="primary" variant="text" @click="showDetail(record)">详情</t-button>
              <t-button v-if="record.rollbackable" theme="primary" variant="text" @click="rollbackRecord(record)">回滚</t-button>
            </t-space>
          </article>
        </div>
      </section>
    </div>

    <div v-else class="i18n-operation-history-empty">
      <strong>暂无操作记录</strong>
      <p>调整筛选条件后查看当前文案项目的操作流水。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Avatar as TAvatar,
  Button as TButton,
  DateRangePicker as TDateRangePicker,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'

const typeFilter = ref('all')
const operatorFilter = ref('all')
const dateRange = ref(['2026-06-01', '2026-06-04'])

const rows = [
  {
    id: 'history-001',
    date: '2026-06-04',
    dayLabel: '今天 · 6月4日',
    time: '15:36',
    operator: 'cli',
    type: '新增',
    action: 'create',
    theme: 'success',
    message: '新增了 6 条源文案',
    detail: '包含 common_placeholder、ios_place_holder_test 等 Key。',
    rollbackable: true
  },
  {
    id: 'history-002',
    date: '2026-06-03',
    dayLabel: '昨天 · 6月3日',
    time: '16:41',
    operator: '周晨',
    type: '发布',
    action: 'publish',
    theme: 'warning',
    message: '全量发布了英语语言，共 9 条翻译文案',
    detail: '发布平台：Android、iOS。',
    rollbackable: false
  },
  {
    id: 'history-003',
    date: '2026-06-03',
    dayLabel: '昨天 · 6月3日',
    time: '16:20',
    operator: '李楠',
    type: '修改',
    action: 'update',
    theme: 'primary',
    message: '将翻译文案 "You don\'t have permission to view the translation memory of the platform" 修改为 "No permission to view the translation memory of the platform"',
    detail: '语种：English，平台：iOS。',
    rollbackable: true
  },
  {
    id: 'history-004',
    date: '2026-06-03',
    dayLabel: '昨天 · 6月3日',
    time: '16:14',
    operator: '李楠',
    type: '修改',
    action: 'update',
    theme: 'primary',
    message: '将翻译文案 "You do not have permission to view the translation memory of the platform" 修改为 "You don\'t have permission to view the translation memory of the platform"',
    detail: '语种：English，平台：Android。',
    rollbackable: true
  },
  {
    id: 'history-005',
    date: '2026-06-03',
    dayLabel: '昨天 · 6月3日',
    time: '11:29',
    operator: '王璐',
    type: '通过审核',
    action: 'approve',
    theme: 'primary',
    message: '通过审核了翻译文案 "删除空间下的原 key"',
    detail: '审核结果已同步到发布队列。',
    rollbackable: false
  },
  {
    id: 'history-006',
    date: '2026-06-03',
    dayLabel: '昨天 · 6月3日',
    time: '11:08',
    operator: '陈曦',
    type: '删除',
    action: 'delete',
    theme: 'danger',
    message: '通过回滚操作删除了 40 条源文案',
    detail: '删除前已确认文案弃用状态。',
    rollbackable: false
  }
]

const typeOptions = computed(() => {
  const map = new Map()
  rows.forEach((item) => {
    map.set(item.action, item.type)
  })
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
})

const operatorOptions = computed(() => [...new Set(rows.map((item) => item.operator))])

const filteredRows = computed(() => {
  const [start, end] = dateRange.value || []
  return rows.filter((item) => {
    const matchType = typeFilter.value === 'all' || item.action === typeFilter.value
    const matchOperator = operatorFilter.value === 'all' || item.operator === operatorFilter.value
    const matchStart = !start || item.date >= start
    const matchEnd = !end || item.date <= end
    return matchType && matchOperator && matchStart && matchEnd
  })
})

const groupedRecords = computed(() => {
  const map = new Map()
  filteredRows.value.forEach((item) => {
    if (!map.has(item.date)) {
      map.set(item.date, {
        key: item.date,
        title: item.dayLabel || item.date,
        items: []
      })
    }
    map.get(item.date).items.push(item)
  })
  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key))
})

function showDetail (record) {
  MessagePlugin.info(`${record.type}记录：${record.message}`)
}

function rollbackRecord (record) {
  MessagePlugin.info(`准备回滚：${record.message}`)
}
</script>
