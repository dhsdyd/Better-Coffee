function callAi(scene, payload = {}) {
  return wx.cloud.callFunction({
    name: 'ai-service',
    data: {
      scene,
      payload
    }
  }).then(res => res.result)
}

function ping() {
  return callAi('ping')
}

function recommendBrewing(payload) {
  return callAi('brewing_recommend', payload)
}

function recommendBean(payload) {
  return callAi('bean_recommend', payload)
}

module.exports = {
  callAi,
  ping,
  recommendBrewing,
  recommendBean
}
