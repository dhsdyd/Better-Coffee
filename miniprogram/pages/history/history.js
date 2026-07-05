const db = require('../../../utils/db.js')
const { formatRelative, formatBrewingParams, methodLabel } = require('../../../utils/format.js')
const { TASTE_TAGS } = require('../../../constants/options.js')
const app = getApp()

Page({
  data: {
    list: [],
    detail: null
  },
  onShow() {
    this.loadList()
  },
  async loadList() {
    try {
      const list = await db.getList(db.COLLECTIONS.BREWINGS)
      const formatted = list.map(b => {
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
      this.setData({ list: formatted })
    } catch (e) {
      console.error('loadList', e)
    }
  },
  handleTap(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.list.find(x => x._id === id)
    if (item) {
      this.setData({ detail: item })
    }
  },
  handleCloseDetail() {
    this.setData({ detail: null })
  },
  stopPropagation() {},
  async handleMarkFavorite() {
    const detail = this.data.detail
    if (!detail) return
    try {
      await db.updateWhere(db.COLLECTIONS.BREWINGS, { beanId: detail.beanId, isFavorite: true }, { isFavorite: false })
      await db.update(db.COLLECTIONS.BREWINGS, detail._id, { isFavorite: true })
      wx.showToast({ title: '已标记最爱', icon: 'success' })
      this.setData({ detail: { ...detail, isFavorite: true } })
      this.loadList()
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },
  handleReuse() {
    const detail = this.data.detail
    if (!detail) return
    app.globalData.pendingBrewPrefill = {
      beanId: detail.beanId,
      method: detail.method,
      params: detail.params,
      rating: detail.rating,
      tasteTags: detail.tasteTags,
      notes: detail.notes
    }
    wx.switchTab({ url: '/pages/brewing/brewing' })
  }
})
