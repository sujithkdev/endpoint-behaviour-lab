# Offline ingestion service — Phase 2

src/main.mjs validates or imports trusted immutable Wazuh Windows JSONL exports. See ../../docs/PHASE-2.md for commands and identity limitations. No live tailer, RabbitMQ publisher or HTTP upload service is implemented. The runtime currently follows the existing Node ES-module stack; TypeScript migration remains future work.
