<template>
  <div class="icon-editor-page" @click="closeContextMenu">
    <div class="icon-editor-header">
      <div>
        <div class="icon-editor-kicker-row">
          <button type="button" title="返回图标工作区" @click="goBackWorkspace">
            <arrow-left-icon />
          </button>
          <p class="icon-editor-kicker">Icon 图标资源</p>
        </div>
        <h2>{{ draft.name }}</h2>
        <span>{{ draft.figmaFrame }}</span>
      </div>
      <div class="icon-editor-header-actions">
        <label class="icon-secondary-button">
          <logo-figma-icon />
          导入 Figma 文件
          <input ref="fileInput" type="file" accept=".fig,.json,.svg" @change="handleFigmaImport" />
        </label>
        <button class="icon-secondary-button" type="button" @click="saveDraft">
          <save-icon />
          保存
        </button>
        <button class="document-primary-button" type="button" @click="copyExport('compose')">
          <code-icon />
          导出 Compose
        </button>
      </div>
    </div>

    <div class="icon-editor-layout">
      <aside class="icon-category-nav icon-editor-side">
        <div class="icon-history-panel">
          <div class="icon-history-header">
            <h3>操作历史</h3>
            <button type="button" :disabled="!historyEntries.length" @click="undoLastChange">回退</button>
          </div>
          <div v-if="historyEntries.length" class="icon-history-list">
            <button
              v-for="entry in historyEntries"
              :key="entry.id"
              type="button"
              @click="openHistoryConfirmDialog(entry)"
            >
              <span class="icon-history-entry-title">{{ entry.label }}</span>
              <small class="icon-history-entry-detail">{{ entry.detail }}</small>
              <small class="icon-history-entry-time">{{ entry.time }}</small>
            </button>
          </div>
          <p v-else>暂无修改记录</p>
        </div>
      </aside>

      <main class="icon-canvas-panel">
        <div class="icon-canvas-toolbar">
          <div class="icon-canvas-meta">
            <span>{{ draft.name }}</span>
            <span>{{ settings.size }} x {{ settings.size }}</span>
          </div>
          <div class="icon-canvas-actions">
            <button type="button" title="Compose ImageVector" @click="copyExport('compose')">
              <code-icon />
            </button>
            <button type="button" title="Android Vector XML" @click="copyExport('android')">
              <logo-android-icon />
            </button>
          </div>
        </div>

        <div
          ref="canvasRef"
          class="icon-canvas-stage"
          @contextmenu.prevent.stop="openContextMenu"
          @wheel="handleCanvasWheel"
        >
          <div class="icon-grid-background"></div>
          <div class="icon-canvas-zoom-toolbar" @click.stop>
            <button
              type="button"
              title="缩小"
              :disabled="canvasZoom <= minCanvasZoom"
              @click="zoomOut"
            >
              <zoom-out-icon />
            </button>
            <span>{{ zoomPercent }}</span>
            <button
              type="button"
              title="放大"
              :disabled="canvasZoom >= maxCanvasZoom"
              @click="zoomIn"
            >
              <zoom-in-icon />
            </button>
            <button type="button" title="重置缩放" @click="resetCanvasZoom">1:1</button>
          </div>
          <div
            class="icon-preview-board"
            :style="{ transform: `scale(${canvasZoom})` }"
          >
            <IconGlyph
              :paths="draft.paths"
              :stroke-width="settings.strokeWidth"
              :icon-type="settings.iconType"
              :color-mode="settings.colorMode"
              :primary-color="settings.primaryColor"
              :secondary-color="settings.secondaryColor"
              :selected-path-index="selectedPathIndex"
              @select-path="selectPath"
            />
          </div>
          <div v-if="!hasImportedPaths" class="icon-canvas-placeholder">
            <upload-icon />
            <span>导入 SVG 或 Figma JSON 后解析图标路径</span>
          </div>
          <div
            v-if="contextMenu.visible"
            class="icon-context-menu"
            :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
            @click.stop
          >
            <button type="button" @click="copyExport('compose')">
              <code-icon />
              导出 compose-imagevector
            </button>
            <button type="button" @click="copyExport('android')">
              <logo-android-icon />
              导出 android-vector-xml
            </button>
          </div>
        </div>

        <div class="icon-code-panel">
          <div class="icon-code-header">
            <span>{{ exportTitle }}</span>
            <button type="button" @click="copyCurrentCode">复制</button>
          </div>
          <pre><code>{{ exportCode }}</code></pre>
        </div>
      </main>

      <aside class="icon-editor-inspector">
        <section class="icon-inspector-block">
          <h3>基础信息</h3>
          <label class="icon-field">
            <span>图标名称</span>
            <input v-model="draft.name" type="text" @input="markHistory('修改图标名称')" />
          </label>
          <label class="icon-field">
            <span>Figma Frame</span>
            <input v-model="draft.figmaFrame" type="text" @input="markHistory('修改 Figma Frame')" />
          </label>
          <label class="icon-field">
            <span>图标尺寸</span>
            <input v-model.number="settings.size" type="number" min="12" max="96" step="1" @input="markHistory('调整图标尺寸')" />
          </label>
          <label class="icon-field">
            <span>分类</span>
            <select :value="draft.category" @change="setDraftCategory($event.target.value)">
              <option value="">未分类</option>
              <option
                v-for="category in iconCategories"
                :key="category.value"
                :value="category.value"
              >
                {{ category.label }}
              </option>
            </select>
          </label>
        </section>

        <section v-if="settings.iconType === 'stroke'" class="icon-inspector-block">
          <h3>线条粗细</h3>
          <input v-model.number="settings.strokeWidth" class="icon-range" type="range" min="0.5" max="2.5" step="0.5" @input="markHistory('调整线条粗细')" />
          <div class="icon-range-scale">
            <span>0.5</span>
            <span>1</span>
            <span>1.5</span>
            <span>2</span>
            <span>2.5</span>
          </div>
        </section>

        <section class="icon-inspector-block">
          <h3>Icon 类型</h3>
          <div class="icon-segment">
            <button
              type="button"
              :class="{ 'is-active': settings.iconType === 'stroke' }"
              @click="setIconType('stroke')"
            >
              描边
            </button>
            <button
              type="button"
              :class="{ 'is-active': settings.iconType === 'fill' }"
              @click="setIconType('fill')"
            >
              填充
            </button>
          </div>
        </section>

        <section class="icon-inspector-block">
          <h3>{{ settings.iconType === 'fill' ? '填充颜色' : '图标颜色' }}</h3>
          <label class="icon-color-field">
            <span>{{ settings.iconType === 'fill' ? '填充颜色' : '线条颜色1' }}</span>
            <input v-model="settings.primaryColor" type="color" @input="markHistory(settings.iconType === 'fill' ? '调整填充颜色' : '调整线条颜色1')" />
            <input v-model="settings.primaryColor" type="text" @input="markHistory(settings.iconType === 'fill' ? '调整填充颜色' : '调整线条颜色1')" />
          </label>
          <button class="icon-reset-button" type="button" @click="resetSettings">重置</button>
        </section>

        <section class="icon-inspector-block">
          <h3>Path 颜色</h3>
          <label class="icon-field">
            <span>选中 Path</span>
            <select v-model.number="selectedPathSelectValue">
              <option :value="-1">未选中</option>
              <option
                v-for="(path, index) in draft.paths"
                :key="`${path.d}-${index}`"
                :value="index"
              >
                Path {{ index + 1 }} - {{ getPathSummary(path.d) }}
              </option>
            </select>
          </label>
          <div v-if="selectedPath" class="icon-path-editor">
            <p>当前选中 Path {{ selectedPathIndex + 1 }}</p>
            <label class="icon-color-field">
              <span>颜色</span>
              <input v-model="selectedPathColor" type="color" />
              <input v-model="selectedPathColor" type="text" />
            </label>
            <button class="icon-reset-button" type="button" @click="clearSelectedPathColor">使用全局颜色</button>
          </div>
          <p v-else class="icon-inspector-hint">点击画布中的某一段 path 后，可单独调整颜色。</p>
        </section>
      </aside>
    </div>

    <div v-if="leaveDialog.visible" class="icon-dialog-mask" @click.self="closeLeaveDialog">
      <div class="icon-dialog">
        <h3>返回图标工作区</h3>
        <p class="icon-dialog-message">当前图标有新增操作尚未保存，确认返回吗？</p>
        <div class="icon-dialog-actions">
          <button class="icon-secondary-button" type="button" @click="closeLeaveDialog">取消</button>
          <button class="document-primary-button" type="button" @click="confirmLeaveWorkspace">确认返回</button>
        </div>
      </div>
    </div>

    <div v-if="historyConfirmDialog.visible" class="icon-dialog-mask" @click.self="closeHistoryConfirmDialog">
      <div class="icon-dialog">
        <h3>回退到历史记录</h3>
        <p class="icon-dialog-message">
          确认回退到「{{ historyConfirmDialog.entry?.label }}」吗？当前记录之后的历史会被移除。
        </p>
        <p v-if="historyConfirmDialog.entry?.detail" class="icon-dialog-message">
          {{ historyConfirmDialog.entry.detail }}
        </p>
        <div class="icon-dialog-actions">
          <button class="icon-secondary-button" type="button" @click="closeHistoryConfirmDialog">取消</button>
          <button class="document-primary-button" type="button" @click="confirmRestoreHistoryEntry">确认回退</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, CodeIcon, LogoAndroidIcon, LogoFigmaIcon, SaveIcon, UploadIcon, ZoomInIcon, ZoomOutIcon } from 'tdesign-icons-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import IconGlyph from '../../components/IconGlyph.vue'
