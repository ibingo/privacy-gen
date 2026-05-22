<template>
  <div v-if="isCreateMode" class="app-launch-editor-page">
    <t-card class="app-launch-editor-toolbar" :bordered="false">
      <div class="app-launch-editor-title">
        <div>
          <h2>新建开关模板</h2>
          <p>创建可复用的开关基础配置和返回值模板</p>
        </div>
      </div>
      <t-space class="app-launch-editor-actions">
        <t-button variant="outline" @click="router.push({ name: 'mobile-app-experiments' })">取消</t-button>
        <t-button theme="primary" @click="handleSave">创建</t-button>
      </t-space>
    </t-card>

    <t-card class="feature-template-card" :bordered="false">
      <t-form layout="vertical">
        <div class="feature-template-basic">
          <t-form-item label="名称" required-mark>
            <t-input v-model="form.name" placeholder="请输入名称" />
          </t-form-item>

          <t-form-item label="标识" required-mark>
            <t-input v-model="form.key" placeholder="请输入标识" />
            <template #help>标识仅支持字母、数字、点号、下划线或中划线。</template>
          </t-form-item>

          <t-form-item label="描述" class="feature-template-span">
            <t-textarea v-model="form.description" :autosize="{ minRows: 4, maxRows: 5 }" placeholder="请输入描述" />
          </t-form-item>

          <t-form-item label="标签">
            <t-select v-model="form.tag" clearable filterable placeholder="请选择或添加标签">
              <t-option v-for="tag in tagOptions" :key="tag" :value="tag" :label="tag" />
            </t-select>
          </t-form-item>

          <div class="feature-template-field">
            <label class="feature-template-field-label">是否使用客户端 SDK</label>
            <div class="feature-template-field-control">
              <t-radio-group v-model="form.useClientSdk" class="feature-template-radio-group">
                <t-radio :value="true">是</t-radio>
                <t-radio :value="false">否</t-radio>
              </t-radio-group>
            </div>
          </div>

          <t-form-item label="返回类型" required-mark>
            <t-select v-model="form.returnType" @change="handleReturnTypeChange">
              <t-option value="boolean" label="Boolean" />
              <t-option value="string" label="String" />
              <t-option value="number" label="Number" />
              <t-option value="json" label="JSON" />
            </t-select>
          </t-form-item>
        </div>

        <div class="feature-template-section">
          <div class="feature-template-section-title">
            <span class="required-mark">*</span>
            <strong>返回值配置</strong>
          </div>
          <div
            v-for="(variation, index) in form.variations"
            :key="variation.key"
            class="feature-template-variation-row"
          >
            <div class="feature-template-variation-label">
              <span>
                返回值{{ index + 1 }}
                <i :style="{ background: variation.color }"></i>
              </span>
            </div>
            <div class="feature-template-variation-fields">
              <t-form-item label="名称">
                <t-input v-model="variation.name" placeholder="请输入名称" />
              </t-form-item>
              <t-form-item label="返回值" required-mark>
                <t-select v-if="usesPresetValues" v-model="variation.value">
                  <t-option v-for="option in returnValueOptions" :key="option" :value="option" :label="option" />
                </t-select>
                <t-textarea
                  v-else-if="form.returnType === 'json'"
                  v-model="variation.value"
                  :autosize="{ minRows: 3, maxRows: 6 }"
                  placeholder='{"key":"value"}'
                />
                <t-input v-else v-model="variation.value" :type="form.returnType === 'number' ? 'number' : 'text'" placeholder="请输入返回值" />
              </t-form-item>
              <t-form-item label="描述">
                <t-input v-model="variation.description" placeholder="请输入描述" />
              </t-form-item>
            </div>
          </div>
          <t-button class="feature-template-add" theme="primary" @click="addVariation">+ 添加返回值</t-button>
        </div>

        <div class="feature-template-field feature-template-return-item">
          <label class="feature-template-field-label">
            <span class="feature-template-required">*</span>
            <span>关闭开关时返回值</span>
          </label>
          <div class="feature-template-field-control">
            <t-select v-if="usesPresetValues" v-model="form.defaultValue">
              <t-option v-for="option in returnValueOptions" :key="option" :value="option" :label="option" />
            </t-select>
            <t-textarea
              v-else-if="form.returnType === 'json'"
              v-model="form.defaultValue"
              :autosize="{ minRows: 2, maxRows: 5 }"
              placeholder='{"enabled":false}'
            />
            <t-input v-else v-model="form.defaultValue" :type="form.returnType === 'number' ? 'number' : 'text'" placeholder="请输入关闭返回值" />
          </div>
        </div>
      </t-form>
    </t-card>
  </div>

  <div v-else-if="form" class="mobile-center-page">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-experiments' })">
      &larr; 返回开关管理
    </button>

    <div class="mc-edit-shell">
      <section class="mc-panel">
        <div class="mc-panel-header">
          <div>
            <h3>{{ isCreateMode ? '新建开关' : '编辑开关' }}</h3>
            <p>维护开关基础信息、环境状态和负责人。</p>
          </div>
          <span class="mc-app-status" :class="`mc-status-${statusTone}`">{{ form.status }}</span>
        </div>

        <div class="mc-edit-form">
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>开关名称</label>
              <input v-model="form.name" type="text" />
            </div>
            <div class="mc-form-group">
              <label>开关 Key</label>
              <input v-model="form.key" type="text" />
            </div>
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>状态</label>
              <select v-model="form.status">
                <option v-for="option in flagStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>环境</label>
              <select v-model="form.environment">
                <option>Production</option>
                <option>Staging</option>
                <option>Development</option>
              </select>
            </div>
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>关联应用</label>
              <select v-model="form.appId">
                <option v-for="app in apps" :key="app.id" :value="app.id">{{ app.name }} · {{ app.platform }}</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>负责人</label>
              <input v-model="form.owner" type="text" />
            </div>
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>标签</label>
              <input v-model="form.tag" type="text" placeholder="如 growth_layer" />
            </div>
            <div class="mc-form-group">
              <label>默认返回</label>
              <input v-model="form.defaultValue" type="text" placeholder="如 false" />
            </div>
          </div>

          <div class="mc-form-group">
            <label>描述</label>
            <textarea v-model="form.description" rows="3" placeholder="输入开关描述"></textarea>
          </div>
        </div>
      </section>

      <aside class="mc-detail-side">
        <section class="mc-panel">
          <div class="mc-panel-header">
            <h3>配置摘要</h3>
          </div>
          <div class="mc-ab-toggle-meta">
            <span>Default</span>
            <code>{{ form.defaultValue }}</code>
            <span>Rules</span>
            <code>{{ form.rules?.length || 0 }} 条</code>
            <span>Variations</span>
            <code>{{ form.variations?.length || 0 }} 个</code>
          </div>
        </section>
      </aside>
    </div>

    <div class="mc-sticky-actions">
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-experiments' })">取消</button>
      <button class="mc-btn mc-btn-primary" @click="handleSave">{{ isCreateMode ? '创建开关' : '保存开关' }}</button>
    </div>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该开关</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-experiments' })">返回开关管理</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Button as TButton,
  Card as TCard,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Radio as TRadio,
  RadioGroup as TRadioGroup,
  Select as TSelect,
  Space as TSpace,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import { createFeatureFlag, findFeatureFlag, flagStatusOptions, updateFeatureFlag } from '../../config/featureFlags'
