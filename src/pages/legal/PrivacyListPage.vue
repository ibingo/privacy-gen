<template>
  <div class="document-list-page">
    <div class="document-list-panel">
      <div class="document-list-toolbar">
        <div class="document-list-actions">
          <button class="document-primary-button" type="button" @click="goToCreate">
            新建隐私政策
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
          <span>文档名称</span>
          <span>文档状态</span>
          <span>版本号</span>
          <span>适用终端</span>
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
          <span>{{ item.platform }}</span>
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
  { id: 'pp-001', name: '小米商城 App 隐私政策', status: '已完成', statusTone: 'success', version: 'V3.2.0', platform: 'iOS / Android', updatedAt: '2026-05-08 09:20', checked: true },
  { id: 'pp-002', name: '会员中心 小程序隐私政策', status: '待发布', statusTone: 'warning', version: 'V2.1.3', platform: '微信小程序', updatedAt: '2026-05-07 18:10', checked: true },
  { id: 'pp-003', name: '出海版 App 隐私政策', status: '审核中', statusTone: 'processing', version: 'V1.9.4', platform: 'Android', updatedAt: '2026-05-07 15:44', checked: false },
  { id: 'pp-004', name: '车机端隐私政策', status: '已完成', statusTone: 'success', version: 'V1.4.2', platform: '车机', updatedAt: '2026-05-06 20:31', checked: false },
  { id: 'pp-005', name: '海外账号中心隐私政策', status: '审核失败', statusTone: 'danger', version: 'V2.0.1', platform: 'Web', updatedAt: '2026-05-06 11:09', checked: false },
  { id: 'pp-006', name: 'IoT 设备配网隐私政策', status: '待发布', statusTone: 'warning', version: 'V1.0.8', platform: 'IoT', updatedAt: '2026-05-05 16:27', checked: false },
  { id: 'pp-007', name: '门店导购 App 隐私政策', status: '已完成', statusTone: 'success', version: 'V2.6.5', platform: 'Android', updatedAt: '2026-05-05 09:16', checked: false }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((item) => `${item.name} ${item.version} ${item.platform}`.toLowerCase().includes(q))
})

const goToCreate = () => {
  router.push({ name: 'privacy' })
}
</script>
