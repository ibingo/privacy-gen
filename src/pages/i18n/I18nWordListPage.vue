<template>
  <starter-list-page
    v-model:keyword="keyword"
    :title="i18nProjectTitle"
    :show-breadcrumb="false"
    :total-text="`共 ${total} 项`"
    :summary-text="`已选 ${selectedRowKeys.length} 项`"
    primary-action="新建文案"
    :columns="columns"
    :data="rows"
    :loading="loading"
    :page-size="pageSize"
    :page-size-options="[10, 20, 50]"
    :selected-row-keys="selectedRowKeys"
    :searchable="false"
    @primary="openWordDrawer()"
    @search="handleSearch"
    @select-change="selectedRowKeys = $event"
    @row-click="handleRowClick"
  >
    <template #actions>
      <t-dropdown
        :options="legacyImportOptions"
        trigger="click"
        placement="bottom-right"
        :min-column-width="156"
        :max-column-width="220"
        :popup-props="{ overlayInnerClassName: 'i18n-word-import-dropdown' }"
        @click="openLegacyImportDialog"
      >
        <t-button variant="outline">
          <template #icon><file-import-icon /></template>
          从旧版导入
          <template #suffix><chevron-down-icon /></template>
        </t-button>
      </t-dropdown>
    </template>
    <template #filters>
      <div class="i18n-word-toolbar">
        <t-input
          v-model="keyword"
          class="i18n-word-search"
          clearable
          placeholder="请输入 Key 名称或翻译内容进行搜索..."
          @enter="handleSearch"
        >
          <template #suffix-icon><search-icon /></template>
        </t-input>
        <t-select v-model="tagFilter" class="i18n-word-filter-button is-tag" placeholder="标签" clearable>
          <template #prefixIcon><filter-icon /></template>
          <t-option v-for="tag in tagOptions" :key="tag" :value="tag" :label="tag" />
        </t-select>
        <t-select v-model="platformFilter" class="i18n-word-filter-button is-platform" placeholder="目标平台" clearable>
          <template #prefixIcon><filter-icon /></template>
          <t-option v-for="platform in platformOptions" :key="platform.value" :value="platform.value" :label="platform.label" />
        </t-select>
        <t-select v-model="valueTypeFilter" class="i18n-word-filter-button is-value-type" placeholder="文案类型">
          <template #prefixIcon><filter-icon /></template>
          <t-option v-for="type in valueTypeFilterOptions" :key="type.value" :value="type.value" :label="type.label" />
        </t-select>
      </div>
    </template>
    <template #table-prefix>
      <div class="i18n-word-locale-tabs" role="tablist" aria-label="语种视图">
        <button
          v-for="tab in localeTabs"
          :key="tab.value"
          type="button"
          class="i18n-word-locale-tab"
          :class="{ 'is-active': activeLocaleTab === tab.value }"
          role="tab"
          :aria-selected="activeLocaleTab === tab.value"
          @click="activeLocaleTab = tab.value"
        >
          <span>{{ tab.label }}</span>
          <em>{{ tab.meta }}</em>
        </button>
      </div>
    </template>
    <template #name="{ row }">
      <div class="i18n-word-key-cell">
        <div class="i18n-word-key-main">
          <strong>{{ row.name }}</strong>
          <div class="i18n-word-key-tags">
            <t-tag v-for="tag in getVisibleTags(row.tags)" :key="tag" variant="light" size="small">{{ tag }}</t-tag>
            <t-popup
              v-if="getHiddenTags(row.tags).length"
              trigger="hover"
              placement="top"
              overlay-inner-class-name="i18n-word-tags-popup"
            >
              <t-tag variant="light" size="small">+{{ getHiddenTags(row.tags).length }}</t-tag>
              <template #content>
                <div class="i18n-word-tags-popup-content">
                  <t-tag v-for="tag in row.tags" :key="tag" variant="light" size="small">{{ tag }}</t-tag>
                </div>
              </template>
            </t-popup>
          </div>
        </div>
      </div>
    </template>
    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
    </template>
    <template #operation="{ row }">
      <t-space size="small">
        <t-button theme="primary" variant="text" @click.stop="openWordDrawer(row)">编辑</t-button>
        <t-button theme="danger" variant="text" @click.stop="handleDelete(row)">删除</t-button>
      </t-space>
    </template>
  </starter-list-page>

  <t-drawer
    v-model:visible="drawerVisible"
    :header="false"
    :footer="false"
    size="720px"
    placement="right"
    :close-btn="false"
    destroy-on-close
  >
    <div class="i18n-word-drawer">
      <div class="i18n-word-drawer-header">
        <div class="i18n-word-drawer-title">
          <t-button class="i18n-word-drawer-close" variant="text" shape="square" @click="closeWordDrawer">
            <template #icon><close-icon /></template>
          </t-button>
          <strong>{{ editingWordId ? '编辑文案' : '新建文案' }}</strong>
        </div>
        <t-space size="small">
          <t-button variant="text" shape="square" title="一键翻译" @click="translateAll">
            <template #icon><translate-icon /></template>
          </t-button>
          <t-button variant="outline" @click="closeWordDrawer">取消</t-button>
          <t-button theme="primary" @click="saveWord">{{ editingWordId ? '更新' : '创建' }}</t-button>
        </t-space>
      </div>

      <div class="i18n-word-drawer-body">
        <div class="i18n-word-drawer-form">
          <t-form :data="wordForm" label-align="top">
            <t-form-item label="Key 名称" required-mark>
              <t-input
                v-model="wordForm.name"
                clearable
                :disabled="Boolean(editingWordId)"
                placeholder="请输入文案 Key"
              />
            </t-form-item>

            <t-form-item label="文案类型">
              <t-radio-group
                v-model="wordForm.valueType"
                class="i18n-word-value-type-group"
                variant="default-filled"
                :disabled="Boolean(editingWordId)"
                @change="handleValueTypeChange"
              >
                <t-radio-button v-for="type in valueTypeOptions" :key="type.value" :value="type.value">
                  {{ type.label }}
                </t-radio-button>
              </t-radio-group>
            </t-form-item>

            <t-form-item label="目标平台">
              <t-select
                v-model="wordForm.targetPlatforms"
                multiple
                clearable
                placeholder="请选择目标平台"
              >
                <t-option v-for="platform in platformOptions" :key="platform.value" :value="platform.value" :label="platform.label" />
              </t-select>
            </t-form-item>

            <t-form-item label="描述">
              <t-textarea
                v-model="wordForm.description"
                :autosize="{ minRows: 2, maxRows: 4 }"
                placeholder="请输入文案描述，如首页标题文案"
              />
            </t-form-item>

            <t-form-item label="标签">
              <t-select
                v-model="wordForm.tags"
                multiple
                filterable
                creatable
                clearable
                placeholder="选择或输入标签"
              >
                <t-option v-for="tag in tagOptions" :key="tag" :value="tag" :label="tag" />
              </t-select>
            </t-form-item>

            <div class="i18n-word-locale-fields">
              <div v-for="locale in visibleWordFormLocales" :key="locale.value" class="i18n-word-locale-field">
                <div class="i18n-word-locale-label">
                  <span>{{ locale.label }} <em>({{ locale.value }})</em></span>
                  <t-button
                    v-if="locale.value !== sourceLocale"
                    variant="text"
                    shape="square"
                    size="small"
                    title="翻译该语种"
                    @click="translateLocale(locale.value)"
                  >
                    <template #icon><refresh-icon /></template>
                  </t-button>
                </div>
                <template v-if="wordForm.valueType === 'plural'">
                  <div class="i18n-word-plural-grid">
                    <label v-for="category in pluralCategories" :key="category.value" class="i18n-word-plural-item">
                      <span>{{ category.label }}</span>
                      <t-input
                        v-model="wordForm.translations[locale.value][category.value]"
                        clearable
                        :placeholder="`${locale.shortLabel} ${category.label}`"
                      />
                    </label>
                  </div>
                </template>
                <template v-else-if="wordForm.valueType === 'array_plural'">
                  <div class="i18n-word-array-list">
                    <div
                      v-for="(item, index) in wordForm.translations[locale.value]"
                      :key="`${locale.value}-plural-array-${index}`"
                      class="i18n-word-array-plural-item"
                    >
                      <div class="i18n-word-array-plural-head">
                        <span>第 {{ index + 1 }} 项</span>
                        <t-button
                          variant="text"
                          theme="danger"
                          shape="square"
                          size="small"
                          @click="removeArrayItem(locale.value, index)"
                        >
                          <template #icon><close-icon /></template>
                        </t-button>
                      </div>
                      <div class="i18n-word-plural-grid">
                        <label v-for="category in pluralCategories" :key="category.value" class="i18n-word-plural-item">
                          <span>{{ category.label }}</span>
                          <t-input
                            v-model="wordForm.translations[locale.value][index][category.value]"
                            clearable
                            :placeholder="`${locale.shortLabel} 第 ${index + 1} 项 ${category.label}`"
                          />
                        </label>
                      </div>
                    </div>
                    <t-button variant="outline" size="small" @click="addArrayItem(locale.value)">增加数组复数项</t-button>
                  </div>
                </template>
                <template v-else-if="wordForm.valueType === 'array'">
                  <div class="i18n-word-array-list">
                    <div
                      v-for="(item, index) in wordForm.translations[locale.value]"
                      :key="`${locale.value}-${index}`"
                      class="i18n-word-array-item"
                    >
                      <span>{{ index + 1 }}</span>
                      <t-input
                        v-model="wordForm.translations[locale.value][index]"
                        clearable
                        :placeholder="`${locale.shortLabel} 第 ${index + 1} 项`"
                      />
                      <t-button
                        variant="text"
                        theme="danger"
                        shape="square"
                        size="small"
                        @click="removeArrayItem(locale.value, index)"
                      >
                        <template #icon><close-icon /></template>
                      </t-button>
                    </div>
                    <t-button variant="outline" size="small" @click="addArrayItem(locale.value)">增加数组项</t-button>
                  </div>
                </template>
                <t-textarea
                  v-else
                  v-model="wordForm.translations[locale.value]"
                  :placeholder="locale.value === sourceLocale ? '请输入源文案' : `${locale.shortLabel} 翻译`"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                />
              </div>
            </div>
          </t-form>
        </div>

        <div class="i18n-word-drawer-preview" aria-hidden="true">
          <div class="i18n-word-mascot">
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </t-drawer>

  <t-dialog
    v-model:visible="legacyImportVisible"
    :header="legacyImportDialogTitle"
    width="860px"
    confirm-btn="导入"
    cancel-btn="取消"
    @confirm="importLegacyWords"
    @cancel="closeLegacyImportDialog"
    @close="closeLegacyImportDialog"
  >
    <div class="i18n-word-import-dialog">
      <t-alert theme="info">
        {{ legacyImportConfig.description }}：<code>{{ legacyImportConfig.example }}</code>
      </t-alert>

      <div class="i18n-word-import-grid">
        <t-form :data="legacyImportForm" label-align="top">
          <t-form-item :label="legacyImportConfig.inputLabel" required-mark>
            <t-textarea
              v-model="legacyImportForm.content"
              :placeholder="legacyImportConfig.placeholder"
              :autosize="{ minRows: 10, maxRows: 16 }"
            />
          </t-form-item>
        </t-form>

        <div v-if="legacyImportForm.type === 'csv'" class="i18n-word-import-mapping">
          <div class="i18n-word-import-mapping-header">
            <strong>列顺序</strong>
          </div>
          <div class="i18n-word-import-fixed-row">
            <span>第 1 列</span>
            <strong>Key</strong>
          </div>
          <div class="i18n-word-import-mapping-list">
            <div
              v-for="(mapping, index) in legacyImportForm.languageMappings"
              :key="mapping.id"
              class="i18n-word-import-mapping-row"
              draggable="true"
              @dragstart="handleLegacyLanguageDragStart(index)"
              @dragover.prevent
              @drop="handleLegacyLanguageDrop(index)"
            >
              <drag-move-icon class="i18n-word-import-drag" />
              <span>第 {{ index + 2 }} 列</span>
              <strong>{{ getLegacyLanguageLabel(mapping.locale) }}</strong>
              <t-button
                v-if="!mapping.locked"
                theme="danger"
                variant="text"
                shape="square"
                @click="removeLegacyLanguage(mapping.id)"
              >
                <template #icon><close-icon /></template>
              </t-button>
            </div>
          </div>
          <div class="i18n-word-import-add-language">
            <t-select v-model="legacyLanguageToAdd" placeholder="选择额外语种">
              <t-option
                v-for="option in legacyLanguageOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </t-select>
            <t-button variant="outline" @click="addLegacyLanguage">增加</t-button>
          </div>
          <div class="i18n-word-import-fixed-row">
            <span>最后 1 列</span>
            <strong>平台</strong>
          </div>
          <t-form :data="legacyImportForm" label-align="top" class="i18n-word-import-options">
            <t-form-item label="目标平台">
              <t-select v-model="legacyImportForm.platforms" multiple clearable placeholder="CSV 最后一列为空时使用">
                <t-option v-for="platform in platformOptions" :key="platform.value" :value="platform.value" :label="platform.label" />
              </t-select>
            </t-form-item>
          </t-form>
        </div>
        <div v-else class="i18n-word-import-format">
          <strong>{{ legacyImportConfig.formatTitle }}</strong>
          <p>{{ legacyImportConfig.formatDescription }}</p>
          <t-form :data="legacyImportForm" label-align="top" class="i18n-word-import-options">
            <t-form-item label="导入语种" required-mark>
              <t-select v-model="legacyImportForm.locale" filterable>
                <t-option
                  v-for="option in importLocaleOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </t-select>
            </t-form-item>
            <t-form-item label="目标平台">
              <t-select v-model="legacyImportForm.platforms" multiple clearable placeholder="请选择目标平台">
                <t-option v-for="platform in platformOptions" :key="platform.value" :value="platform.value" :label="platform.label" />
              </t-select>
            </t-form-item>
            <t-form-item label="标签">
              <t-select
                v-model="legacyImportForm.tags"
                multiple
                filterable
                creatable
                clearable
                placeholder="选择或输入标签"
              >
                <t-option v-for="tag in tagOptions" :key="tag" :value="tag" :label="tag" />
              </t-select>
            </t-form-item>
          </t-form>
          <div class="i18n-word-import-format-row">
            <span>Key</span>
            <strong>{{ legacyImportConfig.keyRule }}</strong>
          </div>
          <div class="i18n-word-import-format-row">
            <span>文案</span>
            <strong>{{ getLegacyLanguageLabel(legacyImportForm.locale) }}</strong>
          </div>
          <div class="i18n-word-import-format-row">
            <span>目标平台</span>
            <strong>{{ legacyImportForm.platforms.length ? legacyImportForm.platforms.join('、') : '未设置' }}</strong>
          </div>
          <div class="i18n-word-import-format-row">
            <span>标签</span>
            <strong>{{ legacyImportForm.tags.length ? legacyImportForm.tags.join('、') : '未设置' }}</strong>
          </div>
        </div>
      </div>
    </div>
  </t-dialog>
