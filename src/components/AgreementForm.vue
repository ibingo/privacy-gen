<template>
  <t-card class="panel form-panel" :bordered="false">
    <template #title>
      <div class="panel-title">
        <span>填写协议信息</span>
        <t-tag theme="success" variant="light">实时预览</t-tag>
      </div>
    </template>

    <t-form layout="vertical" class="agreement-form">
      <div class="field-grid">
        <t-form-item label="应用名称" required-mark>
          <t-input v-model="formData.appName" clearable placeholder="例如：我的应用" />
        </t-form-item>
        <t-form-item label="公司名称" required-mark>
          <t-input v-model="formData.companyName" clearable placeholder="例如：某某科技有限公司" />
        </t-form-item>
        <t-form-item label="联系邮箱" required-mark>
          <t-input v-model="formData.contactEmail" clearable placeholder="例如：support@example.com" />
        </t-form-item>
        <t-form-item label="生效日期">
          <t-date-picker v-model="formData.effectiveDate" class="full-width" clearable />
        </t-form-item>
      </div>

      <t-divider align="left">服务说明</t-divider>
      <t-form-item label="服务范围">
        <t-textarea
          v-model="formData.serviceScope"
          placeholder="例如：账号注册、内容浏览、在线交易、消息通知等服务"
          :autosize="{ minRows: 4, maxRows: 8 }"
        />
      </t-form-item>

      <t-divider align="left">补充条款</t-divider>
      <t-form-item>
        <t-textarea
          v-model="formData.additionalInfo"
          placeholder="您可以在此添加运营规则、会员服务、付费说明等补充内容..."
          :autosize="{ minRows: 4, maxRows: 8 }"
        />
      </t-form-item>
    </t-form>
  </t-card>
</template>

<script setup>
import { reactive, watch } from 'vue'
import {
  Card as TCard,
  DatePicker as TDatePicker,
  Divider as TDivider,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Tag as TTag,
  Textarea as TTextarea
} from 'tdesign-vue-next'

const formData = reactive({
  appName: '',
  companyName: '',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  serviceScope: '',
  additionalInfo: ''
})

const emit = defineEmits(['update'])

const emitUpdate = () => {
  emit('update', JSON.parse(JSON.stringify(formData)))
}

watch(formData, emitUpdate, { deep: true, immediate: true })
</script>

<style scoped>
.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.agreement-form :deep(.t-form__label) {
  color: #3d4757;
  font-weight: 600;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 16px;
}

.full-width {
  width: 100%;
}

@media (max-width: 720px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
