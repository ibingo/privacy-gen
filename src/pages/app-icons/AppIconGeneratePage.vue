<template>
  <div class="app-icon-generate-page">
    <div v-if="icon" class="app-icon-generate-shell">
      <t-card class="app-launch-editor-toolbar" :bordered="false">
        <div class="app-launch-editor-title">
          <t-button variant="text" shape="square" title="返回列表" @click="goBack">
            <arrow-left-icon />
          </t-button>
          <div>
            <h2>{{ icon.name }}</h2>
            <p>{{ icon.bundleId }}</p>
          </div>
        </div>

        <t-space class="app-launch-editor-actions">
          <t-button variant="outline" @click="goBack">取消</t-button>
          <t-button theme="primary" @click="submitGenerate">开始生成</t-button>
        </t-space>
      </t-card>

      <div class="app-icon-generate-layout">
        <div class="app-launch-side-stack">
          <t-card title="源图" :bordered="false">
            <div class="app-icon-source-summary">
              <span class="app-icon-source-preview" :style="isImageIcon ? null : textIconStyle">
                <img v-if="isImageIcon" :src="icon.sourcePreview" :alt="icon.appName" />
                <span v-else :style="sourceTextIconTextStyle">{{ settings.iconText || getAppInitial(icon.appName) }}</span>
              </span>
              <div>
                <strong>{{ icon.sourceFileName || '未上传源图标' }}</strong>
                <small>{{ icon.sourceSize }}</small>
              </div>
            </div>
          </t-card>

          <t-card title="生成平台" :bordered="false">
            <div class="app-launch-control-stack">
              <t-select
                v-model="settings.platforms"
                class="app-icon-platform-select"
                multiple
                filterable
                clearable
                :min-collapsed-num="3"
                placeholder="搜索并选择生成平台"
              >
                <t-option
                  v-for="platform in appIconPlatformOptions"
                  :key="platform.value"
                  :value="platform.value"
                  :label="`${platform.label} · ${platform.folder}`"
                />
              </t-select>
              <div class="app-icon-platform-summary">
                <span
                  v-for="platform in selectedPreviewPlatforms"
                  :key="platform.value"
                >
                  {{ platform.label }}
                </span>
              </div>
            </div>
          </t-card>

          <t-card title="输出设置" :bordered="false">
            <div class="app-launch-control-stack">
              <label class="app-launch-text-field">
                <span>输出名称</span>
                <t-input v-model="settings.outputName" clearable />
              </label>
              <div class="app-launch-switch-row">
                <span>{{ manifestLabel }}</span>
                <t-switch v-model="settings.includeManifest" />
              </div>
            </div>
          </t-card>

          <t-card v-if="showBadgeParameters" title="角标和徽章" :bordered="false">
            <div class="app-launch-control-stack">
              <label class="app-launch-text-field">
                <span>角标</span>
                <t-select v-model="settings.cornerBadge">
                  <t-option value="none" label="无" />
                  <t-option value="beta" label="BETA" />
                  <t-option value="dev" label="DEV" />
                  <t-option value="test" label="TEST" />
                </t-select>
              </label>
              <label class="app-launch-text-field">
                <span>角标样式</span>
                <t-select v-model="settings.cornerBadgeStyle" :disabled="settings.cornerBadge === 'none'">
                  <t-option value="corner" label="贴角" />
                  <t-option value="corner-ribbon" label="贴角圆角横幅" />
                  <t-option value="banner" label="横幅" />
                </t-select>
              </label>
              <label class="app-launch-text-field">
                <span>{{ settings.cornerBadgeStyle === 'banner' ? '横幅位置' : '贴角位置' }}</span>
                <t-select v-model="settings.cornerBadgePosition" :disabled="settings.cornerBadge === 'none'">
                  <t-option value="top-left" label="左上" />
                  <t-option value="top-right" label="右上" />
                  <t-option value="bottom-left" label="左下" />
                  <t-option value="bottom-right" label="右下" />
                </t-select>
              </label>
              <div class="app-launch-switch-row">
                <span>添加徽章</span>
                <t-switch v-model="settings.includeBadge" />
              </div>
              <template v-if="settings.includeBadge">
                <label class="app-launch-text-field">
                  <span>徽章</span>
                  <t-input v-model="settings.badgeText" clearable />
                </label>
                <label class="app-launch-text-field">
                  <span>版本</span>
                  <t-input v-model="settings.badgeVersion" clearable />
                </label>
                <label class="app-launch-text-field">
                  <span>颜色</span>
                  <t-select v-model="settings.badgeColor">
                    <t-option value="blue" label="blue" />
                    <t-option value="green" label="green" />
                    <t-option value="red" label="red" />
                    <t-option value="dark" label="dark" />
                    <t-option value="light" label="light" />
                  </t-select>
                </label>
              </template>
            </div>
          </t-card>
        </div>

        <t-card class="app-icon-canvas-card" :bordered="false">
          <div class="app-launch-canvas-header">
            <span>图标预览</span>
            <t-tag variant="light">{{ selectedPreviewPlatforms.length }} 个平台</t-tag>
          </div>
          <main class="app-icon-canvas-shell">
            <div class="app-icon-device-grid">
              <div
                v-for="platform in selectedPreviewPlatforms"
                :key="platform.value"
                class="app-icon-device-card"
                :class="`is-${platform.value}`"
              >
                <span class="app-icon-device-label">{{ platform.label }}</span>
                <span class="app-icon-device-preview" :style="previewStyle">
                  <img v-if="isImageIcon" :src="icon.sourcePreview" :alt="icon.appName" />
                  <span v-else class="app-icon-preview-text" :style="textIconTextStyle">
                    {{ settings.iconText || getAppInitial(icon.appName) }}
                  </span>
                  <span
                    v-if="settings.cornerBadge !== 'none'"
                    class="app-icon-corner-badge"
                    :class="`is-${settings.cornerBadgeStyle}`"
                    :style="cornerBadgeStyle"
                  >
                    {{ cornerBadgeLabel }}
                  </span>
                  <span
                    v-if="settings.includeBadge"
                    class="app-icon-preview-badge"
                    :class="`is-${settings.badgeColor}`"
                  >
                    {{ settings.badgeText }} {{ settings.badgeVersion }}
                  </span>
                </span>
              </div>
            </div>
          </main>
        </t-card>

        <div class="app-launch-side-stack">
          <t-card title="通用参数" :bordered="false">
            <div class="app-launch-control-stack">
              <div v-if="!isImageIcon" class="app-icon-text-editor is-compact">
                <span class="app-icon-source-preview" :style="textIconStyle">
                  <span :style="sourceTextIconTextStyle">{{ settings.iconText || getAppInitial(icon.appName) }}</span>
                </span>
                <div class="app-icon-text-fields">
                  <label class="app-launch-text-field">
                    <span>图标文字</span>
                    <t-input v-model="settings.iconText" maxlength="4" clearable />
                  </label>
                  <div class="app-launch-control-header">
                    <span>文字大小</span>
                    <strong>{{ settings.iconTextSize }}px</strong>
                  </div>
                  <t-slider v-model="settings.iconTextSize" :min="20" :max="72" />
                  <div class="app-icon-color-row">
                    <label>
                      <span>起始色</span>
                      <t-color-picker v-model="settings.gradientStart" format="HEX" />
                    </label>
                    <label>
                      <span>结束色</span>
                      <t-color-picker v-model="settings.gradientEnd" format="HEX" />
                    </label>
                  </div>
                  <label class="app-launch-text-field">
                    <span>渐变方式</span>
                    <t-select v-model="settings.gradientMode">
                      <t-option
                        v-for="mode in gradientModeOptions"
                        :key="mode.value"
                        :value="mode.value"
                        :label="mode.label"
                      />
                    </t-select>
                  </label>
                  <label v-if="settings.gradientMode === 'linear'" class="app-launch-text-field">
                    <span>渐变方向</span>
                    <t-select v-model="settings.gradientDirection">
                      <t-option
                        v-for="direction in gradientDirectionOptions"
                        :key="direction.value"
                        :value="direction.value"
                        :label="direction.label"
                      />
                    </t-select>
                  </label>
                </div>
              </div>

              <div class="app-icon-color-row">
                <label>
                  <span>背景颜色</span>
                  <t-color-picker v-model="settings.backgroundColor" format="HEX" />
                </label>
                <label>
                  <span>颜色值</span>
                  <t-input v-model="settings.backgroundColor" />
                </label>
              </div>

              <div class="app-launch-control-header">
                <span>内补白</span>
                <strong>{{ settings.padding }}%</strong>
              </div>
              <t-slider v-model="settings.padding" :min="0" :max="28" />

              <div class="app-launch-control-header">
                <span>自动圆角</span>
              </div>
              <t-radio-group v-model="settings.autoRound" variant="default-filled">
                <t-radio-button :value="false">无</t-radio-button>
                <t-radio-button :value="true">有</t-radio-button>
              </t-radio-group>

              <template v-if="settings.autoRound">
                <div class="app-launch-control-header">
                  <span>圆角比例</span>
                  <strong>{{ settings.cornerRadius }}%</strong>
                </div>
                <t-slider v-model="settings.cornerRadius" :min="4" :max="32" />
              </template>

              <div class="app-launch-control-header">
                <span>目标类型</span>
              </div>
              <t-radio-group v-model="settings.targetType" variant="default-filled">
                <t-radio-button value="icon">图标</t-radio-button>
                <t-radio-button value="image">通用图片</t-radio-button>
              </t-radio-group>

              <div v-if="settings.targetType === 'image'" class="app-icon-custom-size-row">
                <span>自定义大小</span>
                <button
                  v-for="size in customSizeOptions"
                  :key="size"
                  type="button"
                  :class="{ 'is-active': settings.customSizes.includes(size) }"
                  @click="toggleCustomSize(size)"
                >
                  {{ size }}
                </button>
              </div>
            </div>
          </t-card>

          <t-card v-if="showAndroidParameters || showWebAppParameters" title="平台参数" :bordered="false">
            <div class="app-launch-control-stack">
              <template v-if="showAndroidParameters">
                <div class="app-launch-control-header">
                  <span>Android 目录</span>
                </div>
                <t-radio-group v-model="settings.androidDirectory" variant="default-filled">
                  <t-radio-button value="mipmap">mipmap</t-radio-button>
                  <t-radio-button value="drawable">drawable</t-radio-button>
                </t-radio-group>
                <label class="app-launch-text-field">
                  <span>Android 文件名</span>
                  <t-input v-model="settings.androidFileName" clearable />
                </label>
              </template>

              <div v-if="showWebAppParameters" class="app-icon-custom-size-row">
                <span>Web App 尺寸</span>
                <button
                  v-for="size in webAppSizeOptions"
                  :key="size"
                  type="button"
                  :class="{ 'is-active': settings.webAppSizes.includes(size) }"
                  @click="toggleWebAppSize(size)"
                >
                  {{ size }}
                </button>
              </div>
            </div>
          </t-card>
        </div>
      </div>
    </div>

    <div v-else class="icon-empty-state">
      <image-add-icon />
      <h3>应用图标不存在</h3>
      <p>返回列表后重新选择需要生成的应用图标。</p>
      <button class="document-primary-button" type="button" @click="goBack">返回列表</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, ImageAddIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  ColorPicker as TColorPicker,
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
  appIconPlatformOptions,
  buildGradient,
  findAppIcon,
  gradientDirectionOptions,
  gradientModeOptions,
  updateAppIcon
} from '../../config/appIcons'

