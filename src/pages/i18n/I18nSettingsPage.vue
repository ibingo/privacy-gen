<template>
  <div class="i18n-settings-page">
    <section class="i18n-settings-card">
      <div class="i18n-settings-header">
        <div>
          <h3>语种</h3>
          <p>源语种来自项目接口且不可编辑，目标语种只支持新增。</p>
        </div>
        <t-button theme="primary" :loading="projectSaving" @click="handleLanguageSaveConfirm">保存</t-button>
      </div>

      <t-form class="i18n-settings-form" :data="formData" label-align="top">
        <t-form-item label="源语种" required-mark>
          <t-select
            v-model="formData.sourceLocale"
            :loading="projectLoading || languagesLoading"
            filterable
            disabled
            placeholder="请选择源语种"
          >
            <t-option
              v-for="locale in localeOptions"
              :key="locale.value"
              :value="locale.value"
              :label="locale.label"
            >
              <div class="i18n-settings-locale-option">
                <span>{{ locale.label }}</span>
                <t-tag variant="light" size="small">{{ locale.value }}</t-tag>
                <t-tag v-if="locale.locale" variant="light" size="small">{{ locale.locale }}</t-tag>
              </div>
            </t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="目标语种" required-mark>
          <t-transfer
            v-model="formData.targetLocales"
            class="i18n-settings-locale-transfer"
            :data="targetLocaleTransferData"
            :disabled="projectLoading || languagesLoading"
            :search="transferSearchOptions"
            :title="['可添加语种', '已选目标语种']"
            :operation="['移除', '添加']"
            target-sort="push"
            @change="handleTargetLocalesChange"
          />
        </t-form-item>
      </t-form>
    </section>

    <section class="i18n-settings-card">
      <div class="i18n-settings-header">
        <div>
          <h3>AI 翻译来源</h3>
          <p>选择当前项目的一键翻译服务，也可以直接添加新的全局 AI 服务。</p>
        </div>
        <t-button theme="primary" @click="openAiServiceDrawer()">
          添加 AI 服务
        </t-button>
      </div>

      <t-form class="i18n-settings-form" :data="formData" label-align="top">
        <t-form-item label="默认 AI 翻译来源">
          <t-select
            v-model="formData.aiTranslationServiceId"
            filterable
            clearable
            placeholder="请选择 AI 翻译来源"
          >
            <t-option
              v-for="service in aiServices"
              :key="service.id"
              :value="service.id"
              :label="service.name"
            >
              <div class="i18n-settings-ai-option">
                <span>{{ service.name }}</span>
                <t-tag variant="light" size="small">{{ service.model }}</t-tag>
              </div>
            </t-option>
          </t-select>
          <template #help>这里选择的服务将用于文案列表中的一键翻译。</template>
        </t-form-item>
      </t-form>

      <div v-if="selectedAiService" class="i18n-settings-ai-card">
        <div>
          <strong>{{ selectedAiService.name }}</strong>
          <p>{{ selectedAiService.endpoint }}</p>
        </div>
        <div class="i18n-settings-ai-tags">
          <t-tag theme="primary" variant="light">{{ getProviderLabel(selectedAiService.provider) }}</t-tag>
          <t-tag variant="light">{{ selectedAiService.model }}</t-tag>
          <t-tag :theme="selectedAiService.status === 'enabled' ? 'success' : 'default'" variant="light">
            {{ selectedAiService.status === 'enabled' ? '启用' : '停用' }}
          </t-tag>
        </div>
        <t-button variant="outline" size="small" @click="openAiServiceDrawer(selectedAiService)">编辑</t-button>
      </div>

      <div v-else class="i18n-settings-empty">
        <span>暂无默认 AI 翻译来源</span>
        <p>添加或选择服务后，文案新建、编辑和批量翻译可以复用这份配置。</p>
      </div>
    </section>

    <section class="i18n-settings-card">
      <div class="i18n-settings-header">
        <div>
          <h3>占位符配置</h3>
          <p>配置文案中可识别的占位符格式，Android、iOS 和通用占位符默认开启。</p>
        </div>
        <t-button theme="primary" @click="handleLocalSettingsSave">保存配置</t-button>
      </div>

      <div class="i18n-placeholder-config-list">
        <div v-for="item in formData.placeholderConfigs" :key="item.key" class="i18n-placeholder-config-row">
          <div class="i18n-placeholder-config-main">
            <strong>{{ item.label }}</strong>
            <p>{{ item.description }}</p>
            <t-tag variant="light" size="small">{{ item.example }}</t-tag>
          </div>
          <t-switch v-model="item.enabled" :label="['已开启', '已关闭']" />
        </div>
      </div>
    </section>

    <section class="i18n-settings-card">
      <div class="i18n-settings-header">
        <div>
          <h3>Webhook</h3>
          <p>在文案创建、更新、删除和导入后向指定 URL 发送事件通知。</p>
        </div>
        <t-button theme="primary" @click="openWebhookDialog">添加 Webhook</t-button>
      </div>

      <div v-if="webhooks.length" class="i18n-webhook-list">
        <div v-for="item in webhooks" :key="item.id" class="i18n-webhook-row">
          <div class="i18n-webhook-row-main">
            <span class="i18n-webhook-status" :class="{ 'is-disabled': !item.enabled }"></span>
            <div>
              <strong>{{ item.url }}</strong>
              <div class="i18n-webhook-event-tags">
                <span>监听事件：</span>
                <t-tag
                  v-for="event in getVisibleEvents(item.events)"
                  :key="event"
                  theme="primary"
                  variant="light"
                  size="small"
                >
                  {{ event }}
                </t-tag>
                <t-popup
                  v-if="getHiddenEvents(item.events).length"
                  trigger="hover"
                  placement="top"
                  overlay-inner-class-name="i18n-webhook-events-popup"
                >
                  <t-tag theme="default" variant="light" size="small">+{{ getHiddenEvents(item.events).length }} 个</t-tag>
                  <template #content>
                    <div class="i18n-webhook-events-popup-content">
                      <strong>所有监听事件</strong>
                      <div>
                        <t-tag
                          v-for="event in item.events"
                          :key="event"
                          theme="primary"
                          variant="light"
                          size="small"
                        >
                          {{ event }}
                        </t-tag>
                      </div>
                    </div>
                  </template>
                </t-popup>
              </div>
            </div>
          </div>
          <t-space size="small">
            <t-button variant="outline" size="small" @click="openWebhookDialog(item)">编辑</t-button>
            <t-popconfirm
              content="确认删除该 Webhook？"
              theme="danger"
              placement="top-right"
              confirm-btn="删除"
              cancel-btn="取消"
              @confirm="removeWebhook(item.id)"
            >
              <t-button theme="danger" variant="text" size="small">删除</t-button>
            </t-popconfirm>
          </t-space>
        </div>
      </div>

      <div v-else class="i18n-settings-empty">
        <span>暂无 Webhook</span>
        <p>添加后，系统会在订阅事件发生时向你的服务端发送 POST 请求。</p>
      </div>
    </section>

    <t-dialog
      v-model:visible="webhookDialogVisible"
      :header="editingWebhookId ? '编辑 Webhook' : '添加 Webhook'"
      width="720px"
      :confirm-btn="editingWebhookId ? '保存 Webhook' : '创建 Webhook'"
      :close-on-overlay-click="false"
      @confirm="saveWebhook"
      @cancel="closeWebhookDialog"
      @close="closeWebhookDialog"
    >
      <div class="i18n-webhook-dialog">
        <t-alert theme="info">
          当订阅的事件发生时，我们会向你指定的 URL 发送 POST 请求。签名密钥用于生成请求签名
          <code>x-webhook-signature</code>，以验证请求来源的真实性。
        </t-alert>

        <t-form class="i18n-webhook-form" :data="webhookForm" label-align="top">
          <t-form-item label="Webhook URL" required-mark>
            <t-input
              v-model="webhookForm.url"
              clearable
              placeholder="https://api.your-domain.com/webhooks/privacy-gen"
            >
              <template #prefixIcon>POST</template>
            </t-input>
          </t-form-item>

          <t-form-item label="签名密钥（Secret）">
            <t-input
              v-model="webhookForm.secret"
              clearable
              type="password"
              placeholder="点击右侧按钮生成随机密钥"
            />
            <template #help>用于验证 Webhook 请求的签名，建议使用随机生成的强密钥。</template>
          </t-form-item>

          <t-form-item>
            <t-button variant="outline" @click="generateSecret">随机生成</t-button>
          </t-form-item>

          <t-form-item label="订阅事件" required-mark>
            <div class="i18n-webhook-event-options">
              <label
                v-for="event in webhookEvents"
                :key="event.value"
                class="i18n-webhook-event-option"
              >
                <t-checkbox v-model="webhookForm.events" :value="event.value" />
                <span>
                  <strong>{{ event.value }}</strong>
                  <small>{{ event.label }}</small>
                </span>
              </label>
            </div>
          </t-form-item>

          <t-form-item label="状态">
            <t-switch v-model="webhookForm.enabled" :label="['已启用', '已禁用']" />
            <template #help>禁用后，该 Webhook 将不会接收任何事件通知。</template>
          </t-form-item>
        </t-form>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="languageConfirmVisible"
      header="确认保存语种设置"
      width="520px"
      confirm-btn="确认保存"
      cancel-btn="取消"
      :confirm-loading="projectSaving"
      :close-on-overlay-click="false"
      @confirm="confirmLanguageSave"
      @cancel="closeLanguageConfirm"
      @close="closeLanguageConfirm"
    >
      <div class="i18n-language-confirm-dialog">
        <p>确认新增目标语种：{{ pendingAddedLocaleLabels }}？保存后已有目标语种不支持减少。</p>
        <t-checkbox v-model="fillExistingWords">
          为该语种增加已有文案记录
        </t-checkbox>
      </div>
    </t-dialog>

    <ai-translation-service-drawer
      v-model:visible="aiServiceDrawerVisible"
      :service="editingAiService"
      @saved="saveAiService"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Alert as TAlert,
  Button as TButton,
  Checkbox as TCheckbox,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Popconfirm as TPopconfirm,
  Popup as TPopup,
  Select as TSelect,
  Space as TSpace,
  Switch as TSwitch,
  Tag as TTag,
  Transfer as TTransfer
} from 'tdesign-vue-next'
import AiTranslationServiceDrawer from '../../components/AiTranslationServiceDrawer.vue'
import { useI18nLanguages } from '../../composables/useI18nLanguages'
import { normalizePlaceholderConfigs, readI18nSettings, writeI18nSettings } from '../../config/i18nSettings'
import {
  aiProviderOptions,
  readAiTranslationServices,
  upsertAiTranslationService
} from '../../config/aiTranslationServices'
import { addI18nProjectLanguagesApi, getI18nProjectDetailApi } from '../../api/i18nWords'

