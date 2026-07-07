const mongoose = require('mongoose')
const config = require('./config')

async function connectDB() {
  mongoose.set('strictQuery', false)
  await mongoose.connect(config.mongodbUri)
  console.log('MongoDB connected')
}

module.exports = { connectDB, mongoose }
