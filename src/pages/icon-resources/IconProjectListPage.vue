<template>
  <div class="document-list-page">
    <div class="document-list-panel">
      <div class="document-list-toolbar">
        <div class="document-list-actions">
          <button class="document-primary-button" type="button" @click="createProject">
            新建图标项目
          </button>
          <span class="document-selection-text">已选 2 项</span>
        </div>

        <label class="document-search">
          <search-icon />
          <input v-model="keyword" type="search" placeholder="请输入内容搜索" />
        </label>
      </div>

      <div class="document-table">
        <div class="document-table-head document-table-row icon-project-table-row">
          <span></span>
          <span>项目名称</span>
          <span>项目状态</span>
          <span>版本号</span>
          <span>隔离环境</span>
          <span>最近更新</span>
          <span>操作</span>
        </div>

        <div
          v-for="item in filteredRows"
          :key="item.id"
          class="document-table-row icon-project-table-row"
        >
          <span class="document-cell-check">
            <input type="checkbox" :checked="item.checked" />
          </span>
          <span class="document-name">{{ item.name }}</span>
          <span>
            <span class="document-status" :class="`is-${item.statusTone}`">{{ item.status }}</span>
          </span>
          <span>{{ item.version }}</span>
          <span>{{ item.environment }}</span>
          <span>{{ item.updatedAt }}</span>
          <span class="document-actions-cell">
            <button type="button" @click="openProject(item)">详情</button>
            <button type="button" class="is-danger">删除</button>
          </span>
        </div>
      </div>
    </div>

    <div v-if="projectDialogVisible" class="icon-dialog-mask" @click.self="closeProjectDialog">
      <div class="icon-dialog">
        <h3>新建图标项目</h3>
        <label class="icon-field">
          <span>项目名称</span>
          <input v-model="projectForm.name" type="text" placeholder="例如：商城生产图标库" @keydown.enter="saveProject" />
        </label>
        <label class="icon-field">
          <span>隔离环境</span>
          <select v-model="projectForm.environment">
            <option value="开发">开发</option>
            <option value="测试">测试</option>
            <option value="预发">预发</option>
            <option value="生产">生产</option>
          </select>
        </label>
        <label class="icon-field">
          <span>版本号</span>
          <input v-model="projectForm.version" type="text" placeholder="V1.0.0" @keydown.enter="saveProject" />
        </label>
        <div class="icon-dialog-actions">
          <button class="icon-secondary-button" type="button" @click="closeProjectDialog">取消</button>
          <button class="document-primary-button" type="button" @click="saveProject">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  createIconProject,
  readIconProjects,
  setActiveIconProjectId
} from '../../config/iconProjects'

const router = useRouter()
const keyword = ref('')
const rows = ref(readIconProjects())
const projectDialogVisible = ref(false)
const projectForm = reactive({
  name: '',
  environment: '开发',
  version: 'V1.0.0'
})

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((item) => {
    return `${item.name} ${item.status} ${item.version} ${item.environment}`.toLowerCase().includes(q)
  })
})

const openProject = (project) => {
  setActiveIconProjectId(project.id)
  router.push({ name: 'icon-list', params: { projectId: project.id } })
}

const createProject = () => {
  projectDialogVisible.value = true
}

const closeProjectDialog = () => {
  projectDialogVisible.value = false
  projectForm.name = ''
  projectForm.environment = '开发'
  projectForm.version = 'V1.0.0'
}

const saveProject = () => {
  if (!projectForm.name.trim()) {
    MessagePlugin.warning('请输入项目名称')
    return
  }

  const project = createIconProject(projectForm)
  rows.value = readIconProjects()
  setActiveIconProjectId(project.id)
  closeProjectDialog()
  MessagePlugin.success('图标项目已创建')
  router.push({ name: 'icon-list', params: { projectId: project.id } })
}
</script>