const route = useRoute()
const router = useRouter()
const icon = computed(() => findAppIcon(route.params.id))
const settings = reactive({
  outputName: icon.value?.appName || '',
  padding: 8,
  backgroundColor: '#ffffff',
  platforms: [...(icon.value?.platforms || ['ios', 'android'])],
  iconText: icon.value?.iconText || 'A',
  iconTextSize: icon.value?.iconTextSize || 44,
  gradientStart: icon.value?.gradientStart || icon.value?.colors?.[0] || '#0052d9',
  gradientEnd: icon.value?.gradientEnd || icon.value?.colors?.[1] || '#35c2ff',
  gradientDirection: icon.value?.gradientDirection || '135deg',
  gradientMode: icon.value?.gradientMode || 'linear',
  autoRound: false,
  cornerRadius: 22,
  targetType: 'image',
  customSizes: [],
  androidDirectory: 'mipmap',
  androidFileName: 'ic_launcher',
  webAppSizes: [16, 32, 64, 256],
  cornerBadge: 'beta',
  cornerBadgeStyle: 'corner',
  cornerBadgePosition: 'top-left',
  includeBadge: false,
  badgeText: 'Version',
  badgeVersion: '1.0.0',
  badgeColor: 'blue',
  includeManifest: true
})
const webAppSizeOptions = [16, 32, 48, 64, 128, 256]
const customSizeOptions = [28, 108, 240, 360, 480, 540, 720, 960, 192]
const androidPlatformValues = ['android', 'cordova', 'quasar']
const webAppPlatformValues = ['webapp', 'quasar']
const selectedPreviewPlatforms = computed(() => {
  return appIconPlatformOptions.filter((platform) => settings.platforms.includes(platform.value))
})

