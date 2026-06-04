<template>
  <t-drawer
    v-model:visible="visible"
    :header="editingId ? '编辑 AI 翻译来源' : '添加 AI 翻译来源'"
    size="720px"
    placement="right"
    :confirm-btn="editingId ? '保存' : '创建'"
    cancel-btn="取消"
    destroy-on-close
    @confirm="handleSubmit"
    @cancel="handleClose"
    @close="handleClose"
  >
    <t-form class="ai-service-form" :data="formData" label-align="top">
      <div class="ai-service-form-section">
        <t-form-item label="服务商" required-mark>
          <t-select v-model="formData.provider" @change="handleProviderChange">
            <t-option v-for="provider in aiProviderOptions" :key="provider.value" :value="provider.value" :label="provider.label" />
          </t-select>
        </t-form-item>

        <t-form-item label="API Key">
          <t-input v-model="formData.apiKey" :type="showApiKey ? 'text' : 'password'" clearable placeholder="APIKEY">
            <template #suffixIcon>
              <t-button variant="text" shape="square" size="small" @click.stop="showApiKey = !showApiKey">
                <template #icon><browse-icon v-if="!showApiKey" /><browse-off-icon v-else /></template>
              </t-button>
            </template>
          </t-input>
        </t-form-item>

        <t-form-item label="自定义翻译服务名称" required-mark>
          <t-input v-model="formData.name" clearable placeholder="例如：DeepSeek 1" />
        </t-form-item>

        <t-form-item label="模型" required-mark>
          <t-input
            v-if="formData.customModelEnabled"
            v-model="formData.model"
            clearable
            placeholder="请输入自定义模型名称"
          />
          <t-select v-else v-model="formData.model" filterable>
            <t-option v-for="model in currentModelOptions" :key="model" :value="model" :label="model" />
          </t-select>
          <template #help>
            <t-checkbox v-model="formData.customModelEnabled">输入自定义模型名称</t-checkbox>
          </template>
        </t-form-item>
      </div>

      <div class="ai-service-inline-row">
        <div>
          <strong>启用 AI 智能上下文</strong>
          <p>启用后，系统将结合上下文与术语提升翻译一致性。</p>
        </div>
        <t-switch v-model="formData.enabledAiContext" />
      </div>

      <t-form-item label="翻译策略">
        <t-select v-model="formData.strategy" class="ai-service-compact-select">
          <t-option v-for="strategy in aiStrategyOptions" :key="strategy.value" :value="strategy.value" :label="strategy.label" />
        </t-select>
      </t-form-item>

      <t-form-item label="自定义 API 接口地址" required-mark>
        <t-input v-model="formData.endpoint" clearable placeholder="https://api.openai.com/v1/chat/completions" />
        <template #help>请填写完整接口地址，例如：https://openrouter.ai/api/v1/chat/completions</template>
      </t-form-item>

      <t-form-item label="系统提示词">
        <t-textarea v-model="formData.systemPrompt" :autosize="{ minRows: 5, maxRows: 8 }" />
      </t-form-item>

      <t-form-item label="多段提示词">
        <t-textarea v-model="formData.multiplePrompt" :autosize="{ minRows: 4, maxRows: 6 }" />
      </t-form-item>

      <t-form-item label="单段提示词">
        <t-textarea v-model="formData.singlePrompt" :autosize="{ minRows: 4, maxRows: 6 }" />
      </t-form-item>

      <div class="ai-service-number-grid">
        <t-form-item label="每秒最大请求数">
          <t-input-number v-model="formData.maxRequestsPerSecond" :min="1" :max="100" />
          <template #help>请求数超过限制后进入排队状态。</template>
        </t-form-item>
        <t-form-item label="每次请求最大文本长度">
          <t-input-number v-model="formData.maxTextLength" :min="100" :max="20000" />
        </t-form-item>
        <t-form-item label="每次请求最大段落数">
          <t-input-number v-model="formData.maxParagraphsPerRequest" :min="1" :max="50" />
        </t-form-item>
      </div>

      <div class="ai-service-inline-row">
        <div>
          <strong>启用富文本翻译</strong>
          <p>开启后会保留原文链接和样式效果。</p>
        </div>
        <t-switch v-model="formData.richTextEnabled" />
      </div>

      <div class="ai-service-number-grid">
        <t-form-item label="每次字幕请求最大段落数">
          <t-input-number v-model="formData.maxSubtitleParagraphs" :min="1" :max="50" />
        </t-form-item>
        <t-form-item label="Temperature">
          <t-input-number v-model="formData.temperature" :min="0" :max="2" :step="0.1" />
          <template #help>值越小，输出越稳定。</template>
        </t-form-item>
        <t-form-item label="状态">
          <t-select v-model="formData.status">
            <t-option value="enabled" label="启用" />
            <t-option value="disabled" label="停用" />
          </t-select>
        </t-form-item>
      </div>
    </t-form>
  </t-drawer>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { BrowseIcon, BrowseOffIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Checkbox as TCheckbox,
  Drawer as TDrawer,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  InputNumber as TInputNumber,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Switch as TSwitch,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import {
  aiModelOptions,
  aiProviderOptions,
  aiStrategyOptions,
  createAiTranslationService
} from '../config/aiTranslationServices'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  service: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'saved'])

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})
const editingId = computed(() => props.service?.id || '')
const showApiKey = ref(false)
const formData = reactive(createAiTranslationService())

const currentModelOptions = computed(() => {
  return aiModelOptions[formData.provider]?.length ? aiModelOptions[formData.provider] : [formData.model].filter(Boolean)
})

watch(
  () => props.visible,
  (nextVisible) => {
    if (nextVisible) {
      Object.assign(formData, createAiTranslationService(props.service || {}))
      showApiKey.value = false
    }
  },
  { immediate: true }
)

function handleProviderChange (provider) {
  const models = aiModelOptions[provider] || []
  if (!formData.customModelEnabled) {
    formData.model = models[0] || ''
  }
  if (provider === 'openai') {
    formData.endpoint = 'https://api.openai.com/v1/chat/completions'
  } else if (provider === 'deepseek') {
    formData.endpoint = 'https://api.deepseek.com/chat/completions'
  } else if (provider === 'openrouter') {
    formData.endpoint = 'https://openrouter.ai/api/v1/chat/completions'
  }
}

function handleSubmit () {
  if (!formData.name.trim()) {
    MessagePlugin.warning('请输入服务名称')
    return
  }
  if (!formData.model.trim()) {
    MessagePlugin.warning('请输入模型名称')
    return
  }
  if (!formData.endpoint.trim()) {
    MessagePlugin.warning('请输入 API 接口地址')
    return
  }

  emit('saved', { ...formData, name: formData.name.trim(), model: formData.model.trim(), endpoint: formData.endpoint.trim() })
  visible.value = false
}

function handleClose () {
  visible.value = false
}
</script>
