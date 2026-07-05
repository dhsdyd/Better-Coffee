const db = require('../../utils/db.js')
const ai = require('../../utils/ai.js')
const { AI_PROVIDERS } = require('../../constants/options.js')
const { maskApiKey } = require('../../utils/format.js')

Page({
  data: {
    providers: AI_PROVIDERS,
    providerLabels: AI_PROVIDERS.map(p => p.label),
    providerIndex: 0,
    form: {
      provider: AI_PROVIDERS[0].value,
      model: AI_PROVIDERS[0].defaultModel,
      apiKey: ''
    },
    showKey: false,
    saving: false,
    testing: false,
    testResult: null,
    savedMaskedKey: '',
    settingsId: null
  },
  onLoad() {
    this.loadSettings()
  },
  async loadSettings() {
    try {
      const settings = await db.getOne(db.COLLECTIONS.USER_SETTINGS)
      if (settings) {
        const providerIndex = AI_PROVIDERS.findIndex(p => p.value === settings.provider)
        this.setData({
          settingsId: settings._id,
          form: {
            provider: settings.provider,
            model: settings.model,
            apiKey: ''
          },
          providerIndex: providerIndex >= 0 ? providerIndex : 0,
          savedMaskedKey: maskApiKey(settings.apiKey)
        })
      }
    } catch (e) {
      console.error('loadSettings', e)
    }
  },
  handleProviderChange(e) {
    const idx = e.detail.value
    const provider = AI_PROVIDERS[idx]
    this.setData({
      providerIndex: idx,
      'form.provider': provider.value,
      'form.model': provider.defaultModel
    })
  },
  handleModelInput(e) {
    this.setData({ 'form.model': e.detail.value })
  },
  handleKeyInput(e) {
    this.setData({ 'form.apiKey': e.detail.value })
  },
  toggleShowKey() {
    this.setData({ showKey: !this.data.showKey })
  },
  async handleTest() {
    if (!this.data.form.apiKey) {
      wx.showToast({ title: '请输入 API Key', icon: 'none' })
      return
    }
    this.setData({ testing: true, testResult: null })
    try {
      const result = await ai.ping()
      if (result && result.success) {
        this.setData({ testResult: { success: true, message: '连接成功：' + (result.message || 'OK') } })
      } else {
        this.setData({ testResult: { success: false, message: '连接失败：' + ((result && result.error) || '未知错误') } })
      }
    } catch (e) {
      this.setData({ testResult: { success: false, message: '连接失败：网络错误' } })
    } finally {
      this.setData({ testing: false })
    }
  },
  async handleSave() {
    if (!this.data.form.apiKey) {
      wx.showToast({ title: '请输入 API Key', icon: 'none' })
      return
    }
    this.setData({ saving: true })
    try {
      const data = {
        provider: this.data.form.provider,
        model: this.data.form.model,
        apiKey: this.data.form.apiKey
      }
      if (this.data.settingsId) {
        await db.update(db.COLLECTIONS.USER_SETTINGS, this.data.settingsId, data)
      } else {
        const id = await db.add(db.COLLECTIONS.USER_SETTINGS, data)
        this.setData({ settingsId: id })
      }
      this.setData({
        savedMaskedKey: maskApiKey(this.data.form.apiKey),
        'form.apiKey': ''
      })
      wx.showToast({ title: '已保存', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  }
})
