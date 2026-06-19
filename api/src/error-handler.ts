import type { NextFunction, Request, RequestHandler, Response } from 'express'

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

export function withErrorHandler(handler: AsyncHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
