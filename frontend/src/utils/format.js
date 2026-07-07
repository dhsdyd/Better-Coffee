export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatRelative(date) {
  if (!date) return ''
  const now = new Date()
  const target = new Date(date)
  if (isNaN(target.getTime())) return ''
  const diff = now - target
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < day * 30) return `${Math.floor(diff / day)}天前`
  return formatDate(target)
}

export function maskApiKey(key) {
  if (!key || key.length < 8) return key
  return `${key.slice(0, 4)}****${key.slice(-4)}`
}

export function methodLabel(method) {
  const labels = { pour_over: '手冲', espresso: '意式' }
  return labels[method] || method
}

export function formatBrewingParams(params, method) {
  if (!params) return ''
  const parts = []
  if (method === 'pour_over') {
    if (params.beanWeight) parts.push(`粉量${params.beanWeight}g`)
    if (params.waterWeight) parts.push(`水量${params.waterWeight}g`)
    if (params.ratio) parts.push(`比例1:${params.ratio}`)
    if (params.grindSize) parts.push(`研磨度${params.grindSize}`)
    if (params.waterTemp) parts.push(`水温${params.waterTemp}℃`)
    if (params.totalTime) parts.push(`时间${params.totalTime}`)
    return parts.join(' · ')
  } else if (method === 'espresso') {
    if (params.beanWeight) parts.push(`粉量${params.beanWeight}g`)
    if (params.yieldWeight) parts.push(`液重${params.yieldWeight}g`)
    if (params.ratio) parts.push(`比例1:${params.ratio}`)
    if (params.grindSize) parts.push(`研磨度${params.grindSize}`)
    if (params.waterTemp) parts.push(`水温${params.waterTemp}℃`)
    if (params.totalTime) parts.push(`时间${params.totalTime}`)
    return parts.join(' · ')
  }
  return ''
}