</template>

<script setup>
import { computed, h, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDownIcon, CloseIcon, DragMoveIcon, FileImportIcon, FilterIcon, RefreshIcon, SearchIcon, TranslateIcon } from 'tdesign-icons-vue-next'
import {
  Alert as TAlert,
  Button as TButton,
  Dialog as TDialog,
  DialogPlugin,
  Dropdown as TDropdown,
  Drawer as TDrawer,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Popup as TPopup,
  RadioButton as TRadioButton,
  RadioGroup as TRadioGroup,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import { i18nLocaleOptions, readI18nSettings } from '../../config/i18nSettings'
import { getI18nProject } from '../../config/i18nProjects'
import {
  deleteI18nWordApi,
  getI18nProjectDetailApi,
  importI18nWordsApi,
  listI18nWordsApi,
  listI18nWordTagsApi,
  saveI18nWordApi
} from '../../api/i18nWords'

const route = useRoute()
const keyword = ref('')
const statusFilter = ref('all')
const localeFilter = ref('all')
const tagFilter = ref('')
const platformFilter = ref('')
const valueTypeFilter = ref('all')
const i18nSettings = ref(readI18nSettings())
const activeLocaleTab = ref('all')
const i18nProjectDetail = ref(null)
const sourceLocale = computed(() => i18nProjectDetail.value?.sourceLocale || i18nSettings.value.sourceLocale)
const localI18nProject = computed(() => getI18nProject(route.params.projectId))
const i18nProject = computed(() => i18nProjectDetail.value || localI18nProject.value)
const i18nProjectTitle = computed(() => i18nProject.value?.name ? `${i18nProject.value.name} 文案` : '国际化文案')

const rows = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const tagRows = ref([])
const drawerVisible = ref(false)
const editingWordId = ref('')
const legacyImportVisible = ref(false)

const legacyImportConfigs = {
  csv: {
    title: 'CSV',
    description: '支持旧版 CSV',
    inputLabel: 'CSV 内容',
    example: 'common_confirm,确认,確認,Confirm,APP',
    placeholder: 'common_confirm,确认,確認,Confirm,APP',
    formatTitle: 'CSV 列映射',
    formatDescription: '第 1 列固定为 Key，最后 1 列固定为平台，中间列按右侧语种顺序导入。',
    keyRule: '第 1 列',
    tagRule: '最后 1 列平台'
  },
  androidXml: {
    title: 'Android XML',
    description: '支持 Android strings.xml',
    inputLabel: 'XML 内容',
    example: '<string name="common_confirm">确认</string>',
    placeholder: '<resources>\n  <string name="common_confirm">确认</string>\n  <string name="common_cancel">取消</string>\n</resources>',
    formatTitle: 'Android XML 规则',
    formatDescription: '解析 string 节点的 name 作为 Key，节点文本写入所选语种。',
    keyRule: 'string.name',
    defaultPlatforms: ['Android'],
    defaultTags: ['Android']
  },
  ios: {
    title: 'iOS',
    description: '支持 iOS Localizable.strings',
    inputLabel: 'strings 内容',
    example: '"common_confirm" = "确认";',
    placeholder: '"common_confirm" = "确认";\n"common_cancel" = "取消";',
    formatTitle: 'iOS strings 规则',
    formatDescription: '解析等号左侧字符串作为 Key，右侧字符串写入所选语种。',
    keyRule: '等号左侧字符串',
    defaultPlatforms: ['iOS'],
    defaultTags: ['iOS']
  },
  webJson: {
    title: 'Web JSON',
    description: '支持 Web JSON',
    inputLabel: 'JSON 内容',
    example: '{"common_confirm":"确认"}',
    placeholder: '{\n  "common_confirm": "确认",\n  "common_cancel": "取消"\n}',
    formatTitle: 'Web JSON 规则',
    formatDescription: '解析扁平 JSON 对象；嵌套对象会使用点号拼接为 Key。',
    keyRule: 'JSON 字段路径',
    defaultPlatforms: ['Web'],
    defaultTags: ['Web']
  }
}

const localeMap = computed(() => new Map(i18nLocaleOptions.map((locale) => [locale.value, locale])))
const wordLocales = computed(() => [
  getLocaleMeta(sourceLocale.value),
  ...targetLocales.value
])
const targetLocales = computed(() => {
  const locales = i18nProjectDetail.value?.targetLocales?.length
    ? i18nProjectDetail.value.targetLocales
    : i18nSettings.value.targetLocales
  return locales.map(getLocaleMeta)
})
const displayedTargetLocales = computed(() => {
  if (activeLocaleTab.value === 'all') return targetLocales.value
  if (activeLocaleTab.value === sourceLocale.value) return []
  return targetLocales.value.filter((locale) => locale.value === activeLocaleTab.value)
})
const localeTabs = computed(() => [
  { value: 'all', label: '全部语种', meta: `${wordLocales.value.length} 个语种` },
  {
    value: sourceLocale.value,
    label: getLocaleMeta(sourceLocale.value).label,
    meta: sourceLocale.value
  },
  ...targetLocales.value.map((locale) => ({
    value: locale.value,
    label: locale.label,
    meta: locale.value
  }))
])
const visibleWordFormLocales = computed(() => {
  if (editingWordId.value || activeLocaleTab.value === 'all') return wordLocales.value
  if (activeLocaleTab.value === sourceLocale.value) return [getLocaleMeta(sourceLocale.value)]
  const selectedTargetLocale = targetLocales.value.find((locale) => locale.value === activeLocaleTab.value)
  return selectedTargetLocale ? [getLocaleMeta(sourceLocale.value), selectedTargetLocale] : wordLocales.value
})
const wordForm = ref(createEmptyWordForm())
const defaultPlatformOptions = [
  { value: 'APP', label: 'APP' },
  { value: 'Android', label: 'Android' },
  { value: 'iOS', label: 'iOS' },
  { value: 'Web', label: 'Web' },
  { value: 'MiniApp', label: 'MiniApp' }
]
const platformOptions = computed(() => {
  const platforms = normalizeProjectPlatforms(i18nProject.value?.platforms || i18nProject.value?.targetPlatforms)
  const options = platforms.map((platform) => ({ value: platform, label: platform }))
  return options.length ? options : defaultPlatformOptions
})
const valueTypeOptions = [
  { value: 'text', label: '普通文本' },
  { value: 'plural', label: '复数' },
  { value: 'array', label: '数组' },
  { value: 'array_plural', label: '数组复数' }
]
const valueTypeFilterOptions = [
  { value: 'all', label: '全部类型' },
  { value: 'text', label: '普通文本' },
  { value: 'plural', label: '复数' },
  { value: 'array', label: '数组' },
  { value: 'array_plural', label: '数组复数' }
]
const pluralCategories = [
  { value: 'zero', label: 'zero' },
  { value: 'one', label: 'one' },
  { value: 'two', label: 'two' },
  { value: 'few', label: 'few' },
  { value: 'many', label: 'many' },
  { value: 'other', label: 'other' }
]
const baseTagOptions = ['privacy', 'agreement', 'project', 'sdk', 'layout', 'button', 'Android', 'iOS', 'Web']
const tagOptions = computed(() => [...new Set([...baseTagOptions, ...tagRows.value, ...rows.value.flatMap((item) => item.tags || [])])])
const selectedRowKeys = ref([])
const statusOptions = computed(() => [...new Set(rows.value.map((item) => item.status))])
const localeOptions = computed(() => [...new Set(rows.value.map((item) => item.locale))])
const columns = computed(() => [
  { colKey: 'row-select', type: 'multiple', width: 48 },
  { colKey: 'name', title: '文案 Key', minWidth: 300 },
  {
    colKey: 'sourceText',
    title: renderLocaleColumnTitle(getLocaleMeta(sourceLocale.value)),
    minWidth: 200,
    cell: (_, { row }) => renderTranslationCell(row?.translations?.[sourceLocale.value], row)
  },
  ...displayedTargetLocales.value.map((locale) => ({
    colKey: getLocaleColumnKey(locale.value),
    title: renderLocaleColumnTitle(locale),
    minWidth: 180,
    cell: (_, { row }) => renderTranslationCell(row?.translations?.[locale.value], row)
  })),
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'coverage', title: '覆盖语言数', width: 120 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
])

const legacyImportForm = ref(createLegacyImportForm())
const legacyLanguageToAdd = ref('')
const legacyDraggingLanguageIndex = ref(-1)
const legacyImportOptions = computed(() => Object.entries(legacyImportConfigs).map(([value, config]) => ({
  value,
  content: () => h('span', { class: 'i18n-word-import-dropdown-label' }, config.title),
  prefixIcon: () => h(FileImportIcon)
})))
const legacyImportConfig = computed(() => legacyImportConfigs[legacyImportForm.value.type] || legacyImportConfigs.csv)
const legacyImportDialogTitle = computed(() => `从旧版导入 - ${legacyImportConfig.value.title}`)
const importLocaleOptions = computed(() => [
  getLocaleMeta(sourceLocale.value),
  ...targetLocales.value
].map((locale) => ({ value: locale.value, label: `${locale.label}（${locale.value}）` })))
const legacyLanguageOptions = computed(() => {
  const usedLocales = new Set(legacyImportForm.value.languageMappings.map((item) => item.locale))
  return i18nLocaleOptions
    .filter((locale) => !usedLocales.has(locale.value))
    .map((locale) => ({ value: locale.value, label: `${locale.label}（${locale.value}）` }))
})

let keywordTimer = 0

watch(keyword, () => {
  window.clearTimeout(keywordTimer)
  keywordTimer = window.setTimeout(() => {
    handleSearch()
  }, 300)
})

watch([tagFilter, platformFilter, valueTypeFilter], () => {
  handleSearch()
})

watch(targetLocales, (locales) => {
  if (activeLocaleTab.value === 'all') return
  if (activeLocaleTab.value === sourceLocale.value) return
  if (!locales.some((locale) => locale.value === activeLocaleTab.value)) {
    activeLocaleTab.value = 'all'
  }
})

watch(
  () => route.params.projectId,
  async () => {
    page.value = 1
    await refreshProjectPageData()
  }
)

onMounted(() => {
  refreshProjectPageData()
})

const getStatusTheme = (tone) => {
  const themeMap = {
    success: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}

function getLocaleColumnKey (localeValue) {
  return `translation_${localeValue.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`
}

function getLocaleMeta (localeValue) {
  return localeMap.value.get(localeValue) || { value: localeValue, label: localeValue, shortLabel: localeValue }
}

function renderLocaleColumnTitle (locale) {
  return () => h('span', { class: 'i18n-word-locale-column-title' }, locale.label)
}

function renderTranslationCell (value, row) {
  const text = getTranslationDisplayText(value)
  if (!text) return h('span', { class: 'i18n-word-translation-cell is-empty' }, '待翻译')
  const platformType = getWordPlaceholderPlatformType(row)
  return h(
    TPopup,
    {
      trigger: 'hover',
      placement: 'top',
      overlayInnerClassName: 'i18n-word-text-popup'
    },
    {
      default: () => h('span', { class: 'i18n-word-translation-cell' }, renderPlaceholderHighlightedText(text, platformType)),
      content: () => h('pre', { class: 'i18n-word-text-popup-content' }, renderPlaceholderHighlightedText(getTranslationDisplayText(value, true), platformType))
    }
  )
}

const androidPlaceholderPattern = /%(?:\d+\$)?(?:\.\d+)?[sdf](?::[A-Za-z_][\w.-]*)?/g
const iosPlaceholderPattern = /%(?:(?:\d+\$)?(?:\.\d+)?[sdf@]|[A-Za-z_][\w.-]*@)(?::[A-Za-z_][\w.-]*)?/g
const commonPlaceholderPattern = /\[%(?:\d+\$)?(?:\.\d+)?[sdf](?::[A-Za-z_][\w.-]*)?\]/g
const anyPlatformPlaceholderPattern = /%(?:\d+\$)?(?:\.\d+)?[sdf@](?::[A-Za-z_][\w.-]*)?|%[A-Za-z_][\w.-]*@(?::[A-Za-z_][\w.-]*)?/g

function renderPlaceholderHighlightedText (text = '', platformType = 'common') {
  const content = String(text || '')
  const nodes = []
  let lastIndex = 0
  const placeholderPattern = getPlaceholderPattern(platformType)
  placeholderPattern.lastIndex = 0
  for (const match of content.matchAll(placeholderPattern)) {
    const index = match.index ?? 0
    if (index > lastIndex) nodes.push(content.slice(lastIndex, index))
    nodes.push(h('mark', { class: 'i18n-word-placeholder-token' }, match[0]))
    lastIndex = index + match[0].length
  }
  if (lastIndex < content.length) nodes.push(content.slice(lastIndex))
  return nodes.length ? nodes : content
}

function getPlaceholderPattern (platformType) {
  if (platformType === 'ios') return iosPlaceholderPattern
  if (platformType === 'android') return androidPlaceholderPattern
  return commonPlaceholderPattern
}

function getWordPlaceholderPlatformType (row = {}) {
  const platformText = [
    ...(Array.isArray(row.targetPlatforms) ? row.targetPlatforms : []),
    row.targetPlatform,
    ...(Array.isArray(row.platforms) ? row.platforms : [])
  ]
    .filter(Boolean)
    .join(',')
    .toLowerCase()
  const isAndroid = platformText.includes('android')
  const isIos = platformText.includes('ios') || platformText.includes('iphone') || platformText.includes('ipad')
  if (isAndroid && !isIos) return 'android'
  if (isIos && !isAndroid) return 'ios'
  return 'common'
}

function getPlatformTypeSet (platforms = []) {
  const platformText = normalizeProjectPlatforms(platforms).join(',').toLowerCase()
  return {
    android: platformText.includes('android'),
    ios: platformText.includes('ios') || platformText.includes('iphone') || platformText.includes('ipad')
  }
}

function isPlaceholderConfigEnabled (key) {
  return i18nSettings.value.placeholderConfigs?.find((item) => item.key === key)?.enabled !== false
}

function shouldConvertToCommonPlaceholders (platforms = []) {
  const platformTypes = getPlatformTypeSet(platforms)
  return platformTypes.android &&
    platformTypes.ios &&
    isPlaceholderConfigEnabled('android') &&
    isPlaceholderConfigEnabled('ios') &&
    isPlaceholderConfigEnabled('common')
}

function convertPlatformPlaceholdersToCommon (text = '') {
  const content = String(text || '')
  if (!content) return ''
  const commonPlaceholders = []
  commonPlaceholderPattern.lastIndex = 0
  const protectedContent = content.replace(commonPlaceholderPattern, (placeholder) => {
    const token = `__COMMON_PLACEHOLDER_${commonPlaceholders.length}__`
    commonPlaceholders.push(placeholder)
    return token
  })
  anyPlatformPlaceholderPattern.lastIndex = 0
  return protectedContent
    .replace(anyPlatformPlaceholderPattern, (placeholder) => toCommonPlaceholder(placeholder))
    .replace(/__COMMON_PLACEHOLDER_(\d+)__/g, (_, index) => commonPlaceholders[Number(index)] || '')
}

function toCommonPlaceholder (placeholder) {
  const body = String(placeholder || '').slice(1)
  const namedIosMatch = body.match(/^([A-Za-z_][\w.-]*)@(?::([A-Za-z_][\w.-]*))?$/)
  if (namedIosMatch) return `[%s:${namedIosMatch[2] || namedIosMatch[1]}]`

  const valueMatch = body.match(/^(\d+\$)?(\.\d+)?([sdf@])(?::([A-Za-z_][\w.-]*))?$/)
  if (!valueMatch) return placeholder
  const [, position = '', precision = '', type, name] = valueMatch
  const commonType = type === '@' ? 's' : type
  return `[%${position}${precision}${commonType}${name ? `:${name}` : ''}]`
}

async function refreshProjectPageData () {
  await fetchProjectDetail()
  await Promise.all([
    fetchRows(),
    fetchTagOptions()
  ])
}

async function fetchProjectDetail () {
  if (!route.params.projectId) return
  try {
    const detail = await getI18nProjectDetailApi(route.params.projectId)
    i18nProjectDetail.value = normalizeProjectDetail(detail)
  } catch {
    i18nProjectDetail.value = null
  }
}

function normalizeProjectDetail (detail = {}) {
  const project = detail.project || detail.item || detail.detail || detail
  const fallback = localI18nProject.value || {}
  const targetLocales = normalizeProjectLocales(project.targetLocales || project.targetLocaleCodes || project.languages || fallback.targetLocales)
  const platforms = normalizeProjectPlatforms(
    project.platforms ||
      project.targetPlatforms ||
      project.targetPlatform ||
      project.platform ||
      project.applicableTerminal ||
      fallback.platforms
  )
  return {
    ...fallback,
    ...project,
    id: project.id || project.projectId || project.value || fallback.id || route.params.projectId,
    name: project.name || project.projectName || project.label || fallback.name || '',
    sourceLocale: project.sourceLocale || project.sourceLang || fallback.sourceLocale || i18nSettings.value.sourceLocale,
    targetLocales: targetLocales.length ? targetLocales : [...i18nSettings.value.targetLocales],
    platforms
  }
}

function normalizeProjectLocales (value) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'string' ? item : item?.value || item?.locale || item?.code).filter(Boolean)
  }
  if (!value) return []
  return String(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean)
}

