<template>
  <t-content class="content">
    <AgreementForm @update="handleAgreementUpdate" />
    <AgreementPreview :formData="agreementData" />
  </t-content>
</template>

<script setup>
import { ref } from 'vue'
import { Content as TContent } from 'tdesign-vue-next'
import AgreementForm from '../components/AgreementForm.vue'
import AgreementPreview from '../components/AgreementPreview.vue'

const agreementData = ref({
  appName: '',
  companyName: '',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  serviceScope: '',
  additionalInfo: ''
})

const handleAgreementUpdate = (data) => {
  agreementData.value = { ...data }
}
</script>
