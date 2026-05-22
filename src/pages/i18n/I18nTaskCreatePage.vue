<template>
  <div class="i18n-task-create-page">
    <section class="i18n-task-create-panel">
      <div class="i18n-task-section">
        <div class="i18n-task-label">任务类型</div>
        <div class="i18n-task-content">
          <button
            v-for="item in taskTypes"
            :key="item.value"
            type="button"
            class="i18n-choice-card"
            :class="{ 'is-selected': form.taskType === item.value }"
            @click="form.taskType = item.value"
          >
            <div class="i18n-choice-main">
              <span class="i18n-choice-icon">{{ item.icon }}</span>
              <div>
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </div>
            <span class="i18n-choice-check">✓</span>
          </button>
        </div>
      </div>

      <div class="i18n-task-section">
        <div class="i18n-task-label">翻译源</div>
        <div class="i18n-task-content i18n-choice-grid">
          <button
            v-for="item in providers"
            :key="item.value"
            type="button"
            class="i18n-choice-card is-provider"
            :class="{ 'is-selected': form.provider === item.value }"
            @click="form.provider = item.value"
          >
            <div class="i18n-choice-main">
              <span class="i18n-choice-icon">{{ item.icon }}</span>
              <div class="i18n-choice-title-row">
                <h4>{{ item.title }}</h4>
                <span v-if="item.badge" class="i18n-choice-badge">{{ item.badge }}</span>
              </div>
            </div>
            <span class="i18n-choice-check">✓</span>
          </button>
        </div>
      </div>

      <div class="i18n-task-section">
        <div class="i18n-task-label">任务名称</div>
        <div class="i18n-task-content">
          <input v-model="form.name" class="i18n-task-input" type="text" placeholder="请输入任务名称" />
        </div>
      </div>

      <div class="i18n-task-section">
        <div class="i18n-task-label">源语种</div>
        <div class="i18n-task-content">
          <select v-model="form.sourceLocale" class="i18n-task-select">
            <option v-for="item in sourceLocales" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
      </div>

      <div class="i18n-task-section">
        <div class="i18n-task-label">目标语种</div>
        <div class="i18n-task-content">
          <select v-model="form.targetLocale" class="i18n-task-select">
            <option value="" disabled>请选择目标语种</option>
            <option v-for="item in targetLocales" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
      </div>

      <div class="i18n-task-section">
        <div class="i18n-task-label">筛选文案</div>
        <div class="i18n-task-content i18n-filter-stack">
          <div class="i18n-filter-row">
            <span class="i18n-filter-name">标签</span>
            <select v-model="form.tag" class="i18n-task-select is-compact">
              <option value="">根据标签筛选文案</option>
              <option value="privacy">隐私政策</option>
              <option value="agreement">用户协议</option>
              <option value="global">全局导航</option>
            </select>
          </div>

          <div class="i18n-filter-row">
            <span class="i18n-filter-name">翻译状态</span>
            <select v-model="form.translationStatus" class="i18n-task-select is-compact">
              <option value="">根据翻译状态筛选文案</option>
              <option value="pending">待翻译</option>
              <option value="reviewing">审核中</option>
              <option value="failed">翻译失败</option>
            </select>
          </div>

          <p class="i18n-filter-hint">至少选择一种筛选条件：标签、翻译状态</p>
        </div>
      </div>

      <div class="i18n-task-footer">
        <button class="document-primary-button i18n-create-button" type="button">创建任务</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const taskTypes = [
  {
    value: 'machine',
    title: '机器翻译',
    description: '快速，性价比',
    icon: 'A'
  }
]

const providers = [
  { value: 'microsoft', title: '微软翻译', icon: '⊞' },
  { value: 'google', title: '谷歌翻译', icon: 'G' },
  { value: 'ai', title: 'AI 翻译', icon: '✦', badge: 'NEW' }
]

const sourceLocales = ['中文（简体中文）', 'English', '日本語']
const targetLocales = ['English', '日本語', '한국어', 'Deutsch', 'Français']

const form = reactive({
  taskType: 'machine',
  provider: 'microsoft',
  name: '日常翻译',
  sourceLocale: sourceLocales[0],
  targetLocale: '',
  tag: '',
  translationStatus: ''
})
</script>
