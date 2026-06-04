<template>
  <t-card class="app-launch-canvas-card" :bordered="false">
    <div class="app-launch-canvas-header">
      <span>{{ activeDevice.label }}</span>
      <t-tag variant="light">{{ displaySize.width }} x {{ displaySize.height }}</t-tag>
    </div>
    <main class="app-launch-canvas-shell">
      <div class="app-launch-phone" :style="phoneStyle">
        <div
          class="app-launch-artboard"
          :class="{ 'is-transparent': !layers.background.visible, 'is-drag-over': isWidgetDragOver }"
          :style="artboardStyle"
          @click="$emit('select', 'background')"
          @dragover.prevent="$emit('canvas-drag-over', $event)"
          @dragleave="$emit('canvas-drag-leave', $event)"
          @drop.stop="$emit('canvas-drop', $event)"
        >
          <div
            v-if="layers.logo.visible"
            class="app-launch-logo-box"
            :class="{ 'is-active': activeLayer === 'logo', 'is-locked': layers.logo.locked }"
            :style="logoBoxStyle"
            @click.stop="$emit('select', 'logo')"
            @pointerdown.stop="$emit('logo-pointerdown', $event)"
          >
            <span v-if="logoSvgColorEnabled" class="app-launch-svg-mask" :style="logoSvgMaskStyle"></span>
            <img v-else-if="settings.logoSrc" :src="settings.logoSrc" :alt="settings.logoFileName || '启动页图片'" />
            <layers-icon v-else />
          </div>
          <div
            v-for="imageLayer in orderedImageLayers"
            v-show="imageLayer.visible"
            :key="imageLayer.id"
            class="app-launch-image-box"
            :class="{ 'is-active': activeLayer === imageLayer.id, 'is-locked': imageLayer.locked }"
            :style="getImageLayerStyle(imageLayer)"
            @click.stop="$emit('select', imageLayer.id)"
            @dblclick.stop="$emit('open-image-upload', imageLayer)"
            @pointerdown.stop="$emit('image-pointerdown', $event, imageLayer)"
          >
            <span
              v-if="isSvgImageLayer(imageLayer)"
              class="app-launch-svg-mask"
              :style="getImageLayerMaskStyle(imageLayer)"
            ></span>
            <img v-else-if="imageLayer.src" :src="imageLayer.src" :alt="imageLayer.label" />
            <image-icon v-else />
            <button
              v-if="canDeleteLayer(imageLayer.id)"
              class="app-launch-layer-delete"
              type="button"
              title="删除图层"
              @pointerdown.stop
              @click.stop="$emit('delete-layer', imageLayer.id)"
            >
              <delete-icon />
            </button>
          </div>
          <div
            v-for="iconLayer in orderedIconLayers"
            v-show="iconLayer.visible"
            :key="iconLayer.id"
            class="app-launch-icon-box"
            :class="{ 'is-active': activeLayer === iconLayer.id, 'is-locked': iconLayer.locked }"
            :style="getIconLayerStyle(iconLayer)"
            @click.stop="$emit('select', iconLayer.id)"
            @pointerdown.stop="$emit('icon-pointerdown', $event, iconLayer)"
          >
            <IconGlyph
              :paths="iconLayer.paths"
              :stroke-width="2"
              :icon-type="iconLayer.iconType"
              :color-mode="iconLayer.colorMode"
              :primary-color="iconLayer.primaryColor"
              :secondary-color="iconLayer.secondaryColor"
            />
            <button
              v-if="canDeleteLayer(iconLayer.id)"
              class="app-launch-layer-delete"
              type="button"
              title="删除图层"
              @pointerdown.stop
              @click.stop="$emit('delete-layer', iconLayer.id)"
            >
              <delete-icon />
            </button>
          </div>
          <div
            v-for="textLayer in orderedTextLayers"
            v-show="textLayer.visible"
            :key="textLayer.id"
            class="app-launch-text-box"
            :class="{ 'is-active': activeLayer === textLayer.id, 'is-locked': textLayer.locked }"
            :style="getTextLayerStyle(textLayer)"
            @click.stop="$emit('select', textLayer.id)"
            @dblclick.stop="$emit('start-text-edit', $event, textLayer)"
            @pointerdown.stop="$emit('text-pointerdown', $event, textLayer)"
          >
            <span
              class="app-launch-text-content"
              :contenteditable="isTextEditing(textLayer)"
              :data-layer-id="textLayer.id"
              spellcheck="false"
              @blur="$emit('finish-text-edit', $event, textLayer)"
              @keydown.enter.prevent="$emit('finish-text-edit', $event, textLayer)"
              @pointerdown.stop="$emit('text-content-pointerdown', $event, textLayer)"
              v-text="textLayer.text"
            />
            <button
              v-if="canDeleteLayer(textLayer.id)"
              class="app-launch-layer-delete"
              type="button"
              title="删除图层"
              @pointerdown.stop
              @click.stop="$emit('delete-layer', textLayer.id)"
            >
              <delete-icon />
            </button>
          </div>
        </div>
      </div>

      <slot />
    </main>
  </t-card>
</template>

<script setup>
import { DeleteIcon, ImageIcon, LayersIcon } from 'tdesign-icons-vue-next'
import { Card as TCard, Tag as TTag } from 'tdesign-vue-next'
import IconGlyph from '../IconGlyph.vue'

defineProps({
  activeDevice: {
    type: Object,
    required: true
  },
  displaySize: {
    type: Object,
    required: true
  },
  phoneStyle: {
    type: Object,
    required: true
  },
  artboardStyle: {
    type: Object,
    required: true
  },
  layers: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  activeLayer: {
    type: String,
    default: ''
  },
  isWidgetDragOver: {
    type: Boolean,
    default: false
  },
  logoBoxStyle: {
    type: Object,
    required: true
  },
  logoSvgColorEnabled: {
    type: Boolean,
    default: false
  },
  logoSvgMaskStyle: {
    type: Object,
    required: true
  },
  orderedImageLayers: {
    type: Array,
    default: () => []
  },
  orderedIconLayers: {
    type: Array,
    default: () => []
  },
  orderedTextLayers: {
    type: Array,
    default: () => []
  },
  getImageLayerStyle: {
    type: Function,
    required: true
  },
  getImageLayerMaskStyle: {
    type: Function,
    required: true
  },
  getIconLayerStyle: {
    type: Function,
    required: true
  },
  getTextLayerStyle: {
    type: Function,
    required: true
  },
  isSvgImageLayer: {
    type: Function,
    required: true
  },
  canDeleteLayer: {
    type: Function,
    required: true
  },
  isTextEditing: {
    type: Function,
    required: true
  }
})

defineEmits([
  'select',
  'canvas-drag-over',
  'canvas-drag-leave',
  'canvas-drop',
  'logo-pointerdown',
  'image-pointerdown',
  'icon-pointerdown',
  'text-pointerdown',
  'text-content-pointerdown',
  'start-text-edit',
  'finish-text-edit',
  'open-image-upload',
  'delete-layer'
])
</script>
