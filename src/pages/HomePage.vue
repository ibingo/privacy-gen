<template>
  <div class="home-content">
    <section v-for="section in homeSections" :key="section.title" class="overview-section">
      <div class="overview-header">
        <div>
          <h3>{{ section.title }}</h3>
          <p>{{ section.description }}</p>
        </div>
      </div>

      <div class="route-table">
        <div class="route-table-head route-table-row">
          <span>菜单名称</span>
          <span>路由路径</span>
          <span>说明</span>
          <span>操作</span>
        </div>

        <button
          v-for="page in section.children"
          :key="page.name"
          type="button"
          class="route-table-row route-table-action"
          @click="goTo(page.name)"
        >
          <span class="route-title">{{ page.title }}</span>
          <span class="route-path">{{ page.path }}</span>
          <span class="route-description">{{ page.description }}</span>
          <span class="route-link">进入</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { homeSections } from '../config/pages'

const router = useRouter()

const goTo = (name) => {
  router.push({ name })
}
</script>