const hasSelectedPlatform = (values) => {
  return values.some((value) => settings.platforms.includes(value))
}

const showAndroidParameters = computed(() => hasSelectedPlatform(androidPlatformValues))
const showWebAppParameters = computed(() => hasSelectedPlatform(webAppPlatformValues))
const showBadgeParameters = computed(() => hasSelectedPlatform(['ios', 'android', 'webapp', 'cordova', 'macos', 'watchos', 'quasar']))
const cornerBadgeLabel = computed(() => {
  const labels = {
    beta: 'BETA',
    dev: 'DEV',
    test: 'TEST'
  }
  return labels[settings.cornerBadge] || ''
})
const manifestLabel = computed(() => {
  if (showWebAppParameters.value && showAndroidParameters.value) return '生成 manifest / Contents.json'
  if (showWebAppParameters.value) return '生成 manifest.json'
  return '生成 Contents.json'
})
const isImageIcon = computed(() => icon.value?.sourceType === 'image' && icon.value?.sourcePreview)
const textIconStyle = computed(() => ({
  background: buildGradient({
    start: settings.gradientStart,
    end: settings.gradientEnd,
    direction: settings.gradientDirection,
    mode: settings.gradientMode
  })
}))
const textIconTextStyle = computed(() => ({
  fontSize: `${settings.iconTextSize}px`,
  letterSpacing: '0',
  transform: `translate(-50%, -50%) scale(${previewTextScale.value})`
}))
const sourceTextIconTextStyle = computed(() => ({
  fontSize: `${Math.min(settings.iconTextSize, 26)}px`,
  letterSpacing: '0'
}))
const previewTextScale = computed(() => {
  const length = [...String(settings.iconText || getAppInitial(icon.value?.appName))].length
  if (length <= 1) return 1
  return Math.min(1, 3.1 / length)
})

