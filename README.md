# Privacy Gen

一个基于 Vue 3、Vite 和 TDesign 的法务文档生成工具，用于在本地快速生成 App 隐私政策与用户协议。

本项目由小米 MiMo 和 GPT 辅助生成。

当前项目提供两个文档生成入口：

- 隐私政策生成器
- 用户协议生成器

用户填写应用基础信息后，可以实时预览生成结果，并导出为 `Markdown`、`TXT` 或 `HTML`。

## 功能特性

- 支持生成 App 隐私政策
- 支持生成 App 用户协议
- 表单修改后实时更新预览内容
- 支持维护第三方 SDK 列表并写入隐私政策
- 支持复制生成内容到剪贴板
- 支持下载为 `Markdown`、`TXT`、`HTML`
- 基于纯前端实现，本地即可运行

## 技术栈

- Vue 3
- Vite 5
- TDesign Vue Next
- tdesign-icons-vue-next

## 安装与运行

先安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 使用说明

1. 启动项目后进入首页。
2. 选择“隐私政策”或“用户协议”生成入口。
3. 填写应用名称、公司名称、联系邮箱、生效日期等信息。
4. 如果是隐私政策，可继续补充第三方 SDK 信息与其他说明。
5. 在右侧实时预览生成结果。
6. 使用底部按钮复制内容，或导出为 `Markdown`、`TXT`、`HTML` 文件。

## 页面结构

- 首页：选择文档类型
- 隐私政策页面：左侧表单，右侧预览
- 用户协议页面：左侧表单，右侧预览

## 项目结构

```text
privacy-gen/
├── src/
│   ├── components/
│   │   ├── AgreementForm.vue
│   │   ├── AgreementPreview.vue
│   │   ├── PolicyForm.vue
│   │   └── PolicyPreview.vue
│   ├── utils/
│   │   ├── agreementGenerator.js
│   │   ├── exportUtils.js
│   │   └── policyGenerator.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
└── vite.config.js
```

## 核心实现说明

### 1. 文档生成

- `src/utils/policyGenerator.js` 负责拼接隐私政策文本
- `src/utils/agreementGenerator.js` 负责拼接用户协议文本

两者都基于表单数据生成 Markdown 文本，并在输入为空时提供默认占位内容。

### 2. 预览渲染

- `src/utils/exportUtils.js` 中的 `markdownToHtml` 用于将生成后的 Markdown 文本转换为 HTML
- 预览区通过 `v-html` 展示转换后的内容

### 3. 导出能力

- 支持导出 `.md`
- 支持导出 `.txt`
- 支持导出 `.html`

`HTML` 导出会自动包装基础样式，便于直接打开查看。

## 已有输入项

### 隐私政策

- 应用名称
- 公司名称
- 联系邮箱
- 生效日期
- 第三方 SDK 列表
  - SDK 名称
  - 第三方公司名称
  - 使用目的
  - 收集的个人信息类型
  - 处理方式
  - 隐私政策链接
- 其他说明

### 用户协议

- 应用名称
- 公司名称
- 联系邮箱
- 生效日期
- 服务范围
- 补充条款

## 适用场景

- 移动应用上架前整理基础法务文档
- 内部快速生成隐私政策初稿
- 为产品、运营或法务同事提供可编辑模板
- 快速导出一份可继续人工修订的协议草稿

## 当前限制

- 当前文档内容为模板化生成，不构成正式法律意见
- Markdown 转 HTML 使用的是轻量规则转换，不是完整 Markdown 解析器
- 未接入后端存储，刷新页面后表单内容不会保留
- 未提供多模板、多语言、版本管理等能力

## 后续可扩展方向

- 增加更多协议模板
- 支持草稿保存与恢复
- 支持自定义章节开关
- 支持导出 PDF
- 支持多语言文档生成
- 支持团队内统一管理常用 SDK 条款

## 说明

本项目适合用作法务文档生成的前端原型或内部工具。若用于正式业务发布，建议由法务或合规人员对生成结果进行逐条审阅与修订。
