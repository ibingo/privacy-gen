<template>
  <div class="mobile-center-page" v-if="app">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-detail', params: { id: app.id } })">
      &larr; 返回应用详情
    </button>

    <div class="mc-detail-hero mc-version-hero">
      <div class="mc-detail-hero-left">
        <span class="mc-app-icon mc-app-icon-xl" :style="{ background: app.iconColor }">
          <img v-if="app.iconImage" :src="app.iconImage" :alt="app.name" />
          <span v-else>{{ app.icon }}</span>
        </span>
        <div class="mc-detail-hero-info">
          <div class="mc-detail-title-row">
            <h1>版本管理</h1>
            <span class="mc-app-status" :class="`mc-status-${app.statusTone}`">{{ app.status }}</span>
          </div>
          <p class="mc-detail-package">{{ app.name }} · {{ app.packageName }}</p>
          <div class="mc-detail-tags">
            <span class="mc-tag">{{ app.platform }}</span>
            <span class="mc-tag">当前 v{{ app.version }} ({{ app.buildNumber }})</span>
            <span class="mc-tag">{{ versions.length }} 个版本</span>
          </div>
        </div>
      </div>
      <button class="mc-btn mc-btn-primary" @click="showCreateDialog = true">
        <span>+</span> 发布新版本
      </button>
    </div>

    <section class="mc-panel">
      <div class="mc-panel-header">
        <div>
          <h3>版本列表</h3>
          <p>管理安装包、发布渠道、下载量和历史归档。</p>
        </div>
        <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-edit', params: { id: app.id } })">编辑信息</button>
      </div>

      <div class="mc-version-table">
        <div class="mc-version-row mc-version-head">
          <span>版本</span>
          <span>Build</span>
          <span>大小</span>
          <span>灰度进度</span>
          <span>下载次数</span>
          <span>更新时间</span>
          <span>操作</span>
        </div>
        <div v-for="version in versions" :key="version.id" class="mc-version-row">
          <div class="mc-version-name">
            <span class="mc-app-icon" :style="{ background: app.iconColor }">
              <img v-if="app.iconImage" :src="app.iconImage" :alt="app.name" />
              <span v-else>{{ app.icon }}</span>
            </span>
            <div>
              <strong>{{ version.version }} <small v-if="isCurrentVersion(version)">当前版本</small></strong>
              <em>{{ version.channel }} · {{ version.packageType }}</em>
            </div>
          </div>
          <span>{{ version.buildNumber }}</span>
          <span>{{ version.size }}</span>
          <span>
            <span class="mc-rollout-cell">
              <span class="mc-rollout-track">
                <span class="mc-rollout-fill" :style="{ width: `${getRolloutProgress(version)}%` }"></span>
              </span>
              {{ getRolloutProgress(version) }}%
            </span>
          </span>
          <span>{{ formatNumber(version.downloads) }}</span>
          <span>{{ version.updatedAt }}</span>
          <div class="mc-version-actions">
            <button class="mc-link-btn" @click="openEditDialog(version)">编辑版本</button>
            <button v-if="version.betaInviteId" class="mc-link-btn" @click="openBetaInviteDetail(version)">内测详情</button>
            <button class="mc-link-btn">下载</button>
          </div>
        </div>
      </div>
    </section>

    <section class="mc-panel mc-version-notes">
      <div class="mc-panel-header">
        <h3>发布说明</h3>
      </div>
      <div class="mc-timeline">
        <div v-for="version in versions" :key="`${version.id}-notes`" class="mc-timeline-item">
          <span class="mc-timeline-dot" :class="`mc-dot-${version.statusTone === 'default' ? 'processing' : version.statusTone}`"></span>
          <div class="mc-timeline-content">
            <div class="mc-timeline-title">v{{ version.version }} Build {{ version.buildNumber }}</div>
            <div class="mc-timeline-desc">{{ version.releaseNotes }}</div>
            <span class="mc-timeline-time">{{ version.publisher }} · {{ version.updatedAt }}</span>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showCreateDialog" class="mc-dialog-overlay" @click.self="showCreateDialog = false">
      <div class="mc-dialog">
        <div class="mc-dialog-header">
          <h3>发布新版本</h3>
          <button class="mc-dialog-close" @click="showCreateDialog = false">&times;</button>
        </div>
        <div class="mc-dialog-body">
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>版本号</label>
              <input v-model="form.version" type="text" placeholder="1.2.4" />
            </div>
            <div class="mc-form-group">
              <label>Build 版本</label>
              <input v-model="form.buildNumber" type="text" placeholder="124" />
            </div>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>包体大小</label>
              <input v-model="form.size" type="text" placeholder="26.1 MB" />
            </div>
            <div class="mc-form-group">
              <label>发布渠道</label>
              <select v-model="form.channel">
                <option>正式版</option>
                <option>测试版</option>
                <option>内测版</option>
              </select>
            </div>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>包类型</label>
              <select v-model="form.packageType">
                <option v-for="type in packageTypeOptions" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>发布人</label>
              <input v-model="form.publisher" type="text" />
            </div>
          </div>
          <label class="mc-upload-zone">
            <span class="mc-upload-icon">⬆</span>
            <span class="mc-upload-content">
              <strong>上传安装包</strong>
              <small>{{ form.packageFileName || uploadSupportText }}</small>
            </span>
            <span class="mc-upload-action">选择文件</span>
            <input type="file" :accept="packageAccept" @change="handleVersionPackageUpload($event, form)" />
          </label>
          <div class="mc-form-group">
            <label>安装包链接</label>
            <input v-model="form.packageUrl" type="url" placeholder="https://example.com/app-download" />
          </div>
          <div class="mc-form-group">
            <label>更新说明</label>
            <textarea v-model="form.releaseNotes" rows="4" placeholder="描述本次更新内容"></textarea>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>灰度策略</label>
              <select v-model="form.rolloutStrategy">
                <option>全量发布</option>
                <option>按比例灰度</option>
                <option>指定用户组</option>
                <option>仅内部测试</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>初始发布进度</label>
              <input :value="getInitialRolloutProgress(form)" type="text" disabled />
            </div>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>发布时间</label>
              <select v-model="form.releaseMode">
                <option value="immediate">立即发布</option>
                <option value="scheduled">定时发布</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>开始时间</label>
              <t-date-picker
                v-model="form.scheduleStartAt"
                class="mc-date-picker"
                clearable
                :disabled="form.releaseMode !== 'scheduled'"
                :enable-time-picker="true"
                format="YYYY-MM-DD HH:mm"
                value-type="YYYY-MM-DD HH:mm"
                placeholder="请选择开始时间"
                @change="syncRolloutPlan(form)"
              />
            </div>
          </div>
          <div v-if="shouldShowRolloutPlan(form)" class="mc-rollout-plan">
            <div class="mc-rollout-plan-header">
              <div>
                <strong>发布率</strong>
                <span>按灰度时长自动生成每日比例，也可以切换为手动填写。</span>
              </div>
              <div class="mc-rollout-plan-actions">
                <label class="mc-rollout-switch">
                  <input v-model="form.rolloutAutoRatio" type="checkbox" @change="syncRolloutPlan(form, true)" />
                  自动计算
                </label>
                <div class="mc-rollout-days">
                  <span>灰度时长</span>
                  <input v-model.number="form.rolloutDays" type="number" min="1" max="30" @input="syncRolloutPlan(form, form.rolloutAutoRatio)" />
                  <span>天</span>
                </div>
              </div>
            </div>
            <div class="mc-rollout-rate-grid">
              <div v-for="(_, index) in form.rolloutRatios" :key="`create-rate-${index}`" class="mc-rollout-rate-item">
                <span>{{ getDayLabel(index) }}</span>
                <div class="mc-stepper">
                  <button type="button" :disabled="form.rolloutAutoRatio" @click="adjustRolloutRatio(form, index, -5)">−</button>
                  <input v-model.number="form.rolloutRatios[index]" type="number" min="0" max="100" :disabled="form.rolloutAutoRatio" @change="normalizeRolloutRatio(form, index, true)" />
                  <button type="button" :disabled="form.rolloutAutoRatio" @click="adjustRolloutRatio(form, index, 5)">＋</button>
                </div>
              </div>
            </div>
            <p class="mc-rollout-tip">提醒：若想设置三天发布，可以类似 20、50、100；开启自动计算时系统会按天数生成累计发布比例。</p>
          </div>
        </div>
        <div class="mc-dialog-footer">
          <button class="mc-btn mc-btn-outline" @click="showCreateDialog = false">取消</button>
          <button class="mc-btn mc-btn-primary" @click="handleCreate">发布</button>
        </div>
      </div>
    </div>

    <div v-if="showEditDialog" class="mc-dialog-overlay" @click.self="closeEditDialog">
      <div class="mc-dialog">
        <div class="mc-dialog-header">
          <h3>编辑版本</h3>
          <button class="mc-dialog-close" @click="closeEditDialog">&times;</button>
        </div>
        <div class="mc-dialog-body">
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>版本号</label>
              <input v-model="editForm.version" type="text" />
            </div>
            <div class="mc-form-group">
              <label>Build 版本</label>
              <input v-model="editForm.buildNumber" type="text" />
            </div>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>包体大小</label>
              <input v-model="editForm.size" type="text" />
            </div>
            <div class="mc-form-group">
              <label>下载次数</label>
              <input v-model.number="editForm.downloads" type="number" min="0" />
            </div>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>发布渠道</label>
              <select v-model="editForm.channel">
                <option>正式版</option>
                <option>测试版</option>
                <option>内测版</option>
                <option>历史归档</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>包类型</label>
              <select v-model="editForm.packageType">
                <option v-for="type in packageTypeOptions" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
          </div>
          <label class="mc-upload-zone">
            <span class="mc-upload-icon">⬆</span>
            <span class="mc-upload-content">
              <strong>上传安装包</strong>
              <small>{{ editForm.packageFileName || uploadSupportText }}</small>
            </span>
            <span class="mc-upload-action">选择文件</span>
            <input type="file" :accept="packageAccept" @change="handleVersionPackageUpload($event, editForm)" />
          </label>
          <div class="mc-form-group">
            <label>安装包链接</label>
            <input v-model="editForm.packageUrl" type="url" placeholder="https://example.com/app-download" />
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>版本状态</label>
              <select v-model="editForm.status">
                <option>测试中</option>
                <option>审核中</option>
                <option>已发布</option>
                <option>历史版本</option>
                <option>已下架</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>发布人</label>
              <input v-model="editForm.publisher" type="text" />
            </div>
          </div>
          <div class="mc-form-group">
            <label>更新说明</label>
            <textarea v-model="editForm.releaseNotes" rows="4"></textarea>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>灰度策略</label>
              <select v-model="editForm.rolloutStrategy" disabled>
                <option>全量发布</option>
                <option>按比例灰度</option>
                <option>指定用户组</option>
                <option>仅内部测试</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>当前进度</label>
              <input :value="`${editForm.rolloutProgress}%`" type="text" disabled />
            </div>
          </div>
          <div class="mc-rollout-editor">
            <input
              v-model.number="editForm.rolloutProgress"
              type="range"
              :min="editForm.currentRolloutProgress"
              max="100"
              step="5"
              @change="normalizeEditRolloutProgress"
            />
            <span>{{ editForm.rolloutProgress }}%</span>
          </div>
          <div v-if="shouldShowRolloutSteps(editForm)" class="mc-rollout-plan mc-rollout-plan-readonly">
            <div class="mc-rollout-plan-header">
              <div>
                <strong>发布进度</strong>
                <span>{{ getReleaseModeText(editForm) }} · 当前 {{ editForm.currentRolloutProgress }}%，可推进到更高比例。</span>
              </div>
            </div>
            <div class="mc-rollout-step-list">
              <div
                v-for="(ratio, index) in editForm.rolloutRatios"
                :key="`edit-step-${index}`"
                class="mc-rollout-step"
                :class="{ active: isRolloutStepActive(editForm, ratio), current: getCurrentRolloutStep(editForm) === index }"
              >
                <span class="mc-rollout-step-dot">{{ index + 1 }}</span>
                <div>
                  <strong>{{ getDayLabel(index) }}</strong>
                  <em>{{ ratio }}%</em>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mc-dialog-footer">
          <button class="mc-btn mc-btn-outline" @click="closeEditDialog">取消</button>
          <button
            v-if="isRolloutPlanDirty(editForm)"
            class="mc-btn mc-btn-outline"
            @click="handleSaveRolloutPlan"
          >
            保存发布率
          </button>
          <button class="mc-btn mc-btn-primary" @click="handleUpdateVersion">保存版本</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该应用</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-list' })">返回应用列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DatePicker as TDatePicker, DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import { createBetaInvite } from '../../config/betaInvites'
