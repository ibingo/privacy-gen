<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="标签管理"
    :show-breadcrumb="false"
    :total-text="`共 ${total} 项`"
    primary-action="新建标签"
    :columns="columns"
    :data="rows"
    :loading="loading"
    :pagination="{ current: page, pageSize, total }"
    :page-size="pageSize"
    :page-size-options="[10, 20, 50]"
    @primary="openTagDialog()"
    @search="handleSearch"
    @page-change="handlePageChange"
  >
    <template #name="{ row }">
      <div class="i18n-tag-name-cell">
        <t-tag theme="primary" variant="light">{{ row.name }}</t-tag>
        <span v-if="row.alias">{{ row.alias }}</span>
      </div>
    </template>
    <template #platforms="{ row }">
      <div class="i18n-tag-platforms">
        <t-tag v-for="platform in row.platforms" :key="platform" size="small" variant="light">{{ platform }}</t-tag>
        <span v-if="!row.platforms.length">全部平台</span>
      </div>
    </template>
    <template #status="{ row }">
      <t-tag :theme="row.enabled ? 'success' : 'default'" variant="light">
        {{ row.enabled ? '启用' : '停用' }}
      </t-tag>
    </template>
    <template #operation="{ row }">
      <t-space size="small">
        <t-button theme="primary" variant="text" @click.stop="openTagDialog(row)">编辑</t-button>
        <t-button theme="danger" variant="text" @click.stop="handleDelete(row)">删除</t-button>
      </t-space>
    </template>
  </starter-list-page>

  <t-dialog
    v-model:visible="dialogVisible"
    :header="editingTagId ? '编辑标签' : '新建标签'"
    width="520px"
    :confirm-btn="editingTagId ? '更新' : '创建'"
    cancel-btn="取消"
    @confirm="saveTag"
    @cancel="closeTagDialog"
    @close="closeTagDialog"
  >
    <t-form :data="form" label-align="top">
      <t-form-item label="标签名称" required-mark>
        <t-input v-model="form.name" clearable placeholder="请输入标签名称，如 privacy" />
      </t-form-item>
      <t-form-item label="展示别名">
        <t-input v-model="form.alias" clearable placeholder="请输入中文别名，如 隐私政策" />
      </t-form-item>
      <t-form-item label="适用平台">
        <t-select v-model="form.platforms" multiple clearable placeholder="不选表示全部平台">
          <t-option v-for="platform in platformOptions" :key="platform.value" :value="platform.value" :label="platform.label" />
        </t-select>
      </t-form-item>
      <t-form-item label="描述">
        <t-textarea v-model="form.description" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="用于说明标签适用场景" />
      </t-form-item>
      <t-form-item label="状态">
        <t-select v-model="form.enabled">
          <t-option :value="true" label="启用" />
          <t-option :value="false" label="停用" />
        </t-select>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Button as TButton,
  Dialog as TDialog,
  DialogPlugin,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import { createI18nWordTagApi, deleteI18nWordTagApi, listI18nWordTagsApi, updateI18nWordTagApi } from '../../api/i18nWords'

const route = useRoute()
const keyword = ref('')
const rows = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const dialogVisible = ref(false)
const editingTagId = ref('')
const form = ref(createEmptyForm())

const platformOptions = [
  { value: 'APP', label: 'APP' },
  { value: 'Android', label: 'Android' },
  { value: 'iOS', label: 'iOS' },
  { value: 'Web', label: 'Web' },
  { value: 'MiniApp', label: 'MiniApp' }
]

const columns = [
  { colKey: 'name', title: '标签', minWidth: 180 },
  { colKey: 'description', title: '描述', minWidth: 260 },
  { colKey: 'wordCount', title: '关联文案数', width: 120 },
  { colKey: 'platforms', title: '适用平台', width: 180 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

let keywordTimer = 0

watch(keyword, () => {
  window.clearTimeout(keywordTimer)
  keywordTimer = window.setTimeout(() => {
    handleSearch()
  }, 300)
})

watch(
  () => route.params.projectId,
  () => {
    page.value = 1
    fetchRows()
  }
)

onMounted(() => {
  fetchRows()
})

function createEmptyForm () {
  return {
    name: '',
    alias: '',
    platforms: [],
    description: '',
    enabled: true
  }
}

async function fetchRows () {
  loading.value = true
  try {
    const data = await listI18nWordTagsApi({
      projectId: route.params.projectId,
      keyword: keyword.value.trim(),
      page: page.value,
      pageSize: pageSize.value
    })
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    const normalizedRows = items.map(normalizeTagRow)
    rows.value = normalizedRows
    total.value = Number(data?.total ?? normalizedRows.length)
    page.value = Number(data?.page || page.value)
    pageSize.value = Number(data?.pageSize || pageSize.value)
  } catch (error) {
    rows.value = []
    total.value = 0
    MessagePlugin.error(error.message || '标签列表加载失败')
  } finally {
    loading.value = false
  }
}

function normalizeTagRow (item = {}) {
  return {
    ...item,
    id: item.tagId || item.id || item.name,
    name: item.name || item.tag || '',
    alias: item.alias || item.displayName || '',
    description: item.description || '-',
    platforms: normalizeArray(item.platforms || item.platform),
    wordCount: Number(item.wordCount || item.count || 0),
    enabled: item.enabled ?? item.status !== 'disabled',
    updatedAt: formatDateTime(item.updatedAt || item.updateTime || item.modifiedAt)
  }
}

function normalizeArray (value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  return String(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean)
}

function formatDateTime (value) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
}

function handleSearch () {
  page.value = 1
  fetchRows()
}

function handlePageChange ({ page: nextPage, pageSize: nextPageSize }) {
  page.value = nextPage
  pageSize.value = nextPageSize
  fetchRows()
}

function openTagDialog (row) {
  editingTagId.value = row?.id || ''
  form.value = row
    ? {
        name: row.name,
        alias: row.alias || '',
        platforms: [...(row.platforms || [])],
        description: row.description === '-' ? '' : row.description,
        enabled: row.enabled
      }
    : createEmptyForm()
  dialogVisible.value = true
}

function closeTagDialog () {
  dialogVisible.value = false
  editingTagId.value = ''
}

async function saveTag () {
  const name = form.value.name.trim()
  if (!name) {
    MessagePlugin.warning('请输入标签名称')
    return
  }

  const payload = {
    projectId: route.params.projectId,
    name,
    alias: form.value.alias.trim(),
    platforms: [...form.value.platforms],
    description: form.value.description.trim(),
    enabled: form.value.enabled
  }

  try {
    if (editingTagId.value) {
      await updateI18nWordTagApi(editingTagId.value, payload)
      MessagePlugin.success('标签已更新')
    } else {
      await createI18nWordTagApi(payload)
      page.value = 1
      MessagePlugin.success('标签已创建')
    }
    closeTagDialog()
    await fetchRows()
  } catch (error) {
    MessagePlugin.error(error.message || '保存失败')
  }
}

function handleDelete (row) {
  const confirmDialog = DialogPlugin.confirm({
    header: '删除标签',
    body: `确认删除标签 ${row.name}？已关联文案的标签可能无法删除。`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteI18nWordTagApi(row.id, { projectId: route.params.projectId })
        await fetchRows()
        MessagePlugin.success('标签已删除')
        confirmDialog.hide()
      } catch (error) {
        MessagePlugin.error(error.message || '删除失败')
      }
    }
  })
}
</script>
