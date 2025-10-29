import pino, { LoggerOptions } from 'pino';

// ==========================================================
// 🔧 CONFIGURACIÓN BÁSICA
// ==========================================================
const LOKI_HOST = 'https://logs-prod-012.grafana.net';
const LOKI_PUSH_ENDPOINT = `${LOKI_HOST}/loki/api/v1/push`;

const LOKI_USERNAME = process.env.LOKI_USERNAME;
const LOKI_PASSWORD = process.env.LOKI_PASSWORD;

const BASE_LABELS = {
  service: 'test-app',
  environment: 'development',
};

// ==========================================================
// 🚀 BÚFER Y ENVÍO EN BATCH A LOKI
// ==========================================================
const logBuffer: any[] = [];
let flushTimer: NodeJS.Timeout | null = null;
const MAX_BUFFER = 10; // número máximo de logs antes de forzar envío
const FLUSH_INTERVAL = 2000; // ms

function scheduleFlush() {
  if (!flushTimer) {
    flushTimer = setTimeout(flushLogsToLoki, FLUSH_INTERVAL);
  }
}

async function flushLogsToLoki() {
  const toSend = logBuffer.splice(0, logBuffer.length);
  flushTimer = null;

  if (toSend.length === 0) return;
  if (!LOKI_USERNAME || !LOKI_PASSWORD) return;

  try {
    const payload = {
      streams: [
        {
          stream: BASE_LABELS,
          values: toSend.map((log) => [`${log.time}000000`, JSON.stringify(log)]),
        },
      ],
    };

    const basicAuth = Buffer.from(`${LOKI_USERNAME}:${LOKI_PASSWORD}`).toString('base64');

    const res = await fetch(LOKI_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
        'X-Scope-OrgID': LOKI_USERNAME,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Evitar usar console.error para prevenir loops
      const errText = await res.text();
      process.stdout.write(`Loki error ${res.status}: ${errText.substring(0, 150)}\n`);
    }
  } catch (err) {
    process.stdout.write(`Error enviando batch a Loki: ${(err as Error).message}\n`);
  }
}

// ==========================================================
// 🧩 FUNCIÓN PARA ENCOLAR LOGS
// ==========================================================
function enqueueLog(log: any) {
  logBuffer.push(log);
  if (logBuffer.length >= MAX_BUFFER) {
    flushLogsToLoki().catch(() => {});
  } else {
    scheduleFlush();
  }
}

// ==========================================================
// 🪵 CONFIGURACIÓN DEL LOGGER PINO
// ==========================================================
const baseLoggerConfig: LoggerOptions = {
  base: BASE_LABELS,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  formatters: {
    level: (label, number) => ({ level: number, severity: label.toUpperCase() }),
  },
};

let loggerInstance: pino.Logger;

if (process.env.NODE_ENV === 'production') {
  // Producción: escribir a stdout y enviar a Loki
  loggerInstance = pino(baseLoggerConfig);

  // Obtener el destino interno (stream real de pino)
  const destination: any = (loggerInstance as any).destination || (loggerInstance as any).stream;

  if (destination && typeof destination.write === 'function') {
    const originalWrite = destination.write.bind(destination);

    destination.write = (chunk: string) => {
      // 1. Escribir normalmente al destino estándar
      originalWrite(chunk);

      // 2. Enviar a Loki de forma asíncrona
      try {
        const log = JSON.parse(chunk);
        enqueueLog(log);
      } catch {
        // Ignorar silenciosamente errores de parseo
      }
    };
  } else {
    // fallback: si no hay stream, usar un noop (útil en builds o edge)
    loggerInstance.info('Logger iniciado sin stream de destino (modo build o edge).');
  }
} else {
  // Desarrollo: usar pino-pretty
  const devTransport = pino.transport({
    target: 'pino-pretty',
    options: { destination: 1, colorize: true },
  });
  loggerInstance = pino(baseLoggerConfig, devTransport);
}


// ==========================================================
// ✅ EXPORTACIÓN
// ==========================================================
export default loggerInstance;
