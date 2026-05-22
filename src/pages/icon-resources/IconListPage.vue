<template>
  <div class="icon-resource-page" @click="closeCardMenu">
    <div class="icon-resource-toolbar">
      <div class="icon-resource-actions">
        <button class="icon-secondary-button" type="button" @click="goBackProjects">
          <folder-open-icon />
          {{ activeProject.name }}
        </button>
        <button class="document-primary-button" type="button" @click="createIcon">
          新建图标
        </button>
        <label class="icon-secondary-button">
          <logo-figma-icon />
          导入 Figma/SVG
          <input type="file" accept=".fig,.json,.svg" @change="handleImport" />
        </label>
        <label class="icon-secondary-button">
          <folder-open-icon />
          导入 SVG 文件夹
          <input type="file" accept=".svg" webkitdirectory directory multiple @change="handleFolderImport" />
        </label>
        <span class="document-selection-text">{{ filteredIcons.length }} 个图标</span>
      </div>

      <label class="document-search">
        <search-icon />
        <input v-model="keyword" type="search" placeholder="搜索图标名称、分组或 Figma Frame" />
      </label>
    </div>

    <div class="icon-resource-shell">
      <aside class="icon-category-nav">
        <div class="icon-editor-tabs">
          <button
            type="button"
            :class="{ 'is-active': activeIconType === 'all' }"
            @click="activeIconType = 'all'"
          >
            全部
          </button>
          <button
            type="button"
            :class="{ 'is-active': activeIconType === 'stroke' }"
            @click="activeIconType = 'stroke'"
          >
            描边
          </button>
          <button
            type="button"
            :class="{ 'is-active': activeIconType === 'fill' }"
            @click="activeIconType = 'fill'"
          >
            填充
          </button>
        </div>
        <button
          class="icon-category-button"
          :class="{ 'is-active': activeCategory === 'all' }"
          type="button"
          @click="activeCategory = 'all'"
        >
          全部
        </button>
        <button
          class="icon-category-button"
          :class="{ 'is-active': activeCategory === 'uncategorized' }"
          type="button"
          @click="activeCategory = 'uncategorized'"
        >
          未分类
        </button>
        <div
          v-for="category in iconCategories"
          :key="category.value"
          class="icon-category-row"
          :class="{ 'is-active': activeCategory === category.value }"
        >
          <button type="button" @click="activeCategory = category.value">
            {{ category.label }}
          </button>
          <button type="button" title="编辑分类名称" @click="openCategoryDialog(category)">
            <edit1-icon />
          </button>
        </div>
        <button class="icon-category-create" type="button" @click="openCategoryDialog()">
          <add-icon />
          新建分类
        </button>
      </aside>

      <main class="icon-gallery-panel">
        <div v-if="icons.length" class="icon-gallery-toolbar">
          <div class="icon-gallery-summary">
            <span>{{ filteredIcons.length }} 个结果</span>
            <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
          </div>
          <div class="icon-view-switch">
            <button
              type="button"
              title="九宫格视图"
              :class="{ 'is-active': viewMode === 'grid' }"
              @click="viewMode = 'grid'"
            >
              <view-module-icon />
            </button>
            <button
              type="button"
              title="单行列表"
              :class="{ 'is-active': viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              <view-list-icon />
            </button>
          </div>
        </div>

        <div v-if="!icons.length" class="icon-empty-state">
          <file-icon-icon />
          <h3>暂无图标资源</h3>
          <p>{{ activeProject.name }} 暂无图标，从 Figma API JSON 或 SVG 文件导入后会出现在这里。</p>
          <div class="icon-empty-actions">
            <label class="document-primary-button">
              导入文件
              <input type="file" accept=".fig,.json,.svg" @change="handleImport" />
            </label>
            <label class="icon-secondary-button">
              导入文件夹
              <input type="file" accept=".svg" webkitdirectory directory multiple @change="handleFolderImport" />
            </label>
          </div>
        </div>

        <div v-else-if="!groupedIcons.length" class="icon-empty-state">
          <search-icon />
          <h3>没有匹配的图标</h3>
          <p>调整搜索词或分类筛选后再试。</p>
        </div>

        <section
          v-for="group in groupedIcons"
          :key="group.value"
          class="icon-gallery-section"
        >
          <h3>{{ group.label }} ({{ group.icons.length }})</h3>
          <div v-if="viewMode === 'grid'" class="icon-gallery-grid">
            <button
              v-for="icon in group.icons"
              :key="icon.id"
              class="icon-gallery-card"
              type="button"
              @click="editIcon(icon)"
              @contextmenu.prevent.stop="openCardMenu($event, icon)"
            >
              <span class="icon-gallery-preview">
                <IconGlyph :paths="icon.paths" :stroke-width="2" :icon-type="icon.iconType" primary-color="#111827" />
              </span>
              <span class="icon-gallery-name">{{ icon.name }}</span>
              <span class="icon-gallery-meta">
                <span class="document-status" :class="`is-${icon.statusTone}`">{{ icon.status }}</span>
                <span>{{ icon.updatedAt.slice(5, 10) }}</span>
              </span>
            </button>
          </div>
          <div v-else class="icon-gallery-list">
            <button
              v-for="icon in group.icons"
              :key="icon.id"
              class="icon-gallery-list-row"
              type="button"
              @click="editIcon(icon)"
              @contextmenu.prevent.stop="openCardMenu($event, icon)"
            >
              <span class="icon-gallery-list-preview">
                <IconGlyph :paths="icon.paths" :stroke-width="2" :icon-type="icon.iconType" primary-color="#111827" />
              </span>
              <span class="icon-gallery-list-main">
                <span>{{ icon.name }}</span>
                <small>{{ icon.figmaFrame }}</small>
              </span>
              <span class="icon-gallery-list-tag">{{ getIconTypeLabel(icon.iconType) }}</span>
              <span class="icon-gallery-list-tag">{{ getCategoryLabel(icon.category) }}</span>
              <span class="icon-gallery-list-date">{{ icon.updatedAt }}</span>
            </button>
          </div>
        </section>

        <div v-if="filteredIcons.length" class="icon-pagination">
          <span>每页 {{ pageSize }} 个，共 {{ filteredIcons.length }} 个</span>
          <div class="icon-pagination-actions">
            <button type="button" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              :class="{ 'is-active': currentPage === page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <button type="button" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
          </div>
        </div>
      </main>

      <aside class="icon-list-inspector">
        <div class="icon-inspector-block">
          <h3>资源概览</h3>
          <div class="icon-stat-grid">
            <span>
              <strong>{{ icons.length }}</strong>
              图标总数
            </span>
            <span>
              <strong>{{ activeProject.environment }}</strong>
              当前环境
            </span>
          </div>
        </div>
        <div class="icon-inspector-block">
          <h3>导出格式</h3>
          <p>编辑页画布支持右键导出 Compose ImageVector 或 Android Vector XML。</p>
        </div>
        <div class="icon-inspector-block">
          <h3>Figma 导入</h3>
          <p>支持 Figma API JSON、单个 SVG，以及选择文件夹批量加载其中的 SVG。</p>
        </div>
      </aside>
    </div>

    <div
      v-if="cardMenu.visible"
      class="icon-context-menu icon-card-context-menu icon-compact-context-menu"
      :style="{ left: `${cardMenu.x}px`, top: `${cardMenu.y}px` }"
      @click.stop
    >
      <button type="button" @click="openCategoryDialog()">
        添加到新分类
      </button>
      <div class="icon-context-submenu">
        <button type="button" :disabled="!iconCategories.length">
          添加到分类
          <chevron-right-icon />
        </button>
        <div v-if="iconCategories.length" class="icon-context-submenu-panel">
          <button
            v-for="category in iconCategories"
            :key="category.value"
            type="button"
            @click="assignCategory(category.value)"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
      <button v-if="cardMenu.icon?.category" class="has-separator" type="button" @click="assignCategory('')">
        移出分类
      </button>
      <button class="is-danger" :class="{ 'has-separator': !cardMenu.icon?.category }" type="button" @click="openDeleteDialog">
        删除图标
      </button>
    </div>

    <div v-if="categoryDialog.visible" class="icon-dialog-mask" @click.self="closeCategoryDialog">
      <div class="icon-dialog">
        <h3>{{ categoryDialog.categoryId ? '编辑分类名称' : (categoryDialog.targetIcon ? '添加到新分类' : '新建分类') }}</h3>
        <label class="icon-field">
          <span>分类名称</span>
          <input v-model="categoryDialog.name" type="text" placeholder="请输入分类名称" @keydown.enter="saveCategory" />
        </label>
        <div class="icon-dialog-actions">
          <button class="icon-secondary-button" type="button" @click="closeCategoryDialog">取消</button>
          <button class="document-primary-button" type="button" @click="saveCategory">确定</button>
        </div>
      </div>
    </div>

    <div v-if="deleteDialog.visible" class="icon-dialog-mask" @click.self="closeDeleteDialog">
      <div class="icon-dialog">
        <h3>删除图标</h3>
        <p class="icon-dialog-message">确认删除「{{ deleteDialog.icon?.name }}」吗？删除后会从当前图标项目的工作区移除。</p>
        <div class="icon-dialog-actions">
          <button class="icon-secondary-button" type="button" @click="closeDeleteDialog">取消</button>
          <button class="document-primary-button is-danger" type="button" @click="confirmDeleteIcon">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AddIcon, ChevronRightIcon, Edit1Icon, FileIconIcon, FolderOpenIcon, LogoFigmaIcon, SearchIcon, ViewListIcon, ViewModuleIcon } from 'tdesign-icons-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import IconGlyph from '../../components/IconGlyph.vue'