import { defaultIconProjectId, findIconProject, setActiveIconProjectId } from '../../config/iconProjects'
import {
  createBlankIcon,
  findIconAsset,
  readIconCategories,
  readIconHistory,
  upsertIcon,
  writeIconHistory
} from '../../utils/iconLibrary'
import { parseIconImportFile } from '../../utils/figmaImport'
import { normalizePathItems } from '../../utils/pathData'
import { buildAndroidVectorXml, buildComposeImageVector } from '../../utils/vectorExport'

const route = useRoute()
const router = useRouter()
const canvasRef = ref(null)
const fileInput = ref(null)
const exportFormat = ref('compose')
const selectedPathIndex = ref(-1)
const minCanvasZoom = 0.5
const maxCanvasZoom = 3
const zoomStep = 0.1
const canvasZoom = ref(1)
const maxHistoryEntries = 30
const historyEntries = ref([])
const historyBaseline = ref(null)
const historyTimer = ref(null)
const pendingHistoryLabel = ref('')
const isApplyingHistory = ref(false)
const lastSavedSnapshot = ref(null)
const activeProjectId = computed(() => route.params.projectId || defaultIconProjectId)
const activeProject = computed(() => findIconProject(activeProjectId.value))
const iconCategories = ref(readIconCategories(activeProjectId.value))

