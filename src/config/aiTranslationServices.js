export const AI_TRANSLATION_SERVICES_STORAGE_KEY = 'privacy-gen:ai-translation-services'

export const defaultSystemPrompt = `You are a professional {{to}} native translator who needs to fluently translate text into {{to}}.
1. Keep the original meaning and tone.
2. Preserve placeholders, variables and line breaks.
3. If the text contains HTML tags, keep the tags in the translated output.
4. Do not translate proper nouns, code or values that should remain unchanged.
5. Output only the translated text.`

export const defaultMultiplePrompt = `Translate to {{to}}:

{{text}}`

export const defaultSinglePrompt = `Translate to {{to}} (output translation only):

{{text}}`

export const defaultAiTranslationServices = [
  {
    id: 'ai-service-deepseek',
    name: 'DeepSeek 1',
    provider: 'deepseek',
    apiKey: '',
    model: 'deepseek-v4-flash',
    customModelEnabled: false,
    enabledAiContext: false,
    strategy: 'general',
    endpoint: 'https://api.deepseek.com/chat/completions',
    systemPrompt: defaultSystemPrompt,
    multiplePrompt: defaultMultiplePrompt,
    singlePrompt: defaultSinglePrompt,
    maxRequestsPerSecond: 10,
    maxTextLength: 1200,
    maxParagraphsPerRequest: 4,
    richTextEnabled: false,
    maxSubtitleParagraphs: 5,
    temperature: 0,
    status: 'enabled',
    updatedAt: '2026-05-27 00:00'
  },
  {
    id: 'ai-service-openai',
    name: 'OpenAI 默认',
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4.1-mini',
    customModelEnabled: false,
    enabledAiContext: true,
    strategy: 'general',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    systemPrompt: defaultSystemPrompt,
    multiplePrompt: defaultMultiplePrompt,
    singlePrompt: defaultSinglePrompt,
    maxRequestsPerSecond: 8,
    maxTextLength: 1600,
    maxParagraphsPerRequest: 4,
    richTextEnabled: false,
    maxSubtitleParagraphs: 5,
    temperature: 0,
    status: 'enabled',
    updatedAt: '2026-05-27 00:00'
  }
]

export const aiProviderOptions = [
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'custom', label: '自定义' }
]

export const aiModelOptions = {
  deepseek: ['deepseek-v4-flash', 'deepseek-chat', 'deepseek-reasoner'],
  openai: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini'],
  openrouter: ['openai/gpt-4.1-mini', 'deepseek/deepseek-chat-v3-0324'],
  custom: []
}

export const aiStrategyOptions = [
  { value: 'general', label: '通用' },
  { value: 'formal', label: '正式' },
  { value: 'product', label: '产品文案' },
  { value: 'technical', label: '技术文档' }
]

export function createAiTranslationService (data = {}) {
  const provider = data.provider || 'deepseek'
  const firstModel = aiModelOptions[provider]?.[0] || ''
  return normalizeAiTranslationService({
    id: `ai-service-${Date.now()}`,
    name: '',
    provider,
    apiKey: '',
    model: firstModel,
    customModelEnabled: false,
    enabledAiContext: false,
    strategy: 'general',
    endpoint: provider === 'openai'
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.deepseek.com/chat/completions',
    systemPrompt: defaultSystemPrompt,
    multiplePrompt: defaultMultiplePrompt,
    singlePrompt: defaultSinglePrompt,
    maxRequestsPerSecond: 10,
    maxTextLength: 1200,
    maxParagraphsPerRequest: 4,
    richTextEnabled: false,
    maxSubtitleParagraphs: 5,
    temperature: 0,
    status: 'enabled',
    updatedAt: formatNow(),
    ...data
  })
}

export function normalizeAiTranslationService (service = {}) {
  return {
    id: service.id || `ai-service-${Date.now()}`,
    name: service.name || '',
    provider: service.provider || 'custom',
    apiKey: service.apiKey || '',
    model: service.model || '',
    customModelEnabled: Boolean(service.customModelEnabled),
    enabledAiContext: Boolean(service.enabledAiContext),
    strategy: service.strategy || 'general',
    endpoint: service.endpoint || '',
    systemPrompt: service.systemPrompt || defaultSystemPrompt,
    multiplePrompt: service.multiplePrompt || defaultMultiplePrompt,
    singlePrompt: service.singlePrompt || defaultSinglePrompt,
    maxRequestsPerSecond: Number(service.maxRequestsPerSecond) || 10,
    maxTextLength: Number(service.maxTextLength) || 1200,
    maxParagraphsPerRequest: Number(service.maxParagraphsPerRequest) || 4,
    richTextEnabled: Boolean(service.richTextEnabled),
    maxSubtitleParagraphs: Number(service.maxSubtitleParagraphs) || 5,
    temperature: Number(service.temperature) || 0,
    status: service.status || 'enabled',
    updatedAt: service.updatedAt || formatNow()
  }
}

export function readAiTranslationServices () {
  try {
    const raw = localStorage.getItem(AI_TRANSLATION_SERVICES_STORAGE_KEY)
    const services = raw ? JSON.parse(raw) : defaultAiTranslationServices
    return normalizeAiTranslationServices(services)
  } catch {
    return normalizeAiTranslationServices(defaultAiTranslationServices)
  }
}

export function writeAiTranslationServices (services) {
  const normalizedServices = normalizeAiTranslationServices(services)
  localStorage.setItem(AI_TRANSLATION_SERVICES_STORAGE_KEY, JSON.stringify(normalizedServices))
  return normalizedServices
}

export function upsertAiTranslationService (service) {
  const services = readAiTranslationServices()
  const payload = normalizeAiTranslationService({
    ...service,
    updatedAt: formatNow()
  })
  const exists = services.some((item) => item.id === payload.id)
  return writeAiTranslationServices(exists
    ? services.map((item) => item.id === payload.id ? payload : item)
    : [payload, ...services])
}

export function removeAiTranslationService (id) {
  return writeAiTranslationServices(readAiTranslationServices().filter((item) => item.id !== id))
}

export function getAiTranslationServiceLabel (service) {
  if (!service) return '-'
  const provider = aiProviderOptions.find((item) => item.value === service.provider)?.label || service.provider
  return `${service.name || '未命名服务'} / ${provider}`
}

function normalizeAiTranslationServices (services) {
  const list = Array.isArray(services) && services.length ? services : defaultAiTranslationServices
  return list.map(normalizeAiTranslationService).filter((item) => item.name || item.endpoint)
}

function formatNow () {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
