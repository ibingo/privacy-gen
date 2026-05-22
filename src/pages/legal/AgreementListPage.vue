<template>
  <div class="document-list-page">
    <div class="document-list-panel">
      <div class="document-list-toolbar">
        <div class="document-list-actions">
          <button class="document-primary-button" type="button" @click="goToCreate">
            新建用户协议
          </button>
          <span class="document-selection-text">已选 2 项</span>
        </div>

        <label class="document-search">
          <search-icon />
          <input v-model="keyword" type="search" placeholder="请输入内容搜索" />
        </label>
      </div>

      <div class="document-table">
        <div class="document-table-head document-table-row">
          <span></span>
          <span>协议名称</span>
          <span>协议状态</span>
          <span>版本号</span>
          <span>业务类型</span>
          <span>最近更新</span>
          <span>操作</span>
        </div>

        <div
          v-for="item in filteredRows"
          :key="item.id"
          class="document-table-row"
        >
          <span class="document-cell-check">
            <input type="checkbox" :checked="item.checked" />
          </span>
          <span class="document-name">{{ item.name }}</span>
          <span>
            <span class="document-status" :class="`is-${item.statusTone}`">{{ item.status }}</span>
          </span>
          <span>{{ item.version }}</span>
          <span>{{ item.businessType }}</span>
          <span>{{ item.updatedAt }}</span>
          <span class="document-actions-cell">
            <button type="button" @click="goToCreate">详情</button>
            <button type="button" class="is-danger">删除</button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'

const router = useRouter()
const keyword = ref('')

const rows = [
  { id: 'ua-001', name: '小米商城 App 用户协议', status: '已完成', statusTone: 'success', version: 'V5.0.2', businessType: '电商', updatedAt: '2026-05-08 10:32', checked: true },
  { id: 'ua-002', name: '会员中心服务协议', status: '待发布', statusTone: 'warning', version: 'V2.3.1', businessType: '会员', updatedAt: '2026-05-07 19:03', checked: true },
  { id: 'ua-003', name: '智能家居服务协议', status: '审核中', statusTone: 'processing', version: 'V3.1.8', businessType: 'IoT', updatedAt: '2026-05-07 14:51', checked: false },
  { id: 'ua-004', name: '售后服务协议', status: '已完成', statusTone: 'success', version: 'V1.7.4', businessType: '售后', updatedAt: '2026-05-06 21:15', checked: false },
  { id: 'ua-005', name: '国际站服务条款', status: '审核失败', statusTone: 'danger', version: 'V2.4.0', businessType: '出海', updatedAt: '2026-05-06 12:28', checked: false },
  { id: 'ua-006', name: '设备云服务协议', status: '待发布', statusTone: 'warning', version: 'V1.2.9', businessType: '云服务', updatedAt: '2026-05-05 17:40', checked: false },
  { id: 'ua-007', name: '门店会员注册协议', status: '已完成', statusTone: 'success', version: 'V4.1.6', businessType: '零售', updatedAt: '2026-05-05 08:56', checked: false }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((item) => `${item.name} ${item.version} ${item.businessType}`.toLowerCase().includes(q))
})

const goToCreate = () => {
  router.push({ name: 'agreement' })
}
</script>
