<template>
  <div class="mobile-center-page" v-if="flag">
    <button class="mc-back-btn" @click="router.push(backRoute)">
      &larr; {{ backLabel }}
    </button>

    <section class="mc-panel">
      <div class="mc-panel-header">
        <div>
          <h3>规则编辑</h3>
          <p>状态、前置条件、开关返回值、规则、默认规则与未生效返回值。</p>
        </div>
        <span class="mc-app-status" :class="`mc-status-${statusTone}`">{{ form.status }}</span>
      </div>

      <div class="mc-edit-form">
        <div class="mc-form-row">
          <div class="mc-form-group">
            <label>名称</label>
            <input v-model="form.name" type="text" />
          </div>
          <div class="mc-form-group">
            <label>标识</label>
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
            <label>是否使用客户端 SDK</label>
            <select v-model="form.useClientSdk">
              <option :value="true">是</option>
              <option :value="false">否</option>
            </select>
          </div>
        </div>

        <section class="mc-flag-section">
          <div class="mc-flag-section-header">
            <h4>前置条件</h4>
            <span>满足所有条件的用户，才可以进入该开关。</span>
          </div>
          <div v-for="(condition, index) in form.prerequisites" :key="condition.id" class="mc-flag-rule-card">
            <div class="mc-flag-rule-head">
              <strong>条件 {{ index + 1 }}</strong>
              <button class="mc-link-btn" @click="removePrerequisite(index)">删除</button>
            </div>
            <div class="mc-flag-rule-row">
              <select v-model="condition.field">
                <option value="">选择人群属性</option>
                <option v-for="attribute in segmentAttributes" :key="attribute.id" :value="attribute.key">{{ attribute.name }}（{{ attribute.key }}）</option>
              </select>
              <select v-model="condition.operator">
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value="contains">contains</option>
                <option value="in">in</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value=">=">&gt;=</option>
                <option value="<=">&lt;=</option>
              </select>
              <input v-model="condition.value" type="text" list="flag-condition-values" placeholder="值" />
            </div>
          </div>
          <button class="mc-btn mc-btn-outline" @click="addPrerequisite">+ 添加前置条件</button>
        </section>

        <datalist id="flag-condition-values">
          <option v-for="value in segmentAttributeValues" :key="value" :value="value" />
        </datalist>

        <section class="mc-flag-section">
          <div class="mc-flag-section-header">
            <h4>开关返回值</h4>
            <span>为开关设置不同的返回值。</span>
          </div>
          <div v-for="variation in form.variations" :key="variation.key" class="mc-form-row">
            <div class="mc-form-group">
              <label>名称</label>
              <input v-model="variation.name" type="text" />
            </div>
            <div class="mc-form-group">
              <label>返回值</label>
              <input v-model="variation.value" type="text" />
            </div>
          </div>
          <button class="mc-btn mc-btn-outline" @click="addVariation">+ 添加开关返回值</button>
        </section>

        <section class="mc-flag-section">
          <div class="mc-flag-section-header">
            <h4>规则</h4>
            <span>多个规则之间是“或”关系，顺序会影响命中结果。</span>
          </div>
          <div
            v-for="(rule, index) in form.rules"
            :key="rule.id"
            class="mc-flag-rule-card"
            draggable="true"
            @dragstart="dragRuleIndex = index"
            @dragover.prevent
            @drop="moveRule(index)"
          >
            <div class="mc-flag-rule-head">
              <strong>{{ rule.name }}</strong>
              <button class="mc-link-btn" @click="removeRule(index)">删除</button>
            </div>
            <div class="mc-form-group">
              <label>规则名称</label>
              <input v-model="rule.name" type="text" placeholder="填写规则名称" />
            </div>
            <div class="mc-form-group">
              <label>指定人群组</label>
              <select v-model="rule.segmentKey" @change="handleRuleSegmentChange(rule)">
                <option value="">不指定人群组</option>
                <option v-for="segment in featureSegments" :key="segment.id" :value="segment.key">{{ segment.name }}（{{ segment.key }}）</option>
              </select>
            </div>
            <div class="mc-flag-rule-conditions">
              <div v-for="(condition, conditionIndex) in rule.conditions" :key="condition.id" class="mc-flag-condition-row">
                <select v-model="condition.field">
                  <option value="">选择人群属性</option>
                  <option v-for="attribute in segmentAttributes" :key="attribute.id" :value="attribute.key">{{ attribute.name }}（{{ attribute.key }}）</option>
                </select>
                <select v-model="condition.operator">
                  <option value="=">=</option>
                  <option value="!=">!=</option>
                  <option value="contains">contains</option>
                  <option value="in">in</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                </select>
                <input v-model="condition.value" type="text" list="flag-condition-values" placeholder="值" />
                <button class="mc-icon-btn" @click="removeRuleCondition(index, conditionIndex)">删除</button>
              </div>
              <button class="mc-link-btn" @click="addRuleCondition(index)">+ 添加条件</button>
            </div>
            <div class="mc-flag-rule-variations">
              <div v-for="item in rule.variations" :key="item.key" class="mc-form-row">
                <div class="mc-form-group">
                  <label>开关返回值</label>
                  <select v-model="item.key">
                    <option v-for="variation in form.variations" :key="variation.key" :value="variation.key">{{ variation.name || variation.key }}</option>
                  </select>
                </div>
                <div class="mc-form-group">
                  <label>占比</label>
                  <input v-model.number="item.value" type="number" min="0" max="100" />
                </div>
              </div>
            </div>
          </div>
          <button class="mc-btn mc-btn-outline" @click="addRule">+ 添加规则</button>
        </section>

        <div class="mc-form-row">
          <div class="mc-form-group">
            <label>默认规则返回</label>
            <select v-model="form.defaultValue">
              <option v-for="variation in form.variations" :key="variation.key" :value="variation.key">{{ variation.name || variation.key }}</option>
            </select>
          </div>
          <div class="mc-form-group">
            <label>当开关未生效返回</label>
            <select v-model="form.offValue">
              <option v-for="variation in form.variations" :key="variation.key" :value="variation.key">{{ variation.name || variation.key }}</option>
            </select>
          </div>
        </div>

        <section class="mc-flag-section">
          <div class="mc-flag-section-header">
            <h4>发布预览</h4>
            <span>提交发布时展示变更前后差异，并记录变更说明。</span>
          </div>
          <div class="mc-form-group">
            <label>变更说明</label>
            <textarea v-model="form.changeNote" rows="4" placeholder="填写发布说明" />
          </div>
          <div class="mc-diff-grid">
            <div>
              <h5>变更前</h5>
              <pre>{{ beforeText }}</pre>
            </div>
            <div>
              <h5>变更后</h5>
              <pre>{{ afterText }}</pre>
            </div>
          </div>
        </section>
      </div>
    </section>

    <div class="mc-sticky-actions">
      <button class="mc-btn mc-btn-outline" @click="router.push(backRoute)">取消</button>
      <button class="mc-btn mc-btn-primary" @click="handleSave">发布/发起审批</button>
    </div>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该开关配置</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-experiments' })">返回开关列表</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  findFeatureFlag,
  flagStatusOptions,
  readFeatureSegments,
  readSegmentAttributes,
  updateFeatureFlag,
  updateFlagApproval
} from '../../config/featureFlags'

