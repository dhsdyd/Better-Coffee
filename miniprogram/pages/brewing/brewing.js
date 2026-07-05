const db = require('../../utils/db.js')
const ai = require('../../utils/ai.js')
const { BREW_METHODS, TASTE_TAGS, IMPROVEMENT_DIRS } = require('../../constants/options.js')
const { methodLabel } = require('../../utils/format.js')
const app = getApp()

Page({
  data: {
    beans: [],
    beanLabels: [],
    beanIndex: 0,
    methods: BREW_METHODS,
    methodLabels: BREW_METHODS.map(m => m.label),
    methodIndex: 0,
    method: 'pour_over',
    params: {},
    rating: 0,
    tasteTags: TASTE_TAGS,
    selectedTags: [],
    improvementDirs: [{ value: '', label: '不指定' }, ...IMPROVEMENT_DIRS],
    improvementLabels: [{ value: '', label: '不指定' }, ...IMPROVEMENT_DIRS].map(i => i.label),
    improvementIndex: 0,
    notes: '',
    saving: false,
    aiLoading: false,
    aiRecommendation: null
  },
  onShow() {
    this.loadBeans()
    const prefill = app.globalData.pendingBrewPrefill
    if (prefill) {
      app.globalData.pendingBrewPrefill = null
      this.applyPrefill(prefill)
    }
  },
  async loadBeans() {
    try {
      const beans = await db.getList(db.COLLECTIONS.BEANS, { finished: false })
      const beanLabels = beans.map(b => `${b.name} (${b.remainingWeight || 0}g)`)
      this.setData({ beans, beanLabels })
    } catch (e) {
      console.error('loadBeans', e)
    }
  },
  applyPrefill(prefill) {
    const beanIndex = Math.max(0, this.data.beans.findIndex(b => b._id === prefill.beanId))
    const methodIndex = BREW_METHODS.findIndex(m => m.value === prefill.method)
    this.setData({
      beanIndex,
      methodIndex: methodIndex >= 0 ? methodIndex : 0,
      method: prefill.method,
      params: { ...prefill.params } || {},
      rating: prefill.rating || 0,
      selectedTags: prefill.tasteTags || [],
      notes: prefill.notes || ''
    })
  },
  handleBeanChange(e) {
    this.setData({ beanIndex: e.detail.value })
  },
  handleMethodChange(e) {
    const idx = e.detail.value
    this.setData({
      methodIndex: idx,
      method: BREW_METHODS[idx].value,
      params: {}
    })
  },
  handleParamsChange(e) {
    this.setData({ params: e.detail.params })
  },
  handleRatingChange(e) {
    this.setData({ rating: e.detail.value })
  },
  handleTagTap(e) {
    const value = e.currentTarget.dataset.value
    const selectedTags = [...this.data.selectedTags]
    const idx = selectedTags.indexOf(value)
    if (idx >= 0) {
      selectedTags.splice(idx, 1)
    } else {
      selectedTags.push(value)
    }
    this.setData({ selectedTags })
  },
  handleImprovementChange(e) {
    this.setData({ improvementIndex: e.detail.value })
  },
  handleNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },
  async handleAiRecommend() {
    const bean = this.data.beans[this.data.beanIndex]
    if (!bean) {
      wx.showToast({ title: '请先选择豆子', icon: 'none' })
      return
    }
    this.setData({ aiLoading: true, aiRecommendation: null })
    try {
      const lastBrewing = {
        method: this.data.method,
        params: this.data.params,
        rating: this.data.rating,
        tasteTags: this.data.selectedTags,
        notes: this.data.notes
      }
      const improvementDir = this.data.improvementDirs[this.data.improvementIndex]
      const result = await ai.recommendBrewing({
        bean,
        lastBrewing,
        taste: this.data.notes,
        improvementDir: improvementDir ? improvementDir.value : ''
      })
      if (result && result.success) {
        this.setData({ aiRecommendation: result.data })
      } else {
        wx.showToast({ title: (result && result.error) || '推荐失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      this.setData({ aiLoading: false })
    }
  },
  applyAiParams() {
    const rec = this.data.aiRecommendation
    if (!rec || !rec.suggestedParams) return
    this.setData({
      params: { ...this.data.params, ...rec.suggestedParams },
      aiRecommendation: null
    })
    wx.showToast({ title: '已应用', icon: 'success' })
  },
  async handleSave() {
    const bean = this.data.beans[this.data.beanIndex]
    if (!bean) {
      wx.showToast({ title: '请选择豆子', icon: 'none' })
      return
    }
    if (!this.data.method) {
      wx.showToast({ title: '请选择方式', icon: 'none' })
      return
    }
    this.setData({ saving: true })
    try {
      const beanWeight = parseFloat(this.data.params.beanWeight) || 0
      const improvementDir = this.data.improvementDirs[this.data.improvementIndex]
      const brewingData = {
        beanId: bean._id,
        beanName: bean.name,
        method: this.data.method,
        params: this.data.params,
        rating: this.data.rating,
        tasteTags: this.data.selectedTags,
        notes: this.data.notes,
        improvementDir: improvementDir ? improvementDir.value : '',
        isFavorite: false
      }
      await db.add(db.COLLECTIONS.BREWINGS, brewingData)
      if (beanWeight > 0) {
        const newRemaining = Math.max(0, (bean.remainingWeight || 0) - beanWeight)
        await db.update(db.COLLECTIONS.BEANS, bean._id, {
          remainingWeight: newRemaining,
          finished: newRemaining === 0
        })
      }
      wx.showToast({ title: '已保存', icon: 'success' })
      this.resetForm()
      this.loadBeans()
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  },
  resetForm() {
    this.setData({
      params: {},
      rating: 0,
      selectedTags: [],
      notes: '',
      aiRecommendation: null,
      improvementIndex: 0
    })
  }
})
