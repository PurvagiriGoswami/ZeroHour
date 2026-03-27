import cron from 'node-cron';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { logger, CONFIG } from './utils.js';
import { LoadBalancer } from './loadBalancer.js';
import { PDFPipeline } from './pdfPipeline.js';

export class Scheduler {
  constructor(pipeline) {
    this.pipeline = pipeline;
    this.lastRunFile = path.join(CONFIG.INSIGHTS_ROOT, 'last_run.log');
  }

  async start() {
    logger.info('Starting Automated Daily Pipeline Scheduler...');

    // 02:00 UTC
    cron.schedule('0 2 * * *', async () => {
      logger.info('Daily trigger at 02:00 UTC. Starting pipeline...');
      await this.run();
    });

    // Check if we already ran today
    const today = new Date().toISOString().split('T')[0];
    const lastRun = await this.getLastRunDate();
    
    if (lastRun !== today) {
      logger.warn(`Pipeline has not run today (${today}). Running now...`);
      await this.run();
    }
  }

  async getLastRunDate() {
    if (existsSync(this.lastRunFile)) {
      const data = await fs.readFile(this.lastRunFile, 'utf-8');
      return data.trim();
    }
    return '';
  }

  async run() {
    try {
      await this.pipeline.init();
      await this.pipeline.processFolder(CONFIG.PDF_LIBRARY_PATH);
      const today = new Date().toISOString().split('T')[0];
      await fs.writeFile(this.lastRunFile, today);
      logger.info(`Pipeline execution successful for ${today}.`);
    } catch (err) {
      logger.error(`Unhandled pipeline error: ${err.message}`);
      await this.sendAlert(err);
    }
  }

  async sendAlert(err) {
    if (CONFIG.SLACK_WEBHOOK_URL) {
      logger.info('Sending Slack alert for pipeline failure...');
      // Implement Slack notification logic here
    }
  }
}

// Entry Point
async function bootstrap() {
  const lb = new LoadBalancer();
  const pipeline = new PDFPipeline(lb);
  const scheduler = new Scheduler(pipeline);
  await scheduler.start();
}

bootstrap().catch(err => {
  console.error('CRITICAL: Scheduler bootstrap failed.', err);
  process.exit(1);
});
