// src/worker/index.ts
import { TaskWorker } from "./worker";

const worker = new TaskWorker();

// Handle graceful shutdown (Ctrl+C)
process.on("SIGINT", () => {
  console.log("\n[Worker] 👋 Shutting down...");
  process.exit();
});

worker.start();