import { readMobileApps } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const apps = readMobileApps()
const isCreateMode = computed(() => route.name === 'mobile-app-experiment-create')
const flag = isCreateMode.value ? null : findFeatureFlag(route.params.id)
const form = ref(JSON.parse(JSON.stringify(flag || buildCreateForm())))
const tagOptions = ['promotion_activity', 'service_degrade', 'color_ab_test', 'growth_layer', 'install_layer']
const returnValueOptions = computed(() => {
  if (form.value.returnType === 'boolean') return ['false', 'true']
  return []
})
const usesPresetValues = computed(() => returnValueOptions.value.length > 0)

const statusTone = computed(() => {
  return flagStatusOptions.find((item) => item.value === form.value.status)?.tone || 'default'
})

function handleSave () {
  if (!form.value.name?.trim() || !form.value.key?.trim()) {
    MessagePlugin.warning('请填写开关名称和 Key')
    return
  }

  if (isCreateMode.value) {
    createFeatureFlag({
      ...form.value,
      variations: [
        ...form.value.variations.map((variation, index) => ({
          name: variation.name || `Variation${index + 1}`,
          key: `variation_${index + 1}`,
          value: variation.value,
          description: variation.description || ''
        }))
      ],
      rules: [
        { segment: 'all_users', condition: 'default', variation: form.value.defaultValue || 'false', rollout: 100 }
      ]
    })
    MessagePlugin.success('开关已创建')
    router.push({ name: 'mobile-app-experiments' })
    return
  }

  updateFeatureFlag(flag.id, form.value)
  MessagePlugin.success('开关信息已保存')
  router.push({ name: 'mobile-app-experiments' })
}

function handleReturnTypeChange () {
  const values = getDefaultVariationValues(form.value.returnType)
  form.value.defaultValue = values[0]
  form.value.variations = form.value.variations.map((variation, index) => ({
    ...variation,
    value: values[index] || values[0]
  }))
}

function addVariation () {
  const index = form.value.variations.length
  const values = getDefaultVariationValues(form.value.returnType)
  form.value.variations.push({
    key: `variation_${Date.now()}`,
    value: values[index] || values[0],
    name: '',
    description: '',
    color: ['#0052d9', '#e37318', '#00a870', '#8b5cf6'][index % 4]
  })
}

function getDefaultVariationValues (type) {
  if (type === 'number') return ['0', '1']
  if (type === 'string') return ['control', 'variant']
  if (type === 'json') return ['{"enabled":false}', '{"enabled":true}']
  return ['false', 'true']
}

function buildCreateForm () {
  return {
    name: '',
    key: '',
    description: '',
    tag: '',
    appId: apps[0]?.id || '',
    environment: 'Production',
    status: '关闭',
    owner: '',
    returnType: 'boolean',
    useClientSdk: false,
    defaultValue: 'false',
    prerequisite: '',
    rules: [],
    variations: [
      { key: 'variation_1', value: 'false', name: '', description: '', color: '#5669e8' },
      { key: 'variation_2', value: 'true', name: '', description: '', color: '#ff9f18' }
    ]
  }
}
</script>
