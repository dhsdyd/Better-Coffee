const TIMEOUT = 15000

const PROVIDERS = {
  deepseek: { baseURL: 'https://api.deepseek.com', defaultModel: 'deepseek-chat', path: '/v1/chat/completions' },
  qwen: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode', defaultModel: 'qwen-turbo', path: '/v1/chat/completions' },
  openai: { baseURL: 'https://api.openai.com', defaultModel: 'gpt-4o-mini', path: '/v1/chat/completions' }
}

const DEFAULT_PROVIDER = 'deepseek'

module.exports = { TIMEOUT, PROVIDERS, DEFAULT_PROVIDER }
