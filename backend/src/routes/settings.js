const express = require('express')
const router = express.Router()
const UserSettings = require('../models/UserSettings')

function maskApiKey(key) {
  if (!key || key.length < 8) return key
  return `${key.slice(0, 4)}****${key.slice(-4)}`
}

router.get('/', async (req, res, next) => {
  try {
    let s = await UserSettings.findOne().sort({ createdAt: 1 })
    if (!s) {
      s = await UserSettings.create({ provider: 'deepseek', model: 'deepseek-chat', apiKey: '' })
    }
    res.json({
      _id: s._id,
      provider: s.provider,
      model: s.model,
      apiKey: s.apiKey ? maskApiKey(s.apiKey) : '',
      hasApiKey: !!s.apiKey
    })
  } catch (e) { next(e) }
})

router.put('/', async (req, res, next) => {
  try {
    const { provider, model, apiKey } = req.body
    const update = { provider, model }
    if (apiKey && !apiKey.includes('****')) update.apiKey = apiKey
    let s = await UserSettings.findOne().sort({ createdAt: 1 })
    if (s) {
      Object.assign(s, update)
      await s.save()
    } else {
      s = await UserSettings.create({ provider, model, apiKey: apiKey || '', ...update })
    }
    res.json({
      _id: s._id,
      provider: s.provider,
      model: s.model,
      apiKey: maskApiKey(s.apiKey),
      hasApiKey: !!s.apiKey
    })
  } catch (e) { next(e) }
})

module.exports = router
