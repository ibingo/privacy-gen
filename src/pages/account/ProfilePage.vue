<template>
  <t-loading :loading="loading" text="加载个人信息中">
    <div v-if="loadError" class="profile-page">
      <t-alert theme="error" :message="loadError" />
    </div>
    <div v-else class="profile-page">
    <section class="profile-main">
      <div class="profile-welcome">
        <div>
          <span>Hi,</span>
          <strong>{{ profile.greetingName || profile.displayName || profile.username || '-' }}</strong>
          <p>{{ profile.accountSubtitle || `今天是你加入团队的第 ${profile.employmentDays || 0} 天` }}</p>
        </div>
        <div class="profile-brand">{{ profile.brandName || 'Privacy Gen' }}</div>
      </div>

      <section class="profile-card profile-info-card">
        <div class="profile-card-header">
          <h3>个人信息</h3>
          <t-button variant="text" shape="square" title="编辑个人信息" @click="goUserInfoSettings">
            <more-icon />
          </t-button>
        </div>

        <div class="profile-info-grid">
          <div v-for="item in infoItems" :key="item.label" class="profile-info-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </section>

      <section class="profile-card profile-data-card">
        <div class="profile-tabs">
          <button type="button">内容列表</button>
          <button class="is-active" type="button">内容列表</button>
          <button type="button">内容列表</button>
        </div>

        <div class="profile-chart-header">
          <h3>首页访问数据</h3>
          <div class="profile-date-range">
            <span>2026-05-18</span>
            <span>-</span>
            <span>2026-05-24</span>
            <calendar-icon />
          </div>
        </div>

        <div class="profile-chart" aria-label="首页访问数据趋势">
          <div class="chart-grid">
            <span v-for="line in 5" :key="line" />
          </div>
          <svg viewBox="0 0 760 220" role="img">
            <polyline class="chart-line chart-line-primary" points="20,62 150,122 280,34 410,30 540,64 670,142 740,166" />
            <polyline class="chart-line chart-line-secondary" points="20,68 150,134 280,118 410,104 540,118 670,164 740,180" />
            <polyline class="chart-line chart-line-third" points="20,70 150,142 280,136 410,118 540,136 670,178 740,190" />
            <g class="chart-dots">
              <circle v-for="point in primaryPoints" :key="point" :cx="point[0]" :cy="point[1]" r="4" />
            </g>
          </svg>
          <div class="profile-theme-switch">
            <palette-icon />
            <span>默认主题</span>
          </div>
        </div>
      </section>
    </section>

    <aside class="profile-side">
      <section class="profile-account-card">
        <div class="profile-avatar">{{ avatarText }}</div>
        <h3>{{ profile.accountTitle || profile.displayName || profile.username || 'My Account' }}</h3>
        <p>{{ profile.basicInfo?.teamPath || profile.basicInfo?.organization || profile.basicInfo?.position || '-' }}</p>
      </section>

      <section class="profile-card profile-member-card">
        <div class="profile-card-header">
          <h3>团队成员</h3>
          <t-button variant="text" shape="square" title="更多">
            <more-icon />
          </t-button>
        </div>
        <div class="profile-member-list">
          <div v-for="member in members" :key="member.username || member.name" class="profile-member">
            <span class="profile-member-avatar" :style="{ background: member.color }">{{ member.avatar }}</span>
            <span>
              <strong>{{ member.name }}</strong>
              <small>{{ member.role }}</small>
            </span>
          </div>
        </div>
      </section>

      <section class="profile-card profile-product-card">
        <div class="profile-card-header">
          <h3>服务产品</h3>
          <t-button variant="text" shape="square" title="更多">
            <more-icon />
          </t-button>
        </div>
        <div class="profile-product-list">
          <span v-for="product in products" :key="product.code || product.label" :style="{ background: product.color }">
            {{ product.label }}
          </span>
        </div>
      </section>
    </aside>
  </div>
  </t-loading>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  CalendarIcon,
  MoreIcon,
  PaletteIcon
} from 'tdesign-icons-vue-next'
import { Alert as TAlert, Button as TButton, Loading as TLoading } from 'tdesign-vue-next'
import { userProfileApi } from '../../api/user'

const router = useRouter()
const loading = ref(false)
const loadError = ref('')
const profile = ref({
  username: '',
  displayName: '',
  brandName: '',
  greetingName: '',
  employmentDays: 0,
  accountTitle: '',
  accountSubtitle: '',
  avatarText: '',
  basicInfo: {},
  teamMembers: [],
  serviceProducts: []
})

const emptyText = (value) => value || '-'

const infoItems = computed(() => {
  const basicInfo = profile.value.basicInfo || {}
  return [
    { label: '手机', value: emptyText(basicInfo.phone) },
    { label: '座机', value: emptyText(basicInfo.extensionNumber) },
    { label: '邮箱', value: emptyText(basicInfo.email) },
    { label: '座位', value: emptyText(basicInfo.seatNumber) },
    { label: '主体', value: emptyText(basicInfo.organization) },
    { label: '上级', value: emptyText(basicInfo.managerName) },
    { label: '职位', value: emptyText(basicInfo.position) },
    { label: '入职时间', value: emptyText(basicInfo.entryDate) },
    { label: '所属团队', value: emptyText(basicInfo.teamPath) }
  ]
})

const primaryPoints = [
  [20, 62],
  [150, 122],
  [280, 34],
  [410, 30],
  [540, 64],
  [670, 142],
  [740, 166]
]

const avatarText = computed(() => {
  const text = profile.value.avatarText || profile.value.displayName || profile.value.username || '用'
  return String(text).slice(0, 1)
})

const memberColors = ['#e8eefc', '#dff0ff', '#ece9df', '#eadb72', '#d9f0e5']

const members = computed(() => (profile.value.teamMembers || []).map((member, index) => ({
  username: member.username,
  avatar: member.avatarText || member.displayName?.slice(0, 1) || member.username?.slice(0, 1) || '成',
  name: member.displayName || member.username || '-',
  role: [member.department, member.role].filter(Boolean).join(' ') || '-',
  color: member.color || memberColors[index % memberColors.length]
})))

const productColors = ['#0052d9', '#1597f5', '#7786d9', '#0aa873', '#ed7b2f']

const products = computed(() => (profile.value.serviceProducts || []).map((product, index) => ({
  code: product.code,
  label: product.shortName || product.name || product.code || '-',
  color: product.color || productColors[index % productColors.length]
})))

const loadProfile = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await userProfileApi()
    profile.value = {
      ...profile.value,
      ...(data || {}),
      basicInfo: data?.basicInfo || {},
      teamMembers: Array.isArray(data?.teamMembers) ? data.teamMembers : [],
      serviceProducts: Array.isArray(data?.serviceProducts) ? data.serviceProducts : []
    }
  } catch (error) {
    loadError.value = error.message || '个人信息加载失败'
  } finally {
    loading.value = false
  }
}

const goUserInfoSettings = () => {
  router.push({ name: 'user-info-settings' })
}

onMounted(loadProfile)
</script>
