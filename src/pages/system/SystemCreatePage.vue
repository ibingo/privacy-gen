<template>
  <div class="system-create-page system-form-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>{{ pageTitle }}</h3>
        <p>{{ pageDescription }}</p>
      </div>
      <t-button variant="outline" @click="router.back()">返回</t-button>
    </section>

    <t-card class="system-form-card" :bordered="false">
      <template #title>
        <div class="system-form-card-title">
          <span>基础信息</span>
          <t-tag theme="primary" variant="light">{{ pageTitle }}</t-tag>
        </div>
      </template>

      <t-form class="system-create-form system-base-form" :data="formData" label-align="right" label-width="120px">
        <div class="system-form-section">
          <div class="system-form-section-title">基本配置</div>
          <div class="system-create-grid">
          <t-form-item :label="nameLabel">
            <t-input v-model="formData.name" :placeholder="`请输入${nameLabel}`" />
          </t-form-item>
          <t-form-item v-if="baseRouteName !== 'system-projects'" :label="codeLabel">
            <t-input v-model="formData.code" :placeholder="`请输入${codeLabel}`" @blur="checkUsernameDuplicate" />
            <p v-if="usernameDuplicate" style="color: var(--td-error-color); font-size: 12px; margin-top: 4px;">该登录账号已存在，请更换</p>
          </t-form-item>
          <t-form-item v-if="baseRouteName === 'system-users'" label="密码">
            <div style="display: flex; gap: 8px; width: 100%;">
              <t-input v-model="formData.password" type="password" placeholder="请输入密码" style="flex: 1;" />
              <t-button variant="outline" size="small" @click="generatePassword">自动生成</t-button>
            </div>
          </t-form-item>
          <t-form-item v-if="baseRouteName === 'system-projects'" label="负责人">
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
          <t-form-item v-if="baseRouteName !== 'system-projects'" :label="ownerLabel">
            <t-cascader
              v-if="baseRouteName === 'system-users'"
              v-model="formData.departmentCode"
              :options="departmentTreeOptions"
              :loading="optionsLoading"
              filterable
              clearable
              placeholder="请选择所属部门"
            />
            <t-tree-select
              v-else-if="baseRouteName === 'system-roles'"
              v-model="formData.permissionIds"
              :data="permissionTreeOptions"
              :loading="optionsLoading"
              :tree-props="permissionTreeProps"
              multiple
              filterable
              clearable
              placeholder="请选择权限"
            />
            <t-cascader
              v-else-if="baseRouteName === 'system-menus'"
              v-model="formData.parentId"
              :options="menuTreeOptions"
              :loading="optionsLoading"
              filterable
              clearable
              placeholder="请选择父级菜单"
            />
            <t-cascader
              v-else-if="baseRouteName === 'system-departments'"
              v-model="formData.parentId"
              :options="departmentTreeOptions"
              :loading="optionsLoading"
              filterable
              clearable
              placeholder="请选择上级部门"
            />
            <t-cascader
              v-else-if="baseRouteName === 'system-posts'"
              v-model="formData.departmentCode"
              :options="departmentTreeOptions"
              :loading="optionsLoading"
              filterable
              clearable
              placeholder="请选择所属部门"
            />
            <t-input v-else v-model="formData.owner" :placeholder="`请输入${ownerLabel}`" />
          </t-form-item>
          <t-form-item label="状态">
            <t-select v-model="formData.status">
              <t-option value="enabled" label="启用" />
              <t-option value="disabled" label="停用" />
            </t-select>
          </t-form-item>
          </div>
        </div>

        <div v-if="baseRouteName === 'system-users'" class="system-form-section">
          <div class="system-form-section-title">账号权限</div>
          <div class="system-create-grid">
            <t-form-item label="岗位">
              <t-select
                v-model="formData.positionCode"
                :loading="optionsLoading"
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
              <t-input v-model="formData.phone" placeholder="请输入手机号" />
            </t-form-item>
            <t-form-item label="邮箱">
              <t-input v-model="formData.email" placeholder="请输入邮箱" />
            </t-form-item>
          </div>
        </div>

        <div v-if="baseRouteName === 'system-roles'" class="system-form-section">
          <div class="system-form-section-title">权限配置</div>
          <div class="system-create-grid">
            <t-form-item label="菜单权限">
              <t-cascader
                v-model="formData.menuIds"
                :options="menuTreeOptions"
                :loading="optionsLoading"
                value-mode="parentFirst"
                multiple
                filterable
                clearable
                placeholder="请选择菜单"
              />
            </t-form-item>
          </div>
        </div>

        <div v-if="baseRouteName === 'system-projects'" class="system-form-section">
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

        <div v-if="!resourceApi" class="system-manage-api-tip system-form-tip">
          当前后端 OpenAPI 未提供该模块新建接口，保存按钮不会提交到服务端。
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
  Textarea as TTextarea,
  TreeSelect as TTreeSelect
} from 'tdesign-vue-next'
import { pages } from '../../config/pages'
import { getManagementResource, managementResources } from '../../api/management'