function normalizeProjectPlatforms (value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => {
      if (typeof item === 'string') return normalizePlatformValue(item)
      return normalizePlatformValue(item?.value || item?.platform || item?.code || item?.label)
    }).filter(Boolean))]
  }
  if (!value) return []
  return [...new Set(String(value).split(/[,;|]/).map(normalizePlatformValue).filter(Boolean))]
}

async function fetchRows () {
  loading.value = true
  try {
    const data = await listI18nWordsApi({
      projectId: route.params.projectId,
      keyword: keyword.value.trim(),
      targetPlatform: platformFilter.value || '',
      tag: tagFilter.value || '',
      valueType: valueTypeFilter.value || 'all'
    })
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    const normalizedRows = items.map(normalizeWordRow)
    rows.value = normalizedRows
    total.value = Number(data?.total ?? normalizedRows.length)
    page.value = Number(data?.page || page.value)
    pageSize.value = Number(data?.pageSize || pageSize.value)
    selectedRowKeys.value = normalizedRows.filter((item) => item.checked).map((item) => item.id)
  } catch (error) {
    rows.value = []
    total.value = 0
    selectedRowKeys.value = []
    MessagePlugin.error(error.message || '国际化文案列表加载失败')
  } finally {
    loading.value = false
  }
}

async function fetchTagOptions () {
  try {
    const data = await listI18nWordTagsApi({
      projectId: route.params.projectId,
      keyword: '',
      page: 1,
      pageSize: 200
    })
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    tagRows.value = items.map((item) => item.name || item.tag).filter(Boolean)
  } catch (error) {
    tagRows.value = []
  }
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

function normalizeWordRow (item = {}) {
  const translations = normalizeTranslations(item)
  const valueType = normalizeValueType(item.valueType || item.wordType || item.type || detectTranslationsValueType(translations))
  const coverage = item.coverage || Object.values(translations).filter(hasTranslationValue).length
  const status = item.status || (Number(coverage) >= wordLocales.value.length ? '已完成' : '待发布')
  return {
    ...item,
    id: item.wordId || item.id || item.name || item.key,
    name: item.name || item.keyName || item.key || item.wordKey || '',
    status,
    statusTone: item.statusTone || getStatusTone(status),
    locale: item.locale || item.sourceLocale || sourceLocale.value,
    coverage: String(coverage || 0),
    updatedAt: formatDateTime(item.updatedAt || item.updateTime || item.modifiedAt),
    checked: Boolean(item.checked || item.selected),
    targetPlatforms: normalizeArray(item.targetPlatforms || item.platforms || item.targetPlatform || item.platform),
    targetPlatform: item.targetPlatform || item.platform || normalizeArray(item.targetPlatforms || item.platforms)?.[0] || '',
    platforms: normalizeArray(item.targetPlatforms || item.platforms || item.targetPlatform || item.platform),
    tags: normalizeArray(item.tags || item.tagNames || item.tag),
    description: item.description || '',
    valueType,
    translations
  }
}

function normalizeTranslations (item = {}) {
  if (Array.isArray(item.items)) {
    return normalizeTranslationsFromItems(item.items)
  }
  if (item.translations && typeof item.translations === 'object' && !Array.isArray(item.translations)) {
    return { ...item.translations }
  }
  if (item.values && typeof item.values === 'object' && !Array.isArray(item.values)) {
    return { ...item.values }
  }
  if (item.contents && typeof item.contents === 'object' && !Array.isArray(item.contents)) {
    return { ...item.contents }
  }
  const translationList = Array.isArray(item.translations) ? item.translations : Array.isArray(item.translationList) ? item.translationList : []
  return translationList.reduce((result, translation) => {
    const locale = translation.locale || translation.language || translation.lang || translation.code
    if (locale) result[locale] = translation.value || translation.text || translation.content || translation.translation || ''
    return result
  }, {})
}

function normalizeTranslationsFromItems (items = []) {
  return items.reduce((result, item) => {
    const arrayIndex = item.arrayIndex
    const pluralForm = item.pluralForm
    setItemTranslationValue(result, sourceLocale.value, arrayIndex, pluralForm, item.source)
    Object.entries(item.translations || {}).forEach(([locale, value]) => {
      setItemTranslationValue(result, locale, arrayIndex, pluralForm, value)
    })
    return result
  }, {})
}

function setItemTranslationValue (result, locale, arrayIndex, pluralForm, value) {
  const text = getTranslationText(value)
  if (arrayIndex !== null && arrayIndex !== undefined && pluralForm) {
    if (!Array.isArray(result[locale])) result[locale] = []
    if (!isPlainObject(result[locale][arrayIndex])) result[locale][arrayIndex] = createEmptyTranslationValue('plural')
    result[locale][arrayIndex][pluralForm] = text
    return
  }
  if (arrayIndex !== null && arrayIndex !== undefined) {
    if (!Array.isArray(result[locale])) result[locale] = []
    result[locale][arrayIndex] = text
    return
  }
  if (pluralForm) {
    if (!isPlainObject(result[locale])) result[locale] = createEmptyTranslationValue('plural')
    result[locale][pluralForm] = text
    return
  }
  result[locale] = text
}

function normalizeArray (value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  return String(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean)
}

function getStatusTone (status) {
  const toneMap = {
    已完成: 'success',
    待发布: 'warning',
    审核中: 'processing',
    审核失败: 'danger'
  }
  return toneMap[status] || 'default'
}

function formatDateTime (value) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
}

