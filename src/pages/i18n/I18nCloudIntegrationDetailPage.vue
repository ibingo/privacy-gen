<template>
  <div class="i18n-cloud-detail-page">
    <t-breadcrumb class="i18n-cloud-detail-breadcrumb">
      <t-breadcrumb-item>国际化</t-breadcrumb-item>
      <t-breadcrumb-item>云集成</t-breadcrumb-item>
      <t-breadcrumb-item>{{ integration.name }}</t-breadcrumb-item>
    </t-breadcrumb>

    <section class="i18n-cloud-detail-summary">
      <div class="i18n-cloud-detail-title">
        <div>
          <h2>{{ integration.name }}</h2>
          <p>{{ integration.endpoint }}</p>
        </div>
        <t-space size="small">
          <t-tag variant="light">{{ integration.platform }}</t-tag>
          <t-tag theme="primary" variant="light">{{ integration.type }}</t-tag>
          <t-tag :theme="getStatusTheme(integration.statusTone)" variant="light">{{ integration.status }}</t-tag>
        </t-space>
      </div>
      <div class="i18n-cloud-detail-meta">
        <span>负责人：{{ integration.owner }}</span>
        <span>当前版本：{{ integration.currentVersion }}</span>
        <span>更新时间：{{ integration.updatedAt }}</span>
      </div>
    </section>

    <t-card class="i18n-cloud-detail-card" :bordered="false">
      <t-tabs v-model="activeTab" theme="normal">
        <t-tab-panel value="versions" label="版本控制">
          <div class="i18n-cloud-tab-panel">
            <div class="i18n-cloud-section-toolbar">
              <strong>版本记录</strong>
              <t-button theme="primary" @click="createVersion">新建版本</t-button>
            </div>
            <t-table row-key="version" :columns="versionColumns" :data="versions" :pagination="null">
              <template #status="{ row }">
                <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
              </template>
              <template #operation="{ row }">
                <t-space size="small">
                  <t-button theme="primary" variant="text" @click="previewVersion(row)">预览</t-button>
                  <t-button theme="primary" variant="text">回滚</t-button>
                </t-space>
              </template>
            </t-table>
          </div>
        </t-tab-panel>

        <t-tab-panel value="preview" label="实时预览">
          <div class="i18n-cloud-room-preview">
            <aside class="i18n-cloud-room-filter">
              <h3>房间列表</h3>
              <t-form :data="roomFilters" label-align="top">
                <t-form-item label="设备 ID">
                  <t-input v-model="roomFilters.deviceId" clearable placeholder="设备 ID" />
                </t-form-item>
                <t-form-item label="项目">
                  <t-input v-model="roomFilters.project" clearable placeholder="项目" />
                </t-form-item>
                <t-form-item label="标题">
                  <t-input v-model="roomFilters.title" clearable placeholder="标题" />
                </t-form-item>
                <t-form-item label="系统">
                  <t-select v-model="roomFilters.os" clearable placeholder="选择系统">
                    <t-option v-for="os in roomOsOptions" :key="os" :value="os" :label="os" />
                  </t-select>
                </t-form-item>
                <t-form-item label="平台">
                  <t-select v-model="roomFilters.platform" clearable placeholder="选择平台">
                    <t-option v-for="platform in roomPlatformOptions" :key="platform" :value="platform" :label="platform" />
                  </t-select>
                </t-form-item>
              </t-form>
              <div class="i18n-cloud-room-actions">
                <t-button theme="primary" @click="searchRooms">搜索</t-button>
                <t-button variant="outline" @click="resetRoomFilters">重置</t-button>
              </div>
              <p class="i18n-cloud-room-hint">当前待调试终端较多，请通过条件进一步筛选。</p>
            </aside>

            <div class="i18n-cloud-room-workspace">
              <div class="i18n-cloud-room-grid">
                <div
                  v-for="room in filteredPreviewRooms"
                  :key="room.id"
                  class="i18n-cloud-room-card"
                  :class="{ 'is-active': selectedRoomId === room.id }"
                  role="button"
                  tabindex="0"
                  @click="selectRoom(room)"
                  @keydown.enter="selectRoom(room)"
                >
                  <strong class="i18n-cloud-room-code">{{ room.code }}</strong>
                  <span class="i18n-cloud-room-glow"></span>
                  <div class="i18n-cloud-room-meta">
                    <span>Project</span>
                    <span>OS</span>
                    <span>Platform</span>
                    <strong>{{ room.project }}</strong>
                    <strong>{{ room.osIcon }}</strong>
                    <strong>{{ room.platformIcon }}</strong>
                  </div>
                  <t-button theme="primary" block @click.stop="openDebugDialog(room)">调试</t-button>
                </div>
              </div>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="logs" label="接入记录">
          <t-table row-key="id" :columns="logColumns" :data="accessLogs" :pagination="null">
            <template #result="{ row }">
              <t-tag :theme="row.result === '成功' ? 'success' : 'danger'" variant="light">{{ row.result }}</t-tag>
            </template>
          </t-table>
        </t-tab-panel>
      </t-tabs>
    </t-card>

    <t-dialog
      v-model:visible="debugDialogVisible"
      header="实时调试面板"
      width="880px"
      :footer="false"
      :destroy-on-close="false"
      @close="closeDebugDialog"
    >
      <div v-if="selectedRoom" class="i18n-cloud-live-debugger">
        <div class="i18n-cloud-live-debugger-head">
          <div>
            <strong>{{ selectedRoom.code }} 实时调试</strong>
            <span>{{ selectedRoom.deviceId }} · {{ selectedRoom.project }} · {{ selectedRoom.os }} / {{ selectedRoom.platform }}</span>
          </div>
          <t-tag theme="success" variant="light">已连接</t-tag>
        </div>

        <div class="i18n-cloud-live-debugger-body">
          <aside class="i18n-cloud-live-key-list">
            <strong>国际化 Key</strong>
            <button
              v-for="item in livePreviewWords"
              :key="item.key"
              type="button"
              :class="{ 'is-active': debugForm.key === item.key }"
              @click="selectDebugKey(item.key)"
            >
              <span>{{ item.title }}</span>
              <code>{{ item.key }}</code>
            </button>
          </aside>

          <div class="i18n-cloud-live-editor">
            <t-form :data="debugForm" label-align="top">
              <div class="i18n-cloud-live-editor-grid">
                <t-form-item label="国际化 Key">
                  <t-select v-model="debugForm.key" filterable placeholder="选择 Key">
                    <t-option v-for="item in livePreviewWords" :key="item.key" :value="item.key" :label="item.key" />
                  </t-select>
                </t-form-item>
                <t-form-item label="语种">
                  <t-select v-model="debugForm.locale" placeholder="选择语种">
                    <t-option v-for="locale in localeOptions" :key="locale.value" :value="locale.value" :label="locale.label" />
                  </t-select>
                </t-form-item>
              </div>
              <t-form-item label="调试文案">
                <t-textarea v-model="debugForm.value" :autosize="{ minRows: 5, maxRows: 8 }" placeholder="输入后推送到客户端实时预览" />
              </t-form-item>
            </t-form>
            <div class="i18n-cloud-live-editor-actions">
              <t-button variant="outline" @click="resetDebugWord">恢复当前语种文案</t-button>
              <t-button theme="primary" @click="pushDebugWord">推送到客户端</t-button>
            </div>
          </div>
        </div>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="versionDialogVisible"
      header="新建版本"
      width="760px"
      confirm-btn="创建版本"
      cancel-btn="取消"
      @confirm="submitVersion"
      @cancel="closeVersionDialog"
      @close="closeVersionDialog"
    >
      <div class="i18n-cloud-version-dialog">
        <t-form :data="versionForm" label-align="top">
          <div class="i18n-cloud-version-form-grid">
            <t-form-item label="应用">
              <t-select v-model="versionForm.appGroupId" filterable placeholder="选择移动应用" @change="handleVersionAppChange">
                <t-option v-for="app in mobileAppOptions" :key="app.value" :value="app.value" :label="app.label" />
              </t-select>
            </t-form-item>
            <t-form-item label="目标平台">
              <t-select v-model="versionForm.targetPlatforms" multiple placeholder="选择目标平台" @change="syncPlatformVersionConfigs">
                <t-option v-for="platform in selectedVersionAppPlatforms" :key="platform" :value="platform" :label="platform" />
              </t-select>
            </t-form-item>
            <t-form-item label="发布环境">
              <t-select v-model="versionForm.environment">
                <t-option value="production" label="生产环境" />
                <t-option value="staging" label="预发环境" />
                <t-option value="test" label="测试环境" />
              </t-select>
            </t-form-item>
          </div>
          <div class="i18n-cloud-platform-version-list">
            <div v-for="item in versionForm.platformVersions" :key="item.platform" class="i18n-cloud-platform-version-card">
              <div class="i18n-cloud-platform-version-head">
                <strong>{{ item.platform }}</strong>
                <t-tag variant="light">{{ selectedVersionApp?.name }}</t-tag>
              </div>
              <div class="i18n-cloud-platform-version-grid">
                <t-form-item label="版本号">
                  <t-input v-model="item.version" placeholder="例如 v2026.05.27-ios" />
                </t-form-item>
                <t-form-item label="Build">
                  <t-input v-model="item.buildNumber" placeholder="例如 100" />
                </t-form-item>
                <t-form-item label="灰度比例">
                  <t-input v-model="item.grayRatio" placeholder="例如 20%" />
                </t-form-item>
                <t-form-item label="缓存时间">
                  <t-input v-model="item.cacheTtl" placeholder="例如 300s" />
                </t-form-item>
              </div>
            </div>
          </div>
          <t-form-item label="版本说明">
            <t-textarea v-model="versionForm.remark" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="填写本次发布范围或变更说明" />
          </t-form-item>
        </t-form>

        <div class="i18n-cloud-version-config">
          <strong>发布配置</strong>
          <div class="i18n-cloud-checkbox-list">
            <t-checkbox v-model="versionForm.syncSource">同步源语种</t-checkbox>
            <t-checkbox v-model="versionForm.syncTargets">同步目标语种</t-checkbox>
            <t-checkbox v-model="versionForm.notifyWebhook">发布后通知 Webhook</t-checkbox>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Breadcrumb as TBreadcrumb,
  BreadcrumbItem as TBreadcrumbItem,
  Button as TButton,
  Card as TCard,
  Checkbox as TCheckbox,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  TabPanel as TTabPanel,
  Table as TTable,
  Tabs as TTabs,
  Tag as TTag,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import { readMobileAppGroups } from '../../config/mobileApps'

