import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import tachosRoutes from './routes/tachosRoutes.js'
import envelope from './middleware/responseEnvelope.js'
import errorHandler from './middleware/errorHandler.js'
import logger from './config/logger.js'

const app = express()

app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json())
app.use(envelope)

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { ok: false, error: 'Demasiadas solicitudes, intenta más tarde' }
}))

app.use('/api', tachosRoutes)

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'EcoSmart API funcionando' })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy', uptime: process.uptime() })
})

app.use(errorHandler)

export default app
