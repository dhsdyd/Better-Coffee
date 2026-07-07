const express = require('express')
const router = express.Router()
const Bean = require('../models/Bean')
const Brewing = require('../models/Brewing')

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.includeDeleted === 'true' ? {} : { deleted: { $ne: true } }
    const list = await Bean.find(filter).sort({ createdAt: -1 })
    res.json(list)
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const bean = await Bean.findById(req.params.id)
    if (!bean) return res.status(404).json({ error: 'Not found' })
    res.json(bean)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (data.remainingWeight === undefined && data.weight !== undefined) {
      data.remainingWeight = data.weight
    }
    const bean = await Bean.create(data)
    res.json(bean)
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const bean = await Bean.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!bean) return res.status(404).json({ error: 'Not found' })
    res.json(bean)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const brewingCount = await Brewing.countDocuments({ beanId: req.params.id })
    if (brewingCount > 0) {
      const bean = await Bean.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true })
      res.json({ softDeleted: true, bean })
    } else {
      await Bean.findByIdAndDelete(req.params.id)
      res.json({ deleted: true })
    }
  } catch (e) { next(e) }
})

module.exports = router
