<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="审批管理"
    search-placeholder="请输入内容搜索"
    :breadcrumb="['功能特性管理', '审批管理']"
    :columns="columns"
    :data="filteredApprovals"
  >
    <template #filters>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="审批状态">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
      </t-select>
      <t-select v-model="applicantFilter" class="starter-list-filter-select" placeholder="申请人">
        <t-option value="all" label="全部申请人" />
        <t-option v-for="applicant in applicantOptions" :key="applicant" :value="applicant" :label="applicant" />
      </t-select>
      <t-select v-model="reviewerFilter" class="starter-list-filter-select" placeholder="审批人">
        <t-option value="all" label="全部审批人" />
        <t-option v-for="reviewer in reviewerOptions" :key="reviewer" :value="reviewer" :label="reviewer" />
      </t-select>
    </template>

    <template #title="{ row }">
      <span class="document-name">
        {{ row.title }}
        <small>{{ row.reason }}</small>
      </span>
    </template>

    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.status)" variant="light">{{ row.status }}</t-tag>
    </template>

    <template #operation="{ row }">
      <t-space size="small">
        <t-button theme="primary" variant="text" @click="goToApproval(row)">详情</t-button>
        <t-button theme="primary" variant="text" @click="goToApproval(row)">编辑</t-button>
      </t-space>
    </template>
  </starter-list-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Button as TButton,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import { readFlagApprovals } from '../../config/featureFlags'

const router = useRouter()
const keyword = ref('')
const statusFilter = ref('all')
const applicantFilter = ref('all')
const reviewerFilter = ref('all')
const approvals = ref(readFlagApprovals())

const columns = [
  { colKey: 'title', title: '标题', minWidth: 280 },
  { colKey: 'flagKey', title: '开关 Key', width: 190 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'applicant', title: '申请人', width: 140 },
  { colKey: 'reviewer', title: '审批人', width: 140 },
  { colKey: 'submittedAt', title: '提交时间', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const statusOptions = computed(() => [...new Set(approvals.value.map((approval) => approval.status).filter(Boolean))])
const applicantOptions = computed(() => [...new Set(approvals.value.map((approval) => approval.applicant).filter(Boolean))])
const reviewerOptions = computed(() => [...new Set(approvals.value.map((approval) => approval.reviewer).filter(Boolean))])

const filteredApprovals = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return approvals.value.filter((approval) => {
    const matchKeyword = !q || `${approval.title} ${approval.flagKey} ${approval.applicant} ${approval.reviewer} ${approval.reason}`.toLowerCase().includes(q)
    const matchStatus = statusFilter.value === 'all' || approval.status === statusFilter.value
    const matchApplicant = applicantFilter.value === 'all' || approval.applicant === applicantFilter.value
    const matchReviewer = reviewerFilter.value === 'all' || approval.reviewer === reviewerFilter.value
    return matchKeyword && matchStatus && matchApplicant && matchReviewer
  })
})

function getStatusTheme (status) {
  if (status === '已通过') return 'success'
  if (status === '已拒绝') return 'danger'
  return 'warning'
}

function goToApproval (approval) {
  router.push({ name: 'mobile-app-flag-approval-edit', params: { id: approval.id } })
}
</script>