function normalizeValueType (value) {
  const typeMap = {
    normal: 'text',
    string: 'text',
    text: 'text',
    plural: 'plural',
    array: 'array',
    list: 'array',
    array_plural: 'array_plural',
    arrayplural: 'array_plural'
  }
  return typeMap[String(value || '').toLowerCase()] || 'text'
}

function detectTranslationsValueType (translations = {}) {
  const values = Object.values(translations)
  if (values.some((value) => Array.isArray(value) && value.some(hasPluralTranslationShape))) return 'array_plural'
  if (values.some(Array.isArray)) return 'array'
  if (values.some(hasPluralTranslationShape)) return 'plural'
  return 'text'
}

function isPlainObject (value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function hasPluralTranslationShape (value) {
  return isPlainObject(value) && pluralCategories.some((category) => Object.prototype.hasOwnProperty.call(value, category.value))
}

function createEmptyTranslationValue (valueType = 'text') {
  if (valueType === 'plural') {
    return pluralCategories.reduce((result, category) => {
      result[category.value] = ''
      return result
    }, {})
  }
  if (valueType === 'array') return ['']
  if (valueType === 'array_plural') return [createEmptyTranslationValue('plural')]
  return ''
}

function hasTranslationValue (value) {
  if (isPendingTranslationValue(value)) return false
  if (Array.isArray(value)) {
    return value.some((item) => hasTranslationValue(item))
  }
  if (isPlainObject(value)) {
    if (getDirectTranslationText(value)) return true
    return pluralCategories.some((category) => hasTranslationValue(value[category.value]))
  }
  return String(value || '').trim().length > 0
}

function formatTranslationValue (value, multiline = false) {
  if (isPendingTranslationValue(value)) return ''
  if (Array.isArray(value)) {
    const items = value
      .map((item, index) => {
        if (isPlainObject(item)) {
          const text = formatTranslationValue(item, multiline)
          return text ? `${index + 1}. ${text}` : ''
        }
        const text = String(item || '').trim()
        return text ? `${index + 1}. ${text}` : ''
      })
      .filter(Boolean)
    if (!items.length) return ''
    return multiline ? items.join('\n') : items.join(' / ')
  }
  if (isPlainObject(value)) {
    const directText = getDirectTranslationText(value)
    if (directText) return directText
    const pluralItems = pluralCategories
      .map((category) => [category.value, getTranslationText(value[category.value])])
      .filter(([, text]) => text)
    const items = [...pluralItems]
    if (!items.length) return ''
    return multiline ? items.map(([category, text]) => `${category}: ${text}`).join('\n') : items.map(([category, text]) => `${category}: ${text}`).join(' / ')
  }
  return String(value || '')
}

function getTranslationDisplayText (value, multiline = false) {
  return formatTranslationValue(value, multiline).trim()
}

function getDirectTranslationText (value) {
  if (!isPlainObject(value)) return ''
  if (isPendingTranslationValue(value)) return ''
  const textKeys = ['value', 'text', 'content', 'translation', 'translatedText', 'target', 'source', 'message']
  for (const key of textKeys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue
    const text = value[key]
    if (text === null || text === undefined || isPlainObject(text) || Array.isArray(text)) continue
    const normalizedText = String(text).trim()
    if (normalizedText) return normalizedText
  }
  return ''
}

function isPendingTranslationValue (value) {
  if (!isPlainObject(value)) return false
  const statusKeys = ['status', 'translationStatus', 'translateStatus', 'state']
  return statusKeys.some((key) => {
    const status = String(value[key] || '').trim().toLowerCase()
    return ['pending', 'todo', 'untranslated', 'waiting'].includes(status) || status.includes('待翻译') || status.includes('未翻译')
  })
}

function getTranslationText (value) {
  return formatTranslationValue(value, true).trim()
}

function transformTranslationValue (value, valueType) {
  if (valueType === 'plural') {
    const nextValue = createEmptyTranslationValue('plural')
    if (isPlainObject(value)) {
      const directText = getDirectTranslationText(value)
      if (directText) {
        nextValue.other = directText
        return nextValue
      }
      pluralCategories.forEach((category) => {
        nextValue[category.value] = getTranslationText(value[category.value])
      })
      return nextValue
    }
    if (Array.isArray(value)) {
      nextValue.other = value.map(getTranslationText).filter(Boolean).join('\n')
      return nextValue
    }
    nextValue.other = String(value || '')
    return nextValue
  }
  if (valueType === 'array') {
    if (Array.isArray(value)) return value.length ? value.map(getTranslationText) : ['']
    if (isPlainObject(value)) {
      const directText = getDirectTranslationText(value)
      if (directText) return [directText]
      const items = pluralCategories.map((category) => getTranslationText(value[category.value])).filter(Boolean)
      return items.length ? items : ['']
    }
    return String(value || '').trim() ? [String(value || '')] : ['']
  }
  if (valueType === 'array_plural') {
    if (Array.isArray(value)) {
      const items = value.map((item) => transformTranslationValue(item, 'plural'))
      return items.length ? items : [createEmptyTranslationValue('plural')]
    }
    if (isPlainObject(value)) return [transformTranslationValue(value, 'plural')]
    return String(value || '').trim() ? [transformTranslationValue(value, 'plural')] : [createEmptyTranslationValue('plural')]
  }
  return formatTranslationValue(value, true)
}

function normalizeTranslationsForType (translations, valueType) {
  return wordLocales.value.reduce((result, locale) => {
    const value = transformTranslationValue(translations?.[locale.value], valueType)
    if (valueType === 'plural') {
      result[locale.value] = pluralCategories.reduce((nextValue, category) => {
        nextValue[category.value] = String(value[category.value] || '').trim()
        return nextValue
      }, {})
    } else if (valueType === 'array') {
      const items = Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean) : []
      result[locale.value] = items.length ? items : ['']
    } else if (valueType === 'array_plural') {
      const items = Array.isArray(value)
        ? value.map((item) => transformTranslationValue(item, 'plural')).filter(hasTranslationValue)
        : []
      result[locale.value] = items.length ? items : [createEmptyTranslationValue('plural')]
    } else {
      result[locale.value] = String(value || '').trim()
    }
    return result
  }, {})
}

