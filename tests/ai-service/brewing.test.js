const { buildBrewingPrompt } = require('../../cloudfunctions/ai-service/prompts/brewing')

describe('brewing prompt', () => {
  const payload = {
    bean: { name: '耶加雪菲', roastLevel: 'light', roastDate: '2026-06-01' },
    lastBrewing: { method: 'pour_over', params: { beanWeight: 15, waterWeight: 240, waterTemp: 92 } },
    taste: '酸度不够，希望更甜',
    improvementDir: 'sweeter'
  }

  test('should return messages array with system and user', () => {
    const result = buildBrewingPrompt(payload)
    expect(result).toHaveProperty('messages')
    expect(Array.isArray(result.messages)).toBe(true)
    expect(result.messages.length).toBe(2)
    expect(result.messages[0].role).toBe('system')
    expect(result.messages[1].role).toBe('user')
  })

  test('system prompt should require JSON format', () => {
    const result = buildBrewingPrompt(payload)
    const systemContent = result.messages[0].content
    expect(systemContent).toContain('JSON')
    expect(systemContent).toMatch(/suggestedParams/)
    expect(systemContent).toMatch(/changes/)
    expect(systemContent).toMatch(/summary/)
  })

  test('user prompt should contain bean info', () => {
    const result = buildBrewingPrompt(payload)
    const userContent = result.messages[1].content
    expect(userContent).toContain('耶加雪菲')
    expect(userContent).toContain('light')
  })

  test('user prompt should contain last brewing params', () => {
    const result = buildBrewingPrompt(payload)
    const userContent = result.messages[1].content
    expect(userContent).toContain('beanWeight')
    expect(userContent).toContain('240')
    expect(userContent).toContain('pour_over')
  })

  test('user prompt should contain improvement direction', () => {
    const result = buildBrewingPrompt(payload)
    const userContent = result.messages[1].content
    expect(userContent).toContain('sweeter')
  })
})