const sourceIcon = route.params.id ? findIconAsset(route.params.id, activeProjectId.value) : createBlankIcon()
const draft = reactive({
  ...sourceIcon,
  paths: normalizePathItems(sourceIcon.paths).map((path) => ({ ...path }))
})
const settings = reactive({
  strokeWidth: 2,
  iconType: sourceIcon.iconType || 'stroke',
  colorMode: 'single',
  primaryColor: '#111827',
  secondaryColor: '#0052d9',
  size: 24
})
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0
})
const leaveDialog = reactive({
  visible: false
})
const historyConfirmDialog = reactive({
  visible: false,
  entry: null
})

const exportCode = computed(() => {
  if (exportFormat.value === 'android') {
    return buildAndroidVectorXml(draft, settings)
  }

  return buildComposeImageVector(draft, settings)
})
const exportTitle = computed(() => (
  exportFormat.value === 'android' ? 'android-vector-xml' : 'compose-imagevector'
))
const zoomPercent = computed(() => `${Math.round(canvasZoom.value * 100)}%`)
const hasImportedPaths = computed(() => {
  return draft.paths.length > 1 || draft.paths[0]?.d !== 'M12 5v14M5 12h14'
})
const selectedPath = computed(() => draft.paths[selectedPathIndex.value] || null)
const selectedPathSelectValue = computed({
  get() {
    return selectedPathIndex.value
  },
  set(value) {
    selectedPathIndex.value = Number(value)
  }
})
const selectedPathColor = computed({
  get() {
    return draft.paths[selectedPathIndex.value]?.color || settings.primaryColor
  },
  set(value) {
    const index = selectedPathIndex.value
    if (!draft.paths[index]) return
    markHistory(`调整 Path ${index + 1} 颜色`)
    draft.paths[index] = {
      ...draft.paths[index],
      color: value
    }
  }
})