function getVisibleTags (tags = []) {
  return tags.slice(0, 2)
}

function getHiddenTags (tags = []) {
  return tags.slice(2)
}

function createEmptyWordForm (valueType = 'text') {
  return {
    name: '',
    valueType,
    targetPlatforms: [],
    description: '',
    tags: [],
    translations: wordLocales.value.reduce((result, locale) => {
      result[locale.value] = createEmptyTranslationValue(valueType)
      return result
    }, {})
  }
}

function createLegacyImportForm (type = 'csv') {
  const config = legacyImportConfigs[type] || legacyImportConfigs.csv
  return {
    type,
    content: config.placeholder,
    locale: sourceLocale.value,
    platforms: [...(config.defaultPlatforms || [])],
    tags: [...(config.defaultTags || [])],
    languageMappings: [
      { id: 'zh-CN', locale: 'zh-CN', locked: true },
      { id: 'zh-TW', locale: 'zh-TW', locked: true },
      { id: 'en', locale: 'en', locked: true }
    ]
  }
}

function openWordDrawer (row) {
  editingWordId.value = row?.id || ''
  const valueType = normalizeValueType(row?.valueType || detectTranslationsValueType(row?.translations || {}))
  wordForm.value = row ? {
    name: row.name,
    valueType,
    targetPlatforms: normalizeProjectPlatforms(row.targetPlatforms || row.platforms || row.targetPlatform || row.platform),
    description: row.description || '',
    tags: [...(row.tags || [])],
    translations: normalizeTranslationsForType({
      ...createEmptyWordForm(valueType).translations,
      ...(row.translations || {})
    }, valueType)
  } : createEmptyWordForm('text')
  drawerVisible.value = true
}

