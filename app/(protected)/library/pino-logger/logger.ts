import pino from 'pino'
import type { LokiOptions } from 'pino-loki'
import pinoLoki from '@/pino-loki-esm';

const transport = pino.transport<LokiOptions>({
  target: pinoLoki,
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
