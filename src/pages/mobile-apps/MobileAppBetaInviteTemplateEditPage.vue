<template>
  <div class="beta-template-editor-page">
    <div class="beta-template-editor-shell">
      <t-card class="beta-template-editor-toolbar" :bordered="false">
        <div class="beta-template-editor-title">
          <t-button variant="text" shape="square" title="返回列表" @click="goBack">
            <arrow-left-icon />
          </t-button>
          <div>
            <h2>{{ pageTitle }}</h2>
            <p>复用启动图编辑页的画布、图层和拖拽能力维护邀请页样式。</p>
          </div>
        </div>

        <t-space class="beta-template-editor-actions">
          <t-button variant="outline" @click="resetTemplate">重置</t-button>
          <t-button theme="primary" @click="saveTemplate">
            <template #icon><save-icon /></template>
            保存
          </t-button>
        </t-space>
      </t-card>

      <div class="beta-template-editor-layout">
        <div class="beta-template-editor-side-stack">
          <t-card title="控件" :bordered="false">
            <div class="beta-template-editor-widget-list">
              <button
                v-for="widget in editorWidgets"
                :key="widget.type"
                class="beta-template-editor-widget-item"
                type="button"
                draggable="true"
                @click="addWidgetLayer(widget.type)"
                @dragstart="handleWidgetDragStart($event, widget.type)"
                @dragend="handleWidgetDragEnd"
              >
                <component :is="widget.icon" />
                <span>
                  <strong>{{ widget.label }}</strong>
                  <small>{{ widget.description }}</small>
                </span>
              </button>
            </div>
          </t-card>

          <t-card title="基础信息" :bordered="false">
            <div class="beta-template-editor-control-stack">
              <label class="beta-template-editor-text-field">
                <span>模版名称</span>
                <t-input v-model="baseForm.name" placeholder="请输入模版名称" />
              </label>
              <label class="beta-template-editor-text-field">
                <span>模版编码</span>
                <t-input v-model="baseForm.code" placeholder="请输入模版编码" />
              </label>
              <label class="beta-template-editor-text-field">
                <span>负责人</span>
                <t-input v-model="baseForm.owner" placeholder="请输入负责人" />
              </label>
              <label class="beta-template-editor-text-field">
                <span>状态</span>
                <t-select v-model="baseForm.status">
                  <t-option value="enabled" label="启用" />
                  <t-option value="disabled" label="停用" />
                </t-select>
              </label>
              <label class="beta-template-editor-text-field">
                <span>说明</span>
                <t-textarea v-model="baseForm.description" :autosize="{ minRows: 3, maxRows: 5 }" />
              </label>
            </div>
          </t-card>

          <t-card title="视图" :bordered="false">
            <div class="beta-template-editor-control-stack">
              <div class="beta-template-editor-control-header">
                <span>缩放视图</span>
                <strong>{{ viewportScaleText }}</strong>
              </div>
              <t-slider v-model="viewportScaleModel" :min="40" :max="130" />
              <div class="beta-template-editor-screen-metrics">
                <span>
                  <strong>390</strong>
                  <small>宽度 px</small>
                </span>
                <span>
                  <strong>844</strong>
                  <small>高度 px</small>
                </span>
              </div>
            </div>
          </t-card>
        </div>

        <t-card class="beta-template-editor-canvas-card" :bordered="false">
          <div class="beta-template-editor-canvas-header">
            <span>邀请页画布</span>
            <div class="beta-template-editor-canvas-tools">
              <label class="beta-template-editor-preview-switch">
                <span>密码邀请预览</span>
                <t-switch v-model="passwordPreviewEnabled" size="small" />
              </label>
              <t-tag variant="light">390 x 844</t-tag>
            </div>
          </div>
          <main ref="canvasShellRef" class="beta-template-editor-canvas-shell">
            <div class="beta-template-editor-phone-frame" :style="phoneFrameStyle">
              <div class="beta-template-editor-phone beta-template-phone" :style="phoneStyle">
                <div class="beta-template-editor-artboard beta-template-artboard" :style="artboardStyle" @click="selectLayer('background')">
                  <template v-for="layer in pageScopeLayers" :key="layer.id">
                    <div
                      v-if="layer.type === 'image'"
                      class="beta-template-preview-image"
                      :class="getLayerClass(layer)"
                      :style="getImageLayerStyle(layer)"
                      @click.stop="selectLayer(layer.id)"
                      @dblclick.stop="openImageUpload(layer)"
                      @pointerdown.stop="handleLayerPointerDown($event, layer)"
                    >
                      <img v-if="layer.src" :src="layer.src" :alt="layer.label" draggable="false" />
                      <span v-else>图片</span>
                      <button
                        v-if="canDeleteLayer(layer)"
                        class="beta-template-editor-layer-delete"
                        type="button"
                        title="删除图层"
                        @pointerdown.stop
                        @click.stop="deleteLayer(layer.id)"
                      >
                        <delete-icon />
                      </button>
                      <template v-if="canResizeImageLayer(layer)">
                        <button
                          v-for="handle in imageResizeHandles"
                          :key="handle"
                          class="beta-template-editor-resize-handle"
                          :class="`is-${handle}`"
                          type="button"
                          :title="imageResizeHandleTitleMap[handle]"
                          @pointerdown.stop.prevent="handleImageResizePointerDown($event, layer, handle)"
                        />
                      </template>
                    </div>
                  </template>
                  <div class="beta-template-editor-mobile-preview">
                    <div
                      ref="cardPreviewRef"
                      class="beta-template-card-preview"
                      :class="{ 'is-drag-over': isWidgetDragOver }"
                      :style="cardPreviewStyle"
                      @dragover.prevent="handleCanvasDragOver"
                      @dragleave="handleCanvasDragLeave"
                      @drop.stop="handleCanvasDrop"
                    >
                    <template v-for="layer in cardScopeLayers" :key="layer.id">
                      <div
                        v-if="layer.type === 'logo'"
                        class="beta-template-preview-logo"
                        :class="getLayerClass(layer)"
                        :style="getLogoLayerStyle(layer)"
                        @click.stop="selectLayer(layer.id)"
                        @pointerdown.stop="handleLayerPointerDown($event, layer)"
                      >
                        <span>PG</span>
                        <button
                          v-if="canDeleteLayer(layer)"
                          class="beta-template-editor-layer-delete"
                          type="button"
                          title="删除图层"
                          @pointerdown.stop
                          @click.stop="deleteLayer(layer.id)"
                        >
                          <delete-icon />
                        </button>
                      </div>
                      <div
                        v-else-if="layer.type === 'button'"
                        class="beta-template-preview-button"
                        :class="getLayerClass(layer)"
                        :style="getButtonLayerStyle(layer)"
                        @click.stop="selectLayer(layer.id)"
                        @pointerdown.stop="handleLayerPointerDown($event, layer)"
                      >
                        <span>{{ getLayerText(layer) }}</span>
                        <button
                          v-if="canDeleteLayer(layer)"
                          class="beta-template-editor-layer-delete"
                          type="button"
                          title="删除图层"
                          @pointerdown.stop
                          @click.stop="deleteLayer(layer.id)"
                        >
                          <delete-icon />
                        </button>
                      </div>
                      <div
                        v-else-if="layer.type === 'meta'"
                        class="beta-template-preview-meta"
                        :class="getLayerClass(layer)"
                        :style="getMetaLayerStyle(layer)"
                        @click.stop="selectLayer(layer.id)"
                        @pointerdown.stop="handleLayerPointerDown($event, layer)"
                      >
                        <span>邀请方式：{{ passwordPreviewEnabled ? '密码邀请' : '公开邀请' }}</span>
                        <span>剩余名额：58 / 80</span>
                        <span>有效期至：2026-06-30</span>
                        <button
                          v-if="canDeleteLayer(layer)"
                          class="beta-template-editor-layer-delete"
                          type="button"
                          title="删除图层"
                          @pointerdown.stop
                          @click.stop="deleteLayer(layer.id)"
                        >
                          <delete-icon />
                        </button>
                      </div>
                      <div
                        v-else-if="layer.type === 'image'"
                        class="beta-template-preview-image"
                        :class="getLayerClass(layer)"
                        :style="getImageLayerStyle(layer)"
                        @click.stop="selectLayer(layer.id)"
                        @dblclick.stop="openImageUpload(layer)"
                        @pointerdown.stop="handleLayerPointerDown($event, layer)"
                      >
                        <img v-if="layer.src" :src="layer.src" :alt="layer.label" draggable="false" />
                        <span v-else>图片</span>
                        <button
                          v-if="canDeleteLayer(layer)"
                          class="beta-template-editor-layer-delete"
                          type="button"
                          title="删除图层"
                          @pointerdown.stop
                          @click.stop="deleteLayer(layer.id)"
                        >
                          <delete-icon />
                        </button>
                        <template v-if="canResizeImageLayer(layer)">
                          <button
                            v-for="handle in imageResizeHandles"
                            :key="handle"
                            class="beta-template-editor-resize-handle"
                            :class="`is-${handle}`"
                            type="button"
                            :title="imageResizeHandleTitleMap[handle]"
                            @pointerdown.stop.prevent="handleImageResizePointerDown($event, layer, handle)"
                          />
                        </template>
                      </div>
                      <div
                        v-else
                        class="beta-template-preview-text"
                        :class="getLayerClass(layer)"
                        :style="getTextLayerStyle(layer)"
                        @click.stop="selectLayer(layer.id)"
                        @dblclick.stop="startInlineTextEdit($event, layer)"
                        @pointerdown.stop="handleLayerPointerDown($event, layer)"
                      >
                        <span
                          class="beta-template-preview-text-content"
                          :contenteditable="isTextEditing(layer)"
                          :data-layer-id="layer.id"
                          spellcheck="false"
                          @input="handleInlineTextInput($event, layer)"
                          @blur="finishInlineTextEdit"
                          @keydown.enter.prevent="finishInlineTextEdit"
                          @pointerdown.stop="handleTextPointerDown($event, layer)"
                          v-text="getLayerText(layer)"
                        />
                        <button
                          v-if="canDeleteLayer(layer)"
                          class="beta-template-editor-layer-delete"
                          type="button"
                          title="删除图层"
                          @pointerdown.stop
                          @click.stop="deleteLayer(layer.id)"
                        >
                          <delete-icon />
                        </button>
                      </div>
                    </template>
                    </div>

                    <section
                      v-if="passwordPreviewEnabled"
                      class="beta-template-preview-password-card"
                      :style="passwordPreviewLayerStyle"
                      @click.stop
                    >
                      <h2>输入邀请密码</h2>
                      <t-input model-value="" placeholder="请输入邀请密码" readonly />
                      <t-button block theme="primary" size="large" class="beta-template-preview-password-action">
                        验证密码
                      </t-button>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <t-card class="beta-template-editor-floating-properties" :style="floatingPropertiesStyle" :bordered="false">
              <template #title>
                <button class="beta-template-editor-properties-drag" type="button" title="拖动属性面板" @pointerdown="handlePropertiesPointerDown">
                  <span>{{ activeLayerTitle }}</span>
                  <drag-move-icon />
                </button>
              </template>
              <div v-if="activeLayer" class="beta-template-editor-control-stack">
                <div class="beta-template-editor-layer-state">
                  <span>{{ activeLayer.label }}</span>
                  <t-tag v-if="activeLayer.locked" theme="warning" variant="light">已锁定</t-tag>
                  <t-tag v-else-if="!activeLayer.visible" theme="default" variant="light">已隐藏</t-tag>
                  <t-tag v-else theme="primary" variant="light">可编辑</t-tag>
                </div>

                <label v-if="activeLayer.type === 'text'" class="beta-template-editor-text-field">
                  <span>默认文字</span>
                  <t-input v-model="activeLayer.fallback" />
                </label>

                <div class="beta-template-editor-control-header">
                  <span>横坐标</span>
                  <strong>{{ Math.round(activeLayer.x) }}%</strong>
                </div>
                <t-slider v-model="activeLayer.x" :min="0" :max="100" :disabled="activeLayerControlsDisabled" />

                <div class="beta-template-editor-control-header">
                  <span>纵坐标</span>
                  <strong>{{ Math.round(activeLayer.y) }}%</strong>
                </div>
                <t-slider v-model="activeLayer.y" :min="0" :max="100" :disabled="activeLayerControlsDisabled" />

                <template v-if="activeLayer.type === 'text'">
                  <label class="beta-template-editor-color-item">
                    <span>文字颜色</span>
                    <t-color-picker v-model="activeLayer.color" format="HEX" :disabled="activeLayerControlsDisabled" />
                  </label>
                  <div class="beta-template-editor-control-header">
                    <span>字号</span>
                    <strong>{{ activeLayer.fontSize }}px</strong>
                  </div>
                  <t-slider v-model="activeLayer.fontSize" :min="12" :max="36" :disabled="activeLayerControlsDisabled" />
                </template>

                <template v-if="activeLayer.type === 'logo'">
                  <div class="beta-template-editor-control-header">
                    <span>图标大小</span>
                    <strong>{{ activeLayer.size }}px</strong>
                  </div>
                  <t-slider v-model="activeLayer.size" :min="48" :max="112" :disabled="activeLayerControlsDisabled" />
                </template>

                <template v-if="activeLayer.type === 'image'">
                  <label class="beta-template-editor-text-field">
                    <span>本地图片</span>
                    <label class="beta-template-editor-upload-button">
                      <input type="file" accept="image/*" :disabled="activeLayerControlsDisabled" @change="handleImageUpload($event, activeLayer)" />
                      <span>{{ activeLayer.src ? '更换图片' : '上传图片' }}</span>
                    </label>
                  </label>
                  <div class="beta-template-editor-inline-actions">
                    <t-button variant="outline" size="small" :disabled="activeLayerControlsDisabled" @click="fitImageToScreen(activeLayer)">
                      自适应屏幕
                    </t-button>
                    <t-button variant="outline" size="small" :disabled="activeLayerControlsDisabled" @click="fillImageToInvitePage(activeLayer)">
                      撑满邀请页面
                    </t-button>
                  </div>
                  <div class="beta-template-editor-control-header">
                    <span>宽度</span>
                    <strong>{{ activeLayer.width }}px</strong>
                  </div>
                  <t-slider v-model="activeLayer.width" :min="48" :max="activeLayer.scope === 'page' ? INVITE_PAGE_WIDTH : PHONE_PREVIEW_WIDTH" :disabled="activeLayerControlsDisabled" />
                  <div class="beta-template-editor-control-header">
                    <span>高度</span>
                    <strong>{{ activeLayer.height }}px</strong>
                  </div>
                  <t-slider v-model="activeLayer.height" :min="48" :max="activeLayer.scope === 'page' ? INVITE_PAGE_HEIGHT : PHONE_PREVIEW_HEIGHT" :disabled="activeLayerControlsDisabled" />
                  <div class="beta-template-editor-control-header">
                    <span>圆角</span>
                    <strong>{{ activeLayer.radius }}px</strong>
                  </div>
                  <t-slider v-model="activeLayer.radius" :min="0" :max="40" :disabled="activeLayerControlsDisabled" />
                  <div class="beta-template-editor-control-header">
                    <span>透明度</span>
                    <strong>{{ activeLayer.opacity ?? 100 }}%</strong>
                  </div>
                  <t-slider v-model="activeLayer.opacity" :min="0" :max="100" :disabled="activeLayerControlsDisabled" />
                </template>

                <template v-if="['meta', 'button'].includes(activeLayer.type)">
                  <div class="beta-template-editor-control-header">
                    <span>宽度</span>
                    <strong>{{ activeLayer.width }}%</strong>
                  </div>
                  <t-slider v-model="activeLayer.width" :min="56" :max="96" :disabled="activeLayerControlsDisabled" />
                </template>
              </div>
              <div v-else class="beta-template-editor-background-panel">
                <p>请选择一个图层进行编辑。</p>
              </div>

              <div class="beta-template-editor-floating-section">
                <div class="beta-template-editor-floating-section-title">密码区域</div>
                <div class="beta-template-editor-control-header">
                  <span>宽度比例</span>
                  <strong>{{ styleForm.passwordCardWidth }}%</strong>
                </div>
                <t-slider v-model="styleForm.passwordCardWidth" :min="64" :max="96" />
              </div>
            </t-card>
          </main>
        </t-card>

        <div class="beta-template-editor-side-stack">
          <t-card title="图层" :bordered="false">
            <div class="beta-template-editor-layer-list">
              <div
                v-for="layer in layerRows"
                :key="layer.id"
                class="beta-template-editor-layer-row"
                :class="{
                  'is-active': activeLayerId === layer.id,
                  'is-hidden': !layer.visible,
                  'is-dragging': draggedLayerId === layer.id,
                  'is-drag-over': dragOverLayerId === layer.id
                }"
                role="button"
                tabindex="0"
                draggable="true"
                @click="selectLayer(layer.id)"
                @keydown.enter="selectLayer(layer.id)"
                @dragstart="handleLayerSortDragStart($event, layer.id)"
                @dragover.prevent="handleLayerSortDragOver($event, layer.id)"
                @dragleave="handleLayerSortDragLeave(layer.id)"
                @drop.stop="handleLayerSortDrop($event, layer.id)"
                @dragend="handleLayerSortDragEnd"
              >
                <component :is="layer.icon" />
                <span>
                  <strong>{{ layer.label }}</strong>
                  <small>{{ layer.description }} · zIndex {{ layer.zIndex }}</small>
                </span>
                <span class="beta-template-editor-layer-actions" @click.stop>
                  <t-button variant="text" shape="square" size="small" title="上移一层" @click="moveLayerLevel(layer.id, 'up')">
                    <arrow-up-icon />
                  </t-button>
                  <t-button variant="text" shape="square" size="small" title="下移一层" @click="moveLayerLevel(layer.id, 'down')">
                    <arrow-down-icon />
                  </t-button>
                  <t-input-number
                    :model-value="getPendingLayerZIndex(layer)"
                    class="beta-template-editor-z-index-input"
                    size="small"
                    theme="column"
                    :min="1"
                    :max="999"
                    @update:model-value="stageLayerZIndex(layer.id, $event)"
                    @enter="commitLayerZIndex(layer.id)"
                  />
                  <t-button variant="text" shape="square" size="small" @click="toggleLayerVisible(layer.id)">
                    <component :is="layer.visible ? BrowseIcon : BrowseOffIcon" />
                  </t-button>
                  <t-button variant="text" shape="square" size="small" @click="toggleLayerLocked(layer.id)">
                    <component :is="layer.locked ? LockOnIcon : LockOffIcon" />
                  </t-button>
                </span>
              </div>
            </div>
          </t-card>

          <t-card title="颜色" :bordered="false">
            <div class="beta-template-editor-color-grid beta-template-color-grid">
              <label class="beta-template-editor-color-item">
                <span>页面背景</span>
                <t-color-picker v-model="styleForm.pageBackground" format="HEX" />
              </label>
              <label class="beta-template-editor-color-item">
                <span>卡片背景</span>
                <t-color-picker v-model="styleForm.cardBackground" format="HEX" />
              </label>
              <label class="beta-template-editor-color-item">
                <span>主色</span>
                <t-color-picker v-model="styleForm.primaryColor" format="HEX" />
              </label>
              <label class="beta-template-editor-color-item">
                <span>正文</span>
                <t-color-picker v-model="styleForm.textColor" format="HEX" />
              </label>
            </div>
          </t-card>
        </div>
      </div>
      <input
        ref="imageUploadInput"
        class="beta-template-editor-hidden-input"
        type="file"
        accept="image/*"
        @change="handleActiveImageUpload"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BrowseIcon,
  BrowseOffIcon,
  DeleteIcon,
  DragMoveIcon,
  FileIcon,
  ImageIcon,
  LayersIcon,
  LockOffIcon,
  LockOnIcon,
  SaveIcon,
  TextIcon
} from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  ColorPicker as TColorPicker,
  Input as TInput,
  InputNumber as TInputNumber,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Slider as TSlider,
  Space as TSpace,
  Switch as TSwitch,
  Tag as TTag,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import {
  DEFAULT_BETA_INVITE_TEMPLATE_ID,
  createBetaInviteTemplate,
  defaultTemplateLayers,
  defaultTemplateStyle,
  findBetaInviteTemplate,
  updateBetaInviteTemplate
} from '../../config/betaInviteTemplates'

