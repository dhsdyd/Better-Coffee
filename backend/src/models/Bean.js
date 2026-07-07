const mongoose = require('mongoose')
const beanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  origin: String,
  variety: String,
  process: String,
  roastLevel: { type: String, required: true, enum: ['light', 'medium', 'dark'] },
  roastDate: { type: String, required: true },
  weight: { type: Number, required: true },
  remainingWeight: Number,
  finished: { type: Boolean, default: false },
  notes: String,
  deleted: { type: Boolean, default: false }
}, { timestamps: true })
module.exports = mongoose.model('Bean', beanSchema)
