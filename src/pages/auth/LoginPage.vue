<template>
  <div class="login-page">
    <header class="login-header">
      <div class="login-brand">
        <span class="login-brand-mark">P</span>
        <span>Privacy Gen</span>
      </div>
      <div class="login-header-actions">
        <t-button variant="text" shape="square" title="代码仓库">
          <logo-github-icon />
        </t-button>
        <t-button variant="text" shape="square" title="帮助">
          <help-circle-icon />
        </t-button>
        <t-button variant="text" shape="square" title="设置">
          <setting-icon />
        </t-button>
      </div>
    </header>

    <main class="login-main">
      <section class="login-panel">
        <div class="login-copy">
          <p class="login-copy-subtitle">登录到</p>
          <h1>Privacy Gen</h1>
          <p class="login-copy-meta">
            没有账号吗？
            <a href="javascript:void(0)">注册新账号</a>
          </p>
        </div>

        <t-form
          ref="form"
          class="login-form"
          :data="formData"
          :rules="rules"
          label-align="top"
          @submit="handleSubmit"
        >
          <t-form-item name="username">
            <t-input
              v-model="formData.username"
              size="large"
              clearable
              placeholder="请输入账号"
            >
              <template #prefix-icon>
                <user-icon />
              </template>
            </t-input>
          </t-form-item>

          <t-form-item name="password">
            <t-input
              v-model="formData.password"
              size="large"
              type="password"
              clearable
              placeholder="请输入密码"
            >
              <template #prefix-icon>
                <lock-on-icon />
              </template>
            </t-input>
          </t-form-item>

          <div class="login-form-row">
            <t-checkbox v-model="rememberMe">记住账号</t-checkbox>
            <a href="javascript:void(0)">忘记账号</a>
          </div>

          <t-button theme="primary" type="submit" size="large" block>
            登录
          </t-button>

          <div class="login-alt-actions">
            <a href="javascript:void(0)">使用企业微信扫码登录</a>
            <a href="javascript:void(0)">使用手机号登录</a>
          </div>
        </t-form>

        <p class="login-demo-tip">演示账号：admin / admin123</p>

        <t-button
          v-if="isDev"
          theme="warning"
          variant="dashed"
          size="large"
          block
          style="margin-top: 8px"
          @click="handleDevLogin"
        >
          开发者登录（跳过认证）
        </t-button>
      </section>

      <section class="login-visual" aria-hidden="true">
        <div class="visual-grid"></div>
        <div class="visual-orbit visual-orbit-lg"></div>
        <div class="visual-orbit visual-orbit-sm"></div>
        <div class="visual-hero">
          <div class="visual-card visual-card-primary">Privacy</div>
          <div class="visual-card visual-card-secondary">Agreement</div>
          <div class="visual-device">
            <div class="visual-device-screen">
              <div class="visual-lines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="visual-switch"></div>
            </div>
          </div>
          <div class="visual-badge">
            <span>P</span>
          </div>
          <div class="visual-spheres">
            <span class="sphere sphere-blue"></span>
            <span class="sphere sphere-green"></span>
            <span class="sphere sphere-light"></span>
          </div>
          <div class="visual-text">Legal</div>
        </div>

        <div class="login-theme-switcher">
          <button class="theme-chip is-active" type="button">默认主题</button>
          <button class="theme-icon" type="button">
            <setting-icon />
          </button>
          <button class="theme-icon" type="button">
            <secured-icon />
          </button>
        </div>
      </section>
    </main>

    <footer class="login-footer">
      Copyright @ 2021-2026 Privacy Gen. All Rights Reserved
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HelpCircleIcon,
  LockOnIcon,
  LogoGithubIcon,
  SecuredIcon,
  SettingIcon,
  UserIcon
} from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Checkbox as TCheckbox,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin
} from 'tdesign-vue-next'
import { login, devLogin, isSuperAdmin } from '../../utils/auth'

const isDev = import.meta.env.DEV

const router = useRouter()
const route = useRoute()
const form = ref()
const rememberMe = ref(true)
const formData = reactive({
  username: 'admin',
  password: 'admin123'
})

const rules = {
  username: [{ required: true, message: '请输入账号', type: 'error' }],
  password: [{ required: true, message: '请输入密码', type: 'error' }]
}

const handleDevLogin = async () => {
  try {
    await devLogin()
    const redirect = resolveLoginRedirect()
    router.replace(redirect)
  } catch (e) {
    MessagePlugin.error(e.message || '开发者登录失败')
  }
}

const handleSubmit = async ({ validateResult }) => {
  if (validateResult !== true) {
    return
  }

  try {
    await login(formData)
    const redirect = resolveLoginRedirect()
    MessagePlugin.success('登录成功')
    router.replace(redirect)
  } catch (e) {
    MessagePlugin.error(e.message || '账号或密码错误')
  }
}

const resolveLoginRedirect = () => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (isSuperAdmin()) return '/workbench'
  return redirect && redirect !== '/workbench' ? redirect : '/legal/projects'
}
</script>
