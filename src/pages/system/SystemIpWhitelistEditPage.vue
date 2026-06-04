<template>
  <div class="system-create-page system-form-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>{{ pageTitle }}</h3>
        <p>{{ pageDescription }}</p>
      </div>
      <t-button variant="outline" @click="goBack">返回</t-button>
    </section>

    <t-card class="system-form-card" :bordered="false">
      <template #title>
        <div class="system-form-card-title">
          <span>基础信息</span>
          <t-tag theme="primary" variant="light">{{ isCreateMode ? '新建' : '编辑' }}</t-tag>
        </div>
      </template>

      <t-form class="system-create-form system-base-form" :data="formData" label-align="right" label-width="120px">
        <div class="system-form-section">
          <div class="system-form-section-title">白名单配置</div>
          <div class="system-create-grid">
            <t-form-item label="名称" required-mark>
              <t-input v-model="formData.name" placeholder="请输入名称" />
            </t-form-item>
            <t-form-item label="IP / IP 段" required-mark>
              <t-input v-model="formData.ipRange" placeholder="请输入 IP 或 CIDR，如 10.0.0.0/32" />
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">补充说明</div>
          <t-form-item label="说明">
            <t-textarea v-model="formData.description" :autosize="{ minRows: 4, maxRows: 6 }" placeholder="请输入说明" />
          </t-form-item>
        </div>

        <div class="system-create-actions system-form-actions">
          <t-button theme="primary" @click="handleSubmit">保存</t-button>
          <t-button variant="outline" @click="goBack">取消</t-button>
        </div>
      </t-form>
    </t-card>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Button as TButton,
  Card as TCard,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Tag as TTag,
  Textarea as TTextarea
} from 'tdesign-vue-next'

const route = useRoute()
const router = useRouter()
const isCreateMode = computed(() => route.name === 'system-ip-whitelist-create')
const pageTitle = computed(() => isCreateMode.value ? '新建 IP 白名单' : '编辑 IP 白名单')
const pageDescription = computed(() => isCreateMode.value
  ? '填写名称、IP 或 IP 段后加入管理侧内测访问白名单。'
  : '维护管理侧内测访问白名单的名称、IP 段和说明。')

const seedRows = [
  { id: 'beta-ip-001', name: '内网IP段', ipRange: '10.0.0.0/32', description: '内测环境内网访问白名单' },
  { id: 'beta-ip-002', name: '公司公网IP', ipRange: '58.214.44.25', description: '公司办公公网出口' },
  { id: 'beta-ip-003', name: '移动组预发布', ipRange: '192.168.14.0/8', description: '移动组预发布访问段' },
  { id: 'beta-ip-004', name: '公司预发布', ipRange: '192.168.0.0/16', description: '公司预发布环境访问段' },
  { id: 'beta-ip-005', name: '测试组预发布', ipRange: '192.168.11.0/8', description: '测试组预发布访问段' },
  { id: 'beta-ip-006', name: '动态ip预发布', ipRange: '192.168.254.0/8', description: '动态 IP 预发布访问段' },
  { id: 'beta-ip-007', name: '内网2', ipRange: '223.112.146.10', description: '备用内测访问 IP' }
]

const currentRow = seedRows.find((row) => row.id === route.params.id)
const formData = reactive({
  name: currentRow?.name || '',
  ipRange: currentRow?.ipRange || '',
  description: currentRow?.description || ''
})

function goBack () {
  router.push({ name: 'system-ip-whitelist' })
}

function handleSubmit () {
  if (!formData.name.trim() || !formData.ipRange.trim()) {
    MessagePlugin.warning('请填写名称和 IP / IP 段')
    return
  }
  MessagePlugin.success(isCreateMode.value ? 'IP 白名单已创建' : 'IP 白名单已保存')
  goBack()
}
</script>
