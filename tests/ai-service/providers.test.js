const deepseek = require('../../cloudfunctions/ai-service/providers/deepseek')
const qwen = require('../../cloudfunctions/ai-service/providers/qwen')
const openai = require('../../cloudfunctions/ai-service/providers/openai')
const { parseAiResponse } = require('../../cloudfunctions/ai-service/index')

describe('providers', () => {
  test('deepseek should export call function', () => {
    expect(typeof deepseek.call).toBe('function')
  })

  test('qwen should export call function', () => {
    expect(typeof qwen.call).toBe('function')
  })

  test('openai should export call function', () => {
    expect(typeof openai.call).toBe('function')
  })
})

describe('parseAiResponse', () => {
  test('should parse pure JSON string', () => {
    const content = '{"recommendedIndex": 0, "recommendedBeanName": "耶加雪菲"}'
    const result = parseAiResponse(content)
    expect(result).toEqual({ recommendedIndex: 0, recommendedBeanName: '耶加雪菲' })
  })

  test('should parse JSON from code block', () => {
    const content = 'Some text\n```json\n{"suggestedParams": {"beanWeight": 18}}\n```\nMore text'
    const result = parseAiResponse(content)
    expect(result).toEqual({ suggestedParams: { beanWeight: 18 } })
  })

  test('should parse JSON from text with surrounding text', () => {
    const content = '好的，我推荐如下：\n{"recommendedIndex": 1, "reason": "已养豆7天"}\n希望有帮助！'
    const result = parseAiResponse(content)
    expect(result).toEqual({ recommendedIndex: 1, reason: '已养豆7天' })
  })
})