const previewStyle = computed(() => {
  const [start = '#0052d9', end = '#35c2ff'] = icon.value?.colors || []
  const radius = settings.autoRound ? settings.cornerRadius : 0
  return {
    borderRadius: `${radius}%`,
    padding: `${settings.padding}%`,
    background: isImageIcon.value
      ? settings.backgroundColor
      : buildGradient({
        start: settings.gradientStart || start,
        end: settings.gradientEnd || end,
        direction: settings.gradientDirection,
        mode: settings.gradientMode
      })
  }
})

const cornerBadgeStyle = computed(() => {
  const inset = settings.autoRound
    ? Math.round(Math.min(18, Math.max(8, settings.cornerRadius * 0.55)))
    : 0

  if (settings.cornerBadgeStyle === 'banner') {
    const isBottom = settings.cornerBadgePosition.startsWith('bottom')
    return {
      top: isBottom ? 'auto' : '0',
      bottom: isBottom ? '0' : 'auto',
      left: '0',
      right: '0',
      transform: 'none'
    }
  }

  if (settings.cornerBadgeStyle === 'corner-ribbon') {
    const ribbonInset = settings.autoRound ? 2 : 0
    const ribbonOffset = settings.autoRound ? -24 : -26
    const ribbonPositions = {
      'top-left': {
        top: `${ribbonInset}px`,
        left: `${ribbonOffset}px`,
        transform: 'rotate(-45deg)'
      },
      'top-right': {
        top: `${ribbonInset}px`,
        right: `${ribbonOffset}px`,
        transform: 'rotate(45deg)'
      },
      'bottom-left': {
        bottom: `${ribbonInset}px`,
        left: `${ribbonOffset}px`,
        transform: 'rotate(45deg)'
      },
      'bottom-right': {
        right: `${ribbonOffset}px`,
        bottom: `${ribbonInset}px`,
        transform: 'rotate(-45deg)'
      }
    }
    return ribbonPositions[settings.cornerBadgePosition] || ribbonPositions['top-left']
  }

  const offset = settings.autoRound
    ? Math.round(-34 + inset * 0.55)
    : -34
  const positions = {
    'top-left': {
      top: `${inset}px`,
      left: `${offset}px`,
      transform: 'rotate(-45deg)'
    },
    'top-right': {
      top: `${inset}px`,
      right: `${offset}px`,
      transform: 'rotate(45deg)'
    },
    'bottom-left': {
      bottom: `${inset}px`,
      left: `${offset}px`,
      transform: 'rotate(45deg)'
    },
    'bottom-right': {
      right: `${offset}px`,
      bottom: `${inset}px`,
      transform: 'rotate(-45deg)'
    }
  }
  return positions[settings.cornerBadgePosition] || positions['top-left']
})

