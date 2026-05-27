<template>
  <div class="project-list-page">
    <div class="project-list-toolbar">
      <button v-if="isSuperAdmin()" class="project-create-button" type="button">新建产品</button>
      <label class="project-list-search">
        <search-icon />
        <input v-model="keyword" type="search" placeholder="请输入内容搜索" @input="handleSearch" />
      </label>
    </div>

    <div v-if="loading" class="project-card-grid project-card-grid--loading">
      <div v-for="i in 6" :key="i" class="project-card project-card--skeleton" />
    </div>

    <div v-else-if="projects.length" class="project-card-grid">
      <button
        v-for="project in projects"
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

    <div v-else class="project-card-empty">
      <p>暂无项目数据</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { getProjects } from '../../api/projects'
import { defaultProjectRouteName, PROJECT_STORAGE_KEY } from '../../config/projects'
import { isSuperAdmin } from '../../utils/auth'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const projects = ref([])
const loading = ref(true)

let searchTimer = null

const fetchProjects = async (kw) => {
  loading.value = true
  try {
    const data = await getProjects(kw ? { keyword: kw } : undefined)
    projects.value = Array.isArray(data) ? data : []
  } catch {
    projects.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchProjects(keyword.value), 300)
}

const handleSelectProject = (project) => {
  localStorage.setItem(PROJECT_STORAGE_KEY, project.value)
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
  if (redirect) {
    router.push(redirect)
    return
  }
  router.push({ name: defaultProjectRouteName })
}

onMounted(() => fetchProjects())
</script>
