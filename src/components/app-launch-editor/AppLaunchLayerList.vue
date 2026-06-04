<template>
  <t-card title="图层" :bordered="false">
    <div class="app-launch-layer-list">
      <button
        v-for="layer in layers"
        :key="layer.value"
        class="app-launch-layer-row"
        :class="{
          'is-active': activeLayer === layer.value,
          'is-hidden': !getLayerState(layer.value).visible,
          'is-dragging': draggedLayerId === layer.value,
          'is-drag-over': dragOverLayerId === layer.value
        }"
        type="button"
        draggable="true"
        @click="$emit('select', layer.value)"
        @dragstart="$emit('sort-drag-start', $event, layer.value)"
        @dragover.prevent="$emit('sort-drag-over', $event, layer.value)"
        @dragleave="$emit('sort-drag-leave', layer.value)"
        @drop.stop="$emit('sort-drop', $event, layer.value)"
        @dragend="$emit('sort-drag-end')"
      >
        <component :is="layer.icon" />
        <span class="app-launch-layer-meta">
          <strong>{{ layer.label }}</strong>
          <small>{{ layer.description }} · zIndex {{ getLayerZIndex(layer.value) }}</small>
        </span>
        <span class="app-launch-layer-actions" @click.stop>
          <t-button
            variant="text"
            shape="square"
            size="small"
            :disabled="!canChangeLayerOrder(layer.value)"
            title="上移一层"
            @click="$emit('move-level', layer.value, 'up')"
          >
            <arrow-up-icon />
          </t-button>
          <t-button
            variant="text"
            shape="square"
            size="small"
            :disabled="!canChangeLayerOrder(layer.value)"
            title="下移一层"
            @click="$emit('move-level', layer.value, 'down')"
          >
            <arrow-down-icon />
          </t-button>
          <t-input-number
            v-if="canChangeLayerOrder(layer.value)"
            :model-value="getLayerZIndex(layer.value)"
            class="app-launch-z-index-input"
            size="small"
            theme="column"
            :min="1"
            :max="999"
            @change="$emit('update-z-index', layer.value, $event)"
          />
          <t-button
            variant="text"
            shape="square"
            size="small"
            :title="getLayerState(layer.value).visible ? '隐藏图层' : '显示图层'"
            @click="$emit('toggle-visible', layer.value)"
          >
            <component :is="getLayerState(layer.value).visible ? BrowseIcon : BrowseOffIcon" />
          </t-button>
          <t-button
            variant="text"
            shape="square"
            size="small"
            :disabled="layer.value === 'background'"
            :title="getLayerState(layer.value).locked ? '解锁图层' : '锁定图层'"
            @click="$emit('toggle-locked', layer.value)"
          >
            <component :is="getLayerState(layer.value).locked ? LockOnIcon : LockOffIcon" />
          </t-button>
          <t-button
            v-if="canDeleteLayer(layer.value)"
            variant="text"
            shape="square"
            size="small"
            title="删除图层"
            @click="$emit('delete', layer.value)"
          >
            <delete-icon />
          </t-button>
        </span>
      </button>
    </div>
  </t-card>
</template>

<script setup>
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BrowseIcon,
  BrowseOffIcon,
  DeleteIcon,
  LockOffIcon,
  LockOnIcon
} from 'tdesign-icons-vue-next'
import { Button as TButton, Card as TCard, InputNumber as TInputNumber } from 'tdesign-vue-next'

defineProps({
  layers: {
    type: Array,
    default: () => []
  },
  activeLayer: {
    type: String,
    default: ''
  },
  draggedLayerId: {
    type: String,
    default: ''
  },
  dragOverLayerId: {
    type: String,
    default: ''
  },
  getLayerState: {
    type: Function,
    required: true
  },
  getLayerZIndex: {
    type: Function,
    required: true
  },
  canChangeLayerOrder: {
    type: Function,
    required: true
  },
  canDeleteLayer: {
    type: Function,
    required: true
  }
})

defineEmits([
  'select',
  'sort-drag-start',
  'sort-drag-over',
  'sort-drag-leave',
  'sort-drop',
  'sort-drag-end',
  'move-level',
  'update-z-index',
  'toggle-visible',
  'toggle-locked',
  'delete'
])
</script>