const route = useRoute()
const router = useRouter()

const baseRouteName = computed(() => String(route.name).replace(/-create$/, ''))
const baseMeta = computed(() => pages[baseRouteName.value] || {})
const pageTitle = computed(() => route.meta?.title || `新建${baseMeta.value.title || '管理记录'}`)
const pageDescription = computed(() => route.meta?.description || '新增系统管理记录并维护基础配置。')
const resourceApi = computed(() => getManagementResource(baseRouteName.value))
const saving = ref(false)
const optionsLoading = ref(false)
const departmentOptions = ref([])
const departmentTreeOptions = ref([])
const roleOptions = ref([])
const positionOptions = ref([])
const permissionTreeOptions = ref([])
const permissionLeafValues = ref(new Set())
const menuOptions = ref([])
const menuTreeOptions = ref([])
const userOptions = ref([])
const permissionTreeProps = {
  valueMode: 'onlyLeaf',
  expandAll: true
}

const labelMap = {
  'system-users': ['用户名称', '登录账号', '所属部门'],
  'system-roles': ['角色名称', '角色标识', '权限范围'],
  'system-permissions': ['权限名称', '权限编码', '权限说明'],
  'system-menus': ['菜单名称', '路由标识', '父级菜单'],
  'system-departments': ['部门名称', '部门编码', '上级部门'],
  'system-posts': ['岗位名称', '岗位编码', '所属部门'],
  'system-dicts': ['字典名称', '字典类型', '业务域'],
  'system-params': ['参数名称', '参数键名', '参数值'],
  'system-clients': ['客户端名称', '客户端 ID', '授权类型'],
  'system-projects': ['项目名称', '项目编码', '负责人']
}

const labels = computed(() => labelMap[baseRouteName.value] || ['名称', '标识', '归属'])
const nameLabel = computed(() => labels.value[0])
const codeLabel = computed(() => labels.value[1])
const ownerLabel = computed(() => labels.value[2])

const formData = reactive({
  name: '',
  code: '',
  password: '',
  owner: '',
  ownerUserId: null,
  parentId: null,
  departmentCode: null,
  positionCode: null,
  roleCodes: [],
  permissionIds: [],
  menuIds: [],
  boundUserIds: [],
  boundRoleIds: [],
  boundDepartmentIds: [],
  phone: '',
  email: '',
  status: 'enabled',
  remark: ''
})

const usernameDuplicate = ref(false)
const existingUsernames = ref([])

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  formData.password = Array.from(arr, (b) => chars[b % chars.length]).join('')
}

const checkUsernameDuplicate = async () => {
  if (!formData.code) {
    usernameDuplicate.value = false
    return
  }
  try {
    const res = await managementResources['system-users'].list({ keyword: formData.code })
    const users = Array.isArray(res) ? res : (res?.rows || res?.list || [])
    existingUsernames.value = users.map((u) => u.username || u.code || '')
    usernameDuplicate.value = existingUsernames.value.some(
      (u) => u.toLowerCase() === formData.code.trim().toLowerCase()
    )
  } catch {
    usernameDuplicate.value = false
  }
}

const resetOptions = () => {
  departmentOptions.value = []
  departmentTreeOptions.value = []
  roleOptions.value = []
  positionOptions.value = []
  permissionTreeOptions.value = []
  permissionLeafValues.value = new Set()
  menuOptions.value = []
  menuTreeOptions.value = []
  userOptions.value = []
}

const resetForm = () => {
  formData.name = ''
  formData.code = ''
  formData.password = ''
  formData.owner = ''
  formData.ownerUserId = null
  formData.parentId = null
  formData.departmentCode = null
  formData.positionCode = null
  formData.roleCodes = []
  formData.permissionIds = []
  formData.menuIds = []
  formData.boundUserIds = []
  formData.boundRoleIds = []
  formData.boundDepartmentIds = []
  formData.phone = ''
  formData.email = ''
  formData.status = 'enabled'
  formData.remark = ''
  usernameDuplicate.value = false
}