const route = useRoute()
const router = useRouter()
const isCreateMode = computed(() => route.name === 'mobile-app-beta-invite-template-create')
const currentTemplate = computed(() => isCreateMode.value ? null : findBetaInviteTemplate(route.params.id))
const isDefaultTemplateEdit = computed(() => !isCreateMode.value && (route.params.id === DEFAULT_BETA_INVITE_TEMPLATE_ID || currentTemplate.value?.isDefault))
const pageTitle = computed(() => isCreateMode.value ? '新建内测邀请模版' : '编辑内测邀请模版')
const activeLayerId = ref('logo')
const editingTextLayerId = ref('')
const draggedWidgetType = ref('')
const isWidgetDragOver = ref(false)
const draggedLayerId = ref('')
const dragOverLayerId = ref('')
const viewportScale = ref(90)
const isManualViewportScale = ref(false)
const canvasShellRef = ref(null)
const cardPreviewRef = ref(null)
const passwordPreviewEnabled = ref(false)
const imageUploadInput = ref(null)
const activeUploadImageLayerId = ref('')
const propertiesPosition = reactive({ x: null, y: 118 })
const pendingLayerZIndexes = reactive({})
const CANVAS_CARD_WIDTH = 326
const CANVAS_CARD_HEIGHT = 560
const INVITE_PAGE_WIDTH = 390
const INVITE_PAGE_HEIGHT = 844
const PHONE_PREVIEW_WIDTH = 358
const PHONE_PREVIEW_HEIGHT = 792
const PHONE_PREVIEW_OFFSET_X = -16
const PHONE_PREVIEW_OFFSET_Y = -16
const MIN_IMAGE_LAYER_SIZE = 48
const imageResizeHandles = ['nw', 'ne', 'se', 'sw']
const imageResizeHandleTitleMap = {
  nw: '调整左上角',
  ne: '调整右上角',
  se: '调整右下角',
  sw: '调整左下角'
}
let canvasResizeObserver = null

