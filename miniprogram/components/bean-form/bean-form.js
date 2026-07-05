const { ROAST_LEVELS, ORIGINS, VARIETIES, PROCESSES } = require('../../constants/options.js')

Component({
  properties: {
    visible: { type: Boolean, value: false },
    bean: { type: Object, value: null }
  },
  data: {
    form: {},
    isEdit: false,
    saving: false,
    roastLabels: ROAST_LEVELS.map(r => r.label),
    originLabels: ORIGINS.map(o => o.label),
    varietyLabels: VARIETIES.map(v => v.label),
    processLabels: PROCESSES.map(p => p.label),
    roastIndex: 0,
    originIndex: 0,
    varietyIndex: 0,
    processIndex: 0
  },
  observers: {
    'visible': function(visible) {
      if (visible) {
        this.initForm()
      }
    }
  },
  methods: {
    initForm() {
      const bean = this.properties.bean
      if (bean && bean._id) {
        const roastIndex = ROAST_LEVELS.findIndex(r => r.value === bean.roastLevel)
        const originIndex = Math.max(0, ORIGINS.findIndex(o => o.value === bean.origin))
        const varietyIndex = Math.max(0, VARIETIES.findIndex(v => v.value === bean.variety))
        const processIndex = Math.max(0, PROCESSES.findIndex(p => p.value === bean.process))
        this.setData({
          form: { ...bean },
          isEdit: true,
          roastIndex: roastIndex >= 0 ? roastIndex : 0,
          originIndex,
          varietyIndex,
          processIndex
        })
      } else {
        this.setData({
          form: { weight: '', name: '', roastDate: '', notes: '' },
          isEdit: false,
          roastIndex: 0,
          originIndex: 0,
          varietyIndex: 0,
          processIndex: 0
        })
      }
    },
    handleInput(e) {
      const key = e.currentTarget.dataset.key
      this.setData({ [`form.${key}`]: e.detail.value })
    },
    handlePicker(e) {
      const key = e.currentTarget.dataset.key
      const idx = e.detail.value
      let value
      if (key === 'roastLevel') value = ROAST_LEVELS[idx].value
      if (key === 'origin') value = ORIGINS[idx].value
      if (key === 'variety') value = VARIETIES[idx].value
      if (key === 'process') value = PROCESSES[idx].value
      const update = { [`form.${key}`]: value, [`${key.replace('roastLevel','roast').replace('origin','origin').replace('variety','variety').replace('process','process')}Index`]: idx }
      this.setData(update)
    },
    handleDateChange(e) {
      this.setData({ 'form.roastDate': e.detail.value })
    },
    handleClose() {
      this.triggerEvent('close')
    },
    handleMaskTap() {
      this.triggerEvent('close')
    },
    stopPropagation() {},
    handleSave() {
      const form = this.data.form
      if (!form.name || !form.name.trim()) {
        wx.showToast({ title: '请输入名称', icon: 'none' })
        return
      }
      if (!form.roastDate) {
        wx.showToast({ title: '请选择烘焙日期', icon: 'none' })
        return
      }
      if (!form.roastLevel) {
        wx.showToast({ title: '请选择烘焙度', icon: 'none' })
        return
      }
      const weight = parseFloat(form.weight)
      if (!weight || weight <= 0) {
        wx.showToast({ title: '请输入有效重量', icon: 'none' })
        return
      }
      const beanData = {
        name: form.name.trim(),
        origin: form.origin || ORIGINS[this.data.originIndex].value,
        variety: form.variety || '',
        process: form.process || '',
        roastLevel: form.roastLevel,
        roastDate: form.roastDate,
        weight: weight,
        notes: form.notes || ''
      }
      if (this.data.isEdit) {
        beanData._id = form._id
        if (form.remainingWeight !== undefined) {
          beanData.remainingWeight = form.remainingWeight
        }
        if (form.finished !== undefined) {
          beanData.finished = form.finished
        }
      } else {
        beanData.remainingWeight = weight
        beanData.finished = false
      }
      this.setData({ saving: true })
      this.triggerEvent('save', { bean: beanData })
      this.setData({ saving: false })
    }
  }
})
