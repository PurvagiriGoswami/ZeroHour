import pino from 'pino';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * Masks all but the last 6 characters of a string.
 */
export const maskKey = (key) => {
  if (!key) return 'MISSING';
  if (key.length <= 6) return '******';
  return '*'.repeat(key.length - 6) + key.slice(-6);
};

/**
 * Validates and retrieves required environment variables.
 */
export const getEnv = (name, required = true) => {
  const value = process.env[name];
  if (required && !value) {
    logger.error(`Critical environment variable ${name} is missing.`);
    process.exit(1);
  }
  return value || '';
};

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

export const CONFIG = {
  PDF_LIBRARY_PATH: getEnv('PDF_LIBRARY_PATH', false) || path.join(process.cwd(), 'CDS Papers'),
  INSIGHTS_ROOT: path.join(process.cwd(), 'insights'),
  GEMINI_API_KEY: getEnv('VITE_GEMINI_API_KEY'),
  OPENROUTER_API_KEY: getEnv('OPENROUTER_API_KEY', false),
  SLACK_WEBHOOK_URL: getEnv('SLACK_WEBHOOK_URL', false),
};

logger.info({
  geminiKey: maskKey(CONFIG.GEMINI_API_KEY),
  openRouterKey: maskKey(CONFIG.OPENROUTER_API_KEY),
  libPath: CONFIG.PDF_LIBRARY_PATH,
}, 'Pipeline Configuration Loaded');
