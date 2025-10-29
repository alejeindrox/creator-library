export class ApiError extends Error {
  status: number
  body: any

  constructor(status: number, body: any) {
    super(typeof body === 'string' ? body : JSON.stringify(body))
    this.status = status
    this.body = body
  }
}
