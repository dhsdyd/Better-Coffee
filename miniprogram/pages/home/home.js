const db = require('../../../utils/db.js')
const { formatRelative, formatBrewingParams, methodLabel } = require('../../../utils/format.js')
const ai = require('../../../utils/ai.js')
const { TASTE_TAGS } = require('../../../constants/options.js')

Page({
  data: {
    beans: [],
    recentBrewings: [],
    recommendation: null,
    loadingRecommend: false
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },
  async loadData() {
    await Promise.all([this.loadBeans(), this.loadRecentBrewings()])
  },
  async loadBeans() {
    try {
      const beans = await getList(db.COLLECTIONS.BEANS, { finished: false })
      this.setData({ beans })
    } catch (e) {
      console.error('loadBeans', e)
    }
  },
  async loadRecentBrewings() {
    try {
      const brewings = await getList(db.COLLECTIONS.BREWINGS, {}, 'createdAt', true)
      const recent = brewings.slice(0, 3).map(b => {
        const tasteTagLabels = (b.tasteTags || []).map(t => {
          const tag = TASTE_TAGS.find(x => x.value === t)
          return tag ? tag.label : t
        })
        return {
          ...b,
          timeText: formatRelative(b.createdAt),
          methodLabel: methodLabel(b.method),
          paramsText: formatBrewingParams(b.params, b.method),
          tasteTags: tasteTagLabels
        }
      })
      this.setData({ recentBrewings: recent })
    } catch (e) {
      console.error('loadRecentBrewings', e)
    }
  },
  async getRecommendation() {
    if (this.data.beans.length === 0) {
      wx.showToast({ title: '请先添加豆子', icon: 'none' })
      return
    }
    this.setData({ loadingRecommend: true, recommendation: null })
    try {
      const result = await ai.recommendBean({ beans: this.data.beans })
      if (result && result.success) {
        this.setData({ recommendation: result.data })
      } else {
        wx.showToast({ title: (result && result.error) || '推荐失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      this.setData({ loadingRecommend: false })
    }
  }
})
