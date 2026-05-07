<template>
  <t-layout class="starter-shell">
    <t-aside class="starter-aside">
      <div class="brand-block">
        <p class="brand-mark">Privacy Gen</p>
        <h1>法务中心</h1>
        <span>Legal Workspace</span>
      </div>

      <t-menu
        :value="activeMenu"
        :expanded="expandedMenus"
        theme="light"
        class="nav-menu"
        @change="handleMenuChange"
        @expand="handleExpand"
      >
        <t-submenu
          v-for="group in pageGroups"
          :key="group.title"
          :value="group.title"
        >
          <template #icon>
            <component :is="resolveIcon(group.icon)" />
          </template>
          <template #title>
            {{ group.title }}
          </template>
          <t-menu-item
            v-for="page in group.children"
            :key="page.name"
            :value="page.name"
          >
            <template #icon>
              <component :is="resolveIcon(page.icon)" />
            </template>
            {{ page.title }}
          </t-menu-item>
        </t-submenu>
      </t-menu>
    </t-aside>

    <t-layout class="starter-main-layout">
      <t-header class="starter-header">
        <div class="header-copy">
          <p class="eyebrow">{{ currentGroupTitle }}</p>
          <h2>{{ pageTitle }}</h2>
          <p>{{ pageDescription }}</p>
        </div>
      </t-header>
      <t-content class="starter-main-content">
        <router-view />
      </t-content>
    </t-layout>
  </t-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  FileIcon,
  RootListIcon,
  SecuredIcon,
  Setting1Icon,
  ViewListIcon
} from 'tdesign-icons-vue-next'
import {
  Aside as TAside,
  Content as TContent,
  Header as THeader,
  Layout as TLayout,
  Menu as TMenu,
  MenuItem as TMenuItem,
  Submenu as TSubmenu
} from 'tdesign-vue-next'
import { pageGroups, pages } from '../config/pages'

const route = useRoute()
const router = useRouter()
const expandedMenus = ref(pageGroups.map((group) => group.title))

const iconMap = {
  FileIcon,
  RootListIcon,
  SecuredIcon,
  Setting1Icon,
  ViewListIcon
}

const activeMenu = computed(() => route.name || 'home')
const pageMeta = computed(() => pages[route.name] || pages.home)
const pageTitle = computed(() => pageMeta.value.title)
const pageDescription = computed(() => pageMeta.value.description)
const currentGroupTitle = computed(() => {
  const group = pageGroups.find((item) => item.children.some((page) => page.name === route.name))
  return group?.title || pageGroups[0]?.title || ''
})

const resolveIcon = (iconName) => iconMap[iconName] || ViewListIcon

const handleMenuChange = (name) => {
  router.push({ name })
}

const handleExpand = (values) => {
  expandedMenus.value = values
}
</script>
