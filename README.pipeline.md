# AI Automated PDF Intelligence Pipeline

A fully-automated, fault-tolerant daily pipeline for processing CDS Exam PDFs, extracting structured insights, and generating human-readable reports using a multi-model load-balancing layer.

## Core Features

- **Exactly-Once Daily Execution:** Scheduled at 02:00 UTC with persistent state logging.
- **Multi-Model Load-Balancer:** Dynamically rotates between Gemini and OpenRouter (DeepSeek) with automatic failover and quota management.
- **Hierarchical Extraction:** Structured JSON insights including topics, entities, and summaries.
- **SHA-256 Deduplication:** Ensures zero redundant processing for existing documents.
- **Observability:** Structured ISO-8601 logging with PINO and masked security credentials.

## Setup & Deployment

1. **Environment Configuration:**
   Create a `.env` file based on the template below:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key
   OPENROUTER_API_KEY=your_openrouter_key
   PDF_LIBRARY_PATH=./CDS Papers
   LOG_LEVEL=info
   SLACK_WEBHOOK_URL=optional_slack_url
   ```

2. **Local Execution (Recommended for Windows):**
   If Docker is not installed, you can run the pipeline directly using Node.js:
   ```bash
   node pipeline/scheduler.js
   ```
   *Note: Ensure you have Node.js 18+ installed.*

3. **Docker Deployment:**
   If you have Docker Desktop installed and running:
   ```bash
   docker build -f Dockerfile.pipeline -t zerohour-pipeline .
   docker run -d \
     --env-file .env \
     -v $(pwd)/"CDS Papers":/app/library \
     -v $(pwd)/insights:/app/insights \
     zerohour-pipeline
   ```

## Metrics & Observability

- **Logs:** Real-time structured logs are emitted to `stdout`.
- **State:** Persistent processing state is stored in `insights/processed_hashes.json`.
- **Reports:** Daily insights are generated in `insights/YYYY-MM-DD/`.

## Troubleshooting

- **"docker" is not recognized:** This means Docker is not installed on your system. Please use the **Local Execution** method described above.
- **TypeScript Errors:** The pipeline has been converted to pure ESM JavaScript to avoid complex compilation issues. Use `node pipeline/scheduler.js` for execution.
- **429 Errors:** The pipeline automatically rotates models and implements exponential back-off. Check `LOG_LEVEL=debug` for detailed rotation logs.
