<template>
  <div>
    <starter-list-page
      v-model:keyword="keyword"
      title="应用图标列表"
      primary-action="新建"
      search-placeholder="搜索应用、Bundle ID 或生成平台"
      :breadcrumb="['应用图标管理', '应用图标列表']"
      :columns="columns"
      :data="filteredRows"
      :selected-row-keys="selectedRowKeys"
      @primary="openCreateDialog"
      @select-change="handleSelectChange"
    >
      <template #actions>
        <span class="starter-list-summary">已选 {{ selectedRowKeys.length }} 项</span>
      </template>

      <template #filters>
        <t-select v-model="platformFilter" class="starter-list-filter-select" placeholder="生成平台">
          <t-option value="all" label="全部平台" />
          <t-option v-for="platform in appIconPlatformOptions" :key="platform.value" :value="platform.value" :label="platform.label" />
        </t-select>
        <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="状态">
          <t-option value="all" label="全部状态" />
          <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
        </t-select>
        <t-select v-model="sourceTypeFilter" class="starter-list-filter-select" placeholder="图标类型">
          <t-option value="all" label="全部类型" />
          <t-option value="text" label="文字图标" />
          <t-option value="image" label="上传图片图标" />
        </t-select>
      </template>

      <template #name="{ row }">
        <span class="app-icon-name-cell">
          <span class="app-icon-preview" :style="getPreviewStyle(row)">
            <img v-if="isImageIcon(row)" :src="row.sourcePreview" :alt="row.appName" />
            <span v-else>{{ row.iconText || 'A' }}</span>
          </span>
          <span class="app-icon-name-main">
            <span class="document-name">{{ row.name }}</span>
            <small>{{ row.bundleId }}</small>
          </span>
        </span>
      </template>

      <template #platforms="{ row }">
        <t-space size="small" :break-line="true">
          <t-tag v-for="platform in getPlatformLabels(row.platforms)" :key="platform" variant="light">
            {{ platform }}
          </t-tag>
        </t-space>
      </template>

      <template #sourceType="{ row }">
        {{ row.sourceType === 'image' ? '上传图片图标' : '文字图标' }}
      </template>

      <template #status="{ row }">
        <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
      </template>

      <template #operation="{ row }">
        <t-space size="small">
          <t-button theme="primary" variant="text" @click="goToGenerate(row)">生成</t-button>
          <t-button theme="danger" variant="text" @click="removeIcon(row)">删除</t-button>
        </t-space>
      </template>
    </starter-list-page>

    <div v-if="createDialogVisible" class="icon-dialog-mask" @click.self="closeCreateDialog">
      <div class="icon-dialog app-icon-dialog">
        <h3>新建应用图标</h3>
        <label class="icon-field">
          <span>应用名称</span>
          <input v-model="form.appName" type="text" placeholder="例如：商城 App" @keydown.enter="saveIcon" />
        </label>
        <label class="icon-field">
          <span>Bundle ID / 包名</span>
          <input v-model="form.bundleId" type="text" placeholder="com.example.app" @keydown.enter="saveIcon" />
        </label>
        <label class="icon-field">
          <span>版本号</span>
          <input v-model="form.version" type="text" placeholder="V1.0.0" @keydown.enter="saveIcon" />
        </label>
        <label class="icon-field">
          <span>源图规格</span>
          <select v-model="form.sourceSize">
            <option value="1024 x 1024">1024 x 1024</option>
            <option value="512 x 512">512 x 512</option>
            <option value="2048 x 2048">2048 x 2048</option>
          </select>
        </label>
        <div class="app-icon-radio-row app-icon-source-type-row">
          <span>图标类型</span>
          <label><input v-model="form.sourceType" type="radio" value="text" />文字图标</label>
          <label><input v-model="form.sourceType" type="radio" value="image" />上传图片图标</label>
        </div>
        <div v-if="form.sourceType === 'text'" class="app-icon-text-editor">
          <span class="app-icon-source-preview" :style="textPreviewStyle">
            {{ form.iconText || 'A' }}
          </span>
          <div class="app-icon-text-fields">
            <label class="icon-field">
              <span>图标文字</span>
              <input v-model="form.iconText" type="text" maxlength="4" placeholder="A" />
            </label>
            <label class="icon-color-field">
              <span>渐变颜色</span>
              <input v-model="form.gradientStart" type="color" />
              <input v-model="form.gradientEnd" type="color" />
            </label>
            <div class="app-icon-form-row is-gradient">
              <label class="icon-field">
                <span>渐变方式</span>
                <select v-model="form.gradientMode">
                  <option
                    v-for="mode in gradientModeOptions"
                    :key="mode.value"
                    :value="mode.value"
                  >
                    {{ mode.label }}
                  </option>
                </select>
              </label>
              <label v-if="form.gradientMode === 'linear'" class="icon-field">
                <span>渐变方向</span>
                <select v-model="form.gradientDirection">
                  <option
                    v-for="direction in gradientDirectionOptions"
                    :key="direction.value"
                    :value="direction.value"
                  >
                    {{ direction.label }}
                  </option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <label v-else class="app-icon-source-upload">
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" @change="handleSourceUpload" />
          <span class="app-icon-source-preview">
            <img v-if="form.sourcePreview" :src="form.sourcePreview" alt="源图标预览" />
            <image-add-icon v-else />
          </span>
          <span class="app-icon-source-main">
            <strong>{{ form.sourceFileName || '上传源图标' }}</strong>
            <small>建议使用 1024 x 1024 PNG，支持 JPG、WebP、SVG</small>
          </span>
        </label>
        <div class="app-icon-platform-picker">
          <span>生成平台</span>
          <t-select
            v-model="form.platforms"
            class="app-icon-platform-select"
            multiple
            filterable
            clearable
            :min-collapsed-num="3"
            placeholder="搜索并选择生成平台"
          >
            <t-option
              v-for="platform in appIconPlatformOptions"
              :key="platform.value"
              :value="platform.value"
              :label="`${platform.label} · ${platform.folder}`"
            />
          </t-select>
        </div>
        <div class="icon-dialog-actions">
          <button class="icon-secondary-button" type="button" @click="closeCreateDialog">取消</button>
          <button class="document-primary-button" type="button" @click="saveIcon">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ImageAddIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import {
  appIconPlatformOptions,
  buildGradient,
  createAppIcon,
  deleteAppIcon,
  gradientDirectionOptions,
  gradientModeOptions,
  readAppIcons
} from '../../config/appIcons'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const platformFilter = ref('all')
const statusFilter = ref('all')
const sourceTypeFilter = ref('all')
const rows = ref(readAppIcons())
const selectedRowKeys = ref(rows.value.filter((item) => item.checked).map((item) => item.id))
const createDialogVisible = ref(false)
const form = reactive({
  appName: '',
  bundleId: '',
  version: 'V1.0.0',
  sourceSize: '1024 x 1024',
  platforms: ['ios', 'android'],
  sourceFileName: '',
  sourcePreview: '',
  sourceType: 'text',
  iconText: 'A',
  gradientStart: '#0052d9',
  gradientEnd: '#35c2ff',
  gradientDirection: '135deg',
  gradientMode: 'linear'
})

