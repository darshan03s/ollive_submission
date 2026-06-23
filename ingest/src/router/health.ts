import { Router } from 'express'

export const healthRouter: Router = Router()

healthRouter.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})
