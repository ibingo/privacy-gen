<template>
  <t-card class="panel form-panel" :bordered="false">
    <template #title>
      <div class="panel-title">
        <span>填写应用信息</span>
        <t-tag theme="success" variant="light">实时预览</t-tag>
      </div>
    </template>

    <t-form layout="vertical" class="policy-form">
      <div class="field-grid">
        <t-form-item label="应用名称" required-mark>
          <t-input v-model="formData.appName" clearable placeholder="例如：我的应用" />
        </t-form-item>
        <t-form-item label="公司名称" required-mark>
          <t-input v-model="formData.companyName" clearable placeholder="例如：某某科技有限公司" />
        </t-form-item>
        <t-form-item label="联系邮箱" required-mark>
          <t-input v-model="formData.contactEmail" clearable placeholder="例如：privacy@example.com" />
        </t-form-item>
        <t-form-item label="生效日期">
          <t-date-picker v-model="formData.effectiveDate" class="full-width" clearable />
        </t-form-item>
      </div>

      <t-divider align="left">第三方 SDK 列表</t-divider>
      <t-space direction="vertical" size="medium" class="full-width">
        <t-card
          v-for="(sdk, index) in formData.sdkList"
          :key="index"
          size="small"
          class="sdk-card"
          :bordered="true"
        >
          <template #title>SDK #{{ index + 1 }}</template>
          <template #actions>
            <t-button theme="danger" variant="text" size="small" @click="removeSdk(index)">删除</t-button>
          </template>
          <div class="sdk-fields">
            <t-input v-model="sdk.name" clearable placeholder="SDK 名称（如：阿里云推送）" />
            <t-input v-model="sdk.company" clearable placeholder="第三方公司名称" />
            <t-textarea v-model="sdk.purpose" placeholder="使用目的" :autosize="{ minRows: 2, maxRows: 4 }" />
            <t-textarea v-model="sdk.dataTypes" placeholder="收集的个人信息类型" :autosize="{ minRows: 2, maxRows: 4 }" />
            <t-input v-model="sdk.processing" clearable placeholder="处理方式（如：匿名化处理）" />
            <t-input v-model="sdk.privacyUrl" clearable placeholder="隐私政策链接" />
          </div>
        </t-card>
        <t-button block variant="dashed" theme="primary" @click="addSdk">添加 SDK</t-button>
      </t-space>

      <t-divider align="left">其他说明</t-divider>
      <t-form-item>
        <t-textarea
          v-model="formData.additionalInfo"
          placeholder="您可以在此添加其他需要说明的内容..."
          :autosize="{ minRows: 4, maxRows: 8 }"
        />
      </t-form-item>
    </t-form>
  </t-card>
</template>

<script setup>
import { reactive, watch } from 'vue'
import {
  Button as TButton,
  Card as TCard,
  DatePicker as TDatePicker,
  Divider as TDivider,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Space as TSpace,
  Tag as TTag,
  Textarea as TTextarea
} from 'tdesign-vue-next'

const formData = reactive({
  appName: '',
  companyName: '',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  sdkList: [],
  additionalInfo: ''
})

const emit = defineEmits(['update'])

const emitUpdate = () => {
  emit('update', JSON.parse(JSON.stringify(formData)))
}

const addSdk = () => {
  formData.sdkList.push({
    name: '',
    company: '',
    purpose: '',
    dataTypes: '',
    processing: '',
    privacyUrl: ''
  })
}

const removeSdk = (index) => {
  formData.sdkList.splice(index, 1)
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

.policy-form :deep(.t-form__label) {
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

.check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;
  margin-bottom: 4px;
}

.check-grid-compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sdk-card {
  background: #fbfcff;
}

.sdk-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.sdk-fields :deep(.t-textarea) {
  grid-column: span 2;
}

@media (max-width: 720px) {
  .field-grid,
  .check-grid,
  .check-grid-compact,
  .sdk-fields {
    grid-template-columns: 1fr;
  }

  .sdk-fields :deep(.t-textarea) {
    grid-column: span 1;
  }
}
</style>