const baseForm = reactive({
  name: currentTemplate.value?.name || '自定义邀请模版',
  code: currentTemplate.value?.code || `INVITE_TEMPLATE_${Date.now().toString(36).toUpperCase()}`,
  status: currentTemplate.value?.status || 'enabled',
  platform: currentTemplate.value?.platform || '移动端 / PC',
  owner: currentTemplate.value?.owner || '移动端测试组',
  description: currentTemplate.value?.description || ''
})

const styleForm = reactive({
  ...defaultTemplateStyle,
  ...(currentTemplate.value?.style || {})
})

const layers = ref(normalizeLayerZIndex(JSON.parse(JSON.stringify(currentTemplate.value?.layers || defaultTemplateLayers))))

onMounted(() => {
  if (isDefaultTemplateEdit.value) {
    MessagePlugin.warning('默认模版不支持编辑，请在列表复制创建后编辑副本')
    goBack()
    return
  }
  nextTick(() => {
    autoFitViewportScale()
    if (typeof ResizeObserver !== 'undefined' && canvasShellRef.value) {
      canvasResizeObserver = new ResizeObserver(autoFitViewportScale)
      canvasResizeObserver.observe(canvasShellRef.value)
    } else {
      window.addEventListener('resize', autoFitViewportScale)
    }
  })
})