const route = useRoute()

const {
  languageOptions,
  loading: languagesLoading,
  loadLanguages
} = useI18nLanguages()

const localeOptions = computed(() => languageOptions.value)

const webhookEvents = [
  { value: 'key.created', label: '创建文案' },
  { value: 'key.deleted', label: '删除文案' },
  { value: 'key.updated', label: '更新文案' },
  { value: 'key.imported', label: '导入文案' },
  { value: 'key.tags.created', label: '批量添加标签' },
  { value: 'key.tags.deleted', label: '批量删除标签' }
]

const settings = readI18nSettings()
const projectLoading = ref(false)
const projectSaving = ref(false)
const lockedTargetLocales = ref([])
const formData = reactive({
  sourceLocale: settings.sourceLocale,
  targetLocales: [...settings.targetLocales],
  aiTranslationServiceId: settings.aiTranslationServiceId,
  placeholderConfigs: normalizePlaceholderConfigs(settings.placeholderConfigs)
})
const webhooks = ref(normalizeWebhooks(settings))
const aiServices = ref(readAiTranslationServices())
const aiServiceDrawerVisible = ref(false)
const editingAiService = ref(null)
const webhookDialogVisible = ref(false)
const editingWebhookId = ref('')
const languageConfirmVisible = ref(false)
const pendingAddedLocales = ref([])
const fillExistingWords = ref(false)
const webhookForm = reactive({
  url: '',
  secret: '',
  events: [],
  enabled: true
})

