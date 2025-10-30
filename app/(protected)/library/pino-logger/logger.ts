import pino, { LoggerOptions, Logger } from 'pino';

const LOKI_HOST = 'https://logs-prod-012.grafana.net';
const LOKI_PUSH_ENDPOINT = `${LOKI_HOST}/loki/api/v1/push`;

const LOKI_USERNAME = process.env.LOKI_USERNAME;
const LOKI_PASSWORD = process.env.LOKI_PASSWORD;

const BASE_LABELS = {
  service: 'test-app',
  environment: process.env.NODE_ENV ?? 'development',
};

/**
 * @typedef {Object} LokiLogEntry
 * @property {string} time - Timestamp in milliseconds.
 * @property {string} line - Raw log line stringified as JSON.
 */
interface LokiLogEntry {
  time: string;
  line: string;
}

/** @type {LokiLogEntry[]} */
const logQueue: LokiLogEntry[] = [];

/**
 * Timer reference used to control scheduled log flushes.
 * Cleared and reset after each successful flush cycle.
 */
let flushTimer: NodeJS.Timeout | null = null;

/**
 * Maximum number of log entries to batch and send to Loki in a single request.
 * Helps reduce network overhead by grouping multiple logs together.
 */
const MAX_BATCH_SIZE = 50;

/**
 * Interval (in milliseconds) after which queued logs are automatically flushed
 * to Loki, even if the maximum batch size has not been reached yet.
 */
const FLUSH_INTERVAL_MS = 3000;

/**
 * Sends a batch of logs to Grafana Loki.
 * @param {LokiLogEntry[]} batch - Array of logs to send.
 * @returns {Promise<void>}
 */
async function sendBatchToLoki(batch: LokiLogEntry[]): Promise<void> {
  if (!LOKI_USERNAME || !LOKI_PASSWORD || batch.length === 0) return;

  try {
    const payload = {
      streams: [
        {
          stream: BASE_LABELS,
          values: batch.map((entry) => [`${entry.time}000000`, entry.line]),
        },
      ],
    };

    const response = await fetch(LOKI_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${LOKI_USERNAME}:${LOKI_PASSWORD}`).toString('base64')}`,
        'X-Scope-OrgID': LOKI_USERNAME,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Loki] Error ${response.status}: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    console.error('[Loki] Network or runtime error:', err);
  }
}

/**
 * Adds a log to the queue and schedules a batch flush.
 * @param {Record<string, any>} log - The log object from Pino.
 */
function enqueueLog(log: Record<string, any>): void {
  try {
    logQueue.push({ time: String(log.time), line: JSON.stringify(log) });
    if (logQueue.length >= MAX_BATCH_SIZE) flushLogs();
    else if (!flushTimer) flushTimer = setTimeout(flushLogs, FLUSH_INTERVAL_MS);
  } catch {
    /* intentionally ignore malformed logs */
  }
}

/**
 * Flushes all queued logs to Loki in a single batch.
 * @returns {Promise<void>}
 */
async function flushLogs(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (logQueue.length === 0) return;
  const batch = logQueue.splice(0, logQueue.length);
  await sendBatchToLoki(batch);
}

const baseConfig: LoggerOptions = {
  base: BASE_LABELS,
  level: 'debug',
  formatters: {
    level: (label, number) => ({ level: number, severity: label.toUpperCase() }),
  },
};

const destination =
  process.env.NODE_ENV === 'production'
    ? pino.destination(1)
    : pino.transport({
        target: 'pino-pretty',
        options: { destination: 1, colorize: true },
      });

const logger: Logger = pino(baseConfig, destination);

/**
 * Dynamically attaches a write hook to intercept Pino logs
 * and push them into a buffered queue that is sent to Loki in batches.
 * This runs only in production.
 */
function attachLokiHook(): void {
  if (process.env.NODE_ENV !== 'production') return;

  setTimeout(() => {
    try {
      const originalWrite = destination.write.bind(destination);
      destination.write = (chunk: string) => {
        originalWrite(chunk);
        try {
          const log = JSON.parse(chunk);
          enqueueLog(log);
        } catch {
          /* intentionally ignore malformed or non-JSON logs */
        }
      };
      console.log('[Logger] Loki batch hook attached');
    } catch (err) {
      console.error('[Logger] Failed to attach Loki hook:', err);
    }
  }, 0);
}

attachLokiHook();

/**
 * Handles graceful shutdown events (e.g., SIGTERM, SIGINT, or process exit)
 * by attempting to flush any remaining logs in the queue before termination.
 *
 * @param {string} signal - The signal that triggered the shutdown (e.g., "SIGTERM").
 * @returns {Promise<void>} Resolves after flushing pending logs and exiting the process.
 */
const handleShutdown = async (signal: string) => {
  try {
    console.log(`[Logger] Received ${signal}, flushing pending logs...`);
    await flushLogs();
    console.log('[Logger] Log queue flushed successfully.');
  } catch (err) {
    console.error('[Logger] Failed to flush logs during shutdown:', err);
  }
};

process.on('beforeExit', () => void flushLogs());
process.on('SIGTERM', () => void handleShutdown('SIGTERM'));
process.on('SIGINT', () => void handleShutdown('SIGINT'));

export default logger;
