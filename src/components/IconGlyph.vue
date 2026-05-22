<template>
  <svg
    ref="svgRef"
    class="icon-glyph"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    @click="handleCanvasClick"
  >
    <path
      v-for="(path, index) in paths"
      :key="`${path.d}-${index}`"
      :d="path.d"
      :fill="iconType === 'fill' ? resolvePathColor(path, index) : 'none'"
      :stroke="iconType === 'fill' ? 'none' : resolvePathColor(path, index)"
      :stroke-width="iconType === 'fill' ? 0 : strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-if="selectedPath"
      class="icon-glyph-selection"
      :d="selectedPath.d"
      fill="none"
      stroke="#ff00cc"
      :stroke-width="iconType === 'fill' ? 0.7 : Math.max(strokeWidth, 1.5)"
      stroke-dasharray="1.2 1"
      stroke-linecap="round"
      stroke-linejoin="round"
      pointer-events="none"
    />
    <path
      v-for="(path, index) in paths"
      :key="`hit-${path.d}-${index}`"
      class="icon-glyph-hit-area"
      :d="path.d"
      fill="none"
      stroke="transparent"
      :stroke-width="Math.max(strokeWidth + 8, 9)"
      stroke-linecap="round"
      stroke-linejoin="round"
      pointer-events="none"
    />
  </svg>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  paths: {
    type: Array,
    required: true
  },
  strokeWidth: {
    type: Number,
    default: 2
  },
  iconType: {
    type: String,
    default: 'stroke'
  },
  colorMode: {
    type: String,
    default: 'single'
  },
  primaryColor: {
    type: String,
    default: '#111827'
  },
  secondaryColor: {
    type: String,
    default: '#0052d9'
  },
  selectedPathIndex: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits(['select-path'])

const svgRef = ref(null)
const resolvedPrimaryColor = computed(() => props.primaryColor || '#111827')
const resolvedSecondaryColor = computed(() => props.secondaryColor || '#0052d9')
const selectedPath = computed(() => props.paths[props.selectedPathIndex] || null)
const resolvePathColor = (path, index) => {
  if (path.color) return path.color
  if (props.colorMode === 'dual' && index === props.paths.length - 1) return resolvedSecondaryColor.value
  return resolvedPrimaryColor.value
}

const handleCanvasClick = (event) => {
  const svg = svgRef.value
  if (!svg) return

  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse())

  for (let index = props.paths.length - 1; index >= 0; index -= 1) {
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    probe.setAttribute('d', props.paths[index].d)
    probe.setAttribute('fill', 'black')
    probe.setAttribute('stroke', 'black')
    probe.setAttribute('stroke-width', String(Math.max(props.strokeWidth + 8, 9)))
    probe.setAttribute('stroke-linecap', 'round')
    probe.setAttribute('stroke-linejoin', 'round')
    probe.setAttribute('opacity', '0')
    probe.setAttribute('pointer-events', 'none')
    svg.appendChild(probe)

    const inFill = typeof probe.isPointInFill === 'function' && probe.isPointInFill(svgPoint)
    const inStroke = typeof probe.isPointInStroke === 'function' && probe.isPointInStroke(svgPoint)
    svg.removeChild(probe)

    if (inFill || inStroke) {
      emit('select-path', index)
      return
    }
  }
}
</script>
