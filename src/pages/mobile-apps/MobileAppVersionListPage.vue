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
          <span>{{ formatNumber(version.downloads) }}</span>
          <span>{{ version.updatedAt }}</span>
          <div class="mc-version-actions">
            <button class="mc-link-btn" @click="openEditDialog(version)">编辑版本</button>
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
          <div class="mc-form-group">
            <label>更新说明</label>
            <textarea v-model="form.releaseNotes" rows="4" placeholder="描述本次更新内容"></textarea>
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
                <option>Adhoc</option>
                <option>APK</option>
                <option>AAB</option>
                <option>IPA</option>
                <option>PWA</option>
              </select>
            </div>
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
        </div>
        <div class="mc-dialog-footer">
          <button class="mc-btn mc-btn-outline" @click="closeEditDialog">取消</button>
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
import { MessagePlugin } from 'tdesign-vue-next'
import { createMobileAppVersion, findMobileApp, readMobileAppVersions, updateMobileApp, updateMobileAppVersion } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const app = findMobileApp(route.params.id)
const versions = ref(app ? readMobileAppVersions(app.id) : [])
const currentVersionId = ref(app?.currentVersionId || '')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingVersionId = ref('')
const form = ref(buildForm())
const editForm = ref(buildEditForm())

function buildForm () {
  const nextBuild = String((Number(app?.buildNumber) || 100) + 1)
  return {
    version: app?.version || '1.0.0',
    buildNumber: nextBuild,
    size: app?.size || '0 MB',
    channel: '测试版',
    packageType: app?.platform === 'iOS' ? 'Adhoc' : app?.platform === 'Android' ? 'APK' : 'PWA',
    publisher: app?.team || '',
    releaseNotes: ''
  }
}

function buildEditForm (version = {}) {
  return {
    version: version.version || '',
    buildNumber: version.buildNumber || '',
    size: version.size || '',
    downloads: Number(version.downloads) || 0,
    channel: version.channel || '测试版',
    packageType: version.packageType || (app?.platform === 'iOS' ? 'Adhoc' : app?.platform === 'Android' ? 'APK' : 'PWA'),
    status: version.status || '测试中',
    publisher: version.publisher || app?.team || '',
    releaseNotes: version.releaseNotes || ''
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

function handleCreate () {
  if (!form.value.version.trim() || !form.value.buildNumber.trim()) {
    MessagePlugin.warning('请填写版本号和 Build 版本')
    return
  }

  const version = createMobileAppVersion(app.id, form.value)
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
  MessagePlugin.success('新版本已发布到版本列表')
}

function openEditDialog (version) {
  editingVersionId.value = version.id
  editForm.value = buildEditForm(version)
  showEditDialog.value = true
}

function closeEditDialog () {
  showEditDialog.value = false
  editingVersionId.value = ''
  editForm.value = buildEditForm()
}

function handleUpdateVersion () {
  if (!editForm.value.version.trim() || !editForm.value.buildNumber.trim()) {
    MessagePlugin.warning('请填写版本号和 Build 版本')
    return
  }

  const updatedVersion = updateMobileAppVersion(app.id, editingVersionId.value, {
    ...editForm.value,
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

function isCurrentVersion (version) {
  if (currentVersionId.value) return version.id === currentVersionId.value
  return version.version === app.version && version.buildNumber === app.buildNumber
}
</script>
