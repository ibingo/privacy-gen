<template>
  <div class="mobile-center-page" v-if="flag">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-experiments' })">
      &larr; 返回开关列表
    </button>

    <section class="mc-panel">
      <div class="mc-panel-header">
        <div>
          <h3>{{ flag.name }}</h3>
          <p>{{ flag.key }} · {{ flag.environment }} · 默认值 {{ flag.defaultValue }}</p>
        </div>
        <div class="mc-version-actions">
          <span class="mc-app-status" :class="`mc-status-${getStatusTone(flag.status)}`">{{ flag.status }}</span>
          <button class="mc-btn mc-btn-primary" @click="router.push({ name: 'mobile-app-flag-config-edit', params: { id: flag.id } })">编辑配置</button>
        </div>
      </div>

      <div class="mc-flag-config-grid">
        <section class="mc-flag-section">
          <h4>开关返回值</h4>
          <div class="mc-ab-variants">
            <div v-for="variant in flag.variations" :key="variant.key" class="mc-ab-variant">
              <strong>{{ variant.name }}</strong>
              <span>{{ variant.value }}</span>
              <em>{{ variant.key }}</em>
            </div>
          </div>
        </section>

        <section class="mc-flag-section">
          <h4>规则</h4>
          <div class="mc-ab-variants">
            <div v-for="rule in flag.rules" :key="rule.id" class="mc-ab-variant">
              <strong>{{ rule.name }}</strong>
              <span>{{ rule.segmentName || rule.segmentKey || '未指定人群组' }}</span>
              <span>{{ formatConditions(rule.conditions) }}</span>
              <em>{{ formatRollout(rule.variations) }}</em>
            </div>
          </div>
        </section>

        <section class="mc-flag-section">
          <h4>默认规则</h4>
          <div class="mc-ab-toggle-meta">
            <span>默认返回</span>
            <code>{{ flag.defaultValue }}</code>
            <span>未生效返回</span>
            <code>{{ flag.offValue || flag.defaultValue }}</code>
            <span>前置条件</span>
            <code>{{ formatConditions(flag.prerequisites) || flag.prerequisite }}</code>
          </div>
        </section>

        <section class="mc-flag-section" v-if="flag.histories?.length">
          <h4>历史版本</h4>
          <div class="mc-timeline">
            <div v-for="(history, index) in flag.histories" :key="history.id" class="mc-timeline-item">
              <span class="mc-timeline-dot" :class="index === 0 ? 'mc-dot-success' : 'mc-dot-processing'"></span>
              <div class="mc-timeline-content">
                <div class="mc-timeline-title">{{ formatHistoryTitle(history, index) }}</div>
                <div class="mc-timeline-desc">{{ history.note }}</div>
                <span class="mc-timeline-time">{{ history.after?.owner || history.after?.operator || '系统用户' }} · {{ history.publishedAt }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该开关配置</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-experiments' })">返回开关列表</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findFeatureFlag, flagStatusOptions } from '../../config/featureFlags'

const route = useRoute()
const router = useRouter()
const flag = computed(() => findFeatureFlag(route.params.id))

function getStatusTone (status) {
  return flagStatusOptions.find((item) => item.value === status)?.tone || 'default'
}

function formatConditions (conditions = []) {
  return conditions
    .filter((condition) => condition.field || condition.value)
    .map((condition) => `${condition.field} ${condition.operator} ${condition.value}`)
    .join(' 且 ')
}

function formatRollout (items = []) {
  return items.map((item) => `${item.key} ${item.value}%`).join(' / ')
}

function formatHistoryTitle (history, index) {
  return `v${history.after?.updatedAt?.slice(0, 10)?.replaceAll('-', '.') || '1.0.0'} Build ${history.after?.rules?.length || index + 1}`
}
</script>
