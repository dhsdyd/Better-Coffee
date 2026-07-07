const https = require('https')
const { URL } = require('url')
const { TIMEOUT } = require('../config')

function call(opts) {
  return new Promise((resolve, reject) => {
    const url = new URL(opts.path, opts.baseURL)
    const body = JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: 0.7,
      stream: false
    })
    const options = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opts.apiKey}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
          return
        }
        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.message?.content
          if (!content) { reject(new Error('Empty AI response')); return }
          resolve({ content })
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`))
        }
      })
    })
    req.on('error', reject)
    const timer = setTimeout(() => { req.destroy(); reject(new Error(`Timeout ${TIMEOUT}ms`)) }, TIMEOUT)
    req.on('close', () => clearTimeout(timer))
    req.write(body)
    req.end()
  })
}

module.exports = { call }