const platformLabelMap = appIconPlatformOptions.reduce((acc, platform) => {
  acc[platform.value] = platform.label
  return acc
}, {})

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 48 },
  { colKey: 'name', title: '应用图标', minWidth: 280 },
  { colKey: 'platforms', title: '生成平台', minWidth: 220 },
  { colKey: 'sourceSize', title: '源图规格', width: 130 },
  { colKey: 'sourceType', title: '图标类型', width: 140 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const statusOptions = computed(() => [...new Set(rows.value.map((item) => item.status).filter(Boolean))])

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.value.filter((item) => {
    const platformText = getPlatformLabels(item.platforms).join(' ')
    const matchKeyword = !q || `${item.name} ${item.appName} ${item.bundleId} ${platformText} ${item.version}`.toLowerCase().includes(q)
    const matchPlatform = platformFilter.value === 'all' || (item.platforms || []).includes(platformFilter.value)
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    const matchSourceType = sourceTypeFilter.value === 'all' || (item.sourceType || 'text') === sourceTypeFilter.value
    return matchKeyword && matchPlatform && matchStatus && matchSourceType
  })
})

watch(
  () => route.name,
  (name) => {
    createDialogVisible.value = name === 'app-icon-create'
  },
  { immediate: true }
)

const getPlatformLabels = (platforms) => {
  return (platforms || []).map((platform) => platformLabelMap[platform] || platform)
}

