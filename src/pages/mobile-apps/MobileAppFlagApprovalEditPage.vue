<template>
  <div class="mobile-center-page" v-if="approval">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-flag-approvals' })">
      &larr; 返回开关审批
    </button>

    <div class="mc-edit-shell">
      <section class="mc-panel">
        <div class="mc-panel-header">
          <div>
            <h3>编辑开关审批</h3>
            <p>维护审批标题、状态、审批人和申请原因。</p>
          </div>
          <div class="mc-version-actions">
            <span class="mc-app-status" :class="approvalStatusClass">{{ form.status }}</span>
            <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-flag-approvals' })">取消</button>
            <button class="mc-btn mc-btn-primary" @click="handleSave">保存审批</button>
          </div>
        </div>

        <div class="mc-edit-form">
          <div class="mc-form-group">
            <label>标题</label>
            <input v-model="form.title" type="text" />
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>开关 Key</label>
              <input v-model="form.flagKey" type="text" />
            </div>
            <div class="mc-form-group">
              <label>状态</label>
              <select v-model="form.status">
                <option>待审批</option>
                <option>已通过</option>
                <option>已拒绝</option>
              </select>
            </div>
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>申请人</label>
              <input v-model="form.applicant" type="text" />
            </div>
            <div class="mc-form-group">
              <label>审批人</label>
              <input v-model="form.reviewer" type="text" />
            </div>
          </div>

          <div class="mc-form-group">
            <label>申请原因</label>
            <textarea v-model="form.reason" rows="4"></textarea>
          </div>

          <div class="mc-form-group">
            <label>变更说明</label>
            <textarea v-model="form.changeNote" rows="4" placeholder="发布时填写的变更说明"></textarea>
          </div>

          <div class="mc-diff-grid" v-if="form.diffBefore || form.diffAfter">
            <div>
              <h5>变更前</h5>
              <pre>{{ formatDiff(form.diffBefore) }}</pre>
            </div>
            <div>
              <h5>变更后</h5>
              <pre>{{ formatDiff(form.diffAfter) }}</pre>
            </div>
          </div>
        </div>
      </section>

      <aside class="mc-detail-side">
        <section class="mc-panel">
          <div class="mc-panel-header">
            <h3>审批流</h3>
          </div>
          <div class="mc-timeline">
            <div v-for="step in approvalTimeline" :key="step.title" class="mc-timeline-item">
              <span class="mc-timeline-dot" :class="step.dotClass"></span>
              <div class="mc-timeline-content">
                <div class="mc-timeline-title">{{ step.title }}</div>
                <div class="mc-timeline-desc">{{ step.description }}</div>
                <span class="mc-timeline-time">{{ step.time }}</span>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该审批记录</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-flag-approvals' })">返回开关审批</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { findFlagApproval, updateFlagApproval } from '../../config/featureFlags'

const route = useRoute()
const router = useRouter()
const approval = findFlagApproval(route.params.id)
const form = ref(JSON.parse(JSON.stringify(approval || {})))

const approvalStatusClass = computed(() => {
  if (form.value.status === '已通过') return 'mc-status-success'
  if (form.value.status === '已拒绝') return 'mc-status-default'
  return 'mc-status-warning'
})

const approvalTimeline = computed(() => {
  const submittedAt = form.value.submittedAt || '暂无时间'
  const reviewed = ['已通过', '已拒绝'].includes(form.value.status)
  const approved = form.value.status === '已通过'
  return [
    {
      title: '提交申请',
      description: `${form.value.applicant || '申请人'} 提交 ${form.value.flagKey || '开关'} 变更申请`,
      time: submittedAt,
      dotClass: 'mc-dot-success'
    },
    {
      title: '负责人审批',
      description: reviewed ? `${form.value.reviewer || '审批人'} 已${approved ? '通过' : '拒绝'}审批` : `${form.value.reviewer || '审批人'} 待处理`,
      time: reviewed ? submittedAt : '待处理',
      dotClass: reviewed ? (approved ? 'mc-dot-success' : 'mc-dot-warning') : 'mc-dot-processing'
    },
    {
      title: '发布生效',
      description: approved ? '审批通过后发布生效' : '审批通过后自动进入发布生效',
      time: approved ? submittedAt : '待处理',
      dotClass: approved ? 'mc-dot-success' : 'mc-dot-processing'
    }
  ]
})

function handleSave () {
  if (!form.value.title?.trim() || !form.value.flagKey?.trim()) {
    MessagePlugin.warning('请填写标题和开关 Key')
    return
  }
  updateFlagApproval(approval.id, form.value)
  MessagePlugin.success('审批信息已保存')
  router.push({ name: 'mobile-app-flag-approvals' })
}

function formatDiff (value) {
  return value ? JSON.stringify(value, null, 2) : '暂无'
}
</script>