const leaveWorkspace = () => {
  router.push({ name: 'icon-list', params: { projectId: activeProjectId.value } })
}

const goBackWorkspace = () => {
  commitPendingHistory()
  if (hasUnsavedChanges()) {
    leaveDialog.visible = true
    return
  }
  leaveWorkspace()
}

const closeLeaveDialog = () => {
  leaveDialog.visible = false
}

const confirmLeaveWorkspace = () => {
  closeLeaveDialog()
  leaveWorkspace()
}

watch(
  () => [route.params.projectId, route.params.id],
  ([projectId, id]) => {
    isApplyingHistory.value = true
    setActiveIconProjectId(projectId || defaultIconProjectId)
    const icon = id ? findIconAsset(id, projectId || defaultIconProjectId) : createBlankIcon()
    iconCategories.value = readIconCategories(projectId || defaultIconProjectId)
    Object.assign(draft, {
      ...icon,
      paths: normalizePathItems(icon.paths).map((path) => ({ ...path }))
    })
    selectedPathIndex.value = -1
    settings.iconType = icon.iconType || 'stroke'
    settings.colorMode = 'single'
    resetHistoryBaseline()
    resetSavedSnapshot()
    loadStoredHistory(draft.id, projectId || defaultIconProjectId)
    nextTick(() => {
      isApplyingHistory.value = false
    })
  },
  { immediate: true }
)

watch(
  draft,
  () => {
    queueHistoryEntry()
  },
  { deep: true }
)

watch(
  settings,
  () => {
    queueHistoryEntry()
  },
  { deep: true }
)

onMounted(() => {
  if (route.query.import === 'figma') {
    fileInput.value?.click()
  }
})

const openContextMenu = (event) => {
  const rect = canvasRef.value.getBoundingClientRect()
  contextMenu.x = Math.min(event.clientX - rect.left, rect.width - 260)
  contextMenu.y = Math.min(event.clientY - rect.top, rect.height - 120)
  contextMenu.visible = true
}

const closeContextMenu = () => {
  contextMenu.visible = false
}

const selectPath = (index) => {
  selectedPathIndex.value = index
}

function getClonedDraft() {
  return JSON.parse(JSON.stringify(draft))
}

function getClonedSettings() {
  return { ...settings }
}

function createHistorySnapshot(label = '编辑图标') {
  return {
    id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    detail: '',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    draft: getClonedDraft(),
    settings: getClonedSettings(),
    selectedPathIndex: selectedPathIndex.value
  }
}

function serializeHistorySnapshot(snapshot) {
  return JSON.stringify({
    draft: snapshot?.draft,
    settings: snapshot?.settings
  })
}

function resetHistoryBaseline() {
  if (historyTimer.value) {
    clearTimeout(historyTimer.value)
    historyTimer.value = null
  }
  historyEntries.value = []
  pendingHistoryLabel.value = ''
  historyBaseline.value = createHistorySnapshot('初始状态')
}

function createComparableSnapshot() {
  return JSON.stringify({
    draft: getClonedDraft(),
    settings: getClonedSettings()
  })
}

function resetSavedSnapshot() {
  lastSavedSnapshot.value = createComparableSnapshot()
}

function hasUnsavedChanges() {
  return createComparableSnapshot() !== lastSavedSnapshot.value
}

