<template>
  <div class="system-create-page system-form-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>编辑项目</h3>
        <p>维护项目信息，并配置项目与用户、角色、部门的绑定关系。</p>
      </div>
      <t-button variant="outline" @click="router.back()">返回</t-button>
    </section>

    <t-card class="system-form-card" :bordered="false">
      <template #title>
        <div class="system-form-card-title">
          <span>基础信息</span>
          <t-tag theme="primary" variant="light">编辑项目</t-tag>
        </div>
      </template>

      <t-form class="system-create-form system-base-form" :data="formData" label-align="right" label-width="120px">
        <div class="system-form-section">
          <div class="system-form-section-title">基本配置</div>
          <div class="system-create-grid">
            <t-form-item label="项目名称">
              <t-input v-model="formData.name" placeholder="请输入项目名称" />
            </t-form-item>
            <t-form-item label="项目编码">
              <t-input v-model="formData.code" disabled />
            </t-form-item>
            <t-form-item label="负责人">
              <t-select
                v-model="formData.ownerUserId"
                :loading="optionsLoading"
                filterable
                clearable
                placeholder="请选择负责人"
              >
                <t-option
                  v-for="user in userOptions"
                  :key="user.value"
                  :value="user.value"
                  :label="user.label"
                />
              </t-select>
            </t-form-item>
            <t-form-item label="状态">
              <t-select v-model="formData.status">
                <t-option value="active" label="启用" />
                <t-option value="inactive" label="停用" />
              </t-select>
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">绑定关系</div>
          <div class="system-create-grid">
            <t-form-item label="绑定用户">
              <t-select
                v-model="formData.boundUserIds"
                :loading="optionsLoading"
                multiple
                filterable
                clearable
                placeholder="请选择绑定用户"
              >
                <t-option
                  v-for="user in userOptions"
                  :key="user.value"
                  :value="user.value"
                  :label="user.label"
                />
              </t-select>
            </t-form-item>
            <t-form-item label="绑定角色">
              <t-select
                v-model="formData.boundRoleIds"
                :loading="optionsLoading"
                multiple
                filterable
                clearable
                placeholder="请选择绑定角色"
              >
                <t-option
                  v-for="role in roleOptions"
                  :key="role.value"
                  :value="role.value"
                  :label="role.label"
                />
              </t-select>
            </t-form-item>
            <t-form-item label="绑定部门">
              <t-cascader
                v-model="formData.boundDepartmentIds"
                :options="departmentTreeOptions"
                :loading="optionsLoading"
                multiple
                filterable
                clearable
                placeholder="请选择绑定部门"
              />
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">补充说明</div>
          <t-form-item label="备注">
            <t-textarea v-model="formData.remark" :autosize="{ minRows: 4, maxRows: 6 }" placeholder="请输入备注" />
          </t-form-item>
        </div>

        <div class="system-create-actions system-form-actions">
          <t-button theme="primary" :loading="saving" @click="handleSubmit">保存</t-button>
          <t-button variant="outline" @click="router.back()">取消</t-button>
        </div>
      </t-form>
    </t-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
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

const projectCode = ref(route.params.code)
const saving = ref(false)
const optionsLoading = ref(false)
const userOptions = ref([])
const roleOptions = ref([])
const departmentTreeOptions = ref([])

const formData = reactive({
  name: '',
  code: '',
  ownerUserId: null,
  boundUserIds: [],
  boundRoleIds: [],
  boundDepartmentIds: [],
  status: 'active',
  remark: ''
})

const flattenTreeOptions = (items, labelKey = 'name') => {
  const result = []
  const walk = (list, depth = 0) => {
    list.forEach((item) => {
      result.push({
        value: item.id,
        label: `${'　'.repeat(depth)}${item[labelKey] || item.name || item.code}`
      })
      if (Array.isArray(item.children) && item.children.length) {
        walk(item.children, depth + 1)
      }
    })
  }
  walk(Array.isArray(items) ? items : [])
  return result
}

const toCascaderOptions = (items, labelKey = 'name') => {
  return (Array.isArray(items) ? items : []).map((item) => {
    const option = {
      value: item.code,
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
    value: item.code,
    label: labelGetter(item)
  }))
}

const toIdentifierList = (...values) => {
  const source = values.find((value) => Array.isArray(value) && value.length) || []
  return source
    .map((item) => {
      if (item && typeof item === 'object') {
        return item.username || item.code || item.departmentCode || item.roleCode || item.id
      }
      return item
    })
    .filter((item) => item !== undefined && item !== null && String(item).trim() !== '')
    .map(String)
}

const fetchBindings = async () => {
  try {
    const data = await managementResources['system-projects'].getBindings(projectCode.value)
    const project = data.project || data
    formData.name = project.name || data.name || ''
    formData.code = project.code || data.code || data.projectCode || ''
    formData.ownerUserId = data.ownerUser || data.projectOwner || project.owner || data.owner || null
    formData.boundUserIds = toIdentifierList(data.bindUsers, data.boundUsernames, data.boundUsers, data.boundUserIds)
    formData.boundRoleIds = toIdentifierList(data.bindRoles, data.boundRoleCodes, data.boundRoles, data.boundRoleIds)
    formData.boundDepartmentIds = toIdentifierList(data.bindDepartment, data.boundDepartmentCodes, data.boundDepartments, data.boundDepartmentIds)
    formData.status = project.status || data.status || 'active'
    formData.remark = project.description || data.description || data.remark || ''
  } catch (e) {
    MessagePlugin.error(e.message || '加载项目信息失败')
  }
}

const fetchOptions = async () => {
  optionsLoading.value = true
  try {
    await Promise.all([
      managementResources['system-users'].list().then((data) => {
        const users = Array.isArray(data) ? data : (data?.rows || data?.list || [])
        userOptions.value = users.map((u) => ({
          value: u.username,
          label: `${u.displayName || u.username}（${u.username || u.code || ''}）`
        }))
      }),
      managementResources['system-roles'].list().then((data) => {
        roleOptions.value = toOptions(data, (item) => `${item.name}（${item.code}）`)
      }),
      managementResources['system-departments'].list().then((data) => {
        departmentTreeOptions.value = toCascaderOptions(data)
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
    MessagePlugin.warning('请填写项目名称和项目编码')
    return
  }

  if (!formData.ownerUserId) {
    MessagePlugin.warning('请选择负责人')
    return
  }

  saving.value = true
  try {
    const payload = {
      name: formData.name,
      code: formData.code,
      ownerUser: formData.ownerUserId,
      projectOwner: formData.ownerUserId,
      owner: formData.ownerUserId,
      ownerUserId: formData.ownerUserId,
      status: formData.status,
      description: formData.remark,
      remark: formData.remark,
      bindUsers: formData.boundUserIds,
      boundUserIds: formData.boundUserIds,
      bindRoles: formData.boundRoleIds,
      boundRoleIds: formData.boundRoleIds,
      bindDepartment: formData.boundDepartmentIds,
      boundDepartmentIds: formData.boundDepartmentIds
    }
    await managementResources['system-projects'].updateBindings(projectCode.value, payload)
    MessagePlugin.success('保存成功')
    router.push({ name: 'system-projects' })
  } catch (e) {
    MessagePlugin.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

watch(
  () => formData.ownerUserId,
  (ownerUserId) => {
    if (!ownerUserId) return
    if (!formData.boundUserIds.includes(ownerUserId)) {
      formData.boundUserIds = [ownerUserId, ...formData.boundUserIds]
    }
  }
)

onMounted(async () => {
  await Promise.all([fetchBindings(), fetchOptions()])
})
</script>