import { defaultIconProjectId, findIconProject, setActiveIconProjectId } from '../../config/iconProjects'
import {
  appendIcons,
  assignIconCategory,
  createIconCategory,
  deleteIconAsset,
  readIconCategories,
  readIconLibrary,
  renameIconCategory
} from '../../utils/iconLibrary'
import { parseIconImportFile } from '../../utils/figmaImport'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const activeCategory = ref('all')
const activeIconType = ref('all')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = 24
const activeProjectId = computed(() => route.params.projectId || defaultIconProjectId)
const activeProject = computed(() => findIconProject(activeProjectId.value))
const icons = ref(readIconLibrary(activeProjectId.value))
const iconCategories = ref(readIconCategories(activeProjectId.value))
const cardMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  icon: null
})
const categoryDialog = reactive({
  visible: false,
  categoryId: '',
  name: '',
  targetIcon: null
})
const deleteDialog = reactive({
  visible: false,
  icon: null
})

watch(
  activeProjectId,
  (projectId) => {
    setActiveIconProjectId(projectId)
    icons.value = readIconLibrary(projectId)
    iconCategories.value = readIconCategories(projectId)
    activeCategory.value = 'all'
    activeIconType.value = 'all'
  },
  { immediate: true }
)

const filteredIcons = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return icons.value.filter((icon) => {
    const category = iconCategories.value.find((item) => item.value === icon.category)
    const matchesCategory = activeCategory.value === 'all'
      || (activeCategory.value === 'uncategorized' && !icon.category)
      || icon.category === activeCategory.value
    const matchesIconType = activeIconType.value === 'all' || icon.iconType === activeIconType.value
    const haystack = `${icon.name} ${category?.label || ''} ${icon.figmaFrame}`.toLowerCase()
    return matchesCategory && matchesIconType && (!q || haystack.includes(q))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredIcons.value.length / pageSize)))
