const { PROVIDERS, DEFAULT_PROVIDER } = require('./config')
const { buildBrewingPrompt } = require('./prompts/brewing')
const { buildBeanPrompt } = require('./prompts/bean')
const { getBrewingDemoResponse, getBeanDemoResponse } = require('./demo-data')

function parseAiResponse(content) {
  if (!content) return null
  let text = content.trim()
  try { return JSON.parse(text) } catch (e) {}
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeMatch) { try { return JSON.parse(codeMatch[1].trim()) } catch (e) {} }
  const objMatch = text.match(/\{[\s\S]*\}/)
  if (objMatch) { try { return JSON.parse(objMatch[0]) } catch (e) {} }
  return null
}

async function callProvider(providerName, opts) {
  const providerCfg = PROVIDERS[providerName]
  if (!providerCfg) throw new Error(`Unknown provider: ${providerName}`)
  const provider = require(`./providers/${providerName}`)
  return provider.call({
    baseURL: providerCfg.baseURL,
    path: providerCfg.path,
    apiKey: opts.apiKey,
    model: opts.model || providerCfg.defaultModel,
    messages: opts.messages
  })
}

async function recommendBrewing(settings, payload) {
  if (!settings || !settings.apiKey) {
    return { success: true, data: getBrewingDemoResponse(payload), demo: true }
  }
  const promptData = buildBrewingPrompt(payload || {})
  const result = await callProvider(settings.provider || DEFAULT_PROVIDER, {
    apiKey: settings.apiKey,
    model: settings.model,
    messages: promptData.messages
  })
  const parsed = parseAiResponse(result.content)
  if (!parsed) return { success: false, error: 'AI 返回格式无法解析', rawContent: result.content }
  return { success: true, data: parsed, demo: false }
}

async function recommendBean(settings, payload) {
  if (!settings || !settings.apiKey) {
    return { success: true, data: getBeanDemoResponse(payload), demo: true }
  }
  const promptData = buildBeanPrompt(payload || {})
  const result = await callProvider(settings.provider || DEFAULT_PROVIDER, {
    apiKey: settings.apiKey,
    model: settings.model,
    messages: promptData.messages
  })
  const parsed = parseAiResponse(result.content)
  if (!parsed) return { success: false, error: 'AI 返回格式无法解析', rawContent: result.content }
  return { success: true, data: parsed, demo: false }
}

module.exports = { parseAiResponse, callProvider, recommendBrewing, recommendBean }
