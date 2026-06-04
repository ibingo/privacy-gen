<template>
  <div class="workbench-page">
    <section class="workbench-hero">
      <div>
        <p>工作台</p>
        <h2>选择要进入的工作入口</h2>
        <span>普通成员进入项目选择，超级管理员可进入系统管理。</span>
      </div>
      <t-tag :theme="superAdmin ? 'primary' : 'default'" variant="light">
        {{ superAdmin ? '超级管理员' : '普通成员' }}
      </t-tag>
    </section>

    <section class="workbench-entry-grid">
      <button
        v-for="entry in visibleEntries"
        :key="entry.name"
        class="workbench-entry-card"
        type="button"
        @click="router.push({ name: entry.routeName })"
      >
        <span class="workbench-entry-icon">
          <component :is="entry.icon" />
        </span>
        <span>
          <strong>{{ entry.title }}</strong>
          <small>{{ entry.description }}</small>
        </span>
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  RootListIcon,
  SecuredIcon
} from 'tdesign-icons-vue-next'
import { Tag as TTag } from 'tdesign-vue-next'
import { isSuperAdmin } from '../../utils/auth'

const router = useRouter()
const superAdmin = isSuperAdmin()

const entries = [
  {
    name: 'projects',
    routeName: 'projects',
    title: '项目选择',
    description: '进入项目首页，选择当前要管理的产品和业务空间。',
    icon: RootListIcon,
    adminOnly: false
  },
  {
    name: 'system',
    routeName: 'system-users',
    title: '系统管理',
    description: '管理用户、角色、菜单、部门、岗位、字典、参数和客户端。',
    icon: SecuredIcon,
    adminOnly: true
  }
]

const visibleEntries = computed(() => entries.filter((entry) => !entry.adminOnly || superAdmin))

onMounted(() => {
  if (!superAdmin) {
    router.replace({ name: 'projects' })
  }
})
</script>