function closeWordDrawer () {
  drawerVisible.value = false
  editingWordId.value = ''
}

function handleRowClick ({ row }) {
  openWordDrawer(row)
}

function handleValueTypeChange (valueType) {
  const nextType = normalizeValueType(valueType)
  wordForm.value.valueType = nextType
  wordForm.value.translations = normalizeTranslationsForType(wordForm.value.translations, nextType)
}

function addArrayItem (localeValue) {
  if (!Array.isArray(wordForm.value.translations[localeValue])) {
    wordForm.value.translations[localeValue] = [createEmptyTranslationValue(wordForm.value.valueType === 'array_plural' ? 'plural' : 'text')]
  }
  wordForm.value.translations[localeValue].push(createEmptyTranslationValue(wordForm.value.valueType === 'array_plural' ? 'plural' : 'text'))
}

function removeArrayItem (localeValue, index) {
  if (!Array.isArray(wordForm.value.translations[localeValue])) {
    wordForm.value.translations[localeValue] = ['']
    return
  }
  wordForm.value.translations[localeValue].splice(index, 1)
  if (!wordForm.value.translations[localeValue].length) {
    wordForm.value.translations[localeValue].push(createEmptyTranslationValue(wordForm.value.valueType === 'array_plural' ? 'plural' : 'text'))
  }
}

