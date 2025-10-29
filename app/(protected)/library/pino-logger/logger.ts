// logger.ts (Archivo de Logger sin pino-loki)
import pino, { LoggerOptions, DestinationStream } from 'pino';

// Define el endpoint de Loki
const LOKI_HOST = 'https://logs-prod-012.grafana.net';
const LOKI_PUSH_ENDPOINT = `${LOKI_HOST}/loki/api/v1/push`;
const LOKI_USERNAME = process.env.LOKI_USERNAME as string;
const LOKI_PASSWORD = process.env.LOKI_PASSWORD as string;

// Etiquetas base que se usarán en el stream de Loki
const BASE_LABELS = {
  service: 'test-app',
  environment: 'development',
};

// --- 1. Función de Envío a Loki ---

/**
 * Formatea un objeto de log de Pino al formato Streams de Loki y lo envía por fetch.
 * @param log Un objeto de log formateado por Pino.
 */
async function sendLogToLoki(log: any) {
  if (!LOKI_USERNAME || !LOKI_PASSWORD) {
    // Si faltan credenciales, simplemente escribimos un error en la consola y salimos.
    console.error('LOKI_USERNAME o LOKI_PASSWORD no están configuradas. Saltando envío a Loki.');
    return;
  }

  try {
    // 1. Convertir el timestamp de milisegundos a nanosegundos (requerido por Loki)
    const nanoseconds = `${log.time}000000`;

    // 2. Preparar la línea de log (usamos el JSON completo de Pino)
    const logLine = JSON.stringify(log);

    // 3. Construir el payload de Loki Streams
    const payload = {
      streams: [
        {
          stream: BASE_LABELS, // Usamos las etiquetas base
          values: [[nanoseconds, logLine]],
        },
      ],
    };

    // 4. Configurar headers de autenticación (Basic Auth y X-Scope-OrgID)
    const basicAuth = Buffer.from(`${LOKI_USERNAME}:${LOKI_PASSWORD}`).toString('base64');

    const response = await fetch(LOKI_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
        // X-Scope-OrgID es requerido por Grafana Cloud y suele ser el mismo que el username
        'X-Scope-OrgID': LOKI_USERNAME,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Manejar el error de red o de Loki (importante: no usar el logger aquí para evitar loops)
      const errorText = await response.text();
      console.error(`Loki Error (${response.status}): ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.error('Error de red/runtime al enviar a Loki:', error);
  }
}

// --- 2. Configuración Base del Logger (Similar a tu código original) ---

const baseLoggerConfig: LoggerOptions = {
  base: BASE_LABELS,
  level: 'debug',
  formatters: {
    level: (label, number) => ({ level: number, severity: label.toUpperCase() }),
  },
};

// --- 3. Implementación del Hook de Escritura ---

// Inicializar el logger con un destino simple (stdout o pino-pretty en desarrollo)
const standardDestination: DestinationStream = pino.transport({
  target: 'pino-pretty',
  options: { destination: 1, colorize: process.env.NODE_ENV !== 'production' },
});

const logger = pino(baseLoggerConfig, standardDestination);

// Si estamos en producción, sobrescribimos la función 'write' del logger.
if (process.env.NODE_ENV === 'production') {
  const originalWrite = (logger as unknown).write.bind(logger);

  (logger as any).write = function (chunk: string) {
    // 1. Escribir primero el log al destino estándar (Vercel Console/stdout)
    originalWrite(chunk);

    // 2. Interceptar y enviar a Loki
    try {
      const log = JSON.parse(chunk);
      // Ejecutar la función de envío de forma asíncrona.
      // Usamos .catch() para asegurar que el fallo de Loki NO rompa la ejecución de la función Serverless.
      sendLogToLoki(log).catch(() => {});
    } catch (e) {
      console.error('Fallo al parsear log en el hook de Loki:', e);
    }
  };
}

export default logger;
