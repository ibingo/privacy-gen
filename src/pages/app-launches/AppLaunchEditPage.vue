<template>
  <div class="app-launch-editor-page">
    <div v-if="launch" class="app-launch-editor-shell">
      <t-card class="app-launch-editor-toolbar" :bordered="false">
        <div class="app-launch-editor-title">
          <t-button variant="text" shape="square" title="返回列表" @click="goBack">
            <arrow-left-icon />
          </t-button>
          <div>
            <h2>{{ launch.name }}</h2>
            <p>{{ launch.resourceKey }}</p>
          </div>
        </div>

        <t-space class="app-launch-editor-actions">
          <t-select v-model="primaryVersion" class="app-launch-toolbar-select" placeholder="平台">
            <t-option
              v-for="version in selectedVersions"
              :key="version.value"
              :value="version.value"
              :label="version.label"
            />
          </t-select>
          <t-radio-group v-model="orientation" variant="default-filled">
            <t-radio-button value="portrait">竖屏</t-radio-button>
            <t-radio-button value="landscape">横屏</t-radio-button>
          </t-radio-group>
          <t-button variant="outline" @click="resetSettings">重置</t-button>
          <t-button theme="primary" @click="saveLaunch">
            <template #icon><play-icon /></template>
            生成
          </t-button>
        </t-space>
      </t-card>

      <div class="app-launch-editor-layout">
        <div class="app-launch-side-stack">
          <AppLaunchWidgetPanel
            :widgets="editorWidgets"
            @add="addWidgetLayer"
            @drag-start="handleWidgetDragStart"
            @drag-end="handleWidgetDragEnd"
          />

          <t-card title="视图" :bordered="false">
            <div class="app-launch-control-stack">
              <div class="app-launch-control-header">
                <span>缩放视图</span>
                <strong>{{ viewportScaleText }}</strong>
              </div>
              <t-slider v-model="viewportScale" :min="60" :max="120" :disabled="autoScale" />
              <div class="app-launch-switch-row">
                <span>自动缩放</span>
                <t-switch v-model="autoScale" />
              </div>
            </div>
          </t-card>

          <t-card title="屏幕" :bordered="false">
            <div class="app-launch-screen-metrics">
              <span>
                <strong>{{ displaySize.width }}</strong>
                <small>宽度 px</small>
              </span>
              <span>
                <strong>{{ displaySize.height }}</strong>
                <small>高度 px</small>
              </span>
            </div>
            <t-button block variant="outline" @click="toggleOrientation">切换横竖屏</t-button>
          </t-card>

          <t-card title="常用设备" :bordered="false">
            <div class="app-launch-device-list">
              <button
                v-for="device in launchDeviceOptions"
                :key="device.value"
                class="app-launch-device-card"
                :class="{ 'is-active': settings.device === device.value }"
                type="button"
                @click="settings.device = device.value"
              >
                <span class="app-launch-device-thumb" :style="{ background: device.thumbnail }"></span>
                <span>
                  <strong>{{ device.label }}</strong>
                  <small>{{ device.size }}</small>
                </span>
              </button>
            </div>
          </t-card>
        </div>

        <AppLaunchCanvas
          :active-device="activeDevice"
          :display-size="displaySize"
          :phone-style="phoneStyle"
          :artboard-style="artboardStyle"
          :layers="layers"
          :settings="settings"
          :active-layer="activeLayer"
          :is-widget-drag-over="isWidgetDragOver"
          :logo-box-style="logoBoxStyle"
          :logo-svg-color-enabled="logoSvgColorEnabled"
          :logo-svg-mask-style="logoSvgMaskStyle"
          :ordered-image-layers="orderedImageLayers"
          :ordered-icon-layers="orderedIconLayers"
          :ordered-text-layers="orderedTextLayers"
          :get-image-layer-style="getImageLayerStyle"
          :get-image-layer-mask-style="getImageLayerMaskStyle"
          :get-icon-layer-style="getIconLayerStyle"
          :get-text-layer-style="getTextLayerStyle"
          :is-svg-image-layer="isSvgImageLayer"
          :can-delete-layer="canDeleteLayer"
          :is-text-editing="isTextEditing"
          @select="selectLayer"
          @canvas-drag-over="handleCanvasDragOver"
          @canvas-drag-leave="handleCanvasDragLeave"
          @canvas-drop="handleCanvasDrop"
          @logo-pointerdown="handleLogoPointerDown"
          @image-pointerdown="handleImagePointerDown"
          @icon-pointerdown="handleIconPointerDown"
          @text-pointerdown="handleTextPointerDown"
          @text-content-pointerdown="handleTextContentPointerDown"
          @start-text-edit="startInlineTextEdit"
          @finish-text-edit="finishInlineTextEdit"
          @open-image-upload="openImageUpload"
          @delete-layer="deleteLayer"
        >
          <AppLaunchFloatingProperties
            :floating-properties-style="floatingPropertiesStyle"
            :active-layer-meta="activeLayerMeta"
            :active-layer="activeLayer"
            :layers="layers"
            :settings="settings"
            :logo-controls-disabled="logoControlsDisabled"
            :logo-scale-text="logoScaleText"
            :logo-color-control-visible="logoColorControlVisible"
            :active-image-layer="activeImageLayer"
            :active-image-controls-disabled="activeImageControlsDisabled"
            :active-image-color-control-visible="activeImageColorControlVisible"
            :active-icon-layer="activeIconLayer"
            :active-icon-controls-disabled="activeIconControlsDisabled"
            :active-text-layer="activeTextLayer"
            :active-text-controls-disabled="activeTextControlsDisabled"
            @pointerdown="handlePropertiesPointerDown"
          />
        </AppLaunchCanvas>

        <div class="app-launch-side-stack">
          <AppLaunchLayerList
            :layers="allLayers"
            :active-layer="activeLayer"
            :dragged-layer-id="draggedLayerId"
            :drag-over-layer-id="dragOverLayerId"
            :get-layer-state="getLayerState"
            :get-layer-z-index="getLayerZIndex"
            :can-change-layer-order="canChangeLayerOrder"
            :can-delete-layer="canDeleteLayer"
            @select="selectLayer"
            @sort-drag-start="handleLayerSortDragStart"
            @sort-drag-over="handleLayerSortDragOver"
            @sort-drag-leave="handleLayerSortDragLeave"
            @sort-drop="handleLayerSortDrop"
            @sort-drag-end="handleLayerSortDragEnd"
            @move-level="moveLayerLevel"
            @update-z-index="updateLayerZIndex"
            @toggle-visible="toggleLayerVisible"
            @toggle-locked="toggleLayerLocked"
            @delete="deleteLayer"
          />
        </div>
      </div>
      <input
        ref="imageUploadInput"
        class="app-launch-hidden-input"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        @change="handleActiveImageUpload"
      />

      <t-dialog
        v-model:visible="iconImportDialogVisible"
        header="导入图标资源"
        width="760px"
        :footer="false"
        destroy-on-close
      >
        <div class="app-launch-icon-import-panel">
          <div class="app-launch-icon-import-header">
            <div>
              <strong>{{ activeIconProject.name }}</strong>
              <span>{{ filteredImportIcons.length }} / {{ iconImportItems.length }} 个图标</span>
            </div>
            <t-input v-model="iconImportKeyword" clearable placeholder="搜索名称、分类或 Frame">
              <template #prefix-icon><search-icon /></template>
            </t-input>
          </div>
          <div class="app-launch-icon-import-filters">
            <t-radio-group v-model="iconImportType" variant="default-filled">
              <t-radio-button value="all">全部</t-radio-button>
              <t-radio-button value="stroke">描边</t-radio-button>
              <t-radio-button value="fill">填充</t-radio-button>
            </t-radio-group>
            <t-select v-model="iconImportCategory" class="app-launch-icon-category-select" placeholder="分类">
              <t-option value="all" label="全部分类" />
              <t-option value="uncategorized" label="未分类" />
              <t-option
                v-for="category in iconImportCategories"
                :key="category.value"
                :value="category.value"
                :label="category.label"
              />
            </t-select>
          </div>
          <div v-if="filteredImportIcons.length" class="app-launch-icon-import-grid">
            <button
              v-for="icon in filteredImportIcons"
              :key="icon.id"
              class="app-launch-icon-import-card"
              type="button"
              @click="importIconLayer(icon)"
            >
              <span class="app-launch-icon-import-preview">
                <IconGlyph
                  :paths="icon.paths"
                  :stroke-width="2"
                  :icon-type="icon.iconType"
                  primary-color="#111827"
                />
              </span>
              <span class="app-launch-icon-import-name">{{ icon.name }}</span>
              <span class="app-launch-icon-import-meta">
                <t-tag size="small" variant="light">{{ icon.iconType === 'fill' ? '填充' : '描边' }}</t-tag>
                <small>{{ getIconCategoryLabel(icon.category) }}</small>
              </span>
            </button>
          </div>
          <t-empty v-else title="暂无可导入图标" description="请先在图标资源中导入或创建图标，或调整筛选条件。" />
        </div>
      </t-dialog>
    </div>

    <t-card v-else class="app-launch-empty-card" :bordered="false">
      <t-empty title="应用启动页不存在" description="返回列表后重新选择需要编辑的启动页。">
        <template #actions>
          <t-button theme="primary" @click="goBack">返回列表</t-button>
        </template>
      </t-empty>
    </t-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  FillColorIcon,
  ImageIcon,
  LayersIcon,
  PlayIcon,
  SearchIcon,
  TextIcon
} from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  Dialog as TDialog,
  Empty as TEmpty,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  RadioButton as TRadioButton,
  RadioGroup as TRadioGroup,
  Select as TSelect,
  Slider as TSlider,
  Space as TSpace,
  Switch as TSwitch,
  Tag as TTag
} from 'tdesign-vue-next'
import {
  findAppLaunch,
  launchDeviceOptions,
  launchVersionOptions,
  updateAppLaunch
} from '../../config/appLaunches'
import IconGlyph from '../../components/IconGlyph.vue'
import AppLaunchCanvas from '../../components/app-launch-editor/AppLaunchCanvas.vue'
import AppLaunchFloatingProperties from '../../components/app-launch-editor/AppLaunchFloatingProperties.vue'
import AppLaunchLayerList from '../../components/app-launch-editor/AppLaunchLayerList.vue'
import AppLaunchWidgetPanel from '../../components/app-launch-editor/AppLaunchWidgetPanel.vue'
import { findIconProject, getActiveIconProjectId } from '../../config/iconProjects'
import { readIconCategories, readIconLibrary } from '../../utils/iconLibrary'