const targetLocaleOptions = computed(() => {
  return localeOptions.value.filter((locale) => locale.value !== formData.sourceLocale)
})
const targetLocaleTransferData = computed(() => {
  return targetLocaleOptions.value.map((locale) => ({
    value: locale.value,
    label: locale.locale ? `${locale.label} / ${locale.value} / ${locale.locale}` : `${locale.label} / ${locale.value}`,
    disabled: lockedTargetLocales.value.includes(locale.value)
  }))
})
const transferSearchOptions = [
  { placeholder: '搜索可添加语种' },
  { placeholder: '搜索已选语种' }
]
const pendingAddedLocaleLabels = computed(() => pendingAddedLocales.value.map(getLocaleLabel).join('、'))

onMounted(() => {
  loadLanguages().catch((error) => {
    MessagePlugin.error(error.message || '语种数据加载失败，已使用本地缓存')
  })
  fetchProjectSettings()
})

const selectedAiService = computed(() => {
  return aiServices.value.find((item) => item.id === formData.aiTranslationServiceId)
})

const persistSettings = () => {
  const savedSettings = writeI18nSettings({
    sourceLocale: formData.sourceLocale,
    targetLocales: formData.targetLocales,
    aiTranslationServiceId: formData.aiTranslationServiceId,
    placeholderConfigs: formData.placeholderConfigs,
    webhooks: webhooks.value
  })
  formData.sourceLocale = savedSettings.sourceLocale
  formData.targetLocales = [...savedSettings.targetLocales]
  formData.aiTranslationServiceId = savedSettings.aiTranslationServiceId
  formData.placeholderConfigs = normalizePlaceholderConfigs(savedSettings.placeholderConfigs)
}

