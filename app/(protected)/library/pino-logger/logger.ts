// logger.ts (Código modificado)
import pino, { LoggerOptions, DestinationStream } from 'pino';

// Define el endpoint de Loki
const LOKI_HOST = 'https://logs-prod-012.grafana.net';
const LOKI_PUSH_ENDPOINT = `${LOKI_HOST}/loki/api/v1/push`;

// NOTA IMPORTANTE: process.env.LOKI_USERNAME puede ser undefined durante la compilación.
// Lo inicializaremos solo cuando se use para evitar errores de tipo si no existen.
const LOKI_USERNAME = process.env.LOKI_USERNAME;
const LOKI_PASSWORD = process.env.LOKI_PASSWORD;

// Etiquetas base
const BASE_LABELS = {
  service: 'test-app',
  environment: 'development',
};

// --- 1. Función de Envío a Loki (Mantenemos el cuerpo igual) ---

async function sendLogToLoki(log: any) {
  if (!LOKI_USERNAME || !LOKI_PASSWORD) {
    console.error('LOKI_USERNAME o LOKI_PASSWORD no están configuradas. Saltando envío a Loki.');
    return;
  }

  try {
    const nanoseconds = `${log.time}000000`;
    const logLine = JSON.stringify(log);

    const payload = {
      streams: [
        {
          stream: BASE_LABELS,
          values: [[nanoseconds, logLine]],
        },
      ],
    };

    const basicAuth = Buffer.from(`${LOKI_USERNAME}:${LOKI_PASSWORD}`).toString('base64');

    const response = await fetch(LOKI_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
        'X-Scope-OrgID': LOKI_USERNAME,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Loki Error (${response.status}): ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.error('Error de red/runtime al enviar a Loki:', error);
  }
}

// --- 2. Inicialización del Logger ---

const baseLoggerConfig: LoggerOptions = {
  base: BASE_LABELS,
  level: 'debug',
  formatters: {
    level: (label, number) => ({ level: number, severity: label.toUpperCase() }),
  },
};

let loggerInstance: pino.Logger;

if (process.env.NODE_ENV === 'production') {
  // 💡 SOLUCIÓN CLAVE: Inicializar Pino SIN un transport
  // Pino por defecto escribe a process.stdout, que tiene el método .write
  loggerInstance = pino(baseLoggerConfig);
} else {
  // En desarrollo, usamos pino-pretty
  const devDestination = pino.transport({
    target: 'pino-pretty',
    options: { destination: 1, colorize: true },
  });
  loggerInstance = pino(baseLoggerConfig, devDestination);
}

// --- 3. Implementación del Hook de Escritura (Solo si es producción) ---

if (process.env.NODE_ENV === 'production') {
  // Aquí, loggerInstance está inicializado con el stream base de Pino,
  // que garantiza que el método .write exista.
  const originalWrite = (loggerInstance as any).write.bind(loggerInstance);

  (loggerInstance as any).write = function (chunk: string) {
    // 1. Escribir primero el log al destino estándar (Vercel Console/stdout)
    originalWrite(chunk);

    // 2. Interceptar y enviar a Loki
    try {
      const log = JSON.parse(chunk);
      sendLogToLoki(log).catch(() => {});
    } catch (e) {
      console.error('Fallo al parsear log en el hook de Loki:', e);
    }
  };
}

export default loggerInstance;
