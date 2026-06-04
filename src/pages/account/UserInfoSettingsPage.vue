<template>
  <t-loading :loading="loading" text="加载用户信息中">
    <div class="account-settings-page">
      <t-alert v-if="loadError" theme="error" :message="loadError" />
      <section class="account-settings-card">
        <div class="account-settings-card-header">
          <h3>用户信息设置</h3>
          <p>维护个人资料展示信息和工作联系方式。</p>
        </div>
        <t-form class="account-settings-form" :data="formData" label-align="top">
          <div class="account-settings-form-grid">
            <t-form-item label="姓名">
              <t-input v-model="formData.displayName" />
            </t-form-item>
            <t-form-item label="邮箱">
              <t-input v-model="formData.email" />
            </t-form-item>
            <t-form-item label="手机号">
              <t-input v-model="formData.phone" />
            </t-form-item>
            <t-form-item label="座机">
              <t-input v-model="formData.extensionNumber" />
            </t-form-item>
            <t-form-item label="座位">
              <t-input v-model="formData.seatNumber" />
            </t-form-item>
            <t-form-item label="主体">
              <t-input v-model="formData.organization" />
            </t-form-item>
            <t-form-item label="上级">
              <t-input v-model="formData.managerName" />
            </t-form-item>
            <t-form-item label="职位">
              <t-input v-model="formData.position" />
            </t-form-item>
            <t-form-item label="入职时间">
              <t-input v-model="formData.entryDate" />
            </t-form-item>
            <t-form-item label="所属团队">
              <t-input v-model="formData.teamPath" />
            </t-form-item>
          </div>
          <div class="account-settings-actions">
            <t-button theme="primary" @click="handleSave">保存设置</t-button>
            <t-button variant="outline" @click="resetForm">重置</t-button>
          </div>
        </t-form>
      </section>
    </div>
  </t-loading>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import {
  Alert as TAlert,
  Button as TButton,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Loading as TLoading,
  MessagePlugin
} from 'tdesign-vue-next'
import { userProfileApi } from '../../api/user'

const formData = reactive({
  displayName: '',
  email: '',
  phone: '',
  extensionNumber: '',
  seatNumber: '',
  organization: '',
  managerName: '',
  position: '',
  entryDate: '',
  teamPath: ''
})

const loading = ref(false)
const loadError = ref('')
const originFormData = ref({})

const applyProfile = (profile = {}) => {
  const basicInfo = profile.basicInfo || {}
  Object.assign(formData, {
    displayName: profile.displayName || profile.greetingName || profile.username || '',
    email: basicInfo.email || '',
    phone: basicInfo.phone || '',
    extensionNumber: basicInfo.extensionNumber || '',
    seatNumber: basicInfo.seatNumber || '',
    organization: basicInfo.organization || '',
    managerName: basicInfo.managerName || '',
    position: basicInfo.position || '',
    entryDate: basicInfo.entryDate || '',
    teamPath: basicInfo.teamPath || ''
  })
  originFormData.value = { ...formData }
}

const loadProfile = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await userProfileApi()
    applyProfile(data)
  } catch (error) {
    loadError.value = error.message || '用户信息加载失败'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, originFormData.value)
}

const handleSave = () => {
  MessagePlugin.info('保存接口未配置，当前仅支持本地编辑预览')
}

onMounted(loadProfile)
</script>