const handleLocalSettingsSave = () => {
  persistSettings()
  MessagePlugin.success('国际化设置已保存')
}

const handleLanguageSaveConfirm = () => {
  if (!formData.sourceLocale || !formData.targetLocales.length) {
    MessagePlugin.warning('请选择源语种和至少一个目标语种')
    return
  }

  formData.targetLocales = normalizeTargetLocales(formData.targetLocales)
  const addedLocales = formData.targetLocales.filter((locale) => !lockedTargetLocales.value.includes(locale))
  if (!addedLocales.length) {
    MessagePlugin.info('没有新增目标语种，无需保存')
    return
  }
  pendingAddedLocales.value = addedLocales
  fillExistingWords.value = false
  languageConfirmVisible.value = true
}

const confirmLanguageSave = async () => {
  const saved = await handleLanguageSave(pendingAddedLocales.value, {
    fillExistingWords: fillExistingWords.value
  })
  if (saved) closeLanguageConfirm()
}

const closeLanguageConfirm = () => {
  if (projectSaving.value) return
  languageConfirmVisible.value = false
  pendingAddedLocales.value = []
  fillExistingWords.value = false
}

const handleLanguageSave = async (locales = [], options = {}) => {
  if (!formData.sourceLocale || !formData.targetLocales.length) {
    MessagePlugin.warning('请选择源语种和至少一个目标语种')
    return
  }

  formData.targetLocales = normalizeTargetLocales(formData.targetLocales)
  const addedLocales = normalizeLocaleList(locales).filter((locale) => !lockedTargetLocales.value.includes(locale))
  if (!addedLocales.length) {
    MessagePlugin.info('没有新增目标语种，无需保存')
    return true
  }
  projectSaving.value = true
  try {
    await addI18nProjectLanguagesApi(route.params.projectId, addedLocales, options)
    lockedTargetLocales.value = [...formData.targetLocales]
    persistSettings()
    MessagePlugin.success('语种设置已保存')
    return true
  } catch (error) {
    MessagePlugin.error(error.message || '语种设置保存失败')
    return false
  } finally {
    projectSaving.value = false
  }
}

const handleTargetLocalesChange = (value) => {
  const nextLocales = normalizeTargetLocales(value)
  const removedLockedLocales = lockedTargetLocales.value.some((locale) => !nextLocales.includes(locale))
  formData.targetLocales = nextLocales
  if (removedLockedLocales) {
    MessagePlugin.warning('已存在的目标语种不支持减少')
  }
}

async function fetchProjectSettings () {
  if (!route.params.projectId) return
  projectLoading.value = true
  try {
    const detail = await getI18nProjectDetailApi(route.params.projectId)
    const project = normalizeProjectDetail(detail)
    formData.sourceLocale = project.sourceLocale || formData.sourceLocale
    lockedTargetLocales.value = normalizeLocaleList(project.targetLocales)
      .filter((locale) => locale && locale !== formData.sourceLocale)
    formData.targetLocales = normalizeTargetLocales(lockedTargetLocales.value)
  } catch (error) {
    MessagePlugin.error(error.message || '项目语种配置加载失败')
  } finally {
    projectLoading.value = false
  }
}

