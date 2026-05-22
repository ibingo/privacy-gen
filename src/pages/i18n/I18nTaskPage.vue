<template>
  <div class="document-list-page">
    <div class="document-list-panel">
      <div class="document-list-toolbar">
        <div class="document-list-actions">
          <button class="document-primary-button" type="button" @click="goToCreate">
            新建任务
          </button>
          <span class="document-selection-text">已选 2 项</span>
        </div>

        <label class="document-search">
          <search-icon />
          <input v-model="keyword" type="search" placeholder="请输入内容搜索" />
        </label>
      </div>

      <div class="document-table">
        <div class="document-table-head document-table-row i18n-task-table-row">
          <span>任务名称</span>
          <span>任务类型</span>
          <span>状态</span>
          <span>处理人</span>
          <span>开始时间</span>
          <span>最近更新时间</span>
          <span>操作</span>
        </div>

        <div v-for="item in filteredRows" :key="item.id" class="document-table-row i18n-task-table-row">
          <span class="document-name">{{ item.name }}</span>
          <span>{{ item.type }}</span>
          <span>
            <span class="document-status" :class="`is-${item.statusTone}`">{{ item.status }}</span>
          </span>
          <span>{{ item.owner }}</span>
          <span>{{ item.startedAt }}</span>
          <span>{{ item.updatedAt }}</span>
          <span class="document-actions-cell">
            <button type="button">详情</button>
            <button type="button">重试</button>
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

const router = useRouter()
const keyword = ref('')

const rows = [
  { id: 'task-001', name: '全量词条导入 2026-05-08', type: '导入', status: '完成', statusTone: 'success', owner: '张楠', startedAt: '2026-05-08 11:20', updatedAt: '2026-05-08 11:24' },
  { id: 'task-002', name: '日语缺失项校验', type: '校验', status: '处理中', statusTone: 'processing', owner: '李晨', startedAt: '2026-05-08 10:08', updatedAt: '2026-05-08 11:18' },
  { id: 'task-003', name: '海外资源包导出', type: '下载', status: '待处理', statusTone: 'warning', owner: '王璐', startedAt: '2026-05-08 09:40', updatedAt: '2026-05-08 10:02' },
  { id: 'task-004', name: '韩语资源发布', type: '发布', status: '失败', statusTone: 'danger', owner: '陈曦', startedAt: '2026-05-07 18:31', updatedAt: '2026-05-07 18:48' }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((item) => `${item.name} ${item.type} ${item.owner}`.toLowerCase().includes(q))
})

const goToCreate = () => {
  router.push({ name: 'i18n-task-create' })
}
</script>