const route = useRoute()
const router = useRouter()
const flag = findFeatureFlag(route.params.id)
const originalFlag = JSON.parse(JSON.stringify(flag))
const form = ref(JSON.parse(JSON.stringify(flag)))
form.value.changeNote = ''
const dragRuleIndex = ref(-1)
const featureSegments = ref(readFeatureSegments())
const segmentAttributes = ref(readSegmentAttributes())

const backRoute = computed(() => {
  return route.query.from === 'list'
    ? { name: 'mobile-app-experiments' }
    : { name: 'mobile-app-flag-configs', params: { id: flag.id } }
})

const backLabel = computed(() => route.query.from === 'list' ? '返回开关列表' : '返回开关配置')

const statusTone = computed(() => {
  return flagStatusOptions.find((item) => item.value === form.value.status)?.tone || 'default'
})

const beforeText = computed(() => JSON.stringify(originalFlag, null, 2))
const afterText = computed(() => JSON.stringify(form.value, null, 2))
const segmentAttributeValues = computed(() => {
  return [...new Set(segmentAttributes.value.flatMap((attribute) => attribute.values || []))]
})

function addPrerequisite () {
  form.value.prerequisites.push({
    id: `pre-${Date.now()}`,
    field: '',
    operator: '=',
    value: ''
  })
}