function normalizeProjectDetail (detail = {}) {
  const project = detail.project || detail.item || detail.detail || detail
  return {
    sourceLocale: project.sourceLocale || project.sourceLang || settings.sourceLocale,
    targetLocales: normalizeLocaleList(project.targetLocales || project.targetLocaleCodes || project.languages || settings.targetLocales)
  }
}

function normalizeTargetLocales (locales = []) {
  const selectedLocales = normalizeLocaleList(locales)
  return [...new Set([...lockedTargetLocales.value, ...selectedLocales])]
    .filter((locale) => locale && locale !== formData.sourceLocale)
}

function normalizeLocaleList (value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === 'string' ? item : item?.value || item?.locale || item?.code)
      .filter(Boolean)
  }
  if (!value) return []
  return String(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean)
}

function getLocaleLabel (value) {
  const locale = localeOptions.value.find((item) => item.value === value)
  return locale ? `${locale.label}（${locale.value}）` : value
}

const openAiServiceDrawer = (service) => {
  editingAiService.value = service || null
  aiServiceDrawerVisible.value = true
}

const saveAiService = (service) => {
  aiServices.value = upsertAiTranslationService(service)
  formData.aiTranslationServiceId = service.id
  persistSettings()
  editingAiService.value = null
  MessagePlugin.success('AI 翻译来源已保存')
}

const getProviderLabel = (value) => {
  return aiProviderOptions.find((item) => item.value === value)?.label || value
}

const openWebhookDialog = (item) => {
  editingWebhookId.value = item?.id || ''
  webhookForm.url = item?.url || ''
  webhookForm.secret = item?.secret || ''
  webhookForm.events = item?.events ? [...item.events] : []
  webhookForm.enabled = item?.enabled ?? true
  webhookDialogVisible.value = true
}

const closeWebhookDialog = () => {
  webhookDialogVisible.value = false
  editingWebhookId.value = ''
}

const saveWebhook = () => {
  if (!webhookForm.url.trim()) {
    MessagePlugin.warning('请输入 Webhook URL')
    return
  }

  if (!webhookForm.events.length) {
    MessagePlugin.warning('请至少选择一个订阅事件')
    return
  }

  const payload = {
    id: editingWebhookId.value || `webhook-${Date.now()}`,
    url: webhookForm.url.trim(),
    secret: webhookForm.secret.trim(),
    events: [...webhookForm.events],
    enabled: webhookForm.enabled
  }

  const isEditing = Boolean(editingWebhookId.value)
  if (isEditing) {
    webhooks.value = webhooks.value.map((item) => item.id === editingWebhookId.value ? payload : item)
  } else {
    webhooks.value = [payload, ...webhooks.value]
  }

  persistSettings()
  webhookDialogVisible.value = false
  editingWebhookId.value = ''
  MessagePlugin.success(isEditing ? 'Webhook 已保存' : 'Webhook 已创建')
}

const removeWebhook = (id) => {
  webhooks.value = webhooks.value.filter((item) => item.id !== id)
  persistSettings()
  MessagePlugin.success('Webhook 已删除')
}

const generateSecret = () => {
  const bytes = new Uint8Array(24)
  window.crypto?.getRandomValues(bytes)
  webhookForm.secret = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function normalizeWebhooks (data) {
  if (Array.isArray(data.webhooks)) {
    return data.webhooks.map(normalizeWebhook).filter((item) => item.url)
  }

  if (data.webhook?.url) {
    return [normalizeWebhook(data.webhook)]
  }

  return []
}

function normalizeWebhook (item) {
  return {
    id: item.id || `webhook-${Date.now()}`,
    url: item.url || '',
    secret: item.secret || '',
    events: Array.isArray(item.events) ? item.events : [],
    enabled: item.enabled !== false
  }
}

function getVisibleEvents (events) {
  return events.slice(0, 3)
}

function getHiddenEvents (events) {
  return events.slice(3)
}
</script>
