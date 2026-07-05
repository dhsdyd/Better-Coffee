const { PROVIDERS, DEFAULT_PROVIDER } = require('./config')
const { buildBrewingPrompt } = require('./prompts/brewing')
const { buildBeanPrompt } = require('./prompts/bean')

let cloud = null
try {
  cloud = require('wx-server-sdk')
  cloud.init && cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
} catch (e) {
  // 在测试环境或非云函数环境下，cloud 为 null
}

/**
 * 从 user_settings 集合读取用户配置
 */
async function getUserSettings(cloudInstance) {
  if (!cloudInstance) return null
  const db = cloudInstance.database()
  const res = await db.collection('user_settings').limit(1).get()
  return res.data && res.data[0]
}

/**
 * 调用 AI provider
 */
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

/**
 * 容错解析 AI 响应（支持纯JSON、带代码块、带前后文字）
 */
function parseAiResponse(content) {
  if (!content) return null
  let text = content.trim()

  try {
    return JSON.parse(text)
  } catch (e) {}

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim())
    } catch (e) {}
  }

  const objMatch = text.match(/\{[\s\S]*\}/)
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0])
    } catch (e) {}
  }

  return null
}

exports.main = async (event, context) => {
  const { scene, payload } = event

  try {
    if (scene === 'ping') {
      return { success: true, message: 'pong', timestamp: Date.now() }
    }

    if (scene === 'brewing_recommend' || scene === 'bean_recommend') {
      const settings = await getUserSettings(cloud)
      if (!settings || !settings.apiKey) {
        return { success: false, error: '请先在设置页配置 AI API Key' }
      }

      let promptData
      if (scene === 'brewing_recommend') {
        promptData = buildBrewingPrompt(payload || {})
      } else {
        promptData = buildBeanPrompt(payload || {})
      }

      const result = await callProvider(settings.provider || DEFAULT_PROVIDER, {
        apiKey: settings.apiKey,
        model: settings.model,
        messages: promptData.messages
      })

      const parsed = parseAiResponse(result.content)
      if (!parsed) {
        return { success: false, error: 'AI 返回格式无法解析', rawContent: result.content }
      }

      return { success: true, data: parsed }
    }

    return { success: false, error: `Unknown scene: ${scene}` }
  } catch (e) {
    return { success: false, error: e.message || String(e) }
  }
}

exports.parseAiResponse = parseAiResponse
exports.callProvider = callProvider
exports.getUserSettings = getUserSettings