onBeforeUnmount(() => {
  if (canvasResizeObserver) {
    canvasResizeObserver.disconnect()
    canvasResizeObserver = null
  } else {
    window.removeEventListener('resize', autoFitViewportScale)
  }
})

const layerIconMap = {
  image: ImageIcon,
  logo: ImageIcon,
  text: TextIcon,
  meta: FileIcon,
  button: LayersIcon
}
const editorWidgets = [
  {
    type: 'text',
    label: '文字',
    description: '标题、说明或自定义文案',
    icon: TextIcon
  },
  {
    type: 'button',
    label: '按钮',
    description: '邀请页主操作按钮',
    icon: LayersIcon
  },
  {
    type: 'meta',
    label: '信息卡片',
    description: '邀请方式、名额、有效期',
    icon: FileIcon
  },
  {
    type: 'image',
    label: '图片',
    description: '上传本地图片素材',
    icon: ImageIcon
  },
  {
    type: 'logo',
    label: '应用图标',
    description: '应用或品牌标识',
    icon: ImageIcon
  }
]

const layerRows = computed(() => [...layers.value].sort((a, b) => getLayerZIndex(b) - getLayerZIndex(a)).map((layer) => ({
  ...layer,
  zIndex: getLayerZIndex(layer),
  icon: layerIconMap[layer.type] || LayersIcon
})))
const visibleLayers = computed(() => layers.value.filter((layer) => layer.visible))
const pageScopeLayers = computed(() => visibleLayers.value.filter((layer) => isPageScopeLayer(layer)))
const cardScopeLayers = computed(() => visibleLayers.value.filter((layer) => !isPageScopeLayer(layer)))
const hasPageScopeImage = computed(() => pageScopeLayers.value.some((layer) => layer.type === 'image'))
const activeLayer = computed(() => layers.value.find((layer) => layer.id === activeLayerId.value) || null)
const activeLayerTitle = computed(() => activeLayer.value?.label ? `${activeLayer.value.label}属性` : '图层属性')
const activeLayerControlsDisabled = computed(() => !activeLayer.value || activeLayer.value.locked || !activeLayer.value.visible)
const viewportScaleModel = computed({
  get: () => viewportScale.value,
  set: (value) => {
    isManualViewportScale.value = true
    viewportScale.value = value
  }
})
const viewportScaleText = computed(() => `${(viewportScale.value / 100).toFixed(2)}倍`)
const phoneFrameStyle = computed(() => ({
  width: `${390 * viewportScale.value / 100}px`,
  height: `${844 * viewportScale.value / 100}px`
}))
const phoneStyle = computed(() => ({
  width: '390px',
  height: '844px',
  transform: `scale(${viewportScale.value / 100})`,
  transformOrigin: 'top left'
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
const artboardStyle = computed(() => ({
  background: styleForm.pageBackground
}))
const cardPreviewStyle = computed(() => ({
  background: hasPageScopeImage.value ? 'transparent' : styleForm.cardBackground,
  borderRadius: `${scalePx(styleForm.cardRadius)}px`,
  boxShadow: hasPageScopeImage.value ? 'none' : undefined
}))
const passwordPreviewLayerStyle = computed(() => {
  const buttonLayer = layers.value.find((layer) => layer.type === 'button' && layer.visible)
  return {
    width: `${styleForm.passwordCardWidth || 84}%`,
    zIndex: buttonLayer ? getLayerZIndex(buttonLayer) : Math.max(2, ...layers.value.map((layer) => getLayerZIndex(layer)))
  }
})

function getLayerText (layer) {
  const samples = {
    title: passwordPreviewEnabled.value ? 'Privacy Gen iOS 密码内测' : 'Privacy Gen iOS 公开内测',
    subtitle: 'Privacy Gen · iOS · 2.4.1',
    remark: passwordPreviewEnabled.value ? '输入邀请密码后，可按当前邀请范围体验指定内测版本。' : '加入后可按当前邀请范围体验指定内测版本。',
    buttonText: passwordPreviewEnabled.value ? '验证密码并加入' : '加入内测'
  }
  return samples[layer.binding] || layer.fallback || layer.label
}

function autoFitViewportScale () {
  if (isManualViewportScale.value) return
  const shell = canvasShellRef.value
  if (!shell) return
  const styles = window.getComputedStyle(shell)
  const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
  const verticalPadding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
  const availableWidth = shell.clientWidth - horizontalPadding - 24
  const availableHeight = shell.clientHeight - verticalPadding - 24
  if (availableWidth <= 0 || availableHeight <= 0) return

  const nextScale = Math.floor(Math.min(availableWidth / 390, availableHeight / 844) * 100)
  viewportScale.value = Math.min(130, Math.max(40, nextScale))
}

function getLayerClass (layer) {
  return {
    'is-active': activeLayerId.value === layer.id,
    'is-locked': layer.locked
  }
}

function scalePx (value) {
  return Math.round(Number(value || 0))
}

function baseLayerPosition (layer) {
  if (isPageScopeLayer(layer)) {
    return {
      left: `${layer.x}%`,
      top: `${layer.y}%`,
      zIndex: 0,
      transform: 'translate(-50%, -50%)'
    }
  }
  return {
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    zIndex: getLayerZIndex(layer),
    transform: 'translate(-50%, -50%)'
  }
}

function getLogoLayerStyle (layer) {
  return {
    ...baseLayerPosition(layer),
    width: `${scalePx(layer.size)}px`,
    height: `${scalePx(layer.size)}px`,
    background: styleForm.primaryColor,
    color: styleForm.buttonTextColor,
    borderRadius: `${scalePx(styleForm.iconRadius)}px`
  }
}

function getImageLayerStyle (layer) {
  return {
    ...baseLayerPosition(layer),
    width: `${scalePx(layer.width || 160)}px`,
    height: `${scalePx(layer.height || 120)}px`,
    borderRadius: `${scalePx(layer.radius || 8)}px`,
    opacity: (layer.opacity ?? 100) / 100,
    '--beta-template-image-fit': layer.objectFit || 'cover'
  }
}

function isPageScopeLayer (layer) {
  return layer.type === 'image' && layer.scope === 'page'
}

function getTextLayerStyle (layer) {
  return {
    ...baseLayerPosition(layer),
    color: layer.color || styleForm.textColor,
    fontSize: `${scalePx(layer.fontSize || 14)}px`,
    fontWeight: layer.fontWeight || 400
  }
}

function getMetaLayerStyle (layer) {
  return {
    ...baseLayerPosition(layer),
    width: `${layer.width || 84}%`,
    color: styleForm.secondaryTextColor
  }
}

function getButtonLayerStyle (layer) {
  return {
    ...baseLayerPosition(layer),
    width: `${layer.width || 84}%`,
    height: `${scalePx(layer.height || 44)}px`,
    background: styleForm.primaryColor,
    color: styleForm.buttonTextColor,
    borderRadius: `${scalePx(styleForm.buttonRadius)}px`
  }
}

function selectLayer (id) {
  activeLayerId.value = id
}

function getLayerZIndex (layer) {
  return Number(layer.zIndex) || Math.max(layers.value.length - layers.value.findIndex((item) => item.id === layer.id), 1)
}

function normalizeLayerZIndex (sourceLayers) {
  const total = sourceLayers.length
  return sourceLayers.map((layer, index) => ({
    ...layer,
    zIndex: Number(layer.zIndex) || total - index
  }))
}

function moveLayerLevel (id, direction) {
  const sorted = [...layers.value].sort((a, b) => getLayerZIndex(b) - getLayerZIndex(a))
  const index = sorted.findIndex((layer) => layer.id === id)
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) return
  const current = sorted[index]
  const target = sorted[targetIndex]
  const currentZIndex = getLayerZIndex(current)
  current.zIndex = getLayerZIndex(target)
  target.zIndex = currentZIndex
  activeLayerId.value = id
}

function updateLayerZIndex (id, value) {
  const layer = layers.value.find((item) => item.id === id)
  if (!layer) return
  const nextZIndex = Math.min(999, Math.max(1, Number(value) || 1))
  if (getLayerZIndex(layer) !== nextZIndex) {
    layers.value.forEach((item) => {
      if (item.id !== id && getLayerZIndex(item) >= nextZIndex) {
        item.zIndex = getLayerZIndex(item) + 1
      }
    })
  }
  layer.zIndex = nextZIndex
  layers.value = [...layers.value]
  activeLayerId.value = id
}

function getPendingLayerZIndex (layer) {
  return pendingLayerZIndexes[layer.id] ?? getLayerZIndex(layer)
}

function stageLayerZIndex (id, value) {
  pendingLayerZIndexes[id] = value
}

function commitLayerZIndex (id) {
  if (!(id in pendingLayerZIndexes)) return
  updateLayerZIndex(id, pendingLayerZIndexes[id])
  delete pendingLayerZIndexes[id]
}

function handleLayerSortDragStart (event, id) {
  draggedLayerId.value = id
  activeLayerId.value = id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', id)
}

function handleLayerSortDragOver (event, id) {
  if (!draggedLayerId.value || draggedLayerId.value === id) return
  dragOverLayerId.value = id
  event.dataTransfer.dropEffect = 'move'
}

function handleLayerSortDragLeave (id) {
  if (dragOverLayerId.value === id) {
    dragOverLayerId.value = ''
  }
}

function handleLayerSortDrop (event, targetId) {
  const sourceId = event.dataTransfer.getData('text/plain') || draggedLayerId.value
  if (!sourceId || sourceId === targetId) {
    handleLayerSortDragEnd()
    return
  }

  const sorted = [...layers.value].sort((a, b) => getLayerZIndex(b) - getLayerZIndex(a))
  const sourceIndex = sorted.findIndex((layer) => layer.id === sourceId)
  const targetIndex = sorted.findIndex((layer) => layer.id === targetId)
  if (sourceIndex < 0 || targetIndex < 0) {
    handleLayerSortDragEnd()
    return
  }

  const [sourceLayer] = sorted.splice(sourceIndex, 1)
  sorted.splice(targetIndex, 0, sourceLayer)
  sorted.forEach((layer, index) => {
    layer.zIndex = sorted.length - index
    delete pendingLayerZIndexes[layer.id]
  })
  layers.value = sorted
  activeLayerId.value = sourceId
  handleLayerSortDragEnd()
}

function getImageScreenFitSize () {
  return {
    width: PHONE_PREVIEW_WIDTH,
    height: PHONE_PREVIEW_HEIGHT,
    x: Math.round(((PHONE_PREVIEW_OFFSET_X + PHONE_PREVIEW_WIDTH / 2) / CANVAS_CARD_WIDTH) * 100),
    y: Math.round(((PHONE_PREVIEW_OFFSET_Y + PHONE_PREVIEW_HEIGHT / 2) / CANVAS_CARD_HEIGHT) * 100)
  }
}

function getInvitePageFitSize () {
  return {
    width: INVITE_PAGE_WIDTH,
    height: INVITE_PAGE_HEIGHT,
    x: 50,
    y: 50
  }
}

function fitImageToScreen (layer) {
  if (!layer || layer.type !== 'image' || activeLayerControlsDisabled.value) return
  const fitSize = getImageScreenFitSize()
  layer.x = fitSize.x
  layer.y = fitSize.y
  layer.width = fitSize.width
  layer.height = fitSize.height
  layer.radius = styleForm.cardRadius || 0
  layer.objectFit = 'cover'
  layer.scope = 'card'
  activeLayerId.value = layer.id
}

function fillImageToInvitePage (layer) {
  if (!layer || layer.type !== 'image' || activeLayerControlsDisabled.value) return
  const fitSize = getInvitePageFitSize()
  layer.x = fitSize.x
  layer.y = fitSize.y
  layer.width = fitSize.width
  layer.height = fitSize.height
  layer.radius = 0
  layer.objectFit = 'cover'
  layer.scope = 'page'
  activeLayerId.value = layer.id
}

function canResizeImageLayer (layer) {
  return layer.type === 'image' && activeLayerId.value === layer.id && layer.visible && !layer.locked
}

function clampNumber (value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || min))
}