function removePrerequisite (index) {
  form.value.prerequisites.splice(index, 1)
}

function addVariation () {
  form.value.variations.push({
    name: `返回值${form.value.variations.length + 1}`,
    key: `variation_${Date.now()}`,
    value: ''
  })
}

function addRule () {
  form.value.rules.push({
    id: `rule-${Date.now()}`,
    name: `规则${form.value.rules.length + 1}`,
    segmentKey: '',
    segmentName: '',
    conditions: [{ id: `cond-${Date.now()}`, field: '', operator: '=', value: '' }],
    variations: [{ key: form.value.variations[0]?.key || '', value: 100 }]
  })
}

function removeRule (index) {
  form.value.rules.splice(index, 1)
}

function addRuleCondition (ruleIndex) {
  form.value.rules[ruleIndex].conditions.push({
    id: `cond-${Date.now()}`,
    field: '',
    operator: '=',
    value: ''
  })
}

function removeRuleCondition (ruleIndex, conditionIndex) {
  form.value.rules[ruleIndex].conditions.splice(conditionIndex, 1)
}

function moveRule (targetIndex) {
  const sourceIndex = dragRuleIndex.value
  if (sourceIndex < 0 || sourceIndex === targetIndex) return
  const [item] = form.value.rules.splice(sourceIndex, 1)
  form.value.rules.splice(targetIndex, 0, item)
  dragRuleIndex.value = -1
}

function handleRuleSegmentChange (rule) {
  const segment = featureSegments.value.find((item) => item.key === rule.segmentKey)
  rule.segmentName = segment?.name || ''
  if (segment?.attributes?.length) {
    rule.conditions = segment.attributes.map((attribute, index) => ({
      id: `cond-${Date.now()}-${index}`,
      field: attribute.field,
      operator: attribute.operator,
      value: attribute.value
    }))
  }
}

function handleSave () {
  if (!form.value.name?.trim() || !form.value.key?.trim()) {
    MessagePlugin.warning('请填写名称和标识')
    return
  }
  const publishedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const historyItem = {
    id: `history-${Date.now()}`,
    note: form.value.changeNote || '未填写变更说明',
    publishedAt,
    before: originalFlag,
    after: { ...form.value, changeNote: undefined }
  }
  const saved = updateFeatureFlag(flag.id, {
    ...form.value,
    histories: [historyItem, ...(form.value.histories || [])]
  })
  updateFlagApproval(`approval-${flag.key}`, {
    flagKey: flag.key,
    title: `${flag.name} 规则变更`,
    status: saved.status === '审批中' ? '待审批' : '已通过',
    applicant: saved.owner || '系统用户',
    reviewer: '负责人',
    reason: form.value.changeNote || '规则配置变更',
    changeNote: form.value.changeNote,
    diffBefore: originalFlag,
    diffAfter: saved,
    submittedAt: publishedAt
  })
  MessagePlugin.success(saved.status === '审批中' ? '已发起审批' : '规则已发布')
  router.push(backRoute.value)
}
</script>
