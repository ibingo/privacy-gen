<template>
  <div class="system-config-page system-manage-page">
    <section class="system-manage-toolbar">
      <div>
        <h3>配置管理</h3>
        <p>管理对象存储、短信服务和平台常用参数。</p>
      </div>
    </section>

    <t-card class="system-manage-list-card system-config-card" :bordered="false">
      <template #title>
        <div class="system-manage-card-title">
          <span>配置项</span>
          <t-tag theme="primary" variant="light">对象存储 {{ storageTotal }} 项</t-tag>
        </div>
      </template>
      <template #actions>
        <t-space size="small">
          <t-button variant="outline" @click="resetCurrent">重置当前</t-button>
        </t-space>
      </template>

      <t-tabs v-model="activeTab" theme="normal">
        <t-tab-panel value="storage" label="对象存储管理">
          <div class="system-config-panel">
            <div class="system-config-panel-head">
              <div>
                <strong>对象存储</strong>
                <p>按业务系统管理多个对象存储平台，用于上传图片、附件和导出文件。</p>
              </div>
              <t-button theme="primary" @click="openStorageDialog()">
                <template #icon>
                  <add-icon />
                </template>
                新增
              </t-button>
            </div>

            <t-space class="system-manage-filter system-storage-filter" :break-line="true">
              <t-input
                v-model="storageFilters.keyword"
                class="system-manage-search"
                placeholder="搜索配置名称、Bucket、访问域名"
                clearable
                @enter="fetchStorageRows"
                @clear="fetchStorageRows"
              >
                <template #prefix-icon>
                  <search-icon />
                </template>
              </t-input>
              <t-select v-model="storageFilters.provider" class="system-config-filter-select">
                <t-option value="all" label="全部服务" />
                <t-option
                  v-for="option in storageProviderOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </t-select>
              <t-select v-model="storageFilters.businessSystem" class="system-config-filter-select">
                <t-option value="all" label="全部业务系统" />
                <t-option
                  v-for="option in businessSystemOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </t-select>
              <t-select v-model="storageFilters.enabled" class="system-config-status-filter">
                <t-option value="all" label="全部状态" />
                <t-option value="enabled" label="启用" />
                <t-option value="disabled" label="停用" />
              </t-select>
              <t-button theme="primary" @click="fetchStorageRows">查询</t-button>
              <t-button variant="outline" @click="resetStorageFilters">重置</t-button>
            </t-space>

            <t-table row-key="id" hover :columns="storageColumns" :data="storageRows" :loading="storageLoading">
              <template #name="{ row }">
                <div class="system-manage-name-cell">
                  <button class="system-config-name-link" type="button" @click="openStorageFiles(row)">
                    {{ row.name }}
                  </button>
                  <small>{{ row.bucket }} · {{ row.uploadPrefix }}</small>
                </div>
              </template>
              <template #businessSystem="{ row }">
                <t-tag theme="primary" variant="light">
                  {{ getBusinessSystemLabel(row.businessSystem) }}
                </t-tag>
              </template>
              <template #provider="{ row }">
                <t-tag variant="light">
                  {{ getProviderLabel(row.provider) }}
                </t-tag>
              </template>
              <template #accessMode="{ row }">
                <t-tag :theme="row.accessMode === 'public' ? 'success' : 'warning'" variant="light">
                  {{ getAccessModeLabel(row.accessMode) }}
                </t-tag>
              </template>
              <template #status="{ row }">
                <t-tag :theme="row.enabled ? 'success' : 'default'" variant="light">
                  {{ row.enabled ? '启用' : '停用' }}
                </t-tag>
              </template>
              <template #updatedAt="{ row }">
                <span>{{ row.updatedAtText }}</span>
              </template>
              <template #operation="{ row }">
                <t-dropdown :options="getStorageOperationOptions(row)" @click="handleStorageOperationClick(row, $event)">
                  <t-button theme="primary" variant="text">操作</t-button>
                </t-dropdown>
              </template>
            </t-table>

            <div class="system-manage-pagination">
              <t-pagination
                v-model:current="storagePage"
                v-model:page-size="storagePageSize"
                :total="storageTotal"
                :page-size-options="[10, 20, 50]"
                :show-jumper="false"
                :show-page-size="true"
                @current-change="fetchStorageRows"
                @page-size-change="handleStoragePageSizeChange"
              />
            </div>
            <div class="system-config-actions">
              <t-button theme="primary" @click="fetchStorageRows">刷新列表</t-button>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="sms" label="短信配置">
          <div class="system-config-panel">
            <div class="system-config-panel-head">
              <div>
                <strong>短信服务</strong>
                <p>用于验证码、通知和重要操作提醒。</p>
              </div>
              <t-tag :theme="sms.enabled ? 'success' : 'default'" variant="light">
                {{ sms.enabled ? '已启用' : '未启用' }}
              </t-tag>
            </div>

            <t-form :data="sms" label-align="top" class="system-config-form">
              <div class="system-config-grid">
                <t-form-item label="服务商">
                  <t-select v-model="sms.provider" placeholder="请选择短信服务商">
                    <t-option value="aliyun" label="阿里云短信" />
                    <t-option value="tencent" label="腾讯云短信" />
                    <t-option value="huawei" label="华为云短信" />
                    <t-option value="twilio" label="Twilio" />
                    <t-option value="custom" label="自定义短信网关" />
                  </t-select>
                </t-form-item>
                <t-form-item label="签名名称">
                  <t-input v-model="sms.signature" placeholder="PrivacyGen" />
                </t-form-item>
                <t-form-item label="App Key">
                  <t-input v-model="sms.appKey" placeholder="请输入 App Key" />
                </t-form-item>
                <t-form-item label="App Secret">
                  <t-input v-model="sms.appSecret" type="password" placeholder="请输入 App Secret" />
                </t-form-item>
                <t-form-item label="Region">
                  <t-input v-model="sms.region" placeholder="cn-hangzhou" />
                </t-form-item>
                <t-form-item label="模板编码">
                  <t-input v-model="sms.templateCode" placeholder="SMS_000000" />
                </t-form-item>
              </div>

              <div class="system-config-grid system-config-grid-wide">
                <t-form-item label="验证码有效期（分钟）">
                  <t-input-number v-model="sms.codeExpiry" :min="1" :max="60" :step="1" />
                </t-form-item>
                <t-form-item label="发送频率限制（秒）">
                  <t-input-number v-model="sms.rateLimitSeconds" :min="10" :max="600" :step="10" />
                </t-form-item>
                <t-form-item label="通知场景">
                  <t-select v-model="sms.scenes" multiple clearable placeholder="选择短信场景">
                    <t-option value="login" label="登录验证码" />
                    <t-option value="register" label="注册验证" />
                    <t-option value="bind" label="绑定手机" />
                    <t-option value="reset" label="重置密码" />
                    <t-option value="alert" label="安全通知" />
                  </t-select>
                </t-form-item>
              </div>
            </t-form>
            <div class="system-config-actions">
              <t-button theme="primary" @click="saveCurrent('sms')">保存短信配置</t-button>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="security" label="安全管理">
          <div class="system-config-panel">
            <div class="system-config-panel-head">
              <div>
                <strong>安全管理</strong>
                <p>管理账号敏感操作验证、双重验证策略和登录状态保持规则。</p>
              </div>
              <t-tag :theme="security.forceTwoFactor ? 'success' : 'warning'" variant="light">
                {{ security.forceTwoFactor ? '已强制双重验证' : '未强制双重验证' }}
              </t-tag>
            </div>

            <t-alert v-if="securityLoadError" theme="error" :message="securityLoadError" />
            <t-loading :loading="securityLoading" text="加载安全配置中">
              <t-form :data="security" label-align="top" class="system-config-form">
              <div class="system-config-section">
                <div class="system-config-section-title">
                  <strong>修改密码验证</strong>
                  <p>控制用户修改密码前必须完成的身份验证方式。</p>
                </div>
                <div class="system-config-grid system-config-grid-wide">
                  <t-form-item label="短信验证">
                    <t-switch v-model="security.passwordChangeSmsVerification" :label="['开启', '关闭']" />
                  </t-form-item>
                  <t-form-item label="邮箱验证">
                    <t-switch v-model="security.passwordChangeEmailVerification" :label="['开启', '关闭']" />
                  </t-form-item>
                </div>
              </div>

              <div class="system-config-section">
                <div class="system-config-section-title">
                  <strong>双重验证</strong>
                  <p>启用后，用户登录或敏感操作需要额外验证。</p>
                </div>
                <div class="system-config-grid system-config-grid-wide">
                  <t-form-item label="强制双重验证">
                    <t-switch v-model="security.forceTwoFactor" :label="['强制', '不强制']" />
                  </t-form-item>
                  <t-form-item label="默认验证方式">
                    <t-select v-model="security.defaultTwoFactorMethod" placeholder="请选择默认验证方式">
                      <t-option value="sms" label="短信验证码" />
                      <t-option value="email" label="邮箱验证码" />
                      <t-option value="sms_email" label="短信 + 邮箱" />
                    </t-select>
                  </t-form-item>
                </div>
              </div>

              <div class="system-config-section">
                <div class="system-config-section-title">
                  <strong>登录状态管理</strong>
                  <p>配置无操作状态和绝对登录状态的最长保持时间。</p>
                </div>
                <div class="system-config-grid system-config-grid-wide">
                  <t-form-item label="无操作登录保持时间（分钟）">
                    <t-input-number v-model="security.idleSessionMinutes" :min="5" :max="1440" :step="5" />
                  </t-form-item>
                  <t-form-item label="最大登录保持时间（小时）">
                    <t-input-number v-model="security.maxSessionHours" :min="1" :max="720" :step="1" />
                  </t-form-item>
                </div>
              </div>
              </t-form>
            </t-loading>
            <div class="system-config-actions">
              <t-button theme="primary" :loading="securitySaving" @click="saveCurrent('security')">保存安全配置</t-button>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="general" label="通用配置">
          <div class="system-config-panel">
            <div class="system-config-panel-head">
              <div>
                <strong>平台通用配置</strong>
                <p>参考常见平台配置管理，统一放置全局运行参数。</p>
              </div>
            </div>

            <t-form :data="general" label-align="top" class="system-config-form">
              <div class="system-config-grid">
                <t-form-item label="系统名称">
                  <t-input v-model="general.systemName" placeholder="Privacy Gen" />
                </t-form-item>
                <t-form-item label="默认时区">
                  <t-input v-model="general.timezone" placeholder="Asia/Shanghai" />
                </t-form-item>
                <t-form-item label="默认语言">
                  <t-select v-model="general.locale" placeholder="请选择默认语言">
                    <t-option value="zh-CN" label="简体中文" />
                    <t-option value="en-US" label="English" />
                    <t-option value="ja-JP" label="日本語" />
                  </t-select>
                </t-form-item>
                <t-form-item label="文件上传限制（MB）">
                  <t-input-number v-model="general.maxUploadSize" :min="1" :max="1024" :step="1" />
                </t-form-item>
                <t-form-item label="登录失败锁定次数">
                  <t-input-number v-model="general.loginRetryLimit" :min="3" :max="20" :step="1" />
                </t-form-item>
                <t-form-item label="会话超时时间（分钟）">
                  <t-input-number v-model="general.sessionTimeout" :min="5" :max="1440" :step="5" />
                </t-form-item>
              </div>

              <div class="system-config-grid system-config-grid-wide">
                <t-form-item label="公告开关">
                  <t-switch v-model="general.announcementEnabled" :label="['开启', '关闭']" />
                </t-form-item>
                <t-form-item label="审计日志">
                  <t-switch v-model="general.auditLogEnabled" :label="['开启', '关闭']" />
                </t-form-item>
                <t-form-item label="导出水印">
                  <t-switch v-model="general.exportWatermarkEnabled" :label="['开启', '关闭']" />
                </t-form-item>
              </div>
            </t-form>
            <div class="system-config-actions">
              <t-button theme="primary" @click="saveCurrent('general')">保存通用配置</t-button>
            </div>
          </div>
        </t-tab-panel>
      </t-tabs>
    </t-card>

    <t-dialog
      v-model:visible="storageDialogVisible"
      :header="storageDialogTitle"
      width="980px"
      :confirm-btn="{ content: storageDialogConfirmText, theme: archiveStorageContext ? 'danger' : 'primary' }"
      cancel-btn="取消"
      @confirm="saveStorageDialog"
      @cancel="closeStorageDialog"
      @close="closeStorageDialog"
    >
      <t-alert
        v-if="archiveStorageContext"
        class="system-config-dialog-alert"
        theme="warning"
        :message="`当前配置「${archiveStorageContext.name}」暂不能直接归档，请新建替换配置。保存后将归档原配置并启用新配置。`"
      />
      <t-form :data="storageForm" label-align="top" class="system-config-form">
        <div class="system-config-grid">
          <t-form-item label="配置名称">
            <t-input v-model="storageForm.name" placeholder="请输入配置名称" />
          </t-form-item>
          <t-form-item label="业务系统">
            <t-select v-model="storageForm.businessSystem" clearable filterable placeholder="请选择业务系统">
              <t-option
                v-for="option in businessSystemOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </t-select>
          </t-form-item>
          <t-form-item label="存储服务">
            <t-select v-model="storageForm.provider" placeholder="请选择存储服务">
              <t-option
                v-for="option in storageProviderOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </t-select>
          </t-form-item>
          <t-form-item label="访问域名">
            <t-input v-model="storageForm.accessDomain" placeholder="https://cdn.example.com" />
          </t-form-item>
          <t-form-item label="Bucket">
            <t-input v-model="storageForm.bucket" placeholder="bucket-name" />
          </t-form-item>
          <t-form-item label="Region">
            <t-input v-model="storageForm.region" placeholder="cn-hangzhou" />
          </t-form-item>
          <t-form-item label="Access Key">
            <t-input v-model="storageForm.accessKey" placeholder="请输入 Access Key" />
          </t-form-item>
          <t-form-item label="Secret Key">
            <t-input v-model="storageForm.secretKey" type="password" placeholder="请输入 Secret Key" />
          </t-form-item>
          <t-form-item label="上传目录前缀">
            <t-input v-model="storageForm.uploadPrefix" placeholder="uploads/mobile-apps/" />
          </t-form-item>
          <t-form-item label="访问方式">
            <t-select v-model="storageForm.accessMode" placeholder="选择访问方式">
              <t-option
                v-for="option in storageAccessModeOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </t-select>
          </t-form-item>
          <t-form-item label="上传后处理">
            <t-select v-model="storageForm.postProcesses" multiple clearable placeholder="选择上传后处理">
              <t-option
                v-for="option in storagePostProcessOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </t-select>
          </t-form-item>
          <t-form-item label="状态">
            <t-switch v-model="storageForm.enabled" :disabled="Boolean(archiveStorageContext)" :label="['启用', '停用']" />
          </t-form-item>
        </div>
      </t-form>
    </t-dialog>

    <t-dialog
      v-model:visible="storageDetailVisible"
      header="对象存储详情"
      width="760px"
      :confirm-btn="{ content: '关闭', theme: 'primary' }"
      :cancel-btn="null"
      @confirm="storageDetailVisible = false"
      @close="storageDetailVisible = false"
    >
      <div v-if="storageDetail" class="system-config-detail">
        <div class="system-config-detail-item">
          <span>配置名称</span>
          <strong>{{ storageDetail.name }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>业务系统</span>
          <strong>{{ getBusinessSystemLabel(storageDetail.businessSystem) }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>存储服务</span>
          <strong>{{ getProviderLabel(storageDetail.provider) }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>状态</span>
          <t-tag :theme="storageDetail.enabled ? 'success' : 'default'" variant="light">
            {{ storageDetail.enabled ? '启用' : '停用' }}
          </t-tag>
        </div>
        <div class="system-config-detail-item">
          <span>Bucket</span>
          <strong>{{ storageDetail.bucket }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>Region</span>
          <strong>{{ storageDetail.region }}</strong>
        </div>
        <div class="system-config-detail-item system-config-detail-wide">
          <span>访问域名</span>
          <strong>{{ storageDetail.accessDomain || '-' }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>访问方式</span>
          <strong>{{ getAccessModeLabel(storageDetail.accessMode) }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>上传目录前缀</span>
          <strong>{{ storageDetail.uploadPrefix || '-' }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>Access Key</span>
          <strong>{{ storageDetail.accessKey || '-' }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>Secret Key</span>
          <strong>{{ storageDetail.secretKeyConfigured ? '已配置' : '未配置' }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>上传后处理</span>
          <strong>{{ getPostProcessLabels(storageDetail.postProcesses) }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>创建时间</span>
          <strong>{{ formatDateTime(storageDetail.createdAt) }}</strong>
        </div>
        <div class="system-config-detail-item">
          <span>更新时间</span>
          <strong>{{ formatDateTime(storageDetail.updatedAt) }}</strong>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  AddIcon,
  SearchIcon
} from 'tdesign-icons-vue-next'
import {
  Alert as TAlert,
  Button as TButton,
  Card as TCard,
  DialogPlugin,
  Dialog as TDialog,
  Dropdown as TDropdown,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  InputNumber as TInputNumber,
  Loading as TLoading,
  MessagePlugin,
  Option as TOption,
  Pagination as TPagination,
  Select as TSelect,
  Space as TSpace,
  TabPanel as TTabPanel,
  Tabs as TTabs,
  Table as TTable,
  Switch as TSwitch,
  Tag as TTag
} from 'tdesign-vue-next'
import { securityConfigApi } from '../../api/management'
import {
  archiveObjectStorageConfigApi,
  createObjectStorageConfigApi,
  deleteObjectStorageConfigApi,
  getObjectStorageConfigArchiveStatusApi,
  getObjectStorageConfigDetailApi,
  getObjectStorageConfigOptionsApi,
  listObjectStorageConfigsApi,
  updateObjectStorageConfigApi,
  updateObjectStorageConfigEnabledApi
} from '../../api/objectStorage'

const router = useRouter()
const activeTab = ref('storage')
const storageProviderOptions = ref([])
const businessSystemOptions = ref([])
const storageAccessModeOptions = ref([])
const storagePostProcessOptions = ref([])

const createStorageForm = (data = {}) => ({
  id: data.id || '',
  name: data.name || '',
  businessSystem: data.businessSystem || '',
  enabled: data.enabled ?? true,
  provider: data.provider || 'aliyun-oss',
  accessDomain: data.accessDomain || '',
  bucket: data.bucket || '',
  region: data.region || '',
  accessKey: data.accessKey || '',
  secretKey: data.secretKey || '',
  uploadPrefix: data.uploadPrefix || '',
  accessMode: data.accessMode || 'signed',
  postProcesses: Array.isArray(data.postProcesses) ? [...data.postProcesses] : []
})

const storageRows = ref([])
const storageTotal = ref(0)
const storageLoading = ref(false)

const storageFilters = reactive({
  keyword: '',
  provider: 'all',
  businessSystem: 'all',
  enabled: 'all'
})
const storagePage = ref(1)
const storagePageSize = ref(20)
const storageDialogVisible = ref(false)
const editingStorageId = ref('')
const archiveStorageContext = ref(null)
const storageDetailVisible = ref(false)
const storageDetail = ref(null)
const storageForm = reactive(createStorageForm())
const storageDialogTitle = computed(() => {
  if (archiveStorageContext.value) return '新建替换对象存储平台'
  return editingStorageId.value ? '编辑对象存储平台' : '新建对象存储平台'
})
const storageDialogConfirmText = computed(() => archiveStorageContext.value ? '归档并启用新配置' : '保存')

const storageColumns = [
  { colKey: 'name', title: '配置名称', minWidth: 220 },
  { colKey: 'businessSystem', title: '业务系统', width: 160 },
  { colKey: 'provider', title: '服务商', width: 150 },
  { colKey: 'bucket', title: 'Bucket', minWidth: 180 },
  { colKey: 'accessMode', title: '访问方式', width: 120 },
  { colKey: 'accessDomain', title: '访问域名', minWidth: 240 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'updatedAt', title: '更新时间', width: 170 },
  { colKey: 'operation', title: '操作', width: 100, fixed: 'right' }
]

const sms = reactive({
  enabled: true,
  provider: 'aliyun',
  signature: 'PrivacyGen',
  appKey: '',
  appSecret: '',
  region: 'cn-hangzhou',
  templateCode: 'SMS_000000',
  codeExpiry: 5,
  rateLimitSeconds: 60,
  scenes: ['login', 'reset']
})

const general = reactive({
  systemName: 'Privacy Gen',
  timezone: 'Asia/Shanghai',
  locale: 'zh-CN',
  maxUploadSize: 100,
  loginRetryLimit: 5,
  sessionTimeout: 120,
  announcementEnabled: true,
  auditLogEnabled: true,
  exportWatermarkEnabled: false
})

const security = reactive({
  passwordChangeSmsVerification: true,
  passwordChangeEmailVerification: true,
  forceTwoFactor: true,
  defaultTwoFactorMethod: 'sms_email',
  idleSessionMinutes: 120,
  maxSessionHours: 24
})
const securityLoading = ref(false)
const securitySaving = ref(false)
const securityLoadError = ref('')

const getOptionLabel = (optionsRef, value) => optionsRef.value.find((option) => option.value === value)?.label || value || '-'

const getProviderLabel = (value) => getOptionLabel(storageProviderOptions, value)
const getBusinessSystemLabel = (value) => getOptionLabel(businessSystemOptions, value)
const getAccessModeLabel = (value) => getOptionLabel(storageAccessModeOptions, value)
const getPostProcessLabels = (values = []) => {
  if (!Array.isArray(values) || !values.length) return '-'
  return values.map((value) => getOptionLabel(storagePostProcessOptions, value)).join('、')
}

const formatDateTime = (value) => value ? String(value).replace('T', ' ').slice(0, 16) : '-'

const normalizeStorageRow = (item) => ({
  id: item.id,
  ossCode: item.ossCode || item.code || '',
  name: item.name,
  businessSystem: item.businessSystem,
  provider: item.provider,
  accessDomain: item.accessDomain,
  bucket: item.bucket,
  region: item.region,
  accessKey: item.accessKey,
  secretKey: '',
  secretKeyConfigured: item.secretKeyConfigured,
  uploadPrefix: item.uploadPrefix,
  accessMode: item.accessMode,
  postProcesses: Array.isArray(item.postProcesses) ? item.postProcesses : [],
  enabled: item.enabled,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  updatedAtText: formatDateTime(item.updatedAt)
})

async function loadStorageOptions () {
  try {
    const data = await getObjectStorageConfigOptionsApi()
    storageProviderOptions.value = Array.isArray(data?.providers) ? data.providers : []
    businessSystemOptions.value = Array.isArray(data?.businessSystems) ? data.businessSystems : []
    storageAccessModeOptions.value = Array.isArray(data?.accessModes) ? data.accessModes : []
    storagePostProcessOptions.value = Array.isArray(data?.postProcesses) ? data.postProcesses : []
  } catch (error) {
    MessagePlugin.error(error.message || '对象存储选项加载失败')
  }
}

async function fetchStorageRows () {
  storageLoading.value = true
  try {
    const data = await listObjectStorageConfigsApi({
      keyword: storageFilters.keyword.trim(),
      businessSystem: storageFilters.businessSystem === 'all' ? '' : storageFilters.businessSystem,
      provider: storageFilters.provider === 'all' ? '' : storageFilters.provider,
      enabled: storageFilters.enabled === 'all' ? null : storageFilters.enabled === 'enabled',
      page: storagePage.value,
      pageSize: storagePageSize.value
    })
    storageRows.value = Array.isArray(data?.items) ? data.items.map(normalizeStorageRow) : []
    storageTotal.value = data?.total || 0
    storagePage.value = data?.page || storagePage.value
    storagePageSize.value = data?.pageSize || storagePageSize.value
  } catch (error) {
    MessagePlugin.error(error.message || '对象存储列表加载失败')
  } finally {
    storageLoading.value = false
  }
}

async function handleStoragePageSizeChange (size) {
  storagePageSize.value = size
  storagePage.value = 1
  await fetchStorageRows()
}

function getStorageOperationOptions (row) {
  return [
    { content: '详情', value: 'detail' },
    { content: '编辑', value: 'edit' },
    { content: '归档', value: 'archive' },
    { content: row.enabled ? '停用' : '启用', value: 'toggle' },
    { content: '删除', value: 'delete' }
  ]
}

function handleStorageOperationClick (row, option) {
  const value = option?.value
  if (value === 'detail') openStorageFiles(row)
  if (value === 'edit') openStorageDialog(row)
  if (value === 'archive') confirmArchiveStorageRow(row)
  if (value === 'toggle') toggleStorageEnabled(row)
  if (value === 'delete') confirmDeleteStorageRow(row)
}

function openStorageFiles (row) {
  if (!row.ossCode) {
    MessagePlugin.warning('当前配置缺少 ossCode，无法查看文件列表')
    return
  }
  router.push({
    name: 'object-storage-file-list',
    query: {
      ossCode: row.ossCode,
      prefix: row.uploadPrefix || undefined,
      pageSize: 100
    }
  })
}

async function openStorageDialog (row) {
  editingStorageId.value = row?.id ? String(row.id) : ''
  archiveStorageContext.value = null
  if (editingStorageId.value) {
    try {
      const data = await getObjectStorageConfigDetailApi(editingStorageId.value)
      Object.assign(storageForm, createStorageForm(data))
    } catch (error) {
      MessagePlugin.error(error.message || '对象存储详情加载失败')
      return
    }
  } else {
    Object.assign(storageForm, createStorageForm())
  }
  storageDialogVisible.value = true
}

function openArchiveReplacementDialog (row) {
  editingStorageId.value = ''
  archiveStorageContext.value = row
  Object.assign(storageForm, createStorageForm({
    businessSystem: row.businessSystem,
    provider: row.provider,
    accessDomain: row.accessDomain,
    bucket: row.bucket,
    region: row.region,
    uploadPrefix: row.uploadPrefix,
    accessMode: row.accessMode,
    postProcesses: row.postProcesses,
    enabled: true
  }))
  storageDialogVisible.value = true
}

function closeStorageDialog () {
  storageDialogVisible.value = false
  archiveStorageContext.value = null
}

function validateStorageForm () {
  if (!storageForm.name.trim()) return '请输入配置名称'
  if (!storageForm.businessSystem) return '请选择业务系统'
  if (!storageForm.provider) return '请选择存储服务'
  if (!storageForm.bucket.trim()) return '请输入 Bucket'
  if (!storageForm.region.trim()) return '请输入 Region'
  if (!storageForm.accessKey.trim()) return '请输入 Access Key'
  if (!editingStorageId.value && !storageForm.secretKey.trim()) return '请输入 Secret Key'
  if (!storageForm.accessMode) return '请选择访问方式'
  return ''
}

async function hasEnabledSameBusinessBucket () {
  const data = await listObjectStorageConfigsApi({
    keyword: storageForm.bucket.trim(),
    businessSystem: storageForm.businessSystem,
    provider: '',
    enabled: true,
    page: 1,
    pageSize: 50
  })
  const items = Array.isArray(data?.items) ? data.items : []
  return items.some((item) => {
    const sameId = editingStorageId.value && String(item.id) === String(editingStorageId.value)
    return !sameId && item.enabled && item.businessSystem === storageForm.businessSystem && item.bucket === storageForm.bucket.trim()
  })
}

function isArchiveAllowedResult (data) {
  if (typeof data === 'boolean') return data
  if (typeof data?.canArchive === 'boolean') return data.canArchive
  if (typeof data?.allowed === 'boolean') return data.allowed
  if (typeof data?.result === 'boolean') return data.result
  return Boolean(data)
}

async function saveStorageDialog () {
  const error = validateStorageForm()
  if (error) {
    MessagePlugin.warning(error)
    return
  }
  const payload = {
    name: storageForm.name.trim(),
    businessSystem: storageForm.businessSystem,
    provider: storageForm.provider,
    accessDomain: storageForm.accessDomain.trim(),
    bucket: storageForm.bucket.trim(),
    region: storageForm.region.trim(),
    accessKey: storageForm.accessKey.trim(),
    secretKey: storageForm.secretKey.trim() || undefined,
    uploadPrefix: storageForm.uploadPrefix.trim(),
    accessMode: storageForm.accessMode,
    postProcesses: Array.isArray(storageForm.postProcesses) ? [...storageForm.postProcesses] : [],
    enabled: archiveStorageContext.value ? true : storageForm.enabled
  }
  try {
    if (editingStorageId.value) {
      await updateObjectStorageConfigApi(editingStorageId.value, payload)
    } else if (archiveStorageContext.value) {
      const created = await createObjectStorageConfigApi({
        ...payload,
        archiveConfigId: archiveStorageContext.value.id,
        replacementForConfigId: archiveStorageContext.value.id
      })
      await archiveObjectStorageConfigApi({ ossCode: archiveStorageContext.value.ossCode })
    } else {
      if (await hasEnabledSameBusinessBucket()) {
        MessagePlugin.warning('已存在相同业务系统和 Bucket 的可用配置，请使用归档功能替换原配置')
        return
      }
      await createObjectStorageConfigApi(payload)
    }
    MessagePlugin.success(archiveStorageContext.value ? '原配置已归档，新配置已启用' : '对象存储平台已保存')
    storageDialogVisible.value = false
    archiveStorageContext.value = null
    await fetchStorageRows()
  } catch (error) {
    MessagePlugin.error(error.message || '对象存储平台保存失败')
  }
}

function confirmArchiveStorageRow (row) {
  DialogPlugin.confirm({
    header: '确认归档',
    body: `确认归档「${row.name}」吗？归档前会先校验当前配置是否可以直接归档。`,
    theme: 'warning',
    confirmBtn: {
      content: '归档',
      theme: 'danger'
    },
    cancelBtn: '取消',
    onConfirm: async ({ hide }) => {
      await archiveStorageRow(row)
      hide()
    }
  })
}

async function archiveStorageRow (row) {
  try {
    if (!row.ossCode) {
      MessagePlugin.warning('当前配置缺少 ossCode，无法归档')
      return
    }
    const archiveStatus = await getObjectStorageConfigArchiveStatusApi({ ossCode: row.ossCode })
    if (!isArchiveAllowedResult(archiveStatus)) {
      MessagePlugin.warning('当前配置暂不能直接归档，请新建替换配置')
      openArchiveReplacementDialog(row)
      return
    }
    await archiveObjectStorageConfigApi({ ossCode: row.ossCode })
    MessagePlugin.success('对象存储平台已归档')
    await fetchStorageRows()
  } catch (error) {
    MessagePlugin.error(error.message || '对象存储平台归档失败')
  }
}

function confirmDeleteStorageRow (row) {
  DialogPlugin.confirm({
    header: '确认删除',
    body: `删除后不可恢复，确认删除「${row.name}」吗？`,
    theme: 'warning',
    confirmBtn: {
      content: '删除',
      theme: 'danger'
    },
    cancelBtn: '取消',
    onConfirm: async ({ hide }) => {
      await deleteStorageRow(row)
      hide()
    }
  })
}

async function deleteStorageRow (row) {
  try {
    await deleteObjectStorageConfigApi(row.id)
    MessagePlugin.success('对象存储平台已删除')
    await fetchStorageRows()
  } catch (error) {
    MessagePlugin.error(error.message || '对象存储平台删除失败')
  }
}

async function toggleStorageEnabled (row) {
  try {
    await updateObjectStorageConfigEnabledApi(row.id, { enabled: !row.enabled })
    MessagePlugin.success(row.enabled ? '对象存储平台已停用' : '对象存储平台已启用')
    await fetchStorageRows()
  } catch (error) {
    MessagePlugin.error(error.message || '状态更新失败')
  }
}

const applySecurityConfig = (data = {}) => {
  Object.assign(security, {
    passwordChangeSmsVerification: data.passwordSmsVerificationEnabled ?? true,
    passwordChangeEmailVerification: data.passwordEmailVerificationEnabled ?? true,
    forceTwoFactor: data.mfaRequired ?? true,
    defaultTwoFactorMethod: data.defaultMfaMethod || 'sms_email',
    idleSessionMinutes: data.idleSessionTimeoutMinutes ?? 120,
    maxSessionHours: data.maxSessionDurationHours ?? 24
  })
}

const createSecurityPayload = () => ({
  passwordSmsVerificationEnabled: security.passwordChangeSmsVerification,
  passwordEmailVerificationEnabled: security.passwordChangeEmailVerification,
  mfaRequired: security.forceTwoFactor,
  defaultMfaMethod: security.defaultTwoFactorMethod,
  idleSessionTimeoutMinutes: security.idleSessionMinutes,
  maxSessionDurationHours: security.maxSessionHours
})

async function loadSecurityConfig () {
  securityLoading.value = true
  securityLoadError.value = ''
  try {
    const data = await securityConfigApi.get()
    applySecurityConfig(data)
    initialState.security = JSON.parse(JSON.stringify(security))
  } catch (error) {
    securityLoadError.value = error.message || '安全配置加载失败'
  } finally {
    securityLoading.value = false
  }
}

watch(
  () => [storageFilters.keyword, storageFilters.provider, storageFilters.businessSystem, storageFilters.enabled],
  () => {
    storagePage.value = 1
  }
)

function resetStorageFilters () {
  storageFilters.keyword = ''
  storageFilters.provider = 'all'
  storageFilters.businessSystem = 'all'
  storageFilters.enabled = 'all'
  storagePage.value = 1
  fetchStorageRows()
}

const snapshot = () => ({
  sms: JSON.parse(JSON.stringify(sms)),
  security: JSON.parse(JSON.stringify(security)),
  general: JSON.parse(JSON.stringify(general))
})

const initialState = snapshot()

const configMap = {
  sms,
  security,
  general
}

function resetCurrent () {
  const key = activeTab.value
  if (!configMap[key]) return
  if (key === 'storage') {
    resetStorageFilters()
    return
  }
  Object.assign(configMap[key], JSON.parse(JSON.stringify(initialState[key])))
  MessagePlugin.info('已重置当前配置')
}

function saveCurrent (key) {
  if (!configMap[key]) return
  if (key === 'security') {
    saveSecurityConfig()
    return
  }
  MessagePlugin.success('当前配置已保存')
}

async function saveSecurityConfig () {
  securitySaving.value = true
  try {
    await securityConfigApi.update(createSecurityPayload())
    initialState.security = JSON.parse(JSON.stringify(security))
    MessagePlugin.success('安全配置已保存')
  } catch (error) {
    MessagePlugin.error(error.message || '安全配置保存失败')
  } finally {
    securitySaving.value = false
  }
}

function resetAll () {
  Object.assign(sms, JSON.parse(JSON.stringify(initialState.sms)))
  Object.assign(security, JSON.parse(JSON.stringify(initialState.security)))
  Object.assign(general, JSON.parse(JSON.stringify(initialState.general)))
  MessagePlugin.info('已重置为上次保存的配置')
}

onMounted(() => {
  loadStorageOptions()
  fetchStorageRows()
  loadSecurityConfig()
})
</script>

<style scoped>
.system-config-card .t-card__body {
  padding-top: 0;
}

:deep(.system-config-card .t-tabs__nav) {
  padding: 0 8px;
  border-bottom-color: #edf1f5;
}

.system-config-panel {
  display: grid;
  gap: 24px;
  padding: 22px 4px 8px;
}

.system-config-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.system-config-panel-head strong {
  color: #111827;
  font-size: 16px;
  line-height: 24px;
}

.system-config-panel-head p {
  margin-top: 4px;
  color: #6b7280;
  font-size: 14px;
  line-height: 22px;
}

.system-config-form {
  display: grid;
  gap: 24px;
}

.system-config-section {
  display: grid;
  gap: 18px;
  padding: 20px;
  border: 1px solid #edf1f5;
  border-radius: 8px;
  background: #ffffff;
}

.system-config-section-title strong {
  color: #111827;
  font-size: 15px;
  line-height: 22px;
}

.system-config-section-title p {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
  line-height: 20px;
}

.system-config-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.system-storage-filter {
  justify-content: flex-start;
}

.system-config-filter-select {
  width: 180px;
}

.system-config-status-filter {
  width: 140px;
}

.system-config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;
}

.system-config-grid-wide {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

:deep(.system-config-form .t-select),
:deep(.system-config-form .t-input),
:deep(.system-config-form .t-input-number) {
  width: 100%;
}

:deep(.system-config-form .t-tag-input) {
  width: 100%;
}

:deep(.system-config-form .t-form__item) {
  margin-bottom: 0;
}

.system-config-name-link {
  display: inline-flex;
  width: fit-content;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111827;
  font: inherit;
  font-weight: 600;
  line-height: 22px;
  cursor: pointer;
}

.system-config-name-link:hover {
  color: #0052d9;
}

.system-config-dialog-alert {
  margin-bottom: 20px;
}

.system-config-detail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
}

.system-config-detail-item {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid #edf1f5;
  border-radius: 8px;
  background: #ffffff;
}

.system-config-detail-wide {
  grid-column: 1 / -1;
}

.system-config-detail-item span {
  color: #6b7280;
  font-size: 12px;
  line-height: 18px;
}

.system-config-detail-item strong {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

@media (max-width: 960px) {
  .system-config-grid,
  .system-config-grid-wide,
  .system-config-detail {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .system-config-panel-head {
    flex-direction: column;
  }
}
</style>
