<template>
  <div class="mobile-center-page" v-if="form">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-segments' })">
      &larr; 返回用户人群组
    </button>

    <section class="mc-panel">
      <div class="mc-panel-header">
        <div>
          <h3>{{ isCreateMode ? '新建人群组' : '编辑人群组' }}</h3>
          <p>创建可复用人群组，按用户属性组合筛选目标用户。</p>
        </div>
        <div class="mc-panel-actions">
          <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-segments' })">取消</button>
          <button class="mc-btn mc-btn-primary" @click="handleSave">{{ isCreateMode ? '创建人群组' : '保存人群组' }}</button>
        </div>
      </div>

      <div class="mc-edit-form">
        <div class="mc-form-row">
          <div class="mc-form-group">
            <label>名称</label>
            <input v-model="form.name" type="text" placeholder="如 iOS 内测用户" />
          </div>
          <div class="mc-form-group">
            <label>标识</label>
            <input v-model="form.key" type="text" placeholder="如 ios_beta_users" />
          </div>
        </div>

        <div class="mc-form-row">
          <div class="mc-form-group">
            <label>预估用户数</label>
            <input v-model.number="form.users" type="number" min="0" />
          </div>
          <div class="mc-form-group">
            <label>更新时间</label>
            <input v-model="form.updatedAt" type="text" disabled />
          </div>
        </div>

        <div class="mc-form-group">
          <label>描述</label>
          <textarea v-model="form.description" rows="3" placeholder="输入人群组描述"></textarea>
        </div>

        <section class="mc-flag-section">
          <div class="mc-flag-section-header">
            <h4>人群属性</h4>
            <span>属性之间为且关系，至少保留一个属性条件。</span>
          </div>

          <div v-for="(attribute, index) in form.attributes" :key="attribute.id" class="mc-flag-condition-row">
            <select v-model="attribute.field">
              <option value="">选择用户属性</option>
              <option v-for="field in segmentAttributes" :key="field.id" :value="field.key">{{ field.name }}（{{ field.key }}）</option>
            </select>
            <select v-model="attribute.operator">
              <option value="=">=</option>
              <option value="!=">!=</option>
              <option value="contains">contains</option>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="in">in</option>
            </select>
            <input v-model="attribute.value" type="text" list="segment-attribute-values" placeholder="属性值，回车后可继续添加下一项" @keydown.enter.prevent="addAttribute" />
            <button class="mc-icon-btn" @click="removeAttribute(index)">删除</button>
          </div>

          <datalist id="segment-attribute-values">
            <option v-for="value in attributeValueOptions" :key="value" :value="value" />
          </datalist>

          <button class="mc-btn mc-btn-outline" @click="addAttribute">+ 添加人群属性</button>
        </section>
      </div>
    </section>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该用户组</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-segments' })">返回用户人群组</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  createFeatureSegment,
  findFeatureSegment,
  readSegmentAttributes,
  updateFeatureSegment
} from '../../config/featureFlags'

const route = useRoute()
const router = useRouter()
const isCreateMode = computed(() => route.name === 'mobile-app-segment-create')
const segment = isCreateMode.value ? null : findFeatureSegment(route.params.id)
const form = ref(segment ? JSON.parse(JSON.stringify(segment)) : buildCreateForm())
const segmentAttributes = ref(readSegmentAttributes())
const attributeValueOptions = computed(() => {
  const values = segmentAttributes.value.flatMap((attribute) => attribute.values)
  return [...new Set(values)]
})

function buildCreateForm () {
  return {
    name: '',
    key: '',
    description: '',
    users: 0,
    updatedAt: '保存后生成',
    attributes: [
      { id: `attr-${Date.now()}`, field: '', operator: '=', value: '' }
    ]
  }
}

function addAttribute () {
  form.value.attributes.push({
    id: `attr-${Date.now()}-${form.value.attributes.length}`,
    field: '',
    operator: '=',
    value: ''
  })
}

function removeAttribute (index) {
  if (form.value.attributes.length <= 1) {
    MessagePlugin.warning('至少保留一个人群属性')
    return
  }
  form.value.attributes.splice(index, 1)
}

function handleSave () {
  if (!form.value.name?.trim() || !form.value.key?.trim()) {
    MessagePlugin.warning('请填写名称和标识')
    return
  }
  const attributes = form.value.attributes.filter((item) => item.field?.trim() && String(item.value ?? '').trim())
  if (!attributes.length) {
    MessagePlugin.warning('请至少填写一个人群属性')
    return
  }
  if (isCreateMode.value) {
    createFeatureSegment({ ...form.value, attributes })
    MessagePlugin.success('人群组已创建')
  } else {
    updateFeatureSegment(segment.id, { ...form.value, attributes })
    MessagePlugin.success('人群组已保存')
  }
  router.push({ name: 'mobile-app-segments' })
}
</script>