const route = useRoute()
const mobileAppGroups = readMobileAppGroups()
const activeTab = ref('versions')
const selectedRoomId = ref('room-002')
const debugDialogVisible = ref(false)
const versionDialogVisible = ref(false)
const roomFilters = ref({
  deviceId: '',
  project: '',
  title: '',
  os: '',
  platform: ''
})
const versionForm = ref({
  appGroupId: mobileAppGroups[0]?.id || '',
  targetPlatforms: mobileAppGroups[0]?.platforms || [],
  environment: 'production',
  platformVersions: buildPlatformVersionConfigs(mobileAppGroups[0]?.platforms || []),
  syncSource: true,
  syncTargets: true,
  notifyWebhook: true,
  remark: ''
})

const integrations = [
  { id: 'cloud-001', name: '生产 CDN 分发', platform: 'Web', type: 'CDN 分发', endpoint: 'https://cdn.example.com/i18n', owner: '张楠', status: '已启用', statusTone: 'success', currentVersion: 'v2026.05.08', updatedAt: '2026-05-08 11:20' },
  { id: 'cloud-002', name: 'App 远程配置', platform: 'APP', type: '配置中心', endpoint: 'https://config.example.com/mobile/i18n', owner: '李晨', status: '已启用', statusTone: 'success', currentVersion: 'v2026.05.08-app', updatedAt: '2026-05-08 10:18' },
  { id: 'cloud-003', name: '翻译发布 Webhook', platform: '全部平台', type: 'Webhook', endpoint: 'https://ops.example.com/hooks/i18n-release', owner: '王璐', status: '待验证', statusTone: 'warning', currentVersion: 'v2026.05.07', updatedAt: '2026-05-07 18:42' },
  { id: 'cloud-004', name: '小程序云函数同步', platform: 'MiniApp', type: '云函数', endpoint: 'wx-cloud://i18n-sync', owner: '陈曦', status: '停用', statusTone: 'default', currentVersion: 'v2026.05.07-mini', updatedAt: '2026-05-07 16:30' }
]

