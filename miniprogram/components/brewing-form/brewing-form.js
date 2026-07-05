Component({
  properties: {
    method: { type: String, value: '' },
    params: { type: Object, value: {} },
    readonly: { type: Boolean, value: false }
  },
  methods: {
    handleInput(e) {
      if (this.properties.readonly) return
      const key = e.currentTarget.dataset.key
      const value = e.detail.value
      const params = { ...this.properties.params, [key]: value }
      this.triggerEvent('change', { params })
    }
  }
})
