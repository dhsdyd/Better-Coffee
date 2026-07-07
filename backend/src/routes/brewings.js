const express = require('express')
const router = express.Router()
const Brewing = require('../models/Brewing')
const Bean = require('../models/Bean')

router.get('/', async (req, res, next) => {
  try {
    const list = await Brewing.find().sort({ createdAt: -1 }).populate('beanId')
    res.json(list)
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const b = await Brewing.findById(req.params.id).populate('beanId')
    if (!b) return res.status(404).json({ error: 'Not found' })
    res.json(b)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const data = { ...req.body }
    const brewing = await Brewing.create(data)
    if (data.beanId && data.params && data.params.beanWeight) {
      const bean = await Bean.findById(data.beanId)
      if (bean && !bean.finished) {
        bean.remainingWeight = Math.max(0, (bean.remainingWeight || 0) - Number(data.params.beanWeight))
        if (bean.remainingWeight === 0) bean.finished = true
        await bean.save()
      }
    }
    res.json(brewing)
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const b = await Brewing.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!b) return res.status(404).json({ error: 'Not found' })
    res.json(b)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await Brewing.findByIdAndDelete(req.params.id)
    res.json({ deleted: true })
  } catch (e) { next(e) }
})

router.post('/:id/favorite', async (req, res, next) => {
  try {
    const brewing = await Brewing.findById(req.params.id)
    if (!brewing) return res.status(404).json({ error: 'Not found' })
    await Brewing.updateMany({ beanId: brewing.beanId, _id: { $ne: brewing._id } }, { isFavorite: false })
    brewing.isFavorite = true
    await brewing.save()
    res.json(brewing)
  } catch (e) { next(e) }
})

module.exports = router
