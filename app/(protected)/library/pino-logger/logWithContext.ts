import crypto from 'crypto'

import logger from './logger'

interface LogContextOptions {
  action?: string
  entity?: string
  metadata?: Record<string, unknown>
}

export async function logWithContext(options: LogContextOptions = {}) {
  const reqId = crypto.randomUUID()
  const session = "TEST_USER_ID"

  return logger.child({
    reqId,
    userId: session ?? undefined,
    action: options.action ?? 'unknown_action',
    entity: options.entity ?? 'unknown_entity',
    metadata: options.metadata ?? undefined,
  })
}
