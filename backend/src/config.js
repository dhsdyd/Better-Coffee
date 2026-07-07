module.exports = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/better-coffee',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  demoMode: (process.env.DEMO_MODE || '').toLowerCase() === 'true'
}
