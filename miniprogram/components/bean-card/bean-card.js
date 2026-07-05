const { getBeanStatus, ROAST_LABELS } = require('../../utils/bean-status.js')
const { ORIGINS, VARIETIES, PROCESSES } = require('../../constants/options.js')

Component({
  properties: {
    bean: { type: Object, value: {} }
  },
  data: {
    statusInfo: {},
    originLabel: '',
    varietyLabel: '',
    roastLabel: '',
    processLabel: '',
    percent: 0
  },
  observers: {
    'bean': function(bean) {
      if (!bean || !bean.name) return
      const statusInfo = getBeanStatus(bean.roastDate, bean.roastLevel)
      const origin = ORIGINS.find(o => o.value === bean.origin)
      const variety = VARIETIES.find(v => v.value === bean.variety)
      const process = PROCESSES.find(p => p.value === bean.process)
      const percent = bean.weight > 0 ? Math.max(0, Math.min(100, ((bean.remainingWeight || 0) / bean.weight) * 100)) : 0
      this.setData({
        statusInfo,
        originLabel: origin ? origin.label : bean.origin || '-',
        varietyLabel: variety ? variety.label : bean.variety || '-',
        roastLabel: ROAST_LABELS[bean.roastLevel] || '-',
        processLabel: process ? process.label : bean.process || '-',
        percent
      })
    }
  }
})