const buildPayload = () => {
  if (baseRouteName.value === 'system-users') {
    return {
      username: formData.code,
      password: formData.password,
      displayName: formData.name,
      departmentCode: formData.departmentCode,
      positionCode: formData.positionCode,
      phone: formData.phone,
      email: formData.email,
      status: formData.status,
      roleCodes: formData.roleCodes
    }
  }

  if (baseRouteName.value === 'system-roles') {
    const menuIds = expandMenuIdsToLeafIds(formData.menuIds)
    return {
      name: formData.name,
      code: formData.code,
      description: formData.remark || formData.owner,
      permissionIds: normalizePermissionIds(formData.permissionIds),
      menuIds,
      menuPermissions: menuIds
    }
  }

  if (baseRouteName.value === 'system-menus') {
    return {
      parentId: formData.parentId,
      name: formData.name,
      path: formData.code,
      icon: formData.remark || '',
      sortOrder: 0
    }
  }

  if (baseRouteName.value === 'system-departments') {
    return {
      parentId: formData.parentId,
      name: formData.name,
      code: formData.code,
      leader: formData.remark,
      phone: '',
      email: '',
      status: formData.status,
      sortOrder: 0
    }
  }

  if (baseRouteName.value === 'system-posts') {
    return {
      departmentCode: formData.departmentCode,
      name: formData.name,
      code: formData.code,
      description: formData.remark || formData.owner,
      status: formData.status,
      sortOrder: 0
    }
  }

  if (baseRouteName.value === 'system-projects') {
    const boundUserIds = formData.ownerUserId && !formData.boundUserIds.includes(formData.ownerUserId)
      ? [formData.ownerUserId, ...formData.boundUserIds]
      : formData.boundUserIds
    return {
      name: formData.name,
      ownerUser: formData.ownerUserId,
      projectOwner: formData.ownerUserId,
      owner: formData.ownerUserId,
      ownerUserId: formData.ownerUserId,
      status: formData.status,
      description: formData.remark,
      remark: formData.remark,
      bindUsers: boundUserIds,
      boundUserIds,
      bindRoles: formData.boundRoleIds,
      boundRoleIds: formData.boundRoleIds,
      bindDepartment: formData.boundDepartmentIds,
      boundDepartmentIds: formData.boundDepartmentIds
    }
  }

  return null
}

