import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { fileURLToPath } from 'url'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { initDatabase } from './db/init.js'
import {
  ensureAdminSeed,
  ensureHomepageSeed,
  ensureSiteSettingsSeed,
  ensureMenuSeed,
  ensureSiteSettingsSeeded,
} from './db/seed.js'

import adminRouter from './routes/admin/index.js'
import siteRouter from './routes/site/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const CORS_ORIGINS =
  process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) || []

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      if (CORS_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
app.use(cookieParser())
app.use(
  express.json({
    type: ['application/json', 'application/*+json'],
    limit: '50mb',
  })
)
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/api/admin', adminRouter)
app.use('/api/sites', siteRouter)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err)
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    })
  }
)

const PORT = Number(process.env.PORT)

;(async () => {
  try {
    await initDatabase({
      seed: async () => {
        await ensureAdminSeed()
        await ensureSiteSettingsSeed()
        await ensureHomepageSeed()
        await ensureMenuSeed()
        await ensureSiteSettingsSeeded()
      },
    })
    console.log('Database ready.')
    app.listen(PORT, () => {
      console.log('Server running on port', PORT)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
})()

export default app
