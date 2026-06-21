import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import 'dotenv/config'
import { healthRouter } from './router/health.js'
import { ingestRouter } from './router/ingest.js'
import { ApiError } from './errors.js'
import { env } from './env.js'

const app = express()

const PORT = env.PORT

const allowedOrigins = [env.INGEST_SERVICE_CORS_ORIGIN].filter(Boolean)

app.use(express.json())
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
)
app.use(morgan('dev'))

app.get('/', (_req: Request, res: Response) => {
  res.send('This is Ollive API.')
})

app.use('/health', healthRouter)
app.use('/ingest', ingestRouter)

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      code: error.code
    })
  }

  console.error(error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR'
  })
})

app.listen(PORT, () => {
  console.log(`Running at ${PORT}`)
})