const handleSubmit = async () => {
  if (!formData.name || (baseRouteName.value !== 'system-projects' && !formData.code)) {
    MessagePlugin.warning(baseRouteName.value === 'system-projects'
      ? `请填写${nameLabel.value}`
      : `请填写${nameLabel.value}和${codeLabel.value}`)
    return
  }

  if (baseRouteName.value === 'system-projects') {
    if (!formData.ownerUserId) {
      MessagePlugin.warning('请选择负责人')
      return
    }
  }

  if (baseRouteName.value === 'system-users') {
    if (usernameDuplicate.value) {
      MessagePlugin.warning('登录账号已存在，请更换')
      return
    }
    if (!formData.password) {
      MessagePlugin.warning('请输入密码')
      return
    }
    if (!formData.departmentCode) {
      MessagePlugin.warning('请选择所属部门')
      return
    }
    if (!formData.positionCode) {
      MessagePlugin.warning('请选择岗位')
      return
    }
    if (!formData.roleCodes || formData.roleCodes.length === 0) {
      MessagePlugin.warning('请选择角色')
      return
    }
    if (!formData.phone) {
      MessagePlugin.warning('请输入手机号')
      return
    }
    if (!formData.email) {
      MessagePlugin.warning('请输入邮箱')
      return
    }
  }

  const api = resourceApi.value
  const payload = buildPayload()
  if (!api?.create || !payload) {
    MessagePlugin.warning('当前模块暂未提供新建接口')
    return
  }

  saving.value = true
  try {
    await api.create(payload)
    MessagePlugin.success('保存成功')
    router.push({ name: baseRouteName.value })
  } catch (e) {
    MessagePlugin.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const flattenTreeOptions = (items, labelKey = 'name', valueKey = 'id') => {
  const result = []
  const walk = (list, depth = 0) => {
    list.forEach((item) => {
      result.push({
        value: item[valueKey] || item.id,
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

const toCascaderOptions = (items, labelKey = 'name', valueKey = 'id') => {
  return (Array.isArray(items) ? items : []).map((item) => {
    const option = {
      value: item.path || item[valueKey] || item.id,
      label: item[labelKey] || item.name || item.code,
      id: item.id,
      path: item.path,
      code: item.code,
      name: item.name
    }
    if (Array.isArray(item.children) && item.children.length) {
      option.children = toCascaderOptions(item.children, labelKey, valueKey)
    }
    return option
  })
}

const toOptions = (items, labelGetter, valueKey = 'id') => {
  return (Array.isArray(items) ? items : []).map((item) => ({
    value: item[valueKey] || item.id || item.code,
    label: labelGetter(item)
  }))
}

const toPermissionTreeOptions = (items) => {
  const groups = new Map()
  const leaves = new Set()

  ;(Array.isArray(items) ? items : []).forEach((item) => {
    const code = String(item.code || item.value || item.id || '').trim()
    if (!code) return

    const prefix = code.includes(':') ? code.split(':')[0] : 'other'
    if (!groups.has(prefix)) {
      groups.set(prefix, {
        label: item.name || prefix,
        children: []
      })
    }

    leaves.add(code)
    groups.get(prefix).children.push({
      value: code,
      label: `${item.name || code}（${code}）`
    })
  })

  permissionLeafValues.value = leaves

  return Array.from(groups.entries()).map(([prefix, group]) => ({
    value: `__permission_group__:${prefix}`,
    label: group.label,
    children: group.children
  }))
}

const normalizePermissionIds = (values) => {
  return (Array.isArray(values) ? values : [])
    .filter((value) => permissionLeafValues.value.has(String(value)))
}

const expandMenuIdsToLeafIds = (values, options = menuTreeOptions.value) => {
  const result = []
  const selected = new Set()
  ;(Array.isArray(values) ? values : []).forEach((value) => {
    if (value && typeof value === 'object') {
      ;[value.value, value.id, value.path, value.code, value.name, value.label].forEach((item) => {
        if (item !== undefined && item !== null && String(item).trim() !== '') selected.add(String(item))
      })
      return
    }
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      selected.add(String(value))
    }
  })

  const walk = (items, selectedAncestor = false) => {
    items.forEach((item) => {
      const isSelected = [item.value, item.id, item.path, item.code, item.name, item.label]
        .some((key) => key !== undefined && key !== null && selected.has(String(key)))
      const shouldInclude = selectedAncestor || isSelected
      if (Array.isArray(item.children) && item.children.length) {
        walk(item.children, shouldInclude)
      } else if (shouldInclude && !result.includes(item.value)) {
        result.push(item.value)
      }
    })
  }

  walk(options)
  return result
}

const fetchCreateOptions = async () => {
  const routeName = baseRouteName.value
  const loaders = []

  if (['system-users', 'system-departments', 'system-posts'].includes(routeName)) {
    const deptValueKey = ['system-users', 'system-posts'].includes(routeName) ? 'code' : 'id'
    loaders.push(
      managementResources['system-departments'].list().then((data) => {
        departmentOptions.value = flattenTreeOptions(data, 'name', deptValueKey)
        departmentTreeOptions.value = toCascaderOptions(data, 'name', deptValueKey)
      })
    )
  }

  if (routeName === 'system-users') {
    loaders.push(
      managementResources['system-roles'].list().then((data) => {
        roleOptions.value = toOptions(data, (item) => `${item.name}（${item.code}）`, 'code')
      }),
      managementResources['system-posts'].list().then((data) => {
        positionOptions.value = toOptions(data, (item) => `${item.name}（${item.code}）`, 'code')
      })
    )
  }

  if (routeName === 'system-roles') {
    loaders.push(
      managementResources['system-permissions'].list().then((data) => {
        permissionTreeOptions.value = toPermissionTreeOptions(data)
      }),
      managementResources['system-menus'].list().then((data) => {
        menuOptions.value = flattenTreeOptions(data)
        menuTreeOptions.value = toCascaderOptions(data)
      })
    )
  }

  if (routeName === 'system-menus') {
    loaders.push(
      managementResources['system-menus'].list().then((data) => {
        menuOptions.value = flattenTreeOptions(data)
        menuTreeOptions.value = toCascaderOptions(data)
      })
    )
  }

  if (routeName === 'system-projects') {
    loaders.push(
      managementResources['system-users'].list().then((data) => {
        const users = Array.isArray(data) ? data : (data?.rows || data?.list || [])
        userOptions.value = users.map((u) => ({
          value: routeName === 'system-projects' ? u.username : u.id,
          label: `${u.displayName || u.username}（${u.username || u.code || ''}）`
        }))
      }),
      managementResources['system-roles'].list().then((data) => {
        roleOptions.value = toOptions(data, (item) => `${item.name}（${item.code}）`)
      }),
      managementResources['system-departments'].list().then((data) => {
        departmentOptions.value = flattenTreeOptions(data)
        departmentTreeOptions.value = toCascaderOptions(data)
      })
    )
  }

  if (!loaders.length) return

  optionsLoading.value = true
  try {
    await Promise.all(loaders)
  } catch (e) {
    MessagePlugin.error(e.message || '加载选项失败')
  } finally {
    optionsLoading.value = false
  }
}

watch(baseRouteName, () => {
  resetForm()
  resetOptions()
  fetchCreateOptions()
})

watch(
  () => formData.ownerUserId,
  (ownerUserId) => {
    if (baseRouteName.value !== 'system-projects' || !ownerUserId) return
    if (!formData.boundUserIds.includes(ownerUserId)) {
      formData.boundUserIds = [ownerUserId, ...formData.boundUserIds]
    }
  }
)

onMounted(() => {
  fetchCreateOptions()
})
</script>