function handleImageResizePointerDown (event, layer, handle) {
  if (!canResizeImageLayer(layer) || event.button !== 0) return
  activeLayerId.value = layer.id
  const target = event.currentTarget.closest('.beta-template-preview-image')
  if (!target) return

  const rect = target.getBoundingClientRect()
  const startWidth = Number(layer.width) || rect.width
  const startHeight = Number(layer.height) || rect.height
  const renderScale = rect.width > 0 && startWidth > 0 ? rect.width / startWidth : 1
  const directionX = handle.includes('e') ? 1 : -1
  const directionY = handle.includes('s') ? 1 : -1
  const startX = event.clientX
  const startY = event.clientY

  const move = (moveEvent) => {
    const deltaX = (moveEvent.clientX - startX) / renderScale
    const deltaY = (moveEvent.clientY - startY) / renderScale
    layer.width = Math.round(clampNumber(startWidth + deltaX * directionX * 2, MIN_IMAGE_LAYER_SIZE, INVITE_PAGE_WIDTH))
    layer.height = Math.round(clampNumber(startHeight + deltaY * directionY * 2, MIN_IMAGE_LAYER_SIZE, INVITE_PAGE_HEIGHT))
  }
  const stop = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
  }

  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop)
}

function handleLayerSortDragEnd () {
  draggedLayerId.value = ''
  dragOverLayerId.value = ''
}

