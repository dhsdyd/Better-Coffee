const mongoose = require('mongoose')
const settingsSchema = new mongoose.Schema({
  provider: { type: String, enum: ['deepseek', 'qwen', 'openai'], default: 'deepseek' },
  model: String,
  apiKey: String
}, { timestamps: true })
module.exports = mongoose.model('UserSettings', settingsSchema)
