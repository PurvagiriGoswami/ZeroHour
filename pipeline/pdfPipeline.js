import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { logger, CONFIG } from './utils.js';

export class PDFPipeline {
  constructor(loadBalancer) {
    this.processedHashes = new Set();
    this.loadBalancer = loadBalancer;
    // Handle different pdf-parse export styles
    this.parsePdf = typeof pdf === 'function' ? pdf : pdf.default;
  }

  async init() {
    await this.loadState();
  }

  async loadState() {
    const statePath = path.join(CONFIG.INSIGHTS_ROOT, 'processed_hashes.json');
    if (existsSync(statePath)) {
      const data = await fs.readFile(statePath, 'utf-8');
      this.processedHashes = new Set(JSON.parse(data));
    }
  }

  async saveState() {
    const statePath = path.join(CONFIG.INSIGHTS_ROOT, 'processed_hashes.json');
    await fs.mkdir(CONFIG.INSIGHTS_ROOT, { recursive: true });
    await fs.writeFile(statePath, JSON.stringify(Array.from(this.processedHashes), null, 2));
  }

  calculateHash(filePath) {
    const buffer = readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  chunkText(text, maxTokens = 8000) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxTokens * 4) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += sentence + ' ';
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  async processFolder(folderPath) {
    const files = await this.getAllPDFFiles(folderPath);
    logger.info(`Found ${files.length} PDFs in ${folderPath}`);

    const today = new Date().toISOString().split('T')[0];
    const dailyDir = path.join(CONFIG.INSIGHTS_ROOT, today);
    await fs.mkdir(dailyDir, { recursive: true });

    for (const file of files) {
      const hash = this.calculateHash(file);
      if (this.processedHashes.has(hash)) {
        logger.info(`Skipping already processed file: ${path.basename(file)}`);
        continue;
      }

      logger.info(`Processing ${path.basename(file)}...`);
      try {
        const dataBuffer = await fs.readFile(file);
        const data = await this.parsePdf(dataBuffer);
        const chunks = this.chunkText(data.text);
        
        const insights = [];
        for (const chunk of chunks) {
          const result = await this.extractInsights(chunk);
          insights.push(result);
        }

        const consolidated = this.consolidateInsights(insights);
        const fileName = path.basename(file, '.pdf');
        await fs.writeFile(path.join(dailyDir, `${fileName}_insights.json`), JSON.stringify(consolidated, null, 2));
        await fs.writeFile(path.join(dailyDir, `${fileName}_digest.md`), this.generateMarkdown(consolidated));

        this.processedHashes.add(hash);
        await this.saveState();
      } catch (err) {
        logger.error(`Failed to process ${file}: ${err.message}`);
      }
    }
  }

  async getAllPDFFiles(dir) {
    let results = [];
    const list = await fs.readdir(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(await this.getAllPDFFiles(filePath));
      } else if (file.endsWith('.pdf')) {
        results.push(filePath);
      }
    }
    return results;
  }

  async extractInsights(text) {
    const prompt = `
      Analyze this text from a CDS Exam paper. 
      Extract the following as a JSON object:
      {
        "topics": ["topic1", "topic2"],
        "entities": ["entity1", "entity2"],
        "summary": "max 150 words summary",
        "confidence": 0.95
      }
      TEXT: ${text}
    `;
    const response = await this.loadBalancer.call(prompt);
    try {
      return JSON.parse(response.replace(/```json|```/g, '').trim());
    } catch (e) {
      logger.error('Failed to parse AI response as JSON. Returning raw string.');
      return { raw: response };
    }
  }

  consolidateInsights(insights) {
    return {
      topics: Array.from(new Set(insights.flatMap(i => i.topics || []))),
      entities: Array.from(new Set(insights.flatMap(i => i.entities || []))),
      summary: insights.map(i => i.summary).join('\n\n'),
      confidence: insights.reduce((acc, i) => acc + (i.confidence || 0), 0) / insights.length,
      processedAt: new Date().toISOString(),
    };
  }

  generateMarkdown(insights) {
    return `# AI Insight Report\n\n` +
      `**Processed At:** ${insights.processedAt}\n\n` +
      `## Key Topics\n${insights.topics.map((t) => `- ${t}`).join('\n')}\n\n` +
      `## Summary\n${insights.summary}\n\n` +
      `## Entities\n${insights.entities.join(', ')}\n\n` +
      `**AI Confidence:** ${Math.round(insights.confidence * 100)}%`;
  }
}
