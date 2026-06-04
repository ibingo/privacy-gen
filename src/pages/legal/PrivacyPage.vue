<template>
  <t-content class="content privacy-editor-page">
    <div class="privacy-editor-toolbar">
      <t-button theme="primary" :loading="saving" @click="handleSave">保存</t-button>
      <t-button variant="outline" @click="goBack">返回</t-button>
    </div>
    <PolicyForm :model-value="formData" @update="handleFormUpdate" />
    <PolicyPreview :formData="formData" :show-actions="false" />
  </t-content>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button as TButton, Content as TContent, MessagePlugin } from 'tdesign-vue-next'
import PolicyForm from '../../components/PolicyForm.vue'
import PolicyPreview from '../../components/PolicyPreview.vue'
import { createPrivacyPolicyApi, getPrivacyPolicyDetailApi, updatePrivacyPolicyApi } from '../../api/legalDocuments'

const route = useRoute()
const router = useRouter()
const policyId = computed(() => route.params.id)
const saving = ref(false)
const formData = ref({
  id: '',
  appId: '',
  appName: '',
  companyName: '',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  version: '不限制版本',
  platform: '',
  packageName: '',
  status: '待存档',
  sdkList: [],
  additionalInfo: ''
})

const normalizeVersionId = (value) => {
  if (!value || value === '不限制版本') return '不限制'
  return value
}

const normalizePolicyDetail = (item = {}) => ({
  ...item,
  id: item.policyId || item.id || '',
  version: item.versionId || item.version || '不限制版本',
  platform: item.applicableTerminal || item.platform || '',
  sdkList: Array.isArray(item.sdkList) ? item.sdkList : []
})

const buildPolicyPayload = () => {
  const data = formData.value
  return {
    appId: data.appId,
    appName: data.appName,
    companyName: data.companyName,
    contactEmail: data.contactEmail,
    effectiveDate: data.effectiveDate,
    versionId: normalizeVersionId(data.version),
    applicableTerminal: data.platform,
    packageName: data.packageName,
    status: data.status,
    sdkList: Array.isArray(data.sdkList) ? data.sdkList : [],
    additionalInfo: data.additionalInfo
  }
}

const handleFormUpdate = (data) => {
  formData.value = { ...data }
}

const loadPolicy = async () => {
  if (!policyId.value) return
  try {
    const policy = await getPrivacyPolicyDetailApi(policyId.value)
    if (!policy) throw new Error('未找到隐私政策')
    formData.value = normalizePolicyDetail(policy)
  } catch (error) {
    MessagePlugin.warning('未找到隐私政策')
    router.replace({ name: 'privacy-list' })
  }
}

const handleSave = async () => {
  if (!formData.value.appId || !formData.value.appName) {
    MessagePlugin.warning('请先关联应用')
    return
  }
  if (!formData.value.companyName || !formData.value.contactEmail) {
    MessagePlugin.warning('请填写公司名称和联系邮箱')
    return
  }
  saving.value = true
  try {
    const payload = buildPolicyPayload()
    const saved = policyId.value
      ? await updatePrivacyPolicyApi(policyId.value, payload)
      : await createPrivacyPolicyApi(payload)
    const savedId = saved?.policyId || saved?.id || policyId.value
    MessagePlugin.success('隐私政策已保存')
    router.push({ name: 'privacy-detail', params: { id: savedId } })
  } catch (error) {
    MessagePlugin.error(error.message || '隐私政策保存失败')
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'privacy-list' })
}

watch(policyId, loadPolicy, { immediate: true })
</script>

<style scoped>
.privacy-editor-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.9fr);
  gap: 24px;
}

.privacy-editor-toolbar {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.privacy-editor-page :deep(.form-panel) {
  overflow: visible;
  max-height: none;
}

@media (max-width: 1080px) {
  .privacy-editor-page {
    grid-template-columns: 1fr;
  }
}
</style>
