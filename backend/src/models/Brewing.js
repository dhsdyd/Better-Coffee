const mongoose = require('mongoose')
const brewingSchema = new mongoose.Schema({
  beanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bean', required: true },
  beanName: String,
  method: { type: String, required: true, enum: ['pour_over', 'espresso'] },
  params: { type: mongoose.Schema.Types.Mixed, default: {} },
  rating: { type: Number, min: 1, max: 5 },
  tasteTags: [String],
  notes: String,
  improvementDir: String,
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true })
module.exports = mongoose.model('Brewing', brewingSchema)