const route = useRoute()
const router = useRouter()
const launch = computed(() => findAppLaunch(route.params.id))
const autoScale = ref(true)
const viewportScale = ref(85)
const orientation = ref('portrait')
const primaryVersion = ref('')
const activeLayer = ref('logo')
const textLayers = ref([])
const imageLayers = ref([])
const iconLayers = ref([])
const editingTextLayerId = ref('')
const draggedWidgetType = ref('')
const isWidgetDragOver = ref(false)
const draggedLayerId = ref('')
const dragOverLayerId = ref('')
const imageUploadInput = ref(null)
const activeUploadImageLayerId = ref('')
const iconImportDialogVisible = ref(false)
const iconImportKeyword = ref('')
const iconImportType = ref('all')
const iconImportCategory = ref('all')
const iconImportProjectId = ref(getActiveIconProjectId())
const iconImportItems = ref([])
const iconImportCategories = ref([])
const propertiesPosition = reactive({ x: null, y: 118 })
const settings = reactive({
  backgroundColor: '#ffffff',
  logoColor: '#f52f3e',
  logoScale: 48,
  logoX: 50,
  logoY: 49,
  device: 'iphone-14',
  logoSrc: '',
  logoFileName: '',
  logoFileType: ''
})
const layers = reactive({
  background: {
    visible: true,
    locked: true
  },
  logo: {
    visible: true,
    locked: false,
    zIndex: 30
  }
})
const layerList = [
  {
    value: 'logo',
    label: '图片',
    propertyTitle: '图片属性',
    description: '启动页主体图层',
    icon: LayersIcon
  },
  {
    value: 'background',
    label: '背景',
    propertyTitle: '背景属性',
    description: '画布背景颜色',
    icon: FillColorIcon
  }
]