const getStatusTheme = (tone) => {
  const themeMap = {
    success: 'success',
    active: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}

const handleSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

const getPreviewStyle = (item) => {
  const [start = '#0052d9', end = '#35c2ff'] = item.colors || [item.gradientStart, item.gradientEnd]
  return {
    background: buildGradient({
      start: item.gradientStart || start,
      end: item.gradientEnd || end,
      direction: item.gradientDirection,
      mode: item.gradientMode
    })
  }
}

const isImageIcon = (item) => item.sourceType === 'image' && item.sourcePreview

const textPreviewStyle = computed(() => ({
  background: buildGradient({
    start: form.gradientStart,
    end: form.gradientEnd,
    direction: form.gradientDirection,
    mode: form.gradientMode
  })
}))

const resetForm = () => {
  form.appName = ''
  form.bundleId = ''
  form.version = 'V1.0.0'
  form.sourceSize = '1024 x 1024'
  form.platforms = ['ios', 'android']
  form.sourceFileName = ''
  form.sourcePreview = ''
  form.sourceType = 'text'
  form.iconText = 'A'
  form.gradientStart = '#0052d9'
  form.gradientEnd = '#35c2ff'
  form.gradientDirection = '135deg'
  form.gradientMode = 'linear'
}

const openCreateDialog = () => {
  router.push({ name: 'app-icon-create' })
}

const closeCreateDialog = () => {
  createDialogVisible.value = false
  resetForm()
  if (route.name === 'app-icon-create') {
    router.push({ name: 'app-icon-list' })
  }
}

const saveIcon = () => {
  if (!form.appName.trim()) {
    MessagePlugin.warning('请输入应用名称')
    return
  }

  if (!form.bundleId.trim()) {
    MessagePlugin.warning('请输入 Bundle ID 或包名')
    return
  }

  if (!form.platforms.length) {
    MessagePlugin.warning('请至少选择一个生成平台')
    return
  }

  if (form.sourceType === 'text' && !form.iconText.trim()) {
    MessagePlugin.warning('请输入图标文字')
    return
  }

  if (form.sourceType === 'image' && !form.sourcePreview) {
    MessagePlugin.warning('请上传源图标')
    return
  }

  const icon = createAppIcon(form)
  rows.value = readAppIcons()
  closeCreateDialog()
  MessagePlugin.success('应用图标已创建')
  router.push({ name: 'app-icon-generate', params: { id: icon.id } })
}

const goToGenerate = (item) => {
  router.push({ name: 'app-icon-generate', params: { id: item.id } })
}

const removeIcon = (item) => {
  const deleted = deleteAppIcon(item.id)
  rows.value = readAppIcons()
  selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== item.id)
  MessagePlugin.success(deleted ? '应用图标已删除' : '应用图标不存在或已删除')
}

const handleSourceUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  form.sourceFileName = file.name
  const image = new Image()
  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    form.sourcePreview = result
    image.onload = () => {
      if (image.naturalWidth && image.naturalHeight) {
        form.sourceSize = `${image.naturalWidth} x ${image.naturalHeight}`
      }
    }
    image.src = result
  }
  reader.readAsDataURL(file)
}
</script>