function normalizeHistoryEntry(entry) {
  if (!entry?.draft || !entry?.settings) return null
  return {
    id: entry.id || `history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: entry.label || '编辑图标',
    detail: entry.detail || '',
    time: entry.time || '',
    draft: {
      ...entry.draft,
      paths: normalizePathItems(entry.draft.paths).map((path) => ({ ...path }))
    },
    settings: { ...settings, ...entry.settings },
    selectedPathIndex: Number.isInteger(entry.selectedPathIndex) ? entry.selectedPathIndex : -1
  }
}

function formatHistoryValue(value) {
  if (value === undefined || value === null || value === '') return '空'
  return String(value)
}

function getCategoryLabel(value) {
  if (!value) return '未分类'
  return iconCategories.value.find((category) => category.value === value)?.label || value
}

function getIconTypeLabel(value) {
  return value === 'fill' ? '填充' : '描边'
}

function getColorModeLabel(value) {
  return value === 'dual' ? '双色' : '单色'
}

function getChangedPathIndexes(beforePaths = [], afterPaths = []) {
  const maxLength = Math.max(beforePaths.length, afterPaths.length)
  const indexes = []
  for (let index = 0; index < maxLength; index += 1) {
    if (JSON.stringify(beforePaths[index] || null) !== JSON.stringify(afterPaths[index] || null)) {
      indexes.push(index)
    }
  }
  return indexes
}

function buildHistoryDetail(beforeSnapshot, afterSnapshot) {
  const beforeDraft = beforeSnapshot?.draft || {}
  const afterDraft = afterSnapshot?.draft || {}
  const beforeSettings = beforeSnapshot?.settings || {}
  const afterSettings = afterSnapshot?.settings || {}
  const details = []

  if (beforeDraft.name !== afterDraft.name) {
    details.push(`名称 ${formatHistoryValue(beforeDraft.name)} -> ${formatHistoryValue(afterDraft.name)}`)
  }
  if (beforeDraft.figmaFrame !== afterDraft.figmaFrame) {
    details.push(`Frame ${formatHistoryValue(beforeDraft.figmaFrame)} -> ${formatHistoryValue(afterDraft.figmaFrame)}`)
  }
  if (beforeDraft.category !== afterDraft.category) {
    details.push(`分类 ${getCategoryLabel(beforeDraft.category)} -> ${getCategoryLabel(afterDraft.category)}`)
  }
  if (beforeSettings.size !== afterSettings.size) {
    details.push(`尺寸 ${formatHistoryValue(beforeSettings.size)} -> ${formatHistoryValue(afterSettings.size)}`)
  }
  if (beforeSettings.strokeWidth !== afterSettings.strokeWidth) {
    details.push(`线宽 ${formatHistoryValue(beforeSettings.strokeWidth)} -> ${formatHistoryValue(afterSettings.strokeWidth)}`)
  }
  if (beforeSettings.iconType !== afterSettings.iconType) {
    details.push(`类型 ${getIconTypeLabel(beforeSettings.iconType)} -> ${getIconTypeLabel(afterSettings.iconType)}`)
  }
  if (beforeSettings.colorMode !== afterSettings.colorMode) {
    details.push(`颜色模式 ${getColorModeLabel(beforeSettings.colorMode)} -> ${getColorModeLabel(afterSettings.colorMode)}`)
  }
  if (beforeSettings.primaryColor !== afterSettings.primaryColor) {
    details.push(`颜色1 ${formatHistoryValue(beforeSettings.primaryColor)} -> ${formatHistoryValue(afterSettings.primaryColor)}`)
  }
  if (beforeSettings.secondaryColor !== afterSettings.secondaryColor) {
    details.push(`颜色2 ${formatHistoryValue(beforeSettings.secondaryColor)} -> ${formatHistoryValue(afterSettings.secondaryColor)}`)
  }

  const beforePaths = beforeDraft.paths || []
  const afterPaths = afterDraft.paths || []
  if (beforePaths.length !== afterPaths.length) {
    details.push(`Path 数量 ${beforePaths.length} -> ${afterPaths.length}`)
  } else {
    const changedPathIndexes = getChangedPathIndexes(beforePaths, afterPaths)
    changedPathIndexes.slice(0, 3).forEach((index) => {
      const beforeColor = beforePaths[index]?.color
      const afterColor = afterPaths[index]?.color
      if (beforeColor !== afterColor) {
        details.push(`Path ${index + 1} 颜色 ${formatHistoryValue(beforeColor)} -> ${formatHistoryValue(afterColor)}`)
      } else {
        details.push(`Path ${index + 1} 路径已更新`)
      }
    })
    if (changedPathIndexes.length > 3) {
      details.push(`另有 ${changedPathIndexes.length - 3} 条 Path 变化`)
    }
  }

  return details.length ? details.join('；') : '已更新图标配置'
}

function loadStoredHistory(iconId, projectId) {
  const storedHistory = readIconHistory(iconId, projectId)
  const entries = Array.isArray(storedHistory?.entries)
    ? storedHistory.entries.map(normalizeHistoryEntry).filter(Boolean)
    : []
  historyEntries.value = entries.slice(0, maxHistoryEntries)
}

function commitPendingHistory() {
  if (isApplyingHistory.value || !historyBaseline.value) return
  if (historyTimer.value) {
    clearTimeout(historyTimer.value)
    historyTimer.value = null
  }

  const currentSnapshot = createHistorySnapshot('当前状态')
  if (serializeHistorySnapshot(currentSnapshot) === serializeHistorySnapshot(historyBaseline.value)) return

  historyEntries.value = [
    {
      ...historyBaseline.value,
      id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: pendingHistoryLabel.value || '编辑图标',
      detail: buildHistoryDetail(historyBaseline.value, currentSnapshot),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    },
    ...historyEntries.value
  ].slice(0, maxHistoryEntries)

  historyBaseline.value = currentSnapshot
  pendingHistoryLabel.value = ''
}

function persistHistory(iconId, projectId) {
  writeIconHistory(iconId, {
    entries: historyEntries.value.map((entry) => ({
      ...entry,
      draft: {
        ...entry.draft,
        paths: entry.draft.paths.map((path) => ({ ...path }))
      },
      settings: { ...entry.settings }
    }))
  }, projectId)
}

const markHistory = (label) => {
  pendingHistoryLabel.value = label
}

const queueHistoryEntry = () => {
  if (isApplyingHistory.value || !historyBaseline.value) return
  if (historyTimer.value) clearTimeout(historyTimer.value)

  historyTimer.value = window.setTimeout(() => {
    historyTimer.value = null
    commitPendingHistory()
  }, 280)
}

const applyHistorySnapshot = (snapshot) => {
  isApplyingHistory.value = true
  Object.assign(settings, snapshot.settings)
  settings.colorMode = 'single'
  Object.assign(draft, {
    ...snapshot.draft,
    paths: normalizePathItems(snapshot.draft.paths).map((path) => ({ ...path }))
  })
  selectedPathIndex.value = snapshot.selectedPathIndex
  historyBaseline.value = createHistorySnapshot('当前状态')
  pendingHistoryLabel.value = ''
  nextTick(() => {
    isApplyingHistory.value = false
  })
}

const undoLastChange = () => {
  const [latestEntry] = historyEntries.value
  if (!latestEntry) return
  applyHistorySnapshot(latestEntry)
  historyEntries.value = historyEntries.value.slice(1)
}

const restoreHistoryEntry = (entryId) => {
  const entryIndex = historyEntries.value.findIndex((entry) => entry.id === entryId)
  if (entryIndex < 0) return
  applyHistorySnapshot(historyEntries.value[entryIndex])
  historyEntries.value = historyEntries.value.slice(entryIndex + 1)
}

const openHistoryConfirmDialog = (entry) => {
  historyConfirmDialog.visible = true
  historyConfirmDialog.entry = entry
}

const closeHistoryConfirmDialog = () => {
  historyConfirmDialog.visible = false
  historyConfirmDialog.entry = null
}

const confirmRestoreHistoryEntry = () => {
  if (!historyConfirmDialog.entry) return
  const entryId = historyConfirmDialog.entry.id
  closeHistoryConfirmDialog()
  restoreHistoryEntry(entryId)
}

const setDraftCategory = (category) => {
  markHistory('调整分类')
  draft.category = category
}

const setIconType = (type) => {
  if (settings.iconType === type) return
  markHistory('切换 Icon 类型')
  settings.iconType = type
  settings.colorMode = 'single'
}

const setCanvasZoom = (value) => {
  const nextValue = Math.min(maxCanvasZoom, Math.max(minCanvasZoom, value))
  canvasZoom.value = Number(nextValue.toFixed(2))
}

const zoomIn = () => {
  setCanvasZoom(canvasZoom.value + zoomStep)
}

const zoomOut = () => {
  setCanvasZoom(canvasZoom.value - zoomStep)
}

const resetCanvasZoom = () => {
  canvasZoom.value = 1
}

const handleCanvasWheel = (event) => {
  if (!event.ctrlKey) return
  event.preventDefault()
  setCanvasZoom(canvasZoom.value + (event.deltaY < 0 ? zoomStep : -zoomStep))
}

const getPathSummary = (pathData) => {
  const value = String(pathData || '').replace(/\s+/g, ' ').trim()
  return value.length > 28 ? `${value.slice(0, 28)}...` : value
}

const copyText = async (text, message) => {
  try {
    await navigator.clipboard.writeText(text)
    MessagePlugin.success(message)
  } catch {
    MessagePlugin.error('复制失败，请检查浏览器剪贴板权限')
  }
}

const copyExport = async (format) => {
  exportFormat.value = format
  closeContextMenu()
  await copyText(exportCode.value, `${exportTitle.value} 已复制`)
}

const copyCurrentCode = () => {
  copyText(exportCode.value, '代码已复制')
}

const resetSettings = () => {
  markHistory('重置图标样式')
  const currentIconType = settings.iconType
  settings.strokeWidth = 2
  settings.iconType = currentIconType
  settings.colorMode = 'single'
  settings.primaryColor = '#111827'
  settings.secondaryColor = '#0052d9'
  settings.size = 24
  draft.paths.forEach((path) => {
    delete path.color
  })
  selectedPathIndex.value = -1
}

const clearSelectedPathColor = () => {
  if (!selectedPath.value) return
  markHistory(`重置 Path ${selectedPathIndex.value + 1} 颜色`)
  delete selectedPath.value.color
}

const applyImportedIcon = (icon) => {
  markHistory('导入图标文件')
  Object.assign(draft, {
    ...draft,
    ...icon,
    id: route.params.id || icon.id,
    status: '草稿',
    statusTone: 'processing',
    paths: normalizePathItems(icon.paths).map((path) => ({ ...path }))
  })
  settings.iconType = icon.iconType || 'stroke'
  settings.colorMode = 'single'
  selectedPathIndex.value = -1
}

const handleFigmaImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const importedIcons = await parseIconImportFile(file)
    if (!importedIcons.length) {
      MessagePlugin.warning('没有从文件中解析到可用的矢量 path')
      return
    }

    applyImportedIcon(importedIcons[0])
    if (importedIcons.length > 1) {
      MessagePlugin.success(`已解析 ${importedIcons.length} 个图标，当前载入第 1 个`)
    } else {
      MessagePlugin.success('图标路径已解析并载入画布')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '导入失败')
  } finally {
    event.target.value = ''
  }
}

const saveDraft = () => {
  commitPendingHistory()
  const saved = upsertIcon({
    ...draft,
    iconType: settings.iconType,
    paths: draft.paths.map((path) => ({ ...path }))
  }, activeProjectId.value)
  persistHistory(saved.id, activeProjectId.value)
  resetSavedSnapshot()

  MessagePlugin.success(`图标已保存到 ${activeProject.value.name}`)
  if (!route.params.id) {
    router.replace({ name: 'icon-edit', params: { projectId: activeProjectId.value, id: saved.id } })
  }
}
</script>
