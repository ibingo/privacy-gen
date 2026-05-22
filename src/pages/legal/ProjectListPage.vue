<template>
  <div class="project-list-page">
    <div class="project-list-toolbar">
      <button class="project-create-button" type="button">新建产品</button>
      <label class="project-list-search">
        <search-icon />
        <input v-model="keyword" type="search" placeholder="请输入内容搜索" />
      </label>
    </div>

    <div class="project-card-grid">
      <button
        v-for="project in filteredProjects"
        :key="project.value"
        class="project-card"
        type="button"
        @click="handleSelectProject(project)"
      >
        <div class="project-card-head">
          <span class="project-card-icon">{{ project.shortName }}</span>
          <span class="project-card-status" :class="`is-${project.statusTone}`">
            {{ project.status }}
          </span>
        </div>

        <div class="project-card-body">
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
        </div>

        <div class="project-card-foot">
          <div class="project-card-tags">
            <span>{{ project.shortName }}</span>
            <span>+</span>
          </div>
          <span class="project-card-more">···</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import {
  defaultProjectRouteName,
  existingProjects,
  PROJECT_STORAGE_KEY
} from '../../config/projects'

const route = useRoute()
const router = useRouter()
const keyword = ref('')

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())

const filteredProjects = computed(() => {
  if (!normalizedKeyword.value) {
    return existingProjects
  }

  return existingProjects.filter((project) => {
    const haystack = `${project.name} ${project.description} ${project.shortName}`.toLowerCase()
    return haystack.includes(normalizedKeyword.value)
  })
})

const handleSelectProject = (project) => {
  localStorage.setItem(PROJECT_STORAGE_KEY, project.value)
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
  if (redirect) {
    router.push(redirect)
    return
  }

  router.push({ name: defaultProjectRouteName })
}
</script>
