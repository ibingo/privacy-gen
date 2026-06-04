<template>
  <div class="system-create-page system-form-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>编辑用户</h3>
        <p>维护用户账号信息，配置所属部门、岗位和角色。</p>
      </div>
      <t-button variant="outline" @click="router.back()">返回</t-button>
    </section>

    <t-card class="system-form-card" :bordered="false">
      <template #title>
        <div class="system-form-card-title">
          <span>基础信息</span>
          <t-tag theme="primary" variant="light">编辑用户</t-tag>
        </div>
      </template>

      <t-form class="system-create-form system-base-form" :data="formData" label-align="right" label-width="120px">
        <div class="system-form-section">
          <div class="system-form-section-title">基本配置</div>
          <div class="system-create-grid">
            <t-form-item label="用户名称">
              <t-input v-model="formData.name" :disabled="isAdmin" placeholder="请输入用户名称" />
            </t-form-item>
            <t-form-item label="登录账号">
              <t-input v-model="formData.code" disabled />
            </t-form-item>
            <t-form-item label="所属部门">
              <t-cascader
                :key="departmentKey"
                v-model="formData.departmentCode"
                :options="departmentTreeOptions"
                :loading="optionsLoading"
                :disabled="isAdmin"
                filterable
                clearable
                placeholder="请选择所属部门"
              />
            </t-form-item>
            <t-form-item label="状态">
              <t-select v-model="formData.status" :disabled="isAdmin">
                <t-option value="enabled" label="启用" />
                <t-option value="disabled" label="停用" />
              </t-select>
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">账号权限</div>
          <div class="system-create-grid">
            <t-form-item label="岗位">
              <t-select
                v-model="formData.positionCode"
                :loading="optionsLoading"
                :disabled="isAdmin"
                filterable
                clearable
                placeholder="请选择岗位"
              >
                <t-option
                  v-for="position in positionOptions"
                  :key="position.value"
                  :value="position.value"
                  :label="position.label"
                />
              </t-select>
            </t-form-item>
            <t-form-item label="角色">
              <t-select
                v-model="formData.roleCodes"
                :loading="optionsLoading"
                :disabled="isAdmin"
                multiple
                filterable
                clearable
                placeholder="请选择角色"
              >
                <t-option
                  v-for="role in roleOptions"
                  :key="role.value"
                  :value="role.value"
                  :label="role.label"
                />
              </t-select>
            </t-form-item>
            <t-form-item label="手机号">
              <t-input v-model="formData.phone" :disabled="isAdmin" placeholder="请输入手机号" />
            </t-form-item>
            <t-form-item label="邮箱">
              <t-input v-model="formData.email" :disabled="isAdmin" placeholder="请输入邮箱" />
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">补充说明</div>
          <t-form-item label="备注">
            <t-textarea v-model="formData.remark" :disabled="isAdmin" :autosize="{ minRows: 4, maxRows: 6 }" placeholder="请输入备注" />
          </t-form-item>
        </div>

        <div v-if="!isAdmin" class="system-create-actions system-form-actions">
          <t-button theme="primary" :loading="saving" @click="handleSubmit">保存</t-button>
          <t-button variant="outline" @click="router.back()">取消</t-button>
        </div>
        <div v-else class="system-create-actions system-form-actions">
          <t-button variant="outline" @click="router.back()">返回</t-button>
        </div>
      </t-form>
    </t-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Button as TButton,
  Card as TCard,
  Cascader as TCascader,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Tag as TTag,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import { managementResources } from '../../api/management'

const route = useRoute()
const router = useRouter()

const username = ref(route.params.username)
const isAdmin = computed(() => username.value === 'admin')
const saving = ref(false)
const optionsLoading = ref(false)
const departmentTreeOptions = ref([])
const positionOptions = ref([])
const roleOptions = ref([])
const departmentKey = ref(0)

const formData = reactive({
  name: '',
  code: '',
  departmentCode: null,
  positionCode: null,
  roleCodes: [],
  phone: '',
  email: '',
  status: 'enabled',
  remark: ''
})

const toCascaderOptions = (items, labelKey = 'name') => {
  return (Array.isArray(items) ? items : []).map((item) => {
    const option = {
      value: item.code || item.id,
      label: item[labelKey] || item.name || item.code
    }
    if (Array.isArray(item.children) && item.children.length) {
      option.children = toCascaderOptions(item.children, labelKey)
    }
    return option
  })
}

const toOptions = (items, labelGetter) => {
  return (Array.isArray(items) ? items : []).map((item) => ({
    value: item.code || item.id,
    label: labelGetter(item)
  }))
}

const normalizeStatus = (status) => {
  if (status === 'active' || status === '启用' || status === '1' || status === 1) return 'enabled'
  if (status === 'inactive' || status === '停用' || status === '0' || status === 0) return 'disabled'
  return status || 'enabled'
}

const fetchUser = async () => {
  try {
    const data = await managementResources['system-users'].get(username.value)
    console.log('[UserEdit] user data:', data)
    formData.name = data.displayName || data.name || ''
    formData.code = data.username || data.code || ''
    console.log('[UserEdit] departmentCode from API:', data.departmentCode)
    formData.departmentCode = data.departmentCode || data.department?.code || null
    console.log('[UserEdit] positionCode from API:', data.positionCode)
    formData.positionCode = data.positionCode || data.position?.code || null
    formData.roleCodes = data.roleCodes || (data.roles || []).map((r) => r.code || r).filter(Boolean) || []
    console.log('[UserEdit] roleCodes:', formData.roleCodes)
    formData.phone = data.phone || ''
    formData.email = data.email || ''
    formData.status = normalizeStatus(data.status)
    formData.remark = data.description || data.remark || ''
    departmentKey.value++
  } catch (e) {
    MessagePlugin.error(e.message || '加载用户信息失败')
  }
}

const fetchOptions = async () => {
  optionsLoading.value = true
  try {
    await Promise.all([
      managementResources['system-departments'].list().then((data) => {
        departmentTreeOptions.value = toCascaderOptions(data)
      }),
      managementResources['system-posts'].list().then((data) => {
        positionOptions.value = toOptions(data, (item) => `${item.name}（${item.code}）`)
      }),
      managementResources['system-roles'].list().then((data) => {
        roleOptions.value = toOptions(data, (item) => `${item.name}（${item.code}）`)
      })
    ])
  } catch (e) {
    MessagePlugin.error(e.message || '加载选项失败')
  } finally {
    optionsLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formData.name || !formData.code) {
    MessagePlugin.warning('请填写用户名称和登录账号')
    return
  }

  saving.value = true
  try {
    const payload = {
      displayName: formData.name,
      username: formData.code,
      departmentCode: formData.departmentCode,
      positionCode: formData.positionCode,
      roleCodes: formData.roleCodes,
      phone: formData.phone,
      email: formData.email,
      status: formData.status,
      description: formData.remark
    }
    await managementResources['system-users'].update(username.value, payload)
    MessagePlugin.success('保存成功')
    router.push({ name: 'system-users' })
  } catch (e) {
    MessagePlugin.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchOptions()
  await fetchUser()
})
</script>