function openLegacyImportDialog (data = {}) {
  legacyImportForm.value = createLegacyImportForm(data.value || 'csv')
  legacyLanguageToAdd.value = ''
  legacyDraggingLanguageIndex.value = -1
  legacyImportVisible.value = true
}

function closeLegacyImportDialog () {
  legacyImportVisible.value = false
}

function addLegacyLanguage () {
  if (!legacyLanguageToAdd.value) {
    MessagePlugin.warning('请选择要增加的语种')
    return
  }

  legacyImportForm.value.languageMappings.push({
    id: `locale-${legacyLanguageToAdd.value}-${Date.now()}`,
    locale: legacyLanguageToAdd.value,
    locked: false
  })
  legacyLanguageToAdd.value = ''
}

function removeLegacyLanguage (id) {
  legacyImportForm.value.languageMappings = legacyImportForm.value.languageMappings.filter((item) => item.id !== id)
}

function handleLegacyLanguageDragStart (index) {
  legacyDraggingLanguageIndex.value = index
}

function handleLegacyLanguageDrop (targetIndex) {
  const sourceIndex = legacyDraggingLanguageIndex.value
  if (sourceIndex < 0 || sourceIndex === targetIndex) return

  const mappings = [...legacyImportForm.value.languageMappings]
  const [item] = mappings.splice(sourceIndex, 1)
  mappings.splice(targetIndex, 0, item)
  legacyImportForm.value.languageMappings = mappings
  legacyDraggingLanguageIndex.value = -1
}

function getLegacyLanguageLabel (localeValue) {
  const locale = getLocaleMeta(localeValue)
  return `${locale.label}（${locale.value}）`
}

async function importLegacyWords () {
  const records = parseLegacyImportRecords()

  if (!records.length) {
    MessagePlugin.warning('未解析到可导入的文案')
    return
  }

  try {
    await importI18nWordsApi({
      projectId: route.params.projectId,
      type: legacyImportForm.value.type,
      items: records,
      rawContent: legacyImportForm.value.content
    })
    legacyImportVisible.value = false
    page.value = 1
    await fetchRows()
    await fetchTagOptions()
    MessagePlugin.success(`已导入 ${records.length} 条文案`)
  } catch (error) {
    MessagePlugin.error(error.message || '导入失败')
  }
}

function mergeImportedWordRow (row, importedRow) {
  const translations = {
    ...(row.translations || {}),
    ...(importedRow.translations || {})
  }
  const coverage = Object.values(translations).filter(hasTranslationValue).length
  return {
    ...row,
    translations,
    status: coverage === wordLocales.value.length ? '已完成' : '待发布',
    statusTone: coverage === wordLocales.value.length ? 'success' : 'warning',
    coverage: String(coverage),
    updatedAt: importedRow.updatedAt,
    platforms: [...new Set([...(row.platforms || []), ...(importedRow.platforms || [])])],
    tags: [...new Set([...(row.tags || []), ...(importedRow.tags || [])])]
  }
}

function parseLegacyImportRecords () {
  const content = legacyImportForm.value.content
  if (legacyImportForm.value.type === 'androidXml') {
    return parseAndroidXml(content).map((item) => buildSingleLocaleWordRow(item)).filter(Boolean)
  }
  if (legacyImportForm.value.type === 'ios') {
    return parseIosStrings(content).map((item) => buildSingleLocaleWordRow(item)).filter(Boolean)
  }
  if (legacyImportForm.value.type === 'webJson') {
    return parseWebJson(content).map((item) => buildSingleLocaleWordRow(item)).filter(Boolean)
  }

  return parseCsv(content)
    .map((columns) => buildLegacyWordRow(columns))
    .filter(Boolean)
}

function buildLegacyWordRow (columns) {
  const translations = createEmptyWordForm().translations
  const name = (columns[0] || '').trim()
  const platformText = (columns[columns.length - 1] || '').trim()
  const platforms = platformText
    ? platformText.split(/[|;]/).map(normalizePlatformValue).filter(Boolean)
    : [...legacyImportForm.value.platforms]

  legacyImportForm.value.languageMappings.forEach((mapping, index) => {
    const value = (columns[index + 1] || '').trim()
    if (value) translations[mapping.locale] = value
  })

  if (!name || !hasTranslationValue(translations[sourceLocale.value])) return null
  const coverage = Object.values(translations).filter(hasTranslationValue).length
  return {
    id: `i18n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    status: coverage === wordLocales.value.length ? '已完成' : '待发布',
    statusTone: coverage === wordLocales.value.length ? 'success' : 'warning',
    locale: sourceLocale.value,
    coverage: String(coverage),
    updatedAt: '2026-05-27 00:00',
    checked: false,
    platforms: [...new Set(platforms)],
    tags: [],
    translations
  }
}

function buildSingleLocaleWordRow ({ name, value }) {
  const translations = createEmptyWordForm().translations
  const key = (name || '').trim()
  const wordText = (value || '').trim()
  const locale = legacyImportForm.value.locale || sourceLocale.value
  const platforms = (legacyImportForm.value.platforms || []).map(normalizePlatformValue).filter(Boolean)
  const tags = (legacyImportForm.value.tags || []).map((item) => item.trim()).filter(Boolean)
  if (!key || !wordText) return null

  translations[locale] = wordText
  return {
    id: `i18n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: key,
    status: '待发布',
    statusTone: 'warning',
    locale,
    coverage: '1',
    updatedAt: '2026-05-27 00:00',
    checked: false,
    platforms: [...new Set(platforms)],
    tags: [...new Set(tags)],
    translations
  }
}

function normalizePlatformValue (value) {
  const platform = String(value || '').trim()
  const lower = platform.toLowerCase()
  const platformMap = {
    app: 'APP',
    android: 'Android',
    ios: 'iOS',
    web: 'Web',
    miniapp: 'MiniApp',
    miniprogram: 'MiniApp',
    'mini-app': 'MiniApp'
  }
  return platformMap[lower] || platform
}

function parseCsv (content) {
  const rows = []
  let current = ''
  let record = []
  let quoted = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const nextChar = content[index + 1]
    if (char === '"' && quoted && nextChar === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      record.push(current)
      current = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && nextChar === '\n') index += 1
      record.push(current)
      if (record.some((value) => value.trim())) rows.push(record)
      record = []
      current = ''
    } else {
      current += char
    }
  }

  record.push(current)
  if (record.some((value) => value.trim())) rows.push(record)
  return rows
}

function parseAndroidXml (content) {
  if (!content.trim()) return []

  try {
    const parser = new DOMParser()
    const document = parser.parseFromString(content, 'application/xml')
    if (document.querySelector('parsererror')) return []

    return Array.from(document.querySelectorAll('string'))
      .map((node) => ({
        name: node.getAttribute('name') || '',
        value: node.textContent || ''
      }))
      .filter((item) => item.name.trim() && item.value.trim())
  } catch (error) {
    return []
  }
}

