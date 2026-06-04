---
name: tdesign-vue-next-starter
description: Use this skill whenever working on this project's Vue 3 + Vite + TDesign admin UI, especially when the user mentions TDesign Starter, TDesign Vue Next Starter, Tencent starter templates, admin dashboards, route/layout/page scaffolding, TDesign theme/layout conventions, mock/admin pages, or wants new privacy-gen pages to follow TDesign Starter patterns. Prefer this skill even if the user does not explicitly say "skill" after it has been installed in the project.
---

# TDesign Vue Next Starter for privacy-gen

This project is already a Vue 3, Vite, Vue Router, and TDesign based admin prototype. Use TDesign Vue Next Starter as a reference style and architecture, but adapt it to the current repository instead of replacing the app wholesale.

Official references checked when this skill was created:

- Docs: `https://tdesign.tencent.com/starter/docs/vue-next/get-started`
- Starter repo: `https://github.com/Tencent/tdesign-vue-next-starter`
- Current official starter stack: Vue 3, Vite, Pinia, TypeScript, TDesign Vue Next
- Official starter features: common admin pages, complete directory structure, code quality configuration, dark mode, custom theme color, multiple layouts, and mock data

## First steps

1. Inspect the local project before editing:
   - `package.json`
   - `src/main.js`
   - `src/router/index.js`
   - `src/layouts/`
   - `src/config/pages.js`
   - existing page folders under `src/pages/`
   - `src/style.css`
2. Preserve this repository's current implementation language unless the user asks for a migration. The official starter is TypeScript-first, but this project currently uses JavaScript and Vue SFCs.
3. Prefer incremental adoption of Starter patterns. Do not introduce Pinia, TypeScript, mock tooling, lint stacks, or a full starter directory transplant unless the task needs it.
4. Check local versions in `package.json`. As of this skill's creation, the official starter uses `tdesign-vue-next` and `tdesign-icons-vue-next`, which this project already has.

## Architecture guidance

Follow this shape when adding or changing admin features:

- Pages live under `src/pages/<domain>/`.
- Shared business UI lives under `src/components/`.
- Layout shells live under `src/layouts/`.
- Navigation/page metadata belongs in `src/config/pages.js` when that is how the current app drives menus.
- Route definitions belong in `src/router/index.js`; keep route names, paths, and menu metadata aligned.
- API wrappers belong under `src/api/` or existing local request utilities under `src/utils/`.
- Domain constants and mock-like local data belong under `src/config/` unless a server/API layer already exists.

## Project naming rules

Use domain names that match backend modules and product language. For internationalization, do not insert `copy` after `i18n` in files, functions, routes, CSS classes, storage keys, or API wrappers. The preferred vocabulary is:

- `i18n project` for 国际化项目, e.g. `I18nProjectListPage`, `i18n-project-list`, `listI18nProjectsApi`
- `i18n word` for 国际化文案/词条, e.g. `I18nWordListPage`, `i18n-word-list`, `listI18nWordsApi`
- `i18n tag` for 标签管理, e.g. `I18nTagManagePage`, `i18n-word-tags`
- Backend endpoints may still contain their own paths such as `/i18n/words/list`; match the API path but keep local wrapper names clean.

When touching older code that still uses `I18nCopy*`, `i18n-copy-*`, or `i18nCopy*`, normalize it to the vocabulary above as part of the change instead of extending the old naming.

For this project, keep the existing product domains visible and consistent:

- legal documents
- internationalization
- icon resources
- app icons
- app launch screens
- mobile app center
- feature flags
- system/account/workbench pages when present

## TDesign component usage

Use TDesign Vue Next components as the default UI vocabulary for desktop/admin screens:

- `t-layout`, `t-header`, `t-aside`, `t-content` for major shells when editing layouts.
- `t-menu` and `t-menu-item` for navigation.
- `t-breadcrumb` for nested admin pages when the surrounding layout supports it.
- `t-card` for repeated item cards or genuinely framed widgets, not as a wrapper around every section.
- `t-table`, `t-pagination`, `t-form`, `t-input`, `t-select`, `t-date-range-picker`, `t-dialog`, `t-drawer`, `t-tabs`, `t-tag`, `t-alert`, and `t-loading` for standard admin interactions.
- Icons should come from `tdesign-icons-vue-next` when available.

Use `tdesign-mobile-vue` only for mobile-specific surfaces or when the existing page is already built on mobile components.

## Page design rules

Build dense, work-focused admin screens:

- Put the user's main workflow on the first screen; avoid marketing-style landing pages.
- Use restrained page headers with title, short context, and primary actions.
- Prefer searchable/filterable tables for lists with operational data.
- For `StarterListPage`/筛选列表模板 pages, do not show the layout-level gray page heading above the breadcrumb/card. Keep the page title in the breadcrumb/table context and put actions/filters in the list toolbar.
- Prefer forms, drawers, and dialogs for create/edit workflows.
- Keep spacing consistent with the current app and TDesign defaults.
- Avoid nested cards and decorative gradients.
- Make empty, loading, and error states explicit.
- Make destructive actions confirmable.

## Routing and navigation checklist

When adding a page:

1. Add the Vue SFC under the correct `src/pages/<domain>/` folder.
2. Register the route in `src/router/index.js`.
3. Add or update menu/page config in `src/config/pages.js` if the sidebar or module cards depend on it.
4. Verify auth/redirect behavior follows the existing router guard.
5. Use route names consistently so menu active states and navigation helpers keep working.

## Data and API patterns

Before adding data access:

- Inspect existing `src/api/` and `src/utils/http.js` if present.
- Use the existing axios/request wrapper rather than creating another client.
- Keep request functions small and domain-named.
- If backend endpoints do not exist, use local config/mock data close to the feature and label it clearly in code naming.

## Theme and styling

TDesign Starter supports dark mode and custom theme color. In this repo:

- Prefer TDesign design tokens and existing CSS variables from `src/style.css`.
- Scope page-specific styles inside the SFC when possible.
- Keep global style changes small and justified.
- Use TDesign's built-in component states before hand-writing custom controls.
- Do not make broad color or spacing rewrites while implementing a feature unless requested.

## Verification

After code changes, run the most relevant checks available in this repo:

```bash
npm run build
```

For UI work, also run the dev server when feasible:

```bash
npm run dev
```

Then inspect the affected route in the browser or with a screenshot tool if available. Check for:

- no console/build errors
- route loads correctly
- sidebar/menu active state is correct
- table/form/dialog interactions work
- responsive layout does not overlap text or controls

## When to consult upstream

If the user asks for exact Starter parity, installation steps, current dependencies, or a migration to the latest official starter, re-check the official docs/repo because versions can change:

- `https://tdesign.tencent.com/starter/docs/vue-next/get-started`
- `https://github.com/Tencent/tdesign-vue-next-starter`

Official initialization flow from the current README:

```bash
npm i tdesign-starter-cli@latest -g
td-starter init
```

Do not run this inside the current project unless the user explicitly wants to scaffold a separate starter project or replace the current app.