function canDeleteLayer (layer) {
  return activeLayerId.value === layer.id && !layer.locked
}

function deleteLayer (id) {
  const index = layers.value.findIndex((item) => item.id === id)
  if (index < 0) return
  const layer = layers.value[index]
  if (layer.locked) {
    MessagePlugin.warning('锁定图层不能删除')
    return
  }
  layers.value.splice(index, 1)
  if (editingTextLayerId.value === id) {
    editingTextLayerId.value = ''
  }
  activeLayerId.value = layers.value[index]?.id || layers.value[index - 1]?.id || 'background'
}

function toggleLayerVisible (id) {
  const layer = layers.value.find((item) => item.id === id)
  if (!layer) return
  layer.visible = !layer.visible
}

function toggleLayerLocked (id) {
  const layer = layers.value.find((item) => item.id === id)
  if (!layer) return
  layer.locked = !layer.locked
}

function createLayerByType (type, position = {}) {
  const layerType = editorWidgets.some((widget) => widget.type === type) ? type : 'text'
  const count = layers.value.filter((item) => item.type === layerType).length + 1
  const base = {
    id: `custom-${layerType}-${Date.now()}`,
    type: layerType,
    x: position.x ?? 50,
    y: position.y ?? 64,
    zIndex: Math.max(1, ...layers.value.map((layer) => getLayerZIndex(layer))) + 1,
    visible: true,
    locked: false
  }

  if (layerType === 'logo') {
    return {
      ...base,
      label: `应用图标 ${count}`,
      description: '自定义图标控件',
      size: 72
    }
  }

  if (layerType === 'image') {
    return {
      ...base,
      label: `图片 ${count}`,
      description: '本地上传图片',
      src: '',
      width: 160,
      height: 120,
      radius: 8,
      opacity: 100,
      objectFit: 'cover',
      scope: 'card'
    }
  }

  if (layerType === 'button') {
    return {
      ...base,
      label: `按钮 ${count}`,
      description: '自定义按钮控件',
      binding: 'buttonText',
      fallback: '加入内测',
      width: 84,
      height: 44
    }
  }

  if (layerType === 'meta') {
    return {
      ...base,
      label: `信息卡片 ${count}`,
      description: '自定义信息卡片',
      width: 84
    }
  }

  return {
    ...base,
    id: `custom-text-${Date.now()}`,
    type: 'text',
    label: `文字 ${count}`,
    description: '自定义文字图层',
    binding: '',
    fallback: '自定义邀请文案',
    fontSize: 14,
    fontWeight: 400,
    color: styleForm.secondaryTextColor
  }
}

