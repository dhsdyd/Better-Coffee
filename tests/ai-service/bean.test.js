const { buildBeanPrompt } = require('../../cloudfunctions/ai-service/prompts/bean')

describe('bean prompt', () => {
  const payload = {
    beans: [
      { name: '耶加雪菲', roastLevel: 'light', roastDate: '2026-06-01' },
      { name: '哥伦比亚', roastLevel: 'medium', roastDate: '2026-06-15' }
    ]
  }

  test('should return messages array', () => {
    const result = buildBeanPrompt(payload)
    expect(result).toHaveProperty('messages')
    expect(Array.isArray(result.messages)).toBe(true)
    expect(result.messages.length).toBe(2)
  })

  test('system prompt should mention 养豆 (resting)', () => {
    const result = buildBeanPrompt(payload)
    const sys = result.messages[0].content
    expect(sys).toMatch(/养豆/)
  })

  test('system prompt should specify roast windows', () => {
    const result = buildBeanPrompt(payload)
    const sys = result.messages[0].content
    expect(sys).toMatch(/浅烘/)
    expect(sys).toMatch(/中烘/)
    expect(sys).toMatch(/深烘/)
  })

  test('user prompt should contain all beans', () => {
    const result = buildBeanPrompt(payload)
    const user = result.messages[1].content
    expect(user).toContain('耶加雪菲')
    expect(user).toContain('哥伦比亚')
  })
})
