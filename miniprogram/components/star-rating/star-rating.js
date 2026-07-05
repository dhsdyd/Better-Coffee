Component({
  properties: {
    value: { type: Number, value: 0 },
    readonly: { type: Boolean, value: false },
    size: { type: Number, value: 48 }
  },
  methods: {
    handleTap(e) {
      if (this.data.readonly) return
      const value = e.currentTarget.dataset.value
      this.triggerEvent('change', { value })
    }
  }
})