const pagedIcons = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredIcons.value.slice(start, start + pageSize)
})
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }
  return pages
})

const groupedIcons = computed(() => {
  if (activeCategory.value === 'uncategorized') {
    return [{ value: 'uncategorized', label: '未分类', icons: pagedIcons.value }]
  }

  if (activeCategory.value !== 'all') {
    const category = iconCategories.value.find((item) => item.value === activeCategory.value)
    return category ? [{ ...category, icons: pagedIcons.value }] : []
  }

  const categories = iconCategories.value
    .map((category) => ({
      ...category,
      icons: pagedIcons.value.filter((icon) => icon.category === category.value)
    }))
    .filter((category) => category.icons.length)
  const uncategorizedIcons = pagedIcons.value.filter((icon) => !icon.category)

  return [
    ...(uncategorizedIcons.length ? [{ value: 'uncategorized', label: '未分类', icons: uncategorizedIcons }] : []),
    ...categories
  ]
})

watch(
  [keyword, activeCategory, activeIconType],
  () => {
    currentPage.value = 1
  }
)

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

const goToPage = (page) => {
  currentPage.value = Math.min(totalPages.value, Math.max(1, page))
}

const getCategoryLabel = (categoryId) => {
  if (!categoryId) return '未分类'
  return iconCategories.value.find((category) => category.value === categoryId)?.label || '未分类'
}

const getIconTypeLabel = (iconType) => (iconType === 'fill' ? '填充' : '描边')

const editIcon = (icon) => {
  router.push({ name: 'icon-edit', params: { projectId: activeProjectId.value, id: icon.id } })
}

