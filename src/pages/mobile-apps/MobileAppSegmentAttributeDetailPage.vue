<template>
  <div class="mobile-center-page" v-if="form">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-segment-attributes' })">
      &larr; 返回人群属性列表
    </button>

    <section class="mc-panel">
      <div class="mc-panel-header">
        <div>
          <h3>{{ form.name }}</h3>
          <p>{{ form.key }} · {{ form.type }} · {{ form.isDefault ? '默认属性' : '自定义属性' }}</p>
        </div>
        <div class="mc-panel-actions">
          <button class="mc-btn mc-btn-outline" v-if="editing" @click="editing = false">取消编辑</button>
          <button class="mc-btn mc-btn-primary" v-if="editing" @click="handleSave">保存</button>
          <button class="mc-btn mc-btn-primary" v-else @click="editing = true">编辑</button>
        </div>
      </div>

      <div class="mc-edit-form">
        <div class="mc-form-row">
          <div class="mc-form-group">
            <label>属性名称</label>
            <input v-model="form.name" type="text" :disabled="form.isDefault || !editing" />
          </div>
          <div class="mc-form-group">
            <label>属性标识</label>
            <input v-model="form.key" type="text" :disabled="form.isDefault || !editing" />
          </div>
        </div>

        <div class="mc-form-row">
          <div class="mc-form-group">
            <label>类型</label>
            <select v-model="form.type" disabled>
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="array">array</option>
            </select>
          </div>
          <div class="mc-form-group">
            <label>描述</label>
            <input v-model="form.description" type="text" :disabled="!editing" />
          </div>
        </div>

        <section class="mc-flag-section">
          <div class="mc-flag-section-header">
            <h4>属性值</h4>
            <span>默认属性不可删除属性本身，但可以维护这里的可选值。</span>
          </div>
          <div class="segment-attribute-value-list">
            <div v-for="(value, index) in form.values" :key="`${value}-${index}`" class="segment-attribute-value-row">
              <input v-model="form.values[index]" type="text" :disabled="!editing" />
              <button class="mc-icon-btn" :disabled="!editing" @click="removeValue(index)">删除</button>
            </div>
          </div>
          <div v-if="editing" class="segment-attribute-add-value">
            <input v-model="newValue" type="text" placeholder="输入新值" @keydown.enter.prevent="addValue" />
            <button class="mc-btn mc-btn-outline" @click="addValue">+ 添加新值</button>
          </div>
        </section>

        <section v-if="form.sourceType === 'ref'" class="mc-flag-section">
          <div class="mc-flag-section-header">
            <h4>API Ref</h4>
            <span>创建属性时配置的接口引用和映射规则。</span>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>URL</label>
              <input v-model="form.refConfig.url" type="text" :disabled="!editing" />
            </div>
            <div class="mc-form-group">
              <label>Method</label>
              <select v-model="form.refConfig.method" :disabled="!editing">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
          </div>
          <div class="mc-form-group">
            <label>Headers JSON</label>
            <textarea v-model="form.refConfig.headers" rows="4" :disabled="!editing"></textarea>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>值路径</label>
              <input v-model="form.mappings.valuePath" type="text" :disabled="!editing" />
            </div>
            <div class="mc-form-group">
              <label>展示路径</label>
              <input v-model="form.mappings.labelPath" type="text" :disabled="!editing" />
            </div>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>有效路径</label>
              <input v-model="form.mappings.validPath" type="text" :disabled="!editing" />
            </div>
            <div class="mc-form-group">
              <label>单位路径</label>
              <input v-model="form.mappings.unitPath" type="text" :disabled="!editing" />
            </div>
          </div>
          <div class="mc-form-group">
            <label>占位 JSON</label>
            <textarea v-model="form.placeholderJson" rows="5" :disabled="!editing"></textarea>
          </div>
          <div class="mc-form-group">
            <label>提取器代码</label>
            <textarea v-model="form.extractorCode" class="segment-attribute-code-editor" rows="12" :disabled="!editing"></textarea>
          </div>
        </section>
      </div>
    </section>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该人群属性</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-segment-attributes' })">返回人群属性列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { findSegmentAttribute, updateSegmentAttribute } from '../../config/featureFlags'

const route = useRoute()
const router = useRouter()
const attribute = findSegmentAttribute(route.params.id)
const form = ref(attribute ? JSON.parse(JSON.stringify(attribute)) : null)
const editing = ref(false)
const newValue = ref('')

function addValue () {
  const value = newValue.value.trim()
  if (!value) return
  if (form.value.values.includes(value)) {
    MessagePlugin.warning('该值已存在')
    return
  }
  form.value.values.push(value)
  newValue.value = ''
}

function removeValue (index) {
  form.value.values.splice(index, 1)
}

function handleSave () {
  if (!form.value.name.trim() || !form.value.key.trim()) {
    MessagePlugin.warning('请填写属性名称和属性标识')
    return
  }
  updateSegmentAttribute(form.value.id, form.value)
  MessagePlugin.success('人群属性已更新')
  editing.value = false
}
</script>
