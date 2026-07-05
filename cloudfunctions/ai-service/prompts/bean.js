function buildBeanPrompt(payload) {
  const { beans } = payload
  const system = `你是一位精通咖啡养豆的专家。请根据每款豆子的烘焙日期、烘焙度，判断当前养豆状态，并推荐今日最适合饮用的豆子。

养豆期参考：
- 浅烘：7-14天
- 中烘：5-10天
- 深烘：3-7天

请严格返回 JSON 格式，不要包含任何 markdown 代码块标记或额外文字：
{
  "recommendedIndex": 推荐豆子在数组中的索引,
  "recommendedBeanName": 推荐豆子名称,
  "reason": "推荐理由，包含养豆状态分析",
  "daysSinceRoast": 距烘焙日的天数,
  "isInWindow": 是否在最佳风味期,
  "allBeansStatus": [{ "name": 名称, "status": 状态, "days": 天数 }]
}`

  const user = `当前豆子列表：
${JSON.stringify(beans, null, 2)}

请分析每款豆子的养豆状态，并推荐今日最适合饮用的豆子。`

  return {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  }
}

module.exports = { buildBeanPrompt }