const integration = computed(() => integrations.find((item) => item.id === route.params.id) || integrations[1])
const mobileAppOptions = computed(() => mobileAppGroups.map((app) => ({
  value: app.id,
  label: `${app.name} · ${app.platforms.join(' / ')}`
})))
const selectedVersionApp = computed(() => mobileAppGroups.find((app) => app.id === versionForm.value.appGroupId) || mobileAppGroups[0] || null)
const selectedVersionAppPlatforms = computed(() => selectedVersionApp.value?.platforms || [])

const previewRooms = [
  { id: 'room-001', code: '31c7', deviceId: 'ios-31c7', title: '首页隐私弹窗', project: 'Privacy', os: 'iOS', osIcon: 'iOS', platform: 'Chrome', platformIcon: 'Chrome' },
  { id: 'room-002', code: 'd9bb', deviceId: 'ios-d9bb', title: 'App 远程配置', project: 'Privacy', os: 'iOS', osIcon: 'iOS', platform: 'Chrome', platformIcon: 'Chrome' },
  { id: 'room-003', code: '8bb8', deviceId: 'ios-8bb8', title: '协议导出页', project: 'Legal', os: 'iOS', osIcon: 'iOS', platform: 'Chrome', platformIcon: 'Chrome' },
  { id: 'room-004', code: '9f35', deviceId: 'ios-9f35', title: '英文设置页', project: 'I18n', os: 'iOS', osIcon: 'iOS', platform: 'Chrome', platformIcon: 'Chrome' },
  { id: 'room-005', code: '690f', deviceId: 'ios-690f', title: '日语启动页', project: 'Launch', os: 'iOS', osIcon: 'iOS', platform: 'Chrome', platformIcon: 'Chrome' },
  { id: 'room-006', code: 'db60', deviceId: 'ios-db60', title: 'SDK 表单', project: 'Privacy', os: 'iOS', osIcon: 'iOS', platform: 'Chrome', platformIcon: 'Chrome' },
  { id: 'room-007', code: '3889', deviceId: 'ios-3889', title: 'Safari 预览', project: 'Legal', os: 'iOS', osIcon: 'iOS', platform: 'Safari', platformIcon: 'Safari' },
  { id: 'room-008', code: 'f1d1', deviceId: 'ios-f1d1', title: '移动端审核', project: 'I18n', os: 'iOS', osIcon: 'iOS', platform: 'Safari', platformIcon: 'Safari' },
  { id: 'room-009', code: 'd77f', deviceId: 'mac-d77f', title: '桌面调试', project: 'Privacy', os: 'macOS', osIcon: 'macOS', platform: 'Desktop', platformIcon: 'Desktop' },
  { id: 'room-010', code: '8ed9', deviceId: 'ios-8ed9', title: '海外语言包', project: 'Global', os: 'iOS', osIcon: 'iOS', platform: 'Chrome', platformIcon: 'Chrome' }
]
const roomOsOptions = [...new Set(previewRooms.map((room) => room.os))]
const roomPlatformOptions = [...new Set(previewRooms.map((room) => room.platform))]
const livePreviewWords = ref([
  { key: 'privacy.title', title: '隐私政策标题', values: { 'zh-Hans': '隐私政策', 'zh-Hant': '隱私政策', en: 'Privacy Policy', ja: 'プライバシーポリシー' } },
  { key: 'agreement.export.button', title: '协议导出按钮', values: { 'zh-Hans': '导出协议', 'zh-Hant': '匯出協議', en: 'Export Agreement', ja: '同意書をエクスポート' } },
  { key: 'layout.notification.empty', title: '通知空状态', values: { 'zh-Hans': '暂无通知', 'zh-Hant': '暫無通知', en: 'No notifications', ja: '通知はありません' } },
  { key: 'settings.language.target', title: '目标语种设置', values: { 'zh-Hans': '目标语种', 'zh-Hant': '目標語種', en: 'Target Language', ja: '対象言語' } }
])
const localeOptions = [
  { value: 'zh-Hans', label: '简体中文（zh-Hans）' },
  { value: 'zh-Hant', label: '繁体中文（zh-Hant）' },
  { value: 'en', label: 'English（en）' },
  { value: 'ja', label: '日本語（ja）' }
]
const debugForm = ref({
  key: livePreviewWords.value[0].key,
  locale: 'zh-Hans',
  value: livePreviewWords.value[0].values['zh-Hans']
})
const selectedRoom = computed(() => previewRooms.find((room) => room.id === selectedRoomId.value))
const filteredPreviewRooms = computed(() => {
  const filters = roomFilters.value
  return previewRooms.filter((room) => {
    const matchDevice = !filters.deviceId || room.deviceId.toLowerCase().includes(filters.deviceId.trim().toLowerCase())
    const matchProject = !filters.project || room.project.toLowerCase().includes(filters.project.trim().toLowerCase())
    const matchTitle = !filters.title || room.title.toLowerCase().includes(filters.title.trim().toLowerCase())
    const matchOs = !filters.os || room.os === filters.os
    const matchPlatform = !filters.platform || room.platform === filters.platform
    return matchDevice && matchProject && matchTitle && matchOs && matchPlatform
  })
})