const defaultTextLayer = (index = 1) => ({
  id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: 'text',
  label: `文字 ${index}`,
  propertyTitle: '文字属性',
  description: '可拖动文字图层',
  text: '启动页文案',
  x: 50,
  y: 72,
  fontSize: 28,
  color: '#111827',
  visible: true,
  locked: false,
  zIndex: 30
})

const defaultImageLayer = (index = 1) => ({
  id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: 'image',
  label: `图片 ${index}`,
  propertyTitle: '图片属性',
  description: '可上传图片图层',
  src: '',
  fileName: '',
  fileType: '',
  tintColor: '#f52f3e',
  x: 50,
  y: 50,
  scale: 42,
  visible: true,
  locked: false,
  zIndex: 40
})

const defaultIconLayer = (icon, index = 1) => ({
  id: `icon-layer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: 'icon',
  label: icon?.name ? `图标 ${icon.name}` : `图标 ${index}`,
  propertyTitle: '图标属性',
  description: icon?.figmaFrame || '图标资源',
  sourceIconId: icon?.id || '',
  sourceName: icon?.name || `图标 ${index}`,
  iconType: icon?.iconType === 'fill' ? 'fill' : 'stroke',
  paths: Array.isArray(icon?.paths) ? icon.paths : [],
  colorMode: 'single',
  primaryColor: '#f52f3e',
  secondaryColor: '#0052d9',
  x: 50,
  y: 50,
  scale: 22,
  visible: true,
  locked: false,
  zIndex: 40
})

const editorWidgets = [
  {
    type: 'text',
    label: '文字',
    description: '添加启动页文案',
    icon: TextIcon
  },
  {
    type: 'image',
    label: '图片',
    description: '上传本地图片素材',
    icon: ImageIcon
  },
  {
    type: 'icon',
    label: '图标',
    description: '从图标资源导入',
    icon: LayersIcon
  }
]

const applyLaunchSettings = (value) => {
  if (!value) return
  settings.backgroundColor = value.backgroundColor || '#ffffff'
  settings.logoColor = value.logoColor || '#f52f3e'
  settings.logoScale = value.logoScale || 48
  settings.logoX = value.logoX || 50
  settings.logoY = value.logoY || 49
  settings.device = value.device || 'iphone-14'
  settings.logoSrc = value.logoSrc || ''
  settings.logoFileName = value.logoFileName || ''
  settings.logoFileType = value.logoFileType || ''
  layers.background.visible = value.backgroundVisible ?? true
  layers.logo.visible = value.logoVisible ?? true
  layers.logo.locked = value.logoLocked ?? false
  textLayers.value = Array.isArray(value.textLayers)
    ? value.textLayers.map((layer, index) => ({
      ...defaultTextLayer(index + 1),
      ...layer
    }))
    : []
  imageLayers.value = Array.isArray(value.imageLayers)
    ? value.imageLayers.map((layer, index) => ({
      ...defaultImageLayer(index + 1),
      ...layer
    }))
    : []
  iconLayers.value = Array.isArray(value.iconLayers)
    ? value.iconLayers.map((layer, index) => ({
      ...defaultIconLayer(layer, index + 1),
      ...layer
    }))
    : []
  primaryVersion.value = value.versionSupport?.[0] || 'ios'
}

watch(launch, applyLaunchSettings, { immediate: true })

const selectedVersions = computed(() => {
  const values = launch.value?.versionSupport?.length ? launch.value.versionSupport : ['ios', 'android']
  return launchVersionOptions.filter((version) => values.includes(version.value))
})

const activeDevice = computed(() => {
  return launchDeviceOptions.find((device) => device.value === settings.device) || launchDeviceOptions[0]
})

const displaySize = computed(() => {
  const width = orientation.value === 'portrait' ? activeDevice.value.width : activeDevice.value.height
  const height = orientation.value === 'portrait' ? activeDevice.value.height : activeDevice.value.width
  return { width, height }
})

const viewportScaleText = computed(() => `${(viewportScale.value / 100).toFixed(2)}倍`)
const logoScaleText = computed(() => `${(settings.logoScale / 100).toFixed(2)}倍`)
const logoControlsDisabled = computed(() => layers.logo.locked || !layers.logo.visible)
const activeIconProject = computed(() => findIconProject(iconImportProjectId.value))
const allLayers = computed(() => [
  ...[...iconLayers.value].sort((a, b) => getLayerZIndex(b.id) - getLayerZIndex(a.id)).map((layer) => ({
    value: layer.id,
    label: layer.label,
    propertyTitle: '图标属性',
    description: layer.sourceName || '图标资源',
    icon: LayersIcon
  })),
  ...[...imageLayers.value].sort((a, b) => getLayerZIndex(b.id) - getLayerZIndex(a.id)).map((layer) => ({
    value: layer.id,
    label: layer.label,
    propertyTitle: '图片属性',
    description: layer.fileName || '图片图层',
    icon: ImageIcon
  })),
  ...[...textLayers.value].sort((a, b) => getLayerZIndex(b.id) - getLayerZIndex(a.id)).map((layer) => ({
    value: layer.id,
    label: layer.label,
    propertyTitle: '文字属性',
    description: layer.text || '文字图层',
    icon: TextIcon
  })),
  ...layerList
])
const activeLayerMeta = computed(() => {
  return allLayers.value.find((layer) => layer.value === activeLayer.value) || layerList[0]
})
const orderedImageLayers = computed(() => [...imageLayers.value].sort((a, b) => getLayerZIndex(a.id) - getLayerZIndex(b.id)))
const orderedIconLayers = computed(() => [...iconLayers.value].sort((a, b) => getLayerZIndex(a.id) - getLayerZIndex(b.id)))
const orderedTextLayers = computed(() => [...textLayers.value].sort((a, b) => getLayerZIndex(a.id) - getLayerZIndex(b.id)))
const activeTextLayer = computed(() => {
  return textLayers.value.find((layer) => layer.id === activeLayer.value) || null
})
const activeTextControlsDisabled = computed(() => {
  return !activeTextLayer.value || activeTextLayer.value.locked || !activeTextLayer.value.visible
})
const activeImageLayer = computed(() => {
  return imageLayers.value.find((layer) => layer.id === activeLayer.value) || null
})
const activeImageControlsDisabled = computed(() => {
  return !activeImageLayer.value || activeImageLayer.value.locked || !activeImageLayer.value.visible
})
const activeIconLayer = computed(() => {
  return iconLayers.value.find((layer) => layer.id === activeLayer.value) || null
})
const activeIconControlsDisabled = computed(() => {
  return !activeIconLayer.value || activeIconLayer.value.locked || !activeIconLayer.value.visible
})
const isSvgType = (fileType) => String(fileType || '').includes('svg')
const logoSvgColorEnabled = computed(() => Boolean(settings.logoSrc) && isSvgType(settings.logoFileType))
const logoColorControlVisible = computed(() => !settings.logoSrc || logoSvgColorEnabled.value)
const activeImageColorControlVisible = computed(() => {
  return activeImageLayer.value ? isSvgType(activeImageLayer.value.fileType) : false
})
const getIconCategoryLabel = (categoryId) => {
  if (!categoryId) return '未分类'
  return iconImportCategories.value.find((category) => category.value === categoryId)?.label || '未分类'
}
const filteredImportIcons = computed(() => {
  const q = iconImportKeyword.value.trim().toLowerCase()
  return iconImportItems.value.filter((icon) => {
    const category = getIconCategoryLabel(icon.category)
    const matchesType = iconImportType.value === 'all' || icon.iconType === iconImportType.value
    const matchesCategory = iconImportCategory.value === 'all'
      || (iconImportCategory.value === 'uncategorized' && !icon.category)
      || icon.category === iconImportCategory.value
    const haystack = `${icon.name} ${category} ${icon.figmaFrame || ''}`.toLowerCase()
    return matchesType && matchesCategory && (!q || haystack.includes(q))
  })
})

const phoneStyle = computed(() => {
  const base = autoScale.value ? Math.min(1, 600 / displaySize.value.height, 390 / displaySize.value.width) : viewportScale.value / 100
  const scale = Math.max(0.45, base)
  return {
    width: `${displaySize.value.width * scale}px`,
    height: `${displaySize.value.height * scale}px`
  }
})

const artboardStyle = computed(() => ({
  background: layers.background.visible ? settings.backgroundColor : 'transparent'
}))
const floatingPropertiesStyle = computed(() => {
  if (propertiesPosition.x === null) {
    return {
      top: `${propertiesPosition.y}px`,
      left: '50%',
      right: 'auto',
      transform: 'translateX(-50%)'
    }
  }
  return {
    left: `${propertiesPosition.x}px`,
    top: `${propertiesPosition.y}px`,
    right: 'auto',
    transform: 'none'
  }
})

const logoBoxStyle = computed(() => ({
  left: `${settings.logoX}%`,
  top: `${settings.logoY}%`,
  width: `${settings.logoScale}%`,
  color: settings.logoColor,
  zIndex: getLayerZIndex('logo'),
  transform: 'translate(-50%, -50%)'
}))
const logoSvgMaskStyle = computed(() => ({
  backgroundColor: settings.logoColor,
  maskImage: `url("${settings.logoSrc}")`,
  WebkitMaskImage: `url("${settings.logoSrc}")`
}))

const getTextLayerStyle = (layer) => ({
  left: `${layer.x}%`,
  top: `${layer.y}%`,
  color: layer.color,
  fontSize: `${layer.fontSize}px`,
  zIndex: getLayerZIndex(layer.id),
  transform: 'translate(-50%, -50%)'
})

const getImageLayerStyle = (layer) => ({
  left: `${layer.x}%`,
  top: `${layer.y}%`,
  width: `${layer.scale}%`,
  zIndex: getLayerZIndex(layer.id),
  transform: 'translate(-50%, -50%)'
})

const getIconLayerStyle = (layer) => ({
  left: `${layer.x}%`,
  top: `${layer.y}%`,
  width: `${layer.scale}%`,
  zIndex: getLayerZIndex(layer.id),
  transform: 'translate(-50%, -50%)'
})

const isSvgImageLayer = (layer) => Boolean(layer?.src) && isSvgType(layer.fileType)

const getImageLayerMaskStyle = (layer) => ({
  backgroundColor: layer.tintColor || '#f52f3e',
  maskImage: `url("${layer.src}")`,
  WebkitMaskImage: `url("${layer.src}")`
})

const getLayerState = (layer) => {
  if (layer === 'background' || layer === 'logo') {
    return layers[layer]
  }
  return imageLayers.value.find((item) => item.id === layer)
    || iconLayers.value.find((item) => item.id === layer)
    || textLayers.value.find((item) => item.id === layer)
    || { visible: false, locked: true }
}

const getCustomLayer = (id) => {
  return imageLayers.value.find((item) => item.id === id)
    || iconLayers.value.find((item) => item.id === id)
    || textLayers.value.find((item) => item.id === id)
    || null
}

const getLayerZIndex = (id) => {
  if (id === 'background') return 0
  if (id === 'logo') return Number(layers.logo.zIndex) || 30
  return Number(getCustomLayer(id)?.zIndex) || 1
}

const selectLayer = (layer) => {
  activeLayer.value = layer
}

const toggleLayerVisible = (layer) => {
  const state = getLayerState(layer)
  state.visible = !state.visible
  if (!state.visible && activeLayer.value === layer) {
    activeLayer.value = layer === 'logo' ? 'background' : 'logo'
  }
}

const toggleLayerLocked = (layer) => {
  if (layer === 'background') return
  const state = getLayerState(layer)
  state.locked = !state.locked
}

const canDeleteLayer = (layer) => {
  return !['background', 'logo'].includes(layer) && activeLayer.value === layer && !getLayerState(layer).locked
}

const canChangeLayerOrder = (layer) => layer !== 'background'

const setLayerZIndex = (id, zIndex) => {
  if (id === 'logo') {
    layers.logo.zIndex = zIndex
    return
  }
  const layer = getCustomLayer(id)
  if (layer) layer.zIndex = zIndex
}

const updateLayerZIndex = (id, value) => {
  if (!canChangeLayerOrder(id)) return
  const nextZIndex = Math.min(999, Math.max(1, Number(value) || 1))
  const current = getLayerZIndex(id)
  if (current !== nextZIndex) {
    getSortableLayerIds().forEach((layerId) => {
      if (layerId !== id && getLayerZIndex(layerId) >= nextZIndex) {
        setLayerZIndex(layerId, getLayerZIndex(layerId) + 1)
      }
    })
  }
  setLayerZIndex(id, nextZIndex)
  activeLayer.value = id
}

const getSortableLayerIds = () => [
  'logo',
  ...imageLayers.value.map((layer) => layer.id),
  ...iconLayers.value.map((layer) => layer.id),
  ...textLayers.value.map((layer) => layer.id)
]

const normalizeLayerOrder = (orderedIds) => {
  orderedIds.forEach((id, index) => {
    setLayerZIndex(id, orderedIds.length - index)
  })
}

const moveLayerLevel = (id, direction) => {
  if (!canChangeLayerOrder(id)) return
  const sorted = getSortableLayerIds().sort((a, b) => getLayerZIndex(b) - getLayerZIndex(a))
  const index = sorted.indexOf(id)
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) return
  const targetId = sorted[targetIndex]
  const currentZIndex = getLayerZIndex(id)
  setLayerZIndex(id, getLayerZIndex(targetId))
  setLayerZIndex(targetId, currentZIndex)
  activeLayer.value = id
}

const handleLayerSortDragStart = (event, id) => {
  if (!canChangeLayerOrder(id)) return
  draggedLayerId.value = id
  activeLayer.value = id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', id)
}

const handleLayerSortDragOver = (event, id) => {
  if (!draggedLayerId.value || draggedLayerId.value === id || !canChangeLayerOrder(id)) return
  dragOverLayerId.value = id
  event.dataTransfer.dropEffect = 'move'
}

const handleLayerSortDragLeave = (id) => {
  if (dragOverLayerId.value === id) dragOverLayerId.value = ''
}

const handleLayerSortDrop = (event, targetId) => {
  const sourceId = event.dataTransfer.getData('text/plain') || draggedLayerId.value
  if (!sourceId || sourceId === targetId || !canChangeLayerOrder(sourceId) || !canChangeLayerOrder(targetId)) {
    handleLayerSortDragEnd()
    return
  }
  const sorted = getSortableLayerIds().sort((a, b) => getLayerZIndex(b) - getLayerZIndex(a))
  const sourceIndex = sorted.indexOf(sourceId)
  const targetIndex = sorted.indexOf(targetId)
  if (sourceIndex < 0 || targetIndex < 0) {
    handleLayerSortDragEnd()
    return
  }
  const [sourceLayer] = sorted.splice(sourceIndex, 1)
  sorted.splice(targetIndex, 0, sourceLayer)
  normalizeLayerOrder(sorted)
  activeLayer.value = sourceId
  handleLayerSortDragEnd()
}

const handleLayerSortDragEnd = () => {
  draggedLayerId.value = ''
  dragOverLayerId.value = ''
}

const deleteLayer = (id) => {
  if (!canDeleteLayer(id)) return
  imageLayers.value = imageLayers.value.filter((layer) => layer.id !== id)
  iconLayers.value = iconLayers.value.filter((layer) => layer.id !== id)
  textLayers.value = textLayers.value.filter((layer) => layer.id !== id)
  activeLayer.value = allLayers.value.find((layer) => layer.value !== id)?.value || 'logo'
}

const addTextLayer = () => {
  const layer = defaultTextLayer(textLayers.value.length + 1)
  layer.zIndex = Math.max(1, ...getSortableLayerIds().map((id) => getLayerZIndex(id))) + 1
  textLayers.value = [layer, ...textLayers.value]
  activeLayer.value = layer.id
}

const addImageLayer = (position = {}) => {
  const layer = defaultImageLayer(imageLayers.value.length + 1)
  layer.x = position.x ?? layer.x
  layer.y = position.y ?? layer.y
  layer.zIndex = Math.max(1, ...getSortableLayerIds().map((id) => getLayerZIndex(id))) + 1
  imageLayers.value = [layer, ...imageLayers.value]
  activeLayer.value = layer.id
  activeUploadImageLayerId.value = layer.id
  imageUploadInput.value?.click()
}

const addWidgetLayer = (type, position = {}) => {
  if (type === 'text') {
    const layer = defaultTextLayer(textLayers.value.length + 1)
    layer.x = position.x ?? layer.x
    layer.y = position.y ?? layer.y
    layer.zIndex = Math.max(1, ...getSortableLayerIds().map((id) => getLayerZIndex(id))) + 1
    textLayers.value = [layer, ...textLayers.value]
    activeLayer.value = layer.id
    return
  }
  if (type === 'image') {
    addImageLayer(position)
    return
  }
  if (type === 'icon') {
    openIconImportDialog()
  }
}

const refreshIconImportResources = () => {
  const projectId = getActiveIconProjectId()
  iconImportProjectId.value = projectId
  iconImportItems.value = readIconLibrary(projectId)
  iconImportCategories.value = readIconCategories(projectId)
}

const openIconImportDialog = () => {
  refreshIconImportResources()
  iconImportDialogVisible.value = true
}

const importIconLayer = (icon) => {
  const layer = defaultIconLayer(icon, iconLayers.value.length + 1)
  layer.zIndex = Math.max(1, ...getSortableLayerIds().map((id) => getLayerZIndex(id))) + 1
  iconLayers.value = [layer, ...iconLayers.value]
  activeLayer.value = layer.id
  iconImportDialogVisible.value = false
  MessagePlugin.success('已创建图标图层')
}

const applyImageFileToLayer = (file, layer) => {
  if (!file || !layer) return
  if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.svg')) {
    MessagePlugin.warning('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    layer.src = String(reader.result || '')
    layer.fileName = file.name
    layer.fileType = file.type || (file.name.toLowerCase().endsWith('.svg') ? 'image/svg+xml' : '')
    layer.description = file.name
    MessagePlugin.success('图片已更新')
  }
  reader.readAsDataURL(file)
}

const handleActiveImageUpload = (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const layer = getCustomLayer(activeUploadImageLayerId.value) || activeImageLayer.value
  applyImageFileToLayer(file, layer)
}

const handleImageUpload = (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const layer = defaultImageLayer(imageLayers.value.length + 1)
  layer.zIndex = Math.max(1, ...getSortableLayerIds().map((id) => getLayerZIndex(id))) + 1
  applyImageFileToLayer(file, layer)
  imageLayers.value = [layer, ...imageLayers.value]
  activeLayer.value = layer.id
}

const openImageUpload = (layer) => {
  if (!layer || layer.locked || !layer.visible) return
  activeLayer.value = layer.id
  activeUploadImageLayerId.value = layer.id
  if (imageUploadInput.value) {
    imageUploadInput.value.value = ''
    imageUploadInput.value.click()
  }
}

const handleWidgetDragStart = (event, type) => {
  draggedWidgetType.value = type
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('text/plain', type)
}

const handleWidgetDragEnd = () => {
  draggedWidgetType.value = ''
  isWidgetDragOver.value = false
}

const handleCanvasDragOver = (event) => {
  if (!draggedWidgetType.value && !Array.from(event.dataTransfer.types).includes('text/plain')) return
  isWidgetDragOver.value = true
  event.dataTransfer.dropEffect = 'copy'
}

const handleCanvasDragLeave = (event) => {
  if (event.currentTarget.contains(event.relatedTarget)) return
  isWidgetDragOver.value = false
}

const handleCanvasDrop = (event) => {
  const type = event.dataTransfer.getData('text/plain') || draggedWidgetType.value
  draggedWidgetType.value = ''
  isWidgetDragOver.value = false
  if (!type) return
  const rect = event.currentTarget.getBoundingClientRect()
  addWidgetLayer(type, {
    x: Math.min(100, Math.max(0, Math.round(((event.clientX - rect.left) / rect.width) * 100))),
    y: Math.min(100, Math.max(0, Math.round(((event.clientY - rect.top) / rect.height) * 100)))
  })
}

const handleMovablePointerDown = (event, layer) => {
  selectLayer(layer.id)
  if (layer.locked || !layer.visible || event.button !== 0) return

  const artboard = event.currentTarget.closest('.app-launch-artboard')
  if (!artboard) return

  const rect = artboard.getBoundingClientRect()
  const move = (moveEvent) => {
    const x = ((moveEvent.clientX - rect.left) / rect.width) * 100
    const y = ((moveEvent.clientY - rect.top) / rect.height) * 100
    layer.x = Math.min(100, Math.max(0, Math.round(x)))
    layer.y = Math.min(100, Math.max(0, Math.round(y)))
  }
  const stop = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
  }

  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop)
}

const handleLogoPointerDown = (event) => {
  handleMovablePointerDown(event, {
    id: 'logo',
    get x() {
      return settings.logoX
    },
    set x(value) {
      settings.logoX = value
    },
    get y() {
      return settings.logoY
    },
    set y(value) {
      settings.logoY = value
    },
    get locked() {
      return layers.logo.locked
    },
    get visible() {
      return layers.logo.visible
    }
  })
}

const handleTextPointerDown = (event, layer) => {
  if (isTextEditing(layer)) return
  handleMovablePointerDown(event, layer)
}

const isTextEditing = (layer) => {
  return editingTextLayerId.value === layer.id && !layer.locked && layer.visible
}

const startInlineTextEdit = (event, layer) => {
  if (layer.locked || !layer.visible) return
  selectLayer(layer.id)
  editingTextLayerId.value = layer.id
  requestAnimationFrame(() => {
    const target = event.currentTarget.querySelector('.app-launch-text-content')
    target?.focus()
    const selection = window.getSelection()
    const range = document.createRange()
    if (target && selection) {
      range.selectNodeContents(target)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  })
}

const finishInlineTextEdit = (event, layer) => {
  if (layer && event?.currentTarget) {
    layer.text = event.currentTarget.textContent || ''
  }
  editingTextLayerId.value = ''
}

const handleTextContentPointerDown = (event, layer) => {
  if (isTextEditing(layer)) return
  handleTextPointerDown(event, layer)
}

const handleImagePointerDown = (event, layer) => {
  handleMovablePointerDown(event, layer)
}

const handleIconPointerDown = (event, layer) => {
  handleMovablePointerDown(event, layer)
}

const handlePropertiesPointerDown = (event) => {
  if (event.button !== 0) return
  const panel = event.currentTarget.closest('.app-launch-floating-properties')
  if (!panel) return
  const panelRect = panel.getBoundingClientRect()
  const offsetX = event.clientX - panelRect.left
  const offsetY = event.clientY - panelRect.top
  propertiesPosition.x = Math.round(panelRect.left)
  propertiesPosition.y = Math.round(panelRect.top)

  const move = (moveEvent) => {
    const maxLeft = Math.max(8, window.innerWidth - panelRect.width - 8)
    const maxTop = Math.max(8, window.innerHeight - panelRect.height - 8)
    propertiesPosition.x = Math.round(Math.min(maxLeft, Math.max(8, moveEvent.clientX - offsetX)))
    propertiesPosition.y = Math.round(Math.min(maxTop, Math.max(8, moveEvent.clientY - offsetY)))
  }

  const stop = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
  }

  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop)
}

const toggleOrientation = () => {
  orientation.value = orientation.value === 'portrait' ? 'landscape' : 'portrait'
}

const resetSettings = () => {
  applyLaunchSettings(launch.value)
}

const goBack = () => {
  router.push({ name: 'app-launch-list' })
}

const saveLaunch = () => {
  updateAppLaunch(route.params.id, {
    backgroundColor: settings.backgroundColor,
    logoColor: settings.logoColor,
    logoScale: settings.logoScale,
    logoX: settings.logoX,
    logoY: settings.logoY,
    device: settings.device,
    logoSrc: settings.logoSrc,
    logoFileName: settings.logoFileName,
    logoFileType: settings.logoFileType,
    backgroundVisible: layers.background.visible,
    logoVisible: layers.logo.visible,
    logoLocked: layers.logo.locked,
    textLayers: textLayers.value,
    imageLayers: imageLayers.value,
    iconLayers: iconLayers.value,
    status: '已生成',
    statusTone: 'success'
  })
  MessagePlugin.success('应用启动页生成任务已提交')
  router.push({ name: 'app-launch-list' })
}
</script>
