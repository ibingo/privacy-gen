import { iconAssets } from '../config/iconAssets'
import { defaultIconProjectId, getActiveIconProjectId } from '../config/iconProjects'
import { normalizePathItems } from './pathData'

export const ICON_LIBRARY_STORAGE_KEY = 'privacy-gen:icon-library'
export const ICON_CATEGORY_STORAGE_KEY = 'privacy-gen:icon-categories'
export const ICON_HISTORY_STORAGE_KEY = 'privacy-gen:icon-history'

const fallbackPath = { d: 'M12 5v14M5 12h14', stroke: true }

export const createBlankIcon = () => ({
  id: `icon-${Date.now()}`,
  name: 'untitled-icon',
  category: '',
  iconType: 'stroke',
  updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  status: '草稿',
  statusTone: 'processing',
  figmaFrame: 'Imported / Untitled',
  paths: [{ ...fallbackPath }]
})

const normalizeIcon = (icon) => {
  const paths = Array.isArray(icon?.paths) && icon.paths.length
    ? normalizePathItems(icon.paths)
    : []

  return {
    ...createBlankIcon(),
    ...icon,
    iconType: icon?.iconType === 'fill' ? 'fill' : 'stroke',
    paths: paths.length ? paths : [{ ...fallbackPath }]
  }
}

const getProjectStorageKey = (projectId = getActiveIconProjectId()) => {
  return `${ICON_LIBRARY_STORAGE_KEY}:${projectId || defaultIconProjectId}`
}

const getCategoryStorageKey = (projectId = getActiveIconProjectId()) => {
  return `${ICON_CATEGORY_STORAGE_KEY}:${projectId || defaultIconProjectId}`
}

const getHistoryStorageKey = (iconId, projectId = getActiveIconProjectId()) => {
  return `${ICON_HISTORY_STORAGE_KEY}:${projectId || defaultIconProjectId}:${iconId}`
}

export const readIconLibrary = (projectId = getActiveIconProjectId()) => {
  if (typeof localStorage === 'undefined') return iconAssets

  try {
    const stored = JSON.parse(localStorage.getItem(getProjectStorageKey(projectId)) || '[]')
    return Array.isArray(stored) ? stored.map(normalizeIcon) : []
  } catch {
    return []
  }
}

export const writeIconLibrary = (icons, projectId = getActiveIconProjectId()) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(getProjectStorageKey(projectId), JSON.stringify(icons.map(normalizeIcon)))
}

export const upsertIcon = (icon, projectId = getActiveIconProjectId()) => {
  const icons = readIconLibrary(projectId)
  const normalized = normalizeIcon({
    ...icon,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  })
  const index = icons.findIndex((item) => item.id === normalized.id)

  if (index >= 0) {
    icons.splice(index, 1, normalized)
  } else {
    icons.unshift(normalized)
  }

  writeIconLibrary(icons, projectId)
  return normalized
}

export const appendIcons = (nextIcons, projectId = getActiveIconProjectId()) => {
  const icons = readIconLibrary(projectId)
  const normalized = nextIcons.map(normalizeIcon)
  writeIconLibrary([...normalized, ...icons], projectId)
  return normalized
}

export const findIconAsset = (id, projectId = getActiveIconProjectId()) => {
  return readIconLibrary(projectId).find((icon) => icon.id === id) || createBlankIcon()
}

export const deleteIconAsset = (id, projectId = getActiveIconProjectId()) => {
  const icons = readIconLibrary(projectId)
  const nextIcons = icons.filter((icon) => icon.id !== id)
  writeIconLibrary(nextIcons, projectId)
  deleteIconHistory(id, projectId)
  return nextIcons.length !== icons.length
}

export const readIconHistory = (iconId, projectId = getActiveIconProjectId()) => {
  if (typeof localStorage === 'undefined' || !iconId) return null

  try {
    const stored = JSON.parse(localStorage.getItem(getHistoryStorageKey(iconId, projectId)) || 'null')
    return stored && typeof stored === 'object' ? stored : null
  } catch {
    return null
  }
}

export const writeIconHistory = (iconId, history, projectId = getActiveIconProjectId()) => {
  if (typeof localStorage === 'undefined' || !iconId) return
  localStorage.setItem(getHistoryStorageKey(iconId, projectId), JSON.stringify(history))
}

export const deleteIconHistory = (iconId, projectId = getActiveIconProjectId()) => {
  if (typeof localStorage === 'undefined' || !iconId) return
  localStorage.removeItem(getHistoryStorageKey(iconId, projectId))
}

export const readIconCategories = (projectId = getActiveIconProjectId()) => {
  if (typeof localStorage === 'undefined') return []

  try {
    const stored = JSON.parse(localStorage.getItem(getCategoryStorageKey(projectId)) || '[]')
    return Array.isArray(stored) ? stored.filter((item) => item?.value && item?.label) : []
  } catch {
    return []
  }
}

export const writeIconCategories = (categories, projectId = getActiveIconProjectId()) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(getCategoryStorageKey(projectId), JSON.stringify(categories))
}

export const createIconCategory = (label, projectId = getActiveIconProjectId()) => {
  const normalizedLabel = String(label || '').trim()
  if (!normalizedLabel) return null

  const categories = readIconCategories(projectId)
  const existing = categories.find((item) => item.label === normalizedLabel)
  if (existing) return existing

  const category = {
    value: `category-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: normalizedLabel
  }
  writeIconCategories([...categories, category], projectId)
  return category
}

export const renameIconCategory = (categoryId, label, projectId = getActiveIconProjectId()) => {
  const normalizedLabel = String(label || '').trim()
  if (!categoryId || !normalizedLabel) return null

  const categories = readIconCategories(projectId)
  const nextCategories = categories.map((item) => (
    item.value === categoryId ? { ...item, label: normalizedLabel } : item
  ))
  writeIconCategories(nextCategories, projectId)
  return nextCategories.find((item) => item.value === categoryId) || null
}

export const assignIconCategory = (iconId, categoryId, projectId = getActiveIconProjectId()) => {
  const icons = readIconLibrary(projectId)
  const nextIcons = icons.map((icon) => (
    icon.id === iconId
      ? { ...icon, category: categoryId, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }
      : icon
  ))
  writeIconLibrary(nextIcons, projectId)
  return nextIcons
}
