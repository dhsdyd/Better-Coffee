function buildBrewingPrompt(payload) {
  const { bean, lastBrewing, taste, improvementDir } = payload
  const system = `你是一位精通手冲和意式咖啡的咖啡冲煮专家，擅长根据用户的反馈调整冲煮参数。请基于用户输入的咖啡豆信息、上一次冲煮参数和口感反馈，给出下一次冲煮的具体参数建议。

请严格返回 JSON 格式，不要包含任何 markdown 代码块标记或额外文字：
{
  "suggestedParams": { 参数对象 },
  "changes": "对调整内容的简短说明",
  "summary": "对本次推荐的综合说明"
}`

  const user = `咖啡豆信息：
${JSON.stringify(bean, null, 2)}

上一次冲煮：
${JSON.stringify(lastBrewing, null, 2)}

口感反馈：${taste || '无'}
期望改进方向：${improvementDir || '不指定'}

请根据以上信息推荐下一次冲煮参数。`

  return {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  }
}

module.exports = { buildBrewingPrompt }