function parseIosStrings (content) {
  const rows = []
  const pattern = /"((?:\\.|[^"\\])*)"\s*=\s*"((?:\\.|[^"\\])*)"\s*;/g
  let match = pattern.exec(content)

  while (match) {
    rows.push({
      name: unescapeLegacyString(match[1]),
      value: unescapeLegacyString(match[2])
    })
    match = pattern.exec(content)
  }

  return rows
}

function parseWebJson (content) {
  if (!content.trim()) return []

  try {
    const data = JSON.parse(content)
    return flattenJsonWordEntries(data)
  } catch (error) {
    return []
  }
}

function flattenJsonWordEntries (value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []

  return Object.entries(value).flatMap(([key, item]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key
    if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
      return [{ name: nextKey, value: String(item) }]
    }
    return flattenJsonWordEntries(item, nextKey)
  })
}

function unescapeLegacyString (value) {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

function translateAll () {
  wordLocales.value
    .filter((locale) => locale.value !== sourceLocale.value)
    .forEach((locale) => translateLocale(locale.value, false))
  MessagePlugin.success('已根据源文案生成翻译草稿')
}

function translateLocale (localeValue, notify = true) {
  const sourceValue = wordForm.value.translations[sourceLocale.value]
  if (!hasTranslationValue(sourceValue)) {
    MessagePlugin.warning('请先填写中文源文案')
    return
  }

  const locale = wordLocales.value.find((item) => item.value === localeValue)
  const suffix = `（${locale?.shortLabel || localeValue}翻译）`
  if (wordForm.value.valueType === 'plural') {
    wordForm.value.translations[localeValue] = pluralCategories.reduce((result, category) => {
      const text = String(sourceValue?.[category.value] || '').trim()
      result[category.value] = text ? `${text}${suffix}` : ''
      return result
    }, createEmptyTranslationValue('plural'))
  } else if (wordForm.value.valueType === 'array_plural') {
    const sourceItems = Array.isArray(sourceValue) ? sourceValue : []
    const nextItems = sourceItems
      .map((item) => transformTranslationValue(item, 'plural'))
      .filter(hasTranslationValue)
      .map((item) => pluralCategories.reduce((result, category) => {
        const text = String(item[category.value] || '').trim()
        result[category.value] = text ? `${text}${suffix}` : ''
        return result
      }, createEmptyTranslationValue('plural')))
    wordForm.value.translations[localeValue] = nextItems.length ? nextItems : [createEmptyTranslationValue('plural')]
  } else if (wordForm.value.valueType === 'array') {
    const sourceItems = Array.isArray(sourceValue) ? sourceValue : []
    const nextItems = sourceItems.map((item) => String(item || '').trim()).filter(Boolean).map((item) => `${item}${suffix}`)
    wordForm.value.translations[localeValue] = nextItems.length ? nextItems : ['']
  } else {
    wordForm.value.translations[localeValue] = `${String(sourceValue || '').trim()}${suffix}`
  }
  if (notify) {
    MessagePlugin.success(`${locale?.shortLabel || localeValue}已生成翻译草稿`)
  }
}

async function saveWord () {
  const name = wordForm.value.name.trim()
  if (!name) {
    MessagePlugin.warning('请输入 Key 名称')
    return
  }
  if (!hasTranslationValue(wordForm.value.translations[sourceLocale.value])) {
    MessagePlugin.warning('请输入源文案')
    return
  }

  const valueType = normalizeValueType(wordForm.value.valueType)
  const translations = normalizeTranslationsForType(wordForm.value.translations, valueType)
  const shouldSendEmptyTranslations = Boolean(editingWordId.value)
  const targetPlatforms = normalizeProjectPlatforms(wordForm.value.targetPlatforms)
  const placeholderConverter = shouldConvertToCommonPlaceholders(targetPlatforms)
    ? convertPlatformPlaceholdersToCommon
    : (value) => value
  const payload = {
    projectId: route.params.projectId,
    keyName: name,
    targetPlatforms,
    platforms: targetPlatforms,
    tags: [...wordForm.value.tags],
    valueType,
    description: wordForm.value.description.trim(),
    items: buildSaveItems(translations, valueType, shouldSendEmptyTranslations, placeholderConverter)
  }

  try {
    await saveI18nWordApi(payload)
    if (!editingWordId.value) page.value = 1
    MessagePlugin.success(editingWordId.value ? '文案已更新' : '文案已创建')
    await fetchRows()
    await fetchTagOptions()
    closeWordDrawer()
  } catch (error) {
    MessagePlugin.error(error.message || '保存失败')
  }
}

function buildSaveItems (translations, valueType, shouldSendEmptyTranslations = false, placeholderConverter = (value) => value) {
  if (valueType === 'plural') {
    return pluralCategories
      .map((category) => buildSaveItem(translations, null, category.value, shouldSendEmptyTranslations, placeholderConverter))
      .filter((item) => hasSaveItemValue(item))
  }
  if (valueType === 'array') {
    const sourceItems = Array.isArray(translations[sourceLocale.value]) ? translations[sourceLocale.value] : []
    const maxLength = Math.max(1, sourceItems.length, ...targetLocales.value.map((locale) => Array.isArray(translations[locale.value]) ? translations[locale.value].length : 0))
    return Array.from({ length: maxLength }, (_, index) => buildSaveItem(translations, index, null, shouldSendEmptyTranslations, placeholderConverter))
      .filter((item) => hasSaveItemValue(item))
  }
  if (valueType === 'array_plural') {
    const sourceItems = Array.isArray(translations[sourceLocale.value]) ? translations[sourceLocale.value] : []
    const maxLength = Math.max(1, sourceItems.length, ...targetLocales.value.map((locale) => Array.isArray(translations[locale.value]) ? translations[locale.value].length : 0))
    return Array.from({ length: maxLength }).flatMap((_, index) => {
      return pluralCategories
        .map((category) => buildSaveItem(translations, index, category.value, shouldSendEmptyTranslations, placeholderConverter))
        .filter((item) => hasSaveItemValue(item))
    })
  }
  return [buildSaveItem(translations, null, null, shouldSendEmptyTranslations, placeholderConverter)].filter((item) => hasSaveItemValue(item))
}

function buildSaveItem (translations, arrayIndex, pluralForm, shouldSendEmptyTranslations = false, placeholderConverter = (value) => value) {
  return {
    arrayIndex,
    pluralForm,
    source: getSaveTranslationText(translations[sourceLocale.value], arrayIndex, pluralForm, placeholderConverter),
    translations: targetLocales.value.reduce((result, locale) => {
      const value = getSaveTranslationText(translations[locale.value], arrayIndex, pluralForm, placeholderConverter)
      if (value) {
        result[locale.value] = value
      } else if (shouldSendEmptyTranslations) {
        result[locale.value] = null
      }
      return result
    }, {})
  }
}

function getSaveTranslationText (value, arrayIndex, pluralForm, placeholderConverter = (nextValue) => nextValue) {
  let text = ''
  if (arrayIndex !== null && arrayIndex !== undefined) {
    const item = Array.isArray(value) ? value[arrayIndex] : undefined
    text = pluralForm ? getTranslationText(item?.[pluralForm]) : getTranslationText(item)
  } else if (pluralForm) {
    text = getTranslationText(value?.[pluralForm])
  } else {
    text = getTranslationText(value)
  }
  return placeholderConverter(text)
}

function hasSaveItemValue (item) {
  return Boolean(item.source || Object.values(item.translations || {}).some((value) => value !== null && value !== undefined && String(value).trim()))
}

function handleDelete (row) {
  const confirmDialog = DialogPlugin.confirm({
    header: '删除文案',
    body: h('div', { class: 'i18n-word-delete-confirm' }, [
      h('p', { class: 'i18n-word-delete-confirm-title' }, `确认删除 ${row.name}？`),
      h('p', '删除已发布的文案存在风险，删除前须确认文案是否已弃用。')
    ]),
    confirmBtn: '确认删除',
    cancelBtn: '取消',
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteI18nWordApi(row.id, { projectId: route.params.projectId })
        selectedRowKeys.value = selectedRowKeys.value.filter((id) => id !== row.id)
        await fetchRows()
        await fetchTagOptions()
        MessagePlugin.success('文案已删除')
        confirmDialog.hide()
      } catch (error) {
        MessagePlugin.error(error.message || '删除失败')
      }
    }
  })
}
</script>