import { createMobileAppVersion, findMobileApp, readMobileAppVersions, updateMobileApp, updateMobileAppVersion } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const app = findMobileApp(route.params.id)
const versions = ref(app ? readMobileAppVersions(app.id) : [])
const currentVersionId = ref(app?.currentVersionId || '')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingVersionId = ref('')
const editRolloutSnapshot = ref('')
const form = ref(buildForm())
const editForm = ref(buildEditForm())
const packageTypeOptions = getPackageTypeOptions(app?.platform)
const packageAccept = getPackageAccept(app?.platform)
const uploadSupportText = `支持 ${packageTypeOptions.join(' / ')} 上传`

function buildForm () {
  const nextBuild = String((Number(app?.buildNumber) || 100) + 1)
  return {
    version: app?.version || '1.0.0',
    buildNumber: nextBuild,
    size: app?.size || '0 MB',
    channel: '测试版',
    packageType: app?.platform === 'iOS' ? 'Adhoc' : app?.platform === 'Android' ? 'APK' : 'PWA',
    publisher: app?.team || '',
    releaseNotes: '',
    packageUrl: '',
    packageFileName: '',
    rolloutProgress: 0,
    rolloutStrategy: '按比例灰度',
    releaseMode: 'immediate',
    scheduleStartAt: '',
    rolloutDays: 3,
    rolloutAutoRatio: true,
    rolloutRatios: buildAutoRolloutRatios(3)
  }
}

