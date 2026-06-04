<template>
  <t-card class="app-launch-floating-properties" :style="floatingPropertiesStyle" :bordered="false">
    <template #title>
      <button class="app-launch-properties-drag" type="button" title="拖动属性面板" @pointerdown="$emit('pointerdown', $event)">
        <span>{{ activeLayerMeta.propertyTitle }}</span>
        <drag-move-icon />
      </button>
    </template>
    <div v-if="activeLayer === 'logo'" class="app-launch-control-stack">
      <div class="app-launch-layer-state">
        <span>图片图层</span>
        <t-tag v-if="layers.logo.locked" theme="warning" variant="light">已锁定</t-tag>
        <t-tag v-else-if="!layers.logo.visible" theme="default" variant="light">已隐藏</t-tag>
        <t-tag v-else theme="primary" variant="light">可编辑</t-tag>
      </div>
      <div class="app-launch-upload-hint">
        <span>{{ settings.logoFileName || '未上传图片' }}</span>
        <small>可从左侧拖入图片或双击图片图层上传</small>
      </div>
      <div class="app-launch-control-header"><span>横坐标</span><strong>{{ settings.logoX }}%</strong></div>
      <t-slider v-model="settings.logoX" :min="0" :max="100" :disabled="logoControlsDisabled" />
      <div class="app-launch-control-header"><span>纵坐标</span><strong>{{ settings.logoY }}%</strong></div>
      <t-slider v-model="settings.logoY" :min="0" :max="100" :disabled="logoControlsDisabled" />
      <div class="app-launch-control-header"><span>缩放</span><strong>{{ logoScaleText }}</strong></div>
      <t-slider v-model="settings.logoScale" :min="18" :max="76" :disabled="logoControlsDisabled" />
      <label v-if="logoColorControlVisible" class="app-launch-color-item">
        <span>图形</span>
        <t-color-picker v-model="settings.logoColor" format="HEX" :disabled="logoControlsDisabled" />
      </label>
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
        <small>双击画布图片或点击左侧图片控件可上传</small>
      </div>
      <div class="app-launch-control-header"><span>横坐标</span><strong>{{ Math.round(activeImageLayer.x) }}%</strong></div>
      <t-slider v-model="activeImageLayer.x" :min="0" :max="100" :disabled="activeImageControlsDisabled" />
      <div class="app-launch-control-header"><span>纵坐标</span><strong>{{ Math.round(activeImageLayer.y) }}%</strong></div>
      <t-slider v-model="activeImageLayer.y" :min="0" :max="100" :disabled="activeImageControlsDisabled" />
      <div class="app-launch-control-header"><span>缩放</span><strong>{{ activeImageLayer.scale }}%</strong></div>
      <t-slider v-model="activeImageLayer.scale" :min="12" :max="120" :disabled="activeImageControlsDisabled" />
      <label v-if="activeImageColorControlVisible" class="app-launch-color-item">
        <span>SVG 着色</span>
        <t-color-picker v-model="activeImageLayer.tintColor" format="HEX" :disabled="activeImageControlsDisabled" />
      </label>
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
        <small>{{ activeIconLayer.iconType === 'fill' ? '填充图标' : '描边图标' }}</small>
      </div>
      <div class="app-launch-control-header"><span>横坐标</span><strong>{{ Math.round(activeIconLayer.x) }}%</strong></div>
      <t-slider v-model="activeIconLayer.x" :min="0" :max="100" :disabled="activeIconControlsDisabled" />
      <div class="app-launch-control-header"><span>纵坐标</span><strong>{{ Math.round(activeIconLayer.y) }}%</strong></div>
      <t-slider v-model="activeIconLayer.y" :min="0" :max="100" :disabled="activeIconControlsDisabled" />
      <div class="app-launch-control-header"><span>大小</span><strong>{{ activeIconLayer.scale }}%</strong></div>
      <t-slider v-model="activeIconLayer.scale" :min="8" :max="96" :disabled="activeIconControlsDisabled" />
      <div class="app-launch-control-header"><span>配色模式</span></div>
      <t-radio-group v-model="activeIconLayer.colorMode" variant="default-filled" :disabled="activeIconControlsDisabled">
        <t-radio-button value="single">单色</t-radio-button>
        <t-radio-button value="dual">双色</t-radio-button>
      </t-radio-group>
      <label class="app-launch-color-item">
        <span>主色</span>
        <t-color-picker v-model="activeIconLayer.primaryColor" format="HEX" :disabled="activeIconControlsDisabled" />
      </label>
      <label v-if="activeIconLayer.colorMode === 'dual'" class="app-launch-color-item">
        <span>辅色</span>
        <t-color-picker v-model="activeIconLayer.secondaryColor" format="HEX" :disabled="activeIconControlsDisabled" />
      </label>
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
        <t-input v-model="activeTextLayer.text" clearable :disabled="activeTextControlsDisabled" />
      </label>
      <div class="app-launch-control-header"><span>横坐标</span><strong>{{ Math.round(activeTextLayer.x) }}%</strong></div>
      <t-slider v-model="activeTextLayer.x" :min="0" :max="100" :disabled="activeTextControlsDisabled" />
      <div class="app-launch-control-header"><span>纵坐标</span><strong>{{ Math.round(activeTextLayer.y) }}%</strong></div>
      <t-slider v-model="activeTextLayer.y" :min="0" :max="100" :disabled="activeTextControlsDisabled" />
      <div class="app-launch-control-header"><span>字号</span><strong>{{ activeTextLayer.fontSize }}px</strong></div>
      <t-slider v-model="activeTextLayer.fontSize" :min="12" :max="96" :disabled="activeTextControlsDisabled" />
      <label class="app-launch-color-item">
        <span>文字</span>
        <t-color-picker v-model="activeTextLayer.color" format="HEX" :disabled="activeTextControlsDisabled" />
      </label>
    </div>
    <div v-else class="app-launch-control-stack">
      <p class="app-launch-floating-empty">当前选中背景图层。</p>
      <label class="app-launch-color-item">
        <span>背景</span>
        <t-color-picker v-model="settings.backgroundColor" format="HEX" :disabled="!layers.background.visible" />
      </label>
    </div>
  </t-card>
</template>

<script setup>
import { DragMoveIcon } from 'tdesign-icons-vue-next'
import {
  Card as TCard,
  ColorPicker as TColorPicker,
  Input as TInput,
  RadioButton as TRadioButton,
  RadioGroup as TRadioGroup,
  Slider as TSlider,
  Tag as TTag
} from 'tdesign-vue-next'

defineProps({
  floatingPropertiesStyle: {
    type: Object,
    required: true
  },
  activeLayerMeta: {
    type: Object,
    required: true
  },
  activeLayer: {
    type: String,
    default: ''
  },
  layers: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  logoControlsDisabled: {
    type: Boolean,
    default: false
  },
  logoScaleText: {
    type: String,
    default: ''
  },
  logoColorControlVisible: {
    type: Boolean,
    default: false
  },
  activeImageLayer: {
    type: Object,
    default: null
  },
  activeImageControlsDisabled: {
    type: Boolean,
    default: false
  },
  activeImageColorControlVisible: {
    type: Boolean,
    default: false
  },
  activeIconLayer: {
    type: Object,
    default: null
  },
  activeIconControlsDisabled: {
    type: Boolean,
    default: false
  },
  activeTextLayer: {
    type: Object,
    default: null
  },
  activeTextControlsDisabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['pointerdown'])
</script>
