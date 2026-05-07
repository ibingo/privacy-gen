<template>
  <t-card class="panel config-panel" :bordered="false">
    <template #title>
      <div class="panel-title">
        <span>配置</span>
        <t-tag theme="default" variant="light">本地设置</t-tag>
      </div>
    </template>

    <t-form layout="vertical" class="config-form">
      <div class="config-item">
        <div class="config-item-main">
          <div>
            <h2>存放 HTML 的目录</h2>
            <p>开启后可填写生成 HTML 文件的保存目录。</p>
          </div>
          <t-switch v-model="config.htmlDirectoryEnabled" />
        </div>

        <t-form-item label="目录路径">
          <t-input
            v-model="config.htmlDirectory"
            clearable
            :disabled="!config.htmlDirectoryEnabled"
            placeholder=""
          />
        </t-form-item>
      </div>
    </t-form>
  </t-card>
</template>

<script setup>
import { reactive } from 'vue'
import {
  Card as TCard,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Switch as TSwitch,
  Tag as TTag
} from 'tdesign-vue-next'

const config = reactive({
  htmlDirectoryEnabled: false,
  htmlDirectory: ''
})
</script>

<style scoped>
.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.config-form :deep(.t-form__label) {
  color: #3d4757;
  font-weight: 600;
}

.config-item {
  display: grid;
  gap: 18px;
}

.config-item-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.config-item h2 {
  color: #111827;
  font-size: 1.12rem;
  line-height: 1.35;
  margin-bottom: 6px;
}

.config-item p {
  color: #596579;
  font-size: 0.95rem;
  line-height: 1.7;
}

@media (max-width: 720px) {
  .config-item-main {
    align-items: center;
  }
}
</style>