function getPackageTypeOptions (platform) {
  if (platform === 'Android') return ['APK', 'AAB']
  if (platform === 'iOS') return ['IPA', 'Adhoc']
  if (platform === 'HarmonyOS') return ['HAP', 'APP']
  return ['PWA', 'ZIP']
}

function getPackageAccept (platform) {
  if (platform === 'Android') return '.apk,.aab'
  if (platform === 'iOS') return '.ipa'
  if (platform === 'HarmonyOS') return '.hap,.app'
  return '.zip,.pwa'
}

function buildEditForm (version = {}) {
  const currentRolloutProgress = getRolloutProgress(version)
  return {
    version: version.version || '',
    buildNumber: version.buildNumber || '',
    size: version.size || '',
    downloads: Number(version.downloads) || 0,
    channel: version.channel || '测试版',
    packageType: version.packageType || (app?.platform === 'iOS' ? 'Adhoc' : app?.platform === 'Android' ? 'APK' : 'PWA'),
    status: version.status || '测试中',
    publisher: version.publisher || app?.team || '',
    releaseNotes: version.releaseNotes || '',
    packageUrl: version.packageUrl || '',
    packageFileName: version.packageFileName || '',
    rolloutProgress: currentRolloutProgress,
    currentRolloutProgress,
    rolloutStrategy: version.rolloutStrategy || (currentRolloutProgress >= 100 ? '全量发布' : '按比例灰度'),
    releaseMode: version.releaseMode || (version.scheduleStartAt ? 'scheduled' : 'immediate'),
    scheduleStartAt: version.scheduleStartAt || '',
    rolloutDays: normalizeRolloutDays(version.rolloutDays || version.rolloutRatios?.length || 3),
    rolloutAutoRatio: version.rolloutAutoRatio !== false,
    rolloutRatios: normalizeRolloutRatios(version.rolloutRatios, version.rolloutDays || version.rolloutRatios?.length || 3, version.rolloutAutoRatio !== false)
  }
}

