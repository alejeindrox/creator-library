import pino, { LoggerOptions } from 'pino';

const LOKI_HOST = 'https://logs-prod-012.grafana.net';
const LOKI_PUSH_ENDPOINT = `${LOKI_HOST}/loki/api/v1/push`;

const LOKI_USERNAME = process.env.LOKI_USERNAME;
const LOKI_PASSWORD = process.env.LOKI_PASSWORD;

const BASE_LABELS = {
  service: 'test-app',
  environment: 'development',
};

// --- Envío a Loki ---
async function sendLogToLoki(log: any) {
  if (!LOKI_USERNAME || !LOKI_PASSWORD) return;

  try {
    const nanoseconds = `${log.time}000000`;
    const payload = {
      streams: [{ stream: BASE_LABELS, values: [[nanoseconds, JSON.stringify(log)]] }],
    };

    const res = await fetch(LOKI_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${LOKI_USERNAME}:${LOKI_PASSWORD}`).toString('base64')}`,
        'X-Scope-OrgID': LOKI_USERNAME,
      },
      body: JSON.stringify(payload),
    });
    console.log(res);

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Loki] Error ${res.status}: ${err.slice(0, 200)}`);
    }
  } catch (err) {
    console.error('Error al enviar log a Loki:', err);
  }
}

const baseConfig: LoggerOptions = {
  base: BASE_LABELS,
  level: 'debug',
  formatters: {
    level: (label, number) => ({ level: number, severity: label.toUpperCase() }),
  },
};

let destination: any;

if (process.env.NODE_ENV === 'production') {
  // Sin transport en prod → usa stdout
  destination = pino.destination(1);
} else {
  // pino-pretty en dev
  destination = pino.transport({
    target: 'pino-pretty',
    options: { destination: 1, colorize: true },
  });
}

const logger = pino(baseConfig, destination);

// --- Hook para enviar a Loki en runtime (no build) ---
if (process.env.NODE_ENV === 'production') {
  setTimeout(() => {
    try {
      // ⚡ Esto se ejecuta en runtime real, no durante el bundle
      const originalWrite = destination.write.bind(destination);
      destination.write = (chunk: string) => {
        originalWrite(chunk);
        try {
          const log = JSON.parse(chunk);
          sendLogToLoki(log);
        } catch {
          /* ignorar parseo */
        }
      };
      console.log('[Logger] Hook de Loki activado');
    } catch (err) {
      console.error('[Logger] Error al enganchar Loki:', err);
    }
  }, 0);
}

export default logger;
