function buildBrewingPrompt(payload) {
  const { bean, lastBrewing, taste, improvementDir } = payload || {}
  const system = `你是一位精通手冲和意式咖啡的冲煮专家。根据用户反馈给出下一次冲煮参数建议。
严格返回纯 JSON，不要 markdown 代码块或额外文字：
{ "suggestedParams": {}, "changes": "调整说明", "summary": "综合说明" }`
  const user = `咖啡豆：${JSON.stringify(bean, null, 2)}
上次冲煮：${JSON.stringify(lastBrewing, null, 2)}
口感反馈：${taste || '无'}
改进方向：${improvementDir || '不指定'}`
  return { messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }
}
module.exports = { buildBrewingPrompt }