function getVersionTone (status) {
  if (status === '已发布') return 'success'
  if (['测试中', '审核中'].includes(status)) return 'warning'
  return 'default'
}

function formatNumber (n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function getRolloutProgress (version) {
  const value = Number(version?.rolloutProgress)
  if (Number.isNaN(value)) return version?.status === '已发布' ? 100 : 0
  return Math.min(100, Math.max(0, value))
}

function normalizeRolloutProgress (value) {
  const progress = Number(value)
  if (Number.isNaN(progress)) return 0
  return Math.min(100, Math.max(0, progress))
}

function normalizeRolloutDays (value) {
  const days = Number(value)
  if (Number.isNaN(days)) return 1
  return Math.min(30, Math.max(1, Math.round(days)))
}

function buildAutoRolloutRatios (days) {
  const totalDays = normalizeRolloutDays(days)
  if (totalDays === 1) return [100]
  if (totalDays === 2) return [50, 100]
  if (totalDays === 3) return [20, 50, 100]

  return Array.from({ length: totalDays }, (_, index) => {
    if (index === totalDays - 1) return 100
    return Math.min(95, Math.max(5, Math.round(((index + 1) / totalDays) * 100 / 5) * 5))
  })
}

function normalizeRolloutRatios (ratios, days, useAuto) {
  const totalDays = normalizeRolloutDays(days)
  if (useAuto) return buildAutoRolloutRatios(totalDays)

  const normalized = Array.from({ length: totalDays }, (_, index) => normalizeRolloutProgress(ratios?.[index]))
  normalized[totalDays - 1] = normalized[totalDays - 1] || 100
  return normalized
}

function validateRolloutRatios (targetForm, showMessage = true) {
  const target = getFormState(targetForm)
  if (!shouldShowRolloutPlan(target)) return true

  const ratios = normalizeRolloutRatios(target.rolloutRatios, target.rolloutDays, false)
  for (let index = 0; index < ratios.length; index++) {
    const value = ratios[index]
    if (value < 0 || value > 100) {
      if (showMessage) MessagePlugin.warning(`${getDayLabel(index)}发布率需在 0 到 100 之间`)
      return false
    }
    if (index > 0 && value <= ratios[index - 1]) {
      if (showMessage) MessagePlugin.warning(`${getDayLabel(index)}发布率必须大于前一天`)
      return false
    }
    if (index < ratios.length - 1 && value >= ratios[index + 1]) {
      if (showMessage) MessagePlugin.warning(`${getDayLabel(index)}发布率必须小于后一天`)
      return false
    }
  }

  if (ratios[ratios.length - 1] !== 100) {
    if (showMessage) MessagePlugin.warning('最后一天发布率必须为 100')
    return false
  }

  target.rolloutRatios = ratios
  return true
}

function getFormState (targetForm) {
  return targetForm?.value || targetForm
}

function syncRolloutPlan (targetForm, forceAuto = false) {
  const target = getFormState(targetForm)
  if (!target) return

  target.rolloutDays = normalizeRolloutDays(target.rolloutDays)
  if (forceAuto || target.rolloutAutoRatio) {
    target.rolloutRatios = buildAutoRolloutRatios(target.rolloutDays)
    return
  }
  target.rolloutRatios = normalizeRolloutRatios(target.rolloutRatios, target.rolloutDays, false)
}

function shouldShowRolloutPlan (targetForm) {
  const target = getFormState(targetForm)
  return target?.releaseMode === 'scheduled' && target.scheduleStartAt && target.rolloutStrategy === '按比例灰度'
}

function shouldShowRolloutSteps (targetForm) {
  const target = getFormState(targetForm)
  return target?.rolloutStrategy === '按比例灰度' && Array.isArray(target.rolloutRatios) && target.rolloutRatios.length > 0
}

function adjustRolloutRatio (targetForm, index, step) {
  const target = getFormState(targetForm)
  if (!target || target.rolloutAutoRatio) return

  const nextValue = normalizeRolloutProgress(Number(target.rolloutRatios[index]) + step)
  target.rolloutRatios[index] = nextValue
  validateRolloutRatios(target, false)
}

function normalizeRolloutRatio (targetForm, index, showMessage = false) {
  const target = getFormState(targetForm)
  if (!target) return

  target.rolloutRatios[index] = normalizeRolloutProgress(target.rolloutRatios[index])
  validateRolloutRatios(target, showMessage)
}

function getDayLabel (index) {
  const labels = ['第一天', '第二天', '第三天', '第四天', '第五天', '第六天', '第七天']
  return labels[index] || `第 ${index + 1} 天`
}

function getInitialRolloutProgress (targetForm) {
  const target = getFormState(targetForm)
  if (!target) return '0%'
  if (target.rolloutStrategy === '全量发布') return '100%'
  if (target.rolloutStrategy === '指定用户组') return '100%'
  return '0%'
}

function getReleaseModeText (targetForm) {
  const target = getFormState(targetForm)
  if (!target) return '发布计划'
  if (target.releaseMode !== 'scheduled') return '立即发布'
  return target.scheduleStartAt ? `定时发布 ${target.scheduleStartAt.replace('T', ' ')}` : '定时发布'
}

function getDefaultInviteExpiresAt () {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  return expiresAt.toISOString().slice(0, 10)
}

function createVersionBetaInvite (version) {
  if (!app || !version || form.value.rolloutStrategy !== '指定用户组') return null

  return createBetaInvite({
    title: `${app.name} ${app.platform} v${version.version} 用户组灰度`,
    appName: app.name,
    platforms: [app.platform],
    versionId: version.id,
    inviteType: 'public',
    password: '',
    quota: 50,
    usedCount: 0,
    status: 'enabled',
    expiresAt: getDefaultInviteExpiresAt(),
    owner: form.value.publisher || app.team || '',
    sourceType: 'version-user-group-rollout',
    sourceVersionId: version.id,
    sourceAppId: app.id,
    lockedFields: ['title', 'code', 'appName', 'platforms', 'versionId', 'status'],
    remark: `由版本 ${version.version} Build ${version.buildNumber} 的指定用户组灰度自动创建。`
  })
}

function getCurrentRolloutStep (targetForm) {
  const target = getFormState(targetForm)
  if (!target?.rolloutRatios?.length) return -1
  const progress = normalizeRolloutProgress(target.rolloutProgress)
  if (progress <= 0) return -1
  const index = target.rolloutRatios.findIndex((ratio) => progress < ratio)
  return index === -1 ? target.rolloutRatios.length - 1 : index
}

function isRolloutStepActive (targetForm, ratio) {
  const target = getFormState(targetForm)
  if (!target) return false
  return normalizeRolloutProgress(target.rolloutProgress) >= normalizeRolloutProgress(ratio)
}

function normalizeEditRolloutProgress () {
  const minProgress = normalizeRolloutProgress(editForm.value.currentRolloutProgress)
  const nextProgress = normalizeRolloutProgress(editForm.value.rolloutProgress)
  if (nextProgress < minProgress) {
    editForm.value.rolloutProgress = minProgress
    MessagePlugin.warning(`灰度发布进度不能低于当前进度 ${minProgress}%`)
    return
  }
  editForm.value.rolloutProgress = nextProgress
}

function getRolloutPlanSignature (targetForm) {
  const target = getFormState(targetForm)
  if (!target) return ''
  return JSON.stringify({
    rolloutProgress: normalizeRolloutProgress(target.rolloutProgress),
    rolloutDays: normalizeRolloutDays(target.rolloutDays),
    rolloutAutoRatio: Boolean(target.rolloutAutoRatio),
    rolloutRatios: normalizeRolloutRatios(target.rolloutRatios, target.rolloutDays, target.rolloutAutoRatio)
  })
}

function isRolloutPlanDirty (targetForm) {
  if (!showEditDialog.value) return false
  return getRolloutPlanSignature(targetForm) !== editRolloutSnapshot.value
}

function handleVersionPackageUpload (event, targetForm) {
  const file = event.target.files?.[0]
  if (!file) return
  const target = getFormState(targetForm)
  if (!target) return

  target.packageFileName = file.name
  target.packageUrl = ''
}

function handleCreate () {
  if (!form.value.version.trim() || !form.value.buildNumber.trim()) {
    MessagePlugin.warning('请填写版本号和 Build 版本')
    return
  }

  syncRolloutPlan(form, form.value.rolloutAutoRatio)
  if (!validateRolloutRatios(form)) return

  form.value.rolloutProgress = ['全量发布', '指定用户组'].includes(form.value.rolloutStrategy) ? 100 : 0
  const version = createMobileAppVersion(app.id, form.value)
  const betaInvite = createVersionBetaInvite(version)
  if (betaInvite) {
    updateMobileAppVersion(app.id, version.id, {
      betaInviteId: betaInvite.id,
      betaInviteCode: betaInvite.code
    })
  }
  updateMobileApp(app.id, {
    version: version.version,
    buildNumber: version.buildNumber,
    currentVersionId: version.id,
    size: version.size,
    status: '测试中',
    statusTone: 'warning'
  })
  currentVersionId.value = version.id
  versions.value = readMobileAppVersions(app.id)
  showCreateDialog.value = false
  form.value = buildForm()
  if (betaInvite) {
    showBetaInviteSuccessDialog(betaInvite)
  } else {
    MessagePlugin.success('新版本已发布到版本列表')
  }
}

function showBetaInviteSuccessDialog (betaInvite) {
  DialogPlugin.confirm({
    header: '新版本已发布',
    body: '已创建对应的内测邀请，是否前往查看内测详情？',
    theme: 'success',
    confirmBtn: {
      content: '前往内测详情',
      theme: 'primary'
    },
    cancelBtn: '留在当前页',
    onConfirm: ({ hide }) => {
      hide()
      router.push({ name: 'mobile-app-beta-invite-detail', params: { id: betaInvite.id } })
    }
  })
}

function openBetaInviteDetail (version) {
  if (!version.betaInviteId) return
  router.push({ name: 'mobile-app-beta-invite-detail', params: { id: version.betaInviteId } })
}

function openEditDialog (version) {
  editingVersionId.value = version.id
  editForm.value = buildEditForm(version)
  editRolloutSnapshot.value = getRolloutPlanSignature(editForm.value)
  showEditDialog.value = true
}

function closeEditDialog () {
  showEditDialog.value = false
  editingVersionId.value = ''
  editForm.value = buildEditForm()
  editRolloutSnapshot.value = ''
}

function handleUpdateVersion () {
  if (!editForm.value.version.trim() || !editForm.value.buildNumber.trim()) {
    MessagePlugin.warning('请填写版本号和 Build 版本')
    return
  }

  normalizeEditRolloutProgress()
  const updatedVersion = updateMobileAppVersion(app.id, editingVersionId.value, {
    ...editForm.value,
    rolloutProgress: normalizeRolloutProgress(editForm.value.rolloutProgress),
    rolloutDays: normalizeRolloutDays(editForm.value.rolloutDays),
    rolloutRatios: normalizeRolloutRatios(editForm.value.rolloutRatios, editForm.value.rolloutDays, editForm.value.rolloutAutoRatio),
    statusTone: getVersionTone(editForm.value.status)
  })
  versions.value = readMobileAppVersions(app.id)

  if (isCurrentVersion({ id: editingVersionId.value, version: updatedVersion?.version, buildNumber: updatedVersion?.buildNumber })) {
    updateMobileApp(app.id, {
      version: updatedVersion.version,
      buildNumber: updatedVersion.buildNumber,
      currentVersionId: updatedVersion.id,
      size: updatedVersion.size,
      status: updatedVersion.status === '历史版本' ? app.status : updatedVersion.status,
      statusTone: updatedVersion.statusTone
    })
    currentVersionId.value = updatedVersion.id
  }

  closeEditDialog()
  MessagePlugin.success('版本信息已保存')
}

function handleSaveRolloutPlan () {
  if (!validateRolloutRatios(editForm)) return

  const updatedVersion = updateMobileAppVersion(app.id, editingVersionId.value, {
    rolloutDays: normalizeRolloutDays(editForm.value.rolloutDays),
    rolloutAutoRatio: Boolean(editForm.value.rolloutAutoRatio),
    rolloutRatios: normalizeRolloutRatios(editForm.value.rolloutRatios, editForm.value.rolloutDays, editForm.value.rolloutAutoRatio),
    rolloutProgress: normalizeRolloutProgress(editForm.value.rolloutProgress)
  })

  if (!updatedVersion) return

  editRolloutSnapshot.value = getRolloutPlanSignature(updatedVersion)
  versions.value = readMobileAppVersions(app.id)
  MessagePlugin.success('发布率已保存')
}

function isCurrentVersion (version) {
  if (currentVersionId.value) return version.id === currentVersionId.value
  return version.version === app.version && version.buildNumber === app.buildNumber
}
</script>
