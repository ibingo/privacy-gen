<template>
  <t-content class="content">
    <PolicyForm @update="handleFormUpdate" />
    <PolicyPreview :formData="formData" />
  </t-content>
</template>

<script setup>
import { ref } from 'vue'
import { Content as TContent } from 'tdesign-vue-next'
import PolicyForm from '../../components/PolicyForm.vue'
import PolicyPreview from '../../components/PolicyPreview.vue'

const formData = ref({
  appName: '',
  companyName: '',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  sdkList: [],
  additionalInfo: ''
})

const handleFormUpdate = (data) => {
  formData.value = { ...data }
}
</script>
