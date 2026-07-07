const express = require('express')
const router = express.Router()
const UserSettings = require('../models/UserSettings')
const ai = require('../services/ai')

router.post('/ping', (req, res) => res.json({ success: true, message: 'pong' }))

router.post('/brewing-recommend', async (req, res, next) => {
  try {
    const settings = await UserSettings.findOne().sort({ createdAt: 1 })
    const result = await ai.recommendBrewing(settings, req.body)
    res.json(result)
  } catch (e) { next(e) }
})

router.post('/bean-recommend', async (req, res, next) => {
  try {
    const settings = await UserSettings.findOne().sort({ createdAt: 1 })
    const result = await ai.recommendBean(settings, req.body)
    res.json(result)
  } catch (e) { next(e) }
})

module.exports = router
