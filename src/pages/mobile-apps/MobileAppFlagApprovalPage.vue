<template>
  <div class="document-list-page">
    <div class="document-list-panel">
      <div class="document-list-toolbar">
        <div class="document-list-actions">
          <span class="document-selection-text">共 {{ filteredApprovals.length }} 条</span>
        </div>

        <label class="document-search">
          <search-icon />
          <input v-model="keyword" type="search" placeholder="请输入内容搜索" />
        </label>
      </div>

      <div class="document-table">
        <div class="document-table-head document-table-row approval-table-row">
          <span>标题</span>
          <span>开关 Key</span>
          <span>状态</span>
          <span>申请人</span>
          <span>审批人</span>
          <span>提交时间</span>
          <span>操作</span>
        </div>

        <div v-for="approval in pageApprovals" :key="approval.id" class="document-table-row approval-table-row">
          <span class="document-name">
            {{ approval.title }}
            <small>{{ approval.reason }}</small>
          </span>
          <span>{{ approval.flagKey }}</span>
          <span>
            <span class="document-status" :class="approval.status === '已通过' ? 'is-success' : approval.status === '已拒绝' ? 'is-danger' : 'is-warning'">
              {{ approval.status }}
            </span>
          </span>
          <span>{{ approval.applicant }}</span>
          <span>{{ approval.reviewer }}</span>
          <span>{{ approval.submittedAt }}</span>
          <span class="document-actions-cell">
            <button type="button" @click="router.push({ name: 'mobile-app-flag-approval-edit', params: { id: approval.id } })">详情</button>
            <button type="button" @click="router.push({ name: 'mobile-app-flag-approval-edit', params: { id: approval.id } })">编辑</button>
          </span>
        </div>
      </div>

      <div class="icon-pagination">
        <span>每页 {{ pageSize }} 条，共 {{ filteredApprovals.length }} 条</span>
        <div class="icon-pagination-actions">
          <button type="button" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            :class="{ 'is-active': page === currentPage }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button type="button" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { readFlagApprovals } from '../../config/featureFlags'

const router = useRouter()
const keyword = ref('')
const currentPage = ref(1)
const pageSize = 5
const approvals = ref(readFlagApprovals())

const filteredApprovals = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return approvals.value
  return approvals.value.filter((approval) => {
    return `${approval.title} ${approval.flagKey} ${approval.applicant} ${approval.reviewer} ${approval.reason}`.toLowerCase().includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredApprovals.value.length / pageSize)))
const pageApprovals = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredApprovals.value.slice(start, start + pageSize)
})

watch(filteredApprovals, () => {
  currentPage.value = 1
})
</script>
