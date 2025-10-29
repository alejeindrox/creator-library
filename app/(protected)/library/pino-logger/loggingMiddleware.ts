import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import logger from './logger'
import { ApiError } from './apiError'

interface NextRequestContext {
  params: Record<string, unknown> | Promise<Record<string, unknown>>
}

export default function loggingMiddleware(handler: (req: NextRequest, ctx: NextRequestContext) => Promise<NextResponse>) {
  return async (req: NextRequest, ctx: NextRequestContext) => {
    const reqId = req.headers.get('x-request-id') || crypto.randomUUID()
    const session = 'TEST_USER_ID'
    const resolvedParams = await Promise.resolve(ctx.params)

    const log = logger.child({
      reqId,
      method: req.method,
      url: req.nextUrl.pathname + req.nextUrl.search,
      userId: session ?? null,
      ...resolvedParams,
    })

    try {
      const res = await handler(req, ctx)
      log.info({ status: res.status }, 'Request completed')
      return res
    } catch (err: unknown) {
      log.error({ err }, 'Request failed')

      if (err instanceof ApiError) {
        return NextResponse.json(err.body, { status: err.status })
      }

      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
}
