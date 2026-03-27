import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG, logger } from './utils.js';

export class LoadBalancer {
  constructor() {
    this.providers = [];
    this.initProviders();
  }

  initProviders() {
    // 1. Gemini
    if (CONFIG.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
      this.providers.push({
        id: 'gemini',
        name: 'Gemini 2.0 Flash',
        costPer1k: 0,
        metrics: { latency: [], quotaExceeded: 0, totalCalls: 0, lastUsed: null },
        call: async (prompt) => {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
          const start = Date.now();
          const result = await model.generateContent(prompt);
          this.recordMetric('gemini', Date.now() - start);
          return result.response.text();
        }
      });
    }

    // 2. OpenRouter (DeepSeek)
    if (CONFIG.OPENROUTER_API_KEY) {
      const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: CONFIG.OPENROUTER_API_KEY,
        defaultHeaders: {
          'HTTP-Referer': 'https://zerohour.app',
          'X-OpenRouter-Title': 'ZeroHour AI',
        },
      });
      this.providers.push({
        id: 'openrouter',
        name: 'DeepSeek Chat',
        costPer1k: 0.01,
        metrics: { latency: [], quotaExceeded: 0, totalCalls: 0, lastUsed: null },
        call: async (prompt) => {
          const start = Date.now();
          const completion = await openai.chat.completions.create({
            model: 'deepseek/deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
          });
          this.recordMetric('openrouter', Date.now() - start);
          return completion.choices[0].message.content || '';
        }
      });
    }
  }

  recordMetric(id, latency) {
    const provider = this.providers.find(p => p.id === id);
    if (provider) {
      provider.metrics.latency.push(latency);
      if (provider.metrics.latency.length > 10) provider.metrics.latency.shift();
      provider.metrics.totalCalls++;
      provider.metrics.lastUsed = new Date();
    }
  }

  getMedianLatency(id) {
    const provider = this.providers.find(p => p.id === id);
    if (!provider || provider.metrics.latency.length === 0) return 0;
    const sorted = [...provider.metrics.latency].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  async call(prompt) {
    const sortedProviders = [...this.providers].sort((a, b) => {
      if (a.metrics.quotaExceeded !== b.metrics.quotaExceeded) return a.metrics.quotaExceeded - b.metrics.quotaExceeded;
      return this.getMedianLatency(a.id) - this.getMedianLatency(b.id);
    });

    for (const provider of sortedProviders) {
      let attempts = 0;
      const maxAttempts = 5;
      while (attempts < maxAttempts) {
        try {
          logger.info(`Calling ${provider.name} (Attempt ${attempts + 1})`);
          return await provider.call(prompt);
        } catch (error) {
          if (error.status === 429 || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
            provider.metrics.quotaExceeded++;
            logger.warn(`${provider.name} quota exceeded. Rotating...`);
            break;
          }
          attempts++;
          const waitTime = Math.pow(2, attempts) * 1000;
          logger.error(`Error with ${provider.name}: ${error.message}. Retrying in ${waitTime}ms...`);
          await new Promise(r => setTimeout(r, waitTime));
        }
      }
    }
    throw new Error('All model providers exhausted.');
  }
}
