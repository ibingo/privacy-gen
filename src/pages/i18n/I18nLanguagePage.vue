<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="语种"
    :show-breadcrumb="false"
    :total-text="`共 ${filteredRows.length} 项`"
    :columns="columns"
    :data="filteredRows"
    :loading="languagesLoading"
    :page-size="10"
    :page-size-options="[10, 20, 50]"
    search-placeholder="搜索中文名、Code、Name 或 Locale"
  >
    <template #actions>
      <div class="i18n-language-column-toggle">
        <span>Code:</span>
        <t-checkbox-group v-model="visibleCodeColumns">
          <t-checkbox
            v-for="column in optionalCodeColumns"
            :key="column.value"
            :value="column.value"
          >
            {{ column.label }}
          </t-checkbox>
        </t-checkbox-group>
      </div>
    </template>

    <template #filters>
      <t-select v-model="codeTypeFilter" class="starter-list-filter-select" placeholder="代码类型">
        <t-option value="all" label="全部代码" />
        <t-option value="standard" label="标准代码完整" />
        <t-option value="platform" label="平台代码完整" />
      </t-select>
      <t-select v-model="regionFilter" class="starter-list-filter-select" placeholder="区域">
        <t-option value="all" label="全部区域" />
        <t-option v-for="region in regionOptions" :key="region.value" :value="region.value" :label="region.label" />
      </t-select>
    </template>

    <template #name="{ row }">
      <span class="i18n-language-text">{{ row.name }}</span>
    </template>

    <template #regionName="{ row }">
      <span class="i18n-language-text">{{ row.regionName }}</span>
    </template>

    <template #locale="{ row }">
      <span class="i18n-language-text">{{ row.locale }}</span>
    </template>
  </starter-list-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  Checkbox as TCheckbox,
  CheckboxGroup as TCheckboxGroup,
  MessagePlugin,
  Option as TOption,
  Select as TSelect
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import { getPgyerexLangRegionName } from '../../config/PgyerexLangSupport'
import { useI18nLanguages } from '../../composables/useI18nLanguages'

const keyword = ref('')
const codeTypeFilter = ref('all')
const regionFilter = ref('all')
const visibleCodeColumns = ref([])
const {
  languageRows,
  loading: languagesLoading,
  loadLanguages
} = useI18nLanguages()

const optionalCodeColumns = [
  { value: 'twoLettersCode', label: 'Two-letters', title: 'Two-letters', width: 130 },
  { value: 'threeLettersCode', label: 'Three-letters', title: 'Three-letters', width: 140 },
  { value: 'androidCode', label: 'Android', title: 'Android', width: 150 },
  { value: 'osxCode', label: 'OSX', title: 'OSX', width: 150 },
  { value: 'osxLocale', label: 'OSX Locale', title: 'OSX Locale', width: 150 }
]

const regionOptions = computed(() => [...new Set(languageRows.value.map((item) => item.region))]
  .filter((region) => region !== '未指定')
  .sort((a, b) => a.localeCompare(b))
  .map((region) => ({
    value: region,
    label: `${getPgyerexLangRegionName(region)} (${region})`
  })))

const columns = computed(() => [
  { colKey: 'regionName', title: '中文名', width: 180 },
  { colKey: 'code', title: 'Code', width: 120 },
  { colKey: 'name', title: 'Name', minWidth: 220 },
  { colKey: 'locale', title: 'Locale', width: 160 },
  ...optionalCodeColumns
    .filter((column) => visibleCodeColumns.value.includes(column.value))
    .map((column) => ({
      colKey: column.value,
      title: column.title,
      width: column.width
    }))
])

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()

  return languageRows.value.filter((item) => {
    const searchable = [
      item.name,
      item.code,
      item.editorCode,
      item.twoLettersCode,
      item.threeLettersCode,
      item.locale,
      item.androidCode,
      item.osxCode,
      item.osxLocale,
      item.region,
      item.regionName
    ].join(' ').toLowerCase()

    const matchKeyword = !q || searchable.includes(q)
    const matchRegion = regionFilter.value === 'all' || item.region === regionFilter.value
    const matchCodeType =
      codeTypeFilter.value === 'all' ||
      (codeTypeFilter.value === 'standard' && item.twoLettersCode && item.threeLettersCode && item.locale) ||
      (codeTypeFilter.value === 'platform' && item.androidCode && item.osxCode && item.osxLocale)

    return matchKeyword && matchRegion && matchCodeType
  })
})

onMounted(() => {
  loadLanguages().catch((error) => {
    MessagePlugin.error(error.message || '语种数据加载失败，已使用本地缓存')
  })
})
</script>