function addWidgetLayer (type, position) {
  const layer = createLayerByType(type, position)
  layers.value = [layer, ...layers.value]
  activeLayerId.value = layer.id
}

function handleWidgetDragStart (event, type) {
  draggedWidgetType.value = type
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('text/plain', type)
}

function handleWidgetDragEnd () {
  draggedWidgetType.value = ''
  isWidgetDragOver.value = false
}

function handleCanvasDragOver (event) {
  if (!draggedWidgetType.value && !Array.from(event.dataTransfer.types).includes('text/plain')) return
  isWidgetDragOver.value = true
  event.dataTransfer.dropEffect = 'copy'
}

function handleCanvasDragLeave (event) {
  if (event.currentTarget.contains(event.relatedTarget)) return
  isWidgetDragOver.value = false
}

function handleCanvasDrop (event) {
  const type = event.dataTransfer.getData('text/plain') || draggedWidgetType.value
  draggedWidgetType.value = ''
  isWidgetDragOver.value = false
  if (!type) return
  const rect = event.currentTarget.getBoundingClientRect()
  const position = {
    x: Math.min(100, Math.max(0, Math.round(((event.clientX - rect.left) / rect.width) * 100))),
    y: Math.min(100, Math.max(0, Math.round(((event.clientY - rect.top) / rect.height) * 100)))
  }
  addWidgetLayer(type, position)
}