const createIcon = () => {
  router.push({ name: 'icon-create', params: { projectId: activeProjectId.value } })
}

const goBackProjects = () => {
  router.push({ name: 'icon-project-list' })
}

const openCardMenu = (event, icon) => {
  const menuWidth = iconCategories.value.length ? 360 : 190
  const menuHeight = (icon.category ? 4 : 3) * 32 + 8
  cardMenu.visible = true
  cardMenu.x = Math.min(event.clientX, window.innerWidth - menuWidth - 12)
  cardMenu.y = Math.min(event.clientY, window.innerHeight - menuHeight - 12)
  cardMenu.icon = icon
}

const closeCardMenu = () => {
  cardMenu.visible = false
}

const refreshWorkspace = () => {
  icons.value = readIconLibrary(activeProjectId.value)
  iconCategories.value = readIconCategories(activeProjectId.value)
}

const openCategoryDialog = (category = null) => {
  categoryDialog.visible = true
  categoryDialog.categoryId = category?.value || ''
  categoryDialog.name = category?.label || ''
  categoryDialog.targetIcon = !category && cardMenu.icon ? cardMenu.icon : null
  closeCardMenu()
}

const closeCategoryDialog = () => {
  categoryDialog.visible = false
  categoryDialog.categoryId = ''
  categoryDialog.name = ''
  categoryDialog.targetIcon = null
}

const saveCategory = () => {
  const name = categoryDialog.name.trim()
  if (!name) {
    MessagePlugin.warning('请输入分类名称')
    return
  }

  const targetIcon = categoryDialog.targetIcon
  const category = categoryDialog.categoryId
    ? renameIconCategory(categoryDialog.categoryId, name, activeProjectId.value)
    : createIconCategory(name, activeProjectId.value)

  refreshWorkspace()
  closeCategoryDialog()

  if (targetIcon && category?.value) {
    assignIconCategory(targetIcon.id, category.value, activeProjectId.value)
    refreshWorkspace()
    MessagePlugin.success('分类已保存，图标已添加')
    return
  }

  MessagePlugin.success('分类已保存')
}

const assignCategory = (categoryId) => {
  if (!cardMenu.icon) return
  assignIconCategory(cardMenu.icon.id, categoryId, activeProjectId.value)
  refreshWorkspace()
  closeCardMenu()
  MessagePlugin.success(categoryId ? '已添加到分类' : '已移出分类')
}

const openDeleteDialog = () => {
  if (!cardMenu.icon) return
  deleteDialog.visible = true
  deleteDialog.icon = cardMenu.icon
  closeCardMenu()
}

const closeDeleteDialog = () => {
  deleteDialog.visible = false
  deleteDialog.icon = null
}

const confirmDeleteIcon = () => {
  if (!deleteDialog.icon) return
  const deleted = deleteIconAsset(deleteDialog.icon.id, activeProjectId.value)
  closeDeleteDialog()
  refreshWorkspace()
  MessagePlugin.success(deleted ? '图标已删除' : '图标不存在或已删除')
}

const importFiles = async (files, { svgOnly = false } = {}) => {
  const targets = [...files].filter((file) => {
    if (!svgOnly) return true
    return /\.svg$/i.test(file.name) || file.type === 'image/svg+xml'
  })

  if (!targets.length) {
    MessagePlugin.warning('没有找到可导入的 SVG 文件')
    return
  }

  const importedIcons = []
  const failedFiles = []

  for (const file of targets) {
    try {
      const nextIcons = await parseIconImportFile(file)
      importedIcons.push(...nextIcons)
    } catch (error) {
      failedFiles.push(file.webkitRelativePath || file.name)
    }
  }

  if (importedIcons.length) {
    appendIcons(importedIcons, activeProjectId.value)
    refreshWorkspace()
    MessagePlugin.success(`已导入 ${importedIcons.length} 个图标`)
    return
  }

  if (failedFiles.length) {
    MessagePlugin.error(`导入失败，${failedFiles.length} 个文件无法解析`)
  } else {
    MessagePlugin.warning('没有从文件中解析到可用的矢量 path')
  }
}

const handleImport = async (event) => {
  const files = event.target.files
  if (!files?.length) return
  await importFiles(files)
  event.target.value = ''
}

const handleFolderImport = async (event) => {
  const files = event.target.files
  if (!files?.length) return
  await importFiles(files, { svgOnly: true })
  event.target.value = ''
}
</script>