const toggleCustomSize = (size) => {
  if (settings.customSizes.includes(size)) {
    settings.customSizes = settings.customSizes.filter((item) => item !== size)
    return
  }

  settings.customSizes = [...settings.customSizes, size]
}

const toggleWebAppSize = (size) => {
  if (settings.webAppSizes.includes(size)) {
    settings.webAppSizes = settings.webAppSizes.filter((item) => item !== size)
    return
  }

  settings.webAppSizes = [...settings.webAppSizes, size]
}

const getAppInitial = (name) => {
  return String(name || 'A').trim().slice(0, 1).toUpperCase()
}

const goBack = () => {
  router.push({ name: 'app-icon-list' })
}

const submitGenerate = () => {
  if (!settings.platforms.length) {
    MessagePlugin.warning('请至少选择一个生成平台')
    return
  }

  updateAppIcon(route.params.id, {
    platforms: settings.platforms,
    iconText: settings.iconText,
    iconTextSize: settings.iconTextSize,
    gradientStart: settings.gradientStart,
    gradientEnd: settings.gradientEnd,
    gradientDirection: settings.gradientDirection,
    gradientMode: settings.gradientMode,
    colors: [settings.gradientStart, settings.gradientEnd],
    status: '已生成',
    statusTone: 'success'
  })
  MessagePlugin.success('应用图标生成任务已提交')
  router.push({ name: 'app-icon-list' })
}
</script>