const versions = [
  { version: 'v2026.05.08-app', environment: '生产环境', status: '已发布', statusTone: 'success', author: '李晨', publishedAt: '2026-05-08 10:18' },
  { version: 'v2026.05.07-app', environment: '预发环境', status: '待发布', statusTone: 'warning', author: '王璐', publishedAt: '2026-05-07 19:30' },
  { version: 'v2026.05.06-app', environment: '生产环境', status: '已归档', statusTone: 'default', author: '陈曦', publishedAt: '2026-05-06 21:12' }
]
const versionColumns = [
  { colKey: 'version', title: '版本号', minWidth: 180 },
  { colKey: 'environment', title: '环境', width: 120 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'author', title: '发布人', width: 100 },
  { colKey: 'publishedAt', title: '发布时间', width: 170 },
  { colKey: 'operation', title: '操作', width: 140, fixed: 'right' }
]

const accessLogs = [
  { id: 'log-001', client: 'Privacy Gen iOS', version: '2.4.1', locale: 'zh-Hans', result: '成功', requestedAt: '2026-05-08 11:32' },
  { id: 'log-002', client: 'Privacy Gen Android', version: '2.4.0', locale: 'en', result: '成功', requestedAt: '2026-05-08 11:28' },
  { id: 'log-003', client: 'Compliance Hub iOS', version: '5.2.0', locale: 'ja', result: '失败', requestedAt: '2026-05-08 10:42' }
]
const logColumns = [
  { colKey: 'client', title: '客户端', minWidth: 180 },
  { colKey: 'version', title: '版本', width: 100 },
  { colKey: 'locale', title: '语种', width: 120 },
  { colKey: 'result', title: '结果', width: 100 },
  { colKey: 'requestedAt', title: '请求时间', width: 170 }
]

