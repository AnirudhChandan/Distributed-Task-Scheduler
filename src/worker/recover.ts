// src/worker/recover.ts
import redisConnection from "../config/redis";

async function recover() {
  const sourceQueue = "task-queue:processing";
  const destinationQueue = "task-queue";

  console.log("🚑 Recovery Service Started...");

  while (true) {
    // RPOPLPUSH: Removes the last element from 'processing' and pushes it to 'task-queue'
    // This atomically "recycles" the task.
    const task = await redisConnection.rpoplpush(sourceQueue, destinationQueue);

    if (task) {
      console.log(`[Recovery] ♻️  Restored stuck task: ${task}`);
    } else {
      // If null, the processing queue is empty. We are done.
      break;
    }
  }

  console.log("✅ All stuck tasks recovered. Exiting.");
  redisConnection.quit();
}

recover();
