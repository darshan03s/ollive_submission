export class ApiError extends Error {
  code: string
  status: number

  constructor()
  constructor(code: string)
  constructor(code: string, status: number)

  constructor(code = 'INTERNAL_SERVER_ERROR', status = 500) {
    super(code)

    this.name = 'ApiError'
    this.code = code
    this.status = status

    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
