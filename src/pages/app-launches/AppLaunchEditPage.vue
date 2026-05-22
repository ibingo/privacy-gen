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

        <t-card class="app-launch-canvas-card" :bordered="false">
          <div class="app-launch-canvas-header">
            <span>{{ activeDevice.label }}</span>
            <t-tag variant="light">{{ displaySize.width }} x {{ displaySize.height }}</t-tag>
          </div>
          <main class="app-launch-canvas-shell">
            <div class="app-launch-floating-toolbar" :style="floatingToolbarStyle">
              <button
                class="app-launch-toolbar-drag"
                type="button"
                title="拖动工具栏"
                @pointerdown="handleToolbarPointerDown"
              >
                <drag-move-icon />
              </button>
              <t-button variant="outline" size="small" @click="addTextLayer">
                <template #icon><text-icon /></template>
                添加文字
              </t-button>
              <t-button variant="outline" size="small" @click="openIconImportDialog">
                <template #icon><layers-icon /></template>
                导入图标
              </t-button>
              <label class="app-launch-upload-button">
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" @change="handleImageUpload" />
                <span class="t-button t-button--variant-outline t-button--size-small">
                  <upload-icon />
                  上传图片
                </span>
              </label>
            </div>
            <div class="app-launch-phone" :style="phoneStyle">
              <div
                class="app-launch-artboard"
                :class="{ 'is-transparent': !layers.background.visible }"
                :style="artboardStyle"
                @click="selectLayer('background')"
              >
                <div
                  v-if="layers.logo.visible"
                  class="app-launch-logo-box"
                  :class="{ 'is-active': activeLayer === 'logo', 'is-locked': layers.logo.locked }"
                  :style="logoBoxStyle"
                  @click.stop="selectLayer('logo')"
                  @pointerdown.stop="handleLogoPointerDown"
                >
                  <span
                    v-if="logoSvgColorEnabled"
                    class="app-launch-svg-mask"
                    :style="logoSvgMaskStyle"
                  ></span>
                  <img v-else-if="settings.logoSrc" :src="settings.logoSrc" :alt="settings.logoFileName || '启动页图片'" />
                  <layers-icon v-else />
                </div>
                <div
                  v-for="imageLayer in imageLayers"
                  v-show="imageLayer.visible"
                  :key="imageLayer.id"
                  class="app-launch-image-box"
                  :class="{ 'is-active': activeLayer === imageLayer.id, 'is-locked': imageLayer.locked }"
                  :style="getImageLayerStyle(imageLayer)"
                  @click.stop="selectLayer(imageLayer.id)"
                  @pointerdown.stop="handleImagePointerDown($event, imageLayer)"
                >
                  <span
                    v-if="isSvgImageLayer(imageLayer)"
                    class="app-launch-svg-mask"
                    :style="getImageLayerMaskStyle(imageLayer)"
                  ></span>
                  <img v-else-if="imageLayer.src" :src="imageLayer.src" :alt="imageLayer.label" />
                  <image-icon v-else />
                </div>
                <div
                  v-for="iconLayer in iconLayers"
                  v-show="iconLayer.visible"
                  :key="iconLayer.id"
                  class="app-launch-icon-box"
                  :class="{ 'is-active': activeLayer === iconLayer.id, 'is-locked': iconLayer.locked }"
                  :style="getIconLayerStyle(iconLayer)"
                  @click.stop="selectLayer(iconLayer.id)"
                  @pointerdown.stop="handleIconPointerDown($event, iconLayer)"
                >
                  <IconGlyph
                    :paths="iconLayer.paths"
                    :stroke-width="2"
                    :icon-type="iconLayer.iconType"
                    :color-mode="iconLayer.colorMode"
                    :primary-color="iconLayer.primaryColor"
                    :secondary-color="iconLayer.secondaryColor"
                  />
                </div>
                <div
                  v-for="textLayer in textLayers"
                  v-show="textLayer.visible"
                  :key="textLayer.id"
                  class="app-launch-text-box"
                  :class="{ 'is-active': activeLayer === textLayer.id, 'is-locked': textLayer.locked }"
                  :style="getTextLayerStyle(textLayer)"
                  @click.stop="selectLayer(textLayer.id)"
                  @pointerdown.stop="handleTextPointerDown($event, textLayer)"
                >
                  {{ textLayer.text }}
                </div>
              </div>
            </div>
          </main>
        </t-card>

        <div class="app-launch-side-stack">
          <t-card title="图层" :bordered="false">
            <div class="app-launch-layer-list">
              <button
                v-for="layer in allLayers"
                :key="layer.value"
                class="app-launch-layer-row"
                :class="{ 'is-active': activeLayer === layer.value, 'is-hidden': !getLayerState(layer.value).visible }"
                type="button"
                @click="selectLayer(layer.value)"
              >
                <component :is="layer.icon" />
                <span>
                  <strong>{{ layer.label }}</strong>
                  <small>{{ layer.description }}</small>
                </span>
                <span class="app-launch-layer-actions" @click.stop>
                  <t-button
                    variant="text"
                    shape="square"
                    size="small"
                    :title="getLayerState(layer.value).visible ? '隐藏图层' : '显示图层'"
                    @click="toggleLayerVisible(layer.value)"
                  >
                    <component :is="getLayerState(layer.value).visible ? BrowseIcon : BrowseOffIcon" />
                  </t-button>
                  <t-button
                    variant="text"
                    shape="square"
                    size="small"
                    :disabled="layer.value === 'background'"
                    :title="getLayerState(layer.value).locked ? '解锁图层' : '锁定图层'"
                    @click="toggleLayerLocked(layer.value)"
                  >
                    <component :is="getLayerState(layer.value).locked ? LockOnIcon : LockOffIcon" />
                  </t-button>
                </span>
              </button>
            </div>
          </t-card>

          <t-card :title="activeLayerMeta.propertyTitle" :bordered="false">
            <div v-if="activeLayer === 'logo'" class="app-launch-control-stack">
              <div class="app-launch-layer-state">
                <span>图片图层</span>
                <t-tag v-if="layers.logo.locked" theme="warning" variant="light">已锁定</t-tag>
                <t-tag v-else-if="!layers.logo.visible" theme="default" variant="light">已隐藏</t-tag>
                <t-tag v-else theme="primary" variant="light">可编辑</t-tag>
              </div>
              <div class="app-launch-upload-hint">
                <span>{{ settings.logoFileName || '未上传图片' }}</span>
                <small>使用浮动工具栏上传图片到当前图层</small>
              </div>
              <div class="app-launch-control-header">
                <span>横坐标</span>
                <strong>{{ settings.logoX }}%</strong>
              </div>
              <t-slider v-model="settings.logoX" :min="0" :max="100" :disabled="logoControlsDisabled" />

              <div class="app-launch-control-header">
                <span>纵坐标</span>
                <strong>{{ settings.logoY }}%</strong>
              </div>
              <t-slider v-model="settings.logoY" :min="0" :max="100" :disabled="logoControlsDisabled" />

              <div class="app-launch-control-header">
                <span>缩放</span>
                <strong>{{ logoScaleText }}</strong>
              </div>
              <t-slider v-model="settings.logoScale" :min="18" :max="76" :disabled="logoControlsDisabled" />
            </div>
            <div v-else-if="activeImageLayer" class="app-launch-control-stack">
              <div class="app-launch-layer-state">
                <span>{{ activeImageLayer.label }}</span>
                <t-tag v-if="activeImageLayer.locked" theme="warning" variant="light">已锁定</t-tag>
                <t-tag v-else-if="!activeImageLayer.visible" theme="default" variant="light">已隐藏</t-tag>
                <t-tag v-else theme="primary" variant="light">可编辑</t-tag>
              </div>
              <div class="app-launch-upload-hint">
                <span>{{ activeImageLayer.fileName || '未上传图片' }}</span>
                <small>使用浮动工具栏上传图片到当前图层</small>
              </div>
              <div class="app-launch-control-header">
                <span>横坐标</span>
                <strong>{{ Math.round(activeImageLayer.x) }}%</strong>
              </div>
              <t-slider v-model="activeImageLayer.x" :min="0" :max="100" :disabled="activeImageControlsDisabled" />

              <div class="app-launch-control-header">
                <span>纵坐标</span>
                <strong>{{ Math.round(activeImageLayer.y) }}%</strong>
              </div>
              <t-slider v-model="activeImageLayer.y" :min="0" :max="100" :disabled="activeImageControlsDisabled" />

              <div class="app-launch-control-header">
                <span>缩放</span>
                <strong>{{ activeImageLayer.scale }}%</strong>
              </div>
              <t-slider
                v-model="activeImageLayer.scale"
                :min="12"
                :max="96"
                :disabled="activeImageControlsDisabled"
              />
            </div>
            <div v-else-if="activeIconLayer" class="app-launch-control-stack">
              <div class="app-launch-layer-state">
                <span>{{ activeIconLayer.label }}</span>
                <t-tag v-if="activeIconLayer.locked" theme="warning" variant="light">已锁定</t-tag>
                <t-tag v-else-if="!activeIconLayer.visible" theme="default" variant="light">已隐藏</t-tag>
                <t-tag v-else theme="primary" variant="light">可编辑</t-tag>
              </div>
              <div class="app-launch-upload-hint">
                <span>{{ activeIconLayer.sourceName || '图标资源' }}</span>
                <small>{{ activeIconLayer.iconType === 'fill' ? '填充图标' : '描边图标' }}，颜色独立于图片和背景</small>
              </div>
              <div class="app-launch-control-header">
                <span>横坐标</span>
                <strong>{{ Math.round(activeIconLayer.x) }}%</strong>
              </div>
              <t-slider v-model="activeIconLayer.x" :min="0" :max="100" :disabled="activeIconControlsDisabled" />

              <div class="app-launch-control-header">
                <span>纵坐标</span>
                <strong>{{ Math.round(activeIconLayer.y) }}%</strong>
              </div>
              <t-slider v-model="activeIconLayer.y" :min="0" :max="100" :disabled="activeIconControlsDisabled" />

              <div class="app-launch-control-header">
                <span>大小</span>
                <strong>{{ activeIconLayer.scale }}%</strong>
              </div>
              <t-slider
                v-model="activeIconLayer.scale"
                :min="8"
                :max="72"
                :disabled="activeIconControlsDisabled"
              />

              <div class="app-launch-control-header">
                <span>配色模式</span>
              </div>
              <t-radio-group v-model="activeIconLayer.colorMode" variant="default-filled" :disabled="activeIconControlsDisabled">
                <t-radio-button value="single">单色</t-radio-button>
                <t-radio-button value="dual">双色</t-radio-button>
              </t-radio-group>
            </div>
            <div v-else-if="activeTextLayer" class="app-launch-control-stack">
              <div class="app-launch-layer-state">
                <span>{{ activeTextLayer.label }}</span>
                <t-tag v-if="activeTextLayer.locked" theme="warning" variant="light">已锁定</t-tag>
                <t-tag v-else-if="!activeTextLayer.visible" theme="default" variant="light">已隐藏</t-tag>
                <t-tag v-else theme="primary" variant="light">可编辑</t-tag>
              </div>
              <label class="app-launch-text-field">
                <span>文字内容</span>
                <t-input
                  v-model="activeTextLayer.text"
                  clearable
                  :disabled="activeTextControlsDisabled"
                />
              </label>
              <div class="app-launch-control-header">
                <span>横坐标</span>
                <strong>{{ Math.round(activeTextLayer.x) }}%</strong>
              </div>
              <t-slider v-model="activeTextLayer.x" :min="0" :max="100" :disabled="activeTextControlsDisabled" />

              <div class="app-launch-control-header">
                <span>纵坐标</span>
                <strong>{{ Math.round(activeTextLayer.y) }}%</strong>
              </div>
              <t-slider v-model="activeTextLayer.y" :min="0" :max="100" :disabled="activeTextControlsDisabled" />

              <div class="app-launch-control-header">
                <span>字号</span>
                <strong>{{ activeTextLayer.fontSize }}px</strong>
              </div>
              <t-slider
                v-model="activeTextLayer.fontSize"
                :min="12"
                :max="96"
                :disabled="activeTextControlsDisabled"
              />
            </div>
            <div v-else class="app-launch-background-panel">
              <p>当前选中背景图层，右侧颜色面板可调整启动页背景。</p>
            </div>
          </t-card>

          <t-card title="颜色" :bordered="false">
            <div v-if="activeLayer === 'background'" class="app-launch-color-grid">
              <label class="app-launch-color-item">
                <span>背景</span>
                <t-color-picker
                  v-model="settings.backgroundColor"
                  format="HEX"
                  :disabled="!layers.background.visible"
                />
              </label>
            </div>
            <div v-else-if="activeLayer === 'logo' && logoColorControlVisible" class="app-launch-color-grid">
              <label class="app-launch-color-item">
                <span>图形</span>
                <t-color-picker
                  v-model="settings.logoColor"
                  format="HEX"
                  :disabled="logoControlsDisabled"
                />
              </label>
            </div>
            <div v-else-if="activeIconLayer" class="app-launch-color-grid">
              <label class="app-launch-color-item">
                <span>主色</span>
                <t-color-picker
                  v-model="activeIconLayer.primaryColor"
                  format="HEX"
                  :disabled="activeIconControlsDisabled"
                />
              </label>
              <label v-if="activeIconLayer.colorMode === 'dual'" class="app-launch-color-item">
                <span>辅色</span>
                <t-color-picker
                  v-model="activeIconLayer.secondaryColor"
                  format="HEX"
                  :disabled="activeIconControlsDisabled"
                />
              </label>
            </div>
            <div v-else-if="activeImageLayer && activeImageColorControlVisible" class="app-launch-color-grid">
              <label class="app-launch-color-item">
                <span>SVG 着色</span>
                <t-color-picker
                  v-model="activeImageLayer.tintColor"
                  format="HEX"
                  :disabled="activeImageControlsDisabled"
                />
              </label>
            </div>
            <div v-else-if="activeTextLayer" class="app-launch-color-grid">
              <label class="app-launch-color-item">
                <span>文字</span>
                <t-color-picker
                  v-model="activeTextLayer.color"
                  format="HEX"
                  :disabled="activeTextControlsDisabled"
                />
              </label>
            </div>
            <div v-else class="app-launch-color-empty">
              当前图层没有可调整的颜色项
            </div>
          </t-card>
        </div>
      </div>

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
  BrowseIcon,
  BrowseOffIcon,
  DragMoveIcon,
  FillColorIcon,
  ImageIcon,
  LayersIcon,
  LockOffIcon,
  LockOnIcon,
  PlayIcon,
  SearchIcon,
  TextIcon,
  UploadIcon
} from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  ColorPicker as TColorPicker,
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
const iconImportDialogVisible = ref(false)
const iconImportKeyword = ref('')
const iconImportType = ref('all')
const iconImportCategory = ref('all')
const iconImportProjectId = ref(getActiveIconProjectId())
const iconImportItems = ref([])
const iconImportCategories = ref([])
const toolbarPosition = reactive({
  x: 50,
  y: 14
})
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
    locked: false
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
  locked: false
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
  locked: false
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
  locked: false
})

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
  ...iconLayers.value.map((layer) => ({
    value: layer.id,
    label: layer.label,
    propertyTitle: '图标属性',
    description: layer.sourceName || '图标资源',
    icon: LayersIcon
  })),
  ...imageLayers.value.map((layer) => ({
    value: layer.id,
    label: layer.label,
    propertyTitle: '图片属性',
    description: layer.fileName || '图片图层',
    icon: ImageIcon
  })),
  ...textLayers.value.map((layer) => ({
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
const floatingToolbarStyle = computed(() => ({
  left: `${toolbarPosition.x}%`,
  top: `${toolbarPosition.y}px`
}))

const logoBoxStyle = computed(() => ({
  left: `${settings.logoX}%`,
  top: `${settings.logoY}%`,
  width: `${settings.logoScale}%`,
  color: settings.logoColor,
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
  transform: 'translate(-50%, -50%)'
})

const getImageLayerStyle = (layer) => ({
  left: `${layer.x}%`,
  top: `${layer.y}%`,
  width: `${layer.scale}%`,
  transform: 'translate(-50%, -50%)'
})

const getIconLayerStyle = (layer) => ({
  left: `${layer.x}%`,
  top: `${layer.y}%`,
  width: `${layer.scale}%`,
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

const addTextLayer = () => {
  const layer = defaultTextLayer(textLayers.value.length + 1)
  textLayers.value = [layer, ...textLayers.value]
  activeLayer.value = layer.id
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
  iconLayers.value = [layer, ...iconLayers.value]
  activeLayer.value = layer.id
  iconImportDialogVisible.value = false
  MessagePlugin.success('已创建图标图层')
}

const handleImageUpload = (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  const layer = defaultImageLayer(imageLayers.value.length + 1)

  const reader = new FileReader()
  reader.onload = () => {
    layer.src = String(reader.result || '')
    layer.fileName = file.name
    layer.fileType = file.type || (file.name.toLowerCase().endsWith('.svg') ? 'image/svg+xml' : '')
    layer.description = file.name
    layer.label = `图片 ${imageLayers.value.length + 1}`
    imageLayers.value = [layer, ...imageLayers.value]
    activeLayer.value = layer.id
    MessagePlugin.success('已创建图片图层')
  }
  reader.readAsDataURL(file)
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
  handleMovablePointerDown(event, layer)
}

const handleImagePointerDown = (event, layer) => {
  handleMovablePointerDown(event, layer)
}

const handleIconPointerDown = (event, layer) => {
  handleMovablePointerDown(event, layer)
}

const handleToolbarPointerDown = (event) => {
  if (event.button !== 0) return

  const shell = event.currentTarget.closest('.app-launch-canvas-shell')
  const toolbar = event.currentTarget.closest('.app-launch-floating-toolbar')
  if (!shell || !toolbar) return

  const shellRect = shell.getBoundingClientRect()
  const toolbarRect = toolbar.getBoundingClientRect()
  const offsetX = event.clientX - toolbarRect.left
  const offsetY = event.clientY - toolbarRect.top

  const move = (moveEvent) => {
    const minLeft = 8
    const maxLeft = Math.max(minLeft, shellRect.width - toolbarRect.width - 8)
    const minTop = 8
    const maxTop = Math.max(minTop, shellRect.height - toolbarRect.height - 8)
    const nextLeft = Math.min(maxLeft, Math.max(minLeft, moveEvent.clientX - shellRect.left - offsetX))
    const nextTop = Math.min(maxTop, Math.max(minTop, moveEvent.clientY - shellRect.top - offsetY))
    toolbarPosition.x = (nextLeft / shellRect.width) * 100
    toolbarPosition.y = Math.round(nextTop)
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