function handleImageUpload (event, layer) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    MessagePlugin.warning('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const image = new Image()
    image.onload = () => {
      layer.naturalWidth = image.naturalWidth
      layer.naturalHeight = image.naturalHeight
    }
    image.src = reader.result
    layer.src = reader.result
    activeLayerId.value = layer.id
  }
  reader.onerror = () => MessagePlugin.error('图片读取失败')
  reader.readAsDataURL(file)
}

function openImageUpload (layer) {
  if (!layer || layer.type !== 'image' || layer.locked || !layer.visible) return
  activeLayerId.value = layer.id
  activeUploadImageLayerId.value = layer.id
  if (imageUploadInput.value) {
    imageUploadInput.value.value = ''
    imageUploadInput.value.click()
  }
}

function handleActiveImageUpload (event) {
  const layer = layers.value.find((item) => item.id === activeUploadImageLayerId.value)
  if (!layer) {
    event.target.value = ''
    return
  }
  handleImageUpload(event, layer)
}

function handleLayerPointerDown (event, layer) {
  selectLayer(layer.id)
  if (editingTextLayerId.value === layer.id) return
  if (layer.locked || !layer.visible || event.button !== 0) return

  const artboard = event.currentTarget.closest(isPageScopeLayer(layer) ? '.beta-template-editor-artboard' : '.beta-template-card-preview')
  if (!artboard) return
  const rect = artboard.getBoundingClientRect()
  const startX = Number(layer.x) || 0
  const startY = Number(layer.y) || 0
  const startPointerX = event.clientX
  const startPointerY = event.clientY
  const move = (moveEvent) => {
    const deltaX = ((moveEvent.clientX - startPointerX) / rect.width) * 100
    const deltaY = ((moveEvent.clientY - startPointerY) / rect.height) * 100
    layer.x = Math.min(100, Math.max(0, Math.round(startX + deltaX)))
    layer.y = Math.min(100, Math.max(0, Math.round(startY + deltaY)))
  }
  const stop = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop)
}

function isTextEditing (layer) {
  return editingTextLayerId.value === layer.id && layer.type === 'text' && !layer.locked
}

function startInlineTextEdit (event, layer) {
  if (layer.type !== 'text' || layer.locked || !layer.visible) return
  selectLayer(layer.id)
  editingTextLayerId.value = layer.id
  requestAnimationFrame(() => {
    const target = event.currentTarget.querySelector('.beta-template-preview-text-content')
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

function handleInlineTextInput (event, layer) {
  layer.fallback = event.currentTarget.textContent || ''
}

function finishInlineTextEdit () {
  editingTextLayerId.value = ''
}

function handleTextPointerDown (event, layer) {
  if (isTextEditing(layer)) return
  handleLayerPointerDown(event, layer)
}

function handlePropertiesPointerDown (event) {
  if (event.button !== 0) return
  const panel = event.currentTarget.closest('.beta-template-editor-floating-properties')
  if (!panel) return
  const panelRect = panel.getBoundingClientRect()
  const offsetX = event.clientX - panelRect.left
  const offsetY = event.clientY - panelRect.top
  propertiesPosition.x = Math.round(panelRect.left)
  propertiesPosition.y = Math.round(panelRect.top)
  const move = (moveEvent) => {
    const maxLeft = Math.max(8, window.innerWidth - panelRect.width - 8)
    const maxTop = Math.max(8, window.innerHeight - panelRect.height - 8)
    const nextLeft = Math.min(maxLeft, Math.max(8, moveEvent.clientX - offsetX))
    const nextTop = Math.min(maxTop, Math.max(8, moveEvent.clientY - offsetY))
    propertiesPosition.x = Math.round(nextLeft)
    propertiesPosition.y = Math.round(nextTop)
  }
  const stop = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop)
}

function resetTemplate () {
  const source = currentTemplate.value
  Object.assign(styleForm, defaultTemplateStyle, source?.style || {})
  layers.value = normalizeLayerZIndex(JSON.parse(JSON.stringify(source?.layers || defaultTemplateLayers)))
  activeLayerId.value = layers.value[0]?.id || 'logo'
}

function goBack () {
  router.push({ name: 'mobile-app-beta-invite-templates' })
}

function saveTemplate () {
  if (isDefaultTemplateEdit.value) {
    MessagePlugin.warning('默认模版不支持编辑，请复制创建后编辑副本')
    return
  }
  if (!baseForm.name.trim() || !baseForm.code.trim()) {
    MessagePlugin.warning('请填写模版名称和模版编码')
    return
  }
  const payload = {
    ...baseForm,
    style: { ...styleForm },
    layers: JSON.parse(JSON.stringify([...layers.value].sort((a, b) => getLayerZIndex(b) - getLayerZIndex(a))))
  }
  if (isCreateMode.value) {
    createBetaInviteTemplate(payload)
  } else {
    updateBetaInviteTemplate(route.params.id, payload)
  }
  MessagePlugin.success(isCreateMode.value ? '邀请模版已创建' : '邀请模版已保存')
  goBack()
}
</script>
