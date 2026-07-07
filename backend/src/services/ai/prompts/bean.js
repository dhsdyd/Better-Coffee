function buildBeanPrompt(payload) {
  const { beans } = payload || {}
  const system = `你是咖啡养豆专家。根据烘焙日期和烘焙度判断养豆状态并推荐今日豆子。
养豆期参考：浅烘 7-14 天，中烘 5-10 天，深烘 3-7 天。
严格返回纯 JSON：
{ "recommendedIndex": 0, "recommendedBeanName": "", "reason": "", "daysSinceRoast": 0, "isInWindow": true, "allBeansStatus": [{ "name": "", "status": "", "days": 0 }] }`
  const user = `豆子列表：${JSON.stringify(beans, null, 2)}`
  return { messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }
}
module.exports = { buildBeanPrompt }