watch(
  () => [debugForm.value.key, debugForm.value.locale],
  () => {
    resetDebugWord()
  }
)

function createVersion () {
  versionDialogVisible.value = true
}

function closeVersionDialog () {
  versionDialogVisible.value = false
}

function handleVersionAppChange () {
  versionForm.value.targetPlatforms = [...selectedVersionAppPlatforms.value]
  syncPlatformVersionConfigs()
}

function buildPlatformVersionConfigs (platforms, previous = []) {
  return platforms.map((platform) => {
    const oldConfig = previous.find((item) => item.platform === platform)
    if (oldConfig) return oldConfig
    const suffix = String(platform || 'app').toLowerCase().replace(/\s+/g, '-')
    return {
      platform,
      version: `v2026.05.27-${suffix}`,
      buildNumber: '100',
      grayRatio: '20%',
      cacheTtl: '300s'
    }
  })
}

function syncPlatformVersionConfigs () {
  versionForm.value.platformVersions = buildPlatformVersionConfigs(
    versionForm.value.targetPlatforms,
    versionForm.value.platformVersions
  )
}

function previewVersion (row) {
  activeTab.value = 'preview'
  MessagePlugin.success(`正在预览 ${row.version}`)
}

function selectRoom (room) {
  selectedRoomId.value = room.id
}

function openDebugDialog (room) {
  selectedRoomId.value = room.id
  resetDebugWord()
  debugDialogVisible.value = true
}

function closeDebugDialog () {
  debugDialogVisible.value = false
}

function selectDebugKey (key) {
  debugForm.value.key = key
}

function searchRooms () {
  MessagePlugin.success(`已筛选出 ${filteredPreviewRooms.value.length} 个预览房间`)
}

function resetRoomFilters () {
  roomFilters.value = {
    deviceId: '',
    project: '',
    title: '',
    os: '',
    platform: ''
  }
}

function resetDebugWord () {
  const currentWord = livePreviewWords.value.find((item) => item.key === debugForm.value.key)
  debugForm.value.value = currentWord?.values?.[debugForm.value.locale] || ''
}

function pushDebugWord () {
  const currentWord = livePreviewWords.value.find((item) => item.key === debugForm.value.key)
  if (currentWord?.values) {
    currentWord.values[debugForm.value.locale] = debugForm.value.value
  }
  MessagePlugin.success(`已将 ${debugForm.value.key}（${debugForm.value.locale}）推送到 ${selectedRoom.value?.code || '客户端'}`)
}

function submitVersion () {
  const appName = selectedVersionApp.value?.name || '应用'
  MessagePlugin.success(`已为 ${appName} 创建 ${versionForm.value.platformVersions.length} 个平台版本`)
  closeVersionDialog()
}

function getStatusTheme (tone) {
  const themeMap = {
    success: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}
</script>
