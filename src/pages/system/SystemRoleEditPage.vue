<template>
  <div class="system-create-page system-form-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>编辑角色</h3>
        <p>维护角色信息，并配置角色与权限、菜单的绑定关系。</p>
      </div>
      <t-button variant="outline" @click="router.back()">返回</t-button>
    </section>

    <t-card class="system-form-card" :bordered="false">
      <template #title>
        <div class="system-form-card-title">
          <span>基础信息</span>
          <t-tag theme="primary" variant="light">编辑角色</t-tag>
        </div>
      </template>

      <t-form class="system-create-form system-base-form" :data="formData" label-align="right" label-width="120px">
        <div class="system-form-section">
          <div class="system-form-section-title">基本配置</div>
          <div class="system-create-grid">
            <t-form-item label="角色名称">
              <t-input v-model="formData.name" :disabled="isDisabled" placeholder="请输入角色名称" />
            </t-form-item>
            <t-form-item label="角色标识">
              <t-input v-model="formData.code" :disabled="isDisabled" placeholder="请输入角色标识" />
            </t-form-item>
            <t-form-item label="权限范围">
              <t-tree-select
                v-model="formData.permissionIds"
                :disabled="isDisabled"
                :data="permissionTreeOptions"
                :loading="optionsLoading"
                :tree-props="permissionTreeProps"
                multiple
                filterable
                clearable
                placeholder="请选择权限"
              />
            </t-form-item>
            <t-form-item label="状态">
              <t-select v-model="formData.status" :disabled="isDisabled">
                <t-option value="active" label="启用" />
                <t-option value="inactive" label="停用" />
              </t-select>
            </t-form-item>
          </div>
        </div>

        <div class="system-form-section">
          <div class="system-form-section-title">权限配置</div>
          <div class="system-create-grid">
            <t-form-item label="菜单权限">
              <t-cascader
                v-model="formData.menuIds"
                :disabled="isDisabled"
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

        <div class="system-form-section">
          <div class="system-form-section-title">补充说明</div>
          <t-form-item label="备注">
            <t-textarea v-model="formData.description" :disabled="isDisabled" :autosize="{ minRows: 4, maxRows: 6 }" placeholder="请输入备注" />
          </t-form-item>
        </div>

        <div v-if="!isDisabled" class="system-create-actions system-form-actions">
          <t-button theme="primary" :loading="saving" @click="handleSubmit">保存</t-button>
          <t-button variant="outline" @click="router.back()">取消</t-button>
        </div>
      </t-form>
    </t-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
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
import { managementResources } from '../../api/management'

const route = useRoute()
const router = useRouter()

const roleId = ref(route.params.id)
const saving = ref(false)
const optionsLoading = ref(false)
const permissionTreeOptions = ref([])
const permissionLeafValues = ref(new Set())
const menuTreeOptions = ref([])
const permissionTreeProps = {
  valueMode: 'onlyLeaf',
  expandAll: true
}

const isDisabled = computed(() => {
  const code = String(formData.code || '').toLowerCase()
  const name = String(formData.name || '').toLowerCase()
  return ['super_admin', 'super-admin', 'superadmin', 'admin', 'administrator', 'root'].includes(code) ||
    name.includes('超级管理员') || name.includes('super admin')
})

const formData = reactive({
  name: '',
  code: '',
  permissionIds: [],
  menuIds: [],
  status: 'active',
  description: ''
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
      value: item.path || item.id,
      label: item[labelKey] || item.name || item.code,
      id: item.id,
      path: item.path,
      code: item.code,
      name: item.name,
      parentValue: item.parentId || item.parentPath || null
    }
    if (Array.isArray(item.children) && item.children.length) {
      option.children = toCascaderOptions(item.children, labelKey)
    }
  return option
  })
}

const toIdentifierList = (...values) => {
  const source = values.find((value) => Array.isArray(value) && value.length) || []
  return source
    .map((item) => {
      if (item && typeof item === 'object') {
        return item.id || item.code || item.value
      }
      return item
    })
    .filter((item) => item !== undefined && item !== null && String(item).trim() !== '')
}

const toPermissionIdentifierList = (...values) => {
  const source = values.find((value) => Array.isArray(value) && value.length) || []
  return source
    .map((item) => {
      if (item && typeof item === 'object') {
        return item.code || item.value || item.id
      }
      return item
    })
    .filter((item) => item !== undefined && item !== null && String(item).trim() !== '')
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

const collectLeafIds = (options, prefixIds) => {
  const result = []
  const walk = (items) => {
    items.forEach((item) => {
      if (!item.children || item.children.length === 0) {
        const isMatch = prefixIds.some((prefix) => {
          const val = String(item.value)
          const pre = String(prefix)
          return val === pre || val.startsWith(pre + '/') || val.startsWith(pre + '-')
        })
        if (isMatch) result.push(item.value)
      } else {
        walk(item.children)
      }
    })
  }
  walk(options)
  return result
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

const fetchRole = async () => {
  try {
    const data = await managementResources['system-roles'].get(roleId.value)
    formData.name = data.name || ''
    formData.code = data.code || ''
    formData.permissionIds = normalizePermissionIds(toPermissionIdentifierList(data.permissionScope, data.permissionIds))
    const rawMenuIds = toIdentifierList(data.menuPermissions, data.menuIds)
    formData.menuIds = menuTreeOptions.value.length ? collectLeafIds(menuTreeOptions.value, rawMenuIds) : rawMenuIds
    formData.status = data.status || 'active'
    formData.description = data.description || data.remark || ''
  } catch (e) {
    MessagePlugin.error(e.message || '加载角色信息失败')
  }
}

const fetchOptions = async () => {
  optionsLoading.value = true
  try {
    await Promise.all([
      managementResources['system-permissions'].list().then((data) => {
        permissionTreeOptions.value = toPermissionTreeOptions(data)
      }),
      managementResources['system-menus'].list().then((data) => {
        menuTreeOptions.value = toCascaderOptions(data)
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
    MessagePlugin.warning('请填写角色名称和角色标识')
    return
  }

  saving.value = true
  try {
    const payload = {
      name: formData.name,
      code: formData.code,
      permissionScope: normalizePermissionIds(formData.permissionIds),
      permissionIds: normalizePermissionIds(formData.permissionIds),
      menuPermissions: expandMenuIdsToLeafIds(formData.menuIds),
      menuIds: expandMenuIdsToLeafIds(formData.menuIds),
      status: formData.status,
      description: formData.description
    }
    await managementResources['system-roles'].update(roleId.value, payload)
    MessagePlugin.success('保存成功')
    router.push({ name: 'system-roles' })
  } catch (e) {
    MessagePlugin.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchOptions()
  await fetchRole()
})
</script>
