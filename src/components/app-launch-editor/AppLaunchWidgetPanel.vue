<template>
  <t-card title="控件" :bordered="false">
    <div class="app-launch-widget-list">
      <button
        v-for="widget in widgets"
        :key="widget.type"
        class="app-launch-widget-item"
        type="button"
        draggable="true"
        @click="$emit('add', widget.type)"
        @dragstart="$emit('drag-start', $event, widget.type)"
        @dragend="$emit('drag-end')"
      >
        <component :is="widget.icon" />
        <span>
          <strong>{{ widget.label }}</strong>
          <small>{{ widget.description }}</small>
        </span>
      </button>
    </div>
  </t-card>
</template>

<script setup>
import { Card as TCard } from 'tdesign-vue-next'

defineProps({
  widgets: {
    type: Array,
    default: () => []
  }
})

defineEmits(['add', 'drag-start', 'drag-end'])
</script>
