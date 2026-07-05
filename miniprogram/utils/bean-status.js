const ROAST_WINDOWS = {
  light: [7, 14],
  medium: [5, 10],
  dark: [3, 7]
}

const ROAST_LABELS = {
  light: '浅烘',
  medium: '中烘',
  dark: '深烘'
}

function calcDaysSinceRoast(roastDate) {
  if (!roastDate) return null
  const now = new Date()
  const roast = new Date(roastDate)
  const diff = now - roast
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

function getBeanStatus(roastDate, roastLevel) {
  const days = calcDaysSinceRoast(roastDate)
  if (days === null || days < 0) {
    return { status: 'unknown', label: '未知', days: null, window: null }
  }
  const window = ROAST_WINDOWS[roastLevel]
  if (!window) {
    return { status: 'unknown', label: '未知', days, window: null }
  }
  if (days < window[0]) {
    return { status: 'resting', label: '养豆中', days, window }
  }
  if (days <= window[1]) {
    return { status: 'peak', label: '最佳风味期', days, window }
  }
  return { status: 'late', label: '建议尽快饮用', days, window }
}

module.exports = {
  ROAST_WINDOWS,
  ROAST_LABELS,
  calcDaysSinceRoast,
  getBeanStatus
}
