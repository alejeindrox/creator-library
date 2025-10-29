import pino from 'pino'
import { createRequire } from 'module';
import type { LokiOptions } from 'pino-loki'

const require = createRequire(import.meta.url);
require('pino-loki');

const transport = pino.transport<LokiOptions>({
  target: 'pino-loki',
  options: {
    host: 'https://logs-prod-012.grafana.net',
    basicAuth: {
      username: process.env.LOKI_USERNAME as string,
      password: process.env.LOKI_PASSWORD as string,
    },
    labels: {
      service: 'test-app',
      environment: 'development',
    },
    headers: {
      'X-Scope-OrgID': process.env.LOKI_USERNAME as string,
    },
  },
})

const destination =
  process.env.NODE_ENV === 'production'
    ? transport
    : pino.transport({
        target: 'pino-pretty',
        options: { destination: 1, colorize: true },
      })

const logger = pino(
  {
    base: {
      service: 'test-app',
      environment: 'development',
    },
    level: 'debug',
    formatters: {
      level: (label, number) => ({ level: number, severity: label.toUpperCase() }),
    },
  },
  destination
)

export default logger
