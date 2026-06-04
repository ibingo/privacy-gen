<template>
  <t-content class="content agreement-editor-page">
    <div class="agreement-editor-toolbar">
      <t-button theme="primary" :loading="saving" @click="handleSave">保存</t-button>
      <t-button variant="outline" @click="goBack">返回</t-button>
    </div>
    <AgreementForm :model-value="agreementData" @update="handleAgreementUpdate" />
    <AgreementPreview :form-data="agreementData" :show-actions="false" />
  </t-content>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button as TButton, Content as TContent, MessagePlugin } from 'tdesign-vue-next'
import AgreementForm from '../../components/AgreementForm.vue'
import AgreementPreview from '../../components/AgreementPreview.vue'
import { createUserAgreementApi, getUserAgreementDetailApi, updateUserAgreementApi } from '../../api/legalDocuments'

const route = useRoute()
const router = useRouter()
const agreementId = computed(() => route.params.id)
const saving = ref(false)
const agreementData = ref({
  id: '',
  appId: '',
  appName: '',
  companyName: '',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  version: '不限制版本',
  platform: '',
  packageName: '',
  serviceScope: '',
  status: '待存档',
  additionalInfo: ''
})

const normalizeVersionId = (value) => {
  if (!value || value === '不限制版本') return '不限制'
  return value
}

const normalizeAgreementDetail = (item = {}) => ({
  ...item,
  id: item.agreementId || item.id || '',
  version: item.versionId || item.version || '不限制版本',
  platform: item.applicableTerminal || item.platform || ''
})

const buildAgreementPayload = () => {
  const data = agreementData.value
  return {
    appId: data.appId,
    appName: data.appName,
    companyName: data.companyName,
    contactEmail: data.contactEmail,
    effectiveDate: data.effectiveDate,
    versionId: normalizeVersionId(data.version),
    applicableTerminal: data.platform,
    packageName: data.packageName,
    serviceScope: data.serviceScope,
    status: data.status,
    additionalInfo: data.additionalInfo
  }
}

const handleAgreementUpdate = (data) => {
  agreementData.value = { ...data }
}

const loadAgreement = async () => {
  if (!agreementId.value) return
  try {
    const agreement = await getUserAgreementDetailApi(agreementId.value)
    if (!agreement) throw new Error('未找到用户协议')
    agreementData.value = normalizeAgreementDetail(agreement)
  } catch (error) {
    MessagePlugin.warning('未找到用户协议')
    router.replace({ name: 'agreement-list' })
  }
}

const handleSave = async () => {
  if (!agreementData.value.appId || !agreementData.value.appName) {
    MessagePlugin.warning('请先关联应用')
    return
  }
  if (!agreementData.value.companyName || !agreementData.value.contactEmail) {
    MessagePlugin.warning('请填写公司名称和联系邮箱')
    return
  }
  saving.value = true
  try {
    const payload = buildAgreementPayload()
    const saved = agreementId.value
      ? await updateUserAgreementApi(agreementId.value, payload)
      : await createUserAgreementApi(payload)
    const savedId = saved?.agreementId || saved?.id || agreementId.value
    MessagePlugin.success('用户协议已保存')
    router.push({ name: 'agreement-detail', params: { id: savedId } })
  } catch (error) {
    MessagePlugin.error(error.message || '用户协议保存失败')
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'agreement-list' })
}

watch(agreementId, loadAgreement, { immediate: true })
</script>

<style scoped>
.agreement-editor-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.9fr);
  gap: 24px;
}

.agreement-editor-toolbar {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.agreement-editor-page :deep(.form-panel) {
  overflow: visible;
  max-height: none;
}

@media (max-width: 1080px) {
  .agreement-editor-page {
    grid-template-columns: 1fr;
  }
}
</style>
