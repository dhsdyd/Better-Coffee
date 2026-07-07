const express = require('express')
const cors = require('cors')
const config = require('./config')
const { connectDB } = require('./db')
const { seedIfEmpty } = require('./seed')

const beansRouter = require('./routes/beans')
const brewingsRouter = require('./routes/brewings')
const settingsRouter = require('./routes/settings')
const aiRouter = require('./routes/ai')

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok', demoMode: config.demoMode }))
app.use('/api/beans', beansRouter)
app.use('/api/brewings', brewingsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/ai', aiRouter)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Server error' })
})

async function start() {
  await connectDB()
  if (config.demoMode) {
    const seeded = await seedIfEmpty().catch(e => console.error('Seed failed:', e.message))
    if (seeded) console.log('Demo data seeded')
  }
  app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}`))
}

start().catch(err => {
  console.error('Failed to start:', err)
  process.exit(1)
})
