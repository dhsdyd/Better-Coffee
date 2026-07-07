function getBrewingDemoResponse(payload) {
  const method = payload?.lastBrewing?.method || 'pour_over'
  const isEspresso = method === 'espresso'
  const suggestedParams = isEspresso
    ? { beanWeight: 18, yieldWeight: 36, ratio: 2, grindSize: '中细', waterTemp: 93, totalTime: 28, machine: '辣妈 Mini' }
    : { beanWeight: 15, waterWeight: 240, ratio: 16, grindSize: '中细', waterTemp: 92, totalTime: 150, brewer: 'V60' }
  return {
    suggestedParams,
    changes: '建议将水温提升 2℃，研磨度调细一档，延长萃取 10 秒，以增强甜感和醇厚度。同时适当增加粉量以提升萃取率。',
    summary: '根据您反馈的口感偏酸、希望更甜的方向，本次推荐提升水温和延长萃取时间，让中后段的甜感物质更充分溶出。同时调整粉水比以平衡整体口感。'
  }
}

function getBeanDemoResponse(payload) {
  const beans = payload?.beans || []
  const recommendedIndex = 0
  const recommendedBeanName = beans[0]?.name || '埃塞俄比亚 耶加雪菲'
  const daysSinceRoast = beans[0]?.roastDate
    ? Math.floor((Date.now() - new Date(beans[0].roastDate).getTime()) / (24 * 60 * 60 * 1000))
    : 12
  return {
    recommendedIndex,
    recommendedBeanName,
    reason: '该豆子距今烘焙日 ' + daysSinceRoast + ' 天，正处于浅烘咖啡的最佳风味期（7-14 天），花果香气最为饱满，建议今日饮用。其他豆子要么养豆未完成，要么已过最佳风味期。',
    daysSinceRoast,
    isInWindow: true,
    allBeansStatus: beans.map((b, i) => ({
      name: b.name,
      status: i === 0 ? 'peak' : 'resting',
      days: b.roastDate ? Math.floor((Date.now() - new Date(b.roastDate).getTime()) / (24 * 60 * 60 * 1000)) : 0
    }))
  }
}

module.exports = { getBrewingDemoResponse, getBeanDemoResponse }
