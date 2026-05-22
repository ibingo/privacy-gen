<template>
  <div class="mobile-center-page">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-segment-attributes' })">
      &larr; 返回人群属性列表
    </button>

    <section class="mc-panel">
      <div class="mc-panel-header">
        <div>
          <h3>新建人群属性</h3>
          <p>配置属性基础信息，并可通过 API Ref 提供属性值。</p>
        </div>
        <div class="mc-panel-actions">
          <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-segment-attributes' })">取消</button>
          <button class="mc-btn mc-btn-primary" @click="handleCreate">创建</button>
        </div>
      </div>

      <div class="mc-edit-form">
        <div class="mc-form-row">
          <div class="mc-form-group">
            <label>属性名称</label>
            <input v-model="form.name" type="text" placeholder="如 用户余额" />
          </div>
          <div class="mc-form-group">
            <label>属性标识</label>
            <input v-model="form.key" type="text" placeholder="如 balance" />
          </div>
        </div>

        <div class="mc-form-row">
          <div class="mc-form-group">
            <label>类型</label>
            <select v-model="form.type">
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="array">array</option>
            </select>
          </div>
          <div class="mc-form-group">
            <label>来源</label>
            <select v-model="form.sourceType">
              <option value="manual">手动维护</option>
              <option value="ref">API Ref</option>
            </select>
          </div>
        </div>

        <div class="mc-form-group">
          <label>描述</label>
          <textarea v-model="form.description" rows="3" placeholder="说明该属性含义"></textarea>
        </div>

        <section class="mc-flag-section">
          <div class="mc-flag-section-header">
            <h4>可选值</h4>
            <span>手动维护时使用，API Ref 也可作为兜底值。</span>
          </div>
          <input v-model="valuesText" class="segment-attribute-wide-input" type="text" placeholder="用逗号分隔，如 00001,00002,00003" />
        </section>

        <section v-if="form.sourceType === 'ref'" class="mc-flag-section">
          <div class="mc-flag-section-header">
            <h4>API Ref</h4>
            <span>由 API 响应提供属性值，支持占位变量和字段映射。</span>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>URL</label>
              <input v-model="form.refConfig.url" type="text" placeholder="{{baseUrl}}/user/balance" />
            </div>
            <div class="mc-form-group">
              <label>Method</label>
              <select v-model="form.refConfig.method">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
          </div>
          <div class="mc-form-group">
            <label>Headers JSON</label>
            <textarea v-model="form.refConfig.headers" rows="4" placeholder='{"Authorization":"Bearer {{apiKey}}"}'></textarea>
          </div>
          <div class="mc-form-group">
            <label>占位 JSON</label>
            <textarea v-model="form.placeholderJson" rows="6" placeholder='{"baseUrl":"https://api.example.com","apiKey":"test-key"}'></textarea>
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>值路径</label>
              <input v-model="form.mappings.valuePath" type="text" placeholder="response.balance" />
            </div>
            <div class="mc-form-group">
              <label>展示路径</label>
              <input v-model="form.mappings.labelPath" type="text" placeholder="response.balance" />
            </div>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>有效路径</label>
              <input v-model="form.mappings.validPath" type="text" placeholder="response.is_active" />
            </div>
            <div class="mc-form-group">
              <label>单位路径</label>
              <input v-model="form.mappings.unitPath" type="text" placeholder="USD" />
            </div>
          </div>

          <div class="mc-form-group">
            <label>提取器代码</label>
            <textarea v-model="form.extractorCode" class="segment-attribute-code-editor" rows="14"></textarea>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { createSegmentAttribute } from '../../config/featureFlags'

const router = useRouter()
const valuesText = ref('')
const form = ref({
  name: '',
  key: '',
  type: 'string',
  description: '',
  sourceType: 'manual',
  refConfig: {
    url: '{{baseUrl}}/user/balance',
    method: 'GET',
    headers: '{\n  "Authorization": "Bearer {{apiKey}}",\n  "User-Agent": "cc-switch/1.0"\n}'
  },
  placeholderJson: '{\n  "baseUrl": "https://api.example.com",\n  "apiKey": "test-key"\n}',
  mappings: {
    valuePath: 'response.balance',
    labelPath: 'response.balance',
    validPath: 'response.is_active',
    unitPath: 'USD'
  },
  extractorCode: `({
  request: {
    url: "{{baseUrl}}/user/balance",
    method: "GET",
    headers: {
      "Authorization": "Bearer {{apiKey}}",
      "User-Agent": "cc-switch/1.0"
    }
  },
  extractor: function(response) {
    return {
      isValid: response.is_active || true,
      remaining: response.balance,
      unit: "USD"
    };
  }
})`
})

function handleCreate () {
  if (!form.value.name.trim() || !form.value.key.trim()) {
    MessagePlugin.warning('请填写属性名称和属性标识')
    return
  }
  createSegmentAttribute({
    ...form.value,
    values: valuesText.value.split(',').map((item) => item.trim()).filter(Boolean)
  })
  MessagePlugin.success('人群属性已创建')
  router.push({ name: 'mobile-app-segment-attributes' })
}
</script>
